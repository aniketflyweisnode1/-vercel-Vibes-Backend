const ClientReview = require('../models/clientReview');
exports.createClientReview = async (req, res) => {
        try {
                const { userName, title, description, rating, location, image } = req.body;
                const findReview = new ClientReview({ userName, title, description, rating, image, location });
                const savedClientReview = await findReview.save();
                return res.status(201).json({ status: 201, data: savedClientReview });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Failed to create clientReview" });
        }
};
exports.updateClientReview = async (req, res) => {
        const { id } = req.params;
        const category = await ClientReview.findById(id);
        if (!category) {
                return res.status(404).json({ message: "News Not Found", status: 404, data: {} });
        }
        category.image = req.body.image ?? category.image;
        category.userName = req.body.userName ?? category.userName;
        category.location = req.body.location ?? category.location;
        category.title = req.body.title ?? category.title;
        category.isShowOnWebsite = req.body.isShowOnWebsite ?? category.isShowOnWebsite;
        category.description = req.body.description ?? category.description;
        category.rating = req.body.rating ?? category.rating;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.getAllClientReviews = async (req, res) => {
        try {
                const findReview = await ClientReview.find({ rating: { $gt: 4 } });
                if (findReview.length > 0) {
                        return res.status(201).json({ message: "clientReview Found", status: 200, data: findReview, });
                }
                return res.status(201).json({ message: "clientReview not Found", status: 404, data: [], });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Failed to retrieve clientReviews" });
        }
};
exports.getClientReviewById = async (req, res) => {
        try {
                const findReview = await ClientReview.findById(req.params.id);
                if (findReview) {
                        return res.status(201).json({ message: "clientReview Found", status: 200, data: findReview, });
                }
                return res.status(201).json({ message: "clientReview not Found", status: 404, data: {}, });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Failed to retrieve clientReview" });
        }
};
exports.removeClientReview = async (req, res) => {
        const { id } = req.params;
        const findReview = await ClientReview.findById(id);
        if (!findReview) {
                return res.status(404).json({ message: "clientReview Not Found", status: 404, data: {} });
        } else {
                await ClientReview.findByIdAndDelete(findReview._id);
                return res.status(200).json({ message: "clientReview Deleted Successfully !" });
        }
};
exports.createClientReviewByClient = async (req, res) => {
        try {
                const { rating, description } = req.body;
                let isShowOnWebsite;
                if (rating < 5) {
                        isShowOnWebsite = false;
                } else {
                        isShowOnWebsite = true;
                }
                let obj = {
                        user: req.user._id,
                        userName: req.user.firstName + " " + req.user.lastName,
                        title: req.user.firstName + " " + req.user.lastName,
                        description: description,
                        rating: rating,
                        through: "User",
                        isShowOnWebsite: isShowOnWebsite
                }
                const Banner = await ClientReview.create(obj);
                return res.status(200).json({ message: "Review add successfully.", status: 200, data: Banner });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Failed to create Review" });
        }
};
exports.getAllClientReviewsForAdmin = async (req, res) => {
        try {
                const findReview = await ClientReview.find();
                if (findReview.length > 0) {
                        return res.status(201).json({ message: "clientReview Found", status: 200, data: findReview, });
                }
                return res.status(201).json({ message: "clientReview not Found", status: 404, data: [], });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Failed to retrieve clientReviews" });
        }
};