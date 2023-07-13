const { EmbedBuilder } = require('discord.js');

module.exports = {
    help: function (message) {  
        const helpEmbed = new EmbedBuilder()
        .setTitle("Smuggler's Guide")
            .setColor(0xFFD700)
            .setThumbnail("https://imperialtalker.files.wordpress.com/2020/05/tc-326-1.png")
            .addFields({ name: ' ', value: "Welcome, travelers from across the galaxy! Step into the bustling city where smugglers, bounty hunters, and scoundrels converge." })  
            .addFields({ name: 'Commands', value: " Allow me, C-3DP, your trusted companion, to guide you through this server. I am powered by GPT-4, and can also play music, set reminders, and access the internet so if you need anything, just ask!" })  
            .addFields({ name: 'Roles', value: "Your role will reflect the faction you represent. Depending on the role you select, my responses will be different. You can always change roles but only have one role active at once." })  

        message.channel.send({ embeds: [helpEmbed] });
    },
    welcome: function (message) {  
        const welcomeEmbed = new EmbedBuilder()
        .setTitle("Welcome")
            .setColor(0xFFD700)
            .setThumbnail("https://static.wikia.nocookie.net/swfanon/images/7/70/MosEisleySpaceport.jpg/revision/latest?cb=20120325051014")
            .addFields({ name: ' ', value: "Greetings, weary travelers and shady souls, welcome to the forsaken haven known as the Mos Eisley Spaceport. Amidst the spies and smugglers, we implore you to exercise caution and keep your instincts sharp. Though violence lurks in every shadow, we encourage a semblance of order through the observance of basic rules. Respect your fellow denizens, avoid unnecessary altercations, and let discretion be your guiding star. In this lawless realm, survival hinges on a delicate balance between cunning and restraint." })  
            .addFields({ name: ' ', value: "Feel free to ask me, C-3DP, the local protocol droid, if you have any questions or require further assistance. May the force be with you." })  

        message.channel.send({ embeds: [welcomeEmbed] });
    }
};