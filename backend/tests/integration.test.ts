import assert from 'node:assert/strict';
import { AddressInfo } from 'node:net';
import test from 'node:test';
import { UserRole } from '@prisma/client';

const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === '1';
const password = 'Senha12345';

process.env.NODE_ENV ||= 'test';
process.env.JWT_SECRET ||= 'integration-secret-with-enough-length';
process.env.FRONTEND_URL ||= 'http://localhost:8081';
process.env.PAYMENT_PROVIDER ||= 'mock';
process.env.WEBHOOK_SECRET ||= 'integration-webhook-secret';

type Json = Record<string, any>;

test(
  'authenticated MVP flows enforce moderation, ownership and donation history',
  { skip: !runIntegrationTests },
  async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for integration tests.');
    }

    const { app } = await import('../src/app');
    const { prisma } = await import('../src/lib/prisma');
    const { hashPassword } = await import('../src/lib/password');

    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "admin_actions",
        "payment_events",
        "donations",
        "adoption_requests",
        "dog_images",
        "donation_campaigns",
        "dogs",
        "partners",
        "user_profiles",
        "users"
      RESTART IDENTITY CASCADE
    `);

    const server = app.listen(0);
    const baseUrl = await new Promise<string>((resolve) => {
      server.on('listening', () => {
        const address = server.address() as AddressInfo;
        resolve(`http://127.0.0.1:${address.port}`);
      });
    });

    try {
      const adminEmail = `admin-${Date.now()}@example.com`;
      await prisma.user.create({
        data: {
          name: 'Admin DoaDog',
          email: adminEmail,
          passwordHash: await hashPassword(password),
          role: UserRole.ADMIN,
        },
      });

      const admin = await post(baseUrl, '/auth/login', { email: adminEmail, password });
      const owner = await post(baseUrl, '/auth/register', {
        name: 'Protetora Teste',
        email: `owner-${Date.now()}@example.com`,
        password,
        role: 'protector',
        city: 'São Paulo',
        state: 'SP',
      });
      const adopter = await post(baseUrl, '/auth/register', {
        name: 'Adotante Teste',
        email: `adopter-${Date.now()}@example.com`,
        password,
        role: 'adopter',
        city: 'São Paulo',
        state: 'SP',
      });

      const dogResponse = await post(
        baseUrl,
        '/dogs/create',
        {
          name: 'Mel',
          description: 'Cão dócil aguardando adoção responsável.',
          ageRange: 'ADULT',
          size: 'MEDIUM',
          gender: 'FEMALE',
          city: 'São Paulo',
          state: 'SP',
          status: 'AVAILABLE',
          urgencyLevel: 'MEDIUM',
        },
        owner.token
      );
      assert.equal(dogResponse.status, 201);
      assert.equal(dogResponse.body.dog.moderationStatus, 'PENDING');

      const publicDogsBefore = await get(baseUrl, '/dogs/list');
      assert.equal(publicDogsBefore.body.data.some((dog: Json) => dog.id === dogResponse.body.dog.id), false);

      const nonAdminModeration = await patch(
        baseUrl,
        `/admin/moderation/dogs/${dogResponse.body.dog.id}`,
        { moderationStatus: 'APPROVED' },
        owner.token
      );
      assert.equal(nonAdminModeration.status, 403);

      const approvedDog = await patch(
        baseUrl,
        `/admin/moderation/dogs/${dogResponse.body.dog.id}`,
        { moderationStatus: 'APPROVED' },
        admin.token
      );
      assert.equal(approvedDog.status, 200);
      assert.equal(approvedDog.body.dog.moderationStatus, 'APPROVED');

      const publicDogsAfter = await get(baseUrl, '/dogs/list');
      assert.equal(publicDogsAfter.body.data.some((dog: Json) => dog.id === dogResponse.body.dog.id), true);

      const adoption = await post(
        baseUrl,
        '/adoption-requests/create',
        {
          dogId: dogResponse.body.dog.id,
          message: 'Quero conhecer a Mel e seguir o processo responsável.',
          housingType: 'Apartamento',
          hasYard: false,
          hasOtherPets: false,
          experience: 'Já cuidei de cães adultos.',
          routine: 'Trabalho de casa e faço passeios diários.',
          familyAgreement: true,
          responsibilityAgreement: true,
        },
        adopter.token
      );
      assert.equal(adoption.status, 201);

      const adopterCannotApprove = await patch(
        baseUrl,
        `/adoption-requests/update-status/${adoption.body.adoptionRequest.id}`,
        { status: 'APPROVED' },
        adopter.token
      );
      assert.equal(adopterCannotApprove.status, 403);

      const ownerApproves = await patch(
        baseUrl,
        `/adoption-requests/update-status/${adoption.body.adoptionRequest.id}`,
        { status: 'APPROVED', statusNote: 'Aprovada pelo responsável.' },
        owner.token
      );
      assert.equal(ownerApproves.status, 200);
      assert.equal(ownerApproves.body.adoptionRequest.status, 'APPROVED');

      const campaign = await post(
        baseUrl,
        '/donation-campaigns/create',
        {
          title: 'Tratamento da Mel',
          description: 'Campanha para consulta, exames e medicamentos.',
          helpType: 'TREATMENT',
          beneficiaryType: 'DOG',
          beneficiaryName: 'Mel',
          city: 'São Paulo',
          state: 'SP',
          goalAmountInCents: 50000,
          suggestedAmountInCents: 2500,
          dogId: dogResponse.body.dog.id,
        },
        owner.token
      );
      assert.equal(campaign.status, 201);
      assert.equal(campaign.body.campaign.status, 'PENDING');

      const activeCampaign = await patch(
        baseUrl,
        `/admin/moderation/donation-campaigns/${campaign.body.campaign.id}`,
        { status: 'ACTIVE' },
        admin.token
      );
      assert.equal(activeCampaign.status, 200);

      const donation = await post(
        baseUrl,
        '/donations/create-pix',
        {
          campaignId: campaign.body.campaign.id,
          amountInCents: 2500,
          donorName: 'Adotante Teste',
          donorEmail: adopter.body.user.email,
        },
        adopter.token
      );
      assert.equal(donation.status, 201);
      assert.equal(donation.body.donation.donorUserId, adopter.body.user.id);

      const myDonations = await get(baseUrl, '/donations/my', adopter.token);
      assert.equal(myDonations.status, 200);
      assert.equal(myDonations.body.data.length, 1);
      assert.equal(myDonations.body.data[0].id, donation.body.donation.id);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
      await prisma.$disconnect();
    }
  }
);

async function request(baseUrl: string, path: string, options: { method?: string; body?: unknown; token?: string } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

function get(baseUrl: string, path: string, token?: string) {
  return request(baseUrl, path, { token });
}

function post(baseUrl: string, path: string, body: unknown, token?: string) {
  return request(baseUrl, path, { method: 'POST', body, token });
}

function patch(baseUrl: string, path: string, body: unknown, token?: string) {
  return request(baseUrl, path, { method: 'PATCH', body, token });
}
