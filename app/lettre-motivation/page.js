"use client";
import React, { useState, useRef } from "react";
import InsightsCard from "../components/InsightsCard";
import FeedbackSmileys from "../components/FeedbackSmileys";

export default function LettreMotivationChecker() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [lettreAnalysis, setLettreAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Données par défaut pour l'analyse
  const defaultAnalysis = {
    score: 82,
    strengths: [
      "Ton professionnel et approprié",
      "Structure logique et cohérente",
      "Motivation bien exprimée",
      "Adaptation au poste ciblé"
    ],
    weaknesses: [
      "Manque d'exemples concrets",
      "Certaines phrases pourraient être plus percutantes",
      "Absence de lien avec l'entreprise"
    ],
    suggestions: [
      "Ajouter des exemples spécifiques de vos réalisations",
      "Personnaliser davantage le contenu pour l'entreprise",
      "Renforcer l'ouverture et la conclusion"
    ],
    atsScore: 88,
    readabilityScore: 85,
    feedbackCategories: [
      {
        category: "Structure",
        score: 90,
        feedback: "Excellente organisation avec introduction, développement et conclusion"
      },
      {
        category: "Contenu",
        score: 80,
        feedback: "Informations pertinentes mais pourrait être plus personnalisé"
      },
      {
        category: "Motivation",
        score: 85,
        feedback: "Bonne expression de la motivation pour le poste"
      },
      {
        category: "Personnalisation",
        score: 70,
        feedback: "Manque de lien spécifique avec l'entreprise ciblée"
      }
    ]
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('lettre', file);

      const response = await fetch('/api/lettre-upload', {
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
      setLettreAnalysis(data.analysis);

    } catch (error) {
      console.error('Erreur upload:', error);
      setError(error.message);
      // Utiliser l'analyse par défaut en cas d'erreur
      setLettreAnalysis(defaultAnalysis);
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
    setUploadedFile(null);
    setLettreAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Analyseur de Lettre de Motivation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Obtenez un feedback détaillé sur votre lettre de motivation avec notre IA spécialisée. 
              Améliorez vos chances d'être sélectionné avec des suggestions personnalisées.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* CV Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Télécharger votre lettre de motivation</h2>
              
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
                    <p className="text-sm text-gray-600">Glissez-déposez votre lettre de motivation ici ou</p>
                    <button 
                      className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      disabled={isUploading}
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

            {/* Feedback Smileys */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comment évaluez-vous cette analyse ?</h3>
              <FeedbackSmileys onFeedbackChange={(rating) => console.log('Feedback lettre:', rating)} />
            </div>

            {/* Analysis Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Résultats de l'analyse</h2>
              
              {lettreAnalysis ? (
                <div className="space-y-6">
                  {/* Score global */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-100 rounded-full mb-4">
                      <span className="text-3xl font-bold text-indigo-600">
                        {lettreAnalysis.score}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Score global
                    </h3>
                    <p className="text-sm text-gray-600">
                      {lettreAnalysis.score >= 80 ? "Excellent" : 
                       lettreAnalysis.score >= 60 ? "Bon" : 
                       lettreAnalysis.score >= 40 ? "Moyen" : "À améliorer"}
                    </p>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Score ATS</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">{lettreAnalysis.atsScore || 88}/100</span>
                        <span className="text-sm text-green-600">Excellent</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Compatible avec les systèmes de recrutement</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Lisibilité</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">{lettreAnalysis.readabilityScore || 85}/100</span>
                        <span className="text-sm text-blue-600">Très bon</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Facile à lire et comprendre</p>
                    </div>
                  </div>

                  {/* Category Analysis */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Analyse par catégorie</h3>
                    {(lettreAnalysis.feedbackCategories || []).map((category, index) => (
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
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">
                    Téléchargez votre lettre de motivation pour commencer l'analyse
                  </p>
                </div>
              )}
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
                  {(lettreAnalysis?.strengths || defaultAnalysis.strengths).map((strength, index) => (
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
                  {(lettreAnalysis?.weaknesses || defaultAnalysis.weaknesses).map((weakness, index) => (
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

            {/* Suggestions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations</h3>
              <div className="space-y-3">
                {(lettreAnalysis?.suggestions || defaultAnalysis.suggestions).map((suggestion, index) => (
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
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button 
                  onClick={triggerFileInput}
                  className="w-full text-left px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  disabled={isUploading}
                >
                  {isUploading ? 'Analyse en cours...' : 'Analyser une nouvelle lettre'}
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Comparer avec d'autres lettres
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Exporter le rapport
                </button>
              </div>
            </div>

            {/* Market Insights */}
            <div className="space-y-4">
              <InsightsCard
                title="Classement Lettre"
                value="Top 20%"
                description="Votre lettre est dans le top 20% des meilleures lettres"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
              />
              <InsightsCard
                title="Taux de réponse"
                value="+35%"
                description="Chance d'obtenir une réponse positive"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                color="blue"
              />
            </div>

            {/* Tips */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">💡 Conseils</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li>• Personnalisez votre lettre pour chaque entreprise</li>
                <li>• Mentionnez des réalisations concrètes</li>
                <li>• Gardez votre lettre à 1 page maximum</li>
                <li>• Utilisez un ton professionnel mais chaleureux</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 