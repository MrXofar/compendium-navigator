//import { registerSettings } from "./settings.js";
// import { Compnav_RegisteredSettings } from "./registered-settings.js";
import { CompendiumNavigator } from '../templates/form-app-script/compendium-navigator.js';

Hooks.once("init", () => {
	//registerSettings();
	Handlebars.registerHelper('checked', function(value, test) {
		if (value == undefined) return '';
		return value==test ? 'checked' : '';
	});
	Handlebars.registerHelper('toJSON', function(obj) {
		return JSON.stringify(obj, null, 3);
	});
	console.log(CompNav.ID + " | Initialized")
});

// Hooks.on("ready", () => {
// 	if (game.user.isGM) { VersionUpdateValidation(); }
// });

Hooks.on('renderCompendiumDirectory', (app, html, data) => {
	if (game.user.isGM) {
		const cbButton = $(`<button class="compendium-browser-btn"><i class="fa fa-dharmachakra"></i> ${game.i18n.localize("CompNav.dialog.compnav-button")}</button>`);
		//html.find(".header-search ").remove();
		html.find('.directory-header').append(cbButton);

		// Handle button clicks
		cbButton.click(ev => {
			ev.preventDefault();
			FormApp_CompendiumNavigator();
		});
	}
});

// async function VersionUpdateValidation() {

// 	// Report current module.json version
// 	let module_version = game.modules.get(CompNav.ID).version;
// 	console.log("CompNav | current module.json version:" + module_version);

// 	// Report old version; game.settings.version.default === "0.0.0"
// 	let old_version = game.settings.get(CompNav.ID, "version");
// 	const first_time_install = (old_version === "0.0.0" ? true : false);
// 	if (first_time_install) {
// 		console.log("CompNav | first time install");
// 		// Do stuff for first time install then set FirstTimeInstalled to false
// 		await game.settings.set(CompNav.ID, "FirstTimeInstalled", false);

// 	} else if (old_version !== module_version) {
// 		console.log("CompNav | game.setting old version:" + old_version);
// 		// Do stuff based on module version change here if they need to be complete prior to the version setting onChange event.
// 		// Determine what that change is: Update from old to new version. Skipped versions? downgrading version. First time install?

// 	}
	
// 	// game.settings.register(CompNav.ID, "version", {...}); listens for this onChange
// 	if (old_version !== module_version) {
// 		await game.settings.set(CompNav.ID, "version", module_version);
// 		console.log("CompNav | game.setting new version:" + game.settings.get(CompNav.ID, "version"));
// 	}
// }

export class CompNav {
	static ID = 'compendium-navigator';
}

async function FormApp_CompendiumNavigator() {

	//const _settings = new Compnav_RegisteredSettings;

	new CompendiumNavigator().render(true);
}
