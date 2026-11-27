// Solo en el navegador: lee un video elegido y saca su imagen de portada.

const MAX_SIDE = 1280;
const TIMEOUT_MS = 15_000;

/** Duración en segundos y portada en JPEG. Falla si el navegador no puede
 * leer el video. */
export function readVideo(
  url: string
): Promise<{ seconds: number; poster: Blob }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const fail = () => reject(new Error("video"));
    const timer = setTimeout(fail, TIMEOUT_MS);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onerror = fail;
    // Algunas grabaciones no traen la duración: se calcula saltando al final.
    let toEnd = false;
    // Un instante después del comienzo, que suele estar en negro.
    const goToPoster = () => {
      video.currentTime = Math.min(0.1, (video.duration || 0) / 2);
    };
    video.onloadedmetadata = () => {
      if (Number.isFinite(video.duration)) return goToPoster();
      toEnd = true;
      video.currentTime = Number.MAX_SAFE_INTEGER;
    };
    video.onseeked = () => {
      if (toEnd) {
        if (!Number.isFinite(video.duration)) return fail();
        toEnd = false;
        return goToPoster();
      }
      const { videoWidth: w, videoHeight: h } = video;
      if (!w || !h) return fail();
      const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const context = canvas.getContext("2d");
      if (!context) return fail();
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (poster) => {
          clearTimeout(timer);
          if (!poster) return fail();
          resolve({ seconds: video.duration, poster });
        },
        "image/jpeg",
        0.8
      );
    };
    video.src = url;
  });
}
