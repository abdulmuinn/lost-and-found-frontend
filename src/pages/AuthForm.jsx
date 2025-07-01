import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Key, User, Phone, FileText } from 'lucide-react';
import styles from './AuthForm.module.css';

const InputGroup = ({ icon, ...props }) => (
    <div className={styles.inputGroup}>
        <div className={styles.inputIcon}>
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <input {...props} className={styles.inputField} />
    </div>
);

const AuthForm = ({ isLogin, setPage }) => {
    // ... (Logika state dan fungsi tidak berubah)
    const { login, register } = useAuth();
    const [formData, setFormData] = useState({ nama: '', email: '', no_telp: '', password: '', nik: '' });
    const [error, setError] = useState('');
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = isLogin ? await login(formData.email, formData.password) : await register(formData);
        if (result.success) {
            if (!isLogin) {
                alert('Registrasi berhasil! Silakan login.');
                setPage('login');
            } else {
                setPage('home');
            }
        } else {
            setError(result.message); 
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    {isLogin ? 'Login ke Akun Anda' : 'Buat Akun Baru'}
                </h2>
                <p className={styles.subtitle}>
                    Atau{' '}
                    <a onClick={() => setPage(isLogin ? 'register' : 'login')} className={styles.link}>
                        {isLogin ? 'daftar akun baru' : 'login jika sudah punya akun'}
                    </a>
                </p>
            </div>
            <div className={styles.formContainer}>
                <div className={styles.formCard}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        {!isLogin && (
                            <>
                                <InputGroup icon={<User />} type="text" name="nama" placeholder="Nama Lengkap" value={formData.nama} onChange={handleChange} required />
                                <InputGroup icon={<FileText />} type="text" name="nik" placeholder="NIK" value={formData.nik} onChange={handleChange} required />
                                <InputGroup icon={<Phone />} type="tel" name="no_telp" placeholder="Nomor Telepon" value={formData.no_telp} onChange={handleChange} required />
                            </>
                        )}
                        <InputGroup icon={<Mail />} type="email" name="email" placeholder="Alamat Email" value={formData.email} onChange={handleChange} required />
                        <InputGroup icon={<Key />} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        <div>
                            <button type="submit" className={styles.submitButton}>
                                {isLogin ? 'Login' : 'Daftar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
