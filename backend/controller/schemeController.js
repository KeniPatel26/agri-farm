const GovernmentScheme = require('../models/GovernmentScheme');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all government schemes
// @route   GET /api/v1/schemes
// @access  Public
const getSchemes = async (req, res, next) => {
  try {
    const schemes = await GovernmentScheme.find().sort({ createdAt: -1 });

    // Seed default programs if database is completely empty
    if (schemes.length === 0) {
      const defaultSchemes = [
        {
          title: 'PM-Kisan Samman Nidhi',
          description: 'An initiative by the government of India providing financial assistance to landholder farmers families.',
          eligibility: 'All small and marginal landholding farmer families who hold cultivable land in their names.',
          benefits: '₹6,000 per year in three equal installments of ₹2,000 directly transferred into bank accounts.',
          link: 'https://pmkisan.gov.in/'
        },
        {
          title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
          description: 'Government sponsored crop insurance scheme that integrates multiple stakeholders.',
          eligibility: 'All farmers cultivating notified crops in notified areas including sharecroppers and tenant farmers.',
          benefits: 'Low premium crop insurance against natural calamities, pests, and disease damages.',
          link: 'https://pmfby.gov.in/'
        },
        {
          title: 'PM Krishi Sinchayee Yojana (PMKSY)',
          description: 'National mission to improve on-farm water use efficiency and introduce micro-irrigation systems.',
          eligibility: 'All farmers possessing cultivable agricultural land across all states.',
          benefits: 'Up to 55% subsidies for small/marginal farmers on installing drip and sprinkler systems.',
          link: 'https://pmksy.gov.in/'
        }
      ];
      const seeded = await GovernmentScheme.insertMany(defaultSchemes);
      return successResponse(res, seeded, 'Default government schemes seeded and fetched successfully');
    }

    return successResponse(res, schemes, 'Government schemes fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new scheme
// @route   POST /api/v1/schemes
// @access  Private (Admin only)
const createScheme = async (req, res, next) => {
  try {
    const { title, description, eligibility, benefits, link } = req.body;

    if (!title || !description || !eligibility || !benefits || !link) {
      return errorResponse(res, 'Please provide all required fields', 400);
    }

    const scheme = await GovernmentScheme.create({
      title,
      description,
      eligibility,
      benefits,
      link
    });

    return successResponse(res, scheme, 'Government scheme created successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchemes,
  createScheme,
};
