'use client'

import { Button } from "@/components/ui/button"
import { UserIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ProvideLinksToolSchema } from '../ai/inkeep-qa-tools-schema'
import { z } from 'zod'
import { Card, CardContent } from "@/components/ui/card"
import MarkdownRenderer from "@/components/markdown-renderer/MarkdownRenderer"
import LinkButtons from "./LinkButtons"

const AI_BOT_NAME = 'Inkeep AI'

export default function ConfidentAnswer(
    {
        links,
        answer,
        showEscalationForm
    }: {
        links: z.infer<typeof ProvideLinksToolSchema>['links'],
        answer: string,
        showEscalationForm: ({ caption }: { caption: React.ReactNode }) => void
    }) {

    return (
        <div className="space-y-4 animate-fade-in">
            <Separator className="my-6" />

            <div className="inline bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                {AI_BOT_NAME}
            </div>

            {links && links.length > 0 && (
                <>
                    <p className="text-gray-600">
                        I was able to find some help content:
                    </p>
                    <LinkButtons links={links} />
                </>
            )}

            <p className="text-gray-600">
                {"Here's a suggested answer:"}
            </p>
            <Card>
                <CardContent className="p-4">
                    <MarkdownRenderer markdown={answer} />
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button type="button" onClick={() => {
                    showEscalationForm({
                        caption: (
                            <>
                                <div className="inline bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                                    {AI_BOT_NAME}
                                </div>
                                <p className="text-gray-600">
                                    Understood. Please confirm the below information:
                                </p>
                            </>
                        )
                    })
                }} className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Escalate to human
                </Button>
            </div>
        </div>
    )
}