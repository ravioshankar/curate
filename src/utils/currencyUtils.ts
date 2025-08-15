export interface CurrencyInfo {
  flag: string;
  symbol: string;
}

export interface Currency {
  code: string;
  name: string;
  flag: string;
}

export const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$', CHF: 'CHF', CNY: '¥', INR: '₹', KRW: '₩',
  SGD: 'S$', HKD: 'HK$', NOK: 'kr', SEK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RUB: '₽',
  BRL: 'R$', MXN: '$', ZAR: 'R', TRY: '₺', AED: 'د.إ', SAR: '﷼', THB: '฿', MYR: 'RM', IDR: 'Rp',
  PHP: '₱', VND: '₫', TWD: 'NT$', NZD: 'NZ$', ILS: '₪', EGP: 'E£', QAR: 'ر.ق', KWD: 'د.ك',
  BHD: '.د.ب', OMR: 'ر.ع.', JOD: 'د.ا', LBP: 'ل.ل', PKR: '₨', BDT: '৳', LKR: 'Rs', NPR: 'Rs',
  AFN: '؋', IRR: '﷼', IQD: 'ع.د', SYP: 'ل.س', YER: '﷼', UZS: 'лв', KZT: '₸', KGS: 'лв',
  TJS: 'SM', TMT: 'T', AZN: '₼', GEL: '₾', AMD: '֏', BGN: 'лв', RON: 'lei', HRK: 'kn',
  RSD: 'дин', BAM: 'KM', MKD: 'ден', ALL: 'L', MDL: 'L', UAH: '₴', BYN: 'Br', ISK: 'kr',
  COP: '$', PEN: 'S/', CLP: '$', ARS: '$', UYU: '$U', PYG: '₲', BOB: 'Bs', VES: 'Bs',
  GYD: '$', SRD: '$', XCD: '$', BBD: '$', BZD: '$', BMD: '$', KYD: '$', JMD: '$',
  TTD: '$', AWG: 'ƒ', ANG: 'ƒ', HTG: 'G', DOP: '$', CUP: '$', NIO: 'C$', CRC: '₡',
  GTQ: 'Q', HNL: 'L', SVC: '$', PAB: 'B/.', XOF: 'CFA', XAF: 'FCFA', GNF: 'FG',
  SLL: 'Le', LRD: '$', GHS: '₵', NGN: '₦', XPF: '₣', FJD: '$', SBD: '$', TOP: 'T$',
  VUV: 'VT', WST: 'T', PGK: 'K', MOP: 'MOP$', BND: '$', LAK: '₭', KHR: '៛',
  MMK: 'K', BTN: 'Nu', MVR: 'Rf', SCR: '₨', MUR: '₨', KMF: 'CF', DJF: 'Fdj',
  SOS: 'Sh', ETB: 'Br', ERN: 'Nfk', SDG: 'ج.س.', SSP: '£', UGX: 'USh', TZS: 'TSh',
  KES: 'KSh', RWF: 'FRw', BIF: 'FBu', MGA: 'Ar', MZN: 'MT', ZMW: 'ZK', BWP: 'P',
  SZL: 'L', LSL: 'L', NAD: '$', AOA: 'Kz', CVE: '$', STN: 'Db', GMD: 'D',
  MAD: 'د.م.', TND: 'د.ت', DZD: 'د.ج', LYD: 'ل.د', MRU: 'UM', CDF: 'FC', ZWL: '$'
};

export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' }, { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' }, { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' }, { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' }, { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' }, { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' }, { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' }, { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' }, { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿' }, { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' }, { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' }, { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' }, { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' }
];

export const getCurrencyInfo = (currencyCode: string): CurrencyInfo => {
  const currency = currencies.find(c => c.code === currencyCode);
  return {
    flag: currency?.flag || '🌍',
    symbol: currencySymbols[currencyCode] || currencyCode
  };
};

export const getCurrencySymbol = (currencyCode: string): string => {
  return currencySymbols[currencyCode] || currencyCode;
};