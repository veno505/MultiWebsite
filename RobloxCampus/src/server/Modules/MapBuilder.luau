-- MapBuilder.luau : membangun seluruh kampus 3D secara prosedural (natural modern university)
local CS = game:GetService("CollectionService")
local Lighting = game:GetService("Lighting")
local Workspace = game:GetService("Workspace")

local MapBuilder = {}

local C = {
	grass = Color3.fromRGB(94, 138, 68),
	white = Color3.fromRGB(236, 236, 230),
	concrete = Color3.fromRGB(158, 158, 154),
	concreteL = Color3.fromRGB(190, 190, 184),
	dark = Color3.fromRGB(72, 74, 76),
	wood = Color3.fromRGB(139, 98, 64),
	woodL = Color3.fromRGB(190, 150, 105),
	glass = Color3.fromRGB(168, 208, 228),
	soil = Color3.fromRGB(121, 93, 64),
	water = Color3.fromRGB(82, 150, 190),
	trunk = Color3.fromRGB(105, 78, 52),
	screen = Color3.fromRGB(120, 175, 215),
	metal = Color3.fromRGB(110, 115, 120),
	sand = Color3.fromRGB(205, 185, 140),
}
local LEAVES = { Color3.fromRGB(70, 120, 55), Color3.fromRGB(86, 140, 62), Color3.fromRGB(58, 105, 52), Color3.fromRGB(104, 150, 70) }
local M = Enum.Material

-------------------------------------------------------------------- helpers
local function P(parent, name, size, pos, color, mat, tr)
	local p = Instance.new("Part")
	p.Name = name
	p.Anchored = true
	p.Size = size
	if typeof(pos) == "CFrame" then p.CFrame = pos else p.Position = pos end
	p.Color = color
	p.Material = mat or M.SmoothPlastic
	p.Transparency = tr or 0
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.Parent = parent
	return p
end

local function prompt(part, text, obj, attrs, dist)
	local pp = Instance.new("ProximityPrompt")
	pp.ActionText = text
	pp.ObjectText = obj or ""
	pp.HoldDuration = 0.25
	pp.MaxActivationDistance = dist or 10
	pp.RequiresLineOfSight = false
	pp.KeyboardKeyCode = Enum.KeyCode.E
	for k, v in pairs(attrs or {}) do pp:SetAttribute(k, v) end
	pp.Parent = part
	CS:AddTag(pp, "Act")
	return pp
end

local function label(parent, text, pos, w, maxDist)
	local p = P(parent, "Label", Vector3.new(0.2, 0.2, 0.2), pos, C.white, M.SmoothPlastic, 1)
	p.CanCollide = false
	p.CanQuery = false
	local g = Instance.new("BillboardGui")
	g.Size = UDim2.fromOffset(w or 220, 36)
	g.AlwaysOnTop = false
	g.MaxDistance = maxDist or 90
	g.Parent = p
	local t = Instance.new("TextLabel")
	t.Size = UDim2.fromScale(1, 1)
	t.BackgroundColor3 = Color3.fromRGB(40, 70, 48)
	t.BackgroundTransparency = 0.15
	t.TextColor3 = Color3.fromRGB(250, 246, 232)
	t.Font = Enum.Font.GothamBold
	t.TextScaled = true
	t.Text = text
	t.Parent = g
	Instance.new("UICorner", t).CornerRadius = UDim.new(0, 8)
	return p
end

local function hwall(parent, cx, z, len, top, h, gap, color)
	if gap then
		local seg = (len - gap) / 2
		P(parent, "W", Vector3.new(seg, h, 0.6), Vector3.new(cx - len / 2 + seg / 2, top + h / 2, z), color or C.white)
		P(parent, "W", Vector3.new(seg, h, 0.6), Vector3.new(cx + len / 2 - seg / 2, top + h / 2, z), color or C.white)
		P(parent, "Lintel", Vector3.new(gap, 2, 0.6), Vector3.new(cx, top + h - 1, z), color or C.white)
	else
		P(parent, "W", Vector3.new(len, h, 0.6), Vector3.new(cx, top + h / 2, z), color or C.white)
	end
end
local function vwall(parent, x, cz, len, top, h, gap, color)
	if gap then
		local seg = (len - gap) / 2
		P(parent, "W", Vector3.new(0.6, h, seg), Vector3.new(x, top + h / 2, cz - len / 2 + seg / 2), color or C.white)
		P(parent, "W", Vector3.new(0.6, h, seg), Vector3.new(x, top + h / 2, cz + len / 2 - seg / 2), color or C.white)
		P(parent, "Lintel", Vector3.new(0.6, 2, gap), Vector3.new(x, top + h - 1, cz), color or C.white)
	else
		P(parent, "W", Vector3.new(0.6, h, len), Vector3.new(x, top + h / 2, cz), color or C.white)
	end
end

-- ruangan partisi; doorSide: "S" (-z), "N" (+z), "E" (+x), "W" (-x)
local function room(parent, name, cx, cz, w, d, top, h, doorSide, color)
	local m = Instance.new("Model")
	m.Name = name
	m.Parent = parent
	local gap = 6
	hwall(m, cx, cz - d / 2, w, top, h, doorSide == "S" and gap or nil, color)
	hwall(m, cx, cz + d / 2, w, top, h, doorSide == "N" and gap or nil, color)
	vwall(m, cx - w / 2, cz, d, top, h, doorSide == "W" and gap or nil, color)
	vwall(m, cx + w / 2, cz, d, top, h, doorSide == "E" and gap or nil, color)
	return m
end

local function building(parent, name, c, sx, sz, floors, H, wallColor)
	local m = Instance.new("Model")
	m.Name = name
	m.Parent = parent
	for f = 1, floors do
		local top = (f - 1) * H + 0.5
		local wh = H - 0.5
		local wy = top + wh / 2
		P(m, "Floor" .. f, Vector3.new(sx, 0.5, sz), Vector3.new(c.X, top - 0.25, c.Z), C.concreteL, M.Concrete)
		P(m, "Back", Vector3.new(sx, wh, 0.8), Vector3.new(c.X, wy, c.Z + sz / 2 - 0.4), wallColor)
		P(m, "Left", Vector3.new(0.8, wh, sz), Vector3.new(c.X - sx / 2 + 0.4, wy, c.Z), wallColor)
		P(m, "Right", Vector3.new(0.8, wh, sz), Vector3.new(c.X + sx / 2 - 0.4, wy, c.Z), wallColor)
		local fz = c.Z - sz / 2 + 0.3
		if f == 1 then
			local gap = 12
			local seg = (sx - gap) / 2
			P(m, "FrontL", Vector3.new(seg, wh, 0.6), Vector3.new(c.X - sx / 2 + seg / 2, wy, fz), C.glass, M.Glass, 0.45)
			P(m, "FrontR", Vector3.new(seg, wh, 0.6), Vector3.new(c.X + sx / 2 - seg / 2, wy, fz), C.glass, M.Glass, 0.45)
			P(m, "Lintel", Vector3.new(gap, 3, 0.6), Vector3.new(c.X, top + wh - 1.5, fz), wallColor)
		else
			P(m, "Front", Vector3.new(sx, wh, 0.6), Vector3.new(c.X, wy, fz), C.glass, M.Glass, 0.45)
			-- kolom putih antar kaca
			for i = -1, 1 do
				P(m, "Pillar", Vector3.new(1.4, wh, 1), Vector3.new(c.X + i * sx / 3, wy, fz - 0.2), wallColor)
			end
		end
	end
	P(m, "Roof", Vector3.new(sx + 2, 0.8, sz + 2), Vector3.new(c.X, floors * H + 0.4, c.Z), C.concrete, M.Concrete)
	return m
end

local function plant(parent, pos, s)
	s = s or 1
	P(parent, "Pot", Vector3.new(1.4 * s, 1.2 * s, 1.4 * s), pos + Vector3.new(0, 0.6 * s, 0), C.soil, M.Slate)
	local l = P(parent, "Leaf", Vector3.new(2.2 * s, 2.2 * s, 2.2 * s), pos + Vector3.new(0, 2.2 * s, 0), LEAVES[1], M.Grass)
	l.Shape = Enum.PartType.Ball
end

local function tree(parent, pos, scale)
	scale = scale or 1
	local t = P(parent, "Trunk", Vector3.new(7 * scale, 1.6 * scale, 1.6 * scale), CFrame.new(pos + Vector3.new(0, 3.5 * scale, 0)) * CFrame.Angles(0, 0, math.pi / 2), C.trunk, M.Wood)
	t.Shape = Enum.PartType.Cylinder
	local l = P(parent, "Leaves", Vector3.new(9 * scale, 8 * scale, 9 * scale), pos + Vector3.new(0, 9 * scale, 0), LEAVES[math.random(#LEAVES)], M.Grass)
	l.Shape = Enum.PartType.Ball
	l.CanCollide = false
end

local function bench(parent, pos, rotY, attrs)
	local cf = CFrame.new(pos) * CFrame.Angles(0, rotY or 0, 0)
	local seat = P(parent, "Bench", Vector3.new(5, 0.5, 1.8), cf * CFrame.new(0, 1.6, 0), C.wood, M.Wood)
	P(parent, "BenchBack", Vector3.new(5, 1.6, 0.4), cf * CFrame.new(0, 2.6, 0.8), C.wood, M.Wood)
	P(parent, "LegL", Vector3.new(0.4, 1.6, 1.6), cf * CFrame.new(-2.2, 0.8, 0), C.metal, M.Metal)
	P(parent, "LegR", Vector3.new(0.4, 1.6, 1.6), cf * CFrame.new(2.2, 0.8, 0), C.metal, M.Metal)
	if attrs then prompt(seat, attrs.text or "Duduk santai", "Bangku", attrs) end
end

local function lamp(parent, pos, withLight)
	P(parent, "Pole", Vector3.new(0.6, 9, 0.6), pos + Vector3.new(0, 4.5, 0), C.dark, M.Metal)
	local b = P(parent, "Bulb", Vector3.new(1.4, 1.4, 1.4), pos + Vector3.new(0, 9.4, 0), Color3.fromRGB(255, 232, 170), M.SmoothPlastic)
	b.Shape = Enum.PartType.Ball
	if withLight then
		local l = Instance.new("PointLight")
		l.Range = 26
		l.Brightness = 1.2
		l.Color = Color3.fromRGB(255, 222, 160)
		l.Parent = b
	end
end

-- stasiun komputer (meja + monitor + kursi duduk)
local function station(parent, pos, kind, prompttext, pay)
	P(parent, "Desk", Vector3.new(3.4, 3, 2.4), pos + Vector3.new(0, 1.5, 0), C.woodL, M.Wood)
	local mon = P(parent, "Monitor", Vector3.new(2.2, 1.4, 0.2), pos + Vector3.new(0, 3.9, 0.4), C.screen, M.SmoothPlastic)
	P(parent, "MonStand", Vector3.new(0.3, 0.8, 0.3), pos + Vector3.new(0, 3.3, 0.4), C.dark)
	P(parent, "Keyboard", Vector3.new(1.6, 0.15, 0.6), pos + Vector3.new(0, 3.1, -0.5), C.dark)
	local seat = Instance.new("Seat")
	seat.Name = "Chair"
	seat.Size = Vector3.new(2, 0.6, 2)
	seat.Position = pos + Vector3.new(0, 1.8, -2.4)
	seat.Anchored = true
	seat.Color = Color3.fromRGB(60, 70, 66)
	seat.Material = M.Fabric
	seat.Parent = parent
	P(parent, "ChairBack", Vector3.new(2, 2, 0.4), pos + Vector3.new(0, 3, -3.3), Color3.fromRGB(60, 70, 66), M.Fabric)
	prompt(mon, prompttext or "Gunakan komputer", "Komputer", { Action = "Code", Kind = kind, Pay = pay or 20, CD = 3 }, 9)
	return mon
end

local function server(parent, pos)
	local r = P(parent, "Server", Vector3.new(3, 8, 3), pos + Vector3.new(0, 4, 0), Color3.fromRGB(60, 64, 68), M.Metal)
	for i = 1, 4 do
		local led = P(parent, "LED", Vector3.new(0.4, 0.3, 0.1), pos + Vector3.new(-0.8 + i * 0.4, 2 + i * 1.5, -1.55), Color3.fromRGB(110, 200, 130))
		led.CanCollide = false
	end
	return r
end

local function robot(parent, pos)
	P(parent, "RobotBody", Vector3.new(2, 2.4, 1.6), pos + Vector3.new(0, 2, 0), C.white, M.SmoothPlastic)
	local h = P(parent, "RobotHead", Vector3.new(1.4, 1.2, 1.2), pos + Vector3.new(0, 3.8, 0), C.concreteL)
	P(parent, "RobotEye", Vector3.new(0.9, 0.3, 0.1), pos + Vector3.new(0, 3.9, -0.62), Color3.fromRGB(90, 160, 210)).CanCollide = false
	P(parent, "RobotBase", Vector3.new(2.4, 0.6, 2.2), pos + Vector3.new(0, 0.3, 0), C.dark)
end

local function table_(parent, pos, w, d, color)
	local top = P(parent, "Table", Vector3.new(w, 0.5, d), pos + Vector3.new(0, 3, 0), color or C.woodL, M.Wood)
	for _, sx in ipairs({ -1, 1 }) do
		for _, sz in ipairs({ -1, 1 }) do
			P(parent, "Leg", Vector3.new(0.4, 3, 0.4), pos + Vector3.new(sx * (w / 2 - 0.4), 1.5, sz * (d / 2 - 0.4)), C.wood, M.Wood)
		end
	end
	return top
end

local function sofa(parent, pos, rotY)
	local cf = CFrame.new(pos) * CFrame.Angles(0, rotY or 0, 0)
	P(parent, "Sofa", Vector3.new(6, 1.6, 2.4), cf * CFrame.new(0, 1.2, 0), Color3.fromRGB(110, 140, 110), M.Fabric)
	P(parent, "SofaBack", Vector3.new(6, 2, 0.6), cf * CFrame.new(0, 2.6, 1), Color3.fromRGB(95, 125, 98), M.Fabric)
end

local function car(parent, pos, color)
	P(parent, "CarBody", Vector3.new(5, 1.6, 9), pos + Vector3.new(0, 1.6, 0), color, M.SmoothPlastic)
	P(parent, "CarTop", Vector3.new(4.4, 1.4, 4.6), pos + Vector3.new(0, 3, -0.4), C.glass, M.Glass, 0.3)
	for _, x in ipairs({ -2.5, 2.5 }) do
		for _, z in ipairs({ -3, 3 }) do
			local w = P(parent, "Wheel", Vector3.new(1.4, 1.6, 1.6), CFrame.new(pos + Vector3.new(x, 0.8, z)) * CFrame.Angles(0, 0, math.pi / 2), Color3.fromRGB(30, 30, 32))
			w.Shape = Enum.PartType.Cylinder
		end
	end
end

-------------------------------------------------------------------- lighting
local function setupLighting()
	Lighting.Technology = Enum.Technology.ShadowMap
	Lighting.Brightness = 2.4
	Lighting.GlobalShadows = true
	Lighting.EnvironmentDiffuseScale = 0.6
	Lighting.EnvironmentSpecularScale = 0.4
	Lighting.OutdoorAmbient = Color3.fromRGB(120, 130, 125)
	Lighting.Ambient = Color3.fromRGB(70, 75, 72)
	Lighting.ClockTime = 7
	Lighting.GeographicLatitude = 8
	local a = Instance.new("Atmosphere")
	a.Density = 0.25
	a.Offset = 0.2
	a.Color = Color3.fromRGB(200, 215, 225)
	a.Decay = Color3.fromRGB(215, 200, 170)
	a.Glare = 0.2
	a.Haze = 1.2
	a.Parent = Lighting
	local cc = Instance.new("ColorCorrectionEffect")
	cc.Saturation = 0.12
	cc.Contrast = 0.06
	cc.TintColor = Color3.fromRGB(255, 250, 240)
	cc.Parent = Lighting
	local sr = Instance.new("SunRaysEffect")
	sr.Intensity = 0.06
	sr.Spread = 0.6
	sr.Parent = Lighting
	local bl = Instance.new("BloomEffect")
	bl.Intensity = 0.25
	bl.Size = 20
	bl.Threshold = 1.1
	bl.Parent = Lighting
end

-------------------------------------------------------------------- main build
function MapBuilder.build()
	setupLighting()
	local world = Instance.new("Folder")
	world.Name = "CampusWorld"
	world.Parent = Workspace
	math.randomseed(77)

	-- tanah
	local g = P(world, "Ground", Vector3.new(760, 2, 760), Vector3.new(0, -1, 0), C.grass, M.Grass)
	g.Name = "Ground"

	-- jalan & pedestrian
	P(world, "MainRoad", Vector3.new(20, 0.2, 230), Vector3.new(0, 0.1, -150), C.dark, M.Asphalt)
	for i = 0, 10 do
		P(world, "RoadLine", Vector3.new(0.6, 0.05, 6), Vector3.new(0, 0.25, -255 + i * 20), C.white).CanCollide = false
	end
	P(world, "Walk", Vector3.new(160, 0.2, 10), Vector3.new(-5, 0.12, 45), C.concreteL, M.Concrete)
	P(world, "WalkLib", Vector3.new(100, 0.2, 8), Vector3.new(-80, 0.12, -40), C.concreteL, M.Concrete)
	P(world, "WalkPark", Vector3.new(80, 0.2, 8), Vector3.new(80, 0.12, -45), C.concreteL, M.Concrete)
	P(world, "WalkDorm", Vector3.new(8, 0.2, 100), Vector3.new(60, 0.12, 100), C.concreteL, M.Concrete)
	P(world, "WalkSport", Vector3.new(8, 0.2, 100), Vector3.new(0, 0.12, 100), C.concreteL, M.Concrete)
	P(world, "Plaza", Vector3.new(60, 0.3, 40), Vector3.new(0, 0.15, -90), C.concreteL, M.Concrete)
	P(world, "Parking", Vector3.new(55, 0.2, 45), Vector3.new(-60, 0.1, -200), C.dark, M.Asphalt)

	-- spawn dekat asrama
	local spawn = Instance.new("SpawnLocation")
	spawn.Name = "SpawnDorm"
	spawn.Size = Vector3.new(10, 1, 10)
	spawn.Position = Vector3.new(120, 0.5, 70)
	spawn.Anchored = true
	spawn.Neutral = true
	spawn.Transparency = 1
	spawn.CanCollide = true
	spawn.Parent = world

	---------------------------------------------------------------- AREA 1: GERBANG
	local gate = Instance.new("Model")
	gate.Name = "MainGate"
	gate.Parent = world
	P(gate, "PillarL", Vector3.new(6, 20, 6), Vector3.new(-16, 10, -255), C.white, M.Concrete)
	P(gate, "PillarR", Vector3.new(6, 20, 6), Vector3.new(16, 10, -255), C.white, M.Concrete)
	P(gate, "Beam", Vector3.new(44, 5, 4), Vector3.new(0, 21, -255), C.white, M.Concrete)
	label(gate, "UNIVERSITAS INFORMATIKA NUSANTARA", Vector3.new(0, 25, -255), 460, 200)
	local logo = P(gate, "Logo", Vector3.new(6, 6, 1), Vector3.new(0, 21, -257), Color3.fromRGB(60, 120, 80), M.SmoothPlastic)
	logo.Shape = Enum.PartType.Cylinder
	logo.CFrame = CFrame.new(0, 21, -257.4) * CFrame.Angles(0, math.pi / 2, 0)
	local post = building(world, "PosSecurity", Vector3.new(30, 0, -235), 10, 10, 1, 8, C.white)
	label(post, "Pos Keamanan", Vector3.new(30, 10, -240), 160)
	local busstop = Instance.new("Model")
	busstop.Name = "BusStopGate"
	busstop.Parent = world
	P(busstop, "Roof", Vector3.new(12, 0.6, 5), Vector3.new(22, 8, -205), C.woodL, M.Wood)
	P(busstop, "PostA", Vector3.new(0.6, 8, 0.6), Vector3.new(16.5, 4, -203), C.metal, M.Metal)
	P(busstop, "PostB", Vector3.new(0.6, 8, 0.6), Vector3.new(27.5, 4, -203), C.metal, M.Metal)
	bench(busstop, Vector3.new(22, 0, -206), 0)
	local sign = P(busstop, "BusSign", Vector3.new(1, 5, 1), Vector3.new(30, 2.5, -204), Color3.fromRGB(50, 110, 160), M.SmoothPlastic)
	prompt(sign, "Naik Bus Kampus", "Halte Gerbang", { Action = "Teleport", Dest = Vector3.new(20, 3, -88), CD = 4 })
	label(busstop, "Halte Bus Kampus", Vector3.new(22, 11, -205), 200)
	-- parkiran
	local carColors = { Color3.fromRGB(200, 90, 70), Color3.fromRGB(70, 110, 160), Color3.fromRGB(220, 215, 205), Color3.fromRGB(90, 140, 90), Color3.fromRGB(80, 80, 84) }
	for i = 0, 4 do
		car(world, Vector3.new(-80 + i * 11, 0, -208), carColors[i + 1])
		if i % 2 == 0 then car(world, Vector3.new(-80 + i * 11, 0, -190), carColors[(i + 2) % 5 + 1]) end
	end
	label(world, "Parkiran Kendaraan", Vector3.new(-60, 8, -178), 220)
	-- lampu & pohon sepanjang jalan
	for i = 0, 6 do
		lamp(world, Vector3.new(-13, 0, -240 + i * 30), i % 2 == 0)
		lamp(world, Vector3.new(13, 0, -240 + i * 30), i % 2 == 1)
		tree(world, Vector3.new(-22, 0, -235 + i * 30), 1)
		tree(world, Vector3.new(22, 0, -220 + i * 30), 1)
		bench(world, Vector3.new(-16, 0, -225 + i * 30), math.pi / 2)
	end
	for i = 0, 2 do
		local poster = P(world, "PosterBoard", Vector3.new(6, 7, 0.5), Vector3.new(-30 + i * 10, 4.5, -125), C.woodL, M.Wood)
		label(world, ({ "Hackathon!", "Tech Festival", "Job Fair" })[i + 1], Vector3.new(-30 + i * 10, 10, -125), 150, 60)
	end

	---------------------------------------------------------------- PLAZA & EVENT STAGE
	local stage = P(world, "EventStage", Vector3.new(24, 1.6, 10), Vector3.new(0, 1, -100), C.woodL, M.Wood)
	P(world, "StageScreen", Vector3.new(18, 8, 0.6), Vector3.new(0, 6, -104.5), C.white, M.SmoothPlastic)
	label(world, "EVENT KAMPUS", Vector3.new(0, 13, -104), 260, 150)
	prompt(stage, "Ikut Event Kampus", "Panggung Event", { Action = "Event", CD = 3 }, 14)
	local busPlaza = P(world, "BusPlaza", Vector3.new(1, 5, 1), Vector3.new(26, 2.5, -80), Color3.fromRGB(50, 110, 160), M.SmoothPlastic)
	prompt(busPlaza, "Naik Bus ke Gerbang", "Halte Fakultas", { Action = "Teleport", Dest = Vector3.new(22, 3, -200), CD = 4 })
	label(world, "Halte Bus", Vector3.new(26, 7, -80), 140, 60)

	---------------------------------------------------------------- AREA 2: GEDUNG FAKULTAS
	local FH = 14
	local function top(f) return (f - 1) * FH + 0.5 end
	local fac = building(world, "FakultasInformatika", Vector3.new(0, 0, 0), 90, 60, 4, FH, C.white)
	label(world, "FAKULTAS INFORMATIKA", Vector3.new(0, 58, -31), 380, 220)

	-- Lift (4 panel) di setiap lantai
	for f = 1, 4 do
		for n = 1, 4 do
			local pnl = P(fac, "LiftPanel", Vector3.new(0.6, 2, 2), Vector3.new(43.5, top(f) + 2.5, 17.5 + (n - 1) * 3), C.metal, M.Metal)
			prompt(pnl, "Ke Lantai " .. n, "Lift", { Action = "Teleport", Dest = Vector3.new(40, top(n) + 3, 18), CD = 2 }, 8)
		end
		label(fac, "Lift", Vector3.new(43, top(f) + 8, 22), 90, 50)
	end

	-- Lantai 1: lobby
	local t1 = top(1)
	local desk = P(fac, "Reception", Vector3.new(14, 3, 3), Vector3.new(0, t1 + 1.5, -18), C.woodL, M.Wood)
	label(fac, "Resepsionis", Vector3.new(0, t1 + 8, -18), 130, 50)
	local absen = P(fac, "AbsenMachine", Vector3.new(2, 4, 1.4), Vector3.new(-14, t1 + 2, -27), C.metal, M.Metal)
	prompt(absen, "Absen Kehadiran", "Mesin Absensi", { Action = "Generic", Happy = 1, Stress = 0, Msg = "Absen tercatat. Siap kuliah!", CD = 30 })
	sofa(fac, Vector3.new(-26, t1, -22), 0)
	sofa(fac, Vector3.new(26, t1, -22), 0)
	plant(fac, Vector3.new(-40, t1, -26), 1.4)
	plant(fac, Vector3.new(40, t1, -26), 1.4)
	local board = P(fac, "InfoBoard", Vector3.new(14, 7, 0.4), Vector3.new(0, t1 + 6, 29), C.dark, M.SmoothPlastic)
	label(fac, "Papan Informasi: Kelas L2, Lab L3, Innovation L4", Vector3.new(0, t1 + 11, 28.6), 360, 70)
	local adm = room(fac, "Administrasi", -30, 16, 24, 20, t1, 9, "S", C.white)
	local dos = room(fac, "RuangDosen", 0, 16, 24, 20, t1, 9, "S", C.white)
	local sem = room(fac, "RuangSeminar", 28, 16, 20, 20, t1, 9, "S", C.white)
	label(fac, "Administrasi", Vector3.new(-30, t1 + 10, 6), 150, 40)
	label(fac, "Ruang Dosen", Vector3.new(0, t1 + 10, 6), 150, 40)
	label(fac, "Ruang Seminar", Vector3.new(28, t1 + 10, 6), 150, 40)
	table_(adm, Vector3.new(-30, t1, 20), 8, 3)
	table_(dos, Vector3.new(0, t1, 20), 10, 3)
	for i = 0, 2 do
		for j = 0, 2 do
			table_(sem, Vector3.new(21 + i * 7, t1, 14 + j * 5), 5, 1.8)
		end
	end
	P(sem, "SeminarScreen", Vector3.new(12, 6, 0.4), Vector3.new(28, t1 + 6, 25.5), C.white)

	-- Lantai 2: kelas
	local t2 = top(2)
	local classes = { { -30, "Pemrograman Dasar" }, { -6, "Algoritma" }, { 18, "Database" } }
	for _, cinfo in ipairs(classes) do
		local cx = cinfo[1]
		local rm = room(fac, cinfo[2], cx, 7, 22, 42, t2, 9, "S", C.white)
		label(fac, "Kelas " .. cinfo[2], Vector3.new(cx, t2 + 10, -14.5), 200, 40)
		for i = 0, 2 do
			for j = 0, 3 do
				local dp = Vector3.new(cx - 6 + i * 6, t2, -4 + j * 7)
				P(rm, "StudentDesk", Vector3.new(3.4, 0.4, 2), dp + Vector3.new(0, 2.6, 0), C.woodL, M.Wood)
				P(rm, "DeskLeg", Vector3.new(3, 2.4, 1.6), dp + Vector3.new(0, 1.2, 0), C.wood, M.Wood)
				P(rm, "Laptop", Vector3.new(1.4, 0.15, 1), dp + Vector3.new(0, 2.9, 0), C.dark)
				P(rm, "Chair", Vector3.new(1.8, 1.6, 1.8), dp + Vector3.new(0, 1.4, -2.2), Color3.fromRGB(70, 90, 80), M.Fabric)
			end
		end
		P(rm, "Whiteboard", Vector3.new(14, 5, 0.3), Vector3.new(cx, t2 + 5.5, 27.6), C.white)
		P(rm, "Projector", Vector3.new(1.6, 0.8, 1.6), Vector3.new(cx, t2 + 8, 10), C.dark)
		local lect = P(rm, "Lectern", Vector3.new(3, 3.4, 2), Vector3.new(cx + 6, t2 + 1.7, 24), C.wood, M.Wood)
		prompt(lect, "Hadiri Kelas", "Podium Dosen", { Action = "Class", Room = cinfo[2], CD = 6 }, 10)
		plant(rm, Vector3.new(cx - 9, t2, 25), 1)
	end

	-- Lantai 3: laboratorium
	local t3 = top(3)
	local labC = room(fac, "ComputerLab", -25, -1, 40, 54, t3, 9, "S", C.white)
	label(fac, "COMPUTER LAB (30 PC)", Vector3.new(-25, t3 + 10, -28.5), 260, 50)
	local kinds = { "debug", "algo", "web", "db" }
	local n = 0
	for r = 0, 2 do
		for i = 0, 9 do
			n += 1
			station(labC, Vector3.new(-42 + i * 3.8, t3, -14 + r * 12), kinds[(n - 1) % 4 + 1], "Gunakan komputer lab")
		end
	end
	local labAI = room(fac, "AILab", 4, -1, 18, 54, t3, 9, "S", C.white)
	label(fac, "AI LABORATORY", Vector3.new(4, t3 + 10, -28.5), 200, 50)
	for i = 0, 2 do server(labAI, Vector3.new(-2 + i * 4, t3, 24)) end
	for i = 0, 1 do robot(labAI, Vector3.new(0 + i * 6, t3, 10)) end
	P(labAI, "ResearchCam", Vector3.new(1, 1, 1.6), Vector3.new(4, t3 + 7.5, -20), C.dark)
	station(labAI, Vector3.new(4, t3, -8), "ai", "Latih Model AI")
	local labS = room(fac, "CyberLab", 22, -1, 18, 54, t3, 9, "S", C.white)
	label(fac, "CYBER SECURITY LAB", Vector3.new(22, t3 + 10, -28.5), 240, 50)
	for i = 0, 2 do server(labS, Vector3.new(16 + i * 4, t3, 24)) end
	for i = 0, 1 do station(labS, Vector3.new(18 + i * 8, t3, -10 + i * 0), "cyber", "Analisis Keamanan") end
	local labG = room(fac, "GameDevLab", 38, -6, 14, 44, t3, 9, "S", C.white)
	label(fac, "GAME DEV LAB", Vector3.new(38, t3 + 10, -28.5), 190, 50)
	station(labG, Vector3.new(35, t3, -14), "algo", "Desain Logika Game")
	station(labG, Vector3.new(41, t3, -14), "debug", "Debug Game")
	station(labG, Vector3.new(35, t3, -2), "web", "Desain UI Game")
	station(labG, Vector3.new(41, t3, -2), "algo", "Prototipe Game")

	-- Lantai 4: innovation center
	local t4 = top(4)
	local su = room(fac, "StartupRoom", -25, -5, 30, 40, t4, 9, "S", C.white)
	local pr = room(fac, "ProjectRoom", 5, -5, 26, 40, t4, 9, "S", C.white)
	local mt = room(fac, "MeetingRoom", 29, -5, 18, 40, t4, 9, "S", C.white)
	label(fac, "Ruang Startup", Vector3.new(-25, t4 + 10, -25.5), 160, 50)
	label(fac, "Ruang Project", Vector3.new(5, t4 + 10, -25.5), 160, 50)
	label(fac, "Meeting Room", Vector3.new(29, t4 + 10, -25.5), 160, 50)
	label(fac, "INNOVATION CENTER", Vector3.new(0, t4 + 12, 28), 300, 60)
	station(su, Vector3.new(-33, t4, 5), "web", "Freelance: Bangun Website", 70)
	station(su, Vector3.new(-25, t4, 5), "debug", "Freelance: Perbaiki Bug", 60)
	local term = P(su, "CareerTerminal", Vector3.new(3, 5, 1.4), Vector3.new(-17, t4 + 2.5, 13), C.metal, M.Metal)
	prompt(term, "Portal Karier", "Terminal Karier", { Action = "Career", CD = 3 }, 10)
	local prTable = table_(pr, Vector3.new(5, t4, 5), 14, 5)
	prompt(prTable, "Rapat Proyek", "Meja Project", { Action = "Generic", Skill = "se", XP = 20, Energy = -8, Stress = 3, Happy = 4, Msg = "Rapat proyek produktif!", CD = 20 }, 12)
	table_(mt, Vector3.new(29, t4, 5), 10, 4)
	plant(su, Vector3.new(-38, t4, -22), 1.2)
	plant(pr, Vector3.new(17, t4, -22), 1.2)

	---------------------------------------------------------------- AREA 3: PERPUSTAKAAN
	local libM = building(world, "PerpustakaanDigital", Vector3.new(-130, 0, -30), 50, 40, 1, 12, C.white)
	label(world, "PERPUSTAKAAN DIGITAL", Vector3.new(-130, 14, -51), 300, 130)
	for i = 0, 3 do
		for j = 0, 1 do
			local sx = -148 + i * 9
			P(libM, "Shelf", Vector3.new(7, 8, 1.4), Vector3.new(sx, 4.5, -18 + j * 8), C.wood, M.Wood)
			for k = 0, 2 do
				P(libM, "Books", Vector3.new(6.2, 0.9, 1.1), Vector3.new(sx, 2.5 + k * 2.4, -18 + j * 8 - 0.05), LEAVES[(i + k) % 4 + 1], M.SmoothPlastic)
			end
		end
	end
	local rt = table_(libM, Vector3.new(-112, 0.5, -30), 9, 4)
	local rt2 = table_(libM, Vector3.new(-112, 0.5, -42), 9, 4)
	prompt(rt2, "Membaca Buku", "Area Membaca", { Action = "Study", Place = "lib", CD = 10 }, 12)
	prompt(rt, "Membaca Buku", "Area Membaca", { Action = "Study", Place = "lib", CD = 10 }, 12)
	local cs = station(libM, Vector3.new(-125, 0.5, -45), "algo", "Cari Referensi Digital")
	local disc = room(libM, "RuangDiskusi", -150, -40, 14, 12, 0.5, 8, "E", C.glass)
	local dt = table_(disc, Vector3.new(-150, 0.5, -40), 7, 3)
	prompt(dt, "Diskusi Kelompok", "Ruang Diskusi", { Action = "Generic", Skill = "se", XP = 15, Energy = -6, Stress = -2, Happy = 5, Msg = "Diskusi kelompok seru!", CD = 20 })

	---------------------------------------------------------------- AREA 4: TAMAN
	local lake = P(world, "Lake", Vector3.new(0.4, 46, 36), CFrame.new(155, 0.25, -60) * CFrame.Angles(0, 0, math.pi / 2), C.water, M.Glass, 0.25)
	lake.Shape = Enum.PartType.Cylinder
	lake.CanCollide = false
	label(world, "Taman Kampus", Vector3.new(120, 14, -60), 200, 120)
	local gz = Instance.new("Model")
	gz.Name = "Gazebo"
	gz.Parent = world
	P(gz, "GazeboFloor", Vector3.new(14, 0.8, 14), Vector3.new(110, 0.4, -20), C.woodL, M.Wood)
	for _, sx in ipairs({ -6, 6 }) do
		for _, sz in ipairs({ -6, 6 }) do
			P(gz, "GazeboPost", Vector3.new(0.8, 9, 0.8), Vector3.new(110 + sx, 5, -20 + sz), C.wood, M.Wood)
		end
	end
	local gr = P(gz, "GazeboRoof", Vector3.new(16, 1, 16), Vector3.new(110, 9.8, -20), C.wood, M.Wood)
	prompt(P(gz, "GazeboSeat", Vector3.new(6, 1.2, 1.5), Vector3.new(110, 1.4, -17), C.wood, M.Wood), "Diskusi di Gazebo", "Gazebo", { Action = "Generic", Skill = "se", XP = 10, Energy = -4, Stress = -8, Happy = 6, Msg = "Diskusi santai di gazebo.", CD = 15 })
	for i = 0, 5 do
		bench(world, Vector3.new(100 + i * 8, 0, -42), 0, { Action = "Generic", Stress = -8, Happy = 4, Energy = 2, Msg = "Bersantai di taman.", CD = 15, text = "Duduk santai" })
	end
	for i = 1, 22 do
		local x, z = 85 + math.random() * 120, -110 + math.random() * 120
		if (x - 155) ^ 2 + (z + 60) ^ 2 > 34 ^ 2 and not (x > 95 and x < 125 and z > -35 and z < -5) then
			tree(world, Vector3.new(x, 0, z), 0.9 + math.random() * 0.5)
		end
	end

	---------------------------------------------------------------- AREA 5: KANTIN
	local kan = Instance.new("Model")
	kan.Name = "Kantin"
	kan.Parent = world
	P(kan, "KantinFloor", Vector3.new(52, 0.4, 36), Vector3.new(-110, 0.2, 70), C.sand, M.Concrete)
	P(kan, "KantinRoof", Vector3.new(56, 0.8, 40), Vector3.new(-110, 12, 70), C.woodL, M.Wood)
	for _, sx in ipairs({ -24, 24 }) do
		for _, sz in ipairs({ -16, 16 }) do
			P(kan, "Pillar", Vector3.new(1.2, 12, 1.2), Vector3.new(-110 + sx, 6, 70 + sz), C.wood, M.Wood)
		end
	end
	label(world, "KANTIN UNIVERSITAS", Vector3.new(-110, 15, 50), 280, 120)
	P(kan, "Counter", Vector3.new(30, 3.4, 3), Vector3.new(-110, 1.9, 83), C.wood, M.Wood)
	local fc = P(kan, "FoodCounter", Vector3.new(6, 1, 2), Vector3.new(-118, 3.8, 82), C.white)
	prompt(fc, "Beli Nasi Goreng (Rp15)", "Penjual Makanan", { Action = "Generic", Cost = 15, Energy = 25, Happy = 3, Msg = "Nasi goreng enak! Energi pulih.", CD = 6 })
	local fc2 = P(kan, "FoodCounter2", Vector3.new(6, 1, 2), Vector3.new(-106, 3.8, 82), C.white)
	prompt(fc2, "Beli Makan Sehat (Rp25)", "Penjual Makanan", { Action = "Generic", Cost = 25, Energy = 40, Happy = 5, Stress = -3, Msg = "Makan sehat. Segar kembali!", CD = 6 })
	local vm = P(kan, "VendingMachine", Vector3.new(3, 7, 2.4), Vector3.new(-131, 3.5, 82), Color3.fromRGB(70, 110, 160), M.Metal)
	prompt(vm, "Beli Minuman (Rp8)", "Mesin Minuman", { Action = "Generic", Cost = 8, Energy = 10, Happy = 1, Msg = "Minuman dingin segar.", CD = 4 })
	for i = 0, 2 do
		for j = 0, 1 do
			local tb = Instance.new("Model")
			tb.Parent = kan
			local tt = table_(tb, Vector3.new(-125 + i * 14, 0.4, 58 + j * 12), 6, 3.4)
			prompt(tt, "Ngobrol dengan Teman", "Meja Makan", { Action = "Generic", Skill = "se", XP = 5, Energy = 3, Stress = -6, Happy = 6, Msg = "Ngobrol santai bersama teman.", CD = 15 }, 10)
		end
	end

	---------------------------------------------------------------- AREA 6: ASRAMA
	local dorm = building(world, "AsramaMahasiswa", Vector3.new(120, 0, 100), 70, 40, 1, 14, C.white)
	label(world, "ASRAMA MAHASISWA", Vector3.new(120, 16, 79), 260, 120)
	local wardrobeIdx = 0
	for i = 0, 5 do
		local rx = 95 + i * 10
		local rm = room(dorm, "Kamar" .. (i + 1), rx, 110, 10, 16, 0.5, 9, "S", C.woodL)
		P(rm, "Bed", Vector3.new(3.4, 1.4, 6), Vector3.new(rx - 2.5, 1.2, 114), C.white, M.Fabric)
		P(rm, "Pillow", Vector3.new(2.6, 0.5, 1.2), Vector3.new(rx - 2.5, 2.1, 116.4), C.concreteL, M.Fabric)
		local bedPart = P(rm, "BedBlanket", Vector3.new(3.4, 0.5, 4), Vector3.new(rx - 2.5, 2, 112.6), Color3.fromRGB(100, 140, 120), M.Fabric)
		prompt(bedPart, "Tidur", "Tempat Tidur", { Action = "Sleep", CD = 10 })
		local pc = station(rm, Vector3.new(rx + 2.6, 0.5, 116), "debug", "Coding di Kamar", 10)
		local sh = P(rm, "Wardrobe", Vector3.new(3, 7, 1.6), Vector3.new(rx + 2.6, 4, 108.4), C.wood, M.Wood)
		prompt(sh, "Ganti Pakaian", "Lemari", { Action = "Wardrobe", CD = 2 })
		local dec = P(rm, "DecorSpot", Vector3.new(2, 2, 0.4), Vector3.new(rx - 3.6, 6, 117.6), C.concreteL, M.SmoothPlastic)
		prompt(dec, "Dekorasi Kamar (Rp40)", "Poster & Dekorasi", { Action = "Decor", Cost = 40, CD = 2 })
		local up = P(rm, "LaptopShelf", Vector3.new(2, 0.5, 1.4), Vector3.new(rx + 3.4, 5, 117), C.dark)
		prompt(up, "Upgrade Laptop", "Laptop Pribadi", { Action = "Upgrade", CD = 2 })
		local studyP = P(rm, "StudyBook", Vector3.new(1, 0.3, 1.4), Vector3.new(rx + 1.4, 3.2, 115.4), Color3.fromRGB(150, 90, 70))
		prompt(studyP, "Belajar di Kamar", "Meja Belajar", { Action = "Study", Place = "dorm", CD = 10 })
		label(rm, "Kamar " .. (i + 1), Vector3.new(rx, 10.5, 101.5), 90, 40)
	end

	---------------------------------------------------------------- AREA 7: SPORT CENTER
	label(world, "SPORT CENTER", Vector3.new(0, 14, 128), 220, 130)
	local bc = P(world, "BasketCourt", Vector3.new(28, 0.3, 16), Vector3.new(-40, 0.15, 150), Color3.fromRGB(190, 120, 70), M.Concrete)
	for _, sx in ipairs({ -13, 13 }) do
		P(world, "HoopPole", Vector3.new(0.6, 11, 0.6), Vector3.new(-40 + sx, 5.5, 150), C.metal, M.Metal)
		P(world, "Backboard", Vector3.new(0.4, 4, 5), Vector3.new(-40 + sx, 10, 150), C.white)
	end
	prompt(bc, "Main Basket", "Lapangan Basket", { Action = "Generic", Energy = -15, Stress = -22, Happy = 8, Msg = "Main basket seru! Stres turun.", CD = 15 }, 18)
	local fs = P(world, "FutsalCourt", Vector3.new(36, 0.3, 20), Vector3.new(6, 0.15, 150), Color3.fromRGB(70, 130, 90), M.Concrete)
	for _, sx in ipairs({ -17, 17 }) do
		P(world, "Goal", Vector3.new(0.5, 4, 8), Vector3.new(6 + sx, 2, 150), C.white)
	end
	prompt(fs, "Main Futsal", "Lapangan Futsal", { Action = "Generic", Energy = -18, Stress = -25, Happy = 10, Msg = "Futsal bareng teman!", CD = 15 }, 20)
	local gym = building(world, "GymMahasiswa", Vector3.new(55, 0, 150), 24, 20, 1, 12, C.white)
	label(world, "GYM MAHASISWA", Vector3.new(55, 14, 139), 180, 100)
	for i = 0, 2 do
		local eq = P(gym, "Treadmill", Vector3.new(2.4, 3.4, 5), Vector3.new(48 + i * 5, 2, 154), C.dark, M.Metal)
		prompt(eq, "Latihan Gym", "Alat Gym", { Action = "Generic", Energy = -12, Stress = -14, Happy = 5, Msg = "Latihan gym: badan segar.", CD = 12 })
	end

	---------------------------------------------------------------- pohon acak (low-poly, hemat)
	local blocked = {
		{ -52, 52, -37, 37 }, { -162, -98, -55, -5 }, { -142, -78, 48, 92 }, { 78, 162, 75, 125 },
		{ -62, 82, 120, 185 }, { -14, 14, -265, -35 }, { -32, 32, -112, -68 }, { -92, -28, -228, -172 },
		{ 118, 192, -100, -20 }, { 78, 162, 60, 90 },
	}
	local rng = Random.new(11)
	local count = 0
	while count < 55 do
		local x, z = rng:NextNumber(-340, 340), rng:NextNumber(-270, 330)
		local ok = true
		for _, b in ipairs(blocked) do
			if x > b[1] - 6 and x < b[2] + 6 and z > b[3] - 6 and z < b[4] + 6 then ok = false break end
		end
		if ok then
			count += 1
			tree(world, Vector3.new(x, 0, z), 0.9 + rng:NextNumber() * 0.7)
		end
	end
	-- tembok tak terlihat agar pemain tidak jatuh di tepi dunia
	for _, w in ipairs({ { 0, -382, 760, 1 }, { 0, 382, 760, 1 }, { -382, 0, 1, 760 }, { 382, 0, 1, 760 } }) do
		local wall = P(world, "Boundary", Vector3.new(w[3], 80, w[4]), Vector3.new(w[1], 40, w[2]), C.white, M.SmoothPlastic, 1)
	end
	return world
end

return MapBuilder
