import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // La dirección técnica de Vercel ya no es una entrada pública:
      // todo lo que llegue por ahí se envía al dominio oficial.
      // /api queda fuera para no romper el cron de entregas de Vercel.
      {
        source: "/:path((?!api(?:/|$)).*)",
        has: [{ type: "host", value: "akashia-mu.vercel.app" }],
        destination: "https://akashia.app/:path",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
