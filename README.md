# AWS SES Email Forwarding Service

This serverless application provides email forwarding functionality using AWS Simple Email Service (SES). It allows you to forward emails received at your SES-verified domain to any Gmail address while preserving the original sender information.

## Key Features

- Forwards emails from an SES-verified domain to a Gmail address
- Preserves original sender information in the "From" and "Reply-To" headers
- Handles both plain text and HTML email content
- Serverless architecture using AWS Lambda
- Built with AWS SAM for easy deployment
- Includes comprehensive testing setup

## Architecture

The service works through the following flow:

1. Emails are received by AWS SES
2. SES stores the email in an S3 bucket
3. An SNS notification is triggered
4. Lambda function processes the email:
   - Retrieves the email from S3
   - Parses the email content
   - Reformats with original sender information
   - Forwards to the specified Gmail address

## Prerequisites

Before deploying this application, you need:

- An SES-verified domain or email address
- A Gmail address to receive the forwarded emails
- An AWS account with appropriate permissions

## Setup Instructions

1. **Update SAM Template Parameters**

   - Open `template.yaml` and modify the default values for:

     - `SESEmailParameter`: Your SES verified email address
     - `GmailEmailParameter`: Your Gmail address
     - `EmailBucketParameter`: Your S3 bucket name for storing emails

2. **Build and Deploy**

   - Install AWS SAM CLI if you haven't already
   - Run the following commands from the project root:

   ```bash
   sam build
   sam deploy --guided
   ```

   - During the guided deployment, you'll be prompted to:
     - Enter a stack name
     - Choose AWS Region
     - Confirm parameter values
     - Acknowledge IAM role creation
   - For subsequent deployments, you can simply use:

```bash
sam deploy
```

3. **Configure AWS SES**

   - Verify your domain or email address in SES
   - In SES Email Receiving Rules:
     - Create a rule with Recipient condition = `SESEmailParameter`
     - Add actions:
       1. S3: Deliver to `EmailBucketParameter` bucket
       2. SNS: Publish to `EmailProcessingTopic`

4. **Setup Gmail Integration**
   - Generate SMTP credentials in AWS SES
   - In Gmail:
     1. Go to Settings → Accounts and Import
     2. Select "Send mail as"
     3. Click "Add another email address"
     4. Enter your SES verified email
     5. Use AWS SES SMTP credentials:
        - SMTP Server: Your SES SMTP endpoint
        - Port: 587
        - Username: Your SMTP username
        - Password: Your SMTP password

This setup allows you to:

- Receive emails at your SES address
- Forward them automatically to Gmail
- Send replies that appear to come from your SES address
