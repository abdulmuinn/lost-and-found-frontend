import React, { useState, useEffect } from 'react';
import { getItems } from '../services/api';
import { MapPin } from 'lucide-react';
import Spinner from '../components/Spinner';
import styles from './ItemsListPage.module.css'; // <-- Impor file CSS kita

const ItemCard = ({ item, onViewDetail }) => {
    const API_URL = 'http://localhost:5000';
    const imageUrl = item.gambar 
        ? `${API_URL}/${item.gambar.replace(/\\/g, "/")}` 
        : `https://placehold.co/600x400/cccccc/ffffff?text=${item.nama_barang.replace(/\s/g, "+")}`;

    return (
        <div className={styles.card}>
            <img src={imageUrl} alt={item.nama_barang} className={styles.cardImage} />
            <div className={styles.cardContent}>
                <span className={`${styles.statusBadge} ${item.status_barang === 'Ditemukan' ? styles.statusFound : styles.statusLost}`}>
                    {item.status_barang}
                </span>
                <h3 className={styles.cardTitle}>{item.nama_barang}</h3>
                <p className={styles.cardCategory}>{item.nama_kategori}</p>
                <div className={styles.cardLocation}>
                    <MapPin />
                    <span>{item.nama_tempat || 'Lokasi tidak diketahui'}</span>
                </div>
                <div className={styles.cardFooter}>
                    <button onClick={() => onViewDetail(item.barang_id)} className={styles.detailButton}>
                        Lihat Detail
                    </button>
                </div>
            </div>
        </div>
    );
};

const ItemsListPage = ({ status, title, setPage, setSelectedItemId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const categories = ["Elektronik", "Buku", "Aksesoris Pribadi", "Kunci", "Lainnya"];

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const params = { status };
                if (searchTerm) params.searchTerm = searchTerm;
                if (category) params.category = category;

                const response = await getItems(params);
                setItems(response.data);
            } catch (error) {
                console.error("Gagal mengambil data barang:", error);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        const timerId = setTimeout(() => {
            fetchItems();
        }, 500);

        return () => clearTimeout(timerId);

    }, [status, searchTerm, category]);

    const handleViewDetail = (id) => {
        setSelectedItemId(id);
        setPage('itemDetail');
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <h1 className={styles.title}>{title}</h1>

                <div className={styles.filterArea}>
                    <input
                        type="text"
                        placeholder="Cari nama atau deskripsi barang..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className={styles.categorySelect}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                {loading ? (
                    <Spinner message="Mencari barang..." />
                ) : items.length > 0 ? (
                    <div className={styles.itemsGrid}>
                        {items.map(item => <ItemCard key={item.barang_id} item={item} onViewDetail={handleViewDetail} />)}
                    </div>
                ) : (
                    <div className={styles.messageCenter}>
                        <p>Tidak ada barang yang cocok dengan pencarian Anda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemsListPage;
