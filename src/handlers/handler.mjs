import AWS from "aws-sdk";
import { simpleParser } from "mailparser";

const s3 = new AWS.S3();
const ses = new AWS.SES();

export const getEmailFromS3 = async (bucketName, objectKey) => {
  const emailData = await s3
    .getObject({ Bucket: bucketName, Key: objectKey })
    .promise();
  return emailData.Body.toString("utf-8");
};

export const sendEmailViaSES = async (params) => {
  return ses.sendRawEmail(params).promise();
};

export const handler = async (event) => {
  try {
    // Extract the SNS message
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);
    const { bucketName, objectKey } = snsMessage.receipt.action;

    // Fetch the raw email from S3
    const rawEmail = await getEmailFromS3(bucketName, objectKey);
    const parsedEmail = await simpleParser(rawEmail);
    const sender = parsedEmail.from?.text || "unknown sender";
    const subject = parsedEmail.subject || "(No Subject)";

    // Extract the plain text or HTML body
    const body = parsedEmail.text || parsedEmail.html || "(No content)";

    // Create the reformatted email with the original sender as From and Reply-To
    const newEmail = [
      `From: ${sender}`,
      `To: ${process.env.GMAIL_EMAIL}`,
      `Subject: ${subject}`,
      `Reply-To: ${sender}`,
      "",
      body,
    ].join("\n");

    // Send the reformatted email via SES
    const params = {
      Source: process.env.SES_EMAIL, // SES verified email
      Destinations: [process.env.GMAIL_EMAIL],
      RawMessage: { Data: newEmail },
    };

    await sendEmailViaSES(params);

    console.log("Email processed and forwarded successfully");
    return {
      statusCode: 200,
      body: "Email processed and forwarded successfully",
    };
  } catch (error) {
    console.error("Error processing email:", error);
    return { statusCode: 500, body: "Failed to process email" };
  }
};
