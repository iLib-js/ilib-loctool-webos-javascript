/*
 * JavaScriptFileType.js - Represents a collection of javasript files
 *
 * Copyright © 2019-2020, JEDLSoft
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
var log4js = require("log4js");
var logger = log4js.getLogger("loctool.plugin.JavaScriptFileType");
log4js.configure(path.dirname(module.filename) + '/log4js.json');
var JavaScriptFile = require("./JavaScriptFile.js");
var JavaScriptResourceFileType = require("ilib-loctool-webos-json-resource");

var JavaScriptFileType = function(project) {
    this.type = "javascript";
    this.datatype = "javascript";
    this.resourceType = "json";
    this.extensions = [ ".js", ".jsx"];

    this.project = project;
    this.API = project.getAPI();
    this.extracted = this.API.newTranslationSet(project.getSourceLocale());
    this.newres = this.API.newTranslationSet(project.getSourceLocale());
    this.pseudo = this.API.newTranslationSet(project.getSourceLocale());

    this.pseudos = {};

    if (typeof project.pseudoLocale === "string") {
        project.pseudoLocale = [project.pseudoLocale];
    }

    // generate all the pseudo bundles we'll need
    project.pseudoLocale && project.pseudoLocale.forEach(function(locale) {
        var pseudo = this.API.getPseudoBundle(locale, this, project);
        if (pseudo) {
            this.pseudos[locale] = pseudo;
        }
    }.bind(this));

    // for use with missing strings
    if (!project.settings.nopseudo) {
        this.missingPseudo = this.API.getPseudoBundle(project.pseudoLocale, this, project);
    }
};

var alreadyLocJS = new RegExp(/\.([a-z][a-z](-[A-Z][a-z][a-z][a-z])?(-[A-Z][A-Z](-[A-Z]+)?)?)\.js$/);

/**
 * Return true if the given path is a java file and is handled
 * by the current file type.
 *
 * @param {String} pathName path to the file being questions
 * @returns {boolean} true if the path is a java file, or false
 * otherwise
 */
JavaScriptFileType.prototype.handles = function(pathName) {
    logger.debug("JavaScriptFileType handles " + pathName + "?");
    var ret = false;

    // resource files should be handled by the JavaScriptResourceType instead
    if (this.project.isResourcePath("js", pathName)) return false;

    if ((pathName.length > 3  && pathName.substring(pathName.length - 3) === ".js") ||
        (pathName.length > 4  && pathName.substring(pathName.length - 4) === ".jsx")) {
        var match = alreadyLocJS.exec(pathName);
        ret = (match && match.length) ? match[1] === this.project.sourceLocale : true;
    }

    logger.debug(ret ? "Yes" : "No");
    return ret;
};

JavaScriptFileType.prototype.name = function() {
    return "JavaScript File Type";
};

/**
 * Write out the aggregated resources for this file type. In
 * some cases, the string are written out to a common resource
 * file, and in other cases, to a type-specific resource file.
 * In yet other cases, nothing is written out, as the each of
 * the files themselves are localized individually, so there
 * are no aggregated strings.
 * @param {TranslationSet} translations the set of translations from the
 * repository
 * @param {Array.<String>} locales the list of locales to localize to
 */
JavaScriptFileType.prototype.write = function(translations, locales) {
    // distribute all the resources to their resource files
    // and then let them write themselves out

    var resFileType = this.project.getResourceFileType(this.resourceType);

    var res, file,
        resources = this.extracted.getAll(),
        db = this.project.db,
        translationLocales = locales.filter(function(locale) {
            return locale !== this.project.sourceLocale && locale !== this.project.pseudoLocale;
        }.bind(this));

    for (var i = 0; i < resources.length; i++) {
        res = resources[i];

        // for each extracted string, write out the translations of it
        translationLocales.forEach(function(locale) {
            logger.trace("Localizing JavaScript strings to " + locale);

            db.getResourceByCleanHashKey(res.cleanHashKeyForTranslation(locale), function(err, translated) {
                var r = translated;
                if (!translated || ( this.API.utils.cleanString(res.getSource()) !== this.API.utils.cleanString(r.getSource()) &&
                    this.API.utils.cleanString(res.getSource()) !== this.API.utils.cleanString(r.getKey()))) {
                    if (r) {
                        logger.trace("extracted   source: " + this.API.utils.cleanString(res.getSource()));
                        logger.trace("translation source: " + this.API.utils.cleanString(r.getSource()));
                    }
                    var note = r && 'The source string has changed. Please update the translation to match if necessary. Previous source: "' + r.getSource() + '"';
                    var newres = res.clone();
                    newres.setTargetLocale(locale);
                    newres.setTarget((r && r.getTarget()) || res.getSource());
                    newres.setState("new");
                    newres.setComment(note);

                    this.newres.add(newres);

                    logger.trace("No translation for " + res.reskey + " to " + locale);
                } else {
                    if (res.reskey != r.reskey) {
                        // if reskeys don't match, we matched on cleaned string.
                        //so we need to overwrite reskey of the translated resource to match
                        r = r.clone();
                        r.reskey = res.reskey;
                    }

                    file = resFileType.getResourceFile(locale);
                    file.addResource(r);
                    logger.trace("Added " + r.reskey + " to " + file.pathName);
                }
            }.bind(this));
        }.bind(this));
    }

    resources = this.pseudo.getAll().filter(function(resource) {
        return resource.datatype === this.datatype;
    }.bind(this));

    for (var i = 0; i < resources.length; i++) {
        res = resources[i];
        if (res.getTargetLocale() !== this.project.sourceLocale && res.getSource() !== res.getTarget()) {
            file = resFileType.getResourceFile(res.getTargetLocale());
            file.addResource(res);
            logger.trace("Added " + res.reskey + " to " + file.pathName);
        }
    }
};

JavaScriptFileType.prototype.newFile = function(path) {
    return new JavaScriptFile({
        project: this.project,
        pathName: path,
        type: this
    });
};

JavaScriptFileType.prototype.getDataType = function() {
    return this.datatype;
};

JavaScriptFileType.prototype.getResourceTypes = function() {
    return {};
};

/**
 * Return the name of the node module that implements the resource file type, or
 * the path to a javascript file that implements the resource filetype.
 * @returns {Function|undefined} node module name or path, or undefined if this file type does not
 * need resource files
 */
JavaScriptFileType.prototype.getResourceFileType = function() {
    return JavaScriptResourceFileType;
};

/**
 * Return the translation set containing all of the extracted
 * resources for all instances of this type of file. This includes
 * all new strings and all existing strings. If it was extracted
 * from a source file, it should be returned here.
 *
 * @returns {TranslationSet} the set containing all of the
 * extracted resources
 */
JavaScriptFileType.prototype.getExtracted = function() {
    return this.extracted;
};

/**
 * Ensure that all resources collected so far have a pseudo translation.
 */
JavaScriptFileType.prototype.generatePseudo = function(locale, pb) {
    var resources = this.extracted.getBy({
        sourceLocale: pb.getSourceLocale()
    });
    logger.trace("Found " + resources.length + " source resources for " + pb.getSourceLocale());
    var resource;

    resources.forEach(function(resource) {
        logger.trace("Generating pseudo for " + resource.getKey());
        var res = resource.generatePseudo(locale, pb);
        if (res && res.getSource() !== res.getTarget()) {
            this.pseudo.add(res);
        }
    }.bind(this));
};

/**
 * Add the contents of the given translation set to the extracted resources
 * for this file type.
 *
 * @param {TranslationSet} set set of resources to add to the current set
 */
JavaScriptFileType.prototype.addSet = function(set) {
    this.extracted.addSet(set);
};

/**
 * Return the translation set containing all of the new
 * resources for all instances of this type of file.
 *
 * @returns {TranslationSet} the set containing all of the
 * new resources
 */
JavaScriptFileType.prototype.getNew = function() {
    return this.newres;
};

/**
 * Return the translation set containing all of the pseudo
 * localized resources for all instances of this type of file.
 *
 * @returns {TranslationSet} the set containing all of the
 * pseudo localized resources
 */
JavaScriptFileType.prototype.getPseudo = function() {
    return this.pseudo;
};

/**
 * Return the list of file name extensions that this plugin can
 * process.
 *
 * @returns {Array.<string>} the list of file name extensions
 */
JavaScriptFileType.prototype.getExtensions = function() {
    return this.extensions;
};

module.exports = JavaScriptFileType;