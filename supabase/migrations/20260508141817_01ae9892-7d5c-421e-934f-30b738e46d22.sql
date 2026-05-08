
-- Crops knowledge base
CREATE TABLE public.crops_kb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop text NOT NULL UNIQUE,
  scientific_name text,
  season text,
  common_diseases text[] DEFAULT '{}',
  common_pests text[] DEFAULT '{}',
  soil text,
  water_needs text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crops_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crops_kb readable by all" ON public.crops_kb FOR SELECT USING (true);
CREATE POLICY "crops_kb admin write" ON public.crops_kb FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Agro-chemicals catalog
CREATE TABLE public.agro_chemicals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active_ingredient text NOT NULL,
  type text NOT NULL,
  target text[] DEFAULT '{}',
  dose_per_litre text,
  dose_per_acre text,
  phi_days int,
  safety_class text,
  ppe text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agro_chemicals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agro_chemicals readable by all" ON public.agro_chemicals FOR SELECT USING (true);
CREATE POLICY "agro_chemicals admin write" ON public.agro_chemicals FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Mandi prices
CREATE TABLE public.mandi_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  district text,
  market text NOT NULL,
  commodity text NOT NULL,
  variety text,
  min_price numeric,
  max_price numeric,
  modal_price numeric,
  arrival_date date NOT NULL,
  unit text DEFAULT 'Quintal',
  fetched_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_mandi_commodity ON public.mandi_prices(commodity, arrival_date DESC);
CREATE INDEX idx_mandi_state ON public.mandi_prices(state, arrival_date DESC);
CREATE UNIQUE INDEX uq_mandi_row ON public.mandi_prices(state, market, commodity, COALESCE(variety,''), arrival_date);
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mandi_prices readable by all" ON public.mandi_prices FOR SELECT USING (true);
CREATE POLICY "mandi_prices admin write" ON public.mandi_prices FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed crops_kb
INSERT INTO public.crops_kb (crop, scientific_name, season, common_diseases, common_pests, soil, water_needs, notes) VALUES
('Rice','Oryza sativa','Kharif',ARRAY['Blast','Bacterial Leaf Blight','Sheath Blight','Brown Spot'],ARRAY['Stem Borer','Brown Planthopper','Leaf Folder'],'Clay loam','High','Transplant 21–25 day seedlings; maintain 2–5 cm standing water.'),
('Wheat','Triticum aestivum','Rabi',ARRAY['Yellow Rust','Brown Rust','Karnal Bunt','Loose Smut'],ARRAY['Aphids','Termites','Armyworm'],'Loam','Medium','Sow Nov; CRI irrigation at 20–25 DAS is critical.'),
('Maize','Zea mays','Kharif/Rabi',ARRAY['Turcicum Leaf Blight','Maydis Leaf Blight','Charcoal Rot'],ARRAY['Fall Armyworm','Stem Borer','Shoot Fly'],'Well-drained loam','Medium','FAW scouting weekly; spray at 5% ETL.'),
('Cotton','Gossypium hirsutum','Kharif',ARRAY['Wilt','Boll Rot','Leaf Curl Virus','Alternaria Leaf Spot'],ARRAY['Pink Bollworm','Whitefly','Jassid','Thrips'],'Black cotton soil','Medium','Pheromone traps 8/acre for PBW from 45 DAS.'),
('Sugarcane','Saccharum officinarum','Annual',ARRAY['Red Rot','Smut','Wilt','Pokkah Boeng'],ARRAY['Top Borer','Pyrilla','Termite'],'Loam','High','Hot-water seed treatment 50°C 2 h prevents red rot.'),
('Soybean','Glycine max','Kharif',ARRAY['Yellow Mosaic Virus','Rust','Anthracnose','Charcoal Rot'],ARRAY['Girdle Beetle','Semilooper','Stem Fly'],'Black soil','Medium','Resistant varieties JS-9560, JS-2034 advised in YMV zones.'),
('Groundnut','Arachis hypogaea','Kharif',ARRAY['Tikka Leaf Spot','Rust','Stem Rot','Bud Necrosis'],ARRAY['Leaf Miner','Thrips','White Grub'],'Sandy loam','Medium','Gypsum @ 250 kg/acre at flowering for pod fill.'),
('Tomato','Solanum lycopersicum','All seasons',ARRAY['Late Blight','Early Blight','Bacterial Wilt','Leaf Curl Virus'],ARRAY['Fruit Borer','Whitefly','Aphid'],'Well-drained loam','Medium','Stake plants; remove lower leaves to reduce blight.'),
('Potato','Solanum tuberosum','Rabi',ARRAY['Late Blight','Early Blight','Black Scurf','Common Scab'],ARRAY['Cutworm','Aphid','Tuber Moth'],'Sandy loam','Medium','Earth up at 30 DAP; avoid waterlogging to prevent blight.'),
('Onion','Allium cepa','Rabi',ARRAY['Purple Blotch','Stemphylium Blight','Basal Rot'],ARRAY['Thrips','Onion Maggot'],'Loam','Medium','Stop irrigation 15 days before harvest.'),
('Chilli','Capsicum annuum','Kharif/Rabi',ARRAY['Anthracnose','Leaf Curl','Damping Off','Powdery Mildew'],ARRAY['Thrips','Mites','Fruit Borer'],'Loam','Medium','Mulch reduces virus vector pressure significantly.'),
('Brinjal','Solanum melongena','All seasons',ARRAY['Bacterial Wilt','Phomopsis Blight','Little Leaf'],ARRAY['Shoot & Fruit Borer','Jassid','Whitefly'],'Loam','Medium','Hand-pick & destroy borer-infested shoots weekly.'),
('Okra','Abelmoschus esculentus','Kharif/Summer',ARRAY['Yellow Vein Mosaic','Powdery Mildew','Cercospora Leaf Spot'],ARRAY['Shoot & Fruit Borer','Jassid','Whitefly'],'Loam','Medium','Use YVMV-tolerant hybrids; destroy infected plants.'),
('Mustard','Brassica juncea','Rabi',ARRAY['Alternaria Blight','White Rust','Powdery Mildew','Sclerotinia Stem Rot'],ARRAY['Aphid','Painted Bug','Sawfly'],'Loam','Low','Mid-Oct sowing minimises aphid damage.'),
('Chickpea (Gram)','Cicer arietinum','Rabi',ARRAY['Wilt','Ascochyta Blight','Botrytis Gray Mold','Collar Rot'],ARRAY['Pod Borer','Cutworm'],'Loam','Low','Seed treatment with Trichoderma + Rhizobium.'),
('Pigeonpea (Tur)','Cajanus cajan','Kharif',ARRAY['Wilt','Sterility Mosaic','Phytophthora Blight'],ARRAY['Pod Borer','Pod Fly','Plume Moth'],'Loam','Low','Wilt-resistant varieties ICPL-87119 (Asha).'),
('Mango','Mangifera indica','Perennial',ARRAY['Anthracnose','Powdery Mildew','Malformation'],ARRAY['Mango Hopper','Mealybug','Fruit Fly'],'Deep loam','Medium','Pruning post-harvest improves canopy airflow.'),
('Banana','Musa spp.','Perennial',ARRAY['Panama Wilt','Sigatoka Leaf Spot','Bunchy Top Virus'],ARRAY['Pseudostem Weevil','Rhizome Weevil','Aphid'],'Loam','High','Use tissue-culture plants for disease-free start.'),
('Grapes','Vitis vinifera','Perennial',ARRAY['Downy Mildew','Powdery Mildew','Anthracnose'],ARRAY['Thrips','Mealybug','Flea Beetle'],'Loam','Medium','Pre-bloom Bordeaux mixture 1% prevents downy mildew.'),
('Apple','Malus domestica','Perennial',ARRAY['Apple Scab','Powdery Mildew','Marssonina Leaf Blotch'],ARRAY['Codling Moth','San Jose Scale','Wooly Aphid'],'Well-drained loam','Medium','Sanitation: collect & destroy fallen leaves to break scab cycle.'),
('Turmeric','Curcuma longa','Kharif',ARRAY['Rhizome Rot','Leaf Spot','Leaf Blotch'],ARRAY['Shoot Borer','Rhizome Scale'],'Loam','Medium','Mulch with green leaves @ 2 t/acre at planting.'),
('Ginger','Zingiber officinale','Kharif',ARRAY['Soft Rot','Bacterial Wilt','Leaf Spot'],ARRAY['Shoot Borer','Rhizome Scale'],'Loam','Medium','Avoid waterlogging; raised beds essential.'),
('Coconut','Cocos nucifera','Perennial',ARRAY['Bud Rot','Stem Bleeding','Root Wilt'],ARRAY['Rhinoceros Beetle','Red Palm Weevil','Eriophyid Mite'],'Sandy loam','Medium','Crown cleaning + pheromone traps for RPW.'),
('Coffee','Coffea spp.','Perennial',ARRAY['Coffee Leaf Rust','Berry Disease','Black Rot'],ARRAY['White Stem Borer','Berry Borer','Mealybug'],'Loam (acidic)','Medium','Shade trees lower berry borer incidence.'),
('Tea','Camellia sinensis','Perennial',ARRAY['Blister Blight','Grey Blight','Red Rust'],ARRAY['Tea Mosquito Bug','Looper','Red Spider Mite'],'Acidic loam','High','Copper sprays during monsoon for blister blight.'),
('Bajra (Pearl Millet)','Pennisetum glaucum','Kharif',ARRAY['Downy Mildew','Smut','Ergot'],ARRAY['Shoot Fly','Stem Borer','Armyworm'],'Sandy loam','Low','Resistant hybrids HHB-67, ICMH-356 against downy mildew.'),
('Jowar (Sorghum)','Sorghum bicolor','Kharif/Rabi',ARRAY['Grain Mold','Anthracnose','Charcoal Rot'],ARRAY['Shoot Fly','Stem Borer','Midge'],'Loam','Low','Late sowing increases shoot fly damage.'),
('Ragi (Finger Millet)','Eleusine coracana','Kharif',ARRAY['Blast','Brown Spot'],ARRAY['Pink Borer','Cutworm'],'Red loam','Low','Drought-tolerant; ideal for rainfed dryland.'),
('Cabbage','Brassica oleracea','Rabi',ARRAY['Black Rot','Downy Mildew','Club Root'],ARRAY['Diamondback Moth','Aphid','Cabbage Borer'],'Loam','Medium','Trap crop mustard around cabbage reduces DBM.'),
('Cauliflower','Brassica oleracea var. botrytis','Rabi',ARRAY['Downy Mildew','Black Rot','Buttoning'],ARRAY['Diamondback Moth','Aphid'],'Loam','Medium','Boron @ 1 g/L spray prevents browning of curd.');

-- Seed agro_chemicals
INSERT INTO public.agro_chemicals (name, active_ingredient, type, target, dose_per_litre, dose_per_acre, phi_days, safety_class, ppe, notes) VALUES
('Mancozeb 75% WP','Mancozeb','Fungicide',ARRAY['Late Blight','Early Blight','Downy Mildew','Anthracnose','Leaf Spot'],'2.5 g/L','600–800 g',7,'Yellow (Slightly toxic)','Mask, gloves, full-sleeve clothing','Broad-spectrum protectant; rotate with systemic.'),
('Copper Oxychloride 50% WP','Copper Oxychloride','Fungicide/Bactericide',ARRAY['Bacterial Leaf Spot','Downy Mildew','Citrus Canker','Bud Rot'],'3 g/L','800 g–1 kg',10,'Yellow','Mask, gloves','Phytotoxic on copper-sensitive cultivars.'),
('Carbendazim 50% WP','Carbendazim','Fungicide (systemic)',ARRAY['Powdery Mildew','Anthracnose','Wilt','Sheath Blight'],'1 g/L','200 g',14,'Yellow','Mask, gloves','Avoid repeat use — resistance risk.'),
('Propiconazole 25% EC','Propiconazole','Fungicide (systemic)',ARRAY['Rust','Sheath Blight','Powdery Mildew'],'1 ml/L','200 ml',30,'Yellow','Mask, gloves','Effective for cereal rusts; do not exceed 2 sprays.'),
('Hexaconazole 5% EC','Hexaconazole','Fungicide (systemic)',ARRAY['Sheath Blight','Powdery Mildew','Rust','Tikka Leaf Spot'],'2 ml/L','400 ml',25,'Yellow','Mask, gloves','Triazole; rotate with multi-site fungicide.'),
('Azoxystrobin 23% SC','Azoxystrobin','Fungicide (systemic)',ARRAY['Blast','Sheath Blight','Anthracnose','Downy Mildew'],'1 ml/L','200 ml',21,'Yellow','Mask, gloves','Strobilurin; max 2 sprays per season.'),
('Tebuconazole 25.9% EC','Tebuconazole','Fungicide (systemic)',ARRAY['Rust','Tikka Leaf Spot','Powdery Mildew'],'1 ml/L','200 ml',30,'Yellow','Mask, gloves','Curative + protective action.'),
('Chlorothalonil 75% WP','Chlorothalonil','Fungicide',ARRAY['Late Blight','Early Blight','Anthracnose'],'2 g/L','400 g',7,'Yellow','Mask, gloves, goggles','Multi-site protectant; eye irritant.'),
('Metalaxyl 8% + Mancozeb 64% WP','Metalaxyl + Mancozeb','Fungicide (combination)',ARRAY['Late Blight','Downy Mildew'],'2.5 g/L','600 g',10,'Yellow','Mask, gloves','Systemic + protectant combo.'),
('Sulphur 80% WDG','Sulphur','Fungicide/Acaricide',ARRAY['Powdery Mildew','Mites'],'3 g/L','800 g',1,'Green (Practically non-toxic)','Mask, gloves','Avoid spraying above 32 °C — phytotoxic.'),
('Imidacloprid 17.8% SL','Imidacloprid','Insecticide (systemic)',ARRAY['Aphid','Whitefly','Jassid','Thrips','Brown Planthopper'],'0.5 ml/L','60–80 ml',40,'Yellow','Mask, gloves','Toxic to bees — avoid flowering.'),
('Thiamethoxam 25% WG','Thiamethoxam','Insecticide (systemic)',ARRAY['Aphid','Whitefly','Jassid','Thrips','BPH'],'0.4 g/L','40 g',21,'Yellow','Mask, gloves','Neonicotinoid; toxic to pollinators.'),
('Acetamiprid 20% SP','Acetamiprid','Insecticide (systemic)',ARRAY['Aphid','Whitefly','Jassid'],'0.2 g/L','40–50 g',7,'Yellow','Mask, gloves','Less bee-toxic than other neonics.'),
('Chlorpyriphos 20% EC','Chlorpyriphos','Insecticide',ARRAY['Stem Borer','Termite','Cutworm','White Grub'],'2.5 ml/L','500 ml',21,'Blue (Moderately toxic)','Full PPE: respirator, goggles, gloves','Banned for many uses; check state regulations.'),
('Quinalphos 25% EC','Quinalphos','Insecticide',ARRAY['Bollworm','Pod Borer','Leaf Folder'],'2 ml/L','400 ml',21,'Blue','Full PPE','Organophosphate; high toxicity to fish.'),
('Lambda-Cyhalothrin 5% EC','Lambda-Cyhalothrin','Insecticide',ARRAY['Bollworm','Stem Borer','Leaf Folder','Aphid'],'0.5 ml/L','100 ml',7,'Yellow','Mask, gloves','Pyrethroid; avoid contact with skin.'),
('Cypermethrin 10% EC','Cypermethrin','Insecticide',ARRAY['Bollworm','Stem Borer','Aphid','Whitefly'],'1 ml/L','200 ml',7,'Yellow','Mask, gloves','Highly toxic to fish & bees.'),
('Spinosad 45% SC','Spinosad','Insecticide (bio-derived)',ARRAY['Diamondback Moth','Fall Armyworm','Thrips','Fruit Borer'],'0.3 ml/L','60–80 ml',3,'Green','Mask, gloves','Approved in IPM; safer profile.'),
('Emamectin Benzoate 5% SG','Emamectin Benzoate','Insecticide',ARRAY['Bollworm','Pod Borer','Fall Armyworm','Diamondback Moth'],'0.4 g/L','80 g',7,'Yellow','Mask, gloves','Avermectin; rotate with different mode of action.'),
('Chlorantraniliprole 18.5% SC','Chlorantraniliprole','Insecticide',ARRAY['Stem Borer','Fall Armyworm','Pod Borer','Leaf Folder'],'0.3 ml/L','60 ml',21,'Green','Mask, gloves','Diamide; excellent for FAW in maize.'),
('Fipronil 5% SC','Fipronil','Insecticide',ARRAY['Brown Planthopper','Stem Borer','Termite'],'2 ml/L','400 ml',45,'Yellow','Mask, gloves','Persistent; do not use in flowering rice.'),
('Profenofos 50% EC','Profenofos','Insecticide',ARRAY['Bollworm','Leaf Miner','Mites','Thrips'],'2 ml/L','400 ml',21,'Blue','Full PPE','Organophosphate; avoid in vegetables near harvest.'),
('Glyphosate 41% SL','Glyphosate','Herbicide (non-selective)',ARRAY['Weeds (broad-spectrum)'],'10 ml/L','1 L (knapsack)',NULL,'Yellow','Mask, gloves, goggles','Non-selective — protect crop with hood.'),
('Paraquat 24% SL','Paraquat','Herbicide (contact)',ARRAY['Weeds'],'5 ml/L','1 L',NULL,'Red (Highly toxic)','Full PPE mandatory','Highly toxic to humans; restricted use.'),
('Atrazine 50% WP','Atrazine','Herbicide (selective)',ARRAY['Weeds in Maize/Sugarcane'],NULL,'500 g–1 kg pre-em',NULL,'Yellow','Mask, gloves','Pre-emergence; avoid intercropping with sensitive crops.'),
('Pendimethalin 30% EC','Pendimethalin','Herbicide (pre-em)',ARRAY['Weeds (broad-spectrum)'],NULL,'1 L pre-em',NULL,'Yellow','Mask, gloves','Apply within 3 DAS on moist soil.'),
('2,4-D Amine 58% SL','2,4-D','Herbicide (selective)',ARRAY['Broadleaf Weeds in Cereals'],NULL,'400 ml',NULL,'Yellow','Mask, gloves','Drift hazard — avoid near broadleaf crops.'),
('Trichoderma viride 1% WP','Trichoderma viride','Bio-fungicide',ARRAY['Wilt','Damping Off','Root Rot','Collar Rot'],'5 g/L (drench)','2 kg soil application',0,'Green','Gloves','Seed treatment 4 g/kg; compatible with FYM.'),
('Pseudomonas fluorescens 1% WP','Pseudomonas fluorescens','Bio-fungicide/Bactericide',ARRAY['Bacterial Blight','Sheath Blight','Wilt'],'10 g/L','2.5 kg soil',0,'Green','Gloves','Apply with organic carrier (FYM).'),
('Bacillus thuringiensis var. kurstaki','Bt kurstaki','Bio-insecticide',ARRAY['Bollworm','Diamondback Moth','Fruit Borer','Fall Armyworm'],'1 g/L','500 g–1 kg',0,'Green','Mask, gloves','Spray in evening; UV-sensitive.'),
('Neem Oil (1500 ppm)','Azadirachtin','Bio-insecticide',ARRAY['Aphid','Whitefly','Thrips','Mites','Leaf Miner'],'5 ml/L','1 L',1,'Green','Gloves','Add 1 ml/L sticker; spray weekly in IPM.');
