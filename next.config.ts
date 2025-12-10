import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // --- TAMBAHKAN BLOK 'images' INI ---
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000', // Pastikan ini port backend Anda
        pathname: '/uploads/**', // Izinkan semua file di folder uploads
      },
    ],
  },
  // --- AKHIR BLOK ---
  
  /* Opsi config Anda yang lain mungkin ada di sini */
};

export default nextConfig;