import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api.real';
import { Group, District, Cell, Report, User, PastorData, UserRole, CellStatus } from '../types.ts';
import { SpinnerIcon, FolderIcon, DocumentDuplicateIcon, ChevronRightIcon, PencilIcon, PlusCircleIcon, UserPlusIcon, TrashIcon } from './icons.tsx';
import ReportDetailModal from './ReportDetailModal.tsx';
import { REGIONS, CELL_CATEGORIES } from '../constants.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';

// --- TYPES ---
type HierarchyNode = { [region: string]: { [group: string]: { groupObj: Group, districts: { [district: string]: { districtObj: District, cells: Cell[] } } } } };
type ModalState = 
    | { type: 'addGroup', region: string }
    | { type: 'addDistrict', region: string, group: string }
    | { type: 'addCell', region: string, group: string, district: string }
    | { type: 'editCell', cell: Cell }
    | { type: 'assignPastor', level: 'group' | 'district', entity: Group | District }
    | null;


// --- MODAL & FORMS (kept in-file to avoid major refactoring of other components) ---

const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const CELL_STATUSES: { value: CellStatus; label: string; }[] = [
    { value: 'Active', label: 'Active' }, { value: 'En implantation', label: 'En Implantation' },
    { value: 'En multiplication', label: 'En Multiplication' }, { value: 'En pause', label: 'En Pause' },
];

const GroupDistrictForm: React.FC<{
    type: 'group' | 'district';
    region: string;
    onSave: (name: string) => Promise<void>;
    onCancel: () => void;
}> = ({ type, region, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    const isLittoral = region === 'Littoral';
    const label = type === 'group' 
        ? (isLittoral ? 'Nom du Groupe' : 'Nom du District (Parent)') 
        : (isLittoral ? 'Nom du District (Enfant)' : 'Nom de la Localité');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim()) {
            showToast("Le nom ne peut pas être vide.", "error");
            return;
        }
        setIsSaving(true);
        await onSave(name);
        setIsSaving(false);
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className={labelClass}>{label}</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required autoFocus />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button>
                <button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 disabled:bg-blue-300">
                    {isSaving && <SpinnerIcon className="h-5 w-5"/>}
                    <span>Enregistrer</span>
                </button>
            </div>
        </form>
    );
};

const CellForm: React.FC<{
    cellData: Partial<Cell>;
    onSave: (data: Omit<Cell, 'id'>, cellId?: string) => Promise<void>;
    onCancel: () => void;
}> = ({ cellData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(cellData);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.region || !formData.group || !formData.district || !formData.cellName || !formData.leaderName) {
            showToast("Veuillez remplir tous les champs requis.", 'error');
            return;
        }
        setIsSaving(true);
        const { id, ...saveData } = formData;
        await onSave(saveData as Omit<Cell, 'id'>, id);
        setIsSaving(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const inputClass = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="cellName" className={labelClass}>Nom de la Cellule</label>
                <input type="text" id="cellName" name="cellName" value={formData.cellName || ''} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="cellCategory" className={labelClass}>Catégorie</label>
                    <select id="cellCategory" name="cellCategory" value={formData.cellCategory} onChange={handleChange} className={inputClass} required>
                        {CELL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className={labelClass}>Statut</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClass} required>
                        {CELL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
            </div>
             <div>
                <label htmlFor="leaderName" className={labelClass}>Nom du Responsable</label>
                <input type="text" id="leaderName" name="leaderName" value={formData.leaderName || ''} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label htmlFor="leaderContact" className={labelClass}>Contact du Responsable</label>
                <input type="tel" id="leaderContact" name="leaderContact" value={formData.leaderContact || ''} onChange={handleChange} className={inputClass} placeholder="Ex: 0123456789" pattern="01[0-9]{8}" title="Le numéro doit contenir 10 chiffres et commencer par 01." />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button>
                 <button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 disabled:bg-blue-300">
                     {isSaving && <SpinnerIcon className="h-5 w-5"/>}
                     <span>Enregistrer</span>
                </button>
            </div>
        </form>
    );
};

const AssignPastorForm: React.FC<{
    entity: Group | District;
    level: 'group' | 'district';
    pastors: User[];
    onSave: (pastorId: string | undefined, data?: Omit<PastorData, 'uid'>) => Promise<void>;
    onCancel: () => void;
}> = ({ entity, level, pastors, onSave, onCancel }) => {
    const [mode, setMode] = useState<'assign' | 'create'>('assign');
    const [selectedPastor, setSelectedPastor] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [newPastorData, setNewPastorData] = useState({ name: '', email: '', password: '', contact: '' });

    const handleSave = async () => {
        setIsSaving(true);
        if (mode === 'assign') {
            await onSave(selectedPastor);
        } else {
            const role = level === 'group' ? UserRole.GROUP_PASTOR : UserRole.DISTRICT_PASTOR;
            const pastorToCreate: Omit<PastorData, 'uid'> = {
                ...newPastorData,
                role,
                region: entity.region,
                group: level === 'group' ? entity.name : (entity as District).group,
                district: level === 'district' ? entity.name : undefined
            };
            await onSave(undefined, pastorToCreate);
        }
        setIsSaving(false);
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="space-y-4">
             <div className="flex border border-gray-200 rounded-lg p-1">
                <button type="button" onClick={() => setMode('assign')} className={`w-1/2 py-2 rounded-md text-sm font-medium ${mode === 'assign' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Assigner Existant</button>
                <button type="button" onClick={() => setMode('create')} className={`w-1/2 py-2 rounded-md text-sm font-medium ${mode === 'create' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Créer Nouveau</button>
            </div>
            {mode === 'assign' ? (
                <div>
                    <label htmlFor="pastor-select" className={labelClass}>Choisir un responsable</label>
                    <select id="pastor-select" value={selectedPastor} onChange={e => setSelectedPastor(e.target.value)} className={inputClass}>
                        <option value="">-- Aucun --</option>
                        {pastors.map(p => <option key={p.uid} value={p.uid}>{p.name} ({p.email})</option>)}
                    </select>
                </div>
            ) : (
                <div className="space-y-3 p-4 border rounded-md bg-gray-50">
                     <input type="text" placeholder="Nom complet" value={newPastorData.name} onChange={e => setNewPastorData(p => ({...p, name: e.target.value}))} className={inputClass} required />
                     <input type="email" placeholder="Email" value={newPastorData.email} onChange={e => setNewPastorData(p => ({...p, email: e.target.value}))} className={inputClass} required />
                     <input type="password" placeholder="Mot de passe (min. 6 car.)" value={newPastorData.password} onChange={e => setNewPastorData(p => ({...p, password: e.target.value}))} className={inputClass} required minLength={6} />
                     <input type="tel" placeholder="Contact (Ex: 01...)" value={newPastorData.contact} onChange={e => setNewPastorData(p => ({...p, contact: e.target.value}))} className={inputClass} pattern="01[0-9]{8}" />
                </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button>
                <button type="button" onClick={handleSave} disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 disabled:bg-blue-300">
                    {isSaving && <SpinnerIcon className="h-5 w-5"/>}
                    <span>Enregistrer</span>
                </button>
            </div>
        </div>
    );
};

const ReportsForCellModal: React.FC<{ cell: Cell | null, onClose: () => void, user: User }> = ({ cell, onClose, user }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [reportToView, setReportToView] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!cell) return;

        const fetchReports = async () => {
            setLoading(true);
            try {
                // Charger les rapports des 3 derniers mois
                const endDate = new Date();
                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 3);
                
                const allReports = await api.getReports(user, {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0]
                });

                const cellReports = allReports.filter(r => 
                    r.region === cell.region &&
                    r.group === cell.group &&
                    r.district === cell.district &&
                    r.cellName === cell.cellName
                ).sort((a, b) => new Date(b.cellDate).getTime() - new Date(a.cellDate).getTime());
                
                setReports(cellReports);
            } catch (error) {
                console.error('Erreur lors du chargement des rapports:', error);
                setReports([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchReports();
    }, [cell, user]);


    if (!cell) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Rapports pour "{cell.cellName}"</h3>
                            <p className="text-sm text-gray-500">3 derniers mois</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center p-10"><SpinnerIcon className="h-8 w-8" /></div>
                        ) : reports.length > 0 ? (
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-center">Présents</th>
                                        <th className="px-4 py-3 text-center">Invités</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(r => (
                                        <tr key={r.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">{new Date(r.cellDate).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-4 py-3 text-center">{r.totalPresent}</td>
                                            <td className="px-4 py-3 text-center">{r.invitedPeople.length}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => setReportToView(r)} className="text-blue-600 hover:underline text-xs font-medium">Voir détails</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-gray-500 py-10">Aucun rapport trouvé pour cette cellule durant les 3 derniers mois.</p>
                        )}
                    </div>
                </div>
            </div>
            <ReportDetailModal 
                report={reportToView} 
                onClose={() => setReportToView(null)}
                onDeleteRequest={() => {}}
                hideDelete={true}
            />
        </>
    );
};

// --- HIERARCHY VIEW COMPONENT ---
const HierarchyView: React.FC<{ user: User }> = ({ user }) => {
    const [hierarchy, setHierarchy] = useState<HierarchyNode | null>(null);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [allDistricts, setAllDistricts] = useState<District[]>([]);
    const [allPastors, setAllPastors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
    const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
    const [modalState, setModalState] = useState<ModalState>(null);
    const [inlineEditState, setInlineEditState] = useState<{ type: 'group' | 'district', id: string, name: string, region: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{type: 'group' | 'district' | 'cell', id: string, name: string} | null>(null);
    const { showToast } = useToast();

    const fetchAndBuildHierarchy = useCallback(async () => {
        setLoading(true);
        try {
            const groups = await api.getGroups();
            const districts = await api.getDistricts();
            const cells = await api.getCellsForUser(user);
            const pastors = await api.getPastors();

            setAllGroups(groups);
            setAllDistricts(districts);
            setAllPastors(pastors);

            const structuredData: HierarchyNode = {};

            REGIONS.forEach(region => {
                structuredData[region] = {};
                const regionGroups = groups.filter(g => g.region === region);
                
                regionGroups.forEach(group => {
                    structuredData[region][group.name] = { groupObj: group, districts: {} };
                    const groupDistricts = districts.filter(d => d.region === region && d.group === group.name);
                    
                    groupDistricts.forEach(district => {
                        const districtCells = cells.filter(c => c.region === region && c.group === group.name && c.district === district.name);
                        structuredData[region][group.name].districts[district.name] = { districtObj: district, cells: districtCells };
                    });
                });
            });

            setHierarchy(structuredData);
        } catch (error) {
            console.error("Error building hierarchy:", error);
            showToast("Erreur lors de la construction de la hiérarchie.", 'error');
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    useEffect(() => {
        fetchAndBuildHierarchy();
    }, [fetchAndBuildHierarchy]);

    const handleGenericSave = async (apiCall: Promise<any>, successMessage: string) => {
        try {
            await apiCall;
            showToast(successMessage, 'success');
            await fetchAndBuildHierarchy();
            setModalState(null);
            setInlineEditState(null);
        } catch (err: any) {
            showToast(`Erreur : ${err.message}`, 'error');
        }
    };
    
    const handlePastorSave = async (pastorId: string | undefined, data?: Omit<PastorData, 'uid'>) => {
        if (!modalState || modalState.type !== 'assignPastor') return;

        const { entity, level } = modalState;
        
        try {
            if (data) { // Creating new pastor
                 await api.addPastor(data as PastorData);
            } else if (pastorId) { // Assigning existing
                const pastorToUpdate = allPastors.find(p => p.uid === pastorId);
                if (!pastorToUpdate) throw new Error("Pasteur non trouvé");
                
                const updatedData: PastorData = {
                    ...pastorToUpdate,
                    role: level === 'group' ? UserRole.GROUP_PASTOR : UserRole.DISTRICT_PASTOR,
                    region: entity.region,
                    group: level === 'group' ? entity.name : (entity as District).group,
                    district: level === 'district' ? entity.name : undefined,
                };
                await api.updatePastor(pastorId, updatedData);
            } else { // Unassigning
                const currentPastor = getPastorFor(level, entity);
                if(currentPastor) {
                    await api.updatePastor(currentPastor.uid, { ...currentPastor, group: undefined, district: undefined });
                }
            }
            showToast('Responsable mis à jour.', 'success');
            await fetchAndBuildHierarchy();
            setModalState(null);
        } catch (err: any) {
            showToast(`Erreur: ${err.message}`, 'error');
        }
    };

    const handleDeleteRequest = (type: 'group' | 'district' | 'cell', id: string, name: string) => {
        setItemToDelete({ type, id, name });
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const { type, id, name } = itemToDelete;
        try {
            if (type === 'group') await api.deleteGroup(id);
            else if (type === 'district') await api.deleteDistrict(id);
            else if (type === 'cell') await api.deleteCell(id);
            showToast(`${name} supprimé(e) avec succès.`, 'success');
            await fetchAndBuildHierarchy();
        } catch(err: any) {
             showToast(`Erreur : ${err.message}`, 'error');
        } finally {
            setIsDeleting(false);
            setItemToDelete(null);
        }
    };

    const handleInlineUpdate = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!inlineEditState) return;
        const { type, id, name: originalName, region } = inlineEditState;
        const newName = e.target.value;

        if (newName && newName !== originalName) {
            if (type === 'group') {
                handleGenericSave(api.updateGroup(id, { region, name: newName }), 'Groupe renommé.');
            } else if (type === 'district') {
                const districtToUpdate = allDistricts.find(d => d.id === id);
                if (districtToUpdate) {
                    handleGenericSave(api.updateDistrict(id, { region, group: districtToUpdate.group, name: newName }), 'District renommé.');
                }
            }
        }
        setInlineEditState(null);
    };

    const getPastorFor = (level: 'group' | 'district', entity: Group | District): User | undefined => {
        if (level === 'group') return allPastors.find(p => p.role === UserRole.GROUP_PASTOR && p.region === entity.region && p.group === entity.name && !p.district);
        if ('group' in entity) {
            return allPastors.find(p => p.role === UserRole.DISTRICT_PASTOR && p.region === entity.region && p.group === entity.group && p.district === entity.name);
        }
        return undefined;
    };
    
    const getModalTitle = () => {
        if (!modalState) return '';
        switch (modalState.type) {
            case 'addGroup': {
                const isLittoral = modalState.region === 'Littoral';
                return `Ajouter ${isLittoral ? 'Groupe' : 'District'} à ${modalState.region}`;
            }
            case 'addDistrict': {
                const isLittoral = modalState.region === 'Littoral';
                return `Ajouter ${isLittoral ? 'District' : 'Localité'} à ${modalState.group}`;
            }
            case 'addCell': return `Ajouter Cellule à ${modalState.district}`;
            case 'editCell': return `Modifier la cellule ${modalState.cell.cellName}`;
            case 'assignPastor': return `Gérer le responsable de ${modalState.entity.name}`;
            default: return '';
        }
    };
    
    const renderModalContent = () => {
        if (!modalState) return null;
        switch (modalState.type) {
            case 'addGroup':
                return <GroupDistrictForm type="group" region={modalState.region} onCancel={() => setModalState(null)}
                    onSave={async (name) => handleGenericSave(api.addGroup({ region: modalState.region, name }), 'Élément ajouté.')} />;
            case 'addDistrict':
                return <GroupDistrictForm type="district" region={modalState.region} onCancel={() => setModalState(null)}
                    onSave={async (name) => handleGenericSave(api.addDistrict({ region: modalState.region, group: modalState.group, name }), 'Élément ajouté.')} />;
            case 'addCell':
                const newCell: Partial<Cell> = { region: modalState.region, group: modalState.group, district: modalState.district, cellCategory: CELL_CATEGORIES[0], status: 'Active' };
                return <CellForm cellData={newCell} onCancel={() => setModalState(null)}
                    onSave={async (data) => handleGenericSave(api.addCell(data), 'Cellule ajoutée.')} />;
            case 'editCell':
                return <CellForm cellData={modalState.cell} onCancel={() => setModalState(null)}
                    onSave={async (data, id) => handleGenericSave(api.updateCell(id!, data), 'Cellule mise à jour.')} />;
            case 'assignPastor':
                return <AssignPastorForm entity={modalState.entity} level={modalState.level} pastors={allPastors} onCancel={() => setModalState(null)} onSave={handlePastorSave} />;
            default: return null;
        }
    };

    if (loading) return <div className="flex justify-center items-center p-10"><SpinnerIcon className="h-12 w-12 text-blue-700" /></div>;
    if (!hierarchy) return <p className="text-center text-red-500">Impossible de construire la hiérarchie.</p>;

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-gray-500 mb-4">Survolez un élément pour afficher les options d'ajout et de modification.</p>
                <ul className="space-y-1">
                    {Object.entries(hierarchy).map(([regionName, groups]) => (
                        <li key={regionName}>
                            <div className="group flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setExpanded(p => ({ ...p, [regionName]: !p[regionName]}))}>
                                    <ChevronRightIcon className={`h-5 w-5 text-gray-500 transform transition-transform ${expanded[regionName] ? 'rotate-90' : ''}`} />
                                    <FolderIcon className="h-6 w-6 text-yellow-500" />
                                    <span className="font-bold text-gray-800">{regionName}</span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setModalState({ type: 'addGroup', region: regionName })} title="Ajouter un groupe/district" className="p-1 hover:bg-gray-200 rounded-full"><PlusCircleIcon className="h-5 w-5 text-green-600"/></button>
                                </div>
                            </div>
                            {expanded[regionName] && (
                                <ul className="pl-6 border-l-2 border-gray-200 ml-5">
                                    {Object.entries(groups).map(([groupName, {groupObj, districts}]) => {
                                        const pastor = getPastorFor('group', groupObj);
                                        return (
                                        <li key={groupName} className="mt-1">
                                            <div className="group flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                                                <div className="flex items-center space-x-2 cursor-pointer flex-grow" onClick={() => setExpanded(p => ({ ...p, [`${regionName}-${groupName}`]: !p[`${regionName}-${groupName}`]}))}>
                                                    <ChevronRightIcon className={`h-5 w-5 text-gray-500 transform transition-transform ${expanded[`${regionName}-${groupName}`] ? 'rotate-90' : ''}`} />
                                                    <FolderIcon className="h-5 w-5 text-blue-500" />
                                                    {inlineEditState?.id === groupObj.id ? 
                                                        <input type="text" defaultValue={groupName} onBlur={handleInlineUpdate} autoFocus className="p-1 border rounded" /> :
                                                        <span className="font-semibold text-gray-700">{groupName}</span>
                                                    }
                                                    {pastor && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{pastor.name}</span>}
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                                    <button onClick={() => setModalState({ type: 'assignPastor', level: 'group', entity: groupObj })} title="Gérer le responsable" className="p-1 hover:bg-gray-200 rounded-full"><UserPlusIcon className="h-5 w-5 text-purple-600"/></button>
                                                    <button onClick={() => setInlineEditState({ type: 'group', id: groupObj.id, name: groupName, region: regionName })} title="Renommer" className="p-1 hover:bg-gray-200 rounded-full"><PencilIcon className="h-5 w-5 text-blue-600"/></button>
                                                    <button onClick={() => setModalState({ type: 'addDistrict', region: regionName, group: groupName })} title="Ajouter un district/localité" className="p-1 hover:bg-gray-200 rounded-full"><PlusCircleIcon className="h-5 w-5 text-green-600"/></button>
                                                    <button onClick={() => handleDeleteRequest('group', groupObj.id, groupName)} title="Supprimer" className="p-1 hover:bg-gray-200 rounded-full"><TrashIcon className="h-5 w-5 text-red-600"/></button>
                                                </div>
                                            </div>
                                            {expanded[`${regionName}-${groupName}`] && (
                                                <ul className="pl-6 border-l-2 border-gray-200 ml-4">
                                                    {Object.entries(districts).map(([districtName, districtData]: [string, { districtObj: District; cells: Cell[] }]) => {
                                                        const { districtObj, cells } = districtData;
                                                         const pastor = getPastorFor('district', districtObj);
                                                        return(
                                                        <li key={districtName} className="mt-1">
                                                            <div className="group flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                                                                <div className="flex items-center space-x-2 cursor-pointer flex-grow" onClick={() => setExpanded(p => ({ ...p, [`${regionName}-${groupName}-${districtName}`]: !p[`${regionName}-${groupName}-${districtName}`]}))}>
                                                                    <ChevronRightIcon className={`h-5 w-5 text-gray-500 transform transition-transform ${expanded[`${regionName}-${groupName}-${districtName}`] ? 'rotate-90' : ''}`} />
                                                                    <FolderIcon className="h-5 w-5 text-green-500" />
                                                                     {inlineEditState?.id === districtObj.id ? 
                                                                        <input type="text" defaultValue={districtName} onBlur={handleInlineUpdate} autoFocus className="p-1 border rounded" /> :
                                                                        <span className="font-medium text-gray-600">{districtName}</span>
                                                                    }
                                                                     {pastor && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{pastor.name}</span>}
                                                                </div>
                                                                 <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                                                    <button onClick={() => setModalState({ type: 'assignPastor', level: 'district', entity: districtObj })} title="Gérer le responsable" className="p-1 hover:bg-gray-200 rounded-full"><UserPlusIcon className="h-5 w-5 text-purple-600"/></button>
                                                                    <button onClick={() => setInlineEditState({ type: 'district', id: districtObj.id, name: districtName, region: regionName })} title="Renommer" className="p-1 hover:bg-gray-200 rounded-full"><PencilIcon className="h-5 w-5 text-blue-600"/></button>
                                                                    <button onClick={() => setModalState({ type: 'addCell', region: regionName, group: groupName, district: districtName })} title="Ajouter une cellule" className="p-1 hover:bg-gray-200 rounded-full"><PlusCircleIcon className="h-5 w-5 text-green-600"/></button>
                                                                    <button onClick={() => handleDeleteRequest('district', districtObj.id, districtName)} title="Supprimer" className="p-1 hover:bg-gray-200 rounded-full"><TrashIcon className="h-5 w-5 text-red-600"/></button>
                                                                </div>
                                                            </div>
                                                            {expanded[`${regionName}-${groupName}-${districtName}`] && (
                                                                <ul className="pl-6 border-l-2 border-gray-200 ml-4">
                                                                    {cells.map(cell => (
                                                                        <li key={cell.id} className="mt-1 group flex items-center justify-between p-2 rounded-md hover:bg-blue-50">
                                                                            <button onClick={() => setSelectedCell(cell)} className="w-full text-left flex items-center space-x-2 transition-colors">
                                                                                <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                                                                                <span className="text-sm text-gray-600">{cell.cellName}</span>
                                                                            </button>
                                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                                                                <button onClick={() => setModalState({type: 'editCell', cell})} title="Modifier la cellule" className="p-1 hover:bg-gray-200 rounded-full"><PencilIcon className="h-5 w-5 text-blue-600"/></button>
                                                                                <button onClick={() => handleDeleteRequest('cell', cell.id, cell.cellName)} title="Supprimer la cellule" className="p-1 hover:bg-gray-200 rounded-full"><TrashIcon className="h-5 w-5 text-red-600"/></button>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </li>
                                                         )})}
                                                </ul>
                                            )}
                                        </li>
                                    )})}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            
            <ReportsForCellModal 
                cell={selectedCell} 
                onClose={() => setSelectedCell(null)}
                user={user}
            />

            <Modal isOpen={!!modalState} onClose={() => setModalState(null)} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>

            {itemToDelete && (
                 <ConfirmationModal
                    isOpen={!!itemToDelete}
                    onClose={() => setItemToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title={`Supprimer ${itemToDelete.type}`}
                    message={`Êtes-vous sûr de vouloir supprimer "${itemToDelete.name}" ? Cette action est irréversible et supprimera tous les éléments enfants.`}
                    confirmText="Supprimer"
                    isConfirming={isDeleting}
                />
            )}
        </>
    );
};

export default HierarchyView;