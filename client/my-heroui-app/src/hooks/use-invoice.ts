import React from "react";
import { Invoice, Product } from "@/types/invoice";

const generateInvoiceNumber = () => {
  return `INV-${Math.floor(1000 + Math.random() * 9000)}`;
};

const getCurrentDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

const getDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
};

export const useInvoice = () => {
  const [invoice, setInvoice] = React.useState<Invoice>({
    invoiceNumber: generateInvoiceNumber(),
    issuedDate: getCurrentDate(),
    dueDate: getDueDate(),
    currency: "USD",
    client: {
      firstName: "",
      lastName: "",
      address: "",
      email: ""
    },
    company: {
      name: "Knockturnals Design",
      email: "knockturnals@gmail.com",
      address: "123 Maple Street, Springfield"
    },
    products: [],
    subtotal: 0,
    taxRate: 10,
    taxAmount: 0,
    discount: 0,
    total: 0
  });

  // Calculate totals whenever products change
  React.useEffect(() => {
    const subtotal = invoice.products.reduce((sum, product) => {
      return sum + (product.quantity * product.cost);
    }, 0);
    
    const taxAmount = (subtotal * invoice.taxRate) / 100;
    const total = subtotal + taxAmount - invoice.discount;
    
    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  }, [invoice.products, invoice.taxRate, invoice.discount]);

  const updateInvoice = (updates: Partial<Invoice>) => {
    setInvoice(prev => ({
      ...prev,
      ...updates
    }));
  };

  const addProduct = (product: Product) => {
    setInvoice(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));
  };

  const updateProduct = (index: number, updates: Partial<Product>) => {
    setInvoice(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        ...updates
      };
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  const removeProduct = (index: number) => {
    setInvoice(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts.splice(index, 1);
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  return {
    invoice,
    updateInvoice,
    addProduct,
    updateProduct,
    removeProduct,
    generateInvoiceNumber,
    getCurrentDate,
    getDueDate,
  };
};
