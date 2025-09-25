import { z } from "zod";

// Esquema para moneda
export const currencySchema = z.object({
  id: z.string().optional(),
  // código de la moneda
  code: z.string().min(1, "El código de moneda es requerido"),
  // separador decimal
  decimalMark: z.string().min(1, "El decimal mark es requerido"),
  // si la moneda es la predeterminada
  default: z.boolean().optional().nullable(),
  // si la moneda está habilitada
  enabled: z.boolean().optional().nullable(),
  // locale para formateo internacional (ej: "en-US", "es-ES")
  locale: z.string().min(1, "El locale es requerido"),
  // nombre de la moneda
  name: z.string().min(1, "El nombre de la moneda es requerido"),
  // precisión de la moneda
  precision: z
    .number()
    .min(0, "La precisión debe ser mayor o igual a 0")
    .max(10, "La precisión debe ser menor o igual a 10"),
  // tasa de cambio
  rate: z.number().positive("La tasa de cambio debe ser positiva"),
  // símbolo de la moneda
  symbol: z.string().min(1, "El símbolo de moneda es requerido"),
  // símbolo antes del número
  symbolFirst: z.boolean().optional().nullable(),
  // separador de miles
  thousandsSeparator: z
    .string()
    .length(1, "El separador de miles debe ser un solo carácter"),
});

export const currencyCreateSchema = z.object({
  // código de la moneda
  code: z.string().min(1, "El código de moneda es requerido"),
  // nombre de la moneda
  name: z.string().min(1, "El nombre de la moneda es requerido"),
  // tasa de cambio
  rate: z.number().positive("La tasa de cambio debe ser positiva"),
  // precisión de la moneda
  precision: z.number().min(0).max(10),
  // símbolo de la moneda
  symbol: z.string().min(1, "El símbolo de moneda es requerido"),
});
