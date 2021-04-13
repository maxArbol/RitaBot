// -----------------
// Global variables
// -----------------

// codebeat:disable[LOC,ABC,BLOCK_NESTING,ARITY]
/* eslint-disable no-undef */
const colors = require("../../core/colors");
const db = require("../../core/db");
const sendMessage = require("../../core/command.send");
// -------------
// Command Code
// -------------

module.exports.run = function(data)

{
   // -------------------------------
   // Command allowed by admins only
   // -------------------------------

   if (data.message.isAdmin === false)
   {
      data.color = "warn";
      data.text = ":cop:  This command is reserved for server adminis.";

      // -------------
      // Send message
      // -------------

      return sendMessage(data);
   }

   // --------------------------------
   // Error if embed param is missing
   // --------------------------------

   if (!data.cmd.params)
   {
      data.color = "error";
      data.text =
         ":warning:  Missing `embed` parameter. Use `" +
         `${data.config.translateCmdShort} help embed\` to learn more.`;

      // -------------
      // Send message
      // -------------

      return sendMessage(data);
   }

   // ----------------
   // Execute setting
   // ----------------

   if (data.message.isAdmin)
   {
      embed(data);
   }
};

// -------------------------------
// embed varible command handaler
// -------------------------------

const embed = function(data)
{
   const commandVariable1 = data.cmd.params.split(" ")[0].toLowerCase();

   if (commandVariable1 === "on" || commandVariable1 === "off")
   {
      console.log(commandVariable1);
      return db.updateEmbedVar(
         data.message.channel.guild.id,
         commandVariable1,
         function(err)
         {
            if (err)
            {
               return logger("error", err);
            }
            var output =
            "**```Embedded Translation```**\n" +
            `Embedded Message translation is now turned : ${commandVariable1}\n\n`;
            data.color = "info";
            data.text = output;

            // -------------
            // Send message
            // -------------

            return sendMessage(data);
         }
      );
   }

   data.color = "error";
   data.text =
      ":warning:  **`" + commandVariable1 +
      "`** is not a valid embed option.\n";

   // -------------
   // Send message
   // -------------

   return sendMessage(data);
};