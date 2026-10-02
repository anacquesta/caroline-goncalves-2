import type { ImgHTMLAttributes } from "react";
export function EditorialImage({
  src,
  alt = "",
  sizes = "(max-width: 767px) 100vw, 50vw",
  loading = "lazy",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const local =
    typeof src === "string" &&
    /^\/(?:caroline-goncalves-2\/)?images\/(?:caroline-(?:principal|perfil|perfil-home)|architecture|work|street|sea|portrait2?|nature|light|event|editorial|detail|culture|city)\.(png|jpg)$/.test(
      src,
    );
  const responsiveRemote =
    typeof src === "string" && /\/editorial\/[a-f0-9-]+-1600\.webp$/.test(src);
  const remoteBase = responsiveRemote
    ? (src as string).replace("-1600.webp", "")
    : "";
  const base = local ? (src as string).replace(/\.(jpg|png)$/, "") : "";
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Pre-generated WebP variants are selected with native srcset.
    <img
      src={local ? base + "-960.webp" : src}
      srcSet={
        local
          ? [480, 960, 1600].map((w) => `${base}-${w}.webp ${w}w`).join(", ")
          : responsiveRemote
            ? [480, 960, 1600]
                .map((w) => `${remoteBase}-${w}.webp ${w}w`)
                .join(", ")
            : undefined
      }
      sizes={sizes}
      alt={alt}
      loading={loading}
      {...props}
    />
  );
}
