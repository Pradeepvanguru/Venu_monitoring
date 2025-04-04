const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    team_id: { type: String, required: function () { return this.role === "employee"; } }, 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePhoto: {
        type: String,
        required: true,
        default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
    },
    role: { type: String, enum: ["team-lead", "employee"], required: true }
});

module.exports = mongoose.model("User", userSchema);
