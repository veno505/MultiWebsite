-- Minigames.luau : bank soal coding. Kunci jawaban TIDAK dikirim ke client (anti-cheat).
local Minigames = {}

local BANK = {
	debug = {
		{ q = "Kode ini seharusnya menjumlahkan 1..n. Apa bug-nya?", code = "function sum(n)\n  local t = 0\n  for i = 1, n - 1 do t = t + i end\n  return t\nend", o = { "Loop harus sampai n", "t harus mulai dari 1", "return di dalam loop", "Tidak ada bug" }, a = 1 },
		{ q = "Mengapa output nil?", code = "local nama = 'Budi'\nprint(Nama)", o = { "Lua/Luau case-sensitive", "Kurang titik koma", "String harus kutip dua", "print salah" }, a = 1 },
		{ q = "Kondisi ini selalu error. Perbaikan?", code = "local x = 5\nif x = 10 then\n  print('sepuluh')\nend", o = { "Pakai x == 10", "Pakai x := 10", "Hapus if", "Pakai x =< 10" }, a = 1 },
		{ q = "Program ini tidak pernah berhenti. Penyebab?", code = "local i = 0\nwhile i < 5 do\n  print(i)\nend", o = { "Lupa menaikkan i", "Harus pakai for", "Kurang local", "print salah" }, a = 1 },
		{ q = "Python: apa bug-nya?", code = "def halo(nama):\nprint('Halo ' + nama)", o = { "Kurang indentasi body fungsi", "Kurang kurung kurawal", "def harus function", "Kurang titik koma" }, a = 1 },
	},
	db = {
		{ q = "Perintah membuat tabel baru?", o = { "CREATE TABLE", "MAKE TABLE", "NEW TABLE", "ADD TABLE" }, a = 1 },
		{ q = "Ambil mahasiswa dengan IPK > 3.5?", code = "SELECT * FROM mahasiswa ...", o = { "WHERE ipk > 3.5", "IF ipk > 3.5", "FILTER ipk > 3.5", "HAVING ipk" }, a = 1 },
		{ q = "Menggabungkan dua tabel berdasarkan kunci yang sama?", o = { "JOIN", "MERGE", "LINK", "CONNECT" }, a = 1 },
		{ q = "Kunci unik pengenal baris disebut?", o = { "Primary key", "Foreign key", "Index key", "Secret key" }, a = 1 },
		{ q = "Menghitung jumlah baris?", code = "SELECT ____(*) FROM mahasiswa;", o = { "COUNT", "SUM", "TOTAL", "LEN" }, a = 1 },
	},
	web = {
		{ q = "Tag untuk judul utama halaman?", o = { "<h1>", "<div>", "<b>", "<title2>" }, a = 1 },
		{ q = "CSS agar teks rata tengah?", o = { "text-align: center", "float: center", "align: middle", "position: center" }, a = 1 },
		{ q = "JavaScript: menangani klik tombol dengan benar?", o = { "button.addEventListener('click', fn)", "button.click = fn()", "onclick(button) => fn", "button.on = fn" }, a = 1 },
		{ q = "CSS agar tampilan menyesuaikan layar HP?", o = { "Media query", "Float", "Z-index", "Overflow" }, a = 1 },
		{ q = "Atribut agar link terbuka di tab baru?", o = { "target=\"_blank\"", "open=\"new\"", "href=\"tab\"", "rel=\"tab\"" }, a = 1 },
	},
	algo = {
		{ q = "Kompleksitas waktu binary search?", o = { "O(log n)", "O(n)", "O(n log n)", "O(1)" }, a = 1 },
		{ q = "Sorting yang membandingkan pasangan bersebelahan berulang?", o = { "Bubble sort", "Binary search", "Hashing", "Quick select" }, a = 1 },
		{ q = "Struktur data LIFO?", o = { "Stack", "Queue", "Tree", "Graph" }, a = 1 },
		{ q = "Belah ketupat pada flowchart melambangkan?", o = { "Keputusan", "Proses", "Mulai/selesai", "Input/output" }, a = 1 },
		{ q = "Mencari satu per satu dari awal disebut?", o = { "Linear search", "Binary search", "Jump search", "Hash search" }, a = 1 },
	},
	ai = {
		{ q = "Model sangat bagus di data latih tapi buruk di data baru. Disebut?", o = { "Overfitting", "Underfitting", "Normalisasi", "Regularisasi" }, a = 1 },
		{ q = "Learning rate terlalu besar menyebabkan?", o = { "Training tidak stabil/divergen", "Training pasti cepat bagus", "Model otomatis akurat", "Data bertambah" }, a = 1 },
		{ q = "Data dibagi train/test untuk?", o = { "Menguji generalisasi model", "Mempercepat internet", "Menghapus bias", "Mengurangi fitur" }, a = 1 },
		{ q = "Algoritma yang mengelompokkan data tanpa label?", o = { "K-Means", "Linear Regression", "Naive Bayes", "Logistic Regression" }, a = 1 },
		{ q = "Fungsi aktivasi umum pada hidden layer?", o = { "ReLU", "Print", "Sort", "Join" }, a = 1 },
	},
	cyber = {
		{ q = "Serangan menyisipkan SQL lewat input form?", o = { "SQL Injection", "Phishing", "DDoS", "Spoofing" }, a = 1 },
		{ q = "Cara terbaik mencegah SQL Injection?", o = { "Prepared statement", "Menyembunyikan form", "Memperbesar font", "Menghapus database" }, a = 1 },
		{ q = "Password disimpan dengan?", o = { "Hash + salt", "Teks biasa", "Base64", "Kolom tersembunyi" }, a = 1 },
		{ q = "Serangan membanjiri server dengan trafik?", o = { "DDoS", "XSS", "CSRF", "MITM" }, a = 1 },
		{ q = "Email palsu yang meminta password disebut?", o = { "Phishing", "Patching", "Hashing", "Caching" }, a = 1 },
	},
}

local function shuffle(t)
	for i = #t, 2, -1 do
		local j = math.random(i)
		t[i], t[j] = t[j], t[i]
	end
	return t
end

-- return payload untuk client (tanpa kunci) dan answers (disimpan server)
function Minigames.create(kind, count)
	local bank = BANK[kind] or BANK.debug
	local pool = shuffle({ table.unpack(bank) })
	local questions, answers = {}, {}
	for i = 1, math.min(count or 3, #pool) do
		local src = pool[i]
		local opts = {}
		for idx, text in ipairs(src.o) do
			-- opsi pertama (idx 1) adalah salah satu opsi; kunci = src.a
			table.insert(opts, { text = text, correct = (idx == src.a) })
		end
		shuffle(opts)
		local correctIdx = 1
		local texts = {}
		for idx, o in ipairs(opts) do
			texts[idx] = o.text
			if o.correct then correctIdx = idx end
		end
		table.insert(questions, { q = src.q, code = src.code, options = texts })
		table.insert(answers, correctIdx)
	end
	return questions, answers
end

return Minigames
