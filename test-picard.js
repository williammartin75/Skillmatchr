#!/usr/bin/env node

/**
 * Test simple pour PICARD SURGELES
 */

const https = require('https');

async function testPicard() {
  console.log("🧪 Test de recherche pour PICARD SURGELES");
  
  const url = "https://recherche-entreprises.api.gouv.fr/search?q=PICARD%20SURGELES&per_page=5";
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("📊 Résultats trouvés:", data.results?.length || 0);
    
    if (data.results && data.results.length > 0) {
      const picard = data.results[0];
      console.log("🏢 PICARD SURGELES:");
      console.log("  Nom:", picard.nom_raison_sociale);
      console.log("  SIREN:", picard.siren);
      console.log("  SIRET:", picard.siret);
      console.log("  Activité:", picard.section_activite_principale);
      console.log("  Effectif:", picard.tranche_effectif_salarie);
      console.log("  Adresse:", picard.siege?.adresse);
      console.log("  Ville:", picard.siege?.commune);
      console.log("  Code postal:", picard.siege?.code_postal);
      console.log("  Site web:", picard.site_web);
      
      // Test du lien vers la fiche officielle
      if (picard.siren) {
        console.log("🔗 Lien fiche officielle:", `https://annuaire-entreprises.data.gouv.fr/entreprise/${picard.siren}`);
      }
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

testPicard(); 