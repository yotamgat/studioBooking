// lib/pelecard.ts
// Based on PeleCard Iframe/Redirect Programmer Manual 11/2024

const PELECARD_INIT_URL = 'https://gateway21.pelecard.biz/PaymentGW/init';
const PELECARD_VALIDATE_URL = 'https://gateway21.pelecard.biz/PaymentGW/ValidateByUniqueKey';
const PELECARD_GET_TRANSACTION_URL = 'https://gateway21.pelecard.biz/PaymentGW/GetTransaction';

interface PelecardInitResponse {
  URL?: string;
  ConfirmationKey?: string;
  Error?: {
    ErrCode: number;
    ErrMsg?: string;
  };
  // Some responses use StatusCode style
  StatusCode?: string;
  ErrorMessage?: string;
}

interface PelecardValidateResponse {
  StatusCode: string;
  ErrorMessage?: string;
}

export interface CreatePaymentUrlParams {
  bookingId: string;
  totalAmount: number;
  goodUrl: string;
  errorUrl: string;
}

export async function createPaymentUrl(params: CreatePaymentUrlParams): Promise<string> {
  const { bookingId, totalAmount, goodUrl, errorUrl } = params;

  const payload = {
    terminal: process.env.PELECARD_TERMINAL,
    user: process.env.PELECARD_USER,
    password: process.env.PELECARD_PASSWORD,
    GoodURL: goodUrl,
    ErrorURL: errorUrl,
    ActionType: 'J4',
    Currency: '1',
    Total: String(Math.round(totalAmount * 100)),
    ShopNo: process.env.PELECARD_SHOP_NUMBER || '001',
    UserKey: bookingId,
    ParamX: bookingId.slice(-19),
    MaxPayments: '1',
    MinPayments: '1',
    Language: 'HE',
    Cvv2Field: 'must',
    FeedbackDataTransferMethod: 'GET',
  };

  const response = await fetch(PELECARD_INIT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  console.log('PeleCard INIT HTTP status:', response.status);
  console.log('PeleCard INIT raw response:', rawText);

  if (!response.ok) {
    throw new Error(`PeleCard init failed with HTTP ${response.status}: ${rawText}`);
  }

  let data: PelecardInitResponse;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`PeleCard returned non-JSON response: ${rawText}`);
  }

  // PeleCard returns { URL, ConfirmationKey, Error: { ErrCode: 0 } } on success
  if (data.Error && data.Error.ErrCode !== 0) {
    throw new Error(`PeleCard init error: ${data.Error.ErrCode} - ${data.Error.ErrMsg}`);
  }

  if (!data.URL) {
    throw new Error(`PeleCard did not return a payment URL. Response: ${rawText}`);
  }

  return data.URL;
}

export async function verifyPayment(params: {
  confirmationKey: string;
  userKey: string;
  totalAmount: number;
}): Promise<boolean> {
  const { confirmationKey, userKey, totalAmount } = params;

  const payload = {
    ConfirmationKey: confirmationKey,
    UniqueKey: userKey,
    TotalX100: String(Math.round(totalAmount * 100)),
  };

  const response = await fetch(PELECARD_VALIDATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`PeleCard validate failed with HTTP ${response.status}`);
  }

  const rawText = await response.text();
  console.log('PeleCard VALIDATE raw response:', rawText);

  const trimmed = rawText.trim();

  // PeleCard returns plain "1" = valid, "0" = invalid
  if (trimmed === '1' || trimmed === '"1"') return true;
  if (trimmed === '0' || trimmed === '"0"') return false;

  // Fallback: try JSON
  try {
    const data = JSON.parse(trimmed);
    const code = data.StatusCode ?? data.statusCode ?? data.Result ?? data.result;
    return code === '1' || code === 1 || code === '000';
  } catch {
    console.error('Could not parse PeleCard validate response:', rawText);
    return false;
  }
}

export async function getTransaction(transactionId: string) {
  const payload = {
    terminal: process.env.PELECARD_TERMINAL,
    user: process.env.PELECARD_USER,
    password: process.env.PELECARD_PASSWORD,
    TransactionId: transactionId,
  };

  const response = await fetch(PELECARD_GET_TRANSACTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`PeleCard getTransaction failed with HTTP ${response.status}`);
  }

  return response.json();
}
