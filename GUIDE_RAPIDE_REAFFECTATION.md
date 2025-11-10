# Guide Rapide - Système de Réaffectation

## 🎯 Objectif
Permettre au Coordinateur National de réaffecter des pasteurs à d'autres groupes/districts avec mise à jour automatique des cellules.

---

## ✅ Ce qui a été créé

### Backend
1. **DTO** : `backend/src/users/dto/reassign-user.dto.ts`
2. **Service** : Méthode `reassignUser()` dans `users.service.ts`
3. **Controller** : Endpoint `POST /users/reassign` dans `users.controller.ts`

### Frontend
1. **Modal** : `components/UserReassignmentModal.tsx`
2. **API** : Méthode `reassignUser()` dans `services/api.real.ts`
3. **Intégration** : Bouton 🔄 dans `components/UsersPage.tsx`

---

## 🚀 Comment utiliser

### Pour le Coordinateur National

1. **Accéder à la page Utilisateurs**
   - Se connecter en tant que Coordinateur National
   - Cliquer sur "Utilisateurs" dans la navigation
   - Aller sur l'onglet "Utilisateurs"

2. **Réaffecter un pasteur**
   - Cliquer sur le bouton 🔄 à côté du nom de l'utilisateur
   - Sélectionner le nouveau rôle, région, groupe et/ou district
   - Cliquer sur "✅ Confirmer la réaffectation"

3. **Résultat**
   - L'utilisateur est mis à jour
   - Toutes les cellules sous sa responsabilité sont automatiquement mises à jour
   - Un message de succès s'affiche

---

## 📋 Exemples d'utilisation

### Exemple 1 : Pasteur de Groupe → Pasteur de District
```
Avant : Jean Dupont - Pasteur de Groupe AGLA
Après : Jean Dupont - Pasteur de District ZOGBO (Groupe AGLA)
```

### Exemple 2 : Réaffectation à un autre groupe
```
Avant : Marie Martin - Pasteur de District AKPAKPA (Groupe AGLA)
Après : Marie Martin - Pasteur de District ZOGBO (Groupe FIDJROSSE)
→ Toutes ses cellules sont mises à jour automatiquement
```

---

## ⚙️ Fonctionnalités

### ✅ Mise à jour automatique
- **Utilisateur** : Rôle, région, groupe, district
- **Cellules** : Région, groupe, district de toutes les cellules sous sa responsabilité

### ✅ Sélection intelligente
- Sélecteurs en cascade (Région → Groupe → District)
- Champs obligatoires selon le rôle
- Validation automatique

### ✅ Sécurité
- Accessible uniquement au Coordinateur National
- Confirmation avant réaffectation
- Logs détaillés

---

## 🔍 Logs backend

Le système affiche des logs détaillés pour le suivi :
```
🔄 Réaffectation de l'utilisateur: { userId, currentRole, newRole, ... }
✅ Utilisateur mis à jour: { name, role, region, group, district }
✅ 5 cellule(s) mise(s) à jour pour le district
```

---

## 📝 Notes importantes

1. **Historique préservé** : Les rapports existants ne sont pas modifiés (historique)
2. **Cellules mises à jour** : Toutes les cellules sous la responsabilité du pasteur sont automatiquement mises à jour
3. **Sécurité** : Seul le Coordinateur National peut réaffecter des pasteurs

---

## 🧪 Tests à effectuer

1. ✅ Réaffecter un Pasteur de Groupe à un autre groupe
2. ✅ Réaffecter un Pasteur de District à un autre district
3. ✅ Changer le rôle d'un pasteur (promotion/rétrogradation)
4. ✅ Vérifier que les cellules sont mises à jour
5. ✅ Vérifier que les rapports existants ne sont pas modifiés

---

## 📚 Documentation complète

Pour plus de détails, consultez : **SYSTEME_REAFFECTATION.md**

---

**Prêt à utiliser !** 🎉
