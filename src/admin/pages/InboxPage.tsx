/**
 * Inbox Page - Inbox Unificado Multi-Canal
 */

import React, { useState, useRef, useEffect } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useInboxStore } from '../store/inboxStore';
import type { CanalMensaje, EstadoConversacion, Conversacion, Mensaje } from '../store/inboxStore';

// Iconos
const WhatsAppIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const TemplateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// Helpers
const getCanalIcon = (canal: CanalMensaje) => {
  switch (canal) {
    case 'whatsapp':
      return <WhatsAppIcon />;
    case 'instagram':
      return <InstagramIcon />;
    case 'facebook':
      return <FacebookIcon />;
    case 'email':
      return <EmailIcon />;
    case 'telefono':
      return <PhoneIcon />;
    default:
      return <EmailIcon />;
  }
};

const getCanalColor = (canal: CanalMensaje) => {
  switch (canal) {
    case 'whatsapp':
      return 'text-green-500 bg-green-100';
    case 'instagram':
      return 'text-pink-500 bg-pink-100';
    case 'facebook':
      return 'text-blue-500 bg-blue-100';
    case 'email':
      return 'text-gray-500 bg-gray-100';
    default:
      return 'text-gray-500 bg-gray-100';
  }
};

const getEstadoColor = (estado: EstadoConversacion) => {
  switch (estado) {
    case 'nueva':
      return 'bg-blue-100 text-blue-700';
    case 'en_progreso':
      return 'bg-yellow-100 text-yellow-700';
    case 'esperando_cliente':
      return 'bg-purple-100 text-purple-700';
    case 'resuelta':
      return 'bg-green-100 text-green-700';
    case 'archivada':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const formatMessageDate = (fecha: string) => {
  const date = parseISO(fecha);
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  if (isYesterday(date)) {
    return 'Ayer';
  }
  return format(date, 'dd/MM/yy');
};

// Componente Lista de Conversaciones
const ConversationList: React.FC<{
  conversations: Conversacion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ conversations, selectedId, onSelect }) => {
  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
            selectedId === conv.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {conv.contacto_avatar ? (
                <img
                  src={conv.contacto_avatar}
                  alt={conv.contacto_nombre}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {conv.contacto_nombre.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Canal badge */}
              <div
                className={`absolute -bottom-1 -right-1 p-1 rounded-full ${getCanalColor(conv.canal)}`}
              >
                {getCanalIcon(conv.canal)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 truncate">{conv.contacto_nombre}</h4>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {conv.ultimo_mensaje_fecha && formatMessageDate(conv.ultimo_mensaje_fecha)}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">{conv.ultimo_mensaje}</p>
              <div className="flex items-center gap-2 mt-1">
                {conv.mensajes_sin_leer > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                    {conv.mensajes_sin_leer}
                  </span>
                )}
                {conv.etiquetas.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente Chat
const ChatView: React.FC<{
  conversation: Conversacion;
  messages: Mensaje[];
  onSendMessage: (content: string) => void;
  onChangeStatus: (status: EstadoConversacion) => void;
}> = ({ conversation, messages, onSendMessage, onChangeStatus }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { plantillas, marcarLeido } = useInboxStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    marcarLeido(conversation.id);
  }, [messages, conversation.id]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const useTemplate = (content: string) => {
    setNewMessage(content);
    setShowTemplates(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {conversation.contacto_avatar ? (
              <img
                src={conversation.contacto_avatar}
                alt={conversation.contacto_nombre}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                {conversation.contacto_nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{conversation.contacto_nombre}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className={`p-1 rounded ${getCanalColor(conversation.canal)}`}>
                  {getCanalIcon(conversation.canal)}
                </span>
                {conversation.contacto_telefono || conversation.contacto_handle || conversation.contacto_email}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={conversation.estado}
              onChange={(e) => onChangeStatus(e.target.value as EstadoConversacion)}
              className={`px-3 py-1.5 text-sm rounded-lg border-0 font-medium ${getEstadoColor(conversation.estado)}`}
            >
              <option value="nueva">Nueva</option>
              <option value="en_progreso">En Progreso</option>
              <option value="esperando_cliente">Esperando Cliente</option>
              <option value="resuelta">Resuelta</option>
              <option value="archivada">Archivada</option>
            </select>
          </div>
        </div>
        {/* Tags */}
        <div className="flex items-center gap-2 mt-2">
          <TagIcon />
          {conversation.etiquetas.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {tag}
            </span>
          ))}
          {conversation.asignado_a && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              <UserIcon /> {conversation.asignado_a}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.es_entrante ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.es_entrante
                  ? 'bg-white border border-gray-200 text-gray-900'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {msg.tipo === 'imagen' && msg.media_url && (
                <img
                  src={msg.media_url}
                  alt="Imagen"
                  className="rounded-lg mb-2 max-w-full"
                />
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.es_entrante ? 'text-gray-400' : 'text-blue-200'
                }`}
              >
                {format(parseISO(msg.fecha), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Templates dropdown */}
      {showTemplates && (
        <div className="absolute bottom-20 left-4 right-4 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
          <div className="p-2 border-b bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700">Respuestas rápidas</h4>
          </div>
          {plantillas.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => useTemplate(tpl.contenido)}
              className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-0"
            >
              <p className="text-sm font-medium text-gray-900">{tpl.nombre}</p>
              <p className="text-xs text-gray-500 truncate">{tpl.contenido}</p>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Respuestas rápidas"
          >
            <TemplateIcon />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Adjuntar imagen"
          >
            <ImageIcon />
          </button>
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
export const InboxPage: React.FC = () => {
  const {
    getConversacionesFiltradas,
    getMensajesByConversacion,
    selectedConversacionId,
    setSelectedConversacion,
    filtroCanal,
    setFiltroCanal,
    busqueda,
    setBusqueda,
    addMensaje,
    cambiarEstado,
    getTotalSinLeer,
    getSinLeerPorCanal,
  } = useInboxStore();

  const conversaciones = getConversacionesFiltradas();
  const selectedConversation = conversaciones.find((c) => c.id === selectedConversacionId);
  const messages = selectedConversacionId ? getMensajesByConversacion(selectedConversacionId) : [];
  const totalSinLeer = getTotalSinLeer();
  const sinLeerPorCanal = getSinLeerPorCanal();

  const canales: { key: CanalMensaje | 'todos'; label: string; icon?: React.ReactNode }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon /> },
    { key: 'instagram', label: 'Instagram', icon: <InstagramIcon /> },
    { key: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
    { key: 'email', label: 'Email', icon: <EmailIcon /> },
  ];

  const handleSendMessage = (content: string) => {
    if (selectedConversacionId) {
      addMensaje({
        conversacion_id: selectedConversacionId,
        contenido: content,
        tipo: 'texto',
        es_entrante: false,
        leido: true,
        fecha: new Date().toISOString(),
      });
    }
  };

  const handleChangeStatus = (status: EstadoConversacion) => {
    if (selectedConversacionId) {
      cambiarEstado(selectedConversacionId, status);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Sidebar - Lista de conversaciones */}
      <div className="w-96 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
            {totalSinLeer > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                {totalSinLeer} sin leer
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>
        </div>

        {/* Canal filters */}
        <div className="flex gap-1 p-2 border-b overflow-x-auto">
          {canales.map((canal) => {
            const count = canal.key === 'todos' ? totalSinLeer : sinLeerPorCanal[canal.key as CanalMensaje];
            return (
              <button
                key={canal.key}
                onClick={() => setFiltroCanal(canal.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filtroCanal === canal.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {canal.icon}
                {canal.label}
                {count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversaciones.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No hay conversaciones</p>
            </div>
          ) : (
            <ConversationList
              conversations={conversaciones}
              selectedId={selectedConversacionId}
              onSelect={setSelectedConversacion}
            />
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-gray-50">
        {selectedConversation ? (
          <ChatView
            conversation={selectedConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            onChangeStatus={handleChangeStatus}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <EmailIcon />
              </div>
              <p className="text-lg font-medium">Selecciona una conversación</p>
              <p className="text-sm">Elige una conversación del panel izquierdo para ver los mensajes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
