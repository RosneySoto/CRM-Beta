import { z } from "zod";
import { FieldValues, FieldPath } from "react-hook-form";

/**
 * Utilidades para validación condicional entre campos
 */

// Validador que requiere un campo solo si otro campo tiene valor
export const requiredIf = <T extends FieldValues>(
  condition: (values: T) => boolean,
  message = "Este campo es requerido"
) => {
  return z.string().superRefine((val, ctx) => {
    const formData = ctx.path.length > 0 ? (ctx as any).formData : {};
    if (condition(formData) && (!val || val.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
      });
    }
  });
};

// Validador que requiere que un campo coincida con otro
export const matchField = <T extends FieldValues>(
  fieldToMatch: FieldPath<T>,
  message = "Los campos no coinciden"
) => {
  return z.string().superRefine((val, ctx) => {
    const formData = (ctx as any).formData || {};
    const matchValue = getNestedValue(formData, fieldToMatch as string);
    if (val !== matchValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
      });
    }
  });
};

// Validador de rango de fechas
export const dateRange = (
  startField: string,
  endField: string,
  message = "La fecha de fin debe ser posterior a la fecha de inicio"
) => {
  return z.object({}).superRefine((val, ctx) => {
    const formData = val as any;
    const startDate = getNestedValue(formData, startField);
    const endDate = getNestedValue(formData, endField);
    
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: [endField],
      });
    }
  });
};

// Validador de edad mínima
export const minimumAge = (
  ageInYears: number,
  message?: string
) => {
  return z.date().refine((date) => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= ageInYears;
    }
    return age >= ageInYears;
  }, {
    message: message || `Debe ser mayor de ${ageInYears} años`
  });
};

// Validador de email único (para validación asíncrona)
export const uniqueEmail = (
  checkEmailFn: (email: string) => Promise<boolean>,
  message = "Este email ya está registrado"
) => {
  return z.string().email().refine(async (email) => {
    return await checkEmailFn(email);
  }, { message });
};

// Función auxiliar para obtener valores anidados
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Esquemas de validación comunes
export const commonValidations = {
  // Validación de contraseña fuerte
  strongPassword: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/\d/, "Debe contener al menos un número")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Debe contener al menos un carácter especial"),

  // Validación de teléfono
  phoneNumber: z.string()
    .regex(/^\+?[\d\s\-\(\)]{10,}$/, "Formato de teléfono inválido"),

  // Validación de URL
  url: z.string().url("Debe ser una URL válida"),

  // Validación de código postal
  zipCode: z.string()
    .regex(/^\d{5}(-\d{4})?$/, "Código postal inválido"),
};
