// Script pour générer 950 jobs supplémentaires
const fs = require('fs');

// Données de base pour générer des variations
const companies = [
  "TechCorp", "InnovateSoft", "DataFlow", "CloudTech", "WebSolutions", "ProductHub", "BackendPro", "DesignStudio",
  "MobileApp", "GameStudio", "AI Solutions", "BlockchainTech", "CyberSec", "NetworkPro", "IoT Solutions", "BigData Corp",
  "MachineLearning Inc", "CloudNative", "DevOps Pro", "FullStack Solutions", "Frontend Masters", "Backend Experts",
  "Data Analytics Pro", "Product Innovation", "UX Excellence", "Mobile Development", "Game Development", "AI Research",
  "Blockchain Development", "Security Solutions", "Network Infrastructure", "IoT Development", "Data Science Pro",
  "ML Engineering", "Cloud Architecture", "DevOps Engineering", "Full Stack Development", "Frontend Development",
  "Backend Development", "Data Engineering", "Product Management", "UX Design", "Mobile Engineering", "Game Engineering",
  "AI Engineering", "Blockchain Engineering", "Security Engineering", "Network Engineering", "IoT Engineering"
];

const titles = [
  "Développeur Full Stack", "Ingénieur DevOps", "Data Scientist", "Architecte Cloud", "Développeur Frontend",
  "Product Manager", "Développeur Backend", "UX/UI Designer", "Développeur Mobile", "Chef de Projet IT",
  "Analyste Cybersécurité", "Développeur Blockchain", "Ingénieur Réseau", "Développeur Game", "Data Engineer",
  "Développeur Full Stack Senior", "Ingénieur QA", "Développeur IoT", "Analyste Business Intelligence", "Développeur React",
  "DevOps Engineer", "Data Analyst", "Product Owner", "Frontend Developer", "Backend Developer", "UX Designer",
  "Mobile Developer", "Security Engineer", "AI Engineer", "Développeur Full Stack Senior", "Data Scientist",
  "DevOps Architect", "Frontend Lead", "Backend Developer", "UX/UI Designer", "Machine Learning Engineer",
  "Mobile App Developer", "Cloud Security Engineer", "Product Manager", "Développeur Web", "Data Analyst",
  "DevOps Engineer", "Graphic Designer", "QA Engineer", "Business Analyst", "Community Manager", "Junior Developer",
  "System Administrator", "Marketing Digital", "Software Engineer", "Technical Lead", "Scrum Master",
  "Business Intelligence Analyst", "Cloud Engineer", "Database Administrator", "Network Security Engineer",
  "Application Developer", "Integration Engineer", "Platform Engineer", "Site Reliability Engineer",
  "Machine Learning Specialist", "Computer Vision Engineer", "NLP Engineer", "Robotics Engineer",
  "Quantum Computing Engineer", "Edge Computing Engineer", "5G Network Engineer", "AR/VR Developer",
  "Gaming Engineer", "FinTech Developer", "HealthTech Engineer", "EdTech Developer", "GreenTech Engineer",
  "Smart City Engineer", "Autonomous Vehicle Engineer", "Drone Engineer", "Satellite Engineer",
  "Space Technology Engineer", "Nuclear Engineer", "Biomedical Engineer", "Chemical Engineer",
  "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Aerospace Engineer",
  "Marine Engineer", "Petroleum Engineer", "Mining Engineer", "Agricultural Engineer",
  "Environmental Engineer", "Industrial Engineer", "Materials Engineer", "Nanotechnology Engineer",
  "Photonics Engineer", "Acoustics Engineer", "Thermal Engineer", "Fluid Dynamics Engineer",
  "Structural Engineer", "Geotechnical Engineer", "Transportation Engineer", "Water Resources Engineer",
  "Energy Engineer", "Renewable Energy Engineer", "Nuclear Fusion Engineer", "Solar Energy Engineer",
  "Wind Energy Engineer", "Hydroelectric Engineer", "Geothermal Engineer", "Biomass Engineer",
  "Hydrogen Engineer", "Battery Engineer", "Fuel Cell Engineer", "Smart Grid Engineer",
  "Energy Storage Engineer", "Carbon Capture Engineer", "Climate Engineer", "Sustainability Engineer"
];

const locations = [
  "Paris", "Lyon", "Marseille", "Toulouse", "Nantes", "Bordeaux", "Strasbourg", "Angers", "Rennes", "Lille",
  "Nice", "Montpellier", "Grenoble", "Dijon", "Tours", "Reims", "Saint-Étienne", "Le Havre", "Toulon", "Amiens",
  "Limoges", "Clermont-Ferrand", "Villeurbanne", "Le Mans", "Aix-en-Provence", "Brest", "Nîmes", "Tours", "Annecy",
  "Perpignan", "Orléans", "Metz", "Besançon", "Boulogne-Billancourt", "Mulhouse", "Rouen", "Saint-Denis", "Argenteuil",
  "Montreuil", "Saint-Paul", "Avignon", "Nancy", "Vitry-sur-Seine", "Créteil", "Dunkerque", "Poitiers", "Asnières-sur-Seine",
  "Courbevoie", "Versailles", "Colombes", "Aulnay-sous-Bois", "Rueil-Malmaison", "Antibes", "Saint-Maur-des-Fossés",
  "Calais", "Champigny-sur-Marne", "Saint-Pierre", "Aubervilliers", "Béziers", "Bourges", "Cannes", "Le Tampon",
  "Dunkerque", "Saint-Nazaire", "Colmar", "Valence", "Quimper", "Drancy", "Noisy-le-Grand", "La Seyne-sur-Mer",
  "Villeneuve-d'Ascq", "Hyères", "Sarcelles", "Garges-lès-Gonesse", "Saint-Ouen", "Lorient", "Beauvais", "Chambéry",
  "Villejuif", "Saint-André", "Rezé", "Cholet", "Pantin", "Bondy", "Vénissieux", "Clichy", "Ivry-sur-Seine",
  "Saint-Quentin", "Montauban", "Sarcelles", "Niort", "Villefranche-sur-Saône", "Ajaccio", "Saint-Louis", "Le Lamentin",
  "Papeete", "Cayenne", "Saint-Denis", "Fort-de-France", "Saint-Pierre", "Basse-Terre", "Saint-Barthélemy", "Saint-Martin"
];

const skills = [
  "React", "Node.js", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Terraform", "Python", "Machine Learning", "SQL",
  "TensorFlow", "Azure", "Microservices", "TypeScript", "CSS", "GraphQL", "Agile", "Product Strategy", "User Research",
  "Analytics", "Java", "Spring Boot", "Redis", "Figma", "Adobe Creative Suite", "Swift", "Kotlin", "Flutter", "React Native",
  "Unity", "Unreal Engine", "C#", "C++", "Blockchain", "Solidity", "Ethereum", "Bitcoin", "Network Security", "Firewall",
  "VPN", "Penetration Testing", "Vulnerability Assessment", "Incident Response", "Forensics", "Compliance", "GDPR", "ISO 27001",
  "NIST", "OWASP", "Threat Intelligence", "SIEM", "EDR", "XDR", "Zero Trust", "Identity Management", "Access Control",
  "Encryption", "Cryptography", "PKI", "SSL/TLS", "SSH", "LDAP", "Active Directory", "SAML", "OAuth", "OIDC",
  "JWT", "API Security", "Web Security", "Mobile Security", "IoT Security", "Cloud Security", "DevSecOps", "SAST", "DAST",
  "SCA", "Container Security", "Kubernetes Security", "Serverless Security", "Edge Security", "5G Security", "AI Security",
  "ML Security", "Quantum Security", "Post-Quantum Cryptography", "Homomorphic Encryption", "Differential Privacy",
  "Federated Learning", "Secure Multi-Party Computation", "Zero-Knowledge Proofs", "Blockchain Security", "Smart Contract Security",
  "DeFi Security", "NFT Security", "Metaverse Security", "AR/VR Security", "Gaming Security", "FinTech Security",
  "HealthTech Security", "EdTech Security", "GreenTech Security", "Smart City Security", "Autonomous Vehicle Security",
  "Drone Security", "Satellite Security", "Space Security", "Nuclear Security", "Biomedical Security", "Chemical Security",
  "Civil Security", "Mechanical Security", "Electrical Security", "Aerospace Security", "Marine Security", "Petroleum Security",
  "Mining Security", "Agricultural Security", "Environmental Security", "Industrial Security", "Materials Security",
  "Nanotechnology Security", "Photonics Security", "Acoustics Security", "Thermal Security", "Fluid Dynamics Security",
  "Structural Security", "Geotechnical Security", "Transportation Security", "Water Resources Security", "Energy Security",
  "Renewable Energy Security", "Nuclear Fusion Security", "Solar Energy Security", "Wind Energy Security", "Hydroelectric Security",
  "Geothermal Security", "Biomass Security", "Hydrogen Security", "Battery Security", "Fuel Cell Security", "Smart Grid Security",
  "Energy Storage Security", "Carbon Capture Security", "Climate Security", "Sustainability Security"
];

const contractTypes = ["CDI", "CDD", "Freelance", "Stage", "Alternance", "Intérim"];
const sources = ["LinkedIn", "Indeed", "Glassdoor", "Apec", "Pôle Emploi", "Welcome to the Jungle", "Hired", "AngelList"];
const salaryRanges = ["30k-45k€", "35k-50k€", "40k-55k€", "45k-65k€", "50k-70k€", "55k-75k€", "60k-80k€", "65k-85k€", "70k-90k€", "75k-95k€", "80k-100k€"];

// Fonction pour générer un job aléatoire
function generateRandomJob(id) {
  const title = titles[Math.floor(Math.random() * titles.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const type = contractTypes[Math.floor(Math.random() * contractTypes.length)];
  const salary = salaryRanges[Math.floor(Math.random() * salaryRanges.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const remote = Math.random() > 0.5;
  
  // Générer des compétences aléatoires (2-6 compétences)
  const numSkills = Math.floor(Math.random() * 5) + 2;
  const jobSkills = [];
  for (let i = 0; i < numSkills; i++) {
    const skill = skills[Math.floor(Math.random() * skills.length)];
    if (!jobSkills.includes(skill)) {
      jobSkills.push(skill);
    }
  }
  
  // Générer une date aléatoire dans les 30 derniers jours
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const postedDate = date.toISOString().split('T')[0];
  
  return {
    id: id,
    title: title,
    company: company,
    location: location,
    type: type,
    salary: salary,
    description: `Nous recherchons un ${title.toLowerCase()} pour rejoindre notre équipe ${company}. Cette opportunité offre un environnement de travail dynamique et innovant.`,
    skills: jobSkills,
    postedDate: postedDate,
    remote: remote,
    source: source
  };
}

// Générer 950 jobs supplémentaires
const additionalJobs = [];
for (let i = 51; i <= 1000; i++) {
  additionalJobs.push(generateRandomJob(i));
}

// Afficher les statistiques
console.log(`✅ Généré ${additionalJobs.length} jobs supplémentaires`);
console.log(`📊 Total: ${additionalJobs.length + 50} jobs`);

// Sauvegarder dans un fichier temporaire
const jobsData = JSON.stringify(additionalJobs, null, 2);
fs.writeFileSync('additional_jobs.json', jobsData);
console.log('💾 Jobs sauvegardés dans additional_jobs.json');

// Afficher quelques exemples
console.log('\n📋 Exemples de jobs générés:');
additionalJobs.slice(0, 3).forEach(job => {
  console.log(`- ${job.title} chez ${job.company} (${job.location}) - ${job.salary}`);
});

console.log('\n🚀 Prêt à intégrer dans app/api/jobs/route.js !'); 