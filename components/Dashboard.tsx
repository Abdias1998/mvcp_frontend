import React, { useState, useMemo, useEffect, useRef, forwardRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { User, Report, UserRole, Cell as CellType, CellStatus, District } from '../types.ts';
import { api } from '../services/api.real';
import { UsersIcon, ChartBarIcon, CheckCircleIcon, FileDownloadIcon, SpinnerIcon, AlertTriangleIcon, RefreshIcon, TrashIcon, DocumentTextIcon, LogoIcon, StarIcon, XIcon, SpeakerphoneIcon, BookOpenIcon, HomeIcon, MapIcon, ChevronLeftIcon } from './icons.tsx';
import ReportDetailModal from './ReportDetailModal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { REGIONS } from '../constants.ts';

const ITEMS_PER_PAGE = 10;
const getInitialDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
    };
};


// --- HELPERS & SUB-COMPONENTS (Shared between dashboards) ---
type TrendStatus = 'growth' | 'stagnation' | 'decline' | 'neutral';
type TrendData = { change: number; status: TrendStatus; newMembers: number; };

const calculateTrend = (
    reports: Report[], 
    weeks: number = 4, 
    groupBy: 'region' | 'group' | 'district' | 'cellId',
    cells: CellType[] = []
): { [key: string]: TrendData } => {
    const now = new Date();
    const trendData: { [key: string]: TrendData } = {};

    const groupedReports: { [groupKey: string]: Report[] } = {};

    reports.forEach(r => {
        let groupKey: string;
        if (groupBy === 'cellId') {
            const cell = cells.find(c => c.region === r.region && c.group === r.group && c.district === r.district && c.cellName === r.cellName);
            groupKey = cell?.id || `${r.region}|${r.group}|${r.district}|${r.cellName}`;
        } else {
            groupKey = String(r[groupBy as keyof Report]);
        }
        if (!groupedReports[groupKey]) {
            groupedReports[groupKey] = [];
        }
        groupedReports[groupKey].push(r);
    });
    
    for (const groupKey in groupedReports) {
        const allGroupReports = groupedReports[groupKey];
        
        const periodEndDate = now;
        const periodStartDate = new Date();
        periodStartDate.setDate(now.getDate() - (weeks * 7));
        
        const reportsInPeriod = allGroupReports.filter(r => {
            const reportDate = new Date(r.cellDate);
            return reportDate >= periodStartDate && reportDate <= periodEndDate;
        });

        const newMembers = reportsInPeriod.reduce((sum, r) => sum + r.invitedPeople.length, 0);

        if (reportsInPeriod.length < 2) {
            trendData[groupKey] = { change: 0, status: 'neutral', newMembers };
            continue;
        }

        const midPointDate = new Date();
        midPointDate.setDate(now.getDate() - (weeks * 7 / 2));

        const firstHalfReports = reportsInPeriod.filter(r => new Date(r.cellDate) < midPointDate);
        const secondHalfReports = reportsInPeriod.filter(r => new Date(r.cellDate) >= midPointDate);
        
        if(firstHalfReports.length === 0 || secondHalfReports.length === 0) {
            trendData[groupKey] = { change: 0, status: newMembers > 0 ? 'growth' : 'neutral', newMembers };
            continue;
        }

        const avgFirstHalf = firstHalfReports.reduce((sum, r) => sum + r.totalPresent, 0) / firstHalfReports.length;
        const avgSecondHalf = secondHalfReports.reduce((sum, r) => sum + r.totalPresent, 0) / secondHalfReports.length;

        let change = 0;
        if (avgFirstHalf > 0) {
            change = Math.round(((avgSecondHalf - avgFirstHalf) / avgFirstHalf) * 100);
        } else if (avgSecondHalf > 0) {
            change = 100; // Growth from zero
        }

        let status: TrendStatus;
        if (newMembers > 0 || change > 5) {
            status = 'growth';
        } else if (change < -5) {
            status = 'decline';
        } else {
            status = 'stagnation';
        }
        
        trendData[groupKey] = { change, status, newMembers };
    }

    return trendData;
};

const TrendBadge: React.FC<{ trend: TrendData | null }> = ({ trend }) => {
    if (!trend || trend.status === 'neutral') {
        return <span className="text-gray-400">-</span>;
    }

    const { status, change, newMembers } = trend;
    
    const colorClasses = {
        growth: { text: 'text-green-700', bg: 'bg-green-100', icon: 'text-green-500' },
        stagnation: { text: 'text-orange-700', bg: 'bg-orange-100', icon: 'text-orange-500' },
        decline: { text: 'text-red-700', bg: 'bg-red-100', icon: 'text-red-500' },
        neutral: { text: 'text-gray-700', bg: 'bg-gray-100', icon: 'text-gray-500' },
    };
    
    let trendIcon: string;
    let titleText: string = `Tendance: ${change}%, ${newMembers} invités.`;
    
    if (status === 'growth') trendIcon = '▲';
    else if (status === 'decline') trendIcon = '▼';
    else trendIcon = '▬';

    return (
        <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-semibold ${colorClasses[status].bg}`} title={titleText}>
            <span className={colorClasses[status].icon}>{trendIcon}</span>
            <span className={colorClasses[status].text}>{change}%</span>
            {newMembers > 0 && (
                <div className="flex items-center" title={`${newMembers} nouveaux invités`}>
                    <UsersIcon className={`h-3 w-3 ${colorClasses[status].text}`} />
                    <span className={`ml-0.5 ${colorClasses[status].text}`}>{newMembers}</span>
                </div>
            )}
        </div>
    );
};


const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; onClick?: () => void; }> = ({ title, value, icon, onClick }) => (
  <div className={`bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105 transition-transform duration-200' : ''}`} onClick={onClick}>
    <div className="bg-blue-100 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white border rounded shadow-lg text-sm">
                <p className="font-bold">Semaine du {label}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.fill }}>{`${pld.name}: ${pld.value}`}</p>
                ))}
            </div>
        );
    }
    return null;
};

const Pagination: React.FC<{ currentPage: number, totalItems: number, onPageChange: (page: number) => void }> = ({ currentPage, totalItems, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-between items-center mt-4 text-sm">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300">Précédent</button>
            <span>Page {currentPage} sur {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300">Suivant</button>
        </div>
    );
};

const EmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
    <div className="text-center bg-white p-12 rounded-xl shadow-md">
        <ChartBarIcon className="mx-auto h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">Aucune donnée à afficher</h3>
        <p className="mt-2 text-sm text-gray-500">
            Il n'y a aucun rapport pour la période ou le filtre sélectionné.
        </p>
        <div className="mt-6">
            <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <RefreshIcon className="-ml-1 mr-2 h-5 w-5" />
                Réinitialiser les filtres
            </button>
        </div>
    </div>
);

const SummaryTable: React.FC<{ title: string; data: any[]; headers: {key: string; label: string; render?: (row: any) => React.ReactNode}[]; onRowClick?: (row: any) => void; }> = ({ title, data, headers, onRowClick }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-semibold text-gray-700 mb-4">{title}</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        {headers.map(h => <th key={h.key} className="px-4 py-3">{h.label}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className={`bg-white border-b font-medium ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`} onClick={() => onRowClick?.(row)}>
                            {headers.map((header) => (
                                <td key={header.key} className={`px-4 py-3`}>
                                    {header.render ? header.render(row) : row[header.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const DEMOGRAPHICS_COLORS = ['#3B82F6', '#60A5FA', '#93C5FD'];
const STATUS_COLORS = ['#22C55E', '#FBBF24', '#3B82F6', '#6B7280'];

interface ReportPDFProps {
    user: User;
    stats: any;
    dateRange: { start: string; end: string };
    summaryData: any[];
    demographicsData: any[];
    title: string;
    testimonies: Report[];
    newMembers: any[];
}

const ReportPDF = forwardRef<HTMLDivElement, ReportPDFProps>(({ user, stats, dateRange, summaryData, demographicsData, title, testimonies, newMembers }, ref) => {
    const summaryHeaders = ['Entité', 'Rapports', 'Présence Totale', 'Étude Biblique', 'Heure Miracle', 'Culte Dominical'];
    
    return (
        <div ref={ref} className="bg-white p-8" style={{ width: '210mm' }}>
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center space-x-3">
                    <LogoIcon className="h-16 w-16" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Rapport de Synthèse</h1>
                        <p className="text-gray-600">Ministère de Vie Chrétienne Profonde au BENIN</p>
                    </div>
                </div>
                <div className="text-right text-sm">
                    <p>Généré par: <strong>{user.name}</strong></p>
                    <p>Le: {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
            </div>

            <div className="my-6">
                <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
                <p className="text-gray-500">Période du {new Date(dateRange.start).toLocaleDateString('fr-FR')} au {new Date(dateRange.end).toLocaleDateString('fr-FR')}</p>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center mb-8">
                <div className="bg-gray-100 p-3 rounded-lg"><p className="text-xs text-gray-500">Rapports Soumis</p><p className="text-xl font-bold">{stats.totalReports}</p></div>
                <div className="bg-gray-100 p-3 rounded-lg"><p className="text-xs text-gray-500">Membres sur Liste</p><p className="text-xl font-bold">{stats.totalMembers}</p></div>
                <div className="bg-gray-100 p-3 rounded-lg"><p className="text-xs text-gray-500">Nouveaux Invités</p><p className="text-xl font-bold">{stats.newMembers}</p></div>
                <div className="bg-gray-100 p-3 rounded-lg"><p className="text-xs text-gray-500">Visites Effectuées</p><p className="text-xl font-bold">{stats.totalVisits}</p></div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Synthèse de la Participation</h3>
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>{summaryHeaders.map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {summaryData.map((row) => (
                            <tr key={row.name} className="bg-white border-b">
                                <td className="px-3 py-2 font-semibold">{row.name}</td>
                                <td className="px-3 py-2">{row.reportsCount}</td>
                                <td className="px-3 py-2">{row.totalPresent}</td>
                                <td className="px-3 py-2">{row.bibleStudy}</td>
                                <td className="px-3 py-2">{row.miracleHour}</td>
                                <td className="px-3 py-2">{row.sundayService}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mb-8">
                 <h3 className="text-lg font-semibold text-gray-700 mb-2">Répartition par Catégorie de Cellule</h3>
                 <div className="flex space-x-4">
                    {demographicsData.map(d => (
                        <div key={d.name} className="p-3 bg-blue-50 rounded-lg flex-1 text-center">
                            <p className="text-sm font-semibold text-blue-800">{d.name}</p>
                            <p className="text-2xl font-bold text-blue-900">{d.value}</p>
                        </div>
                    ))}
                 </div>
            </div>
            
            {newMembers.length > 0 && (
                <div className="mt-8" style={{ breakInside: 'avoid' }}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Nouveaux Invités ({newMembers.length})</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-3 py-2">Nom & Contact</th>
                                <th className="px-3 py-2">Cellule</th>
                                <th className="px-3 py-2">Groupe / District</th>
                            </tr>
                        </thead>
                        <tbody>
                            {newMembers.slice(0, 15).map((member, index) => (
                                <tr key={index} className="bg-white border-b" style={{ breakInside: 'avoid' }}>
                                    <td className="px-3 py-2">
                                        <p className="font-semibold">{member.name}</p>
                                        <p className="text-xs text-gray-600">{member.contact}</p>
                                    </td>
                                    <td className="px-3 py-2">{member.cellName}</td>
                                    <td className="px-3 py-2">
                                         <p className="font-semibold">{member.group}</p>
                                         <p className="text-xs text-gray-600">{member.district}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {newMembers.length > 15 && <p className="text-xs text-center mt-2 text-gray-500">et {newMembers.length - 15} autre(s).</p>}
                </div>
            )}

            {testimonies.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Témoignages Inspirants</h3>
                    <div className="space-y-3">
                        {testimonies.slice(0, 5).map(t => (
                            <div key={t.id} className="p-3 bg-gray-100 border-l-4 border-yellow-500 rounded-r-lg" style={{ breakInside: 'avoid' }}>
                                <p className="text-sm italic text-gray-800">"{t.poignantTestimony}"</p>
                                <p className="text-right text-xs font-semibold text-gray-600 mt-1">- {t.cellName} ({t.region})</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

const DrilldownDetailModal: React.FC<{
    item: { name: string; type: 'group' | 'region' } | null;
    onClose: () => void;
    allReports: Report[];
    allCells: CellType[];
}> = ({ item, onClose, allReports, allCells }) => {
    if (!item) return null;

    const isLittoralContext = item.type === 'group';

    const relevantReports = useMemo(() => allReports.filter(r => r[item.type] === item.name), [allReports, item]);
    const relevantCells = useMemo(() => allCells.filter(c => c[item.type] === item.name), [allCells, item]);

    const subGroupKey = isLittoralContext ? 'district' : 'group';
    const subGroupLabel = isLittoralContext ? 'District' : 'District';
    
    const subGroups = useMemo(() => {
        const grouped: { [key: string]: CellType[] } = {};
        relevantCells.forEach(cell => {
            const subGroupName = cell[subGroupKey as keyof CellType] as string;
            if (!grouped[subGroupName]) {
                grouped[subGroupName] = [];
            }
            grouped[subGroupName].push(cell);
        });
        return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    }, [relevantCells, subGroupKey]);

    const trendsByCell = useMemo(() => calculateTrend(relevantReports, 4, 'cellId', allCells), [relevantReports, allCells]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
                    <h3 className="text-xl font-bold text-gray-800">
                        Détails pour {item.type === 'group' ? `le groupe` : `la région`} "{item.name}"
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {subGroups.length > 0 ? subGroups.map(([subGroupName, cellsInSubGroup]) => (
                        <div key={subGroupName} className="border rounded-lg">
                            <h4 className="font-semibold text-gray-800 bg-gray-50 p-3 border-b">{subGroupLabel}: {subGroupName} ({cellsInSubGroup.length} cellules)</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Cellule</th>
                                            <th className="px-4 py-2 text-left">Hiérarchie</th>
                                            <th className="px-4 py-2 text-left">Tendance (4 sem.)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cellsInSubGroup.sort((a,b) => a.cellName.localeCompare(b.cellName)).map(cell => (
                                            <tr key={cell.id} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium">{cell.cellName}</td>
                                                <td className="px-4 py-2 text-xs">{`${cell.group} > ${cell.district}`}</td>
                                                <td className="px-4 py-2"><TrendBadge trend={trendsByCell[cell.id] || null} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-10">Aucune cellule à analyser pour cette sélection.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- DASHBOARD SELECTION COMPONENT ---
const DashboardSelection: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">Choisir une vue</h2>
                <p className="mt-2 text-lg text-gray-600">Veuillez sélectionner la portée des données à analyser.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <Link to="/admin?view=littoral" className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="flex flex-col items-center text-center">
                        <HomeIcon className="h-16 w-16 text-blue-600 mb-4 transition-transform duration-300 group-hover:scale-110"/>
                        <h3 className="text-2xl font-bold text-gray-800">Littoral</h3>
                        <p className="mt-2 text-gray-600">{"Consulter les données spécifiques à la hiérarchie du Littoral (Région > Groupe > District)."}</p>
                    </div>
                </Link>
                <Link to="/admin?view=regions" className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="flex flex-col items-center text-center">
                        <MapIcon className="h-16 w-16 text-green-600 mb-4 transition-transform duration-300 group-hover:scale-110"/>
                        <h3 className="text-2xl font-bold text-gray-800">Autres Régions</h3>
                        <p className="mt-2 text-gray-600">{"Consulter les données pour toutes les autres régions (Région > District > Localité)."}</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

// --- LITTORAL DASHBOARD COMPONENT ---
const LittoralDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [cells, setCells] = useState<CellType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState(getInitialDateRange);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [drilldownItem, setDrilldownItem] = useState<{ name: string; type: 'group' | 'region' } | null>(null);
    const [featuredTestimonyId, setFeaturedTestimonyId] = useState<string | null>(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);
            const [fetchedReports, fetchedCells, featuredTestimony] = await Promise.all([
                api.getReports(user, dateRange),
                api.getCellsForUser(user),
                api.getFeaturedTestimony()
            ]);
            console.log('📊 Dashboard - Rapports récupérés:', fetchedReports.length, fetchedReports);
            console.log('📊 Dashboard - Cellules récupérées:', fetchedCells.length, fetchedCells);
            setAllReports(fetchedReports);
            setCells(fetchedCells);
            if (featuredTestimony) {
                setFeaturedTestimonyId(featuredTestimony.id);
            }
            setCurrentPage(1);
        } catch (err: any) {
            setError(`Erreur lors de la récupération des rapports: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [user, dateRange]);
    
    const reportsToAnalyze = useMemo(() => allReports.filter(r => r.region === 'Littoral'), [allReports]);
    const cellsToAnalyze = useMemo(() => cells.filter(c => c.region === 'Littoral'), [cells]);
    
    const stats = useMemo(() => {
        if (reportsToAnalyze.length === 0) return { totalReports: 0, avgAttendance: 0, totalMembers: 0, newMembers: 0, totalVisits: 0 };
        const totalReports = reportsToAnalyze.length;
        const totalPresentSum = reportsToAnalyze.reduce((acc, r) => acc + r.totalPresent, 0);
        const avgAttendance = totalReports > 0 ? Math.round(totalPresentSum / totalReports) : 0;
        const newMembers = reportsToAnalyze.reduce((acc, r) => acc + r.invitedPeople.length, 0);
        const totalVisits = reportsToAnalyze.reduce((acc, r) => acc + r.visitsMade.length, 0);
        
        const latestReportsByCell = new Map<string, Report>();
        reportsToAnalyze.forEach(r => {
            const key = `${r.region}-${r.group}-${r.district}-${r.cellName}`;
            if (!latestReportsByCell.has(key) || new Date(r.cellDate) > new Date(latestReportsByCell.get(key)!.cellDate)) {
                latestReportsByCell.set(key, r);
            }
        });
        const totalMembers = Array.from(latestReportsByCell.values()).reduce((acc, r) => acc + r.initialMembersCount, 0);

        return { totalReports, avgAttendance, totalMembers, newMembers, totalVisits };
    }, [reportsToAnalyze]);

    const weeklyData = useMemo(() => {
        const weeks: { [key: string]: { 'Présence totale': number, 'Nouveaux Invités': number } } = {};
        reportsToAnalyze.forEach(report => {
            const reportDate = new Date(report.cellDate);
            const weekStart = new Date(reportDate.setDate(reportDate.getDate() - reportDate.getDay()));
            const weekKey = weekStart.toLocaleDateString('fr-FR');
            if (!weeks[weekKey]) {
                weeks[weekKey] = { 'Présence totale': 0, 'Nouveaux Invités': 0 };
            }
            weeks[weekKey]['Présence totale'] += report.totalPresent;
            weeks[weekKey]['Nouveaux Invités'] += report.invitedPeople.length;
        });
        return Object.entries(weeks).map(([week, data]) => ({ week, ...data })).sort((a,b) => new Date(a.week.split('/').reverse().join('-')).getTime() - new Date(b.week.split('/').reverse().join('-')).getTime());
    }, [reportsToAnalyze]);
    
    const weeklyParticipationData = useMemo(() => {
        const weeks: { [key: string]: { 'Étude Biblique': number, 'Heure de Réveil': number, 'Culte Dominical': number } } = {};
        reportsToAnalyze.forEach(report => {
            const reportDate = new Date(report.cellDate);
            const weekStart = new Date(reportDate.setDate(reportDate.getDate() - reportDate.getDay()));
            const weekKey = weekStart.toLocaleDateString('fr-FR');
            if (!weeks[weekKey]) {
                weeks[weekKey] = { 'Étude Biblique': 0, 'Heure de Réveil': 0, 'Culte Dominical': 0 };
            }
            weeks[weekKey]['Étude Biblique'] += report.bibleStudy;
            weeks[weekKey]['Heure de Réveil'] += report.miracleHour;
            weeks[weekKey]['Culte Dominical'] += report.sundayServiceAttendance;
        });
        return Object.entries(weeks)
            .map(([week, data]) => ({ week, ...data }))
            .sort((a,b) => new Date(a.week.split('/').reverse().join('-')).getTime() - new Date(b.week.split('/').reverse().join('-')).getTime());
    }, [reportsToAnalyze]);

    const poignantTestimonies = useMemo(() => {
        return reportsToAnalyze
            .filter(r => r.poignantTestimony && r.poignantTestimony.trim().length > 10)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }, [reportsToAnalyze]);

    const demographicsData = useMemo(() => {
        // Répartition par catégorie de cellule avec regroupement (nombre total de membres inscrits)
        const categoryCount: { [key: string]: number } = {
            'Hommes': 0,
            'Femmes': 0,
            'Enfants': 0,
            'Mixte': 0
        };

        reportsToAnalyze.forEach(report => {
            const category = report.cellCategory;
            const membersCount = report.initialMembersCount || 0; // Nombre de membres inscrits
            
            // Regrouper "Hommes" et "Jeunes Hommes" → "Hommes"
            if (category === 'Hommes' || category === 'Jeunes Hommes') {
                categoryCount['Hommes'] += membersCount;
            }
            // Regrouper "Femmes" et "Jeunes Femmes" → "Femmes"
            else if (category === 'Femmes' || category === 'Jeunes Femmes') {
                categoryCount['Femmes'] += membersCount;
            }
            // Enfants (pas de regroupement)
            else if (category === 'Enfants') {
                categoryCount['Enfants'] += membersCount;
            }
            // Mixte (pas de regroupement)
            else if (category === 'Mixte') {
                categoryCount['Mixte'] += membersCount;
            }
        });

        return [
            { name: 'Hommes', value: categoryCount['Hommes'] },
            { name: 'Femmes', value: categoryCount['Femmes'] },
            { name: 'Enfants', value: categoryCount['Enfants'] },
            { name: 'Mixte', value: categoryCount['Mixte'] }
        ].filter(d => d.value > 0); // Ne montrer que les catégories avec des membres
    }, [reportsToAnalyze]);
    
    const participationRateData = useMemo(() => {
        // Calculer le taux de participation aux programmes
        const totalMembers = reportsToAnalyze.reduce((sum, r) => sum + (r.initialMembersCount || 0), 0);
        const totalBibleStudy = reportsToAnalyze.reduce((sum, r) => sum + (r.bibleStudy || 0), 0);
        const totalMiracleHour = reportsToAnalyze.reduce((sum, r) => sum + (r.miracleHour || 0), 0);
        const totalSundayService = reportsToAnalyze.reduce((sum, r) => sum + (r.sundayServiceAttendance || 0), 0);

        if (totalMembers === 0) return [];

        const bibleStudyPercent = Math.round((totalBibleStudy / totalMembers) * 100);
        const miracleHourPercent = Math.round((totalMiracleHour / totalMembers) * 100);
        const sundayServicePercent = Math.round((totalSundayService / totalMembers) * 100);
        const missingPercent = Math.max(0, 100 - Math.max(bibleStudyPercent, miracleHourPercent, sundayServicePercent));

        return [
            { name: 'Étude Biblique', value: bibleStudyPercent, count: totalBibleStudy, color: '#3B82F6' },
            { name: 'Heure de Réveil', value: miracleHourPercent, count: totalMiracleHour, color: '#8B5CF6' },
            { name: 'Culte Dominical', value: sundayServicePercent, count: totalSundayService, color: '#22C55E' },
            { name: 'Absents', value: missingPercent, count: totalMembers - Math.max(totalBibleStudy, totalMiracleHour, totalSundayService), color: '#EF4444' }
        ].filter(d => d.value > 0);
    }, [reportsToAnalyze]);

    const trendsByGroup = useMemo(() => calculateTrend(reportsToAnalyze, 4, 'group', cells), [reportsToAnalyze, cells]);
    
    const summaryByGroup = useMemo(() => {
        const groups: { [key: string]: { reportsCount: number, totalPresent: number, bibleStudy: number, miracleHour: number, sundayService: number } } = {};
        reportsToAnalyze.forEach(r => {
            if (!groups[r.group]) {
                groups[r.group] = { reportsCount: 0, totalPresent: 0, bibleStudy: 0, miracleHour: 0, sundayService: 0 };
            }
            groups[r.group].reportsCount++;
            groups[r.group].totalPresent += r.totalPresent;
            groups[r.group].bibleStudy += r.bibleStudy;
            groups[r.group].miracleHour += r.miracleHour;
            groups[r.group].sundayService += r.sundayServiceAttendance;
        });
        return Object.entries(groups).map(([name, data]) => ({ name, ...data, trend: trendsByGroup[name] || null })).sort((a,b) => b.totalPresent - a.totalPresent);
    }, [reportsToAnalyze, trendsByGroup]);

    const trendsByCell = useMemo(() => calculateTrend(reportsToAnalyze, 4, 'cellId', cells), [reportsToAnalyze, cells]);

    const summaryByCell = useMemo(() => {
        return cellsToAnalyze.map(cell => {
            return {
                name: cell.cellName,
                hierarchy: `${cell.group} > ${cell.district}`,
                trend: trendsByCell[cell.id] || null
            }
        }).sort((a, b) => (b.trend?.change ?? -Infinity) - (a.trend?.change ?? -Infinity));
    }, [cellsToAnalyze, trendsByCell]);
    
    const paginatedReports = useMemo(() => {
        return reportsToAnalyze.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [reportsToAnalyze, currentPage]);

    const handleDeleteRequest = (report: Report) => setReportToDelete(report);
    
    const handleConfirmDelete = async () => {
        if (!reportToDelete) return;
        setIsDeleting(true);
        try {
            await api.deleteReport(reportToDelete.id);
            showToast('Rapport supprimé avec succès.', 'success');
            await fetchReports();
        } catch (err: any) {
            showToast(`Erreur : ${err.message}`, 'error');
        } finally {
            setIsDeleting(false);
            setReportToDelete(null);
        }
    };
    
    const handleExportXLSX = () => {
        const dataToExport = reportsToAnalyze.map(r => ({
            "Date": r.cellDate, "Région": r.region, "Groupe": r.group, "District": r.district,
            "Cellule": r.cellName, "Responsable": r.leaderName, "Total Présents": r.totalPresent,
            "Invités": r.invitedPeople.length, "Visites": r.visitsMade.length,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rapports_Littoral");
        XLSX.writeFile(workbook, "Rapports_Littoral.xlsx");
    };

    const handleGeneratePDF = async () => {
        if (!pdfRef.current || reportsToAnalyze.length === 0) return;
        setIsGeneratingPDF(true);
        
        // Rendre le composant visible temporairement pour la capture
        const pdfElement = pdfRef.current;
        const originalPosition = pdfElement.style.position;
        const originalLeft = pdfElement.style.left;
        const originalTop = pdfElement.style.top;
        const originalVisibility = pdfElement.style.visibility;
        
        pdfElement.style.position = 'absolute';
        pdfElement.style.left = '0';
        pdfElement.style.top = '0';
        pdfElement.style.visibility = 'visible';
        
        try {
            const testimoniesList = reportsToAnalyze.filter(r => r.poignantTestimony && r.poignantTestimony.trim().length > 10).slice(0, 5);
            const newMembersList = reportsToAnalyze.flatMap(r => 
                r.invitedPeople.map(p => ({
                    ...p, cellName: r.cellName, group: r.group, district: r.district
                }))
            );

            // Attendre un court instant pour s'assurer que le rendu est complet
            await new Promise(resolve => setTimeout(resolve, 100));

            // Options améliorées pour html2canvas
            const canvas = await html2canvas(pdfElement, { 
                scale: 1.5, // Réduire l'échelle pour éviter les canvas trop grands
                useCORS: true, // Permettre le chargement d'images cross-origin
                allowTaint: false,
                logging: false,
                backgroundColor: '#ffffff',
                imageTimeout: 15000, // Timeout pour le chargement des images
                removeContainer: true,
                windowWidth: pdfElement.scrollWidth,
                windowHeight: pdfElement.scrollHeight
            });
            
            // Vérifier la taille du canvas
            const maxCanvasSize = 32767; // Limite maximale pour la plupart des navigateurs
            if (canvas.width > maxCanvasSize || canvas.height > maxCanvasSize) {
                throw new Error('Le contenu est trop grand pour être exporté en PDF. Veuillez réduire la plage de dates.');
            }

            // Convertir en image avec compression
            const imgData = canvas.toDataURL('image/jpeg', 0.85); // Utiliser JPEG avec compression
            
            // Vérifier que l'image n'est pas vide ou corrompue
            if (!imgData || imgData.length < 100) {
                throw new Error('Erreur lors de la génération de l\'image. Veuillez réessayer.');
            }
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasAspectRatio = canvas.height / canvas.width;
            const pdfAspectRatio = pdfHeight / pdfWidth;
            
            let imgWidth = pdfWidth;
            let imgHeight = pdfWidth * canvasAspectRatio;
            
            // Si l'image est plus haute qu'une page, diviser en plusieurs pages
            if (imgHeight > pdfHeight) {
                let position = 0;
                const pageCanvas = document.createElement('canvas');
                const pageContext = pageCanvas.getContext('2d');
                
                if (!pageContext) {
                    throw new Error('Impossible de créer le contexte canvas');
                }
                
                pageCanvas.width = canvas.width;
                const pageHeight = (pdfHeight * canvas.width) / pdfWidth;
                pageCanvas.height = pageHeight;
                
                while (position < canvas.height) {
                    pageContext.fillStyle = '#ffffff';
                    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                    pageContext.drawImage(canvas, 0, position, canvas.width, pageHeight, 0, 0, canvas.width, pageHeight);
                    
                    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85);
                    
                    if (position > 0) {
                        pdf.addPage();
                    }
                    
                    pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                    position += pageHeight;
                }
            } else {
                // L'image tient sur une seule page
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
            }
            
            pdf.save("Rapport_Littoral.pdf");
            showToast("PDF généré avec succès!", 'success');
        } catch (error) {
            console.error("PDF generation error:", error);
            const errorMessage = error instanceof Error ? error.message : "Erreur lors de la génération du PDF.";
            showToast(errorMessage, 'error');
        } finally {
            // Restaurer l'état original du composant
            if (pdfRef.current) {
                pdfRef.current.style.position = originalPosition;
                pdfRef.current.style.left = originalLeft;
                pdfRef.current.style.top = originalTop;
                pdfRef.current.style.visibility = originalVisibility;
            }
            setIsGeneratingPDF(false);
        }
    };
    
    const handleFeatureTestimony = async (reportId: string) => {
        if (featuredTestimonyId === reportId) {
            try {
                await api.unfeatureTestimony();
                setFeaturedTestimonyId(null);
                showToast("Témoignage retiré de la page d'accueil.", 'success');
            } catch (e) { showToast("Erreur.", 'error'); }
        } else {
            try {
                await api.setFeaturedTestimony(reportId);
                setFeaturedTestimonyId(reportId);
                showToast("Témoignage mis en avant sur la page d'accueil.", 'success');
            } catch (e) { showToast("Erreur.", 'error'); }
        }
    };

    const dashboardTitle = "Tableau de bord - Littoral";

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{dashboardTitle}</h2>
                    <button onClick={() => navigate('/admin')} className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-semibold py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                        <ChevronLeftIcon className="h-5 w-5" />
                        <span>Changer de vue</span>
                    </button>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange(d => ({...d, start: e.target.value}))} className="p-2 border rounded-md" />
                    <input type="date" value={dateRange.end} onChange={e => setDateRange(d => ({...d, end: e.target.value}))} className="p-2 border rounded-md" />
                    <button onClick={handleExportXLSX} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Exporter (XLSX)</button>
                    <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300">
                        {isGeneratingPDF ? <SpinnerIcon /> : 'Exporter (PDF)'}
                    </button>
                </div>
            </div>
            {loading ? <div className="flex justify-center items-center p-20"><SpinnerIcon className="h-16 w-16 text-blue-700"/></div> : 
             reportsToAnalyze.length === 0 ? <EmptyState onReset={() => setDateRange(getInitialDateRange())} /> : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <StatCard title="Rapports Soumis" value={stats.totalReports} icon={<ChartBarIcon className="h-8 w-8 text-blue-600"/>} />
                         <StatCard title="Membres sur Liste" value={stats.totalMembers} icon={<UsersIcon className="h-8 w-8 text-blue-600"/>} />
                         <StatCard title="Nouveaux Invités" value={stats.newMembers} icon={<UsersIcon className="h-8 w-8 text-blue-600"/>} />
                         <StatCard title="Visites Effectuées" value={stats.totalVisits} icon={<CheckCircleIcon className="h-8 w-8 text-blue-600"/>} />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                             <h3 className="font-semibold text-gray-700 mb-4">Évolution Hebdomadaire (Présence)</h3>
                             <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" fontSize={12} />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Présence totale" stroke="#3B82F6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Nouveaux Invités" stroke="#82ca9d" />
                                </LineChart>
                             </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-semibold text-gray-700 mb-4">Évolution de la Participation (Activités)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={weeklyParticipationData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" fontSize={12} />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar name="Étude Biblique" dataKey="Étude Biblique" fill="#3B82F6" />
                                    <Bar name="Heure de Réveil" dataKey="Heure de Réveil" fill="#8B5CF6" />
                                    <Bar name="Culte Dominical" dataKey="Culte Dominical" fill="#22C55E" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-semibold text-gray-700 mb-4">Taux de Participation aux Programmes</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie 
                                        data={participationRateData} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={100} 
                                        label={({ name, value, count }) => `${name}: ${value}% (${count})`}
                                    >
                                         {participationRateData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string, props: any) => [`${value}% (${props.payload.count} personnes)`, name]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-semibold text-gray-700 mb-4">Répartition par Catégorie de Cellule</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={demographicsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <SummaryTable title="Synthèse par Groupe" data={summaryByGroup} headers={[
                        { key: 'name', label: 'Groupe' },
                        { key: 'reportsCount', label: 'Rapports' },
                        { key: 'totalPresent', label: 'Présence' },
                        { key: 'trend', label: 'Tendance (4 sem.)', render: (row) => <TrendBadge trend={row.trend} /> }
                    ]} onRowClick={(row) => setDrilldownItem({ name: row.name, type: 'group' })} />

                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-semibold text-gray-700 mb-4">Témoignages Poignants Récents</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {poignantTestimonies.length > 0 ? (
                                poignantTestimonies.map(testimony => (
                                    <div key={testimony.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg flex justify-between items-start">
                                        <div>
                                            <p className="text-sm italic text-gray-800">"{testimony.poignantTestimony}"</p>
                                            <p className="text-right text-xs font-semibold text-gray-600 mt-2">- {testimony.cellName} ({testimony.region})</p>
                                        </div>
                                        {user.role === UserRole.NATIONAL_COORDINATOR && (
                                            <button 
                                                onClick={() => handleFeatureTestimony(testimony.id)}
                                                className="ml-4 p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-100 rounded-full flex-shrink-0"
                                                title={featuredTestimonyId === testimony.id ? "Retirer de la page d'accueil" : "Mettre en avant"}
                                            >
                                                <StarIcon solid={featuredTestimonyId === testimony.id} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Aucun témoignage poignant soumis pour cette période.</p>
                            )}
                        </div>
                    </div>
                    
                    <SummaryTable title="Analyse des Cellules" data={summaryByCell} headers={[
                        { key: 'name', label: 'Cellule' },
                        { key: 'hierarchy', label: 'Hiérarchie' },
                        { key: 'trend', label: 'Tendance (4 sem.)', render: (row) => <TrendBadge trend={row.trend} /> }
                    ]} />

                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-semibold text-gray-700 mb-4">Derniers rapports soumis</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                {paginatedReports.map(report => (
                                    <tr key={report.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{new Date(report.cellDate).toLocaleDateString('fr-FR')}</td>
                                        <td className="p-3 font-semibold">{report.cellName}</td>
                                        <td className="p-3">{report.group} &gt; {report.district}</td>
                                        <td className="p-3 text-center">{report.totalPresent}</td>
                                        <td className="p-3">
                                            <button onClick={() => setSelectedReport(report)} className="text-blue-600 hover:underline font-medium">Voir détails</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={currentPage} totalItems={reportsToAnalyze.length} onPageChange={setCurrentPage} />
                    </div>
                </div>
            )}
            <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} onDeleteRequest={handleDeleteRequest} />
            <ConfirmationModal isOpen={!!reportToDelete} onClose={() => setReportToDelete(null)} onConfirm={handleConfirmDelete} title="Supprimer le Rapport" message={`Êtes-vous sûr de vouloir supprimer le rapport de ${reportToDelete?.cellName} du ${reportToDelete?.cellDate}?`} isConfirming={isDeleting} />
            <DrilldownDetailModal item={drilldownItem} onClose={() => setDrilldownItem(null)} allReports={allReports} allCells={cells} />
            <div style={{ position: 'fixed', left: '-9999px', top: '0', visibility: 'hidden' }}>
                 <ReportPDF ref={pdfRef} user={user} stats={stats} dateRange={dateRange} summaryData={summaryByGroup} demographicsData={demographicsData} title="Rapport d'Activité - Littoral" testimonies={reportsToAnalyze.filter(r => r.poignantTestimony)} newMembers={reportsToAnalyze.flatMap(r => r.invitedPeople.map(p => ({...p, cellName: r.cellName, group: r.group, district: r.district})))} />
            </div>
        </div>
    );
};

// --- REGIONS (OTHERS) DASHBOARD COMPONENT ---
const RegionsDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [cells, setCells] = useState<CellType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState(getInitialDateRange);
    const [regionFilter, setRegionFilter] = useState('all');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [drilldownItem, setDrilldownItem] = useState<{ name: string; type: 'group' | 'region' } | null>(null);
    const [featuredTestimonyId, setFeaturedTestimonyId] = useState<string | null>(null);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const isCoordinator = user.role === UserRole.NATIONAL_COORDINATOR;
    
    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);
            const [fetchedReports, fetchedCells, featuredTestimony] = await Promise.all([
                api.getReports(user, dateRange),
                api.getCellsForUser(user),
                api.getFeaturedTestimony()
            ]);
            console.log('📊 Dashboard - Rapports récupérés:', fetchedReports.length, fetchedReports);
            console.log('📊 Dashboard - Cellules récupérées:', fetchedCells.length, fetchedCells);
            setAllReports(fetchedReports);
            setCells(fetchedCells);
            if (featuredTestimony) {
                setFeaturedTestimonyId(featuredTestimony.id);
            }
            setCurrentPage(1);
        } catch (err: any) {
            setError(`Erreur lors de la récupération des rapports: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchReports();
    }, [user, dateRange]);
    
    const reportsToAnalyze = useMemo(() => {
        let reports = allReports.filter(r => r.region !== 'Littoral');
        if (isCoordinator && regionFilter !== 'all') {
            reports = reports.filter(r => r.region === regionFilter);
        }
        return reports;
    }, [allReports, isCoordinator, regionFilter]);
    
    const cellsToAnalyze = useMemo(() => {
        let currentCells = cells.filter(c => c.region !== 'Littoral');
        if (isCoordinator && regionFilter !== 'all') {
            currentCells = currentCells.filter(c => c.region === regionFilter);
        }
        return currentCells;
    }, [cells, isCoordinator, regionFilter]);
    
    const { groupByKey, summaryTitle, summaryHeaderLabel } = useMemo(() => {
        const isAllRegionsView = isCoordinator && regionFilter === 'all';
        return {
            groupByKey: isAllRegionsView ? 'region' as const : 'group' as const,
            summaryTitle: isAllRegionsView ? 'Synthèse par Région' : 'Synthèse par District',
            summaryHeaderLabel: isAllRegionsView ? 'Région' : 'District',
        };
    }, [isCoordinator, regionFilter]);

    const stats = useMemo(() => {
        if (reportsToAnalyze.length === 0) return { totalReports: 0, totalMembers: 0, newMembers: 0, totalVisits: 0 };
        const totalReports = reportsToAnalyze.length;
        const newMembers = reportsToAnalyze.reduce((acc, r) => acc + r.invitedPeople.length, 0);
        const totalVisits = reportsToAnalyze.reduce((acc, r) => acc + r.visitsMade.length, 0);
        
        const latestReportsByCell = new Map<string, Report>();
        reportsToAnalyze.forEach(r => {
            const key = `${r.region}-${r.group}-${r.district}-${r.cellName}`;
            if (!latestReportsByCell.has(key) || new Date(r.cellDate) > new Date(latestReportsByCell.get(key)!.cellDate)) {
                latestReportsByCell.set(key, r);
            }
        });
        const totalMembers = Array.from(latestReportsByCell.values()).reduce((acc, r) => acc + r.initialMembersCount, 0);

        return { totalReports, totalMembers, newMembers, totalVisits };
    }, [reportsToAnalyze]);

    const weeklyData = useMemo(() => {
        const weeks: { [key: string]: { 'Présence totale': number, 'Nouveaux Invités': number } } = {};
        reportsToAnalyze.forEach(report => {
            const reportDate = new Date(report.cellDate);
            const weekStart = new Date(reportDate.setDate(reportDate.getDate() - reportDate.getDay()));
            const weekKey = weekStart.toLocaleDateString('fr-FR');
            if (!weeks[weekKey]) {
                weeks[weekKey] = { 'Présence totale': 0, 'Nouveaux Invités': 0 };
            }
            weeks[weekKey]['Présence totale'] += report.totalPresent;
            weeks[weekKey]['Nouveaux Invités'] += report.invitedPeople.length;
        });
        return Object.entries(weeks).map(([week, data]) => ({ week, ...data })).sort((a,b) => new Date(a.week.split('/').reverse().join('-')).getTime() - new Date(b.week.split('/').reverse().join('-')).getTime());
    }, [reportsToAnalyze]);
    
    const weeklyParticipationData = useMemo(() => {
        const weeks: { [key: string]: { 'Étude Biblique': number, 'Heure de Réveil': number, 'Culte Dominical': number } } = {};
        reportsToAnalyze.forEach(report => {
            const reportDate = new Date(report.cellDate);
            const weekStart = new Date(reportDate.setDate(reportDate.getDate() - reportDate.getDay()));
            const weekKey = weekStart.toLocaleDateString('fr-FR');
            if (!weeks[weekKey]) {
                weeks[weekKey] = { 'Étude Biblique': 0, 'Heure de Réveil': 0, 'Culte Dominical': 0 };
            }
            weeks[weekKey]['Étude Biblique'] += report.bibleStudy;
            weeks[weekKey]['Heure de Réveil'] += report.miracleHour;
            weeks[weekKey]['Culte Dominical'] += report.sundayServiceAttendance;
        });
        return Object.entries(weeks)
            .map(([week, data]) => ({ week, ...data }))
            .sort((a,b) => new Date(a.week.split('/').reverse().join('-')).getTime() - new Date(b.week.split('/').reverse().join('-')).getTime());
    }, [reportsToAnalyze]);

    const poignantTestimonies = useMemo(() => {
        return reportsToAnalyze
            .filter(r => r.poignantTestimony && r.poignantTestimony.trim().length > 10)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }, [reportsToAnalyze]);

    const demographicsData = useMemo(() => {
        // Répartition par catégorie de cellule avec regroupement (nombre total de membres inscrits)
        const categoryCount: { [key: string]: number } = {
            'Hommes': 0,
            'Femmes': 0,
            'Enfants': 0,
            'Mixte': 0
        };

        reportsToAnalyze.forEach(report => {
            const category = report.cellCategory;
            const membersCount = report.initialMembersCount || 0; // Nombre de membres inscrits
            
            // Regrouper "Hommes" et "Jeunes Hommes" → "Hommes"
            if (category === 'Hommes' || category === 'Jeunes Hommes') {
                categoryCount['Hommes'] += membersCount;
            }
            // Regrouper "Femmes" et "Jeunes Femmes" → "Femmes"
            else if (category === 'Femmes' || category === 'Jeunes Femmes') {
                categoryCount['Femmes'] += membersCount;
            }
            // Enfants (pas de regroupement)
            else if (category === 'Enfants') {
                categoryCount['Enfants'] += membersCount;
            }
            // Mixte (pas de regroupement)
            else if (category === 'Mixte') {
                categoryCount['Mixte'] += membersCount;
            }
        });

        return [
            { name: 'Hommes', value: categoryCount['Hommes'] },
            { name: 'Femmes', value: categoryCount['Femmes'] },
            { name: 'Enfants', value: categoryCount['Enfants'] },
            { name: 'Mixte', value: categoryCount['Mixte'] }
        ].filter(d => d.value > 0); // Ne montrer que les catégories avec des membres
    }, [reportsToAnalyze]);
    
    const participationRateData = useMemo(() => {
        // Calculer le taux de participation aux programmes
        const totalMembers = reportsToAnalyze.reduce((sum, r) => sum + (r.initialMembersCount || 0), 0);
        const totalBibleStudy = reportsToAnalyze.reduce((sum, r) => sum + (r.bibleStudy || 0), 0);
        const totalMiracleHour = reportsToAnalyze.reduce((sum, r) => sum + (r.miracleHour || 0), 0);
        const totalSundayService = reportsToAnalyze.reduce((sum, r) => sum + (r.sundayServiceAttendance || 0), 0);

        if (totalMembers === 0) return [];

        const bibleStudyPercent = Math.round((totalBibleStudy / totalMembers) * 100);
        const miracleHourPercent = Math.round((totalMiracleHour / totalMembers) * 100);
        const sundayServicePercent = Math.round((totalSundayService / totalMembers) * 100);
        const missingPercent = Math.max(0, 100 - Math.max(bibleStudyPercent, miracleHourPercent, sundayServicePercent));

        return [
            { name: 'Étude Biblique', value: bibleStudyPercent, count: totalBibleStudy, color: '#3B82F6' },
            { name: 'Heure de Réveil', value: miracleHourPercent, count: totalMiracleHour, color: '#8B5CF6' },
            { name: 'Culte Dominical', value: sundayServicePercent, count: totalSundayService, color: '#22C55E' },
            { name: 'Absents', value: missingPercent, count: totalMembers - Math.max(totalBibleStudy, totalMiracleHour, totalSundayService), color: '#EF4444' }
        ].filter(d => d.value > 0);
    }, [reportsToAnalyze]);
    
    const trendsData = useMemo(() => calculateTrend(reportsToAnalyze, 4, groupByKey, cells), [reportsToAnalyze, groupByKey, cells]);
    
    const summaryData = useMemo(() => {
        const groups: { [key: string]: { reportsCount: number, totalPresent: number, bibleStudy: number, miracleHour: number, sundayService: number } } = {};
        reportsToAnalyze.forEach(r => {
            const key = r[groupByKey] as string;
            if (!groups[key]) {
                groups[key] = { reportsCount: 0, totalPresent: 0, bibleStudy: 0, miracleHour: 0, sundayService: 0 };
            }
            groups[key].reportsCount++;
            groups[key].totalPresent += r.totalPresent;
            groups[key].bibleStudy += r.bibleStudy;
            groups[key].miracleHour += r.miracleHour;
            groups[key].sundayService += r.sundayServiceAttendance;
        });
        return Object.entries(groups).map(([name, data]) => ({ name, ...data, trend: trendsData[name] || null })).sort((a,b) => b.totalPresent - a.totalPresent);
    }, [reportsToAnalyze, groupByKey, trendsData]);
    
    const trendsByCell = useMemo(() => calculateTrend(reportsToAnalyze, 4, 'cellId', cells), [reportsToAnalyze, cells]);

    const summaryByCell = useMemo(() => {
        return cellsToAnalyze.map(cell => {
            return {
                name: cell.cellName,
                hierarchy: `${cell.group} > ${cell.district}`,
                trend: trendsByCell[cell.id] || null
            }
        }).sort((a, b) => (b.trend?.change ?? -Infinity) - (a.trend?.change ?? -Infinity));
    }, [cellsToAnalyze, trendsByCell]);

    const paginatedReports = useMemo(() => {
        return reportsToAnalyze.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [reportsToAnalyze, currentPage]);

    const getDashboardTitle = () => {
        if (isCoordinator) {
            return regionFilter === 'all' ? "Tableau de bord - Autres Régions" : `Tableau de bord - Région ${regionFilter}`;
        }
        if (user.role === UserRole.REGIONAL_PASTOR) return `Tableau de bord - Région ${user.region}`;
        if (user.role === UserRole.GROUP_PASTOR) return `Tableau de bord - ${user.group}`;
        if (user.role === UserRole.DISTRICT_PASTOR) return `Tableau de bord - ${user.district}`;
        return "Tableau de bord";
    };
    
    const handleDeleteRequest = (report: Report) => setReportToDelete(report);
    
    const handleConfirmDelete = async () => {
        if (!reportToDelete) return;
        setIsDeleting(true);
        try {
            await api.deleteReport(reportToDelete.id);
            showToast('Rapport supprimé avec succès.', 'success');
            await fetchReports();
        } catch (err: any) {
            showToast(`Erreur : ${err.message}`, 'error');
        } finally {
            setIsDeleting(false);
            setReportToDelete(null);
        }
    };
    
     const handleExportXLSX = () => {
        const dataToExport = reportsToAnalyze.map(r => ({
            "Date": r.cellDate, "Région": r.region, "District": r.group, "Localité": r.district,
            "Cellule": r.cellName, "Responsable": r.leaderName, "Total Présents": r.totalPresent,
            "Invités": r.invitedPeople.length, "Visites": r.visitsMade.length,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rapports_Regions");
        XLSX.writeFile(workbook, "Rapports_Regions.xlsx");
    };

    const handleGeneratePDF = async () => {
        if (!pdfRef.current || reportsToAnalyze.length === 0) return;
        setIsGeneratingPDF(true);
        
        // Rendre le composant visible temporairement pour la capture
        const pdfElement = pdfRef.current;
        const originalPosition = pdfElement.style.position;
        const originalLeft = pdfElement.style.left;
        const originalTop = pdfElement.style.top;
        const originalVisibility = pdfElement.style.visibility;
        
        pdfElement.style.position = 'absolute';
        pdfElement.style.left = '0';
        pdfElement.style.top = '0';
        pdfElement.style.visibility = 'visible';
        
        try {
            const testimoniesList = reportsToAnalyze.filter(r => r.poignantTestimony && r.poignantTestimony.trim().length > 10).slice(0, 5);
            const newMembersList = reportsToAnalyze.flatMap(r => 
                r.invitedPeople.map(p => ({
                    ...p, cellName: r.cellName, group: r.group, district: r.district
                }))
            );

            // Attendre un court instant pour s'assurer que le rendu est complet
            await new Promise(resolve => setTimeout(resolve, 100));

            // Options améliorées pour html2canvas
            const canvas = await html2canvas(pdfElement, { 
                scale: 1.5, // Réduire l'échelle pour éviter les canvas trop grands
                useCORS: true, // Permettre le chargement d'images cross-origin
                allowTaint: false,
                logging: false,
                backgroundColor: '#ffffff',
                imageTimeout: 15000, // Timeout pour le chargement des images
                removeContainer: true,
                windowWidth: pdfElement.scrollWidth,
                windowHeight: pdfElement.scrollHeight
            });
            
            // Vérifier la taille du canvas
            const maxCanvasSize = 32767; // Limite maximale pour la plupart des navigateurs
            if (canvas.width > maxCanvasSize || canvas.height > maxCanvasSize) {
                throw new Error('Le contenu est trop grand pour être exporté en PDF. Veuillez réduire la plage de dates.');
            }

            // Convertir en image avec compression
            const imgData = canvas.toDataURL('image/jpeg', 0.85); // Utiliser JPEG avec compression
            
            // Vérifier que l'image n'est pas vide ou corrompue
            if (!imgData || imgData.length < 100) {
                throw new Error('Erreur lors de la génération de l\'image. Veuillez réessayer.');
            }
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasAspectRatio = canvas.height / canvas.width;
            const pdfAspectRatio = pdfHeight / pdfWidth;
            
            let imgWidth = pdfWidth;
            let imgHeight = pdfWidth * canvasAspectRatio;
            
            // Si l'image est plus haute qu'une page, diviser en plusieurs pages
            if (imgHeight > pdfHeight) {
                let position = 0;
                const pageCanvas = document.createElement('canvas');
                const pageContext = pageCanvas.getContext('2d');
                
                if (!pageContext) {
                    throw new Error('Impossible de créer le contexte canvas');
                }
                
                pageCanvas.width = canvas.width;
                const pageHeight = (pdfHeight * canvas.width) / pdfWidth;
                pageCanvas.height = pageHeight;
                
                while (position < canvas.height) {
                    pageContext.fillStyle = '#ffffff';
                    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                    pageContext.drawImage(canvas, 0, position, canvas.width, pageHeight, 0, 0, canvas.width, pageHeight);
                    
                    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85);
                    
                    if (position > 0) {
                        pdf.addPage();
                    }
                    
                    pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                    position += pageHeight;
                }
            } else {
                // L'image tient sur une seule page
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
            }
            
            pdf.save("Rapport_Regions.pdf");
            showToast("PDF généré avec succès!", 'success');
        } catch (error) {
            console.error("PDF generation error:", error);
            const errorMessage = error instanceof Error ? error.message : "Erreur lors de la génération du PDF.";
            showToast(errorMessage, 'error');
        } finally {
            // Restaurer l'état original du composant
            if (pdfRef.current) {
                pdfRef.current.style.position = originalPosition;
                pdfRef.current.style.left = originalLeft;
                pdfRef.current.style.top = originalTop;
                pdfRef.current.style.visibility = originalVisibility;
            }
            setIsGeneratingPDF(false);
        }
    };
    
    const handleFeatureTestimony = async (reportId: string) => {
        if (featuredTestimonyId === reportId) {
            try {
                await api.unfeatureTestimony();
                setFeaturedTestimonyId(null);
                showToast("Témoignage retiré de la page d'accueil.", 'success');
            } catch (e) { showToast("Erreur.", 'error'); }
        } else {
            try {
                await api.setFeaturedTestimony(reportId);
                setFeaturedTestimonyId(reportId);
                showToast("Témoignage mis en avant sur la page d'accueil.", 'success');
            } catch (e) { showToast("Erreur.", 'error'); }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{getDashboardTitle()}</h2>
                     {isCoordinator && (
                         <button onClick={() => navigate('/admin')} className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-semibold py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                            <ChevronLeftIcon className="h-5 w-5" />
                            <span>Changer de vue</span>
                        </button>
                    )}
                </div>
                 <div className="flex flex-col md:flex-row gap-4">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange(d => ({...d, start: e.target.value}))} className="p-2 border rounded-md" />
                    <input type="date" value={dateRange.end} onChange={e => setDateRange(d => ({...d, end: e.target.value}))} className="p-2 border rounded-md" />
                     {isCoordinator && (
                         <select id="region" name="region" value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="p-2 border rounded-md">
                            <option value="all">Toutes les régions (hors Littoral)</option>
                            {REGIONS.filter(r => r !== 'Littoral').map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    )}
                    <button onClick={handleExportXLSX} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Exporter (XLSX)</button>
                    <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300">
                        {isGeneratingPDF ? <SpinnerIcon /> : 'Exporter (PDF)'}
                    </button>
                </div>
            </div>
            {loading ? <div className="flex justify-center items-center p-20"><SpinnerIcon className="h-16 w-16 text-blue-700"/></div> :
            reportsToAnalyze.length === 0 ? <EmptyState onReset={() => { setDateRange(getInitialDateRange()); setRegionFilter('all'); }} /> : (
                 <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <StatCard title="Rapports Soumis" value={stats.totalReports} icon={<ChartBarIcon className="h-8 w-8 text-blue-600"/>} />
                         <StatCard title="Membres sur Liste" value={stats.totalMembers} icon={<UsersIcon className="h-8 w-8 text-blue-600"/>} />
                         <StatCard title="Nouveaux Invités" value={stats.newMembers} icon={<UsersIcon className="h-8 w-8 text-blue-600"/>} />
                         <StatCard title="Visites Effectuées" value={stats.totalVisits} icon={<CheckCircleIcon className="h-8 w-8 text-blue-600"/>} />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                             <h3 className="font-semibold text-gray-700 mb-4">Évolution Hebdomadaire (Présence)</h3>
                             <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" fontSize={12} />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Présence totale" stroke="#3B82F6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Nouveaux Invités" stroke="#82ca9d" />
                                </LineChart>
                             </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-semibold text-gray-700 mb-4">Évolution de la Participation (Activités)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={weeklyParticipationData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" fontSize={12} />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar name="Étude Biblique" dataKey="Étude Biblique" fill="#3B82F6" />
                                    <Bar name="Heure de Réveil" dataKey="Heure de Réveil" fill="#8B5CF6" />
                                    <Bar name="Culte Dominical" dataKey="Culte Dominical" fill="#22C55E" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-semibold text-gray-700 mb-4">Taux de Participation aux Programmes</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie 
                                        data={participationRateData} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={100} 
                                        label={({ name, value, count }) => `${name}: ${value}% (${count})`}
                                    >
                                         {participationRateData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string, props: any) => [`${value}% (${props.payload.count} personnes)`, name]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-semibold text-gray-700 mb-4">Répartition par Catégorie de Cellule</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={demographicsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     <SummaryTable title={summaryTitle} data={summaryData} headers={[
                        { key: 'name', label: summaryHeaderLabel },
                        { key: 'reportsCount', label: 'Rapports' },
                        { key: 'totalPresent', label: 'Présence' },
                        { key: 'trend', label: 'Tendance (4 sem.)', render: (row) => <TrendBadge trend={row.trend} /> }
                    ]} onRowClick={groupByKey === 'region' ? (row) => setDrilldownItem({ name: row.name, type: 'region' }) : undefined} />
                    
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-semibold text-gray-700 mb-4">Témoignages Poignants Récents</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {poignantTestimonies.length > 0 ? (
                                poignantTestimonies.map(testimony => (
                                    <div key={testimony.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg flex justify-between items-start">
                                        <div>
                                            <p className="text-sm italic text-gray-800">"{testimony.poignantTestimony}"</p>
                                            <p className="text-right text-xs font-semibold text-gray-600 mt-2">- {testimony.cellName} ({testimony.region})</p>
                                        </div>
                                        {user.role === UserRole.NATIONAL_COORDINATOR && (
                                            <button 
                                                onClick={() => handleFeatureTestimony(testimony.id)}
                                                className="ml-4 p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-100 rounded-full flex-shrink-0"
                                                title={featuredTestimonyId === testimony.id ? "Retirer de la page d'accueil" : "Mettre en avant"}
                                            >
                                                <StarIcon solid={featuredTestimonyId === testimony.id} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Aucun témoignage poignant soumis pour cette période.</p>
                            )}
                        </div>
                    </div>

                     <SummaryTable title="Analyse des Cellules" data={summaryByCell} headers={[
                        { key: 'name', label: 'Cellule' },
                        { key: 'hierarchy', label: 'Hiérarchie' },
                        { key: 'trend', label: 'Tendance (4 sem.)', render: (row) => <TrendBadge trend={row.trend} /> }
                    ]} />
                    
                     <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-semibold text-gray-700 mb-4">Derniers rapports soumis</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                {paginatedReports.map(report => (
                                    <tr key={report.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{new Date(report.cellDate).toLocaleDateString('fr-FR')}</td>
                                        <td className="p-3 font-semibold">{report.cellName}</td>
                                        <td className="p-3 text-xs">{report.region} &gt; {report.group} &gt; {report.district}</td>
                                        <td className="p-3 text-center">{report.totalPresent}</td>
                                        <td className="p-3">
                                            <button onClick={() => setSelectedReport(report)} className="text-blue-600 hover:underline font-medium">Voir détails</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={currentPage} totalItems={reportsToAnalyze.length} onPageChange={setCurrentPage} />
                    </div>
                </div>
            )}
             <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} onDeleteRequest={handleDeleteRequest} />
            <ConfirmationModal isOpen={!!reportToDelete} onClose={() => setReportToDelete(null)} onConfirm={handleConfirmDelete} title="Supprimer le Rapport" message={`Êtes-vous sûr de vouloir supprimer le rapport de ${reportToDelete?.cellName} du ${reportToDelete?.cellDate}?`} isConfirming={isDeleting} />
             <DrilldownDetailModal item={drilldownItem} onClose={() => setDrilldownItem(null)} allReports={allReports} allCells={cells} />
             <div style={{ position: 'fixed', left: '-9999px', top: '0', visibility: 'hidden' }}>
                 <ReportPDF ref={pdfRef} user={user} stats={stats} dateRange={dateRange} summaryData={summaryData} demographicsData={demographicsData} title={getDashboardTitle()} testimonies={reportsToAnalyze.filter(r => r.poignantTestimony)} newMembers={reportsToAnalyze.flatMap(r => r.invitedPeople.map(p => ({...p, cellName: r.cellName, group: r.group, district: r.district})))} />
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD ROUTER COMPONENT ---
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const viewFilter = queryParams.get('view');

  if (!user) return null;

  // National Coordinator sees a selection, then a specific dashboard
  if (user.role === UserRole.NATIONAL_COORDINATOR) {
    if (viewFilter === 'littoral') {
      return <LittoralDashboard user={user} />;
    }
    if (viewFilter === 'regions') {
      return <RegionsDashboard user={user} />;
    }
    // No view selected, show the selection screen
    return <DashboardSelection />;
  }

  // All other roles see the appropriate dashboard based on their region
  // If user is in Littoral region, show LittoralDashboard, otherwise show RegionsDashboard
  if (user.region === 'Littoral') {
    return <LittoralDashboard user={user} />;
  }
  
  return <RegionsDashboard user={user} />;
};

export default Dashboard;