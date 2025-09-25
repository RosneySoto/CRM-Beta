"use client";

import { FormInput } from "@/components/form-fields/form-input";
import { FormDatePicker } from "@/components/form-fields/form-date-picker";

export default function Info() {
  return (
    <>
      <div className="flex flex-row w-full gap-5">
        <FormDatePicker
          isRequired
          className="grow"
          label="Fecha de la factura"
          labelPlacement="outside"
          name="invoice.info.invoiceDate"
        />
        <FormInput
          readOnly
          className="grow"
          label="Número de factura"
          labelPlacement="outside"
          name="invoice.info.invoiceNumber"
        />
      </div>
      <div className="flex flex-row w-full gap-5">
        <FormDatePicker
          isRequired
          className="grow"
          label="Fecha de vencimiento"
          labelPlacement="outside"
          name="invoice.info.dueDate"
        />
        <FormInput
          isRequired
          className="grow"
          label="Nº Pedido"
          labelPlacement="outside"
          name="invoice.info.orderNumber"
        />
      </div>
    </>
  );
}
