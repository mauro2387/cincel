-- ============================================
-- PASO 1: VERIFICAR SI EL USUARIO EXISTE EN AUTH
-- ============================================
-- Ejecuta SOLO esta consulta primero:

SELECT 
  'Usuario existe en auth.users' as status,
  id, 
  email, 
  created_at,
  confirmed_at
FROM auth.users 
WHERE email = 'admin@cincel.com';

-- ❓ ¿QUÉ HACER SEGÚN EL RESULTADO?
--
-- 📭 SI NO HAY RESULTADOS (vacío):
--    El usuario NO existe en Supabase Auth.
--    Ve al dashboard y créalo manualmente:
--    👉 https://supabase.com/dashboard/project/uqznhtcshtjgleamurog/auth/users
--    
--    1. Clic en "Add user" → "Create new user"
--    2. Email: admin@cincel.com
--    3. Password: cincel2024
--    4. ✅ Marca "Auto Confirm User" (IMPORTANTE)
--    5. Clic en "Create user"
--    6. Después de crearlo, vuelve aquí y ejecuta el PASO 2
--
-- ✅ SI HAY UN RESULTADO:
--    ¡Perfecto! El usuario ya existe.
--    Copia el UUID que aparece en la columna "id"
--    Continúa al PASO 2

-- ============================================
-- PASO 2: SINCRONIZAR IDs ENTRE auth.users Y public.users
-- ============================================
-- Ejecuta esta consulta para sincronizar el ID:

UPDATE public.users 
SET id = '54ba39d0-af98-4d41-a6a5-284b08db9cfc'
WHERE email = 'admin@cincel.com';

-- Si funciona correctamente, verás: "UPDATE 1"

-- ============================================
-- PASO 3: VERIFICAR QUE TODO ESTÉ SINCRONIZADO
-- ============================================
-- Ejecuta esta consulta para confirmar que los IDs coinciden:

SELECT 
  au.id as auth_id,
  au.email as auth_email,
  au.confirmed_at as confirmado,
  u.id as user_id,
  u.name as user_name,
  u.role as user_role,
  CASE 
    WHEN au.id = u.id THEN '✅ IDs COINCIDEN - Todo correcto'
    WHEN u.id IS NULL THEN '⚠️ Falta registro en public.users'
    ELSE '❌ IDs NO COINCIDEN - Ejecuta PASO 2'
  END as estado
FROM auth.users au
LEFT JOIN public.users u ON au.email = u.email
WHERE au.email = 'admin@cincel.com';

-- Si ves "✅ IDs COINCIDEN", ¡ya puedes iniciar sesión!
-- Si ves "❌ IDs NO COINCIDEN", ejecuta el PASO 2 correctamente
