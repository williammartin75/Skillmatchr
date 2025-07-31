"use client";

import React from 'react';

export default function MonthlyChart({ monthlyData }) {
  console.log('=== DÉBUT MonthlyChart ===');
  console.log('MonthlyChart data reçu:', monthlyData);
  console.log('Type de monthlyData:', typeof monthlyData);
  console.log('Longueur de monthlyData:', monthlyData ? monthlyData.length : 'null/undefined');
  console.log('Contenu détaillé:', JSON.stringify(monthlyData, null, 2));
  
  if (!monthlyData || monthlyData.length === 0) {
    console.log('MonthlyChart - Aucune donnée, affichage du message d\'erreur');
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Aucune donnée disponible</p>
          <p className="text-xs text-gray-400">monthlyData: {JSON.stringify(monthlyData)}</p>
        </div>
      </div>
    );
  }

  // Filtrer seulement les mois avec des données
  const monthsWithData = monthlyData.filter(month => month.total > 0);
  
  if (monthsWithData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  // Trouver la valeur maximale pour l'échelle (utiliser CV envoyé comme référence principale)
  const maxCvEnvoye = Math.max(...monthsWithData.map(month => month.cvEnvoye), 1);
  const chartHeight = 200;
  const segmentHeight = 50; // Hauteur fixe pour tous les segments
  const maxBarWidth = 300; // Largeur maximale d'une barre
  const minBarWidth = 80; // Largeur minimale d'une barre

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Évolution mensuelle des candidatures</h3>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded mr-1"></div>
            <span>CV envoyé</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span>Entretiens</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
            <span>Offre refusée</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
            <span>Offre reçue</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="flex items-end justify-center space-x-8">
          {monthsWithData.map((month, index) => {
            // Calculer la largeur de base de la barre basée sur CV envoyé
            const baseBarWidth = Math.max(
              minBarWidth,
              Math.min(maxBarWidth, (month.cvEnvoye / maxCvEnvoye) * maxBarWidth)
            );
            
            return (
              <div key={index} className="flex flex-col items-center justify-center">
                {/* Conteneur de la barre empilée */}
                <div className="relative flex justify-center" style={{ width: baseBarWidth, height: chartHeight }}>
                  {/* CV envoyé (base) - largeur proportionnelle, hauteur fixe, centré */}
                  {month.cvEnvoye > 0 && (
                    <div
                      className="absolute bottom-0 bg-gray-500 rounded-t flex items-center justify-center"
                      style={{
                        width: `${(month.cvEnvoye / maxCvEnvoye) * 100}%`,
                        height: segmentHeight,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 4
                      }}
                      title={`CV envoyé: ${month.cvEnvoye}`}
                    >
                      <span className="text-white text-xs font-bold">{month.cvEnvoye}</span>
                    </div>
                  )}
                  
                  {/* Entretien programmé (au-dessus de CV envoyé) - largeur proportionnelle, hauteur fixe, centré */}
                  {month.entretien > 0 && (
                    <div
                      className="absolute bottom-0 bg-blue-500 rounded-t flex items-center justify-center"
                      style={{
                        width: `${(month.entretien / maxCvEnvoye) * 100}%`,
                        height: segmentHeight,
                        bottom: segmentHeight,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 3
                      }}
                      title={`Entretien programmé: ${month.entretien}`}
                    >
                      <span className="text-white text-xs font-bold">{month.entretien}</span>
                    </div>
                  )}
                  
                  {/* Offre reçue (moitié gauche au-dessus des entretiens) - largeur proportionnelle, hauteur fixe */}
                  {month.offreRecue > 0 && (
                    <div
                      className="absolute bottom-0 bg-green-500 rounded-t flex items-center justify-center"
                      style={{
                        width: `${(month.offreRecue / maxCvEnvoye) * 100}%`,
                        height: segmentHeight,
                        bottom: segmentHeight * 2,
                        left: '50%',
                        transform: 'translateX(-100%)',
                        zIndex: 2
                      }}
                      title={`Offre reçue: ${month.offreRecue}`}
                    >
                      <span className="text-white text-xs font-bold">{month.offreRecue}</span>
                    </div>
                  )}
                  
                  {/* Offre refusée (moitié droite au-dessus des entretiens) - largeur proportionnelle, hauteur fixe */}
                  {month.offreRefusee > 0 && (
                    <div
                      className="absolute bottom-0 bg-red-500 rounded-t flex items-center justify-center"
                      style={{
                        width: `${(month.offreRefusee / maxCvEnvoye) * 100}%`,
                        height: segmentHeight,
                        bottom: segmentHeight * 2,
                        left: '50%',
                        transform: 'translateX(0%)',
                        zIndex: 2
                      }}
                      title={`Offre refusée: ${month.offreRefusee}`}
                    >
                      <span className="text-white text-xs font-bold">{month.offreRefusee}</span>
                    </div>
                  )}
                </div>
                
                {/* Mois en bas */}
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {month.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Légende détaillée */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
          <span>CV envoyé</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span>Entretiens</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span>Offre refusée</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span>Offre reçue</span>
        </div>
      </div>
    </div>
  );
} 