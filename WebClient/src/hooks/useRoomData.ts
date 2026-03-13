import { useState, useCallback } from 'react';
import type { Room, RoomEvent } from '../types/room';
import { hydrateRooms, generateSchedule, computeStatus } from '../data/mockRooms';

// ── Types ────────────────────────────────────────────────────────────────────

interface UseRoomDataReturn {
    rooms: Room[];
    getSchedule: (roomId: string, dayOffset: number) => RoomEvent[];
    refreshStatuses: () => void;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useRoomData(): UseRoomDataReturn {
    const [rooms, setRooms] = useState<Room[]>(() => hydrateRooms());

    /** Re-compute today's statuses (call this on a timer when real API is wired up). */
    const refreshStatuses = useCallback(() => {
        setRooms(prev =>
            prev.map(room => {
                const schedule = generateSchedule(room.id, 0);
                const { status, currentEvent, nextEvent } = computeStatus(schedule);
                return { ...room, status, currentEvent, nextEvent };
            })
        );
    }, []);

    /** Returns the schedule for a given room and day offset (0 = today, 1 = tomorrow…). */
    const getSchedule = useCallback((roomId: string, dayOffset: number): RoomEvent[] => {
        return generateSchedule(roomId, dayOffset);
    }, []);

    return { rooms, getSchedule, refreshStatuses };
}
