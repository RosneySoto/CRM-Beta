import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@heroui/button";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableColumn,
//   TableRow,
//   TableCell,
// } from "@heroui/table";
import { Input } from "@heroui/input";
import { Select } from "@heroui/select";
import { Trash } from "iconsax-react";

import { FormInput } from "../form-fields/form-input";
import { FormTextarea } from "../form-fields/form-textarea";
import { FormNumberInput } from "../form-fields/form-number-input";
import { InvoiceItem, Invoice, Tax, TaxSelector } from "@/types/invoice";
import { FormSelector } from "../form-fields/form-selector";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
} from "@/components/table";

import useInvoiceTaxes from "@/hooks/invoices/useInvoiceTaxes";
import { useState } from "react";
import { nanoid } from "nanoid";
import { Add } from "iconsax-react";
import { Currency } from "@/types/currency";

interface InvoiceTableProps {
  items: InvoiceItem[];
  control: Control<Invoice, any, Invoice>;

  taxes: Tax[];
  defaultTax: Tax;
  defaultCurrency: Currency;

  removeItem: (index: number) => void;
  updateItem: (itemId: string, updates: Partial<InvoiceItem>) => void
  
}

interface RowTaxesProps {
  index: number;
  tIndex: number;
  taxes: Tax[];
  watchTaxes: TaxSelector;
  tax: any;
  updateTax: (taxId: string, updates: Partial<Tax>) => boolean
}

interface TableRowsProps {
  field: any;
  index: number;
  control: Control<Invoice, any, Invoice>;
  defaultTax: Tax;
  removeItem: (index: number) => void;
  updateItem: (itemId: string, updates: Partial<InvoiceItem>) => void;
  taxes: Tax[];
  defaultCurrency: Currency;
}

const RowTaxes = ({ tax, watchTaxes, taxes, index, tIndex, updateTax }: RowTaxesProps) => {
  const { getValues } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(new Set([getValues(`invoice.items.${index}.taxes.${tIndex}.selectedTax.id`)]));

  let label = watchTaxes ? `${watchTaxes.selectedTax?.label} (${watchTaxes.selectedTax?.percentage} %)` : "Agregar impuesto";

  return <div key={tax.id} className="flex flex-col items-center gap-3 pt-2">
    <FormSelector
      canCreateNew={true}
      isOpen={isOpen}
      isSearchable={true}
      // modalFields={modalFields}
      selectedKeys={selectedKeys}
      name={`invoice.items.${index}.taxes.${tIndex}.selectedTax.id`}
      options={taxes.map((tax: Tax) => ({
        id: tax.id,
        label: tax.label,
        description: tax.percentage.toString(),
        group: "Inpuestos",
        metadata: tax,
      }))}
      placeholder="Buscar cliente..."
      setIsOpen={setIsOpen}
      onCreateNew={async (formData) => ({
        id: nanoid(),
        label: formData.name,
        description: formData.description || "Producto personalizado",
        group: "Nuevo producto",
        metadata: {
          ...formData
        },
      })}
      onSelectionChange={(value) => {
        setSelectedKeys(new Set([value]))
      }}
      onGetMetadata={(metadata: any) => {
        if (metadata) updateTax(tax.id, metadata);
      }}
    >
      <Button
        variant="flat"
        size="sm"
        color="default"
        className="w-full "
      >
        {label}
      </Button>
    </FormSelector>

    <div className="hidden">
      <FormInput
        aria-label="Nombre del impuesto"
        isRequired
        labelPlacement="outside"

        name={`invoice.items.${index}.taxes.${tIndex}.selectedTax.label`}
      />
      <FormNumberInput
        aria-label="Valor del impuesto"
        isRequired
        labelPlacement="outside"
        name={`invoice.items.${index}.taxes.${tIndex}.selectedTax.value`}
      />
      <FormNumberInput
        aria-label="Porcentaje del impuesto"
        isRequired
        labelPlacement="outside"
        name={`invoice.items.${index}.taxes.${tIndex}.selectedTax.percentage`}
      />
    </div>
  </div>
}

const TableRows = ({ field, index, control, defaultTax, removeItem, updateItem, taxes, defaultCurrency }: TableRowsProps) => {

  const [isOpen, setIsOpen] = useState(false);

  const {
    items,
    taxRates,
    watchTaxes,
    addTax,
    removeTax,
    updateTax,
    calculateItemTaxes
  } = useInvoiceTaxes({
    control,
    itemIndex: index,
    defaultTax
  });

  return <>
    {/** Items */}
    <TableRow key={field.id}>
      <TableCell className="align-top w-1/5 px-0">
        <FormInput aria-label="Nombre del producto o servicio" isRequired name={`invoice.items.${index}.name`} />
      </TableCell>
      <TableCell className="align-top w-1/4 ">
        <FormTextarea
          aria-label="Descripción del producto o servicio"
          isRequired
          name={`invoice.items.${index}.description`}
          rows={2}
        />
      </TableCell>
      <TableCell className="align-top w-1/5">
        <FormNumberInput
          aria-label="Cantidad del producto o servicio"
          isRequired
          labelPlacement="outside"
          name={`invoice.items.${index}.quantity`}
          onChange={(value) => updateItem(field.id, {
            ...field,
            quantity: value,
            taxes: watchTaxes
          })}
        />
      </TableCell>
      <TableCell className="align-top w-1/5">
        <FormNumberInput
          aria-label="Precio unitario del producto o servicio"
          isRequired
          labelPlacement="outside"
          name={`invoice.items.${index}.price`}
          onChange={(value) => updateItem(field.id, {
            ...field,
            price: value,
            taxes: watchTaxes
          })}
        />
      </TableCell>
      <TableCell className="align-top w-1/6 px-0">
        <div className="flex items-center gap-2">
          <FormNumberInput
            aria-label="Total del producto o servicio"
            isRequired
            labelPlacement="outside"
            name={`invoice.items.${index}.total`}
            readOnly
            hideStepper
          />
          <Button isIconOnly variant="flat" size="sm" onPress={() => removeItem(index)} className="text-red-500">
            <Trash variant="Bold" size={18} color="currentColor" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
    
    {/** Taxes */}
    <TableRow key={`${field.id}${index}`}>
      <TableCell className="align-top w-1/5 px-0">
        <div />
      </TableCell>
      <TableCell className="align-top w-1/4">
        <div />
      </TableCell>
      <TableCell className="align-top w-1/5">
        <p className="w-ful text-end text-xs">Inpuestos:</p>
      </TableCell>
      <TableCell className="align-top w-1/5">
        <FormSelector
          aria-label="Agregar impuesto"
          canCreateNew={true}
          isOpen={isOpen}
          isSearchable={true}
          // modalFields={modalFields}
          name={`__add_tax_dummy_${index}`}
          options={taxes.map((tax: Tax) => ({
            id: tax.id,
            label: tax.label,
            description: tax.percentage.toString(),
            group: "Inpuestos",
            metadata: tax,
          }))}
          placeholder="Buscar cliente..."
          setIsOpen={setIsOpen}
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
            if (metadata) addTax(metadata);
          }}
        >
          <button className="flex items-center gap-1 text-sm text-center w-full cursor-pointer pb-2">
            <Add size={18} variant="Outline" className="grow-0" />
            <p className="text-xs grow">Agregar Impuesto</p>
          </button> 
        </FormSelector>

        {taxRates.map((tax, tIndex) => (
          <RowTaxes
            tax={tax}
            index={index}
            watchTaxes={watchTaxes[tIndex]}
            taxes={taxes}
            tIndex={tIndex}
            updateTax={updateTax} />
        ))}

      </TableCell>
      <TableCell className="align-top w-1/6 px-0">
        <div className="flex flex-col gap-2 items-center">
          <div className="pt-7" />
          {taxRates.map((tax, tIndex) => (
            <div className="flex gap-2 justify-end items-center w-full">
              <p>{defaultCurrency.symbol}{watchTaxes[tIndex] ? calculateItemTaxes(items, watchTaxes[tIndex]) : 0}</p>
              <Button isIconOnly variant="light" size="sm" onPress={() => removeTax(tax.id)} className="text-gray-500">
                <Trash variant="Bold" size={18} className="" color="currentColor" />
              </Button>
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  </>
}

export default function TableItems({ control, items, taxes, defaultTax, removeItem, updateItem, defaultCurrency }: InvoiceTableProps) {

  return (
    <div className="space-y-4">
      <div className="rounded-md py-4">

        <Table removeWrapper aria-label="Tabla de items de factura">
          <TableHead>
            <TableHeadCell>Producto/Servicio</TableHeadCell>
            <TableHeadCell>Descripción</TableHeadCell>
            <TableHeadCell>Cantidad</TableHeadCell>
            <TableHeadCell>Precio Unitario</TableHeadCell>
            <TableHeadCell>Total</TableHeadCell>
          </TableHead>
          <TableBody>

            {items.map((field: any, index: number) => (
              <TableRows
                key={field.id} 
                field={field} 
                index={index} 
                control={control} 
                defaultTax={defaultTax} 
                removeItem={removeItem} 
                updateItem={updateItem} 
                taxes={taxes} 
                defaultCurrency={defaultCurrency} 
              />
            ))}

          </TableBody>
        </Table>
      </div>
    </div>
  );
}
