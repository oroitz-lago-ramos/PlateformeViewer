using System;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Generates deterministic mock event data for a RoomData ScriptableObject.
/// Uses the room id as a seed so each room always gets the same schedule.
/// </summary>
public static class MockRoomDataGenerator
{
    private static readonly string[] ConferenceTitles = {
        "Cours Python", "Atelier React", "Réunion équipe", "Workshop IA",
        "Sprint review", "Conférence DevOps", "Formation Unity", "Atelier design",
        "Présentation projet", "Stand-up quotidien", "Cours algorithmique",
        "Hackathon session", "Suivi pédagogique", "Réunion direction"
    };

    private static readonly string[] OpenSpaceTitles = {
        "Travail libre", "Open coding", "Session collaborative",
        "Coworking", "Travail en autonomie"
    };

    private static readonly string[] Organizers = {
        "Alice Martin", "Bruno Leclerc", "Clara Dupont", "David Moreau",
        "Emma Bernard", "François Petit", "Giulia Rossi", "Hugo Lambert"
    };

    // Fixed time slots for the day (start, end) in hours
    private static readonly (int startH, int startM, int endH, int endM)[] Slots =
    {
        (8,  30, 10, 30),
        (10, 45, 12, 45),
        (14,  0, 16,  0),
        (16, 15, 18, 15),
    };

    public static void Populate(RoomData room)
    {
        int seed = GetSeed(room.id);
        var rng  = new System.Random(seed);

        bool isOpenSpace = room.category == "OTHER";
        string[] titles = isOpenSpace ? OpenSpaceTitles : ConferenceTitles;

        var schedule = new List<EventData>();
        foreach (var slot in Slots)
        {
            bool hasEvent = isOpenSpace || rng.NextDouble() > 0.35;
            if (!hasEvent) continue;

            schedule.Add(new EventData
            {
                title     = titles[rng.Next(titles.Length)],
                start     = $"{slot.startH:D2}:{slot.startM:D2}",
                end       = $"{slot.endH:D2}:{slot.endM:D2}",
                organizer = Organizers[rng.Next(Organizers.Length)]
            });
        }

        room.scheduleToday = schedule;
        room.currentEvent  = GetCurrentEvent(schedule);
        room.nextEvent     = GetNextEvent(schedule);
        room.status        = ComputeStatus(room.currentEvent, room.nextEvent);
    }

    // ----------------------------------------------------------------- Helpers

    static EventData GetCurrentEvent(List<EventData> schedule)
    {
        var now = DateTime.Now;
        foreach (var ev in schedule)
        {
            if (ParseTime(ev.start) <= now && now < ParseTime(ev.end))
                return ev;
        }
        return null;
    }

    static EventData GetNextEvent(List<EventData> schedule)
    {
        var now = DateTime.Now;
        EventData next = null;
        DateTime nextTime = DateTime.MaxValue;

        foreach (var ev in schedule)
        {
            DateTime start = ParseTime(ev.start);
            if (start > now && start < nextTime)
            {
                next     = ev;
                nextTime = start;
            }
        }
        return next;
    }

    static string ComputeStatus(EventData current, EventData next)
    {
        if (current != null) return "occupied";

        if (next != null)
        {
            DateTime start = ParseTime(next.start);
            if ((start - DateTime.Now).TotalMinutes <= 30)
                return "soon";
        }

        return "available";
    }

    static DateTime ParseTime(string hhmm)
    {
        var parts = hhmm.Split(':');
        var today = DateTime.Today;
        return new DateTime(today.Year, today.Month, today.Day,
                            int.Parse(parts[0]), int.Parse(parts[1]), 0);
    }

    static int GetSeed(string id)
    {
        int hash = 17;
        foreach (char c in id)
            hash = hash * 31 + c;
        return hash;
    }
}
