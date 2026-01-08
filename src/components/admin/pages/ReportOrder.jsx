import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getAllOrders } from '../../../api/orderApi';
import { getOrderAssignment } from '../../../api/orderAssignmentApi';

const ReportOrder = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch orders and assignments on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getAllOrders();
        if (response.success && response.data) {
          // Sort orders by date (newest first)
          const sortedOrders = response.data.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });
          setOrders(sortedOrders);

          // Fetch assignment data for each order
          const assignmentsData = {};
          for (const order of sortedOrders) {
            try {
              const assignmentResponse = await getOrderAssignment(order.oid);
              assignmentsData[order.oid] = assignmentResponse.data;
            } catch (err) {
              // If assignment doesn't exist, that's fine
              assignmentsData[order.oid] = null;
            }
          }
          setAssignments(assignmentsData);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Calculate dynamic statistics
  const stats = React.useMemo(() => {
    const totalOrders = orders.length;

    // Count orders by assignment status
    const completedOrders = Object.values(assignments).filter(assignment =>
      assignment &&
      assignment.stage1_status === 'completed' &&
      assignment.stage2_status === 'completed' &&
      assignment.stage3_status === 'completed' &&
      assignment.stage4_status === 'completed'
    ).length;

    const inProgressOrders = Object.values(assignments).filter(assignment =>
      assignment && (
        assignment.stage1_status === 'completed' ||
        assignment.stage2_status === 'completed' ||
        assignment.stage3_status === 'completed' ||
        assignment.stage4_status === 'completed'
      ) && !(
        assignment.stage1_status === 'completed' &&
        assignment.stage2_status === 'completed' &&
        assignment.stage3_status === 'completed' &&
        assignment.stage4_status === 'completed'
      )
    ).length;

    const notStartedOrders = totalOrders - completedOrders - inProgressOrders;

    // Calculate total value
    const totalValue = orders.reduce((sum, order) => {
      if (order.items && Array.isArray(order.items)) {
        const orderTotal = order.items.reduce((itemSum, item) =>
          itemSum + (parseFloat(item.total_price) || 0), 0
        );
        return sum + orderTotal;
      }
      return sum;
    }, 0);

    // Format total value
    const formatValue = (value) => {
      if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
      if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
      return `₹${value.toFixed(0)}`;
    };

    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    return [
      {
        label: 'Total Orders',
        value: totalOrders.toString(),
        change: `${completionRate}% Complete`,
        color: 'bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0]'
      },
      {
        label: 'Completed',
        value: completedOrders.toString(),
        change: `${completionRate}%`,
        color: 'bg-gradient-to-r from-[#6EE7B7] to-[#34D399]'
      },
      {
        label: 'Total Value',
        value: formatValue(totalValue),
        change: 'All Time',
        color: 'bg-gradient-to-r from-[#10B981] to-[#059669]'
      },
      {
        label: 'In Progress',
        value: inProgressOrders.toString(),
        change: 'Active',
        color: 'bg-gradient-to-r from-[#047857] to-[#065F46]'
      }
    ];
  }, [orders, assignments]);

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return '-';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '-';
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get status based on assignment stages - matching OrderAssignManagement logic
  const getAssignmentStatus = (orderId) => {
    const assignment = assignments[orderId];

    if (!assignment) {
      return { label: 'Pending', color: 'bg-yellow-500' };
    }

    // Check if all stages are completed
    if (
      assignment.stage1_status === 'completed' &&
      assignment.stage2_status === 'completed' &&
      assignment.stage3_status === 'completed' &&
      assignment.stage4_status === 'completed'
    ) {
      return { label: 'Completed', color: 'bg-[#4ED39A]' };
    }

    // Otherwise, it's pending
    return { label: 'Pending', color: 'bg-yellow-500' };
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <button onClick={() => navigate('/reports')} className="flex items-center gap-2 text-[#0D5C4D] hover:text-[#0a6354] mb-6">
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Reports</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-2xl p-6 ${index === 2 || index === 3 ? 'text-white' : 'text-[#0D5C4D]'}`}>
            <div className="text-sm font-medium mb-2 opacity-90">{stat.label}</div>
            <div className="text-4xl font-bold mb-2">{stat.value}</div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${index === 2 || index === 3 ? 'bg-white/20 text-white' : 'bg-white/60 text-[#0D5C4D]'}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#D4F4E8]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Client</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Value</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order, index) => {
                  const orderTotal = order.items?.reduce((sum, item) =>
                    sum + (parseFloat(item.total_price) || 0), 0
                  ) || 0;
                  const statusInfo = getAssignmentStatus(order.oid);

                  return (
                    <tr key={order.oid} className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'}`}>
                      <td className="px-6 py-4 text-sm text-[#0D5C4D]">{order.order_auto_id || `ORD-${order.oid}`}</td>
                      <td className="px-6 py-4 font-semibold text-[#0D5C4D]">{order.customer_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-[#0D5C4D]">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-[#0D5C4D]">{order.items?.length || 0}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#0D5C4D]">{formatCurrency(orderTotal)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusInfo.color} text-white`}>
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {orders.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB]">
            <div className="text-sm text-[#6B8782]">
              Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} of {orders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg transition-colors ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-[#6B8782] hover:bg-[#D0E0DB]'}`}
              >
                &lt;
              </button>

              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-2 text-[#6B8782]">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                      ? 'bg-[#0D8568] text-white'
                      : 'text-[#6B8782] hover:bg-[#D0E0DB]'
                      }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg transition-colors ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-[#6B8782] hover:bg-[#D0E0DB]'}`}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportOrder;
