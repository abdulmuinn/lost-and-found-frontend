import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Impor file CSS
import navStyles from './components/Navbar.module.css';
import homeStyles from './pages/HomePage.module.css';

// Impor semua halaman
import AuthForm from './pages/AuthForm';
import ItemsListPage from './pages/ItemsListPage';
import ReportLostPage from './pages/ReportLostPage';
import ItemDetailPage from './pages/ItemDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import ManageDataPage from './pages/ManageDataPage';
import AddFoundItemPage from './pages/AddFoundItemPage';

// Komponen Navbar yang sudah di-styling
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

// Komponen HomePage yang sudah di-styling ulang
const HomePage = ({ setPage }) => (
    <div className={homeStyles.hero}>
        <h1 className={homeStyles.heroTitle}>
            Kehilangan Sesuatu? <span>Temukan Kembali di Sini.</span>
        </h1>
        <p className={homeStyles.heroSubtitle}>
            Platform terpusat untuk melaporkan barang hilang dan membantu orang lain menemukan kembali barang berharga mereka. Cepat, mudah, dan efisien.
        </p>
        <div className={homeStyles.buttonGroup}>
            <button
                onClick={() => setPage('foundItems')}
                className={homeStyles.buttonPrimary}>
                Lihat Barang Temuan
            </button>
            <button
                onClick={() => setPage('reportLost')}
                className={homeStyles.buttonSecondary}>
                Lapor Barang Hilang
            </button>
        </div>
    </div>
);

// PageSwitcher dengan Logika Perlindungan Rute
const PageSwitcher = () => {
    const { user } = useAuth();
    const [page, setPage] = useState('home');
    const [selectedItemId, setSelectedItemId] = useState(null);

    const renderPage = () => {
        const protectedPages = ['reportLost', 'profile', 'adminDashboard', 'addFoundItem', 'manageData'];
        if (protectedPages.includes(page) && !user) {
            if (user === null) {
                return <AuthForm isLogin={true} setPage={setPage} />;
            }
            return <div>Memeriksa sesi...</div>;
        }
        
        const adminPages = ['adminDashboard', 'addFoundItem', 'manageData'];
        if (adminPages.includes(page) && user?.role_id !== 1) {
            return <HomePage setPage={setPage} />;
        }

        switch (page) {
            case 'login': return <AuthForm isLogin={true} setPage={setPage} />;
            case 'register': return <AuthForm isLogin={false} setPage={setPage} />;
            case 'foundItems': return <ItemsListPage status="Ditemukan" title="Barang Ditemukan" setPage={setPage} setSelectedItemId={setSelectedItemId} />;
            case 'lostItems': return <ItemsListPage status="Hilang" title="Barang Dilaporkan Hilang" setPage={setPage} setSelectedItemId={setSelectedItemId} />;
            case 'reportLost': return <ReportLostPage setPage={setPage} />;
            case 'itemDetail': return <ItemDetailPage itemId={selectedItemId} setPage={setPage} />;
            case 'adminDashboard': return <AdminDashboard setPage={setPage} />;
            case 'addFoundItem': return <AddFoundItemPage setPage={setPage} />;
            case 'manageData': return <ManageDataPage setPage={setPage} />;
            case 'profile': return <ProfilePage setPage={setPage} />;
            case 'home':
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div>
            {/* Logika ini memastikan Navbar muncul di semua halaman kecuali Login & Register */}
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
