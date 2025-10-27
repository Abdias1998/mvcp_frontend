import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.real';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { CellLeaderData, Group, District } from '../types.ts';
import { REGIONS, CELL_CATEGORIES } from '../constants.ts';
import { SpinnerIcon } from './icons.tsx';

const CellLeaderForm: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<CellLeaderData>({
        name: '',
        contact: '',
        region: user?.region || '',
        group: user?.group || '',
        district: user?.district || '',
        cellName: '',
        cellCategory: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [allDistricts, setAllDistricts] = useState<District[]>([]);
    const [generatedIdentifier, setGeneratedIdentifier] = useState<string>('');

    // Charger les groupes et districts depuis l'API
    useEffect(() => {
        const fetchHierarchyData = async () => {
            try {
                const [groups, districts] = await Promise.all([
                    api.getGroups(),
                    api.getDistricts()
                ]);
                setAllGroups(groups);
                setAllDistricts(districts);
            } catch (error) {
                console.error('Erreur lors du chargement des données de hiérarchie:', error);
                showToast('Erreur lors du chargement des données.', 'error');
            }
        };
        fetchHierarchyData();
    }, [showToast]);

    // Filtrer les groupes par région
    const groupsInRegion = useMemo(() => {
        if (!formData.region) return [];
        return [...new Set(allGroups.filter(g => g.region === formData.region).map(g => g.name))].sort();
    }, [formData.region, allGroups]);

    // Filtrer les districts par région et groupe
    const districtsInGroup = useMemo(() => {
        if (!formData.region || !formData.group) return [];
        return [...new Set(allDistricts.filter(d => d.region === formData.region && d.group === formData.group).map(d => d.name))].sort();
    }, [formData.region, formData.group, allDistricts]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Réinitialiser les champs dépendants
        if (name === 'region') {
            setFormData(prev => ({ ...prev, [name]: value, group: '', district: '' }));
        } else if (name === 'group') {
            setFormData(prev => ({ ...prev, [name]: value, district: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.createCellLeader(formData);
            
            if (response.success) {
                setGeneratedIdentifier(response.identifier || '');
                showToast(`Responsable créé avec succès ! Identifiant : ${response.identifier}`, 'success');
                
                // Réinitialiser le formulaire
                setFormData({
                    name: '',
                    contact: '',
                    region: user?.region || '',
                    group: user?.group || '',
                    district: user?.district || '',
                    cellName: '',
                    cellCategory: '',
                });
            } else {
                showToast(response.message || 'Erreur lors de la création', 'error');
            }
        } catch (err: any) {
            showToast(err.message || "Une erreur s'est produite.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Créer un Responsable de Cellule</h2>
            <p className="text-gray-600 mb-6 text-center">Le responsable recevra un identifiant de 5 chiffres pour se connecter.</p>
            
            {generatedIdentifier && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                    <h3 className="text-lg font-bold text-green-800 mb-2">✅ Responsable créé avec succès !</h3>
                    <p className="text-green-700">
                        <strong>Identifiant de connexion :</strong> 
                        <span className="text-2xl font-mono ml-2 bg-white px-3 py-1 rounded border border-green-300">
                            {generatedIdentifier}
                        </span>
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                        ⚠️ Veuillez noter cet identifiant et le communiquer au responsable de cellule.
                    </p>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className={labelClass}>Nom Complet *</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className={inputClass} 
                        required 
                    />
                </div>
                
                <div>
                    <label htmlFor="contact" className={labelClass}>Numéro de téléphone *</label>
                    <input 
                        type="tel" 
                        id="contact" 
                        name="contact" 
                        value={formData.contact} 
                        onChange={handleChange} 
                        className={inputClass} 
                        placeholder="Ex: 0123456789"
                        required
                    />
                </div>
                
                <hr className="my-4"/>
                
                <div>
                    <label htmlFor="region" className={labelClass}>Région *</label>
                    <select 
                        id="region" 
                        name="region" 
                        value={formData.region} 
                        onChange={handleChange} 
                        className={inputClass} 
                        required
                        disabled={!!user?.region} // Désactivé si l'utilisateur a déjà une région
                    >
                        <option value="">-- Sélectionner une région --</option>
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="group" className={labelClass}>Groupe *</label>
                    <select 
                        id="group" 
                        name="group" 
                        value={formData.group} 
                        onChange={handleChange} 
                        className={inputClass} 
                        required
                        disabled={!formData.region || !!user?.group}
                    >
                        <option value="">-- Sélectionner un groupe --</option>
                        {groupsInRegion.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="district" className={labelClass}>District *</label>
                    <select 
                        id="district" 
                        name="district" 
                        value={formData.district} 
                        onChange={handleChange} 
                        className={inputClass} 
                        required
                        disabled={!formData.group || !!user?.district}
                    >
                        <option value="">-- Sélectionner un district --</option>
                        {districtsInGroup.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="cellName" className={labelClass}>Nom de la Cellule *</label>
                    <input 
                        type="text" 
                        id="cellName" 
                        name="cellName" 
                        value={formData.cellName} 
                        onChange={handleChange} 
                        className={inputClass} 
                        placeholder="Ex: Cellule de prière du vendredi"
                        required 
                    />
                </div>
                
                <div>
                    <label htmlFor="cellCategory" className={labelClass}>Catégorie de la Cellule *</label>
                    <select 
                        id="cellCategory" 
                        name="cellCategory" 
                        value={formData.cellCategory} 
                        onChange={handleChange} 
                        className={inputClass} 
                        required
                    >
                        <option value="">-- Sélectionner une catégorie --</option>
                        {CELL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-blue-400 flex justify-center items-center space-x-2 transition-colors"
                >
                    {loading && <SpinnerIcon className="h-5 w-5"/>}
                    <span>{loading ? 'Création...' : 'Créer le Responsable'}</span>
                </button>
            </form>
        </div>
    );
};

export default CellLeaderForm;
