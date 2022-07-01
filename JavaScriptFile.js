/*
 * JavaScriptFile.js - plugin to extract resources from a JavaScript source code file
 *
 * Copyright (c) 2019-2022, JEDLSoft
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

var fs = require("fs");
var path = require("path");

/**
 * Create a new java file with the given path name and within
 * the given project.
 *
 * @param {Project} project the project object
 * @param {String} pathName path to the file relative to the root
 * of the project file
 * @param {FileType} type the file type of this instance
 */
var JavaScriptFile = function(props) {
    this.project = props.project;
    this.pathName = props.pathName;
    this.type = props.type;
    this.API = props.project.getAPI();
    this.logger = this.API.getLogger("loctool.plugin.webOSJSFile");
    this.set = this.API.newTranslationSet(this.project ? this.project.sourceLocale : "zxx-XX");
};

/**
 * Unescape the string to make the same string that would be
 * in memory in the target programming language.
 *
 * @static
 * @param {String} string the string to unescape
 * @returns {String} the unescaped string
 */
JavaScriptFile.unescapeString = function(string) {
    var unescaped = string;

    unescaped = unescaped.
        replace(/\\\\n/g, "").                // line continuation
        replace(/\\\n/g, "").                // line continuation
        replace(/^\\\\/, "\\").             // unescape backslashes
        replace(/([^\\])\\\\/g, "$1\\").
        replace(/^\\'/, "'").               // unescape quotes
        replace(/([^\\])\\'/g, "$1'").
        replace(/^\\"/, '"').
        replace(/([^\\])\\"/g, '$1"');

    return unescaped;
};

/**
 * Clean the string to make a resource name string. This means
 * removing leading and trailing white space, compressing
 * whitespaces, and unescaping characters. This changes
 * the string from what it looks like in the source
 * code but increases matching.
 *
 * @static
 * @param {String} string the string to clean
 * @returns {String} the cleaned string
 */
JavaScriptFile.cleanString = function(string) {
    var unescaped = JavaScriptFile.unescapeString(string);

    unescaped = unescaped.
        replace(/\\[btnfr]/g, " ").
        replace(/[ \n\t\r\f]+/g, " ").
        trim();

    return unescaped;
};
/**
 * Remove single and multi-lines comments except for i18n comment style.
 *
 * @private
 * @param {String} string the string to clean
 * @returns {String} the cleaned string
 */
JavaScriptFile.trimComments = function(data) {
    if (!data) return;
    // comment style: // , /* */ single, multi line
    var trimData = data.replace(/\/\/\s*((?!i18n).)*[$/\n]/g, "").
                    replace(/\/\*+([^*]|\*(?!\/))*\*+\//g, "").
                    replace(/\/\*(.*)\*\//g, "");
    return trimData;
};

/**
 * Make a new key for the given string. This must correspond
 * exactly with the code in htglob jar file so that the
 * resources match up. See the class IResourceBundle in
 * this project under the java directory for the corresponding
 * code.
 *
 * @private
 * @param {String} source the source string to make a resource
 * key for
 * @returns {String} a unique key for this string
 */
JavaScriptFile.prototype.makeKey = function(source) {
    return JavaScriptFile.unescapeString(source);
};

var reGetStringBogusConcatenation1 = new RegExp(/\.getString(JS)?\s*\(\s*("[^"]*"|'[^']*')\s*\+/g);
var reGetStringBogusConcatenation2 = new RegExp(/\.getString(JS)?\s*\([^\)]*\+\s*("[^"]*"|'[^']*')\s*\)/g);
var reGetStringBogusParam = new RegExp(/\.getString(JS)?\s*\([^"'\)]*\)/g);

var reGetString = new RegExp(/\.getString(JS)?\s*\(\s*("((\\"|[^"])*)"|'((\\'|[^'])*)')\s*\)/g);
var reGetStringSymbol = new RegExp(/(^\$|\W\$)L?\s*\(\s*("((\\"|[^"])*)"|'((\\'|[^'])*)')\s*\)/g);
var reGetStringSymbolKeyValuePattern = new RegExp(/(?:^\$|\W\$)L?\s*\(\s*{(key|value)\:\s*("((\\"|[^"])*)"|'((\\'|[^'])*)')\,\s*(key|value)\:\s*("((\\"|[^"])*)"|'((\\'|[^'])*)')\}\)/g);

var reGetStringWithId = new RegExp(/\.getString(JS)?\s*\(\s*("((\\"|[^"])*)"|'((\\'|[^'])*)')\s*,\s*("((\\"|[^"])*)"|'((\\'|[^'])*)')\s*\)/g);

var reI18nComment = new RegExp("//\\s*i18n\\s*:\\s*(.*)$");

/**
 * Parse the data string looking for the localizable strings and add them to the
 * project's translation set.
 * @param {String} data the string to parse
 */
JavaScriptFile.prototype.parse = function(data) {
    this.logger.debug("Extracting strings from " + this.pathName);

    data = JavaScriptFile.trimComments(data);

    this.resourceIndex = 0;

    var comment, match, key;

    reGetString.lastIndex = 0; // just to be safe
    var result = reGetString.exec(data);
    while (result && result.length > 1 && result[2]) {
        // different matches for single and double quotes
        match = (result[2][0] === '"') ? result[3] : result[5];

        if (match && match.length) {
            this.logger.trace("Found string key: " + this.makeKey(match) + ", string: '" + match + "'");

            var last = data.indexOf('\n', reGetString.lastIndex);
            last = (last === -1) ? data.length : last;
            var line = data.substring(reGetString.lastIndex, last);
            var commentResult = reI18nComment.exec(line);
            comment = (commentResult && commentResult.length > 1) ? commentResult[1] : undefined;

            var r = this.API.newResource({
                resType: "string",
                project: this.project.getProjectId(),
                key: JavaScriptFile.unescapeString(match),
                sourceLocale: this.project.sourceLocale,
                source: JavaScriptFile.cleanString(match),
                autoKey: true,
                pathName: this.pathName,
                state: "new",
                comment: comment,
                datatype: this.type.datatype,
                index: this.resourceIndex++
            });
            this.set.add(r);
        } else {
            this.logger.debug("Warning: Bogus empty string in get string call: ");
            this.logger.debug("... " + data.substring(result.index, reGetString.lastIndex) + " ...");
        }
        result = reGetString.exec(data);
    }

    // just to be safe
    reI18nComment.lastIndex = 0;
    reGetStringWithId.lastIndex = 0;

    result = reGetStringWithId.exec(data);
    while (result && result.length > 2 && result[2] && result[7]) {
        // different matches for single and double quotes
        match = (result[2][0] === '"') ? result[3] : result[5];
        key = (result[7][0] === '"') ? result[8] : result[10];

        if (match && key && match.length && key.length) {
            var last = data.indexOf('\n', reGetStringWithId.lastIndex);
            last = (last === -1) ? data.length : last;
            var line = data.substring(reGetStringWithId.lastIndex, last);
            var commentResult = reI18nComment.exec(line);
            comment = (commentResult && commentResult.length > 1) ? commentResult[1] : undefined;

            this.logger.trace("Found string '" + match + "' with unique key " + key + ", comment: " + comment);

            var r = this.API.newResource({
                resType: "string",
                project: this.project.getProjectId(),
                key: key,
                sourceLocale: this.project.sourceLocale,
                source: JavaScriptFile.cleanString(match),
                pathName: this.pathName,
                state: "new",
                comment: comment,
                datatype: this.type.datatype,
                index: this.resourceIndex++
            });
            this.set.add(r);
        } else {
            this.logger.debug("Warning: Bogus empty string in get string call: ");
            this.logger.debug("... " + data.substring(result.index, reGetString.lastIndex) + " ...");
        }
        result = reGetStringWithId.exec(data);
    }

    // just to be safe
    // In order to parse Enyo/Enact style. ex)$L("hello");
    reI18nComment.lastIndex = 0;
    reGetStringSymbol.lastIndex = 0; // just to be safe

    var result = reGetStringSymbol.exec(data);
    while (result && result.length > 1 && result[2]) {
        // different matches for single and double quotes
        match = (result[2][0] === '"') ? result[3] : result[5];

        if (match && match.length) {
            this.logger.trace("Found string key: " + this.makeKey(match) + ", string: '" + match + "'");

            var last = data.indexOf('\n', reGetStringSymbol.lastIndex);
            last = (last === -1) ? data.length : last;
            var line = data.substring(reGetStringSymbol.lastIndex, last);
            var commentResult = reI18nComment.exec(line);
            comment = (commentResult && commentResult.length > 1) ? commentResult[1] : undefined;

            var r = this.API.newResource({
                project: this.project.getProjectId(),
                key: JavaScriptFile.unescapeString(match),
                sourceLocale: this.project.sourceLocale,
                source: JavaScriptFile.cleanString(match),
                autoKey: true,
                pathName: this.pathName,
                state: "new",
                comment: comment,
                datatype: "javascript",
                index: this.resourceIndex++
            });
            this.set.add(r);
        } else {
            this.logger.debug("Warning: Bogus empty string in get string call: ");
            this.logger.debug("... " + data.substring(result.index, reGetStringSymbol.lastIndex) + " ...");
        }
        result = reGetStringSymbol.exec(data);
    }

    // In order to parse Enyo/Enact style.    $L({key:'speaker_channel', value:'Channel'})
    reI18nComment.lastIndex = 0;
    reGetStringSymbolKeyValuePattern.lastIndex = 0; // just to be safe

    var result = reGetStringSymbolKeyValuePattern.exec(data);
    while (result && result.length > 1 && result[2]) {
        // different matches for single and double quotes

        if (result[1] === "key") {
            key = (result[2][0] === '"') ? result[3] : result[5];
            match = (result[8][0] === '"') ? result[9] : result[11];

        } else if (result[7] === "key") {
            key = (result[8][0] === '"') ? result[9] : result[11];
            match = (result[2][0] === '"') ? result[3] : result[5];
        }

        if (match && match.length) {
            this.logger.trace("Found string key: " + key + ", string: '" + match + "'");

            var last = data.indexOf('\n', reGetStringSymbolKeyValuePattern.lastIndex);
            last = (last === -1) ? data.length : last;
            var line = data.substring(reGetStringSymbolKeyValuePattern.lastIndex, last);
            var commentResult = reI18nComment.exec(line);
            comment = (commentResult && commentResult.length > 1) ? commentResult[1] : undefined;

            var r = this.API.newResource({
                project: this.project.getProjectId(),
                key: JavaScriptFile.unescapeString(key),
                sourceLocale: this.project.sourceLocale,
                source: JavaScriptFile.cleanString(match),
                autoKey: true,
                pathName: this.pathName,
                state: "new",
                comment: comment,
                datatype: "javascript",
                index: this.resourceIndex++
            });
            this.set.add(r);
        } else {
            this.logger.debug("Warning: Bogus empty string in get string call: ");
            this.logger.debug("... " + data.substring(result.index, reGetStringSymbolKeyValuePattern.lastIndex) + " ...");
        }
        result = reGetStringSymbolKeyValuePattern.exec(data);
    }

    // now check for and report on errors in the source
    this.API.utils.generateWarnings(data, reGetStringBogusConcatenation1,
        "Warning: string concatenation is not allowed in the .getString() parameters:",
        this.logger,
        this.pathName);

    this.API.utils.generateWarnings(data, reGetStringBogusConcatenation2,
        "Warning: string concatenation is not allowed in the .getString() parameters:",
        this.logger,
        this.pathName);

    this.API.utils.generateWarnings(data, reGetStringBogusParam,
        "Warning: non-string arguments are not allowed in the .getString() parameters:",
        this.logger,
        this.pathName);
};

/**
 * Extract all the localizable strings from the java file and add them to the
 * project's translation set.
 */
JavaScriptFile.prototype.extract = function() {
    this.logger.debug("Extracting strings from " + this.pathName);
    if (this.pathName) {
        var p = path.join(this.project.root, this.pathName);
        try {
            var data = fs.readFileSync(p, "utf8");
            if (data) {
                this.parse(data);
            }
        } catch (e) {
            this.logger.warn("Could not read file: " + p);
        }
    }
};

/**
 * Return the set of resources found in the current JavaScript file.
 *
 * @returns {TranslationSet} The set of resources found in the
 * current JavaScript file.
 */
JavaScriptFile.prototype.getTranslationSet = function() {
    return this.set;
}

// we don't localize or write javascript source files
JavaScriptFile.prototype.localize = function() {};
JavaScriptFile.prototype.write = function() {};

module.exports = JavaScriptFile;
