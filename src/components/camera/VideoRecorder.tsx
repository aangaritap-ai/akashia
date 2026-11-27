"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { clock, recordingFormat } from "@/lib/camera";
import { frameToJpeg } from "@/lib/video-poster";

export type Recording = { file: File; poster: Blob };

type Problem = "unsupported" | "denied" | "failed";

const AUDIO_BITS = 128_000;

function release(stream: MediaStream) {
  for (const track of stream.getTracks()) track.stop();
}

/**
 * Cámara a pantalla completa para grabar un video sin salir de Akashia. Se graba
 * aquí, y no con la cámara del teléfono, para controlar la duración y el peso
 * (un video normal de celular pasa de los límites). Solo se abre en el
 * navegador, tras un toque.
 */
export default function VideoRecorder({
  maxSeconds,
  videoBitsPerSecond,
  onDone,
  onClose,
}: {
  maxSeconds: number;
  videoBitsPerSecond: number;
  onDone: (recording: Recording) => void;
  onClose: () => void;
}) {
  const t = useTranslations("camera");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // La grabación en curso; si deja de serlo antes de terminar, se descarta.
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(() =>
    recordingFormat() ? null : "unsupported"
  );

  // Abre la cámara (otra vez al cambiar entre frontal y trasera).
  useEffect(() => {
    if (!recordingFormat()) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      })
      .then((opened) => {
        if (cancelled) return release(opened);
        stream = opened;
        streamRef.current = opened;
        const video = videoRef.current;
        if (video) {
          video.srcObject = opened;
          video.play().catch(() => {});
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setProblem(
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "denied"
            : "failed"
        );
      });
    return () => {
      cancelled = true;
      streamRef.current = null;
      if (stream) release(stream);
    };
  }, [facing]);

  function stop() {
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") recorder.stop();
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  });

  useEffect(() => {
    const key = (e: KeyboardEvent) => onKey(e);
    // Si se cambia de aplicación, se guarda lo grabado hasta ahí.
    const hidden = () => {
      if (document.hidden) stop();
    };
    window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", hidden);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", hidden);
      document.body.style.overflow = overflow;
      window.clearInterval(timerRef.current);
      const recorder = recorderRef.current;
      recorderRef.current = null;
      if (recorder?.state === "recording") recorder.stop();
    };
  }, []);

  async function start() {
    const stream = streamRef.current;
    const video = videoRef.current;
    const format = recordingFormat();
    if (!stream || !video || !format) return;
    // La portada es lo que se ve al empezar.
    const poster = frameToJpeg(video);
    const chunks: Blob[] = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, {
        mimeType: format.mimeType,
        videoBitsPerSecond,
        audioBitsPerSecond: AUDIO_BITS,
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        if (recorderRef.current !== recorder) return;
        recorderRef.current = null;
        window.clearInterval(timerRef.current);
        const image = await poster;
        if (!image || chunks.length === 0) return setProblem("failed");
        const file = new File(chunks, `video.${format.extension}`, {
          type: format.type,
        });
        onDone({ file, poster: image });
      };
      recorder.start();
    } catch {
      setProblem("failed");
      return;
    }
    recorderRef.current = recorder;
    setRecording(true);
    const startedAt = performance.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000;
      setSeconds(Math.min(elapsed, maxSeconds));
      if (elapsed >= maxSeconds) stop();
    }, 100);
  }

  const roundButton =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:invisible";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      className="fixed inset-0 z-[60] flex flex-col bg-black text-white"
    >
      <div className="flex items-center justify-between gap-3 p-3">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className={roundButton}
        >
          ✕
        </button>
        <span
          role="timer"
          className="flex items-center gap-2 text-sm font-semibold tabular-nums"
        >
          {recording && (
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          )}
          {clock(seconds)} / {clock(maxSeconds)}
        </span>
        <button
          type="button"
          onClick={() => {
            setReady(false);
            setProblem(null);
            setFacing((f) => (f === "user" ? "environment" : "user"));
          }}
          disabled={recording || !ready}
          aria-label={t("flip")}
          className={`${roundButton} text-xl`}
        >
          ⟲
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          onPlaying={() => setReady(true)}
          // La cámara frontal se ve como un espejo; el video queda normal.
          className={`absolute inset-0 h-full w-full object-contain ${
            facing === "user" ? "-scale-x-100" : ""
          }`}
        />
        {(problem || !ready) && (
          <p
            role={problem ? "alert" : "status"}
            className="absolute inset-0 flex items-center justify-center bg-black/70 px-8 text-center text-sm"
          >
            {t(problem ?? "opening")}
          </p>
        )}
      </div>

      <div
        className="flex flex-col items-center gap-3 p-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={!ready || Boolean(problem)}
          aria-label={recording ? t("stop") : t("start")}
          className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-white disabled:opacity-40"
        >
          <span
            className={`bg-red-500 transition-all ${
              recording ? "h-7 w-7 rounded-md" : "h-14 w-14 rounded-full"
            }`}
          />
        </button>
        <p className="text-center text-xs text-white/70">
          {recording ? t("stopHint") : t("startHint", { limit: clock(maxSeconds) })}
        </p>
      </div>
    </div>,
    document.body
  );
}
