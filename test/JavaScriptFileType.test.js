/*
 * JavaScriptFileType.test.js - test the JavaScript file type handler object.
 *
 * Copyright © 2019-2021, 2023 JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
if (!JavaScriptFileType) {
    var JavaScriptFileType = require("../JavaScriptFileType.js");
    var CustomProject =  require("loctool/lib/CustomProject.js");
}
var p = new CustomProject({
    id: "app",
    plugins: ["../."],
    sourceLocale: "en-US"
}, "./testfiles", {
    locales:["en-GB"]
});
describe("javascriptfiletype", function() {
    test("JavaScriptFileTypeConstructor", function() {
        expect.assertions(1);
        var htf = new JavaScriptFileType(p);
        expect(htf).toBeTruthy();
    });
    test("JavaScriptFileTypeHandlesJSTrue", function() {
        expect.assertions(2);
        var htf = new JavaScriptFileType(p);
        expect(htf).toBeTruthy();
        expect(htf.handles("foo.js")).toBeTruthy();
    });
    test("JavaScriptFileTypeHandlesJSXTrue", function() {
        expect.assertions(2);
        var htf = new JavaScriptFileType(p);
        expect(htf).toBeTruthy();
        expect(htf.handles("foo.jsx")).toBeTruthy();
    });
    test("JavaScriptFileTypeHandlesJSFalseClose", function() {
        expect.assertions(2);
        var htf = new JavaScriptFileType(p);
        expect(htf).toBeTruthy();
        expect(!htf.handles("foojs")).toBeTruthy();
    });
});