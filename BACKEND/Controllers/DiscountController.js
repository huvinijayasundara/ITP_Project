const Discount = require("../models/discount");

// Get all discounts
const getAllDiscount = async (req, res, next) => {
    try {
        console.log("📋 GET /api/discounts - Fetching all discounts");
        
        const discounts = await Discount.find().sort({ createdAt: -1 });
        
        console.log(`✅ Retrieved ${discounts.length} discounts`);
        
        if (discounts.length > 0) {
            console.log("Sample discount:", {
                code: discounts[0].discountCode,
                status: discounts[0].status,
                validFrom: discounts[0].validFrom,
                validTo: discounts[0].validTo
            });
        }
        
        return res.status(200).json({ 
            success: true,
            count: discounts.length,
            discounts: discounts
        });
    } catch (err) {
        console.error("❌ Error getting discounts:", err);
        return res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

// Add new discount
const addDiscount = async (req, res, next) => {
    try {
        console.log("➕ POST /api/discounts - Add new discount");
        console.log("Request body:", req.body);
        
        const { 
            discountCode, title, description, discountValue, discountType,
            validFrom, validTo, status, usageLimit, minimumOrderAmount,
            applicableCategories, excludedCategories
        } = req.body;
        
        if (!discountCode || !title || !discountValue || !validFrom || !validTo) {
            console.log("❌ Missing required fields");
            return res.status(400).json({ 
                success: false,
                message: "Missing required fields",
                required: ["discountCode", "title", "discountValue", "validFrom", "validTo"]
            });
        }

        const startDate = new Date(validFrom);
        const endDate = new Date(validTo);
        
        if (startDate >= endDate) {
            console.log("❌ Invalid date range");
            return res.status(400).json({ 
                success: false,
                message: "Valid to date must be after valid from date" 
            });
        }

        const codeUpper = discountCode.trim().toUpperCase();
        const existingDiscount = await Discount.findOne({ 
            discountCode: { $regex: new RegExp(`^${codeUpper}$`, 'i') }
        });
        
        if (existingDiscount) {
            console.log("❌ Discount code already exists:", codeUpper);
            return res.status(400).json({ 
                success: false,
                message: `Discount code "${codeUpper}" already exists` 
            });
        }

        const newDiscount = new Discount({ 
            discountCode: codeUpper,
            title: title.trim(), 
            description: description ? description.trim() : '', 
            discountValue: parseFloat(discountValue),
            discountType: discountType || "percentage",
            validFrom: startDate, 
            validTo: endDate, 
            status: status || "active",
            usageLimit: usageLimit ? parseInt(usageLimit) : null,
            usedCount: 0,
            minimumOrderAmount: minimumOrderAmount ? parseFloat(minimumOrderAmount) : 0,
            applicableCategories: applicableCategories || [],
            excludedCategories: excludedCategories || [],
            isActive: true
        });
        
        const savedDiscount = await newDiscount.save();
        
        console.log("✅ Created new discount:", savedDiscount.discountCode);
        
        return res.status(201).json({ 
            success: true,
            message: "Discount created successfully",
            discount: savedDiscount 
        });
    } catch (err) {
        console.error("❌ Error adding discount:", err);
        return res.status(500).json({ 
            success: false,
            message: "Failed to add discount", 
            error: err.message 
        });
    }
};

// Get discount by ID
const getById = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("🔍 GET /api/discounts/:id - Getting discount:", id);
        
        const discount = await Discount.findById(id);

        if (!discount) {
            console.log("❌ Discount not found:", id);
            return res.status(404).json({ 
                success: false,
                message: "Discount not found" 
            });
        }

        console.log("✅ Found discount:", discount.discountCode);
        
        return res.status(200).json({ 
            success: true,
            discount 
        });
    } catch (err) {
        console.error("❌ Error getting discount by ID:", err);
        return res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

// Update discount
const updateDiscount = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("✏️ PUT /api/discounts/:id - Updating discount:", id);
        console.log("Update data:", req.body);
        
        const { 
            discountCode, title, description, discountValue, discountType,
            validFrom, validTo, status, usageLimit, minimumOrderAmount,
            applicableCategories, excludedCategories
        } = req.body;

        const existingDiscount = await Discount.findById(id);
        if (!existingDiscount) {
            console.log("❌ Discount not found:", id);
            return res.status(404).json({ 
                success: false,
                message: "Discount not found" 
            });
        }

        console.log("Found discount to update:", existingDiscount.discountCode);

        if (validFrom && validTo) {
            const startDate = new Date(validFrom);
            const endDate = new Date(validTo);
            
            if (startDate >= endDate) {
                console.log("❌ Invalid date range");
                return res.status(400).json({ 
                    success: false,
                    message: "Valid to date must be after valid from date" 
                });
            }
        }

        const updateData = {
            title: title ? title.trim() : existingDiscount.title,
            description: description !== undefined ? description.trim() : existingDiscount.description,
            discountValue: discountValue ? parseFloat(discountValue) : existingDiscount.discountValue,
            discountType: discountType || existingDiscount.discountType,
            validFrom: validFrom ? new Date(validFrom) : existingDiscount.validFrom,
            validTo: validTo ? new Date(validTo) : existingDiscount.validTo,
            status: status || existingDiscount.status,
            usageLimit: usageLimit !== undefined ? (usageLimit ? parseInt(usageLimit) : null) : existingDiscount.usageLimit,
            minimumOrderAmount: minimumOrderAmount !== undefined ? parseFloat(minimumOrderAmount) : existingDiscount.minimumOrderAmount,
            applicableCategories: applicableCategories !== undefined ? applicableCategories : existingDiscount.applicableCategories,
            excludedCategories: excludedCategories !== undefined ? excludedCategories : existingDiscount.excludedCategories
        };

        if (discountCode && discountCode.trim().toUpperCase() !== existingDiscount.discountCode) {
            const codeUpper = discountCode.trim().toUpperCase();
            const codeExists = await Discount.findOne({ 
                discountCode: { $regex: new RegExp(`^${codeUpper}$`, 'i') },
                _id: { $ne: id }
            });
            
            if (codeExists) {
                console.log("❌ Discount code already exists:", codeUpper);
                return res.status(400).json({ 
                    success: false,
                    message: `Discount code "${codeUpper}" already exists` 
                });
            }
            
            updateData.discountCode = codeUpper;
        }

        console.log("Applying updates:", updateData);

        const updatedDiscount = await Discount.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedDiscount) {
            console.log("❌ Failed to update discount");
            return res.status(404).json({ 
                success: false,
                message: "Failed to update discount" 
            });
        }

        console.log("✅ Successfully updated discount:", updatedDiscount.discountCode);

        return res.status(200).json({ 
            success: true,
            message: "Discount updated successfully",
            discount: updatedDiscount 
        });
    } catch (err) {
        console.error("❌ Error updating discount:", err);
        console.error("Error stack:", err.stack);
        return res.status(500).json({ 
            success: false,
            message: "Failed to update discount", 
            error: err.message 
        });
    }
};

// Delete discount
const deleteDiscount = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("🗑️ DELETE /api/discounts/:id - Deleting discount:", id);
        
        const deletedDiscount = await Discount.findByIdAndDelete(id);

        if (!deletedDiscount) {
            console.log("❌ Discount not found:", id);
            return res.status(404).json({ 
                success: false,
                message: "Discount not found" 
            });
        }

        console.log("✅ Deleted discount:", deletedDiscount.discountCode);

        return res.status(200).json({ 
            success: true,
            message: "Discount deleted successfully",
            discount: deletedDiscount 
        });
    } catch (err) {
        console.error("❌ Error deleting discount:", err);
        return res.status(500).json({ 
            success: false,
            message: "Failed to delete discount", 
            error: err.message 
        });
    }
};

// ✅ VALIDATE PROMO CODE - Checks BOTH discounts AND promotions
const validateDiscountCode = async (req, res, next) => {
    try {
        const { code, cartTotal, categories } = req.body;
        
        console.log("\n🎫 === VALIDATING PROMO CODE ===");
        console.log("Code:", code);
        console.log("Cart total:", cartTotal);
        
        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Promo code is required"
            });
        }

        const codeUpper = code.trim().toUpperCase();
        
        // STEP 1: Check DISCOUNTS
        console.log("🔍 Checking discounts...");
        const discount = await Discount.findOne({ 
            discountCode: { $regex: new RegExp(`^${codeUpper}$`, 'i') }
        });

        if (discount) {
            console.log("✅ Found discount:", discount.discountCode);

            if (discount.status !== 'active' || !discount.isActive) {
                return res.status(400).json({
                    success: false,
                    message: "This discount code is not active"
                });
            }

            const now = new Date();
            if (now < new Date(discount.validFrom)) {
                return res.status(400).json({
                    success: false,
                    message: "This discount code is not yet valid"
                });
            }

            if (now > new Date(discount.validTo)) {
                return res.status(400).json({
                    success: false,
                    message: "This discount code has expired"
                });
            }

            if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
                return res.status(400).json({
                    success: false,
                    message: "This discount code has reached its usage limit"
                });
            }

            if (discount.minimumOrderAmount && cartTotal < discount.minimumOrderAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum order amount of Rs. ${discount.minimumOrderAmount} required`
                });
            }

            console.log("✅ Discount validated!\n");
            return res.status(200).json({
                success: true,
                message: "Discount code is valid",
                discount: {
                    _id: discount._id,
                    discountCode: discount.discountCode,
                    title: discount.title,
                    description: discount.description,
                    discountValue: discount.discountValue,
                    discountType: discount.discountType,
                    validFrom: discount.validFrom,
                    validTo: discount.validTo
                }
            });
        }

        // STEP 2: Check PROMOTIONS
        console.log("🔍 Checking promotions...");
        const Promotion = require("../models/Promotion");
        const promotion = await Promotion.findOne({ 
            promotionCode: { $regex: new RegExp(`^${codeUpper}$`, 'i') }
        });

        if (promotion) {
            console.log("✅ Found promotion:", promotion.promotionCode);

            if (promotion.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: "This promotion code is not active"
                });
            }

            const now = new Date();
            if (now < new Date(promotion.startDate)) {
                return res.status(400).json({
                    success: false,
                    message: `This promotion will start on ${new Date(promotion.startDate).toLocaleDateString()}`
                });
            }

            if (now > new Date(promotion.endDate)) {
                return res.status(400).json({
                    success: false,
                    message: "This promotion has expired"
                });
            }

            console.log("✅ Promotion validated!\n");
            return res.status(200).json({
                success: true,
                message: "Promotion code is valid",
                discount: {
                    _id: promotion._id,
                    discountCode: promotion.promotionCode,
                    title: promotion.title,
                    description: promotion.description,
                    discountValue: promotion.discountValue,
                    discountType: promotion.discountType,
                    validFrom: promotion.startDate,
                    validTo: promotion.endDate
                }
            });
        }

        // NOT FOUND
        console.log("❌ Code not found\n");
        return res.status(404).json({
            success: false,
            message: "Invalid promo code"
        });

    } catch (err) {
        console.error("❌ Error:", err);
        return res.status(500).json({
            success: false,
            message: "Error validating promo code",
            error: err.message
        });
    }
};

module.exports = {
    getAllDiscount,
    addDiscount,
    getById,
    updateDiscount,
    deleteDiscount,
    validateDiscountCode
};