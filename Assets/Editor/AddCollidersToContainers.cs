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
        }

        Debug.Log($"{count} colliders ajoutés !");
        EditorUtility.SetDirty(root);
    }
}