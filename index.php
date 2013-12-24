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
            <div data-uk-switcher="{connect:'#main-switcher'}">
                <button id="select-ken" class="uk-button" type="button">神奈川県</button>
                <button id="select-city" class="uk-button" type="button">横浜市</button>
                <button id="select-town" class="uk-button" type="button">神奈川区</button>
            </div>
        </div>
    </div>
    <div class="uk-grid">
        <div class="uk-width-medium-3-10 uk-panel uk-panel-box uk-panel-box-primary">3</div>
        <div class="uk-width-medium-7-10 uk-panel uk-panel-box">
            <div id="main-switcher" class="uk-switcher">
                <div id="main-ken" class="uk-active">...1</div>
                <div id="main-city">...2</div>
                <div id="main-town">...3</div>
                <div id="main-block">...4</div>
                <div id="main-office">...5</div>
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