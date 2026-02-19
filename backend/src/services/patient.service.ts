import { prisma } from '../db/prismaClient';

export interface CreatePatientInput {
  name: string;
  email?: string;
  phone?: string;
  dob?: string; // ISO date from client, we'll convert to Date
  medicalNotes?: string;
  createdById?: number;
}

export interface UpdatePatientInput {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  medicalNotes?: string;
}

export async function createPatient(input: CreatePatientInput) {
  const { dob, createdById, ...rest } = input;

  return prisma.patient.create({
    data: {
      ...rest,
      dob: dob ? new Date(dob) : undefined,
      createdById,
    },
  });
}

export async function getPatientById(id: number, userId: number) {
  return prisma.patient.findFirst({
    where: {
      id,
      createdById: userId,
    },
  });
}

export async function listPatients(page: number, limit: number, userId: number) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.patient.findMany({
      where: {
        createdById: userId,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patient.count({
      where: {
        createdById: userId,
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updatePatient(id: number, input: UpdatePatientInput, userId: number) {
  const { dob, ...rest } = input;

  // First check if patient exists and belongs to user
  const patient = await prisma.patient.findFirst({
    where: {
      id,
      createdById: userId,
    },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  return prisma.patient.update({
    where: { id },
    data: {
      ...rest,
      dob: dob ? new Date(dob) : undefined,
    },
  });
}

export async function deletePatient(id: number, userId: number) {
  // First check if patient exists and belongs to user
  const patient = await prisma.patient.findFirst({
    where: {
      id,
      createdById: userId,
    },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  return prisma.patient.delete({
    where: { id },
  });
}
