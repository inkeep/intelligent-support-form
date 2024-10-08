import 'server-only';

import { createAI } from 'ai/rsc';
import type { CoreMessage } from 'ai';
import { nanoid } from '@/lib/utils';
import { generateQAModeResponse } from './actions/generateQAModeResponse';
import { generateContextModeResponse } from './actions/generateContextModeResponse';

const invokeInkeepAI = async (message: string) => {
  'use server'

  const [qaModelResponse, contextModelResponse] = await Promise.allSettled([
    generateQAModeResponse(message),
    generateContextModeResponse(message)
  ])

  return {
    qaModelResponse: qaModelResponse.status === 'fulfilled' ? qaModelResponse.value : null,
    contextModelResponse: contextModelResponse.status === 'fulfilled' ? contextModelResponse.value : null
  }
}

const actions = {
  invokeInkeepAI,
};

export type Actions = typeof actions;

export type AIState = {
  chatId: string
  qaModeMessages: CoreMessage[]
  contextModeMessages: CoreMessage[]
}

export type UIState = {
  qaModeDisplay?: React.ReactNode
  contextModeDisplay?: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions,
  initialUIState: [],
  initialAIState: { chatId: nanoid(), qaModeMessages: [], contextModeMessages: [] }
})

