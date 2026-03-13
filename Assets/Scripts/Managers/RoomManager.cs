using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;

public class RoomManager : MonoBehaviour
{
    [Header("Configuration")]
    public string apiBaseUrl = "https://localhost/api/v1";
    public bool useLocalFallback = true;
    public float refreshInterval = 30f;

    [Header("Salles chargées (lecture seule)")]
    public List<RoomData> rooms = new List<RoomData>();

    public static event System.Action OnRoomsLoaded;
    public static event System.Action<RoomData> OnRoomUpdated;

    private string _streamingAssetsUrl = "";

    void Start() { } // Unity Web : on attend SetStreamingAssetsPath depuis React

    // Appelé par React via sendMessage après chargement
    public void SetStreamingAssetsPath(string path)
    {
        _streamingAssetsUrl = path;
        string url = useLocalFallback
            ? _streamingAssetsUrl + "/rooms.json"
            : apiBaseUrl + "/rooms";

        Debug.Log("URL tentée : " + url);
        StartCoroutine(LoadRooms(url));
    }

    IEnumerator LoadRooms(string url)
    {
        using UnityWebRequest request = UnityWebRequest.Get(url);
        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"Erreur chargement salles : {request.error}");
            yield break;
        }

        RoomJsonRoot root = JsonConvert.DeserializeObject<RoomJsonRoot>(request.downloadHandler.text);

        if (root == null || root.rooms == null)
        {
            Debug.LogError("JSON invalide ou vide !");
            yield break;
        }

        rooms.Clear();
        foreach (var data in root.rooms)
        {
            RoomData room = ScriptableObject.CreateInstance<RoomData>();
            room.id       = data.id;
            room.name     = data.name;
            room.capacity = data.capacity;
            room.type     = data.type;
            room.building = data.building;
            room.floor    = data.floor;
            room.category = data.category;
            room.status   = "unknown";
            rooms.Add(room);
        }

        Debug.Log($"{rooms.Count} salles chargées !");
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
        OnRoomUpdated?.Invoke(room);
        Debug.Log($"Salle {room.name} mise à jour : {room.status}");
    }

    public void ForceRefresh()
    {
        string url = useLocalFallback
            ? _streamingAssetsUrl + "/rooms.json"
            : apiBaseUrl + "/rooms";
        StartCoroutine(LoadRooms(url));
    }

    public RoomData GetRoom(string id)      => rooms.Find(r => r.id == id);
    public RoomData GetRoomByName(string n) => rooms.Find(r => r.name == n);
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
    public string name;
    public string email;
    public string type;
    public int capacity;
    public string building;
    public string floor;
    public string category;
    public string status;
    public List<string> features;
    public string generatedResourceName;
}