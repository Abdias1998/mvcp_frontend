import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api.real';
import { useToast } from '../contexts/ToastContext.tsx';
import { LogoIcon, SpinnerIcon, EyeIcon, EyeOffIcon } from './icons.tsx';

const PasswordResetPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showToast('Les mots de passe ne correspondent pas.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('Le mot de passe doit contenir au moins 6 caractères.', 'error');
            return;
        }

        if (!token) {
            showToast('Token de réinitialisation manquant.', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.resetPassword({ token, newPassword });
            showToast(response.message, 'success');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la réinitialisation du mot de passe.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
            <LogoIcon className="h-20 w-20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Nouveau mot de passe</h2>
            <p className="text-gray-600 mb-6 text-center">
                Saisissez votre nouveau mot de passe ci-dessous.
            </p>

            {!token && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-700">
                        <strong>Erreur :</strong> Aucun token de réinitialisation n'a été fourni. 
                        Veuillez utiliser le lien envoyé par l'administrateur.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="newPassword" className={labelClass}>Nouveau mot de passe</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            id="newPassword" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            className={`${inputClass} pr-10`} 
                            required 
                            minLength={6}
                            placeholder="Min. 6 caractères"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className={labelClass}>Confirmer le mot de passe</label>
                    <div className="relative">
                        <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            id="confirmPassword" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            className={`${inputClass} pr-10`} 
                            required 
                            minLength={6}
                            placeholder="Confirmer le mot de passe"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                            {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || !token} 
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-blue-400 flex justify-center items-center space-x-2 transition-colors"
                >
                    {loading && <SpinnerIcon className="h-5 w-5"/>}
                    <span>{loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}</span>
                </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">← Retour à la connexion</Link>
            </p>
        </div>
    );
};

export default PasswordResetPage;
