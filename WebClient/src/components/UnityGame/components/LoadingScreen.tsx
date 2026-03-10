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
            background: '#1a1a2e', color: 'white',
        }}>
            <p style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Loading... {percentage}%</p>
            <div style={{ width: '300px', height: '8px', background: '#333', borderRadius: '4px' }}>
                <div style={{
                    width: `${percentage}%`, height: '100%',
                    background: '#4f8ef7', borderRadius: '4px',
                    transition: 'width 0.2s',
                }} />
            </div>
        </div>
    );
};
