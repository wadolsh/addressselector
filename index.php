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
            <ul class="uk-navbar-nav uk-tab" data-uk-tab="{connect:'#main-switcher'}">
                <li><button class="uk-button uk-button-expand" data-uk-offcanvas="{target:'#menu-offcanvas'}">Menu</button></li>
            </ul>
        </nav>
        <div id="keep-list"></div>
    </div>
    <div class="wrapper">
        <div style="z-index: 100" data-uk-sticky>
            <nav class="uk-navbar uk-navbar-attached">
                <ul class="uk-navbar-nav uk-tab" data-uk-tab="{connect:'#main-switcher'}">
                    <li><button id="select-ken" class="uk-button uk-button-success">***県</button></li>
                    <li><button id="select-city" class="uk-button uk-button-success">***市</button></li>
                    <li><button id="select-town" class="uk-button uk-button-success">***区</button></li>
                    <li><button id="select-block" class="uk-button uk-button-success">番地</button></li>
                </ul>
            </nav>
        </div>
        <div class="uk-panel uk-panel-box">
        
            <div id="main-switcher" class="uk-switcher">
                <div id="main-ken" class="uk-active">
                </div>
                <div id="main-city"></div>
                <div id="main-town"></div>
                <div id="main-block">
                    <input type="text" id="input-block" placeholder="番地入力" class="uk-form-width-medium">
                    <button class="uk-button uk-button-primary big-button" id="address-keep">追加</button>
                    <button class="uk-button uk-button-primary big-button" id="open-map">地図</button>
                    <button class="uk-button uk-button-primary big-button" id="input-clear">クリア</button>
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
            </div>
        
        </div>
    </div>
    
    
    
<!-- This is the off-canvas sidebar -->
<div id="menu-offcanvas" class="uk-offcanvas">
    <div class="uk-offcanvas-bar">
        <ul class="uk-nav uk-nav-offcanvas" data-uk-nav>
            <li><button class="uk-button uk-button-primary" onclick="menu_func.reget_meta();">県リセット</button></li>
        </ul>
    </div>
</div>
    
    
    
    <script src="//code.jquery.com/jquery-2.0.3.min.js"></script>
    <script src="uikit-2.0.0/js/uikit.min.js"></script>
    <script src="uikit-2.0.0/addons/js/sticky.js"></script>
    <script src="address_selector.js"></script>
    </body>
</html>