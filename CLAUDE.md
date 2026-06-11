# Folia — règles du projet

Folia est une web-app française de gestion de patrimoine (suivi DCA sur PEA + Cashflow),
en **HTML/CSS/JS vanilla, sans build**, déployée via GitHub → Cloudflare Workers.

## Langue & ton
- Répondre **en français**, **sans jargon technique** : l'auteur est débutant en dev web.
- Ton bienveillant. Rien n'est un « conseil financier personnalisé » : les contenus chiffrés
  sont **informatifs**. Garder ce cadrage dans l'app (mentions « pas un conseil financier »).

## Fichiers
- `public/index.html` — structure HTML (favicon SVG inline « F. », footer = numéro de version).
- `public/style.css` — tout le CSS (palette dans `:root`, police Syne + IBM Plex Mono).
- `public/app.js` — TOUT le JS, dans **un seul `document.addEventListener('DOMContentLoaded', …)`**.
- `src/index.js` — Worker Cloudflare (sert le site + API `/api/price` Yahoo + `/api/sync` via KV).
- `wrangler.toml` — config Cloudflare.

## Conventions permanentes (à respecter)
- **Un seul closure `DOMContentLoaded`** dans `app.js` : ne pas re-compartimenter le fichier.
- Clé `localStorage` = **`folia_v3`** : ne JAMAIS la changer (sinon perte des données utilisateurs).
- Préférer des **implémentations maison** plutôt que d'ajouter des librairies.
- **Pas** de « conseil de déploiement » en fin de réponse : l'auteur déploie en faisant `git push`
  (Cloudflare redéploie tout seul). Inutile de régénérer un aperçu : ouvrir `public/index.html`.

## Versionnage (footer + changelog)
- Schéma **MAJEUR.MINEUR.CORRECTIF**.
  - Nouvelle fonctionnalité → bump **mineur**. Fix/ajustement → bump **correctif**.
  - Tant qu'une version **n'est pas déployée**, continuer à éditer sous le **même numéro**.
  - **Demander l'accord** avant un cap de version **MAJEURE**.
- À **chaque** modification, remplir soi-même le tableau `CHANGELOG` dans `app.js` :
  - entrée la plus récente **en haut**, **date avec le jour** (ex. « 9 juin 2026 »),
  - mettre en **`<strong>`** les infos importantes (mais gras léger, pas trop épais),
  - l'utilisateur ne tape jamais le changelog lui-même.
- Mettre à jour le numéro dans le `<footer>` de `index.html`.

## Vérifications à faire après CHAQUE changement de code
1. `node --check public/app.js` (syntaxe JS).  *(Node est optionnel ; sinon, relire soigneusement.)*
2. Vérifier que chaque handler inline du HTML (`onclick`, `oninput`, `onchange`…) correspond bien
   à une fonction définie / exposée en `window.X` dans `app.js`.
3. Vérifier l'équilibre des balises HTML (notamment les `<div>` d'une section modifiée).

## Domaines fonctionnels (rappel)
- **DCA** : grille d'ETF (avec sous-émetteurs/groupes), allocation cible, projection, import CSV.
- **Cashflow** : revenus / investissements / dépenses, diagramme de flux (Sankey maison),
  **mode couple** (partage par ligne : 👫 pro-rata des salaires ou % défini),
  onglets en haut : **Cashflow / Sécurité / Suggestions** (`cfNav('main'|'safety'|'suggest')`).
- **Sécurité** : matelas de précaution (montant + curseur de mois × dépenses).
- Annulation **Ctrl+Z / Ctrl+Y** globale (snapshots d'état) dans toutes les sections.

## Hors-scope / interdits
- Pas de scraping bancaire (illégal, DSP2). L'open banking passerait par un agrégateur agréé — projet « v2 ».
- Ne pas exposer de secrets/clés dans le code front.
