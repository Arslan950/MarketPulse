import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle2,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../components/Select';

const CATALOG_API_URL = 'http://localhost:3000/api/v1/catalog';
const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

const EMPTY_LISTING_FORM = {
  itemName: '',
  category: '',
  unitsAvailable: '',
  supplierName: '',
  wholesalePrice: '',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const getRequestConfig = () => {
  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  return {
    withCredentials: true,
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : {},
  };
};

const normalizeCatalogItem = (item) => ({
  id: item?._id ?? '',
  name: item?.itemName ?? 'Untitled Item',
  category: item?.category ?? 'Uncategorized',
  price: Number(item?.wholesalePrice ?? 0),
  stock: Number(item?.unitsAvailable ?? 0),
  supplier: item?.supplierName ?? 'Unknown Supplier',
});

export function ProcurementHub() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [activeQuery, setActiveQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [pageMessage, setPageMessage] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [listingForm, setListingForm] = useState(EMPTY_LISTING_FORM);
  const [listingError, setListingError] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const fetchCatalog = async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }

    setLoadError('');

    try {
      const response = await axios.get(`${CATALOG_API_URL}/get-catalog`, getRequestConfig());
      const items = response?.data?.data?.items ?? [];
      const normalizedProducts = items.map(normalizeCatalogItem);

      setProducts(normalizedProducts);
      setSelectedProduct((currentProduct) => {
        if (!currentProduct) {
          return currentProduct;
        }

        return normalizedProducts.find((product) => product.id === currentProduct.id) ?? null;
      });
    } catch (error) {
      setLoadError(error?.response?.data?.message || 'Unable to load the procurement catalog.');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (!pageMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPageMessage(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [pageMessage]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
    return ['All Categories', ...uniqueCategories.sort((left, right) => left.localeCompare(right))];
  }, [products]);

  useEffect(() => {
    if (selectedCategory !== 'All Categories' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All Categories');
    }

    if (activeCategory !== 'All Categories' && !categories.includes(activeCategory)) {
      setActiveCategory('All Categories');
    }
  }, [activeCategory, categories, selectedCategory]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesQuery = product.name.toLowerCase().includes(activeQuery.trim().toLowerCase());
        const matchesCategory =
          activeCategory === 'All Categories' || product.category === activeCategory;

        return matchesQuery && matchesCategory;
      }),
    [activeCategory, activeQuery, products]
  );

  const parsedQuantity = Number(quantity);
  const totalPrice =
    selectedProduct && Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? selectedProduct.price * parsedQuantity
      : 0;

  const quantityError = useMemo(() => {
    if (!selectedProduct) {
      return '';
    }

    if (quantity === '') {
      return 'Enter a purchase quantity.';
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return 'Enter a valid purchase quantity.';
    }

    if (parsedQuantity > selectedProduct.stock) {
      return `Requested quantity exceeds available stock (${selectedProduct.stock} units left).`;
    }

    return '';
  }, [parsedQuantity, quantity, selectedProduct]);

  const handleSearch = () => {
    setActiveQuery(searchQuery);
    setActiveCategory(selectedCategory);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setQuantity('1');
    setPageMessage(null);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct || quantityError) {
      return;
    }

    setIsPurchasing(true);
    setPageMessage(null);

    try {
      const response = await axios.post(
        `${CATALOG_API_URL}/buy/${selectedProduct.id}`,
        { quantity: parsedQuantity },
        getRequestConfig()
      );

      const remainingStock = Number(
        response?.data?.data?.wholesalerRemainingStock ?? selectedProduct.stock - parsedQuantity
      );
      const purchasedProductName =
        response?.data?.data?.buyerInventory?.productName ?? selectedProduct.name;
      const successText =
        response?.data?.message || `Purchase confirmed for ${purchasedProductName}.`;

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === selectedProduct.id ? { ...product, stock: remainingStock } : product
        )
      );
      setSelectedProduct((currentProduct) =>
        currentProduct?.id === selectedProduct.id
          ? { ...currentProduct, stock: remainingStock }
          : currentProduct
      );
      setRecentPurchases((currentPurchases) =>
        [
          {
            id: `${selectedProduct.id}-${Date.now()}`,
            productName: purchasedProductName,
            supplier: selectedProduct.supplier,
            quantity: parsedQuantity,
            total: selectedProduct.price * parsedQuantity,
          },
          ...currentPurchases,
        ].slice(0, 6)
      );
      setQuantity('1');
      setPageMessage({
        type: 'success',
        text: successText,
      });
    } catch (error) {
      setPageMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Unable to complete the purchase right now.',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleListingFieldChange = (event) => {
    const { name, value } = event.target;

    setListingForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleAddItem = async (event) => {
    event.preventDefault();
    setListingError('');
    setPageMessage(null);

    const payload = {
      itemName: listingForm.itemName.trim(),
      category: listingForm.category.trim(),
      unitsAvailable: Number(listingForm.unitsAvailable),
      supplierName: listingForm.supplierName.trim(),
      wholesalePrice: Number(listingForm.wholesalePrice),
    };

    if (!payload.itemName || !payload.category || !payload.supplierName) {
      setListingError('Please fill in item name, category, and supplier name.');
      return;
    }

    if (Number.isNaN(payload.unitsAvailable) || Number.isNaN(payload.wholesalePrice)) {
      setListingError('Please enter valid numeric values for units available and wholesale price.');
      return;
    }

    if (!Number.isInteger(payload.unitsAvailable) || payload.unitsAvailable <= 0) {
      setListingError('Units available must be a whole number greater than zero.');
      return;
    }

    if (payload.wholesalePrice < 0) {
      setListingError('Wholesale price cannot be negative.');
      return;
    }

    setIsAddingItem(true);

    try {
      const response = await axios.post(`${CATALOG_API_URL}/add-item`, payload, getRequestConfig());

      setListingForm(EMPTY_LISTING_FORM);
      setPageMessage({
        type: 'success',
        text: `${response?.data?.message || 'Catalog item added successfully.'} Your own listings are excluded from the current browse endpoint, so they may not appear in this catalog view.`,
      });
      await fetchCatalog({ silent: true });
    } catch (error) {
      setListingError(error?.response?.data?.message || 'Unable to add this item to the catalog.');
    } finally {
      setIsAddingItem(false);
    }
  };

  const supplierCount = new Set(products.map((product) => product.supplier)).size;

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
            Browse supplier stock, place live catalog purchases, and add your own items through the
            backend procurement APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Catalog Items
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{products.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Suppliers
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{supplierCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Session Buys
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{recentPurchases.length}</p>
          </div>
        </div>
      </motion.div>

      {pageMessage ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
            pageMessage.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{pageMessage.text}</span>
        </motion.div>
      ) : null}

      {loadError ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {loadError}
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
                  Narrow the live catalog by name and category.
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
                  type="button"
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
                  Live catalog data fetched from the backend.
                </p>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                {filteredProducts.length} results
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {isLoading ? (
                <div className="rounded-2xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-400" />
                  <p className="mt-4 text-sm text-muted-foreground">Loading procurement catalog...</p>
                </div>
              ) : null}

              {!isLoading && filteredProducts.length > 0
                ? filteredProducts.map((product) => (
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
                          Wholesale Price
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
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        disabled={product.stock === 0}
                        className="h-10 rounded-xl bg-emerald-500 px-4 text-white hover:bg-emerald-600"
                      >
                        {product.stock === 0 ? 'Sold Out' : 'Buy'}
                      </Button>
                    </div>
                  ))
                : null}

              {!isLoading && filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground/70" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No products match the current search filters.
                  </p>
                </div>
              ) : null}
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
                  Select a product and submit the real buy request.
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
                    max={String(selectedProduct.stock)}
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="h-11 rounded-xl border-border bg-background"
                  />
                </div>

                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">
                    Total Price
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(totalPrice)}
                  </p>
                </div>

                {quantityError ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {quantityError}
                  </div>
                ) : null}

                <Button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={isPurchasing || !selectedProduct.stock || Boolean(quantityError)}
                  className="h-11 w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  {isPurchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isPurchasing ? 'Confirming...' : 'Confirm Purchase'}
                </Button>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
                <Truck className="mx-auto h-10 w-10 text-muted-foreground/70" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Choose a product from the list to start a real catalog purchase.
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
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-500/15 p-3">
                <Plus className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Add Catalog Item</h2>
                <p className="text-sm text-muted-foreground">
                  Create a new supplier listing with the backend add-item endpoint.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddItem} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Item Name
                </label>
                <Input
                  name="itemName"
                  value={listingForm.itemName}
                  onChange={handleListingFieldChange}
                  placeholder="Industrial Copper Wire"
                  className="h-11 rounded-xl border-border bg-background"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </label>
                  <Input
                    name="category"
                    value={listingForm.category}
                    onChange={handleListingFieldChange}
                    placeholder="Raw Materials"
                    className="h-11 rounded-xl border-border bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Supplier Name
                  </label>
                  <Input
                    name="supplierName"
                    value={listingForm.supplierName}
                    onChange={handleListingFieldChange}
                    placeholder="Metro Metals"
                    className="h-11 rounded-xl border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Units Available
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    name="unitsAvailable"
                    value={listingForm.unitsAvailable}
                    onChange={handleListingFieldChange}
                    placeholder="120"
                    className="h-11 rounded-xl border-border bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Wholesale Price
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    name="wholesalePrice"
                    value={listingForm.wholesalePrice}
                    onChange={handleListingFieldChange}
                    placeholder="480"
                    className="h-11 rounded-xl border-border bg-background"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                Items added here are saved through the backend, but the current `get-catalog`
                endpoint excludes the logged-in user&apos;s own listings from this browse view.
              </div>

              {listingError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {listingError}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={isAddingItem}
                className="h-11 w-full rounded-xl bg-amber-500 text-white hover:bg-amber-600"
              >
                {isAddingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isAddingItem ? 'Adding Item...' : 'Add Item to Catalog'}
              </Button>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/10"
          >
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Purchases</h2>
              <p className="text-sm text-muted-foreground">
                Recorded from successful buy API calls in this session.
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
                  No successful purchases recorded in this session yet.
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
