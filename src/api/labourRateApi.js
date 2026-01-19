import api from './axiosConfig';

export const getAllLabourRates = async () => {
    try {
        // Return mock data matching LabourRateManagement.jsx state until backend is ready
        return [
            { id: 1, labourType: 'Normal', amount: 500, status: 'Active' },
            { id: 2, labourType: 'Medium', amount: 750, status: 'Active' },
            { id: 3, labourType: 'Heavy', amount: 1000, status: 'Active' },
        ];
        // Once backend is ready:
        // const response = await api.get('/labour-rate/list');
        // return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
