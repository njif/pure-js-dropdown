;(function(namespace) {

    // PUBLIC API:

    var examplePageApi = {
        instance: createOrGetInstance
    };

    // =============================
    // PRIVATE:

    var instance = null;
    var ns = namespace; // shortcut

    function createOrGetInstance() {

        if (!instance)      
            instance = new ExampleApp();
            
        createOrGetInstance = function() { return instance; };
        return examplePageApi;
    }

    var ExampleApp = function() {

        this._controls = { menu: { first: null, second: null, third: null }, firstMenuState: null };
        this._init();
    };

    ExampleApp.prototype = {

        _init: function () {

            this._createControls();
            this._attachEvents();
        },

        _createControls: function() {

            if (!ns.Dropdown || typeof ns.Dropdown !== "function")
                return;

            var controls = this._controls;
            var menu = controls.menu;

            menu.first = new ns.Dropdown('.jsdropdown-click');
            menu.second = new ns.Dropdown('.jsdropdown-hover', { toggleType: 'hover' });
            menu.third = new ns.Dropdown('.jsdropdown-simple', { selectors: { caption: 'div', list: 'ul', items: 'li' }});

            controls.firstMenuState = document.querySelector('.jsdropdown__example_state');
        },

        _attachEvents: function() {

            var controls = this._controls;
            var menu = controls.menu;           

            var colors = [ 'red', 'blue', 'green', 'yellow'];

            menu.first.on('list.contracted', function () { controls.firstMenuState.innerHTML = 'contracted'; });
            menu.first.on('list.expanded', function () { controls.firstMenuState.innerHTML = 'expanded'; });
            menu.first.on('item.clicked', function (event) {

                alert('First menu item clicked');
            });

            menu.second.on('item.clicked', function (event) {
                var colorIndex = getRandomInt(0,3);
                var text = document.querySelector('.jsdropdown__example_section-hover .jsdropdown__example_text');
                text.style.backgroundColor = colors[colorIndex];
                text.style.color = 'white';
            });

            function getRandomInt (min, max) {

                return Math.floor(Math.random() * (max - min)) + min;
            }

        }
    };

    ns.ExampleApp = examplePageApi;

}(window.dropdown || (window.dropdown = {})));