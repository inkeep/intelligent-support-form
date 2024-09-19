import { createOpenAI } from '@ai-sdk/openai';
import { type CoreMessage, generateObject } from 'ai';
import { getMutableAIState } from 'ai/rsc';
import { z } from 'zod';
import { AI } from '../IntelligentFormAIConfig';

const openai = createOpenAI({
  apiKey: process.env.INKEEP_API_KEY,
  baseURL: 'https://api.inkeep.com/v1'
})

const ikpContextModel = 'inkeep-context-expert';

export const contextModelResponseSchema = z.object({
  subjectLine: z.string(),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  ticketType: z.enum([
    'talk_to_sales',
    'issue_in_production',
    'issue_in_development',
    'report_bug',
    'onboarding_help',
    'account_management',
    'feature_request',
  ]),
});

const systemPrompt = `
You are a helpful assistant that helps the user create a support ticket. Based on the user's message, provide an appropriate subject line, priority, and ticket type."
`
export async function generateContextModeResponse(message: string) {
  'use server';

  try {
    const aiState = getMutableAIState<typeof AI>();

    const { object } = await generateObject({
      model: openai(ikpContextModel),
      schema: contextModelResponseSchema,
      mode: 'json',
      messages: [
        ...aiState.get().contextModeMessages,
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const responseAsMessage = {
      role: 'assistant',
      content: JSON.stringify(object),
    };

    const contextModeMessages = object ? [...aiState.get().contextModeMessages, responseAsMessage] : aiState.get().contextModeMessages;

    aiState.done({
      ...aiState.get(),
      contextModeMessages: contextModeMessages as CoreMessage[],
    });

    return {
      responseObject: object,
    };
  } catch (error) {
    console.error('Error in generateContextModeResponse', error);
    throw error;
  }
}
