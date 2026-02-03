import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
    width: 180,
    height: 180,
}
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '18%', // Standard iOS curvature approximation for preview
                }}
            >
                <svg viewBox="0 0 240 282.3" width="144" height="170">
                    <defs>
                        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#E8783A" />
                            <stop offset="100%" stopColor="#E89A4A" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#g1)" d="M190.8,20.9l-23.8.2c-14.5,0-28.4,5.6-39,15.5l-93.5,98.1c-11.4,10.7-18,25.6-18.3,41.2l-.9,58.6c0,26.3,22.1,47.8,49.2,47.8h126.3c27.1,0,49.2-21.4,49.2-47.8V68.6c0-26.3-22.1-47.8-49.2-47.8ZM135.1,60.2c-14.5,13.6-17.4,33.4-17.4,51.1v16.2c0,4-3.5,7.2-7.8,7.2h-5.8c-19.2,0-40.6,2.3-55.4,15.6l86.4-90ZM220.3,234.5c0,15.5-13.2,28.1-29.5,28.1h-126.3c-16.3,0-29.5-12.6-29.5-28.1v-40.5s0,0,0,0v13.9c0-40.5,36.6-55.3,61.4-55.3h29.5c8.3,0,15-6.2,15-13.8v-30.7c0-41,25-67.3,49.3-67.3h4.5c14.4,1.8,25.6,13.6,25.6,27.8v165.9Z" />
                    <path fill="url(#g1)" d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    )
}
