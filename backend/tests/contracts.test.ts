import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DogAgeRange,
  DogGender,
  DogSize,
  DogStatus,
  DonationCampaignStatus,
  DonationStatus,
  ModerationStatus,
  PaymentProviderName,
  UrgencyLevel,
  UserRole,
} from '@prisma/client';
import { moderateCampaignSchema, moderateDogSchema } from '../src/modules/admin/admin.schemas';
import { createAdoptionRequestSchema } from '../src/modules/adoptionRequests/adoptionRequests.schemas';
import { loginSchema, registerSchema } from '../src/modules/auth/auth.schemas';
import { createDogSchema } from '../src/modules/dogs/dogs.schemas';
import { createPixDonationSchema } from '../src/modules/donations/donations.schemas';
import { MockPixProvider } from '../src/modules/payments/mock-pix.provider';
import { presentPublicDonationStatus } from '../src/utils/presenters';

const uuid = '11111111-1111-4111-8111-111111111111';

test('auth schemas accept public roles and block admin self-registration', () => {
  const parsed = registerSchema.parse({
    body: {
      name: ' Ana Protetora ',
      email: 'ana@example.com',
      password: 'password123',
      role: 'protector',
      state: 'sp',
    },
  });

  assert.equal(parsed.body.name, 'Ana Protetora');
  assert.equal(parsed.body.role, UserRole.PROTECTOR);
  assert.equal(parsed.body.state, 'SP');

  assert.throws(() =>
    registerSchema.parse({
      body: {
        name: 'Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'ADMIN',
      },
    })
  );
});

test('login schema rejects empty passwords', () => {
  assert.throws(() =>
    loginSchema.parse({
      body: {
        email: 'user@example.com',
        password: '',
      },
    })
  );
});

test('dog creation schema normalizes location and strips moderation fields', () => {
  const parsed = createDogSchema.parse({
    body: {
      name: 'Mel',
      description: 'Cão dócil aguardando adoção responsável.',
      city: 'São Paulo',
      state: 'sp',
      size: DogSize.MEDIUM,
      gender: DogGender.FEMALE,
      ageRange: DogAgeRange.ADULT,
      status: DogStatus.AVAILABLE,
      urgencyLevel: UrgencyLevel.MEDIUM,
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  assert.equal(parsed.body.state, 'SP');
  assert.equal(parsed.body.status, DogStatus.AVAILABLE);
  assert.equal('moderationStatus' in parsed.body, false);
});

test('adoption request schema requires interview answers and normalizes state', () => {
  const parsed = createAdoptionRequestSchema.parse({
    body: {
      dogId: uuid,
      message: 'Quero conhecer melhor o cão e seguir o processo responsável.',
      housingType: 'Apartamento',
      experience: 'Já cuidei de cães adultos.',
      routine: 'Trabalho de casa e faço passeios diários.',
      familyAgreement: true,
      responsibilityAgreement: true,
      adopterState: 'rj',
    },
  });

  assert.equal(parsed.body.hasYard, false);
  assert.equal(parsed.body.hasOtherPets, false);
  assert.equal(parsed.body.adopterState, 'RJ');

  assert.throws(() =>
    createAdoptionRequestSchema.parse({
      body: {
        dogId: uuid,
        message: 'Mensagem suficiente',
        housingType: 'Casa',
        experience: 'Tenho experiência.',
        routine: 'Rotina estável.',
      },
    })
  );
});

test('pix donation schema enforces minimum amount and donor identity', () => {
  const parsed = createPixDonationSchema.parse({
    params: { campaignId: uuid },
    body: {
      amountInCents: '2500',
      donorName: 'Maria',
      donorEmail: 'maria@example.com',
    },
  });

  assert.equal(parsed.body.amountInCents, 2500);

  assert.throws(() =>
    createPixDonationSchema.parse({
      params: {},
      body: {
        amountInCents: 50,
        donorName: 'M',
        donorEmail: 'email-invalido',
      },
    })
  );
});

test('admin moderation schemas accept only controlled statuses', () => {
  const dogModeration = moderateDogSchema.parse({
    params: { id: uuid },
    body: {
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  assert.equal(dogModeration.body.moderationStatus, ModerationStatus.APPROVED);

  const campaignModeration = moderateCampaignSchema.parse({
    params: { id: uuid },
    body: {
      status: DonationCampaignStatus.ACTIVE,
    },
  });

  assert.equal(campaignModeration.body.status, DonationCampaignStatus.ACTIVE);

  assert.throws(() =>
    moderateDogSchema.parse({
      params: { id: uuid },
      body: { moderationStatus: 'PUBLIC' },
    })
  );
});

test('mock pix provider returns traceable payment data without real provider calls', async () => {
  const provider = new MockPixProvider();
  const result = await provider.createPixPayment({
    amountInCents: 2750,
    donorName: 'Doador Teste',
    donorEmail: 'doador@example.com',
    campaignId: uuid,
    campaignTitle: 'Tratamento da Mel',
  });

  assert.equal(provider.getProviderName(), PaymentProviderName.MOCK);
  assert.match(result.externalPaymentId, /^mock_/);
  assert.match(result.brCode, /27\.50/);
  assert.match(result.brCode, new RegExp(uuid));
  assert.equal(Buffer.from(result.brCodeBase64, 'base64').toString('utf8').startsWith('MOCK_PIX:'), true);
  assert.ok(result.expiresAt.getTime() > Date.now());
});

test('public donation status presenter does not expose donor or payment secrets', () => {
  const publicStatus = presentPublicDonationStatus({
    id: uuid,
    campaignId: uuid,
    donorUserId: uuid,
    donorName: 'Doador Privado',
    donorEmail: 'doador@example.com',
    amountInCents: 2500,
    status: DonationStatus.PENDING,
    externalPaymentId: 'payment_123',
    paymentProvider: PaymentProviderName.MOCK,
    brCode: 'pix-copy-and-paste',
    brCodeBase64: 'base64-pix',
    expiresAt: new Date('2026-01-01T00:30:00.000Z'),
    paidAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  assert.equal('donorName' in publicStatus, false);
  assert.equal('donorEmail' in publicStatus, false);
  assert.equal('externalPaymentId' in publicStatus, false);
  assert.equal('brCode' in publicStatus, false);
  assert.equal(publicStatus.status, DonationStatus.PENDING);
});

test('upload helpers validate magic bytes instead of trusting only client mime type', async () => {
  process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_SECRET ||= 'test-secret-with-enough-length';

  const { detectImageType } = await import('../src/modules/uploads/uploads.controller');
  const fakeImage = Buffer.from('not really an image');
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

  assert.equal(detectImageType(fakeImage), null);
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xdb]))?.contentType, 'image/jpeg');
  assert.equal(detectImageType(pngHeader)?.contentType, 'image/png');
  assert.equal(detectImageType(Buffer.from('RIFFxxxxWEBP', 'ascii'))?.contentType, 'image/webp');
});

test('upload helpers strip common image metadata chunks', async () => {
  process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_SECRET ||= 'test-secret-with-enough-length';

  const { detectImageType, stripImageMetadata } = await import('../src/modules/uploads/uploads.controller');
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', Buffer.alloc(13)),
    pngChunk('tEXt', Buffer.from('Author\0DoaDog')),
    pngChunk('IDAT', Buffer.from([1, 2, 3])),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  const type = detectImageType(png);
  assert.ok(type);

  const stripped = stripImageMetadata(png, type);
  assert.equal(stripped.includes(Buffer.from('tEXt')), false);
  assert.equal(stripped.includes(Buffer.from('IHDR')), true);
  assert.equal(stripped.includes(Buffer.from('IDAT')), true);
});

test('authorization middlewares protect admin and role-only paths', async () => {
  process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_SECRET ||= 'test-secret-with-enough-length';

  const { requireAdmin, requireRoles } = await import('../src/middlewares/auth.middleware');
  const adminNextCalls: unknown[] = [];
  requireAdmin({ user: { id: uuid, role: UserRole.USER } } as any, {} as any, (error?: unknown) => adminNextCalls.push(error));

  assert.equal(adminNextCalls.length, 1);
  assert.equal((adminNextCalls[0] as any).statusCode, 403);

  const roleNextCalls: unknown[] = [];
  requireRoles(UserRole.PROTECTOR, UserRole.ONG)({ user: { id: uuid, role: UserRole.PARTNER } } as any, {} as any, (error?: unknown) =>
    roleNextCalls.push(error)
  );

  assert.equal(roleNextCalls.length, 1);
  assert.equal((roleNextCalls[0] as any).statusCode, 403);

  const allowedCalls: unknown[] = [];
  requireRoles(UserRole.PROTECTOR)({ user: { id: uuid, role: UserRole.PROTECTOR } } as any, {} as any, (error?: unknown) =>
    allowedCalls.push(error)
  );

  assert.equal(allowedCalls.length, 1);
  assert.equal(allowedCalls[0], undefined);
});

test('optional auth middleware allows anonymous donation creation paths', async () => {
  process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_SECRET ||= 'test-secret-with-enough-length';

  const { optionalAuthMiddleware } = await import('../src/middlewares/auth.middleware');
  const req = {
    header: () => undefined,
  } as any;
  const nextCalls: unknown[] = [];

  await optionalAuthMiddleware(req, {} as any, (error?: unknown) => nextCalls.push(error));

  assert.equal(nextCalls.length, 1);
  assert.equal(nextCalls[0], undefined);
  assert.equal(req.user, undefined);
});

test('webhook signature helper validates Abacate Pay HMAC signatures', async () => {
  process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_SECRET ||= 'test-secret-with-enough-length';

  const { isValidWebhookSignature } = await import('../src/modules/webhooks/webhooks.controller');
  const rawBody = Buffer.from(JSON.stringify({ event: 'billing.paid', id: 'evt_1' }));
  const secret = 'webhook-secret';
  const signature = createHmac('sha256', secret).update(rawBody).digest('hex');

  assert.equal(isValidWebhookSignature(rawBody, signature, secret), true);
  assert.equal(isValidWebhookSignature(rawBody, `sha256=${signature}`, secret), true);
  assert.equal(isValidWebhookSignature(rawBody, signature.replace(/a/g, 'b'), secret), false);
  assert.equal(isValidWebhookSignature(rawBody, 'not-a-signature', secret), false);
});

function pngChunk(type: string, data: Buffer) {
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, 'ascii');
  data.copy(chunk, 8);
  chunk.writeUInt32BE(0, 8 + data.length);
  return chunk;
}
