/**
 * Configuration de l'entreprise
 * 
 * Ce fichier centralise toutes les informations de l'entreprise.
 * Pour un nouveau client, il suffit de modifier ces valeurs.
 */

export const ENTREPRISE = {
  // Informations générales
  nom: "Quincaillerie Ndayane Service",
  slogan: "Votre partenaire en matériaux de construction",
  
  // Coordonnées
  gerant: "Mor FALL",
  telephone: "77 781 89 08",
  telephone2: "77 766 85 36",
  email: "morfall491@gmail.com",
  adresse: "Rue Blaise Diagne X Armand Angrand",
  ville: "Dakar",
  pays: "Sénégal",
  
  // Logo et images
  logo: "/logo.png",
  favicon: "/favicon.ico",
  
  // Devise
  devise: "FCFA",
  deviseSymbole: "F",
  
  // Couleurs (Tailwind classes)
  couleurs: {
    primaire: "amber",      // amber-500, amber-600, etc.
    secondaire: "gray",
    succes: "green",
    danger: "red",
    warning: "yellow",
    info: "blue",
  },
  
  // Paramètres par défaut
  defaults: {
    validiteDevis: 15,      // Jours de validité des devis
    paginationLimit: 20,    // Nombre d'éléments par page
  },
  
  // Textes légaux (optionnel)
  mentions: {
    facture: "Merci pour votre confiance !",
    devis: "Ce devis est valable pour la durée indiquée.",
    bonCommande: "Bon de commande à signer par le client.",
  },
}

// Fonction helper pour formater les montants
export const formatMontant = (montant: number): string => {
  return `${montant.toLocaleString()} ${ENTREPRISE.deviseSymbole}`
}

// Fonction helper pour formater les montants complets
export const formatMontantComplet = (montant: number): string => {
  return `${montant.toLocaleString()} ${ENTREPRISE.devise}`
}

// Informations de contact formatées pour l'impression
export const getContactPrint = () => ({
  ligne1: `Gérant : ${ENTREPRISE.gerant}`,
  ligne2: `Tel : ${ENTREPRISE.telephone}${ENTREPRISE.telephone2 ? ` – ${ENTREPRISE.telephone2}` : ""}`,
  ligne3: `Email : ${ENTREPRISE.email}`,
  adresse: `${ENTREPRISE.nom} - ${ENTREPRISE.adresse}`,
})
