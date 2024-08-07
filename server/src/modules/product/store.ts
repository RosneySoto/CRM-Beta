import Products from "./model";
import { ProductType } from '../../types/Product';

export async function addProduct(data: ProductType) {
   try {
      const newItem = new Products(data);
      const result = await newItem.save();
      return {
         status: 201,
         message: result
      };
   } catch (error) {
      console.log("[ERROR] -> addProduct", error);
      return {
         status: 400,
         message: "An error occurred while creating the product",
         detail: error
      };
   };
};

export async function findProductById(id: string) {
   try {
      const result = await Products.findById(id);

      if(!result){
         return {
            status: 400,
            message: 'Product no found'
         }
      } else {
         return {
            status: 200,
            message: result
         };
      };
   } catch (error) {
      console.log("[ERROR] -> findProductById", error);
      return {
         status: 400,
         message: "An error occurred while updating the product",
         detail: error
      };
   };
};

export async function updateProduct(id: string, data: ProductType) {
   try {
      if(!id){
         return {
            status: 400,
            message: 'Product no found'
         }
      }
      const productUpdate = await Products.findByIdAndUpdate(id, data, { new: true });
      if(!productUpdate){
         return {
            status: 400,
            message: 'Error, product no found'
         }
      }
      return {
         status: 200,
         message: productUpdate
      }
   } catch (e) {
      console.log("[ERROR] -> addUser", e);
      return {
         status: 400,
         message: "An error occurred while creating the user",
         detail: e,
      };
   };
};

export async function deleteProduct(id: string) {
   try {
      if (!id || id === '') {
         return {
            status: 400,
            message: 'Error, product not found'
         };
      }
      const productFind = await Products.findOne({ _id: id });
      if (!productFind) throw new Error('Product not found');
      
      productFind.active = false;
      await productFind.save();

      return {
         status: 200,
         message: `Product ${id} marked as inactive`
      };
   } catch (e) {
      console.log("[ERROR] -> deleteProduct", e);
      return {
         status: 400,
         message: "An error occurred while deleting product",
         detail: e,
      };
   };
};
