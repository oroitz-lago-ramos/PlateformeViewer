using UnityEngine;
using System.Collections.Generic;

public class RoomClickHandler : MonoBehaviour
{
    [Header("Références")]
    public RoomManager roomManager;
    public Camera mainCamera;

    [Header("Mapping Container → RoomData")]
    public List<RoomMapping> roomMappings = new List<RoomMapping>();

    void Start()
    {
        if (mainCamera == null)
            mainCamera = Camera.main;
    }

    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            Ray ray = mainCamera.ScreenPointToRay(Input.mousePosition);
            if (Physics.Raycast(ray, out RaycastHit hit))
            {
                RoomData room = GetRoomFromHit(hit.collider.gameObject);
                if (room != null)
                {
                    Debug.Log($"Salle cliquée : {room.name} — Statut : {room.status}");
                    // on gère l'affichage du panneau UI ici
                }
            }
        }
    }

    RoomData GetRoomFromHit(GameObject hitObject)
    {
        foreach (var mapping in roomMappings)
        {
            if (mapping.containerObject == hitObject)
                return mapping.roomData;
        }
        return null;
    }
}

[System.Serializable]
public class RoomMapping
{
    public GameObject containerObject;
    public RoomData roomData;
}