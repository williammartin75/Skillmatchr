const { chromium } = require('playwright');

async function debugJobTeaserPage() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Navigation vers la page JobTeaser...');
    await page.goto('https://www.jobteaser.com/fr/job-offers/e2e9f514-5ae0-4e64-801a-5b545916eb1c-la-poste-groupe-alternance-chef-de-projet-h-f', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await page.waitForTimeout(3000);
    
    console.log('🔍 Recherche de la description...');
    
    // Chercher le texte spécifique
    const descriptionText = await page.evaluate(() => {
      const text = document.body.textContent;
      if (text.includes('La Poste Groupe change, nos métiers évoluent')) {
        console.log('✅ Texte trouvé dans le body');
        return 'Trouvé dans body';
      }
      return 'Non trouvé';
    });
    
    console.log('Résultat:', descriptionText);
    
    // Chercher dans différentes balises
    const selectors = [
      '[data-testid="jobad-card-description"]',
      '[data-testid="job-description"]',
      '.job-description',
      '.description',
      '[class*="description"]',
      'p',
      'div[class*="content"]',
      'section[class*="description"]'
    ];
    
    // Afficher le contenu des éléments trouvés pour debug
    console.log('\n🔍 === CONTENU DES ÉLÉMENTS TROUVÉS ===');
    
    // Vérifier les éléments <p>
    const pElements = await page.$$('p');
    console.log(`\n📝 Éléments <p> (${pElements.length}):`);
    for (let i = 0; i < pElements.length; i++) {
      const text = await pElements[i].textContent();
      console.log(`  P${i}: "${text.substring(0, 100)}..."`);
    }
    
    // Vérifier les éléments div[class*="content"]
    const contentElements = await page.$$('div[class*="content"]');
    console.log(`\n📝 Éléments div[class*="content"] (${contentElements.length}):`);
    for (let i = 0; i < contentElements.length; i++) {
      const text = await contentElements[i].textContent();
      console.log(`  Content${i}: "${text.substring(0, 100)}..."`);
    }
    
    // Chercher dans tous les éléments avec une classe contenant "description"
    const allElements = await page.$$('*');
    console.log(`\n🔍 Recherche dans tous les éléments (${allElements.length})...`);
    
    for (let i = 0; i < Math.min(allElements.length, 50); i++) {
      try {
        const element = allElements[i];
        const className = await element.getAttribute('class');
        const text = await element.textContent();
        
        if (className && (className.includes('description') || className.includes('content') || className.includes('text'))) {
          console.log(`\n🏷️ Élément ${i} avec classe "${className}":`);
          console.log(`📝 Texte: "${text.substring(0, 150)}..."`);
          
          if (text.includes('La Poste Groupe change')) {
            console.log(`✅ TROUVÉ dans l'élément ${i} avec classe "${className}"!`);
            break;
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
  }
}

debugJobTeaserPage(); 