# Proyecto de Ventas de Polo

---

## Índice
- [Resumen del Proyecto](#resumen-del-proyecto)
- [Guía para Usuarios](#guía-para-usuarios)
- [Guía para Administradores](#guía-para-administradores)
- [Documentación Técnica (Backend)](#documentación-técnica-backend)
- [Documentación Técnica (Frontend)](#documentación-técnica-frontend)

---

## Resumen del Proyecto
Plataforma web para la venta de polos (camisetas), con panel de administración, gestión de productos, carrito de compras, pagos en línea y seguimiento de pedidos.

---

## Guía para Usuarios
### ¿Qué puedes hacer?
- **Ver productos:** Explora todos los polos disponibles en la tienda.
- **Filtrar y buscar:** Filtra por categoría, talla, color, etc.
- **Ver detalles:** Haz clic en un producto para ver imágenes, tallas, colores y descripción.
- **Agregar al carrito:** Selecciona variantes y añade productos al carrito.
- **Gestionar carrito:** Modifica cantidades o elimina productos antes de comprar.
- **Comprar:** Completa tu compra con tus datos y paga en línea (Izipay).
- **Ver tus pedidos:** Consulta el historial y estado de tus pedidos.
- **Contacto y ayuda:** Accede a páginas de contacto y sobre la tienda.

### Rutas principales (Frontend)
- `/` — Inicio, catálogo de productos
- `/about` — Sobre la tienda
- `/contact` — Contacto y ayuda
- `/order` — Tus pedidos
- `/checkout` — Finalizar compra
- `/order/:orderId` — Confirmación de pedido

---

## Guía para Administradores
### ¿Qué puedes hacer?
- **Login seguro:** Acceso solo para administradores.
- **Panel de control:** Vista general de productos, ventas y analíticas.
- **Gestión de productos:** Crear, editar, eliminar productos y variantes (talla, color, stock, imágenes).
- **Gestión de imágenes:** Subir y eliminar imágenes de productos.
- **Gestión de pedidos:** Ver, filtrar, buscar y cambiar el estado de los pedidos (pendiente, confirmado, enviado, entregado, cancelado).
- **Analíticas:** Ver estadísticas de ventas, productos destacados, stock bajo, etc.
- **Cerrar sesión:** Salir del panel de administración de forma segura.

### Rutas principales (Admin)
- `/admin` — Login y panel de administración

---

## Documentación Técnica (Backend)
### Endpoints principales

#### Productos (`/products`)
- `GET /products` — Listar todos los productos
- `GET /products/:id` — Obtener detalles de un producto
- `POST /products` — Crear producto (admin, autenticado)
- `PATCH /products/:id` — Editar producto (admin, autenticado)
- `DELETE /products/:id` — Eliminar producto (admin, autenticado)
- `POST /products/seed` — Semilla de productos (admin)

#### Usuarios y Auth (`/auth`)
- `POST /auth/register` — Registrar usuario
- `POST /auth/login` — Login (usuario o admin)
- `GET /auth/profile` — Perfil del usuario autenticado

#### Pedidos (`/orders`)
- `POST /orders` — Crear pedido
- `GET /orders` — Listar pedidos (admin)
- `GET /orders/:orderId` — Ver detalles de un pedido

#### Pagos (`/payments`)
- `POST /payments/izipay/formtoken` — Obtener token de pago Izipay
- `POST /payments/izipay/validate` — Validar pago Izipay
- `GET /payments/izipay/order-id` — Obtener ID de orden para pago
- `POST /payments/izipay/session` — Crear sesión de pago

#### Imágenes (`/upload`)
- `POST /upload` — Subir imagen (admin, autenticado)
- `DELETE /upload/:filename` — Eliminar imagen (admin, autenticado)
- `POST /upload/cleanup` — Limpiar imágenes huérfanas (admin, autenticado)
- `GET /upload/stats` — Estadísticas de imágenes (admin, autenticado)

---

## Documentación Técnica (Frontend)
### Componentes y páginas principales
- **Catálogo de productos:** Visualización y filtrado de productos
- **Carrito de compras:** Añadir, modificar y eliminar productos
- **Checkout:** Formulario de compra y pago en línea
- **Mis pedidos:** Historial y estado de pedidos
- **Panel admin:** Gestión de productos, pedidos, imágenes y analíticas
- **Login admin:** Acceso seguro para administradores
- **Páginas informativas:** Sobre la tienda y contacto

---