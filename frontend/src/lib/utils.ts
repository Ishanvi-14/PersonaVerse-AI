import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatScore(value: number): string {
  return `${Math.round(value * 10)}/10`
}

export function getPersonaColor(personaId: string): string {
  const colors = {
    founder: '#FF6B35', // Saffron
    educator: '#1A936F', // Emerald
    casual: '#004E89', // Indigo
  }
  return colors[personaId as keyof typeof colors] || '#6B7280'
}

export function getPlatformIcon(platform: string): string {
  const icons = {
    linkedin: '💼',
    whatsapp: '💬',
    email: '📧',
    twitter: '🐦',
    instagram: '📸',
    facebook: '👥',
    blog: '📝',
  }
  return icons[platform as keyof typeof icons] || '📱'
}