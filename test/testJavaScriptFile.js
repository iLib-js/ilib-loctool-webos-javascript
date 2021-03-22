/*
 * testJavaScriptFile.js - test the JavaScript file handler object.
 *
 * Copyright (c) 2019-2020, JEDLSoft
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

if (!JavaScriptFile) {
    var JavaScriptFile = require("../JavaScriptFile.js");
    var JavaScriptFileType = require("../JavaScriptFileType.js");
    var CustomProject =  require("loctool/lib/CustomProject.js");
    var RegularPseudo =  require("loctool/lib/RegularPseudo.js");
}

var p = new CustomProject({
    id: "app",
    plugins: ["../."],
    sourceLocale: "en-US"
}, "./test/testfiles", {
    locales:["en-GB"]
});

var jsft = new JavaScriptFileType(p);

module.exports.javascriptfile = {
    testJavaScriptFileConstructor: function(test) {
        test.expect(1);

        var j = new JavaScriptFile({project: p});
        test.ok(j);
        test.done();
    },

    testJavaScriptFileConstructorParams: function(test) {
        test.expect(1);

        var j = new JavaScriptFile({
            project: p,
            pathName: "./testfiles/js/t1.js",
            type: jsft
        });

        test.ok(j);
        test.done();
    },

    testJavaScriptFileConstructorNoFile: function(test) {
        test.expect(1);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);
        test.done();
    },

    testJavaScriptFileMakeKey: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);
        test.equal(j.makeKey("This is a test"), "This is a test");
        test.done();
    },

    testJavaScriptFileParseSimpleGetByKey: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('rb.getString("This is a test")');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBy({
            reskey: "This is a test"
        });
        test.ok(r);

        test.equal(r[0].getSource(), "This is a test");
        test.equal(r[0].getKey(), "This is a test");

        test.done();
    },

    testJavaScriptFileParseSimpleGetBySource: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('rb.getString("This is a test")');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");

        test.done();
    },

    testJavaScriptFileParseJSSimpleGetBySource: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('rb.getStringJS("This is a test")');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");

        test.done();
    },

    testJavaScriptFileParseSimpleSingleQuotes: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse("$L('This is a test')");

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");

        test.done();
    },

    testJavaScriptFileParseJSSimpleSingleQuotes: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse("RB.getStringJS('This is a test')");

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");

        test.done();
    },

    testJavaScriptFileParseMoreComplexSingleQuotes: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse("if (subcat == 'Has types') {title = RB.getString('Types of {topic}').format({topic: topic.attribute.name})}");

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("Types of {topic}");
        test.ok(r);
        test.equal(r.getSource(), "Types of {topic}");
        test.equal(r.getKey(), "Types of {topic}");

        test.done();
    },

    testJavaScriptFileParseSimpleIgnoreWhitespace: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('   rb.getString  (    \t "This is a test"    );  ');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");

        test.done();
    },

    testJavaScriptFileParseJSCompressWhitespaceInKey: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getStringJS("\t\t This \\n \n is \\\n\t a    test")');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "\t\t This \\n \n is \t a    test");

        test.done();
    },

    testJavaScriptFileParseSimpleRightSize: function(test) {
        test.expect(4);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        var set = j.getTranslationSet();
        test.equal(set.size(), 0);

        j.parse('RB.getString("This is a test")');

        test.ok(set);

        test.equal(set.size(), 1);

        test.done();
    },

    testJavaScriptFileParseSimpleWithTranslatorComment: function(test) {
        test.expect(6);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('\tRB.getString("This is a test"); // i18n: this is a translator\'s comment\n\tfoo("This is not");');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");
        test.equal(r.getComment(), "this is a translator's comment");

        test.done();
    },

    testJavaScriptFileParseSingleQuotesWithTranslatorComment: function(test) {
        test.expect(6);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse("\trb.getString('This is a test'); // i18n: this is a translator\'s comment\n\tfoo('This is not');");

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");
        test.equal(r.getComment(), "this is a translator's comment");

        test.done();
    },

    testJavaScriptFileParseSingleQuotesWithEmbeddedSingleQuotes: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse(
            '    rb.getString(\'We\\\'ll notify you when {prefix}{last_name} accepts you as a friend!\').format({\n' +
            '        prefix: detail.name_prefix,\n' +
            '        last_name: detail.last_name\n' +
            '    });'
        );

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("We'll notify you when {prefix}{last_name} accepts you as a friend!");
        test.ok(r);
        test.equal(r.getSource(), "We'll notify you when {prefix}{last_name} accepts you as a friend!");
        test.equal(r.getKey(), "We'll notify you when {prefix}{last_name} accepts you as a friend!");

        test.done();
    },

    testJavaScriptFileParseSingleQuotesWithEmbeddedDoubleQuotes: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse(
            '    rb.getString("We\\"ll notify you when {prefix}{last_name} accepts you as a friend!").format({\n' +
            '        prefix: detail.name_prefix,\n' +
            '        last_name: detail.last_name\n' +
            '    });'
        );

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource('We"ll notify you when {prefix}{last_name} accepts you as a friend!');
        test.ok(r);
        test.equal(r.getSource(), 'We"ll notify you when {prefix}{last_name} accepts you as a friend!');
        test.equal(r.getKey(), 'We"ll notify you when {prefix}{last_name} accepts you as a friend!');

        test.done();
    },

    testJavaScriptFileParseSimpleWithUniqueIdAndTranslatorComment: function(test) {
        test.expect(6);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('\trb.getString("This is a test", "foobar"); // i18n: this is a translator\'s comment\n\tfoo("This is not");');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBy({
            reskey: "foobar"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test");
        test.equal(r[0].getKey(), "foobar");
        test.equal(r[0].getComment(), "this is a translator's comment");

        test.done();
    },

    testJavaScriptFileParseWithKey: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test", "unique_id")');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBy({
            reskey: "unique_id"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test");
        test.equal(r[0].getKey(), "unique_id");

        test.done();
    },

    testJavaScriptFileParseJSWithKey: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getStringJS("This is a test", "unique_id")');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBy({
            reskey: "unique_id"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test");
        test.equal(r[0].getKey(), "unique_id");

        test.done();
    },

    testJavaScriptFileParseWithKeySingleQuotes: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse("RB.getString('This is a test', 'unique_id')");

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBy({
            reskey: "unique_id"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test");
        test.equal(r[0].getKey(), "unique_id");

        test.done();
    },

    testJavaScriptFileParseJSWithKeySingleQuotes: function(test) {
        test.expect(5);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse("RB.getStringJS('This is a test', 'unique_id')");

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBy({
            reskey: "unique_id"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test");
        test.equal(r[0].getKey(), "unique_id");

        test.done();
    },

    testJavaScriptFileParseWithKeyCantGetBySource: function(test) {
        test.expect(3);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test", "unique_id")');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(!r);

        test.done();
    },

    testJavaScriptFileParseMultiple: function(test) {
        test.expect(8);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test");\n\ta.parse("This is another test.");\n\t\tRB.getString("This is also a test");');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");

        r = set.getBySource("This is also a test");
        test.ok(r);
        test.equal(r.getSource(), "This is also a test");
        test.equal(r.getKey(), "This is also a test");

        test.done();
    },

    testJavaScriptFileParseMultipleWithKey: function(test) {
        test.expect(10);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test", "x");\n\ta.parse("This is another test.");\n\t\tRB.getString("This is a test", "y");');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBy({
            reskey: "x"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test");
        test.ok(!r[0].getAutoKey());
        test.equal(r[0].getKey(), "x");

        r = set.getBy({
            reskey: "y"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test");
        test.ok(!r[0].getAutoKey());
        test.equal(r[0].getKey(), "y");

        test.done();
    },

    testJavaScriptFileParseMultipleSameLine: function(test) {
        test.expect(12);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test"), RB.getString("This is a second test"), RB.getString("This is a third test")');

        var set = j.getTranslationSet();
        test.ok(set);

        test.equal(set.size(), 3);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");

        r = set.getBySource("This is a second test");
        test.ok(r);
        test.equal(r.getSource(), "This is a second test");
        test.equal(r.getKey(), "This is a second test");

        r = set.getBySource("This is a third test");
        test.ok(r);
        test.equal(r.getSource(), "This is a third test");
        test.equal(r.getKey(), "This is a third test");

        test.done();
    },

    testJavaScriptFileParseMultipleWithComments: function(test) {
        test.expect(10);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test");   // i18n: foo\n\ta.parse("This is another test.");\n\t\tRB.getString("This is also a test");\t// i18n: bar');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");
        test.equal(r.getComment(), "foo");

        r = set.getBySource("This is also a test");
        test.ok(r);
        test.equal(r.getSource(), "This is also a test");
        test.equal(r.getKey(), "This is also a test");
        test.equal(r.getComment(), "bar");

        test.done();
    },

    testJavaScriptFileParseMultipleWithUniqueIdsAndComments: function(test) {
        test.expect(10);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test", "asdf");   // i18n: foo\n\ta.parse("This is another test.");\n\t\tRB.getString("This is also a test", "kdkdkd");\t// i18n: bar');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBy({
            reskey: "asdf"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test");
        test.equal(r[0].getKey(), "asdf");
        test.equal(r[0].getComment(), "foo");

        r = set.getBy({
            reskey: "kdkdkd"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is also a test");
        test.equal(r[0].getKey(), "kdkdkd");
        test.equal(r[0].getComment(), "bar");

        test.done();
    },

    testJavaScriptFileParseWithDups: function(test) {
        test.expect(6);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test");\n\ta.parse("This is another test.");\n\t\tRB.getString("This is a test");');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");

        test.equal(set.size(), 1);

        test.done();
    },

    testJavaScriptFileParseDupsDifferingByKeyOnly: function(test) {
        test.expect(8);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test");\n\ta.parse("This is another test.");\n\t\tRB.getString("This is a test", "unique_id");');

        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");

        r = set.getBy({
            reskey: "unique_id"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test");
        test.equal(r[0].getKey(), "unique_id");

        test.done();
    },

    testJavaScriptFileParseBogusConcatenation: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test" + " and this isnt");');

        var set = j.getTranslationSet();

        test.equal(set.size(), 0);

        test.done();
    },

    testJavaScriptFileParseBogusConcatenation2: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString("This is a test" + foobar);');

        var set = j.getTranslationSet();
        test.equal(set.size(), 0);

        test.done();
    },

    testJavaScriptFileParseBogusNonStringParam: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString(foobar);');

        var set = j.getTranslationSet();
        test.equal(set.size(), 0);

        test.done();
    },

    testJavaScriptFileParseEmptyParams: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('RB.getString();');

        var set = j.getTranslationSet();
        test.equal(set.size(), 0);

        test.done();
    },

    testJavaScriptFileParseWholeWord: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('EPIRB.getString("This is a test");');

        var set = j.getTranslationSet();
        test.equal(set.size(), 1);

        test.done();
    },

    testJavaScriptFileParseSubobject: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('App.RB.getString("This is a test");');

        var set = j.getTranslationSet();
        test.equal(set.size(), 1);

        test.done();
    },

    testJavaScriptFileParsePunctuationBeforeRB: function(test) {
        test.expect(9);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse(
            "        <%\n" +
            "        var listsOver4 = false;\n" +
            "        var seemoreLen = 0;\n" +
            "        var subcats = [RB.getStringJS('Personal'), RB.getStringJS('Smart Watches')];\n" +
            "        _.each(subcats, function(subcat, j){\n" +
            "            var list = topic.attribute.kb_attribute_relationships[subcat] || [];\n" +
            "            if (list.length > 0) {\n" +
            "        %>\n");

        var set = j.getTranslationSet();
        test.ok(set);

        test.equal(set.size(), 2);

        var r = set.getBySource("Personal");
        test.ok(r);
        test.equal(r.getSource(), "Personal");
        test.equal(r.getKey(), "Personal");

        r = set.getBySource("Smart Watches");
        test.ok(r);
        test.equal(r.getSource(), "Smart Watches");
        test.equal(r.getKey(), "Smart Watches");

        test.done();
    },

    testJavaScriptFileParseEmptyString: function(test) {
        test.expect(3);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse("var subcats = [RB.getStringJS(''), RB.getString(''), RB.getStringJS('', 'foo'), RB.getStringJS('foo', '')];\n");

        var set = j.getTranslationSet();
        test.ok(set);

        test.equal(set.size(), 0);

        test.done();
    },

    testJavaScriptFileExtractFile: function(test) {
        test.expect(8);

        var j = new JavaScriptFile({
            project: p,
            pathName: "./js/t1.js",
            type: jsft
        });
        test.ok(j);

        // should read the file
        j.extract();
        var set = j.getTranslationSet();
        test.equal(set.size(), 8);

        var r = set.getBySource("This is a test");
        test.ok(r);
        test.equal(r.getSource(), "This is a test");
        test.equal(r.getKey(), "This is a test");

        var r = set.getBy({
            reskey: "id1"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test with a unique id");
        test.equal(r[0].getKey(), "id1");

        test.done();
    },

    testJavaScriptFileExtractUndefinedFile: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        // should attempt to read the file and not fail
        j.extract();

        var set = j.getTranslationSet();
        test.equal(set.size(), 0);
        test.done();
    },
    testJavaScriptFileTest2: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: "./js/t2.js",
            type: jsft
        });
        test.ok(j);

        // should attempt to read the file and not fail
        j.extract();

        var set = j.getTranslationSet();
        test.equal(set.size(), 10);
        test.done();
    },
    testJavaScriptPseudoLocalization1: function(test) {
        test.expect(4);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('rb.getStringJS("This is a test")');
        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);

        var rb = new RegularPseudo({
            type: "javascript"
        });
        var rs2 = r.generatePseudo("zxx-XX", rb);
        test.equal(rs2.getTarget(),"Ťĥíš íš à ţëšţ6543210");
        test.done();
    },
    testJavaScriptPseudoLocalization2: function(test) {
        test.expect(4);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('rb.getStringJS("This is a test")');
        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);

        var rb = new RegularPseudo({
            type: "javascript",
            targetLocale: "zxx-Hans-XX"
        });
        var rs2 = r.generatePseudo("zxx-Hans-XX", rb);
        test.equal(rs2.getTarget(),"推和意思意思阿推俄思推6543210");
        test.done();
    },
    testJavaScriptPseudoLocalization3: function(test) {
        test.expect(4);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('rb.getStringJS("This is a test")');
        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);

        var rb = new RegularPseudo({
            type: "javascript",
            targetLocale: "zxx-Cyrl-XX"
        });
        var rs2 = r.generatePseudo("zxx-Cyrl-XX", rb);
        test.equal(rs2.getTarget(), "Тхис ис а тэст6543210");
        test.done();
    },
    testJavaScriptPseudoLocalization4: function(test) {
        test.expect(4);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('rb.getStringJS("This is a test")');
        var set = j.getTranslationSet();
        test.ok(set);

        var r = set.getBySource("This is a test");
        test.ok(r);

        var rb = new RegularPseudo({
            type: "javascript",
            targetLocale: "zxx-Hebr-XX"
        });
        var rs2 = r.generatePseudo("zxx-Hebr-XX", rb);
        test.equal(rs2.getTarget(), 'טהִס ִס ַ טֶסט6543210');
        test.done();
    },
    testJavaScriptFileTest4: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: "./js/t4.js",
            type: jsft
        });
        test.ok(j);

        // should attempt to read the file and not fail
        j.extract();

        var set = j.getTranslationSet();
        test.equal(set.size(), 4);
        test.done();
    },
    testJavaScriptFileNotParseComment: function(test) {
        test.expect(2);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('// $L("This is a test"); // i18n: this is a translator\'s comment\n\tfoo("This is not");');

        var set = j.getTranslationSet();
        test.equal(set.size(), 0);
        test.done();
    },
    testJavaScriptFileNotremotei18nComment: function(test) {
        test.expect(10);

        var j = new JavaScriptFile({
            project: p,
            pathName: undefined,
            type: jsft
        });
        test.ok(j);

        j.parse('$L("This is a test"); // i18n: this is a translator\'s comment\n\t$L("This is a test2");foo("This is not");');

        var set = j.getTranslationSet();
        test.equal(set.size(), 2);

        r = set.getBy({
            reskey: "This is a test"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test");
        test.equal(r[0].getKey(), "This is a test");
        test.equal(r[0].getComment(), "this is a translator\'s comment");

        r = set.getBy({
            reskey: "This is a test2"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "This is a test2");
        test.equal(r[0].getKey(), "This is a test2");
        test.equal(r[0].getComment(), undefined);

        test.done();
    }
};