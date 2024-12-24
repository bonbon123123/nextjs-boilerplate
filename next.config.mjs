/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'utfs.io',
            },
        ],
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.(png|jpe?g|gif|svg)$/i,
            type: 'asset/resource',
        });

        return config;
    },
};

export default nextConfig;
