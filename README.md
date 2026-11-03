# DuoPlay — Retrouvez-vous autrement

Plateforme interactive de jeux, de défis et d'expériences pour aider les
couples à renforcer leurs liens, briser la routine et raviver la flamme.

Mobile-first · Accessible par lien · Jouable à deux · Web PWA

> Le document produit & technique de référence est [`docs/PRD.md`](docs/PRD.md).

## Stack

| Couche | Choix |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS v4 + primitives shadcn/ui |
| Backend | Convex (base réactive, temps réel, cron, auth) |
| Auth | Convex Auth (compte léger + lien invité) |
| PWA | manifest + service worker |
| Déploiement | Netlify (front) + Convex Cloud (back) |

## Démarrage

```bash
npm install
npx convex dev        # configure un déploiement local + génère les types
```

Convex démarre un **backend local** (`http://127.0.0.1:3210`) : **aucun compte
n'est requis** pour développer. La commande renseigne `NEXT_PUBLIC_CONVEX_URL`
dans `.env.local` et génère `convex/_generated/`.

Laissez `npx convex dev` tourner, puis dans un second terminal :

```bash
npm run dev           # http://localhost:3000
npm run seed:catalogue   # peuple univers, expériences, questions et parcours (idempotent)
```

> Le catalogue éditorial est versionné dans `convex/data/catalogue.ts`.
> La commande `npm run seed:catalogue` peut être relancée sans créer de
> doublons : elle retrouve chaque entrée par son slug (ou son jour de parcours).

> Pour relier le projet à un vrai compte Convex plus tard :
> `npx convex login` puis `npx convex dev` (reconfiguration).

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Vérification des types |
| `npm run seed:catalogue` | Réamorce le catalogue (idempotent) |
| `npm run test:e2e` | Test de bout en bout : boucle de jeu |
| `npm run test:engagement` | Test de bout en bout : défi, favoris, historique, couple |
| `npm run test:parcours` | Test de bout en bout : parcours guidés |
| `npm run test:personnalisation` | Test de bout en bout : ambiance, profondeur, thèmes, passage libre |
| `npm run test:polish` | Test de bout en bout : accessibilité, hors ligne, installation, états d'erreur |
| `npm run test:nouveautes` | Test de bout en bout : roue, ambiances, univers enrichis |
| `npm run test:dashboard` | Test de bout en bout : sidebar, navigation responsive, pages dédiées |
| `npm run test:compte` | Test de bout en bout : compte léger, code de récupération, reconnexion |
| `npm run test:differe` | Test de bout en bout : cycle de vie différé (relances, expiration, clôture) |
| `npm run test:parametres` | Test de bout en bout : ambiance, préférences, consentements, données locales |
| `npm run test:activite` | Test de bout en bout : statistiques personnelles « Mon activité » |
| `npm run test:journal` | Test de bout en bout : journal du couple (souvenirs, notes, photos) |
| `npm run test:calendar` | Test de bout en bout : calendrier des moments à deux |
| `npm run test:favoris` | Test de bout en bout : favoris et collections nommées |
| `npm run test:onboarding` | Test de bout en bout : premier réglage non bloquant |
| `npm run test:presence` | Test de bout en bout : présence du partenaire, vérifiée côté serveur |
| `npm run test:defi` | Test de bout en bout : défi du jour et anti-répétition |
| `npm run test:partage` | Test de bout en bout : carte souvenir partageable |
| `npm run test:offline` | Service worker et cache (serveur de production) |

## Structure

```
app/                 Pages (App Router)
  page.tsx           Landing
  (app)/             Espace joueur : accueil, explorer, mes parties,
                     mes favoris, notre espace, défi, parcours guidés
    explorer/[slug]/ Expériences d'un univers
    nouvelle/[slug]/ Configuration d'une partie
    defi/            Défi du jour
    roue/            Roue du hasard complice
    parcours/        Catalogue, détail d'un parcours, récapitulatif final
    mes-parties/     Parties en cours, en attente du partenaire, terminées
    mes-favoris/     Expériences mises de côté, classées en collections
    compte/          Mon profil : compte léger, code de récupération, préférences
    parametres/      Paramètres : ambiance, préférences, consentements, données
    notre-espace/    Couple, rappels, favoris, historique, journal, calendrier,
                     parcours
  partie/[token]/    Salle de jeu temps réel (lien privé)
  join/[token]/      Lien d'invitation → redirige vers /partie/<token>
  admin/             Back-office : catégories, expériences, questions, parcours,
                     modération
components/          UI, design system, navigation, PWA, jeu, parcours
convex/              Backend : schema, contenu, sessions, défi du jour, favoris,
                     historique, couples, parcours, préférences, gages de la roue,
                     journal du couple, calendrier, comptes légers, consentements,
                     analytics, notifications, entretien (cron quotidien + purge)
lib/                 Utilitaires, contenu de référence, session admin, jeu,
                     ambiance, configuration de navigation
public/              manifest, icônes, service worker
tests/helpers.cjs    Helpers partagés des tests de bout en bout
tests/game-loop.cjs  Test de bout en bout de la boucle de jeu
tests/engagement.cjs Test de bout en bout de l'engagement (Phase 3)
tests/parcours.cjs   Test de bout en bout des parcours guidés (Phase 4)
tests/personnalisation.cjs  Test de bout en bout de la personnalisation (Phase 5)
tests/polish.cjs     Test de bout en bout du polish et de l'accessibilité (Phase 8)
tests/nouveautes.cjs Test de bout en bout de la roue, des ambiances et des univers
tests/dashboard.cjs  Test de bout en bout de la sidebar et de la navigation
tests/compte.cjs     Test de bout en bout du compte léger (Phase 6)
tests/differe.cjs    Test de bout en bout du cycle de vie différé (§13) et des rappels
tests/parametres.cjs Test de bout en bout de la page Paramètres
tests/activite.cjs   Test de bout en bout de « Mon activité » (statistiques)
tests/journal.cjs    Test de bout en bout du journal du couple (souvenirs)
tests/calendar.cjs   Test de bout en bout du calendrier des moments à deux
tests/favoris.cjs    Test de bout en bout des favoris et des collections
tests/onboarding.cjs Test de bout en bout du premier réglage (onboarding)
tests/partage.cjs    Test de bout en bout de la carte souvenir partageable
docs/PRD.md          Spécification complète
```

## Nouvelles expériences

Quatre ajouts prolongent la boucle de jeu, dans la même retenue visuelle :

- **Défi du jour 3D** (`components/game/daily-challenge.tsx`) — la carte du défi
  s'incline légèrement sous le pointeur (`components/ui/tilt.tsx`, perspective +
  variables `--mx`/`--my`), et la réponse reste **scellée** (« Votre réponse
  reste scellée jusqu'à ce que … participe ») jusqu'à la participation des deux
  partenaires. L'action est explicitement collective : *Participer ensemble*,
  *Relever le défi ensemble*. Quand les deux ont joué, une célébration sobre se
  déploie (`data-testid="daily-reveal"`).
- **Roue du hasard complice** (`/roue`, `components/game/roue-du-hasard.tsx`) —
  une roue dorée à 8 secteurs qui tire un **gage immédiat** parmi 16 gages
  publiés côté Convex (`convex/roue.ts`, table `forfeits`). Le tirage se fait
  côté client (une requête serait ré-exécutée), l'atterrissage est amorti par un
  ressort (`GENTLE_SPRING`), et le résultat s'affiche dans une carte rubis. La
  roue est accessible depuis l'accueil (`data-testid="roue-cta"`).
- **Les 4 univers complices enrichis** (`components/app/universe-grid.tsx`) —
  chaque carte affiche désormais sa **durée** (`≈ n min`), son **intensité**
  (Léger / Tendre / Profond) et devient un **déclencheur** cliquable
  (`aria-label="Lancer une partie — …"`), alimenté par l'agrégat Convex
  (`convex/categories.ts`, `categories.list`).
- **Mode Soirée aux Chandelles / Douceur Jour** (`components/app/ambiance-toggle.tsx`)
  — un bouton Soleil/Lune bascule le fond entre la nuit d'obsidienne froide
  (Chandelles) et la même nuit **réchauffée d'ambre** (Douceur). L'ambiance est
  retenue dans `localStorage` (`duoplay:ambiance`) et appliquée avant le premier
  rendu par un script inline (aucun flash).

## Tableau de bord et navigation

La navigation s'adapte à la taille de l'écran, sans jamais doubler les mêmes
contrôles à l'écran (chaque bascule n'apparaît qu'une fois par palier) :

- **Desktop (`lg`)** — une **sidebar verticale** (`components/app/app-sidebar.tsx`)
  regroupe le *Menu principal* (Accueil, Expériences, Mes parties, Mes favoris) et
  l'*Espace personnel* (Notre espace, Mon profil, Paramètres), avec un appel à
  l'action « Créer une partie ». **Mon profil** mène au vrai `/compte` (compte
  léger, cf. ci-dessous) et **Paramètres** au vrai `/parametres` (cf. plus bas) :
  plus aucune entrée n'est annoncée « Bientôt ».
- **Tablette (`md`)** — la sidebar se replie en **rail d'icônes** ; l'en-tête
  contextuel (`components/app/app-header.tsx`) affiche le titre de la page, la
  présence du partenaire et la bascule d'ambiance.
- **Mobile (< `md`)** — la *Floating Island* (`components/app/app-island.tsx`) et
  la **barre inférieure** (`components/app/bottom-nav.tsx`) prennent le relais :
  quatre destinations réelles (Accueil, Expériences, Mes parties, Espace).
- **Deux pages dédiées** prolongent l'espace personnel sur de vraies données :
  `/mes-parties` (`history.byDevice` — parties en cours, en attente du partenaire,
  terminées, avec **invitation partageable** via `components/app/share-invite.tsx`)
  et `/mes-favoris` (`favorites.list`). Les deux affichent un état vide soigné.
- Un **pied de page discret** (`components/app/app-footer.tsx`) referme chaque
  écran : marque, Confidentialité, CGU, copyright.

La configuration partagée vit dans `lib/navigation.ts` (`PRIMARY_NAV`,
`PERSONAL_NAV`, `MOBILE_NAV`, `titleForPath`, `isActive`).

## Compte léger, vie privée et rappels

Trois briques referment la boucle produit sans jamais transformer DuoPlay en
péage : on peut **jouer entièrement sans compte**, sans consentement, et sans
notification.

- **Compte léger** (`/compte`, `components/account/account-panel.tsx`,
  `convex/accounts.ts`) — ni mot de passe ni vérification. Un compte fédère
  plusieurs appareils autour d'un `primaryDeviceToken` : les données restent
  indexées par appareil (aucune migration serveur), et un code de récupération
  (`XXXX-XXXX-XXXX`, affiché une seule fois) relie un second appareil à
  l'historique, aux favoris et au couple déjà constitués
  (`accounts.mergeDevice`). On peut **renommer son partenaire**, **dissoudre
  l'espace couple** (chacun garde ses réponses) ou **dissocier l'appareil**.
- **Consentement d'abord** (`convex/consents.ts`, `components/consent-banner.tsx`)
  — une bannière à deux taps (*Tout accepter* / *Tout refuser*), modifiable à
  tout moment depuis **Mon profil** ou **Paramètres**. Aucun événement de mesure
  n'est écrit sans accord : `analytics.track` filtre **côté serveur**. La
  bannière ne s'affiche jamais pendant une action (`/partie`, `/nouvelle`,
  `/join`) ni dans le back-office — on ne demande pas son consentement à
  quelqu'un en train de jouer.
- **Mesure utile** (`convex/analytics.ts`, `convex/stats.ts`) — entonnoir
  `landing_view → session_created → invite_link_shared → invite_opened →
  guest_joined → game_started → game_revealed → question_answered →
  session_resumed → game_completed → account_created`, plus les partages
  (`invite_link_shared`, `result_card_shared`), visibles dans le
  back-office (`/admin`).
- **Cycle de vie différé (§13)** (`convex/sessions.ts`, cron quotidien) — une
  partie laissée en attente déclenche au plus **un rappel J+1 puis J+3**, puis
  son **expiration** est matérialisée (`expiree`). Depuis `/mes-parties`, on
  peut **relancer** (le lien gagne 3 jours) ou **clôturer** en gardant ses
  réponses. `sessions.lifecycleSweep({ adminKey, now })` rejoue le balayage avec
  une horloge injectée — outil d'exploitation et socle du test `test:differe`.
- **Rappels doux (§14)** (`convex/notifications.ts`,
  `components/app/notifications-section.tsx`) — affichés dans « Notre espace »
  et signalés par une cloche d'en-tête. Chaque rappel est écartable ; aucun
  n'est requis pour continuer.
- **Freins anti-abus** (`convex/lib/ratelimit.ts`) — création de parties, jointures
  et échecs de jointure sont limités par appareil, en fenêtre glissante.
- **Rétention (§15.2)** (`convex/maintenance.ts`, cron hebdomadaire) — purge des
  parties expirées depuis 30 jours, des rappels anciens et des compteurs de
  limitation ; `maintenance.purge({ adminKey })` reste disponible à la demande.

## Paramètres

`/parametres` (`components/app/parametres.tsx`) rassemble en une page — sans
redirection, sans faux écran — tout ce qui se décide **sur l'appareil** :

- **Ambiance** — un choix explicite « Soirée aux chandelles ↔ Douceur du jour »
  qui pilote la même clé (`lib/ambiance.ts`, `duoplay:ambiance`) que la bascule
  d'en-tête : les deux surfaces restent synchronisées, y compris entre onglets.
- **Préférences de jeu** — profondeur maximale (IntimacyCrown), thèmes à éviter
  (`experiences.themes` agrège tout le contenu publié), durée et mode par défaut.
  Enregistrées via `preferences.save` ; « Tout remettre à zéro » passe par
  `preferences.clear` (vider puis réécrire, pour que « Auto » redevienne
  possible). Elles pré-remplissent chaque nouvelle partie et **restent privées**
  (jamais montrées au partenaire).
- **Mesures et rappels** — les deux consentements (`consents.set`), décidés
  appareil par appareil, sans compte.
- **Sur cet appareil** — état d'installation (PWA, `beforeinstallprompt`),
  réaffichage de l'invitation après refus (`allowInstallPrompt`), purge du cache
  hors ligne, version.
- **Données locales** — un récapitulatif honnête de ce que l'appareil retient
  (prénom, ambiance, compte, identifiant) et un « Repartir de zéro »
  (`clearLocalData`) protégé par confirmation : l'appareil oublie son identité,
  sa reprise et ses préférences, **le serveur n'est jamais touché**.

## Mon activité

La section **« Mon activité »** de l'accueil (`components/app/activity-stats.tsx`,
alimentée par `convex/activity.ts`) résume, **pour l'appareil seulement**, ce qui
a réellement été vécu :

- quatre compteurs honnêtes — **parties jouées** (sessions `terminee`),
  **moments partagés** (terminées à deux), **expériences découvertes**
  (expériences distinctes), **défis accomplis** (achèvements enregistrés) ;
- un **filtre de période** (7 jours / 30 jours / depuis le début) qui recalcule
  les compteurs, avec une évolution affichée seulement quand elle est
  calculable et positive ;
- un **graphique des sept derniers jours** (jours vides compris, valeurs
  exactes) ; une **régularité** (jours actifs + progression du parcours en
  cours) ;
- une **activité récente** (expérience, date, catégorie, statut, action pour
  revoir le résultat ou recommencer).

Aucune donnée du partenaire n'est exposée : ni ses réponses, ni un classement,
ni une comparaison. Une partie **abandonnée ou expirée n'est jamais comptée**
comme jouée et une **reprise ne double pas** le total. Sur un appareil neuf,
les compteurs affichent 0 et un message invite à lancer une première
expérience. Vérifié par `tests/activite.cjs`.

## Journal du couple

La section **« Journal du couple »** de `/notre-espace`
(`components/app/journal.tsx`, alimentée par `convex/journal.ts`) rassemble les
souvenirs que le couple choisit de garder. Elle est **partagée avec l'appareil
partenaire relié** — et seulement avec lui.

- **Moments créés automatiquement** — chaque partie terminée (et chaque parcours
  accompli) dépose un souvenir intitulé d'après l'expérience. L'écriture est
  **idempotente** (index `by_session` / `by_journey`) : une reprise ou un
  balayage ne crée jamais de doublon, et un souvenir retiré n'est **jamais
  recréé** (`removedAt`).
- **Notes libres** — un titre, un mot, et **une photo dès maintenant**. L'image
  passe par le stockage Convex (`journal.generateUploadUrl` → POST → `mediaId`) ;
  le serveur en revérifie le **type** (`image/*`) et le **poids** (≤ 6 Mo) via
  `ctx.db.system.get("_storage", …)`. Retirer une entrée libère l'image.
- **Suggestions depuis les favoris** — une expérience mise de côté peut devenir
  un souvenir d'un tap (« Garder »), pré-rempli de son titre.
- **Éditer ou retirer** — une note n'appartient qu'à son auteur ; un moment
  partagé, aux deux. Aucune réponse de jeu n'est jamais recopiée dans le
  journal.

Vérifié par `tests/journal.cjs` (état vide, note écrite/corrigée/retirée, photo
téléversée, moment automatique non dupliqué, partage avec le partenaire).

## Calendrier des moments

La section **« Calendrier des moments »** de `/notre-espace`
(`components/app/calendar.tsx`, alimentée par `convex/events.ts`) permet de
proposer à deux une date à ne pas oublier :

- **quatre genres** — rendez-vous, anniversaire, activité, surprise — avec une
  date, une heure facultative et un mot ;
- le **prochain moment** mis en avant, daté relativement (« Aujourd'hui »,
  « Demain », « Dans 3 jours ») et horodaté en heure locale (WAT) ;
- **marquer fait** (le moment rejoint les moments passés) ou **retirer** sous
  confirmation ;
- partagé avec l'appareil partenaire relié : **les deux voient et complètent**
  le même agenda, jamais un tiers.

Le jour de référence est celui d'**Africa/Lagos** (`convex/lib/dates.ts`),
cohérent avec le défi du jour. Vérifié par `tests/calendar.cjs`.

## Favoris et collections

Une expérience gardée (l'étoile sur sa carte) rejoint **/mes-favoris**, où elle
peut être triée en **collections nommées** (`convex/collections.ts`,
`components/app/mes-favoris.tsx`) :

- créer une collection (nom libre, pastille emoji), **renommer**, **réordonner**
  et **supprimer** — à la suppression, ses favoris redeviennent simplement
  « sans collection » ;
- **classer** chaque favori (menu « Collection ») et **filtrer** la liste par
  collection, avec le compte de chaque liste ;
- **réordonner** les favoris eux-mêmes (flèches ↑ / ↓).

Comme les favoris, les collections appartiennent à **l'appareil** et ne sont
jamais partagées avec le partenaire (12 collections au maximum). Vérifié par
`tests/favoris.cjs`.

## Parcours guidés

Un **parcours** est un programme de 3, 7 ou 21 jours — une étape par jour, pour
supprimer la paralysie du choix (cf. PRD §3.E). Chaque étape est soit une
**expérience** à lancer, soit une **mission** à faire dans la vie réelle.

1. **Choisir** — `/parcours` présente le catalogue ; la progression du couple
   apparaît sur chaque carte.
2. **Commencer** — un tap, aucune inscription ; l'étape du jour est mise en
   avant sur l'accueil.
3. **Avancer** — une mission se valide depuis l'étape, une expérience se lance
   depuis l'étape : `sessions.create` reçoit `journeySlug` + `journeyDayIndex`
   et la partie terminée **valide automatiquement l'étape** pour les deux
   appareils.
4. **Terminer** — `/parcours/<slug>/recapitulatif` rassemble les étapes
   traversées, les jeux joués et les missions accomplies.

La progression est **celle du couple** : chaque appareil garde sa trace
(`journeyProgress`), mais la lecture additionne les jours faits de part et
d'autre (cf. §10, `journeyProgress.coupleId`). Aucune étape n'est verrouillée.

## Personnalisation

La promesse : **aucune activité imposée** (cf. PRD §3.F).

- **Ambiance** — à l'exploration, quatre ambiances (rire, tendresse, découverte,
  surprise) filtrent les univers (`/explorer?ambiance=…`) ; le choix suit le
  couple jusqu'au formulaire.
- **Mode** — Ensemble, À distance, Différé ou Défi individuel, selon
  l'expérience.
- **Durée** — 5, 10, 15, 20 ou 30 minutes : elle détermine le nombre de
  questions visé.
- **Profondeur** — un **plafond**, jamais un plancher : « Léger » ne servira
  jamais une question profonde.
- **Thèmes à éviter** — les thèmes proposés viennent du contenu réel de
  l'expérience ; une question écartée n'est **jamais** posée et n'est jamais
  utilisée pour compléter la partie.
- **Passer sans justification** — à tout moment, sans motif, sans pénalité ;
  le geste est présenté comme tel dans la partie.

Concrètement : le formulaire affiche en direct le nombre exact de questions
retenues (requête `experiences.preview`, source unique de vérité côté serveur),
signale le manque (`trop peu de questions`) et **empêche de démarrer** quand plus
aucune question ne correspond. Le tirage est figé dans la session
(`questionIds`), donc les deux joueurs voient exactement la même chose.

Les préférences de profondeur, de thèmes écartés, de durée et de mode sont
**retenues sur l'appareil** (`preferences`, lié au `deviceToken`) : la prochaine
partie est déjà ajustée. Elles ne sont jamais partagées avec le partenaire — la
partie n'expose que le *nombre* de thèmes écartés, jamais lesquels (§15).

## Boucle de jeu

1. **Créer** — depuis un univers, on choisit une expérience, un mode et une
   durée. Le serveur fige la liste des questions dans la session et renvoie un
   `token` (lien privé) ainsi qu'un `playerToken` (secret du joueur).
2. **Inviter** — le lien se partage (WhatsApp / copie). Aucune inscription : le
   partenaire ouvre le lien, donne son prénom et rejoint.
3. **Répondre** — chacun répond de son côté. Les réponses restent **masquées**
   tant que les deux n'ont pas répondu.
4. **Révéler** — la révélation est simultanée et automatique (temps réel
   Convex) : réponses côte à côte, verdict identique/différent, piste de
   discussion.
5. **Reprendre** — `playerToken` et position de lecture sont conservés dans le
   navigateur : une partie interrompue se retrouve à l'identique, y compris en
   différé.

Aucune donnée n'est exposée avant révélation : `sessions.roomState` ne renvoie
la réponse du partenaire que pour les questions résolues, et uniquement aux
joueurs de la partie (vérifié via `playerToken`).

## Tests

```bash
npm run typecheck           # tsc --noEmit
npm run lint                # eslint
npm run test:e2e            # boucle de jeu complète en vrai navigateur
npm run test:engagement     # défi du jour, favoris, historique, couple
npm run test:parcours       # parcours guidés, de bout en bout
npm run test:personnalisation  # ambiance, profondeur, thèmes, passage libre
npm run test:polish           # accessibilité, hors ligne, installation, erreurs
npm run test:dashboard        # sidebar et navigation responsive
npm run test:compte           # compte léger, code de récupération, reconnexion
npm run test:differe          # cycle de vie différé, rappels, clôture assistée
npm run test:parametres       # ambiance, préférences, consentements, données
npm run test:activite         # « Mon activité » : compteurs, filtres, graphique
npm run test:journal          # journal du couple : souvenirs, notes, photos
npm run test:calendar         # calendrier des moments à deux
npm run test:favoris          # favoris et collections nommées
npm run test:onboarding       # premier réglage (profondeur, durée, mode, thèmes)
npm run test:presence         # présence du partenaire (battement, états honnêtes)
npm run test:defi             # défi du jour : anti-répétition, déterminisme
npm run test:partage          # carte souvenir partageable (bilan)
npm run test:offline          # service worker (nécessite un build + next start)
```

`npm run test:e2e` pilote deux navigateurs isolés (deux « appareils ») : création
de partie, partage du lien, arrivée du partenaire en temps réel, masquage puis
révélation simultanée, bilan de ressemblance, reprise après rechargement et
refus d'un troisième joueur.

`npm run test:engagement` vérifie l'engagement (Phase 3) : participation au défi
du jour et série de jours, ajout d'un favori, reprise d'une partie depuis
l'accueil, puis, après l'arrivée du partenaire, création du couple, statistiques
partagées, défi du jour commun et réponse du partenaire visible ; il vérifie
aussi la **présence réellement constatée** (« Awa est là » puis « vu il y a
12 min » après absence) et la **série à deux** qui s'affiche dès que les deux
ont participé.

`npm run test:parcours` vérifie les parcours guidés (Phase 4) : catalogue, défi
du jour de suivi, démarrage d'un parcours, validation d'une mission, lancement
d'une partie depuis une étape et validation automatique de l'étape des deux
côtés, récapitulatif final, et suivi dans « Notre espace » pour les deux
appareils.

`npm run test:personnalisation` vérifie la personnalisation (Phase 5) : le filtre
d'ambiance sur les univers, le volume de questions recalculé en direct par la
profondeur et les thèmes écartés, la partie qui ne contient que les questions
retenues, le passage d'une question sans justification, la restitution des
préférences sur l'appareil, et les cas limites (trop peu de questions, aucune
question correspondante).

`npm run test:polish` vérifie le polish (Phase 8) : cible de saut clavier,
un seul `h1` par écran, focus toujours visible, contraste du texte secondaire,
progression et annonces exposées aux lecteurs d'écran, animation de question
active par défaut puis **neutralisée** quand le système demande moins de
mouvement, bandeau hors ligne, invitation à installer proposée **après** une
partie seulement et plus jamais après un refus, aucune police téléchargée, et
les écrans 404 / hors ligne.

`npm run test:dashboard` vérifie la navigation (Phase 8 bis) : sidebar desktop,
barre inférieure mobile, entrées principales et personnelles, état actif suivi,
absence de débordement horizontal, et ouverture des pages dédiées.

`npm run test:compte` vérifie le compte léger (Phase 6) : bannière de
confidentialité, création du compte, code de récupération au bon format,
persistance après rechargement, refus d'un code invalide, et reconnexion d'un
**second appareil** qui retrouve la même identité.

`npm run test:differe` vérifie le cycle de vie différé (§13) : relance douce
après 2 jours (rappel visible dans « Notre espace »), expiration matérialisée,
puis relance et clôture assistée depuis `/mes-parties`. Le balayage temporel est
déclenché par `sessions.lifecycleSweep` avec une **horloge injectée** : aucun
attente réelle de plusieurs jours.

`npm run test:activite` vérifie « Mon activité » (§5) : sur un appareil neuf,
les quatre compteurs partent de zéro et l'état vide invite à commencer ; après
une partie **réellement terminée**, les compteurs passent à 1 (dont un moment
partagé et une expérience découverte), le graphique des sept jours n'allume
qu'une journée, et la régularité compte un jour actif. Il confirme aussi qu'une
partie en attente ou abandonnée **n'est jamais comptée**, qu'une reprise ne
double pas, que le filtre de période recalcule, et qu'aucun débordement
horizontal n'apparaît sur mobile.

`npm run test:journal` vérifie le journal du couple (§4) : l'état vide explique
comment le journal se remplit ; une **note libre** est écrite, corrigée puis
retirée ; une note peut porter une **photo** téléversée par le stockage Convex ;
un **favori** peut devenir un souvenir d'un tap ; une partie terminée à deux
dépose un **moment automatique** — une seule fois, même après retour sur la page —
que le **partenaire relié** voit aussi (sans pouvoir modifier une note qui n'est
pas la sienne). Aucun débordement horizontal sur mobile.

`npm run test:calendar` vérifie le calendrier des moments à deux (§4) : état
vide, planification d'un **rendez-vous** (date + heure, genre, mot), affichage
du **prochain moment** avec son étiquette relative (« Aujourd'hui », « Dans
3 jours ») et son horaire, marquage « fait » qui le fait basculer dans les
moments passés, retrait sous confirmation, et **partage** : le partenaire relié
voit le moment et peut à son tour en ajouter un. Aucun débordement horizontal
sur mobile.

`npm run test:favoris` vérifie les favoris et collections (§4) : état vide,
création d'une **collection nommée**, classement d'un favori dedans et filtrage
par collection, **renommage**, **réordonnancement** des favoris, **suppression**
de la collection (les favoris redeviennent non classés) et cloisonnement par
appareil. Aucun débordement horizontal sur mobile.

`npm run test:onboarding` vérifie le **premier réglage** (§4, §3.F) : la carte
n'apparaît que sans préférences, des valeurs par défaut sont déjà posées,
l'enregistrement est repris par les Paramètres **et** par le formulaire de
partie, l'écartement est persistant et **n'enregistre aucune préférence**, et la
carte n'est jamais bloquante (on peut toujours aller jouer).

`npm run test:partage` vérifie la **carte souvenir** (§4, §19.1) : elle
n'apparaît qu'une fois la partie terminée, elle est **rendue localement**
(blob d'image, aucun envoi), téléchargeable en `duoplay-souvenir.png` non vide,
résumée à l'identique pour WhatsApp et la copie, et — vérifié explicitement —
**aucun énoncé ni aucune réponse n'en sortent**. Aucun débordement horizontal
sur mobile.

`npm run test:presence` vérifie que « X est là » n'est **jamais** un faux
signal (§3.B) : le battement de cœur est bien enregistré côté serveur, l'état
reste neutre (« À deux ») tant qu'aucun partenaire n'est relié — même en
vieillissant son propre battement —, et l'écriture de présence d'un tiers est
refusée sans clé serveur. Les états « est là » et « vu il y a 12 min » sont
vérifiés dans `npm run test:engagement`, là où un couple existe vraiment.

`npm run test:defi` vérifie le défi du jour « de couple » (§3.D, §11.6) : le
défi affiché est celui figé en base, **deux jours consécutifs ne peuvent pas
servir la même question** (les questions des 30 derniers jours sont écartées),
le tirage d'un jour est **déterministe**, et la série affichée reste celle de
l'appareil tant qu'aucun couple n'est relié.

`npm run test:offline` vérifie le service worker là où il vit vraiment : un
serveur de production. Le service worker ne s'enregistre pas en `next dev`.
```bash
npm run build
npx next start -p 3100
npm run test:offline           # BASE_URL=http://localhost:3100
```

Il confirme l'enregistrement et l'activation, le cache versionné contenant la
coquille et l'écran hors ligne, **l'absence de mise en cache des charges RSC**,
la page déjà visitée servie sans réseau, et l'écran hors ligne pour une page
jamais visitée.

Les tests navigateur nécessitent un Chromium Playwright (`npx playwright install
chromium`, ou `CHROME_PATH=/chemin/vers/chromium`).

## Administration

Back-office accessible sur `/admin`.

Variables d'environnement nécessaires (dans `.env.local`) :

| Variable | Rôle |
|---|---|
| `ADMIN_PASSWORD` | Mot de passe de connexion à `/admin` |
| `ADMIN_SESSION_SECRET` | Signature du cookie de session |
| `ADMIN_KEY` | Clé serveur des mutations Convex admin — doit aussi être définie côté Convex (`npx convex env set ADMIN_KEY ...`) |

Les mutations d'administration Convex sont protégées par `ADMIN_KEY`
(`convex/lib/admin.ts`). La clé ne quitte jamais le serveur : les Server Actions
Next.js l'injectent. **À remplacer par Convex Auth (rôles) plus tard** : le
passage à des comptes administrateurs nommés reste hors périmètre à ce stade.

Deux mutations d'exploitation réutilisent cette garde et acceptent une **horloge
injectable** : `sessions.lifecycleSweep({ adminKey, now })` (cycle de vie
différé) et `maintenance.purge({ adminKey })` (rétention). Elles servent aussi
de socle au test `test:differe`.

Le back-office comprend aussi le **CRUD des parcours** (`/admin/parcours`) :
parcours et étapes, avec l'expérience reliée à chaque étape.

Contenu réel seedé : `npx convex run content:seed "{\"adminKey\":\"<ADMIN_KEY>\"}"`
(53 expériences, 400 questions, 5 parcours et leurs 31 étapes).

Les trois univers les plus joués sont volontairement profonds : **10 jeux
« Éclats de rire »** (absurde, imitations, aveux, vrai-ou-faux), **10 jeux
« Cœur à cœur »** (rituels, attentions, accords implicites, mots jamais dits)
et **10 jeux « Flirt & Étincelles »** (étincelles du quotidien, messages,
rendez-vous secret, audace douce — jamais explicites).
Chaque jeu embarque ses propres questions, ses modes (ensemble, à distance,
différé, défi individuel) et sa profondeur : le filtre des préférences écarte
toujours ce que le couple ne veut pas.

## Design system

Direction « **Quiet Sensuality** » : une interface nocturne feutrée pensée pour
les écrans OLED. La toile est un noir obsidienne (`#040205`) qui se fond dans un
violet nuit abyssal (`#0B0710`) ; les contenus émergent comme une bougie dans
l'obscurité. Deux accents seulement, réservés aux déclencheurs d'émotion :
**Or Champagne brossé** (`#E2B887`) et **Rose Rubis incandescent**
(`#E11D48` / `#FB7185`). Aucun cliché, aucune mécanique de gamification criarde.

Les design tokens sont définis dans `app/globals.css` (Tailwind v4 `@theme`) :
échelles `ivory` (obsidienne et verre), `graphite` (surfaces profondes et texte
secondaire clair), `lavender` (or champagne), `coral` (rose rubis), `blush`,
`gold`, plus les dégradés `primary`, `tendresse`, `dawn`, `night` et les ombres
`soft`/`lift`/`glow`. `--muted-foreground` porte le gris-violet clair `#a79ab2`
(contraste AA garanti sur l'obsidienne).

Typographie : **Cormorant Garamond** (sérif éditorial sculptural, romain +
italique) pour les titres et les citations, **Inter** pour l'interface — les deux
auto-hébergées via `next/font` (`app/fonts.ts`), donc aucune requête vers Google
au chargement.

Matériaux et composants signature :

- **Verre liquide** (`.liquid-glass`, `.top-light`, `.grain`) : flou profond,
  blanc 3 %, liseré interne 1px blanc 8 %, reflet spéculaire au sommet.
- **Floating Island** (`components/app/app-island.tsx`) : la barre flottante
  (typogramme, navigation segmentée à 4 piliers — Rituels, Univers, Évolution,
  Notre espace —, présence du partenaire et CTA capsule).
- **Bento Grid « Les Mondes Complices »** (`components/app/universe-grid.tsx`) :
  grille asymétrique au ratio d'or, projecteur ambré qui suit le pointeur
  (`.spotlight`, variables `--mx`/`--my`).
- **Cadran d'Intimité** (`components/game/intimacy-crown.tsx`) : sélecteur
  cylindrique inertiel inspiré de la Digital Crown, décélération physique et
  aimantation sur chaque cran.
- **Révélation synchrone** (`.reveal-veil`, `.reveal-halo`) : un voile givré se
  lève dans une lueur champagne, sans confettis.
- **Aura de connexion** (`components/app/connection-aura.tsx`) : un orbe de
  lumière organique dont la respiration s'accélère avec la régularité du couple.
- **Suspension 3D** (`components/ui/tilt.tsx`) : la carte s'incline doucement
  sous le pointeur (quelques degrés) et oriente son projecteur via `--mx`/`--my`.

**Deux climats, une seule nuit.** L'ambiance se choisit d'un tap
(`components/app/ambiance-toggle.tsx`) : *Soirée aux chandelles* (défaut,
obsidienne froide) ou *Douceur Jour*, où les variables `:root[data-ambiance="douceur"]`
réchauffent le fond, les cartes et l'aura d'un ambre `#2a1e11` — sans jamais
devenir claire. L'ambiance est lue dans `localStorage` et posée **avant le
premier rendu** par un script inline dans `app/layout.tsx` (aucun flash).

Physique du mouvement : les ressorts « Apple » (stiffness 380, damping 30,
mass 0.8) sont reproduits **sans dépendance** dans
[`lib/motion/spring.ts`](lib/motion/spring.ts) — oscillateur amorti piloté par
`requestAnimationFrame`, easing CSS `linear(...)` et hooks `lib/motion/hooks.ts`.
Aucun mouvement linéaire ni rebond cartoon.

Le vocabulaire de surfaces (`.glass`, `.grain`, `.aura`, `.eyebrow`,
`.hairline`, `.press`, `.skel`) et les animations (`.rise`, `.pop`,
`.float-*`, `.breathe`, `.sheen`, `.reveal-*`) restent dans `globals.css`,
désactivées lorsque le système demande moins de mouvement
(`prefers-reduced-motion`) ou moins de transparence
(`prefers-reduced-transparency`).

## Déploiement Netlify

- Build command : `next build` · Publish : `.next`
- Variables d'environnement : `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_SITE_URL`,
  et `CONVEX_DEPLOY_KEY` pour le déploiement Convex en CI.
- Convex se déploie séparément : `npx convex deploy`.
- Le temps réel passe directement du navigateur à Convex (pas par Netlify).
- Configuration : [`netlify.toml`](netlify.toml).

## Statut

Phase 0 — fondations terminées et **vérifiées de bout en bout** (backend Convex
local, 6 univers seedés, routes servies, build/lint/types OK).

Phase 1 — **terminée** : back-office protégé (catégories, expériences,
questions, modération), statistiques, et **contenu réel** (53 expériences,
370 questions).

Phase 2 — **terminée** : boucle de jeu complète — création de partie, lien privé
partageable, arrivée du partenaire sans compte, réponses masquées, révélation
simultanée en temps réel, bilan de ressemblance, reprise d'une partie
interrompue, et les 4 modes (Ensemble, À distance, Différé, Défi individuel).

Phase 3 — **terminée** : engagement — **défi du jour** (un contenu par jour tiré
de façon déterministe, publié par un cron quotidien, avec participation,
passation, série de jours et comparaison à deux), **favoris**, **historique**
des parties avec reprise, et **« Notre espace »** : le couple se crée
implicitement à la première partie commune et rassemble statistiques, défi du
jour, favoris et historique. L'identité reste sans compte : un `deviceToken`
secret par appareil porte historique, favoris, couple et série (le compte léger
le reliera en Phase 6).

Phase 4 — **terminée** : **parcours guidés** — 5 programmes (3, 7 et 21 jours,
31 étapes) au catalogue, étape du jour mise en avant sur l'accueil, validation
d'une mission ou d'une partie comme étape, progression commune au couple,
récapitulatif final, suivi dans « Notre espace » et CRUD admin. Vérifié de bout
en bout par `tests/parcours.cjs`.

Phase 5 — **terminée** : **personnalisation** — ambiances à l'exploration,
mode, durée (5 à 30 min), profondeur comprise comme un plafond, thèmes à éviter
issus du contenu réel, aperçu en direct du nombre de questions, préférences
retenues sur l'appareil, et passage d'une question **sans justification** (règle
produit fondamentale). Vérifié de bout en bout par `tests/personnalisation.cjs`.

Phase 8 — **terminée côté local** : **polish** — cible de saut clavier,
`id="contenu"` sur chaque `<main>`, focus visible, contraste AA du texte
secondaire, progression et annonces vocales, animations discrètes respectant
`prefers-reduced-motion`, préconnexion au domaine Convex, service worker
offline-first **sans jamais mettre en cache les charges RSC**, bandeau hors
ligne, écran `/hors-ligne`, invitation à installer **après une première partie**
(et refusable définitivement), écrans 404 et erreur. Vérifié par
`tests/polish.cjs` et `tests/offline.cjs`. Le déploiement réel (Netlify + Convex
  Cloud) reste à faire, faute de compte Convex.

Phase 8 (bis) — **terminée** : **nouvelles expériences** — défi du jour 3D avec
réponse scellée et célébration à deux, **roue du hasard complice** (`/roue`,
16 gages seedés dans Convex), **univers enrichis** (durée, intensité, lancement
direct) et **ambiances** Chandelles / Douceur Jour. Typographies désormais
**réellement auto-hébergées** (`next/font/local`, fichiers `.woff2` versionnés
dans `app/fonts/`) — `next/font/google` retombait silencieusement sur une police
de secours quand le build n'avait pas de réseau. Vérifié par `tests/nouveautes.cjs`.

Phase 8 (ter) — **terminée** : **tableau de bord et navigation** — sidebar
verticale sur desktop, rail d'icônes sur tablette, *Floating Island* + barre
inférieure sur mobile ; en-tête contextuel (titre, présence, ambiance) ; pages
dédiées **Mes parties** (`/mes-parties`, reprise + invitation partageable) et
**Mes favoris** (`/mes-favoris`) sur de vraies données Convex ; **Mon profil**
ouvre `/compte` (compte léger). Pied de page discret. Vérifié par
`tests/dashboard.cjs`.

Phase 6 — **terminée** : **compte léger** — création sans mot de passe ni
vérification, **code de récupération** affiché une fois puis consultable,
reconnexion d'un second appareil (fusion de l'historique, des favoris, du couple
et des parcours existants), **renommage du partenaire**, **dissolution de
l'espace couple** et dissociation d'appareil. L'identité active est résolue côté
client (`getActiveDeviceToken`) : le compte ne remplace pas l'appareil, il choisit
lequel utiliser — aucune migration serveur. Vérifié par `tests/compte.cjs`.

Phase 7 — **terminée côté local** : **mesure, conformité, sécurité** —
**bannière de consentement** (analytics/rappels) honorée **côté serveur**,
journal d'événements complété (atterrissage, partage d'invitation, ouverture
d'invitation, entrée en partie, reprise, création de compte) et entonnoir
exposé dans le back-office, **limitation de débit** par appareil (création,
jointures, échecs de jointure), **rétention** (purge hebdomadaire des parties
expirées depuis 30 jours). Le branchement d'un fournisseur e-mail/SMS reste à
faire : le contact du compte est aujourd'hui **déclaratif** (non vérifié).

Phase 7 (bis) — **terminée** : **cycle de vie différé (§13)** et **rappels
(§14)** — transitions de statut matérialisées (`expiree`, `abandonnee`),
**relances douces J+1 / J+3** au plus, **clôture assistée** et **relance** depuis
`/mes-parties`, table **`notifications`** avec cloche d'en-tête, lecture et
écartement. `sessions.lifecycleSweep` (horloge injectable) et
`maintenance.purge` restent disponibles comme outils d'exploitation. Vérifié par
`tests/differe.cjs`.

Phase 8 (quater) — **terminée** : **page Paramètres** (`/parametres`) — ambiance
d'affichage, préférences de jeu retenues (profondeur, thèmes à éviter, durée,
mode) avec retour à l'« Auto », consentements, installation/hors ligne et
purge des données locales sous confirmation. La logique d'ambiance est
factorisée dans `lib/ambiance.ts` (une seule source pour l'en-tête et la page) ;
`experiences.themes` agrège les thèmes de tout le contenu publié ;
`preferences.clear` permet le retour aux valeurs par défaut. Aucune entrée de
navigation n'est plus annoncée « Bientôt ». Vérifié par `tests/parametres.cjs`.

Phase 8 (quinquies) — **terminée** : **« Mon activité »** sur l'accueil —
quatre compteurs (parties jouées, moments partagés, expériences découvertes,
défis accomplis), filtre de période, graphique des sept derniers jours,
régularité et activité récente, tous dérivés de l'appareil par
`convex/activity.ts` (jamais de données du partenaire, jamais de partie
abandonnée comptée, jamais de double comptage). Corrige au passage un
débordement horizontal sur l'accueil mobile (`grid-cols-1` sur la grille à deux
colonnes : un titre long ne peut plus élargir la piste). Vérifié par
`tests/activite.cjs`.

Phase 8 (sexies) — **terminée** : **Journal du couple** (§4) — section de
`/notre-espace` partagée avec l'appareil partenaire : moments créés
automatiquement à la fin d'une partie ou d'un parcours (idempotents par
`by_session` / `by_journey`, jamais recréés après retrait), notes libres et
**photos** dès maintenant via le stockage Convex (`journal.generateUploadUrl`,
type `image/*` et poids ≤ 6 Mo revérifiés côté serveur), suggestions depuis les
favoris, édition réservée à l'auteur d'une note et aux deux pour un moment
commun. Aucune réponse de jeu n'y est recopiée. Vérifié par `tests/journal.cjs`.

Phase 8 (septies) — **terminée** : **Calendrier des moments à deux** (§4) —
section de `/notre-espace` : proposer un rendez-vous, une anniversaire, une
activité ou une surprise (date, heure facultative, mot), prochain moment mis en
avant avec étiquette relative et horaire local, marquage « fait », retrait
confirmé. Table **`events`** (`by_device_startAt`), logique dans
`convex/events.ts`, jour de référence Africa/Lagos. Partagé avec l'appareil
partenaire relié. Vérifié par `tests/calendar.cjs`.

Phase 8 (octies) — **terminée** : **Favoris et collections** (§4) — collection
nommée (créer, renommer, réordonner, supprimer), classement d'un favori et
filtrage par collection avec compteurs, réordonnancement des favoris. Table
**`collections`** (`by_device_position`), champs `collectionId`/`position` sur
`favorites`, logique dans `convex/collections.ts` et `convex/favorites.ts`.
Propre à l'appareil. Vérifié par `tests/favoris.cjs`.

Phase 8 (nonies) — **terminée** : **Premier réglage** (§4) — onboarding **non
bloquant** : une carte discrète sur l'accueil et l'explorateur, au premier
passage et seulement si l'appareil n'a aucune préférence, propose de déduire
profondeur, durée, mode et thèmes à éviter ; l'enregistrement alimente
`preferences` (repris par le formulaire et les Paramètres), l'écartement est
local (`duoplay:onboarding-dismissed`) et n'enregistre rien. Respecte la règle
produit « ne jamais imposer une activité ». Vérifié par `tests/onboarding.cjs`.

Phase 8 (decies) — **terminée** : **Carte souvenir partageable** (§4, §19.1)
Phase 9 — **terminée** : **« Entre nous »** - univers pour couples adultes consentants,
  10 expériences (200 questions totales) avec 20+ questions par jeu,
  niveaux d'intensité variés (reconnexion, tendre, sensuel, audacieux)
  et modes de jeu flexibles (ensemble, distance, asynchrone).

— au bilan, une carte est **dessinée sur le canvas de l'appareil** (prénoms,
taux de ressemblance, nombre de questions, titre de l'expérience, date), puis
proposée au partage natif (feuille du système avec l'image), au téléchargement
`duoplay-souvenir.png`, à WhatsApp ou à la copie du texte. Elle ne contient
**que des agrégats** : aucune réponse, aucun énoncé, aucun thème écarté ne
sortent de la partie (cf. §15). Composant `components/game/result-card.tsx`,
événement `result_card_shared`. Vérifié par `tests/partage.cjs`.

Reste à faire : déploiement réel (Netlify + Convex Cloud, hors périmètre pour
l'instant), fournisseur e-mail/SMS pour les relances hors application, CRUD
« Utilisateurs et sessions » et quotas freemium dans le back-office, et un
premier commit versionné (le dépôt n'en compte aucun à ce stade).

