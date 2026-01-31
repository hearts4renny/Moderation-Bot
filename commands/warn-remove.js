const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildUser = require('../models/GuildUser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn-remove')
        .setDescription('Remove uma advertência específica de um membro.')
        .addUserOption(opt => opt.setName('alvo').setDescription('Membro que terá o aviso removido.').setRequired(true))
        .addIntegerOption(opt => opt.setName('id').setDescription('O ID do aviso (vê no /warn list).').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('alvo');
        const warnId = interaction.options.getInteger('id') - 1;
        const guildId = interaction.guild.id;

        // Procurar os dados do usuário
        const userData = await GuildUser.findOne({ guildId: guildId, userId: target.id });

        // Verificações de segurança
        if (!userData || !userData.warnings || userData.warnings.length === 0) {
            return interaction.reply({ 
                content: `O membro ${target.tag} não possui advertências no sistema.`, 
                flags: MessageFlags.Ephemeral 
            });
        }

        if (warnId < 0 || warnId >= userData.warnings.length) {
            return interaction.reply({ 
                content: `ID inválido! Esse membro só tem ${userData.warnings.length} aviso(s).`, 
                flags: MessageFlags.Ephemeral 
            });
        }

        // Remover o aviso do Array
        const removedWarn = userData.warnings.splice(warnId, 1);
        
        // Salvar na Database
        await userData.save();

        return interaction.reply({ 
            content: `✅ A advertência **#${warnId + 1}** (${removedWarn[0].reason}) foi removida de **${target.tag}**.` 
        });
    }
};