const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        trim: true
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value cannot be negative'],
        validate: {
            validator: function(value) {
                if (this.discountType === 'percentage') {
                    return value <= 100;
                }
                return true;
            },
            message: 'Percentage discount value must not exceed 100'
        }
    },
    discountType: {
        type: String,
        enum: {
            values: ['percentage', 'fixed'],
            message: 'Discount type must be either "percentage" or "fixed"'
        },
        required: [true, 'Discount type is required']
    },
    expirationDate: {
        type: Date,
        required: [true, 'Expiration date is required'],
        validate: {
            validator: function(value) {
                return value > Date.now();
            },
            message: 'Expiration date must be in the future'
        }
    },
    minPurchaseAmount: {
        type: Number,
        min: [0, 'Minimum purchase amount cannot be negative'],
        default: 0 // Ensures it's set to a valid number if not provided
    },
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update `updatedAt` field on every save
couponSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Middleware to automatically update `updatedAt` field on findOneAndUpdate
couponSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

// Index for efficient querying of active and soon-to-expire coupons
couponSchema.index({ expirationDate: 1, isActive: 1 });

// Static method to validate coupon applicability based on category or product
couponSchema.statics.isCouponApplicable = async function(couponId, categoryId, productId) {
    const coupon = await this.findById(couponId);
    if (!coupon) {
        throw new Error('Coupon not found');
    }

    if (coupon.expirationDate <= Date.now() || !coupon.isActive) {
        throw new Error('Coupon is expired or inactive');
    }

    const categoryApplicable = coupon.applicableCategories.length === 0 || coupon.applicableCategories.includes(categoryId);
    const productApplicable = coupon.applicableProducts.length === 0 || coupon.applicableProducts.includes(productId);

    if (!categoryApplicable && !productApplicable) {
        throw new Error('Coupon is not applicable to this category or product');
    }

    return true;
};

module.exports = mongoose.model("Coupon", couponSchema);
