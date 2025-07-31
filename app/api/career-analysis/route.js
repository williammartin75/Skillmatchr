import { NextResponse } from 'next/server';
import { 
  romeSkillsDatabase, 
  calculateCompatibility 
} from '../../data/rome-skills-database';
import { 
  getSalary, 
  getTrends, 
  getEmergingSkills, 
  getKeySkillsInDemand 
} from '../../data/market-data';
import { 
  getFormationsByRomeCode 
} from '../../data/formations-database';
import { 
  getCareerPath, 
  getRecommendedTransitions, 
  getCareerEvolutions 
} from '../../data/career-paths';

export async function POST(request) {
  try {
    const { userSkills, region = "Île-de-France", currentLevel = "junior" } = await request.json();

    if (!userSkills || !Array.isArray(userSkills)) {
      return NextResponse.json({ error: "Compétences utilisateur requises" }, { status: 400 });
    }

    // 1. Calculer la compatibilité avec tous les métiers ROME
    const compatibilityResults = Object.entries(romeSkillsDatabase)
      .map(([code, data]) => ({
        code,
        title: data.title,
        description: data.description,
        secteur: data.secteur,
        compatibility: calculateCompatibility(userSkills, code),
        salary_range: data.salary_range,
        difficulty: data.difficulty,
        market_demand: data.market_demand
      }))
      .filter(job => job.compatibility > 0)
      .sort((a, b) => b.compatibility - a.compatibility);

    // 2. Catégoriser les métiers
    const perfectMatches = compatibilityResults.filter(job => job.compatibility >= 80);
    const goodMatches = compatibilityResults.filter(job => job.compatibility >= 60 && job.compatibility < 80);
    const transitionMatches = compatibilityResults.filter(job => job.compatibility >= 40 && job.compatibility < 60);

    // 3. Analyser les gaps pour les métiers parfaits
    const gapAnalysis = perfectMatches.slice(0, 5).map(job => {
      const romeData = romeSkillsDatabase[job.code];
      const allRomeSkills = [
        ...romeData.skills.techniques,
        ...romeData.skills.soft_skills,
        ...romeData.skills.outils
      ];
      
      const userSkillNames = userSkills.map(skill => skill.name.toLowerCase());
      const missingSkills = allRomeSkills.filter(skill => 
        !userSkillNames.some(userSkill => 
          skill.toLowerCase().includes(userSkill) || 
          userSkill.includes(skill.toLowerCase())
        )
      );

      return {
        romeCode: job.code,
        title: job.title,
        missingSkills: missingSkills.slice(0, 10), // Top 10 compétences manquantes
        prioritySkills: missingSkills.slice(0, 5), // Top 5 prioritaires
        marketData: getTrends(job.code),
        salary: getSalary(job.code, region),
        formations: getFormationsByRomeCode(job.code, romeSkillsDatabase).slice(0, 5),
        careerPath: getCareerPath(job.code),
        evolutions: getCareerEvolutions(job.code, currentLevel)
      };
    });

    // 4. Obtenir les transitions recommandées
    const transitions = getRecommendedTransitions(userSkills, romeSkillsDatabase);

    // 5. Obtenir les compétences émergentes pour les métiers parfaits
    const emergingSkills = perfectMatches.slice(0, 3).map(job => ({
      romeCode: job.code,
      title: job.title,
      emergingSkills: getEmergingSkills(job.code),
      keySkillsInDemand: getKeySkillsInDemand(job.code)
    }));

    // 6. Recommandations personnalisées
    const recommendations = {
      immediate: perfectMatches.slice(0, 3).map(job => ({
        type: "Métier parfait",
        romeCode: job.code,
        title: job.title,
        compatibility: job.compatibility,
        action: "Postuler immédiatement",
        priority: "Haute"
      })),
      development: goodMatches.slice(0, 3).map(job => ({
        type: "Métier accessible",
        romeCode: job.code,
        title: job.title,
        compatibility: job.compatibility,
        action: "Développer les compétences manquantes",
        priority: "Moyenne"
      })),
      transition: transitions.slice(0, 3).map(transition => ({
        type: "Transition de carrière",
        from: transition.from_title,
        to: transition.to_title,
        compatibility: transition.compatibility,
        difficulty: transition.difficulty,
        estimatedTime: transition.estimated_time,
        action: "Planifier la transition",
        priority: "Basse"
      }))
    };

    // 7. Statistiques globales
    const stats = {
      totalJobsAnalyzed: compatibilityResults.length,
      perfectMatches: perfectMatches.length,
      goodMatches: goodMatches.length,
      transitionMatches: transitionMatches.length,
      averageCompatibility: Math.round(
        compatibilityResults.reduce((sum, job) => sum + job.compatibility, 0) / compatibilityResults.length
      ),
      topSectors: Object.entries(
        compatibilityResults.reduce((acc, job) => {
          acc[job.secteur] = (acc[job.secteur] || 0) + 1;
          return acc;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([sector, count]) => ({ sector, count }))
    };

    return NextResponse.json({
      success: true,
      data: {
        compatibilityResults,
        perfectMatches,
        goodMatches,
        transitionMatches,
        gapAnalysis,
        transitions,
        emergingSkills,
        recommendations,
        stats
      }
    });

  } catch (error) {
    console.error('Erreur analyse carrière:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse de carrière" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const romeCode = searchParams.get('romeCode');
    const region = searchParams.get('region') || "Île-de-France";

    if (!romeCode) {
      return NextResponse.json({ error: "Code ROME requis" }, { status: 400 });
    }

    const romeData = romeSkillsDatabase[romeCode];
    if (!romeData) {
      return NextResponse.json({ error: "Métier ROME non trouvé" }, { status: 404 });
    }

    // Données détaillées pour un métier spécifique
    const detailedAnalysis = {
      romeCode,
      title: romeData.title,
      description: romeData.description,
      secteur: romeData.secteur,
      skills: romeData.skills,
      salary_range: romeData.salary_range,
      difficulty: romeData.difficulty,
      market_demand: romeData.market_demand,
      marketData: getTrends(romeCode),
      salary: getSalary(romeCode, region),
      formations: getFormationsByRomeCode(romeCode, romeSkillsDatabase),
      careerPath: getCareerPath(romeCode),
      emergingSkills: getEmergingSkills(romeCode),
      keySkillsInDemand: getKeySkillsInDemand(romeCode)
    };

    return NextResponse.json({
      success: true,
      data: detailedAnalysis
    });

  } catch (error) {
    console.error('Erreur analyse métier:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse du métier" },
      { status: 500 }
    );
  }
} 