const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const DisTubeError = require("distube").DisTubeError;

module.exports = {
    music: function (message, args, client) {
        var songName = args.trim();

        // Play music
        console.log(songName)

        client.DisTube.play(message.member.voice.channel, songName, {
            member: message.member,
            textChannel: message.channel,
            message
        }).catch((error) => {
            if (error instanceof DisTubeError && error.code === 'NO_RESULT') {
                const noResultEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .addFields({ name: 'Too Many Requests', value: `Oh dear! It seems we have overtaxed the Holonet's data transfer capacity. The Imperial Regulations on frequency use are quite strict, you see. We shall have to wait for a brief respite before continuing with the music transmission. My sincerest apologies for the inconvenience.` }) 
                    .setTimestamp();
                message.channel.send({ embeds: [noResultEmbed] });
            } else {
                throw error;
            }
        });

        message.channel.send("Cross-referencing your request with my music databanks...")

        const playButton = new ButtonBuilder()
            .setCustomId('playButton')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏯️');
        
        const stopButton = new ButtonBuilder()
            .setCustomId('stopButton')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏹️');

        const rewindButton = new ButtonBuilder()
            .setCustomId('rewindButton')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏪');

        const forwardButton = new ButtonBuilder()
            .setCustomId('forwardButton')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏩');

        // Wait for song to start playing and then fetch the song from the queue\
        const queue = client.DisTube.getQueue(message);
        
        client.DisTube.once("playSong", (queue, song) => {
            const embedButtons = new ActionRowBuilder()
			    .addComponents(rewindButton, playButton, stopButton, forwardButton)
            const musicEmbed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setThumbnail(song.thumbnail)
                .addFields({ name: 'Now Playing', value: song.name })  // Use song.name here
            message.channel.send({ embeds: [musicEmbed], components: [embedButtons] });
        });
        console.log("COMMAND: playSong");
    },
    pause: function (message, client) {
        const queue = client.DisTube.getQueue(message);
        if (!queue) return message.channel.send('There is nothing in the queue right now!');
        if (queue.paused) {
            queue.resume();
            return message.channel.send('Re-establishing Connection.');
        }
        queue.pause();
        message.channel.send('Pausing The Broadcast.');
        console.log("COMMAND: pause");
    }
};
