import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BadgePercent,
  CheckCircle2,
  Download,
  Loader2,
  Minus,
  Package,
  Phone,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingCart,
  X,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const PRODUCT_LIST_ENDPOINTS = [
  'http://localhost:3000/api/v1/inventory/product-list',
  'http://localhost:3000/api/v1/inventory/products-list',
];
const CART_SELL_API_URL = 'http://localhost:3000/api/v1/sales/cart-sell';
const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

const DEFAULT_PRODUCT_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="22" fill="#0f172a"/><path d="M30 37h60a8 8 0 0 1 8 8v31a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8V45a8 8 0 0 1 8-8Z" fill="#111827" stroke="#334155" stroke-width="4"/><path d="M32 75l17-16 13 12 16-20 20 24H32Z" fill="#10b981" opacity=".78"/><circle cx="45" cy="50" r="6" fill="#f8fafc" opacity=".86"/></svg>'
)}`;

const hiddenDetailKeys = new Set([
  '_id',
  'id',
  'productId',
  'productID',
  'owner',
  '__v',
  'productImage',
  'image',
  'productName',
  'name',
]);

const formatCurrency = (value, options = {}) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(Number(value || 0));

const formatReceiptAmount = (value) => `INR ${Number(value || 0).toFixed(2)}`;

const getRequestConfig = () => {
  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  return {
    withCredentials: true,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  };
};

const getErrorMessage = (error, fallback) => {
  if (error?.response?.status === 401) {
    return 'Your session has expired. Please log in again and try billing once more.';
  }

  return error?.response?.data?.message || fallback;
};

const humanizeKey = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDetailValue = (key, value) => {
  if (value === null || value === undefined || value === '') return 'Not set';

  const lowerKey = key.toLowerCase();

  if (lowerKey.includes('price') || lowerKey.includes('value') || lowerKey.includes('amount')) {
    return formatCurrency(value);
  }

  if (lowerKey.includes('percentage')) {
    return `${Number(value || 0).toFixed(1)}%`;
  }

  if (lowerKey.includes('at')) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const extractProducts = (response) => {
  const payload = response?.data?.data;

  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(response?.data?.products)) return response.data.products;

  return [];
};

const normalizeProduct = (product) => {
  const id = product?._id || product?.id || product?.productId || product?.productID || '';
  const stockQuantity = Number(product?.stockQuantity ?? product?.quantity ?? product?.stock ?? 0);
  const sellingPrice = Number(product?.sellingPrice ?? product?.price ?? 0);
  const costPrice = Number(product?.costPrice ?? 0);
  const productName = product?.productName || product?.name || 'Untitled Product';
  const productImage = product?.productImage?.trim() || product?.image?.trim() || DEFAULT_PRODUCT_IMAGE;

  return {
    ...product,
    id,
    productName,
    productImage,
    category: product?.category || 'Uncategorized',
    stockQuantity,
    sellingPrice,
    costPrice,
    profitPercentage: Number(product?.profitPercentage ?? 0),
    totalValue: Number(product?.totalValue ?? sellingPrice * stockQuantity),
  };
};

const getProductDetails = (product) =>
  Object.entries(product)
    .filter(([key]) => !hiddenDetailKeys.has(key))
    .map(([key, value]) => ({
      key,
      label: humanizeKey(key),
      value: formatDetailValue(key, value),
    }));

const escapePdfText = (value) =>
  String(value ?? '')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const createPdfPageContent = (lines, pageNumber, pageCount) => {
  const commands = [
    'BT',
    '/F1 18 Tf',
    '48 800 Td',
    `(MarketPulse Receipt) Tj`,
    '/F1 10 Tf',
    '0 -22 Td',
    `(Page ${pageNumber} of ${pageCount}) Tj`,
  ];

  lines.forEach((line) => {
    commands.push('0 -15 Td', `(${escapePdfText(line)}) Tj`);
  });

  commands.push('ET');
  return commands.join('\n');
};

const buildReceiptPdf = (receipt) => {
  const receiptLines = [
    `Receipt: ${receipt.saleId || 'Pending'}`,
    `Date: ${new Date(receipt.purchasedAt).toLocaleString()}`,
    `Customer phone: ${receipt.customerPhoneNumber}`,
    receipt.couponCode ? `Coupon: ${receipt.couponCode}` : 'Coupon: None',
    '',
    'Items',
    '------------------------------------------------------------',
    ...receipt.items.flatMap((item, index) => [
      `${index + 1}. ${item.productName}`,
      `   Qty ${item.quantity} x ${formatReceiptAmount(item.salePrice)} = ${formatReceiptAmount(item.lineTotal)}`,
    ]),
    '------------------------------------------------------------',
    `Subtotal: ${formatReceiptAmount(receipt.totalAmount)}`,
    `Discount: ${formatReceiptAmount(receipt.discount)}`,
    `Final amount: ${formatReceiptAmount(receipt.finalAmount)}`,
    '',
    'Thank you for shopping with MarketPulse.',
  ];

  const linesPerPage = 42;
  const chunks = [];

  for (let index = 0; index < receiptLines.length; index += linesPerPage) {
    chunks.push(receiptLines.slice(index, index + linesPerPage));
  }

  const pageCount = chunks.length || 1;
  const pageContents = (chunks.length ? chunks : [[]]).map((lines, index) =>
    createPdfPageContent(lines, index + 1, pageCount)
  );

  const bodies = [];
  const pageObjectNumbers = [];

  bodies[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  bodies[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  pageContents.forEach((content, index) => {
    const contentObjectNumber = 4 + index * 2;
    const pageObjectNumber = 5 + index * 2;

    bodies[contentObjectNumber] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    bodies[pageObjectNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    pageObjectNumbers.push(pageObjectNumber);
  });

  bodies[2] = `<< /Type /Pages /Kids [${pageObjectNumbers
    .map((pageObjectNumber) => `${pageObjectNumber} 0 R`)
    .join(' ')}] /Count ${pageObjectNumbers.length} >>`;

  const objectCount = bodies.length - 1;
  const offsets = [0];
  let pdf = '%PDF-1.4\n';

  for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
    offsets[objectNumber] = pdf.length;
    pdf += `${objectNumber} 0 obj\n${bodies[objectNumber]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;

  pdf += `xref\n0 ${objectCount + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
    pdf += `${String(offsets[objectNumber]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
};

const downloadReceiptPdf = (receipt) => {
  const blob = new Blob([buildReceiptPdf(receipt)], { type: 'application/pdf' });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeReceiptId = String(receipt.saleId || Date.now()).replace(/[^a-zA-Z0-9-]/g, '');

  anchor.href = objectUrl;
  anchor.download = `marketpulse-receipt-${safeReceiptId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export function Billing() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pageMessage, setPageMessage] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchInventory = async ({ silent = false } = {}) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setLoadError('');

    let latestError;

    for (const endpoint of PRODUCT_LIST_ENDPOINTS) {
      try {
        const response = await axios.get(endpoint, getRequestConfig());
        const normalizedProducts = extractProducts(response).map(normalizeProduct);

        setProducts(normalizedProducts.filter((product) => product.id));
        setCart((currentCart) =>
          currentCart
            .map((cartItem) => {
              const freshProduct = normalizedProducts.find((product) => product.id === cartItem.id);

              if (!freshProduct) return null;

              return {
                ...freshProduct,
                quantity: Math.min(cartItem.quantity, freshProduct.stockQuantity),
              };
            })
            .filter((cartItem) => cartItem && cartItem.quantity > 0)
        );
        latestError = null;
        break;
      } catch (error) {
        latestError = error;
      }
    }

    if (latestError) {
      setLoadError(getErrorMessage(latestError, 'Unable to fetch inventory items right now.'));
    }

    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (!pageMessage) return undefined;

    const timeoutId = window.setTimeout(() => setPageMessage(null), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [pageMessage]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return products;

    return products.filter(
      (product) =>
        product.productName.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const cartSubtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.sellingPrice || 0) * Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const previewDiscount = couponCode.trim().toUpperCase() === 'MARKETPULSE500' ? 500 : 0;
  const previewTotal = cartSubtotal - previewDiscount;
  const digitsOnlyPhone = customerPhoneNumber.replace(/\D/g, '');
  const phoneError =
    customerPhoneNumber.trim() && digitsOnlyPhone.length < 7
      ? 'Enter a valid customer phone number.'
      : '';

  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      setPageMessage({
        type: 'error',
        text: `${product.productName} is out of stock.`,
      });
      return;
    }

    setPageMessage(null);
    const existingCartItem = cart.find((item) => item.id === product.id);

    if (existingCartItem?.quantity >= product.stockQuantity) {
      setPageMessage({
        type: 'error',
        text: `Only ${product.stockQuantity} unit(s) of ${product.productName} are available.`,
      });
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (!existingItem) {
        return [{ ...product, quantity: 1 }, ...currentCart];
      }

      if (existingItem.quantity >= product.stockQuantity) {
        return currentCart;
      }

      return currentCart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setPageMessage(null);
    setCart((currentCart) =>
      currentCart
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleConfirmPurchase = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      setPageMessage({
        type: 'error',
        text: 'Add at least one product to the cart before confirming purchase.',
      });
      return;
    }

    if (!customerPhoneNumber.trim()) {
      setPageMessage({
        type: 'error',
        text: 'Customer phone number is required.',
      });
      return;
    }

    if (phoneError) {
      setPageMessage({
        type: 'error',
        text: phoneError,
      });
      return;
    }

    const cartItems = cart.map((item) => ({
      productID: item.id,
      productId: item.id,
      quantity: item.quantity,
    }));

    const requestPayload = {
      items: cartItems,
      cart: cartItems.map(({ productID, quantity }) => ({ productID, quantity })),
      customerPhoneNumber: customerPhoneNumber.trim(),
      couponCode: couponCode.trim().toUpperCase() || undefined,
    };

    setIsConfirming(true);
    setPageMessage(null);

    try {
      const response = await axios.post(CART_SELL_API_URL, requestPayload, getRequestConfig());
      const sale = response?.data?.data || {};
      const saleItems = Array.isArray(sale.items) && sale.items.length > 0
        ? sale.items.map((item) => ({
            productName: item.productName || 'Product',
            quantity: Number(item.quantitySold ?? item.quantity ?? 0),
            salePrice: Number(item.salePrice ?? 0),
            lineTotal: Number(item.quantitySold ?? item.quantity ?? 0) * Number(item.salePrice ?? 0),
          }))
        : cart.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            salePrice: Number(item.sellingPrice || 0),
            lineTotal: Number(item.sellingPrice || 0) * item.quantity,
          }));

      const receipt = {
        saleId: sale._id || `${Date.now()}`,
        purchasedAt: sale.createdAt || new Date().toISOString(),
        customerPhoneNumber: sale.customerPhoneNumber || customerPhoneNumber.trim(),
        couponCode: requestPayload.couponCode || '',
        items: saleItems,
        totalAmount: Number(sale.totalAmount ?? cartSubtotal),
        discount: Number(sale.discount ?? previewDiscount),
        finalAmount: Number(sale.finalAmount ?? previewTotal),
      };

      setLastReceipt(receipt);
      setShowSuccessModal(true);
      setCart([]);
      setCustomerPhoneNumber('');
      setCouponCode('');
      await fetchInventory({ silent: true });
    } catch (error) {
      setPageMessage({
        type: 'error',
        text: getErrorMessage(error, 'Unable to confirm this purchase right now.'),
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = products.filter((product) => product.stockQuantity > 0 && product.stockQuantity <= 5).length;

  return (
    <div className="space-y-7">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400/90">
            Point Of Sale
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create customer purchases from live inventory and issue receipts.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Items
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{products.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Low Stock
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{lowStockCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cart
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{cartItemCount}</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {pageMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
              pageMessage.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                : 'border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-400'
            }`}
          >
            {pageMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{pageMessage.text}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {loadError ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-400"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4" />
            <span>{loadError}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fetchInventory()}
            className="rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-400 dark:text-red-400"
          >
            Retry
          </Button>
        </motion.div>
      ) : null}

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products or categories"
                className="h-11 rounded-xl border-border bg-background pl-9"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => fetchInventory({ silent: true })}
              disabled={isLoading || isRefreshing}
              className="h-11 gap-2 rounded-xl border-border px-4"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border bg-card p-4">
                  <div className="h-36 animate-pulse rounded-xl bg-muted/70" />
                  <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-muted/70" />
                  <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-muted/60" />
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="h-12 animate-pulse rounded-xl bg-muted/60" />
                    <div className="h-12 animate-pulse rounded-xl bg-muted/60" />
                  </div>
                </div>
              ))
            ) : null}

            {!isLoading
              ? filteredProducts.map((product) => {
                  const details = getProductDetails(product);
                  const cartQuantity = cart.find((item) => item.id === product.id)?.quantity || 0;
                  const isOutOfStock = product.stockQuantity <= 0;
                  const hasReachedStock = cartQuantity >= product.stockQuantity;

                  return (
                    <motion.article
                      key={product.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-emerald-500/30"
                    >
                      <div className="relative aspect-[4/3] bg-secondary/40">
                        <img
                          src={product.productImage}
                          alt={product.productName}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                          }}
                        />
                        <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                          {product.category}
                        </div>
                      </div>

                      <div className="space-y-4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold text-foreground">
                              {product.productName}
                            </h2>
                            <p className="mt-1 text-sm font-medium text-emerald-500 dark:text-emerald-400">
                              {formatCurrency(product.sellingPrice)}
                            </p>
                          </div>

                          <Button
                            type="button"
                            size="icon-lg"
                            onClick={() => addToCart(product)}
                            disabled={isOutOfStock || hasReachedStock}
                            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
                            className="rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-border bg-background/70 px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Stock
                            </p>
                            <p className={`mt-1 text-sm font-semibold ${isOutOfStock ? 'text-red-500' : 'text-foreground'}`}>
                              {product.stockQuantity}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border bg-background/70 px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              In Cart
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{cartQuantity}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {details.map((detail) => (
                            <div key={detail.key} className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {detail.label}
                              </p>
                              <p className="mt-1 truncate text-xs font-medium text-foreground" title={detail.value}>
                                {detail.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  );
                })
              : null}
          </div>

          {!isLoading && filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/70" />
              <p className="mt-4 text-sm text-muted-foreground">No inventory items found.</p>
            </div>
          ) : null}
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="h-fit rounded-3xl border border-border bg-card shadow-xl shadow-black/10 xl:sticky xl:top-24"
        >
          <form onSubmit={handleConfirmPurchase} className="space-y-5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-500 dark:text-cyan-400">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Cart</h2>
                  <p className="text-sm text-muted-foreground">{cartItemCount} item(s)</p>
                </div>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                POS
              </span>
            </div>

            <div className="space-y-3">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[48px,minmax(0,1fr),auto] gap-3 rounded-2xl border border-border bg-background/70 p-3"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-12 w-12 rounded-xl object-cover"
                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{item.productName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.sellingPrice)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {formatCurrency(item.quantity * item.sellingPrice)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove one"
                      className="rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-background/40 px-5 py-10 text-center">
                  <ReceiptText className="mx-auto h-9 w-9 text-muted-foreground/70" />
                  <p className="mt-3 text-sm text-muted-foreground">Cart is empty.</p>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-border pt-5">
              <div className="space-y-2">
                <label htmlFor="customerPhoneNumber" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Customer Phone Number
                </label>
                <Input
                  id="customerPhoneNumber"
                  type="tel"
                  value={customerPhoneNumber}
                  onChange={(event) => setCustomerPhoneNumber(event.target.value)}
                  placeholder="Customer phone"
                  required
                  aria-invalid={Boolean(phoneError)}
                  className="h-11 rounded-xl border-border bg-background"
                />
                {phoneError ? <p className="text-xs text-red-500">{phoneError}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="couponCode" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <BadgePercent className="h-3.5 w-3.5" />
                  Coupon Code
                </label>
                <Input
                  id="couponCode"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Optional coupon"
                  className="h-11 rounded-xl border-border bg-background uppercase"
                />
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-foreground">{formatCurrency(previewDiscount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-emerald-500 dark:text-emerald-400">
                  {formatCurrency(previewTotal)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isConfirming || cart.length === 0 || Boolean(phoneError)}
              className="h-12 w-full gap-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />}
              {isConfirming ? 'Confirming...' : 'Confirm purchase'}
            </Button>
          </form>
        </motion.aside>
      </div>

      <AnimatePresence>
        {showSuccessModal && lastReceipt ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            >
              <div className="flex justify-end p-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowSuccessModal(false)}
                  className="rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="px-7 pb-7 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-foreground">Successful purchase</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Receipt total {formatCurrency(lastReceipt.finalAmount)} for {lastReceipt.items.length} item(s).
                </p>

                <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4 text-left">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium text-foreground">{lastReceipt.customerPhoneNumber}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Final Amount</span>
                    <span className="font-semibold text-foreground">{formatCurrency(lastReceipt.finalAmount)}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => downloadReceiptPdf(lastReceipt)}
                  className="mt-6 h-11 w-full gap-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  <Download className="h-4 w-4" />
                  Download receipt
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
