import { create } from "zustand";
import toast from "react-hot-toast";
import * as productService from "../services/productService";

export const useProductStore = create((set, get) => ({
  products: [],
  isLoading: false,

  /**
   * Loads the product catalog.
   */
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await productService.getAllProducts();
      set({ products: res.products || res || [] });
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to load products");
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Creates a new product and adds it to the local state.
   */
  createProduct: async (productData) => {
    set({ isLoading: true });
    try {
      const res = await productService.createProduct(productData);
      const newProduct = res.product || res;
      set((state) => ({ products: [...state.products, newProduct] }));
      toast.success("Product created successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product.");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Updates an existing product and synchronizes local state.
   */
  updateProduct: async (id, updates) => {
    try {
      const res = await productService.updateProduct(id, updates);
      const updatedProduct = res.product || res;

      set((state) => ({
        products: state.products.map((p) =>
          p._id === id ? updatedProduct : p
        ),
      }));

      toast.success("Product updated successfully");
      return true;
    } catch (error) {
      console.error("Update product error:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
      return false;
    }
  },

  /**
   * Deletes a product from the database and local state.
   */
  deleteProduct: async (id) => {
    try {
      await productService.deleteProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
      }));
      toast.success("Product deleted successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
      return false;
    }
  },
}));
