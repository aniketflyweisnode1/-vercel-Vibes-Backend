const Package = require("../models/package");
const { generateOTP } = require('../../utils/helpers');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const createPackage = asyncHandler(async (req, res) => {
    try {
        const { name, nameDescription, price, isFree, description,duration } = req.body;
        const policies = await Package.findOne({ name: name, duration: duration });
        if (policies) {
            return res.status(409).json({ status: 409, message: "Package already exists", data: policies });
        } else {
            const newPackage = new Package({ name, price, nameDescription, isFree, description, });
            await newPackage.save();
            return res.status(200).json({ status: 200, message: "Package entry created successfully", data: newPackage });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Error creating Package entry", error: error.message });
    }
});
const getAllPackage = asyncHandler(async (req, res) => {
    try {
        let query = {};
        if (req.query.type) {
            query.type = req.query.type;
        }
        const policies = await Package.find(query).sort({ price: 1 });
        if (policies.length > 0) {
            return res.status(200).json({ status: 200, message: "About Us retrieved successfully", data: policies });
        } else {
            return res.status(404).json({ status: 404, message: "About Us retrieved successfully", data: {} });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Error fetching About Us entries", error: error.message });
    }
});
const updatePackage = asyncHandler(async (req, res) => {
    try {
        const { name, price, nameDescription, isFree, description,duration } = req.body;
        const policies = await Package.findById(req.params.id);
        if (!policies) {
            return res.status(404).json({ status: 404, message: "Package entry not found" });
        }
        let name1;
        if (name) {
            name1 = name;
        } else {
            name1 = policies.name;
        }
        let duration1;
        if (duration) {
            duration1 = duration;
        } else {
            duration1 = policies.duration;
        }
        const policies1 = await Package.findOne({ _id: { $ne: policies._id }, name: name1, duration: duration1 });
        if (policies1) {
            return res.status(409).json({ status: 409, message: "Package already exists", data: policies });
        }
        policies.name = name1;
        policies.duration = duration1;
        policies.price = price ?? policies.price;
        policies.nameDescription = nameDescription ?? policies.nameDescription;
        policies.description = description ?? policies.description;
        policies.isFree = isFree ?? policies.isFree;
        let updatedSubscription = await policies.save();
        if (updatedSubscription) {
            return res.status(200).send({ status: 200, message: "Subscription updated successfully.", data: updatedSubscription });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Error creating Package entry", error: error.message });
    }
});
const getPackageById = asyncHandler(async (req, res) => {
    try {
        const packageEntry = await Package.findById(req.params.id);
        if (!packageEntry) {
            return res.status(404).json({ status: 404, message: "Package entry not found" });
        }
        return res.status(200).json({ status: 200, message: "Package entry retrieved successfully", data: packageEntry });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Error fetching Package entry", error: error.message });
    }
});
const deletePackage = asyncHandler(async (req, res) => {
    try {
        const packageEntry = await Package.findById(req.params.id);
        if (!packageEntry) {
            return res.status(404).json({ status: 404, message: "Package entry not found" });
        }
        await Package.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({ status: 200, message: "Package entry deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Error deleting Package entry", error: error.message });
    }
});
module.exports = {
    createPackage,
    getAllPackage,
    getPackageById,
    updatePackage,
    deletePackage
};
