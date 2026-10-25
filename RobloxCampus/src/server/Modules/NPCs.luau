-- NPCs.luau : NPC dosen, mahasiswa (rajin/pemalas/ambisius/senior), satpam, staf, HR industri
local Players = game:GetService("Players")
local CS = game:GetService("CollectionService")
local Workspace = game:GetService("Workspace")

local NPCs = {}

local LIST = {
	-- role, nama, posisi, warna baju, wander radius
	{ role = "satpam", name = "Pak Satpam", pos = Vector3.new(24, 3, -232), color = Color3.fromRGB(60, 80, 110), wander = 0 },
	{ role = "staff", name = "Resepsionis", pos = Vector3.new(0, 4, -14), color = Color3.fromRGB(110, 140, 110), wander = 0 },
	{ role = "dosen", name = "Bu Sari (Dosen)", pos = Vector3.new(-24, 18, 31), color = Color3.fromRGB(120, 90, 70), wander = 0 },
	{ role = "dosen", name = "Pak Budi (Dosen)", pos = Vector3.new(0, 18, 31), color = Color3.fromRGB(90, 100, 120), wander = 0 },
	{ role = "dosen", name = "Dr. Wijaya (Dosen)", pos = Vector3.new(24, 18, 31), color = Color3.fromRGB(100, 110, 90), wander = 0 },
	{ role = "dosen", name = "Pak Joko (Dosen Lab)", pos = Vector3.new(4, 32, 12), color = Color3.fromRGB(100, 100, 100), wander = 0 },
	{ role = "rajin", name = "Rani (Rajin)", pos = Vector3.new(-120, 3, -45), color = Color3.fromRGB(190, 215, 200), wander = 10 },
	{ role = "rajin", name = "Alya (Rajin)", pos = Vector3.new(-25, 33, -14), color = Color3.fromRGB(200, 205, 225), wander = 8 },
	{ role = "pemalas", name = "Dito (Santai)", pos = Vector3.new(-110, 3, 65), color = Color3.fromRGB(220, 190, 120), wander = 12 },
	{ role = "pemalas", name = "Bima (Santai)", pos = Vector3.new(115, 3, -40), color = Color3.fromRGB(190, 120, 100), wander = 14 },
	{ role = "ambisius", name = "Kevin (Ambisius)", pos = Vector3.new(-40, 3, 45), color = Color3.fromRGB(70, 90, 120), wander = 10 },
	{ role = "senior", name = "Kak Fajar (Senior)", pos = Vector3.new(0, 3, -75), color = Color3.fromRGB(110, 70, 70), wander = 12 },
	{ role = "senior", name = "Kak Salsa (Senior)", pos = Vector3.new(60, 3, 45), color = Color3.fromRGB(150, 110, 150), wander = 12 },
	{ role = "hr", name = "HR PT Teknologi Nusantara", pos = Vector3.new(-10, 46, -2), color = Color3.fromRGB(60, 90, 80), wander = 0 },
	{ role = "hr", name = "HR Job Fair", pos = Vector3.new(-10, 3, -88), color = Color3.fromRGB(70, 100, 90), wander = 0 },
	{ role = "vendor", name = "Bu Warung", pos = Vector3.new(-112, 3, 85.5), color = Color3.fromRGB(200, 120, 90), wander = 0 },
	-- mahasiswa berjalan dari parkiran ke fakultas
	{ role = "rajin", name = "Mahasiswa", route = { Vector3.new(-60, 3, -190), Vector3.new(-6, 3, -150), Vector3.new(0, 3, -90), Vector3.new(0, 3, -34) }, color = Color3.fromRGB(180, 200, 220), wander = 0 },
	{ role = "pemalas", name = "Mahasiswa", route = { Vector3.new(-60, 3, -185), Vector3.new(6, 3, -150), Vector3.new(8, 3, -90), Vector3.new(4, 3, -34) }, color = Color3.fromRGB(210, 180, 150), wander = 0 },
	{ role = "senior", name = "Mahasiswa", route = { Vector3.new(0, 3, -240), Vector3.new(-4, 3, -150), Vector3.new(-6, 3, -90), Vector3.new(-6, 3, -34) }, color = Color3.fromRGB(150, 180, 150), wander = 0 },
}

local function build(def, folder)
	local desc = Instance.new("HumanoidDescription")
	desc.HeadColor = Color3.fromRGB(240, 200, 160)
	desc.TorsoColor = def.color
	desc.LeftArmColor = def.color
	desc.RightArmColor = def.color
	desc.LeftLegColor = Color3.fromRGB(60, 70, 85)
	desc.RightLegColor = Color3.fromRGB(60, 70, 85)
	local ok, model = pcall(function()
		return Players:CreateHumanoidModelFromDescription(desc, Enum.HumanoidRigType.R15)
	end)
	if not ok or not model then return end
	model.Name = def.name
	local hum = model:FindFirstChildOfClass("Humanoid")
	hum.DisplayName = def.name
	hum.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.Subject
	hum.NameDisplayDistance = 28
	hum.WalkSpeed = 8
	model.Parent = folder
	model:PivotTo(CFrame.new(def.pos))
	local root = model:FindFirstChild("HumanoidRootPart")
	pcall(function() root:SetNetworkOwner(nil) end)

	local pp = Instance.new("ProximityPrompt")
	pp.ActionText = "Bicara"
	pp.ObjectText = def.name
	pp.MaxActivationDistance = 9
	pp.HoldDuration = 0.2
	pp.RequiresLineOfSight = false
	pp:SetAttribute("Action", "NPC")
	pp:SetAttribute("Role", def.role)
	pp:SetAttribute("NPCName", def.name)
	pp:SetAttribute("CD", 4)
	if def.role == "vendor" then
		pp:SetAttribute("Action", "Generic")
		pp:SetAttribute("Cost", 15)
		pp:SetAttribute("Energy", 25)
		pp:SetAttribute("Happy", 3)
		pp:SetAttribute("Msg", "Terima kasih! Makanan enak, energi pulih.")
		pp.ActionText = "Beli makanan (Rp15)"
	end
	pp.Parent = root
	CS:AddTag(pp, "Act")

	-- perilaku berjalan
	if def.route then
		task.spawn(function()
			local i, dir = 1, 1
			while model.Parent do
				hum:MoveTo(def.route[i])
				hum.MoveToFinished:Wait()
				task.wait(math.random(2, 5))
				i += dir
				if i > #def.route then dir = -1 i = #def.route - 1 end
				if i < 1 then dir = 1 i = 2 end
			end
		end)
	elseif def.wander and def.wander > 0 then
		task.spawn(function()
			while model.Parent do
				local off = Vector3.new(math.random(-def.wander, def.wander), 0, math.random(-def.wander, def.wander))
				hum:MoveTo(def.pos + off)
				task.wait(math.random(4, 9))
			end
		end)
	end
end

function NPCs.init()
	local folder = Instance.new("Folder")
	folder.Name = "NPCs"
	folder.Parent = Workspace
	for _, def in ipairs(LIST) do
		task.spawn(build, def, folder)
		task.wait(0.1)
	end
end

return NPCs
