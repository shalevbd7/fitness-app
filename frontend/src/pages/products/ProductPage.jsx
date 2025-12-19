import { useEffect, useState } from "react";
import { useProductStore } from "../../store/useProductStore";
import { useUIStore } from "../../store/useUIStore";
import { Search, Package, Loader2, Zap } from "lucide-react";
import ProductModal from "../../components/products/ProductModal";
import AddProductModal from "../../components/products/AddProductModal";

/**
 * Product Catalog page allowing users to browse, search, and manage food items.
 */
const ProductsPage = () => {
  const { products, fetchProducts, isLoading } = useProductStore();
  const { setFabAction, resetFabAction } = useUIStore();

  const [searchTerm, setSearchTerm] = useState("");

  // State for managing the viewing/editing of an existing product
  const [selectedProduct, setSelectedProduct] = useState(null);

  // State for controlling the "Add New Product" modal visibility
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Connect the Global Navbar "Plus" button to the local Add Product modal
  useEffect(() => {
    setFabAction(() => setIsAddProductOpen(true));

    // Reset the floating action button behavior when navigating away
    return () => resetFabAction();
  }, [setFabAction, resetFabAction]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Filter products based on the search query.
   */
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 p-4 min-h-screen bg-base-100">
      {/* Search Header Section */}
      <div className="sticky top-16 z-30 bg-base-100 pt-2 pb-4 -mx-4 px-4 border-b border-base-200/50 backdrop-blur-md bg-opacity-90">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 size-5" />
          <input
            type="text"
            placeholder="Search products..."
            className="input input-bordered w-full pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content: Loading, Empty, or Product Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary size-8" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
          <Package className="size-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">No products found</p>
          {searchTerm && (
            <p className="text-sm">Try searching for something else</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => setSelectedProduct(product)}
              className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer active:scale-95 duration-200 group mt-10"
            >
              <div className="card-body p-4 items-center text-center">
                <h3 className="font-bold text-sm line-clamp-2 h-10 flex items-center w-full justify-center group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-base-content/70 mt-2 bg-base-200 px-3 py-1 rounded-full">
                  <Zap className="size-3 text-warning fill-warning" />
                  <span className="font-mono font-medium">
                    {product.valuesPer100g.calories}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Management Modals */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
};

export default ProductsPage;
