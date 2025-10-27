import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { api } from '../services/api.real.ts';
import { User, UserRole, Cell } from '../types.ts';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, TrashIcon, UsersIcon, ChartBarIcon } from './icons.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'cells' | 'stats'>('pending');
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allCells, setAllCells] = useState<Cell[]>([]);
    const [loading, setLoading] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'delete-user' | 'delete-cell'>('approve');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
    const [regionFilter, setRegionFilter] = useState<string>('all');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'pending') {
                const pending = await api.getPendingUsers();
                setPendingUsers(pending);
            } else if (activeTab === 'users') {
                const users = await api.getAllUsers();
                setAllUsers(users);
            } else if (activeTab === 'cells') {
                const cells = await api.getCellsForUser(user!);
                setAllCells(cells);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            showToast('Erreur lors du chargement des données', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = (user: User) => {
        setSelectedItem(user);
        setActionType('approve');
        setIsConfirmOpen(true);
    };

    const handleDeleteUserRequest = (user: User) => {
        setSelectedItem(user);
        setActionType('delete-user');
        setIsConfirmOpen(true);
    };

    const handleDeleteCellRequest = (cell: Cell) => {
        setSelectedItem(cell);
        setActionType('delete-cell');
        setIsConfirmOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedItem) return;
        setIsProcessing(true);
        try {
            if (actionType === 'approve') {
                await api.approveUser(selectedItem.uid);
                showToast('Utilisateur approuvé avec succès', 'success');
            } else if (actionType === 'delete-user') {
                await api.deleteUser(selectedItem.uid);
                showToast('Utilisateur supprimé avec succès', 'success');
            } else if (actionType === 'delete-cell') {
                await api.deleteCell(selectedItem.id || selectedItem._id);
                showToast('Cellule supprimée avec succès', 'success');
            }
            await fetchData();
        } catch (error: any) {
            showToast(`Erreur: ${error.message}`, 'error');
        } finally {
            setIsProcessing(false);
            setIsConfirmOpen(false);
            setSelectedItem(null);
        }
    };

    const getRoleLabel = (role: UserRole): string => {
        const labels: Record<UserRole, string> = {
            [UserRole.NATIONAL_COORDINATOR]: 'Coordinateur National',
            [UserRole.REGIONAL_PASTOR]: 'Pasteur Régional',
            [UserRole.GROUP_PASTOR]: 'Pasteur de Groupe',
            [UserRole.DISTRICT_PASTOR]: 'Pasteur de District',
            [UserRole.CELL_LEADER]: 'Responsable de Cellule',
        };
        return labels[role] || role;
    };

    const getStats = () => {
        const stats = {
            totalUsers: allUsers.length,
            pendingUsers: pendingUsers.length,
            totalCells: allCells.length,
            byRole: {
                [UserRole.NATIONAL_COORDINATOR]: 0,
                [UserRole.REGIONAL_PASTOR]: 0,
                [UserRole.GROUP_PASTOR]: 0,
                [UserRole.DISTRICT_PASTOR]: 0,
                [UserRole.CELL_LEADER]: 0,
            },
            cellsByStatus: {
                'Active': 0,
                'En implantation': 0,
                'En multiplication': 0,
                'En pause': 0,
            }
        };

        allUsers.forEach(u => {
            if (u.role in stats.byRole) {
                stats.byRole[u.role]++;
            }
        });

        allCells.forEach(c => {
            if (c.status in stats.cellsByStatus) {
                stats.cellsByStatus[c.status]++;
            }
        });

        return stats;
    };

    const stats = getStats();

    // Filtrer les utilisateurs
    const filteredUsers = allUsers.filter(u => {
        // Filtre par recherche (nom, email, contact)
        const matchesSearch = searchTerm === '' || 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.contact && u.contact.includes(searchTerm));
        
        // Filtre par rôle
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        
        // Filtre par statut
        const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
        
        // Filtre par région
        const matchesRegion = regionFilter === 'all' || u.region === regionFilter;
        
        return matchesSearch && matchesRole && matchesStatus && matchesRegion;
    });

    // Obtenir les régions uniques
    const uniqueRegions = Array.from(new Set(allUsers.map(u => u.region).filter(Boolean)));

    const TabButton: React.FC<{ tabId: typeof activeTab, label: string, icon: React.ReactNode, badge?: number }> = ({ tabId, label, icon, badge }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabId
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {icon}
            <span>{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Administration</h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                <TabButton 
                    tabId="pending" 
                    label="Approbations" 
                    icon={<CheckCircleIcon className="h-5 w-5" />}
                    badge={pendingUsers.length}
                />
                <TabButton 
                    tabId="users" 
                    label="Utilisateurs" 
                    icon={<UsersIcon className="h-5 w-5" />}
                />
                <TabButton 
                    tabId="cells" 
                    label="Cellules" 
                    icon={<UsersIcon className="h-5 w-5" />}
                />
                <TabButton 
                    tabId="stats" 
                    label="Statistiques" 
                    icon={<ChartBarIcon className="h-5 w-5" />}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <SpinnerIcon className="h-8 w-8 text-blue-600" />
                </div>
            ) : (
                <>
                    {/* Pending Users Tab */}
                    {activeTab === 'pending' && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Utilisateurs en attente d'approbation</h2>
                            {pendingUsers.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Aucun utilisateur en attente</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email/Contact</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Région</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {pendingUsers.map(u => (
                                                <tr key={u.uid}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email || u.contact}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRoleLabel(u.role)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.region}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                        <button
                                                            onClick={() => handleApproveRequest(u)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Approuver"
                                                        >
                                                            <CheckCircleIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUserRequest(u)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Rejeter"
                                                        >
                                                            <XCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Users Tab */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tous les utilisateurs</h2>
                            
                            {/* Filtres */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Recherche */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
                                    <input
                                        type="text"
                                        placeholder="Nom, email, contact..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                {/* Filtre par rôle */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">Tous les rôles</option>
                                        <option value={UserRole.NATIONAL_COORDINATOR}>Coordinateur National</option>
                                        <option value={UserRole.REGIONAL_PASTOR}>Pasteur Régional</option>
                                        <option value={UserRole.GROUP_PASTOR}>Pasteur de Groupe</option>
                                        <option value={UserRole.DISTRICT_PASTOR}>Pasteur de District</option>
                                        <option value={UserRole.CELL_LEADER}>Responsable de Cellule</option>
                                    </select>
                                </div>
                                
                                {/* Filtre par statut */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'approved' | 'pending')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">Tous les statuts</option>
                                        <option value="approved">Approuvé</option>
                                        <option value="pending">En attente</option>
                                    </select>
                                </div>
                                
                                {/* Filtre par région */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                                    <select
                                        value={regionFilter}
                                        onChange={(e) => setRegionFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">Toutes les régions</option>
                                        {uniqueRegions.map(region => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Résultats */}
                            <div className="mb-2 text-sm text-gray-600">
                                {filteredUsers.length} utilisateur(s) trouvé(s)
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email/Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Région</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groupe/District</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District/Localité</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map(u => (
                                            <tr key={u.uid}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email || u.contact}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRoleLabel(u.role)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.region || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.group || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.district || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        u.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {u.status === 'approved' ? 'Approuvé' : 'En attente'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDeleteUserRequest(u)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Supprimer"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* All Cells Tab */}
                    {activeTab === 'cells' && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Toutes les cellules</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Région</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groupe</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allCells.map(c => (
                                            <tr key={c.id || c._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.cellName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.region}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.group}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.district}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.leaderName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        c.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                        c.status === 'En implantation' ? 'bg-yellow-100 text-yellow-800' :
                                                        c.status === 'En multiplication' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDeleteCellRequest(c)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Supprimer"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Utilisateurs</h3>
                                    <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                                </div>
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">En attente</h3>
                                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingUsers}</p>
                                </div>
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Cellules</h3>
                                    <p className="text-3xl font-bold text-green-600">{stats.totalCells}</p>
                                </div>
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Cellules Actives</h3>
                                    <p className="text-3xl font-bold text-green-600">{stats.cellsByStatus['Active']}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Utilisateurs par rôle</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Coordinateurs Nationaux</span>
                                        <span className="font-bold text-blue-600">{stats.byRole[UserRole.NATIONAL_COORDINATOR]}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Pasteurs Régionaux</span>
                                        <span className="font-bold text-blue-600">{stats.byRole[UserRole.REGIONAL_PASTOR]}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Pasteurs de Groupe</span>
                                        <span className="font-bold text-blue-600">{stats.byRole[UserRole.GROUP_PASTOR]}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Pasteurs de District</span>
                                        <span className="font-bold text-blue-600">{stats.byRole[UserRole.DISTRICT_PASTOR]}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Responsables de Cellule</span>
                                        <span className="font-bold text-blue-600">{stats.byRole[UserRole.CELL_LEADER]}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Cellules par statut</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Active</span>
                                        <span className="font-bold text-green-600">{stats.cellsByStatus['Active']}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">En implantation</span>
                                        <span className="font-bold text-yellow-600">{stats.cellsByStatus['En implantation']}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">En multiplication</span>
                                        <span className="font-bold text-blue-600">{stats.cellsByStatus['En multiplication']}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">En pause</span>
                                        <span className="font-bold text-gray-600">{stats.cellsByStatus['En pause']}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmAction}
                title={
                    actionType === 'approve' ? 'Approuver l\'utilisateur' :
                    actionType === 'delete-user' ? 'Supprimer l\'utilisateur' :
                    'Supprimer la cellule'
                }
                message={
                    actionType === 'approve' ? `Êtes-vous sûr de vouloir approuver ${selectedItem?.name} ?` :
                    actionType === 'delete-user' ? `Êtes-vous sûr de vouloir supprimer ${selectedItem?.name} ? Cette action est irréversible.` :
                    `Êtes-vous sûr de vouloir supprimer la cellule ${selectedItem?.cellName} ? Cette action est irréversible.`
                }
                confirmText={actionType === 'approve' ? 'Approuver' : 'Supprimer'}
                isConfirming={isProcessing}
            />
        </div>
    );
};

export default AdminPage;
