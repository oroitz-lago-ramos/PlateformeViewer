import { useEffect, useState, useCallback } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import type { UnityRoomPayload } from '../../types/room';
import { mapUnityRoom } from '../../types/room';
import { LoadingScreen } from './components/LoadingScreen';
import { ControlsHint } from './components/ControlsHint';
import { SettingsPanel } from './components/SettingsPanel';
import { SceneSelector } from './components/SceneSelector';
import { RoomSidebar } from '../Rooms/RoomSidebar';
import { RoomDetailPanel } from '../Rooms/RoomDetailPanel';
import { useRoomData } from '../../hooks/useRoomData';

const BASE_URL = '/UnityBuild/Build/';
const BUILD_NAME = 'UnityBuild';

// How long (ms) to keep the loading screen up after Unity reports isLoaded,
// to cover the "Made with Unity" splash screen.
const SPLASH_COVER_MS = 2200;

function UnityGame() {
    const {
        unityProvider,
        isLoaded,
        loadingProgression,
        sendMessage,
    } = useUnityContext({
        loaderUrl: BASE_URL + BUILD_NAME + '.loader.js',
        dataUrl: BASE_URL + BUILD_NAME + '.data',
        frameworkUrl: BASE_URL + BUILD_NAME + '.framework.js',
        codeUrl: BASE_URL + BUILD_NAME + '.wasm',
    });

    const [ready, setReady] = useState(false);

    // ── Room state ────────────────────────────────────────────────────────────
    const { rooms, getSchedule, updateRoom } = useRoomData();
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [dayOffset, setDayOffset] = useState(0);

    const selectedRoom = rooms.find(r => r.id === selectedRoomId) ?? null;
    const schedule = selectedRoomId ? getSchedule(selectedRoomId, dayOffset) : [];

    const handleSelectRoom = useCallback((id: string) => {
        setSelectedRoomId(id);
        setDayOffset(0);
    }, []);

    const handleCloseDetail = useCallback(() => {
        setSelectedRoomId(null);
        setDayOffset(0);
    }, []);

    // ── Close detail panel when the camera moves ─────────────────────────────
    useEffect(() => {
        if (!selectedRoomId || !ready) return;

        const canvas = document.getElementById('unity-canvas');
        if (!canvas) return;

        let startX = 0;
        let startY = 0;

        const onMouseDown = (e: MouseEvent) => { startX = e.clientX; startY = e.clientY; };

        const onMouseMove = (e: MouseEvent) => {
            if (e.buttons === 0) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (dx * dx + dy * dy > 25) handleCloseDetail(); // > 5px drag
        };

        const onWheel = () => handleCloseDetail();

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('wheel', onWheel, { passive: true });
        return () => {
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('wheel', onWheel);
        };
    }, [selectedRoomId, ready, handleCloseDetail]);

    // ── Unity event: room clicked in 3D view ─────────────────────────────────
    // Unity dispatches a CustomEvent('unityRoomSelected') with the full room JSON
    useEffect(() => {
        const handler = (e: Event) => {
            try {
                const payload = JSON.parse((e as CustomEvent<string>).detail) as UnityRoomPayload;
                const room = mapUnityRoom(payload);
                // Update the room in state with fresh data, then select it
                updateRoom(room);
                handleSelectRoom(room.id);
            } catch (err) {
                console.error('[UnityGame] Failed to parse unityRoomSelected payload', err);
            }
        };
        window.addEventListener('unityRoomSelected', handler);
        return () => window.removeEventListener('unityRoomSelected', handler);
    }, [handleSelectRoom]);

    useEffect(() => {
        if (!isLoaded) return;
        const t = setTimeout(() => setReady(true), SPLASH_COVER_MS);
        return () => clearTimeout(t);
    }, [isLoaded]);

    // Envoie le chemin StreamingAssets à Unity dès que le build est chargé
    useEffect(() => {
        if (!isLoaded) return;
        const path = window.location.origin + '/UnityBuild/StreamingAssets';
        sendMessage('RoomManager', 'SetStreamingAssetsPath', path);
    }, [isLoaded, sendMessage]);

    // Expose sendMessage on window for debugging
    if (typeof window !== 'undefined') {
        (window as any).__unity = { sendMessage };
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
            {!ready && <LoadingScreen progress={loadingProgression} />}
            <Unity
                id="unity-canvas"
                unityProvider={unityProvider}
                style={{ width: '100%', height: '100%', display: ready ? 'block' : 'none' }}
            />
            {ready && <ControlsHint />}
            {ready && <SettingsPanel sendMessage={sendMessage} />}
            {ready && <SceneSelector sendMessage={sendMessage} />}
            {ready && (
                <RoomSidebar
                    rooms={rooms}
                    selectedRoomId={selectedRoomId}
                    onSelectRoom={handleSelectRoom}
                />
            )}
            {ready && selectedRoom && (
                <RoomDetailPanel
                    room={selectedRoom}
                    schedule={schedule}
                    dayOffset={dayOffset}
                    onDayChange={setDayOffset}
                    onClose={handleCloseDetail}
                />
            )}
        </div>
    );
}

export default UnityGame;