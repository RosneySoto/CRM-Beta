import {
  useForm as useHookForm,
  UseFormProps as UseHookFormProps,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Extended props for our custom useForm hook
export interface UseFormProps<TFormValues extends FieldValues>
  extends Omit<UseHookFormProps<TFormValues>, "resolver"> {
  // Optional Zod schema for validation
  schema?: z.ZodType<any, any>;
  // Optional custom resolver
  resolver?: UseHookFormProps<TFormValues>["resolver"];
}

// Our custom form hook that extends react-hook-form
export const useForm = <TFormValues extends FieldValues>({
  schema,
  resolver,
  ...formProps
}: UseFormProps<TFormValues>): UseFormReturn<TFormValues> => {
  // If a schema is provided, use zodResolver, otherwise use the provided resolver or none
  const formResolver = schema ? zodResolver(schema) : resolver;

  // Return the react-hook-form's useForm with our configuration
  return useHookForm<TFormValues>({
    ...formProps,
    resolver: formResolver,
    // Improve user experience with these default settings
    mode: "onTouched", // Validate on blur by default
    criteriaMode: "all", // Show all validation errors
  });
};
