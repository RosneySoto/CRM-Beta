import React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";

// Context to provide form field information throughout the component tree
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null,
);

// Context to provide form item information throughout the component tree
type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

// Form component that wraps FormProvider
interface FormProps<TFieldValues extends FieldValues>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  form: ReturnType<typeof useFormContext> | any;
  onSubmit: (values: TFieldValues) => void;
  children: React.ReactNode;
}

export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  ...props
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        {children}
      </form>
    </FormProvider>
  );
}

// FormField component to handle form control
interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
  render: (props: {
    field: any;
    fieldState: any;
    formState: any;
  }) => React.ReactElement;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  render,
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller
        control={control}
        defaultValue={defaultValue}
        name={name}
        render={({ field, fieldState, formState }) =>
          render({ field, fieldState, formState })
        }
        rules={rules}
        shouldUnregister={shouldUnregister}
      />
    </FormFieldContext.Provider>
  );
}

// Hook to use form field context
export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext?.name });

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  return React.useMemo(
    () => ({
      id: itemContext.id,
      name: fieldContext.name,
      formItemId: `${itemContext.id}-form-item`,
      formLabelId: `${itemContext.id}-form-item-label`,
      formDescriptionId: `${itemContext.id}-form-item-description`,
      formMessageId: `${itemContext.id}-form-item-message`,
      ...fieldState,
    }),
    [itemContext.id, fieldContext.name, fieldState],
  );
}

// FormItem component for grouping form elements
interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormItem({ className, ...props }: FormItemProps) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        className={cn("space-y-2 w-full", className)}
        data-slot="form-item"
        {...props}
      />
    </FormItemContext.Provider>
  );
}

// FormLabel component
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function FormLabel({ className, ...props }: FormLabelProps) {
  const { error, formItemId, formLabelId } = useFormField();

  return (
    <label
      className={cn(
        "block subpixel-antialiased text-small group-data-[required=true]:after:content-['*'] group-data-[required=true]:after:text-danger group-data-[required=true]:after:ml-0.5 group-data-[invalid=true]:text-danger w-full text-foreground !ease-out !duration-200 will-change-auto motion-reduce:transition-none transition-[color,opacity]",
        className,
        !!error && "!text-danger",
      )}
      data-error={!!error}
      data-slot="form-label"
      htmlFor={formItemId}
      id={formLabelId}
      {...props}
    />
  );
}

// FormControl component
interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormControl({ ...props }: FormControlProps) {
  const {
    error,
    formItemId,
    formLabelId,
    formDescriptionId,
    formMessageId,
    name,
  } = useFormField();

  return (
    <div
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      aria-label={`Form control for ${name}`}
      aria-labelledby={formLabelId}
      data-slot="form-control"
      id={formItemId}
      {...props}
    />
  );
}

// FormDescription component
interface FormDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function FormDescription({ className, ...props }: FormDescriptionProps) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-xs text-foreground-500", className)}
      data-slot="form-description"
      id={formDescriptionId}
      {...props}
    />
  );
}

// FormMessage component for displaying validation errors
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export function FormMessage({
  className,
  children,
  ...props
}: FormMessageProps) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message || "") : children;

  if (!body) {
    return null;
  }

  return (
    <p
      className={cn("text-xs font-medium text-danger", className)}
      data-slot="form-message"
      id={formMessageId}
      {...props}
    >
      {body}
    </p>
  );
}

export { useFormContext };
