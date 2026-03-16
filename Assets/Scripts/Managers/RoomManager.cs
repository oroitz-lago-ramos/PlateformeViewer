using UnityEngine;
using UnityEngine.Networking;
using System;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;

public class RoomManager : MonoBehaviour
{
    [Header("Configuration")]
    public string apiBaseUrl = "http://localhost:8080/api/v1";
    public bool useLocalFallback = true;
    public float refreshInterval = 30f;

    [Header("Editor / Standalone")]
    [Tooltip("Auto-load rooms.json at Start without waiting for React (editor & standalone testing)")]
    public bool autoLoadOnStart = true;

    [Header("Salles chargées (lecture seule)")]
    public List<RoomData> rooms = new List<RoomData>();

    public static event System.Action OnRoomsLoaded;
    public static event System.Action<RoomData> OnRoomUpdated;

    private string _streamingAssetsUrl = "";
    private string _buildingName = "";

    public static readonly Dictionary<string, RoomData> RoomsByName = new();


    void Awake()
    {
        SceneLoader.OnBuildingLoaded += OnBuildingSceneLoaded;
    }

    void OnDestroy()
    {
        SceneLoader.OnBuildingLoaded -= OnBuildingSceneLoaded;
    }

    void OnBuildingSceneLoaded()
    {
        BuildingIdentifier identifier = FindObjectOfType<BuildingIdentifier>();
        if (identifier != null)
            _buildingName = identifier.BuildingName;
        else
            Debug.LogWarning("[RoomManager] No BuildingIdentifier found in loaded scene.");

        Debug.Log($"[RoomManager] Building detected: '{_buildingName}'");

        // Re-fetch rooms whenever a building scene is loaded or swapped
        if (!useLocalFallback)
        {
            if (!string.IsNullOrEmpty(_streamingAssetsUrl))
                StartCoroutine(LoadRoomsFromWeb(BuildApiUrl()));
#if !UNITY_WEBGL || UNITY_EDITOR
            else if (autoLoadOnStart)
                StartCoroutine(LoadRoomsFromDisk(
                    System.IO.Path.Combine(Application.streamingAssetsPath, "rooms.json")));
#endif
        }
    }

    void Start()
    {
#if !UNITY_WEBGL || UNITY_EDITOR
        // Editor / standalone with local fallback: load directly from disk
        if (autoLoadOnStart && useLocalFallback)
            StartCoroutine(LoadRoomsFromDisk(
                System.IO.Path.Combine(Application.streamingAssetsPath, "rooms.json")));
#endif
    }

    private string BuildApiUrl()
    {
        string url = apiBaseUrl + "/rooms";
        if (!string.IsNullOrEmpty(_buildingName))
            url += "?building=" + UnityEngine.Networking.UnityWebRequest.EscapeURL(_buildingName);
        return url;
    }

    // Called by React via sendMessage once the WebGL build is mounted
    public void SetStreamingAssetsPath(string path)
    {
        _streamingAssetsUrl = path.TrimEnd('/');
        string url = useLocalFallback
            ? _streamingAssetsUrl + "/rooms.json"
            : BuildApiUrl();

        Debug.Log("[RoomManager] URL : " + url);
        StartCoroutine(LoadRoomsFromWeb(url));
    }

    // ── Loaders ───────────────────────────────────────────────────────────────

#if !UNITY_WEBGL || UNITY_EDITOR
    IEnumerator LoadRoomsFromDisk(string filePath)
    {
        if (!System.IO.File.Exists(filePath))
        {
            Debug.LogError($"[RoomManager] rooms.json introuvable : {filePath}");
            yield break;
        }

        string json = System.IO.File.ReadAllText(filePath);
        yield return null; // defer one frame so Start() finishes first
        ParseAndApply(json);
    }
#endif

    IEnumerator LoadRoomsFromWeb(string url)
    {
        using UnityWebRequest request = UnityWebRequest.Get(url);
        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"[RoomManager] Erreur réseau : {request.error} ({url})");
            yield break;
        }

        ParseAndApply(request.downloadHandler.text);
    }

    void ParseAndApply(string json)
    {
        RoomJsonRoot root = JsonConvert.DeserializeObject<RoomJsonRoot>(json);

        if (root == null || root.rooms == null)
        {
            Debug.LogError("[RoomManager] JSON invalide ou vide !");
            return;
        }

        rooms.Clear();
        RoomsByName.Clear();

        foreach (var data in root.rooms)
        {
            RoomData room = ScriptableObject.CreateInstance<RoomData>();
            room.id       = !string.IsNullOrEmpty(data.id) ? data.id : data.code;
            room.name     = data.name;
            room.capacity = data.capacity;
            room.type     = data.type;
            room.building = data.building;
            room.floor    = data.floor == 0 ? "RDC" : data.floor.ToString();
            room.category = data.category;
            room.status   = data.status ?? "unknown";

            // Keep ISO timestamps intact — React handles formatting and date filtering
            if (data.currentEvent  != null) room.currentEvent  = data.currentEvent;
            if (data.nextEvent     != null) room.nextEvent     = data.nextEvent;
            if (data.scheduleToday != null) room.scheduleToday = data.scheduleToday;

            // Generate mock event data (only when not using the real API)
            if (useLocalFallback)
                MockRoomDataGenerator.Populate(room);

            rooms.Add(room);
            RoomsByName[room.name] = room;
        }

        Debug.Log($"{rooms.Count} salles chargées !");

        // Send full rooms list to React
        WebBridge.SendRooms(SerializeRooms());

        OnRoomsLoaded?.Invoke();

        InvokeRepeating(nameof(RefreshAllRooms), refreshInterval, refreshInterval);
    }

    void RefreshAllRooms()
    {
        foreach (var room in rooms)
            StartCoroutine(FetchRoomStatus(room));
    }

    IEnumerator FetchRoomStatus(RoomData room)
    {
        if (useLocalFallback) yield break;

        using UnityWebRequest request = UnityWebRequest.Get($"{apiBaseUrl}/rooms/{room.id}");
        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogWarning($"Erreur mise à jour {room.name} : {request.error}");
            yield break;
        }

        RoomJsonItem data = JsonConvert.DeserializeObject<RoomJsonItem>(request.downloadHandler.text);
        if (data == null) yield break;

        room.status = data.status ?? "unknown";

        // Map event data from API when available
        if (data.currentEvent != null) room.currentEvent = data.currentEvent;
        if (data.nextEvent    != null) room.nextEvent    = data.nextEvent;
        if (data.scheduleToday != null && data.scheduleToday.Count > 0)
            room.scheduleToday = data.scheduleToday;

        OnRoomUpdated?.Invoke(room);
        Debug.Log($"Salle {room.name} mise à jour : {room.status}");
    }

    public void ForceRefresh()
    {
#if !UNITY_WEBGL || UNITY_EDITOR
        if (string.IsNullOrEmpty(_streamingAssetsUrl))
        {
            StartCoroutine(LoadRoomsFromDisk(
                System.IO.Path.Combine(Application.streamingAssetsPath, "rooms.json")));
            return;
        }
#endif
        string url = useLocalFallback
            ? _streamingAssetsUrl + "/rooms.json"
            : BuildApiUrl();
        StartCoroutine(LoadRoomsFromWeb(url));
    }

    public RoomData GetRoom(string id)      => rooms.Find(r => r.id == id);
    public RoomData GetRoomByName(string n) => rooms.Find(r => r.name == n);

    // ----------------------------------------------------------------- Serialization

    public string SerializeRooms()
    {
        var items = new System.Collections.Generic.List<RoomJsonPayload>();
        foreach (var r in rooms)
            items.Add(RoomJsonPayload.From(r));

        return JsonConvert.SerializeObject(new { rooms = items });
    }

    public static string SerializeRoom(RoomData r)
        => JsonConvert.SerializeObject(RoomJsonPayload.From(r));
}

// DTO used when sending data back to React
[System.Serializable]
public class RoomJsonPayload
{
    public string id;
    public string name;
    public string type;
    public int    capacity;
    public string building;
    public string floor;
    public string category;
    public string status;
    public EventData currentEvent;
    public EventData nextEvent;
    public System.Collections.Generic.List<EventData> scheduleToday;

    public static RoomJsonPayload From(RoomData r) => new RoomJsonPayload
    {
        id            = r.id,
        name          = r.name,
        type          = r.type,
        capacity      = r.capacity,
        building      = r.building,
        floor         = r.floor,
        category      = r.category,
        status        = r.status,
        currentEvent  = r.currentEvent,
        nextEvent     = r.nextEvent,
        scheduleToday = r.scheduleToday
    };
}

[System.Serializable]
public class RoomJsonRoot
{
    public string exportDate;
    public int totalRooms;
    public List<RoomJsonItem> rooms;
}

[System.Serializable]
public class RoomJsonItem
{
    public string id;
    public string code;        
    public string name;
    [JsonProperty("resource_email")] public string email;
    public string type;
    public int capacity;
    public string building;
    public int floor;          
    public string category;
    public string status;
    public List<string> features;
    public string generatedResourceName;
    // Event fields — API uses snake_case keys
    [JsonProperty("current_event")]  public EventData currentEvent;
    [JsonProperty("next_event")]     public EventData nextEvent;
    [JsonProperty("schedule_today")] public List<EventData> scheduleToday;
}