const config = () => ({
  API_URL: import.meta.env.VITE_API_URL,
  UPLOAD_URL: import.meta.env.VITE_UPLOAD_URL,
  OTRA_CONFIG: import.meta.env.VITE_OTRA_CONFIG,
});

export default config;