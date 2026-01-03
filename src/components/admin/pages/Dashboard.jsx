import React, { useState, useEffect } from 'react';
import { TrendingUp, Check, Package as PackageIcon, DollarSign } from 'lucide-react';
import { getAllFarmers } from '../../../api/farmerApi';
import { getAllDrivers } from '../../../api/driverApi';
import { getAllLabours } from '../../../api/labourApi';

const Dashboard = () => {
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [totalLabours, setTotalLabours] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [farmersRes, driversRes, laboursRes] = await Promise.all([
          getAllFarmers(),
          getAllDrivers(),
          getAllLabours()
        ]);
        console.log('Drivers response:', driversRes);
        setTotalFarmers(farmersRes.data?.length || 0);
        const drivers = driversRes.data || [];
        const activeCount = drivers.filter(d => d.status?.toLowerCase() === 'active').length;
        console.log('Active drivers count:', activeCount);
        setActiveDrivers(activeCount);
        setTotalLabours(laboursRes.data?.length || 0);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Stats data
  const stats = [
    {
      title: 'Total Farmers',
      value: totalFarmers.toString(),
      bgColor: 'bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0]',
      textColor: 'text-[#0D5C4D]'
    },
    {
      title: 'Active Drivers',
      value: activeDrivers.toString(),
      bgColor: 'bg-gradient-to-r from-[#6EE7B7] to-[#34D399]',
      textColor: 'text-[#0D5C4D]'
    },
    {
      title: 'Total Orders',
      value: '1,847',
      bgColor: 'bg-gradient-to-r from-[#10B981] to-[#059669]',
      textColor: 'text-white'
    },
    {
      title: 'Total Labours',
      value: totalLabours.toString(),
      bgColor: 'bg-gradient-to-r from-[#047857] to-[#065F46]',
      textColor: 'text-white'
    }
  ];

  // Daily summary data
  const dailySummary = [
    { icon: PackageIcon, label: 'Total Orders Today', value: '124', color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { icon: Check, label: 'Deliveries Completed', value: '98', color: 'bg-green-100', iconColor: 'text-green-600' },
    { icon: PackageIcon, label: 'Pending Collections', value: '26', color: 'bg-orange-100', iconColor: 'text-orange-600' },
    { icon: DollarSign, label: 'Total Payouts', value: '18', color: 'bg-blue-100', iconColor: 'text-blue-600' }
  ];

  // Payout analytics data
  const payoutData = [
    { day: 'Mon', amount: 41, label: '41K' },
    { day: 'Tue', amount: 44.52, label: '₹4.52L' },
    { day: 'Wed', amount: 52, label: '52K' },
    { day: 'Thu', amount: 75, label: '75K' },
    { day: 'Fri', amount: 68, label: '68K' },
    { day: 'Sat', amount: 52, label: '52K' },
    { day: 'Sun', amount: 72, label: '72K' }
  ];

  // Delivery count data
  const deliveryData = [
    { day: 'Day 1', driver: 65, packaging: 0 },
    { day: 'Day 2', driver: 72, packaging: 0 },
    { day: 'Day 3', driver: 58, packaging: 0 },
    { day: 'Day 4', driver: 68, packaging: 0 },
    { day: 'Day 5', driver: 78, packaging: 0 },
    { day: 'Day 6', driver: 92, packaging: 0 },
    { day: 'Day 7', driver: 68, packaging: 0 },
    { day: 'Day 8', driver: 75, packaging: 0 },
    { day: 'Day 9', driver: 68, packaging: 0 },
    { day: 'Day 10', driver: 95, packaging: 0 }
  ];

  const maxDelivery = Math.max(...deliveryData.map(d => d.driver));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          Welcome back, Admin! <span className="text-3xl sm:text-4xl">👋</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500">Here's what's happening with your supply chain today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-2xl p-6 shadow-sm`}>
            <div className={`text-sm font-medium mb-2 opacity-90 ${stat.textColor}`}>
              {stat.title}
            </div>
            <div className={`text-4xl font-bold ${stat.textColor}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Daily Summary */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">Daily Summary</h3>
            <p className="text-xs sm:text-sm text-gray-500">Real-time operational overview</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {dailySummary.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className={`${item.color} rounded-lg sm:rounded-xl p-3 sm:p-4`}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{item.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Vegetable Quantities */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">Total Vegetable Quantities</h3>
              <p className="text-xs sm:text-sm text-gray-500">Weekly stock levels (in kg)</p>
            </div>
            <div className="bg-green-100 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm">
              2,459 kg
            </div>
          </div>
          <div className="h-40 sm:h-48 flex items-end justify-between gap-2">
            {/* Simple line chart representation */}
            <svg className="w-full h-full" viewBox="0 0 600 180">
              <polyline
                points="0,120 100,100 200,80 300,90 400,60 500,70 600,40"
                fill="none"
                stroke="#0D7C66"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Data points */}
              {[
                [0, 120], [100, 100], [200, 80], [300, 90], [400, 60], [500, 70], [600, 40]
              ].map((point, i) => (
                <circle
                  key={i}
                  cx={point[0]}
                  cy={point[1]}
                  r="6"
                  fill="#0D7C66"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-3 sm:mt-4">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Payout Analytics */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">Payout Analytics</h3>
            <p className="text-xs sm:text-sm text-gray-500">Weekly payout distribution (₹)</p>
          </div>
          <div className="h-48 sm:h-64 flex items-end justify-between gap-2 sm:gap-3 px-1 sm:px-2">
            {payoutData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                  <span className="text-[10px] sm:text-xs font-semibold text-purple-600 mb-1">{item.label}</span>
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg"
                    style={{ height: `${(item.amount / 75) * 100}%`, minHeight: '40px' }}
                  ></div>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 mt-2 font-medium">{item.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 sm:mt-6 text-center">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Total Week: </span>
            <span className="text-xs sm:text-sm font-bold text-purple-600">₹4.52L</span>
          </div>
        </div>

        {/* Delivery Count */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Delivery Count</h3>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#0D7C66] rounded"></div>
                <span className="text-xs sm:text-sm text-gray-600">Driver</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-200 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-600">Packaging</span>
              </div>
            </div>
          </div>
          <div className="h-48 sm:h-64">
            <div className="h-full flex items-end justify-between gap-1 sm:gap-2">
              {deliveryData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center h-full justify-end">
                  <div className="w-full relative flex flex-col items-center justify-end" style={{ height: '100%' }}>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">{item.driver}</span>
                    <div
                      className="w-full bg-[#0D7C66] rounded-t"
                      style={{ height: `${(item.driver / maxDelivery) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;