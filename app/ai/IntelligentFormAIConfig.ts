import 'server-only';

import { createAI } from 'ai/rsc';
import type { CoreMessage } from 'ai';
import { nanoid } from '@/lib/utils';
import { generateQAModeResponse } from './actions/generateQAModeResponse';
import { generateContextModeResponse } from './actions/generateContextModeResponse';

const actions = {
  generateQAModeResponse,
  generateContextModeResponse,
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
