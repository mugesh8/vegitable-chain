import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const PayoutManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('farmer');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const stats = [
    { label: 'Total Payouts', value: '86' },
    { label: 'Pending Payouts', value: '72' },
    { label: 'Paid This Month', value: '₹12.4 L' },
    { label: 'Average Payout', value: '₹2.8 L' }
  ];

  const payouts = [
    {
      farmerName: 'Green Fields Farm',
      lastSupplied: 'Nov 4',
      vendorId: 'VEN-001',
      quantity: '450 kg',
      amount: '₹12,450',
      paymentMode: 'Bank',
      status: 'Pending',
      action: 'Pay'
    },
    {
      farmerName: 'Sunrise Organics',
      lastSupplied: 'Nov 5',
      vendorId: 'VEN-015',
      quantity: '320 kg',
      amount: '₹8,960',
      paymentMode: 'Cash',
      status: 'Paid',
      action: 'View'
    },
    {
      farmerName: 'Fresh Valley Produce',
      lastSupplied: 'Nov 3',
      vendorId: 'VEN-023',
      quantity: '580 kg',
      amount: '₹15,950',
      paymentMode: 'Bank',
      status: 'Pending',
      action: 'Pay'
    },
    {
      farmerName: "Nature's Best Farm",
      lastSupplied: 'Nov 2',
      vendorId: 'VEN-037',
      quantity: '275 kg',
      amount: '₹7,920',
      paymentMode: 'Cash',
      status: 'Pending',
      action: 'Pay'
    }
  ];

  const getPaymentModeColor = (mode) => {
    return mode === 'Bank' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700';
  };

  const getStatusColor = (status) => {
    return status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700';
  };

  const getActionButton = (action, status) => {
    if (action === 'Pay') {
      return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    }
    return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('farmer')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
              activeTab === 'farmer'
                ? 'bg-[#0D7C66] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Farmer Payout
          </button>
          <button
            onClick={() => navigate('/payout-labour')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Labour Payout
          </button>
          <button
            onClick={() => navigate('/payout-driver')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Driver Payout
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`${
                index === 0 ? 'bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0]' :
                index === 1 ? 'bg-gradient-to-r from-[#6EE7B7] to-[#34D399]' :
                index === 2 ? 'bg-gradient-to-r from-[#10B981] to-[#059669]' :
                'bg-gradient-to-r from-[#047857] to-[#065F46]'
              } rounded-2xl p-6 ${
                index === 2 || index === 3 ? 'text-white' : 'text-[#0D5C4D]'
              }`}
            >
              <div className="text-sm font-medium mb-2 opacity-90">{stat.label}</div>
              <div className="text-4xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, farmer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-gray-50"
              />
            </div>

            {/* Filter Button */}
            <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 hover:bg-gray-50 text-gray-700 text-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {/* Export Button */}
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D4F4E8]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Farmer Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Vendor ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Quantity Supplied
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Payment Mode
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout, index) => (
                  <tr key={index} className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#0D5C4D] text-sm">{payout.farmerName}</div>
                      <div className="text-xs text-[#6B8782]">Last supplied: {payout.lastSupplied}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#0D5C4D]">{payout.vendorId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#0D5C4D]">{payout.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#0D5C4D]">{payout.amount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium ${getPaymentModeColor(payout.paymentMode)}`}>
                        {payout.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className={`px-6 py-2 rounded-lg text-xs font-semibold transition-colors ${getActionButton(payout.action, payout.status)}`}>
                        {payout.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>



          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB]">
            <div className="text-sm text-[#6B8782]">
              Showing 4 of 248 Farmers
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">
                &lt;
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors bg-[#0D8568] text-white">
                1
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors text-[#6B8782] hover:bg-[#D0E0DB]">
                2
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors text-[#6B8782] hover:bg-[#D0E0DB]">
                3
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors text-[#6B8782] hover:bg-[#D0E0DB]">
                4
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors text-[#6B8782] hover:bg-[#D0E0DB]">
                5
              </button>
              <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">
                ...
              </button>
              <button className="px-4 py-2 rounded-lg font-medium transition-colors text-[#6B8782] hover:bg-[#D0E0DB]">
                10
              </button>
              <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutManagement;