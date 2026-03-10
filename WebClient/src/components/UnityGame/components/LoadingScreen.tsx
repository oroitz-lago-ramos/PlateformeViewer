interface LoadingScreenProps {
    progress: number;
}

export const LoadingScreen = ({ progress }: LoadingScreenProps) => {
    const percentage = Math.round(progress * 100);

    return (
        <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#08080f',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            gap: '2rem',
        }}>
            <img
                src="/PV_Logo.png"
                alt="PlateformeViewer"
                style={{ width: '50vw', height: '50vh', objectFit: 'contain', opacity: 0.9 }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '220px' }}>
                <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px' }}>
                    <div style={{
                        width: `${percentage}%`, height: '100%',
                        background: 'rgba(255,255,255,0.6)',
                        borderRadius: '99px',
                        transition: 'width 0.25s ease',
                    }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                    {percentage}%
                </span>
            </div>
        </div>
    );
};
