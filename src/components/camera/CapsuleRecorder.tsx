"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import VideoRecorder from "@/components/camera/VideoRecorder";
import { IconVideo } from "@/components/icons";
import { cameraButtonClass } from "@/components/ui";
import {
  CAPSULE_RECORD_BITS,
  CAPSULE_RECORD_SECONDS,
  MAX_MEDIA_BYTES,
} from "@/lib/media";

/** "Grabar video" en las cápsulas, con vista previa de lo grabado. */
export default function CapsuleRecorder({
  file,
  onRecorded,
}: {
  /** El archivo que se va a guardar. */
  file: File | null;
  onRecorded: (file: File) => void;
}) {
  const t = useTranslations("camera");
  const capsules = useTranslations("capsules");
  const [open, setOpen] = useState(false);
  const [recorded, setRecorded] = useState<{ file: File; url: string } | null>(
    null
  );
  const [tooBig, setTooBig] = useState(false);

  useEffect(() => {
    const url = recorded?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [recorded?.url]);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${cameraButtonClass} self-start`}
      >
        <IconVideo className="w-5 h-5" />
        {t("recordVideo")}
      </button>
      {recorded && recorded.file === file && (
        <>
          <video
            src={recorded.url}
            controls
            playsInline
            preload="metadata"
            className="max-h-80 w-full rounded-xl border border-border bg-black"
          />
          <p role="status" className="text-xs text-muted">
            {t("recorded", { size: (file.size / (1024 * 1024)).toFixed(1) })}
          </p>
        </>
      )}
      {tooBig && (
        <p role="alert" className="text-sm text-red-600">
          {capsules("tooBig")}
        </p>
      )}
      {open && (
        <VideoRecorder
          maxSeconds={CAPSULE_RECORD_SECONDS}
          videoBitsPerSecond={CAPSULE_RECORD_BITS}
          onClose={() => setOpen(false)}
          onDone={({ file: video }) => {
            setOpen(false);
            const big = video.size > MAX_MEDIA_BYTES;
            setTooBig(big);
            if (big) return;
            setRecorded({ file: video, url: URL.createObjectURL(video) });
            onRecorded(video);
          }}
        />
      )}
    </div>
  );
}
