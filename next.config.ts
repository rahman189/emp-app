import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/basicInfo',
        destination: `${process.env.NEXT_PUBLIC_BASIC}/basicInfo`,
      },
      {
        source: '/departments',
        destination: `${process.env.NEXT_PUBLIC_BASIC}/departments`,
      },
      {
        source: '/details',
        destination: `${process.env.NEXT_PUBLIC_DETAIL}/details`,
      },
      {
        source: '/locations',
        destination: `${process.env.NEXT_PUBLIC_DETAIL}/locations`,
      },
    ];
  },
};

export default nextConfig;
