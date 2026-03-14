using UnityEngine;
using System.Collections.Generic;

public class RoomClickHandler : MonoBehaviour
{
    [Header("Références")]
    public Camera mainCamera;

    [Header("Outline Hover")]
    public Color outlineColor = new Color(0.2f, 0.6f, 1f, 1f);
    [Range(0f, 10f)]
    public float outlineWidth = 4f;
    public Outline.Mode outlineMode = Outline.Mode.OutlineAll;

    [Header("Debug")]
    public bool debugRaycast = true;

    public static event System.Action<RoomData> OnRoomClicked;

    private readonly Dictionary<GameObject, RoomData> _roomMap = new();

    private GameObject _hoveredRoom;

    private Vector2 _mouseDownPos;
    private const float DragThresholdPx = 5f;

    // ----------------------------------------------------------------- Unity

    void Start()
    {
        if (mainCamera == null)
            mainCamera = Camera.main;

        RoomManager.OnRoomsLoaded    += BuildRoomMap;
        SceneLoader.OnBuildingLoaded += BuildRoomMap;

        // Try building the map immediately in case both are already ready
        BuildRoomMap();
    }

    void OnDestroy()
    {
        RoomManager.OnRoomsLoaded    -= BuildRoomMap;
        SceneLoader.OnBuildingLoaded -= BuildRoomMap;
    }

    // Hover: raycast every fixed step
    void FixedUpdate()
    {
        Ray ray = mainCamera.ScreenPointToRay(Input.mousePosition);

        if (Physics.Raycast(ray, out RaycastHit hit))
        {
            if (debugRaycast)
                Debug.Log($"[Raycast] hit: {hit.collider.gameObject.name}");

            // Use RoomIdentifier to find the container root (works even when room map is empty)
            GameObject root = FindRoomIdentifierRoot(hit.collider.gameObject);

            if (debugRaycast && root == null)
                Debug.Log($"[Raycast] no RoomIdentifier found from {hit.collider.gameObject.name}");

            SetHover(root);
        }
        else
        {
            SetHover(null);
        }
    }

    // Click: detected in Update so no input is missed
    void Update()
    {
        if (Input.GetMouseButtonDown(0))
            _mouseDownPos = Input.mousePosition;

        if (Input.GetMouseButtonUp(0))
        {
            // Ignore if the mouse moved more than the drag threshold (camera orbit)
            Vector2 delta = (Vector2)Input.mousePosition - _mouseDownPos;
            if (delta.sqrMagnitude > DragThresholdPx * DragThresholdPx) return;

            if (_hoveredRoom == null)
            {
                if (debugRaycast) Debug.Log("[RoomClick] click but no hovered room");
                return;
            }

            if (_roomMap.TryGetValue(_hoveredRoom, out RoomData room))
            {
                Debug.Log($"[RoomClick] {room.name} | statut : {room.status} | capacité : {room.capacity}");
                WebBridge.SendRoomSelected(RoomManager.SerializeRoom(room));
                OnRoomClicked?.Invoke(room);
            }
            else
            {
                RoomIdentifier rid = _hoveredRoom.GetComponent<RoomIdentifier>();
                Debug.Log($"[RoomClick] container: {_hoveredRoom.name} | roomName: {(rid != null ? rid.roomName : "?")} (map not loaded)");
            }
        }
    }

    // ----------------------------------------------------------------- Hover

    void SetHover(GameObject root)
    {
        if (_hoveredRoom == root) return;

        // Disable outline on previous
        if (_hoveredRoom != null)
        {
            Outline old = _hoveredRoom.GetComponent<Outline>();
            if (old != null) old.enabled = false;
        }

        _hoveredRoom = root;

        // Enable outline on new
        if (_hoveredRoom != null)
        {
            Outline outline = _hoveredRoom.GetComponent<Outline>();
            if (outline != null)
            {
                outline.OutlineMode = outlineMode;
                outline.OutlineColor = outlineColor;
                outline.OutlineWidth = outlineWidth;
                outline.enabled = true;
            }
        }
    }

    // ----------------------------------------------------------------- Mapping automatique

    void BuildRoomMap()
    {
        _roomMap.Clear();

        RoomManager mgr = FindFirstObjectByType<RoomManager>();
        if (mgr == null || mgr.rooms.Count == 0) return;

        // Match by RoomIdentifier.roomName — more reliable than matching GameObject names
        // which are generic (e.g. "SingleContainer17" vs room name "Bleu-17")
        foreach (RoomIdentifier identifier in FindObjectsByType<RoomIdentifier>(FindObjectsSortMode.None))
        {
            if (string.IsNullOrEmpty(identifier.roomName)) continue;

            RoomData room = mgr.rooms.Find(r => NamesMatch(identifier.roomName, r.name));
            if (room != null && !_roomMap.ContainsKey(identifier.gameObject))
                _roomMap[identifier.gameObject] = room;
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

    // Finds the nearest ancestor (or self) with a RoomIdentifier component
    static GameObject FindRoomIdentifierRoot(GameObject hit)
    {
        Transform t = hit.transform;
        while (t != null)
        {
            if (t.GetComponent<RoomIdentifier>() != null)
                return t.gameObject;
            t = t.parent;
        }
        return null;
    }

    // ----------------------------------------------------------------- Debug

    [ContextMenu("Log Room Map")]
    void LogRoomMap()
    {
        foreach (var kv in _roomMap)
            Debug.Log($"  {kv.Key.name}  →  {kv.Value.name} ({kv.Value.status})");
    }
}
