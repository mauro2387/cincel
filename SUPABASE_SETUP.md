# 🚀 Configuración de Supabase para Cincel CRM

## 1️⃣ Crear las tablas en Supabase

1. Ve a tu proyecto: https://supabase.com/dashboard/project/uqznhtcshtjgleamurog
2. En el menú izquierdo, clic en **"SQL Editor"**
3. Clic en **"New query"**
4. Copia TODO el contenido del archivo `supabase_schema.sql`
5. Pégalo en el editor
6. Clic en **"Run"** (▶️)
7. Espera a que se ejecute (puede tardar 10-20 segundos)

✅ Esto creará todas las tablas, índices, triggers y datos iniciales.

## 2️⃣ Verificar que se crearon las tablas

1. En el menú izquierdo, clic en **"Table Editor"**
2. Deberías ver estas tablas:
   - ✅ usuarios
   - ✅ clientes
   - ✅ leads
   - ✅ obras
   - ✅ obras_bitacora
   - ✅ obras_tareas
   - ✅ obras_costos
   - ✅ obras_fotos
   - ✅ presupuestos
   - ✅ presupuestos_items
   - ✅ tareas
   - ✅ conversaciones
   - ✅ mensajes
   - ✅ plantillas_mensajes
   - ✅ configuracion

## 3️⃣ Credenciales ya configuradas

Tu archivo `.env.local` ya tiene:
```
VITE_SUPABASE_URL=https://uqznhtcshtjgleamurog.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## 4️⃣ Siguiente paso: Actualizar los stores

Ahora necesito actualizar los stores de Zustand para que usen Supabase en lugar de localStorage. 

¿Quieres que lo haga ahora?

---

## 📊 Estructura de la base de datos

### Tablas principales:
- **usuarios** - Usuarios del sistema con roles
- **clientes** - Base de datos de clientes
- **leads** - Pipeline de ventas
- **obras** - Proyectos de construcción
- **presupuestos** - Cotizaciones y propuestas
- **tareas** - Sistema de tareas y recordatorios
- **conversaciones/mensajes** - Inbox unificado
- **configuracion** - Ajustes del sistema

### Relaciones:
- 1 cliente → muchos leads
- 1 cliente → muchas obras
- 1 obra → muchos (bitácora, tareas, costos, fotos)
- 1 presupuesto → muchos items
- 1 conversación → muchos mensajes

### Features automáticas:
- ✅ UUIDs como IDs
- ✅ Timestamps automáticos (created_at, updated_at)
- ✅ Triggers para updated_at
- ✅ Índices optimizados
- ✅ Validaciones con CHECK constraints
- ✅ Cascadas en DELETE
