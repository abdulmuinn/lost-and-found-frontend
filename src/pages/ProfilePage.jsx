import React, { useState, useEffect } from 'react';
import { getMyActivity } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import styles from './ProfilePage.module.css'; // <-- Impor file CSS kita

const ProfilePage = ({ setPage }) => {
    const { user } = useAuth();
    const [activity, setActivity] = useState({ reports: [], claims: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setPage('login');
            return;
        }

        const fetchActivity = async () => {
            try {
                setLoading(true);
                const response = await getMyActivity();
                setActivity(response.data);
            } catch (error) {
                console.error("Gagal memuat aktivitas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [user, setPage]);

    if (loading) return <Spinner message="Memuat aktivitas..." />;

    const getStatusClass = (status) => {
        if (status === 'Disetujui') return styles.statusApproved;
        if (status === 'Ditolak') return styles.statusRejected;
        return styles.statusPending; // Untuk 'Menunggu Verifikasi' dll
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Profil & Aktivitas Saya</h1>
            <h2 className={styles.greeting}>Halo, {user?.nama}!</h2>

            <div className={styles.grid}>
                {/* Bagian Laporan Saya */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Laporan Barang Hilang Saya</h3>
                    <div className={styles.activityList}>
                        {activity.reports.length > 0 ? activity.reports.map((report, index) => (
                            <div key={`report-${index}`} className={styles.activityItem}>
                                <p className={styles.itemTitle}>{report.nama_barang}</p>
                                <p className={styles.itemStatus}>Status Laporan: <span className={styles.statusPending}>{report.status_laporan}</span></p>
                                <p className={styles.itemDate}>Dilaporkan pada: {new Date(report.created_at).toLocaleDateString('id-ID')}</p>
                            </div>
                        )) : <p className={styles.noActivity}>Anda belum membuat laporan.</p>}
                    </div>
                </div>

                {/* Bagian Klaim Saya */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Riwayat Klaim Saya</h3>
                    <div className={styles.activityList}>
                        {activity.claims.length > 0 ? activity.claims.map((claim, index) => (
                            <div key={`claim-${index}`} className={styles.activityItem}>
                                <p className={styles.itemTitle}>{claim.nama_barang}</p>
                                <p className={styles.itemStatus}>
                                    Status Klaim: <span className={getStatusClass(claim.status_klaim)}>{claim.status_klaim}</span>
                                </p>
                                <p className={styles.itemDate}>Diajukan pada: {new Date(claim.created_at).toLocaleDateString('id-ID')}</p>
                            </div>
                        )) : <p className={styles.noActivity}>Anda belum mengajukan klaim.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
