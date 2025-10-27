import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.real';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { PastorData, UserRole, Group, District } from '../types.ts';
import { REGIONS } from '../constants.ts';
import { LogoIcon, SpinnerIcon } from './icons.tsx';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState<PastorData>({
        name: '',
        email: '',
        password: '',
        contact: '',
        role: UserRole.REGIONAL_PASTOR,
        region: '',
        group: '',
        district: '',
    });
    const [loading, setLoading] = useState(false);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [allDistricts, setAllDistricts] = useState<District[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        if (user) {
            navigate('/admin'); // Redirect if already logged in
        }
    }, [user, navigate]);

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
                showToast('Erreur lors du chargement des données. Veuillez réessayer.', 'error');
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
        
        // Réinitialiser les champs dépendants quand la région change
        if (name === 'region') {
            setFormData(prev => ({ ...prev, [name]: value, group: '', district: '' }));
        }
        // Réinitialiser le district quand le groupe change
        else if (name === 'group') {
            setFormData(prev => ({ ...prev, [name]: value, district: '' }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as UserRole;
        setFormData(prev => ({ 
            ...prev, 
            role: newRole,
            group: newRole === UserRole.REGIONAL_PASTOR ? '' : prev.group,
            district: (newRole === UserRole.REGIONAL_PASTOR || newRole === UserRole.GROUP_PASTOR) ? '' : prev.district,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { success, message } = await api.registerPastor(formData);
            if (success) {
                showToast(message, 'success');
                navigate('/login');
            } else {
                showToast(message, 'error');
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
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
            <LogoIcon className="h-20 w-20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Créer un Compte</h2>
            <p className="text-gray-600 mb-6 text-center">Votre compte sera soumis à validation.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className={labelClass}>Nom Complet</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="email" className={labelClass}>Email (facultatif)</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
                </div>
                 <div>
                    <label htmlFor="contact" className={labelClass}>Numéro de téléphone</label>
                    <input 
                        type="tel" 
                        id="contact" 
                        name="contact" 
                        value={formData.contact || ''} 
                        onChange={handleChange} 
                        className={inputClass} 
                        placeholder="Ex: 0123456789"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className={labelClass}>Mot de Passe (min. 6 caractères)</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} required minLength={6} />
                </div>
                
                <hr className="my-4"/>

                <div>
                    <label htmlFor="role" className={labelClass}>Votre Rôle</label>
                    <select id="role" name="role" value={formData.role} onChange={handleRoleChange} className={inputClass} required>
                        <option value={UserRole.REGIONAL_PASTOR}>Pasteur Régional</option>
                        <option value={UserRole.GROUP_PASTOR}>Pasteur de Groupe</option>
                        <option value={UserRole.DISTRICT_PASTOR}>Pasteur de District</option>
                    </select>
                </div>
                
                <div>
                    <label htmlFor="region" className={labelClass}>Région</label>
                    <select id="region" name="region" value={formData.region} onChange={handleChange} className={inputClass} required>
                         <option value="">-- Sélectionner une région --</option>
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {(formData.role === UserRole.GROUP_PASTOR || formData.role === UserRole.DISTRICT_PASTOR) && (
                     <div>
                        <label htmlFor="group" className={labelClass}>Groupe</label>
                        <select 
                            id="group" 
                            name="group" 
                            value={formData.group || ''} 
                            onChange={handleChange} 
                            className={inputClass} 
                            required 
                            disabled={!formData.region}
                        >
                            <option value="">-- Sélectionner un groupe --</option>
                            {groupsInRegion.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                )}

                 {formData.role === UserRole.DISTRICT_PASTOR && (
                     <div>
                        <label htmlFor="district" className={labelClass}>District</label>
                        <select 
                            id="district" 
                            name="district" 
                            value={formData.district || ''} 
                            onChange={handleChange} 
                            className={inputClass} 
                            required 
                            disabled={!formData.group}
                        >
                            <option value="">-- Sélectionner un district --</option>
                            {districtsInGroup.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                )}
                
                <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-blue-400 flex justify-center items-center space-x-2 transition-colors">
                    {loading && <SpinnerIcon className="h-5 w-5"/>}
                    <span>{loading ? 'Inscription...' : "S'inscrire"}</span>
                </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-4">
                Vous avez déjà un compte ? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Se connecter</Link>
            </p>
        </div>
    );
};

export default RegisterPage;