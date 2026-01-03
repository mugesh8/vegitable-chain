import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, FileText, Users, Wallet, Briefcase, FileBarChart, Download } from 'lucide-react';

const ReportManagement = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('');
  const [reportType, setReportType] = useState('');

  const reportCards = [
    {
      title: 'Orders Report',
      description: 'Summary by date, client, and status',
      metric: 'Total Orders: 142',
      link: 'View Report →',
      icon: FileText,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      path: '/reports/order'
    },
    {
      title: 'Farmer Report',
      description: 'Supply quantity, payout, pending dues',
      metric: 'Active Farmers: 48',
      link: 'View Report →',
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
      path: '/reports/farmer'
    },
    {
      title: 'Payout Report',
      description: 'For farmers, labour, and drivers',
      metric: 'Total Payouts: ₹8,45,000',
      link: 'View Report →',
      icon: Wallet,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
      path: '/reports/payout'
    },
    {
      title: 'Labour Report',
      description: 'Attendance and wage details',
      metric: 'Total Labourers: 124',
      link: 'View Report →',
      icon: Briefcase,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      path: '/reports/labour'
    },
    {
      title: 'Invoice Report',
      description: 'Auto-generated for all orders',
      metric: 'Total Invoices: 142',
      link: 'View Report →',
      icon: FileBarChart,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-500',
      path: '/reports/invoice'
    }
  ];

  const statistics = [
    {
      value: '₹78,090',
      label: 'Total Goods Value',
      sublabel: 'October Shipments',
      bgColor: 'bg-emerald-200'
    },
    {
      value: '₹4,980',
      label: 'Total Expenses',
      sublabel: 'October Shipments',
      bgColor: 'bg-emerald-300'
    },
    {
      value: '78 PCS',
      label: 'Total Shipments',
      sublabel: 'Across all airports',
      bgColor: 'bg-emerald-400'
    },
    {
      value: '750 KG',
      label: 'Net Weight',
      sublabel: 'Total transported',
      bgColor: 'bg-emerald-600'
    },
    {
      value: '824 KG',
      label: 'Gross Weight',
      sublabel: 'Including packaging',
      bgColor: 'bg-emerald-700'
    }
  ];

  const recentActivity = [
    {
      title: 'Orders Report generated',
      timestamp: '2 hours ago by Admin',
      color: 'bg-emerald-500'
    },
    {
      title: 'Farmer Payout Report exported',
      timestamp: '5 hours ago by Finance Team',
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1">
          <div className="relative">
            <button className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                <span className="text-gray-500 text-sm">Date Range</span>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="relative">
            <button className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:border-gray-300 transition-colors">
              <span className="text-gray-500 text-sm">Report Type</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="md:col-span-1 flex justify-end">
          <button className="w-full md:w-auto bg-white border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {reportCards.map((card, index) => (
          <div 
            key={index} 
            onClick={() => navigate(card.path)}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer hover:border-emerald-200"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{card.metric}</span>
              <span className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                {card.link}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statistics.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6 text-white`}>
              <div className="text-2xl md:text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm font-medium opacity-90 mb-1">{stat.label}</div>
              <div className="text-xs opacity-75">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Report Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Report Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${activity.color}`}></div>
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 text-sm font-medium">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;