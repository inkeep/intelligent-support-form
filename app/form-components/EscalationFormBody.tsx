import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EscalationFormBodyProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string) => (value: string) => void;
  subject: string;
  priority: string;
  ticketType: string;
}

export function EscalationFormBody({
  handleInputChange,
  handleSelectChange,
  subject,
  priority,
  ticketType,
}: EscalationFormBodyProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <Label htmlFor="subject">Subject line</Label>
        <Input id="subject" name="subject" value={subject} onChange={handleInputChange} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="priority">Priority</Label>
        <Select name="priority" value={priority} onValueChange={handleSelectChange('priority')}>
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
      <div className="space-y-1">
        <Label htmlFor="ticketType">Ticket type</Label>
        <Select name="ticketType" value={ticketType} onValueChange={handleSelectChange('ticketType')}>
          <SelectTrigger>
            <SelectValue placeholder="Select ticket type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="talk_to_sales">Talk to sales</SelectItem>
            <SelectItem value="issue_in_production">Issue in production</SelectItem>
            <SelectItem value="issue_in_development">Issue in development</SelectItem>
            <SelectItem value="report_bug">Report bug</SelectItem>
            <SelectItem value="onboarding_help">Onboarding help</SelectItem>
            <SelectItem value="account_management">Account management</SelectItem>
            <SelectItem value="feature_request">Feature request</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
