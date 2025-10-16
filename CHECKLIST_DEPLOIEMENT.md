# ✅ Checklist de Déploiement - Application MVCP

## 📋 Avant le Déploiement

### 1. Vérifications Techniques

- [ ] **Tests locaux réussis**
  - [ ] L'application démarre sans erreur (`npm run dev`)
  - [ ] La connexion à l'API fonctionne
  - [ ] L'authentification fonctionne
  - [ ] Toutes les pages se chargent correctement

- [ ] **Configuration de l'API**
  - [ ] L'URL de l'API est correcte dans `config/api.config.ts`
  - [ ] Tous les endpoints sont configurés
  - [ ] Le timeout est approprié (30-60 secondes)

- [ ] **Backend API**
  - [ ] L'API backend est déployée et accessible
  - [ ] Les endpoints répondent correctement
  - [ ] L'authentification JWT fonctionne
  - [ ] CORS est configuré pour autoriser le domaine frontend

### 2. Vérifications Fonctionnelles

- [ ] **Authentification**
  - [ ] Connexion fonctionne
  - [ ] Déconnexion fonctionne
  - [ ] Inscription fonctionne
  - [ ] Token JWT est correctement stocké
  - [ ] Token est ajouté aux requêtes

- [ ] **Gestion des Rapports**
  - [ ] Création de rapport
  - [ ] Consultation des rapports
  - [ ] Suppression de rapport
  - [ ] Filtres fonctionnent

- [ ] **Gestion des Cellules**
  - [ ] Création de cellule
  - [ ] Modification de cellule
  - [ ] Suppression de cellule
  - [ ] Filtres par région/groupe/district

- [ ] **Gestion des Pasteurs**
  - [ ] Inscription pasteur
  - [ ] Approbation pasteur
  - [ ] Modification pasteur
  - [ ] Suppression pasteur

- [ ] **Gestion des Événements**
  - [ ] Création d'événement
  - [ ] Modification d'événement
  - [ ] Suppression d'événement
  - [ ] Événements publics visibles

- [ ] **Communications**
  - [ ] Création de communication
  - [ ] Approbation/Rejet
  - [ ] Suppression
  - [ ] Filtres par statut

- [ ] **Ressources**
  - [ ] Ajout de ressource
  - [ ] Suppression de ressource
  - [ ] Téléchargement/Accès aux ressources

### 3. Tests par Rôle

- [ ] **Coordinateur National**
  - [ ] Accès à toutes les fonctionnalités
  - [ ] Peut approuver les pasteurs
  - [ ] Peut approuver les communications
  - [ ] Voit tous les rapports

- [ ] **Pasteur Régional**
  - [ ] Voit uniquement sa région
  - [ ] Peut gérer les groupes de sa région
  - [ ] Peut proposer des communications
  - [ ] Ne peut pas approuver les pasteurs

- [ ] **Pasteur de Groupe**
  - [ ] Voit uniquement son groupe
  - [ ] Peut gérer les districts de son groupe
  - [ ] Permissions appropriées

- [ ] **Pasteur de District**
  - [ ] Voit uniquement son district
  - [ ] Peut gérer les cellules de son district
  - [ ] Permissions appropriées

### 4. Gestion des Erreurs

- [ ] **Erreurs réseau**
  - [ ] Message d'erreur approprié affiché
  - [ ] Possibilité de réessayer
  - [ ] Pas de crash de l'application

- [ ] **Erreurs API**
  - [ ] 401 : Redirection vers login
  - [ ] 403 : Message "Non autorisé"
  - [ ] 404 : Message "Non trouvé"
  - [ ] 500 : Message "Erreur serveur"
  - [ ] 502/503 : Message "API en réveil"

- [ ] **Timeouts**
  - [ ] Message approprié après timeout
  - [ ] Possibilité de réessayer
  - [ ] Pas de blocage de l'interface

### 5. Performance

- [ ] **Temps de chargement**
  - [ ] Page d'accueil < 3 secondes
  - [ ] Première requête API acceptée (30-60s pour Render)
  - [ ] Requêtes suivantes < 2 secondes

- [ ] **Optimisations**
  - [ ] Images optimisées
  - [ ] Code minifié pour production
  - [ ] Lazy loading si applicable

## 🚀 Déploiement

### 1. Build de Production

```bash
# Créer le build de production
npm run build

# Vérifier le dossier dist/
ls -la dist/
```

- [ ] Build réussi sans erreur
- [ ] Dossier `dist/` créé
- [ ] Fichiers HTML, CSS, JS présents

### 2. Variables d'Environnement

- [ ] **Créer `.env.production`**
  ```env
  VITE_API_URL=https://mvcp-cellule.onrender.com
  VITE_APP_NAME=MVCP Bénin
  VITE_APP_VERSION=2.0.0
  ```

- [ ] Variables correctement configurées
- [ ] Pas de secrets exposés dans le code

### 3. Déploiement sur Netlify/Vercel

#### Option A : Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod
```

- [ ] Site déployé avec succès
- [ ] URL de production obtenue
- [ ] Redirections configurées (pour React Router)

#### Option B : Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

- [ ] Site déployé avec succès
- [ ] URL de production obtenue
- [ ] Redirections configurées

### 4. Configuration du Domaine

- [ ] **Domaine personnalisé** (si applicable)
  - [ ] DNS configuré
  - [ ] SSL/HTTPS activé
  - [ ] Redirection www configurée

### 5. Configuration CORS Backend

- [ ] **Autoriser le domaine frontend**
  ```typescript
  // Dans le backend NestJS
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://votre-domaine.com',
      'https://mvcp-benin.netlify.app'
    ],
    credentials: true,
  });
  ```

## 🧪 Tests Post-Déploiement

### 1. Tests Fonctionnels

- [ ] **Accès au site**
  - [ ] URL de production accessible
  - [ ] HTTPS fonctionne
  - [ ] Pas d'erreur de certificat

- [ ] **Connexion à l'API**
  - [ ] L'application se connecte à l'API
  - [ ] Pas d'erreur CORS
  - [ ] Authentification fonctionne

- [ ] **Toutes les fonctionnalités**
  - [ ] Tester chaque fonctionnalité en production
  - [ ] Vérifier les permissions par rôle
  - [ ] Tester sur différents navigateurs

### 2. Tests de Performance

- [ ] **Lighthouse Audit**
  - [ ] Performance > 80
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 80

- [ ] **Tests de charge**
  - [ ] L'application supporte plusieurs utilisateurs simultanés
  - [ ] Pas de ralentissement significatif

### 3. Tests de Sécurité

- [ ] **Authentification**
  - [ ] Token JWT sécurisé
  - [ ] Pas de token exposé dans l'URL
  - [ ] Session expire correctement

- [ ] **Données sensibles**
  - [ ] Pas de mot de passe en clair
  - [ ] Pas de données sensibles dans les logs
  - [ ] HTTPS obligatoire

## 📱 Tests Multi-Plateformes

### Navigateurs Desktop

- [ ] **Chrome** (dernière version)
- [ ] **Firefox** (dernière version)
- [ ] **Safari** (dernière version)
- [ ] **Edge** (dernière version)

### Navigateurs Mobile

- [ ] **Chrome Mobile** (Android)
- [ ] **Safari Mobile** (iOS)
- [ ] **Firefox Mobile**

### Tailles d'Écran

- [ ] **Mobile** (320px - 767px)
- [ ] **Tablet** (768px - 1023px)
- [ ] **Desktop** (1024px+)

## 📊 Monitoring et Logs

### 1. Configuration du Monitoring

- [ ] **Sentry** (ou équivalent)
  - [ ] Compte créé
  - [ ] SDK intégré
  - [ ] Erreurs trackées

- [ ] **Google Analytics** (optionnel)
  - [ ] Compte créé
  - [ ] Code de tracking ajouté
  - [ ] Événements configurés

### 2. Logs Backend

- [ ] **Logs d'erreur** activés
- [ ] **Logs d'accès** activés
- [ ] **Monitoring de l'API** configuré

## 📝 Documentation

### 1. Documentation Utilisateur

- [ ] **Guide d'utilisation** disponible
- [ ] **FAQ** créée
- [ ] **Tutoriels vidéo** (optionnel)

### 2. Documentation Technique

- [ ] **README.md** à jour
- [ ] **MIGRATION_API.md** disponible
- [ ] **GUIDE_UTILISATION.md** disponible
- [ ] **API endpoints** documentés

### 3. Formation

- [ ] **Session de formation** planifiée
- [ ] **Support utilisateur** disponible
- [ ] **Contacts d'urgence** définis

## 🔄 Maintenance

### 1. Sauvegarde

- [ ] **Base de données** sauvegardée
- [ ] **Code source** versionné (Git)
- [ ] **Configuration** documentée

### 2. Mises à Jour

- [ ] **Plan de mise à jour** défini
- [ ] **Procédure de rollback** documentée
- [ ] **Notifications utilisateurs** prévues

### 3. Support

- [ ] **Email de support** configuré
- [ ] **Système de tickets** (optionnel)
- [ ] **Équipe de support** formée

## 🎯 Critères de Succès

### Critères Techniques

- ✅ Uptime > 99%
- ✅ Temps de réponse < 2 secondes
- ✅ Taux d'erreur < 1%
- ✅ Score Lighthouse > 80

### Critères Fonctionnels

- ✅ Toutes les fonctionnalités opérationnelles
- ✅ Authentification sécurisée
- ✅ Données synchronisées en temps réel
- ✅ Interface responsive

### Critères Utilisateur

- ✅ Interface intuitive
- ✅ Messages d'erreur clairs
- ✅ Temps de chargement acceptable
- ✅ Support utilisateur disponible

## 📞 Contacts d'Urgence

### Équipe Technique

- **Développeur Principal** : [Nom] - [Email] - [Téléphone]
- **DevOps** : [Nom] - [Email] - [Téléphone]
- **Support** : [Email]

### Services Externes

- **Hébergement Frontend** : Netlify/Vercel Support
- **Hébergement Backend** : Render Support
- **Domaine** : [Registrar] Support

## 📅 Planning de Déploiement

### Phase 1 : Préparation (J-7)
- [ ] Tests complets
- [ ] Documentation finalisée
- [ ] Formation équipe

### Phase 2 : Déploiement Staging (J-3)
- [ ] Déploiement sur environnement de test
- [ ] Tests utilisateurs
- [ ] Corrections bugs

### Phase 3 : Déploiement Production (J-0)
- [ ] Déploiement production
- [ ] Tests post-déploiement
- [ ] Monitoring actif

### Phase 4 : Suivi (J+1 à J+7)
- [ ] Monitoring quotidien
- [ ] Support utilisateurs
- [ ] Corrections mineures

---

## ✅ Validation Finale

**Date de déploiement** : _______________

**Déployé par** : _______________

**Validé par** : _______________

**Statut** : ⬜ Réussi  ⬜ Échec  ⬜ Partiel

**Notes** :
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Version** : 2.0.0  
**Dernière mise à jour** : 15 octobre 2025
