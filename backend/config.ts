export default () => ({
    MONGODB_URI: process.env.MONGODB_URI ,
    PORT: process.env.PORT,
    // Izipay Configuration
    IZIPAY_PUBLIC_KEY: process.env.IZIPAY_PUBLIC_KEY,
    IZIPAY_SECRET_KEY: process.env.IZIPAY_SECRET_KEY,
    IZIPAY_ENDPOINT: process.env.IZIPAY_ENDPOINT || 'https://static.micuentaweb.pe',
    IZIPAY_MERCHANT_ID: process.env.IZIPAY_MERCHANT_ID,
    IZIPAY_ENVIRONMENT: process.env.IZIPAY_ENVIRONMENT || 'TEST', // TEST or PRODUCTION
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    // WhatsApp Configuration
    WHATSAPP_BUSINESS_TOKEN: process.env.WHATSAPP_BUSINESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,

})