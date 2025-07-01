import React, { useState, useEffect } from 'react';
import { getKategori, getLokasi, addKategori, deleteKategori, addLokasi, deleteLokasi } from '../services/api';
import Spinner from '../components/Spinner';
import styles from './ManageDataPage.module.css';
import { ArrowLeft } from 'lucide-react';

const DataRow = ({ item, onDelete, dataKey, nameKey, secondNameKey }) => (
    <div className={styles.dataRow}>
        <span>{item[nameKey]} {secondNameKey && item[secondNameKey] ? `(Lantai ${item[secondNameKey]})` : ''}</span>
        <button onClick={() => onDelete(item[dataKey])} className={styles.deleteButton}>Hapus</button>
    </div>
);

const ManagementSection = ({ title, items, onAdd, onDelete, dataKey, nameKey, inputPlaceholder, secondInputPlaceholder, secondInputKey }) => {
    const [newItem, setNewItem] = useState('');
    const [secondItem, setSecondItem] = useState('');

    const handleAdd = () => {
        if (!newItem) return;
        const data = { [nameKey]: newItem };
        if (secondInputKey) {
            data[secondInputKey] = secondItem || null;
        }
        onAdd(data);
        setNewItem('');
        setSecondItem('');
    };

    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <div className={styles.addForm}>
                <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={inputPlaceholder} className={styles.input} />
                {secondInputKey && (
                    <input type="number" value={secondItem} onChange={(e) => setSecondItem(e.target.value)} placeholder={secondInputPlaceholder} className={styles.inputNumber} />
                )}
                <button onClick={handleAdd} className={styles.addButton}>Tambah</button>
            </div>
            <div className={styles.dataList}>
                {items.map(item => <DataRow key={item[dataKey]} item={item} onDelete={onDelete} dataKey={dataKey} nameKey={nameKey} secondNameKey={secondInputKey}/>)}
            </div>
        </div>
    );
};

const ManageDataPage = ({ setPage }) => {
    const [kategori, setKategori] = useState([]);
    const [lokasi, setLokasi] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [kategoriRes, lokasiRes] = await Promise.all([getKategori(), getLokasi()]);
            setKategori(kategoriRes.data);
            setLokasi(lokasiRes.data);
        } catch (error) {
            console.error("Gagal memuat data master", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddKategori = async (data) => { await addKategori(data); fetchData(); };
    const handleDeleteKategori = async (id) => { if(window.confirm('Yakin?')) { await deleteKategori(id).catch(err => alert(err.response?.data?.message)); fetchData(); } };
    const handleAddLokasi = async (data) => { await addLokasi(data); fetchData(); };
    const handleDeleteLokasi = async (id) => { if(window.confirm('Yakin?')) { await deleteLokasi(id).catch(err => alert(err.response?.data?.message)); fetchData(); } };

    if (loading) return <Spinner />;

    return (
        <div className={styles.container}>
            <button onClick={() => setPage('adminDashboard')} className={styles.backButton}>
                <ArrowLeft size={18} /> Kembali ke Dashboard
            </button>
            <h1 className={styles.title}>Manajemen Data Master</h1>
            <div className={styles.grid}>
                <ManagementSection 
                    title="Kelola Kategori"
                    items={kategori}
                    onAdd={handleAddKategori}
                    onDelete={handleDeleteKategori}
                    dataKey="kategori_id"
                    nameKey="nama_kategori"
                    inputPlaceholder="Nama Kategori Baru"
                />
                <ManagementSection 
                    title="Kelola Lokasi"
                    items={lokasi}
                    onAdd={handleAddLokasi}
                    onDelete={handleDeleteLokasi}
                    dataKey="lokasi_id"
                    nameKey="nama_tempat"
                    inputPlaceholder="Nama Lokasi Baru"
                    secondInputPlaceholder="Lantai"
                    secondInputKey="lantai"
                />
            </div>
        </div>
    );
};

export default ManageDataPage;
