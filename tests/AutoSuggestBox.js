// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("AutoSuggestBox control directive tests", function () {
    var scope,
        compile;

    beforeEach(angular.mock.module("winjs"));
    beforeEach(angular.mock.inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
    }));

    function initControl(markup) {
        var element = angular.element(markup)[0];
        document.body.appendChild(element);
        var compiledControl = compile(element)(scope)[0];
        scope.$digest();
        return compiledControl;
    }

    it("should initialize a simple autosuggestbox", function () {
        var compiledControl = initControl("<win-auto-suggest-box></win-auto-suggest-box>");
        
        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.SearchBox);
        expect(compiledControl.className).toContain("win-autosuggestbox");
    });

    it("should use the chooseSuggestionOnEnter attribute", function () {
        var compiledControl = initControl("<win-auto-suggest-box choose-suggestion-on-enter='true'></win-auto-suggest-box>");
        expect(compiledControl.winControl.chooseSuggestionOnEnter).toBeTruthy();
    });
	
    it("should use the placeholderText attribute", function () {
        var compiledControl = initControl("<win-auto-suggest-box placeholder-text=\"'Some Placeholder Text'\"></win-auto-suggest-box>");
        expect(compiledControl.winControl.placeholderText).toEqual("Some Placeholder Text");
    });

    it("should use the queryText attribute", function () {
        var compiledControl = initControl("<win-auto-suggest-box query-text=\"'Some Query Text'\"></win-auto-suggest-box>");
        expect(compiledControl.winControl.queryText).toEqual("Some Query Text");
    });

    it("should use the searchHistoryContext attribute", function () {
        var compiledControl = initControl("<win-auto-suggest-box search-history-context=\"'searchContext'\"></win-auto-suggest-box>");
        expect(compiledControl.winControl.searchHistoryContext).toEqual("searchContext");
    });

    it("should use the searchHistoryDisabled attribute", function () {
        var compiledControl = initControl("<win-auto-suggest-box search-history-disabled='true'></win-auto-suggest-box>");
        expect(compiledControl.winControl.searchHistoryDisabled).toBeTruthy();
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-auto-suggest-box");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
