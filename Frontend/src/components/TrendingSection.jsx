import React from 'react';
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
        name: 'Bucket Hats',
        demand: '+71%',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=300&h=200&fit=crop',
        price: '$14.99'
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
    return <section>
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.5
        }}>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          🔥 Trending Now
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Hot products in your market right now
        </p>
      </motion.div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
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
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-foreground font-semibold text-sm mb-1">
                {product.name}
              </h3>
              <p className="text-muted-foreground text-xs mb-3">
                {product.price}
              </p>

              {/* Trend Badge */}
              <div className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-lg w-fit mb-3">
                📈 {product.demand} Demand
              </div>

              <div className="mt-auto">
                <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl">
                  Source
                </Button>
              </div>
            </div>
          </motion.div>)}
      </div>
    </section>;
}
