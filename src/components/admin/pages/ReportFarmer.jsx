import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowLeft, Search } from 'lucide-react';
import { getAllOrders } from '../../../api/orderApi';
import { getOrderAssignment } from '../../../api/orderAssignmentApi';
import { getAllFarmers } from '../../../api/farmerApi';
import { getAllSuppliers } from '../../../api/supplierApi';
import { getAllThirdParties } from '../../../api/thirdPartyApi';
import { getAllDrivers } from '../../../api/driverApi';
import * as XLSX from 'xlsx';

const ReportFarmer = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Real data states
  const [allOrders, setAllOrders] = useState([]);
  const [orderHistoryData, setOrderHistoryData] = useState([]); // Array of { order, farmerData: [{farmerId, farmerName, amount, assignments}] }
  const [loading, setLoading] = useState(true);
  const [farmers, setFarmers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [thirdParties, setThirdParties] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, farmersRes, suppliersRes, thirdPartiesRes, driversRes] = await Promise.all([
          getAllOrders(),
          getAllFarmers(),
          getAllSuppliers(),
          getAllThirdParties(),
          getAllDrivers()
        ]);

        const fetchedFarmers = farmersRes?.data || [];
        setFarmers(fetchedFarmers);
        setSuppliers(suppliersRes?.data || []);
        setThirdParties(thirdPartiesRes?.data || []);
        setDrivers(driversRes?.data || []);

        if (ordersRes?.data) {
          const orders = ordersRes.data;

          // Sort orders by createdAt descending (newest first)
          const sortedOrders = [...orders].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          });

          setAllOrders(sortedOrders);

          // Process orders to get farmer-specific data
          await processOrdersForFarmers(sortedOrders, fetchedFarmers);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process all orders to extract farmer-specific information
  const processOrdersForFarmers = async (orders, farmersList) => {
    const processedData = [];

    for (const order of orders) {
      try {
        const assignmentRes = await getOrderAssignment(order.oid).catch(() => null);

        if (assignmentRes?.data?.product_assignments) {
          let assignments = [];
          try {
            assignments = typeof assignmentRes.data.product_assignments === 'string'
              ? JSON.parse(assignmentRes.data.product_assignments)
              : assignmentRes.data.product_assignments;
          } catch (e) {
            assignments = [];
          }

          // Group assignments by farmer
          const farmerAssignmentsMap = {};
          assignments.forEach(assignment => {
            if (assignment.entityType === 'farmer') {
              const farmerId = assignment.entityId;
              if (!farmerAssignmentsMap[farmerId]) {
                farmerAssignmentsMap[farmerId] = [];
              }
              farmerAssignmentsMap[farmerId].push(assignment);
            }
          });

          // Create farmer data array for this order
          const farmerDataArray = Object.entries(farmerAssignmentsMap).map(([farmerId, farmerAssignments]) => {
            const farmer = farmersList.find(f => f.fid == farmerId);
            const totalAmount = farmerAssignments.reduce((sum, assignment) => {
              const qty = parseFloat(assignment.assignedQty) || 0;
              const price = parseFloat(assignment.price) || 0;
              return sum + (qty * price);
            }, 0);

            return {
              farmerId,
              farmerName: farmer?.farmer_name || 'Unknown',
              farmerPhone: farmer?.phone_number || 'N/A',
              amount: totalAmount,
              assignments: farmerAssignments
            };
          });

          // Only add if there are farmer assignments
          if (farmerDataArray.length > 0) {
            processedData.push({
              order,
              farmerData: farmerDataArray
            });
          }
        }
      } catch (error) {
        console.error(`Error processing order ${order.oid}:`, error);
      }
    }

    setOrderHistoryData(processedData);
  };

  // Calculate summary statistics
  const calculateStats = () => {
    const uniqueFarmers = new Set();
    let totalOrders = 0;
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    orderHistoryData.forEach(({ order, farmerData }) => {
      farmerData.forEach(({ farmerId, amount }) => {
        uniqueFarmers.add(farmerId);
        totalOrders++;
        totalAmount += amount;

        if (order.payment_status === 'paid' || order.payment_status === 'completed') {
          paidAmount += amount;
        } else {
          pendingAmount += amount;
        }
      });
    });

    return {
      totalFarmers: uniqueFarmers.size,
      totalOrders,
      totalAmount,
      paidAmount,
      pendingAmount
    };
  };

  const stats = calculateStats();

  // Export to Excel function
  const handleExport = () => {
    // Flatten the data for export
    const flattenedData = [];
    orderHistoryData.forEach(({ order, farmerData }) => {
      farmerData.forEach(farmer => {
        const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : 'N/A';
        const products = order.items || [];
        const productNames = products.map(p => p.product_name || p.product).join(', ');
        const paymentStatus = order.payment_status === 'paid' || order.payment_status === 'completed' ? 'Paid' : 'Unpaid';

        flattenedData.push({
          'Order ID': order.oid,
          'Farmer ID': farmer.farmerId,
          'Farmer Name': farmer.farmerName,
          'Products': productNames,
          'Order Date': orderDate,
          'Amount': farmer.amount,
          'Payment Status': paymentStatus,
          'Customer Name': order.customer_name || 'N/A',
          'Phone Number': order.phone_number || 'N/A'
        });
      });
    });

    if (flattenedData.length === 0) {
      alert('No data to export');
      return;
    }

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);

    // Auto-size columns
    const columnWidths = [];
    const headers = Object.keys(flattenedData[0]);

    headers.forEach((header, idx) => {
      let maxWidth = header.length;
      flattenedData.forEach(row => {
        const value = String(row[header] || '');
        maxWidth = Math.max(maxWidth, value.length);
      });
      // Add some padding and cap at 50 characters
      columnWidths.push({ wch: Math.min(maxWidth + 2, 50) });
    });

    worksheet['!cols'] = columnWidths;

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Farmer Order History');

    // Generate Excel file and trigger download
    const fileName = `farmer_order_history_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/reports')} className="flex items-center gap-2 text-[#0D5C4D] hover:text-[#0a6354] mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Reports</span>
        </button>
        <h1 className="text-2xl font-bold text-[#0D5C4D]">Farmer Order History</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order ID, farmer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7C66] focus:border-transparent"
          />
        </div>
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0D7C66] focus:border-transparent cursor-pointer min-w-[140px]"
          >
            <option>All Time</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0D7C66] focus:border-transparent cursor-pointer min-w-[140px]"
          >
            <option>All Status</option>
            <option>Paid</option>
            <option>Unpaid</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
        <button onClick={handleExport} className="px-6 py-2.5 bg-[#1DB890] hover:bg-[#19a57e] text-white font-semibold rounded-lg text-sm transition-colors whitespace-nowrap">
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0] rounded-2xl p-6 text-[#0D5C4D]">
          <div className="text-sm font-medium mb-2 opacity-90">Total Farmers</div>
          <div className="text-4xl font-bold mb-2">{stats.totalFarmers}</div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-[#0D5C4D]">Active suppliers</div>
        </div>
        <div className="bg-gradient-to-r from-[#6EE7B7] to-[#34D399] rounded-2xl p-6 text-[#0D5C4D]">
          <div className="text-sm font-medium mb-2 opacity-90">Total Orders</div>
          <div className="text-4xl font-bold mb-2">{stats.totalOrders}</div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-[#0D5C4D]">Order entries</div>
        </div>
        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-2xl p-6 text-white">
          <div className="text-sm font-medium mb-2 opacity-90">Total Amount</div>
          <div className="text-4xl font-bold mb-2">₹{(stats.totalAmount / 1000).toFixed(1)}K</div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">Goods value</div>
        </div>
        <div className="bg-gradient-to-r from-[#047857] to-[#065F46] rounded-2xl p-6 text-white">
          <div className="text-sm font-medium mb-2 opacity-90">Pending Dues</div>
          <div className="text-4xl font-bold mb-2">₹{(stats.pendingAmount / 1000).toFixed(1)}K</div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">To be settled</div>
        </div>
      </div>

      {/* Order History Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#D4F4E8]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Farmer Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Products</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Order Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">Loading order history...</span>
                    </div>
                  </td>
                </tr>
              ) : orderHistoryData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-600">
                    No order history found
                  </td>
                </tr>
              ) : (() => {
                // Flatten the data: create one row per farmer per order
                const flattenedData = [];
                orderHistoryData.forEach(({ order, farmerData }) => {
                  farmerData.forEach(farmer => {
                    flattenedData.push({
                      order,
                      farmer
                    });
                  });
                });

                // Pagination
                const itemsPerPage = 7;
                const totalPages = Math.ceil(flattenedData.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentData = flattenedData.slice(startIndex, endIndex);

                return currentData.map((item, index) => {
                  const { order, farmer } = item;
                  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : 'N/A';
                  const products = order.items || [];
                  const displayProducts = products.slice(0, 2);
                  const remainingCount = products.length - displayProducts.length;

                  return (
                    <tr
                      key={`${order.oid}-${farmer.farmerId}-${index}`}
                      className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#B8F4D8] flex items-center justify-center text-[#0D5C4D] font-semibold text-sm">
                            {order.customer_name?.substring(0, 2).toUpperCase() || 'OR'}
                          </div>
                          <span className="text-sm font-semibold text-[#0D5C4D]">{order.oid}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-[#0D5C4D] font-semibold">{farmer.farmerName}</div>
                        <div className="text-xs text-[#6B8782]">ID: {farmer.farmerId}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {displayProducts.map((product, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D4F4E8] text-[#047857]"
                            >
                              {product.product_name || product.product}
                            </span>
                          ))}
                          {remainingCount > 0 && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D4E8FF] text-[#0066CC]">
                              +{remainingCount} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-[#0D5C4D]">{orderDate}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-[#0D5C4D]">₹{farmer.amount.toLocaleString()}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${order.payment_status === 'paid' || order.payment_status === 'completed'
                          ? 'bg-[#4ED39A] text-white'
                          : 'bg-[#FFE0E0] text-[#CC0000]'
                          }`}>
                          <div className={`w-2 h-2 rounded-full ${order.payment_status === 'paid' || order.payment_status === 'completed'
                            ? 'bg-white'
                            : 'bg-[#CC0000]'
                            }`}></div>
                          {order.payment_status === 'paid' || order.payment_status === 'completed' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/farmers/${farmer.farmerId}/orders/${order.oid}`)}
                            className="px-4 py-2 bg-[#0D8568] hover:bg-[#0a6354] text-white font-semibold rounded-lg text-xs transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB]">
          <div className="text-sm text-[#6B8782]">
            {(() => {
              // Flatten the data to count total items
              const flattenedData = [];
              orderHistoryData.forEach(({ order, farmerData }) => {
                farmerData.forEach(farmer => {
                  flattenedData.push({ order, farmer });
                });
              });

              const itemsPerPage = 7;
              const totalItems = flattenedData.length;
              const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
              const endItem = Math.min(currentPage * itemsPerPage, totalItems);
              return `Showing ${startItem}-${endItem} of ${totalItems} entries`;
            })()}
          </div>
          <div className="flex items-center gap-2">
            {(() => {
              // Flatten the data for pagination
              const flattenedData = [];
              orderHistoryData.forEach(({ order, farmerData }) => {
                farmerData.forEach(farmer => {
                  flattenedData.push({ order, farmer });
                });
              });

              const itemsPerPage = 7;
              const totalPages = Math.ceil(flattenedData.length / itemsPerPage);

              return (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg transition-colors ${currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#6B8782] hover:bg-[#D0E0DB]'
                      }`}
                  >
                    &lt;
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    const showPage = page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    const showEllipsis = (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 && currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return (
                        <button key={page} className="px-3 py-2 text-[#6B8782]">
                          ...
                        </button>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                          ? 'bg-[#0D8568] text-white'
                          : 'text-[#6B8782] hover:bg-[#D0E0DB]'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg transition-colors ${currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#6B8782] hover:bg-[#D0E0DB]'
                      }`}
                  >
                    &gt;
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFarmer;