import { CompNav } from "./main.js";
export const settingsKey = "compendium-navigator";

// ***********************************************************************************************
//
// MAKE SURE YOU ADD NEW SETTINGS TO ./registered-settings.js 
//
// ***********************************************************************************************


export function registerSettings() {

    game.settings.register(settingsKey, "FirstTimeInstalled", {
        scope: "world",
        config: false,
        type: Boolean,
        default: true
    });

    game.settings.register(CompNav.ID, "version", {
		scope: "world",
		config: false,
		default: "0.0.0",
		type: String,
		onChange: () => {
			if (!game.user.isGM) return;
			new Dialog({
				title: game.i18n.localize("CompNav.settings.version.title"),
				content: game.i18n.localize("CompNav.settings.version.content"),
				buttons: {
					yes: {
						label: game.i18n.localize("Yes"),
						callback: () => {
                            // Do things based on module version change here if they need to be completed AFTER the version setting onChange event.
                            // CompNav.functionName(); for example.
						},
					},
                    no: {
                        label: game.i18n.localize("No")
                    },
				},
				default: "yes",
			}).render(true);
		},
	});  

    game.settings.register(settingsKey, "HiddenFields", {
        name: game.i18n.localize("CompNav.settings.HiddenFields.Name"),
        hint: game.i18n.localize("CompNav.settings.HiddenFields.Hint"),
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

    game.settings.register(settingsKey, "StringFieldsAsNumber", {
        name: game.i18n.localize("CompNav.settings.StringFieldsAsNumber.Name"),
        hint: game.i18n.localize("CompNav.settings.StringFieldsAsNumber.Hint"),
        scope: "world",
        config: false,
        type: String,
        default: ""
    });
    	
    game.settings.registerMenu(settingsKey, "SubSettings", {
		name: "",
		hint: "Compendium Navigator",
		label: "Compendium Navigator",
		icon: "fas fa-cogs",
		type: Edit_SubSettings,
		restricted: true,
	})

    game.settings.register(settingsKey, "Setting1", {
        name: game.i18n.localize("CompNav.settings.Setting1.Name"),
        hint: game.i18n.localize("CompNav.settings.Setting1.Hint"),
        scope: "world",
        config: false,
        type: String,
        choices: {
            "choice_one": game.i18n.localize("CompNav.settings.Setting1.choices.choice_one"),
            "choice_two": game.i18n.localize("CompNav.settings.Setting1.choices.choice_two"),
            "choice_three": game.i18n.localize("CompNav.settings.Setting1.choices.choice_three")
        },
        default: "0"
    });

    game.settings.register(settingsKey, "Setting2", {
        name: game.i18n.localize("CompNav.settings.Setting2.Name"),
        hint: game.i18n.localize("CompNav.settings.Setting2.Hint"),
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register(settingsKey, "Setting3", {
        name: game.i18n.localize("CompNav.settings.Setting3.Name"),
        hint: game.i18n.localize("CompNav.settings.Setting3.Hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });
    
	// game.settings.registerMenu(settingsKey, "SubSettings", {
	// 	name: "",
	// 	hint: "CompNav.settings.SubSettings.Hint",
	// 	label: "CompNav.settings.SubSettings.Name",
	// 	icon: "fas fa-comments",
	// 	type: Edit_SubSettings,
	// 	restricted: true,
	// })
    
    // game.settings.register(settingsKey, "setting_name", {
    //     name: game.i18n.localize("CompNav.settings.setting_name.Name"),
    //     hint: game.i18n.localize("CompNav.settings.setting_name.Hint"),
    //     scope: "world",
    //     config: true,
    //     type: Boolean,
    //     default: false
    // });

    // game.settings.register(settingsKey, "setting_name", {
    //     name: game.i18n.localize("CompNav.settings.setting_name.Name"),
    //     hint: game.i18n.localize("CompNav.settings.setting_name.Hint"),
    //     scope: "world",
    //     config: true,
    //     type: String,
    //     choices: {
    //         "choice_one": game.i18n.localize("CompNav.settings.setting_name.choices.choice_one"),
    //         "choice_two": game.i18n.localize("CompNav.settings.setting_name.choices.choice_two"),
    //         "choice_three": game.i18n.localize("CompNav.settings.setting_name.choices.choice_three")
    //     },
    //     default: "0"
    // });

	console.log(CompNav.ID + " | Registered Settings");
}
    
class Edit_SubSettings extends FormApplication {

    Setting1_choices = {
        "choice_one": game.i18n.localize("CompNav.settings.Setting1.choices.choice_one"),
        "choice_two": game.i18n.localize("CompNav.settings.Setting1.choices.choice_two"),
        "choice_three": game.i18n.localize("CompNav.settings.Setting1.choices.choice_three"),
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "compnav-subsettings",
            title: "Compendium Navigator - Edit Sub Settings",
            template: "./modules/compendium-navigator/templates/edit-sub-settings.hbs",
            width:500,
            closeOnSubmit: true,
            submitOnClose: false
        })
    }

    async getData(){
        return{
            Setting1_choices: this.Setting1_choices,
            Setting1_value: game.settings.get(settingsKey, "Setting1"),
            Setting2_value: game.settings.get(settingsKey, "Setting2")
        }
    }
    
    async _updateObject(event, formData) {
        if(event.submitter.id !== "cancel"){
            game.settings.set("compendium-navigator", "Setting1", formData.newmodulename_Setting1),
            game.settings.set("compendium-navigator", "Setting2", formData.newmodulename_Setting2)
        }
    }
}