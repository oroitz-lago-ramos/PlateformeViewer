using UnityEngine;
using System;
using System.Collections.Generic;

[CreateAssetMenu(fileName = "RoomData", menuName = "PlatformeViewer/Room")]
public class RoomData : ScriptableObject
{
    [Header("Infos de la salle")]
    public string code;
    public string roomName;
    public int capacity;
    public string type;
    public string status;

    [Header("Événements")]
    public EventData currentEvent;
    public EventData nextEvent;
    public List<EventData> scheduleToday;
}

[Serializable]
public class EventData
{
    public string title;
    public string start;
    public string end;
    public string organizer;
}