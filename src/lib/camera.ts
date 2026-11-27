// Solo en el navegador: ayudas para grabar video con la cámara.

// MP4 se reproduce en cualquier teléfono; WebM es la alternativa donde no se
// puede grabar MP4.
const FORMATS = [
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
];

/** El formato en que puede grabar este navegador, o null si no puede grabar. */
export function recordingFormat() {
  if (
    typeof MediaRecorder === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return null;
  }
  const mimeType = FORMATS.find((f) => MediaRecorder.isTypeSupported(f));
  if (!mimeType) return null;
  const type = mimeType.split(";")[0];
  return { mimeType, type, extension: type === "video/mp4" ? "mp4" : "webm" };
}

/** Segundos como "0:07". */
export function clock(seconds: number) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
