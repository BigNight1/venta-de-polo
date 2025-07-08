import { registerAs } from '@nestjs/config';

export default registerAs('whatsapp', () => ({
  // WhatsApp Business API
  businessToken: process.env.WHATSAPP_BUSINESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  
  // Twilio WhatsApp API (alternativa)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioWhatsAppFrom: process.env.TWILIO_WHATSAPP_FROM,
  
  // Configuración general
  enabled: !!(process.env.WHATSAPP_BUSINESS_TOKEN || process.env.TWILIO_ACCOUNT_SID),
  provider: process.env.WHATSAPP_BUSINESS_TOKEN ? 'business' : 
            process.env.TWILIO_ACCOUNT_SID ? 'twilio' : 'simulation',
})); 