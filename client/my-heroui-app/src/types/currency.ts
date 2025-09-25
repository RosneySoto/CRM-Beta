import z from "zod";

import { currencySchema } from "@/schemes/currencies.schema";

/**
 * Interfaz para representar una moneda del sistema
 * Contiene toda la información necesaria para formatear y convertir valores monetarios
 */
export interface Currency extends z.infer<typeof currencySchema> {
  id?: string; // ID único de la moneda
  code: string;
  decimalMark: string;
  default: boolean;
  enabled: boolean;
  locale: string;
  name: string;
  precision: number;
  rate: number;
  symbol: string;
  symbolFirst: boolean;
  thousandsSeparator: string;
}
