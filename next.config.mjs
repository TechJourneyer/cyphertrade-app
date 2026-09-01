

const nextConfig = {
  // Images from the API domain
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
    ],
  },

  // Prevent Next's dev server from watching backend storage/uploads and other
  // server-side runtime files which are modified by the API cron/seeder tasks.
  // This avoids on-demand recompilation and page reloads when the API writes
  // many files (e.g. instrument JSONs) into the repo workspace.
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      // Ignore any changes under storage and vendor directories on the host
      // which are written by backend containers during cron runs.
      ignored: ['**/storage/**', '**/vendor/**', '**/node_modules/**'],
    }
    return config
  },
}

export default nextConfig
