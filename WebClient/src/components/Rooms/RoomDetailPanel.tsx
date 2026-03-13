import type { Room, RoomEvent, RoomStatus } from '../../types/room';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
    room: Room;
    schedule: RoomEvent[];
    dayOffset: number;
    onDayChange: (offset: number) => void;
    onClose: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<RoomStatus, string> = {
    'free':      '#00988F',
    'occupied':  '#E74A34',
    'soon-free': '#FF9500',
};

const STATUS_BG: Record<RoomStatus, string> = {
    'free':      'rgba(0,152,143,0.12)',
    'occupied':  'rgba(231,74,52,0.12)',
    'soon-free': 'rgba(255,149,0,0.12)',
};

const STATUS_LABEL: Record<RoomStatus, string> = {
    'free':      'Libre',
    'occupied':  'Occupée',
    'soon-free': 'Bientôt libre',
};

const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dayOffset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    const day = DAYS_FR[d.getDay()];
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

function isNowBetween(startTime: string, endTime: string): boolean {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return nowMins >= sh * 60 + sm && nowMins < eh * 60 + em;
}

// ── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const PersonIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const FloorIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

export function RoomDetailPanel({ room, schedule, dayOffset, onDayChange, onClose }: Props) {
    const isToday = dayOffset === 0;
    const dateLabel = isToday ? 'Aujourd\'hui' : formatDate(dayOffset);
    const floorLabel = room.floor === 'RDC' ? 'RDC' : `Étage ${room.floor}`;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(520px, calc(100vw - 9rem))',
                zIndex: 120,
                fontFamily: 'system-ui, sans-serif',
                animation: 'slideUpIn 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
        >
            <style>{`
                @keyframes slideUpIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>

            <div style={{
                background: 'rgba(8, 10, 18, 0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
                color: '#fff',
                overflow: 'hidden',
            }}>

                {/* ── Top accent bar (status color) ── */}
                <div style={{
                    height: '3px',
                    background: STATUS_COLOR[room.status],
                    opacity: 0.8,
                }} />

                {/* ── Header ── */}
                <div style={{ padding: '1rem 1.2rem 0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                color: 'rgba(255,255,255,0.95)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {room.name}
                            </h2>
                            <p style={{
                                margin: '0.2rem 0 0',
                                fontSize: '0.72rem',
                                color: 'rgba(255,255,255,0.4)',
                                letterSpacing: '0.02em',
                            }}>
                                {room.building.replace(/-/g, ' ')}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            style={{
                                flexShrink: 0,
                                width: '1.9rem', height: '1.9rem',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'rgba(255,255,255,0.5)',
                                transition: 'background 0.15s, color 0.15s',
                                outline: 'none',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
                                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
                            }}
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Info pills row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        {/* Status badge */}
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.22rem 0.65rem',
                            borderRadius: '99px',
                            background: STATUS_BG[room.status],
                            border: `1px solid ${STATUS_COLOR[room.status]}40`,
                            color: STATUS_COLOR[room.status],
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                        }}>
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: STATUS_COLOR[room.status],
                                flexShrink: 0,
                                boxShadow: `0 0 5px ${STATUS_COLOR[room.status]}`,
                            }} />
                            {STATUS_LABEL[room.status].toUpperCase()}
                        </span>

                        {/* Divider */}
                        <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>|</span>

                        {/* Capacity */}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>
                            <PersonIcon />
                            {room.capacity} places
                        </span>

                        {/* Floor */}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>
                            <FloorIcon />
                            {floorLabel}
                        </span>

                        {/* Type */}
                        <span style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.4)',
                        }}>
                            {room.type}
                        </span>
                    </div>

                    {/* Current event hint (today only) */}
                    {isToday && room.currentEvent && (
                        <div style={{
                            marginTop: '0.65rem',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(231,74,52,0.08)',
                            border: '1px solid rgba(231,74,52,0.18)',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                        }}>
                            <span style={{ color: '#E74A34', fontWeight: 600 }}>En cours · </span>
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                                {room.currentEvent.title}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.35)' }}>
                                {' '}— jusqu'à {room.currentEvent.endTime}
                            </span>
                        </div>
                    )}
                    {isToday && !room.currentEvent && room.nextEvent && (
                        <div style={{
                            marginTop: '0.65rem',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(0,152,143,0.06)',
                            border: '1px solid rgba(0,152,143,0.15)',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                        }}>
                            <span style={{ color: '#00988F', fontWeight: 600 }}>Prochain · </span>
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                                {room.nextEvent.title}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.35)' }}>
                                {' '}à {room.nextEvent.startTime}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Divider ── */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                {/* ── Day navigation ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.65rem 1.2rem',
                    gap: '0.5rem',
                }}>
                    <button
                        onClick={() => onDayChange(dayOffset - 1)}
                        style={navBtnStyle}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)')}
                    >
                        <ChevronLeftIcon />
                    </button>

                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            <CalendarIcon />
                            <span style={{
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                color: isToday ? '#6aaeff' : 'rgba(255,255,255,0.8)',
                            }}>
                                {dateLabel}
                            </span>
                        </div>
                        {!isToday && (
                            <button
                                onClick={() => onDayChange(0)}
                                style={{
                                    marginTop: '0.15rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(0,98,255,0.7)',
                                    fontSize: '0.62rem',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    padding: 0,
                                    textDecoration: 'underline',
                                }}
                            >
                                Retour à aujourd'hui
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => onDayChange(dayOffset + 1)}
                        style={navBtnStyle}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)')}
                    >
                        <ChevronRightIcon />
                    </button>
                </div>

                {/* ── Divider ── */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                {/* ── Schedule ── */}
                <div style={{
                    padding: '0.75rem 1.2rem 1rem',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                }}>
                    {schedule.length === 0 ? (
                        <EmptySchedule />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {schedule.map(event => (
                                <EventItem
                                    key={event.id}
                                    event={event}
                                    isCurrent={isToday && isNowBetween(event.startTime, event.endTime)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Nav button style ──────────────────────────────────────────────────────────

const navBtnStyle: React.CSSProperties = {
    width: '2rem', height: '2rem',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(255,255,255,0.6)',
    transition: 'background 0.15s',
    outline: 'none',
    flexShrink: 0,
};

// ── Event item ────────────────────────────────────────────────────────────────

function EventItem({ event, isCurrent }: { event: RoomEvent; isCurrent: boolean }) {
    return (
        <div style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '0.55rem 0.75rem',
            borderRadius: '9px',
            background: isCurrent
                ? 'rgba(231,74,52,0.07)'
                : 'rgba(255,255,255,0.03)',
            border: isCurrent
                ? '1px solid rgba(231,74,52,0.2)'
                : '1px solid rgba(255,255,255,0.05)',
            alignItems: 'center',
        }}>
            {/* Time column */}
            <div style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.1rem',
                minWidth: '3.5rem',
            }}>
                <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: isCurrent ? '#E74A34' : 'rgba(255,255,255,0.75)',
                }}>
                    {event.startTime}
                </span>
                <span style={{
                    fontSize: '0.62rem',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'rgba(255,255,255,0.3)',
                }}>
                    {event.endTime}
                </span>
            </div>

            {/* Vertical bar */}
            <div style={{
                width: '2px',
                alignSelf: 'stretch',
                borderRadius: '99px',
                background: isCurrent ? '#E74A34' : 'rgba(0,98,255,0.5)',
                flexShrink: 0,
            }} />

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.88)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {event.title}
                </div>
                {event.organizer && (
                    <div style={{
                        fontSize: '0.65rem',
                        color: 'rgba(255,255,255,0.35)',
                        marginTop: '0.1rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {event.organizer}
                    </div>
                )}
            </div>

            {/* Duration pill */}
            <span style={{
                flexShrink: 0,
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.05)',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.3)',
                fontVariantNumeric: 'tabular-nums',
            }}>
                {durationLabel(event.startTime, event.endTime)}
            </span>
        </div>
    );
}

function durationLabel(start: string, end: string): string {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 60) return `${mins}min`;
    if (mins % 60 === 0) return `${mins / 60}h`;
    return `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`;
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptySchedule() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem 1rem',
            gap: '0.5rem',
        }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.25)',
                textAlign: 'center',
            }}>
                Aucun événement programmé ce jour
            </p>
        </div>
    );
}
