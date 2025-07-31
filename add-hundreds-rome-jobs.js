const fs = require('fs');

// Métiers ROME supplémentaires (86 métiers)
const additionalRomeJobs = {
  "M1805": {
    "title": "Études et développement informatique",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "APIs REST et GraphQL", "Frameworks backend", "Frameworks frontend", "Tests unitaires", "Git et gestion de versions", "CI/CD et DevOps", "Cloud computing"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Apprentissage continu", "Attention aux détails"],
      "outils": ["Visual Studio Code", "Git", "Docker", "PostgreSQL", "MongoDB", "AWS", "Azure"]
    }
  },
  "M1806": {
    "title": "Expert en cybersécurité",
    "skills": {
      "techniques": ["Cybersécurité", "Sécurité informatique", "Sécurité des données", "Compliance RGPD", "Audit interne", "Monitoring et supervision", "Disaster recovery"],
      "soft_skills": ["Vigilance", "Éthique", "Communication de crise", "Gestion de la sécurité"],
      "outils": ["Wireshark", "Nmap", "Metasploit", "SIEM", "Firewall"]
    }
  },
  "M1807": {
    "title": "Architecte de solutions cloud",
    "skills": {
      "techniques": ["Cloud computing", "Architecture logicielle", "Microservices", "Conteneurisation", "High availability", "Data migration", "Performance tuning"],
      "soft_skills": ["Vision stratégique", "Leadership technique", "Gestion de projet"],
      "outils": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform"]
    }
  },
  "M1808": {
    "title": "Data Scientist",
    "skills": {
      "techniques": ["Big Data et analytics", "Intelligence artificielle et machine learning", "Data governance", "Data warehousing", "ETL et data pipelines", "Modélisation de données", "SQL avancé"],
      "soft_skills": ["Analyse critique", "Curiosité", "Communication", "Storytelling"],
      "outils": ["Python", "R", "TensorFlow", "PyTorch", "Hadoop", "Spark", "Jupyter"]
    }
  },
  "M1809": {
    "title": "DevOps Engineer",
    "skills": {
      "techniques": ["CI/CD et DevOps", "Automatisation", "Conteneurisation", "Monitoring et supervision", "High availability", "Disaster recovery", "Performance tuning"],
      "soft_skills": ["Collaboration", "Résolution de problèmes", "Amélioration continue"],
      "outils": ["Jenkins", "GitLab CI", "Docker", "Kubernetes", "Ansible", "Terraform"]
    }
  },
  "M1810": {
    "title": "Product Manager",
    "skills": {
      "techniques": ["Gestion de projet", "Analyse des besoins clients", "A/B testing", "KPI et tableaux de bord", "ROI et KPIs"],
      "soft_skills": ["Leadership", "Communication", "Empathie", "Vision produit", "Négociation"],
      "outils": ["Jira", "Confluence", "Figma", "Mixpanel", "Google Analytics"]
    }
  },
  "M1811": {
    "title": "UX/UI Designer",
    "skills": {
      "techniques": ["Développement web", "A/B testing", "Personnalisation", "Création de supports"],
      "soft_skills": ["Empathie", "Créativité", "Communication", "Attention aux détails"],
      "outils": ["Figma", "Sketch", "Adobe XD", "InVision", "Principle"]
    }
  },
  "M1812": {
    "title": "Scrum Master",
    "skills": {
      "techniques": ["Gestion de projet", "Gestion des délais", "KPI et tableaux de bord"],
      "soft_skills": ["Leadership", "Facilitation", "Communication", "Gestion de groupe", "Résolution de conflits"],
      "outils": ["Jira", "Confluence", "Miro", "Trello", "Slack"]
    }
  },
  "M1813": {
    "title": "Business Analyst",
    "skills": {
      "techniques": ["Analyse des besoins clients", "Analyse de marché", "Analyse financière", "Business Intelligence", "Reporting", "Modélisation de données"],
      "soft_skills": ["Communication", "Analyse critique", "Gestion des clients", "Négociation"],
      "outils": ["Excel", "Power BI", "Tableau", "SQL", "Jira"]
    }
  },
  "M1814": {
    "title": "Chef de projet digital",
    "skills": {
      "techniques": ["Gestion de projet", "Marketing digital", "Développement web", "SEO/SEM", "Email marketing", "KPI et tableaux de bord"],
      "soft_skills": ["Leadership", "Communication", "Gestion d'équipe", "Gestion des délais"],
      "outils": ["Asana", "Trello", "Google Analytics", "Google Ads", "Mailchimp"]
    }
  },
  "M1815": {
    "title": "Responsable marketing",
    "skills": {
      "techniques": ["Marketing digital", "Stratégie marketing", "Marketing de contenu", "Email marketing", "SEO/SEM", "Publicité", "ROI et KPIs"],
      "soft_skills": ["Créativité", "Communication", "Leadership", "Gestion d'équipe"],
      "outils": ["Google Analytics", "Google Ads", "Facebook Ads", "Mailchimp", "HubSpot"]
    }
  },
  "M1816": {
    "title": "Community Manager",
    "skills": {
      "techniques": ["Gestion de communauté", "Gestion des réseaux sociaux", "Marketing de contenu", "Rédaction de contenus", "Email marketing"],
      "soft_skills": ["Communication", "Créativité", "Empathie", "Gestion de crise"],
      "outils": ["Hootsuite", "Buffer", "Canva", "Mailchimp", "Facebook", "Instagram"]
    }
  },
  "M1817": {
    "title": "Influenceur digital",
    "skills": {
      "techniques": ["Marketing d'influence", "Influence marketing", "Gestion des réseaux sociaux", "Rédaction de contenus", "Branding"],
      "soft_skills": ["Créativité", "Communication", "Empathie", "Authenticité"],
      "outils": ["Instagram", "TikTok", "YouTube", "Canva", "Lightroom"]
    }
  },
  "M1818": {
    "title": "Content Manager",
    "skills": {
      "techniques": ["Marketing de contenu", "Rédaction de contenus", "SEO/SEM", "Branding", "Création de supports"],
      "soft_skills": ["Créativité", "Communication", "Attention aux détails", "Gestion de la documentation"],
      "outils": ["WordPress", "Canva", "Grammarly", "Google Analytics", "Ahrefs"]
    }
  },
  "M1819": {
    "title": "Growth Hacker",
    "skills": {
      "techniques": ["Marketing digital", "A/B testing", "SEO/SEM", "Email marketing", "Marketing automation", "ROI et KPIs"],
      "soft_skills": ["Créativité", "Analytique", "Expérimentation", "Résolution de problèmes"],
      "outils": ["Google Analytics", "Hotjar", "Optimizely", "Mailchimp", "Zapier"]
    }
  },
  "M1820": {
    "title": "Responsable commercial",
    "skills": {
      "techniques": ["Animation commerciale", "Prospection commerciale", "Négociation commerciale", "Gestion des clients", "Suivi des ventes", "Reporting commercial"],
      "soft_skills": ["Communication", "Leadership", "Gestion d'équipe", "Négociation"],
      "outils": ["CRM", "Salesforce", "HubSpot", "Excel", "PowerPoint"]
    }
  },
  "M1821": {
    "title": "Chargé de clientèle",
    "skills": {
      "techniques": ["Gestion des clients", "Gestion de portefeuille clients", "Suivi des ventes", "Reporting commercial"],
      "soft_skills": ["Communication", "Empathie", "Résolution de problèmes", "Service client"],
      "outils": ["CRM", "Excel", "Outlook", "Teams"]
    }
  },
  "M1822": {
    "title": "Business Developer",
    "skills": {
      "techniques": ["Développement de nouveaux marchés", "Partenariats", "Gestion des partenariats", "Prospection commerciale", "Négociation commerciale"],
      "soft_skills": ["Communication", "Négociation", "Réseautage", "Vision stratégique"],
      "outils": ["LinkedIn", "CRM", "Excel", "PowerPoint"]
    }
  },
  "M1823": {
    "title": "Responsable événementiel",
    "skills": {
      "techniques": ["Événementiel", "Événementiel commercial", "Gestion de projet", "Gestion des événements", "Création de supports"],
      "soft_skills": ["Organisation", "Communication", "Gestion de crise", "Créativité"],
      "outils": ["Eventbrite", "Canva", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1824": {
    "title": "Responsable communication",
    "skills": {
      "techniques": ["Communication digitale", "Stratégie de communication", "Communication de crise", "Relations presse", "Branding"],
      "soft_skills": ["Communication", "Créativité", "Gestion de crise", "Leadership"],
      "outils": ["Canva", "Mailchimp", "Hootsuite", "Cision", "Meltwater"]
    }
  },
  "M1825": {
    "title": "Responsable RH",
    "skills": {
      "techniques": ["Recrutement et sélection", "Gestion des carrières", "Gestion des formations", "Reporting RH", "Gestion de la paie"],
      "soft_skills": ["Empathie", "Communication", "Confidentialité", "Leadership"],
      "outils": ["SIRH", "LinkedIn Recruiter", "Indeed", "Excel", "PowerPoint"]
    }
  },
  "M1826": {
    "title": "Recruteur",
    "skills": {
      "techniques": ["Recrutement et sélection", "Sourcing de candidats", "Conduite d'entretiens", "Gestion des candidatures"],
      "soft_skills": ["Communication", "Empathie", "Évaluation des compétences", "Service client"],
      "outils": ["LinkedIn Recruiter", "Indeed", "ATS", "Teams", "Zoom"]
    }
  },
  "M1827": {
    "title": "Formateur",
    "skills": {
      "techniques": ["Formation", "Formation clients", "Formation en présentiel", "Formation hybride", "Formation à distance", "Conception pédagogique", "Animation de formation"],
      "soft_skills": ["Communication", "Patience", "Empathie", "Gestion de groupe"],
      "outils": ["PowerPoint", "Teams", "Zoom", "Moodle", "Canva"]
    }
  },
  "M1828": {
    "title": "Responsable formation",
    "skills": {
      "techniques": ["Gestion des formations", "Conception pédagogique", "Innovation pédagogique", "Reporting formation", "Veille pédagogique"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Gestion de projet"],
      "outils": ["LMS", "Excel", "PowerPoint", "Teams", "Moodle"]
    }
  },
  "M1829": {
    "title": "Responsable qualité",
    "skills": {
      "techniques": ["Gestion de la qualité", "Qualité des produits", "Audit interne", "Compliance", "Optimisation des processus"],
      "soft_skills": ["Attention aux détails", "Rigueur", "Communication", "Leadership"],
      "outils": ["Excel", "PowerPoint", "Outils de gestion qualité", "Teams"]
    }
  },
  "M1830": {
    "title": "Responsable logistique",
    "skills": {
      "techniques": ["Logistique", "Gestion logistique", "Planification logistique", "Gestion des entrepôts", "Gestion des transports", "Supply chain management", "Reporting logistique"],
      "soft_skills": ["Organisation", "Gestion de crise", "Leadership", "Optimisation"],
      "outils": ["WMS", "TMS", "Excel", "PowerPoint", "ERP"]
    }
  },
  "M1831": {
    "title": "Responsable achats",
    "skills": {
      "techniques": ["Gestion des achats", "Contrats d'achat", "Gestion des fournisseurs", "Planification des approvisionnements", "Optimisation des coûts"],
      "soft_skills": ["Négociation", "Communication", "Leadership", "Analyse"],
      "outils": ["ERP", "Excel", "PowerPoint", "Teams", "Outils d'achat"]
    }
  },
  "M1832": {
    "title": "Responsable production",
    "skills": {
      "techniques": ["Gestion de production", "Industrialisation", "Gestion de la maintenance", "Optimisation des flux", "Capacity planning"],
      "soft_skills": ["Leadership", "Gestion d'équipe", "Résolution de problèmes", "Organisation"],
      "outils": ["ERP", "MES", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1833": {
    "title": "Responsable innovation",
    "skills": {
      "techniques": ["Innovation", "Veille technologique", "Veille économique", "Recherche", "Développement durable"],
      "soft_skills": ["Créativité", "Vision stratégique", "Leadership", "Curiosité"],
      "outils": ["Outils de veille", "Excel", "PowerPoint", "Teams", "LinkedIn"]
    }
  },
  "M1834": {
    "title": "Responsable R&D",
    "skills": {
      "techniques": ["Recherche", "Innovation", "Veille technologique", "Veille économique", "Développement durable"],
      "soft_skills": ["Curiosité", "Analytique", "Leadership", "Vision stratégique"],
      "outils": ["Outils de recherche", "Excel", "PowerPoint", "Teams", "LinkedIn"]
    }
  },
  "M1835": {
    "title": "Responsable financier",
    "skills": {
      "techniques": ["Analyse financière", "Contrôle de gestion", "Budgeting et forecasting", "Reporting financier", "Gestion de la trésorerie", "Consolidation"],
      "soft_skills": ["Rigueur", "Analytique", "Leadership", "Confidentialité"],
      "outils": ["Excel", "PowerPoint", "ERP", "Outils financiers", "Teams"]
    }
  },
  "M1836": {
    "title": "Comptable",
    "skills": {
      "techniques": ["Comptabilité générale", "Comptabilité analytique", "Clôture comptable", "Fiscalité", "Audit comptable"],
      "soft_skills": ["Rigueur", "Attention aux détails", "Confidentialité", "Organisation"],
      "outils": ["Excel", "Logiciels comptables", "ERP", "Teams"]
    }
  },
  "M1837": {
    "title": "Auditeur",
    "skills": {
      "techniques": ["Audit comptable", "Audit interne", "Compliance et audit", "Veille réglementaire", "Contrôle de gestion"],
      "soft_skills": ["Rigueur", "Analytique", "Indépendance", "Communication"],
      "outils": ["Excel", "PowerPoint", "Outils d'audit", "Teams"]
    }
  },
  "M1838": {
    "title": "Responsable juridique",
    "skills": {
      "techniques": ["Droit du travail", "Convention collective", "Gestion des litiges", "Compliance", "Veille réglementaire"],
      "soft_skills": ["Analytique", "Communication", "Confidentialité", "Leadership"],
      "outils": ["Outils juridiques", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1839": {
    "title": "Responsable sécurité",
    "skills": {
      "techniques": ["Gestion de la sécurité", "Sécurité informatique", "Sécurité des données", "Compliance RGPD", "Gestion des incidents"],
      "soft_skills": ["Vigilance", "Leadership", "Gestion de crise", "Communication"],
      "outils": ["Outils de sécurité", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1840": {
    "title": "Responsable environnement",
    "skills": {
      "techniques": ["Gestion de l'environnement", "Développement durable", "Veille réglementaire", "Compliance", "Optimisation des processus"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Responsabilité"],
      "outils": ["Outils environnementaux", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1841": {
    "title": "Responsable santé et sécurité",
    "skills": {
      "techniques": ["Prévention", "Gestion des incidents", "Compliance", "Veille réglementaire", "Formation"],
      "soft_skills": ["Leadership", "Communication", "Vigilance", "Empathie"],
      "outils": ["Outils HSE", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1842": {
    "title": "Responsable maintenance",
    "skills": {
      "techniques": ["Gestion de la maintenance", "Troubleshooting", "Optimisation des performances", "Gestion des incidents", "Capacity planning"],
      "soft_skills": ["Résolution de problèmes", "Organisation", "Leadership", "Gestion d'équipe"],
      "outils": ["CMMS", "Excel", "PowerPoint", "Teams", "Outils de maintenance"]
    }
  },
  "M1843": {
    "title": "Responsable IT",
    "skills": {
      "techniques": ["Gestion des systèmes d'information", "Administration système", "Gestion des réseaux", "Gestion des identités", "Gestion des licences"],
      "soft_skills": ["Leadership", "Communication", "Gestion d'équipe", "Résolution de problèmes"],
      "outils": ["Outils IT", "Excel", "PowerPoint", "Teams", "Jira"]
    }
  },
  "M1844": {
    "title": "Responsable support",
    "skills": {
      "techniques": ["Gestion des incidents", "Troubleshooting", "Gestion des services", "Gestion des urgences", "Documentation technique"],
      "soft_skills": ["Service client", "Communication", "Patience", "Résolution de problèmes"],
      "outils": ["Outils de support", "Excel", "Teams", "Jira", "Confluence"]
    }
  },
  "M1845": {
    "title": "Responsable données",
    "skills": {
      "techniques": ["Gestion des données", "Gestion des données personnelles", "Data governance", "Data migration", "Sauvegarde et récupération"],
      "soft_skills": ["Leadership", "Communication", "Confidentialité", "Organisation"],
      "outils": ["Outils de gestion de données", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1846": {
    "title": "Responsable performance",
    "skills": {
      "techniques": ["Gestion de la performance", "KPI et tableaux de bord", "Optimisation des performances", "Performance tuning", "Reporting"],
      "soft_skills": ["Leadership", "Analytique", "Communication", "Gestion d'équipe"],
      "outils": ["Outils de performance", "Excel", "PowerPoint", "Teams", "Tableau"]
    }
  },
  "M1847": {
    "title": "Responsable mobilité",
    "skills": {
      "techniques": ["Gestion des mobilités", "Gestion des carrières", "Gestion des changements", "Formation", "Gestion des équipes"],
      "soft_skills": ["Empathie", "Communication", "Leadership", "Gestion du changement"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1848": {
    "title": "Responsable avantages sociaux",
    "skills": {
      "techniques": ["Gestion des avantages sociaux", "Gestion de la paie", "Gestion des congés", "Gestion des absences", "Reporting RH"],
      "soft_skills": ["Empathie", "Communication", "Confidentialité", "Service client"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1849": {
    "title": "Responsable paie",
    "skills": {
      "techniques": ["Gestion de la paie", "Gestion des prélèvements", "Fiscalité", "Convention collective", "Reporting RH"],
      "soft_skills": ["Rigueur", "Confidentialité", "Attention aux détails", "Service client"],
      "outils": ["Logiciels de paie", "Excel", "Teams", "SIRH"]
    }
  },
  "M1850": {
    "title": "Responsable recrutement",
    "skills": {
      "techniques": ["Recrutement et sélection", "Sourcing de candidats", "Gestion des candidatures", "Employer branding", "Reporting RH"],
      "soft_skills": ["Communication", "Empathie", "Leadership", "Service client"],
      "outils": ["ATS", "LinkedIn Recruiter", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1851": {
    "title": "Responsable formation continue",
    "skills": {
      "techniques": ["Gestion des formations", "Formation continue", "Conception pédagogique", "Innovation pédagogique", "Reporting formation"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Empathie"],
      "outils": ["LMS", "Excel", "PowerPoint", "Teams", "Moodle"]
    }
  },
  "M1852": {
    "title": "Responsable certification",
    "skills": {
      "techniques": ["Gestion des certifications", "Formation", "Compliance", "Veille réglementaire", "Reporting formation"],
      "soft_skills": ["Leadership", "Communication", "Organisation", "Service client"],
      "outils": ["LMS", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1853": {
    "title": "Responsable évaluation",
    "skills": {
      "techniques": ["Gestion des évaluations", "Évaluation des compétences", "Gestion de la performance", "Reporting RH"],
      "soft_skills": ["Empathie", "Communication", "Objectivité", "Leadership"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1854": {
    "title": "Responsable mobilité internationale",
    "skills": {
      "techniques": ["Gestion des mobilités", "Gestion des expatriations", "Gestion des visas", "Compliance", "Reporting RH"],
      "soft_skills": ["Communication", "Empathie", "Leadership", "Gestion interculturelle"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1855": {
    "title": "Responsable diversité et inclusion",
    "skills": {
      "techniques": ["Gestion des équipes", "Employer branding", "Communication", "Formation", "Reporting RH"],
      "soft_skills": ["Empathie", "Leadership", "Communication", "Sensibilité culturelle"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1856": {
    "title": "Responsable bien-être au travail",
    "skills": {
      "techniques": ["Gestion de la douleur", "Prévention", "Formation", "Gestion des incidents", "Reporting RH"],
      "soft_skills": ["Empathie", "Communication", "Leadership", "Bienveillance"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1857": {
    "title": "Responsable relations sociales",
    "skills": {
      "techniques": ["Droit du travail", "Convention collective", "Gestion des litiges", "Communication", "Reporting RH"],
      "soft_skills": ["Communication", "Négociation", "Leadership", "Empathie"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1858": {
    "title": "Responsable rémunération",
    "skills": {
      "techniques": ["Gestion de la paie", "Gestion des avantages sociaux", "Benchmarking", "Analyse financière", "Reporting RH"],
      "soft_skills": ["Confidentialité", "Analytique", "Leadership", "Communication"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1859": {
    "title": "Responsable planification",
    "skills": {
      "techniques": ["Capacity planning", "Planification logistique", "Planification des approvisionnements", "Gestion de projet", "Reporting"],
      "soft_skills": ["Organisation", "Analytique", "Leadership", "Communication"],
      "outils": ["ERP", "Excel", "PowerPoint", "Teams", "Project"]
    }
  },
  "M1860": {
    "title": "Responsable optimisation",
    "skills": {
      "techniques": ["Optimisation des coûts", "Optimisation des flux", "Optimisation des performances", "Optimisation des processus", "Performance tuning"],
      "soft_skills": ["Analytique", "Résolution de problèmes", "Leadership", "Communication"],
      "outils": ["Outils d'optimisation", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1861": {
    "title": "Responsable innovation produit",
    "skills": {
      "techniques": ["Innovation", "Qualité des produits", "Recherche", "Veille technologique", "Veille économique"],
      "soft_skills": ["Créativité", "Vision stratégique", "Leadership", "Curiosité"],
      "outils": ["Outils d'innovation", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1862": {
    "title": "Responsable veille",
    "skills": {
      "techniques": ["Veille technologique", "Veille économique", "Veille marché", "Veille professionnelle", "Veille réglementaire"],
      "soft_skills": ["Curiosité", "Analytique", "Communication", "Organisation"],
      "outils": ["Outils de veille", "Excel", "PowerPoint", "Teams", "LinkedIn"]
    }
  },
  "M1863": {
    "title": "Responsable partenariats",
    "skills": {
      "techniques": ["Partenariats", "Gestion des partenariats", "Développement de nouveaux marchés", "Négociation commerciale", "Reporting commercial"],
      "soft_skills": ["Communication", "Négociation", "Réseautage", "Leadership"],
      "outils": ["CRM", "Excel", "PowerPoint", "Teams", "LinkedIn"]
    }
  },
  "M1864": {
    "title": "Responsable événementiel B2B",
    "skills": {
      "techniques": ["Événementiel", "Événementiel commercial", "Gestion de projet", "Gestion des événements", "Reporting commercial"],
      "soft_skills": ["Organisation", "Communication", "Gestion de crise", "Créativité"],
      "outils": ["Eventbrite", "Excel", "PowerPoint", "Teams", "Canva"]
    }
  },
  "M1865": {
    "title": "Responsable communication interne",
    "skills": {
      "techniques": ["Communication", "Communication digitale", "Gestion des équipes", "Employer branding", "Reporting RH"],
      "soft_skills": ["Communication", "Empathie", "Leadership", "Créativité"],
      "outils": ["Teams", "Canva", "Mailchimp", "Excel", "PowerPoint"]
    }
  },
  "M1866": {
    "title": "Responsable communication externe",
    "skills": {
      "techniques": ["Communication", "Communication digitale", "Relations presse", "Branding", "Reporting"],
      "soft_skills": ["Communication", "Créativité", "Leadership", "Gestion de crise"],
      "outils": ["Canva", "Mailchimp", "Cision", "Excel", "PowerPoint"]
    }
  },
  "M1867": {
    "title": "Responsable médias",
    "skills": {
      "techniques": ["Gestion des médias", "Communication", "Relations presse", "Branding", "Reporting"],
      "soft_skills": ["Communication", "Créativité", "Leadership", "Gestion de crise"],
      "outils": ["Canva", "Cision", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1868": {
    "title": "Responsable réseaux sociaux",
    "skills": {
      "techniques": ["Gestion des réseaux sociaux", "Marketing de contenu", "Rédaction de contenus", "Branding", "Reporting"],
      "soft_skills": ["Communication", "Créativité", "Empathie", "Gestion de crise"],
      "outils": ["Hootsuite", "Canva", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1869": {
    "title": "Responsable contenu",
    "skills": {
      "techniques": ["Marketing de contenu", "Rédaction de contenus", "SEO/SEM", "Branding", "Création de supports"],
      "soft_skills": ["Créativité", "Communication", "Attention aux détails", "Empathie"],
      "outils": ["WordPress", "Canva", "Grammarly", "Excel", "PowerPoint"]
    }
  },
  "M1870": {
    "title": "Responsable SEO",
    "skills": {
      "techniques": ["SEO/SEM", "Marketing de contenu", "Analytics et reporting", "ROI et KPIs", "Veille technologique"],
      "soft_skills": ["Analytique", "Patience", "Communication", "Curiosité"],
      "outils": ["Google Analytics", "Ahrefs", "SEMrush", "Excel", "PowerPoint"]
    }
  },
  "M1871": {
    "title": "Responsable SEM",
    "skills": {
      "techniques": ["SEO/SEM", "Publicité", "ROI et KPIs", "Analytics et reporting", "A/B testing"],
      "soft_skills": ["Analytique", "Communication", "Résolution de problèmes", "Optimisation"],
      "outils": ["Google Ads", "Facebook Ads", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1872": {
    "title": "Responsable publicité",
    "skills": {
      "techniques": ["Publicité", "Marketing digital", "ROI et KPIs", "Analytics et reporting", "A/B testing"],
      "soft_skills": ["Créativité", "Analytique", "Communication", "Optimisation"],
      "outils": ["Google Ads", "Facebook Ads", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1873": {
    "title": "Responsable email marketing",
    "skills": {
      "techniques": ["Email marketing", "Marketing automation", "A/B testing", "ROI et KPIs", "Analytics et reporting"],
      "soft_skills": ["Créativité", "Analytique", "Communication", "Optimisation"],
      "outils": ["Mailchimp", "HubSpot", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1874": {
    "title": "Responsable marketing automation",
    "skills": {
      "techniques": ["Marketing automation", "Email marketing", "A/B testing", "ROI et KPIs", "Analytics et reporting"],
      "soft_skills": ["Analytique", "Communication", "Optimisation", "Résolution de problèmes"],
      "outils": ["HubSpot", "Mailchimp", "Zapier", "Excel", "PowerPoint"]
    }
  },
  "M1875": {
    "title": "Responsable personnalisation",
    "skills": {
      "techniques": ["Personnalisation", "A/B testing", "Analytics et reporting", "ROI et KPIs", "Marketing automation"],
      "soft_skills": ["Analytique", "Empathie", "Communication", "Optimisation"],
      "outils": ["Outils de personnalisation", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1876": {
    "title": "Responsable analytics",
    "skills": {
      "techniques": ["Analytics et reporting", "ROI et KPIs", "KPI et tableaux de bord", "Reporting", "Business Intelligence"],
      "soft_skills": ["Analytique", "Communication", "Attention aux détails", "Résolution de problèmes"],
      "outils": ["Google Analytics", "Power BI", "Tableau", "Excel", "PowerPoint"]
    }
  },
  "M1877": {
    "title": "Responsable reporting",
    "skills": {
      "techniques": ["Reporting", "Reporting commercial", "Reporting financier", "Reporting RH", "Reporting formation", "Reporting logistique", "Reporting projet"],
      "soft_skills": ["Analytique", "Communication", "Attention aux détails", "Organisation"],
      "outils": ["Excel", "Power BI", "Tableau", "PowerPoint", "Teams"]
    }
  },
  "M1878": {
    "title": "Responsable BI",
    "skills": {
      "techniques": ["Business Intelligence", "Data warehousing", "ETL et data pipelines", "Reporting", "KPI et tableaux de bord"],
      "soft_skills": ["Analytique", "Communication", "Leadership", "Résolution de problèmes"],
      "outils": ["Power BI", "Tableau", "SQL", "Excel", "PowerPoint"]
    }
  },
  "M1879": {
    "title": "Responsable data",
    "skills": {
      "techniques": ["Gestion des données", "Data governance", "Data migration", "Data warehousing", "ETL et data pipelines"],
      "soft_skills": ["Leadership", "Communication", "Organisation", "Résolution de problèmes"],
      "outils": ["Outils de gestion de données", "SQL", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1880": {
    "title": "Responsable IA",
    "skills": {
      "techniques": ["Intelligence artificielle et machine learning", "Big Data et analytics", "Data governance", "Veille technologique", "Innovation"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Curiosité"],
      "outils": ["Python", "TensorFlow", "PyTorch", "Excel", "PowerPoint"]
    }
  },
  "M1881": {
    "title": "Responsable blockchain",
    "skills": {
      "techniques": ["Blockchain et technologies distribuées", "Veille technologique", "Innovation", "Sécurité informatique", "Compliance"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Curiosité"],
      "outils": ["Outils blockchain", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1882": {
    "title": "Responsable IoT",
    "skills": {
      "techniques": ["IoT et systèmes embarqués", "Veille technologique", "Innovation", "Sécurité informatique", "Monitoring et supervision"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Curiosité"],
      "outils": ["Outils IoT", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1883": {
    "title": "Responsable edge computing",
    "skills": {
      "techniques": ["Veille technologique", "Innovation", "Sécurité informatique", "Monitoring et supervision", "Performance tuning"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Curiosité"],
      "outils": ["Outils edge computing", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1884": {
    "title": "Responsable 5G",
    "skills": {
      "techniques": ["Veille technologique", "Innovation", "Sécurité informatique", "Monitoring et supervision", "High availability"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Curiosité"],
      "outils": ["Outils 5G", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1885": {
    "title": "Responsable réalité virtuelle",
    "skills": {
      "techniques": ["Veille technologique", "Innovation", "Création de supports", "Développement web", "Personnalisation"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Créativité"],
      "outils": ["Outils VR", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1886": {
    "title": "Responsable réalité augmentée",
    "skills": {
      "techniques": ["Veille technologique", "Innovation", "Création de supports", "Développement web", "Personnalisation"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Créativité"],
      "outils": ["Outils AR", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1887": {
    "title": "Responsable robotique",
    "skills": {
      "techniques": ["Veille technologique", "Innovation", "Industrialisation", "Monitoring et supervision", "Automatisation"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Curiosité"],
      "outils": ["Outils robotique", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1888": {
    "title": "Responsable impression 3D",
    "skills": {
      "techniques": ["Veille technologique", "Innovation", "Industrialisation", "Création de supports", "Qualité des produits"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Créativité"],
      "outils": ["Outils impression 3D", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1889": {
    "title": "Responsable drones",
    "skills": {
      "techniques": ["Veille technologique", "Innovation", "Monitoring et supervision", "Gestion des transports", "Sécurité informatique"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Curiosité"],
      "outils": ["Outils drones", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1890": {
    "title": "Responsable véhicules autonomes",
    "skills": {
      "techniques": ["Veille technologique", "Innovation", "Sécurité informatique", "Monitoring et supervision", "IoT et systèmes embarqués"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Curiosité"],
      "outils": ["Outils véhicules autonomes", "Excel", "PowerPoint", "Teams"]
    }
  }
};

// Lire le fichier actuel
const filePath = 'app/data/rome-skills-database.js';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Extraire l'objet romeSkillsDatabase
const regex = /const romeSkillsDatabase = ({[\s\S]*?});/;
const match = fileContent.match(regex);

if (!match) {
  console.error('❌ Impossible de trouver l\'objet romeSkillsDatabase dans le fichier');
  process.exit(1);
}

// Parser l'objet existant
let currentDatabase;
try {
  currentDatabase = eval('(' + match[1] + ')');
} catch (error) {
  console.error('❌ Erreur lors du parsing de la base de données existante:', error.message);
  process.exit(1);
}

// Fusionner avec les nouveaux métiers
const updatedDatabase = { ...currentDatabase, ...additionalRomeJobs };

// Compter les métiers
const totalJobs = Object.keys(updatedDatabase).length;
const newJobsCount = Object.keys(additionalRomeJobs).length;

// Créer le nouveau contenu
const newContent = fileContent.replace(
  regex,
  `const romeSkillsDatabase = ${JSON.stringify(updatedDatabase, null, 2)};`
);

// Écrire le fichier
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ Base de données ROME mise à jour avec succès !');
console.log(`📊 ${newJobsCount} métiers ROME ajoutés`);
console.log(`📈 Total: ${totalJobs} métiers ROME dans la base`);
console.log('🚀 Redémarrez le serveur pour voir les changements'); 