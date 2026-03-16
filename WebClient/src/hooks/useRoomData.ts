import { useState, useCallback, useEffect } from 'react';
import type { Room, RoomEvent, UnityRoomPayload } from '../types/room';
import { mapUnityRoom } from '../types/room';

interface UseRoomDataReturn {
    rooms: Room[];
    getSchedule: (roomId: string, dayOffset: number) => RoomEvent[];
    updateRoom: (room: Room) => void;
    refreshStatuses: () => void;
}

export function useRoomData(): UseRoomDataReturn {
    const [rooms, setRooms] = useState<Room[]>([]);

    // Listen for the full rooms list sent by Unity after loading rooms.json
    useEffect(() => {
        const handler = (e: Event) => {
            try {
                const payload = JSON.parse((e as CustomEvent<string>).detail) as {
                    rooms: UnityRoomPayload[];
                };
                setRooms(payload.rooms.map(mapUnityRoom));
            } catch (err) {
                console.error('[useRoomData] Failed to parse unityRoomsLoaded payload', err);
            }
        };

        window.addEventListener('unityRoomsLoaded', handler);
        return () => window.removeEventListener('unityRoomsLoaded', handler);
    }, []);

    /**
     * Returns the schedule for a given room and day offset.
     * Unity only provides today's schedule (offset 0); other days return empty.
     */
    const getSchedule = useCallback((roomId: string, dayOffset: number): RoomEvent[] => {
        const room = rooms.find(r => r.id === roomId);
        if (!room) return [];

        const target = new Date();
        target.setDate(target.getDate() + dayOffset);
        const targetDate = target.toLocaleDateString('en-CA'); // "YYYY-MM-DD"

        const isOnDate = (e: RoomEvent) => {
            if (!e.date) return true;
            // Multi-day: endDate is exclusive (e.g. event ends at midnight = start of endDate)
            if (e.endDate && e.endDate > e.date)
                return e.date <= targetDate && targetDate < e.endDate;
            return e.date === targetDate;
        };

        // Use scheduleToday if available
        if (room.scheduleToday.length > 0)
            return room.scheduleToday.filter(isOnDate);

        // API only provides current_event / next_event
        const events: RoomEvent[] = [];
        if (room.currentEvent && isOnDate(room.currentEvent))
            events.push({ ...room.currentEvent, id: 'current' });
        if (room.nextEvent && isOnDate(room.nextEvent))
            events.push({ ...room.nextEvent, id: 'next' });
        return events;
    }, [rooms]);

    /** Upserts a single room (called when Unity sends a room-selected event with fresh data). */
    const updateRoom = useCallback((room: Room) => {
        setRooms(prev => {
            const exists = prev.some(r => r.id === room.id);
            return exists
                ? prev.map(r => r.id === room.id ? room : r)
                : [...prev, room];
        });
    }, []);

    /** No-op for now — Unity refreshes data on its own interval. */
    const refreshStatuses = useCallback(() => {}, []);

    return { rooms, getSchedule, updateRoom, refreshStatuses };
}
