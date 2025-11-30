import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

// Obtener la fecha y hora actual en hora local de Argentina (sin conversión a UTC)
export function getLocalDateTime() {
  const now = new Date();
  // Ajustar manualmente a UTC-3 (Argentina)
  const offset = now.getTimezoneOffset(); // en minutos
  const localTime = new Date(now.getTime() - (offset * 60000));
  return localTime.toISOString().slice(0, -1); // Remover la 'Z' para indicar que no es UTC
}

// Obtener solo la fecha en formato YYYY-MM-DD en hora local
export function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convertir una fecha a formato YYYY-MM-DD en hora local (para comparaciones)
export function toLocalDateString(date) {
  const d = new Date(date);
  return getLocalDate(d);
}