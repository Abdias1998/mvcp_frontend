# Guide du Système d'Évolution des Cellules

## Vue d'ensemble

Le système d'évolution des cellules permet de suivre la croissance ou la décroissance de chaque cellule en comparant le nombre actuel de membres avec le nombre initial enregistré lors de la création de la cellule.

## Fonctionnalités

### 1. **Nombre initial de membres**

Lors de la création d'une cellule, vous pouvez maintenant définir le **nombre de personnes inscrites à l'ouverture**. Ce nombre servira de référence pour calculer l'évolution.

**Champ ajouté** :
- **Nombre de personnes inscrites à l'ouverture** (optionnel)
- Visible dans le formulaire de création/modification de cellule

### 2. **Calcul automatique de l'évolution**

Le système calcule automatiquement l'évolution en comparant :
- **Nombre initial** : Défini lors de la création de la cellule
- **Nombre actuel** : Total des membres inscrits dans le dernier rapport (Hommes + Femmes + Enfants)

**Formule** :
```
Pourcentage d'évolution = ((Nombre actuel - Nombre initial) / Nombre initial) × 100
```

### 3. **Code couleur**

Le système attribue automatiquement une couleur selon l'évolution :

| Couleur | Icône | Statut | Critère |
|---------|-------|--------|---------|
| 🟢 **Vert** | 📈 | Excellente croissance | Augmentation ≥ 10% |
| 🟡 **Jaune** | ➡️ | Croissance modérée | Variation entre -10% et +10% |
| 🔴 **Rouge** | 📉 | Baisse critique | Diminution > 10% |
| ⚪ **Gris** | ❓ | Non évalué | Pas de nombre initial ou pas de rapport |

### 4. **Page "Évolution Cellules"**

Une nouvelle page dédiée accessible via le menu de navigation.

**Accès** :
- **NATIONAL_COORDINATOR** : Voit toutes les cellules
- **REGIONAL_PASTOR** : Voit les cellules de sa région
- **GROUP_PASTOR** : Voit les cellules de son groupe
- **DISTRICT_PASTOR** : Voit les cellules de son district
- **CELL_LEADER** : N'a pas accès à cette page

**Fonctionnalités** :
- **Statistiques globales** : Nombre de cellules par statut (vert, jaune, rouge, gris)
- **Filtrage** : Cliquez sur une statistique pour filtrer les cellules
- **Liste détaillée** : Affiche toutes les cellules avec leur statut d'évolution
- **Détails par cellule** :
  - Nom de la cellule
  - Localisation (Région, Groupe, District)
  - Responsable
  - Badge de statut (compact)
  - Carte détaillée avec :
    - Pourcentage d'évolution
    - Nombre initial
    - Nombre actuel
    - Label descriptif

## Exemples

### Exemple 1 : Excellente croissance (Vert)

**Cellule** : Cellule Alpha  
**Nombre initial** : 10 personnes  
**Nombre actuel** : 15 personnes  
**Évolution** : +50%  
**Statut** : 📈 Excellente croissance (Vert)

### Exemple 2 : Croissance modérée (Jaune)

**Cellule** : Cellule Beta  
**Nombre initial** : 20 personnes  
**Nombre actuel** : 21 personnes  
**Évolution** : +5%  
**Statut** : ➡️ Croissance modérée (Jaune)

### Exemple 3 : Baisse critique (Rouge)

**Cellule** : Cellule Gamma  
**Nombre initial** : 30 personnes  
**Nombre actuel** : 20 personnes  
**Évolution** : -33.3%  
**Statut** : 📉 Baisse critique (Rouge)

### Exemple 4 : Non évalué (Gris)

**Cellule** : Cellule Delta  
**Nombre initial** : Non défini  
**Nombre actuel** : N/A  
**Évolution** : N/A  
**Statut** : ❓ Non évalué (Gris)

## Workflow

### 1. **Création d'une cellule**

1. Accédez à la page "Gestion"
2. Cliquez sur "Ajouter une cellule"
3. Remplissez les informations de la cellule
4. **Définissez le nombre de personnes inscrites à l'ouverture**
5. Enregistrez

### 2. **Suivi de l'évolution**

1. Les responsables de cellule soumettent des rapports réguliers
2. Le système utilise le dernier rapport pour calculer le nombre actuel
3. L'évolution est calculée automatiquement

### 3. **Consultation des statistiques**

1. Accédez à "Évolution Cellules" dans le menu
2. Consultez les statistiques globales
3. Filtrez par statut (vert, jaune, rouge, gris)
4. Consultez les détails de chaque cellule

## Bonnes pratiques

### Pour les pasteurs

1. **Définir le nombre initial** : Assurez-vous de définir le nombre initial lors de la création de chaque cellule
2. **Mettre à jour régulièrement** : Encouragez les responsables à soumettre des rapports réguliers
3. **Analyser les tendances** : Utilisez les statistiques pour identifier les cellules qui nécessitent un accompagnement
4. **Intervenir rapidement** : Les cellules en rouge (baisse critique) nécessitent une attention particulière

### Pour les responsables de cellule

1. **Soumettre des rapports précis** : Assurez-vous que les nombres de membres (Hommes, Femmes, Enfants) sont exacts
2. **Soumettre régulièrement** : Plus vous soumettez de rapports, plus le suivi est précis

## Interprétation des résultats

### 🟢 Vert (Excellente croissance)

**Signification** : La cellule croît de manière significative  
**Action** : Féliciter le responsable, partager les bonnes pratiques

### 🟡 Jaune (Croissance modérée)

**Signification** : La cellule est stable ou croît lentement  
**Action** : Encourager le responsable, identifier les obstacles potentiels

### 🔴 Rouge (Baisse critique)

**Signification** : La cellule perd des membres de manière significative  
**Action** : Rencontrer le responsable, identifier les causes, mettre en place un plan d'action

### ⚪ Gris (Non évalué)

**Signification** : Pas assez d'informations pour évaluer  
**Action** : Définir le nombre initial ou encourager la soumission de rapports

## Modifications techniques

### Frontend

**Fichiers créés** :
- `utils/cellGrowth.ts` : Fonctions de calcul de l'évolution
- `components/CellGrowthBadge.tsx` : Badge d'affichage du statut
- `components/CellGrowthStatsPage.tsx` : Page de statistiques

**Fichiers modifiés** :
- `types.ts` : Ajout de `initialMembersCount` à l'interface `Cell`
- `components/CellManagement.tsx` : Ajout du champ dans le formulaire
- `App.tsx` : Ajout de la route et du lien de navigation

### Backend

**Fichiers modifiés** :
- `backend/src/cells/schemas/cell.schema.ts` : Ajout de `initialMembersCount`

**Migration** :
Aucune migration nécessaire. Le champ est optionnel, les cellules existantes auront `initialMembersCount: undefined`.

## FAQ

### Q : Que se passe-t-il si je ne définis pas le nombre initial ?

**R** : La cellule apparaîtra en gris (Non évalué) dans les statistiques. Vous pouvez modifier la cellule ultérieurement pour ajouter le nombre initial.

### Q : Puis-je modifier le nombre initial après la création ?

**R** : Oui, vous pouvez modifier la cellule et changer le nombre initial à tout moment.

### Q : Comment le nombre actuel est-il calculé ?

**R** : Le nombre actuel est la somme des membres inscrits dans le dernier rapport : `Hommes + Femmes + Enfants`.

### Q : Que se passe-t-il si aucun rapport n'a été soumis ?

**R** : La cellule apparaîtra en gris (Pas de rapport) dans les statistiques.

### Q : Les statistiques sont-elles mises à jour en temps réel ?

**R** : Oui, les statistiques sont recalculées à chaque fois qu'un nouveau rapport est soumis.

### Q : Puis-je voir l'évolution historique d'une cellule ?

**R** : Actuellement, seul le dernier rapport est utilisé. Une fonctionnalité d'historique pourra être ajoutée ultérieurement.

## Support

Pour toute question ou problème, contactez l'administrateur système.
