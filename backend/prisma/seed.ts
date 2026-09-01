import {
  BeneficiaryType,
  DogAgeRange,
  DogGender,
  DogSize,
  DogStatus,
  DonationCampaignStatus,
  HelpType,
  ModerationStatus,
  UrgencyLevel,
  UserRole,
} from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/password';

async function upsertUser(input: {
  email: string;
  name: string;
  role: UserRole;
  city: string;
  state: string;
  phone?: string;
}) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      role: input.role,
      profile: {
        upsert: {
          create: {
            city: input.city,
            state: input.state,
            phone: input.phone,
          },
          update: {
            city: input.city,
            state: input.state,
            phone: input.phone,
          },
        },
      },
    },
    create: {
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash: await hashPassword('Doadog12345'),
      profile: {
        create: {
          city: input.city,
          state: input.state,
          phone: input.phone,
        },
      },
    },
  });
}

async function main() {
  const admin = await upsertUser({
    email: 'admin@doadog.local',
    name: 'Admin DoaDog',
    role: UserRole.ADMIN,
    city: 'Sao Paulo',
    state: 'SP',
  });

  const protector = await upsertUser({
    email: 'protetor@doadog.local',
    name: 'Rede Protetora DoaDog',
    role: UserRole.PROTECTOR,
    city: 'Sao Paulo',
    state: 'SP',
    phone: '(11) 99999-0000',
  });

  const adopter = await upsertUser({
    email: 'adotante@doadog.local',
    name: 'Adotante DoaDog',
    role: UserRole.USER,
    city: 'Sao Paulo',
    state: 'SP',
    phone: '(11) 98888-0000',
  });

  const dog = await prisma.dog.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Caramelo',
      description: 'Cao docil resgatado por protetores locais e pronto para adocao responsavel.',
      ageRange: DogAgeRange.ADULT,
      size: DogSize.MEDIUM,
      gender: DogGender.MALE,
      city: 'Sao Paulo',
      state: 'SP',
      healthCondition: 'Vacinacao em acompanhamento e sem sinais de emergencia.',
      contactName: protector.name,
      contactInfo: protector.email,
      status: DogStatus.AVAILABLE,
      moderationStatus: ModerationStatus.APPROVED,
      urgencyLevel: UrgencyLevel.MEDIUM,
      createdById: protector.id,
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
      images: {
        create: {
          url: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
          sortOrder: 0,
        },
      },
    },
  });

  await prisma.donationCampaign.upsert({
    where: { id: '00000000-0000-4000-8000-000000000101' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000101',
      title: 'Tratamento do Caramelo',
      description: 'Campanha para consulta, exames e medicamentos do Caramelo.',
      helpType: HelpType.TREATMENT,
      beneficiaryType: BeneficiaryType.DOG,
      beneficiaryName: dog.name,
      city: dog.city,
      state: dog.state,
      goalAmountInCents: 50000,
      suggestedAmountInCents: 2500,
      status: DonationCampaignStatus.ACTIVE,
      dogId: dog.id,
      createdById: protector.id,
    },
  });

  await prisma.partner.upsert({
    where: { id: '00000000-0000-4000-8000-000000000201' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000201',
      name: 'Clinica Parceira DoaDog',
      category: 'Veterinaria',
      city: 'Sao Paulo',
      state: 'SP',
      description: 'Atendimento veterinario parceiro para casos encaminhados por protetores.',
      contactPhone: '(11) 97777-0000',
      createdById: admin.id,
    },
  });

  await prisma.adoptionRequest.upsert({
    where: { id: '00000000-0000-4000-8000-000000000301' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000301',
      dogId: dog.id,
      requesterId: adopter.id,
      message: 'Tenho interesse em conhecer o Caramelo e seguir o processo de adocao responsavel.',
      housingType: 'Apartamento com tela',
      hasYard: false,
      hasOtherPets: false,
      experience: 'Ja cuidei de caes adultos da familia.',
      routine: 'Trabalho hibrido e consigo manter passeios diarios.',
      familyAgreement: true,
      responsibilityAgreement: true,
      adopterName: adopter.name,
      adopterEmail: adopter.email,
      adopterPhone: '(11) 98888-0000',
      adopterCity: 'Sao Paulo',
      adopterState: 'SP',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
