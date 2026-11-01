# Console d'Administration DuoPlay

## Architecture

### Structure

```
app/(admin)/
├── layout.tsx          # Layout principal avec sidebar
├── page.tsx            # Dashboard
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
└── settings/
    └── page.tsx        # Paramètres
```

## Fonctionnalités

### 1. Authentification
- Email + mot de passe
- 2FA (à implémenter)
- Journalisation des connexions
- Sessions sécurisées

### 2. Dashboard
- KPIs en temps réel
- Revenus
- Activité récente
- Alerts critiques

### 3. Gestion Utilisateurs
- Recherche (email, nom, ID)
- Filtres (statut, abonnement, pays)
- Suspension/réactivation
- Export des données
- Conformité RGPD

### 4. Gestion Couples
- Vue des relations
- Statuts (pending, active, dissolved)
- Résolution de problèmes
- Confidentialité maintenue

### 5. Gestion Contenus
- CMS interne
- Workflow de publication
- Modération
- Traductions

### 6. Statistiques Financières
- Abonnements
- Revenus
- Remboursements
- Conformité fiscale

### 7. Journal d'Audit
- Historique immuable
- Actions critiques alertées
- Conformité légale

### 8. Analytics
- Entonnoirs d'activation
- Rétention
- Fonctionnalités les plus utilisées

### 9. Paramètres
- Configuration
- Maintenance
- Langues/Pays

## Sécurité

### Permissions

| Rôle | Permissions |
|------|-------------|
| Super Admin | Tout accès |
| Admin Produit | Contenu, expériences |
| Support | Utilisateurs, tickets |
| Finance | Abonnements, paiements |
| Analyste | Analytics uniquement |

### Protection des données sensibles

- Les réponses intimes sont chiffrées
- Aucune exposition par défaut
- Accès uniquement avec consentement légal
- Journalisation de tous les accès

## Technologies

- Next.js 15
- Tailwind CSS
- TypeScript
- React Server Components

## Accès

URL: `/admin`

### Compte démo

- Email: `admin@duoplay.com`
- Mot de passe: `password123`

## Déploiement

1. Déployer via Netlify
2. Configurer les variables d'environnement
3. Restreindre l'IP si nécessaire
4. Activer 2FA pour tous les admins
