export type UserRole = 'visitor' | 'adopter' | 'user' | 'volunteer' | 'ngo' | 'protector' | 'partner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  state?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type DogSize = 'pequeno' | 'medio' | 'grande' | 'nao_sei';
export type DogGender = 'macho' | 'femea' | 'nao_sei';
export type DogStatus = 'em_situacao_rua' | 'precisa_lar_temporario' | 'resgatado' | 'disponivel_adocao';
export type UrgencyLevel = 'baixa' | 'media' | 'alta' | 'emergencia';
export type DogAgeRange = 'filhote' | 'jovem' | 'adulto' | 'idoso';

export interface Dog {
  id: string;
  name: string;
  description: string;
  size: DogSize;
  gender: DogGender;
  age_range: DogAgeRange;
  status: DogStatus;
  urgency_level: UrgencyLevel;
  health_condition?: string;
  contact_name?: string;
  contact_info?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    state?: string;
  };
  images: string[];
  user_id: string;
  organization_id?: string;
  moderation_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AdoptionRequest {
  id: string;
  dog_id: string;
  dogId?: string;
  requesterId?: string;
  dog?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    status?: string;
    createdById?: string;
  };
  user_id: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  status_note?: string;
  housing_type?: string;
  has_yard?: boolean;
  has_other_pets?: boolean;
  experience?: string;
  routine?: string;
  family_agreement?: boolean;
  responsibility_agreement?: boolean;
  user_name: string;
  user_email: string;
  user_phone?: string;
  user_city?: string;
  user_state?: string;
  created_at: string;
  updated_at: string;
}

export interface Volunteer {
  id: string;
  user_id: string;
  skills?: string;
  availability?: string;
  city?: string;
  state?: string;
  created_at: string;
}

export interface TemporaryHome {
  id: string;
  user_id: string;
  capacity: number;
  has_other_pets: boolean;
  has_yard: boolean;
  city: string;
  state: string;
  description?: string;
  created_at: string;
}

export type DonationUrgency = 'baixa' | 'media' | 'alta';
export type HelpType = 'racao' | 'tratamento' | 'medicamentos' | 'transporte' | 'lar_temporario' | 'outros';
export type BeneficiaryType = 'cao' | 'ong' | 'protetor';

export interface DonationCampaign {
  id: string;
  title: string;
  help_type: HelpType;
  beneficiary_type: BeneficiaryType;
  beneficiary_name: string;
  city: string;
  state: string;
  description: string;
  goal_amount: number;
  collected_amount: number;
  urgency: DonationUrgency;
  pix_contact: string;
  image_uri?: string;
  deadline?: string;
  status?: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'FINISHED' | 'CANCELLED';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  campaign_id: string;
  campaign?: {
    id: string;
    title: string;
    beneficiaryName?: string;
    city?: string;
    state?: string;
  };
  donor_user_id?: string;
  donor_name: string;
  donor_email: string;
  amount_in_cents: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | string;
  br_code?: string;
  br_code_base64?: string;
  external_payment_id?: string;
  expires_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DogFilters {
  size?: DogSize[];
  gender?: DogGender[];
  age_range?: DogAgeRange[];
  city?: string;
  state?: string;
  status?: DogStatus[];
}

export interface AppPreferences {
  urgentAlerts: boolean;
  preferredState: string;
  preferredCity: string;
}
