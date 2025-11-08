import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take messages');
  }
});

export interface ReminderEmailProps {
  borrowerEmail: string;
  borrowerName: string;
  lenderName: string;
  amount: number;
  borrowDate: string;
  description?: string;
  transactionId: string;
}

export async function sendBorrowerReminder({
  borrowerEmail,
  borrowerName,
  lenderName,
  amount,
  borrowDate,
  description,
  transactionId
}: ReminderEmailProps) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: borrowerEmail,
      subject: `💰 Reminder: You borrowed ${formatCurrency(amount)}`,
      html: generateReminderEmail({
        borrowerName,
        lenderName,
        amount,
        borrowDate,
        description,
        transactionId
      }),
    };

    console.log('Attempting to send email to:', borrowerEmail);
    console.log('Using SMTP user:', process.env.SMTP_USER);

    const result = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent successfully:', result.messageId);
    console.log('Email response:', result.response);
    
    return { 
      success: true, 
      messageId: result.messageId,
      message: 'Reminder sent successfully' 
    };
    
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function generateReminderEmail(props: Omit<ReminderEmailProps, 'borrowerEmail'>) {
  const formattedAmount = formatCurrency(props.amount);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content { 
          padding: 30px; 
          background: #f8f9fa;
          border-radius: 0 0 10px 10px;
        }
        .amount { 
          font-size: 28px; 
          font-weight: bold; 
          color: #dc2626;
          text-align: center;
          margin: 20px 0;
        }
        .transaction-details {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
          margin: 20px 0;
        }
        .footer { 
          text-align: center; 
          color: #666; 
          font-size: 14px; 
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 Payment Reminder</h1>
        <p>Friendly reminder about your borrowed amount</p>
      </div>
      
      <div class="content">
        <p>Hello <strong>${props.borrowerName}</strong>,</p>
        
        <p>This is a friendly reminder about the amount you borrowed.</p>
        
        <div class="transaction-details">
          <div class="amount">${formattedAmount}</div>
          <p><strong>👤 Borrowed from:</strong> ${props.lenderName}</p>
          <p><strong>📅 Date:</strong> ${props.borrowDate}</p>
          ${props.description ? `<p><strong>📝 Description:</strong> ${props.description}</p>` : ''}
          <p><strong>🔢 Transaction ID:</strong> ${props.transactionId}</p>
        </div>
        
        <p>Please settle this amount at your earliest convenience.</p>
        
        <p style="text-align: center;">
          <a href="#" class="button">View Transaction Details</a>
        </p>
        
        <p>Best regards,<br>
        <strong>Finance Tracker Team</strong></p>
      </div>
      
      <div class="footer">
        <p>This is an automated reminder from Finance Tracker app.</p>
        <p>If you have already settled this amount, please ignore this email.</p>
        <p>Transaction ID: ${props.transactionId}</p>
      </div>
    </body>
    </html>
  `;
}

// Helper function for currency formatting
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}