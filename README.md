# EventCraft

EventCraft is an event management platform with role-based access for attendees, organizers, and admins.

## Features

- **Authentication**: Auth0 integration with JWT tokens for secure user management
- **Events**: Create, discover, manage, and register for events
- **Tickets**: Purchase and manage tickets with multiple types and pricing
- **Role-Based Access**: Different capabilities for attendees, organizers, and admins
- **Admin Controls**: Event approval workflow, user management, analytics

## Tech Stack

**Frontend**: React, Redux Toolkit, Tailwind CSS, Auth0 SDK  
**Backend**: Node.js, Express, JWT  
**Database**: MongoDB with Mongoose

## Architecture

```
[Frontend (React)] <--> [Backend API (Express)] <--> [MongoDB]
        |                        |
        v                        v
     [Auth0]             [External Services]
```

## How It Works
![WhatsApp Image 2025-07-01 at 13 32 51_61c0d2f7](https://github.com/user-attachments/assets/1696a8d4-465d-46fc-a69e-d6ae130a05e6)

### Authentication Flow
1. User logs in via Auth0
2. Auth0 returns JWT tokens
3. Backend validates tokens and checks user in database
4. Role-based access enforced via middleware

### API Structure
- **/api/auth**: User authentication and profile management
- **/api/events**: Event CRUD operations and discovery
- **/api/tickets**: Ticket purchasing and management
- **/api/admin**: Admin-specific operations

### Database Models
- **User**: Profile, authentication, and role information
- **Event**: Event details, attendees, and approval status
- **Ticket**: Purchase records and check-in status

## Getting Started

1. Clone repository
2. Install dependencies (`npm install` in backend and frontend)
3. Configure Auth0 (see AUTH0_SETUP.md)
4. Set environment variables
5. Start servers:
   ```
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```
6. Access at http://localhost:5173 


# EventCraft Backend Email/SMS Integration Guide

This guide explains how to integrate Twilio (for SMS) and SendGrid (for email) with the EventCraft backend.

## Integrating SendGrid for Email

### 1. Installation

```bash
npm install @sendgrid/mail
```

### 2. Environment Variables

Add these to your `.env` file:

```
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_sender@example.com
```

### 3. Create Email Service

Create a new file at `backend/services/emailService.js`:

```javascript
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const msg = {
      to,
      from: process.env.FROM_EMAIL,
      subject,
      text,
      html: html || text
    };
    
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error };
  }
};

// Template helpers for common emails
const sendEventConfirmation = async (user, event) => {
  return sendEmail({
    to: user.email,
    subject: `Registration Confirmed: ${event.title}`,
    html: `
      <h1>You're registered for ${event.title}!</h1>
      <p>Hello ${user.name},</p>
      <p>Your registration for ${event.title} on ${new Date(event.date).toLocaleDateString()} is confirmed.</p>
      <p>Location: ${event.location}</p>
      <p>Thank you for using EventCraft!</p>
    `
  });
};

const sendEventReminder = async (user, event) => {
  return sendEmail({
    to: user.email,
    subject: `Reminder: ${event.title} is tomorrow!`,
    html: `
      <h1>Event Reminder</h1>
      <p>Hello ${user.name},</p>
      <p>This is a reminder that ${event.title} is happening tomorrow at ${event.location}.</p>
      <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
      <p>Time: ${new Date(event.date).toLocaleTimeString()}</p>
    `
  });
};

module.exports = {
  sendEmail,
  sendEventConfirmation,
  sendEventReminder
};
```

### 4. Usage Examples

```javascript
// In your event registration controller
const emailService = require('../services/emailService');

// After successful ticket purchase
await emailService.sendEventConfirmation(user, event);

// For event reminders (could be scheduled with a cron job)
await emailService.sendEventReminder(user, event);
```

## Integrating Twilio for SMS

### 1. Installation

```bash
npm install twilio
```

### 2. Environment Variables

Add these to your `.env` file:

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Testing in Development

For testing without sending actual emails/SMS:

1. **For SendGrid**: Create a test account and use Sendgrid's Event Webhook
2. **For Twilio**: Use Twilio's test credentials and phone numbers

## Production Best Practices

1. **Rate Limiting**: Implement throttling for SMS to avoid unexpected costs
2. **Templates**: Use SendGrid templates for professional-looking emails
3. **Opt-in/out**: Always provide users the ability to opt out of notifications
4. **Queuing**: For high-volume applications, use a message queue system
5. **Error Handling**: Implement comprehensive error handling and retry logic

