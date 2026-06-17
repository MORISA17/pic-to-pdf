// Mengambil elemen-elemen HTML yang dibutuhkan
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');

let selectedFile = null;

// 1. Membuat area drag & drop bisa diklik untuk memilih file
dropZone.addEventListener('click', () => fileInput.click());

// 2. Menangani ketika file dipilih via tombol penjelajah file
fileInput.addEventListener('change', handleFileSelect);

// 3. Menangani fitur Drag & Drop (Seret dan Lepas)
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#4f46e5'; // Berubah warna saat file mengambang di atasnya
    dropZone.style.backgroundColor = '#f0f2ff';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#6366f1'; // Kembali ke warna semula jika file batal dilepas
    dropZone.style.backgroundColor = '#fbfbfe';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#6366f1';
    dropZone.style.backgroundColor = '#fbfbfe';
    
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect();
    }
});

// 4. Fungsi untuk memproses file yang sudah dipilih
function handleFileSelect() {
    const file = fileInput.files[0];
    
    // Validasi: Pastikan yang diunggah adalah file gambar
    if (file && file.type.startsWith('image/')) {
        selectedFile = file;
        
        // Tampilkan info file ke layar
        fileName.textContent = `File terpilih: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        fileInfo.style.display = 'block';
        
        // Aktifkan tombol konversi, sembunyikan tombol unduh lama jika ada
        convertBtn.disabled = false;
        downloadBtn.style.display = 'none';
    } else {
        alert('Harap pilih file gambar saja (PNG, JPG, JPEG)!');
    }
}

// 5. Proses Konversi Gambar ke PDF menggunakan jsPDF
convertBtn.addEventListener('click', () => {
    if (!selectedFile) return;

    convertBtn.innerText = "Sedang Memproses...";
    convertBtn.disabled = true;

    const reader = new FileReader();
    
    // Membaca file gambar sebagai Data URL (Base64)
    reader.readAsDataURL(selectedFile);
    
    reader.onload = function (event) {
        const imgData = event.target.result;
        
        // Membuat elemen gambar sementara di memori untuk mendapatkan ukuran aslinya
        const img = new Image();
        img.src = imgData;
        
        img.onload = function () {
            // Mengambil ukuran asli gambar
            const imgWidth = img.width;
            const imgHeight = img.height;
            
            // Inisialisasi jsPDF (menggunakan objek bawaan jspdf.jsPDF)
            const { jsPDF } = window.jspdf;
            
            // Menyesuaikan orientasi PDF (Portrait/Landscape) berdasarkan bentuk gambar
            const orientation = imgWidth > imgHeight ? 'l' : 'p';
            const pdf = new jsPDF(orientation, 'px', [imgWidth, imgHeight]);
            
            // Memasukkan gambar ke dalam halaman PDF pas dengan ukurannya
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            
            // Menghasilkan output berupa Blob URL (tautan lokal browser)
            const pdfBlob = pdf.output('bloburl');
            
            // Menyiapkan tombol unduh
            downloadBtn.href = pdfBlob;
            downloadBtn.download = selectedFile.name.split('.')[0] + '.pdf';
            
            // Update Tampilan UI
            convertBtn.innerText = "Konversi Selesai!";
            downloadBtn.style.display = 'block';
        };
    };
});