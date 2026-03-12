using UnityEngine;
using System.Collections.Generic;

public class RoomClickHandler : MonoBehaviour
{
    [Header("Références")]
    public Camera mainCamera;

    [Header("Highlight")]
    [Tooltip("Couleur appliquée sur le mesh de la salle survolée/cliquée")]
    public Color highlightColor = new Color(0.2f, 0.6f, 1f, 0.5f);

    public static event System.Action<RoomData> OnRoomClicked;

    private readonly Dictionary<GameObject, RoomData> _roomMap = new();

    // Suivi du dernier highlight
    private GameObject _lastHighlighted;
    private readonly Dictionary<Renderer, Color> _originalColors = new();

    // ----------------------------------------------------------------- Unity

    void Start()
    {
        if (mainCamera == null)
            mainCamera = Camera.main;

        // S'abonner aux événements du RoomManager
        RoomManager.OnRoomsLoaded += BuildRoomMap;
        RoomManager.OnRoomUpdated += _ => { }; // hook disponible
    }

    void OnDestroy()
    {
        RoomManager.OnRoomsLoaded -= BuildRoomMap;
    }

    void Update()
    {
        if (Input.GetMouseButtonDown(0))
            HandleClick();
    }

    // ----------------------------------------------------------------- Clic

    void HandleClick()
    {
        Ray ray = mainCamera.ScreenPointToRay(Input.mousePosition);

        if (!Physics.Raycast(ray, out RaycastHit hit))
        {
            ClearHighlight();
            return;
        }

        GameObject root = FindRoomRoot(hit.collider.gameObject);

        if (root == null || !_roomMap.TryGetValue(root, out RoomData room))
        {
            ClearHighlight();
            return;
        }

        HighlightRoom(root);
        Debug.Log($"[RoomClick] {room.name} | statut : {room.status} | capacité : {room.capacity}");
        OnRoomClicked?.Invoke(room);
    }

    // ----------------------------------------------------------------- Mapping automatique

    /// <summary>
    /// Appelé par RoomManager.OnRoomsLoaded.
    /// Parcourt tous les GameObjects actifs et les associe aux RoomData par nom.
    /// </summary>
    void BuildRoomMap()
    {
        _roomMap.Clear();

        // Récupère tous les GameObjects de la scène (y compris la scène additive)
        GameObject[] allObjects = FindObjectsByType<GameObject>(FindObjectsSortMode.None);

        RoomManager mgr = FindFirstObjectByType<RoomManager>();
        if (mgr == null) return;

        foreach (RoomData room in mgr.rooms)
        {
            foreach (GameObject go in allObjects)
            {
                if (NamesMatch(go.name, room.name) && !_roomMap.ContainsKey(go))
                {
                    _roomMap[go] = room;
                    break;
                }
            }
        }

        Debug.Log($"[RoomClickHandler] {_roomMap.Count} salles mappées sur {mgr.rooms.Count} chargées.");
    }

    static bool NamesMatch(string goName, string roomName)
    {
        if (string.IsNullOrEmpty(goName) || string.IsNullOrEmpty(roomName))
            return false;

        string a = Normalize(goName);
        string b = Normalize(roomName);
        return a == b || a.Contains(b) || b.Contains(a);
    }

    static string Normalize(string s)
        => s.ToLowerInvariant()
             .Replace("-", "")
             .Replace("_", "")
             .Replace(" ", "");

    // ----------------------------------------------------------------- Hiérarchie

    /// <summary>
    /// Remonte la hiérarchie depuis l'objet touché jusqu'à trouver
    /// un GameObject référencé dans _roomMap.
    /// </summary>
    GameObject FindRoomRoot(GameObject hit)
    {
        Transform t = hit.transform;
        while (t != null)
        {
            if (_roomMap.ContainsKey(t.gameObject))
                return t.gameObject;
            t = t.parent;
        }
        return null;
    }

    // ----------------------------------------------------------------- Highlight

    void HighlightRoom(GameObject root)
    {
        if (_lastHighlighted == root) return;

        ClearHighlight();
        _lastHighlighted = root;

        foreach (Renderer r in root.GetComponentsInChildren<Renderer>())
        {
            foreach (Material mat in r.materials)
            {
                if (!_originalColors.ContainsKey(r))
                    _originalColors[r] = mat.HasProperty("_BaseColor")
                        ? mat.GetColor("_BaseColor")
                        : mat.color;

                if (mat.HasProperty("_BaseColor"))
                    mat.SetColor("_BaseColor", highlightColor);
                else
                    mat.color = highlightColor;
            }
        }
    }

    void ClearHighlight()
    {
        if (_lastHighlighted == null) return;

        foreach (Renderer r in _lastHighlighted.GetComponentsInChildren<Renderer>())
        {
            if (_originalColors.TryGetValue(r, out Color original))
            {
                foreach (Material mat in r.materials)
                {
                    if (mat.HasProperty("_BaseColor"))
                        mat.SetColor("_BaseColor", original);
                    else
                        mat.color = original;
                }
            }
        }

        _originalColors.Clear();
        _lastHighlighted = null;
    }

    // ----------------------------------------------------------------- Debug

    /// <summary>Appelle ça depuis l'Inspector (bouton contextuel) pour voir le mapping.</summary>
    [ContextMenu("Log Room Map")]
    void LogRoomMap()
    {
        foreach (var kv in _roomMap)
            Debug.Log($"  {kv.Key.name}  →  {kv.Value.name} ({kv.Value.status})");
    }
}