/**
 * @file close.js
 * @description Excluir o canal de ticket.
 */

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildUser = require('../models/GuildUser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Fecha o ticket atual e remove-o do banco de dados'),

    async execute(interaction) {
        const channel = interaction.channel;
        const guildId = interaction.guild.id;

        const userData = await GuildUser.findOne({ guildId: guildId, activateTicket: channel.id });

        if (!userData) {
            if (!channel.name.startsWith('ticket-')) {
                return interaction.reply({ 
                    content: 'Esse canal não é um ticket registrado no sistema.', 
                    flags: MessageFlags.Ephemeral 
                });
            }
            // Se o canal não estiver na Database o moderador poderá deletar
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return interaction.reply({ content: 'Apenas moderadores podem fechar tickets não registrados.', flags: MessageFlags.Ephemeral });
            }
        }

        // Verificação de permissões
        const isOwner = userData?.userId === interaction.user.id;
        const isMod = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);

        if (!isOwner && !isMod) {
            return interaction.reply({ 
                content: 'Você não tem permissão para fechar esse ticket.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        try {
            if (userData) {
                await GuildUser.findOneAndUpdate(
                    { guildId: guildId, userId: userData.userId },
                    { $unset: { activateTicket: "" } }
                );
            }

            await interaction.reply('🔒 O ticket será fechado e deletado em 5 segundos...');

            setTimeout(async () => {
                await channel.delete().catch(err => console.error("Erro ao apagar canal:", err));
            }, 5000);

        } catch (error) {
            console.error('Erro ao fechar ticket:', error);
            await interaction.reply({ content: 'Erro ao tentar fechar o ticket.', flags: MessageFlags.Ephemeral });
        }
    }
};