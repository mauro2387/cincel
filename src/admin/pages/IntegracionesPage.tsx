/**
 * Integraciones Page - Configuración de redes sociales
 */

import React, { useState } from 'react';
import { metaService } from '../services/metaService';

const FacebookIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export const IntegracionesPage: React.FC = () => {
  const [metaConfig, setMetaConfig] = useState({
    pageAccessToken: '',
    pageId: '',
    appSecret: '',
    verifyToken: 'cincel_webhook_2024',
  });

  const [isConnected, setIsConnected] = useState(metaService.isReady());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConnect = () => {
    metaService.configure(metaConfig);
    setIsConnected(true);
    alert('✅ Conexión configurada correctamente');
  };

  const handleTest = async () => {
    if (!metaService.isReady()) {
      setTestResult({ success: false, message: 'Servicio no configurado' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Intentar suscribir webhooks
      const success = await metaService.subscribeToWebhooks();
      
      setTestResult({
        success,
        message: success 
          ? '✅ Conexión exitosa. Webhooks configurados.' 
          : '❌ Error al configurar webhooks. Verifica el token.',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Desconocido'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const webhookUrl = `${window.location.origin}/api/webhooks/meta`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Integraciones</h1>
      <p className="text-gray-500 mb-6">Conecta tus redes sociales al Inbox</p>

      {/* Estado de conexión */}
      <div className={`mb-6 p-4 rounded-lg border ${isConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center gap-2">
          {isConnected ? <CheckIcon /> : <AlertIcon />}
          <span className="font-medium">
            {isConnected ? 'Redes sociales conectadas' : 'Sin conexión a redes sociales'}
          </span>
        </div>
      </div>

      {/* Facebook e Instagram */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <FacebookIcon />
            </div>
            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
              <InstagramIcon />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Facebook e Instagram Messenger</h2>
            <p className="text-sm text-gray-500">Gestiona mensajes de ambas plataformas</p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-900 mb-2">📋 Pasos para configurar:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Ve a <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="underline">developers.facebook.com</a></li>
            <li>Crea una app o usa una existente</li>
            <li>Agrega el producto "Messenger" a tu app</li>
            <li>Ve a Configuración → Básica y copia App Secret</li>
            <li>Ve a Messenger → Configuración y genera un Page Access Token</li>
            <li>Configura el webhook con esta URL: <code className="bg-white px-2 py-1 rounded text-xs">{webhookUrl}</code></li>
            <li>Usa el Verify Token: <code className="bg-white px-2 py-1 rounded text-xs">{metaConfig.verifyToken}</code></li>
            <li>Suscribe a los campos: <code className="bg-white px-2 py-1 rounded text-xs">messages</code>, <code className="bg-white px-2 py-1 rounded text-xs">messaging_postbacks</code></li>
          </ol>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Access Token *
            </label>
            <input
              type="password"
              value={metaConfig.pageAccessToken}
              onChange={(e) => setMetaConfig({ ...metaConfig, pageAccessToken: e.target.value })}
              placeholder="EAAxxxxxxxxxxxxxxxx..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page ID *
            </label>
            <input
              type="text"
              value={metaConfig.pageId}
              onChange={(e) => setMetaConfig({ ...metaConfig, pageId: e.target.value })}
              placeholder="123456789012345"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App Secret *
            </label>
            <input
              type="password"
              value={metaConfig.appSecret}
              onChange={(e) => setMetaConfig({ ...metaConfig, appSecret: e.target.value })}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook Verify Token
            </label>
            <input
              type="text"
              value={metaConfig.verifyToken}
              onChange={(e) => setMetaConfig({ ...metaConfig, verifyToken: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Usa este token al configurar el webhook en Facebook</p>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={handleConnect}
              disabled={!metaConfig.pageAccessToken || !metaConfig.pageId || !metaConfig.appSecret}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isConnected ? 'Actualizar Conexión' : 'Conectar'}
            </button>
            
            <button
              onClick={handleTest}
              disabled={!isConnected || testing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {testing ? (
                <>
                  <RefreshIcon />
                  Probando...
                </>
              ) : (
                'Probar Conexión'
              )}
            </button>
          </div>

          {/* Resultado del test */}
          {testResult && (
            <div className={`p-3 rounded-lg border ${testResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="font-medium text-gray-900 mb-2">💡 Información adicional</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• El webhook debe ser HTTPS (usa ngrok o similar para desarrollo local)</li>
          <li>• Instagram usa la misma API que Facebook Messenger</li>
          <li>• Para Instagram, conecta tu cuenta de IG Business a la página de Facebook</li>
          <li>• Los mensajes aparecerán automáticamente en el Inbox una vez configurado</li>
          <li>• Puedes responder desde el CRM y se enviará a Facebook/Instagram</li>
        </ul>
      </div>

      {/* Próximamente */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed">
        <h3 className="font-medium text-gray-500 mb-2">🚀 Próximamente</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg opacity-50">
            <p className="font-medium text-gray-400">WhatsApp Business</p>
            <p className="text-xs text-gray-400">API oficial de Meta</p>
          </div>
          <div className="bg-white p-3 rounded-lg opacity-50">
            <p className="font-medium text-gray-400">Email (SMTP)</p>
            <p className="text-xs text-gray-400">Gmail, Outlook, etc.</p>
          </div>
          <div className="bg-white p-3 rounded-lg opacity-50">
            <p className="font-medium text-gray-400">Telegram</p>
            <p className="text-xs text-gray-400">Bot API</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegracionesPage;
