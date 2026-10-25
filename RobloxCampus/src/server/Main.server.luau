-- Main.server.luau : inti game (data, kebutuhan, akademik, event, karier, party)
local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local CS = game:GetService("CollectionService")
local Lighting = game:GetService("Lighting")
local RunService = game:GetService("RunService")
local DataStoreService = game:GetService("DataStoreService")

local Config = require(RS.Shared.Config)
local MapBuilder = require(script.Parent.Modules.MapBuilder)
local Minigames = require(script.Parent.Modules.Minigames)
local NPCs = require(script.Parent.Modules.NPCs)

-------------------------------------------------------------------- remotes
local Remotes = Instance.new("Folder")
Remotes.Name = "Remotes"
Remotes.Parent = RS
local function remote(name)
	local r = Instance.new("RemoteEvent")
	r.Name = name
	r.Parent = Remotes
	return r
end
local R = {
	Stats = remote("Stats"), Notify = remote("Notify"), Minigame = remote("Minigame"),
	Submit = remote("Submit"), OpenCareer = remote("OpenCareer"), ChooseCareer = remote("ChooseCareer"),
	Party = remote("Party"), PartyInvite = remote("PartyInvite"),
}

MapBuilder.build()

-------------------------------------------------------------------- data
local store = DataStoreService:GetDataStore("InformatikaCampusLife_v1")
local profiles = {}   -- [Player] = profile
local sessions = {}   -- [Player] = minigame session
local cooldowns = {}  -- [Player] = { [key] = time }
local parties = {}    -- [userId] = leaderUserId
local pendingInvite = {}

local function newProfile()
	return {
		sem = 1, day = 1, money = Config.START_MONEY, energy = 100, stress = 10, happy = 70,
		xp = { prog = 0, db = 0, web = 0, ai = 0, sec = 0, se = 0 },
		courses = {}, att = {}, hist = {}, career = nil, clvl = 1, cxp = 0, graduated = false,
		shirt = 1, laptop = 0, decor = 0, intern = false, evDone = {}, quests = {},
		stats = { classes = 0, games = 0, study = 0, talk = 0, events = 0, work = 0 },
	}
end

local function merge(base, saved)
	for k, v in pairs(saved) do
		if type(v) == "table" and type(base[k]) == "table" then merge(base[k], v) else base[k] = v end
	end
	return base
end

local function courseList(prof) return Config.COURSES[math.min(prof.sem, Config.MAX_SEM)] or {} end
local function ensureCourses(prof)
	for _, c in ipairs(courseList(prof)) do
		prof.courses[c.id] = prof.courses[c.id] or { m = 0, att = 0, uts = nil, uas = nil }
	end
end
local function level(prof, skill)
	return math.clamp(math.floor(math.sqrt((prof.xp[skill] or 0) / 2)) + 1, 1, 100)
end
local function gradePoint(sc) return sc >= 85 and 4 or sc >= 78 and 3.5 or sc >= 70 and 3 or sc >= 62 and 2.5 or sc >= 55 and 2 or sc >= 45 and 1 or 0 end
local function gradeLetter(sc) return sc >= 85 and "A" or sc >= 78 and "AB" or sc >= 70 and "B" or sc >= 62 and "BC" or sc >= 55 and "C" or sc >= 45 and "D" or "E" end
local function gpa(prof)
	if #prof.hist == 0 then return 0 end
	local t = 0
	for _, h in ipairs(prof.hist) do t += gradePoint(h.score) end
	return t / #prof.hist
end

local QUESTS = {
	{ t = "Ikuti Orientation Day di panggung event", f = function(p) return p.evDone["orient_1"] == true end },
	{ t = "Hadiri kelas pertamamu (podium dosen, Lantai 2)", f = function(p) return p.stats.classes >= 1 end },
	{ t = "Selesaikan mini game coding di komputer lab", f = function(p) return p.stats.games >= 1 end },
	{ t = "Belajar di perpustakaan 3 kali", f = function(p) return p.stats.study >= 3 end },
	{ t = "Ngobrol dengan 3 NPC", f = function(p) return p.stats.talk >= 3 end },
	{ t = "Selesaikan Semester 1", f = function(p) return p.sem >= 2 end },
	{ t = "Capai IPK 3.0", f = function(p) return #p.hist >= 3 and gpa(p) >= 3 end },
	{ t = "Ikuti 3 event kampus", f = function(p) return p.stats.events >= 3 end },
	{ t = "Lulus dari universitas", f = function(p) return p.graduated end },
}

local function currentQuest(prof)
	for i, q in ipairs(QUESTS) do
		if not prof.quests[tostring(i)] then return i, q end
	end
end

local function notify(p, text, kind, speaker)
	R.Notify:FireClient(p, text, kind or "info", speaker)
end

local function push(p)
	local prof = profiles[p]
	if not prof then return end
	local cs = {}
	for _, c in ipairs(courseList(prof)) do
		local d = prof.courses[c.id] or { m = 0, att = 0 }
		table.insert(cs, { name = c.name, m = d.m, att = d.att, uts = d.uts, uas = d.uas })
	end
	local skills = {}
	for k in pairs(Config.SKILLS) do skills[k] = level(prof, k) end
	local qi, q = currentQuest(prof)
	R.Stats:FireClient(p, {
		name = p.DisplayName, sem = prof.sem, day = prof.day, maxDay = Config.SEMESTER_DAYS,
		gpa = gpa(prof), money = prof.money, energy = prof.energy, stress = prof.stress, happy = prof.happy,
		quest = q and q.t or "Semua quest selesai!", courses = cs, skills = skills,
		graduated = prof.graduated,
		career = prof.career and (Config.CAREER_LEVELS[prof.clvl] .. " " .. Config.CAREERS[prof.career].name) or nil,
	})
	local ls = p:FindFirstChild("leaderstats")
	if ls then
		ls.Semester.Value = prof.graduated and 9 or prof.sem
		ls.IPK.Value = math.floor(gpa(prof) * 100) / 100
		ls.Uang.Value = prof.money
	end
end

local function checkQuests(p)
	local prof = profiles[p]
	for i, q in ipairs(QUESTS) do
		if not prof.quests[tostring(i)] and q.f(prof) then
			prof.quests[tostring(i)] = true
			prof.money += 100
			notify(p, "Quest selesai: " .. q.t .. " (+Rp100)", "quest")
		end
	end
end

local function save(p)
	local prof = profiles[p]
	if not prof then return end
	pcall(function() store:SetAsync("u" .. p.UserId, prof) end)
end

-------------------------------------------------------------------- efek
local function happyMul(prof) return 0.75 + prof.happy / 200 end
local function applyDelta(p, o)
	local prof = profiles[p]
	prof.energy = math.clamp(prof.energy + (o.energy or 0), 0, 100)
	prof.stress = math.clamp(prof.stress + (o.stress or 0), 0, 100)
	prof.happy = math.clamp(prof.happy + (o.happy or 0), 0, 100)
	prof.money += (o.money or 0)
	if o.skill and o.xp then
		local mul = (1 + 0.15 * prof.laptop) * happyMul(prof)
		prof.xp[o.skill] += o.xp * mul
	end
end

local function lowestCourse(prof)
	local best, bd
	for _, c in ipairs(courseList(prof)) do
		local d = prof.courses[c.id]
		if d and (not bd or d.m < bd.m) then best, bd = c, d end
	end
	return best, bd
end

local function addMastery(prof, skill, v)
	local got = false
	for _, c in ipairs(courseList(prof)) do
		if skill == nil or c.skill == skill then
			local d = prof.courses[c.id]
			d.m = math.clamp(d.m + v * happyMul(prof), 0, 100)
			got = true
		end
	end
	if not got then
		local _, d = lowestCourse(prof)
		if d then d.m = math.clamp(d.m + v * happyMul(prof), 0, 100) end
	end
end

local function onCooldown(p, prompt, cd)
	cooldowns[p] = cooldowns[p] or {}
	local key = prompt
	local now = os.clock()
	if cooldowns[p][key] and now - cooldowns[p][key] < cd then return true end
	cooldowns[p][key] = now
	return false
end

-------------------------------------------------------------------- event kampus
local function currentEvent(prof)
	if prof.graduated then return nil end
	local s, d = prof.sem, prof.day
	if s == 1 and d == 1 then return { id = "orient", name = "Orientation Day" } end
	if s % 2 == 0 and d == 6 then return { id = "hack", name = "Hackathon" } end
	if s % 2 == 1 and s > 1 and d == 4 then return { id = "fest", name = "Tech Festival" } end
	if s >= 7 and d == 5 then return { id = "job", name = "Job Fair" } end
	return nil
end

local function doEvent(p, prof)
	if prof.graduated then
		notify(p, "Kamu sudah lulus. Wisuda sudah dilaksanakan!", "info")
		return
	end
	local ev = currentEvent(prof)
	if not ev then
		notify(p, "Belum ada event hari ini. Cek papan pengumuman!", "info")
		return
	end
	local key = ev.id .. "_" .. prof.sem
	if ev.id == "orient" then key = "orient_1" end
	if prof.evDone[key] then
		notify(p, "Kamu sudah mengikuti " .. ev.name .. ".", "info")
		return
	end
	prof.evDone[key] = true
	prof.stats.events += 1
	if ev.id == "orient" then
		applyDelta(p, { happy = 15, money = 50 })
		notify(p, "Orientation Day: kamu mengenal kampus dan teman baru! (+Rp50)", "event")
	elseif ev.id == "hack" then
		local qs, ans = Minigames.create("debug", 3)
		sessions[p] = { answers = ans, kind = "debug", pay = 200, bonus = "hack" }
		R.Minigame:FireClient(p, "Hackathon: " .. Config.KIND_TITLE.debug, qs)
		return
	elseif ev.id == "fest" then
		applyDelta(p, { happy = 20, stress = -15, skill = "se", xp = 40, money = 80 })
		notify(p, "Tech Festival: pameran teknologi sangat inspiratif! (+Rp80)", "event")
	elseif ev.id == "job" then
		prof.intern = true
		applyDelta(p, { money = 200, skill = "se", xp = 40, happy = 8 })
		notify(p, "Job Fair: kamu dapat tawaran internship dan Rp200!", "event")
	end
	checkQuests(p)
	push(p)
end

-------------------------------------------------------------------- hari / semester
local function announce(text)
	for _, p in ipairs(Players:GetPlayers()) do notify(p, text, "event") end
end

local function examScore(prof, c, base)
	local d = prof.courses[c.id]
	local lv = level(prof, c.skill)
	return math.clamp(math.floor(d.m * 0.8 + lv * 0.2 + math.random(0, 8) - 2 + base), 0, 100)
end

local function endSemester(p, prof)
	local rows = {}
	local list = courseList(prof)
	for _, c in ipairs(list) do
		local d = prof.courses[c.id]
		local attPct = math.clamp(d.att / Config.SEMESTER_DAYS, 0, 1) * 100
		local score = math.floor(math.clamp(attPct * 0.1 + (d.uts or 0) * 0.25 + (d.uas or 0) * 0.65, 0, 100))
		table.insert(prof.hist, { sem = prof.sem, name = c.name, score = score })
		table.insert(rows, c.name .. ": " .. score .. " (" .. gradeLetter(score) .. ")")
	end
	notify(p, "Hasil Semester " .. prof.sem .. " | " .. table.concat(rows, " | "), "result")
	if prof.sem >= Config.MAX_SEM then
		prof.graduated = true
		prof.money += 500
		applyDelta(p, { happy = 30, stress = -40 })
		notify(p, string.format("GRADUATION DAY! Selamat %s, kamu lulus dengan IPK %.2f. Pilih karier di Terminal Karier (Lantai 4).", p.DisplayName, gpa(prof)), "big")
		announce(p.DisplayName .. " telah diwisuda!")
	else
		prof.sem += 1
		prof.day = 1
		prof.courses = {}
		prof.att = {}
		ensureCourses(prof)
		prof.money += 150
		notify(p, "Selamat datang di Semester " .. prof.sem .. "! (bonus libur +Rp150)", "big")
	end
end

local function newDay()
	for p, prof in pairs(profiles) do
		if prof.graduated then
			prof.day += 1
		else
			-- absen tidak hadir menambah stres
			prof.att = {}
			prof.day += 1
			if prof.day >= Config.SEMESTER_DAYS - 2 then prof.stress = math.clamp(prof.stress + 8, 0, 100) end
			prof.money += 25 -- uang saku harian
			if prof.day == Config.UTS_DAY + 1 then
				for _, c in ipairs(courseList(prof)) do prof.courses[c.id].uts = examScore(prof, c, 0) end
				prof.stress = math.clamp(prof.stress + 10, 0, 100)
				notify(p, "UTS selesai! Cek jadwal & nilai (tekan tombol Jadwal).", "event")
			end
			if prof.day > Config.SEMESTER_DAYS then
				for _, c in ipairs(courseList(prof)) do prof.courses[c.id].uas = examScore(prof, c, 0) end
				endSemester(p, prof)
			else
				local ev = currentEvent(prof)
				if ev then notify(p, "Event hari ini: " .. ev.name .. " di Panggung Event dekat gerbang!", "event") end
			end
		end
		if prof.career then prof.cxp += 0 end
		checkQuests(p)
		push(p)
	end
end

-- siklus siang malam
task.spawn(function()
	local clock = 7
	while true do
		local dt = task.wait(0.5)
		local prevDay = math.floor(clock / 24)
		clock += 24 / Config.DAY_SECONDS * dt
		Lighting.ClockTime = clock % 24
		if clock >= 24 then
			clock -= 24
			newDay()
		end
	end
end)

-- kebutuhan: energi turun pelan, stres berpengaruh
task.spawn(function()
	while true do
		task.wait(20)
		for p, prof in pairs(profiles) do
			prof.energy = math.clamp(prof.energy - 1, 0, 100)
			if prof.stress >= 85 then
				prof.happy = math.clamp(prof.happy - 2, 0, 100)
				prof.energy = math.clamp(prof.energy - 1, 0, 100)
			end
			local hum = p.Character and p.Character:FindFirstChildOfClass("Humanoid")
			if hum then hum.WalkSpeed = prof.energy <= 5 and 8 or 16 end
			push(p)
		end
	end
end)

-------------------------------------------------------------------- aksi prompt
local function doCode(p, prof, prompt)
	local kind = prompt:GetAttribute("Kind") or "debug"
	if prof.energy < 10 then notify(p, "Terlalu lelah untuk coding. Makan atau tidur dulu!", "bad") return end
	local qs, ans = Minigames.create(kind, 3)
	sessions[p] = { answers = ans, kind = kind, pay = prompt:GetAttribute("Pay") or 20 }
	R.Minigame:FireClient(p, Config.KIND_TITLE[kind] or "Coding", qs)
end

local function partyShare(p, skill, xp)
	local leader = parties[p.UserId]
	if not leader then return end
	for _, other in ipairs(Players:GetPlayers()) do
		if other ~= p and parties[other.UserId] == leader and profiles[other] then
			local a, b = p.Character, other.Character
			if a and b and a.PrimaryPart and b.PrimaryPart and (a.PrimaryPart.Position - b.PrimaryPart.Position).Magnitude < 80 then
				applyDelta(other, { skill = skill, xp = xp * 0.3, happy = 2 })
				notify(other, p.DisplayName .. " membagikan bonus project kelompok!", "info")
				push(other)
			end
		end
	end
end

R.Submit.OnServerEvent:Connect(function(p, picks)
	local s, prof = sessions[p], profiles[p]
	sessions[p] = nil
	if not s or not prof or type(picks) ~= "table" then return end
	local ok = 0
	for i, a in ipairs(s.answers) do
		if picks[i] == a then ok += 1 end
	end
	local ratio = ok / #s.answers
	local skill = Config.KIND_SKILL[s.kind]
	local xp = 30 * ratio + 5
	local pay = math.floor(s.pay * ratio)
	if s.bonus == "hack" then
		if ratio >= 0.66 then pay += 250; notify(p, "Tim kamu juara Hackathon! Hadiah +Rp250", "event") end
	end
	applyDelta(p, { energy = -12, stress = ratio >= 0.6 and 2 or 5, happy = ratio >= 0.6 and 3 or -2, money = pay, skill = skill, xp = xp })
	addMastery(prof, skill, 6 * ratio + 1)
	prof.stats.games += 1
	partyShare(p, skill, xp)
	notify(p, string.format("%s: %d/%d benar. +%d XP %s, +Rp%d", Config.KIND_TITLE[s.kind] or "Mini game", ok, #s.answers, math.floor(xp), Config.SKILLS[skill], pay), ratio >= 0.6 and "good" or "bad")
	checkQuests(p)
	push(p)
end)

local function doClass(p, prof, prompt)
	if prof.graduated then notify(p, "Kamu sudah lulus.", "info") return end
	if prof.energy < 10 then notify(p, "Terlalu lelah untuk kuliah.", "bad") return end
	for _, c in ipairs(courseList(prof)) do
		if not prof.att[c.id] then
			prof.att[c.id] = true
			local d = prof.courses[c.id]
			d.att += 1
			d.m = math.clamp(d.m + 8 * happyMul(prof), 0, 100)
			applyDelta(p, { energy = -10, stress = 3, skill = c.skill, xp = 8 })
			prof.stats.classes += 1
			local lines = Config.DIALOG.dosen
			notify(p, "Kelas " .. c.name .. " dimulai. Dosen: \"" .. lines[math.random(#lines)] .. "\"", "dialog", "Dosen")
			checkQuests(p) push(p)
			return
		end
	end
	notify(p, "Semua kelas hari ini sudah kamu hadiri.", "info")
end

local function doNPC(p, prof, prompt)
	local role = prompt:GetAttribute("Role")
	local name = prompt:GetAttribute("NPCName") or "NPC"
	local lines = Config.DIALOG[role] or { "Halo!" }
	prof.stats.talk += 1
	notify(p, lines[math.random(#lines)], "dialog", name)
	if role == "dosen" then
		local _, d = lowestCourse(prof)
		if d then d.m = math.clamp(d.m + 4, 0, 100) end
		applyDelta(p, { stress = 2, skill = "se", xp = 4 })
		notify(p, "Feedback dosen: tugasmu mulai membaik (+4 penguasaan).", "info")
	elseif role == "rajin" then
		addMastery(prof, nil, 5)
		applyDelta(p, { happy = 2, energy = -3 })
		notify(p, "Belajar bareng: penguasaan materi naik.", "info")
	elseif role == "pemalas" then
		if prof.money >= 10 then
			applyDelta(p, { happy = 8, stress = -8, money = -10 })
			notify(p, "Nongkrong bareng: stres turun. (-Rp10)", "info")
		end
	elseif role == "ambisius" then
		doCode(p, prof, { GetAttribute = function(_, k) return k == "Kind" and "algo" or 40 end })
	elseif role == "senior" then
		applyDelta(p, { skill = "se", xp = 12, happy = 2 })
		notify(p, "Tips senior: +12 XP Software Engineering.", "info")
	elseif role == "hr" then
		if prof.sem >= 5 and prof.intern and not prof.graduated then
			applyDelta(p, { money = 150, skill = "prog", xp = 30, energy = -15, stress = 5 })
			notify(p, "Internship: kamu mendapat pengalaman kerja dan Rp150.", "good")
		elseif prof.sem >= 5 or prof.graduated then
			notify(p, "Ikuti Job Fair untuk membuka internship, atau gunakan Terminal Karier setelah lulus.", "info")
		else
			notify(p, "Internship dibuka untuk semester 5 ke atas.", "info")
		end
	end
	checkQuests(p) push(p)
end

local function doGeneric(p, prof, prompt)
	local cost = prompt:GetAttribute("Cost") or 0
	local en = prompt:GetAttribute("Energy") or 0
	if prof.money < cost then notify(p, "Uang tidak cukup (butuh Rp" .. cost .. ").", "bad") return end
	if en < 0 and prof.energy < -en then notify(p, "Energi tidak cukup. Makan atau tidur dulu!", "bad") return end
	applyDelta(p, {
		money = -cost, energy = en, stress = prompt:GetAttribute("Stress") or 0, happy = prompt:GetAttribute("Happy") or 0,
		skill = prompt:GetAttribute("Skill"), xp = prompt:GetAttribute("XP"),
	})
	notify(p, prompt:GetAttribute("Msg") or "Aktivitas selesai.", "good")
end

local function applyOutfit(p, prof)
	local char = p.Character
	if not char then return end
	local o = Config.OUTFITS[prof.shirt]
	local bc = char:FindFirstChildOfClass("BodyColors")
	if bc then
		bc.TorsoColor3 = o.color
		bc.LeftArmColor3 = o.color
		bc.RightArmColor3 = o.color
	end
end

local ACTIONS = {}
ACTIONS.Code = doCode
ACTIONS.Class = doClass
ACTIONS.NPC = doNPC
ACTIONS.Generic = doGeneric
ACTIONS.Event = function(p, prof) doEvent(p, prof) end
ACTIONS.Sleep = function(p, prof)
	applyDelta(p, { energy = 60, stress = -15, happy = 3 })
	local hum = p.Character and p.Character:FindFirstChildOfClass("Humanoid")
	notify(p, "Zzz... kamu tidur nyenyak. Energi pulih.", "good")
end
ACTIONS.Study = function(p, prof, prompt)
	if prof.energy < 8 then notify(p, "Terlalu lelah untuk belajar.", "bad") return end
	local place = prompt:GetAttribute("Place")
	local c = lowestCourse(prof)
	local bonus = place == "lib" and 1.3 or 1
	addMastery(prof, c and c.skill or nil, 7 * bonus)
	applyDelta(p, { energy = -8, stress = 2, skill = c and c.skill or "prog", xp = 8 * bonus })
	prof.stats.study += 1
	notify(p, "Belajar fokus. Penguasaan materi naik.", "good")
	checkQuests(p)
end
ACTIONS.Teleport = function(p, prof, prompt)
	local dest = prompt:GetAttribute("Dest")
	local root = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
	if dest and root then root.CFrame = CFrame.new(dest) end
end
ACTIONS.Wardrobe = function(p, prof)
	prof.shirt = prof.shirt % #Config.OUTFITS + 1
	applyOutfit(p, prof)
	notify(p, "Pakaian: " .. Config.OUTFITS[prof.shirt].name, "info")
end
ACTIONS.Decor = function(p, prof, prompt)
	local cost = prompt:GetAttribute("Cost") or 40
	if prof.money < cost then notify(p, "Uang tidak cukup.", "bad") return end
	prof.decor += 1
	applyDelta(p, { money = -cost, happy = 6 })
	notify(p, "Kamarmu makin nyaman! Dekorasi ke-" .. prof.decor, "good")
	local part = prompt.Parent
	if part and part.Parent then
		local d = Instance.new("Part")
		d.Anchored = true
		d.Size = Vector3.new(1.2, 1.2, 0.2)
		d.Color = Color3.fromHSV(math.random(), 0.35, 0.85)
		d.Position = part.Position + Vector3.new(math.random(-2, 2) * 0.8, math.random(-1, 1) * 1.2 - 2, -0.4)
		d.Parent = part.Parent
	end
end
ACTIONS.Upgrade = function(p, prof)
	local cost = 300 + prof.laptop * 400
	if prof.laptop >= 3 then notify(p, "Laptop sudah level maksimum.", "info") return end
	if prof.money < cost then notify(p, "Upgrade laptop butuh Rp" .. cost .. ".", "bad") return end
	prof.laptop += 1
	applyDelta(p, { money = -cost })
	notify(p, "Laptop di-upgrade ke level " .. prof.laptop .. ": XP +15% tiap level.", "good")
end
ACTIONS.Career = function(p, prof)
	if not prof.graduated then notify(p, "Karier terbuka setelah kamu lulus (Semester 8).", "info") return end
	if not prof.career then R.OpenCareer:FireClient(p) return end
	if prof.energy < 15 then notify(p, "Terlalu lelah untuk bekerja.", "bad") return end
	local job = Config.CAREERS[prof.career]
	local sk = 0
	for _, s in ipairs(job.skills) do sk += level(prof, s) end
	sk /= #job.skills
	local pay = math.floor(job.pay * (1 + (prof.clvl - 1) * 0.4) * (0.7 + sk / 150))
	applyDelta(p, { energy = -15, stress = 4, money = pay })
	prof.cxp += 1
	prof.stats.work += 1
	local need = Config.CAREER_XP[prof.clvl + 1]
	if need and prof.cxp >= need then
		prof.clvl += 1
		notify(p, "Promosi! Kamu kini " .. Config.CAREER_LEVELS[prof.clvl] .. " " .. job.name, "big")
	end
	notify(p, "Shift kerja selesai: +Rp" .. pay, "good")
end

local function handlePrompt(prompt, p)
	local prof = profiles[p]
	if not prof then return end
	local action = prompt:GetAttribute("Action")
	local fn = ACTIONS[action]
	if not fn then return end
	local cd = prompt:GetAttribute("CD") or 1.5
	if onCooldown(p, prompt, cd) then return end
	fn(p, prof, prompt)
	checkQuests(p)
	push(p)
end

local hooked = {}
local function hook(prompt)
	if hooked[prompt] then return end
	hooked[prompt] = true
	prompt.Triggered:Connect(function(p) handlePrompt(prompt, p) end)
end
CS:GetInstanceAddedSignal("Act"):Connect(hook)
for _, pr in ipairs(CS:GetTagged("Act")) do hook(pr) end

-------------------------------------------------------------------- karier & party
R.ChooseCareer.OnServerEvent:Connect(function(p, key)
	local prof = profiles[p]
	if not prof or not prof.graduated or prof.career then return end
	if type(key) ~= "string" or not Config.CAREERS[key] then return end
	prof.career = key
	prof.clvl = 1
	prof.cxp = 0
	notify(p, "Selamat! Kamu bekerja sebagai " .. Config.CAREERS[key].name .. ". Gunakan Terminal Karier untuk shift kerja.", "big")
	push(p)
end)

R.Party.OnServerEvent:Connect(function(p, action, targetId)
	if action == "invite" then
		local target = Players:GetPlayerByUserId(tonumber(targetId) or -1)
		if target and target ~= p then
			pendingInvite[target] = p
			R.PartyInvite:FireClient(target, p.DisplayName)
			notify(p, "Undangan party dikirim ke " .. target.DisplayName, "info")
		end
	elseif action == "accept" then
		local inviter = pendingInvite[p]
		if inviter and inviter.Parent then
			parties[inviter.UserId] = parties[inviter.UserId] or inviter.UserId
			parties[p.UserId] = parties[inviter.UserId]
			notify(p, "Kamu bergabung party " .. inviter.DisplayName .. ". Bonus XP kelompok aktif!", "good")
			notify(inviter, p.DisplayName .. " bergabung ke party.", "good")
		end
		pendingInvite[p] = nil
	elseif action == "leave" then
		parties[p.UserId] = nil
		notify(p, "Kamu keluar dari party.", "info")
	end
end)

-------------------------------------------------------------------- pemain
local function giveGear(p, char)
	local prof = profiles[p]
	if not prof then return end
	task.wait(0.5)
	applyOutfit(p, prof)
	local torso = char:FindFirstChild("UpperTorso") or char:FindFirstChild("Torso")
	if torso then
		local function attach(name, size, offset, color)
			local part = Instance.new("Part")
			part.Name = name
			part.Size = size
			part.Color = color
			part.Material = Enum.Material.Fabric
			part.CanCollide = false
			part.Massless = true
			part.CFrame = torso.CFrame * offset
			part.Parent = char
			local w = Instance.new("WeldConstraint")
			w.Part0 = torso
			w.Part1 = part
			w.Parent = part
		end
		attach("TasLaptop", Vector3.new(1.6, 1.8, 0.6), CFrame.new(0, 0, 0.7), Color3.fromRGB(70, 90, 80))
		attach("IDCard", Vector3.new(0.5, 0.7, 0.1), CFrame.new(0.5, 0.4, -0.55), Color3.fromRGB(235, 240, 245))
	end
	local function tool(name, color)
		if p.Backpack:FindFirstChild(name) then return end
		local t = Instance.new("Tool")
		t.Name = name
		t.RequiresHandle = true
		local h = Instance.new("Part")
		h.Name = "Handle"
		h.Size = name == "Smartphone" and Vector3.new(0.5, 1, 0.1) or Vector3.new(1.2, 0.2, 0.9)
		h.Color = color
		h.CanCollide = false
		h.Parent = t
		t.Parent = p.Backpack
	end
	tool("Laptop", Color3.fromRGB(80, 85, 90))
	tool("Buku", Color3.fromRGB(150, 100, 70))
	tool("Smartphone", Color3.fromRGB(40, 40, 45))
end

local function onJoin(p)
	local ls = Instance.new("Folder")
	ls.Name = "leaderstats"
	ls.Parent = p
	for _, n in ipairs({ { "Semester", "IntValue" }, { "IPK", "NumberValue" }, { "Uang", "IntValue" } }) do
		local v = Instance.new(n[2])
		v.Name = n[1]
		v.Parent = ls
	end
	local prof = newProfile()
	local ok, saved = pcall(function() return store:GetAsync("u" .. p.UserId) end)
	if ok and type(saved) == "table" then merge(prof, saved) end
	ensureCourses(prof)
	profiles[p] = prof
	p.CharacterAdded:Connect(function(char) task.spawn(giveGear, p, char) end)
	if p.Character then task.spawn(giveGear, p, p.Character) end
	task.wait(1)
	push(p)
	notify(p, "Selamat datang di " .. Config.TITLE .. "! Bangun pagi, ke kampus, ikuti kelas di Lantai 2 Fakultas. Tekan E untuk berinteraksi.", "big")
end

Players.PlayerAdded:Connect(onJoin)
for _, p in ipairs(Players:GetPlayers()) do task.spawn(onJoin, p) end
Players.PlayerRemoving:Connect(function(p)
	save(p)
	profiles[p], sessions[p], cooldowns[p], pendingInvite[p], parties[p.UserId] = nil, nil, nil, nil, nil
end)
task.spawn(function()
	while true do
		task.wait(60)
		for p in pairs(profiles) do save(p) end
	end
end)
game:BindToClose(function()
	for p in pairs(profiles) do save(p) end
end)

NPCs.init()
