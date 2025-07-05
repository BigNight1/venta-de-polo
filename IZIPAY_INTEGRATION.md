# Integración de Izipay en el Proyecto de Ventas de Polos

## Descripción

Esta implementación integra la pasarela de pago Izipay en el proyecto de e-commerce de polos, permitiendo procesar pagos de forma segura con tarjetas de crédito y débito.

## Características Implementadas

- ✅ Formulario de datos del cliente
- ✅ Generación automática de Order ID
- ✅ Integración con la API de Izipay
- ✅ Formulario de pago embebido
- ✅ Validación de transacciones
- ✅ Página de resultados
- ✅ Manejo de errores
- ✅ Interfaz responsive

## Configuración

### 1. Variables de Entorno

Crear un archivo `.env` en el directorio `backend/` con las siguientes variables:

```env
# Izipay Configuration
IZIPAY_PUBLIC_KEY=tu_public_key_aqui
IZIPAY_SECRET_KEY=tu_secret_key_aqui
IZIPAY_ENDPOINT=https://static.micuentaweb.pe
IZIPAY_MERCHANT_ID=tu_merchant_id_aqui
IZIPAY_ENVIRONMENT=TEST  # o PRODUCTION
```

### 2. Dependencias Instaladas

#### Backend
```bash
cd backend
pnpm add crypto-js @types/crypto-js
```

#### Frontend
```bash
cd frontend
npm install @lyracom/embedded-form-glue axios crypto-js
```

## Flujo de Pago

### 1. Formulario de Datos (`/checkout/izipay/form`)
- Recopila información del cliente
- Genera Order ID automáticamente
- Calcula total con impuestos y envío
- Envía datos al backend para crear formToken

### 2. Checkout de Izipay (`/checkout/izipay`)
- Muestra el formulario de pago embebido
- Procesa la transacción con Izipay
- Valida la respuesta del servidor

### 3. Resultado (`/checkout/izipay/result`)
- Muestra el estado del pago
- Permite volver al inicio o reintentar

## Endpoints del Backend

### POST `/payments/izipay/formtoken`
Crea un formToken para iniciar el proceso de pago.

**Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phoneNumber": "999999999",
  "identityType": "DNI",
  "identityCode": "12345678",
  "address": "Av. Principal 123",
  "country": "PE",
  "state": "Lima",
  "city": "Lima",
  "zipCode": "15001",
  "orderId": "ORD-123456",
  "amount": 150.00,
  "currency": "PEN"
}
```

**Response:**
```json
{
  "formToken": "token_generado_por_izipay",
  "publicKey": "tu_public_key"
}
```

### POST `/payments/izipay/validate`
Valida la respuesta de Izipay.

**Body:**
```json
{
  "kr-answer": "respuesta_codificada_de_izipay",
  "kr-hash": "hash_de_validacion"
}
```

**Response:**
```json
{
  "success": true
}
```

### GET `/payments/izipay/order-id`
Genera un Order ID único.

**Response:**
```json
{
  "orderId": "ORD-123456ABC"
}
```

## Componentes del Frontend

### IzipayForm
Formulario para recopilar datos del cliente antes del pago.

### IzipayCheckout
Componente que muestra el formulario de pago embebido de Izipay.

### IzipayResult
Página que muestra el resultado del pago.

## Seguridad

- ✅ Validación de hash con HMAC-SHA256
- ✅ Verificación de firmas criptográficas
- ✅ Validación de datos en el servidor
- ✅ Manejo seguro de tokens

## Pruebas

### Modo de Prueba
Para probar la integración, usa las tarjetas de prueba de Izipay:

- **Tarjeta de éxito:** 4111111111111111
- **Tarjeta de rechazo:** 4111111111111112
- **CVV:** Cualquier número de 3 dígitos
- **Fecha:** Cualquier fecha futura

### Configuración de Prueba
```env
IZIPAY_ENVIRONMENT=TEST
```

## Producción

### Configuración de Producción
```env
IZIPAY_ENVIRONMENT=PRODUCTION
IZIPAY_ENDPOINT=https://static.micuentaweb.pe
```

### Consideraciones
- Cambiar las claves de prueba por las de producción
- Configurar webhooks para notificaciones
- Implementar logging de transacciones
- Configurar monitoreo de errores

## Troubleshooting

### Error: "Invalid hash signature"
- Verificar que la secret key sea correcta
- Asegurar que el hash se genere correctamente

### Error: "Error al cargar el formulario de pago"
- Verificar que la public key sea correcta
- Comprobar la conectividad con Izipay

### Error: "Datos de pago no válidos"
- Verificar que el formToken se genere correctamente
- Comprobar que los datos del formulario sean válidos

## Recursos Adicionales

- [Documentación oficial de Izipay](https://www.izipay.pe/)
- [Guía de integración](https://www.izipay.pe/documentacion)
- [Tarjetas de prueba](https://www.izipay.pe/documentacion/tarjetas-prueba)

## Soporte

Para problemas técnicos, consultar:
1. Logs del servidor
2. Console del navegador
3. Documentación de Izipay
4. Estado de la API de Izipay 