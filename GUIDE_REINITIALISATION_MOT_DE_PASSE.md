# Guide de Réinitialisation de Mot de Passe

## Vue d'ensemble

Le système de réinitialisation de mot de passe utilise WhatsApp comme canal de communication sécurisé. Les utilisateurs demandent une réinitialisation via un formulaire, puis envoient leurs informations par WhatsApp à l'administrateur qui génère un lien de réinitialisation.

## Workflow Complet

### 1. **Demande de réinitialisation par l'utilisateur**

**Page** : `/request-password-reset`

L'utilisateur remplit un formulaire avec :
- Nom complet
- Numéro de téléphone (utilisé lors de l'inscription)
- Région
- Groupe/District (facultatif)
- District/Localité (facultatif)
- Nom du Pasteur de Groupe/District (facultatif)
- Nom du Pasteur de District/Localité (facultatif)

**Actions** :
1. L'utilisateur soumet le formulaire
2. Le système vérifie les informations dans la base de données
3. Si les informations sont correctes, un token de réinitialisation est généré
4. Un message WhatsApp pré-formaté est affiché à l'utilisateur

**Message WhatsApp généré** :
```
📋 DEMANDE DE RÉINITIALISATION DE MOT DE PASSE

Nom: [Nom de l'utilisateur]
Région: [Région]
Groupe/District: [Groupe]
District/Localité: [District]
Pasteur de Groupe/District: [Nom du pasteur]
Pasteur de District/Localité: [Nom du pasteur]
Téléphone: [Numéro]

Token de réinitialisation: [token généré]
```

**Options pour l'utilisateur** :
- 📱 **Ouvrir WhatsApp** : Ouvre WhatsApp avec le message pré-rempli
- 📋 **Copier le message** : Copie le message dans le presse-papiers

**Numéro WhatsApp** : +229 01 67 91 91 50

### 2. **Traitement par l'administrateur**

**Rôle** : NATIONAL_COORDINATOR uniquement

**Page** : `/admin-reset-link`

**Processus** :
1. L'administrateur reçoit le message WhatsApp de l'utilisateur
2. Il copie le token de réinitialisation du message
3. Il se connecte à l'application et accède à "Réinitialisation MDP"
4. Il colle le token dans le formulaire
5. Il clique sur "Générer le lien"
6. Un lien de réinitialisation est généré

**Actions disponibles** :
- 📱 **Envoyer par WhatsApp** : Ouvre WhatsApp avec le lien pré-rempli
- 📋 **Copier le lien** : Copie le lien dans le presse-papiers

**Message WhatsApp envoyé à l'utilisateur** :
```
Bonjour,

Voici votre lien de réinitialisation de mot de passe :

[lien généré]

Ce lien est valide pendant 24 heures.

Cordialement,
MVCP-BENIN
```

### 3. **Réinitialisation par l'utilisateur**

**Page** : `/reset-password?token=[token]`

L'utilisateur :
1. Clique sur le lien reçu par WhatsApp
2. Arrive sur la page de réinitialisation
3. Saisit son nouveau mot de passe (min. 6 caractères)
4. Confirme le nouveau mot de passe
5. Soumet le formulaire
6. Le mot de passe est mis à jour
7. L'utilisateur est redirigé vers la page de connexion

## Sécurité

### Validation des informations
- Le système vérifie que le nom, la région, le groupe et le district correspondent à l'utilisateur
- Si les informations ne correspondent pas, la demande est rejetée

### Token de réinitialisation
- **Génération** : Token aléatoire de 64 caractères (32 bytes en hexadécimal)
- **Stockage** : Le token est hashé avec SHA-256 avant d'être stocké en base de données
- **Expiration** : 24 heures après la génération
- **Usage unique** : Le token est supprimé après utilisation

### Protection
- Le token original n'est jamais stocké en base de données
- Seul le hash SHA-256 est stocké
- Le token ne peut être utilisé qu'une seule fois
- Le lien expire automatiquement après 24 heures

## Endpoints Backend

### 1. **POST /auth/request-password-reset**

**Description** : Demande de réinitialisation de mot de passe

**Body** :
```json
{
  "name": "string",
  "contact": "string",
  "region": "string",
  "group": "string (optional)",
  "district": "string (optional)",
  "groupPastorName": "string (optional)",
  "districtPastorName": "string (optional)"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Veuillez envoyer les informations suivantes par WhatsApp..."
}
```

**Erreurs** :
- `404` : Utilisateur non trouvé
- `400` : Informations incorrectes

### 2. **POST /auth/reset-password**

**Description** : Réinitialisation du mot de passe avec le token

**Body** :
```json
{
  "token": "string",
  "newPassword": "string"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Votre mot de passe a été réinitialisé avec succès."
}
```

**Erreurs** :
- `400` : Token invalide ou expiré
- `400` : Mot de passe trop court (min. 6 caractères)

## Schéma de Base de Données

**Champs ajoutés au modèle User** :
```typescript
resetPasswordToken?: string;      // Hash SHA-256 du token
resetPasswordExpires?: Date;       // Date d'expiration (24h)
```

## Pages Frontend

### 1. **PasswordResetRequestPage** (`/request-password-reset`)
- Formulaire de demande de réinitialisation
- Génération du message WhatsApp
- Boutons pour ouvrir WhatsApp ou copier le message

### 2. **PasswordResetPage** (`/reset-password`)
- Formulaire de saisie du nouveau mot de passe
- Validation du token
- Confirmation du mot de passe
- Affichage/masquage du mot de passe

### 3. **AdminResetLinkPage** (`/admin-reset-link`)
- **Accès** : NATIONAL_COORDINATOR uniquement
- Génération du lien de réinitialisation à partir du token
- Boutons pour envoyer par WhatsApp ou copier le lien

## Navigation

### Pour tous les utilisateurs
- Lien "Mot de passe oublié ?" sur la page de connexion → `/request-password-reset`

### Pour NATIONAL_COORDINATOR
- Lien "Réinitialisation MDP" dans la barre de navigation → `/admin-reset-link`

## Workflow Visuel

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. UTILISATEUR                                                  │
│    - Remplit le formulaire de demande                           │
│    - Envoie le message WhatsApp avec le token                   │
│    - Numéro : +229 01 67 91 91 50                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. ADMINISTRATEUR (NATIONAL_COORDINATOR)                        │
│    - Reçoit le message WhatsApp                                 │
│    - Copie le token                                             │
│    - Génère le lien de réinitialisation                         │
│    - Envoie le lien par WhatsApp à l'utilisateur               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. UTILISATEUR                                                  │
│    - Reçoit le lien par WhatsApp                                │
│    - Clique sur le lien                                         │
│    - Saisit son nouveau mot de passe                            │
│    - Se connecte avec le nouveau mot de passe                   │
└─────────────────────────────────────────────────────────────────┘
```

## Messages d'erreur

### Demande de réinitialisation
- "Aucun utilisateur trouvé avec ce numéro de téléphone."
- "Les informations fournies ne correspondent pas à notre base de données."

### Réinitialisation
- "Token de réinitialisation invalide ou expiré."
- "Token de réinitialisation expiré. Veuillez faire une nouvelle demande."
- "Le mot de passe doit contenir au moins 6 caractères."
- "Les mots de passe ne correspondent pas."

## Bonnes Pratiques

### Pour l'utilisateur
1. Vérifiez que toutes vos informations sont correctes avant de soumettre
2. Envoyez le message WhatsApp rapidement (le token expire après 24h)
3. Utilisez le lien de réinitialisation dès que vous le recevez
4. Choisissez un mot de passe sécurisé (min. 6 caractères)

### Pour l'administrateur
1. Vérifiez l'identité de la personne avant de générer le lien
2. Assurez-vous d'envoyer le lien à la bonne personne
3. Ne partagez jamais le lien publiquement
4. Informez l'utilisateur que le lien expire après 24 heures

## Dépannage

### Le token ne fonctionne pas
- Vérifiez que le token n'a pas expiré (24h)
- Vérifiez que le token n'a pas déjà été utilisé
- Demandez un nouveau token si nécessaire

### L'utilisateur ne peut pas faire de demande
- Vérifiez que le numéro de téléphone est correct
- Vérifiez que les informations correspondent à celles de l'inscription
- Contactez l'administrateur si le problème persiste

### Le lien ne s'ouvre pas
- Vérifiez la connexion internet
- Essayez de copier-coller le lien dans un navigateur
- Vérifiez que le lien est complet et non tronqué
