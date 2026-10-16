// Inisialisasi Data Default di LocalStorage
function initDefaultData() {
    if (!localStorage.getItem('books')) {
        const defaultBooks = [
            { id: 1, judul: 'Filosofi Teras', penulis: 'Henry Manampiring', kategori: 'Pengembangan Diri', isbn: '978-602-06-3824-9', stok: 5, cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=80' },
            { id: 2, judul: 'Atomic Habits', penulis: 'James Clear', kategori: 'Produktivitas', isbn: '978-602-06-3317-6', stok: 8, cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80' },
            { id: 3, judul: 'Bumi Manusia', penulis: 'Pramoedya Ananta Toer', kategori: 'Novel Sejarah', isbn: '978-979-97312-3-4', stok: 3, cover: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=500&q=80' }
        ];
        localStorage.setItem('books', JSON.stringify(defaultBooks));
    }
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([{ username: 'admin', password: 'admin123' }]));
    }
    if (!localStorage.getItem('peminjaman')) {
        localStorage.setItem('peminjaman', JSON.stringify([]));
    }
}

function getBooks() { return JSON.parse(localStorage.getItem('books')) || []; }
function saveBooks(books) { localStorage.setItem('books', JSON.stringify(books)); }

function getPeminjaman() { return JSON.parse(localStorage.getItem('peminjaman')) || []; }
function savePeminjaman(nama, bookId, tgl) {
    const list = getPeminjaman();
    const books = getBooks();
    const book = books.find(b => b.id == bookId);
    
    list.push({
        id: Date.now(),
        nama_peminjam: nama,
        book_id: bookId,
        judul_buku: book ? book.judul : 'Buku',
        tanggal_pinjam: tgl,
        tanggal_kembali: null,
        status: 'dipinjam'
    });
    
    if(book && book.stok > 0) {
        book.stok -= 1;
        saveBooks(books);
    }
    localStorage.setItem('peminjaman', JSON.stringify(list));
}

function renderCatalog() {
    initDefaultData();
    const grid = document.getElementById('catalogGrid');
    if(!grid) return;
    const books = getBooks();
    
    grid.innerHTML = books.map(b => `
        <div class="card-book">
            <img src="${b.cover}" alt="Cover Buku">
            <div class="card-body">
                <div>
                    <h3>${b.judul}</h3>
                    <p>${b.penulis} • Stok: ${b.stok}</p>
                    <p style="font-size: 12px; color: var(--sage-accent);">ISBN: ${b.isbn}</p>
                </div>
                <a href="peminjaman.html?book_id=${b.id}" class="btn-pill" style="text-align: center;">Pinjam Buku</a>
            </div>
        </div>
    `).join('');
}

function renderAdminTables() {
    const bookTable = document.getElementById('adminBookTable');
    if(bookTable) {
        const books = getBooks();
        bookTable.innerHTML = books.map(b => `
            <tr>
                <td>${b.id}</td>
                <td>${b.judul}</td>
                <td>${b.penulis}</td>
                <td>${b.kategori}</td>
                <td>${b.isbn}</td>
                <td>${b.stok}</td>
                <td><button onclick="deleteBook(${b.id})" style="background:#d9534f; color:white; border:none; padding:5px 12px; border-radius:15px; cursor:pointer;">Hapus</button></td>
            </tr>
        `).join('');
    }

    const trxTable = document.getElementById('adminTrxTable');
    if(trxTable) {
        const list = getPeminjaman();
        trxTable.innerHTML = list.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.nama_peminjam}</td>
                <td>${p.judul_buku}</td>
                <td>${p.tanggal_pinjam}</td>
                <td>${p.tanggal_kembali || '-'}</td>
                <td><span style="background: var(--sage-light); padding: 5px 12px; border-radius: 20px; color: var(--primary-green); font-weight:600;">${p.status}</span></td>
                <td>${p.status === 'dipinjam' ? `<button onclick="returnBook(${p.id})" style="background:var(--primary-green); color:white; border:none; padding:5px 12px; border-radius:15px; cursor:pointer;">Kembalikan</button>` : 'Selesai'}</td>
            </tr>
        `).join('');
    }
}

function addBook(book) {
    const books = getBooks();
    book.id = Date.now();
    books.push(book);
    saveBooks(books);
}

function deleteBook(id) {
    let books = getBooks();
    books = books.filter(b => b.id !== id);
    saveBooks(books);
    renderAdminTables();
}

function returnBook(id) {
    const list = getPeminjaman();
    const trx = list.find(p => p.id === id);
    if(trx) {
        trx.status = 'dikembalikan';
        trx.tanggal_kembali = new Date().toISOString().split('T')[0];
        
        const books = getBooks();
        const book = books.find(b => b.id == trx.book_id);
        if(book) {
            book.stok += 1;
            saveBooks(books);
        }
        localStorage.setItem('peminjaman', JSON.stringify(list));
        renderAdminTables();
    }
}

function checkLogin(user, pass) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.some(u => u.username === user && u.password === pass);
}

function registerAdmin(user, pass) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ username: user, password: pass });
    localStorage.setItem('users', JSON.stringify(users));
}

// Live Search Filter di Beranda
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchBook');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.card-book');
            cards.forEach(card => {
                const title = card.querySelector('h3').innerText.toLowerCase();
                card.style.display = title.includes(term) ? 'flex' : 'none';
            });
        });
    }
});