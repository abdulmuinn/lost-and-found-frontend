import React from 'react';
import styles from './Modal.module.css'; // Pastikan impor ini ada

const Modal = ({ title, message, onConfirm, onCancel, showCancel = true }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.buttonContainer}>
                    {showCancel && (
                        <button 
                            onClick={onCancel} 
                            className={styles.cancelButton}
                        >
                            Batal
                        </button>
                    )}
                    <button 
                        onClick={onConfirm} 
                        className={styles.confirmButton}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
