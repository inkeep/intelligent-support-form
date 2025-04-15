import { NextResponse } from 'next/server';
import { TicketSchema } from '@/app/schemas/ticketSchema';

// Map our ticket priorities to Zendesk priorities
const priorityMap: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

// Map our ticket types to Zendesk custom field IDs
// These IDs would need to be adjusted based on your actual Zendesk custom fields
const ticketTypeFieldId = process.env.ZENDESK_TICKET_TYPE_FIELD_ID || "custom_field_123";

// Define Zendesk ticket data interface
interface ZendeskTicketData {
  subject: string;
  comment: {
    body: string;
  };
  priority: number;
  requester: {
    name: string;
    email: string;
  };
  custom_fields: Array<{
    id: string;
    value: string;
  }>;
  organization_id?: number;
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    console.log('Received request body:', body);
    
    // Validate the request body against the schema
    const result = TicketSchema.safeParse(body);
    
    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        { 
          success: false, 
          errors: result.error.format() 
        },
        { status: 400 }
      );
    }
    
    // If validation passes, process the validated data
    const validatedData = result.data;
    
    // Check if required environment variables are set
    if (!process.env.ZENDESK_SUBDOMAIN || !process.env.ZENDESK_API_TOKEN || !process.env.ZENDESK_EMAIL) {
      console.error('Missing Zendesk environment variables');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Server configuration error' 
        },
        { status: 500 }
      );
    }

    // Prepare the ticket data for Zendesk
    const ticketData: ZendeskTicketData = {
      subject: validatedData.subject,
      comment: {
        body: validatedData.message
      },
      priority: priorityMap[validatedData.priority] || 2,
      requester: {
        name: validatedData.name,
        email: validatedData.email
      },
      custom_fields: [
        {
          id: ticketTypeFieldId,
          value: validatedData.ticketType
        }
      ]
    };

    // Add organization ID if provided
    if (validatedData.organizationId) {
      ticketData.organization_id = validatedData.organizationId;
    }

    const zendeskTicket = {
      ticket: ticketData
    };

    // Create the ticket in Zendesk
    const zendeskResponse = await fetch(
      `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${process.env.ZENDESK_EMAIL}/token:${process.env.ZENDESK_API_TOKEN}`).toString('base64')}`
        },
        body: JSON.stringify(zendeskTicket)
      }
    );

    const zendeskResult = await zendeskResponse.json();

    if (!zendeskResponse.ok) {
      console.error('Zendesk API error:', zendeskResult);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create ticket in Zendesk',
          details: zendeskResult
        },
        { status: 502 }
      );
    }
    
    // Return success response with ticket details
    return NextResponse.json(
      { 
        success: true, 
        message: 'Ticket created successfully',
        ticket: validatedData,
        zendeskTicketId: zendeskResult.ticket?.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing ticket creation:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
