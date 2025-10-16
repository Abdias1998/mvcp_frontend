# Migration vers l'API Réelle

## 🎉 Changements Effectués

L'application a été migrée pour utiliser **uniquement l'API réelle** hébergée sur `https://mvcp-cellule.onrender.com` au lieu du localStorage.

### ✅ Fichiers Créés

1. **`config/api.config.ts`** - Configuration centralisée de l'API
   - URL de base : `https://mvcp-cellule.onrender.com`
   - Tous les endpoints de l'API backend
   - Timeout configuré à 30 secondes

2. **`services/httpClient.ts`** - Client HTTP réutilisable
   - Gestion automatique de l'authentification JWT
   - Gestion des timeouts
   - Gestion des erreurs HTTP
   - Méthodes: GET, POST, PUT, PATCH, DELETE

3. **`services/api.real.ts`** - Implémentation de l'API réelle
   - Toutes les fonctions API utilisant des appels HTTP
   - Remplacement complet du localStorage
   - Compatible avec la structure backend NestJS

4. **`services/index.ts`** - Point d'entrée principal
   - Export centralisé de l'API
   - Facilite les imports dans les composants

5. **`services/README_API.md`** - Documentation complète de l'API

### 🔄 Fichiers Modifiés

Tous les composants ont été mis à jour pour utiliser `api.real` :

- ✅ `App.tsx` - Suppression de la fonction de nettoyage localStorage
- ✅ `components/Dashboard.tsx`
- ✅ `components/ReportForm.tsx`
- ✅ `components/CellManagement.tsx`
- ✅ `components/GroupManagement.tsx`
- ✅ `components/DistrictManagement.tsx`
- ✅ `components/PastorManagement.tsx`
- ✅ `components/EventManagement.tsx`
- ✅ `components/ResourcesPage.tsx`
- ✅ `components/CommunicationPage.tsx`
- ✅ `components/PublicPage.tsx`
- ✅ `components/RegisterPage.tsx`
- ✅ `components/HierarchyView.tsx`
- ✅ `contexts/AuthContext.tsx`

### 🗑️ Fichiers Obsolètes

Les fichiers suivants ne sont plus utilisés mais ont été conservés pour référence :

- `services/api.ts` - Ancienne implémentation avec localStorage
- `services/apiSwitch.ts` - Système de bascule (supprimé)

## 🔌 Endpoints de l'API

### Authentication
- `POST /auth/login` - Connexion utilisateur
- `POST /auth/register` - Inscription pasteur
- `GET /auth/profile` - Profil utilisateur
- `POST /auth/reset-password` - Réinitialisation mot de passe

### Users/Pastors
- `GET /users` - Liste des utilisateurs
- `GET /users/pending` - Utilisateurs en attente d'approbation
- `POST /users/approve/:id` - Approuver un utilisateur
- `POST /users` - Créer un utilisateur
- `PUT /users/:id` - Mettre à jour un utilisateur
- `DELETE /users/:id` - Supprimer un utilisateur

### Reports
- `GET /reports` - Liste des rapports (avec filtres)
- `POST /reports` - Créer un rapport
- `DELETE /reports/:id` - Supprimer un rapport

### Cells
- `GET /cells` - Liste des cellules (avec filtres)
- `POST /cells` - Créer une cellule
- `PUT /cells/:id` - Mettre à jour une cellule
- `DELETE /cells/:id` - Supprimer une cellule

### Groups
- `GET /groups` - Liste des groupes
- `POST /groups` - Créer un groupe
- `PUT /groups/:id` - Mettre à jour un groupe
- `DELETE /groups/:id` - Supprimer un groupe

### Districts
- `GET /districts` - Liste des districts
- `POST /districts` - Créer un district
- `PUT /districts/:id` - Mettre à jour un district
- `DELETE /districts/:id` - Supprimer un district

### Events
- `GET /events` - Liste des événements
- `GET /events/public` - Événements publics
- `POST /events` - Créer un événement
- `PUT /events/:id` - Mettre à jour un événement
- `DELETE /events/:id` - Supprimer un événement

### Resources
- `GET /resources` - Liste des ressources
- `POST /resources` - Ajouter une ressource
- `DELETE /resources/:id` - Supprimer une ressource

### Communications
- `GET /communications` - Communications publiées
- `GET /communications/pending` - Communications en attente
- `GET /communications/my-proposals` - Mes propositions
- `POST /communications` - Créer une communication
- `PATCH /communications/:id` - Mettre à jour le statut
- `DELETE /communications/:id` - Supprimer une communication

### Prayer Requests
- `GET /prayer-requests` - Liste des demandes de prière
- `POST /prayer-requests` - Créer une demande
- `PATCH /prayer-requests/:id` - Mettre à jour le statut
- `DELETE /prayer-requests/:id` - Supprimer une demande

## 🔐 Authentification

L'application utilise maintenant l'authentification JWT :

1. **Connexion** : L'utilisateur se connecte via `/auth/login`
2. **Token JWT** : Le serveur renvoie un token JWT
3. **Stockage** : Le token est stocké dans `localStorage` avec les données utilisateur
4. **Requêtes** : Toutes les requêtes incluent automatiquement le token dans l'en-tête `Authorization: Bearer <token>`

### Exemple de flux d'authentification

```typescript
// 1. Connexion
const user = await api.login('adoris.ye@gmail.com', 'GOD@2020');
// Le token est automatiquement stocké

// 2. Requêtes authentifiées
const reports = await api.getReports(user, dateRange);
// Le token est automatiquement ajouté par httpClient

// 3. Déconnexion
await api.logout();
// Le token est supprimé du localStorage
```

## 🚀 Utilisation

### Démarrer l'application

```bash
npm run dev
```

L'application se connectera automatiquement à `https://mvcp-cellule.onrender.com`.

### Tester la connexion

Utilisez les identifiants suivants pour tester :

- **Email** : `adoris.ye@gmail.com`
- **Mot de passe** : `GOD@2020`

## ⚠️ Notes Importantes

### 1. Démarrage de l'API Render

L'API hébergée sur Render peut se mettre en veille après 15 minutes d'inactivité. La première requête peut prendre 30-60 secondes pour "réveiller" le serveur. C'est normal !

### 2. Gestion des erreurs

Toutes les fonctions API gèrent les erreurs et retournent :
- Des tableaux vides `[]` en cas d'erreur pour les listes
- `null` pour les objets uniques
- Lancent des exceptions pour les opérations critiques (login, etc.)

### 3. Timeout

Le timeout par défaut est de 30 secondes. Si l'API est lente, vous pouvez l'augmenter dans `config/api.config.ts` :

```typescript
export const API_CONFIG = {
  TIMEOUT: 60000, // 60 secondes
  // ...
};
```

### 4. CORS

Assurez-vous que l'API backend autorise les requêtes depuis votre domaine frontend.

## 🐛 Débogage

### Vérifier les requêtes réseau

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet **Network**
3. Filtrez par **Fetch/XHR**
4. Vérifiez les requêtes vers `mvcp-cellule.onrender.com`

### Logs de la console

L'application affiche automatiquement le mode API au chargement :
```
🌐 Mode API: API Réelle (https://mvcp-cellule.onrender.com)
```

### Erreurs courantes

#### 502 Bad Gateway
- **Cause** : L'API Render est en veille
- **Solution** : Attendez 30-60 secondes et réessayez

#### 401 Unauthorized
- **Cause** : Token JWT expiré ou invalide
- **Solution** : Déconnectez-vous et reconnectez-vous

#### Timeout
- **Cause** : L'API met trop de temps à répondre
- **Solution** : Augmentez le timeout dans `api.config.ts`

#### CORS Error
- **Cause** : L'API n'autorise pas les requêtes depuis votre domaine
- **Solution** : Vérifiez la configuration CORS du backend

## 📝 Prochaines Étapes

1. ✅ Migration vers l'API réelle - **TERMINÉ**
2. ⏳ Tester tous les endpoints
3. ⏳ Gérer les cas d'erreur spécifiques
4. ⏳ Ajouter un système de cache pour améliorer les performances
5. ⏳ Implémenter le rafraîchissement automatique du token JWT

## 📞 Support

Pour toute question ou problème :
1. Vérifiez d'abord les logs de la console
2. Consultez `services/README_API.md`
3. Vérifiez que l'API backend est en ligne
4. Contactez l'équipe de développement

---

**Date de migration** : 15 octobre 2025  
**Version** : 2.0.0  
**Statut** : ✅ Migration complète
