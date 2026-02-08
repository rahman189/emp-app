const basicBaseUrl = process.env.NEXT_PUBLIC_BASIC ?? 'http://localhost:4001';
const detailBaseUrl = process.env.NEXT_PUBLIC_DETAIL ?? 'http://localhost:4002';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/basicInfo',
        destination: `${basicBaseUrl}/basicInfo`,
      },
      {
        source: '/departments',
        destination: `${basicBaseUrl}/departments`,
      },
      {
        source: '/details',
        destination: `${detailBaseUrl}/details`,
      },
      {
        source: '/locations',
        destination: `${detailBaseUrl}/locations`,
      },
    ];
  },
};

export default nextConfig;
