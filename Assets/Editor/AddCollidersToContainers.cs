using UnityEngine;
using UnityEditor;

public class AddCollidersToContainers : EditorWindow
{
    [MenuItem("Tools/PlateformeViewer/Add Colliders to Containers")]
    public static void AddColliders()
    {
        GameObject root = GameObject.Find("DockDesSudsLPTFRM");
        if (root == null)
        {
            Debug.LogError("Objet 'DockDesSudsLPTFRM' introuvable dans la scène !");
            return;
        }

        GameObject canvasPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/Rooms/ContainerCanvas.prefab");
        if (canvasPrefab == null)
            Debug.LogWarning("Prefab 'ConainerCanvas' introuvable dans Assets/Prefabs/Rooms/");

        int count = 0;
        foreach (Transform child in root.transform)
        {
            string name = child.name;
            if (!name.Contains("Container")) continue;

            // Ajoute Mesh Collider si pas déjà présent
            if (child.GetComponent<Collider>() == null)
            {
                MeshFilter mf = child.GetComponent<MeshFilter>();
                if (mf != null)
                {
                    MeshCollider mc = child.gameObject.AddComponent<MeshCollider>();
                    mc.sharedMesh = mf.sharedMesh;
                    count++;
                }
            }

            // Ajoute RoomIdentifier si pas déjà présent
            if (child.GetComponent<RoomIdentifier>() == null)
                child.gameObject.AddComponent<RoomIdentifier>();

            // Ajoute Outline si pas déjà présent (désactivé par défaut)
            if (child.GetComponent<Outline>() == null)
            {
                Outline outline = child.gameObject.AddComponent<Outline>();
                outline.enabled = false;
            }

            // Instancie le prefab ConainerCanvas si pas déjà présent
            if (canvasPrefab != null && child.Find(canvasPrefab.name) == null)
            {
                GameObject canvas = (GameObject)PrefabUtility.InstantiatePrefab(canvasPrefab, child);
                canvas.transform.localPosition = Vector3.zero;
                canvas.transform.localRotation = Quaternion.identity;
                EditorUtility.SetDirty(child.gameObject);
            }
        }

        Debug.Log($"{count} colliders ajoutés !");
        EditorUtility.SetDirty(root);
    }
}