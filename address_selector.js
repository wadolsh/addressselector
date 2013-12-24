$.ajaxSetup({
    async: false, 
    type: "GET"
});

var mongo = {
    mongoDB: "address_selector",
    mongoAPIKey: "50ee07c6e4b0a0d1d01344f3",
    mongoBaseUrl: "https://api.mongolab.com/api/1",
    url: function(col) {
        return this.mongoBaseUrl + "/databases/" + this.mongoDB + "/collections/" + col + "?apiKey=" + this.mongoAPIKey;
    },
    getCol: function(col, func) {
        $.getJSON(this.url(col), func);
    }
}

var menu_func = {
    _meta: {},
    init: function() {
        // 初期化データ取得
        if (localStorage._meta) {
            this._meta =  JSON.parse(localStorage['_meta']);
        } else {
            this.reget_meta();
        }
    },
    reget_meta: function() {
        localStorage.removeItem('_meta');
        var meta = this._meta = {};
        mongo.getCol('_meta', function(data) {
            $.each(data, function(key, val) {
                meta[val._id] = val.data;
            });
            localStorage['_meta'] = JSON.stringify(meta);
        });
    },
    refresh_ken: function(){
        var $main_ken = $('#main-ken').empty();
        var $button = null;
        $.each(this._meta, function(key, val) {
            $button = $('<button class="uk-button" type="button" data>' + val.name + '</button>')
                        .appendTo($main_ken)
                        .click(function(event) {
                            alert(event);
                        });
        });
    }
}

menu_func.init();




