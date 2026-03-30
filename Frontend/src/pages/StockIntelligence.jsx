import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Download, Plus, ArrowUpDown, AlertTriangle, XCircle, CheckCircle2, ArrowUp } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/Select';
const inventoryData = [{
        id: '1',
        name: 'Cargo Pants',
        sku: 'CP-1001',
        category: 'Bottoms',
        quantity: 245,
        reorderLevel: 50,
        unitPrice: 34.99,
        status: 'In Stock',
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=80&h=80&fit=crop'
    }, {
        id: '2',
        name: 'Oversized Tees',
        sku: 'OT-1002',
        category: 'Tops',
        quantity: 412,
        reorderLevel: 100,
        unitPrice: 19.99,
        status: 'Overstocked',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop'
    }, {
        id: '3',
        name: 'Canvas Sneakers',
        sku: 'CS-1003',
        category: 'Footwear',
        quantity: 18,
        reorderLevel: 30,
        unitPrice: 59.99,
        status: 'Low Stock',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=80&h=80&fit=crop'
    }, {
        id: '4',
        name: 'Bucket Hats',
        sku: 'BH-1004',
        category: 'Accessories',
        quantity: 0,
        reorderLevel: 25,
        unitPrice: 14.99,
        status: 'Out of Stock',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=80&h=80&fit=crop'
    }, {
        id: '5',
        name: 'Linen Shirts',
        sku: 'LS-1005',
        category: 'Tops',
        quantity: 87,
        reorderLevel: 40,
        unitPrice: 42.99,
        status: 'In Stock',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=80&h=80&fit=crop'
    }, {
        id: '6',
        name: 'Crossbody Bags',
        sku: 'CB-1006',
        category: 'Accessories',
        quantity: 12,
        reorderLevel: 20,
        unitPrice: 27.99,
        status: 'Low Stock',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop'
    }, {
        id: '7',
        name: 'Retro Sunglasses',
        sku: 'RS-1007',
        category: 'Accessories',
        quantity: 156,
        reorderLevel: 30,
        unitPrice: 22.99,
        status: 'In Stock',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=80&h=80&fit=crop'
    }, {
        id: '8',
        name: 'Graphic Hoodies',
        sku: 'GH-1008',
        category: 'Tops',
        quantity: 0,
        reorderLevel: 35,
        unitPrice: 49.99,
        status: 'Out of Stock',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=80&h=80&fit=crop'
    }, {
        id: '9',
        name: 'Slim Fit Jeans',
        sku: 'SJ-1009',
        category: 'Bottoms',
        quantity: 198,
        reorderLevel: 60,
        unitPrice: 44.99,
        status: 'In Stock',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop'
    }, {
        id: '10',
        name: 'Leather Belts',
        sku: 'LB-1010',
        category: 'Accessories',
        quantity: 340,
        reorderLevel: 50,
        unitPrice: 18.99,
        status: 'Overstocked',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&h=80&fit=crop'
    }, {
        id: '11',
        name: 'Running Shoes',
        sku: 'RN-1011',
        category: 'Footwear',
        quantity: 22,
        reorderLevel: 40,
        unitPrice: 79.99,
        status: 'Low Stock',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop'
    }, {
        id: '12',
        name: 'Polo Shirts',
        sku: 'PS-1012',
        category: 'Tops',
        quantity: 134,
        reorderLevel: 45,
        unitPrice: 29.99,
        status: 'In Stock',
        image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=80&h=80&fit=crop'
    }, {
        id: '13',
        name: 'Denim Jackets',
        sku: 'DJ-1013',
        category: 'Outerwear',
        quantity: 8,
        reorderLevel: 15,
        unitPrice: 64.99,
        status: 'Low Stock',
        image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=80&h=80&fit=crop'
    }, {
        id: '14',
        name: 'Wool Scarves',
        sku: 'WS-1014',
        category: 'Accessories',
        quantity: 0,
        reorderLevel: 20,
        unitPrice: 24.99,
        status: 'Out of Stock',
        image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=80&h=80&fit=crop'
    }, {
        id: '15',
        name: 'Chino Shorts',
        sku: 'CH-1015',
        category: 'Bottoms',
        quantity: 276,
        reorderLevel: 50,
        unitPrice: 32.99,
        status: 'Overstocked',
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=80&h=80&fit=crop'
    }];
const statusConfig = {
    'In Stock': {
        color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        icon: <CheckCircle2 className="w-3 h-3"/>
    },
    'Low Stock': {
        color: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
        icon: <AlertTriangle className="w-3 h-3"/>
    },
    'Out of Stock': {
        color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
        icon: <XCircle className="w-3 h-3"/>
    },
    Overstocked: {
        color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
        icon: <ArrowUp className="w-3 h-3"/>
    }
};
const categories = ['All', 'Tops', 'Bottoms', 'Footwear', 'Accessories', 'Outerwear'];
const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Overstocked'];
export function StockIntelligence() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortField, setSortField] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const filtered = useMemo(() => {
        let items = [...inventoryData];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
        }
        if (categoryFilter !== 'All') {
            items = items.filter((i) => i.category === categoryFilter);
        }
        if (statusFilter !== 'All') {
            items = items.filter((i) => i.status === statusFilter);
        }
        items.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        });
        return items;
    }, [searchQuery, categoryFilter, statusFilter, sortField, sortDir]);
    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortField(field);
            setSortDir('asc');
        }
    };
    const totalSKUs = inventoryData.length;
    const totalValue = inventoryData.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const lowStockCount = inventoryData.filter((i) => i.status === 'Low Stock').length;
    const outOfStockCount = inventoryData.filter((i) => i.status === 'Out of Stock').length;
    return <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4
        }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Stock Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor inventory levels, track stock health, and manage reorders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border">
            <Download className="w-4 h-4"/>
            Export
          </Button>
          <Button size="sm" className="gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="w-4 h-4"/>
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.1
        }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 rounded-xl">
              <Package className="w-5 h-5 text-emerald-500"/>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Total SKUs
              </p>
              <p className="text-2xl font-bold text-foreground">{totalSKUs}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/15 rounded-xl">
              <ArrowUp className="w-5 h-5 text-blue-500"/>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Inventory Value
              </p>
              <p className="text-2xl font-bold text-foreground">
                $
                {totalValue.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/15 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-yellow-500"/>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Low Stock
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {lowStockCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/15 rounded-xl">
              <XCircle className="w-5 h-5 text-red-500"/>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Out of Stock
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {outOfStockCount}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.2
        }} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <Input placeholder="Search by name, SKU, or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-xl bg-card border-border"/>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] rounded-xl bg-card border-border">
            <SelectValue placeholder="Category"/>
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c} value={c}>
                {c}
              </SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] rounded-xl bg-card border-border">
            <SelectValue placeholder="Status"/>
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => <SelectItem key={s} value={s}>
                {s}
              </SelectItem>)}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs ml-auto">
          {filtered.length} of {totalSKUs} products
        </p>
      </motion.div>

      {/* Inventory Table */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.3
        }} className="bg-card border border-border rounded-2xl overflow-hidden transition-colors duration-300">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[280px]">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  Product <ArrowUpDown className="w-3 h-3"/>
                </button>
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                SKU
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort('quantity')} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  Qty <ArrowUpDown className="w-3 h-3"/>
                </button>
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reorder Lvl
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort('unitPrice')} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  Unit Price <ArrowUpDown className="w-3 h-3"/>
                </button>
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                Total Value
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
            const sc = statusConfig[item.status];
            return <TableRow key={item.id} className="border-border hover:bg-secondary/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-border"/>
                      <span className="font-medium text-foreground text-sm">
                        {item.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">
                    {item.sku}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.category}
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-semibold ${item.quantity === 0 ? 'text-red-500' : item.quantity <= item.reorderLevel ? 'text-yellow-600 dark:text-yellow-400' : 'text-foreground'}`}>
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.reorderLevel}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${sc.color}`}>
                      {sc.icon}
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground text-sm font-medium">
                    ${item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-foreground text-sm font-medium text-right">
                    $
                    {(item.quantity * item.unitPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}
                  </TableCell>
                </TableRow>;
        })}
            {filtered.length === 0 && <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50"/>
                  <p className="text-muted-foreground text-sm">
                    No products match your filters
                  </p>
                </TableCell>
              </TableRow>}
          </TableBody>
        </Table>
      </motion.div>
    </div>;
}
