import { useEffect, useState, useCallback } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
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
        addEventListener,
        removeEventListener,
    } = useUnityContext({
        loaderUrl: BASE_URL + BUILD_NAME + '.loader.js',
        dataUrl: BASE_URL + BUILD_NAME + '.data',
        frameworkUrl: BASE_URL + BUILD_NAME + '.framework.js',
        codeUrl: BASE_URL + BUILD_NAME + '.wasm',
    });

    const [ready, setReady] = useState(false);

    // ── Room state ────────────────────────────────────────────────────────────
    const { rooms, getSchedule } = useRoomData();
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

    // ── Unity event: room clicked in 3D view ──────────────────────────────────
    useEffect(() => {
        const handler = (roomId: unknown) => {
            if (typeof roomId === 'string') handleSelectRoom(roomId);
        };
        addEventListener('OnRoomSelected', handler);
        return () => removeEventListener('OnRoomSelected', handler);
    }, [addEventListener, removeEventListener, handleSelectRoom]);

    useEffect(() => {
        if (!isLoaded) return;
        const t = setTimeout(() => setReady(true), SPLASH_COVER_MS);
        return () => clearTimeout(t);
    }, [isLoaded]);

    // Expose bridge utilities on window for debugging
    if (typeof window !== 'undefined') {
        (window as any).__unity = { sendMessage, addEventListener, removeEventListener };
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
