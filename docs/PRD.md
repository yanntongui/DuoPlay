# PRD — DuoPlay

> **Retrouvez-vous autrement.**
> Une plateforme interactive de jeux, de défis et d'expériences conçue pour aider les couples à renforcer leurs liens, briser la routine et raviver la flamme.
>
> Mobile-first · Accessible par lien · Jouable à deux · Web PWA

**Statut** : v1.0 — document de référence produit & technique
**Marché initial** : Bénin / Afrique francophone

---

## Sommaire

1. [Présentation générale du projet](#1-présentation-générale-du-projet)
2. [Les univers de jeux et d'expériences](#2-les-univers-de-jeux-et-dexpriences)
3. [Les fonctionnalités principales](#3-les-fonctionnalités-principales)
4. [Les fonctionnalités complémentaires](#4-les-fonctionnalités-complémentaires)
5. [L'espace utilisateur](#5-lespace-utilisateur)
6. [L'espace d'administration](#6-lespace-dadministration)
7. [Le modèle économique](#7-le-modèle-économique)
8. [Périmètre du MVP](#8-périmètre-du-mvp)
9. [Architecture technique](#9-architecture-technique)
10. [Modèle de données](#10-modèle-de-données)
11. [Parcours utilisateur](#11-parcours-utilisateur)
12. [Modèle de relation « couple »](#12-modèle-de-relation--couple-)
13. [Spécification du mode Différé](#13-spécification-du-mode-différé)
14. [Ré-engagement, notifications & identité légère](#14-ré-engagement-notifications--identité-légère)
15. [Confiance, intimité des données, sécurité & conformité](#15-confiance-intimité-des-données-sécurité--conformité)
16. [Connectivité & performance (contexte marché)](#16-connectivité--performance-contexte-marché)
17. [Stratégie de contenu & processus éditorial](#17-stratégie-de-contenu--processus-éditorial)
18. [Inclusion & langage](#18-inclusion--langage)
19. [Mesure, analytics & expérimentation](#19-mesure-analytics--expérimentation)
20. [Onboarding & états vides](#20-onboarding--états-vides)
21. [Quotas freemium instrumentés](#21-quotas-freemium-instrumentés)
22. [Roadmap de construction](#22-roadmap-de-construction)
23. [Risques & points d'attention](#23-risques--points-dattention)
24. [Reporté après le MVP](#24-reporté-après-le-mvp)

---

## 1. Présentation générale du projet

DuoPlay est une plateforme numérique qui permet aux couples de partager des expériences interactives à travers des jeux, des questions, des défis, des surprises et des parcours guidés.

Le projet part d'une idée simple : avec le temps, le travail, les responsabilités et les habitudes quotidiennes, les couples peuvent avoir moins d'occasions de se consacrer du temps de qualité. DuoPlay souhaite faciliter ces moments de reconnexion en proposant des activités faciles à lancer, amusantes et adaptées à différentes situations.

Plutôt que de se limiter à une application de questions-réponses, DuoPlay ambitionne de devenir un **compagnon ludique de la vie de couple**.

### Vision
Devenir une plateforme de référence en Afrique francophone pour les expériences interactives qui rapprochent les couples, puis développer progressivement une présence sur d'autres marchés.

### Mission
Aider les couples à entretenir leur complicité et à créer de nouveaux souvenirs grâce à des expériences simples, accessibles et personnalisées.

### Objectifs
- Renforcer la communication et la connaissance mutuelle.
- Briser la monotonie du quotidien.
- Entretenir la tendresse, le romantisme et la spontanéité.
- Encourager les petites attentions et les activités partagées.
- Maintenir la connexion émotionnelle lorsque les partenaires sont éloignés.
- Donner aux couples une raison régulière de revenir jouer ensemble.

---

## 2. Les univers de jeux et d'expériences

DuoPlay s'organise autour de six grandes catégories.

### 2.1 Éclats de rire
Des jeux légers pour s'amuser, rire et retrouver de la spontanéité.
- « Qui de nous deux… ? »
- Devine ma réponse.
- Quiz amusants et questions surprises.
- Imitations et défis chronométrés.
- Défis pour faire rire son partenaire.

### 2.2 Cœur à cœur
Des expériences pour mieux se comprendre et approfondir les échanges.
- Questions sur les rêves et les aspirations.
- Préférences, valeurs et habitudes.
- Questions sur les besoins affectifs.
- Discussions guidées sur la vie à deux.
- Questions auxquelles les deux répondent avant de découvrir les réponses.

### 2.3 Flirt & Étincelles
Des jeux romantiques et **non explicites** pour entretenir la séduction et la tendresse.
- Compliments mystères.
- « Tu préfères ? » en version romantique.
- Messages doux à révéler.
- Petites attentions surprises.
- Choix d'une ambiance ou d'un rendez-vous idéal.

### 2.4 Nos souvenirs
Des jeux qui mettent en valeur l'histoire commune du couple.
- Quiz sur la rencontre.
- Deviner le souvenir préféré de l'autre.
- Dates et événements importants.
- Souvenirs heureux à raconter.
- Création d'une chronologie de moments marquants.

### 2.5 Sortons de la routine
Des défis qui transforment les jeux numériques en activités réelles.
- Organiser une surprise simple.
- Essayer une nouvelle activité ensemble.
- Préparer un rendez-vous à tour de rôle.
- Réaliser un défi de complicité.
- Choisir une sortie adaptée à son budget.

### 2.6 Notre avenir
Des activités pour nourrir les projets et les rêves partagés.
- Destinations à découvrir.
- Expériences à réaliser ensemble.
- Objectifs communs.
- Traditions à créer.
- Liste de projets et de souvenirs futurs.

> **Périmètre MVP** : seules les catégories 1 (rire), 2 (découverte/cœur à cœur), 3 (flirt) et 5 (défis/routine) sont livrées en premier.

---

## 3. Les fonctionnalités principales

### 3.A Création et participation à une partie
Le fonctionnement doit être immédiat et accessible, même pour un utilisateur qui découvre DuoPlay pour la première fois.

1. **Créer une partie** — Le premier joueur choisit une catégorie, une expérience et une durée.
2. **Inviter son partenaire** — Un lien privé est généré et peut être partagé directement via WhatsApp ou une autre application.
3. **Rejoindre la partie** — Le second joueur ouvre le lien dans son navigateur et rejoint la session, **sans installation obligatoire**.
4. **Jouer et découvrir** — Les joueurs répondent, réalisent les défis et découvrent progressivement les résultats.

### 3.B Les modes de jeu

| Mode | Fonctionnement |
|---|---|
| **Ensemble** | Les deux joueurs participent à la même session au même moment. |
| **À distance** | Chacun joue depuis son propre appareil, même dans une autre ville. |
| **Différé** | Un joueur répond, puis l'autre participe plus tard. Les réponses sont révélées selon les règles du jeu. |
| **Défi individuel** | Un joueur reçoit une mission à réaliser pour son partenaire. |

> Le mode différé est **particulièrement important** : il permet à DuoPlay de rester utile lorsque les partenaires ont des horaires différents. Voir la [spécification dédiée (§13)](#13-spécification-du-mode-différé).

### 3.C Révélation des réponses
Pour les jeux de compatibilité et de découverte, DuoPlay doit pouvoir :
- recueillir les réponses des deux joueurs séparément ;
- masquer les réponses tant que les deux n'ont pas terminé ;
- révéler les réponses au même moment ;
- mettre en évidence les ressemblances et les différences ;
- proposer une question complémentaire pour poursuivre la conversation.

> L'objectif n'est pas de noter la qualité de la relation, mais de susciter des échanges intéressants.

### 3.D Le défi du jour
Chaque jour, les joueurs peuvent découvrir une nouvelle question, une petite mission ou une activité.

Fonctionnalités associées :
- défi quotidien commun ;
- participation de chaque partenaire ;
- suivi des défis réalisés ;
- historique des défis ;
- possibilité de partager le résultat avec son partenaire ;
- rappels facultatifs (voir [§14](#14-ré-engagement-notifications--identité-légère)).

### 3.E Les parcours guidés
DuoPlay propose des parcours thématiques pour aider les couples à choisir quoi faire sans parcourir tout le catalogue.

Exemples :
- **Ravivons la flamme** : parcours de 7 jours pour retrouver du temps de qualité.
- **Redécouvrons-nous** : questions progressives pour mieux se connaître.
- **Une semaine sans routine** : petites activités à essayer ensemble.
- **Nos plus beaux souvenirs** : parcours autour de l'histoire commune.
- **À distance, mais proches** : expériences adaptées aux partenaires éloignés.

Chaque parcours comprend des étapes, une progression, des activités et un récapitulatif final.

### 3.F Personnalisation de l'expérience
Les utilisateurs peuvent sélectionner :
- l'ambiance souhaitée : rire, tendresse, découverte ou surprise ;
- la durée : 5, 10, 15 ou 20 minutes et plus ;
- le type de jeu ;
- le niveau de profondeur des questions ;
- le mode de participation ;
- les thèmes qu'ils souhaitent éviter.

> **Règle produit fondamentale** : les deux partenaires doivent pouvoir **passer une question sans justification**. La plateforme ne doit **jamais imposer** une activité.

---

## 4. Les fonctionnalités complémentaires

- **Journal du couple** — Espace facultatif pour conserver les souvenirs, les activités réalisées et les moments à garder.
- **Calendrier des moments à deux** — Planifier un rendez-vous, une activité, un anniversaire ou une surprise.
- **Favoris et collections** — Enregistrer les jeux appréciés, reprendre une session, retrouver les parcours terminés.
- **Rappels intelligents et facultatifs** — Proposer un nouveau défi ou un moment à deux **sans multiplier les notifications ni culpabiliser** les utilisateurs.
- **Suggestions personnalisées par IA (évolution future)** — Générer des questions, des idées d'activités et des parcours à partir des préférences choisies, avec des règles de sécurité et de confidentialité.

---

## 5. L'espace utilisateur

L'interface est **mobile-first**, élégante et simple. DuoPlay est une application web progressive (**PWA**) : elle fonctionne depuis un lien et peut être installée sur l'écran d'accueil, **sans installation obligatoire**.

### Pages principales

| Page | Contenu |
|---|---|
| **Accueil** | Défi du jour, reprise d'une partie, parcours en cours, accès rapide aux catégories. |
| **Explorer** | Catalogue des catégories, jeux, défis et parcours disponibles. |
| **Espace de jeu** | Questions, choix de réponses, progression, révélations et interactions en temps réel. |
| **Notre espace** | Parcours suivis, jeux favoris, activités planifiées, souvenirs sauvegardés. |
| `/join/[token]` | Entrée invité par lien privé (sans inscription). |
| **Admin** | Tableau de bord interne (accès restreint). |

> **Direction visuelle proposée** : ivoire, graphite, lavande et corail, typographie lisible, cartes élégantes, animations discrètes, ambiance chaleureuse. À décliner en **design tokens** (§9) et à optimiser pour les appareils d'entrée de gamme (§16).

---

## 6. L'espace d'administration

| Module | Fonctionnalités |
|---|---|
| **Gestion des jeux** | Créer, modifier, publier et archiver les questions et les défis. |
| **Gestion des catégories** | Organiser les six univers et leurs sous-catégories. |
| **Parcours** | Construire des programmes de 3, 7 ou 21 jours. |
| **Modération** | Signaler et retirer les contenus inappropriés. |
| **Utilisateurs et sessions** | Consulter les données opérationnelles nécessaires, avec accès restreint. |
| **Statistiques** | Mesurer les invitations, parties terminées, retours et parcours suivis. |
| **Gestion commerciale** | Configurer les offres gratuites et premium lorsque la monétisation sera activée. |

Accès protégé par rôle (voir [§15](#15-confiance-intimité-des-données-sécurité--conformité)).

---

## 7. Le modèle économique

Freemium recommandé.

**DuoPlay Gratuit — Découverte et acquisition**
- Accès à une sélection de jeux.
- Invitations par lien.
- Défi quotidien.
- Quelques parcours guidés.
- Historique limité.

**DuoPlay Premium — Abonnement ou accès à des collections**
- Catalogue complet.
- Parcours thématiques avancés.
- Collections spéciales.
- Personnalisation étendue.
- Journal et souvenirs enrichis.

> Les tarifs et la formule commerciale seront testés auprès des utilisateurs au Bénin et dans d'autres marchés francophones avant d'être fixés.
> **MVP** : les quotas sont **posés et instrumentés** (§21) mais **aucun paiement n'est intégré**.

---

## 8. Périmètre du MVP

### À inclure dans la première version

- [x] Interface mobile-first et PWA
- [x] Création d'une partie et invitation par lien privé
- [x] Participation à deux sans inscription obligatoire pour l'invité
- [x] Quatre catégories initiales : rire, découverte, flirt et défis
- [x] Questions à choix, questions ouvertes et défis simples
- [x] Réponses indépendantes et révélation simultanée
- [x] Mode en temps réel et mode différé
- [x] Défi du jour
- [x] Reprise d'une partie interrompue
- [x] Administration des contenus
- [x] Mesure des invitations et des parties terminées
- [x] Protection des sessions, contrôle d'accès et politique de confidentialité

**12 fonctionnalités sélectionnées sur 12.**

### À reporter après le MVP

- Génération de jeux par IA.
- Journal enrichi avec médias.
- Calendrier partagé complet.
- Système complexe de badges et de récompenses.
- Messagerie privée et appels vidéo.
- Réseau social public.
- Paiements intégrés et partenariats commerciaux.

> Ces exclusions permettent de concentrer le développement sur la qualité des expériences à deux plutôt que de construire trop tôt une application complexe.

---

## 9. Architecture technique

### 9.1 Stack retenue

| Couche | Choix | Justification |
|---|---|---|
| Frontend | **Next.js 15 (App Router) + TypeScript** | SSR/SEO pour la landing, PWA, espace admin et app dans un seul repo. |
| UI | **Tailwind CSS + shadcn/ui** | Vitesse, cohérence, design tokens. |
| Backend | **Convex** | Base réactive, fonctions serveur, temps réel natif, cron, auth, fichiers. |
| Auth | **Convex Auth** | Compte léger créateur + tokens de session pour l'invité. |
| PWA | manifest + service worker | Installable, offline fallback, icônes. |
| Déploiement | **Netlify** (front, via Next.js Runtime) + **Convex Cloud** (back) | Netlify héberge le front + les Server Actions/Route Handlers ; Convex reste le backend réactif. |

**Aucune dépendance à un serveur WebSocket maison** : le mode Ensemble / à distance repose sur les souscriptions réactives Convex.

### 9.2 Structure de projet envisagée

```
DuoPlay/
├─ app/                     # Next.js App Router
│  ├─ (marketing)/          # Landing, confidentialité, CGU
│  ├─ (app)/                # Accueil, Explorer, Espace de jeu, Notre espace
│  ├─ join/[token]/         # Entrée invité par lien privé
│  ├─ admin/                # Tableau de bord contenu (auth-gated)
│  └─ manifest.webmanifest, sw, icons
├─ components/              # UI + design system
├─ convex/                  # schema.ts, functions, auth, crons
├─ lib/                     # utils, tokens, hooks, analytics
└─ docs/                    # PRD, specs
```

### 9.3 Principes d'ingénierie
- **Sécurité par défaut** : aucune donnée de session accessible sans token valide.
- **Léger d'abord** : budget de performance strict (§16).
- **Testabilité** : tests ciblés sur temps réel, différé et révélation (§23).
- **Séparation contenu / code** : tout le catalogue est éditable en admin, jamais en dur.

### 9.4 Déploiement sur Netlify

**Front (Next.js 15 App Router) → Netlify** via le *Next.js Runtime* officiel (Netlify détecte et configure automatiquement en général).

| Élément | Configuration |
|---|---|
| Build command | `next build` |
| Publish directory | `.next` (géré par le runtime) |
| Node version | 20+ (alignée sur le local) |
| Variables d'environnement | `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOY_KEY` (CI), secrets auth |
| Convex | Déployé **indépendamment** sur Convex Cloud (`npx convex deploy`) — pas d'hébergement backend chez Netlify |
| Fichier de config | `netlify.toml` (build, redirections, headers) recommandé |

**Points d'attention Netlify + App Router**
- Le *Next.js Runtime* supporte **App Router, RSC, Route Handlers, Server Actions, Middleware**. Vérifier la version du runtime lors de l'init.
- **`next/image`** → s'appuyer sur **Netlify Image CDN** (les images optimisées ne passent pas par le serveur Next en serverless).
- **ISR / revalidation** : supportée mais avec des nuances ; privilégier le **statique + données Convex réactives côté client** pour le catalogue (déjà le cas).
- **Le temps réel reste porté par Convex** : le navigateur ouvre son propre WebSocket directement vers Convex — Netlify Functions n'entrent pas dans le chemin temps réel (bon point pour le coût et la latence).
- **PWA / service worker** : servir `sw.js` et `manifest.webmanifest` avec les bons headers (`Cache-Control: no-cache` sur le SW, scope racine).
- **Preferences / Deploy Previews** : utiliser les *Deploy Previews* pour tester chaque PR (voir skill `netlify-deploy`).

> Cohérent avec les principes : le front est majoritairement statique/edge, seul le backend Convex porte l'état réactif.

---

## 10. Modèle de données

Esquisse de schéma Convex (noms indicatifs).

| Table | Rôle | Champs clés |
|---|---|---|
| `users` | Compte léger créateur | `_id`, `email?`, `phone?`, `displayName`, `role`, `plan`, `createdAt` |
| `couples` | Lien entre deux joueurs | `_id`, `memberA`, `memberB?`, `status`, `createdAt`, `dissolvedAt?` |
| `categories` | 6 univers | `_id`, `slug`, `title`, `order`, `status` |
| `experiences` | Jeux / expériences | `_id`, `categoryId`, `title`, `type`, `depth`, `themes[]`, `status` |
| `questions` | Contenu de jeu | `_id`, `experienceId`, `kind` (choix/ouverte/défi), `prompt`, `options[]?`, `depth`, `themes[]`, `status` |
| `sessions` | Partie | `_id`, `coupleId?`, `experienceId`, `mode`, `status`, `token`, `tokenExpiresAt`, `duration`, `state` |
| `sessionPlayers` | Joueur d'une session | `_id`, `sessionId`, `userId?`, `guestName?`, `role` (A/B), `joinedAt` |
| `answers` | Réponse | `_id`, `sessionId`, `playerId`, `questionId`, `value`, `revealed`, `skipped`, `answeredAt` |
| `dailyChallenges` | Défi du jour | `_id`, `date`, `questionId`/`mission`, `publishedAt` |
| `challengeCompletions` | Participation au défi | `_id`, `challengeId`, `coupleId`, `playerId`, `doneAt` |
| `journeys` | Parcours guidés | `_id`, `slug`, `title`, `lengthDays`, `status` |
| `journeySteps` | Étapes | `_id`, `journeyId`, `dayIndex`, `experienceId`/`mission` |
| `journeyProgress` | Progression | `_id`, `journeyId`, `coupleId`, `currentStep`, `completedAt?` |
| `favorites` | Collections | `_id`, `userId`, `experienceId`, `createdAt` |
| `reports` | Modération | `_id`, `targetType`, `targetId`, `reason`, `status`, `createdAt` |
| `analyticsEvents` | Mesure | `_id`, `name`, `userId?`, `sessionId?`, `coupleId?`, `props`, `at` |
| `notifications` | Relances planifiées | `_id`, `userId`, `kind`, `scheduledAt`, `sentAt?`, `channel` |

> Le champ `users.plan` est présent dès le MVP (valeur `free`) pour préparer le freemium sans l'activer.

---

## 11. Parcours utilisateur

### 11.1 Personas
- **Joueur A (créateur)** : découvre DuoPlay, initie la partie.
- **Joueur B (invité)** : reçoit un lien, rejoint sans compte.

### 11.2 Créer une partie (Joueur A)

| # | Étape | Écran | Détail |
|---|---|---|---|
| 1 | Atterrissage | Landing / Accueil | Promesse claire, 1 CTA : **Créer une partie**. Pas de mur d'inscription. |
| 2 | Choisir l'ambiance | Explorer | 6 univers + filtres (rire, tendresse, découverte, surprise). |
| 3 | Choisir l'expérience | Fiche expérience | Type, durée estimée, profondeur, mode. |
| 4 | Ajuster | Personnalisation | Durée, profondeur, thèmes à éviter, mode. |
| 5 | Lancer | Création session | Compte léger/anonyme en arrière-plan, **token de partie** généré. |
| 6 | Inviter | Écran d'invitation | Prénom du partenaire + **Partager (WhatsApp)** + copier le lien. |
| 7 | Salle d'attente | Lobby | « En attente de [prénom]… », passage automatique à son arrivée. |

### 11.3 Rejoindre (Joueur B)
1. Ouverture du lien → `/join/[token]` (compatible WebView WhatsApp).
2. Aperçu : « [Prénom A] t'invite à jouer ». **Aucune installation, aucune inscription.**
3. Saisie du prénom uniquement.
4. Entrée dans le lobby, visible en temps réel par A.
5. Jeu.

**Cas particuliers** : token expiré/déjà utilisé → écran explicatif + proposition de nouvelle partie ; possibilité de rattacher la session à un compte ultérieurement.

### 11.4 Boucle de jeu

```
Question → Réponse (masquée) → Attente/confirmation → Révélation simultanée → Discussion
```

- Chaque joueur répond indépendamment ; sa réponse **reste masquée** à l'autre.
- Révélation déclenchée seulement quand **les deux ont répondu** (ou timeout — §13).
- Révélation : réponses côte à côte, ressemblances/différences, question complémentaire.
- **Passer une question sans justification** à tout moment.
- **Reprise** : reprise à la dernière question non terminée.

### 11.5 Les 4 modes (mêmes écrans, rythme différent)
- **Ensemble** : synchronisation live.
- **À distance** : appareils/villes différents.
- **Différé** : révélé quand les deux ont terminé (§13).
- **Défi individuel** : mission à réaliser, sans question de révélation.

### 11.6 Défi du jour & rétention
Rappel facultatif → carte « Défi du jour » en tête d'Accueil → participation (compatible différé) → suivi/historique → partage optionnel.
**Principe** : jamais de culpabilisation, notifications non intrusives.

### 11.7 Parcours guidés
Choisir un parcours → étape du jour → progression visible → récapitulatif final. Objectif : supprimer la paralysie du choix.

### 11.8 Notre espace
Parcours suivis, favoris, activités planifiées, souvenirs sauvegardés. C'est ici que le compte léger devient un levier de rétention.

### 11.9 Admin
Login → Dashboard → CRUD jeux/catégories/parcours → Modération → Statistiques → Config offres (inactive au MVP).

---

## 12. Modèle de relation « couple »

Point non couvert par la version initiale du PRD, pourtant central.

### 12.1 Règles
- Un utilisateur peut appartenir à **plusieurs couples** au cours du temps, mais **une seule session active à la fois par couple** (pas de collision de topics).
- Un **couple** est créé implicitement à la première partie et formalisé lorsque les deux joueurs sont rattachés à un compte.
- Un invité non rattaché crée un **couple temporaire** (membre B = invité léger).

### 12.2 Cycle de vie du couple

```
temporaire ──(B crée/rattache un compte)──> actif ──(dissolution)──> dissous
```

### 12.3 Dissolution
Un produit « couple » doit anticiper la séparation. Quand un membre dissout le couple :
- les **sessions privées**, le **journal** et les **souvenirs partagés** deviennent inaccessibles à l'autre membre ;
- chaque membre conserve **ses propres réponses** (portabilité) mais plus les réponses de l'autre ;
- possibilité d'**export** des données avant suppression ;
- suppression effective après un délai de grâce (ex. 30 jours), puis purge.

### 12.4 Cas d'usage à couvrir
- Renommer son partenaire.
- Ré-inviter / relancer une invitation expirée.
- Rejoindre plusieurs sessions avec la même personne.
- Quitter un couple sans supprimer son compte.

---

## 13. Spécification du mode Différé

Le mode différé porte la promesse « horaires différents » mais est le flux **le plus fragile**. Il est spécifié comme un flux à part entière.

### 13.1 Cycle de vie d'une session différée

```
en_attente_A ──(A répond)──> en_attente_B ──(B répond)──> révélée
      │                            │
      └──── expiration/relance ────┘        └── abandon ──> clôturée
```

### 13.2 Règles
- Statut explicite visible des deux côtés : « En attente de [prénom] ».
- **Relances douces** : une notification à J+1, une à J+3 maximum, jamais plus (paramétrable).
- **Expiration** : la session expire par défaut à **J+7**. L'auteur est prévenu.
- **Révélation assistée** : à l'expiration, proposer à l'auteur soit de **relancer**, soit de **clôturer** la session en conservant ses réponses (sans exposer celles de l'autre).
- **Abandon d'un partenaire** : la session ne bloque jamais l'accès aux autres contenus ; l'auteur peut la clôturer à tout moment.

### 13.3 Cas limites
- Réponse modifiée avant révélation : autorisée une fois, puis verrouillée.
- Réponses partielles des deux côtés : révélation **par question** dès que les deux ont répondu à la même question.
- Défi individuel en différé : simple coche « fait », pas de révélation.

---

## 14. Ré-engagement, notifications & identité légère

**Le trou du modèle « invité sans inscription » : sans contact, impossible de relancer.**

### 14.1 Canal de ré-engagement
- **Recommandation** : proposer la création d'un **compte léger avec email OU téléphone** à un moment à forte valeur ajoutée (juste après une première partie réussie), jamais à l'entrée.
- L'invité sans compte reste jouable, mais :
  - sa session est **récupérable via le même lien** tant que le token est valide ;
  - un bandeau propose « Créer un compte pour retrouver nos parties ».

### 14.2 Notifications
- **Push PWA** : supporté sur Android/Chrome/Edge, **limité sur iOS Safari** (installation requise, support partiel).
- **Fallback** : rappels par **lien WhatsApp programmé** (opt-in) ou e-mail, selon le canal disponible.
- **Timing de la demande de permission** : proposée seulement après une action engageante (ex. activation du défi du jour), jamais à l'arrivée.

### 14.3 Principes
- Fréquence par défaut basse et paramétrable.
- Aucune notification culpabilisante.
- Opt-out en un tap.

---

## 15. Confiance, intimité des données, sécurité & conformité

### 15.1 Nature des données
Les réponses peuvent être **intimes et sensibles**. Le traitement doit être au niveau de sensibilité le plus élevé.

### 15.2 Principes d'intimité
- **Chiffrement au repos** des réponses et du journal.
- **Rétention définie** : purge des sessions temporaires expirées au-delà de N jours.
- **Suppression par le couple** : bouton « Tout supprimer » et suppression de compte.
- Les réponses d'un joueur ne sont **jamais lisibles** par l'autre avant révélation (garantie technique, pas seulement UI).

### 15.3 Contrôle d'accès
- Accès à une session uniquement via **token de session valide, non devinable, à durée de vie limitée**.
- Contrôle par **droits côté Convex** (functions vérifient le joueur), pas seulement côté client.
- Rôles admin séparés ; accès aux données opérationnelles restreint et journalisé.

### 15.4 Sécurité
- Tokens opaques (aléatoires, longueur suffisante), expiration configurable.
- Limitation de débit (anti-spam d'invitations, anti-brute-force de tokens).
- Un même appareil peut appartenir à plusieurs joueurs : résolution explicite du rôle à la connexion.

### 15.5 Sécurité relationnelle (safety)
- Signalement d'un contenu inapproprié (modération — §6).
- **Thèmes à éviter** appliqués côté serveur, jamais exposés en jeu.
- Ressources de sécurité accessibles si un contenu touche à des sujets sensibles (violence, détresse).
- Contenu **non explicite** garanti (Flirt & Étincelles).

### 15.6 Conformité
- **Code du numérique béninois / APDP** (équivalent local du RGPD) à respecter.
- Pages obligatoires : **CGU**, **Politique de confidentialité**, **Cookies & consentement analytics**.
- **Age gate** (à définir : 18+ recommandé vu la nature relationnelle) avant toute partie.
- Consentement explicite de l'invité à être invité (anti-spam de liens).
- Journal des consentements (analytics, notifications).

---

## 16. Connectivité & performance (contexte marché)

**Cible : Afrique francophone, données mobiles coûteuses et instables.**

### 16.1 Budgets
- **Poids initial (First Load JS)** : viser le plus bas possible ; chargement **progressif par écran**.
- **Images** : compressées, formats modernes, chargement différé, zéro image décorative lourde.
- **Animations** : discrètes, respectant `prefers-reduced-motion`, sans coût GPU excessif.

### 16.2 Robustesse réseau
- **Offline-first léger** : service worker mettant en cache le contenu déjà consulté et les questions en cours.
- Fonctionnement dégradé sur **2G/3G** (états de chargement courts, retry).
- **Compatible WebView WhatsApp** et **navigateurs Android anciens** : éviter les API récentes non supportées.
- Reprise de session après perte de connexion.

### 16.3 PWA
- manifest complet (nom, icônes, thème), installable sur l'écran d'accueil.
- Stratégie d'installation : prompt proposé **au bon moment** (après une première partie), jamais intrusif.

---

## 17. Stratégie de contenu & processus éditorial

**Le gisement d'effort principal, sous-estimé dans la version initiale. Sans volume de qualité, la répétition provoque le churn dès la 2ᵉ partie.**

### 17.1 Principes
- **Qualité > quantité** : chaque question doit être testée (clarté, ton, absence d'ambiguïté).
- **Adaptation culturelle réelle** : contenu pensé pour l'Afrique francophone, pas une traduction de quiz occidentalisés (noms, lieux, références, budgets, réalités locales).
- **Pas de répétition** : objectif de volume par catégorie à définir avant lancement ; signaler les questions déjà vues.
- **Non explicite** : ligne éditoriale claire, en particulier pour Flirt.

### 17.2 Pipeline
1. Rédaction (banque de questions par catégorie/profondeur/thème).
2. Relecture éditoriale (ton, inclusivité, absence de biais).
3. Test interne.
4. Publication via l'admin.
5. Revue périodique (retrait des questions faibles, ajout saisonnier).

### 17.3 Champs éditoriaux par question
- catégorie, type (choix/ouverte/défi), profondeur, thèmes, durée estimée, statut, date de publication, score de performance (taux de skip, taux d'achèvement, engagement).

---

## 18. Inclusion & langage

C'est un **choix produit et éditorial**, pas un détail.

- Langage **neutre en genre** par défaut ; ne jamais présumer la composition du couple.
- Prénoms et pronoms configurable/libres.
- Couples non hétéro pleinement représentés dans le contenu et les exemples.
- Copywriting respectueux, jamais moralisateur, jamais culpabilisant.
- Accessibilité : contrastes, tailles de police, navigation clavier, lecteurs d'écran.

---

## 19. Mesure, analytics & expérimentation

Le PRD initial mentionnait « mesurer » sans préciser comment.

### 19.1 Événements clés (funnel d'acquisition → activation → rétention)
- `landing_view`, `session_created`, `invite_link_shared`, `invite_opened`, `guest_joined`, `game_started`, `question_answered`, `question_skipped`, `game_revealed`, `game_completed`, `session_resumed`, `daily_challenge_done`, `journey_started`, `journey_step_done`, `account_created`, `notification_optin`.

### 19.2 KPI MVP
- Taux d'ouverture du lien invité, taux de partie complétée, délai moyen de complétion (surtout différé), retour à 7 jours, parties par couple, skips.

### 19.3 Expérimentation
- Base **A/B testing** (variantes de CTA, timing de demande de compte, relances) dès que le volume le permet. Respecter le consentement analytics.

---

## 20. Onboarding & états vides

- **Explication contextuelle des 4 modes** (le nouveau joueur ne les connaîtra pas).
- **États vides soignés** : « aucune partie en cours », « aucun favori », « aucun parcours » → toujours une action proposée.
- **Découverte du format** lors de la première partie (micro-tutoriel discret, non bloquant).
- Gestion des erreurs claire (token expiré, réseau indisponible, session introuvable).

---

## 21. Quotas freemium instrumentés

Même sans paiement au MVP, les limites sont posées et **tracées** pour savoir où placer les paywalls plus tard.

| Quota | Gratuit (MVP, sans paiement) | Premium (futur) |
|---|---|---|
| Sélection de jeux | Sous-ensemble | Catalogue complet |
| Parcours | Quelques-uns | Tous |
| Historique | Limité | Illimité |
| Journal / souvenirs | Basique | Enrichi (médias) |

L'admin peut configurer ces limites ; l'atteinte d'un quota est **loggée** comme événement.

---

## 22. Roadmap de construction

| Phase | Contenu |
|---|---|
| **0 — Fondations** | Next.js 15 + TS + Tailwind + shadcn, init Convex + intégration, design tokens, config PWA, Convex Auth, lint/format/CI. |
| **1 — Contenu & Admin** | Schéma Convex (catégories/expériences/questions) + seed 4 catégories MVP, CRUD admin protégé, publication/archivage, modération, rôles. |
| **2 — Boucle de jeu (cœur)** | Créer partie → lien privé + partage WhatsApp → rejoindre par token → questions → réponses masquées → révélation simultanée → 4 modes → reprise. |
| **3 — Engagement** | Défi du jour (cron), participation, historique, partage, rappels. Favoris/collections. « Notre espace ». |
| **4 — Parcours guidés** | Modèle 3/7/21 j, étapes, progression, récapitulatif. |
| **5 — Personnalisation** | Ambiance, durée, profondeur, thèmes à éviter, mode, skip sans justification. |
| **6 — Cycle de vie compte** | Compte léger, liaison invité → compte, persistance « Notre espace », dissolution de couple. |
| **7 — Analytics & sécurité** | Événements, funnels, protection des sessions, contrôle d'accès, conformité, confidentialité. |
| **8 — Polish & déploiement** | Animations, accessibilité, perfs, offline, déploiement Netlify (front) + Convex prod (back). |

---

## 23. Risques & points d'attention

| # | Risque | Mitigation |
|---|---|---|
| 1 | Temps réel mal cadré (lobbies à 2) | Souscriptions Convex scoppées par session, pas de salle publique. |
| 2 | Token de session compromis | Tokens opaques, expiration, rate limiting, vérification serveur. |
| 3 | Ré-engagement impossible sans contact | Capture optionnelle + fallback WhatsApp/e-mail (§14). |
| 4 | Mode différé qui n'aboutit jamais | Relances, expiration J+7, révélation assistée, clôture (§13). |
| 5 | Contenu insuffisant → répétition → churn | Pipeline éditorial, volume cible, suivi des skips (§17). |
| 6 | Connectivité faible | Budget de perf strict, offline-first, compatibilité (§16). |
| 7 | Données intimes exposées / fuite | Chiffrement, rétention, contrôle d'accès serveur (§15). |
| 8 | Rupture du couple | Flux de dissolution, suppression, portabilité (§12). |
| 9 | Bugs temps réel / différé | Tests ciblés sur synchronisation et révélation. |
| 10 | Spam d'invitations | Rate limiting, consentement de l'invité. |

---

## 24. Reporté après le MVP

- Génération de jeux par IA.
- Journal enrichi avec médias.
- Calendrier partagé complet.
- Système complexe de badges et de récompenses.
- Messagerie privée et appels vidéo.
- Réseau social public.
- **Paiements intégrés (Paystack) et partenariats commerciaux.**
- Support/feedback intégré, canal d'offboarding complet.
- Multi-langue (i18n) au-delà du français.
