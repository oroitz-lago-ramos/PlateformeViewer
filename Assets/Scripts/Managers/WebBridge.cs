using UnityEngine;
using System.Runtime.InteropServices;

/// <summary>
/// Thin wrapper around the JSLib functions.
/// In the editor, calls are stubbed with Debug.Log so nothing breaks.
/// </summary>
public static class WebBridge
{
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")] private static extern void SendRoomsToWeb(string json);
    [DllImport("__Internal")] private static extern void SendRoomSelectedToWeb(string json);
#else
    private static void SendRoomsToWeb(string json)        => Debug.Log($"[WebBridge] SendRoomsToWeb:\n{json}");
    private static void SendRoomSelectedToWeb(string json) => Debug.Log($"[WebBridge] SendRoomSelectedToWeb:\n{json}");
#endif

    public static void SendRooms(string json)        => SendRoomsToWeb(json);
    public static void SendRoomSelected(string json) => SendRoomSelectedToWeb(json);
}
