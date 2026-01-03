import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ReportPayout = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Payouts', value: '548', change: '+22%', color: 'bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0]' },
    { label: 'Completed', value: '512', change: '93%', color: 'bg-gradient-to-r from-[#6EE7B7] to-[#34D399]' },
    { label: 'Total Amount', value: '₹12.8 L', change: 'This Month', color: 'bg-gradient-to-r from-[#10B981] to-[#059669]' },
    { label: 'Pending', value: '₹1.2 L', change: '36 Payouts', color: 'bg-gradient-to-r from-[#047857] to-[#065F46]' }
  ];

  const payouts = [
    { id: 'PAY-001', recipient: 'Green Fields Farm', type: 'Farmer', amount: '₹45,000', date: '2024-01-15', status: 'Completed' },
    { id: 'PAY-002', recipient: 'Ravi Kumar', type: 'Labour', amount: '₹18,000', date: '2024-01-16', status: 'Pending' },
    { id: 'PAY-003', recipient: 'Rajesh Pandey', type: 'Driver', amount: '₹12,500', date: '2024-01-17', status: 'Completed' }
  ];

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
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Payout ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Recipient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout, index) => (
                <tr key={index} className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'}`}>
                  <td className="px-6 py-4 text-sm text-[#0D5C4D]">{payout.id}</td>
                  <td className="px-6 py-4 font-semibold text-[#0D5C4D]">{payout.recipient}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D4F4E8] text-[#047857]">{payout.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#0D5C4D]">{payout.amount}</td>
                  <td className="px-6 py-4 text-sm text-[#0D5C4D]">{payout.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${payout.status === 'Completed' ? 'bg-[#4ED39A] text-white' : 'bg-red-500 text-white'}`}>
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      {payout.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB]">
          <div className="text-sm text-[#6B8782]">Showing 3 of 548 payouts</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">&lt;</button>
            <button className="px-4 py-2 rounded-lg font-medium bg-[#0D8568] text-white">1</button>
            <button className="px-4 py-2 rounded-lg font-medium text-[#6B8782] hover:bg-[#D0E0DB]">2</button>
            <button className="px-4 py-2 rounded-lg font-medium text-[#6B8782] hover:bg-[#D0E0DB]">3</button>
            <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">...</button>
            <button className="px-4 py-2 rounded-lg font-medium text-[#6B8782] hover:bg-[#D0E0DB]">10</button>
            <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPayout;
