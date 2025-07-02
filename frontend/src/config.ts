const config = () => ({
  API_URL: import.meta.env.VITE_API_URL,
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  UPLOAD_URL: import.meta.env.VITE_UPLOAD_URL,
  OTRA_CONFIG: import.meta.env.VITE_OTRA_CONFIG,
  // ...agrega aquí todas las que necesites
});

export default config;