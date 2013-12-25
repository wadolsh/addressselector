<!DOCTYPE html>
<html>
    <head>
        <title></title>
        <link rel="stylesheet" href="uikit-2.0.0/css/uikit.min.css" />
        <link rel="stylesheet" href="address_selector.css" />
    </head>
    <body>
    <div class="uk-grid">
        <div class="uk-width-medium-3-10">
            <button class="uk-button uk-button-expand" data-uk-offcanvas="{target:'#menu-offcanvas'}">Menu</button>
        </div>
        <div class="uk-width-medium-7-10">
            <ul class="uk-tab" data-uk-tab="{connect:'#main-switcher'}">
                <li><button id="select-ken" class="uk-button uk-button-primary">***県</button></li>
                <li><button id="select-city" class="uk-button uk-button-primary" id="select-city" >***市</button></li>
                <li><button id="select-town" class="uk-button uk-button-primary" id="select-town" >***区</button></li>
                <li><button id="select-block" class="uk-button uk-button-primary" id="select-block" >番地</button></li>
            </ul>

        </div>
    </div>
    <div class="uk-grid">
        <div class="uk-width-medium-3-10 uk-panel uk-panel-box uk-panel-box-primary">3</div>
        <div class="uk-width-medium-7-10 uk-panel uk-panel-box">
        
            <div id="main-switcher" class="uk-switcher">
                <div id="main-ken" class="uk-active">
                </div>
                <div id="main-city"></div>
                <div id="main-town"></div>
                <div id="main-block">
                    <input type="text" id="input-town" placeholder="番地入力" class="uk-form-width-medium">
                </div>
            </div>
        
        </div>
    </div>
    
    
    
<!-- This is the off-canvas sidebar -->
<div id="menu-offcanvas" class="uk-offcanvas">
    <div class="uk-offcanvas-bar">
        <ul class="uk-nav uk-nav-offcanvas" data-uk-nav>...</ul>
    </div>
</div>
    
    
    
    <script src="//code.jquery.com/jquery-2.0.3.min.js"></script>
    <script src="uikit-2.0.0/js/uikit.min.js"></script>
    <script src="address_selector.js"></script>
    </body>
</html>