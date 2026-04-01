import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';

const trendingProducts = [{
        name: 'Cargo Pants',
        demand: '+45%',
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=200&fit=crop',
        price: '$34.99'
    }, {
        name: 'Oversized Tees',
        demand: '+62%',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop',
        price: '$19.99'
    }, {
        name: 'Canvas Sneakers',
        demand: '+38%',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&h=200&fit=crop',
        price: '$59.99'
    }, {
        name: 'Linen Shirts',
        demand: '+29%',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=200&fit=crop',
        price: '$42.99'
    }, {
        name: 'Crossbody Bags',
        demand: '+53%',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=200&fit=crop',
        price: '$27.99'
    }, {
        name: 'Retro Sunglasses',
        demand: '+47%',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=200&fit=crop',
        price: '$22.99'
    }, {
        name: 'Graphic Hoodies',
        demand: '+56%',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=200&fit=crop',
        price: '$49.99'
    }];

export function TrendingSection() {
    const scrollContainerRef = useRef(null);

    const handleScrollToStart = () => {
        scrollContainerRef.current?.scrollTo({
            left: 0,
            behavior: 'smooth'
        });
    };

    const handleScrollToEnd = () => {
        scrollContainerRef.current?.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: 'smooth'
        });
    };

    return <section>
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.5
        }} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold text-foreground">
            Trending Now
          </h2>
          <p className="text-sm text-muted-foreground">
            Hot products in your market right now
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleScrollToStart}
            className="h-10 w-10 rounded-full px-0 text-lg"
            aria-label="Scroll to start"
          >
            {'<'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleScrollToEnd}
            className="h-10 w-10 rounded-full px-0 text-lg"
            aria-label="Scroll to end"
          >
            {'>'}
          </Button>
        </div>
      </motion.div>

      <div ref={scrollContainerRef} className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide">
        {trendingProducts.map((product, index) => <motion.div key={product.name} initial={{
                opacity: 0,
                y: 20
            }} animate={{
                opacity: 1,
                y: 0
            }} transition={{
                duration: 0.4,
                delay: index * 0.06
            }} className="min-w-[220px] max-w-[220px] bg-card backdrop-blur border border-border rounded-2xl overflow-hidden flex flex-col group hover:border-emerald-500/30 transition-all duration-300">
            {/* Image */}
            <div className="relative h-[140px] overflow-hidden">
              <img src={product.image} alt={product.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4">
              <h3 className="mb-1 text-sm font-semibold text-foreground">
                {product.name}
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                {product.price}
              </p>

              {/* Trend Badge */}
              <div className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-lg w-fit mb-3">
                Trend {product.demand} Demand
              </div>

              <div className="mt-auto">
                <Button size="sm" className="w-full text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl">
                  Source
                </Button>
              </div>
            </div>
          </motion.div>)}
      </div>
    </section>;
}
