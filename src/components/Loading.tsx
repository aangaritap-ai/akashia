import { LogoMark } from "@/components/Logo";

export default function Loading() {
  return (
    <div
      role="status"
      className="flex-1 flex flex-col items-center justify-center gap-3 py-24"
    >
      <div className="float-soft">
        <LogoMark className="w-14 h-14" />
      </div>
      <p className="text-sm text-muted">Cargando...</p>
    </div>
  );
}
