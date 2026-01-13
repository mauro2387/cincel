-- ============================================
-- DESACTIVAR ROW LEVEL SECURITY
-- Ejecuta esto PRIMERO antes del schema completo
-- ============================================

ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_costs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quote_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS message_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS esté desactivado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Si la consulta anterior devuelve filas, RLS sigue activo
-- Si devuelve vacío, RLS está desactivado correctamente
