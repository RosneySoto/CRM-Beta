import { Autocomplete, AutocompleteItem, AutocompleteProps } from "@heroui/autocomplete";
import { useFormContext, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../ui/form";
import { FieldPath, FieldValues } from "react-hook-form";

export interface AutocompleteOption {
  key: string;
  label: string;
  description?: string;
}

export interface FormAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<AutocompleteProps<AutocompleteOption>, "children" | "defaultSelectedKey" | "selectedKey" | "onSelectionChange"> {
  name: TName;
  options: AutocompleteOption[];
  label?: string;
  description?: string;
}

export function FormAutocomplete<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  options,
  label,
  description,
  ...props
}: FormAutocompleteProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();
  
  return (
    <FormField<TFieldValues, TName>
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Autocomplete
              defaultItems={options}
              selectedKey={field.value}
              onSelectionChange={(key) => field.onChange(key)}
              onBlur={field.onBlur}
              isInvalid={!!fieldState.error}
              {...props}
            >
              {(item) => (
                <AutocompleteItem key={item.key} description={item.description}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
