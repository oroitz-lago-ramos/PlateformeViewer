using UnityEngine;

public class RoomIdentifier : MonoBehaviour
{
    [Tooltip("Nom de la salle tel qu'il apparaît dans rooms.json")]
    public string roomName;

    [Header("Couleurs par statut")]
    public Color colorAvailable = new Color(0.20f, 0.78f, 0.35f);
    public Color colorOccupied  = new Color(0.88f, 0.22f, 0.22f);
    public Color colorSoon      = new Color(1.00f, 0.65f, 0.00f);
    public Color colorUnknown   = new Color(0.55f, 0.55f, 0.55f);

    private Renderer[] _renderers;

    void Awake()
    {
        _renderers = GetComponentsInChildren<Renderer>();
    }

    void Start()
    {
        if (RoomManager.RoomsByName.TryGetValue(roomName, out RoomData data))
            ApplyColor(data);
        else
            RoomManager.OnRoomsLoaded += OnRoomsReady;

        RoomManager.OnRoomUpdated += OnRoomUpdated;
    }

    void OnDestroy()
    {
        RoomManager.OnRoomsLoaded -= OnRoomsReady;
        RoomManager.OnRoomUpdated -= OnRoomUpdated;
    }

    void OnRoomsReady()
    {
        RoomManager.OnRoomsLoaded -= OnRoomsReady;
        if (RoomManager.RoomsByName.TryGetValue(roomName, out RoomData data))
            ApplyColor(data);
    }

    void OnRoomUpdated(RoomData data)
    {
        if (data.name == roomName)
            ApplyColor(data);
    }

    void ApplyColor(RoomData data)
    {
        Color c = data.status switch
        {
            "available" => colorAvailable,
            "occupied"  => colorOccupied,
            "soon"      => colorSoon,
            _           => colorUnknown,
        };

        foreach (Renderer r in _renderers)
            r.material.color = c;
    }
}
