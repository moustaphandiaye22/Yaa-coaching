# YAA COACHING

Application web de coaching : espace public, questionnaire de découverte, avis modérés et administration.

## Organisation du code

```text
frontend/src/
├── app/                 # Composition des pages et navigation
├── features/            # Administration, FAQ, galerie, accueil, questionnaire, avis, offres
├── shared/              # Styles et composants communs
└── main.tsx             # Entrée React

backend/src/
├── app.ts                # Composition Express et injection des adaptateurs
├── modules/              # auth, questionnaire, submissions, reviews, faqs, content, media, notifications, users, audit, services
│   ├── domain/           # Vocabulaire et contrats métier
│   ├── application/      # Cas d’usage
│   ├── infrastructure/   # Adaptateurs Prisma et sessions
│   └── presentation/     # Routes et schémas HTTP
├── shared/               # Prisma et utilitaires HTTP
└── server.ts             # Démarrage du serveur
```

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour les règles de dépendance et les conventions.

## Démarrage local

Installer Node.js 22 ou plus récent. Créer `backend/.env` à partir de `backend/.env.example` et y configurer les deux URL Neon : `DATABASE_URL` poolée (hôte avec `-pooler`) pour le serveur et `DIRECT_URL` (hôte sans `-pooler`) pour Prisma Migrate. Les deux URLs se trouvent dans Neon → Connect. Renseigner une adresse réelle `ADMIN_EMAIL` et un `ADMIN_PASSWORD` d’au moins 8 caractères pour créer l’administrateur, ainsi qu’une clé stable `DATA_ENCRYPTION_KEY`, à générer avec `openssl rand -hex 32`. Sauvegarder cette clé dans un gestionnaire de secrets : la perdre rend les données chiffrées illisibles. Configurer les variables Resend pour activer les e-mails. Pour une API hébergée ailleurs que sur `localhost:3000`, créer `frontend/.env` depuis `frontend/.env.example` et définir `VITE_API_URL` avec l’URL publique de l’API. `FRONTEND_ORIGIN` dans `backend/.env` doit correspondre exactement à l’origine du navigateur (protocole, hôte et port) pour autoriser les appels et cookies de session.

Depuis la racine :

```bash
npm install
npm run prisma:generate --workspace backend
npm run prisma:deploy --workspace backend
npm run prisma:seed --workspace backend
npm run dev
```

Lors d’une mise à niveau d’une base contenant déjà des demandes ou des avis, appliquer les migrations puis exécuter cette commande avant d’ouvrir l’API :

```bash
npm run data:encrypt-existing --workspace backend
```

Elle est idempotente et doit utiliser la même `DATA_ENCRYPTION_KEY` que le serveur.

Le site est disponible sur `http://localhost:5173`, l’API sur `http://localhost:3000` et l’administration sur `http://localhost:5173/admin` (lien « Connexion » dans le menu). Le seed crée ou réactive le compte `ADMIN` défini par `ADMIN_EMAIL` sans remplacer son mot de passe s’il existe déjà, puis initialise les FAQ, l’accueil, le catalogue des accompagnements et les questionnaires dans `ContentBlock`. Il peut être exécuté de nouveau sans écraser les contenus déjà administrés.

Les contenus publiés sont modifiables depuis **Administration → Contenus** (blocs `hero`, `services`, `questionnaires`, `methode`, `player`, `coach`, `zones`, `contacts` et `closing`; les blocs JSON s’éditent dans l’éditeur prévu). Le catalogue et les questions sont chargés depuis PostgreSQL; les demandes, avis, médias et FAQ sont également lus ou enregistrés via l’API et PostgreSQL. Les trois noms techniques de service restent des identifiants métier validés côté serveur.

### Docker Compose

Docker Compose lit le même `backend/.env` que le démarrage local. Après avoir renseigné les URL Neon, lancer `docker compose up`. `RESEND_API_KEY`, `EMAIL_FROM` et `NOTIFICATION_EMAIL` activent les e-mails et sont obligatoires en production. Les fichiers média restent dans le volume Docker `yaa-media`.

## API backend

Toutes les réponses d’administration nécessitent une session `ADMIN`.

| Module              | Routes                                                                                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Santé               | `GET /api/health`, `GET /api/ready`                                                                                                                                                                              |
| Authentification    | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`                                                                                                                                              |
| Site public         | `GET /api/public/site`, `GET /api/public/services`, `GET /api/public/questionnaire?service=YAA%20PLAYER`                                                                                                         |
| Demandes            | `POST /api/public/submissions`, `GET /api/admin/submissions`, `GET /api/admin/submissions/:id`, `GET /api/admin/submissions/:id/export`, `PATCH /api/admin/submissions/:id`, `DELETE /api/admin/submissions/:id` |
| Avis                | `GET /api/public/reviews`, `POST /api/public/reviews`, `GET /api/admin/reviews`, `PATCH /api/admin/reviews/:id`, `DELETE /api/admin/reviews/:id`                                                                 |
| FAQ                 | `GET /api/public/faqs`, CRUD sous `/api/admin/faqs`                                                                                                                                                              |
| Contenus            | `GET /api/admin/content`, `GET /api/admin/content/:key/preview`, `GET /api/admin/content/:key/revisions`, `PUT /api/admin/content/:key`, `DELETE /api/admin/content/:key/publication`                            |
| Médias              | `GET /api/public/media`, CRUD sous `/api/admin/media`                                                                                                                                                            |
| Audit               | `GET /api/admin/audit?before=<id>`                                                                                                                                                                               |
| Comptes             | `GET                                                                                                                                                                                                             | POST /api/admin/users`, `PATCH                                        | DELETE /api/admin/users/:id` |
| Notifications       | `GET /api/admin/notifications`, `POST /api/admin/notifications/retry`                                                                                                                                            |
| Téléversement média | `POST /api/admin/media/upload?kind=PHOTO                                                                                                                                                                         | VIDEO` avec le fichier brut dans le corps et son type MIME en en-tête |

Les coordonnées, réponses, notes internes et e-mails d’avis sont chiffrés par AES-256-GCM au repos. La recherche exacte par e-mail utilise un index HMAC ; les recherches partielles sont filtrées après déchiffrement dans le processus API. Les mots de passe sont hachés avec Argon2id. Les avis restent en attente jusqu’à modération ; leur e-mail est effacé après `REVIEW_EMAIL_RETENTION_DAYS` (90 jours par défaut). Les sessions expirent après huit heures ; seul le hash du cookie est stocké en base. Les opérations sont consignées dans le journal d’audit. Les brouillons restent privés ; les versions sont historisées et prévisualisables avant publication. Les routes `/api/submissions`, `/api/reviews`, `/api/faqs`, `/api/content`, `/api/media` et `/api/services` restent disponibles pour compatibilité avec l’interface existante.

Le téléversement accepte les photos JPEG/PNG/WebP (10 Mo maximum) et vidéos MP4/WebM (100 Mo maximum), vérifie leur signature et leur type MIME, puis les écrit sous un nom aléatoire dans `MEDIA_STORAGE_DIR`. En production, monter ce dossier sur un stockage persistant et sauvegardé. Les notifications sont placées dans une file PostgreSQL et envoyées par Resend avec reprises temporisées. La tâche de conservation efface les demandes après `SUBMISSION_RETENTION_DAYS` (365 jours par défaut), anonymise les e-mails d’avis selon leur délai et nettoie les notifications envoyées. Choisir ces durées selon la politique de confidentialité du service.

L’administration permet de créer, désactiver, modifier le rôle et réinitialiser le mot de passe des comptes. Il est impossible de supprimer ou désactiver le dernier administrateur actif. Les changements sensibles révoquent les sessions de l’utilisateur concerné.

## Images et vidéos

Trois illustrations WebP générées sont fournies dans `frontend/public/images/` pour YAA COACHING, YAA PLAYER et YAA AUTONOMIE. Le seeder inscrit leurs références dans la table `Media` sans remplacer les médias déjà présents ; leur publication se gère ensuite dans l’administration. Les légendes indiquent qu’il s’agit d’illustrations et non de véritables séances. Les nouveaux téléversements restent stockés dans `MEDIA_STORAGE_DIR`. Aucune vidéo de départ n’est fournie.

## Mise en production

Utiliser une base PostgreSQL dédiée et sauvegardée, HTTPS, une origine frontend/API correctement configurée et des secrets de déploiement hors dépôt. Exécuter les migrations avec `prisma migrate deploy`. En production, l’API refuse de démarrer si la clé de chiffrement, le fournisseur e-mail ou les durées de conservation sont absents ou invalides.

L’administrateur initial est créé par le seed à partir de `ADMIN_EMAIL` et `ADMIN_PASSWORD`. Avant une collecte réelle, publier la politique de confidentialité correspondant aux durées de conservation configurées.

# Yaa-coaching

# Yaa-coaching
