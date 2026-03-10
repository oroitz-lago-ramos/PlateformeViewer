import { useState } from 'react';

const controls = [
    {
        section: 'Camera',
        items: [
            { keys: ['LMB', 'Drag'], label: 'Orbit' },
            { keys: ['MMB', 'Drag'], label: 'Pan' },
            { keys: ['Scroll'], label: 'Zoom' },
        ],
    },
    {
        section: 'View',
        items: [
            { keys: ['R'], label: 'Reset view' },
        ],
    },
];

// Icons
const KeyboardIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
    </svg>
);

const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

export function ControlsHint() {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 100, fontFamily: 'system-ui, sans-serif' }}>

            {/* Panel */}
            <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 0.75rem)',
                right: 0,
                width: '240px',
                background: 'rgba(8, 10, 18, 0.82)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                padding: '1.1rem 1.2rem',
                color: '#fff',
                boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
                pointerEvents: open ? 'auto' : 'none',
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.98)',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
                transformOrigin: 'bottom right',
            }}>
                <p style={{
                    margin: '0 0 0.9rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)',
                }}>
                    Controls
                </p>

                {controls.map(({ section, items }, si) => (
                    <div key={section} style={{ marginBottom: si < controls.length - 1 ? '0.9rem' : 0 }}>
                        <p style={{
                            margin: '0 0 0.45rem',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.25)',
                        }}>
                            {section}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {items.map(({ keys, label }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>{label}</span>
                                    <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                                        {keys.map((k, i) => (
                                            <span key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                <kbd style={{
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    height: '1.5rem',
                                                    padding: '0 0.4rem',
                                                    background: 'rgba(255,255,255,0.06)',
                                                    border: '1px solid rgba(255,255,255,0.10)',
                                                    borderBottom: '2px solid rgba(255,255,255,0.14)',
                                                    borderRadius: '5px',
                                                    fontSize: '0.65rem',
                                                    fontFamily: 'inherit',
                                                    fontWeight: 600,
                                                    color: 'rgba(255,255,255,0.8)',
                                                    letterSpacing: '0.02em',
                                                    whiteSpace: 'nowrap',
                                                }}>{k}</kbd>
                                                {i < keys.length - 1 && (
                                                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>+</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Trigger button */}
            <button
                onClick={() => setOpen(o => !o)}
                title={open ? 'Close controls' : 'Show controls'}
                style={{
                    width: '2.4rem', height: '2.4rem',
                    borderRadius: '50%',
                    background: open
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(8,10,18,0.75)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: open
                        ? '0 0 0 4px rgba(255,255,255,0.06)'
                        : '0 4px 16px rgba(0,0,0,0.45)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.18s, box-shadow 0.18s, transform 0.15s',
                    transform: open ? 'scale(1.06)' : 'scale(1)',
                    color: 'rgba(255,255,255,0.8)',
                    outline: 'none',
                }}
            >
                {open ? <CloseIcon /> : <KeyboardIcon />}
            </button>
        </div>
    );
}
