import React from "react";

export default function Navbar({ currentPage = "home" }) {
  const navigationItems = [
    { href: "/", label: "Accueil", page: "home" },
    { href: "/jobs", label: "Offres", page: "jobs" },
    { href: "/skills", label: "Compétences", page: "skills" },
    { href: "/cv-checker", label: "CV Checker", page: "cv-checker" },
    { href: "/motivation-checker", label: "Motivation Checker", page: "motivation-checker" },
    { href: "/lettre-motivation", label: "Lettre de Motivation", page: "lettre-motivation" },
    { href: "/dashboard", label: "Dashboard", page: "dashboard" },
    { href: "/profile", label: "Profil", page: "profile" },
    { href: "/how-it-works", label: "Comment ça marche", page: "how-it-works" },
  ];

  const isActive = (page) => currentPage === page;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">SkillMatchr</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`${
                  isActive(item.page)
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-700 hover:text-indigo-600"
                } transition-colors`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="text-gray-700 hover:text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">JD</span>
              </div>
              <span className="text-gray-700 font-medium">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 