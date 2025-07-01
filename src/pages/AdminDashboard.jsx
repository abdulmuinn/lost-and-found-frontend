import React, { useState, useEffect } from 'react';
import { getAdminClaims, verifyAdminClaim } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import styles from './AdminDashboard.module.css';

const AdminDashboard = ({ setPage }) => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const response = await getAdminClaims();
            setClaims(response.data);
        } catch (error) {
            setMessage('Gagal memuat daftar klaim.');
        } finally {
            setLoading(false);
        }
    };

    // useEffect sekarang hanya bertugas mengambil data
    useEffect(() => {
        fetchClaims();
    }, []);

    const handleVerification = async (claimId, isApproved) => {
        try {
            const response = await verifyAdminClaim(claimId, isApproved);
            setMessage(response.data.message);
            fetchClaims();
        } catch (error) {
            setMessage('Gagal memverifikasi klaim.');
        }
    };

    const showConfirmationModal = (claimId, isApproved) => {
        setModal({
            isOpen: true,
            title: 'Konfirmasi Tindakan',
            message: `Anda yakin ingin ${isApproved ? 'menyetujui' : 'menolak'} klaim ini?`,
            onConfirm: () => {
                handleVerification(claimId, isApproved);
                setModal({ isOpen: false });
            },
        });
    };

    if (loading) return <Spinner message="Memuat daftar klaim..." />;

    return (
        <>
            {modal.isOpen && (
                <Modal 
                    title={modal.title}
                    message={modal.message}
                    onConfirm={modal.onConfirm}
                    onCancel={() => setModal({ isOpen: false })}
                />
            )}
            <div className={styles.container}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h1 className={styles.title}>Admin Dashboard</h1>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <button onClick={() => setPage('manageData')} style={{background: '#6b7281', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer'}}>
                            Kelola Data Master
                        </button>
                        <button onClick={() => setPage('addFoundItem')} className={styles.approveButton}>
                            + Tambah Barang Temuan
                        </button>
                    </div>
                </div>
                {message && <p className={styles.message}>{message}</p>}
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Verifikasi Klaim</h2>
                <div className={styles.claimsContainer}>
                    {claims.length > 0 ? claims.map(claim => (
                        <div key={claim.claim_id} className={styles.claimCard}>
                            <div className={styles.claimInfo}>
                                <h2>{claim.nama_barang}</h2>
                                <p><b>Deskripsi Barang:</b> {claim.desk_barang}</p>
                                <p><b>Diajukan oleh:</b> {claim.nama_pengklaim} ({claim.email_pengklaim})</p>
                                <div className={styles.proof}><b>Bukti dari Pengklaim:</b> {claim.detail_klaim}</div>
                            </div>
                            <div className={styles.claimActions}>
                                <button onClick={() => showConfirmationModal(claim.claim_id, true)} className={styles.approveButton}>Setujui</button>
                                <button onClick={() => showConfirmationModal(claim.claim_id, false)} className={styles.rejectButton}>Tolak</button>
                            </div>
                        </div>
                    )) : <p>Tidak ada klaim yang menunggu verifikasi.</p>}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
