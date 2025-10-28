import React from 'react';
import { Cell, Report } from '../types';
import { calculateCellGrowth, getGrowthColorClasses, getGrowthIcon } from '../utils/cellGrowth';

interface CellGrowthBadgeProps {
  cell: Cell;
  latestReport?: Report;
  showDetails?: boolean;
}

const CellGrowthBadge: React.FC<CellGrowthBadgeProps> = ({ cell, latestReport, showDetails = false }) => {
  const growth = calculateCellGrowth(cell, latestReport);
  const colors = getGrowthColorClasses(growth.color);
  const icon = getGrowthIcon(growth.color);

  if (!showDetails) {
    // Version compacte : juste le badge coloré
    return (
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
        title={`${growth.label}${growth.percentage !== null ? ` (${growth.percentage > 0 ? '+' : ''}${growth.percentage}%)` : ''}`}
      >
        {icon} {growth.label}
      </span>
    );
  }

  // Version détaillée avec informations complètes
  return (
    <div className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${colors.text}`}>
          {icon} {growth.label}
        </span>
        {growth.percentage !== null && (
          <span className={`text-lg font-bold ${colors.text}`}>
            {growth.percentage > 0 ? '+' : ''}{growth.percentage}%
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-600">Initial :</span>
          <span className={`ml-1 font-semibold ${colors.text}`}>{growth.initialCount}</span>
        </div>
        <div>
          <span className="text-gray-600">Actuel :</span>
          <span className={`ml-1 font-semibold ${colors.text}`}>{growth.currentCount}</span>
        </div>
      </div>

      {growth.color === 'gray' && (
        <p className="text-xs text-gray-500 mt-2">
          {growth.label === 'Non défini' 
            ? 'Définissez le nombre initial de membres pour suivre l\'évolution'
            : 'Aucun rapport disponible pour cette cellule'}
        </p>
      )}
    </div>
  );
};

export default CellGrowthBadge;
