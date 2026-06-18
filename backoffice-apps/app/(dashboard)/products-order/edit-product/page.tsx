'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Minus, Smartphone, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { productOrderApi } from '@/lib/product-order';
import { customerApi, Customer } from '@/lib/customer';
import { productApi, Product } from '@/lib/product-management';
import StatusToast from '@/components/ui/StatusToast';
import { saveFlashToast } from '@/lib/flash-toast';

type OrderStatus = 'received' | 'processing' | 'completed' | 'cancelled';

export default function EditProductOrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');

    const getProductPrice = (product: Product) => Number(product.selling_price ?? product.price ?? 0);

    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
    const [discount, setDiscount] = useState(0);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [status, setStatus] = useState<OrderStatus>('received');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);
    const [toast, setToast] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!orderId) {
                setPageError('ID order tidak ditemukan.');
                setIsLoadingData(false);
                return;
            }

            try {
                setIsLoadingData(true);
                setPageError(null);

                const [prodRes, custRes, orderRes] = await Promise.all([
                    productApi.getAll(),
                    customerApi.getAll(),
                    productOrderApi.getById(orderId),
                ]);

                setProducts(prodRes);
                setCustomers(custRes);

                setOrderNumber(orderRes.order_number || '');
                setStatus((orderRes.status || 'received') as OrderStatus);
                setCustomerName(orderRes.customer_name || '');
                setWhatsappNumber(orderRes.whatsapp_number || '');
                setNotes(orderRes.notes || '');
                setDiscount(Number(orderRes.discount_amount) || 0);

                const matchedCustomer = custRes.find(
                    (customer) =>
                        customer.name === orderRes.customer_name &&
                        (customer.phone || '') === (orderRes.whatsapp_number || '')
                );
                setSelectedCustomerId(matchedCustomer?.id?.toString() || '');

                const normalizedCart = (orderRes.items || [])
                    .map((item) => {
                        const existingProduct = prodRes.find(
                            (product) => Number(product.id) === Number(item.product_id)
                        );

                        if (existingProduct) {
                            return {
                                product: existingProduct,
                                qty: Number(item.qty) || 1,
                            };
                        }

                        if (!item.product) {
                            return null;
                        }

                        const fallbackProduct: Product = {
                            id: item.product_id,
                            name: item.product.name,
                            price: Number(item.price) || 0,
                            selling_price: Number(item.price) || 0,
                            code: `PRD-${item.product_id}`,
                            image_url: item.product.image_url,
                            photo: item.product.photo,
                        };

                        return {
                            product: fallbackProduct,
                            qty: Number(item.qty) || 1,
                        };
                    })
                    .filter(Boolean) as { product: Product; qty: number }[];

                setCart(normalizedCart);
            } catch (error: any) {
                console.error('Gagal memuat detail order:', error);
                setPageError(error.response?.data?.message || 'Gagal memuat data order.');
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, [orderId]);

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedCustomerId(id);

        const selected = customers.find((customer) => customer.id.toString() === id);
        if (selected) {
            setCustomerName(selected.name);
            setWhatsappNumber(selected.phone || '');
        }
    };

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => Number(item.product.id) === Number(product.id));
            if (existing) {
                return prev.map((item) =>
                    Number(item.product.id) === Number(product.id)
                        ? { ...item, qty: item.qty + 1 }
                        : item
                );
            }

            return [...prev, { product, qty: 1 }];
        });
    };

    const updateQty = (productId: string | number, delta: number) => {
        setCart((prev) =>
            prev.map((item) =>
                Number(item.product.id) === Number(productId)
                    ? { ...item, qty: Math.max(1, item.qty + delta) }
                    : item
            )
        );
    };

    const removeFromCart = (productId: string | number) => {
        setCart((prev) => prev.filter((item) => Number(item.product.id) !== Number(productId)));
    };

    const subtotal = cart.reduce((acc, item) => acc + getProductPrice(item.product) * item.qty, 0);
    const total = subtotal - discount;

    const handleSaveChanges = async () => {
        if (!orderId) {
            setToast({ type: 'error', text: 'ID order tidak ditemukan.' });
            return;
        }
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

            const payload = {
                order_number: orderNumber,
                status,
                customer_name: customerName,
                whatsapp_number: whatsappNumber,
                subtotal,
                discount_amount: discount,
                total_amount: total,
                notes,
                items: cart.map((item) => ({
                    product_id: Number(item.product.id),
                    qty: Number(item.qty),
                    price: getProductPrice(item.product),
                    subtotal: getProductPrice(item.product) * item.qty,
                })),
            };

            await productOrderApi.update(orderId, payload);
            saveFlashToast({ type: 'success', text: 'Product order berhasil diperbarui.' });
            router.push('/products-order');
        } catch (error: any) {
            console.error('Update Error:', error);
            setToast({
                type: 'error',
                text: error.response?.data?.message || error.message || 'Gagal memperbarui product order.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (pageError) {
        return (
            <div className="h-screen flex items-center justify-center bg-white px-6">
                <div className="text-center">
                    <p className="text-red-500 font-semibold">{pageError}</p>
                    <Link href="/products-order" className="text-blue-600 text-sm mt-4 inline-block">
                        Kembali ke Product Order
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col lg:flex-row gap-8 p-8 bg-gray-50/50 min-h-screen font-sans"
            style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
        >
            <StatusToast toast={toast} onClose={() => setToast(null)} />

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
                        const isSelected = cart.some(
                            (item) => Number(item.product.id) === Number(product.id)
                        );

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

            <div className="w-full lg:w-110 bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 h-fit sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-8 tracking-tight">Edit Order</h2>

                <div className="space-y-6 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                                Order Number
                            </label>
                            <input
                                type="text"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-xl text-sm font-bold text-gray-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                                className="w-full p-3.5 border border-gray-200 rounded-xl text-sm outline-none font-semibold text-blue-600 bg-white cursor-pointer"
                            >
                                <option value="received">Received</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
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
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name} ({customer.phone})
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
                            <Smartphone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>

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
                                                    Rp {(getProductPrice(item.product) * item.qty).toLocaleString()}
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
                        onClick={handleSaveChanges}
                        className="py-4 bg-[#1E2B5F] text-white rounded-2xl text-[10px] font-bold shadow-lg shadow-blue-900/20 hover:bg-[#15204d] transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
