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
        size: 10 * 1024 * 1024,
        version: '1.0',
        description: '住所データ格納'
    },
    
    table: 'ad_address',
    insertColumn: ["_id", "ken_id", "city_id", "town_id", "zip", "office_flg", "delete_flg", "ken_name", "ken_furi", "city_name", "city_furi", "town_name", "town_furi", "town_memo", "kyoto_street", "block_name", "block_furi", "memo", "office_name", "office_furi", "office_address", "new_id"],
    createSQL: "CREATE TABLE IF NOT EXISTS ad_address (_id unique, ken_id, city_id, town_id, zip, office_flg, delete_flg, ken_name, ken_furi, city_name, city_furi, town_name, town_furi,town_memo, kyoto_street, block_name, block_furi, memo, office_name, office_furi, office_address, new_id)",
    selectSQL: "SELECT %s1 FROM ad_address WHERE %s2",
    
    open: function() {
        this.database = openDatabase(this.dbInfo.name, this.dbInfo.version, this.dbInfo.description, this.dbInfo.size);
        return this;
    },
    init: function() {
        this.database.transaction(function (tx) {
           tx.executeSql(db.createSQL);
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
        var insertSQL = 'INSERT INTO ' + this.table + ' VALUES(' + wildString + ')';
        
        this.database.transaction(function (tx) {
            dataArray = [];
            $.each(list, function(key, data) {
                $.each(db.insertColumn, function(keyColumn, column) {
                    dataArray.push(data[column]);
                });
                tx.executeSql(insertSQL, dataArray, db.success, db.error);
                dataArray.length = 0;
            });
        });
        return this;
    },
    selectBySQL: function(sql, dataArray, func) {
        this.database.transaction(function (tx) {
            tx.executeSql(sql, dataArray, func, db.error);
        });
    },
    select: function(column, where, dataArray, func) {
        this.database.transaction(function (tx) {
            tx.executeSql(db.selectSQL.replace('%s1', column).replace('%s2', where), dataArray, func, db.error);
        });
    },
    success: function(obj) {
        console.log('success');
    },
    error: function(obj) {
        console.log('error');
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
        this.refresh_block();
        return this;
    },
    save_meta: function() {
        localStorage['_meta'] = JSON.stringify(this._meta);
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
            $button = $('<button class="uk-button ' + (val.dbsize > 0 ? 'uk-button-primary' : '' )  +  '" type="button">' + val.name + '(' + key + ')</button>')
                        .appendTo($main_ken)
                        .click(function(event) {
                            if (val.dbsize > 0) {
                                db.select('DISTINCT city_id, city_name, city_furi', 'ken_id = ' + key, null, function(rt, rs) {
                                    menu_func.refresh_city(rs.rows, val);
                                    $('#select-ken').html(val.name);
                                });
                            } else {
                                menu_func.insert_db(val);
                            }
                        });
        });
        return this;
    },
    refresh_city: function(rows, parent) {
        var $button = null;
        var $main = $('#main-city').empty();
        var row = null;
        for (var i = 0; i < rows.length; i++) {
            row = rows.item(i);
            $button = $('<button class="uk-button uk-button-primary" type="button">' + (row.city_name + '<br/>' + row.city_id) + '<br/>(' + row.city_furi + ')</button>')
                .appendTo($main)
                .click(function(event) {
                    var val = this.val;
                    db.select('DISTINCT town_id, town_name, town_furi', 'city_id = ' + val.city_id, null, function(rt, rs) {
                        menu_func.refresh_town(rs.rows, val);
                        $('#select-city').html(val.city_name);
                    });
                });
            $button.get(0).val = row;

        }
        
        $('#select-city').html('***市').click();
    },
    refresh_town: function(rows, parent) {
        var $button = null;
        var $main = $('#main-town').empty();
        var row = null;
        for (var i = 0; i < rows.length; i++) {
            row = rows.item(i);
            $button = $('<button class="uk-button uk-button-primary" type="button">' + (row.town_name + '<br/>' + row.town_id) + '<br/>(' + row.town_furi + ')</button>')
                .appendTo($main)
                .click(function(event) {
                    var val = this.val;
                    $('#select-town').html(val.town_name);
                    $('#select-block').click();
                });
            $button.get(0).val = row;
        }
        $('#select-town').html('***区').click();
    },
    refresh_block: function() {
        var $inputBlock = $('#input-block');
        $('#main-block .big-num').each(function(ind, obj) {
            $(obj).click(function() {
                $inputBlock.val($inputBlock.val() + obj.dataset.num);
            });
        });
        
         $('#main-block .big-delete').click(function(event) {
             var block = $inputBlock.val();
             $inputBlock.val(block.slice(0, -1));
         });
        
        var $keepList = $('#keep-list');
        $('#address-keep').click(function(ind, obj) {
            search.now.get();
            search.now.add_history();
        });
        
        $('#open-map').click(function(ind, obj) {
            search.map_open(search.now.get());
        });
    },
    
    insert_db: function(jsonKen) {
        mongo.getCol(jsonKen.dbkey, function(data) {
            db.insert(data);
            jsonKen.dbsize = data.length;
            menu_func.save_meta();
        });
        this.refresh_ken();
        return this;
    } 
}.init().refresh_ken();

var search = {
    init: function() {
        this.keep.data = JSON.parse(localStorage['keep']);
        return this;
    },
    keep: {
        data: [],
        save: function() {
            localStorage['keep'] = JSON.stringify(search.keep.data);
        }
    },
    now: {
        ken: "",
        city: "",
        town: "",
        block: "",
        address: "",
        get: function() {
            this.ken = $('#select-ken').text();
            this.city = $('#select-city').text();
            this.town = $('#select-town').text();
            this.block = $('#input-block').val();
            this.address = this.ken + this.city + this.town + this.block;
            return this.address;
        },
        add_history: function() {
            search.keep.data.push(this.address);
            search.keep.save();
            
            search.reflash();
        }
    },
    
    reflash: function() {
        var $keepList = $('#keep-list').empty();
        $.each(search.keep.data, function(ind, address) {
            $('<div class="uk-alert" data-uk-alert data-address="' + address + '"><a href="" class="uk-alert-close uk-close"></a><p><a href="#" onclick="search.map_open(\'' + address + '\');">' + address + '</a></p></div>')
                .appendTo($keepList)
                .find('.uk-close').click(function(event) {
                    search.keep.data.remove(address);
                    search.keep.save();
                });
        });
    },
    
    map_open: function(address) {
        location.href = "geo:0,0?q=" + address;
        //location.href = "http://maps.google.com/maps?q=" + address;
    }
    
}.init();


