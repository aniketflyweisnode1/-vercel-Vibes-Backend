const mongoose = require('mongoose');
const Package = require("../models/package");
const User = require("../models/user.model");
const stripe1 = require('stripe')('sk_test_51QkIm6IG3GnT9n5tlvKodmyGrRhlTmre4QtC1QXJxYAVj1hsVPAEwIGyi8nXZ3Fbc2HGyTwhEeJ79cq8mX0SUUaU00lr2JkZbF');
exports.createPackage = async (req, res) => {
    try {
        const {
            name,
            nameDescription,
            price,
            isFree,
            description,
            duration,
            totalEvents,
            totalEmployee
        } = req.body;

        const existing = await Package.findOne({ name, duration });
        if (existing) {
            return res.status(409).json({
                status: 409,
                message: "Package already exists",
                data: existing
            });
        }

        const normalizedDuration = duration === "Annual" ? "Annual" : "Month";

        const newPackage = new Package({
            name,
            price,
            nameDescription,
            totalEvents,
            totalEmployee,
            isFree,
            description,
            duration: normalizedDuration
        });

        await newPackage.save();

        // ✅ If free package → no Stripe
        if (isFree === true) {
            return res.status(200).json({
                status: 200,
                message: "Package entry created successfully",
                data: newPackage
            });
        }

        try {
            // ✅ Stripe interval mapping
            const stripeInterval = duration === "Annual" ? "year" : "month";

            const stripeProduct = await stripe1.products.create({
                name,
                description: description || "No description provided"
            });

            const stripePrice = await stripe1.prices.create({
                unit_amount: Math.round(price * 100), // cents
                currency: "usd",
                recurring: { interval: stripeInterval },
                product: stripeProduct.id
            });

            console.log("Stripe product:", stripeProduct.id);
            console.log("Stripe price:", stripePrice.id);

        } catch (stripeError) {
            console.error("Stripe Error:", stripeError.message);

            // rollback DB
            await Package.findByIdAndDelete(newPackage._id);

            return res.status(500).json({
                status: 500,
                message: "Error creating product on Stripe",
                error: stripeError.message
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Package entry created successfully",
            data: newPackage
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error creating Package entry",
            error: error.message
        });
    }
};
exports.getAllPackage = async (req, res) => {
    try {
        let query = {};
        if (req.query.duration) {
            query.duration = req.query.duration;
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
};
exports.updatePackage = async (req, res) => {
    try {
        const { name, price, nameDescription, isFree, description, totalEvents, totalEmployee, duration } = req.body;
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
        const normalizedDuration = duration1 === "Annual" ? "Annual" : "Month";
        const policies1 = await Package.findOne({ _id: { $ne: policies._id }, name: name1, duration: normalizedDuration });
        if (policies1) {
            return res.status(409).json({ status: 409, message: "Package already exists", data: policies });
        }
        policies.name = name ?? policies.name;
        policies.price = price ?? policies.price;
        policies.nameDescription = nameDescription ?? policies.nameDescription;
        policies.description = description ?? policies.description;
        policies.isFree = isFree ?? policies.isFree;
        policies.totalEmployee = totalEmployee ?? policies.totalEmployee;
        policies.totalEvents = totalEvents ?? policies.totalEvents;
        await policies.save();
        if (policies.price === price) {
            const updatedSubscription = await policies.save();
            if (updatedSubscription) {
                return res.status(200).send({ status: 200, message: "Subscription updated successfully.", data: updatedSubscription });
            }
        } else {
            let newPrice = null;
            const stripeProducts = await stripe1.products.list({});
            for (const product of stripeProducts.data) {
                let name12 = `${name1}`
                if (product.name === name12) {
                    const stripeInterval = duration === "Annual" ? "year" : "month";
                    const productId = product.id;
                    newPrice = await stripe1.prices.create({ unit_amount: price * 100, currency: 'usd', recurring: { interval: stripeInterval }, product: productId });
                    await stripe1.products.update(productId, { default_price: newPrice.id });
                    const stripePrices = await stripe1.prices.list({ product: productId });
                    for (const stripePrice of stripePrices.data) {
                        if (stripePrice.id !== newPrice.id) {
                            await stripe1.prices.update(stripePrice.id, { active: false });
                        }
                    }
                    break;
                }
            }
            if (!newPrice) {
                return res.status(400).send({ status: 400, message: "Stripe product not found or price update failed.", data: {} });
            }
            const updatedSubscription = await policies.save();
            const users = await User.find({ packageId: policies._id });
            for (const user of users) {
                const customers = await stripe1.customers.list({ email: user.email });
                if (customers.data.length > 0) {
                    const stripeCustomerId = customers.data[0].id;
                    const activeSubscriptions = await stripe1.subscriptions.list({ customer: stripeCustomerId });
                    for (const subscription of activeSubscriptions.data) {
                        if (subscription.status === 'trialing' || subscription.status === 'active') {
                            const updatedStripeSubscription = await stripe1.subscriptions.update(subscription.id, { items: [{ id: subscription.items.data[0].id, price: newPrice.id }], proration_behavior: 'none' });
                        }
                    }
                }
            }
            return res.status(200).json({ status: 200, message: "Package created successfully", data: policies });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Error creating Package entry", error: error.message });
    }
};
exports.getPackageById = async (req, res) => {
    try {
        const packageEntry = await Package.findById(req.params.id);
        if (!packageEntry) {
            return res.status(404).json({ status: 404, message: "Package entry not found" });
        }
        return res.status(200).json({ status: 200, message: "Package entry retrieved successfully", data: packageEntry });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Error fetching Package entry", error: error.message });
    }
};
exports.deletePackage = async (req, res) => {
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
};