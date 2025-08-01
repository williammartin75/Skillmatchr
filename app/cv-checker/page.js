"use client";
import React, { useState, useRef } from "react";
import InsightsCard from "../components/InsightsCard";
import FeedbackSmileys from "../components/FeedbackSmileys";

export default function CVChecker() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const fileInputRef = useRef(null);

  // Données par défaut pour l'analyse
  const defaultAnalysis = {
    score: 85,
    strengths: [
      "Structure claire et professionnelle",
      "Expérience pertinente bien détaillée",
      "Compétences techniques bien présentées",
      "Formation cohérente avec le poste"
    ],
    weaknesses: [
      "Manque de chiffres quantifiables",
      "Certaines compétences pourraient être mieux détaillées",
      "Absence de mots-clés spécifiques au secteur"
    ],
    suggestions: [
      "Ajouter des métriques de performance (ex: 'Augmenté les ventes de 25%')",
      "Inclure plus de mots-clés liés à votre secteur",
      "Détailler davantage les technologies utilisées"
    ],
    atsScore: 92,
    readabilityScore: 88,
    feedbackCategories: [
      {
        category: "Structure",
        score: 90,
        feedback: "Excellente organisation avec des sections claires"
      },
      {
        category: "Contenu",
        score: 85,
        feedback: "Informations pertinentes mais pourrait être plus détaillé"
      },
      {
        category: "Mots-clés",
        score: 78,
        feedback: "Bonnes compétences mais manque de termes spécifiques"
      },
      {
        category: "Quantification",
        score: 70,
        feedback: "Peu de chiffres pour appuyer les réalisations"
      }
    ],
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+33 1 23 45 67 89"
    },
    llamaAnalysis: null
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/cv-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type
      });
      setCvAnalysis(data.analysis);
      setExtractedText(data.extractedText); // Récupérer le texte extrait

    } catch (error) {
      console.error('Erreur upload:', error);
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } };
      await handleFileUpload(event);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetAnalysis = () => {
    setCvAnalysis(null);
    setUploadedFile(null);
    setError(null);
    setExtractedText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Utiliser l'analyse uploadée ou l'analyse par défaut
  const currentAnalysis = cvAnalysis || {
    ...defaultAnalysis,
    feedbackCategories: defaultAnalysis.feedbackCategories || [],
    atsScore: defaultAnalysis.atsScore || 85,
    readabilityScore: defaultAnalysis.readabilityScore || 80,
    personalInfo: defaultAnalysis.personalInfo || {},
    llamaAnalysis: defaultAnalysis.llamaAnalysis || null
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analyse de CV</h1>
            <p className="text-gray-600 mt-2">Vérifiez votre CV avec l'IA et obtenez des recommandations personnalisées</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* CV Upload */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Télécharger votre CV</h2>
                
                {uploadedFile ? (
                  <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-green-900">{uploadedFile.name}</p>
                          <p className="text-sm text-green-700">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={resetAnalysis}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={triggerFileInput}
                  >
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Glissez-déposez votre CV ici ou</p>
                      <button 
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        disabled={isUploading}
                        onClick={triggerFileInput}
                      >
                        {isUploading ? 'Analyse en cours...' : 'Parcourir les fichiers'}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">PDF, DOC, DOCX jusqu'à 10MB</p>
                  </div>
                )}

                {/* Input file caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Message d'erreur */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informations extraites du CV */}
              {cvAnalysis && cvAnalysis.extractedInfo && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations extraites</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mots-clés identifiés */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Mots-clés professionnels
                      </h3>
                      {cvAnalysis.extractedInfo.keywords && cvAnalysis.extractedInfo.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {cvAnalysis.extractedInfo.keywords.map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-700 text-sm">Aucun mot-clé professionnel identifié</p>
                      )}
                    </div>

                    {/* Compétences techniques */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-medium text-green-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Compétences techniques
                      </h3>
                      {cvAnalysis.extractedInfo.skills && cvAnalysis.extractedInfo.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {cvAnalysis.extractedInfo.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-green-700 text-sm">Aucune compétence technique identifiée</p>
                      )}
                    </div>

                    {/* Informations de contact */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-medium text-purple-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Informations de contact
                      </h3>
                      <div className="flex items-center">
                        {cvAnalysis.extractedInfo.hasContact ? (
                          <>
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-green-700 text-sm">Email et téléphone présents</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-red-700 text-sm">Informations de contact manquantes</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Métriques et chiffres */}
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-medium text-orange-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Métriques et chiffres
                      </h3>
                      <div className="flex items-center">
                        {cvAnalysis.extractedInfo.hasNumbers ? (
                          <>
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-green-700 text-sm">Chiffres et métriques présents</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-red-700 text-sm">Aucun chiffre ou métrique identifié</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Statistiques du fichier */}
                  {cvAnalysis.fileInfo && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-3">Statistiques du fichier</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Taille</p>
                          <p className="font-medium">{(cvAnalysis.fileInfo.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        {cvAnalysis.fileInfo.textLength && (
                          <div>
                            <p className="text-gray-600">Caractères</p>
                            <p className="font-medium">{cvAnalysis.fileInfo.textLength.toLocaleString()}</p>
                          </div>
                        )}
                        {cvAnalysis.fileInfo.wordCount && (
                          <div>
                            <p className="text-gray-600">Mots</p>
                            <p className="font-medium">{cvAnalysis.fileInfo.wordCount.toLocaleString()}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-600">Format</p>
                          <p className="font-medium">{cvAnalysis.fileInfo.type.split('/')[1].toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Smileys */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comment évaluez-vous cette analyse ?</h3>
                <FeedbackSmileys onFeedbackChange={(rating) => console.log('Feedback:', rating)} />
              </div>

              {/* Analysis Results */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Résultats de l'analyse</h2>
                
                {/* Overall Score */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Score global</h3>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-indigo-600">{currentAnalysis.score}/100</span>
                      <p className="text-sm text-gray-500">
                        {currentAnalysis.score >= 90 ? 'Excellent' : 
                         currentAnalysis.score >= 80 ? 'Très bon' : 
                         currentAnalysis.score >= 70 ? 'Bon' : 
                         currentAnalysis.score >= 60 ? 'Moyen' : 'À améliorer'}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${currentAnalysis.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Personal Information Detected */}
                {currentAnalysis.personalInfo && (
                  <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Informations détectées
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentAnalysis.personalInfo.fullName && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm text-blue-800">
                            <strong>Nom complet:</strong> {currentAnalysis.personalInfo.fullName}
                          </span>
                        </div>
                      )}
                      {currentAnalysis.personalInfo.email && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-blue-800">
                            <strong>Email:</strong> {currentAnalysis.personalInfo.email}
                          </span>
                        </div>
                      )}
                      {currentAnalysis.personalInfo.phone && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm text-blue-800">
                            <strong>Téléphone:</strong> {currentAnalysis.personalInfo.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Texte extrait du PDF */}
                {extractedText && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Texte extrait du CV
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                        {(() => {
                          // Nettoyer et valider le texte avant affichage
                          let cleanText = extractedText;
                          
                          // Détecter si le texte contient des données binaires
                          const hasBinaryData = cleanText.includes('endstream') || 
                                              cleanText.includes('endobj') ||
                                              cleanText.match(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/) ||
                                              (cleanText.includes('PDF') && cleanText.match(/[^\x20-\x7E\n\r\t]/g)?.length > cleanText.length * 0.1);
                          
                          if (hasBinaryData) {
                            return "❌ Le contenu extrait semble être corrompu ou binaire.\n\nLe PDF n'a pas pu être correctement analysé. Veuillez essayer avec un autre format.";
                          }
                          
                          // Si le texte commence par [Extraction PDF échouée], l'afficher tel quel
                          if (cleanText.startsWith('[Extraction PDF échouée]') || cleanText.startsWith('[Erreur d\'extraction]')) {
                            return cleanText;
                          }
                          
                          // Nettoyer les caractères Unicode problématiques
                          cleanText = cleanText
                            .replace(/[﴾﴿]/g, (match) => match === '﴾' ? '(' : ')')
                            .replace(/[–—‐]/g, '-')
                            .replace(/[\u2018\u2019]/g, "'")
                            .replace(/[\u201C\u201D]/g, '"')
                            .replace(/\u00A0/g, ' ')
                            .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
                            .trim();
                          
                          return cleanText || "Aucun texte n'a pu être extrait de ce document.";
                        })()}
                      </pre>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Ce texte a été extrait automatiquement du PDF et est utilisé pour l'analyse du CV.
                    </p>
                  </div>
                )}

                {/* Detailed Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Score ATS</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">{currentAnalysis.atsScore}/100</span>
                      <span className="text-sm text-green-600">Excellent</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Compatible avec les systèmes de recrutement</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Lisibilité</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">{currentAnalysis.readabilityScore}/100</span>
                      <span className="text-sm text-blue-600">Très bon</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Facile à lire et comprendre</p>
                  </div>
                </div>

                {/* Category Analysis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Analyse par catégorie</h3>
                  {(currentAnalysis.feedbackCategories || []).map((category, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">{category.category}</h4>
                        <span className="text-lg font-bold text-indigo-600">{category.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${category.score}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{category.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Points forts
                  </h3>
                  <ul className="space-y-2">
                    {(currentAnalysis.strengths || []).map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Axes d'amélioration
                  </h3>
                  <ul className="space-y-2">
                    {(currentAnalysis.weaknesses || []).map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-sm text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Analyse Llama si disponible */}
              {currentAnalysis.llamaAnalysis && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Analyse IA avancée (Llama)
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {currentAnalysis.llamaAnalysis}
                    </p>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations</h3>
                <div className="space-y-3">
                  {(currentAnalysis.suggestions || []).map((suggestion, index) => (
                    <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sidebar vide pour l'instant */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 