import {
  useWatch as useWatchRHF,
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";

/**
 * Hook personalizado para observar cambios específicos en campos del formulario
 * Útil para lógica condicional y validación cruzada
 */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  control: Control<TFieldValues>;
  name?: TFieldName | TFieldName[];
  defaultValue?: unknown;
  disabled?: boolean;
  compute?: (value: any) => void | undefined;
}) {
  // Usar directamente useWatchRHF sin as any
  return useWatchRHF({
    // @ts-ignore
    control: props.control,
    // @ts-ignore
    name: props.name,
    // @ts-ignore
    defaultValue: props.defaultValue,
    disabled: props.disabled,
    // @ts-ignore
    compute: props.compute,
  });
}

/**
 * Hook para observar múltiples campos y crear lógica condicional
 */
export function useWatchMultiple<
  TFieldValues extends FieldValues = FieldValues,
>(control: Control<TFieldValues>, fieldNames: FieldPath<TFieldValues>[]) {
  // Observar cada campo individualmente para evitar problemas de tipado
  const values = fieldNames.map((fieldName) =>
    useWatchRHF({
      control,
      name: fieldName,
    }),
  );

  return {
    values,
    getFieldValue: (fieldName: FieldPath<TFieldValues>) => {
      const index = fieldNames.indexOf(fieldName);

      return values[index];
    },
    hasValue: (fieldName: FieldPath<TFieldValues>) => {
      const index = fieldNames.indexOf(fieldName);
      const value = values[index];

      return value !== undefined && value !== null && value !== "";
    },
    // Helper para obtener todos los valores como objeto
    asObject: () => {
      const result: any = {};

      fieldNames.forEach((fieldName, index) => {
        result[fieldName] = values[index];
      });

      return result as Partial<TFieldValues>;
    },
  };
}

/**
 * Hook para observar múltiples campos (versión original mantenida para compatibilidad)
 */
export function useConditionalLogic<
  TFieldValues extends FieldValues = FieldValues,
>(control: Control<TFieldValues>, dependencies: FieldPath<TFieldValues>[]) {
  return useWatchMultiple(control, dependencies);
}
