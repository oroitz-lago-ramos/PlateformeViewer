// ─────────────────────────────────────────────────────────────────────────────
// Room data types
// Mirrors the shape coming from Unity (RoomData.cs) and the API.
// ─────────────────────────────────────────────────────────────────────────────

export interface RoomEvent {
    id: string;
    title: string;
    organizer?: string;
    startTime: string; // "HH:MM"
    endTime: string;   // "HH:MM"
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

function mapEvent(e: UnityEventData | null | undefined, index: number): RoomEvent | undefined {
    if (!e) return undefined;
    return {
        id: `${index}`,
        title: e.title,
        organizer: e.organizer,
        startTime: e.start,
        endTime: e.end,
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
