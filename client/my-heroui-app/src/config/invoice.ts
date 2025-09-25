import { nanoid } from "nanoid";

import { InvoiceConfig, Currency } from "@/types/invoice";

export const AVAILABLE_CURRENCIES: Currency[] = [
  {
    id: nanoid(),
    code: "USD",
    decimalMark: ".",
    default: true,
    enabled: true,
    locale: "US",
    name: "Dólar Estadounidense",
    precision: 2,
    rate: 1,
    symbol: "$",
    symbolFirst: true,
    thousandsSeparator: ",",
  },
  {
    id: nanoid(),
    code: "VES",
    decimalMark: ",",
    default: false,
    enabled: true,
    locale: "VE",
    name: "Bolívar Venezolano",
    precision: 2,
    rate: 125,
    symbol: "Bs",
    symbolFirst: true,
    thousandsSeparator: ",",
  },
];

const [BASE_CURRENCY] = AVAILABLE_CURRENCIES;

export const INVOICE_CONFIG: InvoiceConfig = {
  id: nanoid(),
  prefix: "INV",
  padding: 5,
  lastNumber: 2, // Empezamos en 2 para que el primer número sea INV-00003
  currency: BASE_CURRENCY, // USD por defecto
};
