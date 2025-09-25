import { Control, useFieldArray } from "react-hook-form";
import { nanoid } from "nanoid";

import { useWatch } from "../use-watch";

import { Invoice, InvoiceItem } from "@/types/invoice";

type UseInvoiceItemsProps = {
  name?: "invoice.items";
  defaultValues?: Partial<InvoiceItem>;
  control: Control<Invoice>;
};

export const useInvoiceItems = ({
  control,
  name = "invoice.items",
  defaultValues = {},
}: UseInvoiceItemsProps) => {
  if (!control) throw new Error("Control is required");
  
  const watchedItems = useWatch({
    control,
    name,
  });

  const {
    fields: items,
    append: appendItem,
    remove: removeItem,
    update: updateItem,
    ...fieldArrayMethods
  } = useFieldArray({
    control,
    name,
  });

  /**
   * Add a new invoice item
   */
  const addItem = (itemData: Partial<InvoiceItem> = {}) => {
    const newItem: InvoiceItem = {
      id: nanoid(),
      name: "",
      description: "",
      quantity: 1,
      price: 0,
      total: 0,
      taxes: [],
      currency: defaultValues.currency || {
        code: "USD",
        symbol: "$",
        decimalMark: ".",
        thousandsSeparator: ",",
        precision: 2,
        rate: 1,
        symbolFirst: true,
        enabled: true,
        default: true,
        name: "US Dollar",
        locale: "en-US",
      },
      baseCurrency: defaultValues.baseCurrency || {
        code: "USD",
        symbol: "$",
        decimalMark: ".",
        thousandsSeparator: ",",
        precision: 2,
        rate: 1,
        symbolFirst: true,
        enabled: true,
        default: true,
        name: "US Dollar",
        locale: "en-US",
      },
      ...defaultValues,
      ...itemData,
    };

    const isExisting = items.find((item) => item.key === itemData.key)
    const watchItem = watchedItems.find((item: any) => item.key === isExisting?.key)

    if (isExisting) {

      const payload = {
        ...newItem,
        quantity: isExisting.quantity + 1,
        taxes: watchItem.taxes,
      }

      updateItemTotalById(isExisting.id, payload)

      return newItem;
    }

    if(newItem) appendItem(newItem);

    return newItem;
  };

  /**
   * Update an existing invoice item
   */
  const updateItemById = (id: string, updates: Partial<InvoiceItem>) => {
    const index = items.findIndex((item: any) => item.id === id);

    if (index !== -1) {
      updateItem(index, { ...items[index], ...updates });
    }
  };

  /**
   * Update an existing invoice item total
   */
  const updateItemTotalById = (id: string, updates: Partial<InvoiceItem>) => {
    
    const index = items.findIndex((item: any) => item.id === id);

    if (index !== -1 && updates) {

      const payload = {
        ...items[index],
        ...updates,
        total: (updates.price || 0) * (updates.quantity || 0),
      }

      updateItem(index, payload);
    }
  };

  /**
   * Remove an invoice item by index
   */
  const removeItemByIndex = (index: number) => {
    removeItem(index);
  };


  return {
    items: watchedItems as InvoiceItem[],
    rawItems: items as InvoiceItem[],
    addItem,
    removeItem: removeItemByIndex,
    updateItem: updateItemById,
    updateItemTotal: updateItemTotalById,
    ...fieldArrayMethods,
  };
};

export default useInvoiceItems;
