// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("AppBarCommand control directive tests", function () {
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

    it("should use initialize an AppBar containing two child AppBarCommands", function () {
        var compiledControl = initControl("<win-app-bar>" +
                                              "<win-app-bar-command></win-app-bar-command>" +
                                              "<win-app-bar-command></win-app-bar-command>" +
                                          "</win-app-bar>");

        var winControl = compiledControl.winControl;
        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.AppBar);
        expect(compiledControl.className).toContain("win-appbar");
        expect(compiledControl.querySelectorAll(".win-command").length).toEqual(2);
    });

    it("should use the id attribute on AppBarCommands", function () {
        var compiledControl = initControl("<win-app-bar>" +
                                              "<win-app-bar-command id=\"'command1'\"></win-app-bar-command>" +
                                              "<win-app-bar-command id=\"'command2'\"></win-app-bar-command>" +
                                          "</win-app-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].id).toEqual("command1");
        expect(commands[1].id).toEqual("command2");
    });

    it("should use the label attribute on AppBarCommands", function () {
        var compiledControl = initControl("<win-app-bar>" +
                                              "<win-app-bar-command label=\"'command1'\"></win-app-bar-command>" +
                                              "<win-app-bar-command label=\"'command2'\"></win-app-bar-command>" +
                                          "</win-app-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].querySelector(".win-label").innerHTML).toEqual("command1");
        expect(commands[1].querySelector(".win-label").innerHTML).toEqual("command2");
    });

    it("should use the disabled attribute on AppBarCommands", function () {
        var compiledControl = initControl("<win-app-bar>" +
                                              "<win-app-bar-command disabled='true'></win-app-bar-command>" +
                                              "<win-app-bar-command disabled='false'></win-app-bar-command>" +
                                          "</win-app-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].winControl.disabled).toBeTruthy();
        expect(commands[1].winControl.disabled).toBeFalsy();
    });

    it("should use the extraClass attribute on AppBarCommands", function () {
        var compiledControl = initControl("<win-app-bar>" +
                                              "<win-app-bar-command extra-class=\"'extraClass1'\"></win-app-bar-command>" +
                                          "</win-app-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].className).toContain("extraClass1");
    });

    it("should use the section attribute on AppBarCommands", function () {
        var compiledControl = initControl("<win-app-bar>" +
                                              "<win-app-bar-command section=\"'global'\"></win-app-bar-command>" +
                                              "<win-app-bar-command section=\"'selection'\"></win-app-bar-command>" +
                                          "</win-app-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].winControl.section).toEqual("global");
        expect(commands[1].winControl.section).toEqual("selection");
    });

    it("should use the hidden attribute on AppBarCommands", function () {
        var compiledControl = initControl("<win-app-bar>" +
                                              "<win-app-bar-command hidden='true'></win-app-bar-command>" +
                                              "<win-app-bar-command hidden='false'></win-app-bar-command>" +
                                          "</win-app-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].style.display).toEqual("none");
        expect(commands[1].style.display).toNotEqual("none");
    });

    it("should use the icon attribute on AppBarCommands", function () {
        var compiledControl = initControl("<win-app-bar>" +
                                              "<win-app-bar-command icon=\"'add'\"></win-app-bar-command>" +
                                          "</win-app-bar>");

        var commandImage = compiledControl.querySelector(".win-commandimage");
        expect(escape(commandImage.innerHTML)).toEqual("%uE109");
    });

    // TODO: Write tests for type attribute, firstElementFocus, lastElementFocus, flyout, selected (must be type=toggle), separator, and tooltip once type attribute issues are resolved
    afterEach(function () {
        var controls = document.querySelectorAll(".win-appbar");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
