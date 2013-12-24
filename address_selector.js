$.ajaxSetup({
    async: false, 
    type: "GET"
});

var mongo = {
    mongoDB: "address_selector",
    mongoAPIKey: "amM_6PL5L3Gkoi9YkIpRNbN-GQpDGcI-",
    mongoBaseUrl: "https//api.mongolab.com/api/1",
    url: function(col) {
        return this.mongoBaseUrl + "/databases/" + this.mongoDB + "/collections/" + col + "?apiKey=" + this.mongoAPIKey;
    },
    getCol: function(col, func) {
        $.getJSON(this.url(col), func);
    }
}



mongo.getCol('_meta', function (data) {
    $.each(data, function(key, val) {
        alert(val);
    });
});