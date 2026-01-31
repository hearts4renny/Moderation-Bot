/**
 * @file index.js
 * @project Sistema de Gestão
 * @description Ponto de entrada do bot. Implementa o carregamento dinâmico de módulos e a gestão de eventos de interação.
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Collection, MessageFlags, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const GuildUser = require('./models/GuildUser');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Conexão MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 Conectado ao MongoDB!'))
    .catch(err => console.error('❌ Não foi possivel conectar ao MongoDB:', err));

// Coleção para armazenar comandos
client.commands = new Collection();

// Handler de Slash Commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// Handler de interações
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Erro no comando ${interaction.commandName}:`, error);
            await interaction.reply({ content: 'Ocorreu um erro interno!', flags: MessageFlags.Ephemeral })
        }
    }

    // Botão de abrir ticket
    if (interaction.isButton() && interaction.customId === 'open_ticket') {
        try {
            const userData = await GuildUser.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });

            if (userData?.activateToken) {
                const existingChannel = interaction.guild.channels.cache.get(userData.activateToken);
                if (existingChannel) {
                    return interaction.reply({ content: `Você ja possui um ticket aberto em ${existingChannel}!`, flags: MessageFlags.Ephemeral });
                }
            }

            // Criação do ticket
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels] }
                ]
            });

            // Atualização do banco de dados
            await GuildUser.findOneAndUpdate(
                { guildId: interaction.guild.id, userId: interaction.user.id },
                { activateTicket: channel.id },
                { upsert: true }
            );

            await channel.send(`${interaction.user}, a nossa equipe de suporte irá atendê-lo brevemente!`);
            await interaction.reply({ content: `Ticket criado: ${channel}`, flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error("Erro ao abrir ticket", error);
            await interaction.reply({ content: "Não foi possivel crair o canal de ticket", flags: MessageFlags.Ephemeral });
        }
    }
});

client.once('clientReady', () => console.log(`${client.user.tag} está online!`));

client.login(process.env.DISCORD_TOKEN);