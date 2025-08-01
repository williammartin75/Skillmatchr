"use client";

import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MotivationChecker() {
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError("Format non supporté. Utilisez PDF ou DOCX.");
      return;
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 10MB)");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('motivation', file);

      const response = await fetch('/api/motivation-checker', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }

      setAnalysis(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message || 'Erreur lors de l\'analyse de la lettre');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (analysis && analysis.docx_download_url) {
      const link = document.createElement('a');
      link.href = analysis.docx_download_url;
      link.download = 'lettre-motivation-corrigee.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBarColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="motivation-checker" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Motivation Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analysez votre lettre de motivation et obtenez une version améliorée en quelques secondes.
            Notre IA évalue 7 critères essentiels pour maximiser votre impact.
          </p>
        </div>

        {/* Upload Section */}
        {!analysis && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Uploadez votre lettre de motivation
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Formats acceptés : PDF, DOCX (max 10MB)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isUploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyse en cours...
                    </>
                  ) : (
                    'Sélectionner un fichier'
                  )}
                </button>

                {uploadedFileName && !isUploading && (
                  <p className="mt-4 text-sm text-gray-600">
                    Fichier sélectionné : {uploadedFileName}
                  </p>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow">
                <h4 className="font-semibold text-gray-900 mb-3">📊 Analyse complète</h4>
                <p className="text-gray-600">
                  Nous analysons votre lettre sur 7 critères essentiels : impact, personnalisation, 
                  structure, tonalité, style, valeur apportée et grammaire.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <h4 className="font-semibold text-gray-900 mb-3">✨ Version améliorée</h4>
                <p className="text-gray-600">
                  Recevez une version corrigée et optimisée de votre lettre, prête à être envoyée, 
                  au format Word téléchargeable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="space-y-8">
            {/* Score Global */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Score Global</h2>
                <div className={`text-6xl font-bold ${getScoreColor(analysis.score)} mb-2`}>
                  {analysis.score}/100
                </div>
                <p className="text-gray-600">{analysis.impact}</p>
              </div>
            </div>

            {/* Analyse détaillée */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Impact */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900 mb-3">🎯 Impact Global</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span className={getScoreColor(analysis.detailed_analysis.scores.impactScore)}>
                      {analysis.detailed_analysis.scores.impactScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getProgressBarColor(analysis.detailed_analysis.scores.impactScore)} h-2 rounded-full`}
                      style={{ width: `${analysis.detailed_analysis.scores.impactScore}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{analysis.impact}</p>
              </div>

              {/* Personnalisation */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900 mb-3">🎨 Personnalisation</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span className={getScoreColor(analysis.detailed_analysis.scores.personalScore)}>
                      {analysis.detailed_analysis.scores.personalScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getProgressBarColor(analysis.detailed_analysis.scores.personalScore)} h-2 rounded-full`}
                      style={{ width: `${analysis.detailed_analysis.scores.personalScore}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{analysis.detailed_analysis.personalization}</p>
              </div>

              {/* Structure */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900 mb-3">📋 Structure</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span className={getScoreColor(analysis.detailed_analysis.scores.structureScore)}>
                      {analysis.detailed_analysis.scores.structureScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getProgressBarColor(analysis.detailed_analysis.scores.structureScore)} h-2 rounded-full`}
                      style={{ width: `${analysis.detailed_analysis.scores.structureScore}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{analysis.detailed_analysis.structure}</p>
              </div>

              {/* Tonalité */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900 mb-3">💬 Tonalité</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span className={getScoreColor(analysis.detailed_analysis.scores.confidenceScore)}>
                      {analysis.detailed_analysis.scores.confidenceScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getProgressBarColor(analysis.detailed_analysis.scores.confidenceScore)} h-2 rounded-full`}
                      style={{ width: `${analysis.detailed_analysis.scores.confidenceScore}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{analysis.detailed_analysis.tone}</p>
              </div>

              {/* Style */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900 mb-3">✨ Style</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span className={getScoreColor(analysis.detailed_analysis.scores.styleScore)}>
                      {analysis.detailed_analysis.scores.styleScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getProgressBarColor(analysis.detailed_analysis.scores.styleScore)} h-2 rounded-full`}
                      style={{ width: `${analysis.detailed_analysis.scores.styleScore}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{analysis.detailed_analysis.style}</p>
              </div>

              {/* Valeur apportée */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900 mb-3">💎 Valeur Apportée</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span className={getScoreColor(analysis.detailed_analysis.scores.valueScore)}>
                      {analysis.detailed_analysis.scores.valueScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getProgressBarColor(analysis.detailed_analysis.scores.valueScore)} h-2 rounded-full`}
                      style={{ width: `${analysis.detailed_analysis.scores.valueScore}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{analysis.detailed_analysis.value}</p>
              </div>
            </div>

            {/* Points forts et faibles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Points forts */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-green-500 mr-2">✓</span> Points Forts
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Points faibles */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-red-500 mr-2">✗</span> Points Faibles
                </h3>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommandations */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4">💡 Recommandations</h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-blue-800 flex items-start">
                    <span className="text-blue-600 mr-2">→</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lettre originale vs corrigée */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Comparaison des Lettres</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowOriginal(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      showOriginal 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setShowOriginal(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !showOriginal 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Version Corrigée
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-gray-800">
                  {showOriginal ? analysis.original_text : analysis.corrected_letter}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger la lettre corrigée
              </button>
              <button
                onClick={() => {
                  setAnalysis(null);
                  setUploadedFileName(null);
                  setError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Analyser une autre lettre
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}