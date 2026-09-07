const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        mobile: {
            type: String,
            required: [true, "Mobile number is required"],
            unique: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },

        role: {
            type: String,
            enum: ["farmer", "trader", "retailer", "admin"],
            default: "farmer",
            lowercase: true,
            trim: true,
        },

        village: {
            type: String,
            trim: true,
            default: "",
        },

        district: {
            type: String,
            trim: true,
            default: "",
        },

        state: {
            type: String,
            trim: true,
            default: "",
        },

        language: {
            type: String,
            default: "en",
            trim: true,
        },

        address: {
            type: String,
            trim: true,
            default: "",
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [72.5714, 23.0225], // Default Gujarat coords
            },
            address: {
                type: String,
                default: "",
            },
        },

        profilePhoto: {
            type: String,
            default: "",
        },

        verificationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved",
        },

        accountStatus: {
            type: String,
            enum: ["active", "blocked", "suspended"],
            default: "active",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for mobileNumber compatibility
userSchema.virtual("mobileNumber")
    .get(function () {
        return this.mobile;
    })
    .set(function (val) {
        this.mobile = val;
    });

// Virtual for preferredLanguage compatibility
userSchema.virtual("preferredLanguage")
    .get(function () {
        return this.language;
    })
    .set(function (val) {
        this.language = val;
    });

// 🔐 Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 Compare password during login
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Also support matchPassword alias
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);