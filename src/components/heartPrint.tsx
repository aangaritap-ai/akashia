import type { ReactElement } from "react";

// Logo de Akashia: una huella dactilar con forma de corazón.
// Una sola fuente de verdad para el encabezado, la landing, el favicon,
// el ícono de iPhone y la imagen para redes. Es una función normal (no un
// componente con hooks) para poder usarla también dentro de ImageResponse.

const HEART =
  "M50 90C18 66 6 46 6 32C6 18 17 10 28 10C38 10 46 16 50 24C54 16 62 10 72 10C83 10 94 18 94 32C94 46 82 66 50 90Z";

export type HeartPrintVariant = "detail" | "simple";

const f = (n: number) => Math.round(n * 10) / 10;
const range = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let v = from; v <= to + 0.1; v += step) out.push(v);
  return out;
};

type Config = {
  sw: number;
  domes: number[];
  core: number[];
  baseStart: number;
  baseStep: number;
  baseCount: number;
  smallArcs: number[];
  smallHalfWidth: number;
  // cortes sutiles en algunas crestas (índice -> dasharray)
  dashes: Record<number, string>;
};

const CONFIG: Record<HeartPrintVariant, Config> = {
  // Para tamaños grandes: muchas crestas finas, como una huella real.
  detail: {
    sw: 2,
    domes: range(11, 52, 3.4),
    core: [2.5, 5.5, 8.5],
    baseStart: 87,
    baseStep: 3.4,
    baseCount: 4,
    smallArcs: [79, 82.4],
    smallHalfWidth: 8.5 + 3.4 * 0.9,
    dashes: {
      2: "40 6.8 28.7 5 200",
      6: "46.3 6.2 36 5 200",
      10: "49.9 6.3 42.7 5 200",
    },
  },
  // Para tamaños pequeños (encabezado, favicon): menos crestas, más gruesas.
  simple: {
    sw: 4.2,
    domes: [15, 24, 33, 42, 51],
    core: [5],
    baseStart: 88,
    baseStep: 9,
    baseCount: 2,
    smallArcs: [],
    smallHalfWidth: 0,
    dashes: {},
  },
};

function domePath(w: number) {
  const cx = 50;
  const yc = 60;
  const ry = w * 1.1;
  const flare = w * 0.07;
  return (
    `M${f(cx - w - flare)} 82C${f(cx - w)} 70 ${f(cx - w)} 68 ${f(cx - w)} ${yc}` +
    `A${f(w)} ${f(ry)} 0 0 1 ${f(cx + w)} ${yc}` +
    `C${f(cx + w)} 68 ${f(cx + w)} 70 ${f(cx + w + flare)} 82`
  );
}

export function heartPrintSvg({
  clipId,
  ridge,
  core,
  variant = "simple",
  size,
  className,
}: {
  clipId: string;
  ridge: string;
  core: string;
  variant?: HeartPrintVariant;
  size?: number;
  className?: string;
}): ReactElement {
  const c = CONFIG[variant];
  const paths: ReactElement[] = [];

  c.domes.forEach((w, i) => {
    paths.push(
      <path
        key={`d${i}`}
        d={domePath(w)}
        stroke={ridge}
        strokeDasharray={c.dashes[i]}
      />
    );
  });

  // Núcleo: lazos abiertos hacia abajo, el más interno en dorado.
  c.core.forEach((w, i) => {
    const cx = 48;
    const yr = 70 + i * 2;
    paths.push(
      <path
        key={`c${i}`}
        d={`M${f(cx - w)} 78L${f(cx - w)} 56A${f(w)} ${f(w * 1.6)} 0 0 1 ${f(cx + w)} 56L${f(cx + w)} ${yr}`}
        stroke={i === 0 ? core : ridge}
      />
    );
  });

  // Base: crestas horizontales.
  for (let k = 0; k < c.baseCount; k++) {
    const y = c.baseStart + k * c.baseStep;
    paths.push(
      <path
        key={`b${k}`}
        d={`M0 ${f(y)}Q50 ${f(y + 5)} 100 ${f(y)}`}
        stroke={ridge}
      />
    );
  }
  c.smallArcs.forEach((y, k) => {
    paths.push(
      <path
        key={`s${k}`}
        d={`M${f(50 - c.smallHalfWidth)} ${y}Q50 ${y + 4} ${f(50 + c.smallHalfWidth)} ${y}`}
        stroke={ridge}
      />
    );
  });

  return (
    <svg
      viewBox="0 2 100 100"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={HEART} transform="translate(0 2)" />
        </clipPath>
      </defs>
      <g
        strokeWidth={c.sw}
        strokeLinecap="round"
        clipPath={`url(#${clipId})`}
      >
        {paths}
      </g>
    </svg>
  );
}
