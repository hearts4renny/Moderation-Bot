/**
 * @file index.js
 * @description Ponto de entrada do bot. Implementa o carregamento dinâmico de módulos e a gestão de eventos de interação.
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Collection, MessageFlags, PermissionFlagsBits, REST, Routes, ChannelType } = require('discord.js');
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

client.commands = new Collection();

// Carregamento de comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`Comando ${command.data.name} carregado!`);
    }
}

client.on('interactionCreate', async interaction => {
    
    // Comandos Slash
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Ocorreu um erro ao executar esse comando!',
                flags: MessageFlags.Ephemeral
            });
        }
    }

    // Botão para abrir ticket
    if (interaction.isButton() && interaction.customId === 'open_ticket') {
        try {
            const userData = await GuildUser.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });

            if (userData?.activateTicket) {
                const existingChannel = interaction.guild.channels.cache.get(userData.activateTicket);
                if (existingChannel) {
                    return interaction.reply({ 
                        content: `Você já possui um ticket aberto em ${existingChannel}!`, 
                        flags: MessageFlags.Ephemeral 
                    });
                }
            }

            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels] }
                ]
            });

            await GuildUser.findOneAndUpdate(
                { guildId: interaction.guild.id, userId: interaction.user.id },
                { activateTicket: channel.id },
                { upsert: true }
            );

            await channel.send({ content: `${interaction.user}, a nossa equipe de suporte irá atendê-lo brevemente!` });
            await interaction.reply({ content: `Ticket criado com sucesso: ${channel}`, flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error("Erro ao abrir ticket:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: "Erro ao criar ticket. Verifique minhas permissões!", flags: MessageFlags.Ephemeral });
            }
        }
    }
});

// Sincronização
client.once('clientReady', async () => {
    console.log(`${client.user.tag} está online!`);
    
    const commandsData = client.commands.map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`⌛ Sincronizando ${commandsData.length} comandos...`);
        await rest.put(
            Routes.applicationCommands(client.user.id, '1304927459363393566'),
            { body: commandsData }
        );
        console.log('✅ Comandos sincronizados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao sincronizar:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);