import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { UserRole, Report } from './types.ts';
import { api } from './services/api.real';
import { LogoIcon, MenuIcon, XIcon, SpinnerIcon, PreachIcon, PrayerGroupIcon, DocumentTextIcon, BookOpenIcon, SpeakerphoneIcon, EyeIcon, EyeOffIcon } from './components/icons.tsx';
import ReportForm from './components/ReportForm.tsx';
import Dashboard from './components/Dashboard.tsx';
import UsersPage from './components/UsersPage.tsx';
import ManagementPage from './components/ManagementPage.tsx';
import ResourcesPage from './components/ResourcesPage.tsx';
import RegisterPage from './components/RegisterPage.tsx';
import TeamPage from './components/TeamPage.tsx';
import PublicPage from './components/PublicPage.tsx';
import CommunicationPage from './components/CommunicationPage.tsx';
import PasswordResetRequestPage from './components/PasswordResetRequestPage.tsx';
import PasswordResetPage from './components/PasswordResetPage.tsx';
import AdminResetLinkPage from './components/AdminResetLinkPage.tsx';
import CellGrowthStatsPage from './components/CellGrowthStatsPage.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { ToastProvider, useToast } from './contexts/ToastContext.tsx';

// --- Layout Components ---
const Navbar = () => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
            showToast('Déconnexion réussie', 'success');
            navigate('/');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            showToast('Erreur lors de la déconnexion', 'error');
        }
    };
    
    const baseLinkClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
    const activeLinkClass = "bg-blue-800 text-white";
    const inactiveLinkClass = "text-blue-100 hover:bg-blue-600 hover:text-white";

    const NavLinks = ({ isMobile }: {isMobile?: boolean}) => {
      const linkClasses = `${baseLinkClass} ${isMobile ? 'block w-full text-left mt-1' : 'inline-block'}`;
      return (
        <>
          <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `${linkClasses} ${isActive && !isMobile ? activeLinkClass : inactiveLinkClass}`}>Accueil</NavLink>
          {user && (
            <>
              <NavLink to="/rapport" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Rapport</NavLink>
              <NavLink to="/admin" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Tableau de bord</NavLink>
              {user.role === UserRole.NATIONAL_COORDINATOR && (
                <>
                  <NavLink to="/users" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Utilisateurs</NavLink>
                  <NavLink to="/admin-reset-link" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Réinitialisation MDP</NavLink>
                </>
              )}
              {user.role !== UserRole.CELL_LEADER && (
                <NavLink to="/management" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Gestion</NavLink>
              )}
              {user && (
                <NavLink to="/cell-growth" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Évolution Cellules</NavLink>
              )}
              {(user.role === UserRole.REGIONAL_PASTOR || user.role === UserRole.GROUP_PASTOR || user.role === UserRole.DISTRICT_PASTOR) && (
                <NavLink to="/team" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Mon Équipe</NavLink>
              )}
            </>
          )}
          {user ? (
            <button onClick={handleLogout} className={`${linkClasses} ${inactiveLinkClass}`}>Déconnexion</button>
          ) : (
             <>
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Connexion</NavLink>
                <NavLink to="/register" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>S'inscrire</NavLink>
             </>
          )}
        </>
      )
    };

    return (
        <header className="bg-blue-700 text-white shadow-md sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
                        <LogoIcon className="h-8 w-8" />
                    </Link>
                    <div className="hidden md:flex items-center space-x-1">
                       <NavLinks />
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Ouvrir le menu">
                            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
                 {isMenuOpen && (
                    <div className="md:hidden pb-4">
                        <NavLinks isMobile />
                    </div>
                )}
            </div>
        </header>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-gray-800 text-white mt-auto">
        <div className="px-6 py-4 text-center text-sm">
            &copy; {new Date().getFullYear()} Ministère de la Vie Chrétienne Profonde au BENIN. Tous droits réservés.
        </div>
    </footer>
);

// --- Page Components ---
const HomePage: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Partie gauche - Image Unsplash */}
                <div className="md:w-1/2 relative">
                    <img 
                        src="./accueil.png" 
                        alt="Groupe d'étude biblique" 
                        className="w-full h-64 md:h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-8">
                        <div className="text-white">
                            <h2 className="text-3xl font-bold mb-2">Bienvenue</h2>
                            <p className="text-blue-100">Les cellules de maison, la croissance de l'Église.</p>
                        </div>
                    </div>
                </div>

                {/* Partie droite - Contenu */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <LogoIcon className="h-20 w-20 mx-auto mb-6 text-blue-700" />
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-3 text-center">
                            Ministère de la Vie Chrétienne Profonde
                        </h1>
                        {/* <p className="text-lg text-gray-600 mb-8 text-center">
                            MVCP-BENIN
                        </p> */}

                        {/* Boutons d'action */}
                        <div className="space-y-4">
                            {user ? (
                                <>
                                    <Link 
                                        to="/rapport" 
                                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2"
                                    >
                                        <DocumentTextIcon className="h-5 w-5" />
                                        <span>Soumettre un Rapport</span>
                                    </Link>
                                    
                                    {/* Call to action pour utilisateurs connectés */}
                                    <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                                            Prêt à soumettre votre rapport ?
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            La soumission régulière des rapports est essentielle pour le suivi et la croissance de nos cellules.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/login" 
                                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center"
                                    >
                                        Connexion
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center"
                                    >
                                        S'inscrire
                                    </Link>
                                    
                                    {/* Message de bienvenue pour visiteurs */}
                                    <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                        <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center">
                                            <BookOpenIcon className="h-5 w-5 mr-2 text-blue-600" />
                                            Notre Mission
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Atteindre les âmes pour Christ à travers les cellules de maison. Rejoignez-nous dans cette mission de croissance spirituelle et de communion fraternelle.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Section informative */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <PrayerGroupIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                                    <p className="text-xs font-semibold text-gray-700">Cellules de Maison</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <PreachIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                                    <p className="text-xs font-semibold text-gray-700">Évangélisation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ReportPage: React.FC = () => <ReportForm />;

const LoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Déterminer la page de redirection par défaut selon le rôle
    const getDefaultRedirect = (userRole?: UserRole) => {
        if (!userRole) return "/";
        
        switch (userRole) {
            case UserRole.CELL_LEADER:
                return "/rapport";
            case UserRole.NATIONAL_COORDINATOR:
                return "/admin";
            case UserRole.REGIONAL_PASTOR:
            case UserRole.GROUP_PASTOR:
            case UserRole.DISTRICT_PASTOR:
                return "/management";
            default:
                return "/";
        }
    };

    // Vérifie si une route est autorisée pour un rôle donné
    const isRouteAllowedForRole = (path: string, userRole?: UserRole): boolean => {
        if (!userRole || !path) return false;
        
        // Routes interdites pour CELL_LEADER
        if (userRole === UserRole.CELL_LEADER) {
            const forbiddenRoutes = ['/management', '/team', '/admin', '/users', '/create-cell-leader'];
            return !forbiddenRoutes.includes(path);
        }
        
        // Routes réservées au NATIONAL_COORDINATOR
        if (path === '/admin' || path === '/users') {
            return userRole === UserRole.NATIONAL_COORDINATOR;
        }
        
        // Route /team réservée aux pasteurs (sauf CELL_LEADER)
        if (path === '/team') {
            return userRole === UserRole.REGIONAL_PASTOR || 
                   userRole === UserRole.GROUP_PASTOR || 
                   userRole === UserRole.DISTRICT_PASTOR;
        }
        
        // Toutes les autres routes sont autorisées (sauf celles déjà filtrées ci-dessus)
        return true;
    };

    useEffect(() => {
        if (user) {
            const from = location.state?.from?.pathname;
            const defaultRedirect = getDefaultRedirect(user.role);
            
            // Utiliser 'from' seulement si la route est autorisée pour le rôle
            const redirectTo = (from && isRouteAllowedForRole(from, user.role)) ? from : defaultRedirect;
            navigate(redirectTo, { replace: true });
        }
    }, [user, navigate, location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const loggedInUser = await login(identifier, password);
            const from = location.state?.from?.pathname;
            const defaultRedirect = getDefaultRedirect(loggedInUser.role);
            
            // Utiliser 'from' seulement si la route est autorisée pour le rôle
            const redirectTo = (from && isRouteAllowedForRole(from, loggedInUser.role)) ? from : defaultRedirect;
            navigate(redirectTo, { replace: true });
        } catch (err: any) {
            showToast(err.message || "Erreur de connexion.", 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate('/request-password-reset');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Partie gauche - Image Unsplash */}
                <div className="md:w-1/2 relative">
                    <img 
                        src="./login.jpg" 
                        alt="Groupe d'étude biblique" 
                        className="w-full h-64 md:h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-8">
                        <div className="text-white">
                            <h2 className="text-3xl font-bold mb-2">Connectez-vous</h2>
                            <p className="text-blue-100">Connectez-vous pour accéder à votre tableau de bord.</p>
                        </div>
                    </div>
                </div>

                {/* Partie droite - Formulaire de connexion */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <LogoIcon className="h-16 w-16 mx-auto mb-6 text-blue-700" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Connexion</h2>
                        <p className="text-gray-600 mb-8 text-center">Accédez à votre tableau de bord.</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email ou Numéro de téléphone
                                </label>
                                <input 
                                    type="text" 
                                    id="identifier" 
                                    value={identifier} 
                                    onChange={e => setIdentifier(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                    placeholder="Entrez votre email ou téléphone"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        id="password" 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                        placeholder="Entrez votre mot de passe"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <a 
                                    href="#" 
                                    onClick={handleForgotPassword} 
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Mot de passe oublié ?
                                </a>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center space-x-2 transition-all transform hover:scale-[1.02]"
                            >
                                {loading && <SpinnerIcon className="h-5 w-5"/>}
                                <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
                            </button>
                        </form>
                        
                        <p className="text-center text-sm text-gray-600 mt-6">
                            Vous n'avez pas de compte ? {' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center p-20"><SpinnerIcon className="h-16 w-16 text-blue-700"/></div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

// Protected route that also checks user role
const RoleProtectedRoute: React.FC<{ 
    children: React.ReactNode; 
    excludeRoles?: UserRole[];
    allowedRoles?: UserRole[];
}> = ({ children, excludeRoles = [], allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center p-20"><SpinnerIcon className="h-16 w-16 text-blue-700"/></div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If allowedRoles is specified, check if user's role is in the list
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // Check if user's role is in the excluded roles list
    if (excludeRoles.length > 0 && excludeRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// --- Main App Component ---
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-gray-100">
            <Navbar />

            <main className="px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
              <Routes>
                <Route path="/" element={<HomePage />} />
                {/* <Route path="/annonces" element={<PublicPage />} /> */}
                <Route path="/rapport" element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/request-password-reset" element={<PasswordResetRequestPage />} />
                <Route path="/reset-password" element={<PasswordResetPage />} />
                {/* <Route path="/communications" element={
                  <ProtectedRoute>
                    <CommunicationPage />
                  </ProtectedRoute>
                } /> */}
                {/* <Route path="/resources" element={
                  <ProtectedRoute>
                    <ResourcesPage />
                  </ProtectedRoute>
                } /> */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <RoleProtectedRoute allowedRoles={[UserRole.NATIONAL_COORDINATOR]}>
                    <UsersPage />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin-reset-link" element={
                  <RoleProtectedRoute allowedRoles={[UserRole.NATIONAL_COORDINATOR]}>
                    <AdminResetLinkPage />
                  </RoleProtectedRoute>
                } />
                <Route path="/management" element={
                  <RoleProtectedRoute excludeRoles={[UserRole.CELL_LEADER]}>
                    <ManagementPage />
                  </RoleProtectedRoute>
                } />
                <Route path="/cell-growth" element={
                  <ProtectedRoute>
                    <CellGrowthStatsPage />
                  </ProtectedRoute>
                } />
                <Route path="/team" element={
                  <ProtectedRoute>
                    <TeamPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;