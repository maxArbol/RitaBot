// -----------------
// Global variables
// -----------------

// codebeat:disable[LOC,ABC,BLOCK_NESTING,ARITY]
const db = require("../../core/db");
const logger = require("../../core/logger");
const sendMessage = require("../../core/command.send");

// --------------------------
// Proccess settings params
// --------------------------

module.exports = function(data)
{
   // -------------------------------
   // Command allowed by admins only
   // -------------------------------



   // -----------------------------------
   // Error if settings param is missing
   // -----------------------------------

   if (!data.cmd.params)
   {
      data.color = "error";
      data.text =
         ":warning:  Missing `settings` parameter. Use `" +
         `${data.config.translateCmdShort} help settings\` to learn more.`;

      // -------------
      // Send message
      // -------------

      return sendMessage(data);
   }

   // ----------------
   // Execute setting
   // ----------------

   getSettings(data);
};

// -------------------
// Available Settings
// -------------------

const getSettings = function(data)
{
   // ----------------------------
   // Set default server language
   // ----------------------------

   const setLang = function(data)
   {
      // ---------------------------
      // Error for invalid language
      // ---------------------------

      if (data.cmd.to.valid.length !== 1)
      {
         data.color = "error";
         data.text = ":warning:  Please specify 1 valid language.";

         // -------------
         // Send message
         // -------------

         return sendMessage(data);
      }

      // ------------------------
      // Error for same language
      // ------------------------

      if (data.cmd.server && data.cmd.to.valid[0].iso === data.cmd.server.lang)
      {
         data.color = "info";
         data.text =
            ":information_source:  **`" +
            data.cmd.to.valid[0].name + "`** is the current default " +
            "languange of this server. To change:\n```md\n# Example\n" +
            data.config.translateCmd + " settings setLang to french\n```";

         // -------------
         // Send message
         // -------------

         return sendMessage(data);
      }

      // ----------------
      // Update database
      // ----------------

      return db.updateServerLang(
         data.message.channel.guild.id,
         data.cmd.to.valid[0].iso,
         function(err)
         {
            if (err)
            {
               return logger("error", err);
            }
            data.color = "ok";
            data.text =
               "Default language for server has been changed to **`" +
               data.cmd.to.valid[0].name + "`**.";

            // -------------
            // Send message
            // -------------

            return sendMessage(data);
         }
      );
   };

   // -------------
   // List Servers
   // -------------
   const listServers = function(data)
   {
      data.text = "__**Active Servers**__ - ";

      const activeGuilds = data.client.guilds.array();

      data.text += `${activeGuilds.length}\n\n`;

      activeGuilds.forEach(guild =>
      {
         data.text += "```md\n";
         data.text += `# ${guild.name}\n> ${guild.id}\n> ${guild.memberCount} members\n`;
         if (guild.owner)
         {
            data.text += `@${guild.owner.user.username}#`;
            data.text += guild.owner.user.discriminator + "\n```";
         }
         else
         {
            data.text += "```";
         }
      });

      const splitOpts = {
         maxLength: 2000,
         char: ""
      };

      // -------------
      // Send message
      // -------------

      return data.message.channel.send(data.text, {split: splitOpts});
   };


   // -----------
   // Update bot
   // -----------

   const updateBot = function(data)
   {
      //const activeGuilds = data.client.guilds.array();
      //data.color = "info";
      //data.text = `Updating bot for **${activeGuilds.length}** servers.`;
      //return sendMessage(data);
      //
      //activeGuilds.forEach(guild =>
      //{
      //   guild.owner.send(
      //   "Hello, this bot has been updated to a new version.\n " +
      //   "More info: https://ritabot.gg/whats-new/#new-in-121\n");
      //});
      return data.message.channel.send({embed: {
         color: 13107200,
         author: {
            name: data.client.user.username,
            icon_url: data.client.user.displayAvatarURL
         },
         description: ":no_entry_sign: This command has been disabled"

      }}).then((msg) =>
      {
         msg.delete(10000).catch(err => console.log("UpdateBot Bot Message Deleted Error, settings.js = ", err));
      });
   };


   // -----------------
   // DM server owners
   // -----------------
   /*
   const announcement = async function(data)
   {
      const guildArray = Array.from(bot.client.guilds.values());
      var i;
      for (i = 0; i < guildArray.length; i++)
      {
         console.log("Hello");
         const guild = await guildArray[i];
         var owner = await guild.ownerID;
         // eslint-disable-next-line quotes
         owner = Number(owner)
         // eslint-disable-next-line no-undef
         owner = owner.replace(/([0-9]+)/g, "$1");
         console.log("Done");
         await data.client.users.get(owner).send("Testing").catch((err) =>
         {
            console.log(err);
         });
      }
   };*/

   // Announcements not possible until D.js v12

   // ----------
   // Update db
   // ----------

   function updateDB(data)
   {
      data.color = "info";
      data.text =
         ":white_check_mark: **Database has been updated.**";

      // -------------
      // Send message
      // -------------
      db.updateColumns();

      return sendMessage(data);
   }

   // --------------------------
   // Execute command if exists
   // --------------------------

   const validSettings = {
      "setlang": setLang,
      "listservers": listServers,
      "updatedb": updateDB,
      "updatebot": updateBot
      //"announcement": announcement
   };

   const settingParam = data.cmd.params.split(" ")[0].toLowerCase();
   if (settingParam !== "listservers")
   {
      checkAdmin(data);
   }
   else
   {
      checkDev(data);
   }
   if (Object.prototype.hasOwnProperty.call(validSettings,settingParam))
   {
      return validSettings[settingParam](data);
   }

   // ------------------------
   // Error for invalid param
   // ------------------------

   data.color = "error";
   data.text =
      ":warning:  **`" + data.cmd.params +
      "`** is not a valid settings option.";

   // -------------
   // Send message
   // -------------

   return sendMessage(data);
};
function checkAdmin(data)
{
   if (!data.message.isAdmin)
   {
      data.color = "warn";
      data.text = ":cop:  This command is reserved for server administrators.";

      // -------------
      // Send message
      // -------------

      return sendMessage(data);
   }
}

function checkDev(data)
{
   if (!process.env.DISCORD_BOT_OWNER_ID)
   {
      data.color = "warn";
      data.text = ":warning: Please set `DISCORD_BOT_OWNER_ID` as an array of User IDs allowed to use this command in configuration vars. \n\n **Ex.** ```js\nDISCORD_BOT_OWNER_ID = ['ALLOWED_USER_1_ID', 'ALLOWED_USER_2_ID', 'ALLOWED_USER_3_ID']```\n Place this with ID's in your .env file (local hosting) or environment variables (Heroku).";

      return sendMessage(data);
   }

   if (!process.env.DISCORD_BOT_OWNER_ID.includes(data.message.author.id))
   {
      data.color = "warn";
      data.text = ":warning: This is a developer only command.";
      return sendMessage(data);
   }
}