# 📖 Guide d'Utilisation - Application MVCP

## 🚀 Démarrage Rapide

### 1. Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur **http://localhost:3001**

### 2. Première Connexion

Utilisez les identifiants suivants pour vous connecter :

- **Email** : `adoris.ye@gmail.com`
- **Mot de passe** : `GOD@2020`
- **Rôle** : Coordinateur National

## 🔌 Connexion à l'API

L'application se connecte automatiquement à l'API hébergée sur **https://mvcp-cellule.onrender.com**.

### ⏱️ Temps de Démarrage

**Important** : L'API Render peut se mettre en veille après 15 minutes d'inactivité.

- **Première requête** : Peut prendre 30-60 secondes
- **Requêtes suivantes** : Rapides (< 1 seconde)

Un message de chargement s'affichera automatiquement pendant le réveil de l'API.

## 📱 Fonctionnalités Principales

### 1. Gestion des Rapports

#### Soumettre un Rapport
1. Cliquez sur **"Rapport"** dans le menu
2. Remplissez le formulaire :
   - Date de la cellule
   - Nombre de participants
   - Nouveaux convertis
   - Témoignages
   - Besoins de prière
3. Cliquez sur **"Soumettre le rapport"**

#### Consulter les Rapports
1. Allez dans **"Tableau de bord"**
2. Sélectionnez la période (semaine, mois, trimestre)
3. Les rapports s'affichent avec statistiques

### 2. Gestion des Cellules

#### Créer une Cellule
1. Allez dans **"Gestion" > "Cellules"**
2. Cliquez sur **"Ajouter une cellule"**
3. Remplissez les informations :
   - Nom de la cellule
   - Région
   - Groupe
   - District
   - Responsable
   - Jour et heure de réunion
4. Cliquez sur **"Enregistrer"**

#### Modifier/Supprimer une Cellule
1. Trouvez la cellule dans la liste
2. Cliquez sur **"Modifier"** ou **"Supprimer"**
3. Confirmez l'action

### 3. Gestion des Pasteurs

#### Approuver un Pasteur (Coordinateur uniquement)
1. Allez dans **"Gestion" > "Pasteurs"**
2. Onglet **"En attente d'approbation"**
3. Cliquez sur **"Approuver"** pour le pasteur souhaité

#### Ajouter un Pasteur
1. Allez dans **"Gestion" > "Pasteurs"**
2. Cliquez sur **"Ajouter un pasteur"**
3. Remplissez le formulaire
4. Cliquez sur **"Enregistrer"**

### 4. Gestion des Événements

#### Créer un Événement
1. Allez dans **"Gestion" > "Événements"**
2. Cliquez sur **"Ajouter un événement"**
3. Remplissez :
   - Titre
   - Description
   - Date et heure
   - Lieu
   - Visibilité (Public/Privé)
4. Cliquez sur **"Enregistrer"**

### 5. Communications

#### Proposer une Communication
1. Allez dans **"Communications"**
2. Cliquez sur **"Nouvelle communication"**
3. Rédigez votre message
4. Sélectionnez la cible (Global/Région)
5. Cliquez sur **"Soumettre"**

**Note** : Les communications doivent être approuvées par le Coordinateur National avant publication.

#### Approuver une Communication (Coordinateur uniquement)
1. Allez dans **"Communications"**
2. Onglet **"En attente"**
3. Cliquez sur **"Approuver"** ou **"Rejeter"**

### 6. Ressources

#### Ajouter une Ressource
1. Allez dans **"Ressources"**
2. Cliquez sur **"Ajouter une ressource"**
3. Remplissez :
   - Titre
   - Description
   - Type (Document, Vidéo, Audio, Lien)
   - URL ou fichier
4. Cliquez sur **"Enregistrer"**

## 🎯 Rôles et Permissions

### Coordinateur National
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Approuver les pasteurs
- ✅ Approuver les communications
- ✅ Voir tous les rapports du pays
- ✅ Gérer tous les groupes, districts et cellules

### Pasteur Régional
- ✅ Voir les rapports de sa région
- ✅ Gérer les groupes et districts de sa région
- ✅ Gérer les cellules de sa région
- ✅ Proposer des communications
- ❌ Approuver les pasteurs
- ❌ Approuver les communications

### Pasteur de Groupe
- ✅ Voir les rapports de son groupe
- ✅ Gérer les districts de son groupe
- ✅ Gérer les cellules de son groupe
- ✅ Proposer des communications
- ❌ Gérer les groupes
- ❌ Approuver les pasteurs

### Pasteur de District
- ✅ Voir les rapports de son district
- ✅ Gérer les cellules de son district
- ✅ Proposer des communications
- ❌ Gérer les districts
- ❌ Gérer les groupes

## 🛠️ Fonctionnalités Avancées

### Hooks Personnalisés

#### useApi - Gérer les appels API avec état

```typescript
import { useApi } from '../hooks/useApi';
import { api } from '../services/api.real';

function MyComponent() {
  const { data, loading, error, execute } = useApi(api.getReports);
  
  useEffect(() => {
    execute(user, dateRange);
  }, []);
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  
  return <div>{/* Afficher les données */}</div>;
}
```

#### useApiMultiple - Appels API parallèles

```typescript
import { useApiMultiple } from '../hooks/useApi';

function MyComponent() {
  const { execute, loading, errors } = useApiMultiple();
  
  useEffect(() => {
    const loadData = async () => {
      const [reports, cells] = await execute([
        () => api.getReports(user, dateRange),
        () => api.getCellsForUser(user),
      ]);
    };
    
    loadData();
  }, []);
}
```

### Composants Utilitaires

#### ApiStatus - Vérifier l'état de l'API

```typescript
import ApiStatus from '../components/ApiStatus';

function App() {
  return (
    <>
      <ApiStatus onReady={() => console.log('API prête !')} />
      {/* Reste de l'application */}
    </>
  );
}
```

#### ConnectionIndicator - Indicateur de connexion

```typescript
import ConnectionIndicator from '../components/ConnectionIndicator';

function App() {
  return (
    <>
      <ConnectionIndicator />
      {/* Reste de l'application */}
    </>
  );
}
```

### Messages d'Erreur Standardisés

```typescript
import { getErrorMessage, ERROR_MESSAGES } from '../constants/messages';

try {
  await api.submitReport(reportData);
} catch (error) {
  const message = getErrorMessage(error);
  showToast(message, 'error');
}
```

## 🐛 Résolution des Problèmes

### Problème : "Impossible de se connecter à l'API"

**Solutions** :
1. Vérifiez votre connexion internet
2. Attendez 60 secondes (l'API peut être en train de se réveiller)
3. Actualisez la page (F5)
4. Vérifiez que l'API est en ligne : https://mvcp-cellule.onrender.com

### Problème : "Session expirée"

**Solutions** :
1. Déconnectez-vous
2. Reconnectez-vous avec vos identifiants
3. Le nouveau token sera automatiquement enregistré

### Problème : "Requête trop lente"

**Causes possibles** :
- L'API Render était en veille (normal pour la première requête)
- Connexion internet lente
- Serveur surchargé

**Solutions** :
1. Attendez la fin de la requête
2. Si le timeout se produit, réessayez
3. Vérifiez votre connexion internet

### Problème : "Erreur 502 ou 503"

**Cause** : L'API Render est en train de démarrer

**Solution** : Attendez 30-60 secondes et réessayez automatiquement

## 📊 Statistiques et Rapports

### Tableau de Bord

Le tableau de bord affiche :
- **Statistiques globales** : Total participants, conversions, baptêmes
- **Graphiques** : Évolution dans le temps
- **Rapports récents** : Liste des derniers rapports
- **Cellules actives** : Nombre et liste

### Filtres Disponibles

- **Par période** : Semaine, Mois, Trimestre, Année, Personnalisé
- **Par région** : Filtrer par région spécifique
- **Par groupe** : Filtrer par groupe
- **Par district** : Filtrer par district
- **Par statut** : Actif, En implantation, etc.

## 🔐 Sécurité

### Authentification JWT

- **Token** : Stocké dans localStorage
- **Durée de vie** : Définie par le backend
- **Renouvellement** : Automatique (à implémenter)

### Bonnes Pratiques

1. **Ne partagez jamais vos identifiants**
2. **Déconnectez-vous** après utilisation sur un ordinateur partagé
3. **Utilisez un mot de passe fort**
4. **Changez votre mot de passe régulièrement**

## 📞 Support

### En cas de problème

1. **Consultez la console du navigateur** (F12)
2. **Vérifiez l'onglet Network** pour les requêtes
3. **Consultez la documentation** :
   - `MIGRATION_API.md` - Documentation de l'API
   - `services/README_API.md` - Guide API détaillé
4. **Contactez l'équipe de développement**

### Informations Utiles

- **URL de l'API** : https://mvcp-cellule.onrender.com
- **Version** : 2.0.0
- **Dernière mise à jour** : 15 octobre 2025

## 🎓 Formation

### Pour les Nouveaux Utilisateurs

1. **Connexion** : Utilisez les identifiants fournis
2. **Exploration** : Parcourez les différentes sections
3. **Test** : Créez un rapport de test
4. **Formation** : Suivez la formation en ligne (si disponible)

### Pour les Administrateurs

1. **Gestion des utilisateurs** : Approuver les nouveaux pasteurs
2. **Modération** : Approuver les communications
3. **Surveillance** : Vérifier les statistiques régulièrement
4. **Maintenance** : Vérifier les logs d'erreur

## 📝 Notes de Version

### Version 2.0.0 (15 octobre 2025)

- ✅ Migration complète vers l'API réelle
- ✅ Authentification JWT
- ✅ Gestion automatique des tokens
- ✅ Indicateurs de connexion
- ✅ Hooks personnalisés
- ✅ Messages d'erreur standardisés
- ✅ Documentation complète

---

**Besoin d'aide ?** Consultez les autres fichiers de documentation ou contactez l'équipe de développement.
