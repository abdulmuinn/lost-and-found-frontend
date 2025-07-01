import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import navStyles from './components/Navbar.module.css';

// Impor semua halaman yang kita butuhkan
import AuthForm from './pages/AuthForm';
import ItemsListPage from './pages/ItemsListPage';
import ReportLostPage from './pages/ReportLostPage';
import ItemDetailPage from './pages/ItemDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import ManageDataPage from './pages/ManageDataPage'; // <-- Diaktifkan kembali
import AddFoundItemPage from './pages/AddFoundItemPage';

// Komponen Navbar (tidak ada perubahan)
const Navbar = ({ setPage }) => {
    const { user, logout } = useAuth();
    return (
        <nav className={navStyles.navbar}>
            <div className={navStyles.container}>
                <a onClick={() => setPage('home')} className={navStyles.logo}>
                    Lost<span>&</span>Found
                </a>
                <div className={navStyles.navLinks}>
                    <a onClick={() => setPage('home')} className={navStyles.navLink}>Beranda</a>
                    <a onClick={() => setPage('foundItems')} className={navStyles.navLink}>Barang Ditemukan</a>
                    <a onClick={() => setPage('lostItems')} className={navStyles.navLink}>Barang Hilang</a>
                    {user && (
                        <a onClick={() => setPage('reportLost')} className={navStyles.navLink}>Lapor Hilang</a>
                    )}
                    {user && user.role_id === 1 && (
                        <a onClick={() => setPage('adminDashboard')} className={navStyles.navLinkAdmin}>Admin</a>
                    )}
                </div>
                <div className={navStyles.userActions}>
                    {user ? (
                        <>
                            <a onClick={() => setPage('profile')} className={navStyles.greeting}>Halo, {user.nama}</a>
                            <button onClick={() => { logout(); setPage('home'); }} className={`${navStyles.button} ${navStyles.buttonSecondary}`}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setPage('login')} className={navStyles.buttonSecondary}>Login</button>
                            <button onClick={() => setPage('register')} className={navStyles.buttonPrimary}>Register</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

// Komponen HomePage (tidak ada perubahan)
const HomePage = ({ setPage }) => {
    return (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '700' }}>Selamat Datang di Lost & Found</h1>
            <p style={{ marginTop: '1rem', color: '#4b5563' }}>Platform untuk melaporkan dan menemukan barang hilang.</p>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                    onClick={() => setPage('foundItems')}
                    style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                    Lihat Barang Temuan
                </button>
                <button
                    onClick={() => setPage('reportLost')}
                    style={{ backgroundColor: '#16a34a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                    Lapor Barang Hilang
                </button>
            </div>
        </div>
    );
};

// PageSwitcher dengan Logika Perlindungan Rute
const PageSwitcher = () => {
    const { user } = useAuth();
    const [page, setPage] = useState('home');
    const [selectedItemId, setSelectedItemId] = useState(null);

    const renderPage = () => {
        // Logika untuk halaman yang memerlukan login
        const protectedPages = ['reportLost', 'profile', 'adminDashboard', 'addFoundItem', 'manageData'];
        if (protectedPages.includes(page) && !user) {
            if (user === null) {
                console.log("Akses ditolak, mengarahkan ke login...");
                return <AuthForm isLogin={true} setPage={setPage} />;
            }
            return <div>Memeriksa sesi...</div>;
        }
        
        // Logika untuk halaman yang memerlukan role admin
        const adminPages = ['adminDashboard', 'addFoundItem', 'manageData'];
        if (adminPages.includes(page) && user?.role_id !== 1) {
            console.log("Akses admin ditolak.");
            return <HomePage setPage={setPage} />;
        }

        // Jika semua pengecekan lolos, tampilkan halaman yang diminta
        switch (page) {
            case 'login': return <AuthForm isLogin={true} setPage={setPage} />;
            case 'register': return <AuthForm isLogin={false} setPage={setPage} />;
            case 'foundItems': return <ItemsListPage status="Ditemukan" title="Barang Ditemukan" setPage={setPage} setSelectedItemId={setSelectedItemId} />;
            case 'lostItems': return <ItemsListPage status="Hilang" title="Barang Dilaporkan Hilang" setPage={setPage} setSelectedItemId={setSelectedItemId} />;
            case 'reportLost': return <ReportLostPage setPage={setPage} />;
            case 'itemDetail': return <ItemDetailPage itemId={selectedItemId} setPage={setPage} />;
            case 'adminDashboard': return <AdminDashboard setPage={setPage} />;
            case 'addFoundItem': return <AddFoundItemPage setPage={setPage} />;
            case 'manageData': return <ManageDataPage setPage={setPage} />; // <-- Diaktifkan kembali
            case 'profile': return <ProfilePage setPage={setPage} />;
            case 'home':
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div>
            {page !== 'login' && page !== 'register' && <Navbar setPage={setPage} />}
            {renderPage()}
        </div>
    );
};

// App utama
export default function App() {
  return (
    <AuthProvider>
      <PageSwitcher />
    </AuthProvider>
  );
}
