# Console d'administration DuoPlay

## 1. Architecture Fonctionnelle

### Modules Principaux

| Module | Description | Priorité |
|--------|-------------|----------|
| Authentification | Login, 2FA, sessions | P0 |
| Dashboard | Tableau de bord global | P0 |
| Utilisateurs | Gestion des comptes | P0 |
| Couples | Gestion des relations | P0 |
| Contenu | CMS expériences/jeux | P0 |
| Paiements | Transactions et abonnements | P0 |
| Support | Tickets clients | P1 |
| Modération | Signalements | P1 |
| Analytics | Statistiques agrégées | P1 |
| RGPD | Confidentialité | P1 |
| Audit | Journal d'actions | P1 |
| Paramètres | Configuration plateforme | P2 |
| Feature Flags | Déploiement progressif | P2 |
| Tests A/B | Expérimentation | P2 |
| Monitoring | Santé technique | P2 |

### Stack Technique

- **Frontend**: Next.js 15 + TailwindCSS + React Server Components
- **Backend**: Convex (fonctions serverless)
- **Auth**: Cookies HTTP-only + 2FA TOTP
- **Base de données**: PostgreSQL (Convex)
- **Sécurité**: RBAC, audit logging, encryption

## 2. Structure de Navigation

```
/admin (Dashboard)
├── /users (Utilisateurs)
│   ├── /users/[id] (Détail utilisateur)
├── /couples (Couples)
│   ├── /couples/[id] (Détail couple)
├── /experiences (Expériences)
│   ├── /experiences/create (Créer)
│   ├── /experiences/[id] (Éditer)
├── /cards (Cartes)
├── /dice (Dés)
├── /journeys (Parcours)
├── /finance (Finance)
│   ├── /finance/payments (Paiements)
│   ├── /finance/subscriptions (Abonnements)
│   ├── /finance/refunds (Remboursements)
│   ├── /finance/revenue (Revenus)
├── /support (Support)
│   ├── /support/tickets (Tickets)
├── /moderation (Modération)
├── /analytics (Analytics)
│   ├── /analytics/overview (Vue globale)
│   ├── /analytics/conversion (Conversion)
│   └── /analytics/retention (Rétention)
├── /segments (Segments)
├── /campaigns (Campagnes)
├── /ab-tests (Tests A/B)
├── /flags (Feature Flags)
├── /gdpr (RGPD)
├── /audit (Audit)
├── /security (Sécurité)
├── /monitoring (Monitoring)
├── /incidents (Incidents)
├── /settings (Paramètres)
│   ├── /settings/roles (Rôles)
│   ├── /settings/i18n (Internationalisation)
│   └── /settings/platform (Plateforme)
└── /reports (Rapports)
```

## 3. Matrice des Rôles et Permissions

### Rôles

| Rôle | Description |
|------|-------------|
| super_admin | Accès complet |
| product_admin | Gestion produits/contenus |
| support_lead | Gestion support |
| content_admin | Création/modification contenus |
| moderator | Modération |
| finance_admin | Gestion financière |
| analyst | Analytics uniquement |
| marketing_admin | Campagnes/notifications |
| tech_admin | Technique/monitoring |
| auditor | Lecture seule |

### Permissions

| Module | Consulter | Créer | Modifier | Publier | Supprimer | Exporter |
|--------|-----------|-------|----------|---------|-----------|----------|
| Users | ✓ (super, support, tech) | | | | ✓ (super) | ✓ (super, analyst) |
| Couples | ✓ (super, support) | | | | ✓ (super) | |
| Content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Finance | ✓ (super, finance) | | | | | ✓ |
| Support | ✓ | ✓ | ✓ | | | |
| Moderation | ✓ | ✓ | ✓ | ✓ | | |
| Analytics | ✓ (super, analyst, marketing) | | | | | |
| Flags | ✓ (super, product, tech) | ✓ | ✓ | ✓ | ✓ | |
| Audit | ✓ (super, auditor) | | | | | ✓ (super) |

### Actions critiques nécessitant double validation
- Suppression de compte utilisateur
- Remboursement > 100€
- Modification de permissions admin
- Export de données sensibles
- Désactivation feature critique

## 4. Modèle de Données

```typescript
// Admins
profile {
  id: string
  email: string (hashed)
  passwordHash: string
  role: string
  permissions: string[]
  totpSecret?: string
  is2faEnabled: boolean
  createdAt: Date
  lastLogin: Date
  status: 'active' | 'suspended' | 'deleted'
}

adminSessions {
  id: string
  adminId: string
  token: string (hashed)
  createdAt: Date
  expiresAt: Date
  userAgent: string
  ipAddress: string
}

adminAuditLogs {
  id: string
  adminId: string
  action: string
  module: string
  targetId?: string
  oldData?: any
  newData?: any
  reason?: string
  timestamp: Date
  ipAddress: string
  requiresApproval: boolean
  approvedBy?: string
}

// Users
users {
  id: string
  email: string (hashed)
  passwordHash: string
  createdAt: Date
  lastActive: Date
  subscriptionTier: 'free' | 'premium' | 'annual'
  country: string
  status: 'active' | 'suspended' | 'deleted'
}

couplings {
  id: string
  userId1: string
  userId2: string
  status: 'pending' | 'active' | 'archived'
  createdAt: Date
  subscriptionTier: string
}

// Content
experiences {
  id: string
  title: Record<string, string>
  description: Record<string, string>
  category: string
  intensity: 'light' | 'medium' | 'passionate'
  duration: number
  status: 'draft' | 'review' | 'approved' | 'scheduled' | 'published'
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// Transactions
transactions {
  id: string
  userId: string
  amount: number
  currency: string
  type: 'subscription' | 'purchase' | 'refund'
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
}

// Moderation
moderation {
  id: string
  reporterId: string
  reportedUserId: string
  type: string
  status: 'pending' | 'reviewed' | 'resolved'
  createdAt: Date
  resolvedAt?: Date
}
```

## 5. Plan de Sécurité

### Authentification
- Login avec email + mot de passe (bcrypt)
- 2FA TOTP obligatoire
- Sessions expirent après 24h
- Cookies HTTP-only + SameSite=strict
- Rate limiting: 5 tentatives / 15min

### Permissions
- Vérification côté serveur pour chaque action
- RBAC avec permissions granulaires
- Audit de toutes les actions
- Double validation pour actions critiques

### Confidentialité
- Données sensibles chiffrées
- Pas d'accès direct aux réponses intimes
- Anonymisation des données après 24 mois
- Conformité RGPD

### Monitoring
- Détection d'accès inhabituels
- Alertes sur actions sensibles
- Logs immuables

## 6. Tableau de bord

### KPIs Principaux

| Indicateur | Valeur | Période |
|------------|--------|---------|
| Utilisateurs actifs jour | 5,234 | vs hier |
| Utilisateurs actifs 7j | 28,456 | vs semaine précédente |
| Nouveaux couples | 423 | vs hier |
| Abonnements premium | 12,340 | vs hier |
| Revenus jour | 2,345 € | vs hier |
| Revenus mois | 45,678 € | vs mois précédent |
| Tickets support ouverts | 23 | vs hier |
| Signalements en attente | 12 | vs hier |
| Taux d'erreur | 0.02% | |
| Disponibilité | 99.99% | |

### Widgets disponibles
- Graphique d'inscription
- Graphique de rétention
- Top catégories d'expériences
- Répartition par pays
- Alertes critiques

## 7. Module Utilisateurs

### Fonctionnalités
- Recherche par email, ID, pseudo
- Filtres: statut, abonnement, pays, date
- Vue profil (données non sensibles)
- Actions: suspendre, réactiver, exporter, anonymiser
- Journal d'actions

### Interface
```
+------------------------------------------+
| Utilisateurs                         [+] |
+------------------------------------------+
| Recherche: [___________] Filtrer ∨ |
+------------------------------------------+
| ID | Email | Statut | Abonnement | Actions |
+------------------------------------------+
| u123 | user@... | ✓ Actif | Premium | ••• |
| u456 | other@... | ⚠ Suspens | Free | ••• |
+------------------------------------------+
```

## 8. Module Contenus

### Workflow de publication
1. Création (brouillon)
2. Révision
3. Approbation
4. Programmation
5. Publication

### Interface éditeur
```
+------------------------------------------+
| Éditeur d'expérience                 [+]|
+------------------------------------------+
| Titre: [___________________] |
| Catégorie: [Dropdown] |
| Intensité: ○ Light ○ Medium ● Passionant |
| Durée: [___] minutes |
| Description (FR): |
| [Text area] |
| Description (EN): |
| [Text area] |
| |
| Statut: [Brouillon] |
| [Enregistrer] [Soumettre à révision] |
+------------------------------------------+
```

## 9. Module Paiements

### Vue
- Liste de transactions
- Filtres: statut, type, période, pays
- Détails: montant, devises, taxes
- Actions: remboursement (double validation)

## 10. Module Analytics

### Métriques
- Activation funnel
- Rétention (D1, D7, D30)
- Temps moyen par session
- Top expériences utilisées

### Graphiques
- Courbe d'inscription
- Courbe de rétention
- Top catégories

## 11. Module Audit

### Logs
- Admin qui a fait quoi
- Quand, où, pourquoi
- Ancienne/nouvelle valeur
- Approbateur si nécessaire

```
+------------------------------------------+
| Journal d'audit                    🔍 |
+------------------------------------------+
| Période: [De] [À] Utilisateur: [___] |
+------------------------------------------+
| Date | Admin | Action | Module | Objet |
+------------------------------------------+
| 01/11 10:23 | john@... | Suspendre | Users | u123 |
| 01/11 09:45 | jane@... | Refund | Finance | tx456 |
+------------------------------------------+
```

---

## 12. Plan de Construction

### Phase 1: Foundations (P0)
- [ ] Auth + 2FA
- [ ] Layout + navigation
- [ ] Dashboard
- [ ] Users
- [ ] Couples
- [ ] Content (basic)

### Phase 2: Core Modules (P1)
- [ ] Payments
- [ ] Support
- [ ] Moderation
- [ ] Analytics
- [ ] Audit
- [ ] RBAC

### Phase 3: Advanced (P2)
- [ ] Feature flags
- [ ] A/B tests
- [ ] Campaigns
- [ ] Incidents
- [ ] Settings
- [ ] Exports


<function=write>