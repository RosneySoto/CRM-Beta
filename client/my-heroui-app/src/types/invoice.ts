import z from "zod";

import { Currency } from "./currency";

import {
  baseItemSchema,
  clientSchema,
  companySchema,
  discountSchema,
  invoiceInfoSchema,
  invoiceSchema,
  taxSchema,
  taxSelectorSchema,
} from "@/schemes/invoice.schema";

/**
 * Interfaz para la información de la factura
 * Define los datos principales de la factura
 */
type DateStruct = { day: number; month: number; year: number };

/**
 * Interfaz para representar un cliente
 * Contiene toda la información necesaria para facturar a un cliente
 */
export interface Client extends z.infer<typeof clientSchema> {
  id: string; // ID único del cliente
  key?: string; // Clave única del cliente
  name: string; // Nombre completo del cliente
  email: string; // Correo electrónico
  phone: string; // Número de teléfono
  address: string; // Dirección completa
  taxId: string; // Número de identificación fiscal (CIF/NIF)
  company: string; // Nombre de la empresa
}

/**
 * Interfaz para la información de la factura
 * Define los datos principales de la factura
 */
export interface Company extends z.infer<typeof companySchema> {
  title: string;
  subtitle: string;
  name: string;
  email: string;
  phone: string;
  taxId: string;
  logoFile: File | null;
  logoPreview: string | null;
}

/**
 * Interfaz base para items de factura
 * Define la estructura común que comparten productos e items de factura
 */
export interface BaseItem extends z.infer<typeof baseItemSchema> {
  id: string; // ID único del item
  key?: string; // Clave única del item
  name: string; // Nombre del producto/servicio
  description: string; // Descripción detallada
  quantity: number; // Cantidad del item
  price: number; // Precio unitario en la moneda original del producto (USD)
  taxes: TaxSelector[]; // Array de selectores de impuestos aplicados
  currency: Currency; // Moneda original del producto (siempre USD en este sistema)
  total: number; // Total calculado del item (precio * cantidad + impuestos)
}

/**
 * Interfaz para items de factura
 * Extiende BaseItem y representa un producto/servicio en una factura específica
 */
export interface InvoiceItem extends BaseItem {
  taxes: TaxSelector[]; // Selectores de impuestos específicos de esta factura
  baseCurrency: Currency; // Moneda base en la que se creó el producto (siempre USD)
}

/**
 * Interfaz para productos del catálogo
 * Extiende BaseItem y representa un producto en el catálogo del sistema
 */
export interface Product extends BaseItem {
  taxes: TaxSelector[]; // Array de selectores de impuestos aplicados
  category: string; // Categoría del producto
  baseCurrency: Currency; // Moneda base en la que se creó el producto (siempre USD)
}

export interface InvoiceInfo
  extends Omit<z.infer<typeof invoiceInfoSchema>, "dueDate"> {
  id: string;
  key?: string;
  invoiceNumber: string;
  invoiceDate: DateStruct;
  dueDate: DateStruct | null;
  orderNumber: string;
  notes: string;
  footer: string;
  category: string;
  template: string;
  tags: string[];
}

/**
 * Interfaz para la factura completa
 * Representa toda la información de una factura, incluyendo items, cliente, configuración, etc.
 */
export interface Invoice extends z.infer<typeof invoiceSchema> {
  // Información de la empresa
  company: Company;
  // Cliente
  client: Client;
  // Información de la factura (datos principales)
  invoice: {
    status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
    info: InvoiceInfo;
    // Items de la factura
    items: InvoiceItem[];
    // Descuentos
    discount: Discount;
    // Moneda
    currency: Currency;
    // Totales calculados
    subtotal: number;
    discountAmount: number;
    totalTaxes: number;
    total: number;
  };
  // Totales calculados
  totals?: {
    subtotal: number;
    discountAmount: number;
    totalTaxes: number;
    total: number;
  };
}

/**
 * Interfaz para la configuración de la factura
 * Define los parámetros para generar números de factura y configuración por defecto
 */
export interface InvoiceConfig {
  id: string; // ID único de la configuración
  prefix: string; // Prefijo para números de factura (ej: "INV")
  padding: number; // Número de ceros para rellenar (ej: 5 para "00001")
  lastNumber: number; // Último número de factura generado
  currency: Currency; // Moneda por defecto del sistema
}

/**
 * Interfaz para representar un impuesto del sistema
 * Define la estructura de un impuesto que puede aplicarse a los productos
 */
export interface Tax extends z.infer<typeof taxSchema> {
  id: string; // ID opcional para base de datos
  key?: string; // Clave única del impuesto (ej: "iva", "igtf")
  label: string; // Etiqueta para mostrar (ej: "IVA", "IGTF")
  value: number; // Valor numérico del impuesto
  percentage: number; // Porcentaje del impuesto (ej: 16 para 16%)
}

/**
 * Interfaz para representar un selector de impuesto
 * Cada selector permite al usuario elegir un impuesto específico para un producto
 */
export interface TaxSelector extends z.infer<typeof taxSelectorSchema> {
  id: string; // ID único del selector
  selectedTax: Tax | null; // Impuesto seleccionado (null si no hay selección)
}

/**
 * Interfaz para representar un descuento
 * Define si el descuento es por porcentaje o monto fijo
 */
export interface Discount extends z.infer<typeof discountSchema> {
  type: "percentage" | "fixed"; // Tipo de descuento: porcentual o monto fijo
  value: number; // Valor del descuento (porcentaje o monto)
}
export { invoiceSchema };
