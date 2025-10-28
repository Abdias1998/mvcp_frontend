import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext.tsx';
import { SpinnerIcon } from './icons.tsx';

const AdminResetLinkPage: React.FC = () => {
    const [token, setToken] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleGenerateLink = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token.trim()) {
            showToast('Veuillez saisir un token valide.', 'error');
            return;
        }

        setLoading(true);
        
        // Générer le lien avec le token
        const baseUrl = window.location.origin + window.location.pathname;
        const link = `${baseUrl}#/reset-password?token=${encodeURIComponent(token.trim())}`;
        
        setGeneratedLink(link);
        setLoading(false);
        showToast('Lien généré avec succès !', 'success');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        showToast('Lien copié dans le presse-papiers !', 'success');
    };

    const handleSendWhatsApp = () => {
        const message = `Bonjour,\n\nVoici votre lien de réinitialisation de mot de passe :\n\n${generatedLink}\n\nCe lien est valide pendant 24 heures.\n\nCordialement,\nMVCP-BENIN`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleReset = () => {
        setToken('');
        setGeneratedLink('');
    };

    const inputClass = "mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Générateur de lien de réinitialisation</h2>
                <p className="text-gray-600 mb-6">
                    Utilisez cette page pour générer un lien de réinitialisation de mot de passe à partir du token reçu par WhatsApp.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions :</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Copiez le token reçu dans le message WhatsApp de l'utilisateur</li>
                        <li>Collez-le dans le champ ci-dessous</li>
                        <li>Cliquez sur "Générer le lien"</li>
                        <li>Envoyez le lien généré à l'utilisateur par WhatsApp</li>
                    </ol>
                </div>

                {!generatedLink ? (
                    <form onSubmit={handleGenerateLink} className="space-y-4">
                        <div>
                            <label htmlFor="token" className={labelClass}>
                                Token de réinitialisation
                            </label>
                            <textarea
                                id="token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className={`${inputClass} font-mono text-sm`}
                                rows={4}
                                placeholder="Collez le token ici..."
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Le token est une longue chaîne de caractères alphanumériques (ex: a1b2c3d4e5f6...)
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-blue-400 flex justify-center items-center space-x-2 transition-colors"
                        >
                            {loading && <SpinnerIcon className="h-5 w-5" />}
                            <span>{loading ? 'Génération...' : 'Générer le lien'}</span>
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Lien généré</label>
                            <div className="mt-1 p-3 bg-gray-50 border rounded-md break-all font-mono text-sm">
                                {generatedLink}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleSendWhatsApp}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <span>📱</span>
                                <span>Envoyer par WhatsApp</span>
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <span>📋</span>
                                <span>Copier le lien</span>
                            </button>
                        </div>

                        <button
                            onClick={handleReset}
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Générer un nouveau lien
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important :</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                    <li>Le lien est valide pendant 24 heures seulement</li>
                    <li>Chaque token ne peut être utilisé qu'une seule fois</li>
                    <li>Assurez-vous d'envoyer le lien à la bonne personne</li>
                    <li>Ne partagez jamais ce lien publiquement</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminResetLinkPage;
