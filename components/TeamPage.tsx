import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserRole } from '../types.ts';
import HierarchyUsersView from './HierarchyUsersView.tsx';

const TeamPage: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    // Seuls les pasteurs de groupe et de district peuvent voir cette page
    if (user.role !== UserRole.GROUP_PASTOR && user.role !== UserRole.DISTRICT_PASTOR) {
        return (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h2>
                <p className="text-gray-600">
                    Cette page est réservée aux pasteurs de groupe et de district.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Mon Équipe</h1>
                <p className="text-gray-600 mt-1">
                    Gérez et visualisez les membres de votre équipe hiérarchique.
                </p>
            </div>

            <HierarchyUsersView user={user} />
        </div>
    );
};

export default TeamPage;
