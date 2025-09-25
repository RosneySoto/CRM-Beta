import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { Button } from "@heroui/button";
import { nanoid } from "nanoid";

import { FormSelector } from "@/components/form-fields/form-selector";
import { Client as ClientType } from "@/types/invoice";
import { FormInput } from "@/components/form-fields/form-input";

const modalFields = [
  {
    name: "name",
    label: "Nombre del Cliente",
    required: true,
    placeholder: "Nombre del cliente",
  },
  {
    name: "description",
    label: "Descripción",
    required: false,
    placeholder: "Descripción opcional",
  },
  {
    name: "email",
    label: "Email",
    required: true,
    placeholder: "Email del cliente",
  },
  {
    name: "company",
    label: "Compañía",
    required: true,
    placeholder: "Compañía del cliente",
  },
  {
    name: "phone",
    label: "Telefono",
    required: true,
    placeholder: "Telefono del cliente",
  },
  {
    name: "taxId",
    label: "NIT",
    required: true,
    placeholder: "NIT del cliente",
  },
  {
    name: "address",
    label: "Dirección",
    required: true,
    placeholder: "Dirección del cliente",
  },
];

export default function Client({ clients }: { clients: ClientType[] }) {
  const {
    getValues,
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext();

  const [name, company, email, phone, taxId, address] = getValues([
    "client.name",
    "client.company",
    "client.email",
    "client.phone",
    "client.taxId",
    "client.address",
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const isInvalid = errors.client ? true : false;

  const onClearClient = () => {
    setValue("client.id", "");
    setValue("client.name", "");
    setValue("client.company", "");
    setValue("client.email", "");
    setValue("client.phone", "");
    setValue("client.taxId", "");
    setValue("client.address", "");
    clearErrors("client");
  };

  if (!name && !company && !email && !phone && !taxId && !address) {
    return (
      <div className="flex flex-col gap-2 h-full min-h-full">
        <FormSelector
          canCreateNew={true}
          isOpen={isOpen}
          isSearchable={true}
          label="Cliente"
          modalFields={modalFields}
          name="client.id"
          options={clients.map((client: ClientType) => ({
            id: client.id,
            label: client.name,
            description: client.address,
            group: "Clientes",
            metadata: {
              id: client.id,
              address: client.address,
              email: client.email,
              phone: client.phone,
              taxId: client.taxId,
              company: client.company,
              name: client.name,
            },
          }))}
          placeholder="Buscar cliente..."
          setIsOpen={setIsOpen}
          onChange={() => {
            clearErrors("client");
          }}
          onCreateNew={async (formData) => ({
            id: nanoid(),
            label: formData.name,
            description: formData.description || "Cliente personalizado",
            group: "Nuevo",
            metadata: {
              id: nanoid(),
              address: formData.address,
              email: formData.email,
              phone: formData.phone,
              taxId: formData.taxId,
              company: formData.company,
              name: formData.name,
            },
          })}
          onGetMetadata={(metadata) => {
            setValue("client", metadata);
          }}
        >
          <button
            className={`w-full h-full min-h-50 flex justify-center items-center gap-4 border rounded-medium border-dashed cursor-pointer duration-300 ease-in-out ${
              isInvalid ? "bg-danger-50 border-danger" : "border-divider"
            }`}
            type="button"
          >
            <p>Agregar Cliente</p>
          </button>
        </FormSelector>
        {errors.client && (
          <p className="text-danger text-small">
            {typeof errors.client === "object" && "message" in errors.client
              ? ((errors.client as any).name?.message as string)
              : "No se ha seleccionado un cliente"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormInput isRequired label="Nombre del cliente" name="client.name" />
        <FormInput isRequired label="Compañía" name="client.company" />
        <FormInput isRequired label="Email" name="client.email" />
        <FormInput isRequired label="Telefono" name="client.phone" />
        <FormInput isRequired label="NIT" name="client.taxId" />
        <FormInput isRequired label="Dirección" name="client.address" />
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-sm text-default-400">Cliente Seleccionado</h3>
        <Button
          className="text-default-500"
          size="sm"
          type="button"
          variant="light"
          onPress={() => {
            onClearClient();
            setIsOpen(true);
          }}
        >
          Cambiar
        </Button>
      </div>
    </div>
  );
}
