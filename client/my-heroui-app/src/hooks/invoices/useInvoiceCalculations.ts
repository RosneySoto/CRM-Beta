import { useMemo } from "react";
import { Control } from "react-hook-form";

import { useWatchMultiple } from "../use-watch";

import { Invoice, InvoiceItem, Discount, TaxSelector } from "@/types/invoice";
import { Currency } from "@/types/currency";

type UseInvoiceCalculationsProps = {
  itemsPath?: "invoice.items";
  discountPath?: "invoice.discount";
  currencyPath?: "invoice.currency";
  control: Control<Invoice>;
};

export const useInvoiceCalculations = ({
  itemsPath = "invoice.items",
  discountPath = "invoice.discount",
  currencyPath = "invoice.currency",
  control,
}: UseInvoiceCalculationsProps) => {
  if (!control) throw new Error("Control is required");

  const multipleWatch = useWatchMultiple(control, [
    itemsPath,
    discountPath,
    currencyPath,
  ]);

  // Watch for changes in items, discount, and currency
  const items = multipleWatch.getFieldValue(itemsPath) as InvoiceItem[];
  const discount = multipleWatch.getFieldValue(discountPath);
  const currency = multipleWatch.getFieldValue(currencyPath);

  /**
   * Calculate subtotal for all items
   */
  const calculateSubtotal = useMemo(() => {
    if (!items?.length) return 0;

    return items.reduce((total: number, item: InvoiceItem) => {
      return total + item.price * item.quantity;
    }, 0);
  }, [items]);

  /**
   * Calculate total taxes for all items
   */
  const calculateTotalTaxes = useMemo(() => {
    if (!items?.length) return 0;

    return items.reduce((total: number, item: InvoiceItem) => {
      if (!item.taxes?.length) return total;

      const itemSubtotal = item.price * item.quantity;
      let itemTaxes = 0;

      item.taxes.forEach((taxSelector: TaxSelector) => {
        if (taxSelector.selectedTax) {
          itemTaxes +=
            (itemSubtotal * taxSelector.selectedTax.percentage) / 100;
        }
      });

      return total + itemTaxes;
    }, 0);
  }, [items]);

  /**
   * Calculate discount amount based on discount type
   */
  const calculateDiscountAmount = useMemo(() => {
    if (!discount) return 0;

    const { type, value } = discount as Discount;

    if (type === "percentage") {
      return (calculateSubtotal * value) / 100;
    } else {
      // Fixed amount
      return Math.min(value, calculateSubtotal);
    }
  }, [discount, calculateSubtotal]);

  /**
   * Calculate the grand total
   */
  const calculateTotal = useMemo(() => {
    return calculateSubtotal + calculateTotalTaxes - calculateDiscountAmount;
  }, [calculateSubtotal, calculateTotalTaxes, calculateDiscountAmount]);

  /**
   * Format a monetary value with the invoice currency
   */
  const formatCurrency = (value: number): string => {

    if (!currency) return value.toFixed(2);

    const {
      symbol,
      decimalMark,
      thousandsSeparator,
      precision = 2,
    } = currency as Currency;
    const isSymbolFirst = (currency as Currency).symbolFirst !== false;

    // Format the number with thousands and decimal separators
    const parts = value.toFixed(precision).split(".");

    parts[0] = parts[0].replace(
      /\B(?=(\d{3})+(?!\d))/g,
      thousandsSeparator || ",",
    );

    const formattedValue = parts.join(decimalMark || ".");

    return isSymbolFirst
      ? `${symbol}${formattedValue}`
      : `${formattedValue}${symbol}`;
  };

  /**
   * Calculate the total for a single item including taxes
   */
  const calculateItemTotal = (item: InvoiceItem): number => {
    if (!item) return 0;

    const subtotal = item.price * item.quantity;
    let taxes = 0;

    if (item.taxes?.length) {
      taxes = item.taxes.reduce((total: number, taxSelector: TaxSelector) => {
        if (taxSelector.selectedTax) {
          return total + (subtotal * taxSelector.selectedTax.percentage) / 100;
        }

        return total;
      }, 0);
    }

    return subtotal + taxes;
  };

  return {
    // Values
    subtotal: calculateSubtotal,
    totalTaxes: calculateTotalTaxes,
    discountAmount: calculateDiscountAmount,
    total: calculateTotal,

    // Formatted values
    formattedSubtotal: formatCurrency(calculateSubtotal),
    formattedTotalTaxes: formatCurrency(calculateTotalTaxes),
    formattedDiscountAmount: formatCurrency(calculateDiscountAmount),
    formattedTotal: formatCurrency(calculateTotal),

    // Functions
    formatCurrency,
    calculateItemTotal,
  };
};

export default useInvoiceCalculations;
