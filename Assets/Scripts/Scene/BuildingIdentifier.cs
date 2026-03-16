using UnityEngine;

public class BuildingIdentifier : MonoBehaviour
{
    [SerializeField] private string _buildingName;
    public string BuildingName => _buildingName;
}
