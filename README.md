# PlateformeViewer

Viewer 3D interactif pour visualiser l'occupation des salles du Dock des Suds — La Plateforme (Marseille).

Construit avec **Unity 6 (URP / WebGL)** intégré dans **React + TypeScript**. Clic sur une salle → panneau d'informations avec statut et planning du jour. Outline au survol, refresh automatique toutes les 30 secondes.

---

## Fonctionnalités

- 🖱️ Clic sur une salle → nom, statut, capacité, planning du jour
- 🔵 Outline au survol des salles cliquables
- 🟢 Coloration selon le statut : libre / occupé / bientôt libre
- 🔄 Refresh automatique toutes les 30 secondes
- 📐 Architecture modulaire — réutilisable pour tout autre bâtiment

---

## Stack

| | |
|--|--|
| Moteur 3D | Unity 6 (URP) |
| Interface web | React + TypeScript |
| Bridge Unity↔Web | react-unity-webgl + JSLib |
| JSON | Newtonsoft JSON |
| Modèle 3D | Blender |

---

## Installation

### Prérequis

- Unity 6 avec le module **WebGL Build Support**
- Node.js 18+

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/<orga>/PlateformeViewer.git

# 2. Installer les dépendances React
cd WebClient && npm install

# 3. Lancer l'application
npm run dev
```

> Le build WebGL doit être présent dans `WebClient/public/UnityBuild/`.
> Pour le générer : Unity → **File → Build Profiles → Web → Build** → choisir `WebClient/public/UnityBuild` comme destination.

---