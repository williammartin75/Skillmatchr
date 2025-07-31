import './globals.css'
import { AuthProvider } from './lib/useAuth'
import Navigation from './components/Navigation'

export const metadata = {
  title: 'SkillMatchr - Nous postulons, vous réussissez',
  description: 'Téléchargez simplement votre CV — nos experts et l\'IA s\'occupent du reste ! Trouvez un emploi plus rapidement avec des candidatures personnalisées.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
