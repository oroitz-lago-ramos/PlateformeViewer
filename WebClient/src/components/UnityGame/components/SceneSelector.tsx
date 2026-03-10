import { useState } from 'react';
import { GO, METHOD, SCENES } from '../../../unity.config';

// ── types ──────────────────────────────────────────────────────────────────

type SendMessage = (gameObject: string, method: string, value?: string | number) => void;

// ── icons ──────────────────────────────────────────────────────────────────

const LayersIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const CheckIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// ── component ──────────────────────────────────────────────────────────────

interface Props {
    sendMessage: SendMessage;
}

export function SceneSelector({ sendMessage }: Props) {
    const [open, setOpen] = useState(false);
    // Default matches buildingSceneName in SceneLoader.cs
    const [active, setActive] = useState<string>(SCENES[0].name);
    const [loading, setLoading] = useState(false);

    const handleSelect = (scene: SceneEntry) => {
        if (scene.name === active || loading) return;
        setLoading(true);
        setActive(scene.name);
        sendMessage(GO.SCENE_LOADER, METHOD.SWAP_BUILDING, scene.name);
        // Give a brief visual feedback before re-enabling
        setTimeout(() => setLoading(false), 1500);
        setOpen(false);
    };

    const activeLabel = SCENES.find(s => s.name === active)?.label ?? active;

    return (
        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 100, fontFamily: 'system-ui, sans-serif' }}>

            {/* Panel */}
            <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.75rem)',
                left: 0,
                width: '200px',
                background: 'rgba(8, 10, 18, 0.82)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                padding: '0.6rem',
                boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
                pointerEvents: open ? 'auto' : 'none',
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.98)',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
                transformOrigin: 'top left',
            }}>
                <p style={{
                    margin: '0 0.4rem 0.5rem',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)',
                }}>
                    Scene
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {SCENES.map(scene => {
                        const isActive = scene.name === active;
                        return (
                            <button
                                key={scene.name}
                                onClick={() => handleSelect(scene)}
                                disabled={loading}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '0.55rem 0.7rem',
                                    borderRadius: '9px',
                                    background: isActive ? 'rgba(255,255,255,0.09)' : 'transparent',
                                    border: isActive ? '1px solid rgba(255,255,255,0.10)' : '1px solid transparent',
                                    color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
                                    fontSize: '0.8rem',
                                    fontFamily: 'inherit',
                                    fontWeight: isActive ? 600 : 400,
                                    cursor: loading ? 'wait' : isActive ? 'default' : 'pointer',
                                    textAlign: 'left',
                                    transition: 'background 0.14s, color 0.14s',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive && !loading)
                                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                                }}
                                onMouseLeave={e => {
                                    if (!isActive)
                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                }}
                            >
                                <span>{scene.label}</span>
                                {isActive && <CheckIcon />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Trigger button */}
            <button
                onClick={() => setOpen(o => !o)}
                title="Switch scene"
                style={{
                    height: '2.4rem',
                    padding: '0 0.9rem',
                    borderRadius: '99px',
                    background: open ? 'rgba(255,255,255,0.12)' : 'rgba(8,10,18,0.75)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: open ? '0 0 0 4px rgba(255,255,255,0.06)' : '0 4px 16px rgba(0,0,0,0.45)',
                    cursor: loading ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.78rem',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                    transition: 'background 0.18s, box-shadow 0.18s',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                }}
            >
                <LayersIcon />
                {loading ? 'Loading…' : activeLabel}
            </button>
        </div>
    );
}
