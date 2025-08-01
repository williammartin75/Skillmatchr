"use client";
import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CVChecker() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError("Veuillez uploader un fichier PDF ou Word (.docx)");
      return;
    }

    setIsUploading(true);
    setError(null);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/cv-checker/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }

      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type
      });
      setCvAnalysis(data);

    } catch (error) {
      console.error('Erreur analyse:', error);
      setError(error.message);
      // Données de test en cas d'erreur
      setCvAnalysis(getMockData());
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const getMockData = () => ({
    personalInfo: {
      email: "candidat@example.com",
      phone: "+33 6 12 34 56 78"
    },
    scores: {
      global: 78,
      ats: 82,
      lisibilite: 75
    },
    categories: [
      {
        name: "Structure du CV",
        score: 85,
        comment: "Bonne organisation générale avec des sections clairement définies. Manque une section 'Projets' qui pourrait valoriser vos réalisations."
      },
      {
        name: "Contenu pertinent",
        score: 78,
        comment: "Les expériences sont bien détaillées mais manquent de quantification. Ajoutez des métriques pour démontrer votre impact."
      },
      {
        name: "Utilisation de mots-clés",
        score: 72,
        comment: "Mots-clés techniques présents mais insuffisants pour le secteur visé. Intégrez plus de termes spécifiques à votre domaine."
      },
      {
        name: "Présence de métriques chiffrées",
        score: 65,
        comment: "Peu de données chiffrées. Quantifiez vos réalisations : budgets gérés, amélioration de performance, nombre de projets..."
      },
      {
        name: "Style général",
        score: 80,
        comment: "Style professionnel et cohérent. Les phrases pourraient être plus percutantes en utilisant des verbes d'action."
      },
      {
        name: "Compatibilité ATS",
        score: 82,
        comment: "Format bien structuré pour les ATS. Évitez les tableaux complexes et graphiques qui peuvent poser problème."
      }
    ],
    rubriques: {
      experience: {
        original: "Développeur Full Stack\nEntreprise XYZ - 2020-2023\n- Développement d'applications web\n- Travail en équipe\n- Utilisation de React et Node.js",
        corrige: "Développeur Full Stack Senior\nEntreprise XYZ | Paris | 2020-2023\n• Développé et déployé 5 applications web critiques utilisées par +10K utilisateurs quotidiens\n• Dirigé une équipe de 3 développeurs juniors, réduisant le temps de livraison de 30%\n• Architecturé des solutions React/Node.js performantes, améliorant les temps de réponse de 40%"
      },
      formation: {
        original: "Master Informatique\nUniversité Paris - 2020",
        corrige: "Master en Informatique - Spécialisation Génie Logiciel\nUniversité Paris-Saclay | 2018-2020\n• Major de promotion (15.8/20)\n• Projet de fin d'études : Système de recommandation par IA (Note : 18/20)"
      },
      competences: {
        original: "JavaScript, React, Node.js, MongoDB, Git",
        corrige: "Compétences Techniques:\n• Langages : JavaScript (ES6+), TypeScript, Python\n• Frontend : React.js, Next.js, Redux, Tailwind CSS\n• Backend : Node.js, Express, NestJS, REST APIs\n• Bases de données : MongoDB, PostgreSQL, Redis\n• DevOps : Docker, CI/CD, AWS, Git\n• Méthodologies : Agile/Scrum, TDD, Clean Architecture"
      }
    },
    synthese: {
      pointsForts: [
        "Expérience solide en développement Full Stack",
        "Formation technique de qualité",
        "Compétences techniques variées et modernes",
        "CV bien structuré et lisible"
      ],
      ameliorations: [
        "Ajouter des métriques chiffrées pour chaque expérience",
        "Intégrer plus de mots-clés spécifiques au poste visé",
        "Créer une section 'Projets' ou 'Réalisations'",
        "Mentionner les soft skills et certifications",
        "Optimiser l'accroche/résumé professionnel"
      ],
      recommandations: [
        "Commencez par un résumé percutant de 3-4 lignes mettant en avant votre valeur ajoutée",
        "Pour chaque expérience, utilisez la formule : Action + Contexte + Résultat chiffré",
        "Ajoutez une section 'Projets personnels' avec liens GitHub si pertinent",
        "Incluez vos certifications et formations continues",
        "Personnalisez les mots-clés selon chaque offre d'emploi"
      ]
    },
    messageRecruteur: "Bonjour,\n\nDéveloppeur Full Stack passionné avec 3 ans d'expérience, j'ai dirigé le développement de 5 applications critiques impactant +10K utilisateurs quotidiens. Mon expertise en React/Node.js m'a permis d'améliorer les performances de 40% sur mes derniers projets.\n\nJe serais ravi d'apporter cette même rigueur technique et cette orientation résultats à votre équipe. Disponible pour échanger sur la façon dont mes compétences peuvent contribuer à vos objectifs.\n\nCordialement,"
  });

  const renderScoreWithColor = (score) => {
    let colorClass = "text-red-600";
    if (score >= 80) colorClass = "text-green-600";
    else if (score >= 60) colorClass = "text-yellow-600";
    
    return <span className={`font-bold ${colorClass}`}>{score}%</span>;
  };

  const renderBadgeVariant = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="cv-checker" />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CV Checker Intelligent</h1>
          <p className="text-lg text-gray-600">
            Analysez votre CV en profondeur avec notre IA et obtenez des recommandations personnalisées
          </p>
        </div>

        {/* Zone d'upload */}
        {!cvAnalysis && (
          <Card className="mb-8">
            <CardContent className="p-12">
              <div className="text-center">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Déposez votre CV ici ou cliquez pour sélectionner
                  </p>
                  <p className="text-sm text-gray-500">PDF ou Word (.docx) - Max 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                  />
                </div>
                {isAnalyzing && (
                  <div className="mt-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Analyse en cours...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Résultats de l'analyse */}
        {cvAnalysis && (
          <div className="space-y-6">
            {/* Bloc 1: Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations détectées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{cvAnalysis.personalInfo?.email || "Non détecté"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm">{cvAnalysis.personalInfo?.phone || "Non détecté"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score global</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{renderScoreWithColor(cvAnalysis.scores?.global || 0)}</div>
                    <Progress value={cvAnalysis.scores?.global || 0} className="mt-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scores techniques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Score ATS</span>
                        <span className="font-medium">{cvAnalysis.scores?.ats || 0}%</span>
                      </div>
                      <Progress value={cvAnalysis.scores?.ats || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Lisibilité</span>
                        <span className="font-medium">{cvAnalysis.scores?.lisibilite || 0}%</span>
                      </div>
                      <Progress value={cvAnalysis.scores?.lisibilite || 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bloc 2: Analyse par catégories */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse détaillée par catégorie</CardTitle>
                <CardDescription>Évaluation selon 7 axes d'analyse intelligents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cvAnalysis.categories?.map((category, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{category.name}</h4>
                        <Badge variant={renderBadgeVariant(category.score)}>
                          {category.score}%
                        </Badge>
                      </div>
                      <Progress value={category.score} className="mb-2" />
                      <p className="text-sm text-gray-600">{category.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bloc 3: Rubriques structurées avec correction */}
            <Card>
              <CardHeader>
                <CardTitle>Corrections et améliorations par rubrique</CardTitle>
                <CardDescription>Comparaison entre votre texte original et la version optimisée</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="experience" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="experience">Expérience</TabsTrigger>
                    <TabsTrigger value="formation">Formation</TabsTrigger>
                    <TabsTrigger value="competences">Compétences</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="experience" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">❌ Version originale</h4>
                      <Textarea 
                        value={cvAnalysis.rubriques?.experience?.original || ""} 
                        readOnly 
                        className="min-h-[120px] bg-red-50"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">✅ Version corrigée</h4>
                      <Textarea 
                        value={cvAnalysis.rubriques?.experience?.corrige || ""} 
                        readOnly 
                        className="min-h-[120px] bg-green-50"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="formation" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">❌ Version originale</h4>
                      <Textarea 
                        value={cvAnalysis.rubriques?.formation?.original || ""} 
                        readOnly 
                        className="min-h-[120px] bg-red-50"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">✅ Version corrigée</h4>
                      <Textarea 
                        value={cvAnalysis.rubriques?.formation?.corrige || ""} 
                        readOnly 
                        className="min-h-[120px] bg-green-50"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="competences" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">❌ Version originale</h4>
                      <Textarea 
                        value={cvAnalysis.rubriques?.competences?.original || ""} 
                        readOnly 
                        className="min-h-[120px] bg-red-50"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">✅ Version corrigée</h4>
                      <Textarea 
                        value={cvAnalysis.rubriques?.competences?.corrige || ""} 
                        readOnly 
                        className="min-h-[120px] bg-green-50"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Bloc 4: Synthèse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-green-600">✨</span> Points forts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cvAnalysis.synthese?.pointsForts?.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-yellow-600">⚡</span> Axes d'amélioration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cvAnalysis.synthese?.ameliorations?.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-blue-600">💡</span> Recommandations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cvAnalysis.synthese?.recommandations?.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Bloc 5: Message pour recruteur */}
            <Card>
              <CardHeader>
                <CardTitle>Message personnalisé pour recruteur</CardTitle>
                <CardDescription>
                  Message court et percutant à envoyer, orienté valeur et sans désespoir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={cvAnalysis.messageRecruteur || ""} 
                  readOnly 
                  className="min-h-[200px]"
                />
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={() => navigator.clipboard.writeText(cvAnalysis.messageRecruteur || "")}
                  >
                    📋 Copier le message
                  </Button>
                  <Button variant="outline" onClick={() => setError(null)}>
                    ✏️ Personnaliser
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions finales */}
            <div className="flex justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => {
                  setCvAnalysis(null);
                  setUploadedFile(null);
                  setError(null);
                }}
              >
                Analyser un autre CV
              </Button>
              <Button size="lg" variant="outline">
                Télécharger le rapport complet
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
} 