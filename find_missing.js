const { chromium } = require('playwright');

async function findMissing() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://www.jobteaser.com/fr/job-offers/a4220b58-37ae-4011-8021-a02bdf6a6f5e-keynove-business-development-consultant-f-h', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    await page.waitForTimeout(2000);
    
    console.log('🔍 === RECHERCHE TÉLÉTRAVAIL ===');
    
    // Chercher "Partiel" dans tous les éléments
    const allElements = await page.$$('*');
    for (let i = 0; i < Math.min(allElements.length, 50); i++) {
      try {
        const text = await allElements[i].textContent();
        if (text && text.includes('Partiel')) {
          const className = await allElements[i].getAttribute('class');
          const dataTestId = await allElements[i].getAttribute('data-testid');
          console.log(`✅ "Partiel" trouvé dans l'élément ${i}:`);
          console.log(`   Classe: "${className}"`);
          console.log(`   Data-testid: "${dataTestId}"`);
          console.log(`   Texte: "${text.trim()}"`);
        }
      } catch (error) {
        // Ignorer
      }
    }
    
    console.log('\n🔍 === RECHERCHE DESCRIPTION ===');
    
    // Chercher "KEYNOVE recrute" dans tous les éléments
    for (let i = 0; i < Math.min(allElements.length, 100); i++) {
      try {
        const text = await allElements[i].textContent();
        if (text && text.includes('KEYNOVE recrute')) {
          const className = await allElements[i].getAttribute('class');
          const dataTestId = await allElements[i].getAttribute('data-testid');
          console.log(`✅ Description trouvée dans l'élément ${i}:`);
          console.log(`   Classe: "${className}"`);
          console.log(`   Data-testid: "${dataTestId}"`);
          console.log(`   Texte: "${text.trim()}"`);
        }
      } catch (error) {
        // Ignorer
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
  }
}

findMissing(); 