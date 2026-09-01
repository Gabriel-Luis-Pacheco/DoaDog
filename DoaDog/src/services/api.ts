import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AdoptionRequest, AppPreferences, Dog, Donation, DonationCampaign, User, UserRole } from '../types';
import { getSensitiveItem, removeSensitiveItem, setSensitiveItem } from './localStorage';

type ServiceResult<T> = Promise<{ data: T; error: null | { message: string } }>;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333').replace(/\/+$/, '');
const API_TIMEOUT_MS = 15000;
const TOKEN_STORAGE_KEY = '@doadog:auth-token';
const USER_STORAGE_KEY = '@doadog:user';
const FAVORITE_DOGS_STORAGE_KEY = '@doadog:favorites:dogs';
const FAVORITE_CAMPAIGNS_STORAGE_KEY = '@doadog:favorites:campaigns';
const APP_PREFERENCES_STORAGE_KEY = '@doadog:preferences';

const defaultPreferences: AppPreferences = {
  urgentAlerts: true,
  preferredState: '',
  preferredCity: '',
};

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isAbortError(error: unknown) {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: init.signal ?? controller.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiError('Tempo esgotado ao comunicar com o servidor.', 0, 'REQUEST_TIMEOUT');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    await AsyncStorage.removeItem(key);
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function getStoredToken() {
  return getSensitiveItem(TOKEN_STORAGE_KEY);
}

async function setStoredSession(token: string, user: User) {
  await setSensitiveItem(TOKEN_STORAGE_KEY, token);
  await setSensitiveItem(USER_STORAGE_KEY, JSON.stringify(user));
}

async function clearStoredSession() {
  await removeSensitiveItem(TOKEN_STORAGE_KEY);
  await removeSensitiveItem(USER_STORAGE_KEY);
}

async function getPersistedUser(): Promise<User | null> {
  const raw = await getSensitiveItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    await removeSensitiveItem(USER_STORAGE_KEY);
    return null;
  }
}

async function apiRequest<T>(path: string, options: { method?: HttpMethod; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const token = options.auth === false ? null : await getStoredToken();
  const response = await fetchWithTimeout(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || 'Não foi possível completar a solicitação.';
    throw new ApiError(message, response.status, payload?.error?.code);
  }

  return payload as T;
}

function toUserRole(role?: string): UserRole {
  if (role === 'PROTECTOR') return 'protector';
  if (role === 'ONG') return 'ngo';
  if (role === 'PARTNER') return 'partner';
  if (role === 'ADMIN') return 'admin';
  return 'adopter';
}

function fromUserRole(role?: UserRole) {
  if (role === 'protector') return 'PROTECTOR';
  if (role === 'ngo') return 'ONG';
  if (role === 'partner') return 'PARTNER';
  return 'USER';
}

function toUser(payload: any): User {
  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: toUserRole(payload.role),
    phone: payload.profile?.phone,
    city: payload.profile?.city,
    state: payload.profile?.state,
    avatar_url: payload.profile?.avatarUrl,
    created_at: payload.createdAt,
    updated_at: payload.updatedAt,
  };
}

const sizeFromApi: Record<string, Dog['size']> = {
  SMALL: 'pequeno',
  MEDIUM: 'medio',
  LARGE: 'grande',
  UNKNOWN: 'nao_sei',
};

const sizeToApi: Record<Dog['size'], string> = {
  pequeno: 'SMALL',
  medio: 'MEDIUM',
  grande: 'LARGE',
  nao_sei: 'UNKNOWN',
};

const genderFromApi: Record<string, Dog['gender']> = {
  MALE: 'macho',
  FEMALE: 'femea',
  UNKNOWN: 'nao_sei',
};

const genderToApi: Record<Dog['gender'], string> = {
  macho: 'MALE',
  femea: 'FEMALE',
  nao_sei: 'UNKNOWN',
};

const ageFromApi: Record<string, Dog['age_range']> = {
  PUPPY: 'filhote',
  YOUNG: 'jovem',
  ADULT: 'adulto',
  SENIOR: 'idoso',
  UNKNOWN: 'adulto',
};

const ageToApi: Record<Dog['age_range'], string> = {
  filhote: 'PUPPY',
  jovem: 'YOUNG',
  adulto: 'ADULT',
  idoso: 'SENIOR',
};

const urgencyFromApi: Record<string, Dog['urgency_level']> = {
  LOW: 'baixa',
  MEDIUM: 'media',
  HIGH: 'alta',
  EMERGENCY: 'emergencia',
};

const urgencyToApi: Record<Dog['urgency_level'], string> = {
  baixa: 'LOW',
  media: 'MEDIUM',
  alta: 'HIGH',
  emergencia: 'EMERGENCY',
};

function campaignUrgencyFromApi(value?: string): DonationCampaign['urgency'] {
  if (value === 'LOW') return 'baixa';
  if (value === 'HIGH' || value === 'EMERGENCY') return 'alta';
  return 'media';
}

function campaignUrgencyToApi(value?: DonationCampaign['urgency']) {
  if (value === 'baixa') return 'LOW';
  if (value === 'alta') return 'HIGH';
  return 'MEDIUM';
}

function toDogStatus(status?: string): Dog['status'] {
  if (status === 'AVAILABLE') return 'disponivel_adocao';
  if (status === 'ADOPTED') return 'resgatado';
  return 'resgatado';
}

function fromDogStatus(status?: Dog['status']) {
  if (status === 'disponivel_adocao') return 'AVAILABLE';
  if (status === 'resgatado') return 'UNDER_ANALYSIS';
  return 'UNDER_ANALYSIS';
}

function isRemoteUrl(value?: string) {
  return !!value && /^https?:\/\//i.test(value);
}

function toDog(payload: any): Dog {
  const images = Array.isArray(payload.images) ? payload.images : [];
  const imageUrl = payload.imageUrl ? [payload.imageUrl] : [];

  return {
    id: payload.id,
    name: payload.name,
    description: payload.description,
    size: sizeFromApi[payload.size] || 'nao_sei',
    gender: genderFromApi[payload.gender] || 'nao_sei',
    age_range: ageFromApi[payload.ageRange] || 'adulto',
    status: toDogStatus(payload.status),
    urgency_level: urgencyFromApi[payload.urgencyLevel] || 'media',
    health_condition: payload.healthCondition || payload.specialNeeds,
    contact_name: payload.contactName,
    contact_info: payload.contactInfo,
    location: {
      address: payload.address,
      city: payload.city,
      state: payload.state,
    },
    images: [...images, ...imageUrl].filter(Boolean),
    user_id: payload.createdById,
    created_at: payload.createdAt,
    updated_at: payload.updatedAt,
    moderation_status: payload.moderationStatus,
    rejection_reason: payload.rejectionReason,
  } as Dog;
}

function fromDog(dogData: Omit<Dog, 'id' | 'created_at' | 'updated_at'> | Partial<Dog>) {
  const remoteImages = (dogData.images || []).filter(isRemoteUrl).map((url, index) => ({ url, sortOrder: index }));

  return {
    name: dogData.name || 'Nome desconhecido',
    description: dogData.description || 'Sem descrição informada.',
    ageRange: dogData.age_range ? ageToApi[dogData.age_range] : undefined,
    size: dogData.size ? sizeToApi[dogData.size] : undefined,
    gender: dogData.gender ? genderToApi[dogData.gender] : undefined,
    city: dogData.location?.city || '',
    state: dogData.location?.state || '',
    address: dogData.location?.address,
    imageUrl: remoteImages[0]?.url,
    images: remoteImages.length ? remoteImages : undefined,
    healthCondition: dogData.health_condition,
    contactName: dogData.contact_name,
    contactInfo: dogData.contact_info,
    status: fromDogStatus(dogData.status),
    urgencyLevel: dogData.urgency_level ? urgencyToApi[dogData.urgency_level] : undefined,
  };
}

function toCampaign(payload: any): DonationCampaign {
  return {
    id: payload.id,
    title: payload.title,
    help_type: helpTypeFromApi(payload.helpType),
    beneficiary_type: beneficiaryTypeFromApi(payload.beneficiaryType),
    beneficiary_name: payload.beneficiaryName,
    city: payload.city || '',
    state: payload.state || '',
    description: payload.description,
    goal_amount: Math.round((payload.goalAmountInCents || 0) / 100),
    collected_amount: Math.round((payload.currentAmountInCents || 0) / 100),
    urgency: campaignUrgencyFromApi(payload.urgencyLevel),
    pix_contact: '',
    image_uri: payload.imageUrl,
    status: payload.status,
    rejection_reason: payload.rejectionReason,
    created_at: payload.createdAt,
    updated_at: payload.updatedAt,
  };
}

function toAdoptionRequest(payload: any): AdoptionRequest {
  return {
    id: payload.id,
    dog_id: payload.dogId,
    dogId: payload.dogId,
    dog: payload.dog,
    user_id: payload.requesterId,
    requesterId: payload.requesterId,
    message: payload.message,
    status: payload.status,
    status_note: payload.statusNote,
    housing_type: payload.housingType,
    has_yard: payload.hasYard,
    has_other_pets: payload.hasOtherPets,
    experience: payload.experience,
    routine: payload.routine,
    family_agreement: payload.familyAgreement,
    responsibility_agreement: payload.responsibilityAgreement,
    user_name: payload.adopterName,
    user_email: payload.adopterEmail,
    user_phone: payload.adopterPhone,
    user_city: payload.adopterCity,
    user_state: payload.adopterState,
    created_at: payload.createdAt,
    updated_at: payload.updatedAt,
  };
}

function toDonation(payload: any): Donation {
  return {
    id: payload.id,
    campaign_id: payload.campaignId,
    campaign: payload.campaign,
    donor_user_id: payload.donorUserId,
    donor_name: payload.donorName,
    donor_email: payload.donorEmail,
    amount_in_cents: payload.amountInCents,
    status: payload.status,
    br_code: payload.brCode,
    br_code_base64: payload.brCodeBase64,
    external_payment_id: payload.externalPaymentId,
    expires_at: payload.expiresAt,
    paid_at: payload.paidAt,
    created_at: payload.createdAt,
    updated_at: payload.updatedAt,
  };
}

function helpTypeFromApi(value?: string): DonationCampaign['help_type'] {
  if (value === 'FOOD') return 'racao';
  if (value === 'TREATMENT') return 'tratamento';
  if (value === 'MEDICINE') return 'medicamentos';
  if (value === 'TRANSPORT') return 'transporte';
  if (value === 'TEMPORARY_HOME') return 'lar_temporario';
  return 'outros';
}

function helpTypeToApi(value?: DonationCampaign['help_type']) {
  if (value === 'racao') return 'FOOD';
  if (value === 'tratamento') return 'TREATMENT';
  if (value === 'medicamentos') return 'MEDICINE';
  if (value === 'transporte') return 'TRANSPORT';
  if (value === 'lar_temporario') return 'TEMPORARY_HOME';
  return 'OTHER';
}

function beneficiaryTypeFromApi(value?: string): DonationCampaign['beneficiary_type'] {
  if (value === 'ONG') return 'ong';
  if (value === 'PROTECTOR') return 'protetor';
  return 'cao';
}

function beneficiaryTypeToApi(value?: DonationCampaign['beneficiary_type']) {
  if (value === 'ong') return 'ONG';
  if (value === 'protetor') return 'PROTECTOR';
  return 'DOG';
}

function cents(value: number) {
  return Math.round(value * 100);
}

function normalizeError(error: unknown) {
  if (error instanceof ApiError && error.status === 0) {
    return { message: error.message };
  }

  return { message: error instanceof Error ? error.message : 'Erro inesperado.' };
}

export const authServices = {
  signUp: async (email: string, password: string, metadata: Partial<User>) => {
    try {
      const response = await apiRequest<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        auth: false,
        body: {
          email,
          password,
          name: metadata.name,
          role: fromUserRole(metadata.role),
          phone: metadata.phone,
          city: metadata.city,
          state: metadata.state,
        },
      });
      const user = toUser(response.user);
      await setStoredSession(response.token, user);
      return {
        data: {
          user,
          session: { user: { id: user.id }, token: response.token },
        },
        error: null,
      };
    } catch (error) {
      return { data: { user: null, session: null }, error: normalizeError(error) };
    }
  },
  signIn: async (email: string, password: string) => {
    try {
      const response = await apiRequest<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
      });
      const user = toUser(response.user);
      await setStoredSession(response.token, user);
      return {
        data: {
          user,
          session: { user: { id: user.id }, token: response.token },
        },
        error: null,
      };
    } catch (error) {
      return { data: { user: null, session: null }, error: normalizeError(error) };
    }
  },
  signOut: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Local sign-out must still work when the API is unreachable.
    }
    await clearStoredSession();
    return { error: null };
  },
  resetPassword: async (_email: string) => ({
    data: null,
    error: { message: 'Recuperação de senha será ativada quando houver serviço de e-mail configurado.' },
  }),
  getSession: async () => {
    const [token, user] = await Promise.all([getStoredToken(), getPersistedUser()]);
    return {
      data: { session: token && user ? { user: { id: user.id }, token } : null },
      error: null,
    };
  },
  getCurrentUser: async () => ({ data: { user: await getPersistedUser() }, error: null }),
};

export const userServices = {
  createProfile: async (userData: User): ServiceResult<User> => ({ data: userData, error: null }),
  getProfile: async (_userId: string): ServiceResult<User> => {
    try {
      const response = await apiRequest<{ user: any }>('/users/profile');
      const user = toUser(response.user);
      await setSensitiveItem(USER_STORAGE_KEY, JSON.stringify(user));
      return { data: user, error: null };
    } catch (error) {
      const fallback = await getPersistedUser();
      if (fallback) return { data: fallback, error: null };
      return { data: null as unknown as User, error: normalizeError(error) };
    }
  },
  updateProfile: async (_userId: string, updates: Partial<User>): ServiceResult<User> => {
    try {
      const response = await apiRequest<{ user: any }>('/users/profile', {
        method: 'PATCH',
        body: {
          name: updates.name,
          phone: updates.phone,
          city: updates.city,
          state: updates.state,
          avatarUrl: updates.avatar_url,
        },
      });
      const user = toUser(response.user);
      await setSensitiveItem(USER_STORAGE_KEY, JSON.stringify(user));
      return { data: user, error: null };
    } catch (error) {
      return { data: null as unknown as User, error: normalizeError(error) };
    }
  },
};

export const dogServices = {
  getAllDogs: async (): ServiceResult<Dog[]> => {
    try {
      const response = await apiRequest<{ data: any[] }>('/dogs/list?pageSize=50', { auth: false });
      return { data: response.data.map(toDog), error: null };
    } catch (error) {
      return { data: [], error: normalizeError(error) };
    }
  },
  getDogById: async (id: string): ServiceResult<Dog | null> => {
    try {
      const response = await apiRequest<{ dog: any }>(`/dogs/detail/${id}`, { auth: false });
      return { data: toDog(response.dog), error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
  createDog: async (dogData: Omit<Dog, 'id' | 'created_at' | 'updated_at'>): ServiceResult<Dog> => {
    try {
      const response = await apiRequest<{ dog: any }>('/dogs/create', {
        method: 'POST',
        body: fromDog(dogData),
      });
      return { data: toDog(response.dog), error: null };
    } catch (error) {
      return { data: null as unknown as Dog, error: normalizeError(error) };
    }
  },
  updateDog: async (id: string, updates: Partial<Dog>): ServiceResult<Dog | null> => {
    try {
      const response = await apiRequest<{ dog: any }>(`/dogs/update/${id}`, {
        method: 'PUT',
        body: fromDog(updates),
      });
      return { data: toDog(response.dog), error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
  deleteDog: async (id: string) => {
    try {
      await apiRequest(`/dogs/delete/${id}`, { method: 'DELETE' });
      return { error: null };
    } catch (error) {
      return { error: normalizeError(error) };
    }
  },
  getUrgentDogs: async (): ServiceResult<Dog[]> => {
    const { data, error } = await dogServices.getAllDogs();
    return { data: data.filter((dog) => dog.urgency_level === 'alta' || dog.urgency_level === 'emergencia'), error };
  },
  getAdoptionDogs: async (): ServiceResult<Dog[]> => {
    const { data, error } = await dogServices.getAllDogs();
    return { data: data.filter((dog) => dog.status === 'disponivel_adocao'), error };
  },
  getMyDogs: async (): ServiceResult<Dog[]> => {
    try {
      const response = await apiRequest<{ data: any[] }>('/dogs/my?pageSize=50');
      return { data: response.data.map(toDog), error: null };
    } catch (error) {
      return { data: [], error: normalizeError(error) };
    }
  },
};

async function toggleId(key: string, id: string): Promise<boolean> {
  const ids = await readJson<string[]>(key, []);
  const exists = ids.includes(id);
  const nextIds = exists ? ids.filter((itemId) => itemId !== id) : [id, ...ids];
  await writeJson(key, nextIds);
  return !exists;
}

export const favoriteServices = {
  getDogIds: async () => readJson<string[]>(FAVORITE_DOGS_STORAGE_KEY, []),
  getCampaignIds: async () => readJson<string[]>(FAVORITE_CAMPAIGNS_STORAGE_KEY, []),
  isDogFavorite: async (dogId: string) => {
    const ids = await readJson<string[]>(FAVORITE_DOGS_STORAGE_KEY, []);
    return ids.includes(dogId);
  },
  isCampaignFavorite: async (campaignId: string) => {
    const ids = await readJson<string[]>(FAVORITE_CAMPAIGNS_STORAGE_KEY, []);
    return ids.includes(campaignId);
  },
  toggleDog: async (dogId: string) => toggleId(FAVORITE_DOGS_STORAGE_KEY, dogId),
  toggleCampaign: async (campaignId: string) => toggleId(FAVORITE_CAMPAIGNS_STORAGE_KEY, campaignId),
  getFavoriteDogs: async (): ServiceResult<Dog[]> => {
    const [ids, dogs] = await Promise.all([readJson<string[]>(FAVORITE_DOGS_STORAGE_KEY, []), dogServices.getAllDogs()]);
    return { data: dogs.data.filter((dog) => ids.includes(dog.id)), error: dogs.error };
  },
  getFavoriteCampaigns: async (): ServiceResult<DonationCampaign[]> => {
    const [ids, campaigns] = await Promise.all([
      readJson<string[]>(FAVORITE_CAMPAIGNS_STORAGE_KEY, []),
      donationServices.getCampaigns(),
    ]);
    return { data: campaigns.data.filter((campaign) => ids.includes(campaign.id)), error: campaigns.error };
  },
};

export const preferenceServices = {
  getPreferences: async (): ServiceResult<AppPreferences> => ({
    data: await readJson<AppPreferences>(APP_PREFERENCES_STORAGE_KEY, defaultPreferences),
    error: null,
  }),
  updatePreferences: async (updates: Partial<AppPreferences>): ServiceResult<AppPreferences> => {
    const preferences = {
      ...defaultPreferences,
      ...(await readJson<AppPreferences>(APP_PREFERENCES_STORAGE_KEY, defaultPreferences)),
      ...updates,
    };
    await writeJson(APP_PREFERENCES_STORAGE_KEY, preferences);
    return { data: preferences, error: null };
  },
};

export const adoptionServices = {
  getRequests: async (): ServiceResult<AdoptionRequest[]> => {
    try {
      const response = await apiRequest<{ data: any[] }>('/adoption-requests/list?pageSize=50');
      return { data: response.data.map(toAdoptionRequest), error: null };
    } catch (error) {
      return { data: [], error: normalizeError(error) };
    }
  },
  createRequest: async (requestData: any) => {
    try {
      const response = await apiRequest<{ adoptionRequest: any }>('/adoption-requests/create', {
        method: 'POST',
        body: {
          dogId: requestData.dogId || requestData.dog_id,
          message: requestData.message || 'Tenho interesse em conversar sobre este cão.',
          housingType: requestData.housingType || 'Não informado',
          hasYard: !!requestData.hasYard,
          hasOtherPets: !!requestData.hasOtherPets,
          experience: requestData.experience || 'Não informado',
          routine: requestData.routine || 'Não informado',
          familyAgreement: requestData.familyAgreement ?? true,
          responsibilityAgreement: requestData.responsibilityAgreement ?? true,
          adopterName: requestData.user_name,
          adopterEmail: requestData.user_email,
          adopterPhone: requestData.user_phone,
          adopterCity: requestData.user_city,
          adopterState: requestData.user_state,
        },
      });
      return { data: toAdoptionRequest(response.adoptionRequest), error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
  updateStatus: async (
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'CANCELLED',
    statusNote?: string
  ): ServiceResult<AdoptionRequest> => {
    try {
      const response = await apiRequest<{ adoptionRequest: any }>(`/adoption-requests/update-status/${id}`, {
        method: 'PATCH',
        body: { status, statusNote },
      });
      return { data: toAdoptionRequest(response.adoptionRequest), error: null };
    } catch (error) {
      return { data: null as unknown as AdoptionRequest, error: normalizeError(error) };
    }
  },
};

export const storageServices = {
  uploadImage: async (file: { uri?: string }, _bucket: string = 'dog-images') => {
    if (!file.uri) {
      return { data: null, error: { message: 'Imagem invalida.' } };
    }

    try {
      const token = await getStoredToken();
      const extension = file.uri.split('.').pop()?.toLowerCase();
      const contentType =
        extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
      const formData = new FormData();

      formData.append('image', {
        uri: file.uri,
        name: `dog-${Date.now()}.${extension || 'jpg'}`,
        type: contentType,
      } as any);

      const response = await fetchWithTimeout(`${API_URL}/uploads/dog-images`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: payload?.error?.message || 'Não foi possível enviar a imagem.',
          },
        };
      }

      return { data: payload, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
  deleteImage: async (_fileName: string, _bucket: string = 'dog-images') => ({ error: null }),
};

export const partnerServices = {
  getPartners: async () => {
    try {
      const response = await apiRequest<{ data: any[] }>('/partners/list?pageSize=50', { auth: false });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: [], error: normalizeError(error) };
    }
  },
};

export const adminServices = {
  getModerationQueue: async (): ServiceResult<{
    dogs: Dog[];
    campaigns: DonationCampaign[];
    adoptionRequests: any[];
  }> => {
    try {
      const response = await apiRequest<{ dogs: any[]; campaigns: any[]; adoptionRequests: any[] }>('/admin/moderation?pageSize=50');
      return {
        data: {
          dogs: response.dogs.map(toDog),
          campaigns: response.campaigns.map(toCampaign),
          adoptionRequests: response.adoptionRequests,
        },
        error: null,
      };
    } catch (error) {
      return { data: { dogs: [], campaigns: [], adoptionRequests: [] }, error: normalizeError(error) };
    }
  },
  moderateDog: async (id: string, moderationStatus: 'APPROVED' | 'REJECTED', rejectionReason?: string): ServiceResult<Dog> => {
    try {
      const response = await apiRequest<{ dog: any }>(`/admin/moderation/dogs/${id}`, {
        method: 'PATCH',
        body: { moderationStatus, rejectionReason },
      });
      return { data: toDog(response.dog), error: null };
    } catch (error) {
      return { data: null as unknown as Dog, error: normalizeError(error) };
    }
  },
  moderateCampaign: async (
    id: string,
    status: 'ACTIVE' | 'REJECTED',
    rejectionReason?: string
  ): ServiceResult<DonationCampaign> => {
    try {
      const response = await apiRequest<{ campaign: any }>(`/admin/moderation/donation-campaigns/${id}`, {
        method: 'PATCH',
        body: { status, rejectionReason },
      });
      return { data: toCampaign(response.campaign), error: null };
    } catch (error) {
      return { data: null as unknown as DonationCampaign, error: normalizeError(error) };
    }
  },
};

export const donationServices = {
  getCampaigns: async (): ServiceResult<DonationCampaign[]> => {
    try {
      const response = await apiRequest<{ data: any[] }>('/donation-campaigns/list?pageSize=50', { auth: false });
      return { data: response.data.map(toCampaign), error: null };
    } catch (error) {
      return { data: [], error: normalizeError(error) };
    }
  },
  createCampaign: async (
    campaignData: Omit<DonationCampaign, 'id' | 'created_at' | 'updated_at'>
  ): ServiceResult<DonationCampaign> => {
    try {
      let imageUrl = isRemoteUrl(campaignData.image_uri) ? campaignData.image_uri : undefined;

      if (campaignData.image_uri && !imageUrl) {
        const upload = await storageServices.uploadImage({ uri: campaignData.image_uri }, 'campaign-images');
        if (upload.error) {
          throw new Error(upload.error.message);
        }

        imageUrl = upload.data?.publicUrl;
      }

      const response = await apiRequest<{ campaign: any }>('/donation-campaigns/create', {
        method: 'POST',
        body: {
          title: campaignData.title,
          description: campaignData.description,
          helpType: helpTypeToApi(campaignData.help_type),
          beneficiaryType: beneficiaryTypeToApi(campaignData.beneficiary_type),
          beneficiaryName: campaignData.beneficiary_name,
          city: campaignData.city,
          state: campaignData.state,
          imageUrl,
          goalAmountInCents: cents(campaignData.goal_amount),
          suggestedAmountInCents: 2500,
          urgencyLevel: campaignUrgencyToApi(campaignData.urgency),
        },
      });
      return { data: toCampaign(response.campaign), error: null };
    } catch (error) {
      return { data: null as unknown as DonationCampaign, error: normalizeError(error) };
    }
  },
  deleteCampaign: async (_id: string) => ({ error: { message: 'Exclusão de campanha exige moderação no MVP.' } }),
  create: async (donationData: any) => {
    try {
      const response = await apiRequest('/donations/create-pix', {
        method: 'POST',
        body: {
          campaignId: donationData.campaignId || donationData.campaign_id,
          amountInCents: donationData.amountInCents || cents(donationData.amount || 0),
          donorName: donationData.donorName || donationData.donor_name,
          donorEmail: donationData.donorEmail || donationData.donor_email,
        },
      });
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
  getByUserId: async (_userId: string): ServiceResult<Donation[]> => {
    try {
      const response = await apiRequest<{ data: any[] }>('/donations/my?pageSize=50');
      return { data: response.data.map(toDonation), error: null };
    } catch (error) {
      return { data: [], error: normalizeError(error) };
    }
  },
};
