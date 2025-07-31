import React from "react";


export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "29",
      period: "mois",
      description: "Parfait pour commencer votre recherche d'emploi",
      features: [
        "Jusqu'à 50 candidatures par mois",
        "CV personnalisé par offre",
        "Lettres de motivation générées par IA",
        "Support par email",
        "Tableau de bord de suivi",
        "Notifications par email"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "79",
      period: "mois",
      description: "Le choix le plus populaire pour les chercheurs d'emploi actifs",
      features: [
        "Jusqu'à 200 candidatures par mois",
        "CV et lettres personnalisés par offre",
        "Support prioritaire par chat",
        "Analyse de compatibilité avancée",
        "Suivi des candidatures en temps réel",
        "Rapports de performance",
        "Accès aux offres exclusives"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "149",
      period: "mois",
      description: "Pour les professionnels expérimentés qui veulent maximiser leurs chances",
      features: [
        "Candidatures illimitées",
        "CV et lettres premium",
        "Support dédié 24/7",
        "Consultation RH personnalisée",
        "Optimisation de profil LinkedIn",
        "Simulation d'entretiens",
        "Accès prioritaire aux nouvelles fonctionnalités"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">


      {/* Main Content */}
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez le plan qui correspond le mieux à vos besoins. Tous nos plans incluent une garantie de satisfaction de 30 jours.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl shadow-lg p-8 relative ${
                  plan.popular ? 'ring-2 ring-indigo-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Le plus populaire
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.popular ? 'Commencer maintenant' : 'Choisir ce plan'}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg p-12 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions sur nos tarifs ?
              </h2>
              <p className="text-xl text-gray-600">
                Trouvez rapidement les réponses à vos questions
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Puis-je changer de plan à tout moment ?
                </h3>
                <p className="text-gray-600">
                  Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements prennent effet immédiatement.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Y a-t-il des frais cachés ?
                </h3>
                <p className="text-gray-600">
                  Non, nos tarifs sont transparents. Le prix affiché est le prix que vous payez, sans frais supplémentaires.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Offrez-vous un essai gratuit ?
                </h3>
                <p className="text-gray-600">
                  Oui, nous offrons un essai gratuit de 7 jours sur tous nos plans. Aucune carte de crédit requise.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Que se passe-t-il si je ne suis pas satisfait ?
                </h3>
                <p className="text-gray-600">
                  Nous offrons une garantie de satisfaction de 30 jours. Si vous n'êtes pas satisfait, nous vous remboursons intégralement.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Rejoignez des milliers d'utilisateurs qui ont trouvé leur emploi de rêve
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors">
                Commencer l'essai gratuit
              </button>
              <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors">
                Nous contacter
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