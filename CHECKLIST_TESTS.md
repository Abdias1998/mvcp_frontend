# ✅ Checklist de Tests - Système de Hiérarchie

## 📋 Tests à Effectuer

### 🔐 1. Authentification

#### Test 1.1 : Inscription avec Email Facultatif
- [ ] Créer un compte **avec** email et téléphone
- [ ] Créer un compte **sans** email (seulement téléphone)
- [ ] Vérifier que les deux inscriptions fonctionnent
- [ ] Vérifier le message de succès

#### Test 1.2 : Connexion avec Email ou Téléphone
- [ ] Se connecter avec **email** + mot de passe
- [ ] Se connecter avec **numéro de téléphone** + mot de passe
- [ ] Vérifier que les deux méthodes fonctionnent
- [ ] Tester avec des identifiants incorrects (vérifier les messages d'erreur)

#### Test 1.3 : Gestion des Erreurs
- [ ] Tester inscription avec numéro invalide
- [ ] Tester connexion avec identifiants incorrects
- [ ] Vérifier que les messages d'erreur de l'API sont affichés correctement
- [ ] Vérifier qu'il n'y a pas de message générique "Erreur lors de..."

---

### 👥 2. Création de Responsable de Cellule

#### Test 2.1 : Accès au Formulaire (Pasteur de Groupe)
- [ ] Se connecter en tant que **Pasteur de Groupe**
- [ ] Aller dans **Gestion**
- [ ] Vérifier que l'onglet **"Responsables de Cellule"** est visible
- [ ] Cliquer sur **"+ Créer un Responsable de Cellule"**
- [ ] Vérifier que le formulaire s'affiche

#### Test 2.2 : Accès au Formulaire (Pasteur de District)
- [ ] Se connecter en tant que **Pasteur de District**
- [ ] Aller dans **Gestion**
- [ ] Vérifier que l'onglet **"Responsables de Cellule"** est visible
- [ ] Cliquer sur **"+ Créer un Responsable de Cellule"**
- [ ] Vérifier que le formulaire s'affiche

#### Test 2.3 : Pré-remplissage des Champs
- [ ] Vérifier que **Région** est pré-remplie (si l'utilisateur a une région)
- [ ] Vérifier que **Groupe** est pré-rempli (si l'utilisateur a un groupe)
- [ ] Vérifier que **District** est pré-rempli (si l'utilisateur a un district)
- [ ] Vérifier que les champs pré-remplis sont **désactivés**

#### Test 2.4 : Sélection en Cascade
- [ ] Sélectionner une **Région**
- [ ] Vérifier que la liste des **Groupes** se met à jour
- [ ] Sélectionner un **Groupe**
- [ ] Vérifier que la liste des **Districts** se met à jour
- [ ] Changer la **Région**
- [ ] Vérifier que **Groupe** et **District** sont réinitialisés

#### Test 2.5 : Création Réussie
- [ ] Remplir tous les champs requis
- [ ] Cliquer sur **"Créer le Responsable"**
- [ ] Vérifier le message de succès
- [ ] Vérifier que **l'identifiant de 5 chiffres** s'affiche
- [ ] **Noter l'identifiant** pour les tests suivants
- [ ] Vérifier que le formulaire est réinitialisé

#### Test 2.6 : Validation du Formulaire
- [ ] Essayer de soumettre sans remplir les champs requis
- [ ] Vérifier les messages de validation
- [ ] Tester avec un numéro de téléphone invalide
- [ ] Vérifier que les erreurs de l'API sont affichées

---

### 👀 3. Visualisation de l'Équipe

#### Test 3.1 : Accès à "Mon Équipe" (Pasteur de Groupe)
- [ ] Se connecter en tant que **Pasteur de Groupe**
- [ ] Vérifier que le lien **"Mon Équipe"** est visible dans le menu
- [ ] Cliquer sur **"Mon Équipe"**
- [ ] Vérifier que la page s'affiche

#### Test 3.2 : Accès à "Mon Équipe" (Pasteur de District)
- [ ] Se connecter en tant que **Pasteur de District**
- [ ] Vérifier que le lien **"Mon Équipe"** est visible dans le menu
- [ ] Cliquer sur **"Mon Équipe"**
- [ ] Vérifier que la page s'affiche

#### Test 3.3 : Contenu pour Pasteur de Groupe
- [ ] Vérifier que **tous les pasteurs de district** du groupe sont affichés
- [ ] Vérifier que **tous les responsables de cellule** du groupe sont affichés
- [ ] Vérifier les informations affichées (nom, contact, région, groupe, district)
- [ ] Vérifier les statistiques (total, pasteurs de district, responsables de cellule)

#### Test 3.4 : Contenu pour Pasteur de District
- [ ] Vérifier que **tous les responsables de cellule** du district sont affichés
- [ ] Vérifier que les **pasteurs de district d'autres districts** ne sont PAS affichés
- [ ] Vérifier les informations affichées (nom, contact, cellule, identifiant)
- [ ] Vérifier les statistiques

#### Test 3.5 : Affichage des Responsables de Cellule
- [ ] Vérifier que le **nom de la cellule** est affiché
- [ ] Vérifier que **l'identifiant de 5 chiffres** est affiché
- [ ] Vérifier que le **statut** est affiché (Approuvé / En attente)
- [ ] Vérifier le badge de rôle (couleur grise pour CELL_LEADER)

---

### 🔒 4. Restrictions d'Accès

#### Test 4.1 : Utilisateur Non Connecté
- [ ] Se déconnecter
- [ ] Vérifier que seul **"Accueil"** est visible dans le menu
- [ ] Vérifier que **"Rapport"** n'est PAS visible
- [ ] Vérifier que **"Tableau de bord"** n'est PAS visible
- [ ] Vérifier que **"Gestion"** n'est PAS visible
- [ ] Vérifier que **"Mon Équipe"** n'est PAS visible

#### Test 4.2 : Pasteur Régional
- [ ] Se connecter en tant que **Pasteur Régional**
- [ ] Vérifier que **"Mon Équipe"** n'est PAS visible
- [ ] Vérifier que l'onglet **"Responsables de Cellule"** n'est PAS visible dans Gestion

#### Test 4.3 : Coordinateur National
- [ ] Se connecter en tant que **Coordinateur National**
- [ ] Vérifier que **"Mon Équipe"** n'est PAS visible
- [ ] Vérifier que l'onglet **"Responsables de Cellule"** n'est PAS visible dans Gestion
- [ ] Vérifier l'accès à tous les autres onglets de Gestion

#### Test 4.4 : Accès Direct aux URLs
- [ ] Se déconnecter
- [ ] Essayer d'accéder à `/team` directement
- [ ] Vérifier la redirection vers `/login`
- [ ] Essayer d'accéder à `/create-cell-leader` directement
- [ ] Vérifier la redirection vers `/login`

---

### 🔑 5. Connexion Responsable de Cellule

#### Test 5.1 : Connexion avec Identifiant
- [ ] Se déconnecter
- [ ] Aller sur la page de connexion
- [ ] Saisir l'**identifiant de 5 chiffres** (noté lors de la création)
- [ ] Saisir le **mot de passe** (selon la config backend)
- [ ] Cliquer sur **"Se connecter"**
- [ ] Vérifier que la connexion réussit

#### Test 5.2 : Accès du Responsable de Cellule
- [ ] Vérifier que le **Tableau de bord** est accessible
- [ ] Vérifier que **"Mon Équipe"** n'est PAS visible
- [ ] Vérifier que **"Gestion"** est accessible
- [ ] Vérifier l'accès au formulaire de **Rapport**

#### Test 5.3 : Identifiant Incorrect
- [ ] Se déconnecter
- [ ] Essayer de se connecter avec un identifiant incorrect
- [ ] Vérifier le message d'erreur
- [ ] Vérifier que le message est clair et détaillé

---

### 📊 6. Intégration avec le Dashboard

#### Test 6.1 : Rapports du Responsable de Cellule
- [ ] Se connecter en tant que **Responsable de Cellule**
- [ ] Soumettre un rapport pour sa cellule
- [ ] Se déconnecter
- [ ] Se connecter en tant que **Pasteur de District**
- [ ] Vérifier que le rapport apparaît dans le tableau de bord
- [ ] Se connecter en tant que **Pasteur de Groupe**
- [ ] Vérifier que le rapport apparaît dans le tableau de bord

#### Test 6.2 : Filtrage Hiérarchique
- [ ] Se connecter en tant que **Pasteur de District**
- [ ] Vérifier que seuls les rapports de son district sont visibles
- [ ] Se connecter en tant que **Pasteur de Groupe**
- [ ] Vérifier que tous les rapports de son groupe sont visibles

---

### 🐛 7. Gestion des Erreurs

#### Test 7.1 : Backend Indisponible
- [ ] Arrêter le backend (si possible)
- [ ] Essayer de créer un responsable de cellule
- [ ] Vérifier le message d'erreur
- [ ] Essayer de voir "Mon Équipe"
- [ ] Vérifier le message d'erreur

#### Test 7.2 : Données Invalides
- [ ] Essayer de créer un responsable avec un numéro de téléphone invalide
- [ ] Vérifier que le message d'erreur de l'API est affiché
- [ ] Essayer avec un nom de cellule vide
- [ ] Vérifier la validation côté client

#### Test 7.3 : Messages d'Erreur Détaillés
- [ ] Provoquer une erreur de validation du backend
- [ ] Vérifier que le message détaillé est affiché (pas "Erreur lors de...")
- [ ] Vérifier que les tableaux de messages sont correctement joints

---

### 📱 8. Responsive Design

#### Test 8.1 : Mobile
- [ ] Ouvrir l'application sur mobile (ou mode responsive)
- [ ] Vérifier le menu hamburger
- [ ] Vérifier que "Mon Équipe" est accessible
- [ ] Vérifier le formulaire de création de responsable
- [ ] Vérifier l'affichage des tableaux

#### Test 8.2 : Tablette
- [ ] Tester sur tablette (ou mode responsive)
- [ ] Vérifier tous les composants
- [ ] Vérifier la navigation

---

## 🎯 Résultats Attendus

### ✅ Succès
- Tous les tests passent
- Les messages d'erreur sont clairs et détaillés
- La navigation est fluide
- Les restrictions d'accès fonctionnent correctement
- Les données hiérarchiques sont correctement filtrées

### ⚠️ Problèmes Potentiels
- Backend pas à jour → Erreurs 404 sur les nouveaux endpoints
- Identifiants non générés → Vérifier la fonction backend
- Filtrage hiérarchique incorrect → Vérifier la logique backend
- Messages d'erreur génériques → Vérifier httpClient.ts

---

## 📝 Rapport de Tests

### Template de Rapport

```markdown
## Test effectué le : [DATE]
### Testeur : [NOM]

#### Tests Réussis ✅
- [ ] Test 1.1 : Inscription avec email facultatif
- [ ] Test 2.1 : Création de responsable de cellule
- [ ] ...

#### Tests Échoués ❌
- [ ] Test X.X : [Description]
  - **Erreur** : [Message d'erreur]
  - **Cause** : [Cause probable]
  - **Solution** : [Solution proposée]

#### Notes
[Observations et commentaires]
```

---

## 🚀 Démarrage des Tests

### Prérequis
1. Backend démarré et accessible
2. Base de données initialisée
3. Au moins un utilisateur de chaque rôle créé

### Ordre Recommandé
1. Tests d'authentification (1.1 à 1.3)
2. Tests de création de responsable (2.1 à 2.6)
3. Tests de visualisation (3.1 à 3.5)
4. Tests de restrictions (4.1 à 4.4)
5. Tests de connexion responsable (5.1 à 5.3)
6. Tests d'intégration (6.1 à 6.2)
7. Tests de gestion d'erreurs (7.1 à 7.3)
8. Tests responsive (8.1 à 8.2)

---

**Bonne chance pour les tests ! 🎉**
