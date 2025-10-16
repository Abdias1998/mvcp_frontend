import React, { useState, useEffect, useCallback } from 'react';
import { Communication, User, UserRole } from '../types.ts';
import { api } from '../services/api.real';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { SpinnerIcon, PlusCircleIcon, TrashIcon, SpeakerphoneIcon, CheckCircleIcon } from './icons.tsx';
import { REGIONS } from '../constants.ts';
import ConfirmationModal from './ConfirmationModal.tsx';

const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

type NewCommunication = Omit<Communication, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'status'>;

const CommunicationForm: React.FC<{ user: User, onSave: (data: NewCommunication) => void, onCancel: () => void }> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<NewCommunication>>({
        title: '',
        content: '',
        target: { type: 'global' }
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user.role !== UserRole.NATIONAL_COORDINATOR && formData.target?.type === 'region') {
            if (formData.target.region !== user.region) {
                setFormData(prev => ({ ...prev, target: { ...prev.target!, region: user.region } as Communication['target'] }));
            }
        }
    }, [formData.target?.type, user.role, user.region]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'targetType') {
            const newType = value as 'global' | 'region';
            setFormData(prev => ({ ...prev, target: { type: newType, region: newType === 'global' ? '' : prev.target?.region } }));
        } else if (name === 'targetRegion') {
            setFormData(prev => ({ ...prev, target: { ...prev.target!, region: value } as Communication['target'] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData as NewCommunication);
        setIsSaving(false);
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className={labelClass}>Titre</label>
                <input type="text" id="title" name="title" value={formData.title || ''} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label htmlFor="content" className={labelClass}>Contenu du message</label>
                <textarea id="content" name="content" value={formData.content || ''} onChange={handleChange} rows={8} className={inputClass} required></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="targetType" className={labelClass}>Destinataire</label>
                    <select id="targetType" name="targetType" value={formData.target?.type || 'global'} onChange={handleChange} className={inputClass}>
                        <option value="global">Annonce Globale</option>
                        <option value="region">Région Spécifique</option>
                    </select>
                </div>
                {formData.target?.type === 'region' && (
                    <div>
                        <label htmlFor="targetRegion" className={labelClass}>Région</label>
                        {user.role === UserRole.NATIONAL_COORDINATOR ? (
                            <select id="targetRegion" name="targetRegion" value={formData.target?.region || ''} onChange={handleChange} className={inputClass} required>
                                <option value="">-- Sélectionner une région --</option>
                                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        ) : (
                            <input type="text" value={user.region} className={`${inputClass} bg-gray-100`} readOnly />
                        )}
                    </div>
                )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button>
                <button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 disabled:bg-blue-300">
                    {isSaving && <SpinnerIcon className="h-5 w-5"/>}
                    <span>{user.role === UserRole.NATIONAL_COORDINATOR ? "Envoyer" : "Soumettre pour validation"}</span>
                </button>
            </div>
        </form>
    );
};


const CommunicationPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('published');
    const [publishedComms, setPublishedComms] = useState<Communication[]>([]);
    const [pendingComms, setPendingComms] = useState<Communication[]>([]);
    const [myProposals, setMyProposals] = useState<Communication[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [publishedData, pendingData, proposalsData] = await Promise.all([
                api.getPublishedCommunications(user),
                user.role === UserRole.NATIONAL_COORDINATOR ? api.getPendingCommunications() : Promise.resolve([]),
                user.role !== UserRole.NATIONAL_COORDINATOR ? api.getMyProposals(user) : Promise.resolve([])
            ]);
            setPublishedComms(publishedData);
            setPendingComms(pendingData);
            setMyProposals(proposalsData);
        } catch (error) {
            showToast("Erreur lors du chargement des communications.", 'error');
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleSave = async (data: NewCommunication) => {
        if (!user) return;
        try {
            await api.addCommunication(data, user);
            showToast(user.role === UserRole.NATIONAL_COORDINATOR ? 'Communication envoyée.' : 'Proposition soumise pour validation.', 'success');
            setIsModalOpen(false);
            await fetchData();
        } catch (err: any) {
            showToast(`Erreur : ${err.message}`, 'error');
        }
    };

    const handleStatusUpdate = async (commId: string, status: 'publié' | 'rejeté') => {
        try {
            await api.updateCommunicationStatus(commId, status);
            showToast(`Proposition ${status === 'publié' ? 'approuvée' : 'rejetée'}.`, 'success');
            await fetchData();
        } catch (error: any) {
            showToast(`Erreur : ${error.message}`, 'error');
        }
    };

    const handleDeleteRequest = (id: string, title: string) => {
        setItemToDelete({ id, name: title });
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete || !user) return;
        setIsDeleting(true);
        try {
            await api.deleteCommunication(itemToDelete.id, user);
            showToast("Communication supprimée.", 'success');
            await fetchData();
        } catch (error: any) {
            showToast(`Erreur lors de la suppression: ${error.message}`, 'error');
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
            setItemToDelete(null);
        }
    };

    const getStatusChip = (status: Communication['status']) => {
        switch (status) {
            case 'publié': return <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">Publié</span>;
            case 'en_attente': return <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">En attente</span>;
            case 'rejeté': return <span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded-full">Rejeté</span>;
        }
    };
    
    const renderList = (comms: Communication[], type: 'published' | 'pending' | 'proposal') => {
        if (comms.length === 0) {
            let message = "Il n'y a aucune annonce pour le moment.";
            if (type === 'pending') message = "Aucune proposition en attente de validation.";
            if (type === 'proposal') message = "Vous n'avez soumis aucune proposition.";
            return (
                 <div className="text-center bg-white p-12 rounded-xl shadow-md">
                    <SpeakerphoneIcon className="mx-auto h-16 w-16 text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">{message.split('.')[0]}</h3>
                    <p className="mt-2 text-sm text-gray-500">{message.split('.')[1] || ''}</p>
                </div>
            );
        }
        return (
            <div className="space-y-6">
                {comms.map(comm => (
                    <div key={comm.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                         <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                                    <h2 className="text-xl font-bold text-gray-800">{comm.title}</h2>
                                    {comm.target.type === 'region' && (
                                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{comm.target.region}</span>
                                    )}
                                    {type === 'proposal' && getStatusChip(comm.status)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Par {comm.authorName} le {new Date(comm.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            {(user?.role === UserRole.NATIONAL_COORDINATOR || (comm.authorId === user?.uid && comm.status !== 'publié')) && (
                                 <button onClick={() => handleDeleteRequest(comm.id, comm.title)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full" title="Supprimer">
                                    <TrashIcon className="h-5 w-5"/>
                                 </button>
                            )}
                         </div>
                        <p className="text-gray-700 mt-4 whitespace-pre-wrap">{comm.content}</p>
                        {type === 'pending' && user?.role === UserRole.NATIONAL_COORDINATOR && (
                            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
                                <button onClick={() => handleStatusUpdate(comm.id, 'rejeté')} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 text-sm">Rejeter</button>
                                <button onClick={() => handleStatusUpdate(comm.id, 'publié')} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 text-sm flex items-center space-x-1"><CheckCircleIcon className="h-4 w-4"/><span>Approuver</span></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return <div className="flex justify-center p-20"><SpinnerIcon className="h-16 w-16 text-blue-700" /></div>;

    const isCoordinator = user?.role === UserRole.NATIONAL_COORDINATOR;
    
    const TabButton: React.FC<{ tabId: string, label: string, count: number }> = ({ tabId, label, count }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabId
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
            {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {count}
                </span>
            )}
        </button>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Centre de Communication</h1>
                    <p className="text-gray-600 mt-1">Annonces officielles et propositions.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg">
                    <PlusCircleIcon className="h-5 w-5"/>
                    <span>{isCoordinator ? "Nouvelle Annonce" : "Proposer une Annonce"}</span>
                </button>
            </header>
            
            <div className="border-b border-gray-200">
                <nav className="flex space-x-2" aria-label="Tabs">
                    <TabButton tabId="published" label="Annonces Publiées" count={0} />
                    {isCoordinator && <TabButton tabId="pending" label="À Valider" count={pendingComms.length} />}
                    {!isCoordinator && <TabButton tabId="proposals" label="Mes Propositions" count={0} />}
                </nav>
            </div>
            
            <div className="mt-6">
                {activeTab === 'published' && renderList(publishedComms, 'published')}
                {activeTab === 'pending' && isCoordinator && renderList(pendingComms, 'pending')}
                {activeTab === 'proposals' && !isCoordinator && renderList(myProposals, 'proposal')}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isCoordinator ? "Nouvelle Annonce" : "Proposer une Annonce"}>
                {user && <CommunicationForm user={user} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
            </Modal>
            
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Supprimer la Communication"
                message={`Êtes-vous sûr de vouloir supprimer: "${itemToDelete?.name}" ?`}
                confirmText="Supprimer"
                isConfirming={isDeleting}
            />
        </div>
    );
};

export default CommunicationPage;