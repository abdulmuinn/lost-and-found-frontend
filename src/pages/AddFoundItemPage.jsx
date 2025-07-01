import React, { useState, useEffect } from 'react';
import { addFoundItemByAdmin, getLokasi, getKategori } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import styles from './ReportLostPage.module.css'; // Kita bisa pakai ulang style yang sama

const AddFoundItemPage = ({ setPage }) => {
    const { user } = useAuth();
    const [authLoading, setAuthLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lokasiList, setLokasiList] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [formData, setFormData] = useState({
        nama_barang: '',
        desk_barang: '',
        kategori_id: '',
        lokasi_id: '',
        waktu_hilang: '', // Di sini artinya 'waktu ditemukan'
        detail: '', // Detail penemuan
    });
    const [gambar, setGambar] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

    useEffect(() => {
        if (user?.role_id === 1) {
            setAuthLoading(false);
            const fetchDataForDropdowns = async () => {
                try {
                    const lokasiRes = await getLokasi();
                    const kategoriRes = await getKategori();
                    setLokasiList(lokasiRes.data);
                    setKategoriList(kategoriRes.data);
                } catch (error) {
                    console.error("Gagal memuat data untuk form", error);
                }
            };
            fetchDataForDropdowns();
        } else {
            alert("Akses ditolak. Hanya untuk admin.");
            setPage('home');
        }
    }, [user, setPage]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setGambar(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.kategori_id || !formData.lokasi_id) {
            setModal({ isOpen: true, title: 'Input Tidak Lengkap', message: 'Mohon pilih kategori dan lokasi.'});
            return;
        }
        setIsSubmitting(true);
        const data = new FormData();
        for (const key in formData) { data.append(key, formData[key]); }
        if (gambar) { data.append('gambar', gambar); }

        try {
            await addFoundItemByAdmin(data);
            setModal({ isOpen: true, title: 'Sukses', message: 'Barang temuan berhasil ditambahkan ke sistem.' });
        } catch (err) {
            setModal({ isOpen: true, title: 'Gagal', message: err.response?.data?.message || 'Terjadi kesalahan.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) return <Spinner message="Memeriksa otorisasi admin..." />;

    return (
        <>
            {modal.isOpen && ( <Modal title={modal.title} message={modal.message} onConfirm={() => { if (modal.title === 'Sukses') { setPage('adminDashboard'); } else { setModal({ isOpen: false }); } }} showCancel={false} /> )}
            <div className={styles.container}>
                <h1 className={styles.title}>Formulir Tambah Barang Temuan</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Formulirnya sama persis seperti ReportLostPage, hanya judul dan beberapa label yang berbeda */}
                    <div className={styles.formGroup}>
                        <label>Nama Barang</label>
                        <input type="text" name="nama_barang" onChange={handleChange} required className={styles.input}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Kategori</label>
                        <select name="kategori_id" onChange={handleChange} required className={styles.select}>
                            <option value="" disabled>-- Pilih Kategori --</option>
                            {kategoriList.map(kat => (<option key={kat.kategori_id} value={kat.kategori_id}>{kat.nama_kategori}</option>))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Lokasi Ditemukan</label>
                        <select name="lokasi_id" onChange={handleChange} required className={styles.select}>
                            <option value="" disabled>-- Pilih Lokasi --</option>
                            {lokasiList.map(lok => (<option key={lok.lokasi_id} value={lok.lokasi_id}>{lok.nama_tempat}</option>))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Deskripsi Detail Barang</label>
                        <textarea name="desk_barang" onChange={handleChange} className={styles.textarea} rows="3" placeholder="Warna, merek, ciri-ciri spesifik..."></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Waktu Ditemukan</label>
                        <input type="datetime-local" name="waktu_hilang" onChange={handleChange} required className={styles.input}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Upload Gambar</label>
                        <input type="file" name="gambar" onChange={handleFileChange} className={styles.input}/>
                    </div>
                    <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                        {isSubmitting ? 'Menyimpan...' : 'Tambah Barang'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default AddFoundItemPage;
