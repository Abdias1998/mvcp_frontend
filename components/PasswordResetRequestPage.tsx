import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.real';
import { useToast } from '../contexts/ToastContext.tsx';
import { LogoIcon, SpinnerIcon } from './icons.tsx';
import { REGIONS } from '../constants.ts';
import { Group, District } from '../types.ts';

const PasswordResetRequestPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        region: '',
        group: '',
        district: '',
        groupPastorName: '',
        districtPastorName: '',
    });
    const [loading, setLoading] = useState(false);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [allDistricts, setAllDistricts] = useState<District[]>([]);
    const [showInstructions, setShowInstructions] = useState(false);
    const [whatsappMessage, setWhatsappMessage] = useState('');
    const navigate = useNavigate();
    const { showToast } = useToast();

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

    // Déterminer si la région est Littoral pour adapter la terminologie
    const isLittoral = useMemo(() => formData.region === 'Littoral', [formData.region]);
    const groupLabel = isLittoral ? 'Groupe' : 'District';
    const districtLabel = isLittoral ? 'District' : 'Localité';
    const groupPastorLabel = isLittoral ? 'Pasteur de Groupe' : 'Pasteur de District';
    const districtPastorLabel = isLittoral ? 'Pasteur de District' : 'Pasteur de Localité';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.requestPasswordReset(formData);
            setWhatsappMessage(response.message);
            setShowInstructions(true);
            showToast('Instructions générées avec succès !', 'success');
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la demande de réinitialisation.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        // Extraire le message WhatsApp du texte complet
        const lines = whatsappMessage.split('\n');
        const startIndex = lines.findIndex(line => line.includes('📋'));
        const messageToCopy = lines.slice(startIndex).join('\n');
        
        navigator.clipboard.writeText(messageToCopy);
        showToast('Message copié dans le presse-papiers !', 'success');
    };

    const handleOpenWhatsApp = () => {
        const phoneNumber = '22901679191150'; // Format international sans espaces ni symboles
        const lines = whatsappMessage.split('\n');
        const startIndex = lines.findIndex(line => line.includes('📋'));
        const messageToCopy = lines.slice(startIndex).join('\n');
        const encodedMessage = encodeURIComponent(messageToCopy);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const inputClass = "mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700";

    if (showInstructions) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
                <LogoIcon className="h-20 w-20 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Instructions de réinitialisation</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <p className="text-gray-700 mb-4 whitespace-pre-line">{whatsappMessage}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleOpenWhatsApp}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        📱 Ouvrir WhatsApp
                    </button>
                    <button
                        onClick={handleCopyToClipboard}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        📋 Copier le message
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                        ← Retour à la connexion
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
            <LogoIcon className="h-20 w-20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Réinitialisation du mot de passe</h2>
            <p className="text-gray-600 mb-6 text-center">
                Remplissez le formulaire ci-dessous pour demander la réinitialisation de votre mot de passe.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                    <strong>Note :</strong> Après avoir soumis ce formulaire, vous recevrez un message à envoyer par WhatsApp au <strong>+229 01 67 91 91 50</strong>. 
                    Un administrateur vous enverra ensuite un lien pour réinitialiser votre mot de passe.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className={labelClass}>Nom Complet</label>
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
                    <label htmlFor="contact" className={labelClass}>Numéro de téléphone</label>
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

                <div>
                    <label htmlFor="region" className={labelClass}>Région</label>
                    <select 
                        id="region" 
                        name="region" 
                        value={formData.region} 
                        onChange={handleChange} 
                        className={inputClass} 
                        required
                    >
                        <option value="">-- Sélectionner une région --</option>
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {formData.region && (
                    <div>
                        <label htmlFor="group" className={labelClass}>{groupLabel}</label>
                        <select 
                            id="group" 
                            name="group" 
                            value={formData.group} 
                            onChange={handleChange} 
                            className={inputClass}
                        >
                            <option value="">-- Sélectionner {groupLabel.toLowerCase()} --</option>
                            {groupsInRegion.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                )}

                {formData.group && (
                    <div>
                        <label htmlFor="district" className={labelClass}>{districtLabel}</label>
                        <select 
                            id="district" 
                            name="district" 
                            value={formData.district} 
                            onChange={handleChange} 
                            className={inputClass}
                        >
                            <option value="">-- Sélectionner {districtLabel.toLowerCase()} --</option>
                            {districtsInGroup.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="groupPastorName" className={labelClass}>
                        Nom de votre {groupPastorLabel} (facultatif)
                    </label>
                    <input 
                        type="text" 
                        id="groupPastorName" 
                        name="groupPastorName" 
                        value={formData.groupPastorName} 
                        onChange={handleChange} 
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="districtPastorName" className={labelClass}>
                        Nom de votre {districtPastorLabel} (facultatif)
                    </label>
                    <input 
                        type="text" 
                        id="districtPastorName" 
                        name="districtPastorName" 
                        value={formData.districtPastorName} 
                        onChange={handleChange} 
                        className={inputClass}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-blue-400 flex justify-center items-center space-x-2 transition-colors"
                >
                    {loading && <SpinnerIcon className="h-5 w-5"/>}
                    <span>{loading ? 'Traitement...' : 'Générer les instructions'}</span>
                </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">← Retour à la connexion</Link>
            </p>
        </div>
    );
};

export default PasswordResetRequestPage;
