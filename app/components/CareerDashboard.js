"use client";

import React, { useState, useEffect } from 'react';
import { 
  romeSkillsDatabase, 
  calculateCompatibility,
  skillLevels,
  getSkillLevelByValue
} from '../data/rome-skills-database';
import { getSalary, getTrends } from '../data/market-data';
import { getFormationsByRomeCode } from '../data/formations-database';
import { getCareerPath, getRecommendedTransitions } from '../data/career-paths';

export default function CareerDashboard({ userSkills, region = "Île-de-France" }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userSkills && userSkills.length > 0) {
      performCareerAnalysis();
    }
  }, [userSkills, region]);

  const performCareerAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/career-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userSkills,
          region,
          currentLevel: "junior"
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAnalysisData(result.data);
      }
    } catch (error) {
      console.error('Erreur analyse carrière:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Analyse de carrière en cours...</span>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Aucune analyse disponible</p>
      </div>
    );
  }

  const { 
    perfectMatches, 
    goodMatches, 
    transitionMatches, 
    gapAnalysis, 
    transitions, 
    emergingSkills, 
    recommendations, 
    stats 
  } = analysisData;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête avec statistiques */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎯 Analyse de Carrière Personnalisée
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{stats.totalJobsAnalyzed}</div>
            <div className="text-sm text-gray-600">Métiers analysés</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">{stats.perfectMatches}</div>
            <div className="text-sm text-gray-600">Métiers parfaits</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">{stats.goodMatches}</div>
            <div className="text-sm text-gray-600">Métiers accessibles</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-purple-600">{stats.averageCompatibility}%</div>
            <div className="text-sm text-gray-600">Compatibilité moyenne</div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
            { id: 'perfect', label: 'Métiers Parfaits', icon: '⭐' },
            { id: 'gaps', label: 'Gaps de Compétences', icon: '🎯' },
            { id: 'transitions', label: 'Transitions', icon: '🔄' },
            { id: 'formations', label: 'Formations', icon: '🎓' },
            { id: 'trends', label: 'Tendances', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'overview' && (
          <OverviewTab 
            perfectMatches={perfectMatches}
            goodMatches={goodMatches}
            transitionMatches={transitionMatches}
            recommendations={recommendations}
            stats={stats}
            onJobSelect={setSelectedJob}
          />
        )}

        {activeTab === 'perfect' && (
          <PerfectMatchesTab 
            perfectMatches={perfectMatches}
            gapAnalysis={gapAnalysis}
            onJobSelect={setSelectedJob}
          />
        )}

        {activeTab === 'gaps' && (
          <GapsTab 
            gapAnalysis={gapAnalysis}
            onJobSelect={setSelectedJob}
          />
        )}

        {activeTab === 'transitions' && (
          <TransitionsTab 
            transitions={transitions}
            onJobSelect={setSelectedJob}
          />
        )}

        {activeTab === 'formations' && (
          <FormationsTab 
            gapAnalysis={gapAnalysis}
            selectedJob={selectedJob}
          />
        )}

        {activeTab === 'trends' && (
          <TrendsTab 
            emergingSkills={emergingSkills}
            stats={stats}
          />
        )}
      </div>

      {/* Modal détaillé pour un métier */}
      {selectedJob && (
        <JobDetailModal 
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          userSkills={userSkills}
          region={region}
        />
      )}
    </div>
  );
}

// Composant Vue d'ensemble
function OverviewTab({ perfectMatches, goodMatches, transitionMatches, recommendations, stats, onJobSelect }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">📊 Vue d'ensemble de votre profil</h3>
      
      {/* Recommandations prioritaires */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">🚀 Recommandations prioritaires</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.immediate.map((rec, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-600">{rec.type}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{rec.priority}</span>
              </div>
              <h5 className="font-semibold text-gray-900">{rec.title}</h5>
              <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${rec.compatibility}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{rec.compatibility}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top secteurs */}
      <div>
        <h4 className="text-xl font-semibold text-gray-900 mb-4">🏢 Secteurs les plus compatibles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.topSectors.map((sector, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{sector.sector}</span>
                <span className="text-2xl font-bold text-blue-600">{sector.count}</span>
              </div>
              <div className="mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(sector.count / stats.totalJobsAnalyzed) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métiers par catégorie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            ⭐ Métiers parfaits ({perfectMatches.length})
          </h4>
          <div className="space-y-2">
            {perfectMatches.slice(0, 5).map((job, index) => (
              <div 
                key={index}
                onClick={() => onJobSelect(job)}
                className="bg-green-50 p-3 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{job.title}</span>
                  <span className="text-sm font-bold text-green-600">{job.compatibility}%</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{job.secteur}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            🎯 Métiers accessibles ({goodMatches.length})
          </h4>
          <div className="space-y-2">
            {goodMatches.slice(0, 5).map((job, index) => (
              <div 
                key={index}
                onClick={() => onJobSelect(job)}
                className="bg-yellow-50 p-3 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{job.title}</span>
                  <span className="text-sm font-bold text-yellow-600">{job.compatibility}%</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{job.secteur}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            🔄 Transitions possibles ({transitionMatches.length})
          </h4>
          <div className="space-y-2">
            {transitionMatches.slice(0, 5).map((job, index) => (
              <div 
                key={index}
                onClick={() => onJobSelect(job)}
                className="bg-purple-50 p-3 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{job.title}</span>
                  <span className="text-sm font-bold text-purple-600">{job.compatibility}%</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{job.secteur}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Métiers Parfaits
function PerfectMatchesTab({ perfectMatches, gapAnalysis, onJobSelect }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">⭐ Métiers parfaits pour votre profil</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {perfectMatches.map((job, index) => (
          <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.secteur}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{job.compatibility}%</div>
                <div className="text-sm text-gray-500">Compatibilité</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Salaire</div>
                <div className="text-lg font-semibold text-gray-900">{job.salary_range}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Demande</div>
                <div className="text-lg font-semibold text-gray-900">{job.market_demand}</div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{job.description}</p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => onJobSelect(job)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Voir détails
              </button>
              <button className="flex-1 bg-white text-green-600 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
                Postuler
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant Gaps de Compétences
function GapsTab({ gapAnalysis, onJobSelect }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 Analyse des compétences manquantes</h3>
      
      {gapAnalysis.map((analysis, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-gray-900">{analysis.title}</h4>
            <button
              onClick={() => onJobSelect({ code: analysis.romeCode, title: analysis.title })}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir le métier →
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">🔥 Compétences prioritaires à acquérir</h5>
              <div className="space-y-2">
                {analysis.prioritySkills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-900">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">📊 Données marché</h5>
              {analysis.marketData && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Demande:</span>
                    <span className="font-semibold">{analysis.marketData.demand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Croissance:</span>
                    <span className="font-semibold text-green-600">{analysis.marketData.growth_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Télétravail:</span>
                    <span className="font-semibold">{analysis.marketData.remote_friendly ? '✅' : '❌'}</span>
                  </div>
                </div>
              )}
              
              {analysis.salary && (
                <div className="mt-4">
                  <h6 className="font-medium text-gray-900 mb-2">💰 Salaire ({region})</h6>
                  <div className="text-lg font-bold text-green-600">
                    {analysis.salary.min}k€ - {analysis.salary.max}k€
                  </div>
                  <div className="text-sm text-gray-600">Médiane: {analysis.salary.median}k€</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Composant Transitions
function TransitionsTab({ transitions, onJobSelect }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🔄 Transitions de carrière recommandées</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {transitions.map((transition, index) => (
          <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{transition.from_title}</h4>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span>→</span>
                  <span className="font-medium">{transition.to_title}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{transition.compatibility}%</div>
                <div className="text-sm text-gray-500">Compatibilité</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Difficulté</div>
                <div className="text-lg font-semibold text-gray-900">{transition.difficulty}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Temps estimé</div>
                <div className="text-lg font-semibold text-gray-900">{transition.estimated_time}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Compétences à acquérir:</div>
              <div className="flex flex-wrap gap-2">
                {transition.skills_to_acquire.slice(0, 3).map((skill, skillIndex) => (
                  <span key={skillIndex} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
                {transition.skills_to_acquire.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{transition.skills_to_acquire.length - 3} autres
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Taux de réussite: <span className="font-semibold text-green-600">{transition.success_rate}</span>
              </div>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Planifier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant Formations
function FormationsTab({ gapAnalysis, selectedJob }) {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedJob) {
      loadFormations(selectedJob.code);
    }
  }, [selectedJob]);

  const loadFormations = async (romeCode) => {
    setLoading(true);
    try {
      const formations = getFormationsByRomeCode(romeCode, romeSkillsDatabase);
      setFormations(formations);
    } catch (error) {
      console.error('Erreur chargement formations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🎓 Formations recommandées</h3>
      
      {selectedJob ? (
        <div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Formations pour: {selectedJob.title}</h4>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Chargement des formations...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {formations.map((formation, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h5 className="text-lg font-bold text-gray-900">{formation.name}</h5>
                      <p className="text-sm text-gray-600">{formation.provider}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{formation.cost}€</div>
                      <div className="text-sm text-gray-500">{formation.duration}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Format</div>
                      <div className="text-sm text-gray-900">{formation.format}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Note</div>
                      <div className="text-sm text-gray-900">⭐ {formation.rating}/5 ({formation.reviews_count} avis)</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{formation.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Salaire après: <span className="font-semibold text-green-600">{formation.average_salary_after}k€</span>
                    </div>
                    <a
                      href={formation.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Voir formation
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-gray-600">Sélectionnez un métier pour voir les formations recommandées</p>
        </div>
      )}
    </div>
  );
}

// Composant Tendances
function TrendsTab({ emergingSkills, stats }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">📈 Tendances du marché</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {emergingSkills.map((skill, index) => (
          <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">{skill.title}</h4>
            
            <div className="mb-4">
              <h5 className="font-semibold text-gray-900 mb-2">🚀 Compétences émergentes</h5>
              <div className="flex flex-wrap gap-2">
                {skill.emergingSkills.map((emergingSkill, skillIndex) => (
                  <span key={skillIndex} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                    {emergingSkill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">🔥 Compétences en forte demande</h5>
              <div className="flex flex-wrap gap-2">
                {skill.keySkillsInDemand.map((keySkill, skillIndex) => (
                  <span key={skillIndex} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    {keySkill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Modal détaillé pour un métier
function JobDetailModal({ job, onClose, userSkills, region }) {
  const [detailedJob, setDetailedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (job) {
      loadJobDetails();
    }
  }, [job]);

  const loadJobDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/career-analysis?romeCode=${job.code}&region=${region}`);
      const result = await response.json();
      if (result.success) {
        setDetailedJob(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Chargement des détails...</span>
            </div>
          ) : detailedJob ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{detailedJob.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informations marché</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Secteur:</span>
                      <span className="font-medium">{detailedJob.secteur}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salaire:</span>
                      <span className="font-medium">{detailedJob.salary_range}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulté:</span>
                      <span className="font-medium">{detailedJob.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Demande:</span>
                      <span className="font-medium">{detailedJob.market_demand}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {detailedJob.skills && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Compétences requises</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Techniques</h5>
                      <div className="space-y-1">
                        {detailedJob.skills.techniques.slice(0, 5).map((skill, index) => (
                          <div key={index} className="text-sm text-gray-700">• {skill}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Soft Skills</h5>
                      <div className="space-y-1">
                        {detailedJob.skills.soft_skills.slice(0, 5).map((skill, index) => (
                          <div key={index} className="text-sm text-gray-700">• {skill}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Outils</h5>
                      <div className="space-y-1">
                        {detailedJob.skills.outils.slice(0, 5).map((skill, index) => (
                          <div key={index} className="text-sm text-gray-700">• {skill}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {detailedJob.formations && detailedJob.formations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Formations recommandées</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailedJob.formations.slice(0, 4).map((formation, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900">{formation.name}</h5>
                        <p className="text-sm text-gray-600">{formation.provider}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">{formation.duration}</span>
                          <span className="font-semibold text-blue-600">{formation.cost}€</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600">Erreur lors du chargement des détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 