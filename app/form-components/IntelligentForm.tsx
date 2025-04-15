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
import type { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { contextModelResponseSchema } from '../ai/actions/generateContextModeResponse';
import ConfidentAnswer from './ConfidentAnswer';
import LinkButtons from './LinkButtons';
import { AIMessageHeader } from './AIMessageHeader';
import { EscalationFormBody } from './EscalationFormBody';
import InitialForm from './InitialForm';
import { FormSubmissionSuccess } from './FormSubmissionSuccess';
import { LoadingAnimation } from './LoadingAnimation';
import { TicketSchema } from '@/app/schemas/ticketSchema';
import type { TicketSchemaType } from '@/app/schemas/ticketSchema';

// Use the imported schema for form validation
export type FormSchemaType = TicketSchemaType;

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
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiSubmissionSuccessful, setApiSubmissionSuccessful] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(TicketSchema),
    defaultValues: {
      name: 'Abby Tester',
      email: 'abby@example.com',
      message: 'General inquiry',
      subject: 'General Inquiry',
      priority: 'medium',
      ticketType: 'issue_in_production',
      organizationId: 123456,
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

  const onSubmit = async (data: TicketSchemaType) => {
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);
    setApiSubmissionSuccessful(false);
    
    try {
      // Send form data to the API endpoint
      const response = await fetch('/api/create-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Error submitting form:', result);
        
        // Handle field-specific validation errors
        if (result.errors) {
          const newFieldErrors: Record<string, string[]> = {};
          
          // Process validation errors from the API
          for (const [field, error] of Object.entries(result.errors)) {
            if (field !== '_errors' && typeof error === 'object' && error !== null) {
              const fieldError = error as { _errors?: string[] };
              if (fieldError._errors && fieldError._errors.length > 0) {
                newFieldErrors[field] = fieldError._errors;
                
                // Set form errors for the affected fields
                if (field in form.formState.errors === false) {
                  form.setError(field as keyof FormSchemaType, { 
                    type: 'server', 
                    message: fieldError._errors[0] 
                  });
                }
              }
            }
          }
          
          setFieldErrors(newFieldErrors);
          setFormError('Please fix the errors below and try again.');
        } else {
          // Generic error message
          setFormError(result.message || 'Failed to submit the form. Please try again.');
        }
        return;
      }

      // Form submission was successful
      console.log('Ticket created successfully:', result);
      setApiSubmissionSuccessful(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
            {apiSubmissionSuccessful ? (
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
                      
                      {formError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm mt-4">
                          <p className="font-medium mb-1">{formError}</p>
                          {Object.entries(fieldErrors).length > 0 && (
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.entries(fieldErrors).map(([field, errors]) => (
                                <li key={field}>
                                  <span className="font-medium">{field}: </span>
                                  {errors[0]}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={submitting}>
                          {submitting ? 'Submitting...' : 'Submit'}
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
