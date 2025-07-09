# PoloStore - Tienda Online de Polos Premium

Una moderna tienda online de polos construida con React, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

### Funcionalidades Principales
- **Catálogo de Productos**: Grid responsive con filtros avanzados
- **Carrito de Compras**: Funcionalidad completa con persistencia
- **Autenticación**: Registro e inicio de sesión con Supabase
- **Búsqueda**: Sistema de búsqueda en tiempo real
- **Filtros**: Por categoría, talla, color y precio
- **Modal de Producto**: Vista detallada con galería de imágenes
- **Responsive Design**: Optimizado para móviles, tablets y desktop

### Tecnologías Utilizadas
- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: Zustand
- **Base de Datos**: Supabase
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd polo-store-ecommerce
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
VITE_STRIPE_PUBLISHABLE_KEY=tu_clave_publica_de_stripe
```

### 4. Configurar Supabase

#### Crear las Tablas
Ejecuta el siguiente SQL en tu consola de Supabase:

```sql
-- Crear tabla de productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT CHECK (category IN ('hombre', 'mujer', 'ninos')),
  sizes JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas para productos (lectura pública)
CREATE POLICY "Productos visibles para todos"
ON products FOR SELECT
TO anon, authenticated
USING (true);

-- Políticas para pedidos (solo usuarios autenticados)
CREATE POLICY "Usuarios pueden ver sus propios pedidos"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propios pedidos"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

#### Insertar Datos de Ejemplo
```sql
INSERT INTO products (name, description, price, images, category, sizes, colors, featured) VALUES
('Polo Clásico Algodón', 'Polo de alta calidad en algodón 100%', 29.99, 
 ARRAY['https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg'], 
 'hombre',
 '[{"id": "s", "name": "S", "stock": 10}, {"id": "m", "name": "M", "stock": 15}]',
 '[{"id": "white", "name": "Blanco", "hex": "#FFFFFF", "stock": 20}]',
 true),
('Polo Elegante Mujer', 'Polo femenino con corte entallado', 34.99,
 ARRAY['https://images.pexels.com/photos/5668860/pexels-photo-5668860.jpeg'],
 'mujer',
 '[{"id": "xs", "name": "XS", "stock": 5}, {"id": "s", "name": "S", "stock": 12}]',
 '[{"id": "pink", "name": "Rosa", "hex": "#EC4899", "stock": 16}]',
 true);
```

### 5. Ejecutar el Proyecto
```bash
npm run dev
```

## 🎨 Estructura del Proyecto

```
src/
├── components/
│   ├── auth/
│   │   └── AuthModal.tsx
│   ├── cart/
│   │   └── CartPanel.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── ProductModal.tsx
│   └── ui/
│       └── Button.tsx
├── 
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── store/
│   └── useStore.ts
├── types/
│   └── index.ts
└── App.tsx
```

## 💳 Integración con Stripe

Para habilitar los pagos con Stripe:

### 1. Configurar Stripe
1. Crea una cuenta en [Stripe Dashboard](https://dashboard.stripe.com)
2. Obtén tus claves API desde la sección "Developers > API keys"
3. Agrega tu clave pública al archivo `.env`:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### 2. Configurar Edge Function (Supabase)
Crea una Edge Function para manejar los pagos:

```typescript
// supabase/functions/create-payment-intent/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.11.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { amount, currency = 'eur' } = await req.json()
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })
    
    return new Response(
      JSON.stringify({ client_secret: paymentIntent.client_secret }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})
```

## 🚀 Deployment en Netlify

### 1. Preparar para Production
```bash
npm run build
```

### 2. Deploy Manual
1. Ve a [Netlify](https://netlify.com)
2. Arrastra la carpeta `dist/` a Netlify Drop
3. Configura las variables de entorno en Netlify

### 3. Deploy Automático (Recomendado)
1. Conecta tu repositorio de GitHub
2. Configura:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Agrega las variables de entorno en Netlify Dashboard

### Variables de Entorno en Netlify
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
VITE_STRIPE_PUBLISHABLE_KEY=tu_clave_publica_de_stripe
```

## 📱 Funcionalidades Implementadas

### ✅ Completado
- [x] Header con navegación y buscador
- [x] Grid de productos responsive
- [x] Filtros sidebar (categoría, precio, talla, color)
- [x] Modal de detalle de producto
- [x] Carrito de compras funcional
- [x] Autenticación con Supabase
- [x] Diseño responsive
- [x] Estados de carga y error
- [x] Persistencia del carrito

### 🔄 En Desarrollo
- [ ] Integración completa con Stripe
- [ ] Página de checkout
- [ ] Página "Mis Pedidos"
- [ ] Sistema de favoritos
- [ ] Notificaciones toast

### 🎯 Próximas Funcionalidades
- [ ] Sistema de reseñas
- [ ] Programa de fidelidad
- [ ] Chat de soporte
- [ ] Recomendaciones personalizadas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Si tienes alguna pregunta o problema:

1. Revisa la documentación
2. Busca en los [Issues](../../issues) existentes
3. Crea un nuevo Issue si es necesario

---

**¡Gracias por usar PoloStore!** 🎉