import { Switch, SwitchProps } from "@heroui/switch";
import { useFormContext, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../ui/form";
import { FieldPath, FieldValues } from "react-hook-form";

export interface FormSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<SwitchProps, "defaultSelected" | "isSelected" | "onChange" | "onValueChange" | "name"> {
  name: TName;
  label: string;
  description?: string;
}

export function FormSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  ...props
}: FormSwitchProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();
  
  return (
    <FormField<TFieldValues, TName>
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-md p-1">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
          <FormControl>
            <Switch
              isSelected={!!field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={!!fieldState.error}
              {...props}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
