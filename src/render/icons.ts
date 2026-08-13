/**
 * SVG icon definitions — inline, tidak butuh font-icon atau external request.
 * Semua icon 48×48, stroke-based untuk draw-in animation pada success.
 */

import type { DialogIconType } from '../types/options';

const ICONS: Record<Exclude<DialogIconType, 'none'>, string> = {
  success: `<svg class="dlg-icon dlg-icon--success" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <path class="dlg-icon__check" d="M13 25L21 33L35 17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  error: `<svg class="dlg-icon dlg-icon--error" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <path d="M16 16L32 32M32 16L16 32" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

  warning: `<svg class="dlg-icon dlg-icon--warning" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M24 4L44 42H4L24 4Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" fill="none"/>
  <line x1="24" y1="19" x2="24" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="24" cy="36" r="1.5" fill="currentColor"/>
</svg>`,

  info: `<svg class="dlg-icon dlg-icon--info" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <circle cx="24" cy="15" r="1.5" fill="currentColor"/>
  <line x1="24" y1="21" x2="24" y2="35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

  question: `<svg class="dlg-icon dlg-icon--question" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <path d="M18 19C18 15.686 20.686 13 24 13C27.314 13 30 15.686 30 19C30 23 24 25 24 29" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="24" cy="35" r="1.5" fill="currentColor"/>
</svg>`,

  loading: `<svg class="dlg-icon dlg-icon--loading" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-opacity="0.25" stroke-width="3" fill="none"/>
  <path d="M44 24C44 13.507 35.493 5 25 5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</svg>`,
};

/**
 * Mengembalikan SVG string untuk icon type yang diberikan.
 * Mengembalikan string kosong untuk 'none'.
 */
export function getIconSvg(type: DialogIconType): string {
  if (type === 'none') return '';
  return ICONS[type];
}
