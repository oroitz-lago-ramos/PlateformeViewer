import { useEffect, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { LoadingScreen } from './components/LoadingScreen';
import { ControlsHint } from './components/ControlsHint';
import { SettingsPanel } from './components/SettingsPanel';
import { SceneSelector } from './components/SceneSelector';

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
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {!ready && <LoadingScreen progress={loadingProgression} />}
            <Unity
                id="unity-canvas"
                unityProvider={unityProvider}
                style={{ width: '100%', height: '100%', display: ready ? 'block' : 'none' }}
            />
            {ready && <ControlsHint />}
            {ready && <SettingsPanel sendMessage={sendMessage} />}
            {ready && <SceneSelector sendMessage={sendMessage} />}
        </div>
    );
}

export default UnityGame;
