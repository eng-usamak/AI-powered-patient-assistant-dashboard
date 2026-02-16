import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createPatient,
  getPatientById,
  listPatients,
  updatePatient,
  deletePatient,
} from '../services/patient.service';

export async function handleCreatePatient(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, phone, dob, medicalNotes } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      dob?: string;
      medicalNotes?: string;
    };

    if (!name) {
      return res.status(400).json({ error: { message: 'Name is required' } });
    }

    const patient = await createPatient({
      name,
      email,
      phone,
      dob,
      medicalNotes,
      createdById: req.user?.userId,
    });

    res.status(201).json({ data: patient });
  } catch (err) {
    next(err);
  }
}

export async function handleGetPatient(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid patient id' } });
    }

    const patient = await getPatientById(id);
    if (!patient) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }

    res.json({ data: patient });
  } catch (err) {
    next(err);
  }
}

export async function handleListPatients(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const page = Number(req.query.page ?? '1');
    const limit = Number(req.query.limit ?? '10');

    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 && limit <= 100 ? limit : 10;

    const result = await listPatients(safePage, safeLimit);

    res.json({ data: result.items, pagination: result });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdatePatient(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid patient id' } });
    }

    const { name, email, phone, dob, medicalNotes } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      dob?: string;
      medicalNotes?: string;
    };

    // Optionally enforce at least one field
    if (!name && !email && !phone && !dob && !medicalNotes) {
      return res
        .status(400)
        .json({ error: { message: 'At least one field must be provided' } });
    }

    const patient = await updatePatient(id, {
      name,
      email,
      phone,
      dob,
      medicalNotes,
    });

    res.json({ data: patient });
  } catch (err: any) {
    if (err.code === 'P2025') {
      // Prisma "record not found"
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }
    next(err);
  }
}

export async function handleDeletePatient(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid patient id' } });
    }

    await deletePatient(id);

    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }
    next(err);
  }
}
