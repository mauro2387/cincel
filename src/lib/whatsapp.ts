/**
 * Utilidades para WhatsApp - CINCEL CONSTRUCCIONES
 * 
 * Funciones helper para generar enlaces y mensajes de WhatsApp
 */

import { brandConfig } from '../config/brand';

/**
 * Genera un enlace de WhatsApp con mensaje predefinido
 * @param message - Mensaje a enviar
 * @returns URL de WhatsApp lista para usar
 */
export const generateWhatsAppLink = (message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${brandConfig.whatsappNumber}?text=${encodedMessage}`;
};

/**
 * Genera mensaje de WhatsApp para consulta general
 */
export const getGeneralWhatsAppMessage = (name?: string): string => {
  return brandConfig.whatsappMessages.general(name);
};

/**
 * Genera mensaje de WhatsApp para un servicio específico
 */
export const getServiceWhatsAppMessage = (serviceName: string, name?: string): string => {
  return brandConfig.whatsappMessages.service(serviceName, name);
};

/**
 * Genera mensaje de WhatsApp para un proyecto
 */
export const getProjectWhatsAppMessage = (projectName: string): string => {
  return brandConfig.whatsappMessages.project(projectName);
};

/**
 * Genera mensaje de WhatsApp desde formulario de cotización
 */
export const getQuoteWhatsAppMessage = (formData: Record<string, string>): string => {
  return brandConfig.whatsappMessages.quote(formData);
};

/**
 * Abre WhatsApp con mensaje en una nueva ventana
 */
export const openWhatsApp = (message: string): void => {
  const link = generateWhatsAppLink(message);
  window.open(link, '_blank', 'noopener,noreferrer');
};
