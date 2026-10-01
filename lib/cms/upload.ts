export async function uploadImage(file: File): Promise<string> {
  if (
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
      file.type,
    ) ||
    file.size > 12_000_000
  )
    throw new Error("Use uma imagem JPEG, PNG, WebP ou AVIF de até 12 MB.");
  const bitmap = await createImageBitmap(file);
  const form = new FormData();
  try {
    for (const width of [480, 960, 1600]) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.round((bitmap.height * width) / bitmap.width);
      canvas
        .getContext("2d")!
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) =>
            b ? resolve(b) : reject(new Error("Falha ao otimizar imagem")),
          "image/webp",
          0.9,
        ),
      );
      form.append(
        "image-" + width,
        new File([blob], "image-" + width + ".webp", { type: "image/webp" }),
      );
    }
  } finally {
    bitmap.close();
  }
  const response = await fetch("/api/upload", { method: "POST", body: form });
  const result = (await response.json()) as { url: string; error: string };
  if (!response.ok) throw new Error(result.error);
  return result.url;
}
