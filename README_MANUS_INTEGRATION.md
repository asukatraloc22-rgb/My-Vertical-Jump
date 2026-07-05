# Intégration Manus AI - Générateur de Workouts Personnalisés

## 📋 Vue d'ensemble

Cette intégration ajoute une fonctionnalité de **génération de workouts personnalisés en temps réel** à votre application "PG Flight & IQ Suite". L'IA Manus analyse vos besoins spécifiques (énergie, temps disponible, blocages, format solo/équipe) et génère un programme d'entraînement sur-mesure.

## 🎯 Fonctionnalités ajoutées

### 1. **Générateur de Workouts IA** (Section "Cerveau IA")
- **Paramètres d'entrée** :
  - Niveau d'énergie (1-10)
  - Temps disponible (minutes)
  - Format : Solo ou En Équipe
  - Description détaillée de vos besoins/blocages

- **Sortie** :
  - Workout personnalisé avec échauffement, bloc principal et finition
  - Format lisible et modifiable
  - Sauvegarde en favoris pour réutilisation

### 2. **Sauvegarde et Gestion des Favoris**
- Sauvegardez vos workouts générés
- Modifiez et mettez à jour vos séances
- Accédez facilement à vos favoris dans l'onglet "Routines & Planner"

### 3. **Architecture Backend**
- Serveur FastAPI qui sert de proxy à l'API LLM Manus
- Validation des paramètres côté serveur
- Gestion sécurisée des clés API

## 🚀 Installation et Déploiement

### Prérequis
- Python 3.8+
- pip ou uv

### Étape 1 : Installer les dépendances

```bash
cd My-Vertical-Jump
pip install -r requirements.txt
# ou avec uv
uv pip install -r requirements.txt
```

### Étape 2 : Lancer le serveur backend

```bash
python api_server.py
```

Le serveur démarre sur `http://localhost:8000`

Vous pouvez vérifier son fonctionnement :
```bash
curl http://localhost:8000/health
```

Réponse attendue :
```json
{"status": "ok", "message": "API Workout Generator is running"}
```

### Étape 3 : Servir l'application web

Ouvrez `index.html` dans votre navigateur ou utilisez un serveur web local :

```bash
# Avec Python
python -m http.server 8080

# Ou avec Node.js
npx http-server
```

Accédez à l'application sur `http://localhost:8080`

## 📝 Utilisation

### Générer un Workout

1. Allez à l'onglet **"🧠 Cerveau IA (Manus API)"**
2. Remplissez les paramètres :
   - **Énergie** : Évaluez votre niveau d'énergie (1 = très fatigué, 10 = frais)
   - **Temps dispo** : Durée disponible pour l'entraînement
   - **Format** : Solo (travail personnel) ou En Équipe (avec coéquipiers)
   - **Besoins & Blocages** : Décrivez vos objectifs et limitations
     - Exemple : "J'ai les jambes lourdes. Je veux travailler mon tir en sortie d'écran et mon pace control"
3. Cliquez sur **"✨ Générer mon Workout"**
4. Attendez la génération (quelques secondes)
5. Modifiez le workout si nécessaire
6. Cliquez sur **"⭐ Sauvegarder dans mes Favoris"** pour conserver la séance

### Accéder à vos Favoris

1. Allez à l'onglet **"💪 Routines & Planner"**
2. Descendez à la section **"⭐ Mes Workouts Favoris (IA)"**
3. Cliquez sur un workout pour voir son contenu
4. Modifiez ou supprimez selon vos besoins

## 🔧 Architecture Technique

### Structure des fichiers

```
My-Vertical-Jump/
├── index.html                    # Interface web
├── app.js                        # Logique JavaScript (modifiée)
├── style.css                     # Styles
├── api_server.py                 # Serveur FastAPI (NOUVEAU)
├── requirements.txt              # Dépendances Python (NOUVEAU)
├── sw.js                         # Service Worker
├── manifest.json                 # PWA Manifest
└── README_MANUS_INTEGRATION.md   # Cette documentation
```

### Flux de communication

```
Frontend (index.html)
    ↓ (fetch POST /generate-workout)
Backend (api_server.py)
    ↓ (appel OpenAI)
API LLM Manus
    ↓ (réponse)
Backend (api_server.py)
    ↓ (réponse JSON)
Frontend (affichage du workout)
```

### Endpoints API

#### POST /generate-workout
Génère un workout personnalisé

**Requête** :
```json
{
  "energy": 7,
  "time": 45,
  "needs": "Focus sur le tir en sortie d'écran",
  "format": "solo"
}
```

**Réponse** :
```json
{
  "success": true,
  "workout": "ÉCHAUFFEMENT:\n- 5 min mobilité...",
  "metadata": {
    "energy": 7,
    "time": 45,
    "format": "solo",
    "model": "gpt-5-mini"
  }
}
```

#### GET /health
Vérification de l'état du serveur

#### GET /models
Liste les modèles LLM disponibles

## 🔐 Sécurité

- **Pas de clé API exposée** : Les clés sont gérées côté serveur
- **Validation des paramètres** : Tous les inputs sont validés
- **CORS configuré** : Autorise les requêtes depuis votre application
- **Gestion des erreurs** : Messages d'erreur clairs et informatifs

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Vérifiez que Python est installé
python --version

# Vérifiez que les dépendances sont installées
pip list | grep fastapi

# Vérifiez que le port 8000 est libre
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows
```

### "Erreur : Impossible de se connecter au serveur"

1. Assurez-vous que le serveur backend est en cours d'exécution
2. Vérifiez que vous utilisez `http://localhost:8000` (pas https)
3. Vérifiez les logs du serveur pour les erreurs

### Les workouts ne se génèrent pas

1. Vérifiez que vous avez rempli le champ "Besoins & Blocages"
2. Vérifiez les logs du serveur pour les erreurs API
3. Assurez-vous que les variables d'environnement `OPENAI_API_KEY` et `OPENAI_API_BASE` sont configurées

## 📊 Modifications apportées

### Fichiers modifiés

**index.html**
- Suppression du champ "Clé API Manus" (plus nécessaire)
- Ajout du sélecteur "Format du Workout" (Solo/Équipe)

**app.js**
- Remplacement de la fonction `askManusIA()` pour appeler le serveur backend
- Suppression de la fonction `saveApiKey()`
- Suppression de la récupération de la clé API au démarrage

### Fichiers créés

- `api_server.py` : Serveur FastAPI pour l'intégration Manus
- `requirements.txt` : Dépendances Python
- `README_MANUS_INTEGRATION.md` : Cette documentation

## 🚀 Déploiement en Production

Pour déployer en production :

1. **Configurez les variables d'environnement** :
   ```bash
   export OPENAI_API_KEY=your_key_here
   export OPENAI_API_BASE=your_base_url
   ```

2. **Utilisez un serveur WSGI** (Gunicorn) :
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 api_server:app
   ```

3. **Configurez CORS pour votre domaine** :
   Modifiez `api_server.py` ligne 13 :
   ```python
   allow_origins=["https://votredomaine.com"],
   ```

4. **Utilisez HTTPS** pour les communications sécurisées

## 📞 Support

Pour toute question ou problème :
- Consultez les logs du serveur
- Vérifiez la console du navigateur (F12)
- Assurez-vous que tous les paramètres sont correctement remplis

## 📄 Licence

Cette intégration fait partie du projet "PG Flight & IQ Suite".

---

**Version** : 1.0  
**Date** : 2024  
**Statut** : Production Ready ✅
