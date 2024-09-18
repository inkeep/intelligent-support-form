'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useActions } from 'ai/rsc'
import { Actions } from '../ai/IntelligentFormAIConfig'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProvideAIAnnotationsToolSchema, ProvideLinksToolSchema } from '../ai/inkeep-qa-tools-schema'
import { z } from 'zod'
import { ScrollArea } from '@/components/ui/scroll-area'
import { contextModelResponseSchema } from '../ai/actions/generateContextModeResponse'
import { LoadingGrid } from './LoadingGrid'
import ConfidentAnswer from './ConfidentAnswer'
import LinkButtons from './LinkButtons'
import { Skeleton } from '@/components/ui/skeleton'
import { useAutoScroll } from '@/lib/useAutoScroll'

const AI_BOT_NAME = 'Inkeep AI'

export default function IntelligentForm() {
  const { invokeInkeepAI } = useActions() as Actions

  const [loading, setLoading] = useState(false)
  const [confidentAnswerMessage, setConfidentAnswerMessage] = useState<{
    links: z.infer<typeof ProvideLinksToolSchema>['links'],
    answer: string
  } | null>()
  const [showEscalation, setShowEscalation] = useState(false)
  const [escalationFormCaption, setEscalationFormCaption] = useState<React.ReactNode>()
  const [nextWasClicked, setNextWasClicked] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subject: 'General Inquiry',
    priority: 'medium',
    ticketType: 'issue_in_production'
  })

  const scroll = useAutoScroll();

  const showEscalationForm = ({ caption }: { caption?: React.ReactNode }) => {
    setShowEscalation(true)
    setEscalationFormCaption(caption || (
      <p className="text-gray-600">
        To finish submitting a support ticket, confirm the fields below and click Submit.
      </p>
    ))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would typically send the form data to your backend
  }

  const handleAIResponses = ({ answerConfidence, answer, links, prefilledFormData }: {
    answerConfidence: z.infer<typeof ProvideAIAnnotationsToolSchema>['aiAnnotations']['answerConfidence'],
    answer: string,
    links: z.infer<typeof ProvideLinksToolSchema>['links'],
    prefilledFormData?: z.infer<typeof contextModelResponseSchema>
  }) => {
    if ((answerConfidence === 'very_confident' || answerConfidence === 'somewhat_confident') && answer && links && links.length > 0) {
      setConfidentAnswerMessage({
        links,
        answer
      })
    } else {
      showEscalationForm({
        caption: (
          <div className="space-y-4">
            <div className="inline bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
              {AI_BOT_NAME}
            </div>
            {links && links.length > 0 && (
              <>
                <p className="text-gray-600">
                  {"I wasn't able to find a direct answer to your question, but here's some helpful sources:"}
                </p>
                <LinkButtons links={links} />
              </>
            )}
            <p className="text-gray-600">
              To finish submitting a support ticket, confirm the fields below and click Submit.
            </p>
          </div>
        )
      })
    }

    if (prefilledFormData) {
      const { subjectLine, priority, ticketType } = prefilledFormData
      setFormData(prevData => ({ ...prevData, subject: subjectLine, priority, ticketType }))
    }
  }

  const onClickNext = async () => {
    setLoading(true)
    setNextWasClicked(true)

    try {
      const { qaModelResponse, contextModelResponse } = await invokeInkeepAI(formData.message)

      if (qaModelResponse.status === 'fulfilled' && contextModelResponse.status === 'fulfilled') {
        const { aiAnnotations, text, links } = qaModelResponse.value
        const { responseObject } = contextModelResponse.value
        handleAIResponses({
          answerConfidence: aiAnnotations.answerConfidence,
          answer: text,
          links,
          prefilledFormData: responseObject
        })
      } else if (qaModelResponse.status === 'fulfilled' && contextModelResponse.status === 'rejected') {
        const { aiAnnotations, text, links } = qaModelResponse.value
        handleAIResponses({
          answerConfidence: aiAnnotations.answerConfidence,
          answer: text,
          links,
        })
      } else if (qaModelResponse.status === 'rejected' && contextModelResponse.status === 'fulfilled') {
        const { responseObject } = contextModelResponse.value
        if (responseObject) {
          const { subjectLine, priority, ticketType } = responseObject
          setFormData(prevData => ({ ...prevData, subject: subjectLine, priority, ticketType }))
        }
        showEscalationForm({})
      } else {
        showEscalationForm({})
      }
    } catch (error) {
      console.error('Error:', error)
      showEscalationForm({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      scroll.scrollToBottom();
    }
  }, [loading, scroll]);

  return (
    <div className="flex flex-col h-full justify-center items-center">
      <div className="w-[800px] max-h-[800px] mx-auto bg-white rounded-lg shadow-md flex flex-col">
        <ScrollArea className="flex-grow p-6" ref={scroll.containerRef}>
          <div className="flex flex-col" ref={scroll.scrollRef}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
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
                <div>
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
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-8 w-[200px]" />
                  </div>
                  {/* <div className="flex flex-col space-y-2">
                  <Skeleton className="h-[28px] w-[70px]" />
                  <div className="flex flex-row space-x-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-8 w-[200px]" />
                  </div>
                </div> */}
                </>
              )}

              {loading && <LoadingGrid />}

              {confidentAnswerMessage && (
                <ConfidentAnswer
                  links={confidentAnswerMessage.links}
                  answer={confidentAnswerMessage.answer}
                  showEscalationForm={showEscalationForm}
                />
              )}

              {showEscalation && (
                <>
                  <div className="space-y-4 animate-fade-in">
                    <Separator className="my-6" />

                    {escalationFormCaption}

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject Line</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select name="priority" value={formData.priority} onValueChange={handleSelectChange('priority')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ticketType">Ticket Type</Label>
                        <Select name="ticketType" value={formData.ticketType} onValueChange={handleSelectChange('ticketType')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ticket type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="talk_to_sales">Talk to Sales</SelectItem>
                            <SelectItem value="issue_in_production">Issue in Production</SelectItem>
                            <SelectItem value="issue_in_development">Issue in Development</SelectItem>
                            <SelectItem value="report_bug">Report Bug</SelectItem>
                            <SelectItem value="onboarding_help">Onboarding Help</SelectItem>
                            <SelectItem value="account_management">Account Management</SelectItem>
                            <SelectItem value="feature_request">Feature Request</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Submit</Button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
