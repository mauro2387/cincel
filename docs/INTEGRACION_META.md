# Integración Facebook e Instagram Messenger

## 📋 Configuración

### 1. Crear App en Meta Developers

1. Ve a [developers.facebook.com/apps](https://developers.facebook.com/apps/)
2. Clic en **"Crear App"**
3. Selecciona tipo: **"Empresa"** o **"Consumidor"**
4. Nombre de la app: `Cincel CRM`

### 2. Agregar producto Messenger

1. En el dashboard de tu app, busca **"Messenger"**
2. Clic en **"Configurar"**

### 3. Obtener credenciales

#### Page Access Token:
1. Ve a **Messenger → Configuración → Generar token**
2. Selecciona tu página de Facebook
3. Copia el **Page Access Token** (comienza con `EAA...`)

#### Page ID:
1. Ve a tu página de Facebook
2. Configuración → Acerca de
3. Copia el **ID de la página**

#### App Secret:
1. En el dashboard de la app, ve a **Configuración → Básica**
2. Copia el **Secreto de la app** (App Secret)

### 4. Configurar Webhook

#### URL del webhook:
```
https://tu-dominio.com/api/webhooks/meta
```

Para desarrollo local, usa **ngrok**:
```bash
ngrok http 5173
# Usa la URL HTTPS que te da ngrok
```

#### Configuración en Meta:
1. Ve a **Messenger → Configuración → Webhooks**
2. Clic en **"Editar URL de devolución de llamada"**
3. URL de devolución de llamada: `https://tu-dominio.com/api/webhooks/meta`
4. Verificar token: `cincel_webhook_2024`
5. Campos de suscripción:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `message_deliveries`
   - ✅ `message_reads`

### 5. Conectar Instagram (Opcional)

1. Ve a **Instagram → Configuración**
2. Conecta tu cuenta de Instagram Business
3. Debe estar vinculada a tu página de Facebook
4. Los mensajes de Instagram usarán el mismo token

## 🔧 Variables de entorno

Crea un archivo `.env.local` con:

```env
VITE_META_PAGE_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxx...
VITE_META_PAGE_ID=123456789012345
VITE_META_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_META_VERIFY_TOKEN=cincel_webhook_2024
```

## 🚀 Uso en el CRM

1. Ve a **Admin → Integraciones**
2. Ingresa tus credenciales
3. Clic en **"Conectar"**
4. Clic en **"Probar Conexión"**
5. Los mensajes aparecerán automáticamente en **Inbox**

## 📱 Funcionalidades

- ✅ Recibir mensajes de Facebook Messenger
- ✅ Recibir mensajes de Instagram Direct
- ✅ Enviar respuestas desde el CRM
- ✅ Ver perfil del contacto (nombre, foto)
- ✅ Marcar mensajes como leídos
- ✅ Indicador de "escribiendo..."
- ✅ Unificación en un solo Inbox

## 🔐 Permisos requeridos

Tu app necesita estos permisos:
- `pages_messaging` - Enviar/recibir mensajes
- `pages_read_engagement` - Leer interacciones
- `instagram_basic` - Instagram básico
- `instagram_manage_messages` - Gestionar mensajes de IG

## 🧪 Probar la integración

1. Envía un mensaje a tu página desde Facebook/Instagram
2. El mensaje debe aparecer en el **Inbox** del CRM
3. Responde desde el CRM
4. El usuario recibirá tu respuesta en Facebook/Instagram

## ⚠️ Limitaciones

- Necesitas una página de Facebook verificada
- Instagram requiere cuenta Business vinculada
- El webhook debe ser HTTPS
- Límite de 1000 conversaciones gratuitas/mes (luego ~$0.005/msg)

## 🛠️ Backend (Próximo paso)

Actualmente el webhook está documentado pero necesitas implementar el endpoint en tu backend:

```typescript
// Backend endpoint ejemplo (Node.js/Express)
app.get('/api/webhooks/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === 'cincel_webhook_2024') {
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/api/webhooks/meta', (req, res) => {
  // Procesar mensajes entrantes
  const messages = metaService.processWebhook(req.body);
  // Guardar en base de datos y notificar al frontend
  res.sendStatus(200);
});
```

## 📚 Recursos

- [Documentación Messenger Platform](https://developers.facebook.com/docs/messenger-platform)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Webhook Reference](https://developers.facebook.com/docs/messenger-platform/webhooks)
