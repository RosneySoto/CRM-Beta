"use client";

// import InputGroup from "@/components/ui/form/InputGroup";
// import { LogoSection } from "@/features/dashboard/modules/invoices";
import { FormInput } from "@/components/form-fields/form-input";
import FormLogo from "@/components/form-fields/form-logo";

export default function Company() {
  return (
    <>
      <div className="flex-1 flex flex-row flex-wrap gap-4 w-full">
        <div className="flex-1 flex flex-col w-full gap-4">
          <FormInput name="company.title" className="grow" label="Título" placeholder="Título" type="text" isRequired />
          <FormInput name="company.subtitle" className="grow" label="Subtítulo" placeholder="Subtítulo" type="text" isRequired />
        </div>
        <div className="flex-1 flex flex-col w-full gap-4">
          <FormLogo
            name="company.logoFile"
            preview="company.logoPreview"
            label="Logo de la empresa" 
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col flex-wrap gap-4 w-full">
        <div className="flex-1 flex flex-row w-full gap-4">
          <FormInput name="company.name" className="grow" label="Nombre" placeholder="Nombre" type="text" isRequired />
          <FormInput name="company.email" className="grow" label="Correo electrónico" placeholder="Correo electrónico" type="email" isRequired />
        </div>
        <div className="flex-1 flex flex-row w-full gap-4">
          <FormInput name="company.phone" className="grow" label="Teléfono" placeholder="Teléfono" type="tel" isRequired />
          <FormInput name="company.taxId" className="grow" label="CIF/NIF" placeholder="CIF/NIF" type="text" isRequired />
        </div>
      </div>
    </>
  );
}

