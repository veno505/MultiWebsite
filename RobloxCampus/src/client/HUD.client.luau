-- HUD.client.luau : HUD natural-modern, notifikasi, dialog, mini game, karier, party/teman
local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local StarterGui = game:GetService("StarterGui")
local TweenService = game:GetService("TweenService")
local GuiService = game:GetService("GuiService")
local Workspace = game:GetService("Workspace")

local Config = require(RS:WaitForChild("Shared"):WaitForChild("Config"))
local Remotes = RS:WaitForChild("Remotes")
local player = Players.LocalPlayer

local COL = {
	forest = Color3.fromRGB(46, 94, 60), leaf = Color3.fromRGB(110, 160, 90), cream = Color3.fromRGB(246, 241, 226),
	wood = Color3.fromRGB(120, 85, 55), sky = Color3.fromRGB(120, 180, 215), ink = Color3.fromRGB(40, 48, 42),
	warn = Color3.fromRGB(200, 110, 80), gold = Color3.fromRGB(214, 170, 70),
}

local gui = Instance.new("ScreenGui")
gui.Name = "CampusUI"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = false
gui.Parent = player:WaitForChild("PlayerGui")

local scale = Instance.new("UIScale")
scale.Parent = gui
local function updateScale()
	local v = Workspace.CurrentCamera.ViewportSize
	scale.Scale = math.clamp(math.min(v.X / 1100, v.Y / 650), 0.65, 1.1)
end
updateScale()
Workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(updateScale)

local function make(class, props, parent)
	local o = Instance.new(class)
	for k, v in pairs(props) do o[k] = v end
	o.Parent = parent
	return o
end
local function round(o, r) make("UICorner", { CornerRadius = UDim.new(0, r or 10) }, o) end
local function stroke(o, c) make("UIStroke", { Color = c or COL.forest, Thickness = 1.5, Transparency = 0.2 }, o) end
local function text(parent, t, size, pos, sz, color, bold)
	return make("TextLabel", {
		BackgroundTransparency = 1, Text = t, TextSize = size, Position = pos, Size = sz,
		TextColor3 = color or COL.cream, Font = bold and Enum.Font.GothamBold or Enum.Font.Gotham,
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = true,
	}, parent)
end
local function button(parent, t, size, pos, sz, color)
	local b = make("TextButton", {
		Text = t, TextSize = size, Position = pos, Size = sz, BackgroundColor3 = color or COL.forest,
		TextColor3 = COL.cream, Font = Enum.Font.GothamBold, AutoButtonColor = true,
	}, parent)
	round(b, 8)
	return b
end

-------------------------------------------------------------------- HUD
local hud = make("Frame", { Position = UDim2.fromOffset(12, 12), Size = UDim2.fromOffset(300, 200), BackgroundColor3 = COL.forest, BackgroundTransparency = 0.12 }, gui)
round(hud, 14) stroke(hud, COL.leaf)
local lblName = text(hud, "Mahasiswa", 17, UDim2.fromOffset(12, 6), UDim2.fromOffset(276, 22), COL.cream, true)
local lblSem = text(hud, "Semester 1 · Hari 1/10", 13, UDim2.fromOffset(12, 28), UDim2.fromOffset(276, 18))
local lblGpa = text(hud, "IPK 0.00   Rp0", 14, UDim2.fromOffset(12, 46), UDim2.fromOffset(276, 20), COL.gold, true)
local bars = {}
local function bar(name, y, color)
	text(hud, name, 12, UDim2.fromOffset(12, y), UDim2.fromOffset(70, 16))
	local back = make("Frame", { Position = UDim2.fromOffset(84, y + 3), Size = UDim2.fromOffset(204, 10), BackgroundColor3 = Color3.fromRGB(28, 55, 36) }, hud)
	round(back, 5)
	local fill = make("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = color }, back)
	round(fill, 5)
	bars[name] = fill
end
bar("Energy", 72, COL.leaf)
bar("Stress", 92, COL.warn)
bar("Happy", 112, COL.sky)
local lblQuest = text(hud, "Quest: -", 12, UDim2.fromOffset(12, 134), UDim2.fromOffset(276, 62), COL.cream)
lblQuest.TextYAlignment = Enum.TextYAlignment.Top

-------------------------------------------------------------------- toast
local toastBox = make("Frame", { Position = UDim2.new(1, -332, 0, 12), Size = UDim2.fromOffset(320, 400), BackgroundTransparency = 1 }, gui)
make("UIListLayout", { Padding = UDim.new(0, 6), VerticalAlignment = Enum.VerticalAlignment.Top, HorizontalAlignment = Enum.HorizontalAlignment.Right }, toastBox)
local kindColor = { info = COL.forest, good = Color3.fromRGB(70, 130, 80), bad = COL.warn, quest = COL.gold, event = Color3.fromRGB(70, 120, 150), big = COL.wood, result = COL.wood }

local dialogFrame = make("Frame", { AnchorPoint = Vector2.new(0.5, 1), Position = UDim2.new(0.5, 0, 1, -16), Size = UDim2.fromOffset(560, 100), BackgroundColor3 = COL.cream, Visible = false }, gui)
round(dialogFrame, 14) stroke(dialogFrame, COL.wood)
local dName = text(dialogFrame, "", 16, UDim2.fromOffset(16, 8), UDim2.fromOffset(520, 22), COL.forest, true)
local dText = text(dialogFrame, "", 15, UDim2.fromOffset(16, 32), UDim2.fromOffset(528, 62), COL.ink)
dText.TextYAlignment = Enum.TextYAlignment.Top
local dialogToken = 0

local function toast(msg, kind)
	local f = make("Frame", { Size = UDim2.fromOffset(310, 10), AutomaticSize = Enum.AutomaticSize.Y, BackgroundColor3 = kindColor[kind] or COL.forest, BackgroundTransparency = 0.08 }, toastBox)
	round(f, 10)
	make("UIPadding", { PaddingTop = UDim.new(0, 8), PaddingBottom = UDim.new(0, 8), PaddingLeft = UDim.new(0, 10), PaddingRight = UDim.new(0, 10) }, f)
	local t = make("TextLabel", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, Text = msg, TextSize = 14, TextWrapped = true, TextColor3 = COL.cream, Font = Enum.Font.Gotham, TextXAlignment = Enum.TextXAlignment.Left }, f)
	task.delay(kind == "big" and 9 or 5, function()
		TweenService:Create(f, TweenInfo.new(0.4), { BackgroundTransparency = 1 }):Play()
		TweenService:Create(t, TweenInfo.new(0.4), { TextTransparency = 1 }):Play()
		task.wait(0.45)
		f:Destroy()
	end)
end

Remotes.Notify.OnClientEvent:Connect(function(msg, kind, speaker)
	if kind == "dialog" then
		dialogToken += 1
		local my = dialogToken
		dName.Text = speaker or "NPC"
		dText.Text = msg
		dialogFrame.Visible = true
		task.delay(6, function() if my == dialogToken then dialogFrame.Visible = false end end)
	else
		toast(msg, kind)
	end
end)

-------------------------------------------------------------------- stats
local stats = nil
Remotes.Stats.OnClientEvent:Connect(function(s)
	stats = s
	lblName.Text = s.name
	lblSem.Text = s.graduated and ("Lulus · " .. (s.career or "Belum memilih karier")) or ("Semester " .. s.sem .. " · Hari " .. math.min(s.day, s.maxDay) .. "/" .. s.maxDay)
	lblGpa.Text = string.format("IPK %.2f    Rp%d", s.gpa, s.money)
	TweenService:Create(bars.Energy, TweenInfo.new(0.3), { Size = UDim2.fromScale(s.energy / 100, 1) }):Play()
	TweenService:Create(bars.Stress, TweenInfo.new(0.3), { Size = UDim2.fromScale(s.stress / 100, 1) }):Play()
	TweenService:Create(bars.Happy, TweenInfo.new(0.3), { Size = UDim2.fromScale(s.happy / 100, 1) }):Play()
	lblQuest.Text = "Quest: " .. s.quest
end)

-------------------------------------------------------------------- panel generik
local function panel(title, w, h)
	local f = make("Frame", { AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Size = UDim2.fromOffset(w, h), BackgroundColor3 = COL.cream, Visible = false, ZIndex = 5 }, gui)
	round(f, 16) stroke(f, COL.wood)
	local head = make("Frame", { Size = UDim2.new(1, 0, 0, 40), BackgroundColor3 = COL.forest, ZIndex = 5 }, f)
	round(head, 16)
	text(head, title, 17, UDim2.fromOffset(16, 8), UDim2.new(1, -60, 0, 24), COL.cream, true).ZIndex = 6
	local x = button(head, "X", 15, UDim2.new(1, -36, 0, 6), UDim2.fromOffset(28, 28), COL.warn)
	x.ZIndex = 6
	x.MouseButton1Click:Connect(function() f.Visible = false end)
	local body = make("ScrollingFrame", { Position = UDim2.fromOffset(10, 48), Size = UDim2.new(1, -20, 1, -58), BackgroundTransparency = 1, ScrollBarThickness = 5, CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y, ZIndex = 5 }, f)
	make("UIListLayout", { Padding = UDim.new(0, 6) }, body)
	return f, body
end
local function line(body, t, color, size)
	local l = make("TextLabel", { BackgroundTransparency = 1, Size = UDim2.new(1, -8, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, Text = t, TextSize = size or 14, TextWrapped = true, TextColor3 = color or COL.ink, Font = Enum.Font.Gotham, TextXAlignment = Enum.TextXAlignment.Left, ZIndex = 6 }, body)
	return l
end
local function clear(body)
	for _, c in ipairs(body:GetChildren()) do
		if not c:IsA("UIListLayout") then c:Destroy() end
	end
end

-------------------------------------------------------------------- mini game
local mg, mgBody = panel("Mini Game", 520, 420)
mg.ZIndex = 8
Remotes.Minigame.OnClientEvent:Connect(function(title, questions)
	mg.Visible = true
	local picks, idx = {}, 1
	local function show()
		clear(mgBody)
		local q = questions[idx]
		line(mgBody, title .. "  (" .. idx .. "/" .. #questions .. ")", COL.forest, 16).Font = Enum.Font.GothamBold
		line(mgBody, q.q, COL.ink, 15)
		if q.code then
			local c = make("TextLabel", { Size = UDim2.new(1, -8, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundColor3 = Color3.fromRGB(38, 48, 42), Text = q.code, TextColor3 = Color3.fromRGB(200, 230, 190), TextSize = 13, Font = Enum.Font.Code, TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = true, ZIndex = 6 }, mgBody)
			round(c, 8)
			make("UIPadding", { PaddingLeft = UDim.new(0, 8), PaddingTop = UDim.new(0, 6), PaddingBottom = UDim.new(0, 6) }, c)
		end
		for i, opt in ipairs(q.options) do
			local b = button(mgBody, opt, 14, UDim2.new(), UDim2.new(1, -8, 0, 36), COL.wood)
			b.ZIndex = 6
			b.MouseButton1Click:Connect(function()
				picks[idx] = i
				if idx < #questions then
					idx += 1
					show()
				else
					mg.Visible = false
					Remotes.Submit:FireServer(picks)
				end
			end)
		end
	end
	show()
end)

-------------------------------------------------------------------- karier
local cp, cBody = panel("Pilih Karier", 460, 420)
Remotes.OpenCareer.OnClientEvent:Connect(function()
	cp.Visible = true
	clear(cBody)
	line(cBody, "Pilih jalur kariermu. Gaji naik seiring skill dan level (Junior > Middle > Senior > Expert).", COL.ink)
	for key, c in pairs(Config.CAREERS) do
		local sk = {}
		for _, s in ipairs(c.skills) do table.insert(sk, Config.SKILLS[s] .. (stats and (" Lv." .. (stats.skills[s] or 1)) or "")) end
		local b = button(cBody, c.name .. "  |  Rp" .. c.pay .. "/shift  |  " .. table.concat(sk, ", "), 13, UDim2.new(), UDim2.new(1, -8, 0, 44), COL.forest)
		b.ZIndex = 6
		b.MouseButton1Click:Connect(function()
			Remotes.ChooseCareer:FireServer(key)
			cp.Visible = false
		end)
	end
end)

-------------------------------------------------------------------- jadwal & nilai
local sp, sBody = panel("Jadwal Kuliah & Skill", 480, 440)
local function openSchedule()
	sp.Visible = true
	clear(sBody)
	if not stats then return end
	line(sBody, "MATA KULIAH SEMESTER " .. stats.sem, COL.forest, 15).Font = Enum.Font.GothamBold
	for _, c in ipairs(stats.courses) do
		line(sBody, string.format("%s\nPenguasaan %d%%  |  Hadir %d/%d  |  UTS %s  UAS %s", c.name, c.m, c.att, stats.maxDay, c.uts and tostring(c.uts) or "-", c.uas and tostring(c.uas) or "-"))
	end
	line(sBody, "SKILL TEKNOLOGI", COL.forest, 15).Font = Enum.Font.GothamBold
	for k, name in pairs(Config.SKILLS) do line(sBody, name .. ": Level " .. (stats.skills[k] or 1)) end
	line(sBody, "Kelas: podium dosen Lantai 2 | Lab: Lantai 3 | Karier & freelance: Lantai 4. UTS hari ke-" .. Config.UTS_DAY .. ", UAS hari ke-" .. Config.SEMESTER_DAYS .. ".", COL.wood, 13)
end

-------------------------------------------------------------------- party & teman
local pp, pBody = panel("Party & Teman", 420, 420)
local function openParty()
	pp.Visible = true
	clear(pBody)
	line(pBody, "Party: bonus XP kelompok saat anggota dekat. Teman: pakai pertemanan Roblox.", COL.ink, 13)
	local leave = button(pBody, "Keluar Party", 13, UDim2.new(), UDim2.new(1, -8, 0, 30), COL.warn)
	leave.ZIndex = 6
	leave.MouseButton1Click:Connect(function() Remotes.Party:FireServer("leave") end)
	for _, other in ipairs(Players:GetPlayers()) do
		if other ~= player then
			local row = make("Frame", { Size = UDim2.new(1, -8, 0, 36), BackgroundColor3 = Color3.fromRGB(232, 226, 205), ZIndex = 6 }, pBody)
			round(row, 8)
			text(row, other.DisplayName, 14, UDim2.fromOffset(8, 8), UDim2.fromOffset(160, 20), COL.ink, true).ZIndex = 7
			local inv = button(row, "Party", 12, UDim2.new(1, -150, 0, 4), UDim2.fromOffset(66, 28), COL.forest)
			inv.ZIndex = 7
			inv.MouseButton1Click:Connect(function() Remotes.Party:FireServer("invite", other.UserId) end)
			local fr = button(row, "Teman", 12, UDim2.new(1, -78, 0, 4), UDim2.fromOffset(70, 28), COL.wood)
			fr.ZIndex = 7
			fr.MouseButton1Click:Connect(function()
				pcall(function() StarterGui:SetCore("PromptSendFriendRequest", other) end)
			end)
		end
	end
end

Remotes.PartyInvite.OnClientEvent:Connect(function(fromName)
	local f = make("Frame", { AnchorPoint = Vector2.new(0.5, 0), Position = UDim2.new(0.5, 0, 0, 12), Size = UDim2.fromOffset(360, 70), BackgroundColor3 = COL.wood, ZIndex = 9 }, gui)
	round(f, 12)
	text(f, fromName .. " mengundangmu ke party.", 14, UDim2.fromOffset(12, 6), UDim2.fromOffset(336, 20)).ZIndex = 10
	local ok = button(f, "Terima", 13, UDim2.fromOffset(12, 34), UDim2.fromOffset(100, 28), COL.forest)
	ok.ZIndex = 10
	local no = button(f, "Tolak", 13, UDim2.fromOffset(122, 34), UDim2.fromOffset(100, 28), COL.warn)
	no.ZIndex = 10
	ok.MouseButton1Click:Connect(function() Remotes.Party:FireServer("accept") f:Destroy() end)
	no.MouseButton1Click:Connect(function() f:Destroy() end)
	task.delay(15, function() if f.Parent then f:Destroy() end end)
end)

-------------------------------------------------------------------- tombol menu
local menu = make("Frame", { Position = UDim2.new(0, 12, 0, 220), Size = UDim2.fromOffset(300, 40), BackgroundTransparency = 1 }, gui)
make("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 8) }, menu)
local b1 = button(menu, "Jadwal", 14, UDim2.new(), UDim2.fromOffset(92, 36), COL.wood)
local b2 = button(menu, "Party/Teman", 14, UDim2.new(), UDim2.fromOffset(120, 36), COL.forest)
local b3 = button(menu, "Karier", 14, UDim2.new(), UDim2.fromOffset(80, 36), COL.gold)
b1.MouseButton1Click:Connect(openSchedule)
b2.MouseButton1Click:Connect(openParty)
b3.MouseButton1Click:Connect(function()
	if stats and stats.graduated and not stats.career then
		toast("Kamu sudah lulus! Pilih karier lewat Terminal Karier di Lantai 4 Fakultas.", "info")
	else
		toast(stats and stats.career and ("Karier: " .. stats.career .. ". Pakai Terminal Karier (Lantai 4) untuk bekerja.") or "Karier terbuka setelah lulus Semester 8.", "info")
	end
end)
