import { useEffect, useCallback } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

// Función auxiliar para convertir strings de fecha de vuelta a objetos Date
function convertDatesFromStorage(data: any, dateFields?: string[]): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertDatesFromStorage(item, dateFields));
  }
  
  if (typeof data === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (dateFields && dateFields.includes(key) && typeof value === 'string') {
        // Convertir campo específico de fecha
        try {
          converted[key] = new Date(value);
        } catch {
          converted[key] = value;
        }
      } else if (!dateFields && typeof value === 'string') {
        // Auto-detectar fechas ISO si no se especifican campos
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
        if (dateRegex.test(value)) {
          converted[key] = new Date(value);
        } else {
          converted[key] = value;
        }
      } else {
        converted[key] = convertDatesFromStorage(value, dateFields);
      }
    }
    return converted;
  }
  
  return data;
}

export interface FormPersistenceConfig {
  key: string;
  storage?: Storage;
  include?: string[];
  exclude?: string[];
  debounceMs?: number;
  encryptionKey?: string;
  dateFields?: string[]; // Campos que contienen fechas
}

export function useFormPersistence<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  config: FormPersistenceConfig
) {
  const {
    key,
    storage = localStorage,
    include,
    exclude,
    debounceMs = 500,
    encryptionKey,
    dateFields
  } = config;

  // Función para filtrar campos
  const filterFields = useCallback((data: TFieldValues): Partial<TFieldValues> => {
    const entries = Object.entries(data);
    
    let filteredEntries = entries;
    
    if (include) {
      filteredEntries = entries.filter(([fieldName]) => include.includes(fieldName));
    }
    
    if (exclude) {
      filteredEntries = entries.filter(([fieldName]) => !exclude.includes(fieldName));
    }
    
    return Object.fromEntries(filteredEntries) as Partial<TFieldValues>;
  }, [include, exclude]);

  // Función para encriptar datos (básica)
  const encrypt = useCallback((data: string): string => {
    if (!encryptionKey) return data;
    
    // Implementación básica de encriptación (en producción usar una librería robusta)
    return btoa(data + encryptionKey);
  }, [encryptionKey]);

  // Función para desencriptar datos
  const decrypt = useCallback((encryptedData: string): string => {
    if (!encryptionKey) return encryptedData;
    
    try {
      const decoded = atob(encryptedData);
      return decoded.replace(encryptionKey, '');
    } catch {
      return encryptedData;
    }
  }, [encryptionKey]);

  // Guardar datos en storage
  const saveToStorage = useCallback((data: TFieldValues) => {
    try {
      const filteredData = filterFields(data);
      const serializedData = JSON.stringify(filteredData);
      const dataToStore = encrypt(serializedData);
      storage.setItem(key, dataToStore);
    } catch (error) {
      console.warn('Error saving form data to storage:', error);
    }
  }, [key, storage, filterFields, encrypt]);

  // Cargar datos desde storage
  const loadFromStorage = useCallback((): Partial<TFieldValues> | null => {
    try {
      const storedData = storage.getItem(key);
      if (!storedData) return null;
      
      const decryptedData = decrypt(storedData);
      const parsedData = JSON.parse(decryptedData);
      
      // Convertir strings de fecha de vuelta a objetos Date
      const convertedData = convertDatesFromStorage(parsedData, dateFields);
      return convertedData;
    } catch (error) {
      console.warn('Error loading form data from storage:', error);
      return null;
    }
  }, [key, storage, decrypt]);

  // Limpiar storage
  const clearStorage = useCallback(() => {
    try {
      storage.removeItem(key);
    } catch (error) {
      console.warn('Error clearing form data from storage:', error);
    }
  }, [key, storage]);

  // Restaurar datos del formulario
  const restoreForm = useCallback(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      // Usar reset para establecer los valores sin triggear validación
      form.reset(savedData as TFieldValues);
      return true;
    }
    return false;
  }, [loadFromStorage, form]);

  // Effect para cargar datos al montar el componente
  useEffect(() => {
    restoreForm();
  }, [restoreForm]);

  // Effect para guardar datos cuando cambien los valores del formulario
  useEffect(() => {
    const subscription = form.watch((data) => {
      const timeoutId = setTimeout(() => {
        saveToStorage(data as TFieldValues);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, saveToStorage, debounceMs]);

  return {
    saveToStorage: () => saveToStorage(form.getValues()),
    loadFromStorage,
    clearStorage,
    restoreForm,
    hasStoredData: () => !!loadFromStorage(),
  };
}

// Hook específico para auto-save
export function useAutoSave<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  config: {
    key: string;
    interval?: number;
    onSave?: (data: TFieldValues) => void;
    onError?: (error: Error) => void;
  }
) {
  const { key, interval = 30000, onSave, onError } = config;

  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const data = form.getValues();
        localStorage.setItem(`autosave_${key}`, JSON.stringify({
          data,
          timestamp: Date.now(),
        }));
        onSave?.(data);
      } catch (error) {
        onError?.(error as Error);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [form, key, interval, onSave, onError]);

  const getLastSave = useCallback(() => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [key]);

  const clearAutoSave = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
  }, [key]);

  return {
    getLastSave,
    clearAutoSave,
    hasAutoSave: () => !!getLastSave(),
  };
}
