import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import ConfirmDeleteModal from '../../common/ConfirmDeleteModal';
import { getAllDrivers, deleteDriver } from '../../../api/driverApi';

const DriverManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, driverId: null, driverName: '' });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch drivers from API
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await getAllDrivers();
      // console.log('Driver list response:', response);
      
      // Check if response has data property
      const driversData = response.data || response;
      // console.log('Drivers data:', driversData);
      
      // Log the raw driver data to understand ID formats
      // console.log('Raw driver data:', driversData);
      
      // Transform API response to match existing data structure
      const transformedDrivers = driversData.map(driver => {
        // console.log('Processing driver:', driver);
        // Log all possible ID fields
        // console.log('Possible ID fields:', {
        //   driver_id: driver.driver_id,
        //   id: driver.id,
        //   did: driver.did,
        //   _id: driver._id
        // });
        
        return {
          id: driver.did || driver.driver_id || driver.id || driver._id,
          name: driver.driver_name || driver.name,
          phone: driver.phone_number || driver.phone,
          initial: (driver.driver_name || driver.name) ? (driver.driver_name || driver.name).split(' ').map(n => n[0]).join('').toUpperCase() : 'D',
          color: 'bg-teal-700',
          profileImage: driver.driver_image,
          vehicle: { 
            name: driver.vehicle_type || driver.vehicleType, 
            number: driver.vehicle_number || driver.vehicleNumber, 
            capacity: driver.capacity 
          },
          deliveryType: driver.delivery_type || driver.deliveryType,
          status: driver.status,
          workingHours: driver.working_hours ? `${driver.working_hours} hrs` : '0 hrs'
        };
      });
      // console.log('Transformed drivers:', transformedDrivers);
      setDrivers(transformedDrivers);
      setError(null);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to load drivers');
      // Fallback to hardcoded data if API fails
      setDrivers([
        {
          id: 'DRV-001',
          name: 'Rajesh Pandey',
          phone: '+91 98765 43210',
          initial: 'RP',
          color: 'bg-teal-700',
          vehicle: { name: 'Tata Ace', number: 'TN 01 AB 1234', capacity: '1 Ton' },
          deliveryType: 'Local Pickup',
          status: 'Available',
          workingHours: '8.5 hrs'
        },
        {
          id: 'DRV-002',
          name: 'Suresh Kumar',
          phone: '+91 98765 43211',
          initial: 'SK',
          color: 'bg-teal-700',
          vehicle: { name: 'Mahindra Bolero', number: 'TN 02 CD 9876', capacity: '1.5 Ton' },
          deliveryType: 'Line Airport',
          status: 'On Trip',
          workingHours: '6.0 hrs'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const toggleDropdown = (driverId, event) => {
    if (openDropdown === driverId) {
      setOpenDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 128 // 128px is dropdown width (w-32)
      });
      setOpenDropdown(driverId);
    }
  };

  const handleAction = (action, driverId, driverName) => {
    // console.log('Handle action:', action, 'Driver ID:', driverId, 'Driver Name:', driverName);
    if (action === 'view') {
      navigate(`/drivers/${driverId}`);
    } else if (action === 'edit') {
      // console.log('Navigating to edit driver with ID:', driverId);
      // Check if driverId is valid
      if (!driverId) {
        console.error('Invalid driver ID:', driverId);
        return;
      }
      navigate(`/drivers/${driverId}/edit`);
    } else if (action === 'delete') {
      setDeleteModal({ isOpen: true, driverId, driverName });
    }
    setOpenDropdown(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-700';
      case 'On Trip':
        return 'bg-blue-100 text-blue-700';
      case 'Break':
        return 'bg-amber-100 text-amber-700';
      case 'Inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500';
      case 'On Trip':
        return 'bg-blue-500';
      case 'Break':
        return 'bg-amber-500';
      case 'Inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDeliveryTypeColor = (type) => {
    switch (type) {
      case 'Local Pickup':
        return 'bg-blue-100 text-blue-700';
      case 'Line Airport':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${activeTab === 'all' ? 'bg-[#0D7C66] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >
            All Drivers
          </button>
          <button
            onClick={() => navigate('/drivers/attendance')}
            className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Attendance
          </button>
        </div>

        <button 
          onClick={() => navigate('/drivers/add')}
          className="px-5 py-2.5 bg-[#0D7C66] hover:bg-[#0a6354] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-gray-600">Loading drivers...</div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {/* Search and Filters */}
      {!loading && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-[#D0E0DB] p-4 mb-6">
            <div className="flex flex-col gap-4">
              <div className="w-full relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B8782]" />
                <input
                  type="text"
                  placeholder="Search driver by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#D0E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D8568] focus:border-transparent text-sm bg-[#F0F4F3]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 min-w-0">
                  <div className="text-xs text-[#6B8782] mb-1 font-medium">Status: {statusFilter}</div>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-[#D0E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D8568] focus:border-transparent appearance-none bg-white text-sm font-medium text-[#0D5C4D] cursor-pointer"
                    >
                      <option>All</option>
                      <option>Available</option>
                      <option>On Trip</option>
                      <option>Break</option>
                      <option>Inactive</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B8782] pointer-events-none" />
                  </div>
                </div>

                <div className="relative flex-1 min-w-0">
                  <div className="text-xs text-[#6B8782] mb-1 font-medium">Vehicle: {vehicleFilter}</div>
                  <div className="relative">
                    <select
                      value={vehicleFilter}
                      onChange={(e) => setVehicleFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-[#D0E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D8568] focus:border-transparent appearance-none bg-white text-sm font-medium text-[#0D5C4D] cursor-pointer"
                    >
                      <option>All</option>
                      <option>Tata Ace</option>
                      <option>Mahindra Bolero</option>
                      <option>Ashok Leyland</option>
                      <option>Eicher Pro</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B8782] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drivers Table */}
          <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#D4F4E8]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Driver Info</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Contact Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Vehicle Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Delivery Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver, index) => (
                    <tr key={index} className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {driver.profileImage ? (
                            <img 
                              src={`${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${driver.profileImage}`} 
                              alt={driver.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-10 h-10 rounded-full bg-[#B8F4D8] flex items-center justify-center text-[#0D5C4D] font-semibold text-sm" style={{ display: driver.profileImage ? 'none' : 'flex' }}>
                            {driver.initial}
                          </div>
                          <div>
                            <div className="font-semibold text-[#0D5C4D]">{driver.name}</div>
                            {/* <div className="text-xs text-[#6B8782]">{driver.id}</div> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#0D5C4D]">{driver.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#0D5C4D]">{driver.vehicle.name}</div>
                        <div className="text-xs text-[#6B8782]">{driver.vehicle.number} • {driver.vehicle.capacity}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getDeliveryTypeColor(driver.deliveryType)}`}>
                          {driver.deliveryType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(driver.status)}`}>
                          <div className={`w-2 h-2 rounded-full ${getStatusDot(driver.status)}`}></div>
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative dropdown-container">
                          <button
                            onClick={(event) => toggleDropdown(driver.id, event)}
                            className="text-[#6B8782] hover:text-[#0D5C4D] transition-colors p-1 hover:bg-[#F0F4F3] rounded"
                          >
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB]">
              <div className="text-sm text-[#6B8782]">
                Showing {drivers.length} of {drivers.length} drivers
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">
                  &lt;
                </button>
                <button className="px-4 py-2 rounded-lg font-medium transition-colors bg-[#0D8568] text-white">
                  1
                </button>
                <button className="px-3 py-2 text-[#6B8782] hover:bg-[#D0E0DB] rounded-lg transition-colors">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dropdown Menu - Fixed Position Outside Table */}
      {openDropdown && (
        <div 
          ref={dropdownRef}
          className="fixed w-32 bg-white rounded-lg shadow-lg border border-[#D0E0DB] py-1 z-[100]"
          style={{ 
            top: `${dropdownPosition.top}px`, 
            left: `${dropdownPosition.left}px` 
          }}
        >
          <button
            onClick={() => handleAction('view', openDropdown)}
            className="w-full text-left px-4 py-2 text-sm text-[#0D5C4D] hover:bg-[#F0F4F3] transition-colors flex items-center gap-2"
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => handleAction('edit', openDropdown)}
            className="w-full text-left px-4 py-2 text-sm text-[#0D5C4D] hover:bg-[#F0F4F3] transition-colors flex items-center gap-2"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => handleAction('delete', openDropdown, 
              drivers.find(d => d.id === openDropdown)?.name)}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#F0F4F3] transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, driverId: null, driverName: '' })}
        onConfirm={async () => {
          try {
            await deleteDriver(deleteModal.driverId);
            // Refresh the drivers list after deletion
            await fetchDrivers();
            setDeleteModal({ isOpen: false, driverId: null, driverName: '' });
          } catch (error) {
            console.error('Failed to delete driver:', error);
            setDeleteModal({ isOpen: false, driverId: null, driverName: '' });
          }
        }}
        title="Delete Driver"
        message={`Are you sure you want to delete ${deleteModal.driverName}? This action cannot be undone.`}
      />
    </div>
  );
};

export default DriverManagement;
