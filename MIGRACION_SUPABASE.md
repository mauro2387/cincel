# 🚀 Migración a Supabase - Pasos Completados

## ✅ 1. Base de datos creada

Ejecuta este SQL en Supabase (SQL Editor):

```bash
# Archivo: supabase_schema.sql
# Copiar TODO y ejecutar en https://supabase.com/dashboard/project/uqznhtcshtjgleamurog/sql
```

## ✅ 2. Variables de entorno configuradas

Archivo `.env.local` creado con:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## 🔄 3. Actualizar stores (HACER AHORA)

Los stores actuales usan datos estáticos mock. Necesito crear versiones con Supabase para:

- ✅ pipelineStore → **LISTO** (pipelineStore.supabase.ts)
- ⏳ clientesStore
- ⏳ obrasStore  
- ⏳ presupuestosStore
- ⏳ tareasStore
- ⏳ inboxStore
- ⏳ dashboardStore (calculado desde otras tablas)
- ⏳ configStore
- ⏳ authStore

## 🎯 4. Desplegar a Vercel

### Opción A: Por línea de comandos (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link proyecto
vercel link

# 4. Agregar variables de entorno
vercel env add VITE_SUPABASE_URL production
# Pegar: https://uqznhtcshtjgleamurog.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Pegar: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxem5odGNzaHRqZ2xlYW11cm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDY0ODIsImV4cCI6MjA4MzM4MjQ4Mn0.2dZ5_WhhdMfkuM_xnXmK7Dz7dZTQwMAgFLIUcgSv9o8

# 5. Desplegar
vercel --prod
```

### Opción B: Por interfaz web

1. Ve a tu proyecto en Vercel: https://vercel.com/mauro2387/cincel
2. Settings → Environment Variables
3. Agrega:

**VITE_SUPABASE_URL**
```
https://uqznhtcshtjgleamurog.supabase.co
```

**VITE_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxem5odGNzaHRqZ2xlYW11cm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDY0ODIsImV4cCI6MjA4MzM4MjQ4Mn0.2dZ5_WhhdMfkuM_xnXmK7Dz7dZTQwMAgFLIUcgSv9o8
```

4. Deployments → Redeploy → Use existing Build Cache: ❌

## 📝 Estado actual

- ❌ Los stores actuales NO están conectados a Supabase (usan datos mock)
- ✅ El schema SQL está listo
- ✅ Las credenciales están configuradas localmente
- ⏳ Falta actualizar los 9 stores

¿Quieres que actualice TODOS los stores ahora para conectarlos a Supabase?
