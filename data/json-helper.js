export default class JSON_Helper {
    constructor(){}

    async getJSONData(filename) {
        const jsonDATA = await fetch(filename)
            .then(response => response.json())
            .then(data => {
                return data;
            });
        return jsonDATA;
    }
}