const { chromium } = require('playwright');

async function analyzeHTML() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Navigation vers la page JobTeaser...');
    await page.goto('https://www.jobteaser.com/fr/job-offers/a4220b58-37ae-4011-8021-a02bdf6a6f5e-keynove-business-development-consultant-f-h', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await page.waitForTimeout(5000);
    
    console.log('🔍 === ANALYSE DU CODE HTML ===');
    
    // Récupérer le code HTML de la page
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    
    // Chercher "Partiel" dans le HTML
    console.log('\n🏠 === RECHERCHE "PARTIEL" ===');
    const partielMatches = html.match(/[^>]*Partiel[^<]*/g);
    if (partielMatches) {
      partielMatches.forEach((match, index) => {
        console.log(`Match ${index + 1}: "${match.trim()}"`);
      });
    } else {
      console.log('❌ "Partiel" non trouvé dans le HTML');
    }
    
    // Chercher "KEYNOVE recrute" dans le HTML
    console.log('\n📝 === RECHERCHE "KEYNOVE RECRUTE" ===');
    const keynoveMatches = html.match(/[^>]*KEYNOVE recrute[^<]*/g);
    if (keynoveMatches) {
      keynoveMatches.forEach((match, index) => {
        console.log(`Match ${index + 1}: "${match.trim()}"`);
      });
    } else {
      console.log('❌ "KEYNOVE recrute" non trouvé dans le HTML');
    }
    
    // Chercher les éléments avec des classes contenant "remote", "telework", "work"
    console.log('\n🏠 === ÉLÉMENTS AVEC CLASSES REMOTE/TELEWORK ===');
    const remoteElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="remote"], [class*="telework"], [class*="work"]');
      return Array.from(elements).map(el => ({
        tag: el.tagName,
        class: el.className,
        text: el.textContent.trim(),
        dataTestId: el.getAttribute('data-testid')
      }));
    });
    
    remoteElements.forEach((el, index) => {
      console.log(`Élément ${index + 1}:`);
      console.log(`  Tag: ${el.tag}`);
      console.log(`  Classe: ${el.class}`);
      console.log(`  Data-testid: ${el.dataTestId}`);
      console.log(`  Texte: "${el.text}"`);
    });
    
    // Chercher les éléments avec des classes contenant "description", "content", "text"
    console.log('\n📝 === ÉLÉMENTS AVEC CLASSES DESCRIPTION/CONTENT ===');
    const descriptionElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="description"], [class*="content"], [class*="text"]');
      return Array.from(elements).map(el => ({
        tag: el.tagName,
        class: el.className,
        text: el.textContent.trim().substring(0, 200),
        dataTestId: el.getAttribute('data-testid')
      }));
    });
    
    descriptionElements.forEach((el, index) => {
      if (el.text.length > 50) {
        console.log(`Élément ${index + 1}:`);
        console.log(`  Tag: ${el.tag}`);
        console.log(`  Classe: ${el.class}`);
        console.log(`  Data-testid: ${el.dataTestId}`);
        console.log(`  Texte: "${el.text}..."`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
  }
}

analyzeHTML(); 