import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { api } from '../services/api.real';
import { useToast } from '../contexts/ToastContext.tsx';
import { UsersIcon, SpinnerIcon } from './icons.tsx';

interface HierarchyUsersViewProps {
    user: User;
}

const HierarchyUsersView: React.FC<HierarchyUsersViewProps> = ({ user }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const hierarchyUsers = await api.getUsersByHierarchy(user);
                setUsers(hierarchyUsers);
            } catch (error) {
                console.error('Erreur lors du chargement des utilisateurs:', error);
                showToast('Erreur lors du chargement des utilisateurs', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user, showToast]);

    const getRoleLabel = (role: UserRole): string => {
        switch (role) {
            case UserRole.NATIONAL_COORDINATOR:
                return 'Coordinateur National';
            case UserRole.REGIONAL_PASTOR:
                return 'Pasteur Régional';
            case UserRole.GROUP_PASTOR:
                return 'Pasteur de Groupe';
            case UserRole.DISTRICT_PASTOR:
                return 'Pasteur de District';
            case UserRole.CELL_LEADER:
                return 'Responsable de Cellule';
            default:
                return role;
        }
    };

    const getRoleBadgeColor = (role: UserRole): string => {
        switch (role) {
            case UserRole.NATIONAL_COORDINATOR:
                return 'bg-purple-100 text-purple-800';
            case UserRole.REGIONAL_PASTOR:
                return 'bg-blue-100 text-blue-800';
            case UserRole.GROUP_PASTOR:
                return 'bg-green-100 text-green-800';
            case UserRole.DISTRICT_PASTOR:
                return 'bg-yellow-100 text-yellow-800';
            case UserRole.CELL_LEADER:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Grouper les utilisateurs par rôle
    const groupedUsers = users.reduce((acc, user) => {
        if (!acc[user.role]) {
            acc[user.role] = [];
        }
        acc[user.role].push(user);
        return acc;
    }, {} as Record<UserRole, User[]>);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md flex justify-center items-center">
                <SpinnerIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-gray-600">Chargement des utilisateurs...</span>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Aucun utilisateur dans votre hiérarchie</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                    <UsersIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-bold text-gray-800">
                        Utilisateurs sous votre hiérarchie
                    </h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                    {user.role === UserRole.GROUP_PASTOR && 
                        'Vous voyez tous les pasteurs de district et responsables de cellule de votre groupe.'}
                    {user.role === UserRole.DISTRICT_PASTOR && 
                        'Vous voyez tous les responsables de cellule de votre district.'}
                </p>

                <div className="space-y-4">
                    {(Object.entries(groupedUsers) as [UserRole, User[]][]).map(([role, roleUsers]) => (
                        <div key={role} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm ${getRoleBadgeColor(role)}`}>
                                    {getRoleLabel(role)}
                                </span>
                                <span className="ml-2 text-gray-500 text-sm">({roleUsers.length})</span>
                            </h4>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-2 text-left">Nom</th>
                                            <th className="p-2 text-left">Contact</th>
                                            {role === UserRole.CELL_LEADER && (
                                                <>
                                                    <th className="p-2 text-left">Cellule</th>
                                                    <th className="p-2 text-left">Identifiant</th>
                                                </>
                                            )}
                                            {role !== UserRole.CELL_LEADER && (
                                                <>
                                                    <th className="p-2 text-left">Région</th>
                                                    <th className="p-2 text-left">Groupe</th>
                                                    <th className="p-2 text-left">District</th>
                                                </>
                                            )}
                                            <th className="p-2 text-left">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roleUsers.map((u) => (
                                            <tr key={u.uid} className="border-t hover:bg-gray-50">
                                                <td className="p-2 font-medium">{u.name}</td>
                                                <td className="p-2">{u.contact || 'N/A'}</td>
                                                {role === UserRole.CELL_LEADER ? (
                                                    <>
                                                        <td className="p-2">{u.cellName || 'N/A'}</td>
                                                        <td className="p-2">
                                                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                                                {u.identifier || 'N/A'}
                                                            </span>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="p-2">{u.region || 'N/A'}</td>
                                                        <td className="p-2">{u.group || 'N/A'}</td>
                                                        <td className="p-2">{u.district || 'N/A'}</td>
                                                    </>
                                                )}
                                                <td className="p-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        u.status === 'approved' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {u.status === 'approved' ? 'Approuvé' : 'En attente'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-gray-600 text-sm">Total Utilisateurs</p>
                    <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-gray-600 text-sm">Pasteurs de District</p>
                    <p className="text-2xl font-bold text-green-600">
                        {(groupedUsers[UserRole.DISTRICT_PASTOR] as User[] | undefined)?.length || 0}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-gray-600 text-sm">Responsables de Cellule</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {(groupedUsers[UserRole.CELL_LEADER] as User[] | undefined)?.length || 0}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HierarchyUsersView;
