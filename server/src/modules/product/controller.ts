import { addProduct as _addProduct,
         findProductById as _findProductById,
         updateProduct as _updateProduct,
         deleteProduct as _deleteProduct
} from './store';
import { ProductType } from '../../types/Product';
import Products from './model';

export async function addProduct(data: ProductType) {
   try {
      if(data.product === "" || data.price === ""){
         return {
            status: 400,
            message: "Missing data"
         };
      };

      const existingProduct = await Products.findOne({product: data.product});
      if(existingProduct){
         return {
            status: 401,
            message: 'The product already exists'
         };
      } else {
         const newProduct = await _addProduct(data);
         return {
            status: 201,
            message: newProduct
         }
      }
   } catch (error) {
      console.error('Unexpected Controller Error:', error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error,
      };
   };
};

export async function findProductById(id: string) {
   try {
      const result = await _findProductById(id);

      if(!result){
         return {
            status: 400,
            message: "Product no found or not existing"
         }
      } else {
         return {
            status: 200,
            message: result
         }
      }
   } catch (error) {
      console.error('Unexpected Controller Error:', error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error,
      };
   };
};

export async function updateProduct(id: string, data: ProductType) {
   try {
      const result = await _updateProduct(id, data);
      if(!result){
         return {
            status: 400,
            message: 'An error occurred while updating the product'
         }
      } else {
         return {
            status: 200,
            message: result.message
         }
      }
   } catch (error) {
      console.error('Unexpected Controller Error:', error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error,
      };
   };
};

export async function deleteProduct(id: string) {
   try {
      const result = await _deleteProduct(id);
      console.log('*** ' + result + ' *****');

      if (!result || result.status !== 200) {
         return {
            status: 400,
            message: 'An error occurred while deleting product'
         };
      }
      return result;
   } catch (error) {
      console.error('Unexpected Controller Error:', error);
      return {
         status: 500,
         message: 'Unexpected Controller Error',
         detail: error,
      };
   };
};
