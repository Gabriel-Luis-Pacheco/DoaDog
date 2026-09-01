import { Request, Response } from 'express';
import { DogStatus, ModerationStatus, Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { badRequest, forbidden, notFound } from '../../utils/errors';
import { presentAdoptionRequest } from '../../utils/presenters';
import {
  adoptionRequestListSchema,
  createAdoptionRequestSchema,
  updateAdoptionRequestStatusSchema,
} from './adoptionRequests.schemas';

export const createAdoptionRequest = [
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { body } = createAdoptionRequestSchema.parse(req);
    const dog = await prisma.dog.findFirst({
      where: {
        id: body.dogId,
        deletedAt: null,
        moderationStatus: ModerationStatus.APPROVED,
      },
    });

    if (!dog) {
      throw notFound('Dog not found.');
    }

    if (dog.status !== DogStatus.AVAILABLE) {
      throw badRequest('This dog is not available for adoption.');
    }

    if (dog.createdById === req.user!.id) {
      throw badRequest('You cannot request adoption for your own dog.');
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
      include: { profile: true },
    });

    const request = await prisma.adoptionRequest.create({
      data: {
        dogId: dog.id,
        requesterId: req.user!.id,
        message: body.message,
        housingType: body.housingType,
        hasYard: body.hasYard,
        hasOtherPets: body.hasOtherPets,
        experience: body.experience,
        routine: body.routine,
        familyAgreement: body.familyAgreement,
        responsibilityAgreement: body.responsibilityAgreement,
        adopterName: body.adopterName ?? user.name,
        adopterEmail: (body.adopterEmail ?? user.email).toLowerCase(),
        adopterPhone: body.adopterPhone ?? user.profile?.phone,
        adopterCity: body.adopterCity ?? user.profile?.city,
        adopterState: body.adopterState ?? user.profile?.state,
      },
    });

    res.status(201).json({ adoptionRequest: presentAdoptionRequest(request) });
  }),
];

export const listAdoptionRequests = [
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { query } = adoptionRequestListSchema.parse(req);
    const scopedWhere: Prisma.AdoptionRequestWhereInput =
      req.user!.role === UserRole.ADMIN
        ? {}
        : {
            OR: [{ requesterId: req.user!.id }, { dog: { createdById: req.user!.id } }],
          };
    const where: Prisma.AdoptionRequestWhereInput = {
      ...scopedWhere,
      dogId: query.dogId,
      status: query.status,
    };
    const skip = (query.page - 1) * query.pageSize;

    const [requests, total] = await Promise.all([
      prisma.adoptionRequest.findMany({
        where,
        include: {
          dog: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              status: true,
              createdById: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      prisma.adoptionRequest.count({ where }),
    ]);

    res.json({
      data: requests.map(presentAdoptionRequest),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    });
  }),
];

export const updateAdoptionRequestStatus = [
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { body, params } = updateAdoptionRequestStatusSchema.parse(req);
    const request = await prisma.adoptionRequest.findUnique({
      where: { id: params.id },
      include: { dog: true },
    });

    if (!request) {
      throw notFound('Adoption request not found.');
    }

    const canUpdate = req.user!.role === UserRole.ADMIN || request.dog.createdById === req.user!.id;
    if (!canUpdate) {
      throw forbidden('You cannot update this adoption request.');
    }

    const updatedRequest = await prisma.adoptionRequest.update({
      where: { id: params.id },
      data: {
        status: body.status,
        statusNote: body.statusNote,
      },
    });

    res.json({ adoptionRequest: presentAdoptionRequest(updatedRequest) });
  }),
];
