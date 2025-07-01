import React, { useState, useEffect } from 'react';
import { reportItem, getLokasi, getKategori } from '../services/api'; // <-- Impor fungsi baru
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import styles from './ReportLostPage.module.css';

const ReportLostPage = ({ setPage }) => {
    const { user } = useAuth();
    const [authLoading, setAuthLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- State baru untuk menampung data dropdown ---
    const [lokasiList, setLokasiList] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);

    const [formData, setFormData] = useState({
        nama_barang: '',
        desk_barang: '',
        kategori_id: '', // <-- Dikosongkan, akan dipilih user
        lokasi_id: '',   // <-- Dikosongkan, akan dipilih user
        waktu_hilang: '',
        detail: '',
    });
    const [gambar, setGambar] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

    useEffect(() => {
        if (user) {
            setAuthLoading(false);
            // Ambil data untuk dropdown saat komponen dimuat
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
            const timer = setTimeout(() => {
                if (!user) {
                    alert("Anda harus login untuk membuat laporan.");
                    setPage('login');
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [user, setPage]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setGambar(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        // ... (fungsi handleSubmit tidak berubah)
        e.preventDefault();
        if (!formData.kategori_id || !formData.lokasi_id) {
            setModal({ isOpen: true, title: 'Input Tidak Lengkap', message: 'Mohon pilih kategori dan lokasi terlebih dahulu.'});
            return;
        }
        setIsSubmitting(true);
        setModal({ isOpen: false });

        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        if (gambar) {
            data.append('gambar', gambar);
        }

        try {
            await reportItem(data);
            setModal({ isOpen: true, title: 'Laporan Terkirim', message: 'Laporan Anda telah berhasil dibuat. Terima kasih!' });
        } catch (err) {
            setModal({ isOpen: true, title: 'Gagal Mengirim', message: err.response?.data?.message || 'Terjadi kesalahan.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return <Spinner message="Memeriksa otorisasi..." />;
    }

    return (
        <>
            {/* ... (Modal JSX tidak berubah) */}
            {modal.isOpen && ( <Modal title={modal.title} message={modal.message} onConfirm={() => { if (modal.title === 'Laporan Terkirim') { setPage('home'); } else { setModal({ isOpen: false }); } }} showCancel={false} /> )}

            <div className={styles.container}>
                <h1 className={styles.title}>Formulir Laporan Kehilangan</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="nama_barang">Nama Barang</label>
                        <input id="nama_barang" type="text" name="nama_barang" value={formData.nama_barang} onChange={handleChange} required className={styles.input}/>
                    </div>

                    {/* --- Dropdown Kategori --- */}
                    <div className={styles.formGroup}>
                        <label htmlFor="kategori_id">Kategori</label>
                        <select id="kategori_id" name="kategori_id" value={formData.kategori_id} onChange={handleChange} required className={styles.select}>
                            <option value="" disabled>-- Pilih Kategori --</option>
                            {kategoriList.map(kat => (
                                <option key={kat.kategori_id} value={kat.kategori_id}>
                                    {kat.nama_kategori}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* --- Dropdown Lokasi --- */}
                    <div className={styles.formGroup}>
                        <label htmlFor="lokasi_id">Lokasi Terakhir Terlihat</label>
                        <select id="lokasi_id" name="lokasi_id" value={formData.lokasi_id} onChange={handleChange} required className={styles.select}>
                            <option value="" disabled>-- Pilih Lokasi --</option>
                            {lokasiList.map(lok => (
                                <option key={lok.lokasi_id} value={lok.lokasi_id}>
                                    {lok.nama_tempat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="desk_barang">Deskripsi Detail Barang</label>
                        <textarea id="desk_barang" name="desk_barang" value={formData.desk_barang} onChange={handleChange} className={styles.textarea} rows="3" placeholder="Contoh: Warna hitam, ada goresan di pojok kanan..."></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="waktu_hilang">Waktu Hilang</label>
                        <input id="waktu_hilang" type="datetime-local" name="waktu_hilang" value={formData.waktu_hilang} onChange={handleChange} required className={styles.input}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="gambar">Upload Gambar (Opsional)</label>
                        <input id="gambar" type="file" name="gambar" onChange={handleFileChange} className={styles.input}/>
                    </div>
                    <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                        {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default ReportLostPage;
