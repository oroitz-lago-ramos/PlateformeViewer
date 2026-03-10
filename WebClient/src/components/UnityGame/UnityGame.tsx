import { Unity, useUnityContext } from 'react-unity-webgl';
import { LoadingScreen } from './components/LoadingScreen';
import { ControlsHint } from './components/ControlsHint';
import { SettingsPanel } from './components/SettingsPanel';

const BASE_URL = '/UnityBuild/Build/';
const BUILD_NAME = 'UnityBuild';

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

    // Expose bridge utilities on window for debugging
    if (typeof window !== 'undefined') {
        (window as any).__unity = { sendMessage, addEventListener, removeEventListener };
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {!isLoaded && <LoadingScreen progress={loadingProgression} />}
            <Unity
                id="unity-canvas"
                unityProvider={unityProvider}
                style={{ width: '100%', height: '100%', display: isLoaded ? 'block' : 'none' }}
            />
            {isLoaded && <ControlsHint />}
            {isLoaded && <SettingsPanel sendMessage={sendMessage} />}
        </div>
    );
}

export default UnityGame;
