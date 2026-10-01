/* eslint-disable @next/next/no-img-element -- фото уже нарезаны в WebP двух размеров */
import { imageUrl } from "@/lib/media";

export function ProductImg({
  file,
  alt,
  sizes = "(max-width: 760px) 50vw, 300px",
  eager = false,
  className,
}: {
  file: string | null;
  alt: string;
  sizes?: string;
  eager?: boolean;
  className?: string;
}) {
  if (!file) return <div className={`photoBg ${className ?? ""}`} style={{ width: "100%", height: "100%" }} />;
  return (
    <img
      src={imageUrl(file, 1200)}
      srcSet={`${imageUrl(file, 480)} 480w, ${imageUrl(file, 1200)} 1200w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}

/** Статическое фото из public/images/factory: name-1600.webp и name-800.webp */
export function FactoryImg({ name, alt, sizes, eager }: { name: string; alt: string; sizes: string; eager?: boolean }) {
  return (
    <img
      src={`/images/factory/${name}-1600.webp`}
      srcSet={`/images/factory/${name}-800.webp 800w, /images/factory/${name}-1600.webp 1600w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
