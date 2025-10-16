import { 
  Report, 
  User, 
  UserRole, 
  PastorData, 
  Cell, 
  District, 
  Group, 
  Event, 
  Resource, 
  PrayerRequest, 
  Communication 
} from '../types';
import { httpClient, ApiResponse } from './httpClient';
import { API_CONFIG } from '../config/api.config';

// --- AUTHENTICATION ---
let currentUser: User | null = null;
const authCallbacks: Array<(user: User | null) => void> = [];

// Charger l'utilisateur depuis le localStorage au démarrage
const loadCurrentUser = () => {
  try {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      currentUser = JSON.parse(stored);
      authCallbacks.forEach(cb => cb(currentUser));
    }
  } catch (error) {
    console.error('Error loading current user:', error); 
  }
};

// Sauvegarder l'utilisateur dans le localStorage
const saveCurrentUser = (user: User | null) => {
  currentUser = user;
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
  authCallbacks.forEach(cb => cb(user));
};

// Initialiser au chargement
loadCurrentUser();

export const api = {
  // --- AUTHENTICATION ---
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    authCallbacks.push(callback);
    callback(currentUser);
    return () => {
      const index = authCallbacks.indexOf(callback);
      if (index > -1) authCallbacks.splice(index, 1);
    };
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await httpClient.post<any>(
        API_CONFIG.ENDPOINTS.LOGIN,
        { email, password }
      );
      
      // L'API retourne { access_token, user } au lieu de { success, data }
      if (response.access_token && response.user) {
        // Ajouter le token à l'objet user
        const userWithToken = {
          ...response.user,
          id: response.user._id || response.user.id,
          token: response.access_token
        };
        
        saveCurrentUser(userWithToken);
        return userWithToken;
      }
      
      // Format ApiResponse standard (au cas où)
      if (response.success && response.data) {        
        saveCurrentUser(response.data);
        return response.data;
      }
      
      // Si l'API retourne une erreur explicite, on la propage
      throw new Error(response.message || 'Email ou mot de passe incorrect');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Si c'est une HttpError (erreur HTTP de l'API)
      if (error.statusText) {
        throw new Error(error.statusText);
      }
      
      // Si l'erreur a déjà un message
      if (error.message) {
        throw error;
      }
      
      // Sinon, on affiche un message générique d'authentification
      throw new Error('Email ou mot de passe incorrect');
    }
  },

  logout: () => {
    saveCurrentUser(null);
    return Promise.resolve();
  },

  registerPastor: async (pastorData: PastorData): Promise<{ success: boolean; message: string }> => {
    try {
      // Le backend retourne directement l'objet User créé
      const response = await httpClient.post<User>(
        API_CONFIG.ENDPOINTS.REGISTER,
        pastorData
      );
      
      return {
        success: true,
        message: 'Inscription réussie. En attente d\'approbation.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'inscription'
      };
    }
  },

  resetPassword: async (email: string) => {
    try {
      await httpClient.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD, { email });
      return Promise.resolve();
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Erreur lors de la réinitialisation du mot de passe');
    }
  },

  // --- REPORT MANAGEMENT ---
  submitReport: async (report: Omit<Report, 'id' | 'submittedAt'>) => {
    try {
      // Le backend retourne directement l'objet Report, pas un ApiResponse
      const response = await httpClient.post<Report>(
        API_CONFIG.ENDPOINTS.REPORTS,
        report
      );
      
      return response;
    } catch (error) {
      console.error('Submit report error:', error);
      throw error;
    }
  },

  getReports: async (user: User, dateRange: { start: string; end: string }): Promise<Report[]> => {
    try {
      const params: Record<string, string> = {
        start: dateRange.start,
        end: dateRange.end,
      };

      // Ajouter des filtres selon le rôle
      if (user.role === UserRole.REGIONAL_PASTOR && user.region) {
        params.region = user.region;
      } else if (user.role === UserRole.GROUP_PASTOR && user.group) {
        params.group = user.group;
      } else if (user.role === UserRole.DISTRICT_PASTOR && user.district) {
        params.district = user.district;
      }

      console.log('📊 Récupération des rapports avec params:', params);
      
      // Le backend retourne directement un tableau de rapports
      const response = await httpClient.get<Report[]>(
        API_CONFIG.ENDPOINTS.REPORTS,
        params
      );
      
      console.log('📊 Rapports reçus de l\'API:', response?.length || 0, response);
      
      return response || [];
    } catch (error) {
      console.error('❌ Get reports error:', error);
      return [];
    }
  },

  deleteReport: async (reportId: string) => {
    try {
      await httpClient.delete(`${API_CONFIG.ENDPOINTS.REPORTS}/${reportId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Delete report error:', error);
      throw error;
    }
  },

  // --- PASTOR (USER) MANAGEMENT ---
  getPendingPastors: async (): Promise<User[]> => {
    try {
      // Le backend retourne directement un tableau d'utilisateurs
      const response = await httpClient.get<User[]>(
        API_CONFIG.ENDPOINTS.PENDING_PASTORS
      );
      return response || [];
    } catch (error) {
      console.error('Get pending pastors error:', error);
      return [];
    }
  },

  getPastors: async (): Promise<User[]> => {
    try {
      // Le backend retourne directement un tableau d'utilisateurs
      const response = await httpClient.get<User[]>(
        API_CONFIG.ENDPOINTS.USERS
      );
      return response || [];
    } catch (error) {
      console.error('Get pastors error:', error);
      return [];
    }
  },

  approvePastor: async (uid: string): Promise<void> => {
    try {
      await httpClient.post(`${API_CONFIG.ENDPOINTS.APPROVE_PASTOR}/${uid}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Approve pastor error:', error);
      throw error;
    }
  },

  addPastor: async (pastorData: PastorData) => {
    try {
      // Le backend retourne directement l'objet User, pas un ApiResponse
      const response = await httpClient.post<User>(
        API_CONFIG.ENDPOINTS.USERS,
        pastorData
      );
      
      return response;
    } catch (error) {
      console.error('Add pastor error:', error);
      throw error;
    }
  },

  updatePastor: async (uid: string, pastorData: PastorData) => {
    try {
      await httpClient.put(`${API_CONFIG.ENDPOINTS.USERS}/${uid}`, pastorData);
      return Promise.resolve();
    } catch (error) {
      console.error('Update pastor error:', error);
      throw error;
    }
  },

  deletePastor: async (uid: string) => {
    try {
      await httpClient.delete(`${API_CONFIG.ENDPOINTS.USERS}/${uid}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Delete pastor error:', error);
      throw error;
    }
  },

  // --- CELL MANAGEMENT ---
  getCellsForUser: async (user: User): Promise<Cell[]> => {
    try {
      const params: Record<string, string> = {};

      if (user.role === UserRole.REGIONAL_PASTOR && user.region) {
        params.region = user.region;
      } else if (user.role === UserRole.GROUP_PASTOR && user.group) {
        params.group = user.group;
      } else if (user.role === UserRole.DISTRICT_PASTOR && user.district) {
        params.district = user.district;
      }

      // Le backend retourne directement un tableau de cellules
      const response = await httpClient.get<Cell[]>(
        API_CONFIG.ENDPOINTS.CELLS,
        params
      );
      
      return response || [];
    } catch (error) {
      console.error('Get cells error:', error);
      return [];
    }
  },

  addCell: async (cellData: Omit<Cell, 'id'>): Promise<Cell> => {
    try {
      // Le backend retourne directement l'objet Cell, pas un ApiResponse
      const response = await httpClient.post<Cell>(
        API_CONFIG.ENDPOINTS.CELLS,
        cellData
      );
      
      return response;
    } catch (error) {
      console.error('Add cell error:', error);
      throw error;
    }
  },

  updateCell: async (cellId: string, cellData: Omit<Cell, 'id'>): Promise<void> => {
    try {
      await httpClient.put(`${API_CONFIG.ENDPOINTS.CELLS}/${cellId}`, cellData);
      return Promise.resolve();
    } catch (error) {
      console.error('Update cell error:', error);
      throw error;
    }
  },

  deleteCell: async (cellId: string): Promise<void> => {
    try {
      await httpClient.delete(`${API_CONFIG.ENDPOINTS.CELLS}/${cellId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Delete cell error:', error);
      throw error;
    }
  },

  // --- GROUP MANAGEMENT ---
  getGroups: async (region?: string): Promise<Group[]> => {
    try {
      const params = region ? { region } : undefined;
      // Le backend retourne directement un tableau de groupes
      const response = await httpClient.get<Group[]>(
        API_CONFIG.ENDPOINTS.GROUPS,
        params
      );
      
      return response || [];
    } catch (error) {
      console.error('Get groups error:', error);
      return [];
    }
  },

  addGroup: async (groupData: Omit<Group, 'id'>): Promise<Group> => {
    try {
      // Le backend retourne directement l'objet Group, pas un ApiResponse
      const response = await httpClient.post<Group>(
        API_CONFIG.ENDPOINTS.GROUPS,
        groupData
      );
      
      return response;
    } catch (error) {
      console.error('Add group error:', error);
      throw error;
    }
  },

  updateGroup: async (groupId: string, groupData: Omit<Group, 'id'>): Promise<void> => {
    try {
      await httpClient.put(`${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}`, groupData);
      return Promise.resolve();
    } catch (error) {
      console.error('Update group error:', error);
      throw error;
    }
  },

  deleteGroup: async (groupId: string): Promise<void> => {
    try {
      await httpClient.delete(`${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Delete group error:', error);
      throw error;
    }
  },

  // --- DISTRICT MANAGEMENT ---
  getDistricts: async (): Promise<District[]> => {
    try {
      // Le backend retourne directement un tableau de districts
      const response = await httpClient.get<District[]>(
        API_CONFIG.ENDPOINTS.DISTRICTS
      );
      
      return response || [];
    } catch (error) {
      console.error('Get districts error:', error);
      return [];
    }
  },

  addDistrict: async (districtData: Omit<District, 'id'>): Promise<District> => {
    try {
      // Le backend retourne directement l'objet District, pas un ApiResponse
      const response = await httpClient.post<District>(
        API_CONFIG.ENDPOINTS.DISTRICTS,
        districtData
      );
      
      return response;
    } catch (error) {
      console.error('Add district error:', error);
      throw error;
    }
  },

  updateDistrict: async (districtId: string, districtData: Omit<District, 'id'>): Promise<void> => {
    try {
      await httpClient.put(`${API_CONFIG.ENDPOINTS.DISTRICTS}/${districtId}`, districtData);
      return Promise.resolve();
    } catch (error) {
      console.error('Update district error:', error);
      throw error;
    }
  },

  deleteDistrict: async (districtId: string): Promise<void> => {
    try {
      await httpClient.delete(`${API_CONFIG.ENDPOINTS.DISTRICTS}/${districtId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Delete district error:', error);
      throw error;
    }
  },

  // --- EVENT MANAGEMENT ---
  getEvents: async (): Promise<Event[]> => {
    try {
      // Le backend retourne directement un tableau d'événements
      const response = await httpClient.get<Event[]>(
        API_CONFIG.ENDPOINTS.EVENTS
      );
      
      return response || [];
    } catch (error) {
      console.error('Get events error:', error);
      return [];
    }
  },

  getPublicEvents: async (): Promise<Event[]> => {
    try {
      // Le backend retourne directement un tableau d'événements
      const response = await httpClient.get<Event[]>(
        API_CONFIG.ENDPOINTS.PUBLIC_EVENTS
      );
      
      return response || [];
    } catch (error) {
      console.error('Get public events error:', error);
      return [];
    }
  },

  addEvent: async (eventData: Omit<Event, 'id'>): Promise<Event> => {
    try {
      // Le backend retourne directement l'objet Event, pas un ApiResponse
      const response = await httpClient.post<Event>(
        API_CONFIG.ENDPOINTS.EVENTS,
        eventData
      );
      
      return response;
    } catch (error) {
      console.error('Add event error:', error);
      throw error;
    }
  },

  updateEvent: async (eventId: string, eventData: Omit<Event, 'id'>): Promise<void> => {
    try {
      await httpClient.put(`${API_CONFIG.ENDPOINTS.EVENTS}/${eventId}`, eventData);
      return Promise.resolve();
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    }
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    try {
      await httpClient.delete(`${API_CONFIG.ENDPOINTS.EVENTS}/${eventId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  },

  // --- PUBLIC PAGE DATA ---
  setFeaturedTestimony: async (reportId: string): Promise<void> => {
    try {
      await httpClient.post(API_CONFIG.ENDPOINTS.FEATURED_TESTIMONY, { reportId });
      return Promise.resolve();
    } catch (error) {
      console.error('Set featured testimony error:', error);
      throw error;
    }
  },

  unfeatureTestimony: async (): Promise<void> => {
    try {
      await httpClient.delete(API_CONFIG.ENDPOINTS.FEATURED_TESTIMONY);
      return Promise.resolve();
    } catch (error) {
      console.error('Unfeature testimony error:', error);
      throw error;
    }
  },

  getFeaturedTestimony: async (): Promise<Report | null> => {
    try {
      // Le backend retourne directement un objet Report ou null
      const response = await httpClient.get<Report>(
        API_CONFIG.ENDPOINTS.FEATURED_TESTIMONY
      );
      
      return response || null;
    } catch (error) {
      console.error('Get featured testimony error:', error);
      return null;
    }
  },

  // --- PRAYER REQUEST MANAGEMENT ---
  getPrayerRequests: async (): Promise<PrayerRequest[]> => {
    try {
      // Le backend retourne directement un tableau de demandes de prière
      const response = await httpClient.get<PrayerRequest[]>(
        API_CONFIG.ENDPOINTS.PRAYER_REQUESTS
      );
      
      return response || [];
    } catch (error) {
      console.error('Get prayer requests error:', error);
      return [];
    }
  },

  addPrayerRequest: async (prayerData: Omit<PrayerRequest, 'id' | 'createdAt'>): Promise<PrayerRequest> => {
    try {
      // Le backend retourne directement l'objet PrayerRequest, pas un ApiResponse
      const response = await httpClient.post<PrayerRequest>(
        API_CONFIG.ENDPOINTS.PRAYER_REQUESTS,
        prayerData
      );
      
      return response;
    } catch (error) {
      console.error('Add prayer request error:', error);
      throw error;
    }
  },

  updatePrayerRequestStatus: async (requestId: string, status: 'pending' | 'praying' | 'answered'): Promise<void> => {
    try {
      await httpClient.patch(`${API_CONFIG.ENDPOINTS.PRAYER_REQUESTS}/${requestId}`, { status });
      return Promise.resolve();
    } catch (error) {
      console.error('Update prayer request status error:', error);
      throw error;
    }
  },

  deletePrayerRequest: async (requestId: string): Promise<void> => {
    try {
      await httpClient.delete(`${API_CONFIG.ENDPOINTS.PRAYER_REQUESTS}/${requestId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Delete prayer request error:', error);
      throw error;
    }
  },

  // --- RESOURCE MANAGEMENT ---
  getResources: async (): Promise<Resource[]> => {
    try {
      // Le backend retourne directement un tableau de ressources
      const response = await httpClient.get<Resource[]>(
        API_CONFIG.ENDPOINTS.RESOURCES
      );
      
      return response || [];
    } catch (error) {
      console.error('Get resources error:', error);
      return [];
    }
  },

  addResource: async (resource: Omit<Resource, 'id' | 'uploadedAt'>): Promise<Resource> => {
    try {
      // Le backend retourne directement l'objet Resource, pas un ApiResponse
      const response = await httpClient.post<Resource>(
        API_CONFIG.ENDPOINTS.RESOURCES,
        resource
      );
      
      return response;
    } catch (error) {
      console.error('Add resource error:', error);
      throw error;
    }
  },

  deleteResource: async (resourceId: string): Promise<void> => {
    try {
      await httpClient.delete(`${API_CONFIG.ENDPOINTS.RESOURCES}/${resourceId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Delete resource error:', error);
      throw error;
    }
  },

  // --- COMMUNICATION MANAGEMENT ---
  getPublishedCommunications: async (user: User): Promise<Communication[]> => {
    try {
      const params: Record<string, string> = { status: 'publié' };
      
      if (user.role === UserRole.REGIONAL_PASTOR && user.region) {
        params.region = user.region;
      }

      // Le backend retourne directement un tableau de communications
      const response = await httpClient.get<Communication[]>(
        API_CONFIG.ENDPOINTS.COMMUNICATIONS,
        params
      );
      
      return response || [];
    } catch (error) {
      console.error('Get published communications error:', error);
      return [];
    }
  },

  getPendingCommunications: async (): Promise<Communication[]> => {
    try {
      // Le backend retourne directement un tableau de communications
      const response = await httpClient.get<Communication[]>(
        API_CONFIG.ENDPOINTS.PENDING_COMMUNICATIONS
      );
      
      return response || [];
    } catch (error) {
      console.error('Get pending communications error:', error);
      return [];
    }
  },

  getMyProposals: async (user: User): Promise<Communication[]> => {
    try {
      // Le backend retourne directement un tableau de communications
      const response = await httpClient.get<Communication[]>(
        API_CONFIG.ENDPOINTS.MY_PROPOSALS
      );
      
      return response || [];
    } catch (error) {
      console.error('Get my proposals error:', error);
      return [];
    }
  },

  addCommunication: async (
    commData: Omit<Communication, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'status'>,
    author: User
  ): Promise<Communication> => {
    try {
      // Le backend retourne directement l'objet Communication, pas un ApiResponse
      const response = await httpClient.post<Communication>(
        API_CONFIG.ENDPOINTS.COMMUNICATIONS,
        { ...commData, authorId: author.uid, authorName: author.name }
      );
      
      return response;
    } catch (error) {
      console.error('Add communication error:', error);
      throw error;
    }
  },

  updateCommunicationStatus: async (commId: string, status: 'publié' | 'rejeté'): Promise<void> => {
    try {
      await httpClient.patch(`${API_CONFIG.ENDPOINTS.COMMUNICATIONS}/${commId}`, { status });
      return Promise.resolve();
    } catch (error) {
      console.error('Update communication status error:', error);
      throw error;
    }
  },

  deleteCommunication: async (commId: string, user: User): Promise<void> => {
    try {
      await httpClient.delete(`${API_CONFIG.ENDPOINTS.COMMUNICATIONS}/${commId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Delete communication error:', error);
      throw error;
    }
  },
};
