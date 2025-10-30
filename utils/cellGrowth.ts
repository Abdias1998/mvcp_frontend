import { Cell, Report } from '../types';

export interface CellGrowthStatus {
  color: 'green' | 'yellow' | 'red' | 'gray';
  label: string;
  percentage: number | null;
  currentCount: number;
  initialCount: number;
}

/**
 * Calcule le statut de croissance d'une cellule
 * @param cell - La cellule
 * @param latestReport - Le dernier rapport de la cellule (optionnel)
 * @returns Le statut de croissance avec couleur et pourcentage
 */
export function calculateCellGrowth(
  cell: Cell,
  latestReport?: Report
): CellGrowthStatus {
  const initialCount = cell.initialMembersCount || 0;
  
  // Si pas de nombre initial défini
  if (initialCount === 0) {
    return {
      color: 'gray',
      label: 'Non défini',
      percentage: null,
      currentCount: 0,
      initialCount: 0,
    };
  }

  // Si pas de rapport, on ne peut pas calculer
  if (!latestReport) {
    return {
      color: 'gray',
      label: 'Pas de rapport',
      percentage: null,
      currentCount: 0,
      initialCount,
    };
  }

  // Nombre actuel = Total sur liste du dernier rapport
  // Utilise initialMembersCount qui représente le nombre total de membres inscrits
  const currentCount = latestReport.initialMembersCount || 0;
  
  // Calculer le pourcentage d'évolution
  const growthPercentage = ((currentCount - initialCount) / initialCount) * 100;

  // Déterminer la couleur et le label selon l'évolution
  let color: 'green' | 'yellow' | 'red';
  let label: string;

  if (growthPercentage >= 10) {
    // Croissance >= 10% : Vert (Excellent)
    color = 'green';
    label = 'Excellente croissance';
  } else if (growthPercentage >= 0) {
    // Croissance entre 0% et 10% : Jaune (Passable)
    color = 'yellow';
    label = 'Croissance modérée';
  } else if (growthPercentage >= -10) {
    // Décroissance entre 0% et -10% : Jaune (Attention)
    color = 'yellow';
    label = 'Légère baisse';
  } else {
    // Décroissance > 10% : Rouge (Critique)
    color = 'red';
    label = 'Baisse critique';
  }

  return {
    color,
    label,
    percentage: Math.round(growthPercentage * 10) / 10, // Arrondi à 1 décimale
    currentCount,
    initialCount,
  };
}

/**
 * Retourne les classes Tailwind CSS pour la couleur de fond et le texte
 */
export function getGrowthColorClasses(color: 'green' | 'yellow' | 'red' | 'gray'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (color) {
    case 'green':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
      };
    case 'yellow':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
      };
    case 'red':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
      };
    case 'gray':
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-300',
      };
  }
}

/**
 * Retourne l'icône appropriée selon la couleur
 */
export function getGrowthIcon(color: 'green' | 'yellow' | 'red' | 'gray'): string {
  switch (color) {
    case 'green':
      return '📈'; // Tendance haussière
    case 'yellow':
      return '➡️'; // Stable
    case 'red':
      return '📉'; // Tendance baissière
    case 'gray':
    default:
      return '❓'; // Inconnu
  }
}
