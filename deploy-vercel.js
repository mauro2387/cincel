#!/usr/bin/env node

/**
 * Script para configurar variables de entorno en Vercel
 * Ejecutar: node deploy-vercel.js
 */

const { execSync } = require('child_process');

const ENV_VARS = {
  'VITE_SUPABASE_URL': 'https://uqznhtcshtjgleamurog.supabase.co',
  'VITE_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxem5odGNzaHRqZ2xlYW11cm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDY0ODIsImV4cCI6MjA4MzM4MjQ4Mn0.2dZ5_WhhdMfkuM_xnXmK7Dz7dZTQwMAgFLIUcgSv9o8'
};

console.log('🚀 Configurando variables en Vercel...\n');

// Verificar que Vercel CLI esté instalado
try {
  execSync('vercel --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Vercel CLI no está instalado.');
  console.log('\n📦 Instala con: npm i -g vercel');
  console.log('🔑 Luego ejecuta: vercel login\n');
  process.exit(1);
}

// Configurar variables
for (const [key, value] of Object.entries(ENV_VARS)) {
  try {
    console.log(`Setting ${key}...`);
    execSync(`echo "${value}" | vercel env add ${key} production`, {
      stdio: 'inherit'
    });
    console.log(`✅ ${key} configured\n`);
  } catch (error) {
    console.log(`⚠️  ${key} might already exist, skipping...\n`);
  }
}

console.log('\n✅ Variables configuradas!');
console.log('\n🚀 Despliega con: vercel --prod');
