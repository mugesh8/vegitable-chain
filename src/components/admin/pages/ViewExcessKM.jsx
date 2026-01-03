import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getExcessKMById } from '../../../api/excessKmApi';
import toast from 'react-hot-toast';

const ViewExcessKM = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [kmData, setKmData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExcessKM();
  }, [id]);

  const fetchExcessKM = async () => {
    try {
      setLoading(true);
      const response = await getExcessKMById(id);
      setKmData(response.data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch excess KM details');
      navigate('/excess-km-management');
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Excess KM Details</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : kmData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date</label>
                <div className="text-sm font-medium text-gray-900">{kmData.date}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Driver Name</label>
                <div className="text-sm font-medium text-gray-900">{kmData.driver?.driver_name || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Vehicle Number</label>
                <div className="text-sm font-medium text-gray-900">{kmData.vehicle_number || kmData.driver?.vehicle_number || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Start KM</label>
                <div className="text-sm font-medium text-gray-900">{kmData.start_km} km</div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">End KM</label>
                <div className="text-sm font-medium text-gray-900">{kmData.end_km} km</div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Total Kilometers</label>
                <div className="text-sm font-medium text-gray-900">{kmData.kilometers} km</div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Amount</label>
                <div className="text-lg font-bold text-[#0D7C66]">₹{parseFloat(kmData.amount).toFixed(2)}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No data found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewExcessKM;
