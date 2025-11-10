# Système de Réaffectation des Pasteurs

## Vue d'ensemble

Le système de réaffectation permet au **Coordinateur National** de réaffecter des pasteurs à d'autres groupes, districts ou régions. Cette fonctionnalité met automatiquement à jour toutes les cellules et rapports associés.

---

## Fonctionnalités

### ✅ Réaffectation complète
- Changement de rôle (Pasteur Régional → Pasteur de Groupe, etc.)
- Changement de région
- Changement de groupe
- Changement de district

### ✅ Mise à jour automatique
- **Utilisateur** : Mise à jour des informations hiérarchiques
- **Cellules** : Mise à jour automatique de toutes les cellules sous la responsabilité du pasteur
- **Rapports** : Les rapports existants restent liés aux anciennes affectations (historique préservé)

### ✅ Sécurité
- Accessible uniquement au **NATIONAL_COORDINATOR**
- Confirmation avant réaffectation
- Logs détaillés des modifications

---

## Architecture

### Backend

#### 1. **DTO - ReassignUserDto**
```typescript
export class ReassignUserDto {
  @IsString()
  userId: string;

  @IsEnum(UserRole)
  @IsOptional()
  newRole?: UserRole;

  @IsString()
  @IsOptional()
  newRegion?: string;

  @IsString()
  @IsOptional()
  newGroup?: string;

  @IsString()
  @IsOptional()
  newDistrict?: string;
}
```

#### 2. **Service - users.service.ts**
Méthode `reassignUser(reassignDto: ReassignUserDto)` :

**Étapes** :
1. Récupère l'utilisateur actuel
2. Sauvegarde les anciennes valeurs (oldRegion, oldGroup, oldDistrict, oldRole)
3. Met à jour l'utilisateur avec les nouvelles valeurs
4. Met à jour les cellules associées selon le rôle :
   - **GROUP_PASTOR** : Toutes les cellules du groupe
   - **DISTRICT_PASTOR** : Toutes les cellules du district
   - **CELL_LEADER** : La cellule spécifique du responsable

**Retour** :
```typescript
{
  success: true,
  message: 'Réaffectation effectuée avec succès',
  user: updatedUser,
  cellsUpdated: number,
  details: {
    oldHierarchy: { role, region, group, district },
    newHierarchy: { role, region, group, district }
  }
}
```

#### 3. **Controller - users.controller.ts**
Endpoint : `POST /users/reassign`
- Protégé par `JwtAuthGuard` et `RolesGuard`
- Accessible uniquement au `NATIONAL_COORDINATOR`

### Frontend

#### 1. **Composant - UserReassignmentModal.tsx**
Modal de réaffectation avec :
- Affichage de l'affectation actuelle
- Formulaire de nouvelle affectation
- Sélecteurs en cascade (Région → Groupe → District)
- Validation des champs selon le rôle
- Avertissement sur l'impact de la réaffectation

#### 2. **API - api.real.ts**
Méthode `reassignUser(userId, reassignData)` :
- Appelle l'endpoint `/users/reassign`
- Gère les erreurs avec messages détaillés

#### 3. **Page - UsersPage.tsx**
Intégration du système :
- Bouton 🔄 "Réaffecter" dans le tableau des utilisateurs
- Listes dynamiques des régions, groupes et districts
- Gestion de l'état du modal
- Rafraîchissement automatique après réaffectation

---

## Utilisation

### Accès
1. Se connecter en tant que **Coordinateur National**
2. Aller sur la page **Utilisateurs** (`/users`)
3. Onglet **Utilisateurs**

### Réaffecter un pasteur

#### Étape 1 : Ouvrir le modal
- Cliquer sur le bouton 🔄 à côté du nom de l'utilisateur

#### Étape 2 : Voir l'affectation actuelle
Le modal affiche :
- Rôle actuel
- Région actuelle
- Groupe actuel
- District actuel

#### Étape 3 : Définir la nouvelle affectation
Sélectionner :
1. **Nouveau rôle** (obligatoire)
2. **Nouvelle région** (obligatoire)
3. **Nouveau groupe** (si applicable selon le rôle)
4. **Nouveau district** (si applicable selon le rôle)

**Sélection en cascade** :
- Sélectionner une région → Active le sélecteur de groupe
- Sélectionner un groupe → Active le sélecteur de district

#### Étape 4 : Confirmer
- Cliquer sur **✅ Confirmer la réaffectation**
- Un message de succès s'affiche
- Le tableau se rafraîchit automatiquement

---

## Cas d'usage

### Exemple 1 : Pasteur de Groupe devient Pasteur de District
**Situation** :
- Jean Dupont est Pasteur de Groupe AGLA
- Il est promu Pasteur de District ZOGBO

**Action** :
1. Cliquer sur 🔄 à côté de Jean Dupont
2. Sélectionner :
   - Nouveau rôle : **Pasteur de District**
   - Nouvelle région : **Littoral**
   - Nouveau groupe : **AGLA**
   - Nouveau district : **ZOGBO**
3. Confirmer

**Résultat** :
- Jean Dupont est maintenant Pasteur de District ZOGBO
- Toutes les cellules de son ancien groupe AGLA restent inchangées
- Il peut maintenant gérer les cellules du district ZOGBO

### Exemple 2 : Pasteur de District réaffecté à un autre groupe
**Situation** :
- Marie Martin est Pasteur de District AKPAKPA dans le groupe AGLA
- Elle est réaffectée au district ZOGBO dans le groupe FIDJROSSE

**Action** :
1. Cliquer sur 🔄 à côté de Marie Martin
2. Sélectionner :
   - Nouveau rôle : **Pasteur de District** (inchangé)
   - Nouvelle région : **Littoral**
   - Nouveau groupe : **FIDJROSSE**
   - Nouveau district : **ZOGBO**
3. Confirmer

**Résultat** :
- Marie Martin est maintenant Pasteur de District ZOGBO dans le groupe FIDJROSSE
- Toutes les cellules de son ancien district AKPAKPA sont mises à jour :
  - `region` : Littoral (inchangé)
  - `group` : FIDJROSSE (mis à jour)
  - `district` : ZOGBO (mis à jour)
- Elle peut maintenant gérer les cellules du district ZOGBO

### Exemple 3 : Responsable de Cellule réaffecté
**Situation** :
- Paul Durand est Responsable de la cellule "Hommes AGLA"
- Il est réaffecté à la cellule "Hommes ZOGBO"

**Action** :
1. Cliquer sur 🔄 à côté de Paul Durand
2. Sélectionner :
   - Nouveau rôle : **Responsable de Cellule** (inchangé)
   - Nouvelle région : **Littoral**
   - Nouveau groupe : **AGLA**
   - Nouveau district : **ZOGBO**
3. Confirmer

**Résultat** :
- Paul Durand est maintenant responsable dans le district ZOGBO
- Sa cellule spécifique est mise à jour avec les nouvelles informations

---

## Règles de validation

### Champs obligatoires selon le rôle

| Rôle | Région | Groupe | District |
|------|--------|--------|----------|
| **REGIONAL_PASTOR** | ✅ Obligatoire | ❌ Non applicable | ❌ Non applicable |
| **GROUP_PASTOR** | ✅ Obligatoire | ✅ Obligatoire | ❌ Non applicable |
| **DISTRICT_PASTOR** | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire |
| **CELL_LEADER** | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire |

### Sélection en cascade
- Le sélecteur de **groupe** est désactivé tant qu'aucune région n'est sélectionnée
- Le sélecteur de **district** est désactivé tant qu'aucun groupe n'est sélectionné

---

## Logs et traçabilité

### Backend
Le service affiche des logs détaillés dans la console :
```
🔄 Réaffectation de l'utilisateur:
  userId: 507f1f77bcf86cd799439011
  currentRole: GROUP_PASTOR
  currentRegion: Littoral
  currentGroup: AGLA
  currentDistrict: null
  newRole: DISTRICT_PASTOR
  newRegion: Littoral
  newGroup: FIDJROSSE
  newDistrict: ZOGBO

✅ Utilisateur mis à jour:
  name: Marie Martin
  role: DISTRICT_PASTOR
  region: Littoral
  group: FIDJROSSE
  district: ZOGBO

✅ 5 cellule(s) mise(s) à jour pour le district
```

### Frontend
- Message de succès : "Réaffectation effectuée avec succès"
- Message d'erreur détaillé en cas de problème
- Rafraîchissement automatique du tableau

---

## Sécurité

### Protection backend
- Endpoint protégé par `JwtAuthGuard`
- Restriction de rôle : `@Roles(UserRole.NATIONAL_COORDINATOR)`
- Validation des données avec `class-validator`

### Protection frontend
- Bouton visible uniquement dans la page `/users`
- Page accessible uniquement au `NATIONAL_COORDINATOR`
- Confirmation avant réaffectation

---

## Limitations

### Ce qui est mis à jour
✅ Utilisateur (rôle, région, groupe, district)
✅ Cellules associées (région, groupe, district)

### Ce qui n'est PAS mis à jour
❌ Rapports existants (historique préservé)
❌ Autres utilisateurs de la hiérarchie

**Raison** : Les rapports représentent un historique et doivent rester liés à l'affectation au moment de leur création.

---

## Fichiers modifiés

### Backend
1. `backend/src/users/dto/reassign-user.dto.ts` - DTO de réaffectation
2. `backend/src/users/users.service.ts` - Méthode `reassignUser`
3. `backend/src/users/users.controller.ts` - Endpoint `/users/reassign`

### Frontend
1. `components/UserReassignmentModal.tsx` - Modal de réaffectation
2. `components/UsersPage.tsx` - Intégration du système
3. `services/api.real.ts` - Méthode API `reassignUser`

---

## Tests recommandés

### Test 1 : Réaffectation d'un Pasteur de Groupe
1. Créer un pasteur de groupe avec des cellules
2. Le réaffecter à un autre groupe
3. Vérifier que toutes les cellules sont mises à jour

### Test 2 : Réaffectation d'un Pasteur de District
1. Créer un pasteur de district avec des cellules
2. Le réaffecter à un autre district
3. Vérifier que toutes les cellules sont mises à jour

### Test 3 : Changement de rôle
1. Créer un pasteur de groupe
2. Le promouvoir en pasteur régional
3. Vérifier que le rôle est mis à jour

### Test 4 : Validation des champs
1. Tenter de réaffecter sans sélectionner de région
2. Vérifier que le bouton de confirmation est désactivé

### Test 5 : Sélection en cascade
1. Ouvrir le modal de réaffectation
2. Vérifier que le sélecteur de groupe est désactivé
3. Sélectionner une région
4. Vérifier que le sélecteur de groupe est activé

---

## Support

Pour toute question ou problème :
1. Vérifier les logs backend (console serveur)
2. Vérifier les logs frontend (console navigateur)
3. Contacter l'équipe de développement

---

## Améliorations futures

### Possibles améliorations
- [ ] Historique des réaffectations
- [ ] Notification par email au pasteur réaffecté
- [ ] Mise à jour en masse (plusieurs pasteurs à la fois)
- [ ] Export des réaffectations en PDF
- [ ] Annulation d'une réaffectation
- [ ] Réaffectation avec date effective future

---

**Date de création** : 2025-01-10
**Version** : 1.0
**Auteur** : Équipe de développement MVCP
