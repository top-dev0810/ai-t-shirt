'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, RefreshCw, Database, ShoppingBag } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';

interface OrderData {
    id: string;
    order_id: string;
    status: string;
    total_amount: number;
    created_at: string;
    user_name?: string;
    user_email?: string;
    name?: string;
    email?: string;
}

export default function VerifyOrdersPage() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dbStatus, setDbStatus] = useState<string>('Unknown');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const checkDatabase = async () => {
        try {
            const response = await fetch('/api/database/test');
            const result = await response.json();
            setDbStatus(result.success ? 'Connected' : 'Failed');
        } catch (err) {
            setDbStatus('Failed');
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/database/orders');
            const result = await response.json();

            if (result.success) {
                setOrders(result.orders || []);
            } else {
                setError('Failed to fetch orders');
            }
        } catch (err) {
            setError('Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkDatabase();
        fetchOrders();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Pagination logic
    const getCurrentPageData = (data: OrderData[]) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const getTotalPages = useCallback((dataLength: number) => {
        return Math.ceil(dataLength / itemsPerPage);
    }, [itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Auto-redirect to previous page if current page is empty
    useEffect(() => {
        const totalPages = getTotalPages(orders.length);
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [orders.length, currentPage]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <LoadingSpinner
                    size="xl"
                    text="Loading Order Verification"
                    subtext="Please wait while we fetch order data..."
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Order Verification Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Check database and WooCommerce order status
                    </p>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Database Status</p>
                                <p className={`text-2xl font-bold ${dbStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                                    {dbStatus}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful Orders</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {orders.filter(order => order.status === 'processing' || order.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mb-6">
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Refreshing...' : 'Refresh Orders'}
                    </button>
                </div>

                {/* Orders Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
                    </div>

                    {error && (
                        <div className="p-6">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div className="flex items-center">
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                                    <span className="text-red-800 dark:text-red-400">{error}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {orders.length === 0 && !loading && !error && (
                        <div className="p-6 text-center">
                            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                        </div>
                    )}

                    {orders.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {getCurrentPageData(orders).map((order, index) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {order.order_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <div>
                                                    <div className="font-medium">{order.user_name || order.name || 'N/A'}</div>
                                                    <div className="text-xs">{order.user_email || order.email || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {formatCurrency(order.total_amount || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(order.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {orders.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={getTotalPages(orders.length)}
                            onPageChange={handlePageChange}
                            totalItems={orders.length}
                            itemsPerPage={itemsPerPage}
                        />
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-4">
                        How to Check Orders
                    </h3>
                    <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <div>
                                <strong>Database Orders:</strong> This page shows orders saved in the MySQL database
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <div>
                                <strong>WooCommerce Orders:</strong> Check your WooCommerce admin panel at <code>https://bandadda.com/wp-admin</code>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <div>
                                <strong>Admin Dashboard:</strong> Visit <code>/admin</code> for detailed analytics and management
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
