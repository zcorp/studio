# FaceGroup UI

Interface de gestion de regroupements de profils extraits de vidéos (visages + textes), avec validation/correction humaine des regroupements SIFT.

---

## 🚀 Démarrage rapide

```bash
chmod +x start.sh
./start.sh
```

Puis ouvrir : **http://localhost:5173**

---

## 🧱 Stack

| Outil | Rôle |
|---|---|
| Vue 3 (Composition API) | Framework UI |
| Vite | Bundler & dev server |
| Pinia | State management |
| Vue Router | Navigation SPA |
| TailwindCSS | Styles utilitaires |
| vuedraggable | Drag & drop |
| YouTube IFrame API | Lecteur vidéo |
| Axios | Appels API |
| Docker + Compose | Conteneurisation |

---

## 🗂 Structure

```
src/
├── assets/          # CSS global (Tailwind)
├── components/      # Composants réutilisables
│   ├── Toolbar.vue          — barre d'outils principale
│   ├── WorkList.vue         — liste des œuvres (gauche)
│   ├── WorkItem.vue         — item d'une œuvre
│   ├── VideoPlayer.vue      — lecteur YouTube (3 états)
│   ├── ViewerPanel.vue      — grille de frames + profils
│   ├── GroupList.vue        — colonne droite (tous les groupes)
│   ├── GroupColumn.vue      — un groupe + drag & drop
│   ├── ProfileCard.vue      — carte profil (sélection, tag, etc.)
│   ├── TextPanel.vue        — affichage textes détectés
│   └── ShortcutsModal.vue   — modale des raccourcis
├── composables/
│   └── useKeyboard.js       — raccourcis clavier globaux
├── router/
│   └── index.js
├── services/
│   └── api.js               — API mock + axios (switcher USE_MOCK)
├── stores/
│   ├── useWorkStore.js      — œuvres + sélection
│   ├── useGroupStore.js     — groupes + undo/redo
│   ├── useProfileStore.js   — profils + sélection + comparaison
│   └── usePlayerStore.js    — état lecteur YouTube
└── views/
    └── WorkspaceView.vue    — page principale (layout 3 colonnes)
```

---

## 🔌 Connecter un vrai backend

1. Dans `src/services/api.js`, passer `USE_MOCK = false`
2. Définir `VITE_API_URL` dans un fichier `.env` :
   ```
   VITE_API_URL=http://mon-backend:8000/api
   ```
3. Endpoints attendus :
   - `GET /works`
   - `GET /works/:id`
   - `GET /profiles?workId=`
   - `GET /groups?workId=`
   - `POST /groups`
   - `PUT /profiles/:id`
   - `DELETE /groups/:id`

---

## ⌨️ Raccourcis clavier

| Raccourci | Action |
|---|---|
| `Espace` | Play / Pause |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Rétablir |
| `Échap` | Désélectionner tout |
| `Ctrl+Clic` | Sélection multiple |
| `Double-clic` (nom) | Renommer profil ou groupe |

---

## 🐳 Développement local (sans Docker)

```bash
npm install
npm run dev
```

Accessible sur : http://localhost:5173
