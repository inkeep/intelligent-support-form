import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FormSchemaType } from './IntelligentForm';

interface EscalationFormBodyProps {
  control: Control<FormSchemaType>;
}

export function EscalationFormBody({ control }: EscalationFormBodyProps) {
  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="subject"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject line</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="ticketType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ticket type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket type" />
                </SelectTrigger>
              </FormControl>
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
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="organizationId"
        render={({ field }) => {
          // Ensure organization ID is treated as a number
          const numericValue = typeof field.value === 'string' ? Number.parseInt(field.value, 10) : field.value;
          return (
            <input 
              type="hidden" 
              name={field.name}
              value={numericValue || ''} 
              onChange={(e) => {
                const val = e.target.value;
                // Try to parse as number if it's a string
                field.onChange(val ? Number.parseInt(val, 10) : undefined);
              }}
            />
          );
        }}
      />
    </div>
  );
}
