'use client';

import { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import ImageWithErrorFallback from './ImageWithErrorFallback';
import { PerfectImageFlowService } from '@/lib/services/perfectImageFlow';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  order_id: string;
  email?: string;
  user_email?: string;
  name?: string;
  user_name?: string;
  status: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  items: Array<{
    tshirt_style: string;
    tshirt_color: string;
    tshirt_size: string;
    print_size: string;
    placement: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  // Design data is now at the top level from the database query
  prompt_text?: string;
  art_style?: string;
  music_genre?: string;
  image_url?: string;
  ftp_image_path?: string;
  is_ai_generated?: boolean;
  item_count?: number;
}

export default function Orders() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Fetch orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/database/orders');
        const data = await response.json();

        if (data.success) {
          // Filter orders by user email (check both email and user_email fields)
          const userOrders = data.orders.filter((order: Order) =>
            (order.email === user.email) || (order.user_email === user.email)
          );
          console.log('Fetched orders with image URLs:', userOrders.map((o: Order) => ({ id: o.id, image_url: o.image_url })));
          setOrders(userOrders);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        setError('Error fetching orders');
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user?.email]);

  // Get the best available image URL for display
  const getDisplayImageUrl = (order: Order): string => {
    // Create a design object for the service
    const designObj = {
      id: order.id,
      imageUrl: order.image_url || '',
      ftpImageUrl: order.ftp_image_path || '',
      prompt: { text: '', artStyle: '', musicGenre: '' },
      userId: '',
      createdAt: new Date(),
      isPublic: false
    };

    return PerfectImageFlowService.getDisplayUrl(designObj);
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.prompt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner
          size="xl"
          text="Loading your orders..."
          subtext="Please wait while we fetch your order history..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Orders</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Please Login</h3>
        <p className="text-gray-600 dark:text-gray-400">You need to be logged in to view your orders.</p>
      </div>
    );
  }

  // Don't return early for empty filtered orders - show the full interface

  return (
    <div className="p-6 pb-8 h-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your T-shirt orders
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by design or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State or Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? 'No orders match your current filters.'
                : 'You haven\'t placed any orders yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewOrder(order)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Design Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <ImageWithErrorFallback
                          src={getDisplayImageUrl(order)}
                          alt="Design"
                          className="w-full h-full"
                        />
                      </div>

                      {/* Order Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-2">
                          {order.prompt_text || 'Custom Design'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.item_count || 0} item(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(order.total_amount)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items Details */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.tshirt_style} - {item.tshirt_color} ({item.tshirt_size}) - {item.print_size}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatPrice(item.total_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Order Content */}
              <div className="space-y-6">
                {/* Design Image */}
                <div className="flex justify-center">
                  <div className="w-48 h-48">
                    {selectedOrder.image_url ? (
                      <ImageWithErrorFallback
                        src={selectedOrder.image_url}
                        alt="Design"
                        className="w-full h-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">No Image Available</div>
                          <div className="text-sm text-red-500">Error Loading Design</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Information</h3>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <p><span className="font-medium text-gray-900 dark:text-white">Order ID:</span> {selectedOrder.order_id}</p>
                      <p><span className="font-medium text-gray-900 dark:text-white">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </p>
                      <p><span className="font-medium text-gray-900 dark:text-white">Date:</span> {formatDate(selectedOrder.created_at)}</p>
                      <p><span className="font-medium text-gray-900 dark:text-white">Total Amount:</span> {formatPrice(selectedOrder.total_amount)}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Information</h3>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <p><span className="font-medium text-gray-900 dark:text-white">Name:</span> {selectedOrder.user_name || selectedOrder.name || 'Unknown'}</p>
                      <p><span className="font-medium text-gray-900 dark:text-white">Email:</span> {selectedOrder.user_email || selectedOrder.email || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {/* Design Details */}
                {(selectedOrder.prompt_text || selectedOrder.art_style || selectedOrder.music_genre) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Design Details</h3>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <p><span className="font-medium text-gray-900 dark:text-white">Prompt:</span> {selectedOrder.prompt_text || 'N/A'}</p>
                      <p><span className="font-medium text-gray-900 dark:text-white">Art Style:</span> {selectedOrder.art_style || 'N/A'}</p>
                      <p><span className="font-medium text-gray-900 dark:text-white">Music Genre:</span> {selectedOrder.music_genre || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{item.tshirt_style}</span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {item.tshirt_color} ({item.tshirt_size}) - {item.print_size}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">{formatPrice(item.total_price)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}