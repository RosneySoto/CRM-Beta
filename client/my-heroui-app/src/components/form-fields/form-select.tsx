import { Select, SelectItem, SelectProps } from "@heroui/select";
import { useFormContext, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../ui/form";
import { FieldPath, FieldValues } from "react-hook-form";

export interface SelectOption {
  key: string;
  label: string;
}

export interface FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<SelectProps, "children" | "defaultSelectedKeys" | "selectedKeys" | "onSelectionChange"> {
  name: TName;
  options: SelectOption[];
  label?: string;
  description?: string;
  placeholder?: string;
}

export function FormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  options,
  label,
  description,
  placeholder,
  selectionMode,
  ...props
}: FormSelectProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();

  return (
    <FormField<TFieldValues, TName>
      name={name}
      control={form.control}
      render={({ field, fieldState }) => {
        // Convertir el valor del campo a Set para selectedKeys
        const getSelectedKeys = () => {
          if (!field.value) return new Set();

          if (selectionMode === "multiple") {
            // Para modo múltiple, field.value debería ser un array
            return new Set(Array.isArray(field.value) ? field.value : []);
          } else {
            // Para modo simple, field.value debería ser un string
            return new Set(field.value ? [field.value] : []);
          }
        };

        // Manejar el cambio de selección
        const handleSelectionChange = (keys: any) => {
          if (selectionMode === "multiple") {
            // Convertir Set a array para modo múltiple
            const selectedArray = Array.from(keys) as string[];
            field.onChange(selectedArray);
          } else {
            // Para modo simple, tomar el primer elemento
            const selectedKey = Array.from(keys)[0] as string;
            field.onChange(selectedKey || null);
          }
        };

        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Select
                selectedKeys={getSelectedKeys()}
                onSelectionChange={handleSelectionChange}
                onBlur={field.onBlur}
                isInvalid={!!fieldState.error}
                placeholder={placeholder}
                aria-label={label}
                selectionMode={selectionMode}
                {...props}
              >
                {options.map((option) => (
                  <SelectItem key={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
