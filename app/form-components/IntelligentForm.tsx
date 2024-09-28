'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useActions } from 'ai/rsc';
import type { Actions } from '../ai/IntelligentFormAIConfig';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { useAutoScroll } from '@/lib/useAutoScroll';
import type { ProvideAIAnnotationsToolSchema, ProvideRecordsConsideredToolSchema } from '../ai/inkeep-qa-tools-schema';
import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { contextModelResponseSchema } from '../ai/actions/generateContextModeResponse';
import ConfidentAnswer from './ConfidentAnswer';
import LinkButtons from './LinkButtons';
import { AIMessageHeader } from './AIMessageHeader';
import { EscalationFormBody } from './EscalationFormBody';
import InitialForm from './InitialForm';
import { FormSubmissionSuccess } from './FormSubmissionSuccess';
import { LoadingAnimation } from './LoadingAnimation';

export const FormSchema = z.object({
  name: z.string().trim().min(1, {
    message: 'Please enter your name.',
  }),
  email: z
    .string()
    .trim()
    .min(1, {
      message: 'Please enter your email.',
    })
    .email({
      message: 'Please enter a valid email.',
    }),
  message: z.string().trim().min(1, {
    message: 'Please enter a message.',
  }),
  subject: z.string(),
  priority: z.string(),
  ticketType: z.string(),
});

export type FormSchemaType = z.infer<typeof FormSchema>;

export default function IntelligentForm() {
  const { invokeInkeepAI } = useActions() as Actions;
  const [loading, setLoading] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [confidentAnswerMessage, setConfidentAnswerMessage] = useState<{
    recordsConsidered: z.infer<typeof ProvideRecordsConsideredToolSchema>['recordsConsidered'];
    answer: string;
  } | null>();
  const [showEscalation, setShowEscalation] = useState(false);
  const [escalationFormCaption, setEscalationFormCaption] = useState<React.ReactNode>();
  const [nextWasClicked, setNextWasClicked] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      subject: 'General Inquiry',
      priority: 'medium',
      ticketType: 'issue_in_production',
    },
  });

  const {
    formState: { isSubmitting, isSubmitSuccessful },
    handleSubmit,
    setValue,
    getValues,
  } = form;

  const scroll = useAutoScroll();

  const showEscalationForm = ({ caption }: { caption?: React.ReactNode }) => {
    setShowEscalation(true);
    setShouldScrollToBottom(true);
    setEscalationFormCaption(
      caption || (
        <p className="text-gray-600 text-sm">
          To finish submitting a support ticket, confirm the fields below and click Submit.
        </p>
      ),
    );
  };

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log('Form submitted:', { ...data, aiAnswer: confidentAnswerMessage });
    // Here you would typically send the form data to your backend
  };

  const handleAIResponses = ({
    answerConfidence,
    answer,
    recordsConsidered,
    prefilledFormData,
  }: {
    answerConfidence: z.infer<typeof ProvideAIAnnotationsToolSchema>['aiAnnotations']['answerConfidence'];
    answer: string;
    recordsConsidered: z.infer<typeof ProvideRecordsConsideredToolSchema>['recordsConsidered'];
    prefilledFormData?: z.infer<typeof contextModelResponseSchema>;
  }) => {
    if (
      (answerConfidence === 'very_confident' || answerConfidence === 'somewhat_confident') &&
      answer &&
      recordsConsidered &&
      recordsConsidered.length > 0
    ) {
      setConfidentAnswerMessage({
        recordsConsidered,
        answer,
      });
    } else {
      showEscalationForm({
        caption: (
          <div className="space-y-6">
            <AIMessageHeader />
            {recordsConsidered && recordsConsidered.length > 0 && (
              <>
                <p className="text-gray-700 text-sm">
                  {"I wasn't able to find a direct answer to your question, but here's some helpful sources:"}
                </p>
                <LinkButtons links={recordsConsidered} />
              </>
            )}
            <p className="text-gray-600 text-sm">
              To finish submitting a support ticket, confirm the fields below and click Submit.
            </p>
          </div>
        ),
      });
    }

    if (prefilledFormData) {
      const { subjectLine, priority, ticketType } = prefilledFormData;
      setValue('subject', subjectLine);
      setValue('priority', priority);
      setValue('ticketType', ticketType);
    }
  };

  const onClickNext = async () => {
    setLoading(true);
    setShouldScrollToBottom(true);
    setNextWasClicked(true);

    try {
      const message = getValues('message');
      const { qaModelResponse, contextModelResponse } = await invokeInkeepAI(message);

      if (qaModelResponse && contextModelResponse) {
        const { aiAnnotations, text, recordsConsidered } = qaModelResponse;
        const { responseObject } = contextModelResponse;
        handleAIResponses({
          answerConfidence: aiAnnotations.answerConfidence,
          answer: text,
          recordsConsidered,
          prefilledFormData: responseObject,
        });
      } else if (qaModelResponse && contextModelResponse === null) {
        const { aiAnnotations, text, recordsConsidered } = qaModelResponse;
        handleAIResponses({
          answerConfidence: aiAnnotations.answerConfidence,
          answer: text,
          recordsConsidered,
        });
      } else if (qaModelResponse === null && contextModelResponse) {
        const { responseObject } = contextModelResponse;
        if (responseObject) {
          const { subjectLine, priority, ticketType } = responseObject;
          setValue('subject', subjectLine);
          setValue('priority', priority);
          setValue('ticketType', ticketType);
        }
        showEscalationForm({});
      } else {
        showEscalationForm({});
      }
    } catch (error) {
      console.error('Error:', error);
      showEscalationForm({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldScrollToBottom) {
      scroll.scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom, scroll]);

  return (
    <div className="flex flex-col h-full min-h-0 max-h-full justify-center items-center py-8">
      <div className="w-[600px] max-w-full max-h-full mx-auto rounded-xl border bg-card text-card-foreground shadow flex flex-col">
        <div className="px-6 py-4 font-medium border-b-[1px]">Contact Support</div>
        {/* [&>div>div]:!block is a hack to be able to nest the ScrollAreas see https://github.com/radix-ui/primitives/issues/926 */}
        <ScrollArea className="[&>div>div]:!block flex-grow px-5 pb-6" ref={scroll.containerRef}>
          <div className="flex flex-col" ref={scroll.scrollRef}>
            {isSubmitSuccessful ? (
              <FormSubmissionSuccess />
            ) : (
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mx-1 pt-6">
                  <InitialForm control={form.control} />
                  {!nextWasClicked && (
                    <div className="flex w-full justify-end">
                      <Button type="button" onClick={onClickNext}>
                        Next
                      </Button>
                    </div>
                  )}

                  {loading && (
                    <>
                      <Separator className="my-6" />
                      <AIMessageHeader />
                      <LoadingAnimation />
                    </>
                  )}

                  {confidentAnswerMessage && (
                    <ConfidentAnswer
                      recordsConsidered={confidentAnswerMessage.recordsConsidered}
                      answer={confidentAnswerMessage.answer}
                      showEscalationForm={showEscalationForm}
                      showEscalation={showEscalation}
                    />
                  )}

                  {showEscalation && (
                    <div className="space-y-6 animate-fade-in">
                      <Separator className="my-6" />
                      {escalationFormCaption}
                      <EscalationFormBody control={form.control} />
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                          Submit
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
