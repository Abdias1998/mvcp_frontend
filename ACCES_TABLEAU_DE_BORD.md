# Accès au Tableau de Bord selon les Rôles

## Vue d'ensemble

Le **Tableau de bord** (`/admin`) est maintenant accessible à tous les rôles hiérarchiques (REGIONAL_PASTOR, GROUP_PASTOR, DISTRICT_PASTOR, NATIONAL_COORDINATOR). Seuls les **CELL_LEADER** n'y ont pas accès.

Chaque utilisateur voit uniquement les données de sa zone hiérarchique, sauf le **NATIONAL_COORDINATOR** qui a une vue globale de toutes les données.

---

## Modifications effectuées

### 1. **App.tsx - Navigation**

**Avant :**
```tsx
{user.role === UserRole.NATIONAL_COORDINATOR && (
  <>
    <NavLink to="/admin">Tableau de bord</NavLink>
    <NavLink to="/users">Utilisateurs</NavLink>
    ...
  </>
)}
```

**Après :**
```tsx
{user.role !== UserRole.CELL_LEADER && (
  <NavLink to="/admin">Tableau de bord</NavLink>
)}
{user.role === UserRole.NATIONAL_COORDINATOR && (
  <>
    <NavLink to="/users">Utilisateurs</NavLink>
    ...
  </>
)}
```

**Résultat :** Le lien "Tableau de bord" est visible pour tous les rôles sauf CELL_LEADER.

---

### 2. **App.tsx - Protection de route**

**Avant :**
```tsx
<Route path="/admin" element={
  <RoleProtectedRoute allowedRoles={[UserRole.NATIONAL_COORDINATOR]}>
    <Dashboard />
  </RoleProtectedRoute>
} />
```

**Après :**
```tsx
<Route path="/admin" element={
  <RoleProtectedRoute excludeRoles={[UserRole.CELL_LEADER]}>
    <Dashboard />
  </RoleProtectedRoute>
} />
```

**Résultat :** Tous les rôles peuvent accéder à `/admin`, sauf CELL_LEADER.

---

## Comportement par rôle

| Rôle | Accès au Tableau de bord | Données visibles |
|------|--------------------------|------------------|
| **NATIONAL_COORDINATOR** | ✅ Oui | **Toutes les données** (vue globale) |
| **REGIONAL_PASTOR** | ✅ Oui | Données de **sa région** uniquement |
| **GROUP_PASTOR** | ✅ Oui | Données de **son groupe** uniquement |
| **DISTRICT_PASTOR** | ✅ Oui | Données de **son district** uniquement |
| **CELL_LEADER** | ❌ Non | Pas d'accès |

---

## Filtrage des données

Le filtrage des données se fait **automatiquement** via l'API backend en fonction du rôle et de la hiérarchie de l'utilisateur connecté.

### Backend - Filtrage automatique

Le backend utilise le JWT (`req.user`) pour filtrer les données selon la hiérarchie :

**Exemple dans `reports.service.ts` :**
```typescript
switch (user.role) {
  case UserRole.NATIONAL_COORDINATOR:
    // Pas de filtre - voit tout
    break;
  case UserRole.REGIONAL_PASTOR:
    query.region = user.region;
    break;
  case UserRole.GROUP_PASTOR:
    query.region = user.region;
    query.group = user.group;
    break;
  case UserRole.DISTRICT_PASTOR:
    query.region = user.region;
    query.group = user.group;
    query.district = user.district;
    break;
}
```

**Même logique appliquée dans :**
- `cells.service.ts` - Filtrage des cellules
- `users.service.ts` - Filtrage des utilisateurs

---

## Sécurité

✅ **Filtrage côté backend** : Les données sont filtrées au niveau du serveur via le JWT  
✅ **Impossible de contourner** : Les utilisateurs ne peuvent pas voir de données hors de leur périmètre  
✅ **Protection de route** : Accès bloqué pour CELL_LEADER  
✅ **Navigation conditionnelle** : Le lien n'est visible que pour les rôles autorisés  

---

## Exemples concrets

### Exemple 1 : Pasteur Régional (Littoral)
- **Voit :** Toutes les cellules, rapports et statistiques de la région **Littoral**
- **Ne voit pas :** Les données des autres régions (Atlantique, Ouémé, etc.)

### Exemple 2 : Pasteur de Groupe (Groupe ZOGBO)
- **Voit :** Toutes les cellules et rapports du groupe **ZOGBO** (région Littoral)
- **Ne voit pas :** Les données des autres groupes (AGLA, VEDOKO, etc.)

### Exemple 3 : Pasteur de District (District AGLA)
- **Voit :** Toutes les cellules et rapports du district **AGLA** (groupe ZOGBO, région Littoral)
- **Ne voit pas :** Les données des autres districts

### Exemple 4 : Coordinateur National
- **Voit :** **TOUTES** les données de toutes les régions, groupes, districts et cellules
- **Vue globale complète**

---

## Fonctionnalités du Tableau de bord

Chaque utilisateur (selon son périmètre) peut :

### 📊 Statistiques
- Total des cellules
- Cellules actives
- Total des rapports
- Nouveaux membres

### 📈 Graphiques
- Évolution des cellules par semaine
- Répartition démographique (Hommes/Femmes/Enfants)
- Statuts des cellules (Active, En implantation, etc.)

### 📋 Tableaux récapitulatifs
- Résumé par région/groupe/district
- Tendances de croissance
- Nouveaux membres

### 🏆 Témoignages vedettes
- Gestion des témoignages
- Mise en avant des témoignages

### 📥 Export de données
- Export Excel
- Export PDF

### 🗑️ Gestion
- Suppression de rapports (si autorisé)

---

## Navigation

**Barre de navigation selon le rôle :**

**NATIONAL_COORDINATOR :**
- Accueil
- Rapport
- **Tableau de bord** ✅
- Utilisateurs
- Réinitialisation MDP
- Gestion
- Évolution Cellules

**REGIONAL_PASTOR / GROUP_PASTOR / DISTRICT_PASTOR :**
- Accueil
- Rapport
- **Tableau de bord** ✅
- Gestion
- Évolution Cellules
- Mon Équipe

**CELL_LEADER :**
- Accueil
- Rapport
- Évolution Cellules
- *(Pas de Tableau de bord)*

---

## Avantages

✅ **Autonomie des pasteurs** : Chaque pasteur peut suivre ses statistiques sans dépendre du coordinateur  
✅ **Visibilité en temps réel** : Accès immédiat aux données de leur zone  
✅ **Prise de décision** : Données pour piloter leur zone  
✅ **Motivation** : Visualisation de la croissance et des tendances  
✅ **Sécurité maintenue** : Chacun ne voit que son périmètre  

---

## Notes importantes

1. **Le filtrage est automatique** : Pas besoin de sélectionner manuellement sa zone
2. **Les données sont en temps réel** : Mises à jour dès qu'un rapport est soumis
3. **Le NATIONAL_COORDINATOR reste unique** : Seul lui a accès à la page "Utilisateurs" et aux fonctions d'administration
4. **Cohérence avec les autres pages** : Le même principe de filtrage s'applique à "Gestion", "Évolution Cellules", etc.

---

## Résumé

Cette modification permet une **décentralisation de la visualisation des données** tout en maintenant la **sécurité et l'intégrité** du système. Chaque niveau hiérarchique peut maintenant suivre ses propres statistiques de manière autonome.
