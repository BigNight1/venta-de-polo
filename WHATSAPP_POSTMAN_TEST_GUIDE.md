# Guía para Probar WhatsApp con Postman

## 🚀 Configuración Inicial

### 1. Verificar Variables de Entorno
Asegúrate de que tu archivo `.env` en el backend tenga estas variables configuradas:

```env
WHATSAPP_BUSINESS_TOKEN=tu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
NODE_ENV=development
```

### 2. Iniciar el Servidor
```bash
cd backend
npm run start:dev
```

El servidor debe estar corriendo en `http://localhost:3000`

## 📱 Pruebas con Postman

### Prueba 1: Mensaje de Texto Simple

**Endpoint:** `POST http://localhost:3000/orders/test-whatsapp`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phone": "51999999999",
  "message": "🧪 Mensaje de prueba desde Postman"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Mensaje de prueba enviado"
}
```

### Prueba 2: Plantilla de Confirmación de Compra

**Endpoint:** `POST http://localhost:3000/orders/test-whatsapp-template`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phone": "51999999999",
  "nombre": "Juan Pérez",
  "orderId": "ORD-2024-001"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Plantilla de confirmación enviada correctamente",
  "data": {
    "phone": "51999999999",
    "nombre": "Juan Pérez",
    "orderId": "ORD-2024-001"
  }
}
```

## 🔧 Formato de Números de Teléfono

El sistema acepta números en varios formatos y los convierte automáticamente:

- `999999999` → `51999999999`
- `0999999999` → `51999999999`
- `+51999999999` → `51999999999`
- `51999999999` → `51999999999`
- `(51) 999-999-999` → `51999999999`

## 📋 Pasos para Probar

### Paso 1: Verificar Configuración
1. Abre Postman
2. Crea una nueva colección llamada "WhatsApp Tests"
3. Verifica que el servidor esté corriendo en `http://localhost:3000`

### Paso 2: Probar Mensaje Simple
1. Crea una nueva request POST
2. URL: `http://localhost:3000/orders/test-whatsapp`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "phone": "TU_NUMERO_AQUI",
  "message": "🧪 Prueba desde Postman - " + new Date().toLocaleString()
}
```

### Paso 3: Probar Plantilla de Confirmación
1. Crea otra request POST
2. URL: `http://localhost:3000/orders/test-whatsapp-template`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "phone": "TU_NUMERO_AQUI",
  "nombre": "Tu Nombre",
  "orderId": "ORD-" + Date.now()
}
```

## 🐛 Solución de Problemas

### Error: "recipient phone number not in allowed list"
- **Causa:** El número no está verificado en Meta Developers
- **Solución:** Agrega tu número en Meta Developers → WhatsApp → Configuration → Phone Numbers → Allowed Numbers

### Error: "template not found"
- **Causa:** El nombre de la plantilla no coincide
- **Solución:** Verifica el nombre exacto de tu plantilla en Meta Developers

### Error: "invalid token"
- **Causa:** Token expirado o incorrecto
- **Solución:** Renueva el token en Meta Developers

### Error: "permission denied"
- **Causa:** La plantilla no está aprobada
- **Solución:** Espera la aprobación de Meta o usa una plantilla ya aprobada

## 📊 Verificar Logs

Revisa la consola del servidor para ver logs detallados:

```bash
# En la terminal donde corre el servidor
[WhatsAppAPI] Enviando mensaje a: 51999999999
[WhatsAppAPI] URL: https://graph.facebook.com/v17.0/...
[WhatsAppAPI] Mensaje enviado correctamente. Respuesta: {...}
```

## 🎯 Pruebas Recomendadas

1. **Prueba con tu propio número** (debe estar verificado en Meta)
2. **Prueba con diferentes formatos de número**
3. **Prueba con caracteres especiales en el nombre**
4. **Prueba con orderId largo**
5. **Verifica que el botón del enlace funcione**

## 🔗 Enlaces Útiles

- [Meta Developers Console](https://developers.facebook.com/apps/)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Template Message Guide](https://developers.facebook.com/docs/whatsapp/message-templates)

## 📝 Notas Importantes

- Solo funciona en modo desarrollo (`NODE_ENV=development`)
- El número de teléfono debe estar verificado en Meta Developers
- La plantilla debe estar aprobada por Meta
- Los mensajes de texto libre solo funcionan si el usuario te escribió en las últimas 24 horas
- Las plantillas pueden iniciar conversaciones sin restricciones 