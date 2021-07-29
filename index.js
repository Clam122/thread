const discord = require("discord.js");
require('dotenv').config();
const intents = new discord.Intents();
intents.add(["GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_BANS", "GUILDS"])
const client = new discord.Client({
  intents: intents
});

client.on("ready", () => {
  console.log("Hi Jamie!")
});

client.on("messageCreate", async (message) => {
  //checks to prevent bot-ception
  if(!message.content.startsWith("$") || message.author.bot) return;
  
  //split args and command and stuff
  const command = message.content.split(" ")[0].slice(1);
  const args = message.content.split(" ");
  args.shift();
  
  switch(command) {
    case "create":
      if (args.join(" ") == "") return message.channel.send("Threads must have a title!");

      if(message.channel.threads.cache.find(x => x.name == args.join(" "))) return message.channel.send("A thread with this title already exists!");

      const thread = await message.channel.threads.create({
        name: args.join(" "),
        autoArchiveDuration: 60, 
        reason: "Created by thread proof of concept"
      });
      
      
      thread.members.add(message.author.id);

      message.channel.send(`Thread **${args.join(" ")}** has been created. To archive use $archive <thread name>. mention another user to add them to a thread!`);
      return;
    case "alterarchive":
      //Find the thread in question
      const threadToArchive = await message.channel.threads.cache.find(x => x.name == args.join(" "));
      if(!threadToArchive) return message.channel.send(`\`${args.join(" ")}\` is not a valid thread name!`);
      if(!message.member.permissions.has("MANAGE_THREADS")) return message.channel.send("You may not archive this thread!");
      if(threadToArchive.archived == false) {
        message.channel.send("Thread is being archived!");
        threadToArchive.setArchived(true);
      } else if (threadToArchive.archived == true) {
        message.channel.send("Thread is being unarchived!");
        threadToArchive.setArchived(false);
      }
      return;
    case "lock": 
      const threadToLock = await message.channel.threads.cache.find(x => x.name == args.join(" "));
      if(!threadToLock) return message.channel.send(`\`${args.join(" ")}\` is not a valid thread name!`);
      if(!message.member.permissions.has("MANAGE_THREADS")) return message.channel.send("You may not archive this thread!");
      if(threadToLock.locked == true) {
        threadToLock.setLocked(false);
        return message.channel.send("Thread is now unlocked!");
      } else if(threadToLock.locked == false) {
        threadToLock.setLocked(true);
        return message.channel.send("Thread is now locked!");
      }
      return;
    case "display":
      let threads = [];
      message.guild.channels.cache.array().forEach((c) => {
        //filter all channels with threads or thread channels themselves;
        if(!c.threads || c.type == "GUILD_PUBLIC_THREAD" || c.type == "GUILD_PRIVATE_THREAD") return;
        let threads = [];
        c.threads.cache.forEach(t => {
          threads.push(`**${t.parent.name}** : *${t.name}*`);
        });
        console.log(threads);
        message.channel.send("**THREADS CURRENTLY ACTIVE**\n" + threads.join("\n"));
      } );
      
      return; 
    default: 
      return message.channel.send(`\`${command}\` is not a valid command!`);
  }
});

client.login(process.env.TOKEN);