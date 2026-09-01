import { Request, Response } from 'express';
import { ModerationStatus, Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { forbidden, notFound } from '../../utils/errors';
import { presentDog } from '../../utils/presenters';
import { createDogSchema, dogIdSchema, dogListSchema, updateDogSchema } from './dogs.schemas';

function canManageDog(userId: string, role: UserRole, createdById: string) {
  return role === UserRole.ADMIN || userId === createdById;
}

function canModerateDog(role: UserRole) {
  return role === UserRole.ADMIN;
}

function makeDogWhere(query: ReturnType<typeof dogListSchema.parse>['query'], onlyPublic = true): Prisma.DogWhereInput {
  const search = query.search;

  return {
    deletedAt: null,
    moderationStatus: onlyPublic ? ModerationStatus.APPROVED : query.moderationStatus,
    city: query.city,
    state: query.state,
    size: query.size,
    gender: query.gender,
    ageRange: query.ageRange,
    status: query.status,
    OR: search
      ? [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ]
      : undefined,
  };
}

export const listDogs = asyncHandler(async (req: Request, res: Response) => {
  const { query } = dogListSchema.parse(req);
  const where = makeDogWhere(query, true);
  const skip = (query.page - 1) * query.pageSize;

  const [dogs, total] = await Promise.all([
    prisma.dog.findMany({
      where,
      include: { images: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.pageSize,
    }),
    prisma.dog.count({ where }),
  ]);

  res.json({
    data: dogs.map(presentDog),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  });
});

export const listMyDogs = [
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { query } = dogListSchema.parse(req);
    const where: Prisma.DogWhereInput = {
      ...makeDogWhere(query, false),
      createdById: req.user!.id,
    };
    const skip = (query.page - 1) * query.pageSize;

    const [dogs, total] = await Promise.all([
      prisma.dog.findMany({
        where,
        include: { images: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      prisma.dog.count({ where }),
    ]);

    res.json({
      data: dogs.map(presentDog),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    });
  }),
];

export const getDog = asyncHandler(async (req: Request, res: Response) => {
  const { params } = dogIdSchema.parse(req);
  const dog = await prisma.dog.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { images: true },
  });

  if (!dog || dog.moderationStatus !== ModerationStatus.APPROVED) {
    throw notFound('Dog not found.');
  }

  res.json({ dog: presentDog(dog) });
});

export const createDog = [
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { body } = createDogSchema.parse(req);
    const imageUrl = body.imageUrl ?? body.images?.[0]?.url;

    const dog = await prisma.dog.create({
      data: {
        name: body.name,
        description: body.description,
        age: body.age,
        ageRange: body.ageRange,
        size: body.size,
        gender: body.gender,
        city: body.city,
        state: body.state,
        address: body.address,
        imageUrl,
        healthCondition: body.healthCondition,
        vaccinated: body.vaccinated,
        neutered: body.neutered,
        specialNeeds: body.specialNeeds,
        contactName: body.contactName,
        contactInfo: body.contactInfo,
        status: body.status,
        moderationStatus: ModerationStatus.PENDING,
        urgencyLevel: body.urgencyLevel,
        createdById: req.user!.id,
        images: body.images?.length
          ? {
              create: body.images.map((image, index) => ({
                url: image.url,
                storageKey: image.storageKey,
                sortOrder: image.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });

    res.status(201).json({ dog: presentDog(dog) });
  }),
];

export const updateDog = [
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { body, params } = updateDogSchema.parse(req);
    const dog = await prisma.dog.findFirst({ where: { id: params.id, deletedAt: null } });

    if (!dog) {
      throw notFound('Dog not found.');
    }

    if (!canManageDog(req.user!.id, req.user!.role, dog.createdById)) {
      throw forbidden('You cannot update this dog.');
    }

    if ((body.moderationStatus || body.rejectionReason) && !canModerateDog(req.user!.role)) {
      throw forbidden('Only admins can moderate dogs.');
    }

    const shouldResetModeration = req.user!.role !== UserRole.ADMIN && Object.keys(body).some((key) => key !== 'status');
    const imageUrl = body.imageUrl ?? body.images?.[0]?.url;

    const updatedDog = await prisma.$transaction(async (tx) => {
      if (body.images) {
        await tx.dogImage.deleteMany({ where: { dogId: params.id } });
      }

      return tx.dog.update({
        where: { id: params.id },
        data: {
          name: body.name,
          description: body.description,
          age: body.age,
          ageRange: body.ageRange,
          size: body.size,
          gender: body.gender,
          city: body.city,
          state: body.state,
          address: body.address,
          imageUrl,
          healthCondition: body.healthCondition,
          vaccinated: body.vaccinated,
          neutered: body.neutered,
          specialNeeds: body.specialNeeds,
          contactName: body.contactName,
          contactInfo: body.contactInfo,
          status: body.status,
          moderationStatus: body.moderationStatus ?? (shouldResetModeration ? ModerationStatus.PENDING : undefined),
          rejectionReason: body.rejectionReason,
          urgencyLevel: body.urgencyLevel,
          images: body.images?.length
            ? {
                create: body.images.map((image, index) => ({
                  url: image.url,
                  storageKey: image.storageKey,
                  sortOrder: image.sortOrder ?? index,
                })),
              }
            : undefined,
        },
        include: { images: true },
      });
    });

    res.json({ dog: presentDog(updatedDog) });
  }),
];

export const deleteDog = [
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { params } = dogIdSchema.parse(req);
    const dog = await prisma.dog.findFirst({ where: { id: params.id, deletedAt: null } });

    if (!dog) {
      throw notFound('Dog not found.');
    }

    if (!canManageDog(req.user!.id, req.user!.role, dog.createdById)) {
      throw forbidden('You cannot delete this dog.');
    }

    await prisma.dog.update({ where: { id: params.id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  }),
];
