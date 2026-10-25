-- Config.luau : konfigurasi bersama (server + client)
local Config = {}

Config.TITLE = "INFORMATIKA CAMPUS LIFE: UNIVERSITY SIMULATOR"
Config.DAY_SECONDS = 240        -- 1 hari game = 4 menit nyata
Config.SEMESTER_DAYS = 10       -- 1 semester = 10 hari game
Config.UTS_DAY = 5
Config.START_MONEY = 300
Config.MAX_SEM = 8

Config.SKILLS = {
	prog = "Programming", db = "Database", web = "Web Development",
	ai = "Artificial Intelligence", sec = "Cyber Security", se = "Software Engineering",
}

-- skill yang dilatih tiap jenis mini game
Config.KIND_SKILL = { debug = "prog", db = "db", web = "web", algo = "prog", ai = "ai", cyber = "sec" }
Config.KIND_TITLE = {
	debug = "Debugging Challenge", db = "Database Lab", web = "Web Design Studio",
	algo = "Algorithm Puzzle", ai = "AI Training Lab", cyber = "Cyber Security Mission",
}

Config.COURSES = {
	[1] = { { id = "c1", name = "Programming Fundamental", skill = "prog" }, { id = "c2", name = "Algoritma & Struktur Data", skill = "prog" }, { id = "c3", name = "Pengantar Teknologi Informasi", skill = "se" } },
	[2] = { { id = "c4", name = "Web Development", skill = "web" }, { id = "c5", name = "Database System", skill = "db" }, { id = "c6", name = "Sistem Operasi", skill = "sec" } },
	[3] = { { id = "c7", name = "Software Engineering", skill = "se" }, { id = "c8", name = "Jaringan Komputer", skill = "sec" }, { id = "c9", name = "Pemrograman Mobile", skill = "web" } },
	[4] = { { id = "c10", name = "Artificial Intelligence", skill = "ai" }, { id = "c11", name = "Data Science", skill = "db" }, { id = "c12", name = "Cyber Security", skill = "sec" } },
	[5] = { { id = "c13", name = "Machine Learning", skill = "ai" }, { id = "c14", name = "Cloud Computing", skill = "se" }, { id = "c15", name = "Metodologi Penelitian", skill = "se" } },
	[6] = { { id = "c16", name = "Internet of Things", skill = "sec" }, { id = "c17", name = "Advanced Web", skill = "web" }, { id = "c18", name = "Advanced Database", skill = "db" } },
	[7] = { { id = "c19", name = "Deep Learning", skill = "ai" }, { id = "c20", name = "Rekayasa Lanjut", skill = "se" }, { id = "c21", name = "Kewirausahaan Digital", skill = "se" } },
	[8] = { { id = "c22", name = "Tugas Akhir", skill = "prog" } },
}

Config.CAREERS = {
	se = { name = "Software Engineer", pay = 120, skills = { "prog" } },
	ai = { name = "AI Engineer", pay = 140, skills = { "ai" } },
	ds = { name = "Data Scientist", pay = 130, skills = { "db", "ai" } },
	sec = { name = "Cyber Security Analyst", pay = 135, skills = { "sec" } },
	gd = { name = "Game Developer", pay = 110, skills = { "prog", "web" } },
	sf = { name = "Startup Founder", pay = 90, skills = { "se" } },
}
Config.CAREER_LEVELS = { "Junior", "Middle", "Senior", "Expert" }
Config.CAREER_XP = { 0, 5, 15, 30 } -- shift kerja untuk naik level

-- Pakaian (diterapkan lewat BodyColors; ganti ke Shirt/Pants asset ID bila punya)
Config.OUTFITS = {
	{ name = "Kemeja Mahasiswa", color = Color3.fromRGB(235, 235, 228) },
	{ name = "Hoodie Informatika", color = Color3.fromRGB(70, 110, 150) },
	{ name = "Jaket Kampus", color = Color3.fromRGB(60, 110, 70) },
}

-- Isi ID animasi (rbxassetid://...) dari Roblox Creator Store / animasi buatan sendiri.
-- Dibiarkan kosong = memakai animasi default Roblox.
Config.ANIMATIONS = { typing = "", reading = "", presenting = "" }

Config.DIALOG = {
	dosen = {
		"Rajin hadir dan kerjakan latihan di lab. Nilai akan mengikuti.",
		"UTS di hari ke-5, UAS di hari ke-10. Jangan menunda belajar!",
		"Bagus, tugasmu mulai rapi. Perhatikan struktur kode dan komentar.",
	},
	rajin = { "Mau belajar bareng? Aku jelasin materi hari ini.", "Catat dulu, baru coding. Itu rahasiaku." },
	pemalas = { "Ah, tugas masih lama. Ngopi dulu yuk?", "Deadline? Nanti aja... eh udah besok!" },
	ambisius = { "IPK-ku harus 4.0. Berani tanding puzzle algoritma?", "Aku mau juara hackathon tahun ini." },
	senior = { "Kakak tingkat kasih tips: bangun portofolio dari semester awal.", "Ikut hackathon, banyak relasi dan pengalaman." },
	satpam = { "Selamat datang di kampus! Hati-hati di jalan.", "Parkir motor di sebelah kiri ya." },
	staff = { "Selamat datang di Fakultas Informatika. Kelas ada di Lantai 2, Lab di Lantai 3.", "Innovation Center ada di Lantai 4." },
	hr = { "Kami membuka internship dan lowongan kerja.", "Portofolio dan skill adalah kunci interview." },
}

return Config
