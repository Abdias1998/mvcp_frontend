# 📊 Taux de Participation aux Programmes

## 🎯 Changement effectué

Le graphique "Statut des Cellules" a été remplacé par un **diagramme circulaire** montrant le **taux de participation aux programmes** avec l'effectif manquant en rouge.

## 📊 Avant vs Après

### ❌ Avant
**Graphique "Statut des Cellules" :**
- Affichait le nombre de cellules par statut (Active, En implantation, etc.)
- Pas d'information sur la participation réelle aux activités

### ✅ Après
**Graphique "Taux de Participation aux Programmes" :**
- Affiche le pourcentage de participation à chaque programme
- Montre l'effectif manquant en rouge
- Basé sur le nombre total de membres inscrits

## 🎨 Couleurs du diagramme

| Programme | Couleur | Code |
|-----------|---------|------|
| **Étude Biblique** | 🔵 Bleu | #3B82F6 |
| **Heure de Réveil** | 🟣 Violet | #8B5CF6 |
| **Culte Dominical** | 🟢 Vert | #22C55E |
| **Absents** | 🔴 Rouge | #EF4444 |

## 📈 Calcul des pourcentages

### Formule
```
Pourcentage = (Participants au programme / Total membres inscrits) × 100
```

### Exemple concret

**Données :**
- Total membres inscrits : **100**
- Étude Biblique : **10** participants
- Heure de Réveil : **10** participants
- Culte Dominical : **30** participants

**Calcul :**
- Étude Biblique : (10 / 100) × 100 = **10%**
- Heure de Réveil : (10 / 100) × 100 = **10%**
- Culte Dominical : (30 / 100) × 100 = **30%**
- Absents : 100 - 30 (max) = **70** personnes → **70%**

**Diagramme affiché :**
```
🔵 Étude Biblique: 10% (10 personnes)
🟣 Heure de Réveil: 10% (10 personnes)
🟢 Culte Dominical: 30% (30 personnes)
🔴 Absents: 70% (70 personnes)
```

## 🔧 Logique de calcul

### 1. Total des membres
```typescript
const totalMembers = reportsToAnalyze.reduce((sum, r) => 
    sum + (r.initialMembersCount || 0), 0
);
```

### 2. Total par programme
```typescript
const totalBibleStudy = reportsToAnalyze.reduce((sum, r) => 
    sum + (r.bibleStudy || 0), 0
);
const totalMiracleHour = reportsToAnalyze.reduce((sum, r) => 
    sum + (r.miracleHour || 0), 0
);
const totalSundayService = reportsToAnalyze.reduce((sum, r) => 
    sum + (r.sundayServiceAttendance || 0), 0
);
```

### 3. Calcul des pourcentages
```typescript
const bibleStudyPercent = Math.round((totalBibleStudy / totalMembers) * 100);
const miracleHourPercent = Math.round((totalMiracleHour / totalMembers) * 100);
const sundayServicePercent = Math.round((totalSundayService / totalMembers) * 100);
```

### 4. Calcul des absents
```typescript
const missingPercent = Math.max(0, 100 - Math.max(
    bibleStudyPercent, 
    miracleHourPercent, 
    sundayServicePercent
));

const missingCount = totalMembers - Math.max(
    totalBibleStudy, 
    totalMiracleHour, 
    totalSundayService
);
```

**Note :** On utilise le **maximum** des trois programmes pour calculer les absents, car une personne peut participer à plusieurs programmes.

## 📊 Affichage

### Labels sur le diagramme
Chaque section affiche :
```
Nom du programme: X% (Y personnes)
```

Exemple :
```
Étude Biblique: 10% (10)
```

### Tooltip au survol
Au survol d'une section, affiche :
```
Nom du programme
X% (Y personnes)
```

### Légende
Affiche les 4 catégories avec leurs couleurs respectives.

## 🎯 Interprétation

### Exemple 1 : Bonne participation

**Données :**
- Total : 100 membres
- Étude Biblique : 80 (80%)
- Heure de Réveil : 75 (75%)
- Culte : 90 (90%)
- Absents : 10 (10%)

**Interprétation :** ✅ Excellente participation, seulement 10% d'absents

### Exemple 2 : Participation faible

**Données :**
- Total : 100 membres
- Étude Biblique : 20 (20%)
- Heure de Réveil : 15 (15%)
- Culte : 30 (30%)
- Absents : 70 (70%)

**Interprétation :** ⚠️ Participation faible, 70% d'absents - Actions nécessaires

### Exemple 3 : Participation variable

**Données :**
- Total : 100 membres
- Étude Biblique : 40 (40%)
- Heure de Réveil : 30 (30%)
- Culte : 80 (80%)
- Absents : 20 (20%)

**Interprétation :** 📊 Bonne participation au culte, à améliorer pour les autres programmes

## 🔍 Cas d'usage

### 1. Identifier les programmes à renforcer
Si l'Étude Biblique a un faible taux, organiser des sessions plus attractives.

### 2. Mesurer l'engagement
Un taux élevé d'absents indique un problème d'engagement à résoudre.

### 3. Comparer les périodes
Voir l'évolution du taux de participation d'une période à l'autre.

### 4. Prendre des décisions
Adapter les horaires ou formats selon les taux de participation.

## 📝 Sources des données

Les données proviennent des rapports hebdomadaires :
- **initialMembersCount** : Total des membres inscrits
- **bibleStudy** : Participants à l'Étude Biblique
- **miracleHour** : Participants à l'Heure de Réveil
- **sundayServiceAttendance** : Participants au Culte Dominical

## ✅ Avantages

1. **Visibilité claire** : Voir d'un coup d'œil la participation
2. **Identification rapide** : Les absents en rouge attirent l'attention
3. **Données concrètes** : Pourcentages ET nombres absolus
4. **Prise de décision** : Savoir où concentrer les efforts
5. **Motivation** : Voir les progrès au fil du temps

## 🎨 Exemple visuel

```
        Taux de Participation aux Programmes
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

              🔵 10%
         🟣 10%    Étude Biblique
                   (10 personnes)
    
    🔴 70%              🟢 30%
    Absents             Culte
    (70)                (30)
    
         Heure de Réveil
         (10 personnes)
```

## 🔄 Mise à jour automatique

Le graphique se met à jour automatiquement :
- ✅ Quand la plage de dates change
- ✅ Quand de nouveaux rapports sont soumis
- ✅ Selon le filtrage hiérarchique de l'utilisateur

**Actualisez la page du dashboard** pour voir le nouveau graphique ! 📊
