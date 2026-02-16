import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  handleCreatePatient,
  handleDeletePatient,
  handleGetPatient,
  handleListPatients,
  handleUpdatePatient,
} from '../controllers/patient.controller';

export const router = Router();

// All patient routes require auth
router.use(authMiddleware);

// GET /api/patients?page=&limit=
router.get('/', handleListPatients);

// GET /api/patients/:id
router.get('/:id', handleGetPatient);

// POST /api/patients
router.post('/', handleCreatePatient);

// PUT /api/patients/:id
router.put('/:id', handleUpdatePatient);

// DELETE /api/patients/:id
router.delete('/:id', handleDeletePatient);