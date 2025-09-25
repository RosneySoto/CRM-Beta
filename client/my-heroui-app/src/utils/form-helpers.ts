import { UseFormReturn, FieldValues, FieldPath, Path } from "react-hook-form";

/**
 * Utilidades avanzadas para manejo de formularios
 */

// Función para reset parcial del formulario
export function resetFields<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FieldPath<TFieldValues>[],
  defaultValues?: Partial<TFieldValues>
) {
  fields.forEach(field => {
    const defaultValue = defaultValues?.[field as keyof TFieldValues];
    form.setValue(field, defaultValue as any, { shouldDirty: false, shouldTouch: false });
  });
  
  // Limpiar errores de los campos reseteados
  form.clearErrors(fields as any);
}

// Función para copiar valores entre campos
export function copyFieldValue<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fromField: FieldPath<TFieldValues>,
  toField: FieldPath<TFieldValues>,
  options: {
    shouldValidate?: boolean;
    shouldDirty?: boolean;
    shouldTouch?: boolean;
  } = {}
) {
  const value = form.getValues(fromField);
  form.setValue(toField, value, {
    shouldValidate: options.shouldValidate ?? true,
    shouldDirty: options.shouldDirty ?? true,
    shouldTouch: options.shouldTouch ?? true,
  });
}

// Función para establecer múltiples valores
export function setMultipleValues<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  values: Partial<TFieldValues>,
  options: {
    shouldValidate?: boolean;
    shouldDirty?: boolean;
    shouldTouch?: boolean;
  } = {}
) {
  Object.entries(values).forEach(([field, value]) => {
    form.setValue(field as Path<TFieldValues>, value, {
      shouldValidate: options.shouldValidate ?? false,
      shouldDirty: options.shouldDirty ?? true,
      shouldTouch: options.shouldTouch ?? false,
    });
  });

  // Validar todos los campos si se especifica
  if (options.shouldValidate) {
    form.trigger();
  }
}

// Función para obtener solo los campos modificados
export function getDirtyFields<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>
): Partial<TFieldValues> {
  const dirtyFields = form.formState.dirtyFields;
  const values = form.getValues();
  
  function extractDirtyFields(dirtyFields: any, values: any): any {
    const result: any = {};
    
    for (const key in dirtyFields) {
      if (dirtyFields[key] === true) {
        result[key] = values[key];
      } else if (typeof dirtyFields[key] === 'object' && dirtyFields[key] !== null) {
        const nested = extractDirtyFields(dirtyFields[key], values[key]);
        if (Object.keys(nested).length > 0) {
          result[key] = nested;
        }
      }
    }
    
    return result;
  }
  
  return extractDirtyFields(dirtyFields, values);
}

// Función para validar campos específicos
export async function validateFields<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FieldPath<TFieldValues>[]
): Promise<boolean> {
  const results = await Promise.all(
    fields.map(field => form.trigger(field))
  );
  return results.every(Boolean);
}

// Función para establecer errores personalizados
export function setCustomErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  errors: Record<FieldPath<TFieldValues>, string>
) {
  Object.entries(errors).forEach(([field, message]) => {
    form.setError(field as FieldPath<TFieldValues>, {
      type: 'custom',
      message: message as string,
    });
  });
}

// Función para limpiar errores específicos
export function clearSpecificErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FieldPath<TFieldValues>[]
) {
  fields.forEach(field => {
    form.clearErrors(field);
  });
}

// Función para obtener resumen del estado del formulario
export function getFormSummary<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>
) {
  const { formState } = form;
  
  return {
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
    isValidating: formState.isValidating,
    submitCount: formState.submitCount,
    touchedFields: Object.keys(formState.touchedFields),
    dirtyFields: Object.keys(formState.dirtyFields),
    errorFields: Object.keys(formState.errors),
    errorCount: Object.keys(formState.errors).length,
    values: form.getValues(),
    dirtyValues: getDirtyFields(form),
  };
}

// Función para resetear solo errores
export function resetErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>
) {
  form.clearErrors();
}

// Función para marcar campos como tocados
export function touchFields<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FieldPath<TFieldValues>[]
) {
  fields.forEach(field => {
    form.setValue(field, form.getValues(field), { shouldTouch: true });
  });
}

// Función para comparar valores del formulario
export function compareFormValues<TFieldValues extends FieldValues>(
  currentValues: TFieldValues,
  previousValues: TFieldValues
): {
  hasChanges: boolean;
  changedFields: FieldPath<TFieldValues>[];
  changes: Partial<TFieldValues>;
} {
  const changedFields: FieldPath<TFieldValues>[] = [];
  const changes: Partial<TFieldValues> = {};
  
  function deepCompare(current: any, previous: any, path: string = '') {
    for (const key in current) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (current[key] !== previous?.[key]) {
        changedFields.push(currentPath as FieldPath<TFieldValues>);
        if (!path) {
          (changes as any)[key] = current[key];
        }
      }
      
      if (typeof current[key] === 'object' && current[key] !== null && previous?.[key]) {
        deepCompare(current[key], previous[key], currentPath);
      }
    }
  }
  
  deepCompare(currentValues, previousValues);
  
  return {
    hasChanges: changedFields.length > 0,
    changedFields,
    changes,
  };
}
