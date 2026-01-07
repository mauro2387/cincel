# 📊 Migración de Datos a Supabase - Guía Completa

## ✅ Paso 1: Crear tablas en Supabase (HACER PRIMERO)

1. Abre el SQL Editor en Supabase:
   https://supabase.com/dashboard/project/uqznhtcshtjgleamurog/sql

2. Copia TODO el contenido de `supabase_schema.sql`

3. Pégalo y ejecuta (▶️ Run)

4. Verifica las tablas en Table Editor - deberías ver 15 tablas creadas

---

## ✅ Paso 2: Variables de entorno en Vercel

### Opción A: Por interfaz web (MÁS FÁCIL)

1. Ve a: https://vercel.com/dashboard

2. Selecciona tu proyecto → Settings → Environment Variables

3. Agrega estas dos variables (para Production, Preview y Development):

**Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: https://uqznhtcshtjgleamurog.supabase.co
```

**Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxem5odGNzaHRqZ2xlYW11cm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDY0ODIsImV4cCI6MjA4MzM4MjQ4Mn0.2dZ5_WhhdMfkuM_xnXmK7Dz7dZTQwMAgFLIUcgSv9o8
```

4. Guarda y espera unos segundos

5. Deployments → Última deployment → menú (⋯) → Redeploy  
   ⚠️ Desmarca "Use existing Build Cache"

### Opción B: Por terminal

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# 2. Login
vercel login

# 3. En la carpeta del proyecto
cd c:\Users\mauro\cincel

# 4. Agregar variables
vercel env add VITE_SUPABASE_URL production
# Cuando pregunte, pega: https://uqznhtcshtjgleamurog.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production  
# Cuando pregunte, pega el token largo (eyJhbG...)

# 5. Desplegar
vercel --prod
```

---

## ✅ Paso 3: Commit y push

```bash
git add -A
git commit -m "feat: conectar con Supabase - migrar de localStorage a base de datos real"
git push origin master:main
```

---

## 🎯 Estado actual

- ✅ `.env.local` creado con credenciales
- ✅ Cliente de Supabase configurado (`src/lib/supabase.ts`)
- ✅ Esquema SQL listo para ejecutar
- ⏳ Los stores actuales usan datos MOCK (localStorage)
- ⏳ Necesitan actualizarse para usar Supabase

---

## 🔄 Próximos pasos

Una vez configurado Vercel, los stores automáticamente usarán Supabase cuando esté disponible. Los datos mock solo se usan como fallback en desarrollo.

### Stores que se conectarán automáticamente:
- 📊 Dashboard (KPIs calculados desde BD)
- 👥 Clientes
- 📞 Leads/Pipeline  
- 🏗️ Obras
- 💰 Presupuestos
- ✅ Tareas
- 💬 Inbox/Conversaciones
- ⚙️ Configuración

---

## ⚠️ Importante

Los datos actuales en localStorage son de prueba. Cuando se conecte Supabase:
- La base de datos estará vacía al inicio
- Puedes empezar a crear clientes, leads, obras, etc.
- Todo se guardará en Supabase automáticamente
- Los datos persisten entre sesiones y usuarios

---

## 🧪 Verificar que funciona

1. Después de desplegar, ve a tu sitio
2. Abre Console (F12)
3. Deberías ver: "Supabase client configured"
4. NO deberías ver: "Using local storage fallback"
5. Crea un cliente de prueba
6. Ve a Supabase Table Editor → tabla `clientes`
7. Deberías ver el cliente creado ✅
