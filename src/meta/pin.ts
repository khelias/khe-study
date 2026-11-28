/**
 * The parent's PIN (ADR 0005 point 6): a soft gate that keeps a child out of
 * the focus setting, kept as a salted SHA-256 hash, never as the digits.
 */

import type { ParentPin } from './types';

export const PIN_LENGTH = 4;

export const isPinShaped = (pin: string): boolean => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);

const hex = (bytes: ArrayBuffer | Uint8Array): string =>
  [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function digest(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  return hex(await crypto.subtle.digest('SHA-256', data));
}

export async function createPin(pin: string): Promise<ParentPin> {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  return { salt, hash: await digest(pin, salt) };
}

export async function checkPin(stored: ParentPin, pin: string): Promise<boolean> {
  return isPinShaped(pin) && (await digest(pin, stored.salt)) === stored.hash;
}
