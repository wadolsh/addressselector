<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <title>住所入力</title>
        <link rel="stylesheet" href="uikit-2.0.0/css/uikit.min.css" />
        <link rel="stylesheet" href="address_selector.css" />
        <link rel="shortcut icon" sizes="196x196" href="/icon.jpg">
    </head>
    <body>
    <div class="sidebar">
        <nav class="uk-navbar uk-navbar-attached">
            <ul class="uk-navbar-nav uk-tab">
                <li><button class="uk-button uk-button-expand" data-uk-offcanvas="{target:'#menu-offcanvas'}">Menu</button></li>
                <li id="status"></li>
            </ul>
        </nav>
        <div id="keep-list"></div>
    </div>
    <div class="wrapper">
        <div style="z-index: 100" data-uk-sticky>
            <nav class="uk-navbar uk-navbar-attached">
                <ul class="uk-navbar-nav uk-tab" data-uk-switcher="{connect:'#main-switcher'}">
                    <li><button id="select-ken" class="uk-button uk-button-success">***県</button></li>
                    <li><button id="select-city" class="uk-button uk-button-success">***市</button></li>
                    <li><button id="select-town" class="uk-button uk-button-success">***区</button></li>
                    <li><button id="select-block" class="uk-button uk-button-success">番地</button></li>
                    <li class="uk-margin-left"><button id="select-nearby" class="uk-button uk-button-danger">周辺</button></li>
                    <li class=""><button id="select-book" class="uk-button uk-button-danger">ブック</button></li>
                </ul>
                <div class="uk-navbar-flip">
                    <div class="uk-navbar-content">
                        <form class="uk-search" data-uk-search id="searchForm" data-uk-search="{flipDropdown:true}">
                            <input class="uk-search-field" type="search" placeholder="" id="searchInput">
                            <button class="uk-search-close" type="reset"></button>

                        </form>
                    </div>
                </div>

            </nav>
        </div>
        <div class="uk-panel uk-panel-box">
            <div id="main-switcher" class="uk-switcher">
                <div id="main-ken" class="tmpl">
                    ## $.each(data, function(key, val) { ##
                        <button class="uk-button ##=(val.dbsize  ? 'uk-button-primary' : '')##" type="button" data-key="##=key##">##=val.name## (##=val.num##)</button>
                    ## }); ##
                </div>
                <div id="main-city" class="tmpl">
                    ## var row = null;
                     _.each(data, function(obj, ind) {
                     row = data.item(ind); ##
                        <button class="uk-button uk-button-primary" type="button" data-ind="##=ind##">##=row.city_name##<br/>##=row.city_id##<br/>(##=row.city_furi##)</button>
                    ## }); ##
                </div>
                <div id="main-town" class="tmpl">
                    ## var row = null;
                     _.each(data, function(obj, ind) {
                     row = data.item(ind); ##
                        <button class="uk-button uk-button-primary" type="button" data-ind="##=ind##">##=row.town_name##<br/>##=row.town_id##<br/>##=row.town_furi##</button>
                    ## }); ##
                </div>
                <div id="main-block">
                    <input type="tel" id="input-block" placeholder="番地入力" class="uk-form-width-medium">
                    <button class="uk-button uk-button-primary big-button" id="address-keep">追加</button>
                    <button class="uk-button uk-button-primary big-button" id="open-map">地図</button>
                    <button class="uk-button uk-button-primary big-button" id="input-block-clear">クリア</button>
                    <div>
                        <button class="uk-button uk-button-primary big-num" data-num="1">1</button>
                        <button class="uk-button uk-button-primary big-num" data-num="2">2</button>
                        <button class="uk-button uk-button-primary big-num" data-num="3">3</button>
                        <button class="uk-button uk-button-primary big-num" data-num="4">4</button>
                        <button class="uk-button uk-button-primary big-num" data-num="5">5</button>
                        <button class="uk-button uk-button-primary big-num" data-num="6">6</button>
                        <button class="uk-button uk-button-primary big-num" data-num="7">7</button>
                        <button class="uk-button uk-button-primary big-num" data-num="8">8</button>
                        <button class="uk-button uk-button-primary big-num" data-num="9">9</button>
                        <button class="uk-button uk-button-primary big-num" data-num="0">0</button>
                        <button class="uk-button uk-button-primary big-num" data-num="-">-</button>
                        <button class="uk-button uk-button-primary big-delete" data-num="←">←</button>
                    </div>
                </div>
                <div id="main-nearby">
                    <div>
                        <button class="uk-button uk-button-primary big-button" onclick="menu_func.refresh_nearby();">周辺検索</button>
                    </div>
                    <div id="nearby-list" class="tmpl">
                        ## $.each(data, function(ind, obj) { ##
                            <a href="#" class="uk-button uk-button-success" data-ind="##=ind##">
                                <span class="uk-text-large uk-text-bold">##=obj.town_name##</span><br/><span class="uk-text-small">##=(obj.ken_name + obj.city_name)##</span>
                            </a>
                        ## }); ##
                    </div>
                </div>
                <div id="main-book">
                    <div>
                        <input type="text" id="input-book-title" placeholder="表示名" class="uk-form-width-medium">
                        <input type="text" id="input-book-word" placeholder="検索語" class="uk-form-width-medium">
                        <button class="uk-button uk-button-primary big-button" id="add-book">追加</button>
                        <button class="uk-button uk-button-primary big-button" id="input-book-clear">クリア</button>
                    </div>
                    <div id="book-list" class="tmpl">
                        ## $.each(data, function(ind, obj) { ##
                            <div class="uk-alert" data-uk-alert data-address="##=obj.word##">
                                <a href="" class="uk-alert-close uk-close" data-ind="##=ind##"></a>
                                <a href="##=search.map_url(obj.word)##" class="uk-button uk-button-danger">
                                    <span class="uk-text-large uk-text-bold">##=obj.title##</span><br/><span class="uk-text-small">##=obj.word##</span>
                                </a>
                            </div>
                        ## }); ##
                    </div>
                </div>
            </div>
        
        </div>
    </div>
    
    
    
<!-- This is the off-canvas sidebar -->
<div id="menu-offcanvas" class="uk-offcanvas">
    <div class="uk-offcanvas-bar">
        <ul class="uk-nav uk-nav-offcanvas" data-uk-nav>
            <li><a href="#" onclick="menu_func.reget_meta();">県リセット</a></li>
            <li class="uk-nav-divider"></li>
            <li><a href="#" onclick="menu_func.reset_all();">初期化</a></li>
        </ul>
    </div>
</div>
    
    
<!-- This is the modal -->
<div id="modal" class="uk-modal">
    <div class="uk-modal-dialog uk-modal-dialog-frameless">
        <a href="" class="uk-modal-close uk-close uk-close-alt uk-hidden"></a>
        <div id="modal-content">
            <div id="modal-message"></div>
            <div class="uk-progress">
                <div class="uk-progress-bar" id="modal-progress" style="width: 0%;">0%</div>
            </div>
        </div>
    </div>
</div>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDejNEedWnONLDewIynvzf6Wv-aI4sd3eU&sensor=true"></script>
    <script src="//code.jquery.com/jquery-2.0.3.min.js"></script>
    <script src="underscore.js"></script>
    <script src="uikit-2.0.0/js/uikit.min.js"></script>
    <script src="uikit-2.0.0/addons/js/sticky.js"></script>
    <script src="address_selector.js"></script>
    </body>
</html>