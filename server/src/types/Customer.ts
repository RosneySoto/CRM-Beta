interface Vehicle {
   marca: string;
   modelo: string;
   patente: string;
}

export interface CustomerType {
   _id?: string;
   id?: string;
   name: string;
   lastname: string;
   image: string;
   email: string;
   numberPhone: Number;
   vehicles: Vehicle[];
};