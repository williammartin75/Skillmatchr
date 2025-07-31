const { chromium } = require('playwright');

async function findPartielAdvanced() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Navigation vers la page...');
    await page.goto('https://www.jobteaser.com/fr/job-offers/a4220b58-37ae-4011-8021-a02bdf6a6f5e-keynove-business-development-consultant-f-h', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Attendre plus longtemps pour le chargement dynamique
    console.log('⏳ Attente du chargement dynamique...');
    await page.waitForTimeout(10000);
    
    console.log('🔍 === RECHERCHE "PARTIEL" AVANCÉE ===');
    
    // Stratégie 1: Chercher dans le texte complet de la page
    console.log('\n📝 Stratégie 1: Texte complet de la page');
    const fullText = await page.evaluate(() => document.body.textContent);
    if (fullText.includes('Partiel')) {
      console.log('✅ "Partiel" trouvé dans le texte complet de la page');
      const index = fullText.indexOf('Partiel');
      const context = fullText.substring(Math.max(0, index - 50), index + 50);
      console.log(`Contexte: "...${context}..."`);
    } else {
      console.log('❌ "Partiel" non trouvé dans le texte complet');
    }
    
    // Stratégie 2: Attendre qu'un élément contenant "Partiel" apparaisse
    console.log('\n📝 Stratégie 2: Attendre l\'apparition de "Partiel"');
    try {
      await page.waitForFunction(() => {
        return document.body.textContent.includes('Partiel');
      }, { timeout: 15000 });
      console.log('✅ "Partiel" est maintenant visible dans la page');
    } catch (error) {
      console.log('❌ "Partiel" n\'est toujours pas visible après attente');
    }
    
    // Stratégie 3: Chercher dans les iframes
    console.log('\n📝 Stratégie 3: Chercher dans les iframes');
    const frames = page.frames();
    for (let i = 0; i < frames.length; i++) {
      try {
        const frameText = await frames[i].evaluate(() => document.body.textContent);
        if (frameText.includes('Partiel')) {
          console.log(`✅ "Partiel" trouvé dans l'iframe ${i}`);
          break;
        }
      } catch (error) {
        // Ignorer
      }
    }
    
    // Stratégie 4: Chercher avec des sélecteurs spécifiques
    console.log('\n📝 Stratégie 4: Sélecteurs spécifiques');
    const specificSelectors = [
      '[data-testid*="remote"]',
      '[data-testid*="telework"]',
      '[data-testid*="work"]',
      '[class*="remote"]',
      '[class*="telework"]',
      '[class*="work"]',
      '[class*="partiel"]',
      '[class*="hybride"]'
    ];
    
    for (const selector of specificSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const text = await element.textContent();
          if (text && text.includes('Partiel')) {
            console.log(`✅ "Partiel" trouvé avec le sélecteur "${selector}"`);
            console.log(`Texte: "${text.trim()}"`);
            break;
          }
        }
      } catch (error) {
        // Ignorer
      }
    }
    
    // Stratégie 5: Chercher dans tous les éléments après l'attente
    console.log('\n📝 Stratégie 5: Recherche finale dans tous les éléments');
    const allElements = await page.$$('*');
    console.log(`Recherche dans ${allElements.length} éléments...`);
    
    for (let i = 0; i < Math.min(allElements.length, 200); i++) {
      try {
        const text = await allElements[i].textContent();
        if (text && text.includes('Partiel')) {
          const tagName = await allElements[i].evaluate(el => el.tagName);
          const className = await allElements[i].getAttribute('class');
          const dataTestId = await allElements[i].getAttribute('data-testid');
          console.log(`✅ "Partiel" trouvé dans l'élément ${i}:`);
          console.log(`   Tag: ${tagName}`);
          console.log(`   Classe: "${className}"`);
          console.log(`   Data-testid: "${dataTestId}"`);
          console.log(`   Texte: "${text.trim()}"`);
          break;
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

findPartielAdvanced(); 