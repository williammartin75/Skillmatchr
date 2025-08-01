
// Fonction améliorée pour valider et corriger les dates
function ensureValidDate(date, fallbackDate = new Date()) {
  if (!date) return fallbackDate;
  
  const parsedDate = date instanceof Date ? date : new Date(date);
  
  // Vérifier si la date est valide
  if (isNaN(parsedDate.getTime())) {
    console.log(`⚠️ Date invalide détectée: ${date}, utilisation du fallback`);
    return fallbackDate;
  }
  
  // Vérifier si la date est dans le futur (probablement une erreur)
  const now = new Date();
  if (parsedDate > now) {
    console.log(`⚠️ Date future détectée: ${parsedDate.toISOString()}, utilisation de la date actuelle`);
    return now;
  }
  
  // Vérifier si la date est trop ancienne (plus de 1 an)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (parsedDate < oneYearAgo) {
    console.log(`⚠️ Date trop ancienne détectée: ${parsedDate.toISOString()}, possiblement incorrecte`);
  }
  
  return parsedDate;
}



// Fonction améliorée pour parser les dates relatives avec plus de patterns
function parseRelativeDateExtended(dateText) {
  const now = new Date();
  
  if (!dateText) {
    console.log('⚠️ Pas de date fournie, utilisation de la date actuelle');
    return now;
  }
  
  const text = dateText.toLowerCase().trim();
  
  // Cas spéciaux
  const specialCases = {
    "aujourd'hui": () => now,
    "today": () => now,
    "hier": () => { const d = new Date(now); d.setDate(d.getDate() - 1); return d; },
    "yesterday": () => { const d = new Date(now); d.setDate(d.getDate() - 1); return d; },
    "avant-hier": () => { const d = new Date(now); d.setDate(d.getDate() - 2); return d; },
    "cette semaine": () => { const d = new Date(now); d.setDate(d.getDate() - 3); return d; },
    "ce mois-ci": () => { const d = new Date(now); d.setDate(d.getDate() - 15); return d; }
  };
  
  for (const [key, getValue] of Object.entries(specialCases)) {
    if (text.includes(key)) {
      return getValue();
    }
  }
  
  // Patterns pour les dates relatives
  const patterns = [
    { regex: /il y a (\d+) minute?s?/, unit: 'minutes' },
    { regex: /il y a (\d+) heure?s?/, unit: 'hours' },
    { regex: /il y a (\d+) jour?s?/, unit: 'days' },
    { regex: /il y a (\d+) semaine?s?/, unit: 'weeks' },
    { regex: /il y a (\d+) mois/, unit: 'months' },
    { regex: /(\d+) minute?s? ago/, unit: 'minutes' },
    { regex: /(\d+) hour?s? ago/, unit: 'hours' },
    { regex: /(\d+) day?s? ago/, unit: 'days' },
    { regex: /(\d+) week?s? ago/, unit: 'weeks' },
    { regex: /(\d+) month?s? ago/, unit: 'months' }
  ];
  
  for (const { regex, unit } of patterns) {
    const match = text.match(regex);
    if (match) {
      const amount = parseInt(match[1]);
      const date = new Date(now);
      
      switch (unit) {
        case 'minutes':
          date.setMinutes(date.getMinutes() - amount);
          break;
        case 'hours':
          date.setHours(date.getHours() - amount);
          break;
        case 'days':
          date.setDate(date.getDate() - amount);
          break;
        case 'weeks':
          date.setDate(date.getDate() - (amount * 7));
          break;
        case 'months':
          date.setMonth(date.getMonth() - amount);
          break;
      }
      
      return date;
    }
  }
  
  // Essayer de parser différents formats de dates
  const dateFormats = [
    /(d{1,2})/(d{1,2})/(d{4})/, // DD/MM/YYYY
    /(d{4})-(d{1,2})-(d{1,2})/, // YYYY-MM-DD
    /(d{1,2})-(d{1,2})-(d{4})/, // DD-MM-YYYY
  ];
  
  for (const format of dateFormats) {
    const match = text.match(format);
    if (match) {
      if (format.source.includes('d{4})-')) {
        // Format YYYY-MM-DD
        return new Date(match[1], match[2] - 1, match[3]);
      } else {
        // Format DD/MM/YYYY ou DD-MM-YYYY
        return new Date(match[3], match[2] - 1, match[1]);
      }
    }
  }
  
  // Si rien ne marche, retourner la date actuelle
  console.log(`⚠️ Impossible de parser la date: "${dateText}", utilisation de la date actuelle`);
  return now;
}
