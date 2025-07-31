const fs = require('fs');
const path = require('path');

// Test de l'extraction PDF avec le CV d'Antoine Lorence
async function testPDFExtraction() {
  try {
    const cvPath = path.join(__dirname, 'cv-lorence-antoine.pdf');
    
    if (!fs.existsSync(cvPath)) {
      console.log('❌ Fichier CV non trouvé:', cvPath);
      return;
    }
    
    console.log('📄 Test d\'extraction du CV:', cvPath);
    
    // Lire le fichier PDF
    const buffer = fs.readFileSync(cvPath);
    
    // Test avec pdfjs-dist
    console.log('🔄 Test avec pdfjs-dist...');
    try {
      const pdfjsLib = require('pdfjs-dist');
      const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extraire le texte de toutes les pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Construire le texte de la page
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      console.log(`✅ PDF extrait avec pdfjs-dist: ${fullText.length} caractères`);
      console.log('\n📝 Premiers 300 caractères:');
      console.log('='.repeat(50));
      console.log(fullText.substring(0, 300));
      console.log('='.repeat(50));
      
      // Test de détection des noms
      const lines = fullText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      console.log('\n🔍 Recherche de noms dans les premières lignes:');
      
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i];
        console.log(`Ligne ${i + 1}: "${line}"`);
        
        // Pattern pour "Antoine Lorence"
        const namePattern = /^([A-Z][a-z]+)\s+([A-Z][a-z]+)$/;
        const match = line.match(namePattern);
        if (match) {
          console.log(`✅ Nom détecté: ${match[1]} ${match[2]}`);
          break;
        }
      }
      
    } catch (pdfError) {
      console.error('❌ Erreur avec pdfjs-dist:', pdfError.message);
      
      // Fallback vers pdf-parse
      console.log('🔄 Test avec pdf-parse...');
      try {
        const pdfParse = require('pdf-parse');
        const result = await pdfParse(buffer);
        
        if (result.text && result.text.trim().length > 0) {
          console.log(`✅ PDF extrait avec pdf-parse: ${result.text.length} caractères`);
          console.log('\n📝 Premiers 300 caractères:');
          console.log('='.repeat(50));
          console.log(result.text.substring(0, 300));
          console.log('='.repeat(50));
        } else {
          console.log('❌ Texte vide avec pdf-parse');
        }
      } catch (parseError) {
        console.error('❌ Erreur avec pdf-parse:', parseError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testPDFExtraction(); 