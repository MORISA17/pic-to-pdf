// Mengambil elemen-elemen HTML yang dibutuhkan
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const imagePreview = document.getElementById('imagePreview'); // BARU
const clearBtn = document.getElementById('clearBtn');       // BARU
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
    dropZone.style.borderColor = '#4f46e5'; 
    dropZone.style.backgroundColor = '#f0f2ff';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#6366f1'; 
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
        
        // MEMBUAT PRATINJAU GAMBAR (Thumbnail Baru)
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result; 
        }
        reader.readAsDataURL(file);
        
        // Tampilkan info berkas ke layar
        fileName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        fileInfo.style.display = 'block';
        
        // Aktifkan tombol konversi, reset teks tombol, sembunyikan unduhan lama
        convertBtn.disabled = false;
        convertBtn.innerText = "Konversi ke PDF";
        downloadBtn.style.display = 'none';
    } else {
        alert('Harap pilih file gambar saja (PNG, JPG, JPEG, WebP)!');
        resetApplication();
    }
}

// 5. FITUR BARU: Fungsi untuk Menghapus / Membatalkan File Terpilih
clearBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Mencegah kotak dropzone ikut terklik otomatis
    resetApplication();
});

function resetApplication() {
    selectedFile = null;
    fileInput.value = ''; // Mengosongkan data file pada browser
    imagePreview.src = '';
    fileName.textContent = '';
    fileInfo.style.display = 'none';
    convertBtn.disabled = true;
    convertBtn.innerText = "Konversi ke PDF";
    downloadBtn.style.display = 'none';
}

// 6. Proses Konversi Gambar ke PDF menggunakan jsPDF
convertBtn.addEventListener('click', () => {
    if (!selectedFile) return;

    convertBtn.innerText = "Sedang Memproses...";
    convertBtn.disabled = true;

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    
    reader.onload = function (event) {
        const imgData = event.target.result;
        const img = new Image();
        img.src = imgData;
        
        img.onload = function () {
            const imgWidth = img.width;
            const imgHeight = img.height;
            
            const { jsPDF } = window.jspdf;
            
            // Menyesuaikan orientasi PDF secara dinamis (l = landscape, p = portrait)
            const orientation = imgWidth > imgHeight ? 'l' : 'p';
            const pdf = new jsPDF(orientation, 'px', [imgWidth, imgHeight]);
            
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            
            const pdfBlob = pdf.output('bloburl');
            
            downloadBtn.href = pdfBlob;
            downloadBtn.download = selectedFile.name.split('.')[0] + '.pdf';
            
            convertBtn.innerText = "Konversi Selesai!";
            downloadBtn.style.display = 'block';
        };
    };
});