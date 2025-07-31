const { chromium } = require('playwright');

async function analyzeJobTeaserOffer() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Analyse détaillée de l\'offre JobTeaser...');
    
    // Naviguer vers l'offre spécifique
    await page.goto('https://www.jobteaser.com/fr/job-offers/0212be33-2e8e-4183-8a4a-24cdbe51efc1-ey-avocat-experimente-en-droit-de-la-regulation-droit-de-l-energie-paris-f-h', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    
    console.log('✅ Page chargée avec succès');
    
    // Attendre que le contenu soit chargé
    await page.waitForTimeout(2000);
    
    // 1. Analyser la structure de la page
    console.log('\n📋 === ANALYSE DE LA STRUCTURE DE LA PAGE ===');
    
    // Chercher tous les éléments avec des data-testid
    const elementsWithTestId = await page.$$eval('[data-testid]', elements => {
      return elements.map(el => ({
        testId: el.getAttribute('data-testid'),
        tagName: el.tagName,
        text: el.textContent?.trim().substring(0, 100) || '',
        className: el.className
      }));
    });
    
    console.log('🔍 Éléments avec data-testid trouvés:');
    elementsWithTestId.forEach(el => {
      console.log(`  - ${el.testId} (${el.tagName}): "${el.text}"`);
    });
    
    // 2. Chercher la description
    console.log('\n📝 === RECHERCHE DE LA DESCRIPTION ===');
    
    // Essayer différents sélecteurs pour la description
    const descriptionSelectors = [
      '[data-testid="jobad-DetailView__Description"]',
      '[data-testid="jobad-DetailView__Description__Content"]',
      '.jobad-DetailView__Description',
      '.jobad-DetailView__Description__Content',
      '[data-testid*="Description"]',
      '[data-testid*="description"]',
      '.description',
      '.job-description',
      '.content',
      'p',
      'div[class*="description"]',
      'div[class*="content"]'
    ];
    
    for (const selector of descriptionSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim().length > 50) {
            console.log(`✅ Description trouvée avec ${selector}:`);
            console.log(`   "${text.trim().substring(0, 200)}..."`);
            break;
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // 3. Chercher le salaire
    console.log('\n💰 === RECHERCHE DU SALAIRE ===');
    
    const salarySelectors = [
      '[data-testid="jobad-DetailView__Salary"]',
      '[data-testid="jobad-DetailView__Compensation"]',
      '[data-testid*="Salary"]',
      '[data-testid*="salary"]',
      '[data-testid*="Compensation"]',
      '[data-testid*="compensation"]',
      '.salary',
      '.compensation',
      '.remuneration',
      'div[class*="salary"]',
      'div[class*="compensation"]',
      'span[class*="salary"]',
      'span[class*="compensation"]'
    ];
    
    for (const selector of salarySelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`✅ Salaire trouvé avec ${selector}:`);
            console.log(`   "${text.trim()}"`);
            break;
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    // 4. Analyser tout le contenu de la page
    console.log('\n🔍 === ANALYSE COMPLÈTE DU CONTENU ===');
    
    const pageContent = await page.evaluate(() => {
      const body = document.body;
      const allText = body.innerText || body.textContent || '';
      
      // Chercher des patterns de salaire
      const salaryPatterns = [
        /\d{1,3}[kK]€/g,
        /\d{1,3}\s*[kK]€/g,
        /\d{1,3}\s*000\s*€/g,
        /\d{1,3}\s*-\s*\d{1,3}[kK]€/g,
        /salaire[:\s]*([^.\n]+)/gi,
        /rémunération[:\s]*([^.\n]+)/gi,
        /compensation[:\s]*([^.\n]+)/gi
      ];
      
      const foundSalaries = [];
      salaryPatterns.forEach(pattern => {
        const matches = allText.match(pattern);
        if (matches) {
          foundSalaries.push(...matches);
        }
      });
      
      // Chercher des phrases de description (premières phrases)
      const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 5);
      
      return {
        allText: allText.substring(0, 1000),
        foundSalaries: [...new Set(foundSalaries)],
        firstSentences: sentences,
        wordCount: allText.split(/\s+/).length
      };
    });
    
    console.log(`📊 Nombre total de mots sur la page: ${pageContent.wordCount}`);
    console.log(`💰 Salaires trouvés: ${pageContent.foundSalaries.length > 0 ? pageContent.foundSalaries.join(', ') : 'Aucun'}`);
    console.log(`📝 Premières phrases trouvées:`);
    pageContent.firstSentences.forEach((sentence, index) => {
      console.log(`   ${index + 1}. "${sentence.trim()}"`);
    });
    
    // 5. Prendre une capture d'écran pour analyse visuelle
    await page.screenshot({ path: 'jobteaser_analysis.png', fullPage: true });
    console.log('\n📸 Capture d\'écran sauvegardée: jobteaser_analysis.png');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  } finally {
    await browser.close();
  }
}

analyzeJobTeaserOffer().catch(console.error); 