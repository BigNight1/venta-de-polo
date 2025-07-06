# English Version

---

## Project Overview
Web platform for selling t-shirts, with an admin panel, product management, shopping cart, online payments, and order tracking.

---

## User Guide
### What can you do?
- **Browse products:** Explore all available t-shirts in the store.
- **Filter and search:** Filter by category, size, color, etc.
- **View details:** Click a product to see images, sizes, colors, and description.
- **Add to cart:** Select variants and add products to your cart.
- **Manage cart:** Change quantities or remove products before checkout.
- **Checkout:** Complete your purchase with your details and pay online (Izipay).
- **View your orders:** Check your order history and status.
- **Contact and help:** Access contact and about pages.

### Main routes (Frontend)
- `/` — Home, product catalog
- `/about` — About the store
- `/contact` — Contact and help
- `/order` — Your orders
- `/checkout` — Checkout
- `/order/:orderId` — Order confirmation

---

## Admin Guide
### What can you do?
- **Secure login:** Access for administrators only.
- **Dashboard:** Overview of products, sales, and analytics.
- **Product management:** Create, edit, delete products and variants (size, color, stock, images).
- **Image management:** Upload and delete product images.
- **Order management:** View, filter, search, and update order status (pending, confirmed, shipped, delivered, cancelled).
- **Analytics:** View sales stats, featured products, low stock, etc.
- **Logout:** Securely exit the admin panel.

### Main routes (Admin)
- `/admin` — Login and admin panel

---

## Technical Documentation (Backend)
### Main endpoints

#### Products (`/products`)
- `GET /products` — List all products
- `GET /products/:id` — Get product details
- `POST /products` — Create product (admin, authenticated)
- `PATCH /products/:id` — Edit product (admin, authenticated)
- `DELETE /products/:id` — Delete product (admin, authenticated)
- `POST /products/seed` — Seed products (admin)

#### Users & Auth (`/auth`)
- `POST /auth/register` — Register user
- `POST /auth/login` — Login (user or admin)
- `GET /auth/profile` — Authenticated user profile

#### Orders (`/orders`)
- `POST /orders` — Create order
- `GET /orders` — List orders (admin)
- `GET /orders/:orderId` — View order details

#### Payments (`/payments`)
- `POST /payments/izipay/formtoken` — Get Izipay payment token
- `POST /payments/izipay/validate` — Validate Izipay payment
- `GET /payments/izipay/order-id` — Get order ID for payment
- `POST /payments/izipay/session` — Create payment session

#### Images (`/upload`)
- `POST /upload` — Upload image (admin, authenticated)
- `DELETE /upload/:filename` — Delete image (admin, authenticated)
- `POST /upload/cleanup` — Clean orphan images (admin, authenticated)
- `GET /upload/stats` — Image stats (admin, authenticated)

---

## Technical Documentation (Frontend)
### Main components and pages
- **Product catalog:** Browse and filter products
- **Shopping cart:** Add, modify, and remove products
- **Checkout:** Purchase form and online payment
- **My orders:** Order history and status
- **Admin panel:** Manage products, orders, images, and analytics
- **Admin login:** Secure access for administrators
- **Info pages:** About and contact 