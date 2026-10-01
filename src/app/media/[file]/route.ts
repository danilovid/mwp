import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadDir } from "@/lib/images";

/** Отдаёт загруженные фото товаров из UPLOAD_DIR. Имена файлов уникальны, поэтому кэш вечный. */
export async function GET(_req: Request, ctx: RouteContext<"/media/[file]">) {
  const { file } = await ctx.params;
  if (!/^[a-z0-9-]+-(1200|480)\.webp$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(uploadDir(), file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
