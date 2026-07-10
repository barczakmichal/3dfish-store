import { Resend } from 'resend';

let _client: Resend | null = null;

export function getResendClient(): Resend {
  if (!_client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY nie jest ustawiony');
    _client = new Resend(apiKey);
  }
  return _client;
}

export const FROM_ADDRESS = 'zamowienia@treefish.pl';
export const RESEND_ENABLED = !!process.env.RESEND_API_KEY;
