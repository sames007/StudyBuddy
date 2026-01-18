import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // The `experimental.serverComponentsExternalPackages` option is used to tell Next.js to
  // not bundle these packages into the server-side code. This is necessary because
  // these packages have native dependencies that need to be resolved at runtime.
  // See: https://nextjs.org/docs/app/api-reference/next-config-js/serverComponentsExternalPackages
  experimental: {
    serverComponentsExternalPackages: [
      '@genkit-ai/google-genai',
      'genkit',
    ],
  },
  // The `images` option is used to configure which remote domains Next.js can
  // optimize images from. This is a security feature to prevent malicious
  // users from using your Next.js application to optimize images from
  // arbitrary domains.
  // See: https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
