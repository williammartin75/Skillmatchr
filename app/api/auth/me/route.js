import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    // Récupérer l'ID utilisateur depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ID utilisateur requis'
      }, { status: 400 });
    }
    
    // Vérifier si le fichier utilisateur existe
    const userFilePath = path.join(process.cwd(), 'data', 'users', `${userId}.json`);
    
    if (!fs.existsSync(userFilePath)) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé'
      }, { status: 404 });
    }
    
    // Lire les données utilisateur
    const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
    
    // Retourner les données utilisateur (sans le mot de passe)
    const { password, ...safeUserData } = userData;
    
    return NextResponse.json({
      success: true,
      user: {
        ...safeUserData,
        isAuthenticated: true,
        lastLogin: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 