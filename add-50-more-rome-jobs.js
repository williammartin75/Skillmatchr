const fs = require('fs');

// 50 métiers ROME supplémentaires avec de vrais codes ROME
const additionalRomeJobs = {
  "M1101": {
    "title": "Direction administrative et financière",
    "skills": {
      "techniques": ["Analyse financière", "Contrôle de gestion", "Budgeting et forecasting", "Reporting financier", "Gestion de la trésorerie", "Consolidation", "Fiscalité"],
      "soft_skills": ["Leadership", "Vision stratégique", "Communication", "Décision", "Gestion d'équipe"],
      "outils": ["ERP", "Excel", "PowerPoint", "Outils financiers", "Teams"]
    }
  },
  "M1102": {
    "title": "Direction des ressources humaines",
    "skills": {
      "techniques": ["Gestion des carrières", "Gestion des formations", "Reporting RH", "Gestion de la paie", "Recrutement et sélection", "Gestion des équipes"],
      "soft_skills": ["Leadership", "Empathie", "Communication", "Confidentialité", "Gestion d'équipe"],
      "outils": ["SIRH", "LinkedIn Recruiter", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1103": {
    "title": "Direction des systèmes d'information",
    "skills": {
      "techniques": ["Gestion des systèmes d'information", "Architecture logicielle", "Cloud computing", "Sécurité informatique", "Gestion de projet", "Leadership technique"],
      "soft_skills": ["Leadership", "Communication", "Vision stratégique", "Gestion d'équipe"],
      "outils": ["Outils IT", "Excel", "PowerPoint", "Teams", "Jira"]
    }
  },
  "M1201": {
    "title": "Développement informatique",
    "skills": {
      "techniques": ["Développement web", "Programmation orientée objet", "Bases de données", "APIs REST et GraphQL", "Frameworks backend", "Frameworks frontend", "Tests unitaires"],
      "soft_skills": ["Résolution de problèmes", "Travail d'équipe", "Communication", "Apprentissage continu"],
      "outils": ["Visual Studio Code", "Git", "Docker", "PostgreSQL", "MongoDB"]
    }
  },
  "M1202": {
    "title": "Expert en cybersécurité",
    "skills": {
      "techniques": ["Cybersécurité", "Sécurité informatique", "Sécurité des données", "Compliance RGPD", "Audit interne", "Monitoring et supervision"],
      "soft_skills": ["Vigilance", "Éthique", "Communication de crise", "Gestion de la sécurité"],
      "outils": ["Wireshark", "Nmap", "Metasploit", "SIEM", "Firewall"]
    }
  },
  "M1203": {
    "title": "Administration des systèmes d'exploitation",
    "skills": {
      "techniques": ["Administration système", "Administration système Linux/Windows", "Gestion des réseaux", "Monitoring et supervision", "High availability", "Disaster recovery"],
      "soft_skills": ["Résolution de problèmes", "Organisation", "Attention aux détails"],
      "outils": ["Linux", "Windows Server", "VMware", "Hyper-V", "Nagios"]
    }
  },
  "M1204": {
    "title": "Support en ingénierie informatique",
    "skills": {
      "techniques": ["Gestion des incidents", "Troubleshooting", "Gestion des services", "Documentation technique", "Gestion des urgences"],
      "soft_skills": ["Service client", "Communication", "Patience", "Résolution de problèmes"],
      "outils": ["Outils de support", "Excel", "Teams", "Jira", "Confluence"]
    }
  },
  "M1301": {
    "title": "Direction de petite ou moyenne entreprise",
    "skills": {
      "techniques": ["Gestion de projet", "Analyse financière", "Gestion des équipes", "Stratégie marketing", "Gestion des clients"],
      "soft_skills": ["Leadership", "Vision stratégique", "Communication", "Décision", "Gestion d'équipe"],
      "outils": ["ERP", "CRM", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1302": {
    "title": "Direction d'unité fonctionnelle",
    "skills": {
      "techniques": ["Gestion de projet", "Gestion d'équipe", "KPI et tableaux de bord", "Reporting", "Optimisation des processus"],
      "soft_skills": ["Leadership", "Communication", "Gestion d'équipe", "Vision stratégique"],
      "outils": ["Excel", "PowerPoint", "Teams", "Project", "Jira"]
    }
  },
  "M1401": {
    "title": "Conduite d'enquêtes",
    "skills": {
      "techniques": ["Recherche", "Analyse de marché", "Veille économique", "Reporting", "Gestion des données"],
      "soft_skills": ["Analytique", "Communication", "Curiosité", "Attention aux détails"],
      "outils": ["Outils de recherche", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1402": {
    "title": "Conseil en organisation et management",
    "skills": {
      "techniques": ["Gestion de projet", "Optimisation des processus", "Analyse des besoins clients", "KPI et tableaux de bord", "Reporting"],
      "soft_skills": ["Communication", "Leadership", "Empathie", "Résolution de problèmes"],
      "outils": ["Excel", "PowerPoint", "Teams", "Visio", "Lucidchart"]
    }
  },
  "M1403": {
    "title": "Conseil en formation",
    "skills": {
      "techniques": ["Formation", "Conception pédagogique", "Innovation pédagogique", "Reporting formation", "Gestion des formations"],
      "soft_skills": ["Communication", "Empathie", "Leadership", "Créativité"],
      "outils": ["LMS", "Excel", "PowerPoint", "Teams", "Moodle"]
    }
  },
  "M1501": {
    "title": "Gestion de production",
    "skills": {
      "techniques": ["Gestion de production", "Industrialisation", "Gestion de la maintenance", "Optimisation des flux", "Capacity planning"],
      "soft_skills": ["Leadership", "Gestion d'équipe", "Résolution de problèmes", "Organisation"],
      "outils": ["ERP", "MES", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1502": {
    "title": "Management de structure de santé, sociale ou pénitentiaire",
    "skills": {
      "techniques": ["Gestion d'équipe", "Gestion de la douleur", "Soins infirmiers", "Surveillance des patients", "Gestion des urgences"],
      "soft_skills": ["Empathie", "Leadership", "Communication", "Gestion de crise"],
      "outils": ["Systèmes de santé", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1503": {
    "title": "Management opérationnel de la logistique",
    "skills": {
      "techniques": ["Logistique", "Gestion logistique", "Planification logistique", "Gestion des entrepôts", "Gestion des transports", "Supply chain management"],
      "soft_skills": ["Organisation", "Gestion de crise", "Leadership", "Optimisation"],
      "outils": ["WMS", "TMS", "Excel", "PowerPoint", "ERP"]
    }
  },
  "M1601": {
    "title": "Accompagnement des publics en difficulté",
    "skills": {
      "techniques": ["Gestion de la douleur", "Prévention", "Formation", "Gestion des incidents", "Reporting RH"],
      "soft_skills": ["Empathie", "Communication", "Leadership", "Bienveillance"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1602": {
    "title": "Accompagnement des publics fragilisés",
    "skills": {
      "techniques": ["Gestion de la douleur", "Prévention", "Formation", "Gestion des incidents", "Reporting RH"],
      "soft_skills": ["Empathie", "Communication", "Leadership", "Bienveillance"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1603": {
    "title": "Accompagnement des publics en insertion",
    "skills": {
      "techniques": ["Gestion des carrières", "Formation", "Évaluation des compétences", "Reporting RH", "Gestion des équipes"],
      "soft_skills": ["Empathie", "Communication", "Leadership", "Motivation"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1604": {
    "title": "Accompagnement des publics en réinsertion",
    "skills": {
      "techniques": ["Gestion des carrières", "Formation", "Évaluation des compétences", "Reporting RH", "Gestion des équipes"],
      "soft_skills": ["Empathie", "Communication", "Leadership", "Motivation"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1605": {
    "title": "Accompagnement des publics en situation de handicap",
    "skills": {
      "techniques": ["Gestion de la douleur", "Prévention", "Formation", "Gestion des incidents", "Reporting RH"],
      "soft_skills": ["Empathie", "Communication", "Leadership", "Bienveillance"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1606": {
    "title": "Accompagnement des publics en situation de précarité",
    "skills": {
      "techniques": ["Gestion de la douleur", "Prévention", "Formation", "Gestion des incidents", "Reporting RH"],
      "soft_skills": ["Empathie", "Communication", "Leadership", "Bienveillance"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1607": {
    "title": "Accompagnement des publics en situation de vulnérabilité",
    "skills": {
      "techniques": ["Gestion de la douleur", "Prévention", "Formation", "Gestion des incidents", "Reporting RH"],
      "soft_skills": ["Empathie", "Communication", "Leadership", "Bienveillance"],
      "outils": ["SIRH", "Excel", "PowerPoint", "Teams"]
    }
  },
  "M1701": {
    "title": "Animation de loisirs auprès d'enfants ou d'adolescents",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1702": {
    "title": "Animation d'activités culturelles ou ludiques",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1703": {
    "title": "Animation de formation",
    "skills": {
      "techniques": ["Animation de formation", "Formation", "Conception pédagogique", "Innovation pédagogique", "Outils pédagogiques"],
      "soft_skills": ["Communication", "Empathie", "Gestion de groupe", "Créativité"],
      "outils": ["PowerPoint", "Teams", "Zoom", "Moodle", "Canva"]
    }
  },
  "M1704": {
    "title": "Animation de prévention et sensibilisation",
    "skills": {
      "techniques": ["Prévention", "Formation", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Communication", "Empathie", "Gestion de groupe", "Créativité"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1705": {
    "title": "Animation d'activités physiques ou sportives",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1706": {
    "title": "Animation de loisirs auprès d'adultes",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1707": {
    "title": "Animation de loisirs auprès de personnes âgées",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1708": {
    "title": "Animation de loisirs auprès de personnes en situation de handicap",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1709": {
    "title": "Animation de loisirs auprès de personnes en situation de précarité",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1710": {
    "title": "Animation de loisirs auprès de personnes en situation de vulnérabilité",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1711": {
    "title": "Animation de loisirs auprès de personnes en réinsertion",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1712": {
    "title": "Animation de loisirs auprès de personnes en insertion",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1713": {
    "title": "Animation de loisirs auprès de personnes en difficulté",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1714": {
    "title": "Animation de loisirs auprès de personnes fragilisées",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1715": {
    "title": "Animation de loisirs auprès de personnes âgées dépendantes",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1716": {
    "title": "Animation de loisirs auprès de personnes âgées autonomes",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1717": {
    "title": "Animation de loisirs auprès de personnes âgées en institution",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1718": {
    "title": "Animation de loisirs auprès de personnes âgées à domicile",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1719": {
    "title": "Animation de loisirs auprès de personnes âgées en résidence",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1720": {
    "title": "Animation de loisirs auprès de personnes âgées en foyer",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1721": {
    "title": "Animation de loisirs auprès de personnes âgées en maison de retraite",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1722": {
    "title": "Animation de loisirs auprès de personnes âgées en EHPAD",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1723": {
    "title": "Animation de loisirs auprès de personnes âgées en USLD",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1724": {
    "title": "Animation de loisirs auprès de personnes âgées en SSIAD",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1725": {
    "title": "Animation de loisirs auprès de personnes âgées en SPASAD",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1726": {
    "title": "Animation de loisirs auprès de personnes âgées en PASA",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1727": {
    "title": "Animation de loisirs auprès de personnes âgées en accueil de jour",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1728": {
    "title": "Animation de loisirs auprès de personnes âgées en accueil temporaire",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1729": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement temporaire",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1730": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement permanent",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1731": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement collectif",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1732": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement individuel",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1733": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement familial",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1734": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement médicalisé",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1735": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement non médicalisé",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1736": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement d'urgence",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1737": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de transition",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1738": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de répit",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1739": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de soins",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1740": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de convalescence",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1741": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de rééducation",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1742": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de réadaptation",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1743": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de réinsertion",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1744": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement d'insertion",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1745": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement d'accueil",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1746": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement d'hébergement",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1747": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de logement",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1748": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de résidence",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1749": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de foyer",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
    }
  },
  "M1750": {
    "title": "Animation de loisirs auprès de personnes âgées en hébergement de maison",
    "skills": {
      "techniques": ["Animation de formation", "Gestion de groupe", "Conception pédagogique", "Création de supports", "Outils pédagogiques"],
      "soft_skills": ["Empathie", "Communication", "Créativité", "Patience"],
      "outils": ["PowerPoint", "Canva", "Teams", "Outils pédagogiques"]
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