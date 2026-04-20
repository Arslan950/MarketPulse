import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Download,
  Plus,
  ArrowUpDown,
  XCircle,
  CheckCircle2,
  ArrowUp,
  Trash2,
  PencilLine,
  X,
  Loader2,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/Select';

const INVENTORY_API_URL = 'http://localhost:3000/api/v1/inventory';
const AI_API_URL = 'http://localhost:3000/api/v1/ai';

const DEFAULT_PRODUCT_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="24" fill="#0f172a"/><path d="M31 37h58a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8H31a8 8 0 0 1-8-8V45a8 8 0 0 1 8-8Z" fill="#111827" stroke="#334155" stroke-width="4"/><path d="M32 74l18-17 14 13 15-19 18 23H32Z" fill="#10b981" opacity=".75"/><circle cx="45" cy="49" r="6" fill="#f8fafc" opacity=".85"/></svg>'
)}`;

const EMPTY_FORM = {
  productName: '',
  productImage: '',
  category: '',
  costPrice: '',
  sellingPrice: '',
  stockQuantity: '',
  userInstruction: '',
};

const statusConfig = {
  'In Stock': {
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  'Low Stock (Warning)': {
    color: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  'Low Stock (Critical)': {
    color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'Out of Stock': {
    color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
    icon: <XCircle className="w-3 h-3" />,
  },
};

const statusOptions = ['All', 'In Stock', 'Low Stock (Warning)', 'Low Stock (Critical)', 'Out of Stock'];

const formatCurrency = (value, options = {}) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(Number(value || 0));

const normalizeProduct = (product) => {
  const stockQuantity = Number(product?.stockQuantity ?? 0);
  const sellingPrice = Number(product?.sellingPrice ?? 0);
  const costPrice = Number(product?.costPrice ?? 0);
  const profitPercentageValue = Number(product?.profitPercentage);

  const fallbackProfitPercentage =
    costPrice > 0 ? Math.round((((sellingPrice - costPrice) / costPrice) * 100) * 10) / 10 : 0;

  const finalProfitPercentage = Number.isFinite(profitPercentageValue)
    ? profitPercentageValue
    : fallbackProfitPercentage;

  let status = 'In Stock';
  if (stockQuantity === 0) {
    status = 'Out of Stock';
  } else if (stockQuantity < 10) {
    if (finalProfitPercentage > 15) {
      status = 'Low Stock (Critical)';
    } else {
      status = 'Low Stock (Warning)';
    }
  }

  return {
    id: product?._id,
    productName: product?.productName ?? 'Untitled Product',
    productImage: product?.productImage?.trim() || DEFAULT_PRODUCT_IMAGE,
    category: product?.category ?? 'Uncategorized',
    costPrice,
    sellingPrice,
    stockQuantity,
    profitPercentage: finalProfitPercentage,
    status,
    totalValue: stockQuantity * sellingPrice,
  };
};

const buildCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const convertFileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read the selected image file.'));
    reader.readAsDataURL(file);
  });

export function StockIntelligence() {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('productName');
  const [sortDir, setSortDir] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pageMessage, setPageMessage] = useState(null);
  const [panelMode, setPanelMode] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState('');
  const [viewingImage, setViewingImage] = useState(null);

  // Price suggestion state
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [priceSuggestionError, setPriceSuggestionError] = useState('');

  const fetchInventory = async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true);
    setLoadError('');
    try {
      const response = await axios.get(`${INVENTORY_API_URL}/products-list`, {
        withCredentials: true,
      });
      const products = response?.data?.data?.products ?? [];
      setInventory(products.map(normalizeProduct));
    } catch (error) {
      setLoadError(error?.response?.data?.message || 'Unable to fetch inventory right now.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(inventory.map((item) => item.category).filter(Boolean)));
    return ['All', ...uniqueCategories.sort((a, b) => a.localeCompare(b))];
  }, [inventory]);

  useEffect(() => {
    if (categoryFilter !== 'All' && !categories.includes(categoryFilter)) {
      setCategoryFilter('All');
    }
  }, [categories, categoryFilter]);

  useEffect(() => {
    if (!pageMessage) return undefined;
    const timeoutId = window.setTimeout(() => setPageMessage(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [pageMessage]);

  const filtered = useMemo(() => {
    let items = [...inventory];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.productName.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'All') {
      items = items.filter((item) => item.category === categoryFilter);
    }

    if (statusFilter !== 'All') {
      items = items.filter((item) => item.status === statusFilter);
    }

    items.sort((leftItem, rightItem) => {
      const leftValue = leftItem[sortField];
      const rightValue = rightItem[sortField];
      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return sortDir === 'asc'
          ? leftValue.localeCompare(rightValue)
          : rightValue.localeCompare(leftValue);
      }
      return sortDir === 'asc' ? leftValue - rightValue : rightValue - leftValue;
    });

    return items;
  }, [inventory, searchQuery, categoryFilter, statusFilter, sortField, sortDir]);

  const totalProducts = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const inStockCount = inventory.filter((item) => item.stockQuantity > 0).length;
  const outOfStockCount = inventory.filter((item) => item.stockQuantity === 0).length;

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDir('asc');
  };

  const resetPanel = () => {
    setPanelMode(null);
    setEditingProductId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setIsSubmitting(false);
    setSelectedImageName('');
    setPriceSuggestion(null);
    setPriceSuggestionError('');
  };

  const openCreatePanel = () => {
    setPageMessage(null);
    setFormError('');
    setEditingProductId(null);
    setPanelMode('create');
    setFormData(EMPTY_FORM);
    setSelectedImageName('');
    setPriceSuggestion(null);
    setPriceSuggestionError('');
  };

  const openEditPanel = (product) => {
    setPageMessage(null);
    setFormError('');
    setEditingProductId(product.id);
    setPanelMode('edit');
    setFormData({
      productName: product.productName,
      productImage: product.productImage === DEFAULT_PRODUCT_IMAGE ? '' : product.productImage,
      category: product.category,
      costPrice: String(product.costPrice),
      sellingPrice: String(product.sellingPrice),
      stockQuantity: String(product.stockQuantity),
      userInstruction: '',
    });
    setSelectedImageName(product.productImage === DEFAULT_PRODUCT_IMAGE ? '' : 'Current product image');
    setPriceSuggestion(null);
    setPriceSuggestionError('');
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({ ...currentFormData, [name]: value }));
    // Clear price suggestion when cost price changes
    if (name === 'costPrice') {
      setPriceSuggestion(null);
      setPriceSuggestionError('');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please upload a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setFormError('Please upload an image smaller than 4 MB.');
      event.target.value = '';
      return;
    }

    try {
      setFormError('');
      const imageDataUrl = await convertFileToDataUrl(file);
      setFormData((currentFormData) => ({ ...currentFormData, productImage: imageDataUrl }));
      setSelectedImageName(file.name);
    } catch (error) {
      setFormError(error.message || 'Unable to process the selected image.');
    } finally {
      event.target.value = '';
    }
  };

  // ─── Price Suggestion Handler ──────────────────────────────────────────────
  const isSuggestButtonDisabled =
    !formData.productName.trim() ||
    !formData.costPrice ||
    !formData.stockQuantity ||
    isSuggestingPrice;

  const handleSuggestPrice = async () => {
    setPriceSuggestion(null);
    setPriceSuggestionError('');
    setIsSuggestingPrice(true);

    try {
      const response = await axios.post(
        `${AI_API_URL}/price-suggestion`,
        {
          productName: formData.productName.trim(),
          costPrice: Number(formData.costPrice),
          quantity: Number(formData.stockQuantity),
          userInstruction: formData.userInstruction.trim() || undefined,
        },
        { withCredentials: true }
      );

      const message = response?.data?.data?.responseMessage ?? '';
      setPriceSuggestion(message);

      // Auto-fill selling price if we can parse it from response
      const priceMatch = message.match(/Suggested Price[:\s]+[₹]?\s*([\d,]+)/i);
      if (priceMatch) {
        const parsedPrice = priceMatch[1].replace(/,/g, '');
        setFormData((prev) => ({ ...prev, sellingPrice: parsedPrice }));
      }
    } catch (error) {
      setPriceSuggestionError(
        error?.response?.data?.message || 'Unable to get price suggestion right now.'
      );
    } finally {
      setIsSuggestingPrice(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setPageMessage(null);

    const payload = {
      productName: formData.productName.trim(),
      productImage: formData.productImage.trim(),
      category: formData.category.trim(),
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      stockQuantity: Number(formData.stockQuantity),
    };

    if (!payload.productName || !payload.productImage || !payload.category) {
      setFormError('Please fill in product name, product image, and category.');
      return;
    }

    if (
      Number.isNaN(payload.costPrice) ||
      Number.isNaN(payload.sellingPrice) ||
      Number.isNaN(payload.stockQuantity)
    ) {
      setFormError('Please enter valid numeric values for pricing and quantity.');
      return;
    }

    if (payload.costPrice < 0 || payload.sellingPrice < 0 || payload.stockQuantity < 0) {
      setFormError('Cost, selling price, and quantity cannot be negative.');
      return;
    }

    if (!Number.isInteger(payload.stockQuantity)) {
      setFormError('Stock quantity must be a whole number.');
      return;
    }

    if (payload.sellingPrice < payload.costPrice) {
      setFormError('Selling price cannot be less than cost price.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (panelMode === 'edit' && editingProductId) {
        await axios.patch(`${INVENTORY_API_URL}/update-product/${editingProductId}`, payload, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${INVENTORY_API_URL}/add-product`, payload, {
          withCredentials: true,
        });
      }

      await fetchInventory({ silent: true });
      setPageMessage({
        type: 'success',
        text: panelMode === 'edit' ? 'Product updated successfully.' : 'Product added to inventory.',
      });
      resetPanel();
    } catch (error) {
      setFormError(error?.response?.data?.message || 'Unable to save product changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (product) => {
    const confirmed = window.confirm(`Remove "${product.productName}" from inventory?`);
    if (!confirmed) return;

    setPendingActionId(product.id);
    setPageMessage(null);

    try {
      await axios.delete(`${INVENTORY_API_URL}/remove-product/${product.id}`, {
        withCredentials: true,
      });

      setInventory((currentInventory) => currentInventory.filter((item) => item.id !== product.id));

      if (editingProductId === product.id) resetPanel();

      setPageMessage({
        type: 'success',
        text: `"${product.productName}" was removed from inventory.`,
      });
    } catch (error) {
      setPageMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Unable to remove this product right now.',
      });
    } finally {
      setPendingActionId(null);
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) return;

    const header = [
      'Product Name',
      'Category',
      'Status',
      'Stock Quantity',
      'Cost Price',
      'Selling Price',
      'Profit Percentage',
      'Total Value',
    ];

    const rows = filtered.map((item) => [
      item.productName,
      item.category,
      item.status,
      item.stockQuantity,
      item.costPrice.toFixed(2),
      item.sellingPrice.toFixed(2),
      `${item.profitPercentage.toFixed(1)}%`,
      item.totalValue.toFixed(2),
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map(buildCsvValue).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.setAttribute('download', 'inventory-export.csv');
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const previewQuantityValue = Number(formData.stockQuantity);
  const previewSellingPriceValue = Number(formData.sellingPrice);
  const previewCostPriceValue = Number(formData.costPrice);

  const previewQuantity = Number.isFinite(previewQuantityValue) ? Math.max(0, previewQuantityValue) : 0;
  const previewSellingPrice = Number.isFinite(previewSellingPriceValue) ? Math.max(0, previewSellingPriceValue) : 0;
  const previewCostPrice = Number.isFinite(previewCostPriceValue) ? Math.max(0, previewCostPriceValue) : 0;

  const previewProfitPercentage = previewCostPrice > 0
    ? ((previewSellingPrice - previewCostPrice) / previewCostPrice) * 100
    : 0;

  let previewStatus = 'In Stock';
  if (previewQuantity === 0) {
    previewStatus = 'Out of Stock';
  } else if (previewQuantity < 10) {
    if (previewProfitPercentage > 15) {
      previewStatus = 'Low Stock (Critical)';
    } else {
      previewStatus = 'Low Stock (Warning)';
    }
  }

  const previewStatusConfig = statusConfig[previewStatus];
  const previewImage = formData.productImage.trim() || DEFAULT_PRODUCT_IMAGE;

  return (
    <div className="space-y-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Intelligence</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor inventory levels, track stock health, and manage products from one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="gap-2 rounded-xl border-border"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={openCreatePanel}
            className="gap-2 text-white rounded-xl bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {pageMessage ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border px-4 py-3 text-sm ${pageMessage.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
            }`}
        >
          {pageMessage.text}
        </motion.div>
      ) : null}

      {loadError ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {loadError}
        </motion.div>
      ) : null}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="p-5 transition-colors duration-300 border bg-card border-border rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 rounded-xl">
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="p-5 transition-colors duration-300 border bg-card border-border rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/15 rounded-xl">
              <ArrowUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalValue, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 transition-colors duration-300 border bg-card border-border rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">In Stock</p>
              <p className="text-2xl font-bold text-emerald-400">{inStockCount}</p>
            </div>
          </div>
        </div>

        <div className="p-5 transition-colors duration-300 border bg-card border-border rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/15 rounded-xl">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400">{outOfStockCount}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col items-start gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10 rounded-xl bg-card border-border"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] rounded-xl bg-card border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] rounded-xl bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {totalProducts} products
        </p>
      </motion.div>

      {/* ─── MODAL ──────────────────────────────────────────────────────────── */}
      {panelMode ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-6xl max-h-[92vh] overflow-y-auto border bg-card border-border rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border px-6 py-5 sticky top-0 bg-card z-10">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400/90">
                  {panelMode === 'edit' ? 'Update Inventory Item' : 'Add Inventory Item'}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">
                  {panelMode === 'edit' ? 'Edit Product' : 'Add Product'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {panelMode === 'edit'
                    ? 'Adjust product information and save the changes back to inventory.'
                    : 'Create a new inventory item. Use AI to get the best selling price suggestion.'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={resetPanel}
                className="rounded-xl text-muted-foreground hover:bg-secondary/70 hover:text-foreground mt-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body — 3-column grid */}
            <form onSubmit={handleSubmit} className="grid gap-0 lg:grid-cols-[1fr_1px_1fr_1px_360px]">

              {/* ── COL 1 : Product Details ── */}
              <div className="space-y-5 p-6">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                  Product Details
                </p>

                {/* Product Name + Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      Product Name <span className="text-red-400">*</span>
                    </span>
                    <Input
                      name="productName"
                      value={formData.productName}
                      onChange={handleFieldChange}
                      placeholder="Canvas Sneakers"
                      className="h-11 rounded-xl bg-background border-border"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      Category <span className="text-red-400">*</span>
                    </span>
                    <Input
                      name="category"
                      value={formData.category}
                      onChange={handleFieldChange}
                      placeholder="Footwear"
                      className="h-11 rounded-xl bg-background border-border"
                    />
                  </label>
                </div>

                {/* Product Image Upload */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    Product Image <span className="text-red-400">*</span>
                  </span>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/80 px-4 py-5 text-center transition-colors hover:border-emerald-500/40 hover:bg-secondary/40">
                    <Plus className="w-5 h-5 mb-2 text-emerald-400" />
                    <span className="text-sm font-medium text-foreground">Upload product image</span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG, WEBP, GIF · up to 4 MB
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  {selectedImageName ? (
                    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedImageName}</p>
                        <p className="text-xs text-muted-foreground">
                          {panelMode === 'edit' ? 'Upload another file to replace.' : 'Ready to save.'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setFormData((d) => ({ ...d, productImage: '' }));
                          setSelectedImageName('');
                        }}
                        className="rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {panelMode === 'edit'
                        ? 'Upload a new image only to replace the current one.'
                        : 'An uploaded image is required before saving.'}
                    </p>
                  )}
                </div>

                {/* Stock Quantity + Cost Price */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      Stock Quantity <span className="text-red-400">*</span>
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleFieldChange}
                      placeholder="0"
                      className="h-11 rounded-xl bg-background border-border"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      Cost Price (₹) <span className="text-red-400">*</span>
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleFieldChange}
                      placeholder="0.00"
                      className="h-11 rounded-xl bg-background border-border"
                    />
                  </label>
                </div>

                {/* Selling Price */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    Selling Price (₹) <span className="text-red-400">*</span>
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleFieldChange}
                    placeholder="0.00"
                    className="h-11 rounded-xl bg-background border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use the AI Pricing Assistant on the right to get a smart suggestion.
                  </p>
                </div>

                {/* Form error */}
                {formError ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {formError}
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetPanel}
                    className="rounded-xl border-border"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {panelMode === 'edit' ? 'Save Changes' : 'Add Product'}
                  </Button>
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="hidden lg:block bg-border" />

              {/* ── COL 2 : AI Pricing Assistant ── */}
              <div className="space-y-5 p-6 border-t border-border lg:border-t-0">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                      AI Pricing Assistant
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Requires product name, cost price & quantity
                    </p>
                  </div>
                </div>

                {/* Optional instruction */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      Special Instruction
                      <span className="ml-1.5 text-[10px] font-normal normal-case text-muted-foreground/60">
                        optional
                      </span>
                    </span>
                  </div>
                  <textarea
                    name="userInstruction"
                    value={formData.userInstruction}
                    onChange={handleFieldChange}
                    placeholder="e.g. Target premium customers, aggressive pricing, festive discount, etc."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-colors"
                  />
                </div>

                {/* Suggest button */}
                <button
                  type="button"
                  onClick={handleSuggestPrice}
                  disabled={isSuggestButtonDisabled}
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl
                    border text-sm font-semibold transition-all duration-200
                    ${isSuggestButtonDisabled
                      ? 'bg-muted/30 border-border text-muted-foreground/40 cursor-not-allowed'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-500/60 hover:text-emerald-300 active:scale-[0.98]'
                    }`}
                >
                  {isSuggestingPrice ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analysing market...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Suggest best price
                    </>
                  )}
                </button>

                {/* Disabled hint */}
                {isSuggestButtonDisabled && !isSuggestingPrice && (
                  <p className="text-xs text-muted-foreground/60 text-center -mt-2">
                    Fill in product name, cost price, and quantity to enable
                  </p>
                )}

                {/* Suggestion result */}
                {priceSuggestion && !priceSuggestionError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        AI Suggestion
                      </p>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {priceSuggestion}
                    </p>
                    <p className="text-[11px] text-emerald-400/70">
                      ✓ Selling price field has been auto-filled
                    </p>
                  </motion.div>
                )}

                {/* Suggestion error */}
                {priceSuggestionError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  >
                    {priceSuggestionError}
                  </motion.div>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="hidden lg:block bg-border" />

              {/* ── COL 3 : Live Preview ── */}
              <div className="p-6 border-t border-border lg:border-t-0">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-4">
                  Live Preview
                </p>

                <div className="overflow-hidden rounded-2xl border border-border bg-background/70">
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
                    <img
                      src={previewImage}
                      alt={formData.productName || 'Product preview'}
                      className="object-cover w-full h-full"
                      onError={(event) => { event.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
                    />
                  </div>

                  <div className="space-y-4 p-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {formData.productName.trim() || 'New inventory item'}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {formData.category.trim() || 'No category set'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${previewStatusConfig.color}`}
                      >
                        {previewStatusConfig.icon}
                        {previewStatus}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Qty: <span className="font-medium text-foreground">{previewQuantity}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-border bg-card px-3 py-2">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                          Cost
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {formatCurrency(formData.costPrice || 0)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-card px-3 py-2">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                          Selling
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {formatCurrency(formData.sellingPrice || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 px-3 py-3">
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-emerald-300/80">
                        Est. Total Value
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {formatCurrency(previewQuantity * previewSellingPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="overflow-hidden transition-colors duration-300 border bg-card border-border rounded-2xl"
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[320px]">
                <button
                  onClick={() => toggleSort('productName')}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Product <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Category
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('stockQuantity')}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Qty <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Status
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('sellingPrice')}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Unit Price <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('profitPercentage')}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Profit % <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('totalValue')}
                  className="ml-auto flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Total Value <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-right uppercase text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-14 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-emerald-400" />
                  <p className="text-sm text-muted-foreground">Loading inventory...</p>
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading &&
              filtered.map((item) => {
                const currentStatus = statusConfig[item.status];
                return (
                  <TableRow key={item.id} className="transition-colors border-border hover:bg-secondary/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          onClick={() => setViewingImage(item.productImage)}
                          className="object-cover w-10 h-10 border rounded-lg border-border cursor-pointer transition-opacity hover:opacity-75"
                          onError={(event) => { event.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-foreground">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Cost {formatCurrency(item.costPrice)}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>

                    <TableCell>
                      <span className={`text-sm font-semibold ${item.stockQuantity === 0 ? 'text-red-500' : 'text-foreground'}`}>
                        {item.stockQuantity}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${currentStatus.color}`}>
                        {currentStatus.icon}
                        {item.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm font-medium text-foreground">
                      {formatCurrency(item.sellingPrice)}
                    </TableCell>

                    <TableCell className="text-sm font-medium text-foreground">
                      {item.profitPercentage.toFixed(1)}%
                    </TableCell>

                    <TableCell className="text-sm font-medium text-right text-foreground">
                      {formatCurrency(item.totalValue)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemove(item)}
                          disabled={pendingActionId === item.id}
                          className="rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        >
                          {pendingActionId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditPanel(item)}
                          className="gap-1.5 rounded-xl border border-border bg-background/70 px-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <PencilLine className="w-4 h-4" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

            {!isLoading && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-50 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No products match your filters right now.</p>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </motion.div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setViewingImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-border bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
            <img
              src={viewingImage}
              alt="Product preview full"
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}