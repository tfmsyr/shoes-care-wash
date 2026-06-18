'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Smartphone, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Import API Services
import { productOrderApi, ProductOrder } from '@/lib/product-order';
import { customerApi, Customer } from '@/lib/customer';
import { productApi, Product } from '@/lib/product-management';
import StatusToast from '@/components/ui/StatusToast';
import { saveFlashToast } from '@/lib/flash-toast';

// Definisi tipe status agar sesuai dengan Partial<ProductOrder>
type OrderStatus = 'received' | 'processing' | 'completed' | 'cancelled';

export default function AddProductOrderPage() {
    const router = useRouter();

    const getProductPrice = (product: Product) =>
        Number(product.selling_price ?? product.price ?? 0);

    // --- STATE DATA DARI DATABASE ---
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // --- STATE FORM ORDER ---
    const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
    const [discount, setDiscount] = useState(0);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [orderNumber, setOrderNumber] = useState(`ORD-${Date.now().toString().slice(-6)}`);

    // PERBAIKAN: Gunakan tipe OrderStatus agar tidak error saat payload dikirim
    const [status, setStatus] = useState<OrderStatus>('received');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    // --- FETCH DATA AWAL ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoadingData(true);
                const [prodRes, custRes] = await Promise.all([
                    productApi.getAll(),
                    customerApi.getAll(),
                ]);
                setProducts(prodRes);
                setCustomers(custRes);
            } catch (error) {
                console.error('Gagal memuat data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadInitialData();
    }, []);

    // --- LOGIKA SEARCH ---
    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- LOGIKA AUTO-FILL CUSTOMER ---
    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedCustomerId(id);
        const selected = customers.find((c) => c.id.toString() === id);
        if (selected) {
            setCustomerName(selected.name);
            setWhatsappNumber(selected.phone || '');
        } else {
            setCustomerName('');
            setWhatsappNumber('');
        }
    };

    // --- LOGIKA KERANJANG ---
    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prev, { product, qty: 1 }];
        });
    };

    const updateQty = (productId: any, delta: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.product.id === productId
                    ? { ...item, qty: Math.max(1, item.qty + delta) }
                    : item
            )
        );
    };

    const removeFromCart = (productId: any) => {
        setCart(cart.filter((item) => item.product.id !== productId));
    };

    const subtotal = cart.reduce(
        (acc, item) => acc + getProductPrice(item.product) * item.qty,
        0
    );
    const total = subtotal - discount;

    // --- SUBMIT KE DATABASE ---
    const handleSaveOrder = async () => {
        if (cart.length === 0) {
            setToast({ type: 'error', text: 'Pilih produk dulu!' });
            return;
        }
        if (!customerName) {
            setToast({ type: 'error', text: 'Isi nama customer!' });
            return;
        }

        try {
            setIsSubmitting(true);

            // Payload sekarang sudah dikonversi dengan Number() untuk menghindari error tipe data
            const payload = {
                order_number: orderNumber,
                status: status,
                customer_name: customerName,
                whatsapp_number: whatsappNumber,
                subtotal: subtotal,
                discount_amount: discount,
                total_amount: total,
                notes: notes,
                items: cart.map((item) => ({
                    product_id: Number(item.product.id),
                    qty: Number(item.qty),
                    price: getProductPrice(item.product),
                    subtotal: getProductPrice(item.product) * item.qty,
                })),
            };

            await productOrderApi.create(payload);
            saveFlashToast({ type: 'success', text: 'Product order berhasil disimpan.' });
            router.push('/products-order');
        } catch (error: any) {
            console.error('Submit Error:', error);
            setToast({
                type: 'error',
                text: error.response?.data?.message || error.message || 'Gagal menyimpan product order.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData)
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );

    return (
        <div
            className="flex flex-col lg:flex-row gap-8 p-8 bg-gray-50/50 min-h-screen font-sans"
            style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
        >
            <StatusToast toast={toast} onClose={() => setToast(null)} />

            {/* LEFT SIDE: PRODUCT SELECTION */}
            <div className="flex-1">
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search by Name or Code"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-5 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 bg-white shadow-sm transition-all"
                    />
                    <Search className="absolute right-4 top-4 text-gray-400" size={20} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                        const isSelected = cart.some((item) => item.product.id === product.id);
                        return (
                            <div
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className={`bg-white p-5 rounded-4xl border transition-all text-center group cursor-pointer active:scale-95 hover:shadow-xl ${
                                    isSelected
                                        ? 'border-blue-500 ring-2 ring-blue-500/5'
                                        : 'border-gray-100 shadow-sm'
                                }`}
                            >
                                <div className="bg-gray-50 rounded-2xl p-4 mb-4 relative overflow-hidden">
                                    <img
                                        src={product.image_url || product.photo || '/images/placeholder.png'}
                                        alt={product.name}
                                        className="w-full h-32 object-contain group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <span className="absolute top-2 left-2 text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded shadow-sm border border-blue-50">
                                        {product.code}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-blue-500 bg-white rounded-full p-0.5 shadow-sm">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
                                    {product.name}
                                </h3>
                                <p className="text-blue-900 font-black text-sm mb-4">
                                    Rp {getProductPrice(product).toLocaleString()}
                                </p>
                                <div
                                    className={`w-full py-3 border-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider ${
                                        isSelected
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'border-blue-500 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'
                                    }`}
                                >
                                    {isSelected ? 'Added' : 'Add to Cart'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT SIDE: ORDER SUMMARY */}
            <div className="w-full lg:w-110 bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 h-fit sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-8 tracking-tight">New Order</h2>

                <div className="space-y-6 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                                Order Number
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={orderNumber}
                                className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-xl text-sm font-bold text-gray-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                                Status
                            </label>
                            <input
                                type="text"
                                value="Received"
                                readOnly
                                className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-xl text-sm font-bold text-gray-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                            Select Registered Customer
                        </label>
                        <select
                            value={selectedCustomerId}
                            onChange={handleCustomerChange}
                            className="w-full p-3.5 border border-gray-200 rounded-xl text-sm outline-none font-medium text-gray-700 focus:border-blue-300 cursor-pointer"
                        >
                            <option value="">-- Choose Customer --</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.phone})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                            Manual Customer Name
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                            className="w-full p-3.5 border border-gray-200 rounded-xl text-sm outline-none font-medium text-gray-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                            WhatsApp Number
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                placeholder="628123456789"
                                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm font-medium outline-none"
                            />
                            <Smartphone
                                className="absolute left-4 top-3.5 text-gray-400"
                                size={18}
                            />
                        </div>
                    </div>

                    {/* ORDER ITEMS */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                            Order Items
                        </label>
                        <div className="border border-gray-100 rounded-2xl min-h-32 bg-gray-50/30 overflow-hidden">
                            {cart.length === 0 ? (
                                <div className="flex items-center justify-center h-32">
                                    <p className="text-gray-300 text-xs font-medium italic">
                                        Select product to add
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div
                                            key={item.product.id}
                                            className="p-4 flex items-center justify-between bg-white hover:bg-gray-50/50 transition-colors"
                                        >
                                            <div className="flex-1 pr-2">
                                                <span className="text-xs font-bold text-gray-800 line-clamp-1">
                                                    {item.product.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mr-4">
                                                <button
                                                    onClick={() => updateQty(item.product.id, -1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500"
                                                >
                                                    <Minus size={10} />
                                                </button>
                                                <span className="w-4 text-center text-xs font-bold">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() => updateQty(item.product.id, 1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-400 hover:text-blue-500"
                                                >
                                                    <Plus size={10} />
                                                </button>
                                            </div>
                                            <div className="text-right flex items-center gap-2">
                                                    <span className="text-[11px] font-black text-gray-700 min-w-16">
                                                        Rp{' '}
                                                    {(getProductPrice(item.product) * item.qty).toLocaleString()}
                                                </span>
                                                <button
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="text-gray-300 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                            Discount (Nominal)
                        </label>
                        <input
                            type="text"
                            placeholder="Rp. 0"
                            value={discount > 0 ? discount : ''}
                            onChange={(e) => setDiscount(Number(e.target.value.replace(/\D/g, '')))}
                            className="w-full p-3.5 border border-gray-200 rounded-xl text-sm outline-none font-bold text-red-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter additional notes"
                            className="w-full p-3.5 border border-gray-200 rounded-xl text-sm outline-none min-h-20 resize-none"
                        />
                    </div>
                </div>

                {/* FOOTER TOTALS */}
                <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                            Subtotal
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                            Rp {subtotal.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                            Diskon
                        </span>
                        <span className="text-sm font-bold text-red-500">
                            - Rp {discount.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-100">
                        <span className="text-sm font-black text-gray-900 uppercase">
                            Total Amount
                        </span>
                        <span className="text-xl font-black text-blue-600 tracking-tighter">
                            Rp {total.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <Link href="/products-order" className="w-full">
                        <button className="w-full py-4 border border-gray-200 rounded-2xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                    </Link>
                    <button
                        disabled={isSubmitting}
                        onClick={handleSaveOrder}
                        className="py-4 bg-[#1E2B5F] text-white rounded-2xl text-[10px] font-bold shadow-lg shadow-blue-900/20 hover:bg-[#15204d] transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            'Save Order'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
