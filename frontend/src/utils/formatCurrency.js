export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

export const CATEGORIES = {
  income: ['Gaji', 'Freelance', 'Investasi', 'Bonus', 'Penjualan', 'Lainnya'],
  expense: ['Makanan', 'Transport', 'Listrik', 'Internet', 'Belanja', 'Kesehatan', 'Pendidikan', 'Hiburan', 'Sewa', 'Lainnya'],
};

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
