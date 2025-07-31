'use client';

import { useState } from 'react';
import UserMenu from './UserMenu';

export default function Navigation({ currentPage = "home" }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: "Accueil", page: "home" },
    { href: "/dashboard", label: "Dashboard", page: "dashboard" },
    { href: "/jobs", label: "Offres", page: "jobs" },
    { href: "/skills", label: "Compétences", page: "skills" },
    { href: "/cv-checker", label: "CV Checker", page: "cv-checker" },
    { href: "/lettre-motivation", label: "Lettre de Motivation", page: "lettre-motivation" },
    { href: "/spontaneous", label: "Candidatures spontanées", page: "spontaneous" },
    { href: "/profile", label: "Profil", page: "profile" },
    { href: "/how-it-works", label: "Comment ça marche", page: "how-it-works" },
    { href: "/pricing", label: "Tarifs", page: "pricing" },
    { href: "/faq", label: "FAQ", page: "faq" },
    { href: "/contact", label: "Contact", page: "contact" },
  ];

  const isActive = (page) => currentPage === page;

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
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`${
                  isActive(item.page)
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-700 hover:text-indigo-600"
                } transition-colors text-sm font-medium`}
              >
                {item.label}
              </a>
            ))}
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
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`block py-2 text-base font-medium transition-colors ${
                  isActive(item.page)
                    ? "text-indigo-600"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
} 