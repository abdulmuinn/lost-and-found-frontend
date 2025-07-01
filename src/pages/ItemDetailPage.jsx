import React, { useState, useEffect } from 'react';
import { getItemById, claimItemById, markAsFoundByAdmin } from '../services/api'; // <-- Impor fungsi baru
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, Calendar, ClipboardCheck, Info, CheckCircle } from 'lucide-react';
import Spinner from '../components/Spinner';
import styles from './ItemDetailPage.module.css';
import Modal from '../components/Modal'; // <-- Impor Modal

const ItemDetailPage = ({ itemId, setPage }) => {
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [claimDetail, setClaimDetail] = useState('');
    const [claimMessage, setClaimMessage] = useState('');
    const [markAsFoundMessage, setMarkAsFoundMessage] = useState('');

    // State baru untuk modal konfirmasi admin
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
                console.error("Error saat mengambil detail barang:", err);
                setError('Gagal memuat detail barang atau barang tidak ditemukan.');
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [itemId]);

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

    // --- Fungsi baru untuk admin menandai barang ---
    const handleMarkAsFound = async () => {
        try {
            const response = await markAsFoundByAdmin(itemId);
            setMarkAsFoundMessage(response.data.message);
            // Refresh halaman untuk melihat status baru (opsional) atau arahkan
            setTimeout(() => {
                setPage('lostItems');
            }, 2000);
        } catch (err) {
            setMarkAsFoundMessage(err.response?.data?.message || 'Gagal mengubah status barang.');
        }
    };

    const showMarkAsFoundModal = () => {
        setAdminModal({
            isOpen: true,
            title: 'Konfirmasi',
            message: 'Apakah Anda yakin ingin menandai barang ini sebagai "Ditemukan"? Statusnya akan berubah dan barang ini akan pindah ke daftar Barang Ditemukan.',
            onConfirm: () => {
                handleMarkAsFound();
                setAdminModal({ isOpen: false });
            }
        });
    };

    if (loading) return <Spinner message="Memuat detail barang..." />;
    if (error) {
        return (
            <div className={styles.container} style={{ textAlign: 'center', padding: '4rem' }}>
                <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>
                <button 
                    onClick={() => setPage('home')} 
                    style={{ marginTop: '1rem', backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none' }}
                >
                    Kembali ke Beranda
                </button>
            </div>
        );
    }
    if (!item) return null;

    const API_URL = 'http://localhost:5000';
    const imageUrl = item.gambar ? `${API_URL}/${item.gambar.replace(/\\/g, "/")}` : `https://placehold.co/800x600/cccccc/ffffff?text=No+Image`;

    const handleBack = () => {
        const pageToReturn = item.status_barang === 'Ditemukan' ? 'foundItems' : 'lostItems';
        setPage(pageToReturn);
    };

    return (
        <>
            {/* Modal untuk Admin */}
            {adminModal.isOpen && (
                <Modal 
                    title={adminModal.title}
                    message={adminModal.message}
                    onConfirm={adminModal.onConfirm}
                    onCancel={() => setAdminModal({ isOpen: false })}
                />
            )}

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
                                <div className={styles.infoRow}>
                                    <Calendar size={18}/> 
                                    <span>{item.status_barang === 'Ditemukan' ? 'Ditemukan sekitar' : 'Hilang sekitar'}: {new Date(item.waktu_hilang).toLocaleString('id-ID')}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <MapPin size={18}/> 
                                    <span>Lokasi: {item.nama_tempat || 'Tidak diketahui'} (Lantai {item.lantai || 'N/A'})</span>
                                </div>
                            </div>

                            <div className={styles.actionArea}>
                                {/* --- Logika Tombol Diperbarui --- */}

                                {/* Tombol Klaim untuk User Biasa */}
                                {user?.role_id !== 1 && item.status_barang === 'Ditemukan' && !showClaimForm && !claimMessage && (
                                    <button onClick={() => setShowClaimForm(true)} className={styles.claimButton}>
                                        <ClipboardCheck/> Ajukan Klaim Barang Ini
                                    </button>
                                )}

                                {/* Tombol "Tandai Ditemukan" untuk Admin */}
                                {user?.role_id === 1 && item.status_barang === 'Hilang' && !markAsFoundMessage && (
                                    <button onClick={showMarkAsFoundModal} className={styles.claimButton} style={{backgroundColor: '#f59e0b'}}>
                                        <CheckCircle/> Tandai sebagai Ditemukan
                                    </button>
                                )}

                                {/* Informasi untuk User jika barang hilang */}
                                {user?.role_id !== 1 && item.status_barang === 'Hilang' && (
                                    <div style={{backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', color: '#1e40af', padding: '1rem', borderRadius: '0.25rem' }}>
                                        <p style={{fontWeight: 'bold', display: 'flex', alignItems: 'center'}}><Info size={18} style={{marginRight: '0.5rem'}}/>Informasi</p>
                                        <p>Jika Anda menemukan barang ini, silakan hubungi admin atau serahkan ke pos keamanan terdekat.</p>
                                    </div>
                                )}

                                {showClaimForm && (
                                    <form onSubmit={handleClaimSubmit} className={styles.claimForm}>
                                        <h3 style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>Formulir Klaim</h3>
                                        <textarea value={claimDetail} onChange={(e) => setClaimDetail(e.target.value)} placeholder="Sebutkan ciri-ciri spesifik atau bukti lain..." rows="4"></textarea>
                                        <button type="submit">Kirim Klaim</button>
                                    </form>
                                )}

                                {claimMessage && <p className={styles.claimMessage}>{claimMessage}</p>}
                                {markAsFoundMessage && <p className={styles.claimMessage}>{markAsFoundMessage}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ItemDetailPage;
