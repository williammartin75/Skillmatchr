const { chromium } = require('playwright');

async function testJobTeaserOffre() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔍 Navigation vers l\'offre Keynove...');
    await page.goto('https://www.jobteaser.com/fr/job-offers/a4220b58-37ae-4011-8021-a02bdf6a6f5e-keynove-business-development-consultant-f-h', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await page.waitForTimeout(3000);
    
    console.log('🔍 === EXTRACTION DES INFORMATIONS ===');
    
    // Entreprise
    console.log('\n🏢 === ENTREPRISE ===');
    const companySelectors = [
      '[data-testid="company-name"]',
      '[data-testid="jobad-company"]',
      '.company-name',
      '[class*="company"]',
      'h2',
      'h3'
    ];
    
    for (const selector of companySelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`Sélecteur "${selector}": "${text.trim()}"`);
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // Titre
    console.log('\n📋 === TITRE ===');
    const titleSelectors = [
      'h1',
      '[data-testid="job-title"]',
      '[data-testid="jobad-title"]',
      '.job-title',
      'h2'
    ];
    
    for (const selector of titleSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`Sélecteur "${selector}": "${text.trim()}"`);
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // Localisation
    console.log('\n📍 === LOCALISATION ===');
    const locationSelectors = [
      '[data-testid="job-location"]',
      '[data-testid="jobad-location"]',
      '.location',
      '[class*="location"]'
    ];
    
    for (const selector of locationSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`Sélecteur "${selector}": "${text.trim()}"`);
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // Type de poste/Contrat
    console.log('\n📋 === TYPE DE POSTE ===');
    const contractSelectors = [
      '[data-testid="contract-type"]',
      '[data-testid="jobad-contract"]',
      '.contract-type',
      '[class*="contract"]'
    ];
    
    for (const selector of contractSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`Sélecteur "${selector}": "${text.trim()}"`);
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // Salaire
    console.log('\n💰 === SALAIRE ===');
    const salarySelectors = [
      '[data-testid="salary"]',
      '[data-testid="jobad-salary"]',
      '.salary',
      '[class*="salary"]'
    ];
    
    for (const selector of salarySelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`Sélecteur "${selector}": "${text.trim()}"`);
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // Télétravail
    console.log('\n🏠 === TÉLÉTRAVAIL ===');
    const teleworkSelectorsBasic = [
      '[data-testid="telework"]',
      '[data-testid="remote-work"]',
      '.telework',
      '[class*="remote"]',
      '[class*="telework"]'
    ];
    
    for (const selector of teleworkSelectorsBasic) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`Sélecteur "${selector}": "${text.trim()}"`);
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // Date de début
    console.log('\n📅 === DATE DE DÉBUT ===');
    const startDateSelectors = [
      '[data-testid="start-date"]',
      '[data-testid="jobad-start-date"]',
      '.start-date',
      '[class*="start"]'
    ];
    
    for (const selector of startDateSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`Sélecteur "${selector}": "${text.trim()}"`);
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // Description - analyser les 8 éléments trouvés
    console.log('\n📝 === DESCRIPTION ===');
    const descriptionElements = await page.$$('[class*="description"]');
    console.log(`📝 Éléments [class*="description"]: ${descriptionElements.length} trouvés`);
    
    for (let i = 0; i < descriptionElements.length; i++) {
      try {
        const text = await descriptionElements[i].textContent();
        if (text && text.trim() && text.trim().length > 10) {
          console.log(`\n📝 Élément description ${i}:`);
          console.log(`Texte: "${text.trim()}"`);
          
          // Afficher les attributs de l'élément
          const attributes = await descriptionElements[i].evaluate(el => {
            const attrs = {};
            for (let attr of el.attributes) {
              attrs[attr.name] = attr.value;
            }
            return attrs;
          });
          console.log(`Attributs:`, attributes);
        }
      } catch (error) {
        console.log(`Erreur élément ${i}:`, error.message);
      }
    }
    
    // Chercher le télétravail spécifiquement
    console.log('\n🏠 === TÉLÉTRAVAIL - RECHERCHE APPROFONDIE ===');
    const teleworkSelectors = [
      '[data-testid*="remote"]',
      '[data-testid*="telework"]',
      '[data-testid*="work"]',
      '[class*="remote"]',
      '[class*="telework"]',
      '[class*="work"]',
      'span',
      'div'
    ];
    
    for (const selector of teleworkSelectors) {
      try {
        const elements = await page.$$(selector);
        for (let i = 0; i < Math.min(elements.length, 10); i++) {
          const text = await elements[i].textContent();
          if (text && text.trim() && (
            text.toLowerCase().includes('télétravail') || 
            text.toLowerCase().includes('remote') || 
            text.toLowerCase().includes('hybride') ||
            text.toLowerCase().includes('partiel')
          )) {
            console.log(`Télétravail trouvé dans "${selector}" (élément ${i}): "${text.trim()}"`);
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // Chercher la description dans tous les éléments
    console.log('\n📝 === DESCRIPTION - RECHERCHE APPROFONDIE ===');
    const allElements = await page.$$('*');
    console.log(`Recherche dans ${allElements.length} éléments...`);
    
    for (let i = 0; i < Math.min(allElements.length, 100); i++) {
      try {
        const element = allElements[i];
        const text = await element.textContent();
        const className = await element.getAttribute('class');
        
        if (text && text.trim() && text.trim().length > 100 && 
            (text.includes('KEYNOVE') || text.includes('recrute') || text.includes('stagiaire'))) {
          console.log(`\n📝 Description potentielle trouvée (élément ${i}):`);
          console.log(`Classe: "${className}"`);
          console.log(`Texte: "${text.trim()}"`);
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

testJobTeaserOffre(); 