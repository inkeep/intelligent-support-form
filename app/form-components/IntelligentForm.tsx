'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useActions } from 'ai/rsc';
import type { Actions } from '../ai/IntelligentFormAIConfig';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAutoScroll } from '@/lib/useAutoScroll';
import type { ProvideAIAnnotationsToolSchema, ProvideLinksToolSchema } from '../ai/inkeep-qa-tools-schema';
import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { contextModelResponseSchema } from '../ai/actions/generateContextModeResponse';
import { LoadingGrid } from './LoadingGrid';
import ConfidentAnswer from './ConfidentAnswer';
import LinkButtons from './LinkButtons';
import { AIMessageHeader } from './AIMessageHeader';
import { EscalationFormBody } from './EscalationFormBody';

export default function IntelligentForm() {
  const { invokeInkeepAI } = useActions() as Actions;

  const [loading, setLoading] = useState(false);
  const [confidentAnswerMessage, setConfidentAnswerMessage] = useState<{
    links: z.infer<typeof ProvideLinksToolSchema>['links'];
    answer: string;
  } | null>();
  const [showEscalation, setShowEscalation] = useState(false);
  const [escalationFormCaption, setEscalationFormCaption] = useState<React.ReactNode>();
  const [nextWasClicked, setNextWasClicked] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subject: 'General Inquiry',
    priority: 'medium',
    ticketType: 'issue_in_production',
  });

  const scroll = useAutoScroll();

  const showEscalationForm = ({ caption }: { caption?: React.ReactNode }) => {
    setShowEscalation(true);
    setEscalationFormCaption(
      caption || (
        <p className="text-gray-600 text-sm">
          To finish submitting a support ticket, confirm the fields below and click Submit.
        </p>
      ),
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the form data to your backend
  };

  const handleAIResponses = ({
    answerConfidence,
    answer,
    links,
    prefilledFormData,
  }: {
    answerConfidence: z.infer<typeof ProvideAIAnnotationsToolSchema>['aiAnnotations']['answerConfidence'];
    answer: string;
    links: z.infer<typeof ProvideLinksToolSchema>['links'];
    prefilledFormData?: z.infer<typeof contextModelResponseSchema>;
  }) => {
    if (
      (answerConfidence === 'very_confident' || answerConfidence === 'somewhat_confident') &&
      answer &&
      links &&
      links.length > 0
    ) {
      setConfidentAnswerMessage({
        links,
        answer,
      });
    } else {
      showEscalationForm({
        caption: (
          <div className="space-y-6">
            <AIMessageHeader />
            {links && links.length > 0 && (
              <>
                <p className="text-gray-700">
                  {"I wasn't able to find a direct answer to your question, but here's some helpful sources:"}
                </p>
                <LinkButtons links={links} />
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
      setFormData(prevData => ({
        ...prevData,
        subject: subjectLine,
        priority,
        ticketType,
      }));
    }
  };

  const onClickNext = async () => {
    setLoading(true);
    setNextWasClicked(true);

    try {
      const { qaModelResponse, contextModelResponse } = await invokeInkeepAI(formData.message);

      if (qaModelResponse && contextModelResponse) {
        const { aiAnnotations, text, links } = qaModelResponse;
        const { responseObject } = contextModelResponse;
        handleAIResponses({
          answerConfidence: aiAnnotations.answerConfidence,
          answer: text,
          links,
          prefilledFormData: responseObject,
        });
      } else if (qaModelResponse && contextModelResponse === null) {
        const { aiAnnotations, text, links } = qaModelResponse;
        handleAIResponses({
          answerConfidence: aiAnnotations.answerConfidence,
          answer: text,
          links,
        });
      } else if (qaModelResponse === null && contextModelResponse) {
        const { responseObject } = contextModelResponse;
        if (responseObject) {
          const { subjectLine, priority, ticketType } = responseObject;
          setFormData(prevData => ({
            ...prevData,
            subject: subjectLine,
            priority,
            ticketType,
          }));
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
    if (!loading) {
      scroll.scrollToBottom();
    }
  }, [loading, scroll]);

  return (
    <div className="flex flex-col h-full justify-center items-center py-8">
      <div className="w-[600px] max-w-full max-h-full mx-auto rounded-xl border bg-card text-card-foreground shadow flex flex-col">
        <div className="px-6 py-4 font-medium border-b-[1px]">Contact Support</div>
        {/* [&>div>div]:!block is a hack to be able to nest the ScrollAreas see https://github.com/radix-ui/primitives/issues/926 */}
        <ScrollArea className="[&>div>div]:!block flex-grow px-5 pb-6" ref={scroll.containerRef}>
          <div className="flex flex-col" ref={scroll.scrollRef}>
            <form onSubmit={handleSubmit} className="space-y-8 mx-1 pt-6">
              <div className="space-y-8">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="message">How can we help?</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

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
                  <div className="flex flex-row space-x-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                  <LoadingGrid />
                </>
              )}

              {confidentAnswerMessage && (
                <ConfidentAnswer
                  links={confidentAnswerMessage.links}
                  answer={confidentAnswerMessage.answer}
                  showEscalationForm={showEscalationForm}
                />
              )}

              {showEscalation && (
                <div className="space-y-6 animate-fade-in">
                  <Separator className="my-6" />
                  {escalationFormCaption}
                  <EscalationFormBody
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    subject={formData?.subject}
                    priority={formData?.priority}
                    ticketType={formData?.ticketType}
                  />
                  <div className="flex justify-end">
                    <Button type="submit">Submit</Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
