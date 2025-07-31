const { chromium } = require('playwright');

async function quickTest() {
  console.log('🔍 Test rapide WTTJ...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  
  try {
    const url = 'https://www.welcometothejungle.com/fr/jobs?refinementList%5Bcontract_type%5D%5B%5D=full_time&refinementList%5Bcontract_type%5D%5B%5D=apprenticeship&refinementList%5Bcontract_type%5D%5B%5D=temporary&refinementList%5Bcontract_type%5D%5B%5D=internship&refinementList%5Bcontract_type%5D%5B%5D=freelance&refinementList%5Bcontract_type%5D%5B%5D=graduate_program&refinementList%5Bcontract_type%5D%5B%5D=other&refinementList%5Bcontract_type%5D%5B%5D=part_time&refinementList%5Bcontract_type%5D%5B%5D=vie&refinementList%5Bcontract_type%5D%5B%5D=volunteer&refinementList%5Bcontract_type%5D%5B%5D=idv&refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Borganization.creation_year%5D%5B%5D=0-2010&page=1&sortBy=mostRecent&collections%5B%5D=well_established&searchTitle=false';
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Chercher tous les liens
    const allLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      return Array.from(links).map(link => ({
        href: link.href,
        text: link.textContent.trim().substring(0, 50)
      }));
    });
    
    console.log(`🔗 Total liens: ${allLinks.length}`);
    
    // Chercher les liens contenant "jobs"
    const jobLinks = allLinks.filter(link => link.href.includes('/jobs/'));
    console.log(`🔗 Liens jobs: ${jobLinks.length}`);
    
    // Afficher les 5 premiers liens jobs
    jobLinks.slice(0, 5).forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.href} - "${link.text}"`);
    });
    
    // Chercher les liens contenant "fr/jobs"
    const frJobLinks = allLinks.filter(link => link.href.includes('fr/jobs'));
    console.log(`🔗 Liens fr/jobs: ${frJobLinks.length}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
  }
}

quickTest(); 