import { useCallback } from "react";

import useInvoiceItems from "./invoices/useInvoiceItems";
import useInvoiceCalculations from "./invoices/useInvoiceCalculations";

import { useForm } from "@/hooks/use-form";
import { useWatch } from "@/hooks/use-watch";
import {
  invoiceSchema,
  Invoice,
  InvoiceItem,
  Tax,
  InvoiceConfig,
} from "@/types/invoice";

type UseInvoiceFormProps = {
  taxes?: Tax[];
  config?: InvoiceConfig;
  defaultValues?: Partial<Invoice>;
};

const useInvoiceForm = ({
  taxes,
  config,
  defaultValues,
}: UseInvoiceFormProps) => {
  // Generate a new invoice number
  const generateInvoiceNumber = useCallback(() => {
    if (!config) return "";

    const timestamp = Date.now().toString().slice(-config?.padding);

    return `${config?.prefix}-${timestamp.padStart(config?.padding, "0")}`;
  }, [config]);

  // Initialize form with default values and validation
  const methods = useForm<Invoice>({
    schema: invoiceSchema,
    defaultValues: {
      ...defaultValues,
      invoice: {
        ...defaultValues?.invoice,
        info: {
          ...defaultValues?.invoice?.info,
          invoiceNumber: generateInvoiceNumber(),
        },
      },
    },
  });

  const { control, setValue, reset } = methods;

  // Initialize sub-hooks
  const invoiceItems = useInvoiceItems({
    control,
    name: "invoice.items",
  });

  // const invoiceTaxes = useInvoiceTaxes({
  //   control,
  //   itemsPath: "invoice.items",
  //   defaultTaxRates: taxes,
  // });

  const calculations = useInvoiceCalculations({
    control,
    itemsPath: "invoice.items",
    discountPath: "invoice.discount",
    currencyPath: "invoice.currency",
  });

  // Watch for changes to update calculated values
  useWatch({
    control,
    name: "invoice.items",
    compute: (items: InvoiceItem[]) => {
      // // Update subtotal when items change
      // const subtotal =
      //   items?.reduce((sum, item) => {
      //     return sum + (item.price || 0) * (item.quantity || 0);
      //   }, 0) || 0;

      // setValue("invoice.subtotal", subtotal);

      // Recalculate taxes
      // const totalTaxes = invoiceTaxes.totalTaxes;

      // setValue("invoice.totalTaxes", totalTaxes);

      // // Recalculate total
      // const discountAmount = calculations.discountAmount;
      // const total = subtotal + totalTaxes - discountAmount;

      // setValue("invoice.total", total);
    },
  });

  // Add a new invoice item
  const addItem = useCallback(
    (itemData: Partial<InvoiceItem>) => {
      
      const newItem = invoiceItems.addItem(itemData);

      return newItem;
    },
    [invoiceItems],
  );

  // Remove an invoice item
  const removeItem = useCallback(
    (index: number) => {
      invoiceItems.removeItem(index);
    },
    [invoiceItems]
  );

  // Update an invoice item
  const updateItem = useCallback(
    (itemId: string, updates: Partial<InvoiceItem>) => {
      invoiceItems.updateItem(itemId, updates);
    },
    [invoiceItems],
  );

  // Update an invoice item
  const updateItemTotal = useCallback(
    (itemId: string, updates: Partial<InvoiceItem>) => {
      invoiceItems.updateItemTotal(itemId, updates);
    },
    [invoiceItems],
  );

  // // Add a tax to an invoice item
  // const addTaxToItem = useCallback(
  //   (itemIndex: number, tax: Tax) => {
  //     invoiceTaxes.addTaxToItem(itemIndex, tax);
  //   },
  //   [invoiceTaxes]
  // );

  // // Remove a tax from an invoice item
  // const removeTaxFromItem = useCallback(
  //   (itemIndex: number, taxId: string) => {
  //     invoiceTaxes.removeTaxFromItem(itemIndex, taxId);
  //   },
  //   [invoiceTaxes]
  // );

  // Reset form to initial values
  const resetForm = useCallback(
    (values: Partial<Invoice> = {}) => {
      reset({
        ...defaultValues,
        ...values,
      });
    },
    [reset]
  );

  return {
    // Form methods
    ...methods,
    form: methods,
    reset: resetForm,

    // Items management
    items: invoiceItems.rawItems,
    watchItems: invoiceItems.items,
    addItem,
    removeItem,
    updateItem,
    updateItemTotal,

    // Taxes management
    // taxRates: invoiceTaxes.taxRates,
    // addTaxToItem,
    // removeTaxFromItem,
    // getAvailableTaxRates: invoiceTaxes.getAvailableTaxRates,

    // Calculations
    calculations: {
      ...calculations,
      // calculateItemTaxes: invoiceTaxes.calculateItemTaxes,
    },

    // Helpers
    generateInvoiceNumber,
  };
};

export default useInvoiceForm;
