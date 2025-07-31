import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Fonction pour créer le dossier sessions s'il n'existe pas
function ensureSessionsDirectory() {
  const sessionsDir = path.join(process.cwd(), 'data', 'sessions');
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }
  return sessionsDir;
}

// Fonction pour créer ou mettre à jour une session
function createOrUpdateSession(userId) {
  try {
    const sessionsDir = ensureSessionsDirectory();
    const sessionId = `session_${userId}`;
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    
    const now = new Date().toISOString();
    const session = {
      id: sessionId,
      userId: userId,
      createdAt: now,
      lastActivity: now,
      isActive: true
    };
    
    // Si la session existe déjà, mettre à jour lastActivity
    if (fs.existsSync(sessionPath)) {
      const existingSession = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      session.createdAt = existingSession.createdAt;
    }
    
    fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
    return session;
  } catch (error) {
    console.error('Erreur création/mise à jour session:', error);
    return null;
  }
}

// Fonction pour récupérer une session
function getSession(userId) {
  try {
    const sessionsDir = ensureSessionsDirectory();
    const sessionId = `session_${userId}`;
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    
    if (fs.existsSync(sessionPath)) {
      return JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    }
    return null;
  } catch (error) {
    console.error('Erreur récupération session:', error);
    return null;
  }
}

// Fonction pour supprimer une session (déconnexion)
function deleteSession(userId) {
  try {
    const sessionsDir = ensureSessionsDirectory();
    const sessionId = `session_${userId}`;
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur suppression session:', error);
    return false;
  }
}

export async function POST(request) {
  try {
    const { userId, action } = await request.json();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ID utilisateur requis'
      }, { status: 400 });
    }
    
    switch (action) {
      case 'create':
      case 'update':
        const session = createOrUpdateSession(userId);
        if (session) {
          return NextResponse.json({
            success: true,
            session: session
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Erreur création session'
          }, { status: 500 });
        }
        
      case 'get':
        const existingSession = getSession(userId);
        if (existingSession) {
          return NextResponse.json({
            success: true,
            session: existingSession
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Session non trouvée'
          }, { status: 404 });
        }
        
      case 'delete':
        const deleted = deleteSession(userId);
        if (deleted) {
          return NextResponse.json({
            success: true,
            message: 'Session supprimée'
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Erreur suppression session'
          }, { status: 500 });
        }
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Action non reconnue'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Erreur API session:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ID utilisateur requis'
      }, { status: 400 });
    }
    
    const session = getSession(userId);
    if (session) {
      return NextResponse.json({
        success: true,
        session: session
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Session non trouvée'
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error('Erreur API session GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}