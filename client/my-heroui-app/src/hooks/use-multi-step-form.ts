import { useState, useCallback } from "react";
import { FieldValues, UseFormReturn, FieldPath } from "react-hook-form";

export interface StepConfig<TFieldValues extends FieldValues> {
  id: string;
  title: string;
  description?: string;
  fields: readonly FieldPath<TFieldValues>[];
  isOptional?: boolean;
  validate?: (data: TFieldValues) => Promise<boolean> | boolean;
}

export interface UseMultiStepFormProps<TFieldValues extends FieldValues> {
  steps: StepConfig<TFieldValues>[];
  form: UseFormReturn<TFieldValues>;
  onStepChange?: (currentStep: number, direction: 'next' | 'prev') => void;
  onComplete?: (data: TFieldValues) => void | Promise<void>;
}

export function useMultiStepForm<TFieldValues extends FieldValues>({
  steps,
  form,
  onStepChange,
  onComplete,
}: UseMultiStepFormProps<TFieldValues>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepConfig = steps[currentStep];

  // Validar paso actual
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const fieldsToValidate = currentStepConfig.fields;
    
    // Si el paso es opcional, permitir continuar sin validación estricta
    if (currentStepConfig.isOptional) {
      console.log('Optional step - skipping strict validation');
      
      // Solo validar si hay datos ingresados
      const formValues = form.getValues();
      const hasAnyData = fieldsToValidate.some(field => {
        const value = formValues[field as keyof typeof formValues];
        return value !== undefined && value !== null && value !== "";
      });
      
      if (!hasAnyData) {
        console.log('No data in optional step - allowing to continue');
        return true;
      }
    }
    
    // Trigger validation para los campos del paso actual
    const isValid = await form.trigger(fieldsToValidate as any);
    console.log('Validation result for step', currentStep, ':', isValid);
    
    // Validación personalizada del paso si existe
    if (isValid && currentStepConfig.validate) {
      const customValidation = await currentStepConfig.validate(form.getValues());
      return customValidation;
    }
    
    return isValid;
  }, [currentStep, form, currentStepConfig]);

  // Ir al siguiente paso
  const nextStep = useCallback(async () => {
    if (isLastStep || currentStep >= steps.length - 1) {
      console.warn('Cannot go to next step: already at last step');
      return;
    }
    
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    const newStep = currentStep + 1;
    
    // Protección adicional
    if (newStep >= steps.length) {
      console.error('Step overflow prevented:', newStep, 'max:', steps.length - 1);
      return;
    }
    
    setCurrentStep(newStep);
    onStepChange?.(newStep, 'next');
  }, [currentStep, isLastStep, validateCurrentStep, onStepChange, steps.length]);

  // Ir al paso anterior
  const prevStep = useCallback(() => {
    if (isFirstStep) return;
    
    const newStep = currentStep - 1;
    setCurrentStep(newStep);
    onStepChange?.(newStep, 'prev');
  }, [currentStep, isFirstStep, onStepChange]);

  // Ir a un paso específico
  const goToStep = useCallback(async (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    
    // Si vamos hacia adelante, validar pasos intermedios
    if (stepIndex > currentStep) {
      for (let i = currentStep; i < stepIndex; i++) {
        const stepConfig = steps[i];
        const fieldsToValidate = stepConfig.fields;
        const isValid = await form.trigger(fieldsToValidate as any);
        
        if (!isValid && !stepConfig.isOptional) {
          return false;
        }
        
        if (isValid) {
          setCompletedSteps(prev => new Set([...prev, i]));
        }
      }
    }
    
    setCurrentStep(stepIndex);
    onStepChange?.(stepIndex, stepIndex > currentStep ? 'next' : 'prev');
    return true;
  }, [currentStep, steps, form, onStepChange]);

  // Enviar formulario completo
  const submitForm = useCallback(async () => {
    if (!isLastStep) return;
    
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const data = form.getValues();
      await onComplete?.(data);
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    } finally {
      setIsSubmitting(false);
    }
  }, [isLastStep, validateCurrentStep, form, onComplete, currentStep]);

  // Obtener progreso del formulario
  const getProgress = useCallback(() => {
    return {
      current: currentStep + 1,
      total: steps.length,
      percentage: ((currentStep + 1) / steps.length) * 100,
      completedSteps: Array.from(completedSteps),
    };
  }, [currentStep, steps.length, completedSteps]);

  // Verificar si un paso está completado
  const isStepCompleted = useCallback((stepIndex: number) => {
    return completedSteps.has(stepIndex);
  }, [completedSteps]);

  // Verificar si un paso es accesible
  const isStepAccessible = useCallback((stepIndex: number) => {
    if (stepIndex <= currentStep) return true;
    
    // Verificar que todos los pasos anteriores requeridos estén completados
    for (let i = 0; i < stepIndex; i++) {
      if (!steps[i].isOptional && !completedSteps.has(i)) {
        return false;
      }
    }
    return true;
  }, [currentStep, steps, completedSteps]);

  // Reset del formulario multi-paso
  const resetForm = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    form.reset();
  }, [form]);

  return {
    // Estado actual
    currentStep,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    isSubmitting,
    
    // Navegación
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    
    // Utilidades
    validateCurrentStep,
    getProgress,
    isStepCompleted,
    isStepAccessible,
    resetForm,
    
    // Datos
    steps,
    completedSteps: Array.from(completedSteps),
  };
}
