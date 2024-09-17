import { createOpenAI } from '@ai-sdk/openai';
import { type CoreMessage, generateObject } from 'ai';
import { getMutableAIState } from 'ai/rsc';
import { z } from 'zod';
import { AI } from '../IntelligentFormAIConfig';

const ikpContextModel = 'inkeep-context-expert';
const inkeepBaseURL = 'https://api.inkeep.com/v1';

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

export async function generateContextModeResponse({
  message,
}: {
  message: string;
}) {
  'use server';

  console.log('message: ', message)

  try {
    const openai = createOpenAI({
      apiKey: process.env.INKEEP_API_KEY,
      baseURL: inkeepBaseURL,
    });

    const aiState = getMutableAIState<typeof AI>();

    const { object, response, warnings, usage, finishReason } = await generateObject({
      model: openai(ikpContextModel),
      // model: openai('gpt-4o'),
      schema: contextModelResponseSchema,
      mode: 'json',
      messages: [
        ...aiState.get().contextModeMessages,
        {
          role: "system",
          content: "You are a helpful assistant that helps the user create a support ticket. Based on the user's message, provide an appropriate subject line, priority, and ticket type."
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    console.log('warnings: ', warnings)
    console.log('usage: ', usage)
    console.log('finishReason: ', finishReason)
    console.log('object: ', object)
    console.log('response: ', response)

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
