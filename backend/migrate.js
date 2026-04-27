const { pool } = require('./config/db');

async function migrate() {
  try {
    console.log('Menjalankan migrasi database...');
    
    // Add deleted_at to users if not exists
    try {
      await pool.query('ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL');
      console.log('✅ Kolom deleted_at berhasil ditambahkan ke tabel users');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Kolom deleted_at sudah ada di tabel users');
      } else {
        throw err;
      }
    }

    // Add deleted_at to transactions if not exists
    try {
      await pool.query('ALTER TABLE transactions ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL');
      console.log('✅ Kolom deleted_at berhasil ditambahkan ke tabel transactions');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Kolom deleted_at sudah ada di tabel transactions');
      } else {
        throw err;
      }
    }

    console.log('Migrasi selesai.');
    process.exit(0);
  } catch (error) {
    console.error('Error saat migrasi:', error);
    process.exit(1);
  }
}

migrate();
