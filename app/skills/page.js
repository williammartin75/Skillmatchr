"use client";

import React, { useState, useEffect } from "react";
import styles from "./SkillsGrid.module.css";

import SkillSelector from "../components/SkillSelector";
import {
  romeSkillsDatabase,
  getRomeSkills,
  getRomeEducation,
  searchRomeBySkill,
  searchRomeByDiploma,
  getMostDemandedJobs,
  calculateCompatibility,
  calculateSkillGaps,
  getAllJobsWithCompatibility,
  skillLevels,
  getSkillLevelByValue
} from "../data/rome-skills-database";


export default function Skills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [diplomaQuery, setDiplomaQuery] = useState("");
  const [selectedRomeCode, setSelectedRomeCode] = useState(null);
  const [filteredRomeJobs, setFilteredRomeJobs] = useState([]);
  const [filteredByDiploma, setFilteredByDiploma] = useState([]);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [currentSkills, setCurrentSkills] = useState([
    { name: "JavaScript", level: "avance", category: "techniques" },
    { name: "React", level: "avance", category: "techniques" },
    { name: "Node.js", level: "intermediaire", category: "techniques" },
    { name: "Python", level: "intermediaire", category: "techniques" },
    { name: "SQL", level: "intermediaire", category: "techniques" },
    { name: "Git", level: "avance", category: "outils" },
    { name: "Docker", level: "debutant", category: "outils" },
    { name: "AWS", level: "debutant", category: "outils" }
  ]);
  const [careerAnalysis, setCareerAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [jobsToShow, setJobsToShow] = useState(20); // Commencer avec 20 métiers

  // Calculer tous les métiers ROME avec leur compatibilité
  const allRomeJobs = getAllJobsWithCompatibility(currentSkills);
  const compatibleRomeJobs = allRomeJobs; // Afficher tous les métiers, pas seulement ceux avec compatibilité > 0



  // Recherche de métiers par compétence
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchRomeBySkill(searchQuery);
      setFilteredRomeJobs(results);
    } else {
      setFilteredRomeJobs([]);
    }
  }, [searchQuery]);

  // Recherche de métiers par diplôme
  useEffect(() => {
    if (diplomaQuery.trim()) {
      const results = searchRomeByDiploma(diplomaQuery);
      setFilteredByDiploma(results);
    } else {
      setFilteredByDiploma([]);
    }
  }, [diplomaQuery]);

  // Mise à jour des compétences utilisateur
  const handleSkillsUpdate = (newSkills) => {
    console.log('🔍 Skills page: Mise à jour des compétences:', newSkills);
    setCurrentSkills(newSkills);
    // Ne pas fermer le sélecteur automatiquement
    // setShowSkillSelector(false);
  };

  // Fonction pour charger plus de métiers (scroll infini)
  const loadMoreJobs = () => {
    setJobsToShow(prev => Math.min(prev + 20, compatibleRomeJobs.length));
  };

  // Fonction pour obtenir la couleur du niveau
  const getLevelColor = (level) => {
    const skillLevel = getSkillLevelByValue(level);
    return skillLevel.color;
  };

  // Fonction pour obtenir le label du niveau
  const getLevelLabel = (level) => {
    const skillLevel = getSkillLevelByValue(level);
    return skillLevel.label;
  };

  // Fonction pour obtenir la couleur de compatibilité
  const getCompatibilityColor = (compatibility) => {
    if (compatibility >= 80) return "text-green-600 bg-green-50";
    if (compatibility >= 60) return "text-blue-600 bg-blue-50";
    if (compatibility >= 40) return "text-yellow-600 bg-yellow-50";
    if (compatibility >= 20) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };



  return (
    <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analyse complète de mes compétences</h1>
            <p className="text-gray-600 mt-2">Découvrez vos métiers ROME, gaps de compétences, formations et tendances du marché</p>
            
            {/* Bouton d'action */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => {
                  console.log('🔍 Bouton "Modifier mes compétences" cliqué, showSkillSelector:', !showSkillSelector);
                  setShowSkillSelector(!showSkillSelector);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>🔧</span>
                <span>Modifier mes compétences</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
              {/* Current Skills */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Mes compétences actuelles</h2>
                </div>

                {/* Sélecteur de compétences */}
                {showSkillSelector && (
                  <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <SkillSelector 
                      onSkillsUpdate={handleSkillsUpdate}
                      currentSkills={currentSkills}
                    />
                  </div>
                )}

                {/* Affichage des compétences actuelles */}
                {currentSkills.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Aucune compétence sélectionnée</p>
                    <p className="text-sm text-gray-500 mt-2">Cliquez sur "Modifier mes compétences" pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Compétences Techniques */}
                    {currentSkills.filter(skill => skill.category === 'techniques').length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                          <span className="mr-2">💻</span>
                          Compétences Techniques ({currentSkills.filter(skill => skill.category === 'techniques').length})
                        </h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '8px',
                          width: '100%'
                        }}>
                          {currentSkills
                            .filter(skill => skill.category === 'techniques')
                            .map((skill, index) => (
                              <div key={index} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold text-blue-900">{skill.name}</h5>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(skill.level)}`}>
                                    {getLevelLabel(skill.level)}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Soft Skills */}
                    {currentSkills.filter(skill => skill.category === 'soft_skills').length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                          <span className="mr-2">🤝</span>
                          Soft Skills ({currentSkills.filter(skill => skill.category === 'soft_skills').length})
                        </h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '8px',
                          width: '100%'
                        }}>
                          {currentSkills
                            .filter(skill => skill.category === 'soft_skills')
                            .map((skill, index) => (
                              <div key={index} className="border border-green-200 rounded-lg p-3 bg-green-50">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold text-green-900">{skill.name}</h5>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(skill.level)}`}>
                                    {getLevelLabel(skill.level)}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Outils */}
                    {currentSkills.filter(skill => skill.category === 'outils').length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                          <span className="mr-2">🛠️</span>
                          Outils ({currentSkills.filter(skill => skill.category === 'outils').length})
                        </h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '8px',
                          width: '100%'
                        }}>
                          {currentSkills
                            .filter(skill => skill.category === 'outils')
                            .map((skill, index) => (
                              <div key={index} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold text-purple-900">{skill.name}</h5>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(skill.level)}`}>
                                    {getLevelLabel(skill.level)}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Résumé des compétences */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">📊 Résumé de vos compétences</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {currentSkills.filter(skill => skill.category === 'techniques').length}
                          </div>
                          <div className="text-gray-600">Techniques</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {currentSkills.filter(skill => skill.category === 'soft_skills').length}
                          </div>
                          <div className="text-gray-600">Soft Skills</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {currentSkills.filter(skill => skill.category === 'outils').length}
                          </div>
                          <div className="text-gray-600">Outils</div>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {currentSkills.length} compétences au total
                        </div>
                      </div>
                    </div>
                </div>
                )}
              </div>

              {/* Rechercher un métier */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Rechercher un métier</h3>
                <input
                  type="text"
                  placeholder="Ex: JavaScript, Python, Marketing, Gestion de projet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {filteredRomeJobs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {filteredRomeJobs.slice(0, 5).map((job) => (
                      <div key={job.code} className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-600">{job.match} compétences correspondantes</div>
                          </div>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            {job.code}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rechercher par diplôme */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎓 Rechercher par diplôme</h3>
                <input
                  type="text"
                  placeholder="Ex: Master Informatique, BTS SIO, Certification AWS..."
                  value={diplomaQuery}
                  onChange={(e) => setDiplomaQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {filteredByDiploma.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {filteredByDiploma.slice(0, 5).map((job) => (
                      <div key={job.code} className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-600">{job.match} diplômes/certifications correspondants</div>
                            {job.education && job.education.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {job.education.slice(0, 2).join(', ')}
                              </div>
                            )}
                          </div>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            {job.code}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tous les métiers ROME avec scroll infini */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tous les métiers ROME ({compatibleRomeJobs.length})
                  </h3>
                </div>
                
                {compatibleRomeJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Aucun métier ROME trouvé</p>
                    <p className="text-sm text-gray-500 mt-2">Erreur dans le chargement des métiers ROME</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {compatibleRomeJobs.slice(0, jobsToShow).map((job) => (
                      <div key={job.code} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-semibold text-gray-900">{job.title}</h4>
                              <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                Code ROME: {job.code}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Salaire:</span>
                                <div className="font-medium">{job.salary?.median || job.salary_range}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Difficulté:</span>
                                <div className="font-medium">{job.difficulty}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Demande:</span>
                                <div className="font-medium">{job.market_demand}</div>
                              </div>
                        <div>
                                <span className="text-gray-600">Formations:</span>
                                <div className="font-medium">{job.formations?.length || 0} disponibles</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className={`text-3xl font-bold px-3 py-1 rounded-lg ${getCompatibilityColor(job.compatibility)}`}>
                              {job.compatibility}%
                            </div>
                            <div className="text-sm text-gray-500">Compatibilité</div>
                          </div>
                        </div>

                        {/* Compétences du métier segmentées par catégorie */}
                        {job.skills && (
                          console.log('🔍 Job skills:', job.title, job.skills),
                          <div className="mt-4 space-y-4">
                            {/* Compétences Techniques */}
                            {job.skills.techniques && job.skills.techniques.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                                  <span className="mr-2">💻</span>
                                  Compétences Techniques ({job.skills.techniques.length})
                                </h5>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 1fr)',
                                  gap: '8px',
                                  width: '100%'
                                }}>
                                  {job.skills.techniques.map((skill, idx) => (
                                    <div key={idx} className="border border-blue-200 rounded-lg p-2 bg-blue-50">
                                      <span className="text-xs font-medium text-blue-900">{skill}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Soft Skills */}
                            {job.skills.soft_skills && job.skills.soft_skills.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                                  <span className="mr-2">🤝</span>
                                  Soft Skills ({job.skills.soft_skills.length})
                                </h5>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 1fr)',
                                  gap: '8px',
                                  width: '100%'
                                }}>
                                  {job.skills.soft_skills.map((skill, idx) => (
                                    <div key={idx} className="border border-green-200 rounded-lg p-2 bg-green-50">
                                      <span className="text-xs font-medium text-green-900">{skill}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Outils */}
                            {job.skills.outils && job.skills.outils.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
                                  <span className="mr-2">🛠️</span>
                                  Outils ({job.skills.outils.length})
                                </h5>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 1fr)',
                                  gap: '8px',
                                  width: '100%'
                                }}>
                                  {job.skills.outils.map((skill, idx) => (
                                    <div key={idx} className="border border-purple-200 rounded-lg p-2 bg-purple-50">
                                      <span className="text-xs font-medium text-purple-900">{skill}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Éducation et Formation */}
                        {job.education && (
                          <div className="mt-4 space-y-4">
                            {/* Diplômes requis */}
                            {job.education.diplomes && job.education.diplomes.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
                                  <span className="mr-2">🎓</span>
                                  Diplômes requis ({job.education.diplomes.length})
                                </h5>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(2, 1fr)',
                                  gap: '8px',
                                  width: '100%'
                                }}>
                                  {job.education.diplomes.map((diplome, idx) => (
                                    <div key={idx} className="border border-indigo-200 rounded-lg p-2 bg-indigo-50">
                                      <span className="text-xs font-medium text-indigo-900">{diplome}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Certifications */}
                            {job.education.certifications && job.education.certifications.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-orange-900 mb-2 flex items-center">
                                  <span className="mr-2">🏆</span>
                                  Certifications ({job.education.certifications.length})
                                </h5>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(2, 1fr)',
                                  gap: '8px',
                                  width: '100%'
                                }}>
                                  {job.education.certifications.map((certification, idx) => (
                                    <div key={idx} className="border border-orange-200 rounded-lg p-2 bg-orange-50">
                                      <span className="text-xs font-medium text-orange-900">{certification}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Informations éducation */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {job.education.niveau_minimum && (
                                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <div className="font-semibold text-yellow-900 mb-1">📚 Niveau minimum</div>
                                  <div className="text-yellow-800">{job.education.niveau_minimum}</div>
                                </div>
                              )}
                              
                              {job.education.formation_continue && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="font-semibold text-blue-900 mb-1">🔄 Formation continue</div>
                                  <div className="text-blue-800 text-xs">{job.education.formation_continue}</div>
                                </div>
                              )}
                              
                              {job.education.specialisations && job.education.specialisations.length > 0 && (
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                  <div className="font-semibold text-green-900 mb-1">🎯 Spécialisations</div>
                                  <div className="text-green-800 text-xs">
                                    {job.education.specialisations.join(', ')}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tendances du marché */}
                        {job.trends && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-semibold text-blue-900 mb-2">📈 Tendances du marché</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-gray-600">Croissance:</span> <span className="font-medium">{job.trends.growth}</span></div>
                              <div><span className="text-gray-600">Télétravail:</span> <span className="font-medium">{job.trends.remote_friendly ? 'Oui' : 'Non'}</span></div>
                            </div>
                          </div>
                        )}

                        {/* Formations recommandées */}
                        {job.formations && job.formations.length > 0 && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <h5 className="font-semibold text-green-900 mb-2">🎓 Formations recommandées</h5>
                            <div className="space-y-2">
                              {job.formations.slice(0, 3).map((formation, idx) => (
                                <div key={idx} className="text-sm">
                                  <div className="font-medium">{formation.name}</div>
                                  <div className="text-gray-600">{formation.provider} • {formation.duration} • {formation.cost}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Transitions de carrière */}
                        {job.transitions && job.transitions.length > 0 && (
                          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                            <h5 className="font-semibold text-purple-900 mb-2">🔄 Transitions possibles</h5>
                            <div className="space-y-2">
                              {job.transitions.slice(0, 2).map((transition, idx) => (
                                <div key={idx} className="text-sm">
                                  <div className="font-medium">{transition.to_job}</div>
                                  <div className="text-gray-600">Difficulté: {transition.difficulty} • Temps: {transition.estimated_time}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
                )}

                {/* Bouton "Charger plus" pour le scroll infini */}
                {jobsToShow < compatibleRomeJobs.length && (
                  <div className="text-center mt-6">
                    <button
                      onClick={loadMoreJobs}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Charger plus de métiers ({compatibleRomeJobs.length - jobsToShow} restants)
                    </button>
                  </div>
                )}
              </div>

          </div>
        </div>
      </main>
    </div>
  );
} 