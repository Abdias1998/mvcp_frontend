# 📚 Guide d'Utilisation - Système de Hiérarchie

## 🎯 Vue d'Ensemble

Le système gère maintenant une hiérarchie complète avec 5 niveaux de rôles :

```
1. Coordinateur National (NATIONAL_COORDINATOR)
   ↓
2. Pasteur Régional (REGIONAL_PASTOR)
   ↓
3. Pasteur de Groupe (GROUP_PASTOR)
   ↓
4. Pasteur de District (DISTRICT_PASTOR)
   ↓
5. Responsable de Cellule (CELL_LEADER)
```

---

## 👥 Rôles et Permissions

### 1. **Coordinateur National**
**Peut voir :**
- Tous les rapports de toutes les régions
- Tous les utilisateurs du système
- Statistiques globales

**Peut faire :**
- Gérer les groupes, districts, cellules
- Approuver les pasteurs
- Gérer les événements
- Voir la hiérarchie complète

### 2. **Pasteur Régional**
**Peut voir :**
- Rapports de sa région
- Cellules de sa région

**Peut faire :**
- Gérer les cellules de sa région
- Soumettre des rapports

### 3. **Pasteur de Groupe**
**Peut voir :**
- Rapports de son groupe
- **Tous les pasteurs de district** de son groupe
- **Tous les responsables de cellule** de son groupe
- Cellules de son groupe

**Peut faire :**
- Gérer les cellules de son groupe
- **Créer des responsables de cellule**
- Voir son équipe dans "Mon Équipe"
- Soumettre des rapports

### 4. **Pasteur de District**
**Peut voir :**
- Rapports de son district
- **Tous les responsables de cellule** de son district
- Cellules de son district

**Peut faire :**
- Gérer les cellules de son district
- **Créer des responsables de cellule**
- Voir son équipe dans "Mon Équipe"
- Soumettre des rapports

### 5. **Responsable de Cellule** (NOUVEAU ✨)
**Peut voir :**
- Rapports de sa cellule uniquement

**Peut faire :**
- **Soumettre des rapports** pour sa cellule
- Se connecter avec un **identifiant de 5 chiffres**

**Particularités :**
- ❌ Pas de mot de passe (sécurité simplifiée)
- ✅ Identifiant unique de 5 chiffres
- ✅ Créé par un pasteur de groupe ou de district

---

## 🔐 Système d'Authentification

### Inscription (Pasteurs uniquement)
1. Aller sur la page d'inscription
2. Remplir le formulaire :
   - Nom complet (requis)
   - **Email (facultatif)**
   - **Numéro de téléphone (obligatoire)**
   - Mot de passe (min. 6 caractères)
   - Rôle, Région, Groupe, District
3. Attendre l'approbation d'un administrateur

### Connexion

#### Pour les Pasteurs :
- Se connecter avec **email OU numéro de téléphone** + mot de passe
- Exemple :
  ```
  Identifiant : pasteur@email.com  OU  0123456789
  Mot de passe : ••••••
  ```

#### Pour les Responsables de Cellule :
- Se connecter avec **identifiant de 5 chiffres** uniquement
- Exemple :
  ```
  Identifiant : 12345
  Mot de passe : (laisser vide ou utiliser l'identifiant)
  ```

---

## 👨‍👩‍👧‍👦 Créer un Responsable de Cellule

### Étape 1 : Accéder au Formulaire
**Pour Pasteur de Groupe ou Pasteur de District :**

1. Se connecter à l'application
2. Aller dans **"Gestion"** (menu principal)
3. Cliquer sur l'onglet **"Responsables de Cellule"**
4. Cliquer sur le bouton **"+ Créer un Responsable de Cellule"**

### Étape 2 : Remplir le Formulaire
Remplir les informations suivantes :

- **Nom Complet** (requis)
- **Numéro de téléphone** (requis)
- **Région** (pré-rempli si vous avez une région)
- **Groupe** (pré-rempli si vous avez un groupe)
- **District** (pré-rempli si vous avez un district)
- **Nom de la Cellule** (requis)
- **Catégorie de la Cellule** (requis)

### Étape 3 : Récupérer l'Identifiant
Après la création :
1. Un **identifiant de 5 chiffres** s'affiche à l'écran
2. **⚠️ IMPORTANT** : Noter cet identifiant et le communiquer au responsable
3. Le responsable utilisera cet identifiant pour se connecter

**Exemple d'identifiant :** `45678`

---

## 👥 Voir Mon Équipe

### Pour Pasteur de Groupe ou Pasteur de District :

1. Se connecter à l'application
2. Cliquer sur **"Mon Équipe"** dans le menu principal
3. Voir la liste de tous les utilisateurs sous votre hiérarchie

**Informations affichées :**
- Nom et contact
- Rôle avec badge coloré
- Pour les responsables de cellule : Nom de la cellule et identifiant
- Pour les pasteurs : Région, Groupe, District
- Statut (Approuvé / En attente)

**Statistiques :**
- Total d'utilisateurs
- Nombre de pasteurs de district
- Nombre de responsables de cellule

---

## 📊 Navigation et Accès

### Menu Principal

#### Utilisateur NON connecté :
- ✅ **Accueil** (page publique)
- ✅ **Connexion**
- ✅ **S'inscrire**

#### Utilisateur connecté :
- ✅ **Accueil**
- ✅ **Rapport** (soumettre un rapport)
- ✅ **Tableau de bord** (statistiques et analyses)
- ✅ **Gestion** (gérer cellules, groupes, districts, etc.)
- ✅ **Mon Équipe** (uniquement pour GROUP_PASTOR et DISTRICT_PASTOR)
- ✅ **Déconnexion**

---

## 🗺️ Terminologie selon la Région

### Région Littoral
```
Région → Groupe → District → Cellule
```
**Exemple :** Littoral → Groupe A → District 1 → Cellule de Prière

### Autres Régions
```
Région → District (appelé "Groupe") → Localité (appelé "District") → Cellule
```
**Exemple :** Atlantique → District B (Groupe) → Localité 2 (District) → Cellule de Jeunes

**Note :** Cette distinction est gérée automatiquement par l'application.

---

## 🔧 Cas d'Usage Pratiques

### Cas 1 : Créer un Responsable de Cellule

**Contexte :** Vous êtes pasteur de groupe et vous voulez créer un responsable pour une nouvelle cellule.

**Étapes :**
1. Connexion avec vos identifiants
2. Menu **"Gestion"** → Onglet **"Responsables de Cellule"**
3. Clic sur **"+ Créer un Responsable de Cellule"**
4. Remplir :
   - Nom : Jean Dupont
   - Téléphone : 0123456789
   - Région : Littoral (pré-rempli)
   - Groupe : Groupe A (pré-rempli)
   - District : District 1 (sélectionner)
   - Cellule : Cellule de Prière du Vendredi
   - Catégorie : Cellule de Prière
5. Clic sur **"Créer le Responsable"**
6. **Noter l'identifiant affiché** (ex: 45678)
7. Communiquer l'identifiant à Jean Dupont

### Cas 2 : Voir Votre Équipe

**Contexte :** Vous êtes pasteur de district et vous voulez voir tous vos responsables de cellule.

**Étapes :**
1. Connexion avec vos identifiants
2. Menu **"Mon Équipe"**
3. Voir la liste complète avec :
   - Tous les responsables de cellule de votre district
   - Leurs informations de contact
   - Leurs identifiants
   - Le statut de chaque utilisateur

### Cas 3 : Connexion d'un Responsable de Cellule

**Contexte :** Jean Dupont vient de recevoir son identifiant et veut se connecter.

**Étapes :**
1. Aller sur la page de connexion
2. Saisir :
   - **Identifiant :** 45678
   - **Mot de passe :** (peut utiliser l'identifiant ou laisser vide selon la config backend)
3. Clic sur **"Se connecter"**
4. Accès au formulaire de rapport pour sa cellule

---

## ⚠️ Points Importants

### Sécurité
- ✅ Les responsables de cellule n'ont **pas de mot de passe**
- ✅ Identifiant de 5 chiffres unique et aléatoire
- ✅ Impossible de modifier l'identifiant après création
- ✅ L'identifiant doit être communiqué de manière sécurisée

### Hiérarchie
- ✅ Un pasteur de groupe voit **tous** les utilisateurs de son groupe
- ✅ Un pasteur de district voit **uniquement** les responsables de son district
- ✅ Les responsables de cellule ne voient que leur propre cellule

### Données
- ✅ Les champs hiérarchiques sont **pré-remplis** selon votre rôle
- ✅ Vous ne pouvez créer des responsables que dans votre périmètre
- ✅ Les sélections en cascade (Région → Groupe → District) sont automatiques

---

## 🆘 Dépannage

### Problème : "Erreur lors de la création du responsable"
**Solution :**
- Vérifier que tous les champs requis sont remplis
- Vérifier la connexion internet
- Vérifier que le backend est accessible
- Consulter le message d'erreur détaillé affiché

### Problème : "Aucun utilisateur dans votre hiérarchie"
**Causes possibles :**
- Vous n'avez pas encore créé de responsables de cellule
- Les responsables créés sont dans une autre région/groupe/district
- Problème de connexion avec le backend

**Solution :**
- Créer votre premier responsable de cellule
- Vérifier vos filtres hiérarchiques
- Actualiser la page

### Problème : "Impossible de se connecter avec l'identifiant"
**Solution :**
- Vérifier que l'identifiant est correct (5 chiffres)
- Vérifier que le responsable a bien été créé
- Contacter le pasteur qui a créé le compte

---

## 📞 Support

Pour toute question ou problème :
1. Consulter ce guide
2. Vérifier le fichier `MODIFICATIONS_HIERARCHIE.md` pour les détails techniques
3. Contacter l'administrateur système

---

**Version :** 2.0  
**Date :** 27 octobre 2025  
**Auteur :** Système MVCP Bénin
