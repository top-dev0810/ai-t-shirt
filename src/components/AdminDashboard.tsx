'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
// Database operations moved to API routes
import {
    Users,
    ShoppingBag,
    DollarSign,
    TrendingUp,
    Download,
    RefreshCw
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';
import AlertModal from './AlertModal';

interface OrderStats {
    total_orders: number;
    total_revenue: number;
    total_deposits: number;
    completed_orders: number;
    pending_orders: number;
    average_order_value: number;
}

interface Order {
    id: number;
    order_id: string;
    status: string;
    deposit_amount: number;
    total_amount: number;
    payment_status: string;
    created_at: string;
    user_name?: string;
    user_email?: string;
    customer_name?: string;
    customer_email?: string;
    item_count: number;
    items_total: number;
}

interface Transaction {
    id: number;
    order_id: number;
    transaction_id: string;
    payment_method: string;
    amount: number;
    currency: string;
    status: string;
    gateway_response: string;
    created_at: string;
    order_status: string;
    customer_name: string;
    customer_email: string;
}

interface Admin {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    account_state: 'active' | 'inactive' | 'suspended';
    created_at: string;
    updated_at: string;
}

interface AdminDashboardProps {
    initialTab?: 'overview' | 'orders' | 'deposits' | 'transactions' | 'admins';
}

export default function AdminDashboard({ initialTab = 'overview' }: AdminDashboardProps) {
    const { adminUser } = useAdminAuth();
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'orders' | 'deposits' | 'transactions' | 'admins'>(initialTab);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [confirmModalData, setConfirmModalData] = useState<{
        title: string;
        message: string;
        type: 'delete' | 'update' | 'warning';
    } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Test database connection first
            const connectionResponse = await fetch('/api/database/test');
            const connectionResult = await connectionResponse.json();

            if (!connectionResult.success) {
                setError(`Database connection failed: ${connectionResult.message}`);
                return;
            }

            // Load orders
            const ordersResponse = await fetch('/api/database/orders');
            const ordersResult = await ordersResponse.json();

            if (ordersResult.success) {
                setOrders(ordersResult.orders || []);

                // Calculate basic stats from orders
                const totalOrders = ordersResult.orders?.length || 0;
                const totalRevenue = ordersResult.orders?.reduce((sum: number, order: Order) => {
                    const amount = parseFloat(String(order.total_amount || 0));
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0) || 0;
                const totalDeposits = ordersResult.orders?.reduce((sum: number, order: Order) => {
                    const amount = parseFloat(String(order.deposit_amount || 0));
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0) || 0;
                const completedOrders = ordersResult.orders?.filter((order: Order) => order.status === 'completed').length || 0;
                const pendingOrders = ordersResult.orders?.filter((order: Order) => order.status === 'pending').length || 0;

                setStats({
                    total_orders: totalOrders,
                    total_revenue: totalRevenue,
                    total_deposits: totalDeposits,
                    completed_orders: completedOrders,
                    pending_orders: pendingOrders,
                    average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0
                });
            } else {
                setError('Failed to load orders');
            }

            // Load transactions
            const transactionsResponse = await fetch('/api/admin/transactions');
            const transactionsResult = await transactionsResponse.json();
            if (transactionsResult.success) {
                setTransactions(transactionsResult.transactions || []);
            }

            // Load admins
            const adminsResponse = await fetch('/api/admin/admins');
            const adminsResult = await adminsResponse.json();
            if (adminsResult.success) {
                setAdmins(adminsResult.admins || []);
            }

        } catch (err) {
            console.error('Error loading admin data:', err);
            setError('Failed to load data. Please check database connection.');
        } finally {
            setLoading(false);
        }
    };

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

    const handleEditAdmin = (admin: Admin) => {
        setEditingAdmin(admin);
        setShowEditModal(true);
    };

    const handleDeleteAdmin = (admin: Admin) => {
        setConfirmModalData({
            title: 'Delete Admin',
            message: `Are you sure you want to delete admin "${admin.username}"? This action cannot be undone.`,
            type: 'delete'
        });
        setConfirmAction(() => async () => {
            try {
                const response = await fetch(`/api/admin/admins/${admin.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentAdminId: adminUser?.id
                    })
                });
                const result = await response.json();

                if (result.success) {
                    setAdmins(admins.filter(a => a.id !== admin.id));
                    setShowConfirmModal(false);
                    showAlert('success', 'Success', 'Admin deleted successfully');
                } else {
                    showAlert('error', 'Error', result.message || 'Failed to delete admin');
                }
            } catch (error) {
                console.error('Error deleting admin:', error);
                showAlert('error', 'Error', 'Error deleting admin');
            }
        });
        setShowConfirmModal(true);
    };

    const handleUpdateAdmin = async (adminData: Partial<Admin>) => {
        if (!editingAdmin) return;

        try {
            const response = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...adminData,
                    currentAdminId: adminUser?.id
                })
            });
            const result = await response.json();

            if (result.success) {
                setAdmins(admins.map(admin =>
                    admin.id === editingAdmin.id ? { ...admin, ...adminData } : admin
                ));
                setShowEditModal(false);
                setEditingAdmin(null);
                showAlert('success', 'Success', 'Admin updated successfully');
            } else {
                showAlert('error', 'Error', result.message || 'Failed to update admin');
            }
        } catch (error) {
            console.error('Error updating admin:', error);
            showAlert('error', 'Error', 'Error updating admin');
        }
    };

    const handleCreateAdmin = async (adminData: {
        username: string;
        email: string;
        account_state: 'active' | 'inactive' | 'suspended';
    }) => {
        try {
            const response = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adminData)
            });
            const result = await response.json();

            if (result.success) {
                // Reload admins data
                const adminsResponse = await fetch('/api/admin/admins');
                const adminsResult = await adminsResponse.json();
                if (adminsResult.success) {
                    setAdmins(adminsResult.admins || []);
                }
                setShowAddAdminModal(false);
                showAlert('success', 'Success', 'Admin created successfully');
            } else {
                showAlert('error', 'Error', 'Failed to create admin');
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            showAlert('error', 'Error', 'Error creating admin');
        }
    };

    // Pagination logic
    const getCurrentPageOrders = (data: Order[]) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const getCurrentPageTransactions = (data: Transaction[]) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const getCurrentPageAdmins = (data: Admin[]) => {
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
        let dataLength = 0;
        switch (selectedTab) {
            case 'orders':
                dataLength = orders.length;
                break;
            case 'deposits':
                dataLength = orders.filter(order => parseFloat(String(order.deposit_amount || 0)) === 50).length;
                break;
            case 'transactions':
                dataLength = transactions.length;
                break;
            case 'admins':
                dataLength = admins.length;
                break;
            default:
                dataLength = orders.length;
        }

        const totalPages = getTotalPages(dataLength);
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [orders.length, transactions.length, admins.length, currentPage, selectedTab]);

    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setAlertModal({
            isOpen: true,
            type,
            title,
            message
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'processing': return 'text-blue-600 bg-blue-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const exportOrders = () => {
        const csvContent = [
            ['Order ID', 'Customer', 'Email', 'Status', 'Deposit', 'Total', 'Items', 'Date'],
            ...orders.map(order => [
                order.order_id,
                order.customer_name || 'N/A',
                order.customer_email || 'N/A',
                order.status,
                order.deposit_amount.toString(),
                order.total_amount.toString(),
                order.item_count.toString(),
                formatDate(order.created_at)
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <LoadingSpinner
                    size="xl"
                    text="Loading Dashboard"
                    subtext="Please wait while we fetch your data..."
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                            Database Connection Error
                        </h2>
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button
                            onClick={loadData}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry Connection
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Band Adda AI T-Shirt Designer - Order Management
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadData}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </button>
                            <button
                                onClick={exportOrders}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Tabs */}
                <div className="mb-6">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: TrendingUp },
                            { id: 'orders', label: 'All Orders', icon: ShoppingBag },
                            { id: 'deposits', label: 'Rs 50 Deposits', icon: DollarSign },
                            { id: 'transactions', label: 'Transactions', icon: DollarSign },
                            { id: 'admins', label: 'Admins', icon: Users }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as 'overview' | 'orders' | 'deposits' | 'transactions' | 'admins')}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${selectedTab === tab.id
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Overview Tab */}
                {selectedTab === 'overview' && stats && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_orders}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(stats.total_revenue || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rs 50 Deposits</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(stats.total_deposits || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(stats.average_order_value || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Status Breakdown */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Status Breakdown</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{stats.completed_orders}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending_orders}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{stats.total_orders - stats.completed_orders - stats.pending_orders}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-600">{stats.total_orders}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {selectedTab === 'orders' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Orders</h3>
                        </div>
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
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {getCurrentPageOrders(orders).map((order, index) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {order.order_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <div>
                                                    <div className="font-medium">{order.user_name || order.customer_name || 'N/A'}</div>
                                                    <div className="text-xs">{order.user_email || order.customer_email || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                <div>
                                                    <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                                                    {order.deposit_amount > 0 && (
                                                        <div className="text-xs text-gray-500">Deposit: {formatCurrency(order.deposit_amount)}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {order.item_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(order.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={getTotalPages(orders.length)}
                            onPageChange={handlePageChange}
                            totalItems={orders.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}

                {/* Deposits Tab */}
                {selectedTab === 'deposits' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rs 50 Deposit Orders</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Orders that paid the Rs 50 deposit for design generation
                            </p>
                        </div>
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
                                            Total Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {getCurrentPageOrders(orders.filter(order => parseFloat(String(order.deposit_amount || 0)) === 50)).map((order, index) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {order.order_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <div>
                                                    <div className="font-medium">{order.user_name || order.customer_name || 'N/A'}</div>
                                                    <div className="text-xs">{order.user_email || order.customer_email || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(order.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={getTotalPages(orders.filter(order => parseFloat(String(order.deposit_amount || 0)) === 50).length)}
                            onPageChange={handlePageChange}
                            totalItems={orders.filter(order => parseFloat(String(order.deposit_amount || 0)) === 50).length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}

                {/* Transactions Tab */}
                {selectedTab === 'transactions' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Transactions</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Complete transaction history for all payments
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Transaction ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {getCurrentPageTransactions(transactions).map((transaction, index) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {transaction.transaction_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {transaction.order_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <div>
                                                    <div className="font-medium">{transaction.customer_name || 'N/A'}</div>
                                                    <div className="text-xs">{transaction.customer_email || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {formatCurrency(transaction.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {transaction.payment_method}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(transaction.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={getTotalPages(transactions.length)}
                            onPageChange={handlePageChange}
                            totalItems={transactions.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}

                {/* Admins Tab */}
                {selectedTab === 'admins' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Management</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Manage administrator accounts and permissions
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddAdminModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                + Add Admin
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Username
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Account State
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {getCurrentPageAdmins(admins).map((admin, index) => (
                                        <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {admin.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {admin.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${admin.is_active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                    {admin.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${admin.account_state === 'active'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : admin.account_state === 'inactive'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                    {admin.account_state}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(admin.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {admin.id !== adminUser?.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditAdmin(admin)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAdmin(admin)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                                                        You cannot edit/delete your own account
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={getTotalPages(admins.length)}
                            onPageChange={handlePageChange}
                            totalItems={admins.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}

                {/* Edit Admin Modal */}
                {showEditModal && editingAdmin && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Edit Admin
                                </h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    handleUpdateAdmin({
                                        username: formData.get('username') as string,
                                        email: formData.get('email') as string,
                                        is_active: formData.get('is_active') === 'on',
                                        account_state: formData.get('account_state') as 'active' | 'inactive' | 'suspended'
                                    });
                                }}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            defaultValue={editingAdmin.username}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            defaultValue={editingAdmin.email}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Account State
                                        </label>
                                        <select
                                            name="account_state"
                                            defaultValue={editingAdmin.account_state}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                defaultChecked={editingAdmin.is_active}
                                                className="mr-2"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Is Active
                                            </span>
                                        </label>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Admin Modal */}
                {showAddAdminModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Add New Admin
                                </h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    handleCreateAdmin({
                                        username: formData.get('username') as string,
                                        email: formData.get('email') as string,
                                        account_state: formData.get('account_state') as 'active' | 'inactive' | 'suspended'
                                    });
                                }}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Account State
                                        </label>
                                        <select
                                            name="account_state"
                                            defaultValue="active"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddAdminModal(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            Create Admin
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={() => {
                        if (confirmAction) {
                            confirmAction();
                        }
                    }}
                    title={confirmModalData?.title || ''}
                    message={confirmModalData?.message || ''}
                    type={confirmModalData?.type || 'warning'}
                />

                {/* Alert Modal */}
                <AlertModal
                    isOpen={alertModal.isOpen}
                    onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                    type={alertModal.type}
                    title={alertModal.title}
                    message={alertModal.message}
                />
            </div>
        </div>
    );
}
