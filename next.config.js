/** @type {import('next').NextConfig} */
import nextPWA from 'next-pwa';
const withPwa = nextPWA({
    dest:'public',
    swSrc:'/public/custom-service-worker.js',
    register:true,
    skipWating:true,
    buildExcludes:[/middleware-manifest.json$/,/app-build-manifest.json$/],
    disable:process.env.NODE_ENV === "development",
})

const nextConfig = withPwa({
    reactStrictMode:true,
})

module.exports = nextConfig;
