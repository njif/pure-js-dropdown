;(function(exportNs) {

    var toggleTypes = {
        click: 'click',
        hover: 'hover'
    };

    var eventTypes = {
        contract: 'list.contracted',
        expand: 'list.expanded',
        clicked: 'item.clicked'
    };

    var defaults = {
        toggleType: toggleTypes.click,
        controlClass: 'jsdropdown',
        expandClass: 'expanded',
        selectors: {
            caption: '.jsdropdown__caption',
            list: '.jsdropdown__list',
            items: '.jsdropdown__item'
        }
    };

    // =============================
    // A PURE JAVASCRIPT DROPDOWN MENU

    var Dropdown = function (selector, config) {

        if (!selector || typeof selector !== "string") {
            return;
        }

        this._controls = { caption: null, list: null, items: null };
        this._config = toolkit.extend({}, defaults, config);

        this._callbacks = { };
        this._callbacks[eventTypes.contract] = [];
        this._callbacks[eventTypes.expand] = [];
        this._callbacks[eventTypes.clicked] = [];

        this._selector = selector;
        this._holder = null;

        this._listDisplayStyle = null;

        this._init();
    };

    Dropdown.prototype = {

        on: function (eventName, callback) {

            if (!this._callbacks[eventName])
                this._callbacks[eventName] = [];

            toolkit.addCallbackTo(this, this._callbacks[eventName], callback); 
        },

        toggle: function () {

            var expanded = this._listDisplayStyle === null ? true : false;
            return expanded ? this.contract() : this.expand();
        },

        contract: function () {

            if (this._controls.list.style.display === 'none')
                return this;
            this._listDisplayStyle = this._controls.list.style.display;
            this._controls.list.style.display = 'none';
            this._holder.classList.remove(this._config.expandClass);

            toolkit.raiseCallbacks(this._callbacks[eventTypes.contract]);
            return this;
        },

        expand: function () {

            this._controls.list.style.display = this._listDisplayStyle || '';
            this._holder.classList.add(this._config.expandClass);
            this._listDisplayStyle = null;

            toolkit.raiseCallbacks(this._callbacks[eventTypes.expand]);
            return this;
        },

        // =============================
        // PRIVATE:

        _init: function () {
            
            this._initHolder();
            this._createControls();
            this.contract();
            this._attachEvents();
        },

        _initHolder: function () {

            var holder = document.querySelector(this._selector);

            if (holder === null) {
                return;
            }

            var cssClass = this._config.controlClass;
            if (!toolkit.hasClass(holder, cssClass)) {
                holder.classList.add(cssClass);
            }

            this._holder = holder;
        },

        _createControls: function () {

            var selectors = this._config.selectors;
            var controls = this._controls;
            var holder = this._holder;

            controls.caption = holder.querySelector(selectors.caption);
            controls.list = holder.querySelector(selectors.list);
            controls.items = holder.querySelectorAll(selectors.items);
        },

        _attachEvents: function () {

            this._attachToogleEvents();
            this._attachItemClickEvent();
        },

        _attachItemClickEvent: function () {

            var selectors = this._config.selectors;
            var eventHandler = toolkit.bind(this._onItemClick, this);
            var targetFilter = toolkit.bind(this._matchSelectorFilter, this, selectors.items, eventHandler);
            toolkit.addEvent(this._controls.list, 'click', targetFilter);
        },

        _attachToogleEvents: function () {

            var type = this._config.toggleType;

            if (type === toggleTypes.click) {
                this._attachCaptionClickEvent();
            } else if (type === toggleTypes.hover) {
                this._attachCaptionHoverEvent();
            }
        },

        _attachCaptionClickEvent: function () {

            var selectors = this._config.selectors;
            var eventHandler = toolkit.bind(this._onCaptionClick, this);
            var targetFilter = toolkit.bind(this._matchSelectorFilter, this, selectors.caption, eventHandler);
            toolkit.addEvent(this._controls.caption, 'click', targetFilter);

            eventHandler = toolkit.bind(this._onBodyClick, this);
            targetFilter = toolkit.bind(this._notContainElementFilter, this, this._selector, eventHandler);
            toolkit.addEvent(document.body, 'click', targetFilter);
        },

        _attachCaptionHoverEvent: function () {

            var selectors = this._config.selectors;
            var eventHandler = toolkit.bind(this._onCaptionHover, this);
            var targetFilter = toolkit.bind(this._matchSelectorFilter, this, selectors.caption, eventHandler);
            var _this = this;
            toolkit.addEvent(this._controls.caption, 'mouseover', function (event) {

                event.stopPropagation();
                _this.expand();
            });
            toolkit.addEvent(this._holder, 'mouseout', function (event) {

                event.stopPropagation();

                var elem = toolkit.closest(event.relatedTarget, _this._selector);
                if (elem)
                    return;

                _this.contract();
            });
        },

        _notContainElementFilter: function (targetSelector, eventHandler, event) {

            var el = toolkit.getTargetByEvent(event);
            var elem = toolkit.closest(el, targetSelector);
            if (elem === null)
                eventHandler(event);
        },

        _matchHoverFilter: function (targetSelector, eventHandler, event) {

            var el = toolkit.getTargetByEvent(event);
            var elem = toolkit.contain(el, targetSelector);
            if (elem)
                eventHandler(event);
        },

        _matchSelectorFilter: function (targetSelector, eventHandler, event) {

            var el = toolkit.getTargetByEvent(event);
            var elem = toolkit.closest(el, targetSelector);
            if (elem)
                eventHandler(event);
        },

        _onItemClick: function (event) {

            event.stopPropagation();
            var el = toolkit.getTargetByEvent(event);

            var match = toolkit.matches(el, '[disabled]');

            if (match === true)
                return;

            toolkit.raiseCallbacks(this._callbacks[eventTypes.clicked], [event]);
            this.contract();
        },

        _onBodyClick: function () {

            this.contract();
        },

        _onCaptionClick: function (event) {

            event.stopPropagation();
            this.toggle();
        }
    };

    // =============================
    // A TOOLKIT: HELPER FUNCTIONS

    var toolkit = {};

    toolkit.hasClass = function (domTokenList, value) {

        var classList = domTokenList.classList;
        var index = Array.prototype.indexOf.call(classList, value);
        return index === -1 ? false : true;
    };

    toolkit.isObject = function (obj) {

        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    toolkit.extend = function (obj) {

        if (!toolkit.isObject(obj)) {
            return obj;
        }
        
        var length = arguments.length;
        var source, prop, i;

        for (i = 1; i < length; i++) {
            source = arguments[i];
            for (prop in source) {
                if (hasOwnProperty.call(source, prop)) {
                    obj[prop] = source[prop];
                }
            }
        }

        return obj;
    };

    toolkit.bind = function (func, context) {

        var bindArgs = Array.prototype.slice.call(arguments, 2);
        function wrapper() {
            var args = Array.prototype.slice.call(arguments); 
            var unshiftArgs = bindArgs.concat(args);
            return func.apply(context, unshiftArgs);
        }
        return wrapper;
    };

    toolkit.addCallbackTo = function (owner, callbacks, callback) {

        if (callback != null && typeof callback == 'function')
            callbacks.push(callback);
        if (callbacks.owner == null)
            callbacks.owner = owner;
        if (callbacks.maxIndex == null)
            callbacks.maxIndex = 1;
        if (callback != null)
            callback.callbackIndex = callbacks.maxIndex++;
        return owner;
    };

    toolkit.raiseCallbacks = function (callbacks, args) {
        if (args == null)
            args = [];

        for (var i = 0; i < callbacks.length; i++)
            callbacks[i].apply(callbacks.owner, args);
    };

    toolkit.getTargetByEvent = function (ev) {

        var ev = event || window.event;
        return ev.target || ev.srcElement;
    };

    toolkit.closest = function (el, targetSelector) {

        var check = function (elem) {
            return elem.nodeType === 1 ? toolkit.matches(elem, targetSelector) : false;
        };

        while (el) {
            if (check(el)) {
                return el;              
            }
            el = el.parentNode;
        }

        return null;
    };

    toolkit.contain = function (el, targetSelector) {

        var check = function (elem) {
            return elem.nodeType === 1 ? toolkit.matches(elem, targetSelector) : false;
        };

        while (el) {
            if (check(el)) {
                return el;              
            }
            el = el.parentNode;
        }

        return null;
    };

    toolkit.matches = (function () {

        var matcher;

        return function (element, selector) {

            if (!matcher) {
                if (element.matches) {
                    matcher = function (el, sel) {
                        return el.matches(sel);
                    };
                } else if (el.matchesSelector) {
                    matcher = function (el, sel) {
                        return el.matchesSelector(sel);
                    };
                } else {
                    matcher = function (el, sel) {
                        var elems = el.parentNode.querySelectorAll(sel);
                        var count = elems.length;

                        for (var i = 0; i < count; i++) {
                            if (elems[i] === elem) {
                                return true;
                            }
                        }

                        return false;
                    };
                }
            }
            return matcher(element, selector);
        };
    }());

    toolkit.addEvent = (function () {

        var setListener;

        return function (el, ev, fn) {
            if (!setListener) {
                if (el.addEventListener) {
                    setListener = function (el, ev, fn) {
                        el.addEventListener(ev, fn, false);
                    };
                } else if (el.attachEvent) {
                    setListener = function (el, ev, fn) {
                        el.attachEvent('on' + ev, fn);
                    };
                } else {
                    setListener = function (el, ev, fn) {
                        el['on' + ev] =  fn;
                    };
                }
            }
            setListener(el, ev, fn);
        };
    }());

    exportNs.Dropdown = Dropdown;

}(window.dropdown || (window.dropdown = {})));