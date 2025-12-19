import { axiosInstance } from "../lib/axios";

const PRODUCTS_API = "/products";

/**
 * Fetches all available products (Global and Custom).
 * Returns: { success: true, products: [] }
 */
export const getAllProducts = async () => {
  const response = await axiosInstance.get(PRODUCTS_API);
  return response.data;
};

/**
 * Creates a new product in the database.
 * @param {object} productData - Includes name, valuesPer100g, and unit.
 */
export const createProduct = async (productData) => {
  const response = await axiosInstance.post(
    `${PRODUCTS_API}/create`,
    productData
  );
  return response.data;
};

/**
 * Updates an existing product's information.
 * @param {string} id - Product ID.
 * @param {object} productData - Fields to update.
 */
export const updateProduct = async (id, productData) => {
  const response = await axiosInstance.patch(
    `${PRODUCTS_API}/${id}`,
    productData
  );
  return response.data;
};

/**
 * Deletes a product by its ID.
 */
export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`${PRODUCTS_API}/${id}`);
  return response.data;
};
