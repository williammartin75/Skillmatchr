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
    
    // Chemin vers le fichier utilisateur
    const userFilePath = path.join(process.cwd(), 'data', 'users', `${userId}.json`);
    
    if (!fs.existsSync(userFilePath)) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé'
      }, { status: 404 });
    }
    
    // Lire les données utilisateur
    const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
    
    // Récupérer le CV le plus récent
    const cvDocument = userData.documents?.find(doc => doc.type === 'cv');
    
    if (!cvDocument) {
      return NextResponse.json({
        success: false,
        hasCV: false,
        message: 'Aucun CV trouvé pour cet utilisateur'
      });
    }
    
    // Récupérer les données d'analyse complètes du CV
    const cvAnalysis = userData.matchingResults?.data?.cvAnalysis;
    
    return NextResponse.json({
      success: true,
      hasCV: true,
      cvData: {
        extractedInfo: cvAnalysis || cvDocument.extractedInfo, // Utiliser l'analyse complète si disponible
        uploadedAt: cvDocument.uploadedAt,
        fileName: cvDocument.name
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération CV:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 