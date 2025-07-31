'use client';

import { useState, useEffect, createContext, useContext } from 'react';

// Contexte pour l'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

// Provider pour l'authentification
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour créer ou mettre à jour une session
  const updateUserSession = async (userId) => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          action: 'update'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.success;
      }
    } catch (error) {
      console.error('Erreur mise à jour session:', error);
    }
    return false;
  };

  // Fonction pour vérifier si l'utilisateur est connecté
  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Vérifier si l'utilisateur a un ID valide
        if (userData && userData.id) {
          // Vérifier avec le serveur que l'utilisateur existe toujours
          try {
            const response = await fetch(`/api/auth/me?userId=${userData.id}`);
            const data = await response.json();
            
            if (data.success) {
              // Mettre à jour les données utilisateur avec celles du serveur
              const updatedUser = {
                ...data.user,
                isAuthenticated: true,
                lastLogin: new Date().toISOString()
              };
              
              // Mettre à jour la session utilisateur
              await updateUserSession(userData.id);
              
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              setUser(updatedUser);
            } else {
              // L'utilisateur n'existe plus sur le serveur
              localStorage.removeItem('currentUser');
              setUser(null);
            }
          } catch (error) {
            console.error('Erreur vérification utilisateur:', error);
            // En cas d'erreur, on garde l'utilisateur en local
            setUser(userData);
          }
        } else {
          localStorage.removeItem('currentUser');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      localStorage.removeItem('currentUser');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour se connecter
  const login = async (userData) => {
    const userWithSession = {
      ...userData,
      isAuthenticated: true,
      lastLogin: new Date().toISOString(),
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Créer une session pour l'utilisateur
    await updateUserSession(userData.id);
    
    localStorage.setItem('currentUser', JSON.stringify(userWithSession));
    setUser(userWithSession);
  };

  // Fonction pour se déconnecter
  const logout = async () => {
    if (user && user.id) {
      try {
        // Supprimer la session utilisateur
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            action: 'delete'
          })
        });
      } catch (error) {
        console.error('Erreur suppression session:', error);
      }
    }
    
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  // Mettre à jour l'activité utilisateur périodiquement
  useEffect(() => {
    if (user && user.id) {
      const interval = setInterval(async () => {
        await updateUserSession(user.id);
      }, 5 * 60 * 1000); // Toutes les 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 