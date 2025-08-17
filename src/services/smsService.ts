interface SMSOptions {
  to: string;
  body: string;
}

// Mock SMS service - in production would integrate with Twilio or similar
export const sendSMS = async (options: SMSOptions): Promise<void> => {
  try {
    console.log(`[Mock SMS] To: ${options.to}`);
    console.log(`[Mock SMS] Body: ${options.body}`);
    console.log('SMS would be sent in production environment');
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};
