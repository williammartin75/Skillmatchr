'use client';

import { useState, useEffect } from 'react';
import { getAllUniqueSkills } from '../data/rome-skills-database';

export default function SkillSelector({ onSkillsUpdate, currentSkills = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('techniques');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSkills, setUserSkills] = useState(currentSkills);
  const [allSkills, setAllSkills] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const skillLevels = [
    { value: 'debutant', label: 'Débutant' },
    { value: 'intermediaire', label: 'Intermédiaire' },
    { value: 'avance', label: 'Avancé' },
    { value: 'expert', label: 'Expert' }
  ];

  const categories = [
    { key: 'techniques', label: 'Compétences Techniques', icon: '⚙️' },
    { key: 'soft_skills', label: 'Soft Skills', icon: '🤝' },
    { key: 'outils', label: 'Outils', icon: '🛠️' }
  ];

  const addSkill = (skillName) => {
    const newSkill = {
      name: skillName,
      category: selectedCategory,
      level: 'intermediaire'
    };
    const updatedSkills = [...userSkills, newSkill];
    setUserSkills(updatedSkills);
    onSkillsUpdate(updatedSkills);
  };

  const removeSkill = (skillName) => {
    const updatedSkills = userSkills.filter(skill => skill.name !== skillName);
    setUserSkills(updatedSkills);
    onSkillsUpdate(updatedSkills);
  };

  const updateSkillLevel = (skillName, newLevel) => {
    const updatedSkills = userSkills.map(skill =>
      skill.name === skillName ? { ...skill, level: newLevel } : skill
    );
    setUserSkills(updatedSkills);
    onSkillsUpdate(updatedSkills);
  };

  useEffect(() => {
    // Charger toutes les compétences uniques
    const skills = getAllUniqueSkills();
    setAllSkills(skills);
    setIsLoading(false);
  }, []);

  const filteredSkills = allSkills[selectedCategory]?.filter(skill =>
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];



  return (
    <div className="space-y-6">
      {/* Sélection de catégorie */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner vos compétences</h3>
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des compétences...</p>
          </div>
        )}

        <div className="flex space-x-2 mb-4">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label} ({allSkills[category.key]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Contenu principal - affiché seulement si pas en cours de chargement */}
      {!isLoading && (
        <>
          {/* Barre de recherche */}
          <div>
            <input
              type="text"
              placeholder={`Rechercher dans les ${categories.find(c => c.key === selectedCategory)?.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Liste des compétences disponibles */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-3">
              {searchQuery ? 
                `${filteredSkills.length} compétence(s) trouvée(s) sur ${allSkills[selectedCategory]?.length || 0} pour "${searchQuery}"` :
                `${filteredSkills.length} compétence(s) affichées sur ${allSkills[selectedCategory]?.length || 0} disponibles`
              }
              {!searchQuery && filteredSkills.length > 0 && (
                <div className="text-blue-600 text-xs mt-1">
                  💡 Utilisez la barre de recherche pour trouver des compétences spécifiques
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {filteredSkills.map(skill => {
                const isSelected = userSkills.find(userSkill => userSkill.name === skill);
                return (
                  <div
                    key={skill}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => isSelected ? removeSkill(skill) : addSkill(skill)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{skill}</span>
                      <div className="flex items-center space-x-2">
                        {isSelected && (
                          <span className="text-indigo-600 text-xs font-medium">
                            ✓ Ajoutée
                          </span>
                        )}
                        <button
                          className={`text-xs px-2 py-1 rounded ${
                            isSelected
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isSelected ? 'Retirer' : 'Ajouter'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredSkills.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Aucune compétence trouvée pour "{searchQuery}"
              </div>
            )}
            
            {/* Indicateur si beaucoup de compétences */}
            {!searchQuery && filteredSkills.length > 50 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>💡 Conseil :</strong> Il y a {filteredSkills.length} compétences dans cette catégorie. 
                  Utilisez la barre de recherche ci-dessus pour trouver rapidement les compétences qui vous intéressent.
                </div>
              </div>
            )}
          </div>

          {/* Compétences sélectionnées */}
          {userSkills.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Vos compétences sélectionnées ({userSkills.length})
              </h4>
              <div className="space-y-3">
                {userSkills.map(skill => (
                  <div key={skill.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                      <span className="text-xs text-gray-500">({skill.category})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkillLevel(skill.name, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500"
                      >
                        {skillLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeSkill(skill.name)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-indigo-900 mb-2">Résumé de vos compétences</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="text-center">
                <div className="font-semibold text-indigo-900">
                  {userSkills.filter(s => s.category === 'techniques').length}
                </div>
                <div className="text-indigo-700">Techniques</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-indigo-900">
                  {userSkills.filter(s => s.category === 'soft_skills').length}
                </div>
                <div className="text-indigo-700">Soft Skills</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-indigo-900">
                  {userSkills.filter(s => s.category === 'outils').length}
                </div>
                <div className="text-indigo-700">Outils</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}