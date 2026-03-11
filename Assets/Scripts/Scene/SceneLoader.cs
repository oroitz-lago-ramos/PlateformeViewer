using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Loads a building scene additively on top of MainScene.
/// Place this on a persistent GameObject in MainScene.
///
/// Scene hierarchy at runtime:
///   MainScene        ← camera, lights, UI, managers
///   LaPlateformeModel (loaded additively) ← 3D building only
/// </summary>
public class SceneLoader : MonoBehaviour
{
    [Tooltip("Exact scene name to load (must be added to Build Settings)")]
    public string buildingSceneName = "LaPlateformeModel";

    [Tooltip("Optional: camera to focus on the building after load")]
    public OrbitCamera orbitCamera;

    public bool IsLoaded { get; private set; }

    // ----------------------------------------------------------------- unity

    void Start()
    {
        LoadBuilding();
    }

    // ----------------------------------------------------------------- public

    public void LoadBuilding()
    {
        if (IsLoaded) return;
        StartCoroutine(LoadAdditiveCoroutine(buildingSceneName));
    }

    public void UnloadBuilding()
    {
        if (!IsLoaded) return;
        StartCoroutine(UnloadCoroutine(buildingSceneName));
    }

    /// <summary>
    /// Swap to a different building scene at runtime.
    /// Unloads the current one first, then loads the new one.
    /// </summary>
    public void SwapBuilding(string newSceneName)
    {
        StartCoroutine(SwapCoroutine(newSceneName));
    }

    // ----------------------------------------------------------------- private

    private IEnumerator LoadAdditiveCoroutine(string sceneName)
    {
        // Avoid double-loading
        if (SceneManager.GetSceneByName(sceneName).isLoaded)
        {
            IsLoaded = true;
            yield break;
        }

        AsyncOperation op = SceneManager.LoadSceneAsync(sceneName, LoadSceneMode.Additive);
        if (op == null)
        {
            Debug.LogError($"[SceneLoader] Scene '{sceneName}' not found. Add it to Build Settings.");
            yield break;
        }

        yield return op;

        IsLoaded = true;
        Debug.Log($"[SceneLoader] Loaded '{sceneName}' additively.");

        CenterCameraOnBuilding(sceneName);
    }

    private IEnumerator UnloadCoroutine(string sceneName)
    {
        if (!SceneManager.GetSceneByName(sceneName).isLoaded) yield break;

        yield return SceneManager.UnloadSceneAsync(sceneName);
        IsLoaded = false;
        Debug.Log($"[SceneLoader] Unloaded '{sceneName}'.");
    }

    private IEnumerator SwapCoroutine(string newSceneName)
    {
        yield return UnloadCoroutine(buildingSceneName);
        buildingSceneName = newSceneName;
        yield return LoadAdditiveCoroutine(newSceneName);
    }

    /// <summary>
    /// After load, find the root objects of the building scene and compute
    /// their combined bounds so the orbit camera can frame them properly.
    /// </summary>
    private void CenterCameraOnBuilding(string sceneName)
    {
        if (orbitCamera == null) return;

        Scene scene = SceneManager.GetSceneByName(sceneName);
        Bounds bounds = new Bounds(Vector3.zero, Vector3.zero);
        bool hasBounds = false;

        foreach (GameObject root in scene.GetRootGameObjects())
        {
            foreach (Renderer r in root.GetComponentsInChildren<Renderer>())
            {
                if (!hasBounds) { bounds = r.bounds; hasBounds = true; }
                else              bounds.Encapsulate(r.bounds);
            }
        }

        if (!hasBounds) return;

        // Focus the orbit camera on the center of the building,
        // at a distance that fits the whole thing in view
        float fitDistance = bounds.extents.magnitude * 2.5f;
        orbitCamera.FocusOn(bounds.center, fitDistance);
    }
}
