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

        // Verificação de se o canal é um ticket
        const userData = await GuildUser.findOne({ guildId: guildId, activeTicket: channel.id });

        if (!userData) {
            return interaction.reply({ 
                content: 'Esse canal não é um ticket registrado no sistema.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        // Verificação de permissões (Se a pessoa pode fechar o ticket)
        const isOwner = userData.userId === interaction.user.id;
        const isMod = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);

        if (!isOwner && !isMod) {
            return interaction.reply({ 
                content: 'Você não tem permissão para fechar esse ticket.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        try {
            // activeTicket = null (Permitir a abertura de um novo ticket)
            await GuildUser.findOneAndUpdate(
                { guildId: guildId, userId: userData.userId },
                { activeTicket: null }
            );

            await interaction.reply('Apagando o ticket em 5 segundos...');

            // Pequeno atraso para o usuário ler as ultimas mensagens do ticket
            setTimeout(async () => {
                await channel.delete().catch(() => null);
            }, 5000);

        } catch (error) {
            console.error('Erro ao fechar ticket:', error);
            await interaction.reply({ content: 'Erro ao tentar fechar o ticket.', flags: MessageFlags.Ephemeral });
        }
    }
};