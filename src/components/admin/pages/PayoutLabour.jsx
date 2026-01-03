import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const LabourPayoutManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('labour');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const stats = [
    { label: 'Total Payouts', value: '₹86,500', change: '+12%' },
    { label: 'Average Daily Wage', value: '₹500', change: '+8%' },
    { label: 'Paid This Month', value: '₹12.4 L', change: '24 Labour' },
    { label: 'Total Active Labour', value: '45', change: '156 Transactions' }
  ];

  const labourPayouts = [
    {
      labourName: 'Rajesh Kumar',
      attendance: '96%',
      labourId: 'LAB-001',
      daysWorked: '24 days',
      wageRate: '₹500/day',
      advance: '-₹2,000',
      netAmount: '₹10,000',
      status: 'Pending',
      action: 'Pay'
    },
    {
      labourName: 'Suresh Patel',
      attendance: '100%',
      labourId: 'LAB-012',
      daysWorked: '26 days',
      wageRate: '₹450/day',
      advance: '₹0',
      netAmount: '₹11,700',
      status: 'Paid',
      action: 'View'
    },
    {
      labourName: 'Amit Singh',
      attendance: '92%',
      labourId: 'LAB-018',
      daysWorked: '22 days',
      wageRate: '₹480/day',
      advance: '-₹1,500',
      netAmount: '₹9,060',
      status: 'Pending',
      action: 'Pay'
    },
    {
      labourName: 'Prakash Yadav',
      attendance: '88%',
      labourId: 'LAB-024',
      daysWorked: '20 days',
      wageRate: '₹470/day',
      advance: '-₹800',
      netAmount: '₹8,600',
      status: 'Pending',
      action: 'Pay'
    },
    {
      labourName: 'Dinesh Verma',
      attendance: '100%',
      labourId: 'LAB-031',
      daysWorked: '26 days',
      wageRate: '₹520/day',
      advance: '₹0',
      netAmount: '₹13,520',
      status: 'Paid',
      action: 'View'
    }
  ];

  const getStatusColor = (status) => {
    return status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700';
  };

  const getActionButton = (action) => {
    if (action === 'Pay') {
      return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    }
    return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => navigate('/payouts')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Farmer Payout
          </button>
          <button
            onClick={() => setActiveTab('labour')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-[#0D7C66] text-white shadow-md"
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
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                index === 2 || index === 3 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/60 text-[#0D5C4D]'
              }`}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D0E0DB] p-4 mb-6">
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

        {/* Labour Payouts Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D4F4E8]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Labour Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Labour ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Days Worked
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Wage Rate
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Advance
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">
                    Net Amount
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
                {labourPayouts.map((payout, index) => (
                  <tr key={index} className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#0D5C4D] text-sm">{payout.labourName}</div>
                      <div className="text-xs text-[#6B8782]">Attendance: {payout.attendance}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#0D5C4D]">{payout.labourId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#0D5C4D]">{payout.daysWorked}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#0D5C4D]">{payout.wageRate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-bold ${payout.advance === '₹0' ? 'text-[#0D5C4D]' : 'text-red-600'}`}>
                        {payout.advance}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#0D5C4D]">{payout.netAmount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className={`px-6 py-2 rounded-lg text-xs font-semibold transition-colors ${getActionButton(payout.action)}`}>
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
              Showing 5 of 45 Labour
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
  );
};

export default LabourPayoutManagement;