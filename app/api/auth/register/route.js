import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Fonction pour créer le dossier utilisateur s'il n'existe pas
function ensureUserDirectory(userId) {
  const userDir = path.join(process.cwd(), 'public', 'uploads', 'users', userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
}

// Fonction pour sauvegarder le CV
async function saveCV(file, userId) {
  const userDir = ensureUserDirectory(userId);
  const fileName = `cv-${Date.now()}-${file.name}`;
  const filePath = path.join(userDir, fileName);
  
  // Convertir le File en Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Créer le fichier
  fs.writeFileSync(filePath, buffer);
  
  return {
    fileName,
    filePath: `/uploads/users/${userId}/${fileName}`,
    originalName: file.name
  };
}

// Fonction pour déclencher le matching automatique
async function triggerMatching(userId, extractedInfo) {
  try {
    console.log('🤖 Déclenchement du matching automatique pour:', userId);
    
    // Appeler l'API de matching avec les données du CV
    const matchingResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006'}/api/matching`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        cvData: extractedInfo,
        triggerSource: 'account_creation'
      })
    });
    
    if (matchingResponse.ok) {
      const matchingResult = await matchingResponse.json();
      console.log('✅ Matching automatique réussi:', matchingResult);
      return matchingResult;
    } else {
      console.log('⚠️ Matching automatique échoué:', matchingResponse.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur matching automatique:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extraire les données du formulaire
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const termsAccepted = formData.get('termsAccepted') === 'true';
    const cvFile = formData.get('cv');
    const extractedInfo = formData.get('extractedInfo');
    
    console.log('📝 Données reçues pour inscription:', {
      firstName,
      lastName,
      email,
      termsAccepted,
      hasCV: !!cvFile,
      hasExtractedInfo: !!extractedInfo
    });
    
    // Validation des champs obligatoires
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'Tous les champs sont obligatoires'
      }, { status: 400 });
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Format d\'email invalide'
      }, { status: 400 });
    }
    
    // Validation des mots de passe
    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'Les mots de passe ne correspondent pas'
      }, { status: 400 });
    }
    
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      }, { status: 400 });
    }
    
    // Validation des termes
    if (!termsAccepted) {
      return NextResponse.json({
        success: false,
        error: 'Vous devez accepter les termes et conditions'
      }, { status: 400 });
    }
    
    // Générer un ID utilisateur unique
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Créer l'objet utilisateur
    const user = {
      id: userId,
      firstName,
      lastName,
      email,
      password: password, // En production, il faudrait hasher le mot de passe
      createdAt: new Date().toISOString(),
      profile: {
        firstName,
        lastName,
        email,
        phone: extractedInfo ? JSON.parse(extractedInfo).phone || '' : '',
        address: '',
        skills: [],
        experience: [],
        education: []
      },
      documents: []
    };
    
    // Sauvegarder le CV si fourni
    if (cvFile) {
      try {
        const cvInfo = await saveCV(cvFile, userId);
        const extractedInfoParsed = extractedInfo ? JSON.parse(extractedInfo) : null;
        
        user.documents.push({
          id: `doc_${Date.now()}`,
          name: cvInfo.originalName,
          type: 'cv',
          path: cvInfo.filePath,
          uploadedAt: new Date().toISOString(),
          extractedInfo: extractedInfoParsed
        });
        console.log('✅ CV sauvegardé:', cvInfo.fileName);
        
        // Déclencher le matching automatique avec Llama
        if (extractedInfoParsed) {
          console.log('🚀 Déclenchement du matching automatique...');
          const matchingResult = await triggerMatching(userId, extractedInfoParsed);
          
          if (matchingResult) {
            user.matchingResults = matchingResult;
            console.log('✅ Matching automatique terminé et sauvegardé');
          }
        }
      } catch (error) {
        console.error('❌ Erreur sauvegarde CV:', error);
        return NextResponse.json({
          success: false,
          error: 'Erreur lors de la sauvegarde du CV'
        }, { status: 500 });
      }
    }
    
    // Sauvegarder les données utilisateur
    const usersDir = path.join(process.cwd(), 'data', 'users');
    if (!fs.existsSync(usersDir)) {
      fs.mkdirSync(usersDir, { recursive: true });
    }
    
    const userFilePath = path.join(usersDir, `${userId}.json`);
    fs.writeFileSync(userFilePath, JSON.stringify(user, null, 2));
    
    console.log('✅ Utilisateur créé avec succès:', userId);
    
    // Retourner la réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profile: user.profile,
        documents: user.documents
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur création compte:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 