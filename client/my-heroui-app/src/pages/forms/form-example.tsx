import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { z } from "zod";
import { useForm } from "@/hooks/use-form";
import { useFieldArray } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form-fields/form-input";
import { FormTextarea } from "@/components/form-fields/form-textarea";
import { FormCheckbox } from "@/components/form-fields/form-checkbox";
import { FormSelect } from "@/components/form-fields/form-select";
import { FormSwitch } from "@/components/form-fields/form-switch";
import { FormRadioGroup } from "@/components/form-fields/form-radio-group";
import { FormDatePicker } from "@/components/form-fields/form-date-picker";
import { FormDateRangePicker } from "@/components/form-fields/form-date-range-picker";
import { FormAutocomplete } from "@/components/form-fields/form-autocomplete";
import { FormSelector } from "@/components/form-fields/form-selector";
import { parseDate } from "@internationalized/date";
import DefaultLayout from "@/layouts/default";

// import { Card, CardBody, CardHeader } from "@heroui/card";
// import { Tabs, Tab } from "@heroui/tabs";
// import { Save2, Send2, ArrowLeft2 } from "iconsax-react";
import { DevTool } from "@hookform/devtools";
import { FormNumberInput } from "@/components/form-fields/form-number-input";
// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z
    .string()
    .includes("@", { message: "Please enter a valid email address" }),
  bio: z
    .string()
    .min(10, { message: "Bio must be at least 10 characters" })
    .max(160, { message: "Bio cannot exceed 160 characters" }),
  role: z.string({ message: "Please select a role" }),
  department: z.string({ message: "Please select a department" }),
  notifications: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
  contactPreference: z.enum(["email", "phone", "mail"], {
    message: "Please select a contact preference",
  }),
  startDate: z.date({ message: "Please select a start date" }),
  vacationPeriod: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
  // Nuevo campo para skills dinámicos
  skills: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Skill name is required" }),
        level: z.enum(["beginner", "intermediate", "advanced"], {
          message: "Please select a level",
        }),
        yearsOfExperience: z
          .number()
          .min(0, { message: "Years must be 0 or greater" })
          .max(50, { message: "Years cannot exceed 50" }),
      })
    )
    .min(1, { message: "At least one skill is required" }),

  // Nuevo campo para selector personalizado
  country: z.string().min(1, { message: "Please select a country" }),
  currencies: z.array(z.string()).optional(),
});

// Define form values type from schema
type FormValues = z.infer<typeof formSchema>;

export default function App() {
  // Default values
  const defaultValues: Partial<FormValues> = {
    name: "",
    email: "",
    bio: "",
    role: "",
    department: "",
    notifications: false,
    marketingEmails: false,
    contactPreference: "email",
    startDate: new Date(),
    vacationPeriod: {
      start: new Date(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
    },
    skills: [{ name: "", level: "beginner", yearsOfExperience: 0 }],
    country: "",
    currencies: [],
  };

  // Initialize form with schema and default values
  const form = useForm<FormValues>({
    schema: formSchema,
    defaultValues,
  });

  // Initialize useFieldArray for skills
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    // Show success message
    alert("Form submitted successfully!");
  };

  // Role options for select
  const roleOptions = [
    { key: "user", label: "User" },
    { key: "admin", label: "Administrator" },
    { key: "manager", label: "Manager" },
    { key: "developer", label: "Developer" },
    { key: "designer", label: "Designer" },
  ];

  // Department options for autocomplete
  const departmentOptions = [
    {
      key: "engineering",
      label: "Engineering",
      description: "Software development and infrastructure",
    },
    { key: "design", label: "Design", description: "UI/UX and product design" },
    { key: "marketing", label: "Marketing", description: "Brand and growth" },
    {
      key: "sales",
      label: "Sales",
      description: "Business development and customer acquisition",
    },
    {
      key: "support",
      label: "Support",
      description: "Customer success and technical support",
    },
    {
      key: "hr",
      label: "Human Resources",
      description: "Recruitment and employee relations",
    },
    {
      key: "finance",
      label: "Finance",
      description: "Accounting and financial operations",
    },
  ];

  // Contact preference options for radio group
  const contactOptions = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "mail", label: "Mail" },
  ];

  // Skill level options for select
  const skillLevelOptions = [
    { key: "beginner", label: "Principiante" },
    { key: "intermediate", label: "Intermedio" },
    { key: "advanced", label: "Avanzado" },
  ];

  // Country options for FormSelector
  const countryOptions = [
    {
      id: "es",
      label: "España",
      description: "Reino de España",
      group: "Europa",
      tags: ["EU", "EUR"],
      icon: "🇪🇸",
    },
    {
      id: "mx",
      label: "México",
      description: "Estados Unidos Mexicanos",
      group: "América",
      tags: ["LATAM", "MXN"],
      icon: "🇲🇽",
    },
    {
      id: "us",
      label: "Estados Unidos",
      description: "United States of America",
      group: "América",
      tags: ["USD", "NA"],
      icon: "🇺🇸",
    },
    {
      id: "ar",
      label: "Argentina",
      description: "República Argentina",
      group: "América",
      tags: ["LATAM", "ARS"],
      icon: "🇦🇷",
    },
    {
      id: "fr",
      label: "Francia",
      description: "République française",
      group: "Europa",
      tags: ["EU", "EUR"],
      icon: "🇫🇷",
    },
  ];

  // Currency options for multiple selector
  const currencyOptions = [
    { id: "usd", label: "USD", description: "Dólar Estadounidense", icon: "$" },
    { id: "eur", label: "EUR", description: "Euro", icon: "€" },
    { id: "mxn", label: "MXN", description: "Peso Mexicano", icon: "$" },
    { id: "ars", label: "ARS", description: "Peso Argentino", icon: "$" },
    { id: "gbp", label: "GBP", description: "Libra Esterlina", icon: "£" },
    { id: "jpy", label: "JPY", description: "Yen Japonés", icon: "¥" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Card className="p-6 md:p-8">
          <h1 className="mb-6 text-2xl font-semibold">Registration Form</h1>

          <Form form={form} onSubmit={onSubmit}>
            <div className="space-y-6">
              {/* Basic inputs */}
              <div className="grid gap-6 md:grid-cols-2">
                <FormInput
                  label="Full Name"
                  labelPlacement="outside"
                  name="name"
                />
                <FormInput
                  label="Email Address"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                />
              </div>

              {/* Textarea */}
              <FormTextarea
                name="bio"
                label="Bio"
                placeholder="Tell us about yourself"
                description="A brief description about yourself"
              />

              {/* Select */}
              <FormSelect
                name="role"
                label="Role"
                placeholder="Select a role"
                description="Your role in the organization"
                options={roleOptions}
              />

              {/* Autocomplete */}
              <FormAutocomplete
                name="department"
                label="Department"
                placeholder="Search for a department"
                description="The department you'll be working in"
                options={departmentOptions}
              />

              {/* Date picker */}
              <FormDatePicker
                name="startDate"
                label="Start Date"
                description="When would you like to start?"
                defaultValue={parseDate(new Date().toISOString().split("T")[0])}
              />

              {/* Date range picker */}
              <FormDateRangePicker
                name="vacationPeriod"
                label="Vacation Period"
                description="Select your vacation dates"
              />

              {/* Radio group */}
              <FormRadioGroup
                name="contactPreference"
                label="Preferred Contact Method"
                description="How would you like us to contact you?"
                options={contactOptions}
              />

              {/* FormSelector Examples */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">
                  Ejemplos de FormSelector
                </h3>

                {/* Single selector con grupos */}
                <FormSelector
                  name="country"
                  label="País de Residencia"
                  description="Selecciona tu país actual"
                  placeholder="Buscar país..."
                  options={countryOptions}
                  isSearchable={true}
                  canCreateNew={true}
                  modalFields={[
                    {
                      name: "label",
                      label: "Nombre del País",
                      required: true,
                      placeholder: "Ej: Brasil",
                    },
                    {
                      name: "description",
                      label: "Descripción",
                      required: false,
                      placeholder: "Descripción opcional",
                    },
                    {
                      name: "code",
                      label: "Código",
                      required: false,
                      placeholder: "Ej: BR",
                    },
                  ]}
                  onCreateNew={async (formData) => ({
                    id: `custom-${Date.now()}`,
                    label: formData.label,
                    description: formData.description || "País personalizado",
                    group: "Personalizado",
                    tags: [formData.code || "CUSTOM"],
                    icon: "🌍",
                  })}
                />

                {/* Multiple selector */}
                <FormSelector
                  name="currencies"
                  label="Monedas de Interés"
                  description="Selecciona las monedas que manejas (múltiple selección)"
                  placeholder="Seleccionar monedas..."
                  options={currencyOptions}
                  isMultiple={true}
                  isSearchable={true}
                  canCreateNew={true}
                  modalFields={[
                    {
                      name: "code",
                      label: "Código de Moneda",
                      required: true,
                      placeholder: "Ej: BTC, ETH, USD",
                    },
                    {
                      name: "name",
                      label: "Nombre Completo",
                      required: true,
                      placeholder: "Ej: Bitcoin, Ethereum",
                    },
                    {
                      name: "symbol",
                      label: "Símbolo",
                      required: false,
                      placeholder: "Ej: ₿, Ξ, $",
                    },
                  ]}
                  onCreateNew={async (formData) => ({
                    id: `currency-${Date.now()}`,
                    label: formData.code.toUpperCase(),
                    description: formData.name,
                    icon: formData.symbol || "💰",
                    tags: ["CUSTOM"],
                  })}
                  addNewButtonText="+ Nueva moneda"
                  modalTitle="Agregar Nueva Moneda"
                />
              </div>

              {/* Dynamic Skills Section using useFieldArray */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      Habilidades Técnicas
                    </h3>
                    <p className="text-sm text-foreground-500">
                      Agrega tus habilidades y nivel de experiencia
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="bordered"
                    size="sm"
                    onPress={() =>
                      append({
                        name: "",
                        level: "beginner",
                        yearsOfExperience: 0,
                      })
                    }
                  >
                    + Agregar Habilidad
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 border border-divider">
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormInput
                        name={`skills.${index}.name`}
                        label="Nombre de la Habilidad"
                        placeholder="ej. React, Python, SQL"
                      />

                      <FormSelect
                        name={`skills.${index}.level`}
                        label="Nivel"
                        placeholder="Selecciona tu nivel"
                        options={skillLevelOptions}
                      />

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <FormNumberInput
                            labelPlacement="outside"
                            name={`skills.${index}.yearsOfExperience`}
                            label="Años de Experiencia"
                            min={0}
                            max={50}
                          />
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            color="danger"
                            variant="light"
                            size="sm"
                            isIconOnly
                            onPress={() => remove(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Checkboxes and switches */}
              <div className="space-y-4">
                <FormCheckbox
                  name="marketingEmails"
                  label="I want to receive marketing emails"
                  description="We'll send you updates about our products and services"
                />

                <FormSwitch
                  name="notifications"
                  label="Enable notifications"
                  description="Receive notifications about account activity"
                />
              </div>

              {/* Submit button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  color="primary"
                  isLoading={form.formState.isSubmitting}
                  isDisabled={form.formState.isSubmitting}
                >
                  Submit
                </Button>
              </div>
            </div>

            <DevTool control={form.control} />
          </Form>
        </Card>
      </div>
    </div>
  );
}
