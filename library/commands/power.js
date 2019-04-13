const db = require('../db');
const config = require('../config.json');

module.exports = {
	name: 'power',
  description: 'See the current power top 10, or set your own power score.',
  aliases: ['p'],
  args: false,
  usage: '<number>',
	cooldown: 30,
	execute(message, args) {
    var score = [];
    db.scores.findByNameAndGuild(message.author.id, message.guild.id)
      .then (score => {
        if (score == null) {
          score = {
            uid: message.author.id,
            guild: message.guild.id,
            power_destroyed: 0,
            resources_raided: 0,
            totalpower: 0
          }
          logger.info(`Created score: ${score}`);
        }
        switch (args.length) {
          case 2:
            if(args.length > 1) {
              let member = message.mentions.members.first();
              if(member && !isNaN(args[1])) {
                // We have a !pd @name number
                // Admin only command
                let allowedRole = message.guild.roles.find("name", "Admin");
                if (message.member.roles.has(allowedRole.id)) {
                  // allowed access to command
                  db.scores.findByNameAndGuild(member.id, message.guild.id)
                    .then (score => {
                      if (score == null) {
                        score = {
                          uid: member.id,
                          guild: message.guild.id,
                          power_destroyed: 0,
                          resources_raided: 0,
                          totalpower: 0
                        }
                        logger.info(`Created score: ${score}`);
                      }
                      score.totalpower = args[1];
                      if(score.id == null) {
                        db.scores.add(score)
                          .then(function(result) {
                            // notify the user it was successful
                            message.channel.send({embed: {
                              color: config.powerColor,
                              description: `Thank you, ${sender}, ${member.displayName} total power is set to ${library.Format.numberWithCommas(score.totalpower)}`
                          }});
                        })
                      } else {
                        db.scores.update(score)
                          .then(function(result) {
                            // notify the user it was successful
                            message.channel.send({embed: {
                              color: config.powerColor,
                              description: `Thank you, ${sender}, ${member.displayName} total power is set to ${library.Format.numberWithCommas(score.totalpower)}`
                            }});
                        })
                      }
                  });
                }
              }
            }
          break;

          case 1:
            logger.info(`Args detected`);
            if(!isNaN(args[0])) {
              // Second argument is a number, update the score to this value
              score.totalpower = args[0];
              if(score.id == null) {
                db.scores.add(score)
                  .then(function(result) {
                    // notify the user it was successful
                    message.channel.send({embed: {
                      color: config.powerColor,
                      description: `Thank you, ${sender}, your total power is set to ${library.Format.numberWithCommas(score.totalpower)}`
                    }});
                  })
                } else {
                  db.scores.update(score)
                    .then(function(result) {
                      // notify the user it was successful
                      message.channel.send({embed: {
                        color: config.powerColor,
                        description: `Thank you, ${sender}, your total power is set to ${library.Format.numberWithCommas(score.totalpower)}`
                      }});
                  })
                }
            } else {
              let member = message.mentions.members.first();
              if(member) {
                db.scores.findByNameAndGuild(member.id, message.guild.id)
                  .then (score => {
                    let desc = `Unable to find ${member.displayName} in my database.  They need to log their scores for you to view them!`;
                    if(score!=null) {
                      desc = `${member.displayName} power is ${library.Format.numberWithCommas(score.totalpower)}`
                    }
                    message.channel.send({embed: {
                      color:config.powerColor,
                      description: `${desc}`
                    }
                  });
                })
              } else {
                message.channel.send({embed: {
                  color: config.powerColor,
                  description: `${sender}, please use \`!pd abc\`, where abc is a number or an actual person!}`
                }});
              }
            }
          break;

        case 0:
          db.manyOrNone("SELECT * FROM scores WHERE guild = $1 ORDER BY totalpower DESC LIMIT 10;", message.guild.id)
            .then(top10 => {
              const embed = new Discord.RichEmbed()
                .setTitle("Power Leaderboard")
                .setAuthor(bot.user.username, bot.user.avatarURL)
                .setDescription("Our top 10 power leaders!")
                .setColor(config.powerColor);
              var c = 1;
              for(const data of top10) {
                embed.addField(`${c}. ${bot.guilds.get(guildID).members.get(data.uid).displayName}`, `${library.Format.numberWithCommas(data.totalpower)}`);
                c++;
              }
              embed.addField(`${config.password} Your personal total power is`, `${library.Format.numberWithCommas(score.totalpower)}`)
              return message.channel.send({embed});
            });
        }
      });
	},
};