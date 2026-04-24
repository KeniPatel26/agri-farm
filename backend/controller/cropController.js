const Crop = require('../models/Crop');

// @desc    Get crops for logged in farmer
// @route   GET /api/crops
// @access  Private
const getCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(crops);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a new crop
// @route   POST /api/crops
// @access  Private
const addCrop = async (req, res) => {
  try {
    const { cropName, stage, quantity, location } = req.body;

    if (!cropName || !quantity || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const crop = await Crop.create({
      farmerId: req.user.id,
      cropName,
      stage: stage || 'Growing',
      quantity,
      location
    });

    res.status(201).json(crop);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update crop
// @route   PUT /api/crops/:id
// @access  Private
const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Make sure the logged in user matches the crop farmer
    if (crop.farmerId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedCrop = await Crop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedCrop);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private
const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Make sure the logged in user matches the crop farmer
    if (crop.farmerId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await crop.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCrops,
  addCrop,
  updateCrop,
  deleteCrop
};
