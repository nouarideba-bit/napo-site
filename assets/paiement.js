// Paiement partagé par Stripe Payment Links.
//
// POUR ACTIVER : coller ci-dessous les trois liens créés dans Stripe (ils commencent par
// https://buy.stripe.com/), enregistrer, publier. Rien d'autre à modifier : le bouton
// « Payer ma part » apparaît et le lien s'ajoute au message envoyé au groupe.
// Tant qu'un lien est vide, le site indique que le paiement arrive avec la confirmation.
//
// Dans Stripe, créer un lien par tarif, pour le produit « Session Amuzetoi, 1 heure, 1 personne »,
// avec l'option « Permettre aux clients d'ajuster la quantité » : la quantité sert aux heures
// supplémentaires. Voir le README, section « Activer le paiement partagé ».
window.NAPO_PAIEMENT = {
  semaine: '', // 12 € : du lundi au vendredi
  weekend: '', // 14 € : le samedi avant 19 h
  pointe: '',  // 16 € : le vendredi et le samedi à partir de 19 h
  bonCadeau: '', // bon cadeau : lien Stripe où le client saisit lui-même le montant
};
