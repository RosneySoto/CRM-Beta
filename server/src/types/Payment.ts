export interface PaymentType {
   _id?: string;
   id?: string;
   billId: number;
   orderBuyId: string;
   paymentMethod: string;
   amount: number;
   payDate?: Date;
   active?: boolean;
}