/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'res.cloudinary.com',
    ],
    unoptimized: process.env.NODE_ENV === 'development'
  },
  output: 'standalone',
}

module.exports = nextConfig
