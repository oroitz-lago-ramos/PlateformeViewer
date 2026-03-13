// ─────────────────────────────────────────────────────────────────────────────
// Mock room data + deterministic schedule generator
// Replace with real API calls once the Unity/API integration is ready.
// ─────────────────────────────────────────────────────────────────────────────

import type { Room, RoomEvent, RoomStatus } from '../types/room';

// ── Raw room list (from rooms.json / Google Calendar API) ────────────────────

const RAW_ROOMS: Omit<Room, 'status' | 'currentEvent' | 'nextEvent'>[] = [
    // ── RDC ──────────────────────────────────────────────────────────────────
    { id: '1847161106',   name: 'Jaune-OpenSpace',         type: 'OpenSpace',          capacity: 100, building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'OTHER',           features: [] },
    { id: '33485699362',  name: 'Vert-01',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '33585699906',  name: 'Vert-02',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '33685699358',  name: 'Vert-03',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '33785699567',  name: 'Vert-04',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '33885700872',  name: 'Vert-05',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '33986377345',  name: 'Vert-06',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '34086377282',  name: 'Vert-07',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '34186377502',  name: 'Vert-08',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '37986377129',  name: 'Vert-09',                 type: 'Salle de réunion',   capacity: 8,   building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '36486377801',  name: 'Vert-10',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '486993700',    name: 'Bleu-11',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '586993816',    name: 'Bleu-12',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '686993984',    name: 'Bleu-13',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '786993953',    name: 'Bleu-14',                 type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '71386993218',  name: 'Bleu-15',                 type: 'Salle de réunion',   capacity: 8,   building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '71287669780',  name: 'Bleu-16',                 type: 'Salle de réunion',   capacity: 8,   building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '71187669474',  name: 'Bleu-17',                 type: 'Salle de réunion',   capacity: 8,   building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '71087669857',  name: 'Bleu-18',                 type: 'Salle de réunion',   capacity: 8,   building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '70987669307',  name: 'Bleu-19',                 type: 'Salle de réunion',   capacity: 8,   building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '68787669592',  name: 'Bleu-20',                 type: 'Salle de réunion',   capacity: 8,   building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '83388196943',  name: 'Rouge-21',                type: 'Salle de travail',   capacity: 24,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '74388196755',  name: 'Rouge-22',                type: 'Salle de réunion',   capacity: 8,   building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '3631861628',   name: 'SALLE DES SUCRES',        type: 'Grande salle',       capacity: 250, building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '68754999223',  name: 'SALLE CABARET',           type: 'Grande salle',       capacity: 100, building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '74164217527',  name: 'Salle Bocaux',            type: 'Grande salle',       capacity: 100, building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '91830537250',  name: 'PLAZA',                   type: 'Grande salle',       capacity: 100, building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'CONFERENCE_ROOM', features: [] },
    { id: '75788884165',  name: 'Bleu-OpenSpace',          type: 'OpenSpace',          capacity: 100, building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'OTHER',           features: [] },
    { id: '79122903673',  name: 'Rouge-OpenSpace',         type: 'OpenSpace',          capacity: 100, building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'OTHER',           features: [] },
    { id: '89163215558',  name: 'Vert-OpenSpace',          type: 'OpenSpace',          capacity: 80,  building: 'La-Plateforme-Hangar', floor: 'RDC', category: 'OTHER',           features: [] },
    // ── Étage 1 ──────────────────────────────────────────────────────────────
    { id: '8977239359',   name: 'Extra-Scolaire - Salle 1', type: 'Extra-Scolaire',   capacity: 50,  building: 'La-Plateforme-Hangar', floor: '1',   category: 'CONFERENCE_ROOM', features: [] },
    { id: '89623732173',  name: 'Extra-Scolaire - Salle 2', type: 'Extra-Scolaire',   capacity: 50,  building: 'La-Plateforme-Hangar', floor: '1',   category: 'CONFERENCE_ROOM', features: [] },
    { id: '8954144198',   name: 'Extra-Scolaire - Salle 3', type: 'Extra-Scolaire',   capacity: 50,  building: 'La-Plateforme-Hangar', floor: '1',   category: 'CONFERENCE_ROOM', features: [] },
    { id: '89459846684',  name: 'Extra-Scolaire - Salle 4', type: 'Extra-Scolaire',   capacity: 50,  building: 'La-Plateforme-Hangar', floor: '1',   category: 'CONFERENCE_ROOM', features: [] },
    { id: '91894055447',  name: 'PLAZA',                    type: 'Grande salle',     capacity: 50,  building: 'La-Plateforme-Hangar', floor: '1',   category: 'CONFERENCE_ROOM', features: [] },
    { id: '93086259644',  name: 'Workshop 1',               type: 'Workshop',         capacity: 20,  building: 'La-Plateforme-Hangar', floor: '1',   category: 'CONFERENCE_ROOM', features: [] },
    { id: '92948572432',  name: 'Workshop 2',               type: 'Workshop',         capacity: 20,  building: 'La-Plateforme-Hangar', floor: '1',   category: 'CONFERENCE_ROOM', features: [] },
    { id: '92865780920',  name: 'Workshop 3',               type: 'Workshop',         capacity: 20,  building: 'La-Plateforme-Hangar', floor: '1',   category: 'CONFERENCE_ROOM', features: [] },
    { id: '92781361388',  name: 'Workshop 4',               type: 'Workshop',         capacity: 20,  building: 'La-Plateforme-Hangar', floor: '1',   category: 'CONFERENCE_ROOM', features: [] },
];

// ── Schedule generator ───────────────────────────────────────────────────────

const EVENT_TITLES = [
    'Formation JavaScript',
    'Cours de cybersécurité',
    'Atelier React',
    'Réunion pédagogique',
    'Présentation de projet',
    'Préparation hackathon',
    'Mentorat individuel',
    'Examen final',
    'Workshop Docker',
    'Conférence DevOps',
    'Stand-up équipe',
    'Code review',
    'Atelier Python',
    'Cours de Linux',
    'Session de recrutement',
    'Formation Git',
    'Jury de soutenance',
    'Réunion de direction',
];

const ORGANIZERS = [
    'Alice Martin',
    'Bob Dupont',
    'Claire Dubois',
    'David Leroy',
    'Emma Petit',
    'François Bernard',
    'Giulia Rossi',
    'Hugo Lambert',
];

function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function seededRand(seed: number) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

/** Returns deterministic events for a given room + day offset (0 = today). */
export function generateSchedule(roomId: string, dayOffset: number): RoomEvent[] {
    const seed = hashCode(`${roomId}-${dayOffset}`);
    const rand = seededRand(seed);

    // OpenSpaces are always open — no individual bookings
    const raw = RAW_ROOMS.find(r => r.id === roomId);
    if (raw?.type === 'OpenSpace') return [];

    // Weekend: no events
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    const dow = d.getDay(); // 0=Sun, 6=Sat
    if (dow === 0 || dow === 6) return [];

    const count = Math.floor(rand() * 4) + (rand() > 0.3 ? 1 : 0); // 1–4, rarely 0
    const events: RoomEvent[] = [];
    let cursor = 8 * 60; // start at 08:00

    for (let i = 0; i < count; i++) {
        const gapMins = Math.floor(rand() * 60);
        const startRaw = cursor + gapMins;
        const startMins = Math.round(startRaw / 30) * 30; // snap to :00 or :30

        const durations = [30, 60, 90, 120];
        const duration = durations[Math.floor(rand() * durations.length)];
        const endMins = startMins + duration;

        if (startMins >= 18 * 60 || endMins > 18 * 60) break;

        events.push({
            id: `${roomId}-${dayOffset}-${i}`,
            title: EVENT_TITLES[Math.floor(rand() * EVENT_TITLES.length)],
            organizer: ORGANIZERS[Math.floor(rand() * ORGANIZERS.length)],
            startTime: `${String(Math.floor(startMins / 60)).padStart(2, '0')}:${String(startMins % 60).padStart(2, '0')}`,
            endTime: `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`,
        });

        cursor = endMins;
    }

    return events;
}

// ── Status computation ───────────────────────────────────────────────────────

export function computeStatus(schedule: RoomEvent[]): {
    status: RoomStatus;
    currentEvent?: RoomEvent;
    nextEvent?: RoomEvent;
} {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    let currentEvent: RoomEvent | undefined;
    let nextEvent: RoomEvent | undefined;

    for (const event of schedule) {
        const [sh, sm] = event.startTime.split(':').map(Number);
        const [eh, em] = event.endTime.split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;

        if (nowMins >= start && nowMins < end) {
            currentEvent = event;
        } else if (nowMins < start && !nextEvent) {
            nextEvent = event;
        }
    }

    let status: RoomStatus = 'free';
    if (currentEvent) {
        const [eh, em] = currentEvent.endTime.split(':').map(Number);
        const endMins = eh * 60 + em;
        status = (endMins - nowMins <= 30) ? 'soon-free' : 'occupied';
    }

    return { status, currentEvent, nextEvent };
}

// ── Hydrated rooms (with today's status) ────────────────────────────────────

export function hydrateRooms(): Room[] {
    return RAW_ROOMS.map(raw => {
        const schedule = generateSchedule(raw.id, 0);
        const { status, currentEvent, nextEvent } = computeStatus(schedule);
        return { ...raw, status, currentEvent, nextEvent };
    });
}
