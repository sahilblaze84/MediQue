# n8n Workflow Setup Guide for MediQueue AI

## Overview
This n8n workflow automates the entire patient triage and appointment booking process for MediQueue AI.

## Workflow Components

### 1. Webhook - Receive Patient Form
- **Type**: Webhook Trigger
- **Purpose**: Receives patient symptom submissions from the frontend
- **Endpoint**: POST `/medique-webhook`
- **Expected Payload**:
```json
{
  "symptoms": ["fever", "headache"],
  "severity": "moderate",
  "duration": "2 days",
  "patientInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "preferredDate": "2024-01-15",
  "preferredTime": "10:00"
}
```

### 2. AI Symptom Analysis
- **Type**: HTTP Request
- **Purpose**: Sends symptom data to backend AI service for analysis
- **Endpoint**: `POST http://localhost:5000/api/symptoms/analyze`
- **Response**: Department recommendation, priority level, AI summary

### 3. Store in Database
- **Type**: SQLite
- **Purpose**: Stores symptom submission and analysis results
- **Table**: `symptom_submissions`

### 4. Check Emergency Priority
- **Type**: IF Condition
- **Purpose**: Checks if priority level is "Emergency"
- **Logic**: Routes to emergency alert if true, normal booking if false

### 5. Book Appointment
- **Type**: HTTP Request
- **Purpose**: Creates appointment in the system
- **Endpoint**: `POST http://localhost:5000/api/appointments`

### 6. Send Confirmation Email
- **Type**: Email Send
- **Purpose**: Sends appointment confirmation to patient
- **Content**: Appointment details, AI summary, instructions

### 7. Send SMS Confirmation
- **Type**: Twilio
- **Purpose**: Sends SMS confirmation to patient
- **Content**: Brief appointment details

### 8. Send Summary to Doctor
- **Type**: HTTP Request
- **Purpose**: Sends AI-generated summary to assigned doctor
- **Content**: Patient info, symptoms, AI analysis

### 9. Send Emergency Alert
- **Type**: Email Send
- **Purpose**: Alerts hospital staff about emergency cases
- **Trigger**: When priority is "Emergency"
- **Recipients**: Hospital admin/emergency team

### 10. Wait 24 Hours
- **Type**: Wait
- **Purpose**: Delays reminder until 24 hours before appointment
- **Duration**: 24 hours (configurable)

### 11. Send Reminder Email/SMS
- **Type**: Email Send / Twilio
- **Purpose**: Sends appointment reminders
- **Timing**: 24 hours before appointment

### 12. Respond to Webhook
- **Type**: Respond to Webhook
- **Purpose**: Sends success response back to frontend
- **Response**: Appointment ID and confirmation details

## Setup Instructions

### Prerequisites
1. n8n installed and running (default: http://localhost:5678)
2. MediQueue backend API running on http://localhost:5000
3. Email service configured (SMTP)
4. Twilio account configured (for SMS)

### Step 1: Import Workflow
1. Open n8n interface
2. Click "Import from File" or "Import from URL"
3. Select the `n8n-workflow.json` file
4. Click "Import"

### Step 2: Configure Credentials

#### HTTP Header Auth (MediQueue API)
1. Go to Credentials → Add Credential
2. Select "Header Auth"
3. Name: "MediQueue API Auth"
4. Add header: `Authorization: Bearer YOUR_API_KEY` (if using API keys)
5. Save

#### SMTP (Gmail)
1. Go to Credentials → Add Credential
2. Select "SMTP"
3. Name: "Gmail SMTP"
4. Configure:
   - Host: smtp.gmail.com
   - Port: 587
   - Secure: false
   - User: your-email@gmail.com
   - Password: Your App Password (not regular password)
5. Save

#### Twilio
1. Go to Credentials → Add Credential
2. Select "Twilio API"
3. Name: "Twilio Account"
4. Configure:
   - Account SID: Your Twilio Account SID
   - Auth Token: Your Twilio Auth Token
5. Save

#### SQLite
1. Go to Credentials → Add Credential
2. Select "SQLite"
3. Name: "MediQueue Database"
4. Configure:
   - Database path: `./database/medique.db`
5. Save

### Step 3: Set Environment Variables
In n8n, set these environment variables:
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number
- `ADMIN_EMAIL`: Hospital admin email for emergency alerts

### Step 4: Activate Workflow
1. Click the "Inactive" toggle to activate the workflow
2. The webhook URL will be generated
3. Copy the webhook URL and configure your frontend to send data to it

### Step 5: Test the Workflow
1. Send a test POST request to the webhook URL
2. Monitor the workflow execution in n8n
3. Check that:
   - AI analysis is performed
   - Appointment is booked
   - Emails are sent
   - SMS messages are sent
   - Database is updated

## Customization Options

### Change Reminder Timing
- Modify the "Wait 24 Hours" node
- Adjust the amount and unit as needed

### Add Additional Notifications
- Add more Email Send or Twilio nodes
- Connect them after the booking step

### Custom Email Templates
- Edit the message content in Email Send nodes
- Use HTML for rich formatting
- Reference data with `{{$json.fieldName}}`

### Emergency Routing
- Modify the "Check Emergency Priority" condition
- Add additional emergency handling steps

## Troubleshooting

### Webhook Not Triggering
- Check if workflow is active
- Verify webhook URL is correct
- Check n8n logs for errors

### Email Not Sending
- Verify SMTP credentials
- Check if app password is used (for Gmail)
- Review email provider's security settings

### SMS Not Sending
- Verify Twilio credentials
- Check phone number format (include country code)
- Ensure Twilio account has credits

### API Requests Failing
- Verify backend API is running
- Check CORS settings
- Review API endpoint URLs

### Database Errors
- Verify database file path
- Check SQLite credentials
- Ensure database tables exist

## Security Considerations

1. **API Security**: Use authentication for webhook and API calls
2. **Data Encryption**: Enable HTTPS for webhook URL
3. **Credential Management**: Store credentials securely in n8n
4. **Rate Limiting**: Implement rate limiting on webhook
5. **Data Privacy**: Ensure patient data is handled per HIPAA/GDPR

## Workflow Optimization

### Production Tips
1. Enable error handling for all nodes
2. Add retry logic for failed API calls
3. Implement logging for audit trail
4. Set up monitoring and alerts
5. Use environment-specific configurations

### Performance
1. Use batch processing for bulk operations
2. Implement caching for repeated API calls
3. Optimize database queries
4. Use async operations where possible

## Monitoring

### Key Metrics to Track
- Workflow execution time
- Success/failure rates
- API response times
- Email/SMS delivery rates
- Database operation performance

### Alerts to Set Up
- Workflow failures
- API connection errors
- Email delivery failures
- SMS delivery failures
- Database connection issues

## Integration with Frontend

### Example Frontend Integration
```javascript
const submitToN8N = async (formData) => {
  try {
    const response = await fetch('YOUR_N8N_WEBHOOK_URL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting to n8n:', error);
    throw error;
  }
};
```

## Support

For issues or questions:
1. Check n8n documentation: https://docs.n8n.io
2. Review workflow execution logs
3. Test individual nodes in isolation
4. Verify all credentials are correctly configured
