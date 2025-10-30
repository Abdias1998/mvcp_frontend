# Titres de Pages Contextuels

## Vue d'ensemble

Les en-têtes de toutes les pages principales affichent maintenant des informations contextuelles selon le rôle et la hiérarchie de l'utilisateur connecté.

## Fichier Utilitaire

**Fichier** : `utils/pageTitle.ts`

### Fonctions

1. **`getContextualPageTitle(baseTitle: string, user: User | null): string`**
   - Génère un titre contextualisé avec groupe/district/région
   
2. **`getContextualDescription(baseDescription: string, user: User | null): string`**
   - Ajoute le nom du responsable à la description

## Exemples de Titres par Rôle

### 1. Responsable de Cellule (CELL_LEADER)

**Page Rapport** :
```
Rapport Hebdomadaire de Cellule du district de ZOGBO/groupe AGLA
```

**Page Évolution** :
```
Évolution des Cellules du district de ZOGBO/groupe AGLA
```

### 2. Pasteur de District (DISTRICT_PASTOR)

**Page Évolution** :
```
Évolution des Cellules du district AGLA
```

**Page Centre de Gestion** :
```
Centre de Gestion du district AGLA
```

**Page Mon Équipe** :
```
Mon Équipe du district AGLA
Responsable du district: Jean Dupont
```

### 3. Pasteur de Groupe (GROUP_PASTOR)

**Page Centre de Gestion** :
```
Centre de Gestion Groupe ZOGBO
```

**Page Mon Équipe** :
```
Mon Équipe Groupe ZOGBO
Responsable du groupe: Marie Martin
```

**Page Évolution** :
```
Évolution des Cellules Groupe ZOGBO
```

### 4. Pasteur Régional (REGIONAL_PASTOR)

**Page Mon Équipe** :
```
Mon Équipe Région Littoral
Responsable de la région: Paul Durand
```

**Page Centre de Gestion** :
```
Centre de Gestion Région Littoral
```

**Page Évolution** :
```
Évolution des Cellules Région Littoral
```

### 5. Coordinateur National (NATIONAL_COORDINATOR)

Les titres restent génériques sans contexte supplémentaire :
```
Tableau de bord
Centre de Gestion
Évolution des Cellules
```

## Terminologie Adaptée

La terminologie s'adapte automatiquement selon la région :

### Région Littoral
- **Niveau 1** : Groupe
- **Niveau 2** : District

**Exemple** :
```
Rapport Hebdomadaire de Cellule du district de ZOGBO/groupe AGLA
```

### Autres Régions (Atlantique, Ouémé, etc.)
- **Niveau 1** : District
- **Niveau 2** : Localité

**Exemple** :
```
Rapport Hebdomadaire de Cellule de la localité de ZOGBO/district AGLA
```

## Pages Modifiées

| Page | Fichier | Titre Contextualisé |
|------|---------|---------------------|
| **Rapport Hebdomadaire** | `ReportForm.tsx` | ✅ Oui + Description |
| **Mon Équipe** | `TeamPage.tsx` | ✅ Oui + Description |
| **Évolution des Cellules** | `CellGrowthStatsPage.tsx` | ✅ Oui |
| **Centre de Gestion** | `ManagementPage.tsx` | ✅ Oui + Description |

## Avantages

✅ **Identification immédiate** : L'utilisateur sait quel périmètre il gère  
✅ **Personnalisation** : Chaque utilisateur voit son contexte spécifique  
✅ **Clarté** : Pas de confusion sur le niveau hiérarchique  
✅ **Terminologie adaptée** : Littoral vs Autres régions  
✅ **Maintenance facile** : Logique centralisée dans un fichier utilitaire  

## Comment ça marche ?

### 1. Import de la fonction
```typescript
import { getContextualPageTitle, getContextualDescription } from '../utils/pageTitle.ts';
```

### 2. Utilisation dans le composant
```typescript
const { user } = useAuth();
const pageTitle = getContextualPageTitle('Titre de base', user);
const pageDescription = getContextualDescription('Description de base', user);
```

### 3. Affichage dans le JSX
```tsx
<h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
<p className="text-gray-600 mt-1">{pageDescription}</p>
```

## Logique de Contextualisation

La fonction analyse :
1. **Le rôle de l'utilisateur** (CELL_LEADER, DISTRICT_PASTOR, etc.)
2. **Sa région** (Littoral ou autre)
3. **Ses informations hiérarchiques** (groupe, district, cellule)
4. **Son nom** (pour la description)

Et génère automatiquement le titre approprié avec la terminologie correcte.

## Tests Recommandés

Pour vérifier que tout fonctionne :

1. **Se connecter avec différents rôles** :
   - Responsable de Cellule
   - Pasteur de District
   - Pasteur de Groupe
   - Pasteur Régional
   - Coordinateur National

2. **Vérifier les titres sur chaque page** :
   - Rapport Hebdomadaire (`/rapport`)
   - Mon Équipe (`/team`)
   - Évolution des Cellules (`/cell-growth`)
   - Centre de Gestion (`/management`)

3. **Tester avec différentes régions** :
   - Littoral (doit afficher "Groupe" et "District")
   - Atlantique (doit afficher "District" et "Localité")

## Notes Techniques

- Les titres sont générés dynamiquement à chaque rendu
- Si l'utilisateur n'est pas connecté, le titre de base est affiché
- Si des informations hiérarchiques manquent, le contexte est partiel
- La fonction gère gracieusement les cas où certaines données sont absentes
