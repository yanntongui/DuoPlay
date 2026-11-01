# Console d'Administration DuoPlay

## Architecture

### Structure

```
app/(admin)/
├── layout.tsx          # Layout principal avec sidebar
├── page.tsx            # Dashboard avec KPIs
├── login/
│   └── page.tsx        # Page de connexion
├── users/
│   └── page.tsx        # Gestion utilisateurs
├── couples/
│   └── page.tsx        # Gestion couples
├── experiences/
│   └── page.tsx        # Gestion contenus
├── revenue/
│   └── page.tsx        # Statistiques financières
├── audit/
│   └── page.tsx        # Journal d'audit
├── analytics/
│   └── page.tsx        # Analytics produit
├── settings/
│   └── page.tsx        # Paramètres
├── support/
│   └── page.tsx        # Support tickets
└── moderation/
    └── page.tsx        # Modération
```

## Backend Convex

### Fonctions implémentées (`convex/admin.ts`)

#### Utilisateurs
- `listUsers` : Liste paginée des utilisateurs
- `getUserById` : Récupération détaillée
- `suspendUser` : Suspension avec raison obligatoire
- `activateUser` : Réactivation de compte

#### Contenu
- `listExperiences` : Liste paginée des expériences
- `publishExperience` : Publication avec audit
- `archiveExperience` : Archivage avec audit

#### Audit
- `getAuditLogs` : Historique immuable des actions admin
- `getStats` : Métriques pour le dashboard

### Schéma

```typescript
// Table auditLogs
auditLogs: defineTable({
  action: v.string(),
  target: v.optional(v.any()),
  adminId: v.optional(v.string()),
  reason: v.optional(v.string()),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
})
  .index("by_action", ["action"])
  .index("by_admin", ["adminId"])
  .index("by_createdAt", ["createdAt"]),

// Champ status ajouté à profiles
profiles: defineTable({
  status: v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted")),
  // ...
})
```

## Fonctionnalités

### 1. Authentification
- Email + mot de passe (credentials de démo : `admin@duoplay.com` / `password123`)
- 2FA (à implémenter avec Convex Auth)
- Journalisation des connexions
- Sessions sécurisées

### 2. Dashboard
- KPIs en temps réel (utilisateurs, couples, sessions)
- Revenus (jour, mois, année)
- Support & Modération (tickets, signalements)
- Activité récente depuis l'audit

### 3. Gestion Utilisateurs
- Recherche (nom, ID)
- Filtres (statut, abonnement)
- Suspension avec confirmation et raison obligatoire
- Réactivation
- Journalisation dans auditLogs

### 4. Gestion Couples
- Vue des relations utilisateurs
- Statuts (actif, pending, dissous)
- Recherche et filtrage
- Confidentialité maintenue (pas de données sensibles)

### 5. Gestion Contenus (CMS)
- Liste paginée des expériences
- Statuts (brouillon, publié, archivé)
- Workflow de publication avec double validation
- Archivage avec audit

### 6. Statistiques Financières
- Revenus bruts et nets
- Abonnements actifs
- Répartition par type
- Remboursements (double validation > €50)

### 7. Support Tickets
- Gestion des tickets
- Catégories (compte, paiement, invitation...)
- Priorités (low, medium, high)
- Statuts (open, in_progress, resolved)
- Satisfaction rate

### 8. Modération
- File d'attente de signalements
- Gravité (low, medium, high)
- Types (content, user)
- Double validation pour cas graves

### 9. Analytics
- Entonnoir d'activation
- Rétention (jour 1, 7, 30)
- Fonctionnalités les plus utilisées
- Données anonymisées et agrégées

### 10. Paramètres
- Configuration plateforme
- Langues supportées
- Fuseaux horaires
- Pays disponibles
- Mode maintenance

## Sécurité

### Système RBAC avec Convex Auth

La console utilise Convex Auth pour l'authentification et les autorisations.

**Table `adminAccess`**

```typescript
adminAccess: defineTable({
  userId: v.id("users"),
  role: v.union(
    v.literal("super_admin"),
    v.literal("admin_produit"),
    v.literal("admin_support"),
    v.literal("admin_finance"),
    v.literal("admin_moderateur"),
    v.literal("admin_analyste"),
  ),
  permissions: v.array(v.string()),
  canViewSensitive: v.boolean(),
  twoFactorEnabled: v.boolean(),
  lastLoginAt: v.optional(v.number()),
  createdAt: v.number(),
})
```

**Permissions par Rôle**

| Rôle | Permissions |
|------|-------------|
| `super_admin` | `"*"` (tout) |
| `admin_produit` | `content.*`, `experience.*` |
| `admin_support` | `user.read`, `user.activate`, `ticket.*` |
| `admin_finance` | `revenue.*`, `subscription.*` |
| `admin_moderateur` | `moderation.*`, `report.*` |
| `admin_analyste` | `dashboard.read`, `analytics.*`, `audit.read` |

**Fonctions d'Authentification**

- `login` : Authentification email/mot de passe
- `adminMe` : Profil admin actuel
- `verifyAdmin` : Vérification avec permissions requises

### Protection des données sensibles

- Les réponses intimes sont chiffrées
- Aucune exposition par défaut
- Accès uniquement avec consentement légal
- Journalisation de tous les accès

### Audit

- Historique immuable de toutes les actions
- Actions critiques alertées
- Justification obligatoire pour les actions sensibles
- Conformité légale

## Technologies

- Next.js 15
- Tailwind CSS
- TypeScript
- React Server Components
- Convex (backend temps réel)

## Accès

URL: `/admin`

### Compte démo

- Email: `admin@duoplay.com`
- Mot de passe: `password123`

## Variables d'environnement

```env
NEXT_PUBLIC_CONVEX_URL=https://adventurous-salmon-154.convex.cloud
```

## Modules à implémenter

- [ ] **Finance** : paiements, remboursements, factures, exports comptables
- [ ] **Offres** : gestion des plans et promotions
- [ ] **Feature flags** : déploiement progressif
- [ ] **A/B Tests** : expérimentation
- [ ] **Internationalisation** : traductions
- [ ] **Notifications** : campagnes push/email
- [ ] **Conformité RGPD** : demandes d'accès/suppression
- [ ] **Monitoring** : santé de la plateforme
- [ ] **Incidents** : gestion des incidents
- [ ] **Rôles et permissions** : RBAC complet
- [ ] **2FA** : authentification à deux facteurs

## Next Steps

1. Activer Convex Auth pour l'authentification admin
2. Implémenter RBAC complet avec rôles
3. Ajouter 2FA pour tous les admins
4. Connecter aux APIs de paiement réelles
5. Implémenter exports CSV/Excel
6. Ajouter webhooks pour notifications
7. Configurer backups et DR
