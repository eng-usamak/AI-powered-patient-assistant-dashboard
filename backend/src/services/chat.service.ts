import { prisma } from '../db/prismaClient';
import { Sender } from '@prisma/client';

export async function getChatHistory(patientId: number) {
  return prisma.chatMessage.findMany({
    where: { patientId },
    orderBy: { createdAt: 'asc' },
  });
}

// For now, a simple mock AI responder
async function mockAiResponse(message: string): Promise<string> {
  return `This is a mock dental assistant response to: "${message}"`;
}

export async function createChatMessageWithAiReply(
  patientId: number,
  userMessage: string
) {
  // Wrap in a transaction so both messages are stored together
  return prisma.$transaction(async (tx) => {
    const patient = await tx.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      const err: any = new Error('Patient not found');
      err.status = 404;
      throw err;
    }

    // 1. Store user message
    const userMsg = await tx.chatMessage.create({
      data: {
        patientId,
        sender: Sender.USER,
        content: userMessage,
      },
    });

    // 2. Get AI response (mock for now)
    const aiText = await mockAiResponse(userMessage);

    // 3. Store AI message
    const aiMsg = await tx.chatMessage.create({
      data: {
        patientId,
        sender: Sender.AI,
        content: aiText,
      },
    });

    return { userMsg, aiMsg };
  });
}
