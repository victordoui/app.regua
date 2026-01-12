/**
 * PIX Payment Utilities
 * Generates static PIX codes following BACEN EMV standard
 */

// CRC16 calculation for PIX payload validation
const CRC16_POLYNOMIAL = 0x1021;

function crc16(payload: string): string {
  let crc = 0xFFFF;
  const bytes = new TextEncoder().encode(payload);
  
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ CRC16_POLYNOMIAL;
      } else {
        crc = crc << 1;
      }
    }
  }
  
  crc &= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTLV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

export interface PixPaymentData {
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid?: string;
  description?: string;
}

/**
 * Generates a static PIX code following EMV standard
 */
export function generatePixCode(data: PixPaymentData): string {
  const {
    pixKey,
    merchantName,
    merchantCity,
    amount,
    txid = '',
    description = ''
  } = data;

  // Payload Format Indicator
  let payload = formatTLV('00', '01');
  
  // Merchant Account Information (PIX)
  const gui = formatTLV('00', 'BR.GOV.BCB.PIX'); // GUI
  const key = formatTLV('01', pixKey); // PIX Key
  const desc = description ? formatTLV('02', description.substring(0, 72)) : '';
  const merchantAccountInfo = `${gui}${key}${desc}`;
  payload += formatTLV('26', merchantAccountInfo);
  
  // Merchant Category Code
  payload += formatTLV('52', '0000');
  
  // Transaction Currency (986 = BRL)
  payload += formatTLV('53', '986');
  
  // Transaction Amount
  if (amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += formatTLV('54', formattedAmount);
  }
  
  // Country Code
  payload += formatTLV('58', 'BR');
  
  // Merchant Name (max 25 chars)
  const normalizedName = merchantName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 25);
  payload += formatTLV('59', normalizedName);
  
  // Merchant City (max 15 chars)
  const normalizedCity = merchantCity
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 15);
  payload += formatTLV('60', normalizedCity);
  
  // Additional Data Field Template (txid)
  if (txid) {
    const txidField = formatTLV('05', txid.substring(0, 25));
    payload += formatTLV('62', txidField);
  }
  
  // CRC16 placeholder (will be calculated)
  payload += '6304';
  
  // Calculate CRC16
  const crc = crc16(payload);
  payload = payload.slice(0, -4) + formatTLV('63', crc);
  
  return payload;
}

/**
 * Generates a unique transaction ID for the payment
 */
export function generateTxId(prefix: string = 'NR'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`.substring(0, 25);
}

/**
 * Formats a phone number to PIX key format (+55...)
 */
export function formatPhoneToPixKey(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55')) {
    return `+${digits}`;
  }
  return `+55${digits}`;
}

/**
 * Validates if a string is a valid PIX key
 */
export function validatePixKey(key: string, type: PixPaymentData['pixKeyType']): boolean {
  switch (type) {
    case 'cpf':
      return /^\d{11}$/.test(key.replace(/\D/g, ''));
    case 'cnpj':
      return /^\d{14}$/.test(key.replace(/\D/g, ''));
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key);
    case 'phone':
      return /^\+?\d{10,14}$/.test(key.replace(/\D/g, ''));
    case 'random':
      return /^[a-f0-9-]{32,36}$/i.test(key);
    default:
      return false;
  }
}

/**
 * Formats currency to Brazilian Real
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
