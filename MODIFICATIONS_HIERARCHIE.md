# 📋 Modifications du Système de Hiérarchie et d'Accès

## 🎯 Résumé des Modifications

Ce document récapitule toutes les modifications apportées au système pour implémenter la nouvelle hiérarchie et les règles d'accès.

---

## 1️⃣ Nouveau Rôle: Responsable de Cellule

### Types et Interfaces (`types.ts`)
- ✅ Ajout du rôle `CELL_LEADER` dans l'enum `UserRole`
- ✅ Nouvelle interface `CellLeaderData` pour la création
- ✅ Champs ajoutés à l'interface `User`:
  - `cellName?: string`
  - `cellCategory?: string`
  - `identifier?: string` (identifiant de 5 chiffres)

---

## 2️⃣ Système de Création de Responsables de Cellule

### Nouveau Composant: `CellLeaderForm.tsx`
**Fonctionnalités:**
- Formulaire de création accessible aux pasteurs de groupe et de district
- **Pas de champ mot de passe** (sécurité améliorée)
- Champs hiérarchiques pré-remplis selon l'utilisateur connecté
- Affichage de l'identifiant de 5 chiffres généré par le backend
- Validation et gestion d'erreurs complète

**Champs du formulaire:**
- Nom complet (requis)
- Numéro de téléphone (requis)
- Région, Groupe, District (sélection en cascade)
- Nom de la cellule (requis)
- Catégorie de la cellule (requis)

### API (`api.real.ts`)
```typescript
createCellLeader(cellLeaderData: CellLeaderData): Promise<{
  success: boolean;
  message: string;
  identifier?: string;
}>
```
- Endpoint: `/cell-leaders`
- Retourne l'identifiant de 5 chiffres généré par le backend

### Configuration (`config/api.config.ts`)
- ✅ Ajout de l'endpoint `CELL_LEADERS: '/cell-leaders'`

---

## 3️⃣ Système de Visualisation de la Hiérarchie

### Nouveau Composant: `HierarchyUsersView.tsx`
**Fonctionnalités:**
- Affiche tous les utilisateurs sous la hiérarchie de l'utilisateur connecté
- Groupement par rôle avec badges colorés
- Tableaux détaillés avec informations spécifiques par rôle
- Statistiques rapides (total, pasteurs de district, responsables de cellule)

**Informations affichées:**
- Pour les pasteurs: Nom, Contact, Région, Groupe, District, Statut
- Pour les responsables de cellule: Nom, Contact, Cellule, Identifiant, Statut

### Nouveau Composant: `TeamPage.tsx`
- Page dédiée "Mon Équipe"
- Accessible uniquement aux pasteurs de groupe et de district
- Intègre le composant `HierarchyUsersView`

### API (`api.real.ts`)
```typescript
getUsersByHierarchy(user: User): Promise<User[]>
```
- Endpoint: `/users/hierarchy`
- Le backend filtre automatiquement selon le rôle et la hiérarchie

---

## 4️⃣ Règles de Visibilité

### Pasteur de Groupe
- ✅ Voit **tous les pasteurs de district** de son groupe
- ✅ Voit **tous les responsables de cellule** de son groupe
- ✅ Peut créer des responsables de cellule

### Pasteur de District
- ✅ Voit **tous les responsables de cellule** de son district
- ✅ Peut créer des responsables de cellule

### Responsable de Cellule
- ✅ Se connecte avec un identifiant de 5 chiffres (pas de mot de passe)
- ✅ Peut soumettre des rapports pour sa cellule

---

## 5️⃣ Navigation et Accès

### Restrictions d'Accès (`App.tsx`)
**Utilisateurs NON connectés:**
- ✅ Accès uniquement à "Accueil"
- ❌ Pas d'accès à Rapport, Tableau de bord, Gestion

**Utilisateurs connectés:**
- ✅ Accès selon leur rôle

### Nouveaux Liens de Navigation
**Pour GROUP_PASTOR et DISTRICT_PASTOR:**
- ✅ "Mon Équipe" (`/team`) - Affiche la liste des utilisateurs sous leur hiérarchie

### Nouvelles Routes
```tsx
/create-cell-leader  → CellLeaderForm (protégée)
/team                → TeamPage (protégée)
```

---

## 6️⃣ Page de Gestion (`ManagementPage.tsx`)

### Nouvel Onglet: "Responsables de Cellule"
**Visible pour:**
- Pasteurs de Groupe
- Pasteurs de District

**Fonctionnalités:**
- Description du système
- Bouton "Créer un Responsable de Cellule"
- Navigation vers le formulaire de création

---

## 7️⃣ Terminologie selon la Région

### Région Littoral
```
Région → Groupe → District → Cellule
```

### Autres Régions
```
Région → District (appelé "Groupe") → Localité (appelé "District") → Cellule
```

**Note:** Cette distinction est déjà gérée dans le code existant (ReportForm, Dashboard).

---

## 8️⃣ Fichiers Modifiés

### Nouveaux Fichiers
- ✅ `components/CellLeaderForm.tsx`
- ✅ `components/HierarchyUsersView.tsx`
- ✅ `components/TeamPage.tsx`

### Fichiers Modifiés
- ✅ `types.ts` - Nouveaux types et interfaces
- ✅ `services/api.real.ts` - Nouvelles fonctions API
- ✅ `config/api.config.ts` - Nouvel endpoint
- ✅ `App.tsx` - Nouvelles routes et navigation
- ✅ `components/ManagementPage.tsx` - Nouvel onglet
- ✅ `components/RegisterPage.tsx` - Email facultatif, téléphone obligatoire
- ✅ `services/httpClient.ts` - Gestion des erreurs améliorée
- ✅ `contexts/AuthContext.tsx` - Support de l'identifiant générique

---

## 9️⃣ Améliorations de la Gestion des Erreurs

### Modifications (`httpClient.ts`, `api.real.ts`)
- ✅ Détection et gestion des messages d'erreur sous forme de tableau
- ✅ Affichage des messages détaillés de l'API au lieu de messages génériques
- ✅ Support du format:
```json
{
  "message": ["Erreur 1", "Erreur 2"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 🔐 Système d'Authentification

### Inscription (`RegisterPage.tsx`)
- ✅ Email **facultatif**
- ✅ Numéro de téléphone **obligatoire**
- ✅ Sélection dynamique Région → Groupe → District (depuis l'API)

### Connexion (`LoginPage`)
- ✅ Connexion avec **email OU numéro de téléphone**
- ✅ Champ unique: "Email ou Numéro de téléphone"
- ✅ Le backend gère la distinction automatiquement

### API (`api.real.ts`)
```typescript
login(identifier: string, password: string): Promise<User>
```
- `identifier` peut être un email ou un numéro de téléphone
- Envoi de `{ identifier, password }` au backend

---

## 📊 Prochaines Étapes (Backend)

Le backend doit implémenter:

1. **Endpoint `/cell-leaders` (POST)**
   - Créer un responsable de cellule
   - Générer un identifiant de 5 chiffres unique
   - Retourner: `{ identifier: "12345", user: {...} }`

2. **Endpoint `/users/hierarchy` (GET)**
   - Filtrer les utilisateurs selon la hiérarchie de l'utilisateur connecté
   - Pasteur de Groupe → Retourner pasteurs de district + responsables de cellule de son groupe
   - Pasteur de District → Retourner responsables de cellule de son district

3. **Endpoint `/auth/login` (POST)**
   - Accepter `{ identifier, password }`
   - `identifier` peut être email ou numéro de téléphone
   - Retourner le token et les informations utilisateur

---

## ✅ Tests à Effectuer

1. **Création de responsable de cellule**
   - Se connecter en tant que pasteur de groupe
   - Aller dans Gestion → Responsables de Cellule
   - Créer un responsable et noter l'identifiant

2. **Visualisation de l'équipe**
   - Se connecter en tant que pasteur de groupe
   - Aller dans "Mon Équipe"
   - Vérifier que tous les utilisateurs de la hiérarchie sont affichés

3. **Connexion avec identifiant**
   - Se déconnecter
   - Se connecter avec l'identifiant de 5 chiffres du responsable de cellule

4. **Restrictions d'accès**
   - Se déconnecter
   - Vérifier que seul "Accueil" est visible dans la navigation

---

## 📝 Notes Importantes

- Les responsables de cellule n'ont **pas de mot de passe**, uniquement un identifiant de 5 chiffres
- L'identifiant est généré par le backend et doit être communiqué au responsable
- Les champs hiérarchiques sont pré-remplis selon l'utilisateur connecté
- La gestion des erreurs affiche maintenant les messages détaillés de l'API

---

**Date de modification:** 27 octobre 2025
**Version:** 2.0
