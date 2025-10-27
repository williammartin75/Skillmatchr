
// Patch pour améliorer la gestion des dates dans wttjScraper.js

// Remplacer dans saveToDatabase:
// const publishedAt = this.parseRelativeDate(job.published_date);
// Par:
const rawDate = this.parseRelativeDate(job.published_date);
const publishedAt = ensureValidDate(rawDate, new Date());

// Ajouter la validation avant l'insertion:
if (!publishedAt || isNaN(publishedAt.getTime())) {
  console.error('❌ Date invalide pour le job:', job.title);
  publishedAt = new Date(); // Utiliser la date actuelle comme fallback
}
