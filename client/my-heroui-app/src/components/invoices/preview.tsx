import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
} from "@/components/table";
import { Card } from "@heroui/card";
import { Invoice, InvoiceItem } from "@/types/invoice";
import { User } from "iconsax-react";


export default function Preview({ invoice, company, client, totals, formatCurrency }: Invoice & { formatCurrency: (value: number) => string }) {

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const calculateTax = (product: InvoiceItem) => {
    let totalTax = 0;

    if (product.taxes.length) {
      const subtotal = product.price * product.quantity;

      product.taxes.forEach((tax) => {
        if (tax.selectedTax) {
          const taxAmount = (subtotal * tax.selectedTax.percentage) / 100;

          totalTax += taxAmount;
        }
      });
    }
    return formatCurrency(totalTax);
  }


  return (
    <Card className="bg-content2 p-6 h-[calc(100vh-10rem)] flex flex-col justify-between" shadow="none">
      <div>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold">{company.title}</h2>
            <p className="text-lg text-foreground-500  mb-1">{company.subtitle}</p>
            <div className="flex gap-2">
              <p className="text-sm text-foreground-400">Invoice Number</p>
              <p className="text-sm font-medium">{invoice.info.invoiceNumber}</p>
            </div>

            <div className="flex gap-2">
              <p className="text-sm text-foreground-400 mb-1">Order Number:</p>
              <p className="text-sm font-medium">{invoice.info.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {company.logoPreview && (
              <img src={company.logoPreview || ""} alt="Logo" className="w-15 h-15 rounded-md object-center border border-divider" />
            )}

            {!company.logoPreview && (
              <div className="bg-primary rounded-md p-2">
                <User size={20} variant="Bold" color="currentColor" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm text-foreground-400 mb-1">Billed by:</p>
            <p className="font-medium">{company.name}</p>
            <p className="text-sm text-foreground-500">{company.email}</p>
            <p className="text-sm text-foreground-500">{company.phone}</p>
          </div>
          <div>
            <p className="text-sm text-foreground-400 mb-1">Billed to:</p>
            <p className="font-medium">
              {client.name}
            </p>
            <p className="text-sm text-foreground-500">{client.email}</p>
            <p className="text-sm text-foreground-500">{client.address}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm text-foreground-400 mb-1">Date Issued:</p>
            <p className="font-medium">{formatDate(invoice.info.invoiceDate.toString())}</p>
          </div>
          <div>
            <p className="text-sm text-foreground-400 mb-1">Due Date:</p>
            <p className="font-medium">{formatDate(invoice.info.dueDate?.toString() || "")}</p>
          </div>
        </div>

        <Table
          removeWrapper
          aria-label="Invoice items"
          className="mb-8"
        >
          <TableHead>
            <TableHeadCell className="bg-default-200">Product</TableHeadCell>
            <TableHeadCell className="bg-default-200">Description</TableHeadCell>
            <TableHeadCell className="bg-default-200">Quantity</TableHeadCell>
            <TableHeadCell className="bg-default-200">Unit Price</TableHeadCell>
            <TableHeadCell className="bg-default-200">Taxes</TableHeadCell>
            <TableHeadCell className="bg-default-200 text-end">Amount</TableHeadCell>
          </TableHead>
          <TableBody>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name || "Unnamed Item"}</TableCell>
                  <TableCell className="max-w-32 truncate">{product.description || "No description"}</TableCell>
                  <TableCell>{product.quantity || 0}</TableCell>
                  <TableCell>{formatCurrency(product.price || 0)}</TableCell>
                  <TableCell className="text-xs">{calculateTax(product)}</TableCell>
                  <TableCell className="text-end">{formatCurrency(product.total || 0)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-foreground-400 py-8">
                  No items added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col items-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-foreground-400">Subtotal</span>
              <span>{formatCurrency(totals?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-400">Tax</span>
              <span>{formatCurrency(totals?.totalTaxes || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-400">Discount</span>
              <span>-{formatCurrency(totals?.discountAmount || 0)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-divider">
              <span>Total</span>
              <span>{formatCurrency(totals?.total || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {invoice.info.notes && (
        <div className="mb-8">
          <p className="text-sm text-foreground-400 mb-2">Notes:</p>
          <p className="text-sm bg-default-100 p-3 rounded-md">{invoice.info.notes}</p>
        </div>
      )}

      {/* Footer Section */}
      {invoice.info.footer && (
        <div className="mt-8 text-center text-foreground-400 text-sm">
          <p>{invoice.info.footer}</p>
        </div>
      )}

      {/* Default Thank You Message */}
      {!invoice.info.footer && (
        <div className="mt-12 text-center text-foreground-400 text-sm">
          <p>Thank you for your purchase! We appreciate your business and look</p>
          <p>forward to serving you again.</p>
        </div>
      )}
    </Card>
  );
};