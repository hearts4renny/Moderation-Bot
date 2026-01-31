/**
 * @file ticket.js
 * @description Sistema de tickets para suporte.
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Configurar o painel de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // Embed de tickets
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎫 Sistema de tickets')
            .setDescription('Clique no botão abaixo para criar um ticket.')
            .setColor('#2b2d31')
            .setFooter({ text: 'Sistema de Suporte' });

        // Botão para abrir ticket
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('Abrir ticket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );

        return interaction.reply({ embeds: [embed], components: [row] });
    }
};