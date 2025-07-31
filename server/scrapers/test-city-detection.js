const { ApecCronScraper } = require('./apecCron.js');

async function testCityDetection() {
  console.log('🧪 TEST de détection des villes (majuscules/minuscules)');
  
  const scraper = new ApecCronScraper();
  
  // Tests de détection de villes
  const testCases = [
    "Poste situé à PARIS",
    "Localisation: marseille",
    "Basé à Lyon",
    "Travail à toulouse",
    "Situé à NICE",
    "Localisation: nantes",
    "Basé à STRASBOURG",
    "Poste à montpellier",
    "Situé à BORDEAUX",
    "Localisation: lille",
    "Basé à Rennes",
    "Poste à reims",
    "Situé à SAINT-ÉTIENNE",
    "Localisation: toulon",
    "Basé à LE HAVRE",
    "Poste à grenoble",
    "Situé à DIJON",
    "Localisation: angers",
    "Basé à VILLEURBANNE",
    "Poste à le mans",
    "Situé à AIX-EN-PROVENCE",
    "Localisation: brest",
    "Basé à NÎMES",
    "Poste à limoges",
    "Situé à CLERMONT-FERRAND",
    "Localisation: tours",
    "Basé à AMIENS",
    "Poste à metz",
    "Situé à BESANÇON",
    "Localisation: perpignan",
    "Basé à ORLÉANS",
    "Poste à mulhouse",
    "Situé à CAEN",
    "Localisation: boulogne-billancourt",
    "Basé à ROUEN",
    "Poste à nancy",
    "Situé à ARGENTEUIL",
    "Localisation: montreuil",
    "Basé à SAINT-DENIS",
    "Poste à roubaix",
    "Situé à AVIGNON",
    "Localisation: tourcoing",
    "Basé à FORT-DE-FRANCE",
    "Poste à créteil",
    "Situé à POITIERS",
    "Localisation: nanterre",
    "Basé à VERSAILLES",
    "Poste à courbevoie",
    "Situé à VITRY-SUR-SEINE",
    "Localisation: asnières-sur-seine",
    "Basé à COLOMBES",
    "Poste à aulnay-sous-bois",
    "Situé à RUEIL-MALMAISON",
    "Localisation: la rochelle",
    "Basé à ANTIBES",
    "Poste à saint-maur-des-fossés",
    "Situé à CALAIS",
    "Localisation: champigny-sur-marne",
    "Basé à SAINT-NAZAIRE",
    "Poste à dunkerque",
    "Situé à AIX-LES-BAINS",
    "Localisation: annecy",
    "Basé à ANNEMASSE",
    "Poste à nanteuil",
    "Situé à CHELLES",
    // Tests pour les cas avec mélange de majuscules/minuscules
    "Poste à PaRIS",
    "Localisation: MaRsEiLlE",
    "Basé à LyOn",
    "Travail à ToUlOuSe",
    "Situé à NiCe",
    "Localisation: NaNtEs",
    "Basé à StRaSbOuRg",
    "Poste à MoNtPeLlIeR",
    "Situé à BoRdEaUx",
    "Localisation: LiLlE",
    "Basé à ReNnEs",
    "Poste à ReImS",
    "Situé à SaInT-ÉtIeNnE",
    "Localisation: ToUlOn",
    "Basé à Le HaVrE",
    "Poste à GrEnObLe",
    "Situé à DiJoN",
    "Localisation: AnGeRs",
    "Basé à ViLlEuRbAnNe",
    "Poste à Le MaNs",
    "Situé à AiX-En-PrOvEnCe",
    "Localisation: BrEsT",
    "Basé à NîMeS",
    "Poste à LiMoGeS",
    "Situé à ClErMoNt-FeRrAnD",
    "Localisation: ToUrS",
    "Basé à AmIeNs",
    "Poste à MeTz",
    "Situé à BeSaNçOn",
    "Localisation: PeRpIgNaN",
    "Basé à OrLéAnS",
    "Poste à MuLhOuSe",
    "Situé à CaEn",
    "Localisation: BoUlOgNe-BiLlAnCoUrT",
    "Basé à RoUeN",
    "Poste à NaNcY",
    "Situé à ArGeNtEuIl",
    "Localisation: MoNtReUiL",
    "Basé à SaInT-DeNiS",
    "Poste à RoUbAiX",
    "Situé à AvIgNoN",
    "Localisation: ToUrCoInG",
    "Basé à FoRt-De-FrAnCe",
    "Poste à CrÉtEiL",
    "Situé à PoItIeRs",
    "Localisation: NaNtErRe",
    "Basé à VeRsAiLlEs",
    "Poste à CoUrBeVoIe",
    "Situé à ViTrY-SuR-SeInE",
    "Localisation: AsNiÈrEs-SuR-SeInE",
    "Basé à CoLoMbEs",
    "Poste à AuLnAy-SoUs-BoIs",
    "Situé à RuEiL-MaLmAiSoN",
    "Localisation: La RoChElLe",
    "Basé à AnTiBeS",
    "Poste à SaInT-MaUr-DeS-FoSsÉs",
    "Situé à CaLaIs",
    "Localisation: ChAmPiGnY-SuR-MaRnE",
    "Basé à SaInT-NaZaIrE",
    "Poste à DuNkErQuE",
    "Situé à AiX-LeS-BaInS",
    "Localisation: AnNeCy",
    "Basé à AnNeMaSsE",
    "Poste à NaNtEuIl",
    "Situé à ChElLeS"
  ];
  
  console.log('\n📋 Tests de détection des villes:');
  console.log('=' .repeat(80));
  
  let successCount = 0;
  let totalCount = testCases.length;
  
  for (let i = 0; i < testCases.length; i++) {
    const testText = testCases[i];
    console.log(`\n${i + 1}. Texte: "${testText}"`);
    
    const result = scraper.extractInfoFromText(testText);
    if (result.location) {
      console.log(`   ✅ Ville trouvée: "${result.location}"`);
      successCount++;
    } else {
      console.log(`   ❌ Aucune ville trouvée`);
    }
  }
  
  console.log('\n📊 Résultats:');
  console.log(`✅ Villes détectées: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  console.log('\n✅ Test terminé !');
}

// Exécuter le test
testCityDetection().catch(console.error);