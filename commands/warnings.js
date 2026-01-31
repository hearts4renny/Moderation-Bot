/**
 * @file warnings.js
 * @description Sistema de advertências.
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildUser = require('../models/GuildUser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Advertências do servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Adiciona uma advertência a um membro.')
                .addUserOption(opt => opt.setName('alvo').setDescription('Membro que receberá a advertência.').setRequired(true))
                .addStringOption(opt => opt.setName('motivo').setDescription('Razão da advertência.').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('Histórico de advertências de um membro.')
                .addUserOption(opt => opt.setName('alvo').setDescription('Membro que será listado.').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('alvo');
        const guildId = interaction.guild.id;

        if (sub === 'add') {
            const reason = interaction.options.getString('motivo');

            const userData = await GuildUser.findOneAndUpdate(
                { guildId: guildId, userId: target.id },
                { 
                    $push: { 
                        warnings: { 
                            moderatorId: interaction.user.id, 
                            reason: reason,
                            date: new Date() 
                        } 
                    } 
                },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setTitle('⚠️ Advertência Aplicada')
                .setDescription(`${target} recebeu uma advertência.`)
                .addFields(
                    { name: 'Motivo', value: reason },
                    { name: 'Total de Advertências', value: `${userData.warnings.length}`, inline: true }
                )
                .setColor('Yellow')
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'list') {
            const userData = await GuildUser.findOne({ guildId: guildId, userId: target.id });

            if (!userData || userData.warnings.length === 0) {
                return interaction.reply({ 
                    content: `O Membro ${target.tag} não possui advertências.`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            // Mapear as advertências para uma string legível
            const history = userData.warnings
                .map((w, i) => `**${i + 1}.** Por: <@${w.moderatorId}> | Motivo: *${w.reason}*`)
                .join('\n');

            const listEmbed = new EmbedBuilder()
                .setTitle(`Histórico de: ${target.username}`)
                .setDescription(history)
                .setColor('Blue')
                .setFooter({ text: `ID do Membro: ${target.id}` });

            return interaction.reply({ embeds: [listEmbed] });
        }
    }
};