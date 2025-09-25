import { useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import useInvoiceForm from "@/hooks/useInvoiceForm";
import { parseDate } from "@internationalized/date";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Save2, Send2, Eye, EyeSlash, ArrowRight2, Add, FilterSearch } from "iconsax-react";

import { nanoid } from "nanoid";
import { useForm } from "@/hooks/use-form";

import { Client as ClientType, Invoice, InvoiceConfig, Product, Tax } from "@/types/invoice";
import { invoiceSchema } from "@/schemes/invoice.schema";
import { Currency } from "@/types/currency";
import z from "zod";
import { useInvoice } from "@/hooks/use-invoice";
import { DevTool } from "@hookform/devtools";
import { FormSelector } from "@/components/form-fields/form-selector";
import InvoiceTotal from "@/components/invoices/invoice-total";


import Company from "@/components/invoices/company";
import Client from "@/components/invoices/client";
import Info from "@/components/invoices/info";
import TableItems from "@/components/invoices/table-items";
import Preview from "@/components/invoices/preview";
import Footer from "@/components/invoices/footer";


const CURRENCIES = [
  {
    id: "USD",
    name: "Dólares (USD)",
    symbol: "$",
    code: "USD",
    rate: 1,
    decimalMark: ".",
    precision: 2,
    symbolFirst: true,
    thousandsSeparator: ",",
    default: true,
    enabled: true,
    locale: "en-US",
  },
  {
    id: "EUR",
    name: "Euros (EUR)",
    symbol: "€",
    code: "EUR",
    rate: 1,
    decimalMark: ".",
    precision: 2,
    symbolFirst: true,
    thousandsSeparator: ",",
    default: true,
    enabled: true,
    locale: "en-US",
  },
  {
    id: "VES",
    name: "Bolívares (VES)",
    symbol: "Bs.",
    code: "VES",
    rate: 1,
    decimalMark: ".",
    precision: 2,
    symbolFirst: true,
    thousandsSeparator: ",",
    default: true,
    enabled: true,
    locale: "en-US",
  },
]

const PAYMENT_METHODS = [
  { value: "transfer", label: "Transferencia Bancaria" },
  { value: "credit_card", label: "Tarjeta de Crédito" },
  { value: "paypal", label: "PayPal" },
  { value: "cash", label: "Efectivo" },
]

const TAXES: Tax[] = [
  {
    id: nanoid(),
    key: "iva",
    label: "IVA",
    value: 16,
    percentage: 16,
  },
  {
    id: nanoid(),
    key: "igtd",
    label: "IGTF",
    value: 12,
    percentage: 12,
  }
]

const DEFAULT_TAX: Tax = {
  id: nanoid(),
  key: "iva",
  label: "IVA",
  value: 16,
  percentage: 16,
}

const DEFAULT_CURRENCY: Currency = {
  id: "USD",
  name: "Dólares (USD)",
  symbol: "$",
  code: "USD",
  rate: 1,
  decimalMark: ".",
  precision: 2,
  symbolFirst: true,
  thousandsSeparator: ",",
  default: true,
  enabled: true,
  locale: "en-US",
};

const INVOICE_CONFIG: InvoiceConfig = {
  id: nanoid(), // ID único de la configuración
  prefix: "INV", // Prefijo para números de factura (ej: "INV")
  padding: 5, // Número de ceros para rellenar (ej: 5 para "00001")
  lastNumber: 0, // Último número de factura generado
  currency: DEFAULT_CURRENCY,
};

const CATEGORIES = [
  { id: nanoid(), key: nanoid(), label: "Ingreso" },
  { id: nanoid(), key: nanoid(), label: "Egreso" },
  { id: nanoid(), key: nanoid(), label: "Deposito" },
]
const TEMPLATES = [
  { id: nanoid(), key: nanoid(), label: "default" },
  { id: nanoid(), key: nanoid(), label: "simple" },
  { id: nanoid(), key: nanoid(), label: "custom" },
]
const TAGS = [
  { id: nanoid(), key: nanoid(), label: "Venta" },
  { id: nanoid(), key: nanoid(), label: "Reparado" },
  { id: nanoid(), key: nanoid(), label: "Nuevo" },
  { id: nanoid(), key: nanoid(), label: "Garantia" },
  { id: nanoid(), key: nanoid(), label: "Devolucion" },
  { id: nanoid(), key: nanoid(), label: "Otros" },
]

// Mock data - replace with actual API calls
const MOCK_PRODUCTS: Product[] = [
  {
    id: nanoid(),
    key: nanoid(),
    name: "Honda",
    description: "Honda Civic",
    price: 120,
    quantity: 1,
    total: 120,
    taxes: [],
    category: "1",
    baseCurrency: DEFAULT_CURRENCY,
    currency: DEFAULT_CURRENCY,
  },
  {
    id: nanoid(),
    key: nanoid(),
    name: "Toyota",
    description: "Toyota Corolla",
    price: 150,
    quantity: 1,
    total: 150,
    taxes: [],
    category: "1",
    baseCurrency: DEFAULT_CURRENCY,
    currency: DEFAULT_CURRENCY,
  },
];
// Mock data - replace with actual API calls
const MOCK_CLIENTS: ClientType[] = [
  {
    id: nanoid(),
    name: "Cliente Ejemplo 1",
    email: "cliente1@example.com",
    phone: "123456789",
    taxId: "123456789",
    address: "123 Main St",
    company: "Company 1",
  },
  {
    id: nanoid(),
    name: "Cliente Ejemplo 2",
    email: "cliente2@example.com",
    phone: "123456789",
    taxId: "123456789",
    address: "456 Elm St",
    company: "Company 2",
  },
];
// Mock data - replace with actual API calls
const defaultValues: Partial<Invoice> = {
  client: {
    id: "",
    name: "",
    email: "",
    phone: "",
    taxId: "",
    address: "",
    company: "",
  },
  invoice: {
    status: "draft",
    info: {
      id: "",
      invoiceNumber: "",
      invoiceDate: parseDate(new Date().toISOString().split("T")[0]),
      dueDate: { day: 0, month: 0, year: 0 },
      orderNumber: "",
      notes: "",
      footer: "",
      category: "",
      template: "",
      tags: [],
    },
    items: [],
    discount: { type: "percentage", value: 0 },
    currency: DEFAULT_CURRENCY,
    subtotal: 0,
    discountAmount: 0,
    totalTaxes: 0,
    total: 0,
  },
  company: {
    title: "Facturas",
    subtitle: "Facturas de Knockturnals",
    name: "Knockturnals",
    email: "contacto@knockturnals.com",
    phone: "+584123456789",
    taxId: "J123456789",
    logoFile: null,
    logoPreview: null,
  },
};

export default function InvoiceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const {
    reset,
    // Items management
    items,
    addItem,
    removeItem,
    updateItemTotal,
    // Calculations
    calculations,
    // Form
    form,
  } = useInvoiceForm({
    defaultValues,
    taxes: TAXES,
    config: INVOICE_CONFIG,
  });

  const onSubmit = async (data: Invoice) => {
    try {
      setIsSubmitting(true);
      console.log("Form submitted:", data);
      // TODO: Replace with actual API call
      // await api.createInvoice(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (

    <Form form={form} onSubmit={onSubmit}>
      <div className="relative mx-auto w-full max-w-[90rem] pb-20 px-5 flex flex-col gap-5">
        <div className="backdrop-blur-sm z-10 flex justify-between items-center py-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Nueva Factura</h1>
            <p className="text-foreground-400 text-sm w-3/4">
              Los datos de facturación aparecen en su factura. La fecha de la
              factura se utiliza en el panel de control e informes. Seleccione la
              fecha que usted espera que se le pague como fecha de vencimiento.
            </p>
          </div>
          <div className="flex gap-2 justify-end py-5">
            <Button
              type="button"
              color="default"
              variant="flat"
              startContent={
                showPreview ? (
                  <EyeSlash size={20} variant="Bold" color="currentColor" />
                ) : (
                  <Eye size={20} variant="Bold" color="currentColor" />
                )
              }
              onPress={togglePreview}
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button
              type="submit"
              color="default"
              variant="flat"
              startContent={
                <Save2 color="currentColor" size={20} variant="Bold" />
              }
            // onPress={handleSaveAsDraft}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              color="primary"
              startContent={
                <Send2 color="currentColor" size={20} variant="Bold" />
              }
            // onPress={handleSendInvoice}
            >
              Send Invoice
            </Button>
          </div>
        </div>

        <div className="flex flex-row gap-1">
          <Card className={`h-full ${showPreview ? 'w-1/2' : 'w-full'}`} shadow="none">
            <CardBody className="flex flex-col gap-8 overflow-visible">

              <div className="flex-1 flex flex-row gap-8">
                <Company />
              </div>

              <div className="flex-1 flex flex-row gap-8">
                <div className="flex-1 w-full flex flex-col gap-4 ">
                  <Client clients={MOCK_CLIENTS} />
                </div>
                <div className="flex-1 flex flex-col flex-wrap gap-5 w-full">
                  <Info />
                </div>
              </div>

              <div className="flex-1 border-t border-divider">
                <div
                  className={
                    `${form.formState.errors.invoice?.items
                      ? 'border border-dashed  bg-danger-50 border-danger'
                      : ''
                    }  rounded-medium cursor-pointer`
                  }
                >
                  <TableItems
                    items={items}
                    control={form.control}

                    taxes={TAXES}
                    defaultTax={DEFAULT_TAX}
                    defaultCurrency={DEFAULT_CURRENCY}

                    removeItem={removeItem}
                    updateItem={updateItemTotal}
                  />

                  <FormSelector
                    canCreateNew={true}
                    isOpen={isOpen}
                    isSearchable={true}
                    // modalFields={modalFields}
                    name="products"
                    options={MOCK_PRODUCTS.map((product: Product) => ({
                      id: product.id,
                      label: product.name,
                      description: product.description,
                      group: "Productos",
                      metadata: product,
                    }))}
                    placeholder="Buscar cliente..."
                    setIsOpen={setIsOpen}
                    // onChange={() => {
                    //   clearErrors("client");
                    // }}
                    onCreateNew={async (formData) => ({
                      id: nanoid(),
                      label: formData.name,
                      description: formData.description || "Producto personalizado",
                      group: "Nuevo producto",
                      metadata: {
                        ...formData
                      },
                    })}
                    onGetMetadata={(metadata: any) => {
                      addItem(metadata);
                    }}
                  >
                    <Button
                      variant="flat"
                      color="primary"
                      startContent={<Add size={25} variant="Outline" />}
                      className="w-full"
                    >
                      Agregar producto
                    </Button>
                  </FormSelector>
                </div>
              </div>

              <InvoiceTotal {...calculations} />

              <Footer 
                categories={CATEGORIES}
                templates={TEMPLATES}
                tags={TAGS}
              />
            </CardBody>
          </Card>

          

          {showPreview && (
            <div className="w-1/2 flex flex-col">
              <div className="sticky top-30 h-fit">
                <Preview
                  company={form.getValues('company')}
                  client={form.getValues('client')}
                  invoice={form.getValues('invoice')}
                  totals={form.getValues('totals')}
                  formatCurrency={calculations.formatCurrency}
                />
              </div>
            </div>
          )}
          <DevTool control={form.control} />
        </div>
      </div>
    </Form>
  );
}
