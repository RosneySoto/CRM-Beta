import React, { useState, useCallback, useMemo, Key } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Listbox, ListboxItem, ListboxSection } from "@heroui/listbox";
import { Input } from "@heroui/input";
import { Button, PressEvent } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { FieldPath, FieldValues } from "react-hook-form";

import {
  useFormContext,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../ui/form";

// Tipos para las opciones del selector
export interface SelectorOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Props del componente FormSelector
export interface FormSelectorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: string;
  description?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  addNewButtonText?: string;
  modalTitle?: string;
  modalSubmitLabel?: string;

  // Opciones y datos
  options: SelectorOption[];

  children?: React.ReactNode;
  selectedKeys?: Iterable<Key> | undefined;
  setSelectedKeys?: ((keys: any) => void) | undefined

  // Configuración de comportamiento
  isMultiple?: boolean;
  isSearchable?: boolean;
  canCreateNew?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;

  // Callbacks
  onCreateNew?: (
    formData: Record<string, any>,
  ) => SelectorOption | Promise<SelectorOption>;
  onSelectionChange?: (selected: string | string[]) => void;

  onGetMetadata?: (selected: SelectorOption["metadata"]) => void;
  onChange?: () => void;
  // Configuración del modal
  modalFields?: Array<{
    name: string;
    label: string;
    type?: "text" | "email" | "number" | "textarea";
    placeholder?: string;
    required?: boolean;
  }>;

  // Filtrado personalizado
  filterFunction?: (option: SelectorOption, searchTerm: string) => boolean;

  // Renderizado personalizado
  optionRenderer?: (
    option: SelectorOption,
    isSelected: boolean,
  ) => React.ReactNode;

  // Props de componentes internos
  popoverProps?: any;
  listboxProps?: any;
  inputProps?: any;
  buttonProps?: any;
  scrollShadowProps?: any;
  listboxSectionProps?: any;
  listboxItemProps?: any;
}

// Función de filtrado por defecto
const defaultFilterFunction = (
  option: SelectorOption,
  searchTerm: string,
): boolean => {
  const searchLower = searchTerm.toLowerCase();

  return (
    option.label.toLowerCase().includes(searchLower) ||
    option.description?.toLowerCase().includes(searchLower) ||
    option.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
    false
  );
};

// Renderizador por defecto
const defaultOptionRenderer = (
  option: SelectorOption,
  isSelected: boolean,
): React.ReactNode => {
  return (
    <div className="flex items-center justify-between w-full pr-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="text-sm">{option.label}</span>
        </div>
      </div>
      {option.tags && option.tags.length > 0 && (
        <div className="flex gap-1">
          {option.tags.slice(0, 2).map((tag, index) => (
            <Chip
              key={index}
              size="sm"
              variant="flat"
              className="text-xs"
              color={isSelected ? "primary" : "default"}
            >
              {tag.toLocaleLowerCase()}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
};

export function FormSelector<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  placeholder = "Seleccionar opción",
  searchPlaceholder = "Buscar...",
  noOptionsMessage = "No hay opciones disponibles",
  addNewButtonText = "Agregar nuevo",
  modalTitle = "Agregar Nueva Opción",
  modalSubmitLabel = "Agregar",
  modalFields,

  children,
  selectedKeys,
  setSelectedKeys,

  options,
  isMultiple = false,
  isSearchable = true,
  canCreateNew = false,
  isDisabled = false,
  isOpen,
  setIsOpen,

  onCreateNew,
  onSelectionChange,
  onGetMetadata,
  onChange,
  filterFunction = defaultFilterFunction,
  optionRenderer = defaultOptionRenderer,

  popoverProps,
  listboxProps,
  listboxSectionProps,
  listboxItemProps,
  inputProps,
  buttonProps,
  scrollShadowProps,
}: FormSelectorProps<TFieldValues, TName>) {
  // const [isOpen, setIsOpen] = useState(false);

  const form = useFormContext<TFieldValues>();
  const [searchQuery, setSearchQuery] = useState("");
  const [localOptions, setLocalOptions] = useState<SelectorOption[]>(options);
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onOpenChange: onModalOpenChange,
  } = useDisclosure();
  const [modalFormData, setModalFormData] = useState<Record<string, any>>({});

  // Filtrar opciones basado en la búsqueda
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return localOptions;

    return localOptions.filter((option) => filterFunction(option, searchQuery));
  }, [localOptions, searchQuery, filterFunction]);

  // Agrupar opciones por grupo si existe
  const groupedOptions = useMemo(() => {
    const groups: Record<string, SelectorOption[]> = {};

    filteredOptions.forEach((option) => {
      const groupKey = option.group || "default";

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(option);
    });

    return groups;
  }, [filteredOptions]);

  // Manejar búsqueda
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Manejar apertura del modal
  const handleOpenModal = useCallback(() => {
    if (setIsOpen) setIsOpen(false); // ✅ Cerrar Popover primero
    setModalFormData({}); // Resetear datos del modal
    onModalOpen();
  }, [onModalOpen]);

  // Manejar creación de nueva opción
  const handleCreateNew = useCallback(async () => {
    if (!onCreateNew) return;

    // Validar campos requeridos
    const defaultFields = modalFields || [
      { name: "label", label: "Nombre", required: true },
    ];
    const hasRequiredFields = defaultFields
      .filter((field) => field.required)
      .every((field) => modalFormData[field.name]?.trim());

    if (!hasRequiredFields) return;

    try {
      const newOption = await onCreateNew(modalFormData);
      setLocalOptions((prev) => [...prev, newOption]);
      setModalFormData({});
      onModalOpenChange(); // ✅ Cerrar modal correctamente
    } catch (error) {
      console.error("Error creating new option:", error);
    }
  }, [modalFormData, onCreateNew, onModalOpenChange, modalFields]);

  // Manejar cambios en los campos del modal
  const handleModalFieldChange = useCallback(
    (fieldName: string, value: any) => {
      setModalFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    },
    [],
  );

  // Obtener opciones seleccionadas
  const getSelectedOptions = useCallback(
    (value: any): SelectorOption[] => {
      if (!value) return [];

      if (isMultiple && Array.isArray(value)) {
        return value
          .map((id) => localOptions.find((opt) => opt.id === id))
          .filter(Boolean) as SelectorOption[];
      }

      const option = localOptions.find((opt) => opt.id === value);

      return option ? [option] : [];
    },
    [localOptions, isMultiple],
  );

  // Obtener etiqueta de la opción seleccionada (para single select)
  const getSelectedLabel = useCallback(
    (value: any): string => {
      if (!value) return "";

      if (isMultiple && Array.isArray(value)) {
        if (value.length === 0) return "";

        return `${value.length} seleccionados`;
      }

      const option = localOptions.find((opt) => opt.id === value);

      return option?.label || "";
    },
    [localOptions, isMultiple],
  );

  return (
    <>
      <FormField<TFieldValues, TName>
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Popover
                isOpen={isOpen}
                placement="bottom"
                onOpenChange={setIsOpen}
                {...popoverProps}
              >
                <PopoverTrigger>
                  {children || (
                    <Button
                      variant="flat"
                      size="sm"
                      className="w-full justify-between min-h-10 h-auto rounded-medium"
                      isDisabled={isDisabled}
                      color={!!fieldState.error ? "danger" : "default"}
                      endContent={
                        <svg
                          className="w-4 h-4 text-default-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      }
                      {...buttonProps}
                    >
                      <div className="flex-1 flex items-center min-w-0">
                        {isMultiple ? (
                          // Renderizado para selección múltiple con chips
                          getSelectedOptions(field.value).length > 0 ? (
                            <ScrollShadow
                              orientation="horizontal"
                              className="flex gap-1 py-1 max-w-full"
                              hideScrollBar
                            >
                              <div className="flex gap-1 min-w-max">
                                {getSelectedOptions(field.value).map(
                                  (option) => (
                                    <Chip
                                      key={option.id}
                                      size="sm"
                                      variant="flat"
                                      color="primary"
                                      className="flex-shrink-0"
                                      startContent={option.icon}
                                      onClose={(e: PressEvent) => {
                                        e.continuePropagation();
                                        const currentValues = Array.isArray(
                                          field.value
                                        )
                                          ? field.value
                                          : [];
                                        const newValues = currentValues.filter(
                                          (id: string) => id !== option.id
                                        );

                                        field.onChange(newValues);
                                        onSelectionChange?.(newValues);
                                      }}
                                    >
                                      {option.label}
                                    </Chip>
                                  )
                                )}
                              </div>
                            </ScrollShadow>
                          ) : (
                            <span className="text-default-500 text-left">
                              {placeholder}
                            </span>
                          )
                        ) : (
                          // Renderizado para selección simple
                          <span className="text-left truncate">
                            {getSelectedLabel(field.value) || placeholder}
                          </span>
                        )}
                      </div>
                    </Button>
                  )}
                </PopoverTrigger>

                <PopoverContent className="w-full min-w-[300px] p-0">
                  <div className="flex flex-col gap-5 p-5 w-full">
                    {/* Campo de búsqueda */}
                    {isSearchable && (
                      <div>
                        <Input
                          placeholder={searchPlaceholder}
                          value={searchQuery}
                          onValueChange={handleSearchChange}
                          variant="flat"
                          startContent={
                            <svg
                              className="w-4 h-4 text-default-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          }
                          {...inputProps}
                        />
                      </div>
                    )}

                    {/* Lista de opciones */}
                    {filteredOptions.length && (
                      <ScrollShadow
                        hideScrollBar
                        className="max-h-60"
                        {...scrollShadowProps}
                      >
                        {filteredOptions.length ? (
                          <Listbox
                            aria-label={label || "Selector options"}
                            variant="flat"
                            selectionMode={isMultiple ? "multiple" : "single"}
                            {...(isMultiple ? {
                              selectedKeys: new Set(Array.isArray(field.value) ? field.value : [])
                            } : selectedKeys ? {
                              selectedKeys: selectedKeys
                            } : {})}
                            onSelectionChange={(keys) => {
                              const selectedArray = Array.from(
                                keys
                              ) as string[];

                              const newValue = isMultiple
                                ? selectedArray
                                : selectedArray[0] || null;

                              onSelectionChange?.(
                                newValue as string | string[]
                              );

                              field.onChange(newValue);

                              onGetMetadata?.(
                                localOptions.find((opt) => opt.id === newValue)?.metadata,
                              );

                              onChange?.();

                              if (!isMultiple && setIsOpen) {
                                setIsOpen(false);
                                setSearchQuery("");
                              }
                            }}
                            onAction={(value) => {
                              field.onChange(value);

                              onGetMetadata?.(
                                localOptions.find((opt) => opt.id === value)?.metadata,
                              );

                              setSelectedKeys?.(new Set([field.value]))

                              onChange?.();

                              if (setIsOpen) setIsOpen(false);
                            }}
                            disabledKeys={localOptions
                              .filter((opt) => opt.disabled)
                              .map((opt) => opt.id)}

                            classNames={{
                              list: "gap-1",
                            }}
                            {...listboxProps}
                          >
                            {Object.entries(groupedOptions).map(
                              ([groupKey, groupOptions]) => (
                                <ListboxSection
                                  key={groupKey}
                                  title={
                                    groupKey !== "default"
                                      ? groupKey
                                      : undefined
                                  }
                                  className="mb-0"
                                  classNames={{
                                    group: "flex flex-col gap-0",
                                    heading:
                                      "text-xs text-default-500 px-3 py-2",
                                  }}
                                  {...listboxSectionProps}
                                >
                                  {groupOptions.map((option) => {
                                    const isSelected = isMultiple
                                      ? Array.isArray(field.value) &&
                                      field.value.includes(option.id)
                                      : field.value === option.id;

                                    return (
                                      <ListboxItem
                                        key={option.id}
                                        textValue={option.label}
                                        startContent={option.icon}
                                        classNames={{
                                          base: "aria-[selected=true]:bg-default/40 dark:aria-[selected=true]:bg-zinc-800",
                                          title: "text-sm",
                                        }}
                                        {...listboxItemProps}
                                      >
                                        {optionRenderer(option, isSelected)}
                                      </ListboxItem>
                                    );
                                  })}
                                </ListboxSection>
                              ),
                            )}
                          </Listbox>
                        ) : (
                          <div className="flex items-center justify-center py-8 text-sm text-default-500">
                            {searchQuery.trim()
                              ? noOptionsMessage
                              : "No hay opciones"}
                          </div>
                        )}
                      </ScrollShadow>
                    )}

                    {/* Botón para agregar nueva opción */}
                    {canCreateNew && onCreateNew && (
                      <div>
                        <Button
                          onPress={handleOpenModal}
                          variant="flat"
                          color="primary"
                          className="w-full"
                          size="sm"
                          startContent={
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          }
                          {...buttonProps}
                        >
                          {addNewButtonText}
                        </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Modal para crear nueva opción */}
      {canCreateNew && onCreateNew && (
        <Modal isOpen={isModalOpen} onOpenChange={onModalOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {modalTitle}
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    {(
                      modalFields || [
                        {
                          name: "label",
                          label: "Nombre",
                          required: true,
                          placeholder: "Ingresa el nombre",
                        },
                      ]
                    ).map((field, index) => (
                      <div key={field.name}>
                        {field.type === "textarea" ? (
                          <textarea
                            autoFocus={index === 0}
                            className="w-full p-3 border border-default-200 rounded-lg resize-none"
                            placeholder={field.placeholder}
                            rows={3}
                            value={modalFormData[field.name] || ""}
                            onChange={(e) =>
                              handleModalFieldChange(field.name, e.target.value)
                            }
                          />
                        ) : (
                          <Input
                            autoFocus={index === 0}
                            isRequired={field.required}
                            label={field.label}
                            placeholder={field.placeholder}
                            type={field.type || "text"}
                            value={modalFormData[field.name] || ""}
                            variant="bordered"
                            onValueChange={(value) =>
                              handleModalFieldChange(field.name, value)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    isDisabled={(
                      modalFields || [{ name: "label", required: true }]
                    )
                      .filter((field) => field.required)
                      .some((field) => !modalFormData[field.name]?.trim())}
                    onPress={handleCreateNew}
                  >
                    {modalSubmitLabel}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
