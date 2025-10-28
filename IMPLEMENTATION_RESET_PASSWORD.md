# Implémentation du Système de Réinitialisation de Mot de Passe

## ✅ Résumé

Un système complet de réinitialisation de mot de passe via WhatsApp a été implémenté. Les utilisateurs demandent une réinitialisation, envoient leurs informations par WhatsApp, et l'administrateur génère un lien sécurisé.

## 📁 Fichiers Créés

### Backend

1. **`backend/src/auth/dto/reset-password-request.dto.ts`**
   - DTO pour la demande de réinitialisation
   - Champs : name, contact, region, group, district, groupPastorName, districtPastorName

2. **`backend/src/auth/dto/reset-password.dto.ts`**
   - DTO pour la réinitialisation avec token
   - Champs : token, newPassword

### Frontend

3. **`components/PasswordResetRequestPage.tsx`**
   - Page de demande de réinitialisation (`/request-password-reset`)
   - Formulaire avec validation des informations
   - Génération du message WhatsApp
   - Boutons pour ouvrir WhatsApp ou copier le message

4. **`components/PasswordResetPage.tsx`**
   - Page de réinitialisation (`/reset-password?token=...`)
   - Formulaire de saisie du nouveau mot de passe
   - Validation et confirmation du mot de passe
   - Affichage/masquage du mot de passe

5. **`components/AdminResetLinkPage.tsx`**
   - Page admin pour générer les liens (`/admin-reset-link`)
   - Accessible uniquement au NATIONAL_COORDINATOR
   - Génération du lien à partir du token
   - Boutons pour envoyer par WhatsApp ou copier

### Documentation

6. **`GUIDE_REINITIALISATION_MOT_DE_PASSE.md`**
   - Guide complet pour les utilisateurs et administrateurs
   - Workflow détaillé
   - Messages d'erreur et dépannage

7. **`IMPLEMENTATION_RESET_PASSWORD.md`** (ce fichier)
   - Documentation technique pour les développeurs

## 📝 Fichiers Modifiés

### Backend

1. **`backend/src/users/schemas/user.schema.ts`**
   - Ajout de `resetPasswordToken?: string`
   - Ajout de `resetPasswordExpires?: Date`

2. **`backend/src/auth/auth.service.ts`**
   - Ajout de `requestPasswordReset()` : Vérifie les infos et génère le token
   - Ajout de `resetPassword()` : Réinitialise le mot de passe avec le token
   - Import de `crypto` pour la génération de tokens sécurisés

3. **`backend/src/auth/auth.controller.ts`**
   - Ajout de `POST /auth/request-password-reset`
   - Ajout de `POST /auth/reset-password`

4. **`backend/src/users/users.service.ts`**
   - Ajout de `updateResetToken()` : Stocke le token hashé
   - Ajout de `findByResetToken()` : Recherche par token
   - Ajout de `updatePassword()` : Met à jour le mot de passe

### Frontend

5. **`App.tsx`**
   - Import des nouvelles pages
   - Ajout de la route `/request-password-reset`
   - Ajout de la route `/reset-password`
   - Ajout de la route `/admin-reset-link` (protégée NATIONAL_COORDINATOR)
   - Ajout du lien "Réinitialisation MDP" dans la navigation admin
   - Modification de `handleForgotPassword()` pour rediriger vers `/request-password-reset`

6. **`services/api.real.ts`**
   - Remplacement de `resetPassword(email)` par deux nouvelles méthodes :
     - `requestPasswordReset(requestData)` : Demande de réinitialisation
     - `resetPassword({ token, newPassword })` : Réinitialisation avec token
   - Gestion des erreurs détaillées de l'API

7. **`config/api.config.ts`**
   - Ajout de `AUTH: '/auth'` dans les endpoints

8. **`components/icons.tsx`**
   - Ajout de `EyeIcon` : Icône pour afficher le mot de passe
   - Ajout de `EyeOffIcon` : Icône pour masquer le mot de passe

## 🔐 Sécurité Implémentée

### Génération du Token
```typescript
const resetToken = crypto.randomBytes(32).toString('hex'); // 64 caractères
const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
```

### Stockage
- Le token original est envoyé à l'utilisateur via WhatsApp
- Seul le hash SHA-256 est stocké en base de données
- Expiration : 24 heures

### Validation
- Vérification du nom, région, groupe, district
- Vérification de l'expiration du token
- Token supprimé après utilisation

## 🌐 Endpoints API

### 1. POST /auth/request-password-reset

**Request** :
```json
{
  "name": "Jean Dupont",
  "contact": "0123456789",
  "region": "Littoral",
  "group": "Groupe A",
  "district": "District 1",
  "groupPastorName": "Pasteur Martin",
  "districtPastorName": "Pasteur Pierre"
}
```

**Response** :
```json
{
  "success": true,
  "message": "Veuillez envoyer les informations suivantes par WhatsApp au +229 01 67 91 91 50 :\n\n📋 DEMANDE DE RÉINITIALISATION DE MOT DE PASSE\n\nNom: Jean Dupont\n..."
}
```

### 2. POST /auth/reset-password

**Request** :
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "nouveauMotDePasse123"
}
```

**Response** :
```json
{
  "success": true,
  "message": "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter."
}
```

## 🎨 Fonctionnalités Frontend

### PasswordResetRequestPage

**Fonctionnalités** :
- Formulaire avec validation
- Chargement dynamique des groupes et districts
- Terminologie adaptée selon la région (Littoral vs Autres)
- Génération du message WhatsApp pré-formaté
- Bouton "Ouvrir WhatsApp" avec deep link
- Bouton "Copier le message"

**Validation** :
- Tous les champs requis sont vérifiés
- Les informations doivent correspondre à la base de données

### PasswordResetPage

**Fonctionnalités** :
- Extraction du token depuis l'URL (`?token=...`)
- Formulaire de saisie du nouveau mot de passe
- Confirmation du mot de passe
- Affichage/masquage du mot de passe avec icônes
- Validation : min. 6 caractères, mots de passe identiques
- Redirection vers `/login` après succès

### AdminResetLinkPage

**Fonctionnalités** :
- Accessible uniquement au NATIONAL_COORDINATOR
- Formulaire de saisie du token
- Génération du lien de réinitialisation
- Bouton "Envoyer par WhatsApp" avec deep link
- Bouton "Copier le lien"
- Instructions détaillées
- Avertissements de sécurité

## 📱 Intégration WhatsApp

### Deep Links Utilisés

**Ouvrir WhatsApp avec message pré-rempli** :
```typescript
const phoneNumber = '22901679191150'; // Format international
const encodedMessage = encodeURIComponent(message);
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
window.open(whatsappUrl, '_blank');
```

**Ouvrir WhatsApp sans numéro spécifique** :
```typescript
const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
window.open(whatsappUrl, '_blank');
```

## 🔄 Workflow Complet

```
1. Utilisateur oublie son mot de passe
   ↓
2. Clique sur "Mot de passe oublié ?" → /request-password-reset
   ↓
3. Remplit le formulaire avec ses informations
   ↓
4. Backend vérifie les informations et génère un token
   ↓
5. Message WhatsApp pré-formaté affiché à l'utilisateur
   ↓
6. Utilisateur envoie le message au +229 01 67 91 91 50
   ↓
7. Administrateur reçoit le message WhatsApp
   ↓
8. Administrateur se connecte → /admin-reset-link
   ↓
9. Administrateur colle le token et génère le lien
   ↓
10. Administrateur envoie le lien par WhatsApp à l'utilisateur
    ↓
11. Utilisateur clique sur le lien → /reset-password?token=...
    ↓
12. Utilisateur saisit son nouveau mot de passe
    ↓
13. Backend valide le token et met à jour le mot de passe
    ↓
14. Utilisateur est redirigé vers /login
    ↓
15. Utilisateur se connecte avec son nouveau mot de passe
```

## 🧪 Tests à Effectuer

### Backend

1. **Test de demande de réinitialisation** :
   - ✅ Avec informations correctes
   - ✅ Avec numéro de téléphone inexistant
   - ✅ Avec nom incorrect
   - ✅ Avec région incorrecte

2. **Test de réinitialisation** :
   - ✅ Avec token valide
   - ✅ Avec token expiré
   - ✅ Avec token déjà utilisé
   - ✅ Avec token invalide
   - ✅ Avec mot de passe trop court

### Frontend

1. **PasswordResetRequestPage** :
   - ✅ Remplissage du formulaire
   - ✅ Validation des champs
   - ✅ Génération du message WhatsApp
   - ✅ Bouton "Ouvrir WhatsApp"
   - ✅ Bouton "Copier le message"

2. **PasswordResetPage** :
   - ✅ Extraction du token depuis l'URL
   - ✅ Saisie du nouveau mot de passe
   - ✅ Confirmation du mot de passe
   - ✅ Affichage/masquage du mot de passe
   - ✅ Validation du formulaire
   - ✅ Redirection après succès

3. **AdminResetLinkPage** :
   - ✅ Accès restreint au NATIONAL_COORDINATOR
   - ✅ Génération du lien
   - ✅ Bouton "Envoyer par WhatsApp"
   - ✅ Bouton "Copier le lien"

## 📊 Base de Données

### Champs Ajoutés au Modèle User

```typescript
@Prop()
resetPasswordToken?: string; // Hash SHA-256 du token

@Prop()
resetPasswordExpires?: Date; // Date d'expiration (24h)
```

### Méthodes Ajoutées au UsersService

```typescript
async updateResetToken(userId: string, token: string, expires: Date): Promise<void>
async findByResetToken(token: string): Promise<UserDocument | null>
async updatePassword(userId: string, hashedPassword: string): Promise<void>
```

## 🎯 Points Clés

1. **Sécurité** : Token hashé avec SHA-256, expiration 24h, usage unique
2. **WhatsApp** : Communication via WhatsApp pour plus de sécurité
3. **Validation** : Vérification stricte des informations utilisateur
4. **UX** : Interface intuitive avec boutons WhatsApp et copier
5. **Admin** : Page dédiée pour générer les liens de réinitialisation
6. **Documentation** : Guide complet pour utilisateurs et administrateurs

## 🚀 Déploiement

Aucune configuration supplémentaire n'est nécessaire. Le système utilise les packages déjà installés :
- `crypto` (Node.js natif)
- `bcrypt` (déjà utilisé pour les mots de passe)

## 📞 Support

**Numéro WhatsApp** : +229 01 67 91 91 50

Ce numéro est utilisé pour :
- Recevoir les demandes de réinitialisation
- Envoyer les liens de réinitialisation
