/** Qué pasos mostrar cuando el navegador no ofrece instalar con un botón. */
export type InstallPlatform =
  | "ios"
  | "android"
  | "macSafari"
  | "desktop"
  | "firefox"
  | "inApp";

// Navegadores dentro de otras aplicaciones: desde ahí no se puede instalar.
const IN_APP =
  /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|BytedanceWebview|musical_ly|; wv\)/;

export function installPlatform(
  userAgent: string,
  touchPoints = 0
): InstallPlatform {
  if (IN_APP.test(userAgent)) return "inApp";
  // El iPad se presenta como un Mac; se distingue porque es táctil.
  const mac = /Macintosh/.test(userAgent);
  if (/iPhone|iPad|iPod/.test(userAgent) || (mac && touchPoints > 1)) {
    // En iPhone, la vista web de otra aplicación no se identifica como Safari.
    return /Safari\//.test(userAgent) ? "ios" : "inApp";
  }
  if (/Android/.test(userAgent)) return "android";
  if (/Firefox\//.test(userAgent)) return "firefox";
  if (mac && !/Chrome\/|Chromium\/|Edg\//.test(userAgent)) return "macSafari";
  return "desktop";
}
