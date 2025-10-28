import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { api } from '../services/api.real';
import { Cell, Report, UserRole } from '../types';
import CellGrowthBadge from './CellGrowthBadge.tsx';
import { SpinnerIcon } from './icons.tsx';
import { calculateCellGrowth } from '../utils/cellGrowth';

const CellGrowthStatsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cells, setCells] = useState<Cell[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterColor, setFilterColor] = useState<'all' | 'green' | 'yellow' | 'red' | 'gray'>('all');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Charger les cellules selon la hiérarchie
      const cellsData = await api.getCellsForUser(user);
      setCells(cellsData);

      // Charger tous les rapports pour calculer les derniers rapports par cellule
      const reportsData = await api.getReports(user, {
        start: '2020-01-01',
        end: new Date().toISOString().split('T')[0],
      });
      setReports(reportsData);
    } catch (error: any) {
      showToast(error.message || 'Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Obtenir le dernier rapport pour une cellule donnée
  const getLatestReport = (cell: Cell): Report | undefined => {
    const cellReports = reports.filter(
      r => r.cellName === cell.cellName && 
           r.cellCategory === cell.cellCategory &&
           r.region === cell.region &&
           r.group === cell.group &&
           r.district === cell.district
    );
    
    if (cellReports.length === 0) return undefined;
    
    // Trier par date décroissante et prendre le premier
    return cellReports.sort((a, b) => 
      new Date(b.cellDate).getTime() - new Date(a.cellDate).getTime()
    )[0];
  };

  // Calculer les statistiques globales
  const stats = React.useMemo(() => {
    const cellsWithGrowth = cells.map(cell => ({
      cell,
      latestReport: getLatestReport(cell),
    }));

    const green = cellsWithGrowth.filter(({ cell, latestReport }) => {
      const growth = calculateCellGrowth(cell, latestReport);
      return growth.color === 'green';
    }).length;

    const yellow = cellsWithGrowth.filter(({ cell, latestReport }) => {
      const growth = calculateCellGrowth(cell, latestReport);
      return growth.color === 'yellow';
    }).length;

    const red = cellsWithGrowth.filter(({ cell, latestReport }) => {
      const growth = calculateCellGrowth(cell, latestReport);
      return growth.color === 'red';
    }).length;

    const gray = cellsWithGrowth.filter(({ cell, latestReport }) => {
      const growth = calculateCellGrowth(cell, latestReport);
      return growth.color === 'gray';
    }).length;

    return { green, yellow, red, gray, total: cells.length };
  }, [cells, reports]);

  // Filtrer les cellules selon le filtre de couleur
  const filteredCells = React.useMemo(() => {
    if (filterColor === 'all') return cells;
    
    return cells.filter(cell => {
      const latestReport = getLatestReport(cell);
      const growth = calculateCellGrowth(cell, latestReport);
      return growth.color === filterColor;
    });
  }, [cells, reports, filterColor]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerIcon className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Évolution des Cellules</h1>

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
        <h3 className="font-semibold text-blue-900 mb-2">📊 Critères d'évaluation :</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>📈 Vert (Excellente croissance)</strong> : Augmentation ≥ 10% par rapport au nombre initial</li>
          <li><strong>➡️ Jaune (Croissance modérée)</strong> : Variation entre -10% et +10%</li>
          <li><strong>📉 Rouge (Baisse critique)</strong> : Diminution &gt; 10% par rapport au nombre initial</li>
          <li><strong>❓ Gris (Non évalué)</strong> : Pas de nombre initial défini ou pas de rapport disponible</li>
        </ul>
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
              const latestReport = getLatestReport(cell);
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
                    <CellGrowthBadge cell={cell} latestReport={latestReport} />
                  </div>

                  <CellGrowthBadge cell={cell} latestReport={latestReport} showDetails />
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
