# 📊 Répartition par Catégorie de Cellule

## Vue d'ensemble

Le Dashboard affiche maintenant un graphique de **Répartition par Catégorie de Cellule** qui montre le **nombre total de membres inscrits** par type de cellule, avec regroupement intelligent des catégories similaires.

## 🎯 Logique de regroupement

Les catégories de cellules sont regroupées comme suit :

| Catégorie affichée | Catégories regroupées | Description |
|-------------------|----------------------|-------------|
| **Hommes** | "Hommes" + "Jeunes Hommes" | Toutes les cellules d'hommes (adultes et jeunes) |
| **Femmes** | "Femmes" + "Jeunes Femmes" | Toutes les cellules de femmes (adultes et jeunes) |
| **Enfants** | "Enfants" | Cellules d'enfants uniquement |
| **Mixte** | "Mixte" | Cellules mixtes uniquement |

## 📈 Calcul des données

Le graphique calcule le **nombre total de membres inscrits** (`initialMembersCount`) par catégorie de cellule :

```typescript
const demographicsData = useMemo(() => {
    const categoryCount: { [key: string]: number } = {
        'Hommes': 0,
        'Femmes': 0,
        'Enfants': 0,
        'Mixte': 0
    };

    reportsToAnalyze.forEach(report => {
        const category = report.cellCategory;
        const membersCount = report.initialMembersCount || 0; // Nombre de membres inscrits
        
        // Regrouper "Hommes" et "Jeunes Hommes" → "Hommes"
        if (category === 'Hommes' || category === 'Jeunes Hommes') {
            categoryCount['Hommes'] += membersCount;
        }
        // Regrouper "Femmes" et "Jeunes Femmes" → "Femmes"
        else if (category === 'Femmes' || category === 'Jeunes Femmes') {
            categoryCount['Femmes'] += membersCount;
        }
        // Enfants (pas de regroupement)
        else if (category === 'Enfants') {
            categoryCount['Enfants'] += membersCount;
        }
        // Mixte (pas de regroupement)
        else if (category === 'Mixte') {
            categoryCount['Mixte'] += membersCount;
        }
    });

    return [
        { name: 'Hommes', value: categoryCount['Hommes'] },
        { name: 'Femmes', value: categoryCount['Femmes'] },
        { name: 'Enfants', value: categoryCount['Enfants'] },
        { name: 'Mixte', value: categoryCount['Mixte'] }
    ].filter(d => d.value > 0); // Ne montrer que les catégories avec des membres
}, [reportsToAnalyze]);
```

## 📊 Affichage

### Dans le Dashboard

Le graphique est affiché dans une section dédiée :
- **Titre** : "Répartition par Catégorie de Cellule"
- **Type** : Graphique à barres verticales
- **Données** : Nombre total de membres inscrits par catégorie
- **Filtrage** : Seules les catégories avec au moins 1 membre sont affichées

### Dans le PDF exporté

La même répartition est affichée dans le PDF avec des cartes colorées :
- Chaque catégorie a sa propre carte
- Affichage du nom de la catégorie et du nombre total de membres inscrits
- Design : fond bleu clair avec texte bleu foncé

## 🎨 Exemple visuel

```
Répartition par Catégorie de Cellule
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    16 ┤     ████
       │     ████
    12 ┤     ████  ████
       │     ████  ████
     8 ┤     ████  ████
       │     ████  ████
     4 ┤     ████  ████  ████  ████
       │     ████  ████  ████  ████
     0 ┼─────────────────────────────
         Hommes Femmes Enfants Mixte
```

## 📝 Exemples de calcul

### Exemple 1 : Cellules variées

**Rapports soumis :**
- 3 cellules "Hommes" avec 15, 20 et 12 membres = 47 membres
- 2 cellules "Jeunes Hommes" avec 18 et 14 membres = 32 membres
- 2 cellules "Femmes" avec 22 et 16 membres = 38 membres
- 1 cellule "Jeunes Femmes" avec 19 membres = 19 membres
- 1 cellule "Enfants" avec 25 membres = 25 membres
- 1 cellule "Mixte" avec 30 membres = 30 membres

**Résultat affiché :**
- Hommes : **79** (47 + 32)
- Femmes : **57** (38 + 19)
- Enfants : **25**
- Mixte : **30**

### Exemple 2 : Uniquement des cellules d'hommes

**Rapports soumis :**
- 5 cellules "Hommes" avec un total de 85 membres
- 3 cellules "Jeunes Hommes" avec un total de 48 membres

**Résultat affiché :**
- Hommes : **133** (85 + 48)

Les autres catégories (Femmes, Enfants, Mixte) ne sont pas affichées car elles ont 0 membre.

## 🔍 Interprétation

Ce graphique permet de :

1. **Voir la répartition des cellules** : Identifier quels types de cellules sont les plus actifs
2. **Détecter les déséquilibres** : Repérer si certaines catégories sont sous-représentées
3. **Planifier les actions** : Orienter les efforts selon les besoins
4. **Suivre l'évolution** : Comparer d'une période à l'autre

## 📍 Emplacement dans le Dashboard

Le graphique se trouve dans la section **Graphiques et Statistiques**, après :
- Les statistiques générales (cartes)
- L'évolution hebdomadaire
- L'évolution de la participation

Et avant :
- Le tableau de synthèse par groupe/district/région
- Les témoignages poignants

## 🎯 Avantages du regroupement

### Pourquoi regrouper "Hommes" et "Jeunes Hommes" ?

1. **Simplification** : Vue d'ensemble plus claire
2. **Cohérence** : Les deux catégories ciblent le même public (hommes)
3. **Analyse** : Facilite la comparaison entre hommes et femmes
4. **Lisibilité** : Graphique moins chargé

### Pourquoi ne pas regrouper "Enfants" et "Mixte" ?

1. **Enfants** : Public spécifique avec besoins particuliers
2. **Mixte** : Approche différente (intergénérationnelle)
3. **Stratégie** : Nécessitent des actions distinctes

## 🔄 Mise à jour automatique

Le graphique se met à jour automatiquement :
- ✅ Quand la plage de dates change
- ✅ Quand de nouveaux rapports sont soumis
- ✅ Quand l'utilisateur change de vue (Littoral/Régions pour le coordinateur)
- ✅ Selon le filtrage hiérarchique de l'utilisateur

## 📊 Données sources

Les données proviennent du champ `cellCategory` de chaque rapport :
- Défini lors de la soumission du rapport
- Stocké dans MongoDB
- Filtré selon la hiérarchie de l'utilisateur (backend)
- Regroupé selon la logique définie (frontend)

## ✨ Améliorations futures possibles

1. **Pourcentages** : Afficher le % en plus du nombre
2. **Tendances** : Comparer avec la période précédente
3. **Couleurs personnalisées** : Une couleur par catégorie
4. **Détails au clic** : Voir la liste des cellules de chaque catégorie
5. **Export dédié** : Exporter uniquement cette répartition
