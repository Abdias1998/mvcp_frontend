import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { XIcon } from './icons';

interface UserReassignmentModalProps {
  user: User;
  onClose: () => void;
  onReassign: (userId: string, reassignData: ReassignData) => Promise<void>;
  regions: string[];
  groups: string[];
  districts: string[];
}

export interface ReassignData {
  newRole?: UserRole;
  newRegion?: string;
  newGroup?: string;
  newDistrict?: string;
}

const UserReassignmentModal: React.FC<UserReassignmentModalProps> = ({
  user,
  onClose,
  onReassign,
  regions,
  groups,
  districts
}) => {
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>(user.role);
  const [newRegion, setNewRegion] = useState(user.region || '');
  const [newGroup, setNewGroup] = useState(user.group || '');
  const [newDistrict, setNewDistrict] = useState(user.district || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reassignData: ReassignData = {};
      
      // Ajouter uniquement les champs modifiés
      if (newRole !== user.role) reassignData.newRole = newRole;
      if (newRegion !== user.region) reassignData.newRegion = newRegion;
      if (newGroup !== user.group) reassignData.newGroup = newGroup;
      if (newDistrict !== user.district) reassignData.newDistrict = newDistrict;

      await onReassign(user.uid || user._id, reassignData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la réaffectation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Déterminer les rôles disponibles selon le rôle actuel
  const getAvailableRoles = () => {
    return [
      UserRole.REGIONAL_PASTOR,
      UserRole.GROUP_PASTOR,
      UserRole.DISTRICT_PASTOR,
      UserRole.CELL_LEADER
    ];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            🔄 Réaffecter {user.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Informations actuelles */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              📋 Affectation actuelle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Rôle :</span>{' '}
                <span className="text-gray-600">{user.role}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Région :</span>{' '}
                <span className="text-gray-600">{user.region || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Groupe :</span>{' '}
                <span className="text-gray-600">{user.group || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">District :</span>{' '}
                <span className="text-gray-600">{user.district || '-'}</span>
              </div>
            </div>
          </div>

          {/* Nouvelle affectation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ✏️ Nouvelle affectation
            </h3>

            {/* Nouveau rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau rôle
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getAvailableRoles().map((role) => (
                  <option key={role} value={role}>
                    {role === UserRole.REGIONAL_PASTOR && 'Pasteur Régional'}
                    {role === UserRole.GROUP_PASTOR && 'Pasteur de Groupe'}
                    {role === UserRole.DISTRICT_PASTOR && 'Pasteur de District'}
                    {role === UserRole.CELL_LEADER && 'Responsable de Cellule'}
                  </option>
                ))}
              </select>
            </div>

            {/* Nouvelle région */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouvelle région
              </label>
              <select
                value={newRegion}
                onChange={(e) => {
                  setNewRegion(e.target.value);
                  setNewGroup('');
                  setNewDistrict('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une région</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Nouveau groupe */}
            {(newRole === UserRole.GROUP_PASTOR || newRole === UserRole.DISTRICT_PASTOR || newRole === UserRole.CELL_LEADER) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau groupe
                </label>
                <select
                  value={newGroup}
                  onChange={(e) => {
                    setNewGroup(e.target.value);
                    setNewDistrict('');
                  }}
                  disabled={!newRegion}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Sélectionner un groupe</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nouveau district */}
            {(newRole === UserRole.DISTRICT_PASTOR || newRole === UserRole.CELL_LEADER) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau district
                </label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  disabled={!newGroup}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Sélectionner un district</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Avertissement */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Attention :</strong> Cette action mettra à jour automatiquement toutes les cellules et rapports associés à cet utilisateur.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !newRegion}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Réaffectation...' : '✅ Confirmer la réaffectation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserReassignmentModal;
