using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.Networking;

public class RoomManager : MonoBehaviour
{
    [Header("Configuration API")]
    public string apiBaseUrl = "https://localhost/api/v1";

    [Header("Salles")]
    public List<RoomData> rooms = new List<RoomData>();

    [Header("Mise à jour")]
    public bool autoRefresh = true;
    public float refreshInterval = 30f;

    void Start()
    {
        if (autoRefresh)
            InvokeRepeating(nameof(FetchAllRooms), 0f, refreshInterval);
    }

    public void FetchAllRooms()
    {
        foreach (RoomData room in rooms)
            StartCoroutine(FetchRoom(room));
    }

    private IEnumerator FetchRoom(RoomData room)
    {
        string url = $"{apiBaseUrl}/rooms/{room.code}";

        using UnityWebRequest request = UnityWebRequest.Get(url);
        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogWarning($"[RoomManager] Erreur pour {room.code} : {request.error}");
            yield break;
        }

        try
        {
            RoomApiResponse response = JsonUtility.FromJson<RoomApiResponse>(request.downloadHandler.text);
            ApplyData(room, response);
        }
        catch
        {
            Debug.LogWarning($"[RoomManager] JSON invalide pour {room.code}");
        }
    }

    private void ApplyData(RoomData room, RoomApiResponse data)
    {
        room.roomName  = data.room.name;
        room.capacity  = data.room.capacity;
        room.type      = data.room.type;
        room.status    = data.room.status;

        room.currentEvent = data.room.current_event;
        room.nextEvent    = data.room.next_event;
        room.scheduleToday = new List<EventData>(data.room.schedule_today);

        Debug.Log($"[RoomManager] Salle {room.code} mise à jour : {room.status}");
    }
}

[System.Serializable]
public class RoomApiResponse
{
    public string timestamp;
    public RoomApiData room;
}

[System.Serializable]
public class RoomApiData
{
    public string code;
    public string name;
    public int capacity;
    public string type;
    public string status;
    public EventData current_event;
    public EventData next_event;
    public EventData[] schedule_today;
}