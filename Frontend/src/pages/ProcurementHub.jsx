import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Package, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../components/Select';

const initialProducts = [
  {
    id: 1,
    name: 'Industrial Copper Wire',
    category: 'Raw Materials',
    price: 480,
    stock: 120,
    supplier: 'Metro Metals',
  },
  {
    id: 2,
    name: 'Smart Sensor Module',
    category: 'Electronics',
    price: 1250,
    stock: 42,
    supplier: 'Nova Circuits',
  },
  {
    id: 3,
    name: 'Packaging Carton Set',
    category: 'Packaging',
    price: 95,
    stock: 300,
    supplier: 'WrapWorks Supply',
  },
  {
    id: 4,
    name: 'Safety Gloves Pack',
    category: 'Operations',
    price: 220,
    stock: 86,
    supplier: 'ShieldPro Industries',
  },
  {
    id: 5,
    name: 'LED Display Panel',
    category: 'Electronics',
    price: 3400,
    stock: 18,
    supplier: 'BrightEdge Tech',
  },
  {
    id: 6,
    name: 'Warehouse Storage Bin',
    category: 'Operations',
    price: 760,
    stock: 55,
    supplier: 'StackFlow Systems',
  },
];

const categories = ['All Categories', 'Electronics', 'Operations', 'Packaging', 'Raw Materials'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export function ProcurementHub() {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [activeQuery, setActiveQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(activeQuery.trim().toLowerCase());
    const matchesCategory =
      activeCategory === 'All Categories' || product.category === activeCategory;

    return matchesQuery && matchesCategory;
  });

  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSearch = () => {
    setActiveQuery(searchQuery);
    setActiveCategory(selectedCategory);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSuccessMessage('');
  };

  const handleConfirmPurchase = () => {
    if (!selectedProduct) {
      return;
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    if (parsedQuantity > selectedProduct.stock) {
      return;
    }

    const purchaseRecord = {
      id: Date.now(),
      productName: selectedProduct.name,
      supplier: selectedProduct.supplier,
      quantity: parsedQuantity,
      total: selectedProduct.price * parsedQuantity,
    };

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === selectedProduct.id
          ? { ...product, stock: product.stock - parsedQuantity }
          : product
      )
    );

    setRecentPurchases((currentPurchases) => [purchaseRecord, ...currentPurchases].slice(0, 6));
    setSelectedProduct((currentProduct) =>
      currentProduct ? { ...currentProduct, stock: currentProduct.stock - parsedQuantity } : currentProduct
    );
    setQuantity(1);
    setSuccessMessage(`Purchase confirmed for ${purchaseRecord.productName}.`);
  };

  const quantityError =
    selectedProduct && Number(quantity) > selectedProduct.stock
      ? 'Requested quantity exceeds available stock.'
      : Number(quantity) <= 0 || !Number.isInteger(Number(quantity))
      ? 'Enter a valid purchase quantity.'
      : '';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400/90">
            Procurement Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Procurement Hub</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Review supplier stock, simulate purchases, and track recent orders before wiring this
            flow to live backend procurement APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Products
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{products.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Suppliers
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {new Set(products.map((product) => product.supplier)).size}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Buys
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{recentPurchases.length}</p>
          </div>
        </div>
      </motion.div>

      {successMessage ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMessage}</span>
        </motion.div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/10"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/15 p-3">
                <Search className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Search & Filter</h2>
                <p className="text-sm text-muted-foreground">
                  Narrow the product list by name and category.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr,0.9fr,auto]">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Search
                </label>
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by product name"
                  className="h-11 rounded-xl border-border bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11 w-full rounded-xl border-border bg-background">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[220px] rounded-xl border border-border bg-card">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="h-11 w-full rounded-xl bg-emerald-500 px-5 text-white hover:bg-emerald-600"
                >
                  Search
                </Button>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Product List</h2>
                <p className="text-sm text-muted-foreground">
                  Dummy catalog ready for backend integration later.
                </p>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                {filteredProducts.length} results
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="grid gap-4 rounded-2xl border border-border bg-background/60 p-4 lg:grid-cols-[1.2fr,0.8fr,0.7fr,1fr,auto] lg:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{product.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                        {product.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Current Price
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {formatCurrency(product.price)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Stock
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{product.stock} units</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Supplier
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{product.supplier}</p>
                    </div>

                    <Button
                      onClick={() => handleSelectProduct(product)}
                      disabled={product.stock === 0}
                      className="h-10 rounded-xl bg-emerald-500 px-4 text-white hover:bg-emerald-600"
                    >
                      Buy
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground/70" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No products match the current search filters.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        </div>

        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/10"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-500/15 p-3">
                <ShoppingCart className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Purchase Panel</h2>
                <p className="text-sm text-muted-foreground">
                  Select a product and simulate a purchase.
                </p>
              </div>
            </div>

            {selectedProduct ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-lg font-semibold text-foreground">{selectedProduct.name}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Supplier
                      </p>
                      <p className="mt-1 text-sm text-foreground">{selectedProduct.supplier}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Available Stock
                      </p>
                      <p className="mt-1 text-sm text-foreground">{selectedProduct.stock} units</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Unit Price
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {formatCurrency(selectedProduct.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Category
                      </p>
                      <p className="mt-1 text-sm text-foreground">{selectedProduct.category}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value === '' ? '' : Number(event.target.value))}
                    className="h-11 rounded-xl border-border bg-background"
                  />
                </div>

                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">
                    Total Price
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(totalPrice || 0)}
                  </p>
                </div>

                {quantityError ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {quantityError}
                  </div>
                ) : null}

                <Button
                  onClick={handleConfirmPurchase}
                  disabled={!selectedProduct.stock || Boolean(quantityError)}
                  className="h-11 w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Confirm Purchase
                </Button>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
                <Truck className="mx-auto h-10 w-10 text-muted-foreground/70" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Choose a product from the list to start a purchase simulation.
                </p>
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/10"
          >
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Purchases</h2>
              <p className="text-sm text-muted-foreground">
                Stored in local state for this frontend simulation.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {recentPurchases.length > 0 ? (
                recentPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="rounded-2xl border border-border bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{purchase.productName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Supplier: {purchase.supplier}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                        {purchase.quantity} units
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      Total: {formatCurrency(purchase.total)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-background/40 px-6 py-10 text-center text-sm text-muted-foreground">
                  No purchases recorded yet.
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
