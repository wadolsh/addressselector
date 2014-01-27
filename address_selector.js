$.ajaxSetup({
    async: true, 
    type: "GET",
    beforeSend: function( jqXHR, settings ) {
        modal.show('データ取得中。');
        //stat.msg('データ取得中。');
    },
    complete: function( jqXHR, textStatus  ) {
        modal.hide();
        //stat.clear();
    }
});

var mongo = {
    mongoDB: "address_selector",
    mongoAPIKey: "50ee07c6e4b0a0d1d01344f3",
    mongoBaseUrl: "https://api.mongolab.com/api/1",
    url: function(col, sort) {
        return this.mongoBaseUrl + "/databases/" + this.mongoDB + "/collections/" + col + "?apiKey=" + this.mongoAPIKey + "&l=0" + (sort ? '&s=' + sort : '');
    },
    getCol: function(col, func, sort) {
        $.getJSON(this.url(col, sort), func);
    }
}

var db = {
    database: null,
    
    dbInfo : {
        name: 'address_selector',
        size: 100 * 1024 * 1024,
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
    dropTable: function() {
        this.database.transaction(function (tx) {
            tx.executeSql('DROP TABLE IF EXISTS ' + db.table);
        });
    },
    insert: function(list) {
        var wild = [];
        for (var i in this.insertColumn) {
            wild.push('?');
        }
        var wildString = wild.join(',');
        var dataArray = null;
        var insertSQL = 'INSERT INTO ' + this.table + ' VALUES(' + wildString + ')';
        
        var total = list.length;
        
        this.database.transaction(function (tx) {
            dataArray = [];
            $.each(list, function(key, data) {
                $.each(db.insertColumn, function(keyColumn, column) {
                    dataArray.push(data[column]);
                });
                tx.executeSql(insertSQL, dataArray, db.success, db.error);
                dataArray.length = 0;
               modal.progress(total, key);
            });
            
            modal.hide();
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
        //console.log('success');
    },
    error: function(obj) {
        console.log('error');
    }
    
}.open().init();

var stat = {
    obj: $('#status'),
    msg: function(m) {
        this.obj.text(m);
    },
    clear: function() {
        this.obj.text('');
    }
};

var modal = {
    m : new $.UIkit.modal.Modal("#modal"),
    c : $('#model-content'),
    p : $('#modal-progress'),
    msg : $('#modal-message'),
    init: function() {
        this.m.options.bgclose = false;
        $('#modal').on({
            'uk.modal.show': function(){
                console.log("Modal is visible.");
            },
            'uk.modal.hide': function(){
                console.log("Element is not visible.");
            }
        });
        return this;
    },
    progress : function(total, size) {
        this.show();
        this.p.css('widht', (total / size * 100) + '%').text(size + ' / ' + total);
    },
    hide: function() {
        this.m.hide();
        this.msg.text('');
        this.p.css('widht', '0%').text('0%');
    },
    show: function(str) {
        if (str) {
            this.msg.text(str);
        } 
        this.m.show();
    }
}.init();


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
        this.refresh_book();
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
            $button = $('<button class="uk-button ' + (val.dbsize > 0 ? 'uk-button-primary' : '' )  +  '" type="button">' + val.name + '(' + val.num + ')</button>')
                        .appendTo($main_ken)
                        .click(function(event) {
                            if (val.dbsize > 0) {
                                db.select('DISTINCT city_id, city_name, city_furi', 'ken_id = ' + val.num, null, function(rt, rs) {
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
        
        $('#open-map').click(function(event) {
            search.map_open(search.now.get());
        });
        
        $('#input-block-clear').click(function(event) {
            $inputBlock.val('');
        });
        
        return this;
    },
    refresh_book: function() {
        
        var $bookList = $('#book-list');
        $('#add-book').click(function(event) {
            search.book.add();
        });
        
        $('#input-book-clear').click(function(event) {
            search.book.clear();
        });
        
        return this;
    },
    refresh_nearby: function() {
        map.geocoding.nearByCho(function(data) {
           //console.log(data);
            var $nearbyList = $('#nearby-list').empty();
            $.each(data, function(ind, obj) {
                $('<a href="' + search.map_url(obj.ken_name + obj.city_name + obj.town_name + obj.block_name) + '" class="uk-button uk-button-success">' + obj.block_name + '</a>')
                    .appendTo($nearbyList);
            });
        });
    },
    
    insert_db: function(jsonKen) {
        mongo.getCol(jsonKen.dbkey, function(data) {
            db.insert(data);
            jsonKen.dbsize = data.length;
            menu_func.save_meta();
            menu_func.refresh_ken();
        });
        
        return this;
    } 
}.init().refresh_ken();

var search = {
    init: function() {
        if (localStorage['keep']) {
            this.keep.data = JSON.parse(localStorage['keep']);
        }
        if (localStorage['book']) {
            this.book.data = JSON.parse(localStorage['book']);
        }
        this.reflash();
        return this;
    },
    keep: {
        data: [],
        save: function() {
            localStorage['keep'] = JSON.stringify(search.keep.data);
        },
        reflash: function() {
            var $keepList = $('#keep-list').empty();
            $.each(search.keep.data, function(ind, address) {
                $('<div class="uk-alert" data-uk-alert data-address="' + address + '"><a href="" class="uk-alert-close uk-close"></a><p><a href="' + search.map_url(address) + '">' + address + '</a></p></div>')
                    .appendTo($keepList)
                    .find('.uk-close').click(function(event) {
                        var index = search.keep.data.indexOf(address);
                        if (index > -1) {
                            search.keep.data.splice(index, 1);
                        }
                        search.keep.save();
                    });
            });
        }
    },
    book: {
        data: [],
        save: function() {
            localStorage['book'] = JSON.stringify(search.book.data);
        },
        add: function() {
            search.book.data.push({title : $('#input-book-title').val(), word : $('#input-book-word').val()});
            search.book.save();
            $('#input-book-title').val('');
            $('#input-book-word').val('');
            search.book.reflash();
        },
        del: function(ind) {
            search.book.data.splice(ind, 1);
            search.book.save();
        },
        clear: function() {
            $('#input-book-title').val('');
            $('#input-book-word').val('');
        },
        reflash: function() {
            var $bookList = $('#book-list').empty();
            $.each(search.book.data, function(ind, obj) {
                $('<div class="uk-alert" data-uk-alert data-address="' + obj.word + '"><a href="" class="uk-alert-close uk-close"></a><a href="' + search.map_url(obj.word) + '" class="uk-button uk-button-danger">'
                        + '<span class="uk-text-large uk-text-bold">' + obj.title + '</span><br/><span class="uk-text-small">' + obj.word + '</span></a></div>')
                    .appendTo($bookList)
                    .find('.uk-close').click(function(event) {
                        if (confirm('削除してもよろしいでしょうか？')) {
                            search.book.del(ind);
                        } else {
                            return false;
                        }
                    });
            });
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
            $('#input-block').val('');
            search.reflash();
        }
    },
    
    reflash: function() {
        search.keep.reflash();
        search.book.reflash();
        return this;
    },
    
    map_open: function(address) {
        //location.href = "geo:0,0?q=" + address;
        location.href = "http://maps.google.com/maps?q=" + address;
    },
    
    map_url: function (address) {
        return "http://maps.google.com/maps?q=" + address;
    },
    
    search_word: function(word) {
        $('#searchForm').addClass('uk-open');
        var $ul = $('#searchForm ul').empty();
        db.select('DISTINCT ken_name, city_name, town_name', 'city_name like ? or town_name like ? or city_furi like ? or town_furi like ?', ['%' + word + '%', '%' + word + '%', '%' + word + '%', '%' + word + '%'], function(rt, rs) {
            var row = null;
            for (var i = 0; i < rs.rows.length; i++) {
                row = rs.rows.item(i);
                $ul.append('<li>' + row.ken_name + row.city_name + row.town_name + '</li>');
            }
        });
    }
    
};
search.init();

$('#searchInput').keyup(function () {
    search.search_word(this.value);
});


var map = {
    init: function() {
        return this;
    },
    
    nowPos: function(func) {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                func(position);
            }, function() {
                alert('現在位置取得不可1');
            });
        } else {
            // Browser doesn't support Geolocation
            alert('現在位置取得不可0');
        }
    },
    
    nowPosLatLng: function(func) {
        map.nowPos(function(pos) {
            func(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        });
    },
    
    geocoding : {
        nearBy: function(func) {
            map.nowPos(function(pos) {
                $.get('http://maps.googleapis.com/maps/api/geocode/json', {latlng: pos.coords.latitude + ',' + pos.coords.longitude, sensor: true}, function(data) {
                    console.log(data);
                    func(data);
                });
            });
        },
        nearByCho: function(func) {
            map.geocoding.nearBy(function(data) {
                var choData = new Array();
                var block_name = null;
                $.each(data.results, function(ind, obj) {
                    $.each(obj.address_components, function(ind, address_selected) {
                        block_name = address_selected.long_name;
                        if(address_selected.types.indexOf('sublocality_level_1') >= 0){
                            for (var i in choData) {
                                if (choData[i].block_name == block_name) {
                                    return false;
                                }
                            }
                            choData.push({block_name: address_selected.long_name, town_name: obj.address_components[ind + 1].long_name, city_name: obj.address_components[ind + 2].long_name, ken_name: obj.address_components[ind + 3].long_name});
                        }
                    });
                });
                func(choData);
            });
        }
    }
}.init();



