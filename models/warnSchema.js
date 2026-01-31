const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
    GuildID: { type: String, required: true },
    UserID: { type: String, required: true },
    Content: { type: Array, required: true },
});

module.exports = mongoose.model('warnSchema', warnSchema);