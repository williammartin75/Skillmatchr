// Test de la fonction avancée d'extraction de CV (CommonJS)
const fs = require('fs');
const path = require('path');

async function testAdvancedExtraction() {
  console.log('🚀 Test de la fonction extractCvText avancée\n');
  
  try {
    // Lire le fichier PDF d'Antoine Lorence
    const cvPath = path.join(__dirname, 'cv-lorence-antoine.pdf');
    
    if (!fs.existsSync(cvPath)) {
      console.error('❌ Fichier CV non trouvé:', cvPath);
      console.log('📝 Utilisation du fichier existant de test...');
      
      // Test avec pdf-parse existant
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(cvPath);
      const result = await pdfParse(buffer);
      
      console.log('✅ Texte extrait avec pdf-parse:', result.text.length, 'caractères');
      console.log('\n📝 Extrait:');
      console.log('─'.repeat(60));
      console.log(result.text.substring(0, 500));
      console.log('─'.repeat(60));
      
      return;
    }
    
    // Lire le fichier
    const buffer = fs.readFileSync(cvPath);
    console.log('📄 Extraction du CV:', cvPath);
    console.log('📏 Taille du fichier:', (buffer.length / 1024).toFixed(2), 'KB\n');
    
    // Test avec pdfjs-dist
    try {
      const pdfjsLib = require('pdfjs-dist');
      const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      
      console.log('1️⃣ Test avec pdfjs-dist...');
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const structuredData = {
        pages: [],
        sections: {}
      };
      
      // Fonction pour grouper le texte par ligne
      function groupTextByLine(items, threshold = 5) {
        const lines = [];
        let currentLine = [];
        let lastY = null;
        
        items.sort((a, b) => {
          if (Math.abs(a.transform[5] - b.transform[5]) > threshold) {
            return b.transform[5] - a.transform[5];
          }
          return a.transform[4] - b.transform[4];
        });
        
        items.forEach(item => {
          const y = item.transform[5];
          
          if (lastY === null || Math.abs(lastY - y) > threshold) {
            if (currentLine.length > 0) {
              currentLine.sort((a, b) => a.transform[4] - b.transform[4]);
              lines.push(currentLine);
            }
            currentLine = [item];
            lastY = y;
          } else {
            currentLine.push(item);
          }
        });
        
        if (currentLine.length > 0) {
          currentLine.sort((a, b) => a.transform[4] - b.transform[4]);
          lines.push(currentLine);
        }
        
        return lines;
      }
      
      // Extraire le texte de toutes les pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        
        // Grouper par lignes
        const lines = groupTextByLine(content.items);
        
        let pageText = '';
        
        lines.forEach(lineItems => {
          const lineText = lineItems
            .map((item, index) => {
              const text = item.str;
              
              if (index > 0 && lineItems[index - 1]) {
                const prevItem = lineItems[index - 1];
                const gap = item.transform[4] - (prevItem.transform[4] + prevItem.width);
                
                if (gap > item.height * 0.5) {
                  return '  ' + text;
                }
              }
              
              return text;
            })
            .join(' ')
            .trim();
          
          if (lineText) {
            pageText += lineText + '\n';
          }
        });
        
        structuredData.pages.push({
          pageNumber: pageNum,
          text: pageText.trim()
        });
        
        if (pageNum > 1) {
          fullText += '\n\n--- Page ' + pageNum + ' ---\n';
        }
        fullText += pageText;
      }
      
      // Nettoyage final
      fullText = fullText
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s{3,}/g, '  ')
        .replace(/[•▪▫◦‣⁃]/g, '-')
        .replace(/[–—]/g, '-')
        .trim();
      
      console.log('✅ Extraction réussie avec pdfjs-dist');
      console.log('📊 Résultats:');
      console.log('   - Nombre de pages:', pdf.numPages);
      console.log('   - Longueur du texte:', fullText.length, 'caractères');
      
      // Vérifier les informations clés
      console.log('\n🔍 Vérification des informations clés:');
      const checks = {
        'Nom': /Antoine\s+LORENCE/i,
        'Email': /alorence@flokod\.com/,
        'Téléphone': /06\s*70\s*05\s*51\s*37/,
        'Django': /Django/i,
        'Python': /Python/i,
        'Freelance': /Freelance/i,
        'LA POSTE': /LA\s+POSTE/i,
        'LENGOW': /LENGOW/i,
        'OVHCLOUD': /OVHCLOUD/i
      };
      
      Object.entries(checks).forEach(([key, pattern]) => {
        const found = pattern.test(fullText);
        console.log(`   ${found ? '✅' : '❌'} ${key}: ${found ? 'Trouvé' : 'Non trouvé'}`);
      });
      
      // Afficher un extrait
      console.log('\n📝 Extrait du texte (500 premiers caractères):');
      console.log('─'.repeat(60));
      console.log(fullText.substring(0, 500));
      console.log('─'.repeat(60));
      
      // Sauvegarder le résultat
      const outputPath = path.join(__dirname, 'cv-extracted-text.txt');
      fs.writeFileSync(outputPath, fullText);
      console.log('\n💾 Texte extrait sauvegardé dans:', outputPath);
      
    } catch (pdfjsError) {
      console.error('❌ Erreur avec pdfjs-dist:', pdfjsError.message);
      
      // Fallback vers pdf-parse
      console.log('\n2️⃣ Test avec pdf-parse (fallback)...');
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      
      if (result.text && result.text.trim().length > 0) {
        console.log('✅ Extraction réussie avec pdf-parse');
        console.log('📊 Résultats:');
        console.log('   - Nombre de pages:', result.numpages);
        console.log('   - Longueur du texte:', result.text.length, 'caractères');
        
        // Afficher un extrait
        console.log('\n📝 Extrait du texte:');
        console.log('─'.repeat(60));
        console.log(result.text.substring(0, 500));
        console.log('─'.repeat(60));
        
        // Sauvegarder
        const outputPath = path.join(__dirname, 'cv-extracted-text-pdfparse.txt');
        fs.writeFileSync(outputPath, result.text);
        console.log('\n💾 Texte extrait sauvegardé dans:', outputPath);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
console.log('🚀 Démarrage du test d\'extraction PDF...\n');
testAdvancedExtraction().catch(console.error);