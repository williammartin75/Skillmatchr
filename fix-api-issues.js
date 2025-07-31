#!/usr/bin/env node

/**
 * Script pour corriger automatiquement les problèmes de l'API data.gouv
 * Usage: node fix-api-issues.js
 */

const fs = require('fs');
const path = require('path');

// Configuration des corrections
const fixes = [
  {
    name: "Correction de la validation des filtres",
    description: "Améliorer la validation des paramètres de filtre pour éviter les valeurs invalides",
    file: "app/spontaneous/page.js",
    pattern: /if \(filters\.activityDomain && filters\.activityDomain !== "" && filters\.activityDomain !== "Tous"\)/,
    replacement: `if (filters.activityDomain && filters.activityDomain !== "" && filters.activityDomain !== "Tous" && filters.activityDomain !== "tous")`
  },
  {
    name: "Ajout de validation des codes de filtre",
    description: "Ajouter une validation des codes de filtre avant l'envoi",
    file: "app/spontaneous/page.js",
    pattern: /\/\/ Ajouter les filtres avec validation/,
    replacement: `// Validation des codes de filtre
      const validActivityCodes = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"];
      const validEmployeeCodes = ["NN", "00", "01", "02", "03", "11", "12", "21", "22", "31", "32", "41", "42", "51", "52", "53"];
      const validRevenueCodes = ["1", "2", "3", "4", "5", "6", "7"];
      
      // Ajouter les filtres avec validation`
  },
  {
    name: "Amélioration de la gestion des erreurs",
    description: "Ajouter une gestion plus détaillée des erreurs HTTP",
    file: "app/spontaneous/page.js",
    pattern: /if \(!response\.ok\) \{/,
    replacement: `if (!response.ok) {
        console.error("❌ Erreur HTTP:", response.status, response.statusText);
        
        // Gestion spécifique des erreurs
        if (response.status === 429) {
          throw new Error("Trop de requêtes. Veuillez attendre quelques secondes.");
        } else if (response.status === 400) {
          throw new Error("Paramètres de recherche invalides.");
        } else if (response.status === 500) {
          throw new Error("Erreur serveur de l'API. Veuillez réessayer plus tard.");
        }`
  }
];

// Fonction pour appliquer une correction
function applyFix(fix) {
  try {
    const filePath = path.join(process.cwd(), fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${fix.file}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Appliquer la correction
    if (fix.pattern && fix.replacement) {
      content = content.replace(fix.pattern, fix.replacement);
    }
    
    // Si le contenu a changé, écrire le fichier
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Correction appliquée: ${fix.name}`);
      return true;
    } else {
      console.log(`ℹ️  Aucun changement nécessaire: ${fix.name}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors de l'application de la correction ${fix.name}:`, error.message);
    return false;
  }
}

// Fonction pour valider les paramètres de l'API
function validateApiParameters() {
  console.log("\n🔍 Validation des paramètres de l'API");
  
  const validations = [
    {
      name: "Codes d'activité",
      valid: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"],
      invalid: ["Tous", "tous", "", "INVALID"]
    },
    {
      name: "Codes d'effectif",
      valid: ["NN", "00", "01", "02", "03", "11", "12", "21", "22", "31", "32", "41", "42", "51", "52", "53"],
      invalid: ["Tous", "tous", "", "INVALID"]
    },
    {
      name: "Codes de CA",
      valid: ["1", "2", "3", "4", "5", "6", "7"],
      invalid: ["Tous", "tous", "", "INVALID"]
    }
  ];
  
  for (const validation of validations) {
    console.log(`\n📋 ${validation.name}:`);
    console.log(`   ✅ Valides: ${validation.valid.join(", ")}`);
    console.log(`   ❌ Invalides: ${validation.invalid.join(", ")}`);
  }
}

// Fonction pour créer un fichier de configuration de debug
function createDebugConfig() {
  const debugConfig = {
    apiUrl: "https://recherche-entreprises.api.gouv.fr/search",
    validParameters: {
      activityCodes: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"],
      employeeCodes: ["NN", "00", "01", "02", "03", "11", "12", "21", "22", "31", "32", "41", "42", "51", "52", "53"],
      revenueCodes: ["1", "2", "3", "4", "5", "6", "7"]
    },
    errorMessages: {
      400: "Paramètres de recherche invalides",
      429: "Trop de requêtes. Veuillez attendre quelques secondes",
      500: "Erreur serveur de l'API. Veuillez réessayer plus tard"
    },
    debugMode: true,
    logLevel: "verbose"
  };
  
  fs.writeFileSync('debug-config.json', JSON.stringify(debugConfig, null, 2));
  console.log("✅ Fichier de configuration de debug créé: debug-config.json");
}

// Fonction principale
async function runFixes() {
  console.log("🔧 Début des corrections automatiques");
  console.log("=" * 50);
  
  let appliedFixes = 0;
  
  for (const fix of fixes) {
    console.log(`\n🔧 Application de: ${fix.name}`);
    console.log(`📝 Description: ${fix.description}`);
    
    if (await applyFix(fix)) {
      appliedFixes++;
    }
  }
  
  console.log(`\n✅ Corrections appliquées: ${appliedFixes}/${fixes.length}`);
  
  // Validation des paramètres
  validateApiParameters();
  
  // Création du fichier de configuration
  createDebugConfig();
  
  console.log("\n🎯 Prochaines étapes:");
  console.log("1. Testez l'API avec le script: node test-api-debug.js");
  console.log("2. Vérifiez les logs dans la console du navigateur");
  console.log("3. Utilisez le panel de debug sur la page /spontaneous");
  console.log("4. Si des problèmes persistent, vérifiez la documentation de l'API");
}

// Exécution des corrections
if (require.main === module) {
  runFixes()
    .then(() => {
      console.log("\n🏁 Corrections terminées");
    })
    .catch(error => {
      console.error("❌ Erreur lors des corrections:", error);
      process.exit(1);
    });
}

module.exports = { applyFix, validateApiParameters, createDebugConfig }; 