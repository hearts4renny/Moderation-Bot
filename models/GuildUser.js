/**
 * @file GuildUser.js
 * @description Armazenamento de dados do bot utilizando MongoDB
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },

    // Histórico de moderação e advertências
    warnings: [{
        moderatorId: String,
        reason: String,
        date: { type: Date, default: Date.now }
    }],

    // ID do canal se o membro tiver um ticket aberto.
    activeTickets: { type: String, default: null },

    isBlacklisted: { type: Boolean, default: false }
});

// Garantir que a busca por membro em um servidor seja instantâneo. (Se o bot estiver em multiplos servidores)
UserSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('GuildUser', UserSchema);