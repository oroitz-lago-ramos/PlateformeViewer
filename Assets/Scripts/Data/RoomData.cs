using UnityEngine;
using System;
using System.Collections.Generic;

public class RoomData : ScriptableObject
{
    [Header("Infos de la salle")]
    public string id;
    public new string name;
    public string type;
    public int capacity;
    public string building;
    public string floor;
    public string category;
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