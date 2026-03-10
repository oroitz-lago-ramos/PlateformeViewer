import { useState } from 'react';

// ── types ──────────────────────────────────────────────────────────────────

type SendMessage = (gameObject: string, method: string, value?: string | number) => void;

interface Setting {
    label: string;
    method: string;
    min: number;
    max: number;
    step: number;
    default: number;
    format: (v: number) => string;
}

// ── config ─────────────────────────────────────────────────────────────────

const CAMERA_OBJECT = 'Main Camera';

const SETTINGS: Setting[] = [
    { label: 'Orbit speed',  method: 'SetOrbitSpeed',  min: 1,    max: 15,  step: 0.5,  default: 5,    format: v => v.toFixed(1) },
    { label: 'Pan speed',    method: 'SetPanSpeed',    min: 0.05, max: 1.5, step: 0.05, default: 0.3,  format: v => v.toFixed(2) },
    { label: 'Zoom speed',   method: 'SetZoomSpeed',   min: 1,    max: 15,  step: 0.5,  default: 5,    format: v => v.toFixed(1) },
    { label: 'Smoothing',    method: 'SetSmoothTime',  min: 0.01, max: 0.3, step: 0.01, default: 0.08, format: v => v.toFixed(2) },
];

// ── icons ──────────────────────────────────────────────────────────────────

const SettingsIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const ResetIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

// ── component ──────────────────────────────────────────────────────────────

interface Props {
    sendMessage: SendMessage;
}

export function SettingsPanel({ sendMessage }: Props) {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<Record<string, number>>(
        Object.fromEntries(SETTINGS.map(s => [s.method, s.default]))
    );

    const handleChange = (setting: Setting, raw: number) => {
        setValues(v => ({ ...v, [setting.method]: raw }));
        sendMessage(CAMERA_OBJECT, setting.method, raw);
    };

    const handleReset = () => {
        const defaults = Object.fromEntries(SETTINGS.map(s => [s.method, s.default]));
        setValues(defaults);
        SETTINGS.forEach(s => sendMessage(CAMERA_OBJECT, s.method, s.default));
    };

    return (
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 100, fontFamily: 'system-ui, sans-serif' }}>

            {/* Panel */}
            <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 0.75rem)',
                left: 0,
                width: '260px',
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
                transformOrigin: 'bottom left',
            }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <p style={{
                        margin: 0,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.35)',
                    }}>
                        Sensitivity
                    </p>
                    <button
                        onClick={handleReset}
                        title="Reset to defaults"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.2rem 0.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '5px',
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.6rem',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            letterSpacing: '0.05em',
                            transition: 'color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                        }}
                    >
                        <ResetIcon /> Reset
                    </button>
                </div>

                {/* Sliders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    {SETTINGS.map(setting => {
                        const value = values[setting.method];
                        const pct = ((value - setting.min) / (setting.max - setting.min)) * 100;
                        return (
                            <div key={setting.method}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>{setting.label}</span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontVariantNumeric: 'tabular-nums',
                                        color: 'rgba(255,255,255,0.45)',
                                        minWidth: '2.5rem',
                                        textAlign: 'right',
                                    }}>
                                        {setting.format(value)}
                                    </span>
                                </div>
                                <div style={{ position: 'relative', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px' }}>
                                    {/* fill */}
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0,
                                        width: `${pct}%`,
                                        background: 'rgba(255,255,255,0.55)',
                                        borderRadius: '99px',
                                        transition: 'width 0.05s',
                                    }} />
                                    <input
                                        type="range"
                                        min={setting.min}
                                        max={setting.max}
                                        step={setting.step}
                                        value={value}
                                        onChange={e => handleChange(setting, parseFloat(e.target.value))}
                                        style={{
                                            position: 'absolute', inset: '-8px 0',
                                            width: '100%',
                                            opacity: 0,
                                            cursor: 'pointer',
                                            margin: 0,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Trigger button */}
            <button
                onClick={() => setOpen(o => !o)}
                title={open ? 'Close settings' : 'Camera settings'}
                style={{
                    width: '2.4rem', height: '2.4rem',
                    borderRadius: '50%',
                    background: open ? 'rgba(255,255,255,0.12)' : 'rgba(8,10,18,0.75)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: open ? '0 0 0 4px rgba(255,255,255,0.06)' : '0 4px 16px rgba(0,0,0,0.45)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.18s, box-shadow 0.18s, transform 0.15s',
                    transform: open ? 'scale(1.06) rotate(45deg)' : 'scale(1) rotate(0deg)',
                    color: 'rgba(255,255,255,0.8)',
                    outline: 'none',
                }}
            >
                {open ? <CloseIcon /> : <SettingsIcon />}
            </button>
        </div>
    );
}
