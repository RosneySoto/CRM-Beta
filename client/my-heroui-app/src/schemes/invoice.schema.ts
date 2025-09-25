import { CalendarDate } from "@internationalized/date";
import { z } from "zod";

import { currencySchema } from "./currencies.schema";

/**
 * ========================================
 * ESQUEMAS ZOD PARA VALIDACIÓN DE FACTURAS
 * ========================================
 *
 * Este archivo contiene todos los esquemas de Zod para validar
 * la estructura de datos del módulo de facturas.
 */

// Esquema para impuesto
export const taxSchema = z.object({
  // etiqueta del impuesto
  label: z.string().min(1, "La etiqueta del impuesto es requerida"),
  // valor del impuesto
  value: z.number().min(0, "El valor del impuesto debe ser mayor o igual a 0"),
  // porcentaje del impuesto
  percentage: z
    .number()
    .min(0)
    .max(100, "El porcentaje debe estar entre 0 y 100"),
});

// Esquema para selector de impuesto
export const taxSelectorSchema = z.object({
  // id del selector
  id: z.string().min(1, "El ID del selector es requerido"),
  // impuesto seleccionado
  selectedTax: taxSchema.nullable(),
});

// Esquema para descuento
export const discountSchema = z.object({
  // tipo de descuento
  type: z.enum(["percentage", "fixed"]),
  // valor del descuento
  value: z.number().min(0, "El valor del descuento debe ser mayor o igual a 0"),
});

// Esquema para item de factura
export const baseItemSchema = z.object({
  // nombre del producto
  name: z.string().min(1, "El nombre del producto es requerido"),
  // descripción del producto
  description: z.string().min(1, "La descripción es requerida"),
  // cantidad del producto
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),
  // precio del producto
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  // impuestos del producto
  taxes: z.array(taxSelectorSchema),
  // moneda del producto
  currency: currencySchema,
  // total de producto con impuestos y descuento
  total: z.number().min(0, "El total debe ser mayor o igual a 0"),
});

export const invoiceItemSchema = z.object({
  ...baseItemSchema.shape,
  // moneda base del producto
  baseCurrency: currencySchema,
});

export const productSchema = z.object({
  ...baseItemSchema.shape,
  // categoría del producto
  category: z.string().min(1, "La categoría es requerida"),
  // moneda base del producto
  baseCurrency: currencySchema,
});

// Esquema para cliente
export const clientSchema = z.object({
  // nombre del cliente
  name: z.string().min(1, "El nombre del cliente es requerido"),
  // email del cliente
  email: z.string().email("El email debe ser válido"),
  // teléfono del cliente
  phone: z.string().min(1, "El teléfono es requerido"),
  // dirección del cliente
  address: z.string().min(1, "La dirección es requerida"),
  // ID fiscal del cliente
  taxId: z.string().min(1, "El ID fiscal es requerido"),
  // nombre de la empresa del cliente
  company: z.string().min(1, "El nombre de la empresa es requerido"),
});

// Esquema para información de la empresa
export const companySchema = z.object({
  title: z.string().min(1, "El título de la empresa es requerido"),
  subtitle: z.string().min(1, "El subtítulo de la empresa es requerido"),
  name: z.string().min(1, "El nombre de la empresa es requerido"),
  email: z
    .string()
    .includes("@", { message: "El email de la empresa debe ser válido" }),
  phone: z.string().min(1, "El teléfono de la empresa es requerido"),
  taxId: z.string().min(1, "El ID fiscal de la empresa es requerido"),
  logoFile: z
    .instanceof(File)
    .refine((file) => file instanceof File, {
      message: "El logo debe ser un archivo",
    })
    .nullable()
    .optional(),
  logoPreview: z.string().nullable().optional(),
});

// Esquema para información de la factura
export const invoiceInfoSchema = z.object({
  // Número de factura
  invoiceNumber: z.string().min(1, "El número de factura es requerido"),
  // Fecha de la factura
  invoiceDate: z
    .object(
      {
        day: z.number().min(1).max(31),
        month: z.number().min(1).max(12),
        year: z.number().min(1000).max(9999),
      },
      { message: "La fecha de la factura debe ser una fecha válida" },
    )
    .refine((date) => date instanceof CalendarDate || "object", {
      message: "La fecha de la factura debe ser una fecha válida",
    }),
  // Fecha de vencimiento
  dueDate: z
    .object(
      {
        day: z.number().min(1).max(31),
        month: z.number().min(1).max(12),
        year: z.number().min(1000).max(9999),
      },
      { message: "La fecha de vencimiento debe ser una fecha válida" },
    )
    .refine((date) => date instanceof CalendarDate || "object", {
      message: "La fecha de vencimiento debe ser una fecha válida",
    })
    .nullable(),
  // Número de pedido
  orderNumber: z.string().min(1, "El número de pedido es requerido"),
  // Notas
  notes: z.string().optional(),
  // Pie de página
  footer: z.string().optional(),
  // Categoría
  category: z.string().optional(),
  // Plantilla
  template: z.string().optional(),
  // Etiquetas
  tags: z.array(z.string()).optional(),
});

// Esquema para la factura completa
export const invoiceSchema = z.object({
  // Información de la empresa
  company: companySchema,
  // Cliente
  client: clientSchema.nullable(),
  // Información de la factura (datos principales)
  invoice: z.object({
    status: z.enum(["draft", "pending", "paid", "overdue", "cancelled"]),
    // Información de la factura (datos principales)
    info: invoiceInfoSchema,
    // Items de la factura
    items: z.array(baseItemSchema).min(1, "Debe agregar al menos un producto"),
    // Descuento
    discount: discountSchema,
    // Moneda de la factura
    currency: currencySchema,
    // Totales calculados
    subtotal: z.number().min(0, "El subtotal debe ser mayor o igual a 0"),
    // Monto del descuento
    discountAmount: z
      .number()
      .min(0, "El monto del descuento debe ser mayor o igual a 0"),
    // Total de impuestos
    totalTaxes: z
      .number()
      .min(0, "El total de impuestos debe ser mayor o igual a 0"),
    // Total
    total: z.number().min(0, "El total debe ser mayor o igual a 0"),
  }),
  // Totales calculados con reconversión de moneda
  totals: z
    .object({
      subtotal: z.number().min(0, "El subtotal debe ser mayor o igual a 0"),
      discountAmount: z
        .number()
        .min(0, "El monto del descuento debe ser mayor o igual a 0"),
      totalTaxes: z
        .number()
        .min(0, "El total de impuestos debe ser mayor o igual a 0"),
      total: z.number().min(0, "El total debe ser mayor o igual a 0"),
    })
    .optional()
    .nullable(),
});
