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

export async function getPatientById(id: number) {
  return prisma.patient.findUnique({
    where: { id },
  });
}

export async function listPatients(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.patient.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patient.count(),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updatePatient(id: number, input: UpdatePatientInput) {
  const { dob, ...rest } = input;

  return prisma.patient.update({
    where: { id },
    data: {
      ...rest,
      dob: dob ? new Date(dob) : undefined,
    },
  });
}

export async function deletePatient(id: number) {
  return prisma.patient.delete({
    where: { id },
  });
}
