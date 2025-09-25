import { useState, useCallback, useEffect } from "react";
import { useFormContext, FieldPath, FieldValues } from "react-hook-form";

export interface AsyncValidationConfig<TFieldValues extends FieldValues> {
  fieldName: FieldPath<TFieldValues>;
  validator: (value: any) => Promise<string | boolean>;
  debounceMs?: number;
  dependencies?: FieldPath<TFieldValues>[];
}

export function useAsyncValidation<TFieldValues extends FieldValues>(
  config: AsyncValidationConfig<TFieldValues>
) {
  const formContext = useFormContext<TFieldValues>();
  
  // Si no hay contexto de formulario, retorna valores por defecto
  if (!formContext) {
    return {
      isValidating: false,
      validationResult: null,
      revalidate: () => {},
    };
  }
  
  const { watch, setError, clearErrors } = formContext;
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message?: string;
  } | null>(null);

  const fieldValue = watch(config.fieldName);
  const dependencies = config.dependencies?.map(dep => watch(dep)) || [];

  const validate = useCallback(async (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      setValidationResult(null);
      clearErrors(config.fieldName);
      return;
    }

    setIsValidating(true);
    try {
      const result = await config.validator(value);
      
      if (result === true) {
        setValidationResult({ isValid: true });
        clearErrors(config.fieldName);
      } else {
        const message = typeof result === 'string' ? result : 'Validación fallida';
        setValidationResult({ isValid: false, message });
        setError(config.fieldName, { 
          type: 'async', 
          message 
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de validación';
      setValidationResult({ isValid: false, message });
      setError(config.fieldName, { 
        type: 'async', 
        message 
      });
    } finally {
      setIsValidating(false);
    }
  }, [config.validator, config.fieldName, setError, clearErrors]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validate(fieldValue);
    }, config.debounceMs || 500);

    return () => clearTimeout(timeoutId);
  }, [fieldValue, ...dependencies, validate, config.debounceMs]);

  return {
    isValidating,
    validationResult,
    revalidate: () => validate(fieldValue),
  };
}

// Hook específico para validación de email único
export function useEmailValidation(
  fieldName: FieldPath<any>,
  checkEmailFn: (email: string) => Promise<boolean>
) {
  return useAsyncValidation({
    fieldName,
    validator: async (email: string) => {
      if (!email.includes('@')) {
        return 'Email inválido';
      }
      
      const isUnique = await checkEmailFn(email);
      return isUnique || 'Este email ya está registrado';
    },
    debounceMs: 800,
  });
}

// Hook para validación de username único
export function useUsernameValidation(
  fieldName: FieldPath<any>,
  checkUsernameFn: (username: string) => Promise<boolean>
) {
  return useAsyncValidation({
    fieldName,
    validator: async (username: string) => {
      if (username.length < 3) {
        return 'El username debe tener al menos 3 caracteres';
      }
      
      const isUnique = await checkUsernameFn(username);
      return isUnique || 'Este username ya está en uso';
    },
    debounceMs: 600,
  });
}
