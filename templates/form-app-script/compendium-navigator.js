
//import { RegisteredSettings } from "../../scripts/registered-settings.js";

Hooks.on('renderCompendiumNavigator', () => {
    //console.log("Compnav | renderCompendiumNavigator");
    Intitialize();
});

export class CompendiumNavigator extends FormApplication {

    // Properties
    //_settings = new RegisteredSettings;
    _doc_classes = ["Actor", "Item"] //, "JournalEntry", "Macro"
    _doc_class_selected = "Actor";
    _class_types = [];
    _class_types_selected = [];
    _game_pack_names = {};
    _game_pack_keys_selected = [];
    _class_type_x_game_pack_key = [];
    _document_index_keys = {};
    _filter_fields_json = [];
    _mapped_fields = [];
    _filter_selections = {};
    _filter_results = [];
    _selected_items_json = [];
    _selected_items = [];

    constructor() {
        super();
        this.GetGamePackNames();
    }

    static get defaultOptions() {

        return foundry.utils.mergeObject(super.defaultOptions, {
            title: game.i18n.localize("CompNav.form-app.title"),
            id: 'compendium-navigator',
            template: "./modules/compendium-navigator/templates/compendium-navigator.hbs",
            width: 1200,
            height: 900,
            closeOnSubmit: false,
            submitOnClose: false
        });
    }

    // Send data to CompendiumNavigator forms
    async getData() {
        return {
            doc_classes: this._doc_classes,
            doc_class_selected: this._doc_class_selected,
            class_types: this._class_types,
            class_types_selected: this._class_types_selected,
            game_pack_names: this._game_pack_names,
            game_pack_keys_selected: this._game_pack_keys_selected,
            filter_fields_json: this._filter_fields_json,
            temp_index_loop_count: this._temp_index_loop_count,
            filter_selections: this._filter_selections,
            filter_results: this._filter_results,
            selected_items_json: this._selected_items_json,
            selected_items: this._selected_items,
            show_delete_cf_tempentity: this._filter_results.filter(x => x.name === "#[CF_tempEntity]").length > 0
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        document.getElementById("compnav_doc_class_" + this._doc_class_selected).classList.add("compnav-doc-class-selected");

        // Add click listeners for each .compnav-doc-class
        const doc_classes = document.querySelectorAll(".compnav-doc-class");
        for (const doc_class of doc_classes) {
            doc_class.addEventListener("click", (event) => {
                document.getElementById("compnav_doc_class_" + this._doc_class_selected).classList.remove("compnav-doc-class-selected");
                this._doc_class_selected = event.target.innerText;
                event.target.classList.add("compnav-doc-class-selected");
                this._class_types_selected = [];
                this._game_pack_keys_selected = [];
                this._filter_fields_json = [];
                this._filter_results = [];
                this._selected_items_json = [];
                this._selected_items = [];
                this.GetGamePackNames();
            });
        }

        // Add click listeners for each .compnav-class-type
        const class_types = document.querySelectorAll(".compnav-class-type");
        for (const class_type of class_types) {
            class_type.addEventListener("click", (event) => {
                let _type = event.target.innerText;
                this._filter_selections = {};
                this._class_types_selected = [];
                this._class_types_selected.push(_type); // There can be only one! ... for now,... until there can be more.
                // if (!this._class_types_selected.includes(_type)) {
                //     this._class_types_selected.push(_type);
                // }else{
                //     this._class_types_selected = this._class_types_selected.filter(function(x) { return x != _type; });
                // }
                this.SelectGamePacks(_type); //_type
            });
        }

        // Add click listeners for each .compnav-game-pack-name
        const game_pack_names = document.querySelectorAll(".compnav-game-pack-name");
        for (const game_pack_name of game_pack_names) {
            game_pack_name.addEventListener("click", (event) => {
                let _name = event.target.innerText;
                let _gpk = Object.keys(this._game_pack_names).find(key => this._game_pack_names[key] === _name);
                if (this._game_pack_keys_selected.includes(_gpk)) {//!
                    //     this._game_pack_keys_selected.push(_gpk);
                    // }else{
                    this._game_pack_keys_selected = this._game_pack_keys_selected.filter(function (x) { return x != _gpk; });
                    //this.MapFields(this._class_types_selected[0]);
                    this.render();
                }
            });
        }

        // show entity sheet
        html.find('.compnav-filtered-result-name').click(ev => {
            let item_id = ev.currentTarget.parentElement.getAttribute("data-document_id");
            let game_pack_key = ev.currentTarget.parentElement.getAttribute("data-game_pack_key");
            let pack = game.packs.find(p => p.collection === game_pack_key);
            this.ShowItem(pack, item_id);
        });
    }

    async ShowItem(pack, item_id) {
        let doc = await pack.getDocument(item_id);
        doc.sheet.render(true);
    }

    GetGamePackNames() {
        const packs = game.packs.filter((p) => p.documentName === this._doc_class_selected);
        this._game_pack_names = {};
        this._class_types = [];
        for (const pack of packs) {
            let _gpk = pack.collection;
            this._game_pack_names[_gpk] = pack.title.replace("  ", " "); // BUG WORKAROUND - "DAE SRD  Items" title (and label) has two spaces between "SRD..Items"
            if (pack.index.size > 0) {
                for (const item of pack.index) {
                    // console.log("CompNav | " + pack.title)
                    // console.log(item);
                    if (item.type !== '' && item.type !== undefined && !this._class_types.includes(item.type)) {
                        this._class_types.push(item.type);
                    }
                    // Cache which packs contain which item types.
                    if (this._class_type_x_game_pack_key.filter(x => x.class_type === item.type && x.game_pack_key === _gpk).length === 0) {
                        this._class_type_x_game_pack_key.push({
                            class_type: item.type,
                            game_pack_key: _gpk
                        });
                    }
                }
            }
        }
        //console.log(this._class_type_x_game_pack_key); 
        this.render();
    }

    async SelectGamePacks(class_type) {//class_type
        const packs = await game.packs.filter((p) => p.documentName === this._doc_class_selected);
        this._game_pack_keys_selected = [];  // There can be only one! ... for now,... until there can be more.      
        for (const pack of packs) {
            let _gpk = pack.collection;

            // Look in cached _class_type_x_game_pack_key first
            if (this._class_type_x_game_pack_key.filter(x => this._class_types_selected.includes(x.class_type)).length > 0) {
                let gpk_cache = this._class_type_x_game_pack_key.filter(x => this._class_types_selected.includes(x.class_type) &&
                    !this._game_pack_keys_selected.includes(x.game_pack_key)).map(y => y.game_pack_key);
                this._game_pack_keys_selected = this._game_pack_keys_selected.concat(gpk_cache);
            }
            else {
                // Dig through each item of game pack to select game packs with selected class_type 
                for (const item of pack.index) {
                    if (this._class_types_selected.includes(item.type) && !this._game_pack_keys_selected.includes(_gpk)) {
                        this._game_pack_keys_selected.push(_gpk);
                    }
                    // else if(class_type === item.type){
                    //     // Some packs have multiple types - When one of those types is deselected,
                    //     // we want the game pack to remain selected if any of its other types are   
                    //     // still selected.
                    //     // this._class_type_x_game_pack_key keeps track of which packs contain which item types.
                    //     let _xw_game_pack = this._class_type_x_game_pack_key.filter(x => x.game_pack_key === _gpk);
                    //     let _xw_items = _xw_game_pack.map(function(x){ return x.class_type;});
                    //     if(_xw_items.filter(_xw_item => this._class_types_selected.includes(_xw_item)).length === 0)
                    //     {
                    //         this._game_pack_keys_selected = this._game_pack_keys_selected.filter(function(x) { return x != _gpk; });
                    //     }
                    // }
                }
            }
        }

        // Get fields
        this.MapFields(class_type);
    }

    async MapFields(class_type) {
        let index = null;

        if (!this._mapped_fields.find(x => x.class_type === class_type)) {
            this._document_index_keys = {};
            for (const _gpk of this._game_pack_keys_selected) {
                index = await game.packs.get(_gpk).getIndex({ fields: ["value", "system", "data"] });
                //console.log(index);
                this.GetFields(index);
            }
            console.log(this._document_index_keys);
            // TODO: Attempt to sort so that all children properties are under their Parent property

            this._filter_fields_json = JSON.stringify(this._document_index_keys, null, 2);
            console.log(this._filter_fields_json)

            // Cache mapped fields
            this._mapped_fields.push({
                class_type: class_type,
                filter_fields_json: this._filter_fields_json
            })
        }
        else {
            this._filter_fields_json = this._mapped_fields.find(x => x.class_type === class_type).filter_fields_json
        }
        

        //console.log(this._filter_fields_json);
        this.render();
    }

    GetFields(index) {
        let parent_props = [];
        //console.log(index);
        for (const item of index) {
            //console.log("=== GetFields BEGIN === ")
            //console.log(item);
            this._temp_index_loop_count += 1;
            parent_props = parent_props.concat(Object.keys(item).filter(x => !parent_props.includes(x) && x !== "type"));
            for (const prop of parent_props) {
                if (item[prop] !== undefined) {

                    //console.log(prop + " : value(" + (item[prop] === null ? "null" : item[prop]) + ")");

                    if (item[prop] != null && typeof (item[prop]) === 'object' && Object.keys(item[prop]).length > 0) {
                        //console.log("Getting child fields for parent property " + prop + " as type of " + typeof (this._document_index_keys[prop]));
                        if (this._document_index_keys[prop] === undefined) {
                            this._document_index_keys[prop] = {};
                        }
                        this.GetChildFields(item, prop);

                    } else if (typeof (item[prop]) !== 'object') {
                        //console.log(prop + " is a childless top level property.");
                        if (this._document_index_keys[prop] === undefined) {
                            this._document_index_keys[prop] = typeof (item[prop]);
                        }
                    }
                }
            }
            //console.log(this._document_index_keys);
            //console.log("=== GetFields END === ")
        }
    }

    GetChildFields(item, prop) {

        //console.log(">>> GetChildFields BEGIN >>> ");
        let child_properties = null;
        if (getProperty(item, prop) != null) {
            child_properties = Object.keys(getProperty(item, prop));
            //console.log("child_properties of..." + prop);
            //console.log(getProperty(item, prop));
            //console.log("are...");
            //console.log(child_properties);
        } //else { console.log(prop + " is null"); }

        for (const ckey of child_properties) {

            //console.log("value of " + ckey + " is " + getProperty(item,prop)[ckey]);
            //if (!Array.isArray(getProperty(item, prop)[ckey])) { // Skipping arrays for now.
            try {
                if (getProperty(item, prop)[ckey] != null
                    && typeof (getProperty(item, prop)[ckey]) === 'object'
                    && Object.keys(getProperty(item, prop)[ckey]).length > 0) {

                    //console.log(">> Getting child fields for... " + prop + "." + ckey);
                    //if (getProperty(this._document_index_keys,prop + "." + ckey) === undefined){console.log("and _document_index_keys." + prop + "." + ckey + " is undefined...");}
                    if (getProperty(this._document_index_keys, prop)[ckey] === undefined) {
                        getProperty(this._document_index_keys, prop)[ckey] = {};
                    }
                    this.GetChildFields(item, prop + "." + ckey);
                    //console.log(">>");

                } else if (getProperty(item, prop)[ckey] != null) {
                    //console.log("> " + prop + "." + ckey + " is a childless top level property.");
                    //if (getProperty(this._document_index_keys,prop + "." + ckey)  === undefined){console.log("and _document_index_keys." + prop + "." + ckey + " is undefined");}
                    if (getProperty(this._document_index_keys, prop)[ckey] === undefined) { 
                        //console.log("Setting typeof value for " + prop + "." + ckey);
                        //console.log(prop + "." + ckey + " is typeof " + getProperty(item, prop)[ckey]);
                        if(!Array.isArray(getProperty(item, prop)[ckey])){
                            //console.log(typeof (getProperty(item, prop)[ckey]));
                            getProperty(this._document_index_keys, prop)[ckey] = typeof (getProperty(item, prop)[ckey]);
                        } 
                        // else{                           
                        //     getProperty(this._document_index_keys, prop)[ckey] = "array(" + getProperty(item, prop + "." + ckey) + ")";
                        // }
                    }
                    //console.log(">");
                }
            }
            catch (e) {
                //console.log("Compnav | " + prop + "." + ckey + " - Error Message: " + e);
            }
            //}
        }
        //console.log(">>> GetChildFields END >>> ");        
    }

    async _updateObject(event, formData) {

        //console.log(event.submitter.id);
        switch (event.submitter.id) {

            case "submit":
                this._filter_selections = {};
                this._filter_results = [];
                this._filter_selections.type = this._class_types_selected[0];
                let data_keys = Object.keys(formData).filter(data => data !== "hdn_Selected_Items" && data !== "compnav_weighted_by" && formData[data] != null && formData[data] !== false && formData[data] !== "")
                for (const key of data_keys) {
                    this._filter_selections[key] = formData[key];
                }
                //console.log(this._filter_selections);

                let index = null;
                for (const _gpk of this._game_pack_keys_selected) {
                    index = await game.packs.get(_gpk).getIndex({ fields: ["value", "system", "data"] });
                    //console.log(index);
                    this._filter_results = this._filter_results.concat(this.filterData(_gpk, index, this._filter_selections))
                }
                break;

            case "reset_filters":
                this._filter_selections = {};
                break;

            case "clear_results":
                this._filter_results = [];
                break;
            case "clear_selections":
                this._selected_items_json = [];
                this._selected_items = [];
                break;
            case "select_item":
            case "remove_item":
            case "delete_item":
            case "compnav_select_all":
                // console.log("hdn_Selected_Items");
                // console.log(formData.hdn_Selected_Items);
                
                let Selected_Items = formData.hdn_Selected_Items;
                let selected_items_obj = [];
                if (Selected_Items !== "") {
                    selected_items_obj = JSON.parse(Selected_Items);
                }
                
                this._selected_items = [];
                for(const item of selected_items_obj){
                    this._selected_items.push({
                        _id: item._id,
                        gpk: item.gpk,
                        img: item.img,
                        name:item.name,
                        rarity:item.rarity
                    });
                }
                this._selected_items_json = JSON.stringify(this._selected_items, null, 2);
                // console.log(this._selected_items_json);
                break;

            case "compnav_create_compendium":
                
                break;

            case "compnav_create_rollable_table":
                console.log("compnav_create_rollable_table");
                let _Items = formData.hdn_Selected_Items;
                let _items_obj = [];
                if (_Items !== "") {
                    _items_obj = JSON.parse(_Items);
                }

                _items_obj.forEach((el)=>{
                    if(el.rarity !== undefined){
                        el.rarity = (el.rarity = "" ? "common" : String(el.rarity).toLocaleLowerCase());
                    }
                }) 

                const flat_rarity = _items_obj.every(val => val.rarity === _items_obj[0].rarity);// Are all rarities the same?
                let rarity_weight = {"common":64, 
                                     "uncommon":20 ,     
                                     "rare":10,
                                     "veryrare":5,
                                     "legendary":1};
                
                let rng = 0;
                let wt = 1;
                if (_items_obj.length > 0) {
                    _items_obj = _items_obj.map(i => {
                        rng += 1;
                        wt = (!flat_rarity && i.rarity !== undefined && i.rarity !== "" ? rarity_weight[i.rarity] : 1)
                        return{
                            _id: i._id,
                            text: i.name,
                            img: i.img,
                            collection: i.gpk,
                            weight: (wt >= 1 ? wt : 1),
                            range: [rng, rng],
                            type: CONST.TABLE_RESULT_TYPES.COMPENDIUM,

                        }
                    });

                    let tableName = formData.compnav_name;

                    let roll_Table = await RollTable.create({
                        name: tableName,
                        results: _items_obj,
                        replacement: true,
                        formula: `1d${_items_obj.length}`,
                        //folder: game.folders.getName("WIP").id,
                    });
                    await roll_Table.normalize();
                }
                break;

            default:
        }

        //console.log(this._filter_results);
        this.render();
    }

    filterData = (gpk, data, query) => {
        const filteredData = data.filter((item) => {
            for (let key in query) {
                if (getProperty(item, key) === undefined) {
                    return false;
                }
                switch (typeof (query[key])) {
                    case "string":
                        if (!String(getProperty(item, key)).toLocaleLowerCase().includes(String(query[key]).toLocaleLowerCase())) {
                            return false;
                        }
                        break;
                    case "boolean":
                        if (Boolean(getProperty(item, key)) != Boolean(query[key])) {
                            return false;
                        }
                        break;
                    case "number":
                        if (Number(getProperty(item, key)) != Number(query[key])) {
                            return false;
                        }
                        break;
                }
            }
            return true;
        });

        // Can this be done without a for loop?
        for (const fdata in filteredData) {
            filteredData[fdata].gpk = gpk;
        }

        return filteredData;
    };


}
