import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Skillmatchr</h3>
            <p className="text-gray-400 text-sm">
              Nous postulons, vous réussissez.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/cv-checker" className="hover:text-white">CV Checker</a></li>
              <li><a href="/lettre-motivation" className="hover:text-white">Lettre de Motivation</a></li>
              <li><a href="/jobs" className="hover:text-white">Offres d'emploi</a></li>
              <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Entreprise</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/how-it-works" className="hover:text-white">Comment ça marche</a></li>
              <li><a href="/pricing" className="hover:text-white">Tarifs</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
              <li><a href="/faq" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Légal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/terms" className="hover:text-white">Conditions d'utilisation</a></li>
              <li><a href="/privacy" className="hover:text-white">Politique de confidentialité</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2024 Skillmatchr. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}