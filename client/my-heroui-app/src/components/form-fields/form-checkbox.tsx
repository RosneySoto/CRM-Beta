import { Checkbox, CheckboxProps } from "@heroui/checkbox";
import { useFormContext, FormField, FormItem, FormControl, FormDescription, FormMessage } from "../ui/form";
import { FieldPath, FieldValues } from "react-hook-form";

export interface FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<CheckboxProps, "defaultSelected" | "isSelected" | "onChange" | "onValueChange" | "name"> {
  name: TName;
  label: string;
  description?: string;
}

export function FormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  ...props
}: FormCheckboxProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();
  
  return (
    <FormField<TFieldValues, TName>
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
          <FormControl>
            <Checkbox
              isSelected={!!field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={!!fieldState.error}
              {...props}
            >
              {label}
            </Checkbox>
          </FormControl>
          <div className="space-y-1 leading-none">
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
