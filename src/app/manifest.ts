import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Notova',
        short_name: 'Notova',
        description: 'A modern note-taking application',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
            {
                src: '/apple-icon.png',
                sizes: '192x192', // Assuming the source image allows this or browser resizes. 
                type: 'image/png',
            },
        ],
    }
}
