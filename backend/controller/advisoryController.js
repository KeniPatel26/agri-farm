const CropGuide = require('../models/CropGuide');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const DEFAULT_GUIDES = [
  {
    cropName: 'Wheat',
    scientificName: 'Triticum aestivum',
    soilRequirement: 'Well-drained fertile loamy to clay loam soil with neutral pH (6.0 - 7.5).',
    temperature: '15°C - 25°C (Cool climate during growth, warm dry weather during ripening)',
    waterRequirement: '450 - 650 mm throughout growing season. Critical stages: Crown Root Initiation (CRI), Flowering, Milking.',
    irrigation: '4-6 irrigations required. CRI stage (21 days after sowing) is most critical.',
    fertilizers: ['NPK 120:60:40 kg/ha', 'Apply 50% N + full P & K at sowing', 'Remaining 50% N split at 1st & 2nd irrigation'],
    pestManagement: ['Aphid control: Spray Dimethoate 30 EC or Imidacloprid (0.3 ml/L)', 'Termite control: Chlorpyrifos seed treatment'],
    diseasePrevention: ['Rust (Yellow/Brown): Spray Propiconazole 25 EC (1 ml/L)', 'Karnal Bunt: Use certified disease-resistant seeds (e.g. HD-2967, PBW-550)'],
    harvestInformation: 'Harvest when grains turn golden-yellow and moisture is below 12-14%.',
    precautions: ['Avoid waterlogging at CRI stage', 'Protect against terminal heat stress during grain filling stage.'],
  },
  {
    cropName: 'Rice',
    scientificName: 'Oryza sativa',
    soilRequirement: 'Heavy clay or clayey loam soils capable of holding standing water.',
    temperature: '22°C - 32°C (Warm and humid climate with abundant sunlight)',
    waterRequirement: '1200 - 1500 mm. Requires shallow standing water (2-5 cm) from transplanting to tillering.',
    irrigation: 'Alternate Wetting and Drying (AWD) saves 25% water while maintaining yields.',
    fertilizers: ['NPK 100:50:50 kg/ha + Zinc Sulphate 25 kg/ha', 'Split Nitrogen in 3 stages: Basal, Tillering, Panicle initiation'],
    pestManagement: ['Stem Borer: Pheromone traps (8/ha) or Cartap Hydrochloride 4G', 'Brown Planthopper (BPH): Avoid excessive nitrogen and spray Pymetrozine 50 WG'],
    diseasePrevention: ['Blast: Tricyclazole 75 WP (0.6 g/L)', 'Bacterial Leaf Blight: Seed treatment with Streptocycline'],
    harvestInformation: 'Harvest when 80-85% panicles turn straw golden yellow and grains are hard.',
    precautions: ['Drain standing water 10-14 days before harvest', 'Apply Zinc to prevent Khaira disease.'],
  },
  {
    cropName: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    soilRequirement: 'Deep black cotton soil (Vertisols) or deep fertile alluvial soils with good drainage.',
    temperature: '21°C - 35°C (Warm days and abundant sunshine)',
    waterRequirement: '700 - 1200 mm. Sensitive to waterlogging.',
    irrigation: 'Drip irrigation at 4-6 day intervals. Critical stages: Squaring and boll development.',
    fertilizers: ['NPK 120:60:60 kg/ha with micronutrient foliar spray (Magnesium Sulphate + Boron)', 'Split N at 30, 60, and 90 days after sowing'],
    pestManagement: ['Pink Bollworm: Pheromone monitoring + Trichogramma parasitoids', 'Whitefly / Sucking Pests: Spray Neem oil (1500 ppm) or Flonicamid 50 WG'],
    diseasePrevention: ['Cotton Leaf Curl Virus: Vector (whitefly) control', 'Grey Mildew: Spray Wettable Sulphur (2 g/L)'],
    harvestInformation: 'Hand-pick fully opened, dry and clean bolls in morning hours.',
    precautions: ['Do not harvest damp cotton bolls', 'Strictly destroy crop residue to prevent pink bollworm carryover.'],
  },
  {
    cropName: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    soilRequirement: 'Deep, well-drained sandy loam soil with high organic matter (pH 6.0 - 7.0).',
    temperature: '18°C - 28°C (Night temp 15-20°C for optimal fruit set)',
    waterRequirement: '600 - 800 mm. Frequent light irrigation via drip lines.',
    irrigation: 'Avoid moisture fluctuations to prevent fruit cracking and Blossom End Rot.',
    fertilizers: ['NPK 150:100:100 kg/ha + Calcium Nitrate fertigation during fruiting', 'Foliar spray of Boron during flowering'],
    pestManagement: ['Fruit Borer: Spray Coragen (0.3 ml/L) or Bacillus thuringiensis (Bt)', 'Tuta absoluta: Sticky delta pheromone traps'],
    diseasePrevention: ['Early/Late Blight: Mancozeb 75 WP (2 g/L) or Copper Oxychloride (2.5 g/L)', 'Bacterial Wilt: Crop rotation with non-solanaceous crops'],
    harvestInformation: 'Pick at breaker stage for long-distance transport, or red-ripe stage for local markets.',
    precautions: ['Provide sturdy bamboo/wire staking', 'Mulching with silver-black polythene prevents weeds and conserves moisture.'],
  },
  {
    cropName: 'Mustard',
    scientificName: 'Brassica juncea',
    soilRequirement: 'Light to heavy loamy soils with good drainage (pH 6.5 - 7.5).',
    temperature: '10°C - 25°C (Cool winter season / Rabi crop)',
    waterRequirement: '250 - 400 mm. Drought tolerant.',
    irrigation: '2-3 irrigations: Flowering stage and siliqua (pod) formation stage.',
    fertilizers: ['NPK 80:40:40 kg/ha + Sulphur 20-30 kg/ha (crucial for oil content)'],
    pestManagement: ['Mustard Aphid: Spray Dimethoate or Thiamethoxam 25 WG when aphid colony exceeds 25/plant'],
    diseasePrevention: ['White Rust & Alternaria Blight: Spray Mancozeb (2 g/L) or Metalaxyl 35 WS seed treatment'],
    harvestInformation: 'Harvest when 75% of siliquae turn yellowish-brown.',
    precautions: ['Harvest early morning to prevent pod shattering and seed loss.'],
  },
  {
    cropName: 'Corn',
    scientificName: 'Zea mays',
    soilRequirement: 'Well-drained deep loamy soil rich in organic matter (pH 6.0 - 7.5).',
    temperature: '20°C - 32°C (Warm sunshine and moderate humidity)',
    waterRequirement: '500 - 800 mm. Highly sensitive to moisture stress during tasseling and silking.',
    irrigation: 'Irrigate at knee-high, tasseling, silking, and grain filling stages.',
    fertilizers: ['NPK 120:60:40 kg/ha + Zinc Sulphate 25 kg/ha', 'Side-dress Nitrogen at knee-high stage'],
    pestManagement: ['Fall Armyworm (FAW): Spray Emamectin Benzoate 5 SG (0.4 g/L) into the whorls or use whorl sand-ash application'],
    diseasePrevention: ['Turcicum Leaf Blight: Spray Mancozeb 75 WP (2 g/L)', 'Downy Mildew: Seed treatment with Metalaxyl'],
    harvestInformation: 'Harvest when husk turns paper-dry and black layer forms at base of kernel.',
    precautions: ['Ensure optimal plant population (65,000 - 70,000 plants/ha) for highest cob yield.'],
  },
];

// @desc    Get all crop guides
// @route   GET /api/v1/advisory
// @access  Public / Private
const getAllCropGuides = async (req, res, next) => {
  try {
    let guides = await CropGuide.find().sort({ cropName: 1 });

    // Seed defaults if database is empty
    if (guides.length === 0) {
      await CropGuide.insertMany(DEFAULT_GUIDES);
      guides = await CropGuide.find().sort({ cropName: 1 });
    }

    return successResponse(res, guides, 'Crop guides fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get crop guide by name
// @route   GET /api/v1/advisory/:cropName
// @access  Public / Private
const getCropGuide = async (req, res, next) => {
  try {
    const { cropName } = req.params;
    let guide = await CropGuide.findOne({
      cropName: { $regex: new RegExp(`^${cropName}$`, 'i') },
    });

    if (!guide) {
      // Fallback from default list
      const fallback = DEFAULT_GUIDES.find(
        (g) => g.cropName.toLowerCase() === cropName.toLowerCase()
      );
      if (fallback) {
        guide = await CropGuide.create(fallback);
      } else {
        return errorResponse(res, `Crop guide for "${cropName}" not found`, 404);
      }
    }

    return successResponse(res, guide, `Crop guide for ${cropName} fetched successfully`);
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update crop guide
// @route   POST /api/v1/advisory
// @access  Private (Admin only)
const createOrUpdateCropGuide = async (req, res, next) => {
  try {
    const {
      cropName,
      scientificName,
      soilRequirement,
      temperature,
      waterRequirement,
      irrigation,
      fertilizers,
      pestManagement,
      diseasePrevention,
      harvestInformation,
      precautions,
      imageUrl,
    } = req.body;

    if (!cropName || !irrigation || !fertilizers) {
      return errorResponse(res, 'Please provide crop name, irrigation, and fertilizer schedule', 400);
    }

    let guide = await CropGuide.findOne({
      cropName: { $regex: new RegExp(`^${cropName.trim()}$`, 'i') },
    });

    if (guide) {
      guide.scientificName = scientificName || guide.scientificName;
      guide.soilRequirement = soilRequirement || guide.soilRequirement;
      guide.temperature = temperature || guide.temperature;
      guide.waterRequirement = waterRequirement || guide.waterRequirement;
      guide.irrigation = irrigation || guide.irrigation;
      guide.fertilizers = fertilizers || guide.fertilizers;
      guide.pestManagement = pestManagement || guide.pestManagement;
      guide.diseasePrevention = diseasePrevention || guide.diseasePrevention;
      guide.harvestInformation = harvestInformation || guide.harvestInformation;
      guide.precautions = precautions || guide.precautions;
      guide.imageUrl = imageUrl || guide.imageUrl;
      const updated = await guide.save();
      return successResponse(res, updated, 'Crop guide updated successfully');
    } else {
      guide = await CropGuide.create({
        cropName: cropName.trim(),
        scientificName: scientificName || '',
        soilRequirement: soilRequirement || '',
        temperature: temperature || '',
        waterRequirement: waterRequirement || '',
        irrigation,
        fertilizers,
        pestManagement: pestManagement || [],
        diseasePrevention: diseasePrevention || [],
        harvestInformation: harvestInformation || '',
        precautions: precautions || [],
        imageUrl: imageUrl || '',
      });
      return successResponse(res, guide, 'Crop guide created successfully', 201);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCropGuides,
  getCropGuide,
  createOrUpdateCropGuide,
};
