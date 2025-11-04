# 🔍 Guide de Débogage - Dashboard Vide pour GROUP_PASTOR

## Problème
Le pasteur de groupe se connecte mais le dashboard est vide, même si un responsable de cellule de son groupe a soumis un rapport.

## Modifications effectuées

### ✅ Logs de débogage ajoutés dans `backend/src/reports/reports.service.ts`

J'ai ajouté des logs pour tracer :
1. Les informations de l'utilisateur qui fait la requête
2. La requête MongoDB générée
3. Le nombre de rapports trouvés
4. Les détails du premier rapport (si trouvé)

## 🔍 Étapes de débogage

### 1. Redémarrer le backend

```bash
cd backend
npm run start:dev
```

### 2. Se connecter en tant que GROUP_PASTOR

Connectez-vous avec votre compte pasteur de groupe.

### 3. Accéder au tableau de bord

Cliquez sur "Tableau de bord" dans la navigation.

### 4. Vérifier les logs du backend

Dans le terminal où tourne le backend, vous devriez voir des logs comme :

```
🔍 [REPORTS SERVICE] Utilisateur: {
  role: 'GROUP_PASTOR',
  name: 'Nom du pasteur',
  region: 'Littoral',
  group: 'ZOGBO',
  district: undefined
}

🔍 [REPORTS SERVICE] Query MongoDB: {
  "cellDate": {
    "$gte": "2024-10-04",
    "$lte": "2024-11-04"
  },
  "region": "Littoral",
  "group": "ZOGBO"
}

🔍 [REPORTS SERVICE] Nombre de rapports trouvés: 0
```

## 🎯 Diagnostic selon les logs

### Cas 1 : `region` ou `group` est `undefined`

**Problème** : Le pasteur de groupe n'a pas les bonnes informations dans son profil.

**Solution** :
1. Vérifier dans la base de données MongoDB que l'utilisateur a bien `region` et `group` renseignés
2. Si manquants, mettre à jour le profil utilisateur

**Commande MongoDB** :
```javascript
// Se connecter à MongoDB
mongosh

// Utiliser la base de données
use test

// Vérifier l'utilisateur
db.users.findOne({ email: "email@pasteur.com" })

// Mettre à jour si nécessaire
db.users.updateOne(
  { email: "email@pasteur.com" },
  { $set: { region: "Littoral", group: "ZOGBO" } }
)
```

### Cas 2 : Query correcte mais 0 rapports trouvés

**Problème** : Les rapports soumis n'ont pas les mêmes valeurs de `region` et `group`.

**Solution** :
1. Vérifier les rapports dans la base de données
2. Comparer les valeurs exactes (attention à la casse et aux espaces)

**Commande MongoDB** :
```javascript
// Voir tous les rapports
db.reports.find().pretty()

// Voir les rapports d'une région/groupe spécifique
db.reports.find({ region: "Littoral", group: "ZOGBO" }).pretty()

// Voir les valeurs uniques de region et group dans les rapports
db.reports.distinct("region")
db.reports.distinct("group")
```

### Cas 3 : Différence de casse ou d'espaces

**Exemple de problème** :
- Utilisateur : `region: "Littoral"`, `group: "ZOGBO"`
- Rapport : `region: "littoral"`, `group: "Zogbo"` ❌

**Solution** : Normaliser les données

**Option A** : Mettre à jour les rapports
```javascript
db.reports.updateMany(
  { region: "littoral" },
  { $set: { region: "Littoral" } }
)

db.reports.updateMany(
  { group: "Zogbo" },
  { $set: { group: "ZOGBO" } }
)
```

**Option B** : Mettre à jour l'utilisateur
```javascript
db.users.updateOne(
  { email: "email@pasteur.com" },
  { $set: { region: "littoral", group: "Zogbo" } }
)
```

### Cas 4 : Plage de dates incorrecte

**Problème** : Le rapport a été soumis en dehors de la plage de dates affichée.

**Solution** :
1. Vérifier la date du rapport : `cellDate`
2. Vérifier la plage de dates dans le dashboard (par défaut : dernier mois)
3. Ajuster la plage de dates si nécessaire

## 📊 Vérifications supplémentaires

### 1. Vérifier le rapport soumis

```javascript
// Voir le dernier rapport soumis
db.reports.find().sort({ submittedAt: -1 }).limit(1).pretty()
```

Vérifiez que le rapport contient :
- ✅ `region` : Doit correspondre à celle du pasteur
- ✅ `group` : Doit correspondre à celui du pasteur
- ✅ `cellDate` : Doit être dans la plage de dates affichée

### 2. Vérifier le profil du pasteur

```javascript
// Voir le profil du pasteur de groupe
db.users.findOne({ role: "GROUP_PASTOR", name: "Nom du pasteur" })
```

Vérifiez que l'utilisateur a :
- ✅ `role: "GROUP_PASTOR"`
- ✅ `region` : Renseigné et correct
- ✅ `group` : Renseigné et correct
- ✅ `status: "approved"`

### 3. Vérifier le profil du responsable de cellule

```javascript
// Voir le profil du responsable qui a soumis le rapport
db.users.findOne({ role: "CELL_LEADER", cellName: "Nom de la cellule" })
```

Vérifiez que le responsable a :
- ✅ `region` : Même que le pasteur
- ✅ `group` : Même que le pasteur
- ✅ `district` : Renseigné

## 🔧 Solutions rapides

### Solution 1 : Resoumettre le rapport

Demandez au responsable de cellule de soumettre à nouveau son rapport en s'assurant que :
- La région est correcte
- Le groupe est correct
- Le district est correct

### Solution 2 : Corriger les données existantes

Si les données sont incorrectes dans la base, utilisez les commandes MongoDB ci-dessus pour les corriger.

### Solution 3 : Vérifier la connexion JWT

Assurez-vous que le JWT contient bien les informations de l'utilisateur :

**Dans le frontend (Console du navigateur)** :
```javascript
// Vérifier le user dans localStorage
JSON.parse(localStorage.getItem('user'))
```

Devrait afficher :
```json
{
  "uid": "...",
  "name": "Nom du pasteur",
  "role": "GROUP_PASTOR",
  "region": "Littoral",
  "group": "ZOGBO",
  "status": "approved"
}
```

## 📝 Checklist de vérification

- [ ] Backend redémarré
- [ ] Logs visibles dans le terminal backend
- [ ] Utilisateur GROUP_PASTOR a `region` et `group` renseignés
- [ ] Rapport soumis a les mêmes `region` et `group`
- [ ] Pas de différence de casse (Littoral vs littoral)
- [ ] Pas d'espaces en trop
- [ ] Date du rapport dans la plage affichée
- [ ] JWT contient les bonnes informations

## 🆘 Si le problème persiste

Envoyez-moi les logs suivants :

1. **Log de l'utilisateur** :
```
🔍 [REPORTS SERVICE] Utilisateur: { ... }
```

2. **Log de la query** :
```
🔍 [REPORTS SERVICE] Query MongoDB: { ... }
```

3. **Log des résultats** :
```
🔍 [REPORTS SERVICE] Nombre de rapports trouvés: ...
```

4. **Résultat de la commande MongoDB** :
```javascript
db.reports.find({ region: "Littoral", group: "ZOGBO" }).pretty()
```

Avec ces informations, je pourrai identifier précisément le problème !
