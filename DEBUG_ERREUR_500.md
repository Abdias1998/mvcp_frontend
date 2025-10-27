# 🔍 Guide de Débogage - Erreur 500

## ❌ Erreur Rencontrée
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

Cette erreur vient du **backend** et indique un problème côté serveur.

---

## 🎯 Étape 1 : Identifier la Source

### Ouvrir la Console du Navigateur
1. Appuyez sur **F12** (ou Ctrl+Shift+I)
2. Allez dans l'onglet **Console**
3. Cherchez les messages d'erreur en rouge

### Vérifier l'Onglet Network
1. Dans les outils de développement (F12)
2. Allez dans l'onglet **Network** (Réseau)
3. Reproduisez l'action qui cause l'erreur
4. Cherchez la requête en rouge (status 500)
5. Cliquez dessus et regardez :
   - **Request** : Les données envoyées
   - **Response** : La réponse du serveur
   - **Headers** : L'URL appelée

**Notez :**
- L'URL de la requête (ex: `/auth/login`, `/cell-leaders`, etc.)
- Les données envoyées (Request Payload)
- La réponse complète du serveur

---

## 🔎 Étape 2 : Diagnostics par Action

### Si l'erreur survient lors de la **Connexion**

**Endpoint concerné :** `POST /auth/login`

**Causes possibles :**
1. Le backend n'accepte pas le format `{ identifier, password }`
2. Le backend attend toujours `{ email, password }` ou `{ contact, password }`

**Solution temporaire :**
Revenir à l'ancien format dans `api.real.ts` :

```typescript
// Dans la fonction login, ligne 59-70
const isEmail = identifier.includes('@');
const loginData = isEmail 
  ? { email: identifier, password }
  : { contact: identifier, password };

// Au lieu de :
const loginData = { identifier, password };
```

### Si l'erreur survient lors de la **Création de Responsable de Cellule**

**Endpoint concerné :** `POST /cell-leaders`

**Causes possibles :**
1. L'endpoint `/cell-leaders` n'existe pas encore sur le backend
2. Le backend attend un format de données différent
3. Problème de validation des données

**Vérifications :**
1. Vérifier que l'endpoint existe sur le backend
2. Vérifier le format attendu par le backend
3. Vérifier les logs du backend

**Données envoyées :**
```typescript
{
  name: string,
  contact: string,
  region: string,
  group: string,
  district: string,
  cellName: string,
  cellCategory: string
}
```

### Si l'erreur survient lors de l'accès à **"Mon Équipe"**

**Endpoint concerné :** `GET /users/hierarchy`

**Causes possibles :**
1. L'endpoint `/users/hierarchy` n'existe pas encore
2. Le backend ne filtre pas correctement selon la hiérarchie
3. Problème avec le token d'authentification

**Solution temporaire :**
Désactiver temporairement cette fonctionnalité en commentant le composant.

### Si l'erreur survient lors de l'**Inscription**

**Endpoint concerné :** `POST /auth/register`

**Causes possibles :**
1. Le backend n'accepte pas l'email vide/null
2. Validation stricte sur le backend

**Vérification :**
Essayer de s'inscrire **avec** un email pour voir si ça fonctionne.

---

## 🛠️ Étape 3 : Solutions Rapides

### Solution 1 : Vérifier les Logs du Backend

Si vous avez accès aux logs du backend :
```bash
# Regarder les logs en temps réel
tail -f logs/error.log
# ou
npm run dev  # et regarder la console
```

Cherchez :
- Les erreurs de validation
- Les erreurs de base de données
- Les stack traces

### Solution 2 : Tester avec Postman/Insomnia

Testez directement les endpoints avec Postman :

**Test 1 : Login**
```
POST https://mvcp-cellule.onrender.com/auth/login
Content-Type: application/json

{
  "identifier": "test@email.com",
  "password": "password123"
}
```

**Test 2 : Create Cell Leader**
```
POST https://mvcp-cellule.onrender.com/cell-leaders
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Test Leader",
  "contact": "0123456789",
  "region": "Littoral",
  "group": "Groupe A",
  "district": "District 1",
  "cellName": "Test Cell",
  "cellCategory": "Cellule de Prière"
}
```

### Solution 3 : Rollback Temporaire

Si le problème persiste, revenez temporairement à l'ancien système :

1. **Pour le login**, utilisez l'ancien format :
   ```typescript
   // api.real.ts, ligne 59
   const isEmail = identifier.includes('@');
   const loginData = isEmail 
     ? { email: identifier, password }
     : { contact: identifier, password };
   ```

2. **Pour les responsables de cellule**, désactivez temporairement :
   - Commentez la route `/create-cell-leader` dans App.tsx
   - Commentez le lien "Mon Équipe" dans la navigation

---

## 📊 Étape 4 : Vérifications Backend

### Vérifier que le Backend a les Endpoints

Le backend doit avoir :

1. **`POST /cell-leaders`**
   ```typescript
   @Post()
   async createCellLeader(@Body() dto: CreateCellLeaderDto) {
     // Générer identifiant de 5 chiffres
     // Créer l'utilisateur
     // Retourner { identifier, user }
   }
   ```

2. **`GET /users/hierarchy`**
   ```typescript
   @Get('hierarchy')
   async getUsersByHierarchy(@Request() req) {
     // Filtrer selon req.user.role
     // Retourner les utilisateurs
   }
   ```

3. **`POST /auth/login` (modifié)**
   ```typescript
   @Post('login')
   async login(@Body() dto: LoginDto) {
     // Accepter { identifier, password }
     // OU { email, password }
     // OU { contact, password }
   }
   ```

### Vérifier les DTOs (Data Transfer Objects)

Le backend doit avoir les validations appropriées :

```typescript
// create-cell-leader.dto.ts
export class CreateCellLeaderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  contact: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsNotEmpty()
  group: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  cellName: string;

  @IsString()
  @IsNotEmpty()
  cellCategory: string;
}
```

---

## 🔧 Étape 5 : Corrections Frontend si Nécessaire

### Si le Backend attend un format différent

Modifiez la fonction `createCellLeader` dans `api.real.ts` :

```typescript
createCellLeader: async (cellLeaderData: any): Promise<{ success: boolean; message: string; identifier?: string }> => {
  try {
    // Adapter le format si nécessaire
    const adaptedData = {
      ...cellLeaderData,
      role: 'cell_leader', // Si le backend l'exige
      // Autres adaptations si nécessaire
    };
    
    const response = await httpClient.post<any>(
      API_CONFIG.ENDPOINTS.CELL_LEADERS,
      adaptedData
    );
    
    return {
      success: true,
      message: 'Responsable de cellule créé avec succès.',
      identifier: response.identifier || response.user?.identifier || response.data?.identifier
    };
  } catch (error: any) {
    // ... gestion d'erreur
  }
}
```

---

## 📝 Checklist de Débogage

- [ ] Ouvrir la console du navigateur (F12)
- [ ] Identifier l'action qui cause l'erreur
- [ ] Noter l'URL de la requête qui échoue
- [ ] Noter les données envoyées (Request Payload)
- [ ] Noter la réponse complète du serveur
- [ ] Vérifier les logs du backend (si accessible)
- [ ] Tester l'endpoint avec Postman
- [ ] Vérifier que l'endpoint existe sur le backend
- [ ] Vérifier le format des données attendu
- [ ] Adapter le code frontend si nécessaire

---

## 🆘 Informations à Fournir pour le Support

Si vous avez besoin d'aide, fournissez :

1. **L'action effectuée** : "J'ai essayé de..."
2. **L'URL de la requête** : "POST /cell-leaders"
3. **Les données envoyées** : 
   ```json
   {
     "name": "...",
     "contact": "..."
   }
   ```
4. **La réponse du serveur** : Copier la réponse complète
5. **Les logs de la console** : Copier les messages d'erreur
6. **Les logs du backend** : Si accessible

---

## 🎯 Prochaines Étapes

1. **Identifier la source** de l'erreur avec les outils de développement
2. **Vérifier le backend** pour s'assurer que les endpoints existent
3. **Adapter le frontend** si le format de données est différent
4. **Tester** à nouveau

---

**Besoin d'aide ?** Fournissez les informations ci-dessus pour un diagnostic plus précis.
