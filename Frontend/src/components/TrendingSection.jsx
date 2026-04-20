import { useEffect, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  ImageOff,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { Button } from './Button';

const TREND_SUGGESTION_API_URL = 'http://localhost:3000/api/v1/ai/trend-suggestion';
const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';
const TREND_CACHE_STORAGE_KEY = 'marketpulse-daily-trend-cache';

const getLocalDayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getTimeUntilNextMidnight = () => {
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0);

  return Math.max(nextMidnight.getTime() - Date.now(), 1000);
};

// 1. UPDATED: Require current token to validate ownership
const readTrendCache = (currentToken) => {
  try {
    const cachedValue = window.localStorage.getItem(TREND_CACHE_STORAGE_KEY);
    if (!cachedValue) return null;

    const parsedCache = JSON.parse(cachedValue);

    // If the cache belongs to a different user, clear it and return null
    if (parsedCache.userToken !== currentToken) {
      window.localStorage.removeItem(TREND_CACHE_STORAGE_KEY);
      return null;
    }

    if (!Array.isArray(parsedCache?.items)) return null;

    return parsedCache;
  } catch (error) {
    console.error('Failed to read trend cache:', error);
    return null;
  }
};

// 2. UPDATED: Save the user's token alongside the cache
const writeTrendCache = (items, currentToken) => {
  const nextCache = {
    items,
    dayKey: getLocalDayKey(),
    fetchedAt: new Date().toISOString(),
    userToken: currentToken, // Bind cache to this specific user
  };

  window.localStorage.setItem(TREND_CACHE_STORAGE_KEY, JSON.stringify(nextCache));

  return nextCache;
};

const getRequestConfig = (signal) => {
  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  return {
    signal,
    withCredentials: true,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  };
};

const getTrendSuggestions = (response) => {
  const suggestions = response?.data?.data?.finalData;
  return Array.isArray(suggestions) ? suggestions : [];
};

const getErrorMessage = (error) => {
  if (axios.isCancel(error) || error?.name === 'CanceledError') {
    return '';
  }

  if (error?.response?.status === 401) {
    return 'Log in again to refresh your daily AI trend suggestions.';
  }

  if (error?.response?.status === 404) {
    return 'Set up your business profile first so we can tailor product trends to your market.';
  }

  return error?.response?.data?.message || "Unable to load today's trend suggestions right now.";
};

const formatRefreshTime = (isoString) => {
  if (!isoString) return 'Pending first refresh';

  return new Date(isoString).toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
};

const getProductInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'MP';

export function TrendingSection() {
  const [products, setProducts] = useState([]);
  const [expandedReason, setExpandedReason] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState('');

  useEffect(() => {
    // 3. UPDATED: Get current token and pass it to cache readers/writers
    const currentToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const cachedTrends = readTrendCache(currentToken);
    const hasCachedItems = Boolean(cachedTrends?.items?.length);

    if (hasCachedItems) {
      setProducts(cachedTrends.items);
      setLastRefreshedAt(cachedTrends.fetchedAt || '');
      setIsLoading(false);
    }

    let isMounted = true;
    let activeController = null;
    let midnightTimeoutId = null;

    const applyCacheToState = (cache) => {
      setProducts(cache.items);
      setLastRefreshedAt(cache.fetchedAt || '');
      setErrorMessage('');
      setIsLoading(false);
    }

    const fetchTrendSuggestions = async ({ force = false } = {}) => {
      const latestToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      const latestCache = readTrendCache(latestToken);
      
      const hasFreshCache =
        Boolean(latestCache?.items?.length) && latestCache.dayKey === getLocalDayKey();

      if (!force && hasFreshCache) {
        if (isMounted) applyCacheToState(latestCache);
        return;
      }

      if (activeController) {
        activeController.abort();
      }

      activeController = new AbortController();

      if (isMounted && !latestCache?.items?.length) {
        setIsLoading(true);
      }

      try {
        const response = await axios.get(
          TREND_SUGGESTION_API_URL,
          getRequestConfig(activeController.signal),
        );

        const fetchedProducts = getTrendSuggestions(response);

        if (!fetchedProducts.length) {
          throw new Error('No trend suggestions received from the backend.');
        }

        const nextCache = writeTrendCache(fetchedProducts, latestToken);

        if (!isMounted) return;

        setImageErrors({});
        setExpandedReason((currentProduct) =>
          fetchedProducts.some((product) => product.productName === currentProduct)
            ? currentProduct
            : null,
        );
        applyCacheToState(nextCache);
      } catch (error) {
        if (!isMounted || axios.isCancel(error) || error?.name === 'CanceledError') {
          return;
        }

        const nextErrorMessage = getErrorMessage(error);
        setErrorMessage(nextErrorMessage);
        setIsLoading(false);
      }
    };

    const scheduleMidnightRefresh = () => {
      midnightTimeoutId = window.setTimeout(async () => {
        await fetchTrendSuggestions({ force: true });
        scheduleMidnightRefresh();
      }, getTimeUntilNextMidnight());
    };

    fetchTrendSuggestions();
    scheduleMidnightRefresh();

    return () => {
      isMounted = false;

      if (activeController) {
        activeController.abort();
      }

      if (midnightTimeoutId) {
        window.clearTimeout(midnightTimeoutId);
      }
    };
  }, []);

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="overflow-hidden rounded-[28px] border border-border bg-card/80 p-6 shadow-[0_24px_60px_-32px_rgba(16,185,129,0.35)] backdrop-blur"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Daily AI Picks
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                What your market wants next
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Fresh product recommendations tailored to your business, cached through the day and
                refreshed after 12:00 AM.
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4 text-emerald-500" />
            <span>Last refresh: {formatRefreshTime(lastRefreshedAt)}</span>
          </div>
        </div>
      </motion.div>

      {errorMessage ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{errorMessage}</p>
        </motion.div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[26px] border border-border bg-card p-4 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.4)]"
            >
              <div className="h-48 animate-pulse rounded-[22px] bg-muted" />
              <div className="mt-4 h-5 animate-pulse rounded-full bg-muted" />
              <div className="mt-3 h-11 animate-pulse rounded-2xl bg-muted" />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && !products.length ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-dashed border-border bg-card/70 px-6 py-12 text-center"
        >
          <h3 className="text-lg font-semibold text-foreground">No trend suggestions yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We will show your next AI-curated product opportunities here after the next refresh.
          </p>
        </motion.div>
      ) : null}

      {!isLoading && products.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product, index) => {
            const isExpanded = expandedReason === product.productName;
            const hasBrokenImage = imageErrors[product.productName];
            const showImage = Boolean(product.imageURL) && !hasBrokenImage;

            return (
              <motion.article
                key={product.productName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="group overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_22px_55px_-34px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_28px_70px_-36px_rgba(16,185,129,0.4)]"
              >
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.24),_transparent_58%)]" />

                  {showImage ? (
                    <img
                      src={product.imageURL}
                      alt={product.productName}
                      className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      onError={() =>
                        setImageErrors((current) => ({
                          ...current,
                          [product.productName]: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(16,185,129,0.65))]">
                      <div className="flex flex-col items-center gap-3 text-white">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold tracking-[0.2em]">
                          {getProductInitials(product.productName)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <ImageOff className="h-4 w-4" />
                          Preview unavailable
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    AI Trend #{index + 1}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
                      Product Pick
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      {product.productName}
                    </h3>
                  </div>

                  <Button
                    type="button"
                    variant={isExpanded ? 'default' : 'outline'}
                    onClick={() =>
                      setExpandedReason((currentProduct) =>
                        currentProduct === product.productName ? null : product.productName,
                      )
                    }
                    className={`h-11 w-full rounded-2xl text-sm font-semibold transition-all ${
                      isExpanded
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300'
                    }`}
                  >
                    <span>{isExpanded ? 'Hide reasoning' : 'Reasoning'}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.24 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl border border-border bg-secondary/70 p-4">
                          <p className="text-sm leading-6 text-secondary-foreground">
                            {product.reason}
                          </p>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}