import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A aplicacao e acessada pelo proxy reverso, entao a origem nao e localhost.
  // Sem isso o Next bloqueia o canal de hot reload (/_next/hmr) por seguranca.
  allowedDevOrigins: ["192.168.57.10", "192.168.56.20"],

  // O synced_folder do VirtualBox (vboxsf) nao propaga eventos de inotify,
  // entao o Next nao percebe alteracoes feitas no host. O polling substitui
  // a notificacao do sistema por verificacao periodica.
  webpack: (config) => {
    config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
    return config;
  },
};

export default nextConfig;
