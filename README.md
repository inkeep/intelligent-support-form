# Intelligent Support Form

This is a Next.js application for handling support ticket submissions with AI-powered form assistance, integrated with Zendesk.

## Setup

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Create a `.env.local` file in the project root with the following environment variables:

```
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_EMAIL=your-email@example.com
ZENDESK_API_TOKEN=your-zendesk-api-token
ZENDESK_TICKET_TYPE_FIELD_ID=custom_field_123
```

### Zendesk Setup

To get the required Zendesk credentials:

1. **Subdomain**: This is the subdomain of your Zendesk instance (e.g., for `company.zendesk.com`, the subdomain is `company`).

2. **API Token**: 
   - Log in to your Zendesk Admin account
   - Go to Admin Center > Apps and Integrations > APIs > Zendesk API
   - Create a new API token

3. **Email**: The email address associated with your Zendesk admin account

4. **Ticket Type Field ID**: 
   - Go to Admin Center > Objects and rules > Ticket fields
   - Find your ticket type custom field
   - The ID will be in the URL when you edit the field

## Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

- `POST /api/create-ticket` - Creates a new support ticket and submits it to Zendesk

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
