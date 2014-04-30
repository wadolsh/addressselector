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
        return $.getJSON(this.url(col, sort), func);
    }
}


var db = {
    database: null,
    
    dbInfo : {
        name: 'address_selector',
        size: 4 * 1024 * 1024,
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
        if (!openDatabase) {
            alert("正常に起動しないブラウザです。");
        }
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

var tmpl = {
    $tmplate: $('.tmpl'),
    cache: {},
    init: function() {
        var tmpl = this;
        
        _.templateSettings = {
            evaluate    : /##([\s\S]+?)##/g,
            interpolate : /##=([\s\S]+?)##/g,
            escape      : /##-([\s\S]+?)##/g,
            variable: 'data'
        };
        
        this.$tmplate.each(function(ind, ele) {
            tmpl.cache[ele.id] = ele.innerHTML;
            ele.innerHTML = '';
        });
        
        return this;
    },
    
    render: function(id, data) {
        var ele = document.getElementById(id)
        ele.innerHTML = _.template(tmpl.cache[id], data);
        return ele;
    }
}.init();


var stat = {
    obj: $('#listStatus'),
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
    checkDirections: false,
    init: function() {
        // 初期化データ取得
        if (localStorage._meta) {
            this._meta =  JSON.parse(localStorage['_meta']);
        } else {
            this.reget_meta();
        }
        this.refresh_ken();
        this.refresh_block();
        this.refresh_book();
        $('#main-ken').addClass('uk-active');
        
        $('#reflash-directions').on('click', function() {
            mapTools.aMap_clear();
            mapTools.aMap_render($('#keep-list .keep'));
            menu_func.checkDirections = true;
        });
        $('#reflash-fastDirections').on('click', function() {
            mapTools.directions.calcFastRoute();
        });
        
        $('#main-switcher-ul').on({
            'uk.switcher.show': function(event, area){
                if (area[0].id == "li-map") {
                    $('#map_canvas').height($('body').height() - 102).resize();
                    google.maps.event.trigger(mapTools.aMap, 'resize');
                    if (!menu_func.checkDirections) {
                        $('#reflash-directions').click();
                    }
                }
                return area;
            },
            'uk.switcher.hide': function(event, area){
                if (area[0].id == "li-map") {
                    mapTools.aMap_clear();
                }
            }
        });

        
        return this;
    },
    save_meta: function() {
        localStorage['_meta'] = JSON.stringify(this._meta);
    },
    reget_meta: function() {
        localStorage.removeItem('_meta');
        var meta = this._meta = {};
        return mongo.getCol('_meta', function(data) {
            $.each(data, function(key, val) {
                meta[val._id] = val.data;
            });
            localStorage['_meta'] = JSON.stringify(meta);
        });
        return this;
    },
    refresh_ken: function(){
        var ele = tmpl.render('main-ken', this._meta.ken);
        $(ele).find('button').click(function(event) {
                            var ken = menu_func._meta.ken[this.dataset.key];
                            if (ken.dbsize > 0) {
                                menu_func.refresh_city(ken);
                                $('#select-ken').html(ken.name);
                            } else {
                                menu_func.insert_db(ken);
                            }
                        });
        return this;
    },
    refresh_city: function(ken) {
        
        db.select('DISTINCT city_id, city_name, city_furi', 'ken_id = ' + (ken.num || ken.ken_id), null, function(rt, rs) {
            var ele = tmpl.render('main-city', rs.rows);
            $(ele).find('button').each(function(ind, obj) {
                $(obj).click(function(event) {
                    var city = rs.rows.item(parseInt(obj.dataset.ind));
                    menu_func.refresh_town(city);
                    $('#select-city').html(city.city_name);
                });
            });
        });
        
        $('#select-town').html('***区');
        $('#select-city').html('***市').click();
    },
    refresh_town: function(city) {
        db.select('DISTINCT town_id, town_name, town_furi', 'city_id = ' + city.city_id, null, function(rt, rs) {
            var ele = tmpl.render('main-town', rs.rows);
            $(ele).find('button').each(function(ind, obj) {
                $(obj).click(function(event) {
                    var val = rs.rows.item(parseInt(obj.dataset.ind));
                    $('#select-town').html(val.town_name);
                    $('#select-block').click();
                });
            });
        });
        
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
        
        $('#address-keep').click(function(ind, obj) {
            search.now.get();
            search.now.add_keep();
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
    insert_db: function(jsonKen) {
        return mongo.getCol(jsonKen.dbkey, function(data) {
            db.insert(data);
            jsonKen.dbsize = data.length;
            menu_func.save_meta();
            menu_func.refresh_ken();
        });
        
        return this;
    },
    reset_all: function() {
        db.dropTable();
        menu_func.reget_meta().done(function() {
            location.reload();
        });
    }
    
}.init();

var search = {
    init: function() {
        $('#search_input').keyup(function () {
            if (this.value) {
                search.search_word(this.value);
            } else {
                search.refresh_search_list({});
            }
        });
        
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
        $keepList: $('#keep-list'),
        data: [],
        listCount: function() {
            stat.msg(search.keep.$keepList.find('.keep').size() + ' / ' + search.keep.data.length);
        },
        save: function() {
            localStorage['keep'] = JSON.stringify(search.keep.data);
        },
        reflash: function() {
            search.keep.$keepList.empty();
            search.keep.recursionAdd(search.keep.data, 0);
        },
        recursionAdd: function(addressArray, ind) {
            if (addressArray.length < 1) {
                return;
            }
            search.keep.add(addressArray[ind], function() {
                if (addressArray.length > ind + 1) {
                    setTimeout(function() {
                        search.keep.recursionAdd(addressArray, ind + 1);
                    }, ind * 45);
                }
            });
        },
        add: function(address, func) {
            var idx = (search.keep.$keepList.find('[data-idx]:last').data('idx') || 0) + 1;
            var $addressLine = $('<div class="uk-alert uk-grid keep" data-uk-alert data-address="' + address + '" data-idx="' + idx + '"><a href="' + search.map_url(address) + '" class="uk-button uk-width-1-6">' + idx + '</a><a href="#" class="uk-width-4-6 address-line">' + address + '<span class="info-line"></span><span class="route-line uk-float-right"></span></a><a href="" class="uk-alert-close uk-close uk-width-1-6"></a></div>')
                .appendTo(search.keep.$keepList);
            
            $addressLine.find('.uk-close').click(function(event) {
                var index = search.keep.data.indexOf(address);;
                if (index > -1) {
                    search.keep.data.splice(index, 1);
                }
                search.keep.save();
                if ($addressLine.hasClass('selected')) {
                    mapTools.directions.directionsRenderer.setMap(null);
                }
                if ($addressLine[0].marker) {
                    $addressLine[0].marker.setMap(null);
                }
                setTimeout(function() {
                    search.keep.listCount();
                }, 500);
            });
            
            mapTools.geocoding.latLngByAddress(address, function(latLng) {
                search.keep.listCount();
                if (func) {
                    func();
                }
                if (!latLng) {
                    $addressLine.addClass('error');
                    return;
                }
                var marker = new google.maps.Marker({
                    icon : 'https://chart.googleapis.com/chart?chst=d_map_pin_letter_withshadow&chld=' + idx + '|00a8e6|000000',
                    map: mapTools.aMap,
                    position:latLng,
                });
                google.maps.event.addListener(marker, 'click', function() {
                    mapTools.aMap.setCenter(latLng);
                });
                
                $addressLine[0].marker = marker;
                // $addressLine.find('button').click(function(event) {
                //     search.map_open(address);
                // });
                mapTools.aMapMarkerArray.push(marker);
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
            var bookList = tmpl.render('book-list', search.book.data);
            $(bookList).find('.uk-close').click(function(event) {
                        if (confirm('削除してもよろしいでしょうか？')) {
                            search.book.del(this.dataset.ind);
                        } else {
                            return false;
                        }
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
        add_keep: function() {
            if (search.keep.data.indexOf(this.address) > -1) {
                console.log('重複アドレス:' + this.address);
                return;
            }
            search.keep.data.push(this.address);
            search.keep.save();
            search.keep.add(this.address);
            $('#input-block').val('');
        }
    },
    
    reflash: function() {
        search.keep.reflash();
        search.book.reflash();
        return this;
    },
    
    map_open: function(address) {
        var href = (document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1) ? "geo:0,0?q=" : mapTools.url + "?q=";
        //location.href = "geo:0,0?q=" + address;
        location.href = href + address;
    },
    
    map_url: function (address) {
        var href = (document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1) ? "geo:0,0?q=" : mapTools.url + "?q=";
        return href + address;
    },
    refresh_search_list: function(data) {
        var ele = tmpl.render('search-list', data);
        $(ele).find('a').click(function(event) {
            //console.log(data);
            var selected = data[this.dataset.ind];

            db.select("DISTINCT ken_id, ken_name, ken_furi, city_id, city_name, city_furi, town_id, town_name, town_furi",
                                                        "ken_name = '" + selected.ken_name 
                                                        + "' and city_name = '" + selected.city_name 
                                                        + "' and town_name = '" + selected.town_name + "'", null, function(rt, rs) {
                var town = rs.rows.item(0);
                menu_func.refresh_city(town);
                menu_func.refresh_town(town);
                $('#select-ken').html(town.ken_name);
                $('#select-city').html(town.city_name);
                $('#select-town').html(town.town_name);
                $('#select-block').click();
            });
        });
    },
    refresh_nearby: function() {
        mapTools.geocoding.nearByCho(search.refresh_search_list);
    },
    search_word: function(word) {
        word = word.replace(/[ぁ-ん]/g, function(s) {
           return String.fromCharCode(s.charCodeAt(0) + 0x60);
        });
        db.select('DISTINCT ken_name, city_name, town_name', 'city_name like ? or town_name like ? or city_furi like ? or town_furi like ?',
                    ['%' + word + '%', '%' + word + '%', '%' + word + '%', '%' + word + '%'],
                    function(rt, rs) {
                        if (rs.rows.length > 40) {
                            search.refresh_search_list({msg: "検索結果が40件を超えました。"});
                            return;
                        }
                        var datas = [];
                        var row = null;
                        for (var i = 0; i < rs.rows.length; i++) {
                            row = rs.rows.item(i);
                            datas.push(row);
                        }
                        search.refresh_search_list(datas);
        });
    }
    
};

var mapTools = {
    url: "https://maps.google.com/maps",
    aMap : null,
    pos: null,
    myMarker: null,
    aMapMarkerArray: [],
    
    //color: ['auqa', 'blue', 'lime', 'purple', 'maroon', 'navy', 'olive', 'green', 'orange', 'red', 'silver', 'teal', 'yellow', 'fuchsia', 'gray', 'black', 'white'],
    init: function() {
        var that = this;
        that.mapOptions = {
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        this.aMap = new google.maps.Map(document.getElementById("map_canvas"), that.mapOptions);
        this.myMarker = new google.maps.Marker({
            map: that.aMap
        });
        
        this.directions.directionsRenderer.setMap(this.aMap);
        
        $('#direction_setting_modal').on({
            'uk.modal.show': function(){
                mapTools.directions.$directionSettingModal.find('input[name="highways"]')
                    .prop('checked', mapTools.directions.setting.highways);
                mapTools.directions.$directionSettingModal.find('input[name="tolls"]')
                    .prop('checked', mapTools.directions.setting.tolls);
                
                var $destination = mapTools.directions.$directionSettingModal.find('select[name="destination"]').empty();
                $.each(search.keep.$keepList.find('.keep'), function(ind, obj) {
                    $destination.append('<option value="' + obj.dataset.idx + '">' + obj.dataset.idx + ' ' + obj.dataset.address + '</option>');
                });
                $destination[0].value = mapTools.directions.setting.destinationIdx;
            },
            'uk.modal.hide': function(){
                mapTools.directions.$directionSettingModal.find('input').each(function(ind, obj) {
                    mapTools.directions.setting[obj.name] = obj.checked;
                });
                var destinationIdx = mapTools.directions.$directionSettingModal.find('select[name="destination"]').val();
                mapTools.directions.setting.destinationIdx = destinationIdx;
            }
        });
        return this;
    },
    
    nowPos: function(func) {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                func(position);
            }, function() {
                alert('現在位置取得不可1');
                var dumy = {};
                dumy.coords = {latitude : 35.466271, longitude: 139.622790};
                func(dumy);
            });
        } else {
            // Browser doesn't support Geolocation
            alert('現在位置取得不可0');
        }
    },
    
    nowPosLatLng: function(func) {
        mapTools.nowPos(function(pos) {
            mapTools.pos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            if (mapTools.myMarker) {
                mapTools.myMarker.setPosition(mapTools.pos);
            }
            func(mapTools.pos);
        });
    },
    
    geocoding : {
        geocoder: new google.maps.Geocoder(),
        nearBy: function(func) {
            mapTools.nowPos(function(pos) {
                $.get(mapTools.url + '/api/geocode/json', {latlng: pos.coords.latitude + ',' + pos.coords.longitude, language: 'ja', region: 'ja', sensor: true}, function(data) {
                    //console.log(data);
                    func(data);
                });
            });
        },
        nearByCho: function(func) {
            mapTools.geocoding.nearBy(function(data) {
                var choData = new Array();
                var town_name = null;
                $.each(data.results, function(ind, obj) {
                    $.each(obj.address_components, function(ind, address_selected) {
                        town_name = address_selected.long_name;
                        if(address_selected.types.indexOf('sublocality_level_1') >= 0){
                            for (var i in choData) {
                                if (choData[i].town_name == town_name) {
                                    return false;
                                }
                            }
                            choData.push({town_name: address_selected.long_name, city_name: (obj.address_components[ind + 2].long_name + obj.address_components[ind + 1].long_name), ken_name: obj.address_components[ind + 3].long_name});
                        }
                    });
                });
                func(choData);
            });
        },
        latLngByAddress: function(address, func) {
            mapTools.geocoding.geocoder.geocode( { 'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //func(results[0].geometry.location);
                    func(results[0].geometry.location);
                } else {
                    console.log('Geocode失敗: ' + status  + '：' + address);
                    //mapTools.geocoding.latLngByAddress(address, func);
                    func(null);
                }
            });
        }
    },
    
    directions: {
        setting: {
            highways: false,
            tolls: false,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING,
            destination: null,
            destinationIdx: 0
        },
        $directionSettingModal: $('#direction_setting_modal'),
        directionsRenderer: new google.maps.DirectionsRenderer(),
        directionsService: new google.maps.DirectionsService(),
        calcFastRoute: function() {
            var directionsObj = search.keep.$keepList.find('[data-idx="' + mapTools.directions.setting.destinationIdx + '"]')[0]
            if (!mapTools.directions.setting.destinationIdx || !directionsObj) {
                alert("目的地が設定されていません。\n経路オプションから最短ルート最終目的地を設定してください。");
                return;
            }
            
            mapTools.directions.setting.destination = directionsObj.marker.getPosition();
            
            var waypts = [];
            search.keep.$keepList.find('.keep').each(function(ind, obj) {
                if (!obj.marker) {
                    return;
                }
                waypts.push({
                    location: obj.marker.getPosition(),
                    stopover: true
                });
            });
            
            var requestOption = {
                origin: mapTools.myMarker.getPosition(),
                destination: mapTools.directions.setting.destination,
                waypoints: waypts,
                avoidHighways: !mapTools.directions.setting.highways,
                avoidTolls: !mapTools.directions.setting.tolls,
                optimizeWaypoints: mapTools.directions.setting.optimizeWaypoints,
                travelMode: mapTools.directions.setting.travelMode
            };
            mapTools.directions.directionsService.route(requestOption, function(response, status) {
                mapTools.directions.directionsRenderer.setMap(mapTools.aMap);
                //mapTools.directions.directionsRenderer.setPanel($('#fast_direction_panel')[0]);
                mapTools.directions.directionsRenderer.setDirections(response);
                
                var $keep = search.keep.$keepList.find('.keep');
                $.each(response.routes[0].waypoint_order, function(ind, order) {
                    $($keep[order]).find('.route-line').html('[経路：' + (ind + 1) + ']');
                });
                //console.log(response);
            });
        },
        calcRoute: function(addressObj, func) {
            var marker = addressObj.marker;
            var requestOption = {
                origin: mapTools.myMarker.getPosition(),
                destination: marker.getPosition(),
                travelMode: mapTools.directions.setting.travelMode,
                avoidHighways: !mapTools.directions.setting.highways,
                avoidTolls: !mapTools.directions.setting.tolls,
            };
            mapTools.directions.directionsService.route(requestOption, function(response, status) {
                var $markerObj = $(addressObj);
                if (status == google.maps.DirectionsStatus.OK) {
                    
                    //mapTools.directions.directionsRenderer.setDirections(response);
                    var leg = response.routes[0].legs[0];
                    
                    $markerObj.find('.info-line').html('<br/>[' + leg.distance.text + ', ' + leg.duration.text + ']');

                    $markerObj.find('.address-line').click(function(event) {
                        mapTools.directions.directionsRenderer.setMap(mapTools.aMap);
                        var $mapArea = $('#main-map');
                        if (!$mapArea.hasClass('uk-active')) {
                            $('#select-map').click();
                        }
                        var $this = $(this);
                        $('#keep-list').find('.selected').removeClass('selected');
                        $this.parent().addClass('selected');
                        google.maps.event.trigger(marker, "click");
                        mapTools.directions.directionsRenderer.setDirections(response);
                    });
                } else {
                    console.log('Route失敗: ' + status);
                    //mapTools.directions.calcRoute(marker, func);
                    $markerObj.find('.info-line').html('<br/>[' + status +  ']');
                    wait(1000);
                }
                if (func) {
                    func();
                }
            });

        },
        recursionCalcRoute: function(addressObjArray, ind) {
            if (addressObjArray.length < 1) {
                return;
            }
            mapTools.directions.calcRoute(addressObjArray[ind], function() {
                if (addressObjArray.length > ind + 1) {
                    setTimeout(function() {
                        mapTools.directions.recursionCalcRoute(addressObjArray, ind + 1);
                    }, ind * 45);
                }
            });
        },
    },
    
    aMap_clear: function() {
        
        /*
        $.each(mapTools.aMapMarkerArray, function(ind, marker) {
            marker.setMap(null);
        });
        */
        //$('#map_address').empty();
        return this;
    },
    aMap_render: function($address) {
        this.nowPosLatLng(function(latLng) {
            mapTools.myMarker.setPosition(latLng);
            mapTools.aMap.setCenter(latLng);
            
            if (!$address) {
                return this;
            }
            
            mapTools.directions.recursionCalcRoute($address, 0);
        });
        
        return this;
    }
}.init();

search.init();


function wait(waitMilliSeconds) {
    var startTime = (new Date()).getTime();
    while (true) {
        if ((new Date()).getTime() >= startTime + waitMilliSeconds) break;
    }
}


