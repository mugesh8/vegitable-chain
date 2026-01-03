import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createExcessKM } from '../../../api/excessKmApi';
import { getDriverById, getAllDrivers } from '../../../api/driverApi';
import toast from 'react-hot-toast';

const AddExcessKM = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [excessData, setExcessData] = useState({
    driver_id: id,
    date: new Date().toISOString().split('T')[0],
    vehicle_number: '',
    start_km: '',
    end_km: '',
    amount: ''
  });

  useEffect(() => {
    if (id) {
      fetchDriver();
      fetchVehicles();
    }
  }, [id]);

  const fetchDriver = async () => {
    try {
      const response = await getDriverById(id);
      const driverData = response.data;
      setDriver(driverData);
      setExcessData(prev => ({
        ...prev,
        driver_id: driverData.did,
        vehicle_number: driverData.vehicle_number
      }));
    } catch (error) {
      toast.error('Failed to fetch driver');
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await getAllDrivers();
      const vehicleNumbers = response.data.map(d => d.vehicle_number).filter(Boolean);
      setVehicles([...new Set(vehicleNumbers)]);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExcessKM(excessData);
      toast.success('Excess KM record created successfully');
      navigate('/excess-km-management');
    } catch (error) {
      toast.error(error.message || 'Failed to create excess KM record');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/excess-km-management`)}
            className="flex items-center gap-2 text-[#0D5C4D] hover:text-[#0a6354] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Excess KM</span>
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Excess KM</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={excessData.date}
                onChange={(e) => setExcessData({ ...excessData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
              <input
                type="text"
                value={driver?.driver_name || ''}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
              <select
                value={excessData.vehicle_number}
                onChange={(e) => setExcessData({ ...excessData, vehicle_number: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle, index) => (
                  <option key={index} value={vehicle}>
                    {vehicle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start KM</label>
              <input
                type="number"
                step="0.01"
                value={excessData.start_km}
                onChange={(e) => setExcessData({ ...excessData, start_km: e.target.value })}
                placeholder="Enter start kilometers"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End KM</label>
              <input
                type="number"
                step="0.01"
                value={excessData.end_km}
                onChange={(e) => setExcessData({ ...excessData, end_km: e.target.value })}
                placeholder="Enter end kilometers"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={excessData.amount}
                onChange={(e) => setExcessData({ ...excessData, amount: e.target.value })}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/excess-km-management')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExcessKM;