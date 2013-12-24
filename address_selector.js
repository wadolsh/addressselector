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

var db = {
    database: null,
    
    dbInfo : {
        name: 'address_selector',
        size: 2 * 1024 * 1024,
        version: '1.0',
        description: '住所データ格納'
    },
    
    insertColumn: ["_id", "ken_id", "city_id", "town_id", "zip", "office_flg", "delete_flg", "ken_name", "ken_furi", "city_name", "city_furi", "town_name", "town_furi", "town_memo", "kyoto_street", "block_name", "block_furi", "memo", "office_name", "office_furi", "office_address", "new_id"],
    createSQL: "CREATE TABLE IF NOT EXISTS ad_address (_id unique, ken_id, city_id, town_id, zip, office_flg, delete_flg, ken_name, ken_furi, city_name, city_furi, town_name, town_furi,town_memo, kyoto_street, block_name, block_furi, memo, office_name, office_furi, office_address, new_id)",
    
    open: function() {
        this.database = openDatabase(this.dbInfo.name, this.dbInfo.version, this.dbInfo.description, this.dbInfo.size);
        return this;
    },
    init: function() {
        this.database.transaction(function (tx) {
           tx.executeSql(this.createSQL);
        });
        return this;
    },
    insert: function(list) {
        var wild = [];
        for (var i in this.insertColumn) {
            wild.push('?');
        }
        var wildString = wild.join(',');
        var dataArray = null;
        
        this.database.transaction(function (tx) {
            dataArray = [];
            $.each(list, function(key, data) {
                $.each(db.insertColumn, function(keyColumn, column) {
                    dataArray.push(data[column]);
                });
                tx.executeSql('insert into test values(' + wildString + ')', dataArray);
            });
            
        });
        return this;
    }
}.open().init();


var menu_func = {
    _meta: {},
    init: function() {
        // 初期化データ取得
        if (localStorage._meta) {
            this._meta =  JSON.parse(localStorage['_meta']);
        } else {
            this.reget_meta();
        }
        return this;
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
        return this;
    },
    refresh_ken: function(){
        var $main_ken = $('#main-ken').empty();
        var $button = null;
        $.each(this._meta.ken, function(key, val) {
            $button = $('<button class="uk-button" type="button" data>' + val.name + '</button>')
                        .appendTo($main_ken)
                        .click(function(event) {
                            menu_func.insert_ken(val);
                        });
        });
        return this;
    },
    insert_ken: function(jsonKen) {
        mongo.getCol(jsonKen.dbkey, function(data) {
            db.insert(data);
        });
        return this;
    }
}.init().refresh_ken();



