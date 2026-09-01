import {
  AdoptionRequest,
  Dog,
  DogImage,
  Donation,
  DonationCampaign,
  Partner,
  User,
  UserProfile,
} from '@prisma/client';

type UserWithRelations = User & { profile?: UserProfile | null; passwordHash?: string };
type DogWithRelations = Dog & { images?: DogImage[] };
type DonationWithRelations = Donation & {
  campaign?: Pick<DonationCampaign, 'id' | 'title' | 'beneficiaryName' | 'city' | 'state'> | null;
};
type AdoptionRequestWithRelations = AdoptionRequest & {
  dog?: Pick<Dog, 'id' | 'name' | 'city' | 'state' | 'status' | 'createdById'> | null;
};

export function presentUser(user: UserWithRelations) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile
      ? {
          phone: user.profile.phone,
          city: user.profile.city,
          state: user.profile.state,
          avatarUrl: user.profile.avatarUrl,
          bio: user.profile.bio,
        }
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function presentDog(dog: DogWithRelations) {
  const images = dog.images?.sort((a, b) => a.sortOrder - b.sortOrder).map((image) => image.url) ?? [];

  return {
    id: dog.id,
    name: dog.name,
    description: dog.description,
    age: dog.age,
    ageRange: dog.ageRange,
    size: dog.size,
    gender: dog.gender,
    city: dog.city,
    state: dog.state,
    address: dog.address,
    imageUrl: dog.imageUrl,
    images,
    healthCondition: dog.healthCondition,
    vaccinated: dog.vaccinated,
    neutered: dog.neutered,
    specialNeeds: dog.specialNeeds,
    contactName: dog.contactName,
    contactInfo: dog.contactInfo,
    status: dog.status,
    moderationStatus: dog.moderationStatus,
    rejectionReason: dog.rejectionReason,
    urgencyLevel: dog.urgencyLevel,
    createdById: dog.createdById,
    adoptedAt: dog.adoptedAt,
    createdAt: dog.createdAt,
    updatedAt: dog.updatedAt,
  };
}

export function presentDonationCampaign(campaign: DonationCampaign) {
  return {
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    helpType: campaign.helpType,
    beneficiaryType: campaign.beneficiaryType,
    beneficiaryName: campaign.beneficiaryName,
    city: campaign.city,
    state: campaign.state,
    imageUrl: campaign.imageUrl,
    goalAmountInCents: campaign.goalAmountInCents,
    currentAmountInCents: campaign.currentAmountInCents,
    suggestedAmountInCents: campaign.suggestedAmountInCents,
    urgencyLevel: campaign.urgencyLevel,
    status: campaign.status,
    rejectionReason: campaign.rejectionReason,
    dogId: campaign.dogId,
    createdById: campaign.createdById,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
}

export function presentDonation(donation: DonationWithRelations) {
  return {
    id: donation.id,
    campaignId: donation.campaignId,
    campaign: donation.campaign
      ? {
          id: donation.campaign.id,
          title: donation.campaign.title,
          beneficiaryName: donation.campaign.beneficiaryName,
          city: donation.campaign.city,
          state: donation.campaign.state,
        }
      : undefined,
    donorUserId: donation.donorUserId,
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    amountInCents: donation.amountInCents,
    status: donation.status,
    externalPaymentId: donation.externalPaymentId,
    paymentProvider: donation.paymentProvider,
    brCode: donation.brCode,
    brCodeBase64: donation.brCodeBase64,
    expiresAt: donation.expiresAt,
    paidAt: donation.paidAt,
    createdAt: donation.createdAt,
    updatedAt: donation.updatedAt,
  };
}

export function presentPublicDonationStatus(donation: Donation) {
  return {
    id: donation.id,
    campaignId: donation.campaignId,
    amountInCents: donation.amountInCents,
    status: donation.status,
    expiresAt: donation.expiresAt,
    paidAt: donation.paidAt,
    createdAt: donation.createdAt,
    updatedAt: donation.updatedAt,
  };
}

export function presentAdoptionRequest(request: AdoptionRequestWithRelations) {
  return {
    id: request.id,
    dogId: request.dogId,
    dog: request.dog
      ? {
          id: request.dog.id,
          name: request.dog.name,
          city: request.dog.city,
          state: request.dog.state,
          status: request.dog.status,
          createdById: request.dog.createdById,
        }
      : undefined,
    requesterId: request.requesterId,
    message: request.message,
    housingType: request.housingType,
    hasYard: request.hasYard,
    hasOtherPets: request.hasOtherPets,
    experience: request.experience,
    routine: request.routine,
    familyAgreement: request.familyAgreement,
    responsibilityAgreement: request.responsibilityAgreement,
    adopterName: request.adopterName,
    adopterEmail: request.adopterEmail,
    adopterPhone: request.adopterPhone,
    adopterCity: request.adopterCity,
    adopterState: request.adopterState,
    status: request.status,
    statusNote: request.statusNote,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export function presentPartner(partner: Partner) {
  return {
    id: partner.id,
    name: partner.name,
    category: partner.category,
    city: partner.city,
    state: partner.state,
    description: partner.description,
    contactUrl: partner.contactUrl,
    contactEmail: partner.contactEmail,
    contactPhone: partner.contactPhone,
    socialUrl: partner.socialUrl,
    status: partner.status,
    createdById: partner.createdById,
    createdAt: partner.createdAt,
    updatedAt: partner.updatedAt,
  };
}
