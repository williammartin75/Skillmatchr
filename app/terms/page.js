import React from "react";


export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Conditions d'utilisation</h1>
            <p className="text-gray-600 mt-2">Dernière mise à jour : 15 janvier 2024</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="prose prose-lg max-w-none">
              <h2>1. Acceptation des conditions</h2>
              <p>
                En accédant et en utilisant le service SkillMatchr, vous acceptez d'être lié par ces conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>

              <h2>2. Description du service</h2>
              <p>
                SkillMatchr est une plateforme de recherche d'emploi qui utilise l'intelligence artificielle pour :
              </p>
              <ul>
                <li>Analyser votre CV et vos compétences</li>
                <li>Rechercher des offres d'emploi pertinentes</li>
                <li>Envoyer automatiquement des candidatures</li>
                <li>Suivre vos candidatures et leurs statuts</li>
                <li>Fournir des analyses de marché et des conseils</li>
              </ul>

              <h2>3. Inscription et compte utilisateur</h2>
              <p>
                Pour utiliser nos services, vous devez créer un compte en fournissant des informations exactes et à jour. 
                Vous êtes responsable de maintenir la confidentialité de vos identifiants de connexion.
              </p>

              <h2>4. Utilisation du service</h2>
              <p>Vous vous engagez à :</p>
              <ul>
                <li>Utiliser le service uniquement à des fins légales</li>
                <li>Ne pas tenter d'accéder à des comptes d'autres utilisateurs</li>
                <li>Ne pas utiliser le service pour envoyer du spam ou du contenu malveillant</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Fournir des informations véridiques dans vos candidatures</li>
              </ul>

              <h2>5. Protection des données</h2>
              <p>
                Nous collectons et traitons vos données personnelles conformément à notre politique de confidentialité. 
                Vos données sont utilisées pour fournir nos services et améliorer votre expérience.
              </p>

              <h2>6. Propriété intellectuelle</h2>
              <p>
                Le contenu de SkillMatchr, y compris les textes, images, logos et logiciels, est protégé par les droits de propriété intellectuelle. 
                Vous ne pouvez pas reproduire, distribuer ou modifier ce contenu sans autorisation.
              </p>

              <h2>7. Limitation de responsabilité</h2>
              <p>
                SkillMatchr s'efforce de fournir un service de qualité mais ne peut garantir :
              </p>
              <ul>
                <li>L'obtention d'un emploi</li>
                <li>L'exactitude de toutes les informations d'offres d'emploi</li>
                <li>La disponibilité continue du service</li>
                <li>L'absence d'erreurs techniques</li>
              </ul>

              <h2>8. Tarification et paiement</h2>
              <p>
                Certains services peuvent être payants. Les tarifs sont affichés sur notre page de tarification. 
                Les paiements sont effectués via des prestataires de paiement sécurisés.
              </p>

              <h2>9. Résiliation</h2>
              <p>
                Vous pouvez résilier votre compte à tout moment. Nous pouvons également suspendre ou résilier votre compte 
                en cas de violation de ces conditions.
              </p>

              <h2>10. Modifications des conditions</h2>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications seront notifiées via notre site web ou par email.
              </p>

              <h2>11. Droit applicable</h2>
              <p>
                Ces conditions sont régies par le droit français. 
                Tout litige sera soumis à la compétence des tribunaux français.
              </p>

              <h2>12. Contact</h2>
              <p>
                Pour toute question concernant ces conditions, contactez-nous à :<br />
                Email : legal@skillmatchr.com<br />
                Adresse : 123 Rue de l'Innovation, 75001 Paris, France
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SkillMatchr</h3>
              <p className="text-gray-400">
                Nous postulons, vous réussissez. Trouvez votre prochain emploi avec l'aide de l'IA.
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
            <p>&copy; 2024 SkillMatchr. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 