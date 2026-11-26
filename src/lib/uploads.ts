// Reglas comunes de las subidas. Sin dependencias de servidor: los formularios
// también las usan para avisar antes de subir.

// Vercel rechaza (413) las peticiones a una función que pasen de ~4,5 MB, así
// que el límite deja margen para el resto de la petición.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const TOO_BIG_MESSAGE = "El archivo no puede pesar más de 4 MB.";

/** ¿La dirección es de un archivo de nuestro almacenamiento? */
export function isStorageUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

// Solo en el servidor. Hay almacenamiento con la llave fija (en local) o con el
// id del store más los permisos temporales de Vercel (en producción); la
// librería @vercel/blob elige sola cuál usar.
export function storageConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
  );
}
