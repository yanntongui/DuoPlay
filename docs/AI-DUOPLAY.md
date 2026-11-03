# DuoPlay AI — Dossier de conception produit & technique

**Version** : 0.2 · **Date** : 1er novembre 2026
**Statut** : à valider — **aucun développement ne démarre avant signature du périmètre (§16)**.
**Périmètre** : couples adultes (18+), application privée de jeux, cartes, dés et parcours.

---

## 0. Cadre et invariants

**Promesse** : *DuoPlay AI — Votre moment à deux.* Une assistante de complicité qui aide à créer
de meilleurs moments ensemble. Elle ne remplace ni le consentement, ni le jugement, ni un
professionnel de santé, un sexologue ou un thérapeute.

### Les dix invariants

1. **Le consentement est humain et réversible.** L'IA propose, les partenaires disposent.
2. **Le droit de passer est inconditionnel.** Aucun motif, aucune conséquence, aucun commentaire.
3. **La pause et l'arrêt immédiat** sont disponibles à chaque seconde d'une session.
4. **Les limites du couple sont l'autorité finale**, pas le modèle.
5. **Minimisation** : métadonnées seulement, jamais les contenus intimes.
6. **Aucun diagnostic**, aucun score, aucun pronostic de relation.
7. **Aucune pression** : pas de série, pas de culpabilisation, pas de compte à rebours imposé.
8. **Interdits absolus** : mineurs, coercition, violence réelle, exploitation, non-consentement.
9. **Transparence** : on sait toujours que l'on parle à une IA et ce qui est généré.
10. **Aucune décision sensible automatique** : publication, bannissement, remboursement,
    suppression de compte et prix passent par un humain.

### Ce que l'IA n'est pas

Un chatbot généraliste · un thérapeute · un moteur de matching · un juge de la relation ·
un générateur de contenu explicite · une mémoire du couple sans consentement.

---

## 1. Architecture IA

### 1.1 Vue logique

```
┌─────────────────────────────┐          ┌──────────────────────────────┐
│ Application couple          │          │ Console admin                │
│ DuoPlay AI · sessions       │          │ contenus · analytics · revue │
└──────────────┬──────────────┘          └───────────────┬──────────────┘
               │                                         │
               ▼                                         ▼
┌───────────────────────────── Passerelle IA (Convex, UE) ─────────────────────────────┐
│                                                                                      │
│  1. AIGateway            auth · quota · feature flag · kill switch                   │
│  2. ContextFilter        sélection minimale · suppression identifiants · limites     │
│  3. PolicyEngine         intention · red flags · consentement · refus                │
│  4. ModelRouter          classifieur léger · générateur · embeddings                 │
│  5. OutputValidator      schéma · exclusions · ton · longueur · conformité           │
│  6. SafetyClassifier     contenu · coercition · détresse                             │
│  7. AIAuditLog           hash · décision · version · coût (jamais le contenu intime) │
│                                                                                      │
└───────────────────────────────────┬──────────────────────────────────────────────────┘
                                    ▼
             Fournisseur de modèles (région UE · zéro rétention · aucun entraînement)
```

### 1.2 Composants

| # | Composant | Rôle | Déterministe |
|---|---|---|---|
| 1 | `AIGateway` | Point d'entrée unique : authentification, quotas, flags, coupure | Oui |
| 2 | `ContextFilter` | Construit la charge utile minimale, pseudonymise, applique les limites | **Oui** |
| 3 | `PolicyEngine` | Refus, red flags, vérification du consentement avant appel | **Oui** |
| 4 | `ModelRouter` | Choisit le modèle selon la tâche et le budget | Non |
| 5 | `PromptRegistry` | Prompts versionnés par fonctionnalité et par locale | Oui |
| 6 | `OutputValidator` | Schéma strict, exclusions, profondeur, ton, longueur | **Oui** |
| 7 | `SafetyClassifier` | Classification de la sortie et des entrées libres | Non |
| 8 | `ConsentService` | Double consentement, veto, révocation, horodatage | **Oui** |
| 9 | `QuotaService` | Quotas par appareil/couple, budgets, anti-abus | **Oui** |
| 10 | `RecommendationEngine` | Classement explicable, sans génération de texte | **Oui** |
| 11 | `AIAuditLog` | Journal append-only, exploitable en audit | **Oui** |
| 12 | `AdminCopilot` | Surface interne isolée, sortie jamais publiée sans revue | Non |

Trois composants non déterministes seulement. Tout le reste encadre, filtre et journalise.

### 1.3 Séparation des plans

| Plan | Contenu | Accès |
|---|---|---|
| **Données** | `answers`, `journalEntries.note`, médias, messages | Jamais lu par l'IA |
| **Métadonnées** | préférences, limites, catégories, durées, modes, favoris | Lu par `ContextFilter` uniquement |
| **Orchestration** | sessions IA, prompts, sorties, décisions | Service interne |
| **Gouvernance** | flags, quotas, versions, coûts, revue | Admin habilité + DPO |

### 1.4 Modes

1. **Assisté** — classement et explication du catalogue, aucun texte inédit.
2. **Créatif borné** — génération structurée, validée, non persistée par défaut.
3. **Interne** — rédaction et analyse pour l'équipe, validation humaine obligatoire.
4. **Dégradé** — modèle indisponible ou quota atteint : bascule catalogue, message honnête.

### 1.5 Budgets de performance

| Opération | Cible p95 |
|---|---|
| Ouverture de DuoPlay AI | < 300 ms (zéro appel modèle) |
| Recommandations | < 400 ms (pré-calculées) |
| Recherche en langage naturel | < 1,2 s |
| Première étape générée | < 2,5 s (streaming) |
| Session complète | < 8 s |
| Bascule dégradée | 12 s |
| Assistant de communication | < 3 s |

### 1.6 Modèles et routage

| Tâche | Type de modèle | Justification |
|---|---|---|
| Classification d'intention, sécurité, doublons | petit modèle / classifieur | coût et latence |
| Génération de session, parcours, messages | modèle intermédiaire | qualité rédactionnelle |
| Traduction, reformulation admin | modèle intermédiaire | volume maîtrisé |
| Embeddings (recherche, recommandation) | modèle d'embedding | stockage vectoriel Convex |
| Résumés analytics | modèle intermédiaire sur agrégats | aucun contenu individuel |

Contraintes fournisseur : région UE, DPA, zéro rétention, aucune réutilisation pour l'entraînement,
versions épinglées, possibilité de basculer de fournisseur sans changer le produit.

### 1.7 Défaillances

Timeout → une relance → repli catalogue. Sortie invalide → une régénération contrainte → repli.
Coût anormal → coupure du flag + alerte. Incident sécurité → kill switch global en < 60 s,
sessions en cours clôturées proprement.

---

## 2. Carte des fonctionnalités par priorité

| # | Fonctionnalité | Phase | Valeur | Risque | Effort |
|---|---|---|---|---|---|
| 1 | Générateur de session IA | 1 | Très forte | Moyen | L |
| 2 | Recommandations explicables | 1 | Forte | Faible | M |
| 3 | Recherche en langage naturel | 1 | Forte | Faible | M |
| 4 | Assistant de communication | 1 | Forte | Moyen | S |
| 5 | Copilote éditorial admin | 1 | Forte (interne) | Faible | M |
| 6 | Traduction assistée | 1 | Moyenne | Faible | S |
| 7 | Analytics agrégés en langage naturel | 1 | Moyenne (interne) | Faible | M |
| 8 | Adaptation en cours de session | 2 | Forte | Faible | M |
| 9 | Mode couples à distance | 2 | Forte | Faible | M |
| 10 | Assistant de rendez-vous et surprises | 2 | Moyenne | Moyen | M |
| 11 | Coach de complicité | 2 | Moyenne | Faible | S |
| 12 | Résumés privés du journal | 2 | Moyenne | **Élevé** | M |
| 13 | Parcours personnalisés | 2 | Moyenne | Faible | M |
| 14 | Modération intelligente | 3 | Forte (interne) | Moyen | L |
| 15 | Détection de fraude | 3 | Moyenne | Moyen | M |
| 16 | Prédiction de désabonnement | 3 | Moyenne | **Élevé** | M |
| 17 | Recommandations avancées | 3 | Moyenne | Faible | M |
| 18 | Analyse de tendances produit | 3 | Moyenne | Faible | M |
| 19 | Assistant vocal | 3+ | Faible (pour l'instant) | **Très élevé** | L |

### MVP (phase 1) — périmètre exact

Générateur de session · recommandations avec justification · recherche en langage naturel ·
assistant de communication · copilote éditorial · traduction assistée · analytics agrégés ·
socle de sécurité, consentement, quotas, observabilité, modération manuelle outillée.

**Hors MVP** : adaptation temps réel, distance, rendez-vous, coach, résumés de journal,
parcours personnalisés, modération IA, fraude, churn, vocal (voir §15).

---

## 3. Parcours UX principaux

### P1 — Générer une session (cœur)

Accueil → carte « DuoPlay AI » → composer (humeur, durée, contexte, niveau, mode, exclusions)
→ récapitulatif → consentement (double si partagé) → génération animée → aperçu → session.

Points de sortie à chaque étape : retour, « plus tard », annulation. Aucun état bloquant.

### P2 — Recherche en langage naturel

Champ libre → interprétation affichée (« 15 min · à distance · sans photo ») → résultats mixtes
(expériences, cartes, parcours) → filtres ajustables → « Générer une nouvelle session ».
Les filtres appliqués sont toujours visibles et modifiables ; une limite du couple ne peut pas
être retirée par la requête.

### P3 — Recommandations

Bloc « Pour vous » sur l'accueil → 3 propositions maximum → chaque carte affiche sa **raison**
(« parce que vous avez apprécié les jeux de reconnexion ») → « Ne plus me recommander ce type ».
Le refus est immédiat, réversible dans les préférences.

### P4 — Session en cours

Une étape à la fois → six actions toujours visibles → alternative douce/plus courte →
passer → pause → terminer → clôture calme → question finale → souvenir (opt-in).

### P5 — Assistant de communication

Saisie de l'intention (envie, limite, besoin, malaise, différence de désir, demande de temps)
→ choix du ton (doux, direct, romantique, simple, humoristique, court, face à face)
→ proposition → Copier / Modifier / Plus doux / Plus direct / Supprimer.
Aucune prise de parti, aucun reproche, aucun stockage par défaut.

### P6 — Rendez-vous et surprises

Budget, durée, lieu, intérieur/extérieur, niveau d'organisation, goûts, météo si autorisée
→ 3 idées maximum → chaque idée indique ce qui est vérifié et ce qui reste à confirmer.
Toute recommandation locale ou commerciale est vérifiée avant affichage.

### P7 — Mode à distance

Fuseaux si autorisés → questions synchronisées ou asynchrones → défis séparés →
playlist partagée → compte à rebours facultatif → surprise non sensible.
Jamais de notification qui exige une réponse immédiate.

### P8 — Coach de complicité

Une suggestion par jour maximum, facultative → compliment précis, question du jour, moment sans
téléphone, idée de rendez-vous, souvenir à partager, discussion mensuelle envies/limites.
Aucune formulation culpabilisante (liste noire en §10.4).

### P9 — Consentement à deux

A invite B → B voit humeur, durée, niveau, exclusions, rien d'autre → Accepter / Ajuster / Refuser
sans motif → révocation possible à tout moment → refus = aucune session, aucune trace IA.

### P10 — Signalement

Menu « … » → motif → masquage immédiat pour ce couple → file de revue → décision humaine.

### P11 — Admin : du brief à la publication

Brief → génération → vérification automatique → relecture humaine → modification → approbation
→ publication → suivi des performances → archivage. Aucune publication automatique.

### P12 — Admin : revue de modération

File triée par risque → signaux expliqués → décision (classer, masquer, escalader) → motivation
→ recours possible → journal.

## 4. Wireframes des écrans

> Croquis basse fidélité. Le langage visuel (prune, bordeaux, crème, rose poudré, cartes
> arrondies, animations discrètes) est décrit en §4.12.

### 4.1 DuoPlay AI — accueil

```
┌────────────────────────────────────────────────────────────┐
│  ← Retour                         DuoPlay AI      [ Désactiver ] │
│                                                              │
│  Votre moment à deux                                        │
│  Dites-nous où vous en êtes. On vous propose, vous décidez. │
│                                                     [ IA ]    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Que voulez-vous vivre ce soir ?                     │  │
│  │  ____________________________________________  [→]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Suggestions                                                │
│  [ Créer une session de 15 min ]  [ Trouver une idée à distance ] │
│  [ Nous aider à formuler une envie ]  [ Proposer un parcours doux ] │
│  [ Créer une soirée romantique ]  [ Trouver sans photo ]    │
│                                                              │
│  Filtres rapides :  Durée ▾   Humeur ▾   Niveau ▾   Exclusions ▾ │
│                                                              │
│  Historique                                            [ Voir ] │
│  · À distance, tout près — 12 oct. — 15 min         [ Supprimer ] │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Composer — étape humeur

```
┌────────────────────────────────────────────────────────────┐
│  ←   Créer une session                      Étape 1 / 6    │
│  ●○○○○○                                                     │
│                                                              │
│  Quelle est votre humeur ?                                  │
│                                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐                          │
│  │ Tendre │ │Romantiq│ │ Joueur │                          │
│  └────────┘ └────────┘ └────────┘                          │
│  ┌────────┐ ┌────────┐ ┌────────┐                          │
│  │Curieux │ │Sensuel │ │Audacieu│                          │
│  └────────┘ └────────┘ └────────┘                          │
│                                                              │
│  Une humeur se choisit à deux. Vous pourrez l’ajuster.      │
│                                            [ Continuer → ]  │
└────────────────────────────────────────────────────────────┘
```

### 4.3 Composer — contexte et exclusions

```
┌────────────────────────────────────────────────────────────┐
│  ←   Contexte                               Étape 3 / 6    │
│                                                              │
│  Où et comment ?                                            │
│  [x] À deux, au même endroit   [ ] À distance                │
│  [x] À la maison               [ ] Sans accessoire           │
│  [ ] Discussion uniquement     [ ] Avec musique              │
│  [ ] Surprise                  [ ] Reconnexion               │
│                                                              │
│  À exclure avant génération                                 │
│  [x] Photo   [x] Vidéo   [x] Contenu audacieux               │
│  [ ] Accessoires   [ ] Thèmes sensibles ▾                    │
│                                                              │
│  Ces choix seront vérifiés après génération.                │
│                                            [ Continuer → ]  │
└────────────────────────────────────────────────────────────┘
```

### 4.4 Récapitulatif

```
┌────────────────────────────────────────────────────────────┐
│  Voici ce que nous avons compris                            │
│                                                              │
│  Humeur        Tendre                                       │
│  Durée         15 minutes                                   │
│  Contexte      À distance                                   │
│  Niveau        Tendre                                       │
│  Exclusions    Photo · Vidéo · Audacieux                    │
│  Envie          Conversation profonde, petite surprise       │
│                                                              │
│  [ Modifier ]                    [ Générer la session → ]   │
└────────────────────────────────────────────────────────────┘
```

### 4.5 Consentement à deux

```
┌────────────────────────────────────────────────────────────┐
│  Session proposée par votre partenaire                      │
│                                                              │
│  Humeur Tendre · 15 min · À distance                        │
│  Niveau Tendre · Sans photo, sans vidéo                     │
│                                                              │
│  Vous pouvez accepter, ajuster ou refuser sans motif.       │
│                                                              │
│  [ Accepter ]   [ Proposer un ajustement ]   [ Refuser ]    │
└────────────────────────────────────────────────────────────┘
```

### 4.6 Génération

```
┌────────────────────────────────────────────────────────────┐
│  On prépare votre moment…                                   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  3 étapes sur 5                          │
│                                                              │
│  Cela prend quelques secondes. Vous pouvez annuler.         │
│                                                  [ Annuler ] │
└────────────────────────────────────────────────────────────┘
```

### 4.7 Aperçu de session

```
┌────────────────────────────────────────────────────────────┐
│  ←                                    [ IA ]  généré par IA  │
│  À distance, tout près                                      │
│  Quinze minutes pour se retrouver sans se voir.             │
│  15 min · Tendre · À distance · Sans photo                  │
│                                                              │
│  1  Le premier mot                          2 min           │
│  2  Le souvenir qui reste                   3 min           │
│  3  La question qui ouvre                   4 min           │
│  4  Le petit défi                           3 min           │
│  5  La surprise                             3 min           │
│                                                              │
│  Alternatives :  Version 10 min · Sans la surprise          │
│                                                              │
│  [ Commencer ]  [ Modifier ]  [ Régénérer ]  [ Plus tard ]  │
└────────────────────────────────────────────────────────────┘
```

### 4.8 Session en cours

```
┌────────────────────────────────────────────────────────────┐
│  ●●○○○   Étape 2 / 5                          04:12  [ ⏸ ] │
│                                                              │
│  Le souvenir qui reste                                      │
│                                                              │
│  Racontez un moment récent où l’autre a été là,             │
│  sans le savoir.                                            │
│                                                              │
│  [ Accepter ]  [ Modifier ]  [ Passer ]                     │
│  [ Remplacer ] [ Pause ]     [ Terminer ]                   │
└────────────────────────────────────────────────────────────┘
```

### 4.9 Feuille « Remplacer »

```
┌────────────────────────────────────────────────────────────┐
│  Que souhaitez-vous faire ?                                 │
│                                                              │
│  [ Continuer ]                                              │
│  [ Choisir une alternative plus douce ]                     │
│  [ Passer cette étape ]                                     │
│  [ Revenir à une question ]                                 │
│  [ Mettre en pause ]                                        │
│  [ Terminer la session ]                                    │
│                                                              │
│  Aucune de ces options n’a besoin d’être justifiée.         │
└────────────────────────────────────────────────────────────┘
```

### 4.10 Assistant de communication

```
┌────────────────────────────────────────────────────────────┐
│  Aide à formuler                                            │
│                                                              │
│  Ce que je veux dire…                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ J’aimerais qu’on prenne plus de temps pour nous,     │  │
│  │ sans lui faire de reproche.                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Ton : [ Doux ] [ Direct ] [ Romantique ] [ Simple ]        │
│        [ Humoristique ] [ Court ] [ Face à face ]           │
│                                                              │
│  Proposition                                                 │
│  « J’aimerais qu’on puisse prendre un peu plus de temps      │
│    pour nous retrouver. Ce n’est pas un reproche : tu me     │
│    manques et j’aimerais créer davantage de moments à deux. »│
│                                                              │
│  [ Copier ] [ Modifier ] [ Plus doux ] [ Plus direct ] [ Suppr. ] │
└────────────────────────────────────────────────────────────┘
```

### 4.11 Recherche en langage naturel

```
┌────────────────────────────────────────────────────────────┐
│  « trouve une expérience romantique de 10 min à distance »  │
│                                                              │
│  Filtres compris : 10 min · Romantique · À distance          │
│  [ Modifier ]  [ Effacer ]                                   │
│                                                              │
│  3 expériences · 2 cartes · 1 parcours                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Deux voix, une soirée       10 min · Romantique       │  │
│  │ Parce que vous aimez les formats courts à distance.   │  │
│  │                              [ Voir ]  [ Ne plus ]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [ Générer une nouvelle session avec ces filtres ]          │
└────────────────────────────────────────────────────────────┘
```

### 4.12 Design et états

Palette prune `#40203c`, bordeaux `#7a2242`, crème `#ece9e4`, rose poudré `#d9a7c9`.
Cartes arrondies 22 px, ombres douces, transitions 150–200 ms, respect de
`prefers-reduced-motion`.

| État | Traitement |
|---|---|
| Vide | suggestion + 3 raccourcis, jamais un écran nu |
| Chargement | squelettes progressifs, pas de spinner plein écran |
| Résultat partiel | étapes déjà prêtes affichées, reste en attente |
| Erreur | cause compréhensible + action de repli |
| Contenu refusé | explication neutre + alternative sûre |
| Limite détectée | rappel de la limite, proposition conforme |
| Génération impossible | catalogue proposé, aucune impasse |
| Session sauvegardée | confirmation discrète, lien vers l’historique |
| Session supprimée | confirmation + possibilité d’annuler 10 s |

---

## 5. Règles de consentement

### 5.1 Grammaire du consentement

| Acte | Qui | Quand | Effet |
|---|---|---|---|
| Activer DuoPlay AI | chaque partenaire | à la première utilisation | personnel, révocable |
| Lancer une session partagée | les deux | avant génération | session créée |
| Accepter une étape | chaque partenaire | à l’étape | étape vécue |
| Passer / Pause / Terminer | un seul suffit | à tout moment | effet immédiat |
| Enregistrer un souvenir | les deux (ou un, selon réglage) | après la session | visible des deux |
| Partager un contenu généré | explicitement | au cas par cas | jamais par défaut |

### 5.2 Ce qui ne vaut **jamais** consentement

- un silence ou une absence de réponse ;
- une session déjà commencée ;
- une réponse donnée à une étape précédente ;
- une habitude passée ou un niveau choisi un autre jour ;
- l'absence de refus ;
- un « oui » obtenu sous pression, ou par une personne autre que le partenaire concerné.

### 5.3 Révocation

Révocable en un tap, à tout moment, y compris en cours de session. Effet immédiat : la session
s'arrête, aucune relance, aucune question. L'historique IA reste supprimable séparément.

### 5.4 Textes de référence

- « Vous pouvez arrêter à tout moment. Personne ne vous demandera pourquoi. »
- « Une proposition n'est pas une attente. »
- « Si une limite est posée, elle s'applique immédiatement et pour toute la session. »

---

## 6. Modèle de données

| Entité | Rôle | Sensibilité | Rétention |
|---|---|---|---|
| `AIConsent` | consentement par appareil et par fonctionnalité | Moyenne | vie du compte + preuve 5 ans |
| `AIPreference` | humeur, durées, modes, exclusions, refus de reco | Faible | jusqu'à suppression |
| `AIConversation` | fil de demandes/réponses (jamais de contenu intime) | Moyenne | 30 j glissant |
| `AISession` | session générée (titre, étapes, alternatives) | Moyenne | 30 j si non enregistrée |
| `AIPromptRequest` | requête normalisée + hash | Faible | 90 j |
| `AIResponse` | sortie brute validée, versionnée | Moyenne | 90 j |
| `AIRecommendation` | item recommandé + raison + refus | Faible | 90 j |
| `AISafetyEvent` | red flag, refus, escalade | **Élevée** | 24 mois |
| `AIContentDraft` | brouillon éditorial admin | Faible | 12 mois |
| `AIModerationReview` | file humaine, décision, recours | **Élevée** | 24 mois |
| `AIAdminReport` | rapport agrégé | Faible | 24 mois |
| `AIUsageLog` | coût, latence, modèle, tokens (sans contenu) | Faible | 12 mois |
| `AIFeatureFlag` | activation, cohorte, kill switch | Faible | permanent |

Chaque enregistrement porte : `id`, `owner` (appareil ou admin), `createdAt`, `expiresAt`,
`sensitivity`, `retentionPolicy`, `consentStatus`, `deletionHistory`.

Règles transverses : pseudonymisation systématique, aucun `_id` Convex envoyé au fournisseur,
suppression en cascade à la suppression du compte, index par `owner` et par `expiresAt`.

## 7. Flux de traitement d'une requête IA

```
Utilisateur
   │  1. intention (texte ou formulaire)
   ▼
AIGateway ── consentement actif ? quota ? flag ? ── non ──► refus doux + alternative
   │ oui
   ▼
ContextFilter
   │  sélection minimale · suppression des identifiants · application des limites
   ▼
PolicyEngine
   │  red flag ? demande interdite ? ── oui ──► message sûr + ressources + journal
   │ non
   ▼
ModelRouter ──► modèle (prompt versionné, sortie structurée)
   │
   ▼
OutputValidator ── schéma ? exclusions ? profondeur ? ton ? ── non ──► 1 régénération → repli
   │ oui
   ▼
SafetyClassifier ── risque résiduel ? ── oui ──► adoucir / refuser / escalader
   │ non
   ▼
AIAuditLog (hash, version, décision, coût)  ·  AIUsageLog
   │
   ▼
Réponse affichée avec badge IA + raisons + alternatives
```

### 7.1 Les sept étapes en détail

1. **Intention** — formulaire structuré ou texte libre. Le texte libre est une donnée, jamais une
   instruction : aucun outil n'est exposé au modèle.
2. **Porte d'entrée** — consentement de la fonctionnalité, quota restant, flag actif, kill switch.
3. **Filtrage du contexte** — uniquement les métadonnées déclarées en §6 ; pseudonymes éphémères ;
   vérification `maxDepth`, `avoidThemes`, `coupleLimits`.
4. **Politique** — refus des demandes interdites, détection de coercition, détresse, mineur ;
   arrêt avant tout appel modèle.
5. **Génération** — prompt versionné, sortie JSON stricte, streaming, plafond de tokens.
6. **Validation** — schéma, exclusions, durée cohérente, ton, longueur, absence de diagnostic.
7. **Classification et journal** — risque résiduel, décision, coût, version ; rien de sensible
   dans les logs.

### 7.2 Exemple complet

Entrée : *« Tendre · 15 min · à distance · sans photo/vidéo/audacieux · conversation profonde +
petite surprise »*.

- **Contexte envoyé** : humeur, durée, chips, exclusions, niveau, locale, plan, compteur agrégé
  (« 2 sessions de reconnexion ce mois »). Rien d'autre.
- **Politique** : aucune demande interdite, consentement actif, quota 4/5.
- **Sortie** : titre « Un moment rien qu'à vous », 4 étapes, 2 cartes de discussion, 1 défi,
  1 alternative 10 min, question finale, proposition de souvenir.
- **Validation** : 0 photo, 0 vidéo, 0 allusion audacieuse, durée cumulée 14 min ≤ 15.
- **Affichage** : badge IA, durée, alternatives, six actions.

### 7.3 Cas d'échec couverts

| Cas | Comportement |
|---|---|
| Quota atteint | message honnête + 3 expériences du catalogue |
| Consentement retiré | arrêt immédiat, aucune relance |
| Limite incompatible | proposition d'ajuster la durée ou le périmètre, jamais de contournement |
| Sortie invalide | régénération contrainte, puis repli catalogue |
| Modèle indisponible | mode dégradé, latence annoncée |
| Signal de détresse | arrêt, message bienveillant, ressources vérifiées |

---

## 8. Stratégie de confidentialité et RGPD

### 8.1 Principes

1. **Minimisation** : la charge utile est construite par liste blanche, pas par soustraction.
2. **Séparation identité / jeu** : pseudonyme éphémère, aucune jointure identifiante chez le modèle.
3. **Aucun entraînement** sans autorisation explicite — et par défaut, jamais.
4. **Chiffrement** en transit (TLS 1.3) et au repos ; clés séparées pour les données sensibles.
5. **Région UE** : hébergement et inférence en Europe, DPA signé, liste publique des sous-traitants.
6. **Consentement granulaire** : par fonctionnalité sensible (résumés de journal, distance, IA admin).
7. **Désactivation facile** : un interrupteur, effet immédiat, sans perte de fonctionnalités cœur.
8. **Droit à l'effacement** : historique IA supprimable en un tap, sous 30 jours côté sauvegardes.
9. **Anonymisation analytics** : agrégats à seuil ≥ 20, jamais de lignes individuelles.
10. **Masquage des logs** : aucun prompt, aucune sortie, aucune donnée personnelle en clair.
11. **Journal des accès** : qui a consulté quoi, quand, pourquoi (admin).
12. **AIPD/DPIA obligatoire** avant lancement : données relevant de la vie sexuelle, même non lues.

### 8.2 Bases légales

| Traitement | Base | Note |
|---|---|---|
| Génération de session | contrat | exécution du service demandé |
| Recommandations | intérêt légitime + opt-out | pas de profilage publicitaire |
| Résumés de journal | consentement explicite | données sensibles |
| Modération | intérêt légitime + obligation | sécurité des utilisateurs |
| Analytics admin | intérêt légitime | agrégats uniquement |

### 8.3 Droits et procédures

Accès, rectification, effacement, portabilité, opposition, retrait du consentement.
Délai de réponse : 30 jours. Registre des traitements mis à jour à chaque nouvelle fonctionnalité.
Incident : qualification sous 24 h, notification 72 h si nécessaire, communication claire.

### 8.4 Ce qui n'est jamais transmis au modèle

Réponses intimes (`answers`) · notes privées (`journalEntries.note`) · médias · messages entre
partenaires · données de santé · e-mail, nom complet, adresse · géolocalisation précise.

---

## 9. Matrice des risques

| # | Risque | Prob. | Impact | Mitigation | Signal d'alerte |
|---|---|---|---|---|---|
| R1 | Contenu généré déplacé ou trop explicite | Moy. | Élevé | double filtre + plafond de ton + signalement | taux de signalement > 1 % |
| R2 | Contournement des exclusions | Faible | **Critique** | validation déterministe post-génération | 1 cas = incident |
| R3 | Pression sur un partenaire | Faible | **Critique** | double consentement, refus sans motif, red flags | signalement coercition |
| R4 | Fuite de données intimes vers le modèle | Faible | **Critique** | liste blanche, tests automatisés, revue de code | audit de payload |
| R5 | Dépendance / usage excessif | Moy. | Moyen | pas de série, quotas, rappels doux | sessions/jour > seuil |
| R6 | Coût d'inférence incontrôlé | Moy. | Moyen | quotas, budgets, modèles adaptés | > 80 % budget |
| R7 | Indisponibilité fournisseur | Moy. | Moyen | repli, circuit breaker, catalogue | p95 > 12 s |
| R8 | Biais de recommandation (enfermement) | Moy. | Moyen | diversité forcée, explication, refus | > 60 % même catégorie |
| R9 | Médicalisation implicite | Faible | Élevé | liste noire de formulations, revue éditoriale | audit d'échantillon |
| R10 | Jailbreak / injection | Moy. | Moyen | données ≠ instructions, schéma strict | test red team |
| R11 | Décision admin automatisée | Faible | **Critique** | validation humaine obligatoire | audit des actions |
| R12 | Non-conformité RGPD | Faible | **Critique** | AIPD, DPA, revue juridique | revue trimestrielle |

Priorité de traitement : R4, R2, R3, R11, puis R1 et R12.

---

## 10. Stratégie de modération

### 10.1 Taxonomie

| Catégorie | Gravité | Exemple | Défaut | Décision humaine |
|---|---|---|---|---|
| Mineur | Critique | mention d'âge < 18 | blocage | obligatoire |
| Coercition | Critique | « il/elle n'a pas le choix » | blocage + ressources | obligatoire |
| Violence réelle | Critique | menace physique | blocage + ressources | obligatoire |
| Auto-agression | Critique | détresse exprimée | arrêt + ressources | obligatoire |
| Exploitation | Critique | contrainte économique | blocage | obligatoire |
| Contenu explicite | Élevée | description graphique | régénération adoucie | si répétition |
| Harcèlement | Élevée | insultes ciblées | masquage | oui |
| Haine / discrimination | Élevée | propos dégradants | blocage | oui |
| Données personnelles | Élevée | coordonnées partagées | masquage | oui |
| Usurpation / fraude | Élevée | faux profil, paiement | gel + revue | oui |
| Médical / thérapeutique | Moyenne | « cela soigne… » | réécriture | non |
| Manipulation | Moyenne | « si tu refuses… » | réécriture | non |
| Spam / hors-sujet | Faible | répétition | filtrage | non |

### 10.2 Chaîne

1. Pré-filtre d'intention (règles + classifieur).
2. Contraintes de génération.
3. Post-classification de la sortie.
4. Signalement utilisateur (effet immédiat : masquage local).
5. File humaine avec signaux expliqués.
6. Décision motivée + recours + journal.
7. Boucle d'apprentissage : cas → jeu d'évaluation → correction de prompt.

### 10.3 Engagements

| Gravité | Prise en charge | Décision | Recours |
|---|---|---|---|
| Critique | < 1 h | < 4 h | 24 h |
| Élevée | < 4 h | < 24 h | 72 h |
| Moyenne | < 24 h | < 72 h | 7 j |
| Faible | < 72 h | < 7 j | 7 j |

Preuves conservées : le strict nécessaire, pseudonymisées, 24 mois maximum. Aucune diffusion
au-delà de l'équipe habilitée.

### 10.4 Copie interdite (liste noire produit)

« Vous n'avez pas joué depuis longtemps. » · « Vous perdez votre série. » ·
« Votre couple est moins actif. » · « Vous devriez… » · « La plupart des couples… »

Copie autorisée : « Voici une idée simple pour vous retrouver si vous en avez envie. » ·
« Vous pouvez reprendre quand le moment vous conviendra. » · « Cette expérience est disponible
lorsque vous souhaitez la découvrir. »

### 10.5 Interdictions d'automatisation

Aucun bannissement définitif, aucune suspension, aucun remboursement important, aucune
suppression de compte, aucune publication, aucun changement de prix sur décision automatique.
Ces actes exigent une validation humaine tracée (§13).

## 11. Roadmap par phases

### Phase 1 — IA contrôlée (MVP)

**Objectif** : prouver la valeur sans introduire de risque nouveau.

| Chantier | Contenu | Personnes-semaines |
|---|---|---|
| Socle | passerelle, quotas, flags, audit, kill switch | 4 |
| Sécurité & conformité | filtrage, validation, AIPD, DPA, textes | 4 |
| Générateur de session | composer, aperçu, exécution, contrôles | 5 |
| Consentement | simple et double, révocation | 2 |
| Recommandations | moteur explicable + refus | 3 |
| Recherche naturelle | interprétation + résultats mixtes | 3 |
| Assistant de communication | 7 tons, actions, zéro stockage | 2 |
| Copilote éditorial | génération, vérif, relecture, publication | 4 |
| Traduction assistée | ES/EN, relecture | 2 |
| Analytics agrégés | questions en langage naturel | 3 |
| Observabilité | coûts, qualité, versions | 2 |
| **Total** | | **34 p·sem.** |

Durée : 12 semaines à 3 développeurs. Sortie : bêta fermée, 200 couples, 0 violation d'exclusion.

### Phase 2 — IA personnalisée

| Chantier | Contenu | p·sem. |
|---|---|---|
| Adaptation en temps réel | alternatives douces/courtes, sans nouvel appel lourd | 3 |
| Mode à distance | synchronisation, asynchrone, fuseaux | 4 |
| Rendez-vous & surprises | budget, lieu, vérification locale | 2 |
| Coach de complicité | suggestion quotidienne facultative | 2 |
| Résumés de journal | opt-in strict, suppression immédiate | 3 |
| Parcours personnalisés | génération de séquences | 3 |
| Personnalisation | embeddings, diversité, ordonnancement | 3 |
| **Total** | | **20 p·sem.** |

Durée : 8 semaines à 3 développeurs. Sortie : palier 25 %, rétention mesurée.

### Phase 3 — IA avancée (contrôles renforcés)

| Chantier | Contenu | p·sem. |
|---|---|---|
| Modération intelligente | classification, file, recours | 4 |
| Détection de fraude | paiements, abus, faux comptes | 3 |
| Prédiction de désabonnement | signaux agrégés, jamais individuels | 3 |
| Recommandations avancées | modèles de pertinence | 3 |
| Tendances produit | analyse agrégée | 2 |
| Assistant vocal | **étude seulement**, pas de lancement | 2 |
| **Total** | | **17 p·sem.** |

Durée : 6 semaines. Sortie : 100 % si les portes sont franchies.

### Portes entre phases

| Porte | Critère |
|---|---|
| P1 → P2 | 0 violation d'exclusion sur 500 sessions · signalements < 1 % · coût/session dans la cible |
| P2 → P3 | rétention +5 pts · 0 incident critique · AIPD mise à jour |
| P3 → général | audit externe · revue DPO · plan de recours opérationnel |

---

## 12. Coûts et complexité

### 12.1 Coût d'inférence (ordre de grandeur, à revalider)

Hypothèses : 1 500 tokens d'entrée + 1 200 de sortie par session, classifieur inclus, 15 % de
régénérations, embeddings pour la recherche.

| Volume mensuel | Coût modèle estimé | Coût embeddings + classification | Total indicatif |
|---|---|---|---|
| 10 000 sessions | 200 – 400 € | 20 € | **≈ 250 – 450 €** |
| 50 000 sessions | 1 000 – 2 000 € | 100 € | **≈ 1 100 – 2 200 €** |
| 200 000 sessions | 4 000 – 8 000 € | 400 € | **≈ 4 500 – 8 500 €** |

Fourche haute = modèle intermédiaire ; fourche basse = petit modèle + cache. Le cache de
recommandations et la pré-génération hors pointe réduisent la facture de 30 à 50 %.

### 12.2 Coûts fixes et humains

| Poste | Estimation |
|---|---|
| Convex (base + fonctions + stockage) | 50 – 300 €/mois selon volume |
| Observabilité / logs | 50 – 150 €/mois |
| Modération humaine | 0,5 ETP au lancement, 1 ETP à 100 k sessions/mois |
| AIPD + conseil juridique | 3 000 – 8 000 € ponctuel |
| Design + accessibilité | inclus dans l'effort projet |

### 12.3 Complexité par brique

| Brique | Complexité | Pourquoi |
|---|---|---|
| Générateur | Élevée | qualité, contraintes, latence |
| Consentement double | Moyenne | états, révocation, temps réel |
| Recommandations | Moyenne | explicabilité + diversité |
| Recherche naturelle | Moyenne | interprétation + filtres |
| Communication | Faible | sortie courte, peu d'états |
| Modération | Élevée | faux positifs, recours, preuves |
| Analytics admin | Moyenne | agrégats, exactitude |
| Vocal | Très élevée | consentement, bruit, RGPD |

### 12.4 Contraintes techniques

Région UE obligatoire · aucune dépendance à un fournisseur unique · versions de modèle épinglées ·
sorties structurées · streaming · WebSocket Convex pour la synchro à distance · compatibilité
modes dégradés · accessibilité AA · réduction des animations.

---

## 13. Critères de validation humaine

### 13.1 Ce qui exige un humain, toujours

| Acte | Validateur | Preuve |
|---|---|---|
| Publication d'un contenu généré | éditeur + relecteur | double validation journalisée |
| Bannissement ou suspension définitive | Trust & Safety lead | motif + recours |
| Remboursement important | Finance | seuil défini |
| Suppression de compte | Support lead + DPO | demande vérifiée |
| Modification de prix | Direction | journal |
| Accès à des données privées | DPO | habilitation + motif |
| Changement de règle de consentement | DPO + direction | version datée |

### 13.2 Ce que l'IA peut faire seule

Classer, proposer, résumer des agrégats, rédiger un brouillon, expliquer une recommandation,
détecter un signal et **ouvrir** une revue. Rien d'irréversible.

### 13.3 Portes de validation avant mise en production

1. Revue de code sécurité (payload, logs, secrets).
2. Jeu d'or : 150 cas, 0 violation d'exclusion.
3. Red team : 60 attaques, 0 contournement.
4. Revue éditoriale : 30 sorties, qualité ≥ 4/5, ton conforme.
5. AIPD validée par le DPO.
6. Test d'accessibilité AA.
7. Simulation d'incident : kill switch < 60 s.

---

## 14. Métriques de succès

### Produit

- Activation de DuoPlay AI : ≥ 35 % des couples actifs à 30 j.
- Taux de complétion des sessions générées : ≥ 60 %.
- Note « moment réussi » : ≥ 4,2/5.
- Taux de modification d'étape : 10–25 % (signe d'appropriation, pas d'échec).
- Taux de passage : < 20 % (au-delà, la génération est trop ambitieuse).

### Sécurité et confiance

- Violations d'exclusion : **0**.
- Taux de signalement : < 1 % des sessions.
- Faux positifs de modération : < 10 %.
- Refus de sécurité expliqués et acceptés : > 80 %.
- Incidents critiques : 0.

### Technique

- p95 première étape < 2,5 s · p95 session < 8 s.
- Disponibilité ≥ 99,5 %.
- Taux de repli catalogue < 3 %.
- Coût moyen par session ≤ 0,04 €.

### Économie

- Coût IA < 8 % du revenu par abonné.
- Rétention à 30 j : +5 pts vs cohorte sans IA.
- Désactivation de l'IA : < 5 % (si supérieure, le problème est le produit, pas l'IA).

---

## 15. Périmètre exclu du MVP

**Exclu de la phase 1** : adaptation en temps réel, mode à distance, rendez-vous, coach,
résumés de journal, parcours personnalisés, modération IA, fraude, churn, vocal.

**Exclu durablement, sauf décision explicite** :

- analyse d'images intimes ;
- lecture automatique des conversations privées ;
- assistant vocal en production ;
- diagnostic, score ou pronostic de couple ;
- génération de contenu sexuel explicite ;
- mémoire persistante non consentie ;
- décisions sensibles automatisées ;
- recommandations publicitaires ciblées ;
- envoi d'un message au partenaire sans validation.

**Raison** : chaque élément exclu ajoute un risque juridique ou éthique disproportionné par
rapport à la valeur produit au stade actuel.

---

## 16. Décisions à valider avant développement

| # | Décision | Options | Recommandation |
|---|---|---|---|
| D1 | Fournisseur | Mistral UE seul · passerelle multi-fournisseurs | passerelle, Mistral par défaut |
| D2 | Budget inférence | plafond mensuel + plafond par couple | 500 €/mois au lancement, 30 sessions/mois/couple |
| D3 | Visibilité initiale | IA visible dès la phase 1 · interne d'abord | visible en bêta fermée |
| D4 | Mémoire | aucune · mémoire opt-in de couple | aucune en phase 1 |
| D5 | Niveau maximal du registre | suggestif · suggestif assumé | suggestif, jamais explicite |
| D6 | Résumés de journal | phase 2 · jamais | phase 2, opt-in strict |
| D7 | Modération humaine | interne · externe | interne + astreinte |
| D8 | Ressources d'aide | par pays, vérifiées juridiquement | blocage tant que non validées |

**Validation requise** : produit, ingénierie, DPO, direction.
Tant que ce tableau n'est pas signé, aucun développement ne commence.

---

## 17. Livrables de ce dossier

| # | Livrable | Section |
|---|---|---|
| 1 | Architecture IA | §1 |
| 2 | Fonctionnalités par priorité | §2 |
| 3 | Parcours UX | §3 |
| 4 | Wireframes | §4 |
| 5 | Règles de consentement | §5 |
| 6 | Modèle de données | §6 |
| 7 | Flux d'une requête IA | §7 |
| 8 | Confidentialité et RGPD | §8 |
| 9 | Matrice des risques | §9 |
| 10 | Modération | §10 |
| 11 | Roadmap | §11 |
| 12 | Coûts et complexité | §12 |
| 13 | Validation humaine | §13 |
| 14 | Métriques de succès | §14 |
| 15 | Exclusions du MVP | §15 |
| 16 | Décisions à signer | §16 |



