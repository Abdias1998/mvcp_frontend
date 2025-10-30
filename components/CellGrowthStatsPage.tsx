import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { api } from '../services/api.real';
import { Cell, Report, UserRole } from '../types';
import CellGrowthBadge from './CellGrowthBadge.tsx';
import { SpinnerIcon } from './icons.tsx';
import { calculateCellGrowth } from '../utils/cellGrowth';
import { getContextualPageTitle } from '../utils/pageTitle.ts';

const CellGrowthStatsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cells, setCells] = useState<Cell[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [previousMonthReports, setPreviousMonthReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterColor, setFilterColor] = useState<'all' | 'green' | 'yellow' | 'red' | 'gray'>('all');
  
  // Filtre par mois/année
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedMonth, selectedYear]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Charger les cellules selon la hiérarchie
      const cellsData = await api.getCellsForUser(user);
      setCells(cellsData);

      // Calculer les dates de début et fin du mois sélectionné
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0); // Dernier jour du mois
      
      // Charger les rapports du mois sélectionné ET du mois précédent (pour comparaison)
      const prevMonthStart = new Date(selectedYear, selectedMonth - 2, 1);
      const prevMonthEnd = new Date(selectedYear, selectedMonth - 1, 0);
      
      const [currentMonthReports, prevMonthReports] = await Promise.all([
        api.getReports(user, {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        }),
        api.getReports(user, {
          start: prevMonthStart.toISOString().split('T')[0],
          end: prevMonthEnd.toISOString().split('T')[0],
        })
      ]);
      
      console.log('📋 Rapports du mois actuel:', currentMonthReports.length);
      console.log('📋 Rapports du mois précédent:', prevMonthReports.length);
      
      // Stocker les deux ensembles de rapports
      setReports(currentMonthReports);
      // On va aussi stocker les rapports du mois précédent dans un state séparé
      setPreviousMonthReports(prevMonthReports);
    } catch (error: any) {
      showToast(error.message || 'Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Obtenir tous les rapports du mois actuel pour une cellule donnée
  const getCurrentMonthReports = (cell: Cell): Report[] => {
    return reports.filter(r => {
      const nameMatch = !cell.cellName || !r.cellName || r.cellName === cell.cellName;
      const categoryMatch = r.cellCategory === cell.cellCategory;
      const regionMatch = r.region === cell.region;
      const groupMatch = r.group === cell.group;
      const districtMatch = r.district === cell.district;
      
      return nameMatch && categoryMatch && regionMatch && groupMatch && districtMatch;
    });
  };

  // Obtenir tous les rapports du mois précédent pour une cellule donnée
  const getPreviousMonthReports = (cell: Cell): Report[] => {
    return previousMonthReports.filter(r => {
      const nameMatch = !cell.cellName || !r.cellName || r.cellName === cell.cellName;
      const categoryMatch = r.cellCategory === cell.cellCategory;
      const regionMatch = r.region === cell.region;
      const groupMatch = r.group === cell.group;
      const districtMatch = r.district === cell.district;
      
      return nameMatch && categoryMatch && regionMatch && groupMatch && districtMatch;
    });
  };

  // Calculer la moyenne des membres inscrits pour une liste de rapports
  const calculateAverageMembers = (reports: Report[]): number => {
    if (reports.length === 0) return 0;
    
    const total = reports.reduce((sum, report) => {
      return sum + (report.initialMembersCount || 0);
    }, 0);
    
    return total / reports.length;
  };

  // Calculer la croissance en comparant les moyennes mensuelles
  const calculateMonthlyGrowth = (cell: Cell) => {
    const currentMonthReports = getCurrentMonthReports(cell);
    const previousMonthReports = getPreviousMonthReports(cell);

    // Si pas de rapport ce mois-ci
    if (currentMonthReports.length === 0) {
      return {
        color: 'gray' as const,
        label: 'Pas de rapport ce mois',
        percentage: null,
        currentAverage: 0,
        previousAverage: 0,
        currentReportsCount: 0,
        previousReportsCount: 0,
      };
    }

    const currentAverage = calculateAverageMembers(currentMonthReports);

    // Si pas de rapport le mois précédent, on ne peut pas comparer
    if (previousMonthReports.length === 0) {
      return {
        color: 'gray' as const,
        label: 'Premier mois',
        percentage: null,
        currentAverage: Math.round(currentAverage * 10) / 10,
        previousAverage: 0,
        currentReportsCount: currentMonthReports.length,
        previousReportsCount: 0,
      };
    }

    const previousAverage = calculateAverageMembers(previousMonthReports);

    // Éviter la division par zéro
    if (previousAverage === 0) {
      return {
        color: 'gray' as const,
        label: 'Données insuffisantes',
        percentage: null,
        currentAverage: Math.round(currentAverage * 10) / 10,
        previousAverage: 0,
        currentReportsCount: currentMonthReports.length,
        previousReportsCount: previousMonthReports.length,
      };
    }

    // Calculer le pourcentage d'évolution basé sur les moyennes
    const growthPercentage = ((currentAverage - previousAverage) / previousAverage) * 100;

    // Déterminer la couleur et le label
    let color: 'green' | 'yellow' | 'red';
    let label: string;

    if (growthPercentage >= 10) {
      color = 'green';
      label = 'Excellente croissance';
    } else if (growthPercentage >= 0) {
      color = 'yellow';
      label = 'Croissance modérée';
    } else if (growthPercentage >= -10) {
      color = 'yellow';
      label = 'Légère baisse';
    } else {
      color = 'red';
      label = 'Baisse critique';
    }

    return {
      color,
      label,
      percentage: Math.round(growthPercentage * 10) / 10,
      currentAverage: Math.round(currentAverage * 10) / 10,
      previousAverage: Math.round(previousAverage * 10) / 10,
      currentReportsCount: currentMonthReports.length,
      previousReportsCount: previousMonthReports.length,
    };
  };

  // Calculer les statistiques globales
  const stats = React.useMemo(() => {
    const green = cells.filter(cell => {
      const growth = calculateMonthlyGrowth(cell);
      return growth.color === 'green';
    }).length;

    const yellow = cells.filter(cell => {
      const growth = calculateMonthlyGrowth(cell);
      return growth.color === 'yellow';
    }).length;

    const red = cells.filter(cell => {
      const growth = calculateMonthlyGrowth(cell);
      return growth.color === 'red';
    }).length;

    const gray = cells.filter(cell => {
      const growth = calculateMonthlyGrowth(cell);
      return growth.color === 'gray';
    }).length;

    return { green, yellow, red, gray, total: cells.length };
  }, [cells, reports, previousMonthReports]);

  // Filtrer les cellules selon le filtre de couleur
  const filteredCells = React.useMemo(() => {
    if (filterColor === 'all') return cells;
    
    return cells.filter(cell => {
      const growth = calculateMonthlyGrowth(cell);
      return growth.color === filterColor;
    });
  }, [cells, reports, previousMonthReports, filterColor]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerIcon className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  // Générer les options de mois et années
  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - i);
  const pageTitle = getContextualPageTitle('Évolution des Cellules', user);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{pageTitle}</h1>

      {/* Filtres par mois et année */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
              Mois :
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
              Année :
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            📊 Période : {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div 
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            filterColor === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
          onClick={() => setFilterColor('all')}
        >
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Total cellules</div>
        </div>

        <div 
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            filterColor === 'green' ? 'border-green-500 bg-green-50' : 'border-green-200 bg-white hover:border-green-300'
          }`}
          onClick={() => setFilterColor('green')}
        >
          <div className="text-2xl font-bold text-green-700">📈 {stats.green}</div>
          <div className="text-sm text-green-600">Excellente croissance</div>
        </div>

        <div 
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            filterColor === 'yellow' ? 'border-yellow-500 bg-yellow-50' : 'border-yellow-200 bg-white hover:border-yellow-300'
          }`}
          onClick={() => setFilterColor('yellow')}
        >
          <div className="text-2xl font-bold text-yellow-700">➡️ {stats.yellow}</div>
          <div className="text-sm text-yellow-600">Croissance modérée</div>
        </div>

        <div 
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            filterColor === 'red' ? 'border-red-500 bg-red-50' : 'border-red-200 bg-white hover:border-red-300'
          }`}
          onClick={() => setFilterColor('red')}
        >
          <div className="text-2xl font-bold text-red-700">📉 {stats.red}</div>
          <div className="text-sm text-red-600">Baisse critique</div>
        </div>

        <div 
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            filterColor === 'gray' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onClick={() => setFilterColor('gray')}
        >
          <div className="text-2xl font-bold text-gray-700">❓ {stats.gray}</div>
          <div className="text-sm text-gray-600">Non évalué</div>
        </div>
      </div>

      {/* Légende */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Critères d'évaluation (Comparaison mensuelle) :</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>📈 Vert (Excellente croissance)</strong> : Augmentation ≥ 10% de la moyenne mensuelle</li>
          <li><strong>➡️ Jaune (Croissance modérée/Légère baisse)</strong> : Variation entre -10% et +10%</li>
          <li><strong>📉 Rouge (Baisse critique)</strong> : Diminution &gt; 10% de la moyenne mensuelle</li>
          <li><strong>❓ Gris (Non évalué)</strong> : Pas de rapports ou données insuffisantes</li>
        </ul>
        <p className="text-xs text-blue-700 mt-2">
          💡 La moyenne est calculée sur tous les rapports du mois (tous les dimanches)
        </p>
      </div>

      {/* Liste des cellules */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {filterColor === 'all' ? 'Toutes les cellules' : `Cellules filtrées (${filteredCells.length})`}
        </h2>

        {filteredCells.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune cellule trouvée</p>
        ) : (
          <div className="space-y-4">
            {filteredCells.map((cell) => {
              const growth = calculateMonthlyGrowth(cell);
              const colorClasses = {
                green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
                yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
                red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
                gray: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
              }[growth.color];

              return (
                <div key={cell.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{cell.cellName}</h3>
                      <p className="text-sm text-gray-600">
                        {cell.region} • {cell.group} • {cell.district}
                      </p>
                      <p className="text-sm text-gray-500">
                        Responsable : {cell.leaderName}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border}`}>
                      {growth.label}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border ${colorClasses.bg} ${colorClasses.border}`}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Mois actuel :</span>
                        <div className={`text-lg font-bold ${colorClasses.text}`}>
                          {growth.currentAverage} membres (moy.)
                        </div>
                        <span className="text-xs text-gray-500">
                          {growth.currentReportsCount} rapport(s)
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mois précédent :</span>
                        <div className={`text-lg font-bold ${colorClasses.text}`}>
                          {growth.previousAverage} membres (moy.)
                        </div>
                        <span className="text-xs text-gray-500">
                          {growth.previousReportsCount} rapport(s)
                        </span>
                      </div>
                    </div>
                    {growth.percentage !== null && (
                      <div className="mt-2 text-center">
                        <span className={`text-2xl font-bold ${colorClasses.text}`}>
                          {growth.percentage > 0 ? '+' : ''}{growth.percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CellGrowthStatsPage;
