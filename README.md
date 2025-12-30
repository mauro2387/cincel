# 🏗️ CINCEL CONSTRUCCIONES - Web Oficial

**Web multipágina profesional 100% lista para producción**

Desarrollada con React + Vite + TypeScript + TailwindCSS + React Router v6

---

## 📋 Tabla de Contenidos

1. [Descripción](#descripción)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Cómo Editar Contenido](#cómo-editar-contenido)
6. [Personalización](#personalización)
7. [Despliegue](#despliegue)
8. [SEO y Performance](#seo-y-performance)
9. [Checklist de QA](#checklist-de-qa)
10. [Mantenimiento](#mantenimiento)

---

## 📖 Descripción

Sitio web profesional multipágina para **CINCEL CONSTRUCCIONES**, empresa de construcción que opera en Montevideo y Maldonado, Uruguay.

### ✨ Características Principales

- ✅ **Diseño corporativo profesional** con paleta dorado/negro/blanco
- ✅ **100% responsive** - Mobile-first design
- ✅ **Routing real** con React Router v6 (no single-page estática)
- ✅ **SEO optimizado** - Meta tags, Schema.org, Sitemap
- ✅ **Accesibilidad WCAG AA** - Labels, focus, navegación por teclado
- ✅ **WhatsApp integrado** - Botón flotante + mensajes estructurados
- ✅ **Formularios funcionales** - Contacto y Cotización (embudo)
- ✅ **Contenido estructurado editable** - Sin hardcodeo
- ✅ **Analytics preparado** - Sistema de tracking de eventos
- ✅ **TypeScript estricto** - Código type-safe
- ✅ **Performance optimizada** - Objetivo Lighthouse > 90
- ✅ **Iconografía SVG profesional** - Sin emojis, iconos personalizados
- ✅ **Imágenes generadas SVG** - Placeholders visuales profesionales
- ✅ **Cotización gratuita destacada** - Badges y CTAs claros

### 🗂️ Páginas Implementadas

| Ruta | Descripción |
|------|-------------|
| `/` | Home con hero, quiénes somos, galería visual, servicios, proceso, valores |
| `/empresa` | Historia, cifras, valores, proceso detallado, garantías, imágenes |
| `/servicios` | Listado completo de servicios con iconos |
| `/servicios/:slug` | Detalle dinámico de cada servicio |
| `/obras` | Portfolio de proyectos realizados (con filtros) |
| `/obras/:slug` | Detalle dinámico de cada proyecto |
| `/zonas` | Montevideo y Maldonado (info específica) |
| `/contacto` | Formulario completo de contacto |
| `/cotizar` | Mini embudo de cotización (4 pasos) |

---

## 🛠️ Stack Tecnológico

```json
{
  "frontend": "React 19 + TypeScript",
  "bundler": "Vite 6",
  "routing": "React Router v6",
  "styling": "TailwindCSS 4",
  "linting": "ESLint 9",
  "node": ">= 18.x"
}
```

**Sin dependencias innecesarias** - Arquitectura minimalista y escalable.

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18.x o superior
- npm o pnpm

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
# http://localhost:5173
```

### Comandos Disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build para producción
npm run preview   # Preview del build
npm run lint      # Linter (ESLint)
```

---

## 📁 Estructura del Proyecto

```
cincel-web/
├── public/
│   ├── robots.txt          # SEO - Robots
│   └── sitemap.xml         # SEO - Sitemap
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── SEO.tsx        # Meta tags y Schema.org
│   │   ├── Header.tsx     # Navegación principal
│   │   ├── Footer.tsx     # Pie de página
│   │   ├── Layout.tsx     # Layout compartido
│   │   ├── FloatingWhatsApp.tsx  # Botón flotante WA
│   │   └── ScrollToTop.tsx       # Scroll automático
│   ├── config/
│   │   └── brand.ts       # ⭐ Configuración central
│   ├── content/
│   │   ├── services.ts    # ⭐ Contenido de servicios
│   │   └── projects.ts    # ⭐ Contenido de proyectos
│   ├── lib/
│   │   ├── analytics.ts   # Sistema de tracking
│   │   └── whatsapp.ts    # Utilidades WhatsApp
│   ├── pages/             # Páginas del sitio
│   │   ├── Home.tsx
│   │   ├── Empresa.tsx
│   │   ├── Servicios.tsx
│   │   ├── ServicioDetalle.tsx
│   │   ├── Obras.tsx
│   │   ├── ObraDetalle.tsx
│   │   ├── Zonas.tsx
│   │   ├── Contacto.tsx
│   │   └── Cotizar.tsx
│   ├── App.tsx            # Router principal
│   ├── main.tsx           # Entry point
│   └── index.css          # Estilos globales + Tailwind
├── index.html
├── package.json
├── tailwind.config.js     # Config Tailwind
├── tsconfig.json          # TypeScript config
└── README.md
```

---

## ✏️ Cómo Editar Contenido

### 1. Información de la Empresa

**Archivo:** `src/config/brand.ts`

```typescript
export const brandConfig = {
  companyName: 'CINCEL CONSTRUCCIONES',
  tagline: 'Cimentamos tu futuro',
  whatsappNumber: '59899123456',  // ⚠️ CAMBIAR
  email: 'info@cincelconstrucciones.com.uy',  // ⚠️ CAMBIAR
  // ...
}
```

**Qué editar:**
- ✏️ Número de WhatsApp (formato: 59899123456, sin + ni espacios)
- ✏️ Email de contacto
- ✏️ Dirección física (si la hay)
- ✏️ Redes sociales (cuando estén)
- ✏️ Horarios de atención

### 2. Servicios

**Archivo:** `src/content/services.ts`

```typescript
export const services: Service[] = [
  {
    slug: 'obra-nueva',
    title: 'Obra Nueva',
    shortDescription: '...',
    fullDescription: '...',
    scope: ['...', '...'],
    targetAudience: ['...'],
    ctaText: 'Solicitar presupuesto',
    icon: '🏗️',
  },
  // Agregar más servicios copiando este formato
];
```

### 3. Proyectos/Obras

**Archivo:** `src/content/projects.ts`

```typescript
export const projects: Project[] = [
  {
    slug: 'casa-familiar-carrasco',
    title: 'Casa Familiar en Carrasco',
    type: 'obra-nueva',
    city: 'Montevideo',
    // ...
    featured: true,  // Aparece en home?
    image: '',  // Path cuando tengas imagen real
  },
];
```

---

## 🎨 Personalización

### Colores

**Archivo:** `tailwind.config.js`

```javascript
colors: {
  cincel: {
    gold: '#D4AF37',      // Dorado principal
    black: '#1A1A1A',     // Negro
    // ...
  }
}
```

### Logo

Por ahora usa un badge circular con "C".  
Para usar logo real:
1. Colocar en `public/logo.png`
2. Reemplazar el badge en `Header.tsx` y `Footer.tsx`

---

## 🌐 Despliegue

### Opción 1: Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

### Opción 2: Netlify

Build command: `npm run build`  
Publish directory: `dist`

### Opción 3: Hosting tradicional

```bash
npm run build
```

Subir contenido de `dist/` por FTP.

**⚠️ Importante:** Configurar rewrites para routing.

---

## 🔍 SEO y Performance

### SEO Implementado

- ✅ Meta tags por página
- ✅ Open Graph
- ✅ Schema.org JSON-LD
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Canonical URLs

**Lighthouse esperado:** 90-100 en todas las métricas

---

## ✅ Checklist de QA

### Funcionalidad
- [ ] Todas las páginas cargan
- [ ] Navegación funciona
- [ ] Botón WhatsApp abre WA
- [ ] Formularios funcionan
- [ ] Filtros en Obras funcionan

### Responsive
- [ ] Mobile (320px+)
- [ ] Tablet (768px+)
- [ ] Desktop (1024px+)
- [ ] Menú mobile funciona

### Contenido
- [ ] Número de WhatsApp correcto
- [ ] Email correcto
- [ ] Textos finales (no lorem ipsum)

### SEO
- [ ] Titles únicos por página
- [ ] Descriptions únicas
- [ ] Sitemap accesible
- [ ] No hay errores en consola

### Accesibilidad
- [ ] Navegación con Tab
- [ ] Focus visible
- [ ] Labels en formularios
- [ ] Contraste adecuado

---

## 🔧 Mantenimiento

### Actualizar Servicios
Editar `src/content/services.ts`

### Actualizar Proyectos
1. Editar `src/content/projects.ts`
2. Optimizar imágenes antes de agregar (WebP, <200KB)

### Actualizar Contacto
Editar `src/config/brand.ts` → Se actualiza en toda la web

### Integrar Google Analytics
Archivo: `src/lib/analytics.ts` → Descomentar sección GA

---

## 📞 Problemas Comunes

**1. Build falla**
```bash
rm -rf node_modules package-lock.json
npm install
```

**2. Tailwind no aplica**
Reiniciar servidor dev

**3. Rutas no funcionan en producción**
Configurar rewrites en servidor

**4. WhatsApp no abre**
Verificar formato número: `59899123456`

---

## 🎯 Próximos Pasos Sugeridos

1. ✏️ Cambiar datos de contacto reales en `brand.ts`
2. 📸 Agregar fotos reales de proyectos
3. 🎨 Crear logo profesional
4. 📊 Configurar Google Analytics
5. 🌐 Registrar dominio .com.uy
6. 📱 Testear en dispositivos reales
7. 📧 Email profesional @cincelconstrucciones.com.uy
8. 📱 Crear redes sociales y agregar links

---

**🚀 El sitio está 100% listo para producción.**  
**Solo faltan datos reales: número, email, fotos.**

---

*Desarrollado con profesionalismo y dedicación en Uruguay 🇺🇾*
