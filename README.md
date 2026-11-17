# NAPO – site et cartes

Site du restaurant corse NAPO (4-6 rue Pierre Demours, 75017 Paris) et ses cartes en PDF.

- `index.html` : le site (Tailwind via CDN, JavaScript sans dépendance).
- `mentions-legales.html` : mentions légales.
- `menus/carte.json` : **la seule source des cartes**. Plats, descriptions, prix, menus dégustation, textes du chevalet.
- `menus/build.js` : génère les PDF dans `assets/cartes/` et `assets/carte.js` (lu par le site).
- `menus/src/` : gabarit des PDF (fond, polices, styles, QR code).

## Modifier un plat ou un prix

1. Modifier `menus/carte.json`.
2. Lancer `node menus/build.js` (il faut Node et Playwright avec Chromium).
3. Publier : le site et les PDF sont à jour ensemble.

Le QR code des chevalets de carte pointe vers `https://lenapo.fr/menu/`. Celui du chevalet d'avis (`napo-chevalet-avis.pdf`, à poser dans les salles) pointe vers la fiche Google du restaurant.

Sur `index.html`, les offres marquées « À valider » sont des propositions : retirer le badge une fois l'offre confirmée par le restaurant, ou supprimer la carte.

Polices des cartes : Cinzel et Cormorant Garamond (licence SIL OFL 1.1).
