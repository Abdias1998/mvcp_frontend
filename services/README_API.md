# Guide d'utilisation de l'API

## 📋 Vue d'ensemble

Ce projet supporte deux modes d'API :
- **API Réelle** : Connexion à `https://mvcp-cellule.onrender.com`
- **API Locale** : Stockage des données dans le localStorage du navigateur (pour le développement)

## 🔄 Basculer entre les modes

### Méthode 1 : Fichier de configuration (Recommandé)

Éditez le fichier `services/apiSwitch.ts` :

```typescript
// Pour utiliser l'API réelle
export const USE_REAL_API = true;

// Pour utiliser l'API locale
export const USE_REAL_API = false;
```

### Méthode 2 : Variable d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Pour l'API réelle
VITE_USE_REAL_API=true

# Pour l'API locale
VITE_USE_REAL_API=false
```

## 📁 Structure des fichiers

```
services/
├── api.ts              # API locale (localStorage)
├── api.real.ts         # API réelle (HTTP)
├── apiSwitch.ts        # Configuration du mode
├── httpClient.ts       # Client HTTP pour l'API réelle
└── README_API.md       # Ce fichier

config/
└── api.config.ts       # Configuration des endpoints
```

## 🔌 Utilisation dans les composants

### Import standard

```typescript
import { api } from '../services/apiSwitch';

// Utiliser l'API normalement
const reports = await api.getReports(user, dateRange);
```

### Vérifier le mode actuel

```typescript
import { getApiMode, logApiMode } from '../services/apiSwitch';

// Afficher le mode dans la console
logApiMode(); // 🌐 Mode API: API Réelle ou 💾 Mode API: API Locale

// Obtenir le mode programmatiquement
const mode = getApiMode(); // 'real' ou 'local'
```

## 🌐 Configuration de l'API réelle

### Endpoints disponibles

Tous les endpoints sont définis dans `config/api.config.ts` :

- **Authentication** : `/api/auth/login`, `/api/auth/register`, etc.
- **Users** : `/api/users`, `/api/users/pending`, etc.
- **Reports** : `/api/reports`
- **Cells** : `/api/cells`
- **Groups** : `/api/groups`
- **Districts** : `/api/districts`
- **Events** : `/api/events`
- **Resources** : `/api/resources`
- **Communications** : `/api/communications`
- **Prayer Requests** : `/api/prayer-requests`

### Modifier l'URL de base

Éditez `config/api.config.ts` :

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://votre-api.com', // Changez ici
  TIMEOUT: 30000,
  // ...
};
```

## 🔐 Authentification

L'API réelle utilise un système de tokens JWT :

1. Lors de la connexion, le token est reçu et stocké dans le localStorage
2. Toutes les requêtes suivantes incluent automatiquement le token dans l'en-tête `Authorization: Bearer <token>`
3. Le client HTTP (`httpClient.ts`) gère automatiquement l'ajout du token

## 🛠️ Client HTTP

Le fichier `httpClient.ts` fournit une classe `HttpClient` avec :

- **Gestion des timeouts** : 30 secondes par défaut
- **Gestion des erreurs** : Erreurs HTTP typées
- **Authentification automatique** : Ajout du token JWT
- **Méthodes HTTP** : GET, POST, PUT, PATCH, DELETE

### Exemple d'utilisation directe

```typescript
import { httpClient } from '../services/httpClient';

// GET request
const data = await httpClient.get('/api/users');

// POST request
const newUser = await httpClient.post('/api/users', { name: 'John' });

// PUT request
await httpClient.put('/api/users/123', { name: 'Jane' });

// DELETE request
await httpClient.delete('/api/users/123');
```

## 🐛 Débogage

### Vérifier les requêtes réseau

Ouvrez les DevTools du navigateur (F12) :
1. Allez dans l'onglet **Network**
2. Filtrez par **XHR** ou **Fetch**
3. Vérifiez les requêtes vers `mvcp-cellule.onrender.com`

### Logs de la console

Le mode API est automatiquement affiché dans la console au chargement :
- 🌐 Mode API: API Réelle
- 💾 Mode API: API Locale

### Erreurs courantes

#### 502 Bad Gateway
L'API Render peut être en veille. Attendez quelques secondes et réessayez.

#### CORS Error
Vérifiez que l'API autorise les requêtes depuis votre domaine.

#### Timeout
Augmentez le timeout dans `config/api.config.ts` :

```typescript
export const API_CONFIG = {
  TIMEOUT: 60000, // 60 secondes
  // ...
};
```

## 📝 Migration de l'API locale vers l'API réelle

### Étape 1 : Tester l'API réelle

1. Changez `USE_REAL_API` à `true` dans `apiSwitch.ts`
2. Rechargez l'application
3. Vérifiez que la connexion fonctionne

### Étape 2 : Vérifier les endpoints

Assurez-vous que tous les endpoints de l'API réelle correspondent à ceux définis dans `api.config.ts`.

### Étape 3 : Adapter les réponses

Si la structure des réponses de l'API réelle diffère, modifiez `api.real.ts` en conséquence.

## 🔄 Retour à l'API locale

Si vous rencontrez des problèmes avec l'API réelle :

1. Changez `USE_REAL_API` à `false` dans `apiSwitch.ts`
2. Rechargez l'application
3. Les données seront à nouveau stockées localement

## 📞 Support

Pour toute question ou problème :
- Vérifiez d'abord les logs de la console
- Consultez la documentation de l'API backend
- Contactez l'équipe de développement
