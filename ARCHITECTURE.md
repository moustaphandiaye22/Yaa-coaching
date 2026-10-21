# Architecture

## Règles de dépendance

Les dépendances pointent vers le cœur métier :

```text
Présentation (HTTP / React)
          ↓
Application (cas d’usage)
          ↓
Domaine (règles et contrats)
          ↑
Infrastructure (Prisma, sessions, services externes)
```

- `domain` contient le vocabulaire, les règles et les contrats sans dépendre d’Express, React ou Prisma.
- `application` orchestre les cas d’usage à partir des contrats du domaine.
- `presentation` traduit les entrées HTTP/UI, valide les formes reçues et appelle les cas d’usage.
- `infrastructure` fournit les adaptateurs concrets pour PostgreSQL, les sessions et les autres services.
- `app.ts` est le point de composition : il instancie les adaptateurs et les injecte dans les modules.

## Frontend

Chaque dossier de `frontend/src/features` représente une capacité visible du produit. Les composants communs, configuration, types et contenu statique vont dans `shared`. `app` relie les écrans et gère la navigation.

## Backend

Chaque dossier de `backend/src/modules` correspond à un domaine métier. Un module peut contenir seulement les couches utiles à sa taille ; ne créer une abstraction que lorsqu’elle sépare une règle métier d’un détail technique ou qu’elle élimine une duplication réelle.

Les comptes et autorisations résident dans `auth` et `users`. Les demandes et avis conservent leurs règles et dépôts dans leurs propres modules. `notifications` gère la file persistante et son adaptateur e-mail ; `media` gère l’envoi et le stockage des fichiers. La tâche de rétention appartient au module `submissions`, car elle applique les règles de durée de conservation des données collectées.

Le chiffrement et les index HMAC des données personnelles se trouvent dans `shared/security`. Les clés viennent de l’environnement et ne sont jamais enregistrées en base. Les migrations Prisma décrivent les changements de schéma ; le script `prisma/encrypt-existing-data.ts` convertit explicitement les anciennes lignes avant d’ouvrir une base existante à l’API.

## Conventions

- Un composant ou cas d’usage a une responsabilité lisible et un nom métier.
- Les validateurs d’entrée résident près de leur adaptateur de présentation ; les invariants métier résident dans le domaine.
- Les accès Prisma restent dans les adaptateurs d’infrastructure.
- Les erreurs sont converties au bord HTTP en réponses publiques normalisées. Les réponses sensibles ne sont pas journalisées.
- Éviter les dépendances circulaires entre modules ; partager un contrat étroit dans `shared` uniquement si plusieurs domaines en ont réellement besoin.
