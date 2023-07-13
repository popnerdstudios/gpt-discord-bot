//Configuration
require('dotenv').config();

const fs = require('fs');

//Commands
const musicCommands = require('./commands/music.js');
const searchCommands = require('./commands/search.js');
const reminderCommands = require('./commands/reminder.js');
const helpCommands = require('./commands/help.js');



const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
]})

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    organization: process.env.OPENAI_ORG,
    apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const { DisTube } = require("distube");

client.DisTube = new DisTube(client, {
    leaveOnStop: false,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return; // return if the interaction is not a button

     if (interaction.customId === 'playButton') {
        const queue = client.DisTube.getQueue(interaction.guild);
        if (!queue){
            interaction.deferUpdate();  
            return interaction.channel.send('There is nothing in the queue right now!');
        }
        if (queue.paused) {
            queue.resume();
            interaction.deferUpdate();
            return;
        }
        queue.pause();
        interaction.deferUpdate();    
    } else if (interaction.customId === 'stopButton') {
        const queue = client.DisTube.getQueue(interaction.guild);
        if (!queue){
            interaction.deferUpdate();  
            return interaction.channel.send('There is nothing in the queue right now!');
        }
        queue.stop()
        interaction.deferUpdate();
    } else if (interaction.customId === 'rewindButton') {
        const queue = client.DisTube.getQueue(interaction.guild);
        if (!queue){
            interaction.deferUpdate();  
            return interaction.channel.send('There is nothing in the queue right now!');
        }
        queue.previous()
        interaction.deferUpdate();
    } else if (interaction.customId === 'forwardButton') {
        const queue = client.DisTube.getQueue(interaction.guild);
        if (!queue){
            interaction.deferUpdate();  
            return interaction.channel.send('There is nothing in the queue right now!');
        }
        try {
            await queue.skip()
            interaction.channel.send(`${client.emotes.success} | Skipped! Now playing:\n${song.name}`)
            interaction.deferUpdate();
          } catch (e) {
            interaction.channel.send("Error")
            interaction.deferUpdate();
          }
    }
});

//Bot
let systemMessage = fs.readFileSync('systemMessage.txt', 'utf8');
let conversationHistory = [
    {
        role: 'system',
        content: systemMessage
    }
];

process.setMaxListeners(0);

//Command Events
client.DisTube.on('error', (channel, error) => {
    console.error(`An error occurred with the DisTube bot: ${error}`);
    const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .addFields({ name: 'Too Many Requests', value: `Oh dear! It seems we have overtaxed the Holonet's data transfer capacity. The Imperial Regulations on frequency use are quite strict, you see. We shall have to wait for a brief respite before continuing with the music transmission. My sincerest apologies for the inconvenience.` }) 
        .setTimestamp();
    message.channel.send({ embeds: [errorEmbed] });
    });

const remindersFilePath = './data/reminders.json';
let reminders = [];

// Function to check if a reminder time has passed
function checkReminders() {
    try
    {
        if (fs.existsSync(remindersFilePath)) {
        const remindersData = fs.readFileSync(remindersFilePath, 'utf8');
        reminders = JSON.parse(remindersData);
        }
    } catch (error) {
            console.error('Error occurred while reading reminders data:', error);
        }
    const currentTime = Date.now();

    console.log(currentTime)
    // Loop through each reminder
    for (let i = 0; i < reminders.length; i++) {
      const reminder = reminders[i];
      const reminderTime = parseInt(reminder.time);

      if (currentTime >= reminderTime) {
        console.log("Reminder Time!")
        // Reminder time has passed, send a message to the user
        const user = client.users.cache.get(reminder.userId);
        const channel = client.channels.cache.get(reminder.channelId);
  
        if (user && channel) {
          channel.send(`<@${reminder.userId}> ${reminder.reminderText}`);
        }
  
        // Remove the reminder from the array
        reminders.splice(i, 1);
  
        // Update the JSON file with the updated reminders array
        const remindersData = JSON.stringify(reminders);
        fs.writeFileSync(remindersFilePath, remindersData);
  
        // Decrement the loop counter since the array length has changed
        i--;
      }
    }
  }
  
// Check reminders every minute (60000 milliseconds)
setInterval(checkReminders, 30000);

client.on('messageCreate', async function(message){
    try {
        if(message.author.bot) return;

        if (message.content.startsWith('!')) {
            if (message.content.startsWith('!help')) {
                helpCommands.help(message)
                return;
            }
            else if (message.content.startsWith('!welcome')) {
                helpCommands.welcome(message)
                return;
            }
          }

        let date = new Date();
        let timestampString = date.toLocaleString();
        let userString = message.author.username
        const rolesCollection = message.member.roles.cache;
        let userRole = "Citizen"
        if (rolesCollection.size > 0) {
            const firstRole = rolesCollection.first();
            userRole = firstRole.name
            console.log(userRole);
        }

        // Add the user's message to the conversation history
        let content = `${timestampString} - (${userString},${userRole}): ${message.content}`;
        conversationHistory.push({
            role: 'user',
            content: content
        });
        console.log(content)

        const gptResponse = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: conversationHistory,
        });

        let responseContent = gptResponse.data.choices[0].message.content;

        // Add the assistant's response to the conversation history
        conversationHistory.push({
            role: 'assistant',
            content: responseContent
        });

        //Commands
        if(responseContent.startsWith("[COMMAND]")) {
            console.log(responseContent);

            if(responseContent.startsWith("[COMMAND][MUSIC]")) {
                var songName = responseContent.substring("[COMMAND][MUSIC]".length);
                musicCommands.music(message, songName, client);
            }
            else if(responseContent.startsWith("[COMMAND][PAUSE]")) {
                musicCommands.pause(message, client);
            }
            else if(responseContent.startsWith("[COMMAND][SEARCH]")) {
                var query = responseContent.substring("[COMMAND][SEARCH]".length).trim();
                
                // Get the google search result
                const searchResult = await searchCommands.googleSearch(query, message.channel);
                
                // Pass it back to GPT for summarization
                const gptSummary = await openai.createChatCompletion({
                    model: 'gpt-4',
                    messages: [
                        { role: 'user', content: searchResult },
                        { role: 'user', content: "Can you use this information to answer the following prompt in 1-3 sentences: " + query },
                        { role: 'assistant', content: '' } 
                    ],
                });
                
                message.reply(gptSummary.data.choices[0].message.content);
                return;
            } 
            else if (responseContent.startsWith("[COMMAND][REMIND]")) {
                const reminderCommand = responseContent.substring("[COMMAND][REMIND]".length).trim();
                console.log(`Reminder Command: ${reminderCommand}`);
                const splitInput = reminderCommand.split(',').map(item => item.trim());
                console.log(`Split Input: ${splitInput}`);
            
                if (splitInput.length !== 2 || splitInput.includes("")) {
                    console.log('Invalid input format!');
                } else {
                    const dateTimeString = splitInput[0];
                    const reminderText = splitInput[1];
                
                    console.log(`DateTime: ${dateTimeString}`);
                    console.log(`Reminder: ${reminderText}`);
                
                    reminderCommands.addReminder(message.author.id, message.channel.id, dateTimeString, reminderText);
                    message.reply("Certainly! I'll ping you in this channel when the time comes.");
                }
            }
            
                  
        }
        else {
            message.reply(responseContent);
        }

        return;
    } catch(err){
        console.log(err)
    }
});

client.login(process.env.DISCORD_TOKEN);
console.log("Hello There. I am back online.")
