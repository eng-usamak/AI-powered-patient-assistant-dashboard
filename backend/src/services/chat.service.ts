import { prisma } from '../db/prismaClient';
import { Sender } from '@prisma/client';
import { config } from '../config/env';

export async function getChatHistory(patientId: number) {
  return prisma.chatMessage.findMany({
    where: { patientId },
    orderBy: { createdAt: 'asc' },
  });
}


// Call external AI service
async function callAiService(
  message: string,
  patientContext?: { name?: string; email?: string }
): Promise<string> {
  try {
    const response = await fetch(`${config.aiServiceUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        patientContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (err) {
    // Fallback to mock if AI service is unavailable
    console.error('AI service error:', err);
    return `Mock response (AI service unavailable): ${message}`;
  }
}

export async function createChatMessageWithAiReply(
  patientId: number,
  userMessage: string
) {
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

    // 2. Get AI response from external service
    const aiText = await callAiService(userMessage, {
      name: patient.name,
      email: patient.email || undefined,
    });

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
