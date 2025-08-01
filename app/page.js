"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "./lib/useAuth";

export default function Home() {
  const { user, loading, login } = useAuth();
  
  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!loading && user && user.id) {
      // Rediriger vers le profil si déjà connecté
      window.location.href = '/profile';
    }
  }, [user, loading]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const fileInputRef = useRef(null);

  // Import dynamique de la fonction d'extraction robuste
  const [extractPDFTextRobustFunc, setExtractPDFTextRobustFunc] = useState(null);
  
  useEffect(() => {
    // Charger la fonction d'extraction robuste au montage du composant
    import('./lib/robustPdfExtractor.js').then(module => {
      setExtractPDFTextRobustFunc(() => module.extractPDFTextRobust);
    }).catch(err => {
      console.error("Erreur lors du chargement de robustPdfExtractor:", err);
    });
  }, []);
  
  // Fonction de nettoyage du texte
  const cleanExtractedText = (text) => {
    return text
      .replace(/[﴾﴿]/g, (match) => match === '﴾' ? '(' : ')') // Parenthèses Unicode
      .replace(/[–—‐]/g, '-') // Tirets Unicode
      .replace(/[\u2018\u2019]/g, "'") // Apostrophes courbes
      .replace(/[\u201C\u201D]/g, '"') // Guillemets courbes
      .replace(/\u00A0/g, ' ') // Espaces insécables
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, '') // Caractères invisibles
      .replace(/[•▪▫◦‣⁃]/g, '-') // Uniformiser les puces
      .replace(/\n{3,}/g, '\n\n') // Supprimer les sauts de ligne excessifs
      .replace(/\s{3,}/g, '  ') // Normaliser les espaces multiples
      .trim();
  };

  // Fonction pour extraire le PDF côté client
  const extractPDFText = async (file) => {
    if (file.type !== 'application/pdf') {
      console.error("❌ Le fichier n'est pas un PDF");
      return null;
    }
    
    try {
      console.log("📄 Extraction PDF côté client...");
      
      // Utiliser la fonction d'extraction robuste si disponible
      if (extractPDFTextRobustFunc) {
        console.log("🚀 Utilisation de l'extraction robuste");
        const extractedText = await extractPDFTextRobustFunc(file);
        
        if (extractedText) {
          console.log("✅ Extraction PDF réussie avec la méthode robuste");
          console.log("📝 Texte extrait (premiers 500 caractères):", extractedText.substring(0, 500));
          return extractedText;
        } else {
          console.log("⚠️ L'extraction robuste n'a pas pu extraire de texte");
        }
      }
      
      // Fallback sur l'ancienne méthode si la robuste n'est pas disponible ou a échoué
      console.log("⚠️ Fallback sur l'ancienne méthode d'extraction");
      
      // Importer pdfjs-dist dynamiquement
      const pdfjsLib = await import('pdfjs-dist');
      
      // Configurer le worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      // Charger le fichier PDF
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      
      const pdf = await loadingTask.promise;
      let fullText = '';
      let hasExtractedText = false;
      
      // Extraire le texte de chaque page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Vérifier si nous avons réellement extrait du texte
        if (textContent.items && textContent.items.length > 0) {
          const pageText = textContent.items
            .map(item => item.str)
            .filter(str => str && str.trim().length > 0)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n';
            hasExtractedText = true;
          }
        }
      }
      
      // Vérifier si nous avons extrait du texte valide
      if (!hasExtractedText || fullText.trim().length < 10) {
        console.warn("⚠️ Aucun texte valide extrait du PDF. Le PDF pourrait être scanné ou protégé.");
        
        // Essayer de détecter si c'est du contenu binaire
        if (fullText.includes('endstream') || fullText.includes('endobj') || 
            fullText.match(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/)) {
          console.error("❌ Le contenu extrait semble être du code PDF binaire, pas du texte");
          return null;
        }
      }
      
      // Nettoyer le texte extrait seulement s'il est valide
      if (hasExtractedText && fullText.trim().length > 0) {
        fullText = cleanExtractedText(fullText);
        
        console.log("✅ Extraction PDF réussie côté client avec nettoyage");
        console.log("📝 Texte extrait et nettoyé (premiers 500 caractères):", fullText.substring(0, 500));
        
        return fullText;
      } else {
        console.error("❌ Impossible d'extraire du texte du PDF");
        return null;
      }
    } catch (error) {
      console.error("❌ Erreur extraction PDF côté client:", error);
      return null;
    }
  };

  // Fonction pour extraire les informations du CV via l'API
  const extractInfoFromCV = async (file) => {
    setIsProcessing(true);
    setError(""); // Réinitialiser les erreurs
    
    try {
      console.log("🔄 Préparation de l'envoi à l'API...");
      
      // Extraire le PDF côté client si c'est un PDF
      let extractedText = null;
      if (file.type === 'application/pdf') {
        extractedText = await extractPDFText(file);
      }
      
      // Créer un FormData pour l'envoi
      const formData = new FormData();
      formData.append('cv', file);
      
      // Ajouter le texte extrait si disponible
      if (extractedText) {
        formData.append('extractedText', extractedText);
        console.log("📤 Envoi du texte extrait côté client à l'API");
      }
      
      // Appeler l'API d'extraction
      const response = await fetch('/api/cv-upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("✅ Réponse de l'API reçue:", result);
      
      if (result.success && result.analysis && result.analysis.personalInfo) {
        const personalInfo = result.analysis.personalInfo;
        
        console.log("👤 Informations personnelles détectées:", personalInfo);
        
        // Mettre à jour les informations extraites
        setExtractedInfo({
          firstName: personalInfo.firstName || "",
          lastName: personalInfo.lastName || "",
          email: personalInfo.email || "",
          phone: personalInfo.phone || ""
        });
        
        // Pré-remplir le formulaire avec les informations trouvées
        setFormData(prev => ({
          ...prev,
          firstName: personalInfo.firstName || prev.firstName,
          lastName: personalInfo.lastName || prev.lastName,
          email: personalInfo.email || prev.email
        }));
        
        console.log("✅ Formulaire pré-rempli avec succès");
        
      } else {
        console.log("⚠️ Aucune information personnelle détectée");
        setError("Aucune information personnelle détectée dans le CV. Vérifiez que le fichier contient bien votre nom et email.");
      }
      
    } catch (error) {
      console.error("❌ Erreur lors de l'extraction:", error);
      setError("Erreur lors de l'extraction des informations du CV: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour extraire le texte d'un fichier
  const extractTextFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let text = "";
          
          console.log("Type de fichier:", file.type);
          console.log("Nom du fichier:", file.name);
          
          if (file.type === 'application/pdf') {
            // Pour les PDF, on va essayer de lire le contenu même si c'est limité
            console.log("PDF détecté - tentative d'extraction");
            text = e.target.result;
            console.log("Contenu PDF brut:", text.substring(0, 500));
            
            // Si le contenu semble vide ou corrompu, on affiche un message d'aide
            if (text.length < 100 || text.includes('') || text.includes('\\x')) {
              text = "Le contenu PDF n'a pas pu être extrait correctement. Pour une extraction optimale, veuillez :\n1. Convertir votre CV en format .txt ou .doc\n2. Ou copier-coller le contenu de votre CV dans un fichier .txt";
              console.log("Contenu PDF non lisible, message d'aide affiché");
            }
          } else {
            // Pour les fichiers texte (.txt, .doc, .docx)
            text = e.target.result;
            console.log("Fichier texte détecté - extraction complète");
          }
          
          console.log("=== TEXTE COMPLET EXTRAIT ===");
          console.log(text);
          console.log("=== FIN DU TEXTE ===");
          console.log("Longueur du texte:", text.length);
          console.log("Premiers 200 caractères:", text.substring(0, 200));
          
          resolve(text);
        } catch (error) {
          console.error("Erreur lors de la lecture du fichier:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Erreur FileReader:", error);
        reject(error);
      };
      
      // On lit toujours comme du texte
      reader.readAsText(file);
    });
  };

  // Gestionnaire de changement de fichier
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      extractInfoFromCV(file);
    }
  };

  // Gestionnaire de drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      extractInfoFromCV(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation des champs
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (!termsAccepted) {
      setError("Vous devez accepter les termes et conditions");
      return;
    }
    
    setIsCreatingAccount(true);
    
    try {
      console.log("🚀 Création du compte en cours...");
      
      // Créer un FormData pour l'envoi
      const submitFormData = new FormData();
      submitFormData.append('firstName', formData.firstName);
      submitFormData.append('lastName', formData.lastName);
      submitFormData.append('email', formData.email);
      submitFormData.append('password', formData.password);
      submitFormData.append('confirmPassword', formData.confirmPassword);
      submitFormData.append('termsAccepted', termsAccepted.toString());
      
      // Ajouter le CV si uploadé
      if (uploadedFile) {
        submitFormData.append('cv', uploadedFile);
      }
      
      // Ajouter les informations extraites si disponibles
      if (extractedInfo) {
        submitFormData.append('extractedInfo', JSON.stringify(extractedInfo));
      }
      
      // Appeler l'API de création de compte
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: submitFormData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess("Compte créé avec succès ! Redirection vers votre profil...");
        console.log("✅ Compte créé:", data.user);
        
        // Connecter l'utilisateur via le hook d'authentification
        login(data.user);
        
        // Rediriger vers le profil après 2 secondes
        setTimeout(() => {
          window.location.href = '/profile';
        }, 2000);
      } else {
        setError(data.error || "Erreur lors de la création du compte");
      }
    } catch (error) {
      console.error("❌ Erreur création compte:", error);
      setError("Erreur de connexion lors de la création du compte");
    } finally {
      setIsCreatingAccount(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Nous postulons, <span className="text-indigo-600">vous réussissez</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Téléchargez simplement votre CV — nos experts et l'IA s'occupent du reste ! 
            Trouvez un emploi plus rapidement avec des candidatures personnalisées et un accompagnement sur mesure.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">30,000+</div>
              <div className="text-gray-600">utilisateurs satisfaits</div>
            </div>
          </div>

          {/* Inscription Section */}
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Rejoignez SkillMatchr</h3>
            
            {/* OAuth Buttons */}
            <div className="space-y-4 mb-8">
              <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>
              
              <button className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Continuer avec LinkedIn
              </button>
            </div>
            
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>
            
            {/* Upload CV Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Uploader votre CV</h4>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  uploadedFile 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-indigo-600 mb-2">Analyse de votre CV en cours...</p>
                    <p className="text-sm text-gray-500">Extraction des informations personnelles</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-600 mb-2 font-medium">CV uploadé avec succès !</p>
                    <p className="text-sm text-gray-600 mb-2">{uploadedFile.name}</p>
                    {extractedInfo && (
                      <div className="bg-white p-3 rounded-lg border text-left w-full max-w-xs">
                        <p className="text-xs text-gray-500 mb-1">Informations détectées :</p>
                        {extractedInfo.firstName && <p className="text-sm font-mono">Prénom: {extractedInfo.firstName}</p>}
                        {extractedInfo.lastName && <p className="text-sm font-mono">Nom: {extractedInfo.lastName}</p>}
                        {extractedInfo.email && <p className="text-sm font-mono">Email: {extractedInfo.email}</p>}
                        {extractedInfo.phone && <p className="text-sm font-mono">Téléphone: {extractedInfo.phone}</p>}
                      </div>
                    )}
                    <button 
                      className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        setExtractedInfo(null);
                        setFormData({
                          firstName: "",
                          lastName: "",
                          email: "",
                          password: "",
                          confirmPassword: ""
                        });
                      }}
                    >
                      Changer de fichier
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-gray-600 mb-2">Glissez-déposez votre CV ici</p>
                    <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX (max 5MB)</p>
                    <p className="text-xs text-indigo-600">Nous détecterons automatiquement vos informations</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* Affichage des erreurs */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
            
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>
            
            {/* Formulaire d'inscription */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Créer un compte</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        extractedInfo?.firstName ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                      placeholder="Votre prénom"
                    />
                    {extractedInfo?.firstName && (
                      <p className="text-xs text-green-600 mt-1">✓ Détecté automatiquement</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        extractedInfo?.lastName ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                      placeholder="Votre nom"
                    />
                    {extractedInfo?.lastName && (
                      <p className="text-xs text-green-600 mt-1">✓ Détecté automatiquement</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      extractedInfo?.email ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="votre.email@exemple.com"
                  />
                  {extractedInfo?.email && (
                    <p className="text-xs text-green-600 mt-1">✓ Détecté automatiquement</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Créez un mot de passe sécurisé"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Confirmez votre mot de passe"
                  />
                </div>
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    J'accepte les <a href="/terms" className="text-indigo-600 hover:text-indigo-500">termes et conditions</a> ainsi que la <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">politique de confidentialité</a>
                  </label>
                </div>
                
                {/* Affichage des erreurs */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                {/* Affichage du succès */}
                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing || isCreatingAccount}
                >
                  {isCreatingAccount ? 'Création du compte...' : isProcessing ? 'Traitement en cours...' : 'Créer mon compte'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors">
              Voir comment ça marche
            </button>
          </div>
        </div>
      </section>



      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Candidatures intelligentes, zéro effort. Nous trouvons, adaptons et soumettons des emplois pendant que vous dormez.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">CV et Lettres de Motivation Personnalisés</h3>
              <p className="text-gray-600">
                Utilisez la créativité de l'IA et contrôlez le contenu avec notre flux utilisateur de pointe pour des CV et lettres de motivation personnalisés.
              </p>
            </div>

            {/* Service Card 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Candidatures Automatiques</h3>
              <p className="text-gray-600">
                Notre système trouve et postule automatiquement aux offres qui correspondent à votre profil, 24h/24.
              </p>
            </div>

            {/* Service Card 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Support Expert 24/7</h3>
              <p className="text-gray-600">
                Une équipe d'experts disponible en permanence pour vous accompagner dans votre recherche d'emploi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Histoires de Réussite</h2>
            <p className="text-xl text-gray-600">Découvrez ce qui fait tout le buzz</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Jessica Tills",
                role: "Coordinatrice Marketing",
                quote: "Grâce à SkillMatchr, je peux me concentrer davantage sur la préparation des entretiens plutôt que sur le remplissage des formulaires de candidature."
              },
              {
                name: "David Keane",
                role: "Développeur Logiciel",
                quote: "Simple à utiliser et vraiment efficace. J'ai commencé à recevoir des appels d'entretien dans la semaine suivant l'utilisation de SkillMatchr."
              },
              {
                name: "Emily Carter",
                role: "Responsable Commerciale",
                quote: "SkillMatchr a rendu le processus de candidature tellement plus facile ! Je recommande vivement à tous ceux qui cherchent un emploi."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Votre Partenaire Ultime de Recherche d'Emploi
            </h2>
            <p className="text-xl text-gray-600">
              IA et expertise humaine pour une recherche d'emploi optimale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Candidatures Sans Effort", description: "La précision de l'IA rencontre l'expertise humaine pour créer des candidatures exceptionnelles." },
              { title: "CV et Réponses Personnalisés", description: "CV, lettres de motivation et réponses créatives — créés par l'IA, affinés par des experts." },
              { title: "Support 24/7", description: "L'accompagnement expert est toujours disponible pour maintenir votre recherche d'emploi sur la bonne voie." },
              { title: "Gagner du Temps", description: "Évitez les heures fastidieuses — nous gérons la recherche d'emploi pendant que vous vous concentrez sur les entretiens." },
              { title: "Accès Exclusif aux Emplois", description: "Accédez à des opportunités introuvables sur les sites d'emploi traditionnels grâce à nos partenariats." },
              { title: "Ciblage Intelligent", description: "Stratégies basées sur les données et examens d'experts pour aligner vos compétences avec les rôles parfaits." }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à Transformer Votre Recherche d'Emploi ?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui ont trouvé leur emploi de rêve grâce à SkillMatchr
          </p>
          <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
            Commencer Maintenant
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SkillMatchr</h3>
              <p className="text-gray-400">
                Améliorez votre recherche d'emploi : SkillMatchr combine l'IA et l'aide experte pour postuler, personnaliser les CV et rédiger des lettres de motivation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">Accueil</a></li>
                <li><a href="/how-it-works" className="hover:text-white">Comment ça marche</a></li>
                <li><a href="/pricing" className="hover:text-white">Tarifs</a></li>
                <li><a href="/faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/terms" className="hover:text-white">Conditions</a></li>
                <li><a href="/privacy" className="hover:text-white">Confidentialité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 SkillMatchr. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
