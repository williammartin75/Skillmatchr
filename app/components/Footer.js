import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonne 1 - À propos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">À propos de SkillMatchr</h3>
            <p className="text-gray-300 text-sm">
              SkillMatchr révolutionne votre recherche d'emploi avec l'IA. 
              Nous analysons, optimisons et postulons pour vous.
            </p>
          </div>

          {/* Colonne 2 - Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/cv-checker" className="text-gray-300 hover:text-white transition-colors">
                  CV Checker
                </a>
              </li>
              <li>
                <a href="/motivation-checker" className="text-gray-300 hover:text-white transition-colors">
                  Motivation Checker
                </a>
              </li>
              <li>
                <a href="/jobs" className="text-gray-300 hover:text-white transition-colors">
                  Offres d'emploi
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 - Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="/contact" className="hover:text-white transition-colors">
                  Nous contacter
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} SkillMatchr. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}