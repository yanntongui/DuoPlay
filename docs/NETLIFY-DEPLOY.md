# Déploiement des identifiants admin sur Netlify

## 1. Configurer les variables d'environnement sur Netlify

### Via l'interface web Netlify :

1. Connectez-vous à [Netlify](https://app.netlify.com)
2. Sélectionnez votre site **duoplaygame**
3. Allez dans **Site settings** → **Environment variables**
4. Ajoutez les variables suivantes :

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_ADMIN_KEY` | `3c5d8188016287357c692c61b6a0367fdb5a7a4bf613c655` |
| `ADMIN_USERNAME` | `yannpatrick.tongui@gmail.com` |
| `ADMIN_PASSWORD` | `Pat123456789` |
| `ADMIN_SESSION_SECRET` | `5a232d40b8405c7f839ec0443a5d4fc4fa153ee5aa5903ed1330f4ea9269aabf` |
| `CONVEX_DEPLOYMENT` | `production:adventurous-salmon-154` |

### Ou via CLI Netlify :

```bash
npm install -g netlify-cli
netlify env:set NEXT_PUBLIC_ADMIN_KEY "3c5d8188016287357c692c61b6a0367fdb5a7a4bf613c655"
netlify env:set ADMIN_USERNAME "yannpatrick.tongui@gmail.com"
netlify env:set ADMIN_PASSWORD "Pat123456789"
```

## 2. Redéployer le site

Après avoir ajouté les variables :

1. **Option A** : Push vers main (auto-deploy)
   ```bash
   git commit -am "feat(admin): update admin credentials"
   git push origin main
   ```

2. **Option B** : Déployer manuellement
   - Allez sur [Netlify Deployments](https://app.netlify.com/sites/duoplaygame/deploys)
   - Cliquez sur **Trigger deploy** → **Deploy production**

## 3. Vérifier le déploiement

1. Une fois le déploiement terminé, accédez à :
   ```
   https://duoplaygame.netlify.app/admin
   ```

2. Connectez-vous avec :
   - **Email** : yannpatrick.tongui@gmail.com
   - **Mot de passe** : Pat123456789

## Notes importantes

- Les variables `ADMIN_*` sont utilisées pour l'authentification console admin
- `NEXT_PUBLIC_ADMIN_KEY` est nécessaire pour que les mutations Convex fonctionnent côté client
- Le fichier `.env.local` contient les mêmes valeurs pour le développement local
- **Ne commit pas** `.env.local` avec vos secrets réels en production (il est déjà dans .gitignore)

## Sécurité recommandée

1. **Changez ce mot de passe** après le premier déploiement
2. Utilisez des variables d'environnement sécurisées sur Netlify (pas dans le code)
3. Envisagez d'ajouter l'authentification à deux facteurs (2FA)
