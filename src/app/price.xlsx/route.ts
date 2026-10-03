import { buildPriceList } from "@/lib/price-list";

/** Прайс-лист собирается из базы при каждом скачивании — он не может разойтись с ценами на сайте. */
export async function GET() {
  const { file, name } = await buildPriceList();
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "no-store",
    },
  });
}
