// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
(function (global) {
    "use strict";

    // setImmediate is not implemented in all browsers. If it doesn't exist, use setTimeout(_, 0) instead.
    var setImmediate = window.setImmediate;
    if (!setImmediate) {
        setImmediate = function (f) {
            return setTimeout(f, 0);
        };
    }

    // ObjectIndexMap is used in the list binding code. On browsers with Map support we simply use the built in
    // primitive, for list elements which are extensible we instead map from the list elements to their
    // current index (note that we must do the full mapping on every diff in order to ensure we don't
    // see stale indicies), and for non-extensible objects we fall back to using an array with O(N)
    // lookup behavior on get.
    // ObjectIndexMap is only intended to be used in the list binding code below. This helper
    // is limited in that only one key object can be in any map at a time.
    var ObjectIndexMap = window.Map;
    if (!ObjectIndexMap) {
        // A simple value -> integer map
        ObjectIndexMap = function () {
            this._nonExtensibleBacking = [];
        };
        ObjectIndexMap.key = "$$$$mapkey";
        ObjectIndexMap.prototype.has = function (key) {
            if (Object.isExtensible(key)) {
                return ObjectIndexMap.key in key;
            } else {
                return this._nonExtensibleBacking.indexOf(key) !== -1;
            }
        };
        ObjectIndexMap.prototype.get = function (key) {
            if (Object.isExtensible(key)) {
                return key[ObjectIndexMap.key];
            } else {
                return this._nonExtensibleBacking.indexOf(key);
            }
        };
        ObjectIndexMap.prototype.set = function (key, value) {
            if (Object.isExtensible(key)) {
                key[ObjectIndexMap.key] = value;
            } else {
                this._nonExtensibleBacking[value] = key;
            }
        };
    }

    // Pure utility functions
    function getElementRoot(element) {
        var curr = element;
        while (curr.parentNode) {
            curr = curr.parentNode;
        }
        return curr;
    }

    function select(selector, element) {
        return document.querySelector(selector) || getElementRoot(element).querySelector(selector);
    }

    // Directive utilities
    function addDestroyListener($scope, control, bindings, destroyed) {
        $scope.$on("$destroy", function () {
            (destroyed && destroyed());

            bindings.forEach(function (w) { w(); });

            if (control.dispose) {
                control.dispose();
            }
        });
    }

    function apply($scope, f) {
        switch ($scope.$root.$$phase) {
            case "$apply":
            case "$digest":
                f();
                break;
            default:
                $scope.$apply(function () {
                    f();
                });
                break;
        }
    }

    function applyShown(control, shown) {
        if (shown === true) {
            control.show();
        }
        else if (shown === false) {
            control.hide();
        }
    }

    function exists(control) {
        return !!Object.getOwnPropertyDescriptor(WinJS.UI, control);
    }

    function list($scope, key, getControl, getList, bindings) {
        var value = $scope[key];
        if (value && Array.isArray(value)) {
            value = new WinJS.Binding.List(value);
            bindings.push($scope.$watchCollection(key, function (array) {
                var list = getList();
                if (!list) {
                    return;
                }
                if (!array) {
                    list.length = 0;
                    return;
                }
                var targetIndicies = new ObjectIndexMap();
                for (var i = 0, len = array.length; i < len; i++) {
                    targetIndicies.set(array[i], i);
                }
                var arrayIndex = 0, listIndex = 0;
                while (arrayIndex < array.length) {
                    var arrayData = array[arrayIndex];
                    if (listIndex >= list.length) {
                        list.push(arrayData);
                    } else {
                        while (listIndex < list.length) {
                            var listData = list.getAt(listIndex);
                            if (listData === arrayData) {
                                listIndex++;
                                arrayIndex++;
                                break;
                            } else {
                                if (targetIndicies.has(listData)) {
                                    var targetIndex = targetIndicies.get(listData);
                                    if (targetIndex < arrayIndex) {
                                        // Already in list, remove the duplicate
                                        list.splice(listIndex, 1);
                                    } else {
                                        list.splice(listIndex, 0, arrayData);
                                        arrayIndex++;
                                        listIndex++;
                                        break;
                                    }
                                } else {
                                    // Deleted, remove from list
                                    list.splice(listIndex, 1);
                                }
                            }
                        }
                    }
                }
                // Clip any items which are left over in the tail.
                list.length = array.length;
            }));
        } else {
            bindings.push($scope.$watch(key, function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    getControl()[key] = list($scope, key, getControl, getList, bindings);
                }
            }));
        }

        if (value && value.dataSource) {
            value = value.dataSource;
        }
        return value;
    }

    function proxy($scope, controller, name) {
        Object.defineProperty(controller, name, {
            get: function () { return $scope[name]; },
            set: function (value) { $scope[name] = value; }
        });
    }

    // Refer to https://docs.angularjs.org/api/ng/service/$compile for documentation on what "=?" etc. means
    function BINDING_anchor($scope, key, element, getControl, bindings) {
        bindings.push($scope.$watch(key, function (newValue, oldValue) {
            newValue = typeof newValue === "string" ? select(newValue, element) : newValue;
            oldValue = typeof oldValue === "string" ? select(oldValue, element) : oldValue;
            if (oldValue && oldValue._anchorClick) {
                oldValue.removeEventListener("click", oldValue._anchorClick);
                oldValue._anchorClick = null;
            }
            if (newValue && !newValue._anchorClick) {
                newValue._anchorClick = function () { getControl().show(); };
                newValue.addEventListener("click", newValue._anchorClick);
            }
            return newValue;
        }));
        var anchor = $scope[key];
        return typeof anchor === "string" ? select(anchor, element) : anchor;
    }
    BINDING_anchor.binding = "=?";

    function BINDING_dataSource($scope, key, element, getControl, bindings) {
        function getList() {
            var control = getControl();
            if (control) {
                var dataSource = control[key];
                if (dataSource) {
                    return dataSource.list;
                }
            }
        }
        return list($scope, key, getControl, getList, bindings);
    }
    BINDING_dataSource.binding = "=?";

    function BINDING_event($scope, key, element, getControl, bindings) {
        var lowerName = key.toLowerCase();
        bindings.push($scope.$watch(key, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                getControl()[lowerName] = newValue;
            }
        }));
        var value = $scope[key];
        return function (event) {
            apply($scope, function () { value({ $event: event }); });
        };
    }
    BINDING_event.binding = "&";

    function BINDING_property($scope, key, element, getControl, bindings) {
        bindings.push($scope.$watch(key, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                (getControl() || {})[key] = newValue;
            }
        }));
        return $scope[key];
    }
    BINDING_property.binding = "=?";

    function BINDING_readonly_property($scope, key, element, getControl, bindings) {
        return $scope[key];
    }
    BINDING_readonly_property.binding = "=?";

    function BINDING_selection($scope, key, element, getControl, bindings) {
        bindings.push($scope.$watchCollection(key, function (selection) {
            var value = (getControl() || {})[key];
            if (value) {
                value.set(selection);
            }
        }));
        return $scope[key];
    }
    BINDING_selection.binding = "=?";

    function BINDING_list($scope, key, element, getControl, bindings) {
        function getList() {
            var control = getControl();
            if (control) {
                return control[key];
            }
        }
        return list($scope, key, getControl, getList, bindings);
    }
    BINDING_list.binding = "=?";

    function getScopeForAPI(api) {
        var scopeDefinition = {};
        for (var property in api) {
            scopeDefinition[property] = api[property].binding;
        }
        return scopeDefinition;
    }

    function initializeControlBindings($scope, api, controlRoot, getControl) {
        var controlOptions = {},
            bindings = [];

        for (var property in api) {
            var binding = api[property];
            var propertyValue = binding($scope, property, controlRoot, getControl, bindings);

            // The API defines event names in camel case. WinJS expects event names to be all lowercase. We'll fix the event names here.
            if (binding === BINDING_event) {
                property = property.toLowerCase();
            }

            if (propertyValue !== undefined) {
                // We don't want to try setting read only properties on the WinJS control. BINDING_readonly_property and BINDING_selection are both read only.
                // BINDING_selection may not seem like it's read only at first glance, but that's only because we do extra work in this library to make it
                // seem like it's gettable and settable in Angular.
                if (binding !== BINDING_selection &&
                    binding !== BINDING_readonly_property) {
                    controlOptions[property] = propertyValue;
                }
            }
        }

        return {
            options: controlOptions,
            bindings: bindings
        };
    }

    function initializeControl($scope, element, controlConstructor, api, extraOptions, onDestroyed) {
        // WinJS has a couple naming collisions with actual DOM attributes. When the control we're constructing has
        // these attributes on its DOM element, we'll remove them so the WinJS control can function as appropriate.
        var attributesToRemove = ["checked", "disabled", "id", "title", "type"];
        for (var i = 0, len = attributesToRemove.length; i < len; i++) {
            if (api.hasOwnProperty(attributesToRemove[i])) {
                element.removeAttribute(attributesToRemove[i]);
            }
        }

        var control,
            controlDetails = initializeControlBindings($scope, api, element, function () { return control; });

        if (extraOptions) {
            for (var option in extraOptions) {
                controlDetails.options[option] = extraOptions[option];
            }
        }

        control = new controlConstructor(element, controlDetails.options);
        addDestroyListener($scope, control, controlDetails.bindings, onDestroyed);
        return control;
    }

    // Shared compile/link functions
    function compileTemplate(name) {
        // Directive compile function
        return function (tElement, tAttrs, transclude) {
            var rootElement = document.createElement("div");
            Object.keys(tAttrs).forEach(function (key) {
                if (key[0] !== '$') {
                    rootElement.setAttribute(key, tAttrs[key]);
                }
            });
            var immediateToken;
            // Directive link function
            return function ($scope, elements, attrs, parents) {
                var parent = parents.reduce(function (found, item) { return found || item; });
                parent[name] = function (itemPromise) {
                    // Actual item renderer
                    return WinJS.Promise.as(itemPromise).then(function (item) {
                        var itemScope = $scope.$new();
                        itemScope.item = item;
                        var result = rootElement.cloneNode(false);
                        transclude(itemScope, function (clonedElement) {
                            for (var i = 0, len = clonedElement.length; i < len; i++) {
                                result.appendChild(clonedElement[i]);
                            }
                        });
                        WinJS.Utilities.markDisposable(result, function () {
                            itemScope.$destroy();
                        });
                        immediateToken = immediateToken || setImmediate(function () {
                            immediateToken = null;
                            itemScope.$apply();
                        });
                        return result;
                    })
                };
            };
        };
    }

    // WinJS module definition
    var module = angular.module("winjs", []);

    module.config(['$compileProvider', function ($compileProvider) {
        switch (document.location.protocol.toLowerCase()) {
            // For reference on URI schemes refer to http://msdn.microsoft.com/en-us/library/windows/apps/xaml/jj655406.aspx
            case "ms-appx:":
            case "ms-appx-web:":
                // Whitelist the Windows Runtime URL schemes so Angular does not flag as 'unsafe'.
                var whitelist = /^\s*(https|ms-appx|ms-appx-web|ms-appdata):/i;
                $compileProvider.imgSrcSanitizationWhitelist(whitelist);
                $compileProvider.aHrefSanitizationWhitelist(whitelist);
                break;
        }
    }]);

    module.run(['$rootScope', function ($rootScope) {
        var Scope = Object.getPrototypeOf($rootScope);
        var Scope$eval = Scope.$eval;
        Scope.$eval = function (expr, locals) {
            var that = this;
            if (window.MSApp) {
                return MSApp.execUnsafeLocalFunction(function () {
                    return Scope$eval.call(that, expr, locals);
                });
            } else {
                return Scope$eval.call(that, expr, locals);
            }
        };
    }]);

    // Directives
    exists("AppBar") && module.directive("winAppBar", ['$parse', function ($parse) {
        var api = {
            closedDisplayMode: BINDING_property,
            commands: BINDING_property,
            disabled: BINDING_property,
            hidden: BINDING_readonly_property,
            layout: BINDING_property,
            placement: BINDING_property,
            sticky: BINDING_property,
            onAfterHide: BINDING_event,
            onAfterShow: BINDING_event,
            onBeforeHide: BINDING_event,
            onBeforeShow: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                var control = initializeControl($scope, elements[0], WinJS.UI.AppBar, api);

                // Temporary workaround for hidden property (currently is read only in WinJS, to be resolved soon)
                if (attrs.shown) {
                    var shownProp = $parse(attrs.shown);
                    applyShown(control, shownProp($scope));
                    $scope.$watch(attrs.shown, function (newVal, oldVal, scope) {
                        applyShown(control, shownProp(scope));
                    });
                    control.addEventListener("beforehide", function () {
                        shownProp.assign($scope, false);
                    });
                    control.addEventListener("beforeshow", function () {
                        shownProp.assign($scope, true);
                    });
                }
            }
        };
    }]);

    exists("AppBar") && module.directive("winAppBarCommand", function () {
        var api = {
            disabled: BINDING_property,
            extraClass: BINDING_property,
            firstElementFocus: BINDING_property,
            flyout: BINDING_property,
            hidden: BINDING_property,
            icon: BINDING_property,
            id: BINDING_property,
            label: BINDING_property,
            lastElementFocus: BINDING_property,
            section: BINDING_property,
            selected: BINDING_property,
            tooltip: BINDING_property,
            type: BINDING_property,
            onClick: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<BUTTON ng-transclude='true'></BUTTON>",
            transclude: true,
            link: function ($scope, elements) {
                initializeControl($scope, elements[0], WinJS.UI.Command, api);
            }
        };
    });

    exists("AppBar") && module.directive("winAppBarSeparator", function () {
        var api = {
            disabled: BINDING_property,
            extraClass: BINDING_property,
            firstElementFocus: BINDING_property,
            flyout: BINDING_property,
            hidden: BINDING_property,
            icon: BINDING_property,
            id: BINDING_property,
            label: BINDING_property,
            lastElementFocus: BINDING_property,
            section: BINDING_property,
            selected: BINDING_property,
            tooltip: BINDING_property,
            type: BINDING_property,
            onClick: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<HR ng-transclude='true'></HR>",
            transclude: true,
            link: function ($scope, elements) {
                initializeControl($scope, elements[0], WinJS.UI.Command, api, { type: "separator" });
            }
        };
    });

    exists("BackButton") && module.directive("winBackButton", function () {
        return {
            restrict: "E",
            replace: true,
            template: "<BUTTON></BUTTON>",
            link: function ($scope, elements) {
                var control = new WinJS.UI.BackButton(elements[0]);
            }
        };
    });

    exists("CellSpanningLayout") && module.directive("winCellSpanningLayout", function () {
        var api = {
            groupHeaderPosition: BINDING_property,
            groupInfo: BINDING_property,
            itemInfo: BINDING_property,
            maximumRowsOrColumns: BINDING_property,
            orientation: BINDING_property
        };
        return {
            require: "^winListView",
            restrict: "E",
            replace: true,
            template: "",
            scope: getScopeForAPI(api),
            link: function ($scope, elements, attrs, listView) {
                var layout;
                var controlBindings = initializeControlBindings($scope, api, null, function () { return layout; })
                layout = listView.layout = new WinJS.UI.CellSpanningLayout(controlBindings.options);
                addDestroyListener($scope, layout, controlBindings.bindings);
            }
        };
    });

    exists("ContentDialog") && module.directive("winContentDialog", function () {
        var api = {
            hidden: BINDING_readonly_property,
            primaryCommandText: BINDING_property,
            primaryCommandDisabled: BINDING_property,
            secondaryCommandText: BINDING_property,
            secondaryCommandDisabled: BINDING_property,
            title: BINDING_property,
            onAfterHide: BINDING_event,
            onAfterShow: BINDING_event,
            onBeforeHide: BINDING_event,
            onBeforeShow: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                initializeControl($scope, elements[0], WinJS.UI.ContentDialog, api);
            }
        };
    });

    exists("NavBarContainer") && module.directive("winCommandTemplate", function () {
        return {
            require: ["^?winNavBarContainer"],
            restrict: "E",
            replace: true,
            transclude: true,
            compile: compileTemplate("template")
        };
    });

    exists("DatePicker") && module.directive("winDatePicker", function () {
        var api = {
            calendar: BINDING_property,
            current: BINDING_property,
            datePattern: BINDING_property,
            disabled: BINDING_property,
            maxYear: BINDING_property,
            minYear: BINDING_property,
            monthPattern: BINDING_property,
            yearPattern: BINDING_property,
            onChange: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV></DIV>",
            link: function ($scope, elements) {
                var control = initializeControl($scope, elements[0], WinJS.UI.DatePicker, api);

                control.addEventListener("change", function () {
                    apply($scope, function () {
                        $scope["current"] = control["current"];
                    });
                });
            }
        };
    });

    exists("FlipView") && module.directive("winFlipView", function () {
        var api = {
            currentPage: BINDING_property,
            itemDataSource: BINDING_dataSource,
            itemSpacing: BINDING_property,
            itemTemplate: BINDING_property,
            orientation: BINDING_property,
            onDataSourceCountChanged: BINDING_event,
            onPageCompleted: BINDING_event,
            onPageSelected: BINDING_event,
            onPageVisibilityChanged: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                proxy($scope, this, "itemTemplate");
            }],
            link: function ($scope, elements, attrs) {
                var control = initializeControl($scope, elements[0], WinJS.UI.FlipView, api);

                control.addEventListener("pageselected", function () {
                    apply($scope, function () {
                        $scope["currentPage"] = control["currentPage"];
                    });
                });
            }
        };
    });

    exists("Flyout") && module.directive("winFlyout", ['$parse', function ($parse) {
        var api = {
            alignment: BINDING_property,
            anchor: BINDING_anchor,
            placement: BINDING_property,
            onAfterHide: BINDING_event,
            onAfterShow: BINDING_event,
            onBeforeHide: BINDING_event,
            onBeforeShow: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                var control = initializeControl($scope, elements[0], WinJS.UI.Flyout, api);

                // Temporary workaround for hidden property (currently is read only in WinJS, to be resolved soon)
                if (attrs.shown) {
                    var shownProp = $parse(attrs.shown);
                    applyShown(control, shownProp($scope));
                    $scope.$watch(attrs.shown, function (newVal, oldVal, scope) {
                        applyShown(control, shownProp(scope));
                    });
                    control.addEventListener("beforehide", function () {
                        shownProp.assign($scope, false);
                    });
                    control.addEventListener("beforeshow", function () {
                        shownProp.assign($scope, true);
                    });
                }
            }
        };
    }]);

    exists("GridLayout") && module.directive("winGridLayout", function () {
        var api = {
            groupHeaderPosition: BINDING_property,
            maximumRowsOrColumns: BINDING_property,
            orientation: BINDING_property
        };
        return {
            require: "^winListView",
            restrict: "E",
            replace: true,
            template: "",
            scope: getScopeForAPI(api),
            link: function ($scope, elements, attrs, listView) {
                var layout;
                var controlBindings = initializeControlBindings($scope, api, null, function () { return layout; })
                layout = listView.layout = new WinJS.UI.GridLayout(controlBindings.options);
                addDestroyListener($scope, layout, controlBindings.bindings);
                return layout;
            }
        };
    });

    exists("ListView") && module.directive("winGroupHeaderTemplate", function () {
        return {
            require: ["^?winListView"],
            restrict: "E",
            replace: true,
            transclude: true,
            compile: compileTemplate("groupHeaderTemplate")
        };
    });

    exists("Hub") && module.directive("winHub", function () {
        var api = {
            headerTemplate: BINDING_property,
            indexOfFirstVisible: BINDING_readonly_property,
            indexOfLastVisible: BINDING_readonly_property,
            loadingState: BINDING_readonly_property,
            orientation: BINDING_property,
            scrollPosition: BINDING_property,
            sectionOnScreen: BINDING_property,
            sections: BINDING_list,
            onContentAnimating: BINDING_event,
            onHeaderInvoked: BINDING_event,
            onLoadingStateChanged: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV><DIV class='placeholder-holder' style='display:none;' ng-transclude='true'></DIV></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                // The children will (may) call back before the Hub is constructed so we queue up the calls to
                //  addSection and removeSection and execute them later.
                $scope.deferredCalls = [];
                function deferred(wrapped) {
                    return function () {
                        var f = Function.prototype.apply.bind(wrapped, null, arguments);
                        if ($scope.deferredCalls) {
                            $scope.deferredCalls.push(f);
                        } else {
                            f();
                        }
                    }
                }
                proxy($scope, this, "headerTemplate");
                this.addSection = deferred(function (section, index) {
                    $scope.addSection(section, index);
                });
                this.removeSection = deferred(function (section) {
                    $scope.removeSection(section);
                });
            }],
            link: function ($scope, elements) {
                var element = elements[0];
                // NOTE: the Hub will complain if this is in the DOM when it is constructed so we temporarially remove it.
                //       It must be in the DOM when repeaters run and hosted under the hub.
                var sectionsHost = element.firstElementChild;
                sectionsHost.parentNode.removeChild(sectionsHost);
                var control = initializeControl($scope, element, WinJS.UI.Hub, api);

                element.appendChild(sectionsHost);
                $scope.addSection = function (section, index) {
                    control.sections.splice(index, 0, section);
                };
                $scope.removeSection = function (section) {
                    control.sections.splice(control.sections.indexOf(section), 1);
                };
                $scope.deferredCalls.forEach(function (f) { f(); });
                $scope.deferredCalls = null;
                control.addEventListener("loadingstatechanged", function () {
                    apply($scope, function () {
                        $scope["loadingState"] = control["loadingState"];
                    });
                });
            }
        };
    });

    exists("HubSection") && module.directive("winHubSection", function () {
        var api = {
            header: BINDING_property,
            isHeaderStatic: BINDING_property
        };
        return {
            restrict: "E",
            require: "^winHub",
            replace: true,
            scope: getScopeForAPI(api),
            // NOTE: there is an arbitrary wrapper here .placeholder which is used in scenarios where developers stamp
            //       out hub sections using ng-repeat. In order to support things like that we need to infer the order
            //       that the sections are in relative to static sections so we manage them in a .placeholder-holder
            //       element (see winHub directive above), the placeholder always lives in that thing. The content
            //       (meaning the real hub section) ends up being owned by the Hub.
            template: "<DIV class='placeholder'><DIV ng-transclude='true'></DIV></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs, hub) {
                var placeholder = elements[0];
                var element = placeholder.firstElementChild;
                var control = initializeControl($scope, element, WinJS.UI.HubSection, api, {}, function () {
                    hub.removeSection(control);
                });

                hub.addSection(control, Array.prototype.indexOf.call(placeholder.parentNode.children, placeholder));
            }
        };
    });

    exists("ItemContainer") && module.directive("winItemContainer", function () {
        var api = {
            draggable: BINDING_property,
            selected: BINDING_property,
            selectionDisabled: BINDING_property,
            tapBehavior: BINDING_property,
            onInvoked: BINDING_event,
            onSelectionChanged: BINDING_event,
            onSelectionChanging: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements) {
                var control = initializeControl($scope, elements[0], WinJS.UI.ItemContainer, api);

                control.addEventListener("selectionchanged", function () {
                    apply($scope, function () {
                        $scope["selected"] = control["selected"];
                    });
                });
            }
        };
    });

    (exists("ListView") || exists("FlipView")) && module.directive("winItemTemplate", function () {
        return {
            require: ["^?winListView", "^?winFlipView"],
            restrict: "E",
            replace: true,
            transclude: true,
            compile: compileTemplate("itemTemplate")
        };
    });

    exists("ListLayout") && module.directive("winListLayout", function () {
        var api = {
            groupHeaderPosition: BINDING_property,
            orientation: BINDING_property
        };
        return {
            require: "^winListView",
            restrict: "E",
            replace: true,
            template: "",
            scope: getScopeForAPI(api),
            link: function ($scope, elements, attrs, listView) {
                var layout;
                var controlBindings = initializeControlBindings($scope, api, null, function () { return layout; })
                layout = listView.layout = new WinJS.UI.ListLayout(controlBindings.options);
                addDestroyListener($scope, layout, controlBindings.bindings);
            }
        };
    });

    exists("ListView") && module.directive("winListView", function () {
        var api = {
            currentItem: BINDING_property,
            groupDataSource: BINDING_dataSource,
            groupHeaderTemplate: BINDING_property,
            groupHeaderTapBehavior: BINDING_property,
            indexOfFirstVisible: BINDING_property,
            indexOfLastVisible: BINDING_property,
            itemDataSource: BINDING_dataSource,
            itemsDraggable: BINDING_property,
            itemsReorderable: BINDING_property,
            itemTemplate: BINDING_property,
            layout: BINDING_property,
            maxDeferredItemCleanup: BINDING_property,
            scrollPosition: BINDING_property,
            selection: BINDING_selection,
            selectionMode: BINDING_property,
            tapBehavior: BINDING_property,
            onContentAnimating: BINDING_event,
            onGroupHeaderInvoked: BINDING_event,
            onItemDragStart: BINDING_event,
            onItemDragEnter: BINDING_event,
            onItemDragBetween: BINDING_event,
            onItemDragLeave: BINDING_event,
            onItemDragChanged: BINDING_event,
            onItemDragDrop: BINDING_event,
            onItemInvoked: BINDING_event,
            onKeyboardNavigating: BINDING_event,
            onLoadingStateChanged: BINDING_event,
            onSelectionChanged: BINDING_event,
            onSelectionChanging: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                proxy($scope, this, "itemTemplate");
                proxy($scope, this, "groupHeaderTemplate");
                proxy($scope, this, "layout");
                proxy($scope, this, "selection");
            }],
            link: function ($scope, elements, attrs) {
                var control = initializeControl($scope, elements[0], WinJS.UI.ListView, api);

                control.addEventListener("selectionchanged", function () {
                    var value = $scope["selection"];
                    if (value) {
                        apply($scope, function () {
                            var current = control.selection.getIndices();
                            value.length = 0;
                            current.forEach(function (item) {
                                value.push(item);
                            });
                        });
                    }
                });
            }
        };
    });

    exists("Menu") && module.directive("winMenu", ['$parse', function ($parse) {
        var api = {
            alignment: BINDING_property,
            anchor: BINDING_anchor,
            commands: BINDING_property,
            disabled: BINDING_property,
            hidden: BINDING_property,
            placement: BINDING_property,
            onAfterHide: BINDING_event,
            onAfterShow: BINDING_event,
            onBeforeHide: BINDING_event,
            onBeforeShow: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                var control = initializeControl($scope, elements[0], WinJS.UI.Menu, api);

                // Temporary workaround for hidden property (currently is read only in WinJS, to be resolved soon)
                if (attrs.shown) {
                    var shownProp = $parse(attrs.shown);
                    applyShown(control, shownProp($scope));
                    $scope.$watch(attrs.shown, function (newVal, oldVal, scope) {
                        applyShown(control, shownProp(scope));
                    });
                    control.addEventListener("beforehide", function () {
                        shownProp.assign($scope, false);
                    });
                    control.addEventListener("beforeshow", function () {
                        shownProp.assign($scope, true);
                    });
                }
            }
        };
    }]);

    exists("MenuCommand") && module.directive("winMenuCommand", function () {
        var api = {
            disabled: BINDING_property,
            extraClass: BINDING_property,
            flyout: BINDING_property,
            hidden: BINDING_property,
            id: BINDING_property,
            label: BINDING_property,
            section: BINDING_property,
            selected: BINDING_property,
            type: BINDING_property,
            onClick: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<BUTTON></BUTTON>",
            link: function ($scope, elements) {
                initializeControl($scope, elements[0], WinJS.UI.MenuCommand, api);
            }
        };
    });

    exists("NavBar") && module.directive("winNavBar", ['$parse', function ($parse) {
        var api = {
            closedDisplayMode: BINDING_property,
            disabled: BINDING_property,
            hidden: BINDING_property,
            placement: BINDING_property,
            sticky: BINDING_property,
            onAfterHide: BINDING_event,
            onAfterShow: BINDING_event,
            onBeforeHide: BINDING_event,
            onBeforeShow: BINDING_event,
            onChildrenProcessed: BINDING_event
        };

        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                var control = initializeControl($scope, elements[0], WinJS.UI.NavBar, api);

                // Temporary workaround for hidden property (currently is read only in WinJS, to be resolved soon)
                if (attrs.shown) {
                    var shownProp = $parse(attrs.shown);
                    applyShown(control, shownProp($scope));
                    $scope.$watch(attrs.shown, function (newVal, oldVal, scope) {
                        applyShown(control, shownProp(scope));
                    });
                    control.addEventListener("beforehide", function () {
                        shownProp.assign($scope, false);
                    });
                    control.addEventListener("beforeshow", function () {
                        shownProp.assign($scope, true);
                    });
                }
            }
        };

    }]);

    exists("NavBarCommand") && module.directive("winNavBarCommand", function () {
        var api = {
            icon: BINDING_property,
            label: BINDING_property,
            location: BINDING_property,
            splitButton: BINDING_property,
            splitOpened: BINDING_property,
            state: BINDING_property,
            tooltip: BINDING_property
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements) {
                initializeControl($scope, elements[0], WinJS.UI.NavBarCommand, api);
            }
        };
    });

    exists("NavBarContainer") && module.directive("winNavBarContainer", function () {
        var api = {
            data: BINDING_list,
            fixedSize: BINDING_property,
            layout: BINDING_property,
            template: BINDING_property,
            maxRows: BINDING_property,
            onInvoked: BINDING_event,
            onSplitToggle: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                proxy($scope, this, "template");
            }],
            link: function ($scope, elements) {
                initializeControl($scope, elements[0], WinJS.UI.NavBarContainer, api);
            }
        };
    });

    exists("Pivot") && module.directive("winPivot", function () {
        var api = {
            items: BINDING_list,
            locked: BINDING_property,
            selectedIndex: BINDING_property,
            selectedItem: BINDING_property,
            title: BINDING_property,
            onItemAnimationEnd: BINDING_event,
            onItemAnimationStart: BINDING_event,
            onSelectionChanged: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV><DIV class='placeholder-holder' style='display:none;' ng-transclude='true'></DIV></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                // The children will (may) call back before the Pivot is constructed so we queue up the calls to
                // addItem and removeItem and execute them later.
                $scope.deferredCalls = [];
                function deferred(wrapped) {
                    return function () {
                        var f = Function.prototype.apply.bind(wrapped, null, arguments);
                        if ($scope.deferredCalls) {
                            $scope.deferredCalls.push(f);
                        } else {
                            f();
                        }
                    }
                }
                this.addItem = deferred(function (item, index) {
                    $scope.addItem(item, index);
                });
                this.removeItem = deferred(function (item) {
                    $scope.removeItem(item);
                });
            }],
            link: function ($scope, elements) {
                var element = elements[0];
                // NOTE: the Pivot will complain if this is in the DOM when it is constructed so we temporarially remove it.
                //       It must be in the DOM when repeaters run and hosted under the pivot.
                var itemsHost = element.firstElementChild;
                itemsHost.parentNode.removeChild(itemsHost);
                var control = initializeControl($scope, element, WinJS.UI.Pivot, api);

                element.appendChild(itemsHost);
                $scope.addItem = function (item, index) {
                    control.items.splice(index, 0, item);
                };
                $scope.removeItem = function (item) {
                    control.items.splice(control.items.indexOf(item), 1);
                };
                $scope.deferredCalls.forEach(function (f) { f(); });
                $scope.deferredCalls = null;
            }
        };
    });

    exists("PivotItem") && module.directive("winPivotItem", function () {
        var api = {
            header: BINDING_property
        };
        return {
            restrict: "E",
            require: "^winPivot",
            replace: true,
            scope: getScopeForAPI(api),
            // NOTE: there is an arbitrary wrapper here .placeholder which is used in scenarios where developers stamp
            //       out pivot sections using ng-repeat. In order to support things like that we need to infer the order
            //       that the sections are in relative to static sections so we manage them in a .placeholder-holder
            //       element (see winPivot directive above), the placeholder always lives in that thing. The content
            //       (meaning the real pivot section) ends up being owned by the Hub.
            template: "<DIV class='placeholder'><DIV ng-transclude='true'></DIV></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs, pivot) {
                var placeholder = elements[0],
                    element = placeholder.firstElementChild,
                    control = initializeControl($scope, element, WinJS.UI.PivotItem, api, {}, function () {
                        pivot.removeItem(control);
                    });

                pivot.addItem(control, Array.prototype.indexOf.call(placeholder.parentNode.children, placeholder));
            }
        };
    });

    exists("Rating") && module.directive("winRating", function () {
        var api = {
            averageRating: BINDING_property,
            disabled: BINDING_property,
            enableClear: BINDING_property,
            maxRating: BINDING_property,
            tooltipStrings: BINDING_property,
            userRating: BINDING_property,
            onCancel: BINDING_event,
            onChange: BINDING_event,
            onPreviewChange: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV></DIV>",
            link: function ($scope, elements) {
                var control = initializeControl($scope, elements[0], WinJS.UI.Rating, api);

                control.addEventListener("change", function () {
                    apply($scope, function () {
                        $scope["userRating"] = control["userRating"];
                    });
                });
            }
        };
    });

    exists("SearchBox") && module.directive("winSearchBox", function () {
        var api = {
            chooseSuggestionOnEnter: BINDING_property,
            disabled: BINDING_property,
            focusOnKeyboardInput: BINDING_property,
            placeholderText: BINDING_property,
            queryText: BINDING_property,
            searchHistoryContext: BINDING_property,
            searchHistoryDisabled: BINDING_property,
            onQueryChanged: BINDING_event,
            onQuerySubmitted: BINDING_event,
            onReceivingFocusOnKeyboardInput: BINDING_event,
            onResultSuggestionChosen: BINDING_event,
            onSuggestionsRequested: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV></DIV>",
            link: function ($scope, elements, attrs) {
                var control = initializeControl($scope, elements[0], WinJS.UI.SearchBox, api);

                control.addEventListener("querychanged", function () {
                    apply($scope, function () {
                        $scope["queryText"] = control["queryText"];
                    });
                });
            }
        };
    });

    exists("SectionHeaderTemplate") && module.directive("winSectionHeaderTemplate", function () {
        return {
            require: ["^?winHub"],
            restrict: "E",
            replace: true,
            transclude: true,
            compile: compileTemplate("headerTemplate")
        };
    });

    exists("SemanticZoom") && module.directive("winSemanticZoom", function () {
        var api = {
            enableButton: BINDING_property,
            locked: BINDING_property,
            zoomedOut: BINDING_property,
            zoomFactor: BINDING_property,
            onZoomChanged: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements) {
                initializeControl($scope, elements[0], WinJS.UI.SemanticZoom, api);

            }
        };
    });

    exists("SplitView") && module.directive("winSplitView", ['$parse', function ($parse) {
        var api = {
            hiddenDisplayMode: BINDING_property,
            shownDisplayMode: BINDING_property,
            panePlacement: BINDING_property,
            paneHidden: BINDING_property,
            onBeforeShow: BINDING_event,
            onAfterShow: BINDING_event,
            onBeforeHide: BINDING_event,
            onAfterHide: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                var element = elements[0],
                    paneElement,
                    contentElements = [];
                var children = element.children;
                while (element.firstElementChild) {
                    var currentElement = element.firstElementChild;
                    element.removeChild(currentElement);
                    if (currentElement.classList.contains("win-split-view-pane")) {
                        currentElement.classList.remove("win-split-view-pane");
                        if (!paneElement) {
                            paneElement = currentElement;
                        }
                    } else if (currentElement.classList.contains("win-split-view-content")) {
                        currentElement.classList.remove("win-split-view-content");
                        contentElements.push(currentElement);
                    }
                }

                var control = initializeControl($scope, element, WinJS.UI.SplitView, api);

                if (paneElement) {
                    control.paneElement.appendChild(paneElement);
                }
                for (var i = 0; i < contentElements.length; i++) {
                    control.contentElement.appendChild(contentElements[i]);
                }
                if (attrs.paneHidden) {
                    var hiddenProp = $parse(attrs.paneHidden);
                    control.addEventListener("beforehide", function () {
                        hiddenProp.assign($scope, true);
                    });
                    control.addEventListener("beforeshow", function () {
                        hiddenProp.assign($scope, false);
                    });
                }
            }
        };
    }]);

    exists("SplitView") && module.directive("winSplitViewPane", function () {
        return {
            require: "^winSplitView",
            restrict: "E",
            replace: true,
            transclude: true,
            template: "<div ng-transclude='true' class='win-split-view-pane'></div>"
        };
    });

    exists("SplitView") && module.directive("winSplitViewContent", function () {
        return {
            require: "^winSplitView",
            restrict: "E",
            replace: true,
            transclude: true,
            template: "<div ng-transclude='true' class='win-split-view-content'></div>"
        };
    });

    exists("TimePicker") && module.directive("winTimePicker", function () {
        var api = {
            clock: BINDING_property,
            current: BINDING_property,
            disabled: BINDING_property,
            hourPattern: BINDING_property,
            minuteIncrement: BINDING_property,
            minutePattern: BINDING_property,
            periodPattern: BINDING_property,
            onChange: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV></DIV>",
            link: function ($scope, elements) {
                var control = initializeControl($scope, elements[0], WinJS.UI.TimePicker, api);

                control.addEventListener("change", function () {
                    apply($scope, function () {
                        $scope["current"] = control["current"];
                    });
                });
            }
        };
    });

    exists("ToggleSwitch") && module.directive("winToggleSwitch", function () {
        var api = {
            checked: BINDING_property,
            disabled: BINDING_property,
            labelOff: BINDING_property,
            labelOn: BINDING_property,
            title: BINDING_property,
            onChange: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV></DIV>",
            link: function ($scope, elements) {
                var control = initializeControl($scope, elements[0], WinJS.UI.ToggleSwitch, api);

                control.addEventListener("change", function () {
                    apply($scope, function () {
                        $scope["checked"] = control["checked"];
                    });
                });
            }
        };
    });

    exists("ToolBar") && module.directive("winToolBar", function () {
        var api = {
            shownDisplayMode: BINDING_property,
            extraClass: BINDING_property,
            data: BINDING_list
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            link: function ($scope, elements, attrs) {
                initializeControl($scope, elements[0], WinJS.UI.ToolBar, api);
            }
        };
    });

    exists("ToolBar") && module.directive("winToolBarCommand", function () {
        var api = {
            disabled: BINDING_property,
            extraClass: BINDING_property,
            firstElementFocus: BINDING_property,
            flyout: BINDING_property,
            hidden: BINDING_property,
            icon: BINDING_property,
            id: BINDING_property,
            label: BINDING_property,
            lastElementFocus: BINDING_property,
            section: BINDING_property,
            selected: BINDING_property,
            tooltip: BINDING_property,
            type: BINDING_property,
            onClick: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<BUTTON ng-transclude='true'></BUTTON>",
            transclude: true,
            link: function ($scope, elements) {
                initializeControl($scope, elements[0], WinJS.UI.Command, api);
            }
        };
    });

    exists("Tooltip") && module.directive("winTooltip", function () {
        var api = {
            contentElement: BINDING_property,
            extraClass: BINDING_property,
            innerHTML: BINDING_property,
            infotip: BINDING_property,
            placement: BINDING_property,
            onBeforeClose: BINDING_event,
            onBeforeOpen: BINDING_event,
            onClosed: BINDING_event,
            onOpened: BINDING_event
        };
        return {
            restrict: "E",
            replace: true,
            scope: getScopeForAPI(api),
            template: "<DIV ng-transclude='true'></DIV>",
            transclude: true,
            controller: ['$scope', function ($scope) {
                proxy($scope, this, "contentElement");
            }],
            link: function ($scope, elements, attrs) {
                initializeControl($scope, elements[0], WinJS.UI.Tooltip, api);
            }
        };
    });

    // Tooltop is a little odd because you have to be able to specify both the element
    // which has a tooltip (the content) and the tooltip's content itself. We specify
    // a special directive <win-tooltip-content /> which represents the latter.
    exists("Tooltip") && module.directive("winTooltipContent", function () {
        return {
            require: "^winTooltip",
            restrict: "E",
            replace: true,
            transclude: true,
            template: "\
<div style='display:none'>\
  <div ng-transclude='true'></div>\
</div>",
            link: function ($scope, elements, attrs, tooltip) {
                tooltip.contentElement = elements[0].firstElementChild;
            }
        };
    });

    // Surface winControl property as win-control directive. 
    // Keep priority set to a higher value than others (default is 0) as 'link' ie. postLink functions run highest priority last.
    module.directive("winControl", ['$parse', function ($parse) {
        return {
            restrict: "A",
            priority: 1,
            link: function ($scope, element, attrs) {
                if (attrs.winControl) {
                    $parse(attrs.winControl).assign($scope, element[0].winControl);
                }
            }
        };
    }]);

}(this));
