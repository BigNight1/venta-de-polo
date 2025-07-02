import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number) {
  // Si el valor es entero, no mostrar decimales
  if (Number.isInteger(value)) {
    return `S/ ${value}`;
  }
  // Si tiene decimales, mostrar dos decimales
  return `S/ ${value.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `ORD-${timestamp.slice(-6)}${random}`;
}