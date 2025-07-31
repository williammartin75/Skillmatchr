const fs = require('fs');
const path = require('path');

// Test de l'extraction depuis le nom de fichier
async function testFilenameExtraction() {
  try {
    const cvPath = path.join(__dirname, 'cv-lorence-antoine.pdf');
    
    if (!fs.existsSync(cvPath)) {
      console.log('❌ Fichier CV non trouvé:', cvPath);
      return;
    }
    
    console.log('📄 Test d\'extraction depuis le nom de fichier:', cvPath);
    
    // Lire le fichier PDF
    const buffer = fs.readFileSync(cvPath);
    
    // Test avec pdf-parse
    console.log('🔄 Extraction avec pdf-parse...');
    try {
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      
      if (result.text && result.text.trim().length > 0) {
        console.log(`✅ PDF extrait: ${result.text.length} caractères`);
        
        // Simuler la fonction extractPersonalInfo avec le nom de fichier
        const fileName = 'cv-lorence-antoine.pdf';
        const text = result.text;
        
        console.log('\n🔍 Test de la nouvelle logique d\'extraction:');
        
        // Nettoyer le nom de fichier
        const cleanFileName = fileName
          .replace(/\.(pdf|doc|docx|txt)$/i, '')
          .replace(/[-_]/g, ' ')
          .trim();
        
        console.log(`📝 Nom de fichier nettoyé: "${cleanFileName}"`);
        
        // Pattern pour "antoine-lorence" ou "cv-antoine-lorence" etc.
        let fileNameMatch = cleanFileName.match(/^([a-z]+)[-_ ]([a-z]+)$/i);
        
        // Si pas de match, essayer avec "cv-" au début
        if (!fileNameMatch) {
          fileNameMatch = cleanFileName.match(/^cv[-_ ]([a-z]+)[-_ ]([a-z]+)$/i);
          if (fileNameMatch) {
            // Pour "cv-lorence-antoine", on inverse l'ordre
            fileNameMatch = [fileNameMatch[0], fileNameMatch[2], fileNameMatch[1]];
          }
        }
        
        if (fileNameMatch) {
          const potentialFirstName = fileNameMatch[1];
          const potentialLastName = fileNameMatch[2];
          
          console.log(`🎯 Prénom potentiel depuis le fichier: ${potentialFirstName}`);
          console.log(`🎯 Nom potentiel depuis le fichier: ${potentialLastName}`);
          
          // Vérifier si ces noms apparaissent dans le contenu du PDF
          const firstNamePattern = new RegExp(`\\b${potentialFirstName}\\b`, 'i');
          const lastNamePattern = new RegExp(`\\b${potentialLastName}\\b`, 'i');
          
          const firstNameInText = firstNamePattern.test(text);
          const lastNameInText = lastNamePattern.test(text);
          
          console.log(`📄 Prénom trouvé dans le texte: ${firstNameInText}`);
          console.log(`📄 Nom trouvé dans le texte: ${lastNameInText}`);
          
          // Chercher les patterns minuscules/majuscules
          const firstNameLowerPattern = new RegExp(`\\b${potentialFirstName.toLowerCase()}\\b`);
          const lastNameUpperPattern = new RegExp(`\\b${potentialLastName.toUpperCase()}\\b`);
          
          const firstNameLowerInText = firstNameLowerPattern.test(text);
          const lastNameUpperInText = lastNameUpperPattern.test(text);
          
          console.log(`📄 Prénom en minuscules dans le texte: ${firstNameLowerInText}`);
          console.log(`📄 Nom en majuscules dans le texte: ${lastNameUpperInText}`);
          
          if (firstNameInText || lastNameInText) {
            let firstName, lastName;
            
            if (firstNameLowerInText && lastNameUpperInText) {
              firstName = potentialFirstName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
              lastName = potentialLastName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
              console.log(`✅ Nom confirmé (prénom minuscule + nom majuscule): ${firstName} ${lastName}`);
            } else {
              firstName = potentialFirstName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
              lastName = potentialLastName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
              console.log(`✅ Nom confirmé depuis le fichier: ${firstName} ${lastName}`);
            }
            
            console.log('\n📋 Résumé final:');
            console.log('Prénom:', firstName);
            console.log('Nom:', lastName);
          } else {
            console.log('❌ Noms du fichier non trouvés dans le texte');
          }
        } else {
          console.log('❌ Pattern de nom de fichier non reconnu');
        }
        
      } else {
        console.log('❌ Texte vide avec pdf-parse');
      }
    } catch (parseError) {
      console.error('❌ Erreur avec pdf-parse:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testFilenameExtraction(); 