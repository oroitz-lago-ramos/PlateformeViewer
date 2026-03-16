// ─────────────────────────────────────────────────────────────────────────────
// Room data types
// Mirrors the shape coming from Unity (RoomData.cs) and the API.
// ─────────────────────────────────────────────────────────────────────────────

export interface RoomEvent {
    id: string;
    title: string;
    organizer?: string;
    startTime: string; // "HH:MM" or "Journée entière"
    endTime: string;   // "HH:MM" or ""
    date?: string;     // "YYYY-MM-DD" local start date
    endDate?: string;  // "YYYY-MM-DD" local end date (exclusive for multi-day)
}

export type RoomStatus = 'free' | 'occupied' | 'soon-free';

export interface Room {
    id: string;
    name: string;
    type: string;
    capacity: number;
    building: string;
    floor: string;
    category: string;
    features: string[];
    status: RoomStatus;
    currentEvent?: RoomEvent;
    nextEvent?: RoomEvent;
    scheduleToday: RoomEvent[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw payload shapes sent by Unity (RoomJsonPayload / EventData in C#)
// ─────────────────────────────────────────────────────────────────────────────

export interface UnityEventData {
    title: string;
    start: string;      // "HH:MM"
    end: string;        // "HH:MM"
    organizer?: string;
}

export interface UnityRoomPayload {
    id: string;
    name: string;
    type: string;
    capacity: number;
    building: string;
    floor: string;
    category: string;
    status: 'available' | 'occupied' | 'soon'; // Unity status values
    currentEvent?: UnityEventData | null;
    nextEvent?: UnityEventData | null;
    scheduleToday?: UnityEventData[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper: Unity payload → React Room
// ─────────────────────────────────────────────────────────────────────────────

function toHHMM(value: string | undefined | null): string {
    if (!value) return '';
    if (value.includes('T')) {
        const d = new Date(value);
        if (!isNaN(d.getTime()))
            return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return value; // already "HH:MM"
}

const ALL_DAY = 'Journée entière';

function localDateStr(iso: string): string | undefined {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return undefined;
    return d.toLocaleDateString('en-CA'); // "YYYY-MM-DD"
}

function mapEvent(e: UnityEventData | null | undefined, index: number): RoomEvent | undefined {
    if (!e) return undefined;

    let startTime = toHHMM(e.start);
    let endTime   = toHHMM(e.end);

    // Detect multi-day / all-day events (duration ≥ 24 h)
    if (e.start && e.end) {
        const diff = new Date(e.end).getTime() - new Date(e.start).getTime();
        if (!isNaN(diff) && diff >= 24 * 60 * 60 * 1000) {
            startTime = ALL_DAY;
            endTime   = '';
        }
    }

    return {
        id: `${index}`,
        title: e.title,
        organizer: e.organizer,
        startTime,
        endTime,
        date:    e.start ? localDateStr(e.start) : undefined,
        endDate: e.end   ? localDateStr(e.end)   : undefined,
    };
}

function mapStatus(s: UnityRoomPayload['status']): RoomStatus {
    if (s === 'available') return 'free';
    if (s === 'soon')      return 'soon-free';
    return 'occupied';
}

export function mapUnityRoom(u: UnityRoomPayload): Room {
    const schedule = (u.scheduleToday ?? []).map((e, i) => mapEvent(e, i)!);
    return {
        id:           u.id,
        name:         u.name,
        type:         u.type ?? '',
        capacity:     u.capacity,
        building:     u.building ?? '',
        floor:        u.floor ?? '',
        category:     u.category ?? '',
        features:     [],
        status:       mapStatus(u.status),
        currentEvent: mapEvent(u.currentEvent, -1),
        nextEvent:    mapEvent(u.nextEvent, -2),
        scheduleToday: schedule,
    };
}
