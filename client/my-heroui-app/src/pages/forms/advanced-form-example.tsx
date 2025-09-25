import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { z } from "zod";
import { useForm } from "@/hooks/use-form";
import { useMultiStepForm } from "@/hooks/use-multi-step-form";
import { useFormPersistence } from "@/hooks/use-form-persistence";
import { useWatchMultiple } from "@/hooks/use-watch";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form-fields/form-input";
import { FormCheckbox } from "@/components/form-fields/form-checkbox";
import { FormDatePicker } from "@/components/form-fields/form-date-picker";
import { commonValidations } from "@/utils/conditional-validation";

// Schema con validación condicional y avanzada
const advancedFormSchema = z
  .object({
    // Paso 1: Información personal
    firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres"),
    email: z.string().includes("@", { message: "Email inválido" }),
    birthDate: z.date({ message: "Selecciona una fecha válida" }).refine(
      (date) => {
        const today = new Date();
        const birthDate = new Date(date);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          return age - 1 >= 18;
        }
        return age >= 18;
      },
      { message: "Debes ser mayor de 18 años" }
    ),

    // Paso 2: Información de cuenta
    username: z.string().min(3, "Username debe tener al menos 3 caracteres"),
    password: commonValidations.strongPassword,
    confirmPassword: z.string(),

    // Paso 3: Información adicional (condicional)
    isEmployee: z.boolean().default(false),
    companyName: z.string().optional(),
    position: z.string().optional(),

    // Paso 4: Preferencias
    newsletter: z.boolean().default(false),
    notifications: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.isEmployee && !data.companyName) {
        return false;
      }
      return true;
    },
    {
      message: "Nombre de la empresa es requerido para empleados",
      path: ["companyName"],
    }
  );

type AdvancedFormValues = z.infer<typeof advancedFormSchema>;

export default function AdvancedFormExample() {
  const form = useForm<AdvancedFormValues>({
    schema: advancedFormSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      birthDate: undefined,
      username: "",
      password: "Abraham#30",
      confirmPassword: "Abraham#30",
      isEmployee: false,
      companyName: "",
      position: "",
      newsletter: false,
      notifications: true,
    },
  });

  // Configuración de pasos
  const steps = [
    {
      id: "personal",
      title: "Información Personal",
      description: "Datos básicos del usuario",
      fields: ["firstName", "lastName", "email", "birthDate"] as const,
    },
    {
      id: "account",
      title: "Información de Cuenta",
      description: "Credenciales de acceso",
      fields: ["username", "password", "confirmPassword"] as const,
    },
    {
      id: "employment",
      title: "Información Laboral",
      description: "Datos de empleo (opcional)",
      fields: ["isEmployee", "companyName", "position"] as const,
      isOptional: true,
    },
    {
      id: "preferences",
      title: "Preferencias",
      description: "Configuración de notificaciones",
      fields: ["newsletter", "notifications"] as const,
    },
  ];

  // Multi-step form
  const multiStep = useMultiStepForm({
    steps,
    form,
    onStepChange: (step, direction) => {
      console.log(`Moved to step ${step + 1} (${direction})`);
    },
    onComplete: async (data) => {
      console.log("Form completed:", data);
      persistence.clearStorage();
      alert("¡Formulario enviado exitosamente!");
    },
  });

  // Persistencia del formulario
  const persistence = useFormPersistence(form, {
    key: "advanced-form",
    exclude: ["password", "confirmPassword"], // No guardar contraseñas
    dateFields: ["birthDate"], // Especificar que birthDate es un campo de fecha
    debounceMs: 1000,
  });

  // Watch para lógica condicional - Probando ambos métodos
  const multipleWatch = useWatchMultiple(form.control, ["isEmployee", "email"]);

  const isEmployee = multipleWatch.getFieldValue("isEmployee");
  const email = multipleWatch.getFieldValue("email");
  const newsletter = form.watch("newsletter");

  const progress = multiStep.getProgress();

  // Componente para el primer paso
  const Step1PersonalInfo = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput name="firstName" label="Nombre" labelPlacement="outside" />
          <FormInput
            name="lastName"
            label="Apellido"
            labelPlacement="outside"
          />
        </div>

        <FormInput
          name="email"
          label="Email"
          type="email"
          labelPlacement="outside"
        />

        <FormDatePicker
          name="birthDate"
          label="Fecha de Nacimiento"
          description="Debes ser mayor de 18 años"
          showMonthAndYearPickers
        />
      </div>
    );
  };

  // Componente para el segundo paso
  const Step2AccountInfo = () => {
    return (
      <div className="space-y-6">
        <FormInput
          name="username"
          label="Nombre de Usuario"
          labelPlacement="outside"
        />

        <FormInput
          name="password"
          label="Contraseña"
          type="password"
          labelPlacement="outside"
          description="Debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
        />

        <FormInput
          name="confirmPassword"
          label="Confirmar Contraseña"
          type="password"
          labelPlacement="outside"
        />
      </div>
    );
  };

  const renderStep = () => {
    switch (multiStep.currentStep) {
      case 0:
        return <Step1PersonalInfo />;

      case 1:
        return <Step2AccountInfo />;

      case 2:
        return (
          <div className="space-y-6">
            <FormCheckbox
              name="isEmployee"
              label="Soy empleado de una empresa"
              description="Marcar si trabajas para una empresa"
            />

            {isEmployee && (
              <>
                <FormInput
                  name="companyName"
                  label="Nombre de la Empresa"
                  labelPlacement="outside"
                  description="Nombre de tu empresa actual"
                />

                <FormInput
                  name="position"
                  label="Posición"
                  labelPlacement="outside"
                  description="Tu cargo o posición en la empresa"
                />
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <FormCheckbox
              name="newsletter"
              label="Recibir newsletter"
              description="Recibe noticias y actualizaciones por email"
            />

            <FormCheckbox
              name="notifications"
              label="Notificaciones push"
              description="Recibe notificaciones en tiempo real"
            />

            <div className="p-4 bg-default-100 rounded-lg">
              <h4 className="font-medium mb-2">Resumen de tu registro:</h4>
              <p className="text-sm text-foreground-600">
                Email: {(email as string) || "No especificado"}
                <br />
                Empleado: {isEmployee ? "Sí" : "No"}
                <br />
                Newsletter: {newsletter ? "Sí" : "No"}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-danger-100 rounded-lg">
            <h4 className="text-danger font-medium">Error: Paso inválido</h4>
            <p className="text-sm">
              Paso actual: {multiStep.currentStep}, Total pasos: {steps.length}
            </p>
            <Button
              onPress={() => multiStep.goToStep(0)}
              color="danger"
              variant="bordered"
            >
              Ir al inicio
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card className="p-6 md:p-8">
          {/* Header con progreso */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold">Registro Avanzado</h1>
              <div className="text-sm text-foreground-500">
                <span>
                  {progress.current} de {progress.total}
                </span>
                <br />
                <span className="text-xs">
                  Step: {multiStep.currentStep} | LastStep:{" "}
                  {multiStep.isLastStep.toString()}
                </span>
              </div>
            </div>

            <Progress
              value={progress.percentage}
              className="mb-2"
              color="primary"
            />

            <div className="flex justify-between text-xs text-foreground-500">
              {steps.map((step, index) => (
                <span
                  key={step.id}
                  className={`${
                    index === multiStep.currentStep
                      ? "text-primary font-medium"
                      : multiStep.isStepCompleted(index)
                        ? "text-success"
                        : ""
                  }`}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>

          {/* Contenido del paso actual */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-2">
              {multiStep.currentStepConfig.title}
            </h2>
            <p className="text-foreground-600 mb-6">
              {multiStep.currentStepConfig.description}
            </p>

            <Form form={form} onSubmit={() => {}}>
              {renderStep()}
            </Form>
          </div>

          {/* Botones de navegación */}
          <div className="flex justify-between">
            <Button
              variant="bordered"
              onPress={multiStep.prevStep}
              isDisabled={multiStep.isFirstStep}
            >
              Anterior
            </Button>

            <div className="flex gap-2">
              {persistence.hasStoredData() && (
                <Button
                  variant="light"
                  color="warning"
                  onPress={persistence.clearStorage}
                >
                  Limpiar Guardado
                </Button>
              )}

              {multiStep.isLastStep ? (
                <Button
                  color="primary"
                  onPress={multiStep.submitForm}
                  isLoading={multiStep.isSubmitting}
                >
                  Completar Registro
                </Button>
              ) : (
                <Button color="primary" onPress={multiStep.nextStep}>
                  Siguiente
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
