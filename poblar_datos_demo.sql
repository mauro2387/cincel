-- ============================================
-- POBLAR BASE DE DATOS CON DATOS DE EJEMPLO
-- ============================================
-- Ejecuta este script en Supabase SQL Editor para agregar datos de ejemplo

-- ============================================
-- LEADS (prospectos)
-- ============================================
INSERT INTO leads (name, email, phone, company, source, status, probability, estimated_budget, notes, estimated_close_date, responsible_id, created_at, updated_at)
VALUES
  ('Juan Pérez', 'juan@email.com', '011-1234-5678', NULL, 'web', 'new', 50, 5000000, 'Interesado en construir una casa de 150m2', '2024-02-15', '54ba39d0-af98-4d41-a6a5-284b08db9cfc', NOW(), NOW()),
  ('María García', 'maria@empresa.com', '011-9876-5432', 'Empresa García', 'referido', 'contacted', 70, 2000000, 'Reforma integral de departamento. Llamada inicial realizada', '2024-02-28', '54ba39d0-af98-4d41-a6a5-284b08db9cfc', NOW(), NOW()),
  ('Carlos López', 'carlos@gmail.com', '011-5555-4444', NULL, 'redes_sociales', 'negotiation', 60, 3000000, 'Ampliación de vivienda', '2024-03-10', '54ba39d0-af98-4d41-a6a5-284b08db9cfc', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- CLIENTES
-- ============================================
INSERT INTO clients (name, email, phone, company, type, tax_id, address, city, state, notes, total_value, active_projects, created_at, updated_at)
VALUES
  ('Roberto Sánchez', 'roberto@empresa.com', '011-2222-3333', 'Empresa Sánchez', 'commercial', '20-12345678-9', 'Av. Libertador 1234', 'CABA', 'Buenos Aires', 'Cliente desde 2023', 15000000, 2, NOW(), NOW()),
  ('Ana Martínez', 'ana@gmail.com', '011-4444-5555', NULL, 'residential', NULL, 'Calle 50 N° 456', 'La Plata', 'Buenos Aires', NULL, 3500000, 1, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Obtener IDs de clientes para las obras
DO $$
DECLARE
  cliente_roberto_id UUID;
  cliente_ana_id UUID;
BEGIN
  -- Obtener IDs
  SELECT id INTO cliente_roberto_id FROM clients WHERE email = 'roberto@empresa.com';
  SELECT id INTO cliente_ana_id FROM clients WHERE email = 'ana@gmail.com';
  
  -- ============================================
  -- PROYECTOS/OBRAS
  -- ============================================
  INSERT INTO projects (code, name, description, type, status, client_id, client_name, address, city, state, start_date, estimated_end_date, total_budget, current_cost, progress_percentage, responsible_id, responsible_name, notes, created_at, updated_at)
  VALUES
    ('OBR-2024-001', 'Edificio Comercial - Av. Libertador', 'Construcción de edificio comercial de 5 pisos', 'construction', 'in_progress', cliente_roberto_id, 'Roberto Sánchez', 'Av. Libertador 1234', 'CABA', 'Buenos Aires', '2023-10-01', '2024-08-31', 12000000, 7200000, 60, '54ba39d0-af98-4d41-a6a5-284b08db9cfc', 'Administrador', 'Proyecto en tiempo', NOW(), NOW()),
    ('OBR-2024-002', 'Casa Familiar - La Plata', 'Construcción de vivienda unifamiliar 180m2', 'construction', 'in_progress', cliente_ana_id, 'Ana Martínez', 'Calle 50 N° 456', 'La Plata', 'Buenos Aires', '2024-01-15', '2024-09-30', 3500000, 1750000, 50, '54ba39d0-af98-4d41-a6a5-284b08db9cfc', 'Administrador', NULL, NOW(), NOW()),
    ('OBR-2023-085', 'Reforma Local Comercial', 'Reforma integral de local 80m2', 'remodeling', 'completed', cliente_roberto_id, 'Roberto Sánchez', 'Av. Corrientes 5678', 'CABA', 'Buenos Aires', '2023-11-01', '2024-01-15', 1800000, 1750000, 100, '54ba39d0-af98-4d41-a6a5-284b08db9cfc', 'Administrador', 'Finalizada satisfactoriamente', NOW(), NOW())
  ON CONFLICT (code) DO NOTHING;
END $$;

-- ============================================
-- COTIZACIONES/PRESUPUESTOS
-- ============================================
DO $$
DECLARE
  cliente_roberto_id UUID;
BEGIN
  SELECT id INTO cliente_roberto_id FROM clients WHERE email = 'roberto@empresa.com';
  
  INSERT INTO quotes (code, title, description, client_id, client_name, client_email, status, subtotal, tax_percentage, tax_amount, total, validity_days, created_at, updated_at, sent_at)
  VALUES
    ('COT-2024-001', 'Presupuesto Construcción Galpón Industrial', 'Construcción de galpón industrial 400m2', cliente_roberto_id, 'Roberto Sánchez', 'roberto@empresa.com', 'sent', 8500000, 21, 1785000, 10285000, 30, NOW(), NOW(), NOW()),
    ('COT-2024-002', 'Presupuesto Ampliación Oficinas', 'Ampliación segundo piso para oficinas', cliente_roberto_id, 'Roberto Sánchez', 'roberto@empresa.com', 'draft', 4200000, 21, 882000, 5082000, 30, NOW(), NOW(), NULL)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- ============================================
-- TAREAS
-- ============================================
INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, project_id, created_at, updated_at)
VALUES
  ('Llamar a Juan Pérez', 'Seguimiento de consulta sobre construcción de casa', 'pending', 'high', CURRENT_DATE + INTERVAL '1 day', '54ba39d0-af98-4d41-a6a5-284b08db9cfc', NULL, NOW(), NOW()),
  ('Enviar cotización a María García', 'Preparar y enviar cotización de reforma', 'in_progress', 'high', CURRENT_DATE + INTERVAL '2 days', '54ba39d0-af98-4d41-a6a5-284b08db9cfc', NULL, NOW(), NOW()),
  ('Visita técnica - Carlos López', 'Visita al sitio para relevamiento de ampliación', 'pending', 'medium', CURRENT_DATE + INTERVAL '5 days', '54ba39d0-af98-4d41-a6a5-284b08db9cfc', NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAR DATOS INSERTADOS
-- ============================================
SELECT 'Leads insertados:' as tipo, COUNT(*) as cantidad FROM leads
UNION ALL
SELECT 'Clientes insertados:', COUNT(*) FROM clients
UNION ALL
SELECT 'Proyectos insertados:', COUNT(*) FROM projects
UNION ALL
SELECT 'Cotizaciones insertadas:', COUNT(*) FROM quotes
UNION ALL
SELECT 'Tareas insertadas:', COUNT(*) FROM tasks;

-- ============================================
-- ¡LISTO! Ahora recarga la aplicación web
-- ============================================
