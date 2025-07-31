import React from "react";


export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Téléchargez votre CV",
      description: "Uploadez votre CV actuel et nous l'analyserons pour identifier vos compétences et expériences clés.",
      icon: "📄"
    },
    {
      number: "02",
      title: "Définissez vos préférences",
      description: "Spécifiez vos critères : localisation, type de contrat, salaire souhaité, secteurs d'activité.",
      icon: "🎯"
    },
    {
      number: "03",
      title: "L'IA trouve les offres",
      description: "Notre intelligence artificielle scanne en permanence les sites d'emploi pour trouver les offres qui correspondent à votre profil.",
      icon: "🤖"
    },
    {
      number: "04",
      title: "Personnalisation automatique",
      description: "L'IA adapte votre CV et génère des lettres de motivation personnalisées pour chaque offre.",
      icon: "✨"
    },
    {
      number: "05",
      title: "Validation par nos experts",
      description: "Nos experts RH révisent chaque candidature pour garantir la qualité et l'efficacité.",
      icon: "👥"
    },
    {
      number: "06",
      title: "Candidature automatique",
      description: "Nous postulons automatiquement pour vous et vous tenons informé de chaque candidature envoyée.",
      icon: "🚀"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">


      {/* Main Content */}
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment SkillMatchr révolutionne votre recherche d'emploi en combinant l'intelligence artificielle et l'expertise humaine
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-xl shadow-lg p-12 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Pourquoi choisir SkillMatchr ?
              </h2>
              <p className="text-xl text-gray-600">
                Une approche unique qui combine technologie et expertise humaine
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rapidité</h3>
                <p className="text-gray-600">Postulez à des centaines d'offres en quelques heures</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualité</h3>
                <p className="text-gray-600">Chaque candidature est révisée par nos experts RH</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personnalisation</h3>
                <p className="text-gray-600">CV et lettres adaptés à chaque offre d'emploi</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Prêt à transformer votre recherche d'emploi ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Rejoignez des milliers d'utilisateurs qui ont trouvé leur emploi de rêve
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors">
                Commencer maintenant
              </button>
              <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors">
                Voir les tarifs
              </button>
            </div>
          </div>
        </div>
      </main>

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