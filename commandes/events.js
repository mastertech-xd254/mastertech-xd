const { zokou } = require('../framework/zokou');
const { attribuerUnevaleur } = require('../bdd/welcome');

async function events(nomCom) {
    zokou({
        nomCom: nomCom,
        categorie: 'Group'
    }, async (dest, zk, commandeOptions) => {
        const { ms, arg, repondre, superUser, verifAdmin } = commandeOptions;

        // Check if the user is an admin or super user
        if (verifAdmin || superUser) {
            // If no arguments are provided, display usage instructions
            if (!arg[0] || arg.join(' ') === ' ') {
                repondre(`${nomCom} command: Type 'on' to activate and 'off' to deactivate.`);
            } else {
                // If the argument is 'on' or 'off', toggle the event status
                if (arg[0] === 'on' || arg[0] === 'off') {
                    try {
                        // Update the event setting in the database
                        await attribuerUnevaleur(dest, nomCom, arg[0]);
                        repondre(`${nomCom} is now set to ${arg[0]}`);
                    } catch (error) {
                        // Handle any errors during database update
                        console.error(`Error updating ${nomCom}:`, error);
                        repondre(`Failed to update ${nomCom}. Please try again.`);
                    }
                } else {
                    // If the argument is invalid, provide guidance
                    repondre('Invalid input. Use "on" to activate and "off" to deactivate.');
                }
            }
        } else {
            // Inform the user if they don't have permission to use the command
            repondre('You do not have permission to use this command.');
        }
    });
}

// Initialize the events for 'welcome', 'goodbye', 'antipromote', and 'antidemote'
events('welcome');
events('goodbye');
events('antipromote');
events('antidemote');
