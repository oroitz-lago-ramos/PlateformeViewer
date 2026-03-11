using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;

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

    void Start()
    {
        StartCoroutine(LoadRooms());
    }

    IEnumerator LoadRooms()
    {
        string url = useLocalFallback
            ? "file://" + Application.streamingAssetsPath + "/rooms.json"
            : apiBaseUrl + "/rooms";

        using UnityWebRequest request = UnityWebRequest.Get(url);
        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"Erreur chargement salles : {request.error}");
            yield break;
        }

        RoomJsonRoot root = JsonUtility.FromJson<RoomJsonRoot>(request.downloadHandler.text);

        if (root == null || root.rooms == null)
        {
            Debug.LogError("JSON invalide ou vide !");
            yield break;
        }

        rooms.Clear();
        foreach (var data in root.rooms)
        {
            RoomData room = ScriptableObject.CreateInstance<RoomData>();
            room.id = data.id;
            room.name = data.name;
            room.capacity = data.capacity;
            room.type = data.type;
            room.building = data.building;
            room.floor = data.floor;
            room.category = data.category;
            room.status = "unknown";
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

        JsonUtility.FromJsonOverwrite(request.downloadHandler.text, room);
        OnRoomUpdated?.Invoke(room);
        Debug.Log($"Salle {room.name} mise à jour : {room.status}");
    }

    public RoomData GetRoom(string id)
    {
        return rooms.Find(r => r.id == id);
    }
}

[System.Serializable]
public class RoomJsonRoot
{
    public string exportDate;
    public int totalRooms;
    public RoomJsonItem[] rooms;
}

[System.Serializable]
public class RoomJsonItem
{
    public string id;
    public string name;
    public string type;
    public int capacity;
    public string building;
    public string floor;
    public string category;
}