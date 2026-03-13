import { useState, useMemo } from 'react';
import type { Room, RoomStatus } from '../../types/room';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
    rooms: Room[];
    selectedRoomId: string | null;
    onSelectRoom: (id: string) => void;
}

type FloorFilter = 'all' | 'RDC' | '1';

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<RoomStatus, string> = {
    'free':      '#00988F',
    'occupied':  '#E74A34',
    'soon-free': '#FF9500',
};

const STATUS_LABEL: Record<RoomStatus, string> = {
    'free':      'Libre',
    'occupied':  'Occupée',
    'soon-free': 'Bientôt libre',
};

const FLOOR_LABEL: Record<string, string> = {
    'RDC': 'RDC',
    '1':   'Étage 1',
};

// ── Icons ────────────────────────────────────────────────────────────────────

const BuildingIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
);

const CloseIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const PersonIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: RoomStatus }) {
    const color = STATUS_COLOR[status];
    return (
        <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
            boxShadow: `0 0 6px ${color}80`,
        }} />
    );
}

function TypeBadge({ type }: { type: string }) {
    return (
        <span style={{
            display: 'inline-block',
            padding: '0.1rem 0.4rem',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'rgba(255,255,255,0.45)',
            whiteSpace: 'nowrap',
        }}>
            {type}
        </span>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RoomSidebar({ rooms, selectedRoomId, onSelectRoom }: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [floorFilter, setFloorFilter] = useState<FloorFilter>('all');

    const filtered = useMemo(() => {
        return rooms.filter(r => {
            const matchFloor = floorFilter === 'all' || r.floor === floorFilter;
            const q = search.toLowerCase();
            const matchSearch = !q || r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
            return matchFloor && matchSearch;
        });
    }, [rooms, search, floorFilter]);

    // Group by floor
    const byFloor = useMemo(() => {
        const floors = ['RDC', '1'];
        return floors
            .map(floor => ({ floor, rooms: filtered.filter(r => r.floor === floor) }))
            .filter(g => g.rooms.length > 0);
    }, [filtered]);

    // Stats
    const stats = useMemo(() => ({
        free:     rooms.filter(r => r.status === 'free').length,
        occupied: rooms.filter(r => r.status === 'occupied').length,
        soonFree: rooms.filter(r => r.status === 'soon-free').length,
    }), [rooms]);

    return (
        <>
            {/* ── Floating trigger (hidden when panel is open) ── */}
            <button
                onClick={() => setOpen(true)}
                title="Voir les salles"
                style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    zIndex: 100,
                    height: '2.4rem',
                    padding: '0 0.9rem',
                    borderRadius: '99px',
                    background: 'rgba(8,10,18,0.75)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.78rem',
                    fontFamily: 'system-ui, sans-serif',
                    fontWeight: 500,
                    transition: 'opacity 0.18s, transform 0.18s',
                    opacity: open ? 0 : 1,
                    pointerEvents: open ? 'none' : 'auto',
                    transform: open ? 'scale(0.94)' : 'scale(1)',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                }}
            >
                <BuildingIcon />
                Salles
            </button>

            {/* ── Backdrop ── */}
            <div
                onClick={() => setOpen(false)}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 149,
                    background: 'rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? 'auto' : 'none',
                    transition: 'opacity 0.25s ease',
                }}
            />

            {/* ── Panel ── */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '340px',
                    height: '100%',
                    zIndex: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(8, 10, 18, 0.92)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderLeft: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '-24px 0 60px rgba(0,0,0,0.5)',
                    fontFamily: 'system-ui, sans-serif',
                    color: '#fff',
                    transform: open ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
                    pointerEvents: open ? 'auto' : 'none',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.2rem 1.2rem 0',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BuildingIcon />
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.01em' }}>
                                Salles
                            </span>
                            <span style={{
                                padding: '0.1rem 0.45rem',
                                borderRadius: '99px',
                                background: 'rgba(255,255,255,0.08)',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.45)',
                            }}>
                                {rooms.length}
                            </span>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            style={{
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

                    {/* Status summary */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '0.85rem',
                        padding: '0.6rem 0.75rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        {[
                            { count: stats.free,     color: STATUS_COLOR.free,       label: 'libres' },
                            { count: stats.occupied, color: STATUS_COLOR.occupied,    label: 'occupées' },
                            { count: stats.soonFree, color: STATUS_COLOR['soon-free'], label: 'bientôt' },
                        ].map(({ count, color, label }) => (
                            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color, lineHeight: 1 }}>
                                    {count}
                                </div>
                                <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem', letterSpacing: '0.04em' }}>
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: '0.7rem' }}>
                        <span style={{
                            position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)',
                            color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
                        }}>
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            placeholder="Rechercher une salle…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                height: '2.2rem',
                                padding: '0 0.75rem 0 2.2rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                color: 'rgba(255,255,255,0.85)',
                                fontSize: '0.78rem',
                                fontFamily: 'inherit',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={e => (e.target.style.borderColor = 'rgba(0,98,255,0.5)')}
                            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                        />
                    </div>

                    {/* Floor filter */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                        {(['all', 'RDC', '1'] as FloorFilter[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setFloorFilter(f)}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '99px',
                                    border: floorFilter === f
                                        ? '1px solid rgba(0,98,255,0.6)'
                                        : '1px solid rgba(255,255,255,0.08)',
                                    background: floorFilter === f
                                        ? 'rgba(0,98,255,0.15)'
                                        : 'rgba(255,255,255,0.04)',
                                    color: floorFilter === f
                                        ? '#6aaeff'
                                        : 'rgba(255,255,255,0.45)',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    fontFamily: 'inherit',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    outline: 'none',
                                }}
                            >
                                {f === 'all' ? 'Tous' : FLOOR_LABEL[f]}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '0.5rem' }} />
                </div>

                {/* Scrollable list */}
                <div style={{
                    flex: 1,
                    overflowY: open ? 'auto' : 'hidden',
                    padding: '0 0.75rem 1rem',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                }}>
                    {byFloor.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem 1rem',
                            color: 'rgba(255,255,255,0.25)',
                            fontSize: '0.8rem',
                        }}>
                            Aucune salle trouvée
                        </div>
                    ) : (
                        byFloor.map(({ floor, rooms: floorRooms }) => (
                            <div key={floor}>
                                {/* Section label */}
                                <p style={{
                                    margin: '0.8rem 0.3rem 0.4rem',
                                    fontSize: '0.6rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.25)',
                                }}>
                                    {FLOOR_LABEL[floor] ?? floor}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    {floorRooms.map(room => {
                                        const isSelected = room.id === selectedRoomId;
                                        return (
                                            <RoomListItem
                                                key={room.id}
                                                room={room}
                                                isSelected={isSelected}
                                                onClick={() => onSelectRoom(room.id)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

// ── Room list item ────────────────────────────────────────────────────────────

function RoomListItem({ room, isSelected, onClick }: {
    room: Room;
    isSelected: boolean;
    onClick: () => void;
}) {
    const statusColor = STATUS_COLOR[room.status];
    const statusLabel = STATUS_LABEL[room.status];

    return (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '10px',
                background: isSelected ? 'rgba(0,98,255,0.12)' : 'rgba(255,255,255,0.03)',
                border: isSelected
                    ? '1px solid rgba(0,98,255,0.35)'
                    : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'background 0.15s, border-color 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                outline: 'none',
            }}
            onMouseEnter={e => {
                if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)';
                }
            }}
            onMouseLeave={e => {
                if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                }
            }}
        >
            {/* Top row: status dot + name + capacity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StatusDot status={room.status} />
                <span style={{
                    flex: 1,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.9)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {room.name}
                </span>
                <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.2rem',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.68rem',
                    flexShrink: 0,
                }}>
                    <PersonIcon />
                    {room.capacity}
                </span>
            </div>

            {/* Bottom row: type badge + status label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <TypeBadge type={room.type} />
                <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: statusColor,
                    letterSpacing: '0.04em',
                    flexShrink: 0,
                }}>
                    {statusLabel.toUpperCase()}
                </span>
            </div>
        </button>
    );
}
