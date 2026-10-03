import { deflateRawSync } from "node:zlib";

/**
 * Минимальный генератор .xlsx: ZIP + несколько XML.
 * Отдельная библиотека ради одного прайса в проект не тащится — нужного тут
 * немного: строки, числа, формулы, жирный шрифт и денежный формат.
 */

export type Cell =
  | { v: string; style?: number }
  | { n: number; style?: number }
  | { f: string; style?: number }
  | null;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const colName = (i: number) => {
  let s = "";
  for (let n = i + 1; n > 0; ) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

/* ---------- ZIP ---------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();

const crc32 = (buf: Buffer) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function zip(files: { name: string; data: Buffer }[]): Buffer {
  const locals: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const f of files) {
    const name = Buffer.from(f.name, "utf8");
    const comp = deflateRawSync(f.data);
    const crc = crc32(f.data);

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4); // версия
    lh.writeUInt16LE(0x0800, 6); // имена в utf-8
    lh.writeUInt16LE(8, 8); // deflate
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18);
    lh.writeUInt32LE(f.data.length, 22);
    lh.writeUInt16LE(name.length, 26);
    locals.push(lh, name, comp);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt16LE(8, 10);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(comp.length, 20);
    ch.writeUInt32LE(f.data.length, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE(offset, 42);
    central.push(ch, name);

    offset += 30 + name.length + comp.length;
  }

  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

/* ---------- лист ---------- */

/** Стили: 0 — обычный, 1 — жирный, 2 — деньги, 3 — жирные деньги, 4 — шапка таблицы, 5 — заголовок раздела */
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0\\ &quot;₽&quot;"/></numFmts>
<fonts count="4">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="14"/><name val="Calibri"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF1A7AB7"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFEDF4FA"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2"><border/><border><bottom style="thin"><color rgb="FFBBCCDD"/></bottom></border></borders>
<cellStyleXfs count="1"><xf/></cellStyleXfs>
<cellXfs count="7">
<xf xfId="0"/>
<xf xfId="0" fontId="1" applyFont="1"/>
<xf xfId="0" numFmtId="164" applyNumberFormat="1"/>
<xf xfId="0" numFmtId="164" fontId="1" applyNumberFormat="1" applyFont="1"/>
<xf xfId="0" fontId="2" fillId="2" applyFont="1" applyFill="1" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf>
<xf xfId="0" fontId="1" fillId="3" applyFont="1" applyFill="1"/>
<xf xfId="0" fontId="3" applyFont="1"/>
</cellXfs>
</styleSheet>`;

export function buildXlsx(opts: {
  sheetName: string;
  rows: Cell[][];
  cols: { width: number }[];
  freezeRow?: number;
}): Buffer {
  const rowsXml = opts.rows
    .map((cells, r) => {
      const inner = cells
        .map((c, i) => {
          if (!c) return "";
          const ref = `${colName(i)}${r + 1}`;
          const st = c.style ? ` s="${c.style}"` : "";
          if ("f" in c) return `<c r="${ref}"${st}><f>${esc(c.f)}</f></c>`;
          if ("n" in c) return `<c r="${ref}"${st}><v>${c.n}</v></c>`;
          return `<c r="${ref}"${st} t="inlineStr"><is><t xml:space="preserve">${esc(c.v)}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${inner}</row>`;
    })
    .join("");

  const colsXml = opts.cols.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width}" customWidth="1"/>`).join("");
  const pane = opts.freezeRow
    ? `<sheetView workbookViewId="0"><pane ySplit="${opts.freezeRow}" topLeftCell="A${opts.freezeRow + 1}" activePane="bottomLeft" state="frozen"/></sheetView>`
    : `<sheetView workbookViewId="0"/>`;

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews>${pane}</sheetViews><cols>${colsXml}</cols><sheetData>${rowsXml}</sheetData></worksheet>`;

  return zip([
    {
      name: "[Content_Types].xml",
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`),
    },
    {
      name: "_rels/.rels",
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`),
    },
    {
      name: "xl/workbook.xml",
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${esc(opts.sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`),
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`),
    },
    { name: "xl/styles.xml", data: Buffer.from(STYLES) },
    { name: "xl/worksheets/sheet1.xml", data: Buffer.from(sheet) },
  ]);
}
