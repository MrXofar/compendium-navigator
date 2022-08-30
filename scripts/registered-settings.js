export const settingsKey = "compendium-navigator";

export class RegisteredSettings{
    constructor(){}    
    Setting1 = game.settings.get(settingsKey, "Setting1");
    Setting2 = game.settings.get(settingsKey, "Setting2");
}