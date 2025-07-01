import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api'; // Impor fungsi API

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Coba ambil data user dari localStorage saat pertama kali load
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    // Fungsi login baru yang memanggil API
    const login = async (email, password) => {
        try {
            const response = await loginUser({ email, password });
            const { token, user: userData } = response.data;

            // Simpan token dan data user ke localStorage & state
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setToken(token);
            setUser(userData);

            return { success: true };
        } catch (error) {
            // Mengambil pesan error dari backend
            const message = error.response?.data?.message || "Login gagal.";
            return { success: false, message };
        }
    };

    // Fungsi register baru yang memanggil API
    const register = async (userData) => {
        try {
            await registerUser(userData);
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || "Registrasi gagal.";
            return { success: false, message };
        }
    };

    // Fungsi logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);