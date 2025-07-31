import React from "react";


export default function FAQ() {
  const faqs = [
    {
      question: "Comment fonctionne SkillMatchr ?",
      answer: "SkillMatchr utilise l'IA pour analyser votre CV et trouver automatiquement les offres d'emploi qui correspondent à votre profil. Nos experts s'occupent ensuite de postuler pour vous avec des candidatures personnalisées."
    },
    {
      question: "Combien de temps faut-il pour voir les premiers résultats ?",
      answer: "La plupart de nos utilisateurs commencent à recevoir des appels d'entretien dans la semaine suivant l'activation de leur compte. Les résultats varient selon le marché et votre profil."
    },
    {
      question: "Puis-je choisir les entreprises où postuler ?",
      answer: "Oui, vous avez un contrôle total sur les candidatures. Vous pouvez approuver ou refuser chaque offre avant que nous postulions, et définir vos préférences d'entreprises."
    },
    {
      question: "Les candidatures sont-elles entièrement automatisées ?",
      answer: "Non, nous combinons l'IA et l'expertise humaine. L'IA trouve les offres et adapte les candidatures, mais nos experts révisent et soumettent chaque candidature pour garantir la qualité."
    },
    {
      question: "Dans quels pays opérez-vous ?",
      answer: "Nous opérons principalement en France et dans les pays francophones. Notre système est optimisé pour le marché français et européen."
    },
    {
      question: "Comment puis-je suivre mes candidatures ?",
      answer: "Notre tableau de bord vous permet de suivre en temps réel toutes vos candidatures, les réponses reçues et les entretiens programmés."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">


      {/* Main Content */}
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Questions Fréquemment Posées
            </h1>
            <p className="text-xl text-gray-600">
              Trouvez rapidement les réponses à vos questions sur SkillMatchr
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-indigo-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-gray-600 mb-6">
              Notre équipe d'experts est là pour vous aider
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Nous contacter
            </a>
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