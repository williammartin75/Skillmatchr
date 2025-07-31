"use client";

import React, { useState, useRef, useEffect } from "react";

import AuthGuard from '../components/AuthGuard';

// Composant pour le téléchargement de l'extension
function ExtensionDownload() {
  const [extensionInfo, setExtensionInfo] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState(null);

  useEffect(() => {
    checkExtensionStatus();
  }, []);

  const checkExtensionStatus = async () => {
    try {
      const response = await fetch('/api/extension/build');
      const data = await response.json();
      
      if (data.exists) {
        setExtensionInfo(data.file);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'extension:', error);
    }
  };

  const buildExtension = async () => {
    setIsBuilding(true);
    setBuildError(null);

    try {
      const response = await fetch('/api/extension/build', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setExtensionInfo(data.file);
      } else {
        setBuildError(data.error || 'Erreur lors de la construction');
      }
    } catch (error) {
      console.error('Erreur lors de la construction:', error);
      setBuildError('Erreur de connexion');
    } finally {
      setIsBuilding(false);
    }
  };

  const downloadExtension = () => {
    if (extensionInfo) {
      window.open(extensionInfo.url, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Extension Chrome SkillMatchr</h3>
          <p className="text-sm text-gray-600">Postulez automatiquement sur les sites d'emploi</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Statut de l'extension */}
        {extensionInfo ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-green-800">Extension prête</h4>
                <p className="text-xs text-green-600 mt-1">
                  Taille: {extensionInfo.sizeFormatted} • 
                  Créée le: {new Date(extensionInfo.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={downloadExtension}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Télécharger
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Extension non disponible</h4>
                <p className="text-xs text-yellow-600 mt-1">
                  L'extension doit être construite avant le téléchargement
                </p>
              </div>
              <button
                onClick={buildExtension}
                disabled={isBuilding}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuilding ? 'Construction...' : 'Construire'}
              </button>
            </div>
          </div>
        )}

        {/* Erreur de construction */}
        {buildError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800">Erreur de construction</h4>
            <p className="text-xs text-red-600 mt-1">{buildError}</p>
          </div>
        )}

        {/* Instructions d'installation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions d'installation</h4>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Téléchargez l'extension (.zip)</li>
            <li>2. Décompressez le fichier dans un dossier</li>
            <li>3. Ouvrez Chrome et allez dans chrome://extensions/</li>
            <li>4. Activez le "Mode développeur"</li>
            <li>5. Cliquez sur "Charger l'extension non empaquetée"</li>
            <li>6. Sélectionnez le dossier de l'extension</li>
          </ol>
        </div>

        {/* Fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Détection automatique des offres
          </div>
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Candidature en un clic
          </div>
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Sites supportés: APEC, Pôle Emploi, Indeed
          </div>
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Synchronisation avec votre profil
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Charger les données utilisateur au montage du composant
  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        console.log('👤 Utilisateur chargé:', user);
        
        // Charger le CV si disponible
        if (user.documents && user.documents.length > 0) {
          const cvDoc = user.documents.find(doc => doc.type === 'cv');
          if (cvDoc) {
            setCvFile({ name: cvDoc.name });
            // Utiliser directement les informations extraites lors de l'inscription
            setCvAnalysis(cvDoc.extractedInfo);
            console.log('📄 CV trouvé avec infos extraites:', cvDoc.extractedInfo);
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement utilisateur:', error);
      }
    } else {
      console.log('⚠️ Aucun utilisateur connecté');
      // Rediriger vers la page d'accueil si pas d'utilisateur
      window.location.href = '/';
    }
    setIsLoading(false);
  }, []);

  // Fonction pour gérer l'upload de CV
  const handleCvUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/cv-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setCvFile(file);
        setCvAnalysis(data.analysis);
        // Stocker les données du CV pour le matching
        localStorage.setItem('cvData', JSON.stringify({
          fileName: file.name,
          analysis: data.analysis,
          uploadedAt: new Date().toISOString()
        }));
      } else {
        setUploadError(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      setUploadError('Erreur de connexion lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour gérer le drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleCvUpload(files[0]);
    }
  };

  // Fonction pour ouvrir le sélecteur de fichiers
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Fonction pour gérer la sélection de fichier
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleCvUpload(file);
    }
  };

  // Affichage de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Affichage si pas d'utilisateur
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à votre profil</p>
          <a href="/" className="text-indigo-600 hover:text-indigo-500">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600 mt-2">Gérez vos informations personnelles et vos documents</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        value={currentUser.profile?.firstName || currentUser.firstName || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        value={currentUser.profile?.lastName || currentUser.lastName || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={currentUser.profile?.email || currentUser.email || ''}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={currentUser.profile?.phone || ''}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                          />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                    <input
                      type="text"
                      defaultValue="Paris, France"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    <input
                      type="url"
                      defaultValue="https://linkedin.com/in/johndoe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      rows={4}
                      defaultValue="Développeur Full Stack passionné avec 5 ans d'expérience dans le développement web moderne. Spécialisé en React, Node.js et architectures cloud."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      ✅ Vos informations ont été automatiquement remplies depuis votre CV uploadé lors de l'inscription.
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes Documents</h2>
                
                {/* CV Upload */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">CV</h3>
                  
                  {/* Input file caché */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {/* Zone de drag & drop */}
                  <div 
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors ${
                      isUploading ? 'border-indigo-500 bg-indigo-50' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-indigo-600 font-medium">Analyse du CV en cours...</p>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">Glissez-déposez votre CV ici ou</p>
                          <button 
                            onClick={handleBrowseClick}
                            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Parcourir les fichiers
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">PDF, DOC, DOCX, TXT jusqu'à 10MB</p>
                      </>
                    )}
                  </div>

                  {/* Erreur d'upload */}
                  {uploadError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{uploadError}</p>
                    </div>
                  )}

                  {/* CV uploadé avec succès */}
                  {cvFile && cvAnalysis && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-800 font-medium">✓ CV analysé avec succès</p>
                          <p className="text-green-700 text-sm">{cvFile.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-green-600">
                            {new Date().toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CV uploadé lors de l'inscription */}
                  {currentUser.documents && currentUser.documents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Documents disponibles</h4>
                      {currentUser.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                Uploadé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            {doc.type.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cover Letter Upload */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Lettre de motivation</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Glissez-déposez votre lettre de motivation ici ou</p>
                      <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Parcourir les fichiers
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">PDF, DOC, DOCX jusqu'à 5MB</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Lettre actuelle : <span className="font-medium">Lettre_Motivation_John_Doe.pdf</span></p>
                    <p className="text-xs text-gray-500">Dernière mise à jour : 10 janvier 2024</p>
                  </div>
                </div>

                {/* Additional Documents */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Documents supplémentaires</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Ajoutez des documents supplémentaires (portfolio, certifications...)</p>
                      <button className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Ajouter un document
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentUser.firstName} {currentUser.lastName}
                  </h3>
                  <p className="text-gray-600">Membre SkillMatchr</p>
                  <p className="text-sm text-gray-500">
                    Membre depuis {new Date(currentUser.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{currentUser.email}</span>
                  </div>
                  {currentUser.profile?.phone && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{currentUser.profile.phone}</span>
                    </div>
                  )}
                  {currentUser.documents && currentUser.documents.length > 0 && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-600">{currentUser.documents.length} document(s)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CV Analysis Summary */}
              {cvAnalysis && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations extraites du CV</h3>
                  <div className="space-y-4">
                    
                    {/* Informations personnelles extraites */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Informations détectées</h4>
                      <div className="space-y-2">
                        {cvAnalysis.firstName && (
                          <div className="flex items-center text-xs text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Prénom: {cvAnalysis.firstName}
                          </div>
                        )}
                        {cvAnalysis.lastName && (
                          <div className="flex items-center text-xs text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Nom: {cvAnalysis.lastName}
                          </div>
                        )}
                        {cvAnalysis.email && (
                          <div className="flex items-center text-xs text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Email: {cvAnalysis.email}
                          </div>
                        )}
                        {cvAnalysis.phone && (
                          <div className="flex items-center text-xs text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Téléphone: {cvAnalysis.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Statut de l'analyse */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-xs">
                        ✅ Analyse automatique réussie - {new Date().toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <a href="/jobs" className="block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    Voir les offres
                  </a>
                  <a href="/spontaneous" className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                    Candidature spontanée
                  </a>
                </div>
              </div>

              {/* Extension Chrome */}
              <ExtensionDownload />
            </div>
          </div>
        </div>
      </main>
      </div>
    </AuthGuard>
  );
} 