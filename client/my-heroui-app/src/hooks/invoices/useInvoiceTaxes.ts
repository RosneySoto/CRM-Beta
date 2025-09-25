import { useMemo } from "react";
import { Control, FieldValues, useFieldArray, useFormContext } from "react-hook-form";

import { useWatchMultiple } from "../use-watch";

import { Invoice, InvoiceItem, Tax, TaxSelector } from "@/types/invoice";
import { nanoid } from "nanoid";

type UseInvoiceTaxesProps = {
  itemsPath?: "invoice.items";
  itemIndex: number;
  defaultTax: Tax;
  control: Control<Invoice>;
};

type TFieldValues = FieldValues;

export const useInvoiceTaxes = ({
  itemsPath = "invoice.items",
  itemIndex,
  defaultTax,
  control,
}: UseInvoiceTaxesProps) => {
  if (!control) throw new Error("Control is required");

  const form = useFormContext<Invoice>();

  const { fields, append, remove, update } = useFieldArray({
    name: `${itemsPath}.${itemIndex}.taxes` as const,
  });

  // const form = useFormContext<TFieldValues>();

  const multipleWatch = useWatchMultiple(control, [
    `${itemsPath}.${itemIndex}`,
    `${itemsPath}.${itemIndex}.taxes`,
  ]);

  const items = multipleWatch.getFieldValue(`${itemsPath}.${itemIndex}`) as InvoiceItem;
  const taxes = multipleWatch.getFieldValue(`${itemsPath}.${itemIndex}.taxes`) as TaxSelector[];
  
 
  /**
   * Calculate tax amount for a single item
   */
  const calculateItemTaxes = (item: InvoiceItem, taxSelector: TaxSelector) => {
    if (!item?.taxes?.length && !taxSelector) return 0;

    let totalTax = 0;

    if (taxSelector.id) {
      const subtotal = item.price * item.quantity;
    
  
      const tax = item.taxes.find((tax) => tax.id == taxSelector.id)
  
      if (tax && tax.selectedTax) {
        const taxAmount = (subtotal * tax.selectedTax.percentage) / 100;
  
        totalTax += taxAmount;
      }
    }

    // item.taxes.forEach((taxSelector: TaxSelector) => {
    //   if (taxSelector.selectedTax) {
    //     const taxAmount = (subtotal * taxSelector.selectedTax.percentage) / 100;

    //     totalTax += taxAmount;
    //   }
    // });

    return totalTax;
  };

  // /**
  //  * Calculate total taxes for all items
  //  */
  // const calculateTotalTaxes = useMemo(() => {
  //   if (!items?.length) return 0;

  //   return items.reduce((total: number, item: InvoiceItem) => {
  //     return total + calculateItemTaxes(item);
  //   }, 0);
  // }, [items]);

  // /**
  //  * Get available tax rates that aren't already applied to an item
  //  */
  // const getAvailableTaxRates = (itemIndex: number): Tax[] => {
  //   const item = items[itemIndex] as InvoiceItem;

  //   if (!item || !item.taxes) return [...taxRates];

  //   const appliedTaxIds = item.taxes
  //     .map((taxSelector) => taxSelector.selectedTax?.id)
  //     .filter(Boolean);

  //   return taxRates.filter((tax) => !appliedTaxIds.includes(tax.id));
  // };

  // /**
  //  * Add a tax rate to an item
  //  */
  const addTaxToItem = (tax: Tax) => {

    const exists = (items?.taxes || []).some((t: TaxSelector) => t.selectedTax?.id === tax.id);

    if (exists) return false;

    append({
      id: nanoid(),
      selectedTax: tax,
    } as TaxSelector);

    return true;
  };

  // /**
  //  * Remove a tax from an item
  //  */
  const removeTaxFromItem = (taxId: string) => {
    const idx = fields.findIndex((f) => f.id === taxId);
    
    if (idx === -1) return false;

    remove(idx);

    return true;
  };

  // /**
  //  * Update a tax on an item
  //  */
  const updateTaxById = (taxId: string, updates: Partial<Tax>) => {
    console.log({taxId, updates});
    
    const idx = fields.findIndex((f) => f.id === taxId);
    if (idx === -1) return false;

    const current = form.getValues(`${itemsPath}.${itemIndex}.taxes.${idx}`) as TaxSelector | undefined;

    if (!current?.selectedTax) return false;

    update(idx, {
      ...current,
      selectedTax: { ...current.selectedTax, ...updates },
    });
    return true;
  };

  return {
    items,
    taxRates: fields,
    watchTaxes: taxes,
    // totalTaxes: calculateTotalTaxes,
    calculateItemTaxes,
    // getAvailableTaxRates,
    addTax: addTaxToItem,
    removeTax: removeTaxFromItem,
    updateTax: updateTaxById,
  };
};

export default useInvoiceTaxes;
