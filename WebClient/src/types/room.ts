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
}
