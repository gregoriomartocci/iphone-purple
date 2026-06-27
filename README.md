<div align="center">

<img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Claude_AI-Anthropic-D97757?style=for-the-badge" />

<br /><br />

# iPhone Purple

### E-commerce premium de celulares para el mercado argentino

Plataforma fullstack de venta de iPhones y smartphones construida con Next.js 16, Supabase y Claude AI. Incluye catálogo, carrito, checkout con Mercado Pago, panel de administración y chatbot con IA.

<br />

[Reportar un bug](https://github.com/gregoriomartocci/iphone-purple/issues) · [Sugerir feature](https://github.com/gregoriomartocci/iphone-purple/issues)

</div>

---

## Características

### Tienda
- **Landing page** — Hero con carrusel de productos, beneficios, más vendidos, categorías, Plan Canje, reviews y newsletter
- **Catálogo** — Filtros por categoría, marca, precio, almacenamiento y condición vía URL params. Vista grilla/lista, ordenamiento, paginación
- **Detalle de producto** — Galería con thumbnails, selector de variantes (storage/color), precio con descuento, tabs de descripción/especificaciones/reviews
- **Carrito** — Drawer lateral con animación spring, persistencia con Zustand, stepper de cantidades
- **Plan Canje** — Formulario de 5 pasos para cotizar y entregar un equipo usado

### Checkout
- **Paso 1** — Autenticación (Google OAuth o continuar como invitado)
- **Paso 2** — Dirección de envío con validación Zod
- **Paso 3** — Pago con Mercado Pago (preferencias + webhooks) o Stripe

### Cuenta de usuario
- Historial de pedidos con tracking de estados en tiempo real
- Perfil editable con preferencias de notificaciones
- Autenticación con Google y email/contraseña

### IA
- **Violeta** — Chatbot de atención al cliente impulsado por Claude claude-sonnet-4-6 con streaming SSE. Responde sobre productos, stock, envíos y el Plan Canje

### Admin Panel
- Dashboard con KPIs, pedidos recientes y alertas de stock bajo
- Gestión de productos con búsqueda, filtros, paginación y acciones en bulk
- Panel oscuro independiente del tema de la tienda

### Técnico
- Imágenes alojadas en **Supabase Storage** — sin dependencias externas
- Emails transaccionales con **Resend** (confirmación de pedido, envío, entrega, bienvenida)
- **Multi-moneda** ARS/USD con toggle en navbar
- SEO completo — sitemap dinámico, robots.txt, OpenGraph, metadatos por página
- RLS (Row Level Security) en todas las tablas de Supabase

---

## Stack

| Categoría | Tecnología |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Lenguaje | TypeScript 5 — modo strict |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Storage | Supabase Storage |
| Auth | NextAuth v5 — Google OAuth + Credentials |
| Estado global | Zustand v5 con persist middleware |
| Animaciones | Framer Motion v12 |
| Formularios | React Hook Form v7 + Zod v4 |
| IA | Anthropic Claude claude-sonnet-4-6 (SSE streaming) |
| Pagos | Mercado Pago + Stripe |
| Emails | Resend v6 |
| React | React 19 |

---

## Estructura del proyecto

```
iphone-purple/
├── app/
│   ├── (auth)/           # Login y registro
│   ├── (store)/          # Tienda pública
│   │   ├── page.tsx      # Landing page
│   │   ├── catalogo/     # Catálogo y detalle de producto
│   │   ├── checkout/     # Flujo de compra (3 pasos)
│   │   ├── cuenta/       # Perfil y pedidos del usuario
│   │   └── plan-canje/   # Trade-in de equipos
│   ├── admin/            # Panel de administración (dark)
│   └── api/
│       ├── auth/         # NextAuth + registro
│       ├── chat/         # Claude AI SSE stream
│       ├── orders/       # Creación y consulta de pedidos
│       ├── payments/     # Preferencias Mercado Pago
│       ├── products/     # Consulta de productos
│       ├── upload/       # Upload a Supabase Storage
│       └── webhooks/     # Webhooks Mercado Pago
├── components/
│   ├── cart/             # CartDrawer
│   ├── catalog/          # FiltersSidebar
│   ├── chatbot/          # ChatbotBubble (Violeta)
│   ├── landing/          # Secciones de la landing
│   ├── layout/           # Navbar, Footer
│   ├── product/          # ProductCard
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── email/            # Templates HTML con Resend
│   └── supabase/         # Clientes server/browser + schema SQL
├── stores/               # Zustand: carrito y moneda
├── types/                # Interfaces TypeScript
├── utils/                # formatARS, formatUSD, cn, slugify
└── proxy.ts              # Auth middleware (Next.js 16)
```

---

## Instalación

### Requisitos
- Node.js 20+
- Proyecto en [Supabase](https://supabase.com)
- API key de [Anthropic](https://console.anthropic.com) para el chatbot

### 1. Clonar e instalar

```bash
git clone https://github.com/gregoriomartocci/iphone-purple.git
cd iphone-purple
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=                        # openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=

# Stripe (opcional)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@tudominio.com

# Claude AI
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Base de datos

En el SQL editor de tu proyecto Supabase, ejecutá el contenido de `lib/supabase/schema.sql`. Incluye todas las tablas, RLS policies, triggers e índices.

### 4. Supabase Storage

Dashboard → Storage → **New bucket** → nombre `images` → marcar como **Public**.

### 5. Desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## API Routes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/products` | Listar productos con filtros |
| `POST` | `/api/orders` | Crear pedido |
| `GET` | `/api/orders` | Pedidos del usuario autenticado |
| `POST` | `/api/payments/mercadopago` | Crear preferencia de pago |
| `POST` | `/api/webhooks/mercadopago` | Webhook de pagos |
| `POST` | `/api/chat` | Stream SSE con Claude AI |
| `POST` | `/api/upload` | Subir imagen a Storage |
| `DELETE` | `/api/upload` | Eliminar imagen de Storage |
| `POST` | `/api/auth/register` | Registrar usuario |

---

## Deploy

Optimizado para **Vercel**:

```bash
vercel deploy
```

Configurá todas las variables de entorno en el dashboard de Vercel y actualizá `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL` con tu dominio de producción.

---

## Licencia

MIT

---

<div align="center">
Hecho en Argentina 🇦🇷
</div>
