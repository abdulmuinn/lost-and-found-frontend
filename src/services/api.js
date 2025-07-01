import axios from 'axios';

// URL dasar dari server backend Anda
//const API_URL = 'lost-found-backend-production.up.railway.app/api';
const API_URL = 'http://localhost:5000/api';

// Membuat instance axios
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- FUNGSI AUTENTIKASI ---
export const registerUser = (userData) => {
  return api.post('/auth/register', userData);
};

export const loginUser = (credentials) => {
  return api.post('/auth/login', credentials);
};

// --- FUNGSI BARANG ---
export const getItems = (params) => {
    return api.get('/items', { params });
};

export const getItemById = (id) => {
    return api.get(`/items/${id}`);
};

export const reportItem = (formData) => {
    return api.post('/items/report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const claimItemById = (id, claimData) => {
    return api.post(`/items/${id}/claim`, claimData);
};


// --- FUNGSI ADMIN ---
export const getAdminClaims = () => {
    return api.get('/admin/claims');
};

export const verifyAdminClaim = (claimId, approvalStatus) => {
    return api.put(`/admin/claims/${claimId}/verify`, { isApproved: approvalStatus });
};

export const addFoundItemByAdmin = (formData) => {
    return api.post('/admin/items/add-found', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// --- FUNGSI PROFIL PENGGUNA ---
export const getMyActivity = () => {
    return api.get('/users/my-activity');
};

// --- FUNGSI DATA MASTER (KATEGORI & LOKASI) ---
export const getLokasi = () => {
    return api.get('/data/lokasi');
};

export const getKategori = () => {
    return api.get('/data/kategori');
};

export const addKategori = (data) => {
    return api.post('/admin/kategori', data);
};

export const deleteKategori = (id) => {
    return api.delete(`/admin/kategori/${id}`);
};

export const addLokasi = (data) => {
    return api.post('/admin/lokasi', data);
};

export const deleteLokasi = (id) => {
    return api.delete(`/admin/lokasi/${id}`);
};

export const markAsFoundByAdmin = (id) => {
  return api.put(`/admin/items/${id}/mark-found`);
};

export default api;
