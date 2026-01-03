import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getExcessKMById, updateExcessKM } from '../../../api/excessKmApi';
import { getDriverById, getAllDrivers } from '../../../api/driverApi';
import toast from 'react-hot-toast';

const EditExcessKM = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    driver_id: '',
    date: '',
    vehicle_number: '',
    start_km: '',
    end_km: '',
    amount: ''
  });

  useEffect(() => {
    fetchExcessKM();
    fetchVehicles();
  }, [id]);

  const fetchVehicles = async () => {
    try {
      const response = await getAllDrivers();
      const vehicleNumbers = response.data.map(d => d.vehicle_number).filter(Boolean);
      setVehicles([...new Set(vehicleNumbers)]);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    }
  };

  const fetchExcessKM = async () => {
    try {
      setLoading(true);
      const response = await getExcessKMById(id);
      const data = response.data;
      setFormData({
        driver_id: data.driver_id,
        date: data.date,
        vehicle_number: data.vehicle_number || data.driver?.vehicle_number || '',
        start_km: data.start_km,
        end_km: data.end_km,
        amount: data.amount
      });
      
      if (data.driver_id) {
        const driverResponse = await getDriverById(data.driver_id);
        setDriver(driverResponse.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch excess KM details');
      navigate('/excess-km-management');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateExcessKM(id, formData);
      toast.success('Excess KM record updated successfully');
      navigate('/excess-km-management');
    } catch (error) {
      toast.error(error.message || 'Failed to update excess KM record');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/excess-km-management')}
            className="flex items-center gap-2 text-[#0D5C4D] hover:text-[#0a6354] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Excess KM</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Excess KM</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
                  <input
                    type="text"
                    value={driver?.driver_name || ''}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                  <select
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    value={formData.start_km}
                    onChange={(e) => setFormData({ ...formData, start_km: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End KM</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.end_km}
                    onChange={(e) => setFormData({ ...formData, end_km: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/excess-km-management')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Update
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditExcessKM;
