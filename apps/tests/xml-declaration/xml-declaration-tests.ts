﻿import TKUnit = require("../TKUnit");
import view = require("ui/core/view");
import builder = require("ui/builder");
import page = require("ui/page");
import switchModule = require("ui/switch");
import textFieldModule = require("ui/text-field");
import gridLayoutModule = require("ui/layouts/grid-layout");
import absoluteLayoutModule = require("ui/layouts/absolute-layout");
import types = require("utils/types");
import fs = require("file-system");
import fileSystemAccess = require("file-system/file-system-access");
import observable = require("data/observable");
import stackLayoutModule = require("ui/layouts/stack-layout");
import labelModule = require("ui/label");
import myCustomControlWithoutXml = require("./mymodule/MyControl");
import listViewModule = require("ui/list-view");
import helper = require("../ui/helper");
import viewModule = require("ui/core/view");

export function test_load_IsDefined() {
    TKUnit.assert(types.isFunction(builder.load), "ui/builder should have load method!");
};

export function test_parse_IsDefined() {
    TKUnit.assert(types.isFunction(builder.parse), "ui/builder should have parse method!");
};

export function test_load_ShouldNotCrashWithInvalidFileName() {
    var v = builder.load(fs.path.join(__dirname, "mainPage1.xml"));

    TKUnit.assert(types.isUndefined(v), "Expected result: undefined; Actual result: " + v + ";");
};

export function test_load_ShouldNotCrashWithoutExports() {
    var v = builder.load(fs.path.join(__dirname, "mainPage.xml"));

    TKUnit.assert(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
};

export function test_parse_ShouldNotCrashWithoutExports() {
    var fileAccess = new fileSystemAccess.FileSystemAccess();

    var v: view.View;
    fileAccess.readText(fs.path.join(__dirname, "mainPage.xml"), r => {
        v = builder.parse(r);
    });

    TKUnit.assert(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
};

export function test_parse_ShouldNotCrashWithInvalidXml() {
    var fileAccess = new fileSystemAccess.FileSystemAccess();

    var v: view.View;
    fileAccess.readText("<Page loaded='myLoaded'></Pa", r => {
        v = builder.parse(r);
    });

    TKUnit.assert(types.isUndefined(v), "Expected result: undefined; Actual result: " + v + ";");
};

export function test_parse_ShouldFindEventHandlersInExports() {
    var loaded;
    var page = builder.parse("<Page loaded='myLoaded'></Page>", {
        myLoaded: args => {
            loaded = true;
        }
    });
    page._emit("loaded");

    TKUnit.assert(loaded, "Parse should find event handlers in exports.");
};

export function test_parse_ShouldSetGridAttachedProperties() {
    var p = <page.Page>builder.parse("<Page><GridLayout><Label row='1' col='2' rowSpan='3' colSpan='4' /></GridLayout></Page>");
    var grid = <gridLayoutModule.GridLayout>p.content;
    var child = grid.getChildAt(0);

    var col = gridLayoutModule.GridLayout.getColumn(child);
    TKUnit.assert(col === 2, "Expected result for grid column: 2; Actual result: " + col + ";");

    var row = gridLayoutModule.GridLayout.getRow(child);
    TKUnit.assert(row === 1, "Expected result for grid row: 1; Actual result: " + row + ";");

    var colSpan = gridLayoutModule.GridLayout.getColumnSpan(child);
    TKUnit.assert(colSpan === 4, "Expected result for grid column span: 4; Actual result: " + colSpan + ";");

    var rowSpan = gridLayoutModule.GridLayout.getRowSpan(child);
    TKUnit.assert(rowSpan === 3, "Expected result for grid row span: 3; Actual result: " + rowSpan + ";");
};

export function test_parse_ShouldSetCanvasAttachedProperties() {
    var p = <page.Page>builder.parse("<Page><AbsoluteLayout><Label left='1' top='2' right='3' bottom='4' /></AbsoluteLayout></Page>");
    var grid = <gridLayoutModule.GridLayout>p.content;
    var child = grid.getChildAt(0);

    var left = absoluteLayoutModule.AbsoluteLayout.getLeft(child);
    TKUnit.assert(left === 1, "Expected result for canvas left: 1; Actual result: " + left + ";");

    var top = absoluteLayoutModule.AbsoluteLayout.getTop(child);
    TKUnit.assert(top === 2, "Expected result for canvas top: 2; Actual result: " + top + ";");
};

export function test_parse_ShouldParseNumberProperties() {
    var p = <page.Page>builder.parse("<Page width='100' />");

    TKUnit.assert(p.width === 100, "Expected result: 100; Actual result: " + p.width + "; type: " + typeof (p.width));
};

export function test_parse_ShouldParseBooleanProperties() {
    var p = <page.Page>builder.parse("<Page><Switch checked='true' /></Page>");
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.checked === true, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBooleanPropertiesIgnoreCase() {
    var p = <page.Page>builder.parse("<Page><Switch checked='False' /></Page>");
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.checked === false, "Expected result: false; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBooleanPropertiesIgnoreCaseInverted() {
    var p = <page.Page>builder.parse("<Page><TextField editable='False' /></Page>");
    var tf = <textFieldModule.TextField>p.content;

    TKUnit.assert(tf.editable === false, "Expected result: false; Actual result: " + tf.editable + "; type: " + typeof (tf.editable));
};

export function test_parse_ShouldParseBindings() {
    var p = <page.Page>builder.parse("<Page><Switch checked='{{ myProp }}' /></Page>");
    p.bindingContext = { myProp: true };
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.checked === true, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBindingsWithObservable() {
    var p = <page.Page>builder.parse("<Page><Switch checked='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", true);
    p.bindingContext = obj;
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.checked === true, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));

    obj.set("myProp", false);

    TKUnit.assert(sw.checked === false, "Expected result: false; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseSubProperties() {
    var p = <page.Page>builder.parse("<Page><Switch style.visibility='collapsed' checked='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", true);
    p.bindingContext = obj;
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.visibility === "collapsed", "Expected result: collapsed; Actual result: " + sw.visibility + "; type: " + typeof (sw.visibility));
};

export function test_parse_ShouldParseCustomComponentWithoutXml() {
    var p = <page.Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodule"><customControls:MyControl /></Page>');
    var ctrl = p.content;

    TKUnit.assert(ctrl instanceof myCustomControlWithoutXml.MyControl, "Expected result: custom control is defined!; Actual result: " + ctrl);
};

export function test_parse_ShouldParseCustomComponentWitXml() {
    var p = <page.Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:MyControl /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;
    var lbl = <labelModule.Label>panel.getChildAt(0);

    TKUnit.assert(lbl.text === "mymodulewithxml", "Expected result: 'mymodulewithxml'; Actual result: " + lbl);
};

export function test_parse_ShouldParseCustomComponentWitXml_WithAttributes() {
    var p = <page.Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:MyControl visibility="collapsed" /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel.visibility, "collapsed", "panel.visibility");
};

export function test_parse_ShouldParseCustomComponentWitXml_WithCustomAttributes() {
    var p = <page.Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:MyControl myProperty="myValue" /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel["myProperty"], "myValue", "customControl.myProperty");
};

export function test_parse_ShouldParseCustomComponentWitXmlNoJS() {
    var p = <page.Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:my-control-no-js /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;
    var lbl = <labelModule.Label>panel.getChildAt(0);

    TKUnit.assertEqual(lbl.text, "I'm all about taht XML, no JS", "label.text");
};

export function test_parse_ShouldParseCustomComponentWitXmlNoJS_WithAttributes() {
    var p = <page.Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:my-control-no-js visibility="collapsed" /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel.visibility, "collapsed", "panel.visibility");
};

export function test_parse_ShouldParseCustomComponentWitXmlNoJS_WithCustomAttributes() {
    var p = <page.Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:my-control-no-js myProperty="myValue" /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel["myProperty"], "myValue", "customControl.myProperty");
};

export function test_parse_ShouldParseCustomComponentWithoutXmlInListViewTemplate() {
    var p = <page.Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodule"><ListView items="{{ items }}" itemLoading="{{ itemLoading }}"><ListView.itemTemplate><customControls:MyControl /></ListView.itemTemplate></ListView></Page>');

    function testAction(views: Array<viewModule.View>) {
        var ctrl;

        var obj = new observable.Observable();
        obj.set("items", [1]);
        obj.set("itemLoading", function (args: listViewModule.ItemEventData) {
            ctrl = args.view
        });
        p.bindingContext = obj;

        TKUnit.wait(0.2);

        TKUnit.assert(ctrl instanceof myCustomControlWithoutXml.MyControl, "Expected result: custom control is defined!; Actual result: " + ctrl);
    };

    helper.navigate(function () { return p; });

    try {
        testAction([p.content, p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_parse_ShouldParseNestedListViewInListViewTemplate() {
    var p = <page.Page>builder.parse('<Page xmlns="http://www.nativescript.org/tns.xsd"><ListView items="{{ items }}" itemLoading="{{ itemLoading }}"><ListView.itemTemplate><ListView items="{{ subItems }}" /></ListView.itemTemplate></ListView></Page>');

    function testAction(views: Array<viewModule.View>) {
        var ctrl;

        var obj = new observable.Observable();
        obj.set("items", [{ subItems: [1] }]);
        obj.set("itemLoading", function (args: listViewModule.ItemEventData) {
            ctrl = args.view
        });
        p.bindingContext = obj;

        TKUnit.wait(0.2);

        TKUnit.assert(ctrl instanceof listViewModule.ListView, "Expected result: ListView!; Actual result: " + ctrl);
    };

    helper.navigate(function () { return p; });

    try {
        testAction([p.content, p]);
    }
    finally {
        helper.goBack();
    }
}