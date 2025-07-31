'use client';

import { useState } from 'react';
import UserMenu from './UserMenu';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">SkillMatchr</h1>
          </div>
          
          {/* Navigation desktop */}
          <nav className="hidden lg:flex space-x-6">
            <a href="/" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">Accueil</a>
            <a href="/dashboard" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">Dashboard</a>
            <a href="/jobs" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">Offres</a>
            <a href="/skills" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">Compétences</a>
            <a href="/cv-checker" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">CV Checker</a>
            <a href="/lettre-motivation" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">Lettre de Motivation</a>
            <a href="/spontaneous" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">Candidatures spontanées</a>
            <a href="/profile" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">Profil</a>
            <a href="/how-it-works" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">Comment ça marche</a>
            <a href="/pricing" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">Tarifs</a>
            <a href="/faq" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">FAQ</a>
            <a href="/contact" className="text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium">Contact</a>
          </nav>
          
          {/* Menu mobile pour les écrans moyens et petits */}
          <div className="lg:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="text-gray-700 hover:text-indigo-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            {/* Menu utilisateur */}
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-4 py-6 space-y-4">
            <a 
              href="/" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </a>
            <a 
              href="/dashboard" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </a>
            <a 
              href="/jobs" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Offres
            </a>
            <a 
              href="/skills" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Compétences
            </a>
            <a 
              href="/cv-checker" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              CV Checker
            </a>
            <a 
              href="/lettre-motivation" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Lettre de Motivation
            </a>
            <a 
              href="/spontaneous" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Candidatures spontanées
            </a>
            <a 
              href="/profile" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profil
            </a>
            <a 
              href="/how-it-works" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Comment ça marche
            </a>
            <a 
              href="/pricing" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tarifs
            </a>
            <a 
              href="/faq" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </a>
            <a 
              href="/contact" 
              className="block text-gray-700 hover:text-indigo-600 transition-colors py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
} 