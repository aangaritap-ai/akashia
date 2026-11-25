import { MAX_UPLOAD_BYTES } from "@/lib/uploads";

// Reduce una foto en el navegador antes de subirla: las de celular suelen pasar
// el límite de subida, y así además ocupan menos almacenamiento.

const LIGHT_BYTES = 1024 * 1024;
const QUALITIES = [0.85, 0.75, 0.65];
const SHRINKABLE = ["image/jpeg", "image/png", "image/webp"];

/**
 * Devuelve una copia JPEG más pequeña de la foto, con su lado mayor limitado a
 * `maxSide`. Entrega el archivo original si ya es liviano o si no se puede
 * procesar (GIF, que perdería la animación, o un formato que el navegador no
 * abre). Quien llama debe seguir revisando el límite de tamaño.
 */
export async function shrinkImage(file: File, maxSide = 1920): Promise<File> {
  if (!SHRINKABLE.includes(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    // Respeta la orientación con la que se tomó la foto.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= LIGHT_BYTES) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // JPEG no tiene transparencia: sin este fondo, lo transparente sale negro.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of QUALITIES) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );
      if (!blob) return file;
      if (blob.size > MAX_UPLOAD_BYTES) continue;
      // A veces la copia no mejora al original (por ejemplo, un PNG simple).
      if (blob.size >= file.size && file.size <= MAX_UPLOAD_BYTES) return file;
      const name = file.name.replace(/\.[^.]*$/, "") || "foto";
      return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
    }
    return file;
  } finally {
    bitmap.close();
  }
}
