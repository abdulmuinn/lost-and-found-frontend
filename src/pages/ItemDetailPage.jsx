import React, { useState, useEffect } from 'react';
import { getItemById, claimItemById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, Calendar, ClipboardCheck, Info } from 'lucide-react';
import Spinner from '../components/Spinner';
import styles from './ItemDetailPage.module.css';
import Modal from '../components/Modal';

const ItemDetailPage = ({ itemId, setPage }) => {
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [claimDetail, setClaimDetail] = useState('');
    const [claimMessage, setClaimMessage] = useState('');
    const [adminModal, setAdminModal] = useState({ isOpen: false });

    useEffect(() => {
        if (!itemId) {
            setError("Gagal mendapatkan ID barang. Silakan coba lagi.");
            setLoading(false);
            return;
        }

        const fetchItem = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await getItemById(itemId);
                setItem(response.data);
            } catch (err) {
                setError('Gagal memuat detail barang atau barang tidak ditemukan.');
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [itemId]);

    // --- FUNGSI BARU UNTUK MENANGANI KLIK TOMBOL KLAIM ---
    const handleClaimButtonClick = () => {
        if (user) {
            // Jika user sudah login, tampilkan form klaim
            setShowClaimForm(true);
        } else {
            // Jika user belum login, beri peringatan dan arahkan ke halaman login
            alert("Anda harus login terlebih dahulu untuk dapat mengajukan klaim.");
            setPage('login');
        }
    };

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        if (!claimDetail) {
            setClaimMessage('Mohon isi detail klaim sebagai bukti kepemilikan.');
            return;
        }
        try {
            const response = await claimItemById(itemId, { detail_klaim: claimDetail });
            setClaimMessage(response.data.message);
            setShowClaimForm(false);
        } catch (err) {
            setClaimMessage(err.response?.data?.message || 'Gagal mengajukan klaim.');
        }
    };

    if (loading) return <Spinner message="Memuat detail barang..." />;
    if (error) { /* ... (kode error tidak berubah) */ }
    if (!item) return null;

    const API_URL = 'http://localhost:5000';
    const imageUrl = item.gambar ? `${API_URL}/${item.gambar.replace(/\\/g, "/")}` : `https://placehold.co/800x600/cccccc/ffffff?text=No+Image`;

    const handleBack = () => {
        const pageToReturn = item.status_barang === 'Ditemukan' ? 'foundItems' : 'lostItems';
        setPage(pageToReturn);
    };

    return (
        <>
            {adminModal.isOpen && ( <Modal {...adminModal} onCancel={() => setAdminModal({ isOpen: false })} /> )}

            <div className={styles.pageContainer}>
                <div className={styles.container}>
                    <button onClick={handleBack} className={styles.backButton}>
                        <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
                        Kembali ke Daftar
                    </button>
                    <div className={styles.card}>
                        <div className={styles.imageWrapper}>
                            <img src={imageUrl} alt={item.nama_barang} className={styles.image} />
                        </div>
                        <div className={styles.content}>
                            <h1 className={styles.title}>{item.nama_barang}</h1>
                            <p className={styles.category}>{item.nama_kategori}</p>

                            <div className={styles.detailsSection}>
                                <p>{item.desk_barang}</p>
                                <div className={styles.infoRow}><Calendar size={18}/> <span>Ditemukan sekitar: {new Date(item.waktu_hilang).toLocaleString('id-ID')}</span></div>
                                <div className={styles.infoRow}><MapPin size={18}/> <span>Lokasi: {item.nama_tempat} (Lantai {item.lantai})</span></div>
                            </div>

                            <div className={styles.actionArea}>
                                {/* --- PERUBAHAN LOGIKA DI SINI --- */}
                                {/* Tombol ini sekarang selalu muncul jika barang ditemukan, tidak peduli status login */}
                                {item.status_barang === 'Ditemukan' && !showClaimForm && !claimMessage && (
                                    <button onClick={handleClaimButtonClick} className={styles.claimButton}>
                                        <ClipboardCheck/> Ajukan Klaim Barang Ini
                                    </button>
                                )}

                                {/* ... (sisa kode untuk form klaim dan pesan lainnya tidak berubah) ... */}
                                {showClaimForm && (
                                    <form onSubmit={handleClaimSubmit} className={styles.claimForm}>
                                        <h3 style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>Formulir Klaim</h3>
                                        <textarea value={claimDetail} onChange={(e) => setClaimDetail(e.target.value)} placeholder="Sebutkan ciri-ciri spesifik atau bukti lain..." rows="4"></textarea>
                                        <button type="submit">Kirim Klaim</button>
                                    </form>
                                )}
                                {claimMessage && <p className={styles.claimMessage}>{claimMessage}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ItemDetailPage;
