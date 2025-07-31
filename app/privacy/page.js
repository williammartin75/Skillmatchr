import React from "react";


export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Politique de confidentialité</h1>
            <p className="text-gray-600 mt-2">Dernière mise à jour : 15 janvier 2024</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="prose prose-lg max-w-none">
              <h2>1. Introduction</h2>
              <p>
                SkillMatchr s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, 
                utilisons et protégeons vos informations personnelles lorsque vous utilisez notre service.
              </p>

              <h2>2. Informations que nous collectons</h2>
              <h3>2.1 Informations que vous nous fournissez</h3>
              <ul>
                <li>Informations de profil (nom, email, téléphone, localisation)</li>
                <li>CV et lettre de motivation</li>
                <li>Préférences de recherche d'emploi</li>
                <li>Historique des candidatures</li>
                <li>Données de connexion (identifiants)</li>
              </ul>

              <h3>2.2 Informations collectées automatiquement</h3>
              <ul>
                <li>Données de navigation (pages visitées, temps passé)</li>
                <li>Adresse IP et informations techniques</li>
                <li>Cookies et technologies similaires</li>
                <li>Données d'utilisation de l'application</li>
              </ul>

              <h2>3. Utilisation de vos informations</h2>
              <p>Nous utilisons vos informations pour :</p>
              <ul>
                <li>Fournir nos services de recherche d'emploi</li>
                <li>Analyser votre profil et vos compétences</li>
                <li>Rechercher des offres d'emploi pertinentes</li>
                <li>Envoyer des candidatures automatiques</li>
                <li>Suivre vos candidatures et leurs statuts</li>
                <li>Améliorer nos services et l'expérience utilisateur</li>
                <li>Communiquer avec vous concernant nos services</li>
                <li>Respecter nos obligations légales</li>
              </ul>

              <h2>4. Partage de vos informations</h2>
              <p>Nous ne vendons jamais vos informations personnelles. Nous pouvons partager vos informations avec :</p>
              <ul>
                <li>Les employeurs lorsque vous postulez à une offre</li>
                <li>Nos prestataires de services (hébergement, paiement, analyse)</li>
                <li>Les autorités si requis par la loi</li>
                <li>D'autres utilisateurs uniquement avec votre consentement explicite</li>
              </ul>

              <h2>5. Sécurité des données</h2>
              <p>
                Nous mettons en place des mesures de sécurité appropriées pour protéger vos informations :
              </p>
              <ul>
                <li>Chiffrement des données en transit et au repos</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Surveillance continue de nos systèmes</li>
                <li>Formation de notre personnel à la sécurité</li>
                <li>Sauvegardes régulières et sécurisées</li>
              </ul>

              <h2>6. Conservation des données</h2>
              <p>
                Nous conservons vos informations personnelles aussi longtemps que nécessaire pour fournir nos services 
                ou comme requis par la loi. Vous pouvez demander la suppression de vos données à tout moment.
              </p>

              <h2>7. Vos droits</h2>
              <p>Conformément au RGPD, vous avez les droits suivants :</p>
              <ul>
                <li><strong>Droit d'accès :</strong> Demander une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger des informations inexactes</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                <li><strong>Droit de limitation :</strong> Limiter le traitement de vos données</li>
              </ul>

              <h2>8. Cookies et technologies similaires</h2>
              <p>
                Nous utilisons des cookies et des technologies similaires pour :
              </p>
              <ul>
                <li>Mémoriser vos préférences</li>
                <li>Analyser l'utilisation de notre site</li>
                <li>Améliorer nos services</li>
                <li>Personnaliser votre expérience</li>
              </ul>
              <p>
                Vous pouvez contrôler l'utilisation des cookies via les paramètres de votre navigateur.
              </p>

              <h2>9. Transferts internationaux</h2>
              <p>
                Vos données peuvent être transférées et traitées dans des pays autres que votre pays de résidence. 
                Nous nous assurons que ces transferts respectent les standards de protection des données appropriés.
              </p>

              <h2>10. Protection des mineurs</h2>
              <p>
                Notre service n'est pas destiné aux personnes de moins de 16 ans. Nous ne collectons pas sciemment 
                d'informations personnelles auprès de mineurs sans le consentement parental.
              </p>

              <h2>11. Modifications de cette politique</h2>
              <p>
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
                Les modifications importantes seront notifiées via notre site web ou par email.
              </p>

              <h2>12. Contact</h2>
              <p>
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous :
              </p>
              <p>
                <strong>Délégué à la protection des données :</strong><br />
                Email : privacy@skillmatchr.com<br />
                Adresse : 123 Rue de l'Innovation, 75001 Paris, France<br />
                Téléphone : +33 1 23 45 67 89
              </p>

              <h2>13. Autorité de contrôle</h2>
              <p>
                Vous avez le droit de déposer une plainte auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) 
                si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD.
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