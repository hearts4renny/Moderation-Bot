/**
 * @file mod.js
 * @project Sistema de Moderação
 * @description Apresenta uso de subcomandos, validação de hierarquia de cargos e tratamento de erros de API.
 */

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildUser = require('../models/GuildUser'); // Salvar o histórico

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mod')
        .setDescription('Comandos de moderação.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        // Kick
        .addSubcommand(sub => 
            sub.setName('kick')
                .setDescription('Expulsa um membro do servidor.')
                .addUserOption(opt => opt.setName('alvo').setDescription('Membro a ser expulso').setRequired(true))
                .addStringOption(opt => opt.setName('motivo').setDescription('Motivo da expulsão')))
        // Ban
        .addSubcommand(sub => 
            sub.setName('ban')
                .setDescription('Bane um membro do servidor.')
                .addUserOption(opt => opt.setName('alvo').setDescription('Membro a ser banido').setRequired(true))
                .addStringOption(opt => opt.setName('motivo').setDescription('Motivo do banimento')))
        // Timeout
        .addSubcommand(sub =>
            sub.setName('timeout')
                .setDescription('Silencia um membro temporariamente')
                .addUserOption(opt => opt.setName('alvo').setDescription('Membro a ser silenciado').setRequired(true))
                .addIntegerOption(opt => opt.setName('duracao').setDescription('Tempo em minutos').setRequired(true))
                .addStringOption(opt => opt.setName('motivo').setDescription('Motivo do silenciamento'))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const targetMember = interaction.options.getMember('alvo');
        const targetUser = interaction.options.getUser('alvo');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido.';
        const guildName = interaction.guild.name;

        // Hierarquia do membro
        if (!targetMember) {
            return interaction.reply({ content: "Membro não encontrado.", flags: MessageFlags.Ephemeral });
        }

        if (!targetMember.manageable) {
            return interaction.reply({
                content: `Eu não tenho permissões para punir ${targetUser.tag}.`, 
                flags: MessageFlags.Ephemeral
            });
        }

        // Lógica para timeout
        if (sub === 'timeout') {
            const minutes = interaction.options.getInteger('duracao');
            const durationMs = minutes * 60 * 1000;

            try {
                await targetMember.timeout(durationMs, reason);
                
                // Registar no banco de dados
                await GuildUser.findOneAndUpdate(
                    { guildId: interaction.guild.id, userId: targetUser.id },
                    { $push: { warnings: { moderatorId: interaction.user.id, reason: `[TIMEOUT ${minutes}m] ${reason}` } } },
                    { upsert: true }
                );

                await targetUser.send(`Você foi silenciado em **${guildName}** por ${minutes}m. Motivo: ${reason}`).catch(() => null);

                return interaction.reply({ content: `🔇 ${targetUser} foi silenciado por **${minutes} minutos**.` });
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: "Erro ao usar timeout.", flags: MessageFlags.Ephemeral });
            }
        }

        // Enviar mensagem na DM 
        const dmEmbed = new EmbedBuilder()
            .setTitle(`Punição: ${sub === 'kick' ? 'Expulsão' : 'Banimento'}`)
            .setDescription(`${targetUser}, você recebeu uma punição.`)
            .addFields(
                { name: 'Servidor', value: guildName, inline: true },
                { name: 'Ação', value: sub.toUpperCase(), inline: true },
                { name: 'Motivo', value: reason }
            )
            .setColor(sub === 'kick' ? '#f39c12' : '#e74c3c')
            .setTimestamp();

        // DM Fechada
        try {
            await targetUser.send({ embeds: [dmEmbed] });
        } catch (_e) {
            console.log(`DMs fechadas para ${targetUser.tag}`);
        }

        // Executar o Kick/Ban e registrar no banco de dados
        try {
            if (sub === 'kick') {
                await targetMember.kick(reason);
            } else if (sub === 'ban') {
                await targetMember.ban({ reason });
            }

            await GuildUser.findOneAndUpdate(
                { guildId: interaction.guild.id, userId: targetUser.id },
                { $push: { warnings: { moderatorId: interaction.user.id, reason: `[${sub.toUpperCase()}] ${reason}` } } },
                { upsert: true }
            );

            return interaction.reply({ content: `✅ Ação **${sub}** executada com sucesso em ${targetUser}.` });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Erro ao executar a punição.", flags: MessageFlags.Ephemeral });
        }
    }
};