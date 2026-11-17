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

Polices des cartes : Cinzel et Cormorant Garamond (licence SIL OFL 1.1).

## Activer le paiement partagé (Stripe Payment Links)

Le site est prêt : il calcule la part de chacun et prépare le message pour le groupe. Il ne manque que les liens de paiement.

1. Créer un compte Stripe au nom du restaurant (stripe.com), et le faire valider.
2. Dans Stripe, menu « Payment Links », créer trois liens pour le produit « Session Amuzetoi, 1 heure, 1 personne » : 12 €, 14 € et 16 €. Cocher « Permettre aux clients d'ajuster la quantité » (elle sert aux heures supplémentaires).
3. Coller les trois liens dans `assets/paiement.js` et publier.

Seuls les liens qui commencent par `https://buy.stripe.com/` sont acceptés. Tant qu'un lien est vide, le bouton « Payer ma part » reste grisé et le site annonce que le lien arrive avec la confirmation.

Les planches, verres et menus ne passent pas par ces liens : ils se règlent sur place. L'annulation (gratuite jusqu'à 72 h avant) se rembourse depuis le tableau de bord Stripe.
