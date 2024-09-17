import 'server-only'

import { getMutableAIState } from 'ai/rsc'
import { createOpenAI } from '@ai-sdk/openai'

import { CoreMessage, generateText } from 'ai'
import { ProvideAIAnnotationsToolSchema, ProvideLinksToolSchema } from '../inkeep-qa-tools-schema'
import { AI } from '../IntelligentFormAIConfig'
import { z } from 'zod'

const openai = createOpenAI({
  apiKey: process.env.INKEEP_API_KEY,
  baseURL: 'https://api.inkeep.com/v1'
})

const inkeepModel = 'inkeep-qa-expert'

export const generateQAModeResponse = async (message: string) => {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    qaModeMessages: [
      ...aiState.get().qaModeMessages,
      {
        role: 'user',
        content: message
      }
    ]
  })

  const { text, toolCalls } = await generateText({
    model: openai(inkeepModel),
    messages: aiState
      .get().qaModeMessages
      .filter(message => message.role !== 'tool')
      .map(
        message =>
          ({
            role: message.role,
            content: message.content,
          }) as CoreMessage
      ),
    tools: {
      provideLinks: {
        parameters: ProvideLinksToolSchema,
      },
      provideAIAnnotations: {
        parameters: ProvideAIAnnotationsToolSchema,
      }
    },
    toolChoice: 'auto',
  })

  aiState.done({
    ...aiState.get(),
    qaModeMessages: [
      ...aiState.get().qaModeMessages,
      {
        role: 'assistant',
        content: text
      }
    ]
  })

  const aiAnnotations = toolCalls.find(toolCall => toolCall.toolName === 'provideAIAnnotations')?.args.aiAnnotations as z.infer<typeof ProvideAIAnnotationsToolSchema>['aiAnnotations']
  const links = toolCalls.find(toolCall => toolCall.toolName === 'provideLinks')?.args.links as z.infer<typeof ProvideLinksToolSchema>['links']

  return {
    aiAnnotations,
    links,
    text,
  }
}
