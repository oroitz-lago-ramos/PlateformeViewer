// ─────────────────────────────────────────────────────────────────────────────
// Unity communication config
// All GameObject names and method names used with sendMessage / addEventListener.
// Keep in sync with the Unity scene and C# scripts.
// ─────────────────────────────────────────────────────────────────────────────

// ── GameObjects ───────────────────────────────────────────────────────────────

export const GO = {
    CAMERA:       'Main Camera',
    SCENE_LOADER: 'SceneManager',
} as const;

// ── Methods ───────────────────────────────────────────────────────────────────

export const METHOD = {
    // OrbitCamera.cs
    SET_ORBIT_SPEED:  'SetOrbitSpeed',
    SET_PAN_SPEED:    'SetPanSpeed',
    SET_ZOOM_SPEED:   'SetZoomSpeed',
    SET_SMOOTH_TIME:  'SetSmoothTime',

    // SceneLoader.cs
    SWAP_BUILDING:    'SwapBuilding',
} as const;

// ── Scenes ────────────────────────────────────────────────────────────────────

export interface SceneEntry {
    name: string;   // exact Unity scene name (must be in Build Settings)
    label: string;  // display label in the UI
}

export const SCENES: SceneEntry[] = [
    { name: 'LaPlateformeModel', label: 'La Plateforme - Docks des Suds' },
    { name: 'CapsuleModel',      label: 'Capsule'       },
];
