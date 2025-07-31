const { Pool } = require('pg');

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'jobscraper',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

// Données réalistes pour les offres d'emploi
const realisticJobs = [
  {
    title: 'Développeur Full Stack React/Node.js',
    company: 'TechCorp',
    location: 'Paris',
    description: 'Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe de développement. Vous travaillerez sur des applications web modernes utilisant React et Node.js.',
    salary: '50k-70k',
    contract_type: 'CDI',
    source: 'linkedin',
    url: 'https://www.linkedin.com/jobs/view/123456',
    remote: false,
    skills: 'React,Node.js,JavaScript,PostgreSQL,MongoDB,TypeScript'
  },
  {
    title: 'Développeur Python Django',
    company: 'StartupXYZ',
    location: 'Angers',
    description: 'Développeur Python pour une startup innovante dans le domaine de l\'e-commerce. Vous participerez au développement de notre plateforme web.',
    salary: '40k-60k',
    contract_type: 'CDI',
    source: 'indeed',
    url: 'https://fr.indeed.com/viewjob?jk=789012',
    remote: true,
    skills: 'Python,Django,PostgreSQL,AWS,Docker,Redis'
  },
  {
    title: 'Ingénieur DevOps',
    company: 'BigTech',
    location: 'Paris',
    description: 'Ingénieur DevOps pour infrastructure cloud. Vous serez responsable de l\'automatisation et de l\'optimisation de nos environnements de production.',
    salary: '60k-80k',
    contract_type: 'CDI',
    source: 'glassdoor',
    url: 'https://www.glassdoor.fr/Job/345678',
    remote: false,
    skills: 'Docker,Kubernetes,AWS,Linux,Terraform,Ansible'
  },
  {
    title: 'Développeur Frontend React',
    company: 'WebAgency',
    location: 'Lyon',
    description: 'Développeur frontend pour applications web modernes. Vous créerez des interfaces utilisateur performantes et accessibles.',
    salary: '45k-65k',
    contract_type: 'CDI',
    source: 'apec',
    url: 'https://www.apec.fr/candidat/recherche-emploi/456789',
    remote: false,
    skills: 'React,TypeScript,CSS,HTML,Redux,Webpack'
  },
  {
    title: 'Data Scientist',
    company: 'AIStartup',
    location: 'Paris',
    description: 'Data scientist pour projets d\'IA. Vous développerez des modèles de machine learning pour résoudre des problèmes business complexes.',
    salary: '55k-75k',
    contract_type: 'CDI',
    source: 'welcometothejungle',
    url: 'https://www.welcometothejungle.com/fr/companies/567890',
    remote: true,
    skills: 'Python,SQL,Machine Learning,TensorFlow,Pandas,Scikit-learn'
  },
  {
    title: 'Développeur Mobile Flutter',
    company: 'AppStudio',
    location: 'Marseille',
    description: 'Développeur mobile cross-platform. Vous créerez des applications mobiles performantes pour iOS et Android.',
    salary: '40k-60k',
    contract_type: 'CDI',
    source: 'pole-emploi',
    url: 'https://candidat.pole-emploi.fr/offres/recherche/678901',
    remote: false,
    skills: 'Flutter,Dart,Firebase,Android,iOS,Git'
  },
  {
    title: 'Chef de Projet IT',
    company: 'ConsultingCorp',
    location: 'Paris',
    description: 'Chef de projet pour transformation digitale. Vous piloterez des projets informatiques complexes pour nos clients.',
    salary: '65k-85k',
    contract_type: 'CDI',
    source: 'linkedin',
    url: 'https://www.linkedin.com/jobs/view/789012',
    remote: false,
    skills: 'Gestion de projet,Agile,Scrum,IT,Communication,Leadership'
  },
  {
    title: 'Développeur Backend Java',
    company: 'BankTech',
    location: 'Nantes',
    description: 'Développeur backend pour applications bancaires. Vous développerez des systèmes critiques pour le secteur financier.',
    salary: '50k-70k',
    contract_type: 'CDI',
    source: 'indeed',
    url: 'https://fr.indeed.com/viewjob?jk=890123',
    remote: false,
    skills: 'Java,Spring,Hibernate,Oracle,Microservices,Maven'
  },
  {
    title: 'Développeur Full Stack PHP/Symfony',
    company: 'DigitalAgency',
    location: 'Bordeaux',
    description: 'Développeur full stack PHP pour agence digitale. Vous créerez des sites web et applications sur mesure.',
    salary: '35k-55k',
    contract_type: 'CDI',
    source: 'apec',
    url: 'https://www.apec.fr/candidat/recherche-emploi/901234',
    remote: true,
    skills: 'PHP,Symfony,MySQL,JavaScript,Vue.js,Composer'
  },
  {
    title: 'Ingénieur Cloud AWS',
    company: 'CloudTech',
    location: 'Toulouse',
    description: 'Ingénieur cloud spécialisé AWS. Vous optimiserez nos infrastructures cloud et assurerez leur sécurité.',
    salary: '55k-75k',
    contract_type: 'CDI',
    source: 'glassdoor',
    url: 'https://www.glassdoor.fr/Job/012345',
    remote: true,
    skills: 'AWS,CloudFormation,EC2,S3,Lambda,CloudWatch'
  },
  {
    title: 'Développeur Frontend Vue.js',
    company: 'EcommerceCorp',
    location: 'Lille',
    description: 'Développeur frontend Vue.js pour plateforme e-commerce. Vous améliorerez l\'expérience utilisateur de nos clients.',
    salary: '40k-60k',
    contract_type: 'CDI',
    source: 'welcometothejungle',
    url: 'https://www.welcometothejungle.com/fr/companies/123456',
    remote: false,
    skills: 'Vue.js,JavaScript,CSS,HTML,Pinia,Vite'
  },
  {
    title: 'Data Engineer',
    company: 'DataCorp',
    location: 'Strasbourg',
    description: 'Data Engineer pour construire des pipelines de données. Vous développerez des solutions d\'ETL et de data warehousing.',
    salary: '50k-70k',
    contract_type: 'CDI',
    source: 'linkedin',
    url: 'https://www.linkedin.com/jobs/view/234567',
    remote: true,
    skills: 'Python,Apache Spark,Kafka,PostgreSQL,Airflow,Docker'
  }
];

async function generateRealisticTestData() {
  try {
    console.log('🚀 Génération de données de test réalistes...\n');

    // Vider la table jobs
    console.log('🧹 Nettoyage de la table jobs...');
    await pool.query('DELETE FROM jobs');
    console.log('✅ Table jobs vidée\n');

    console.log(`📝 Insertion de ${realisticJobs.length} offres réalistes...`);

    for (const job of realisticJobs) {
      const query = `
        INSERT INTO jobs (
          title, company, location, description, salary, contract_type, 
          source, url, posted_date, remote, skills
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      await pool.query(query, [
        job.title,
        job.company,
        job.location,
        job.description,
        job.salary,
        job.contract_type,
        job.source,
        job.url,
        new Date(),
        job.remote,
        job.skills
      ]);
    }

    // Vérifier le nombre d'offres
    const result = await pool.query('SELECT COUNT(*) FROM jobs');
    console.log(`✅ ${result.rows[0].count} offres insérées avec succès`);

    // Afficher quelques statistiques
    const stats = await pool.query(`
      SELECT 
        source,
        COUNT(*) as count,
        COUNT(CASE WHEN remote = true THEN 1 END) as remote_count
      FROM jobs 
      GROUP BY source 
      ORDER BY count DESC
    `);

    console.log('\n📊 Statistiques par source:');
    stats.rows.forEach(row => {
      console.log(`   - ${row.source}: ${row.count} offres (${row.remote_count} télétravail)`);
    });

    console.log('\n🎉 Données de test réalistes générées avec succès !');
    console.log('✅ Vous pouvez maintenant tester l\'API avec des données plus réalistes');

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
  } finally {
    await pool.end();
  }
}

generateRealisticTestData(); 