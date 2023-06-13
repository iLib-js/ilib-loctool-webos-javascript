/*
 * JavaScriptFileType.js - Represents a collection of javasript files
 *
 * Copyright (c) 2019-2023, JEDLSoft
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
var JavaScriptFile = require("./JavaScriptFile.js");
var JavaScriptResourceFileType = require("ilib-loctool-webos-json-resource");
var Utils = require("loctool/lib/utils.js")
var ResourceString = require("loctool/lib/ResourceString.js");

var JavaScriptFileType = function(project) {
    this.type = "javascript";
    this.datatype = "javascript";
    this.resourceType = "json";
    this.extensions = [".js", ".jsx"];
    this.isloadCommonData = false;
    this.project = project;
    this.API = project.getAPI();
    this.extracted = this.API.newTranslationSet(project.getSourceLocale());
    this.newres = this.API.newTranslationSet(project.getSourceLocale());
    this.pseudo = this.API.newTranslationSet(project.getSourceLocale());
    this.logger = this.API.getLogger("loctool.plugin.webOSJSFileType");
    if (project.pseudoLocale && typeof project.pseudoLocale === "string") {
        project.pseudoLocale = [project.pseudoLocale];
    }
    // generate all the pseudo bundles we'll need
    if (project.pseudoLocale && Array.isArray(project.pseudoLocale)) {
        this.pseudos = {};
        project.pseudoLocale && project.pseudoLocale.forEach(function(locale) {
            var pseudo = this.API.getPseudoBundle(locale, this, project);
            if (pseudo) {
                this.pseudos[locale] = pseudo;
            }
        }.bind(this));
    }
    if (project.pseudoLocales && typeof project.pseudoLocales == 'object') {
        this.pseudos = {};
        for (locale in project.pseudoLocales) {
            var pseudo = this.API.getPseudoBundle(locale, this, project);
            if (pseudo) {
                this.pseudos[locale] = pseudo;
            }
        }
    }
    // for use with missing strings
    if (!project.settings.nopseudo) {
        this.missingPseudo = this.API.getPseudoBundle(project.pseudoLocale, this, project);
    }

    if (project.settings.webos && project.settings.webos["commonXliff"]){
        this.commonPath = project.settings.webos["commonXliff"];
    }

    if (Object.keys(project.localeMap).length > 0){
        Utils.setBaseLocale(project.localeMap);
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
    this.logger.debug("JavaScriptFileType handles " + pathName + "?");
    var ret = false;

    // resource files should be handled by the JavaScriptResourceType instead
    if (this.project.isResourcePath("js", pathName)) return false;

    if ((pathName.length > 3  && pathName.substring(pathName.length - 3) === ".js") ||
        (pathName.length > 4  && pathName.substring(pathName.length - 4) === ".jsx")) {
        var match = alreadyLocJS.exec(pathName);
        ret = (match && match.length) ? match[1] === this.project.sourceLocale : true;
    }

    this.logger.debug(ret ? "Yes" : "No");
    return ret;
};

JavaScriptFileType.prototype.name = function() {
    return "JavaScript File Type";
};

JavaScriptFileType.prototype._addResource = function(resFileType, translated, res, locale) {
    var file;

    // if reskeys don't match, we matched on cleaned string.
    // so we need to overwrite reskey of the translated resource to match
    if (translated.reskey !== res.reskey) {
        translated.reskey = res.reskey;
    }
    var resource = translated.clone();
    resource.project = res.getProject();
    resource.datatype = res.getDataType();
    resource.setTargetLocale(locale);
    file = resFileType.getResourceFile(locale);
    file.addResource(resource);
}

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
    var mode = this.project.settings.mode;
    var baseLocale, langDefaultLocale, baseTranslation;
    var customInheritLocale;
    var res, file,
        resources = this.extracted.getAll(),
        db = this.project.db,
        translationLocales = locales.filter(function(locale) {
            return locale !== this.project.sourceLocale && locale !== this.project.pseudoLocale;
        }.bind(this));

    if ((typeof(translations) !== 'undefined') && (typeof(translations.getProjects()) !== 'undefined') && (translations.getProjects().includes("common"))) {
        this.isloadCommonData = true;
    }
    if (this.commonPath) {
        if (!this.isloadCommonData) {
            this._loadCommonXliff();
            this.isloadCommonData = true;
        } else {
            this._manipulateCommondata(translations);
        }
    }

    if (mode === "localize") {
        for (var i = 0; i < resources.length; i++) {
            res = resources[i];

            // for each extracted string, write out the translations of it
            translationLocales.forEach(function(locale) {
                this.logger.trace("Localizing JavaScript strings to " + locale);

                baseLocale = Utils.isBaseLocale(locale);
                langDefaultLocale = Utils.getBaseLocale(locale);
                customInheritLocale = this.project.getLocaleInherit(locale);

                baseTranslation = res.getSource();

                if (baseLocale){
                    langDefaultLocale = "en-US";  // language default locale need to compare with root data
                }

                if (locale !== 'en-US' && (translationLocales.includes(langDefaultLocale))) {
                    db.getResourceByCleanHashKey(res.cleanHashKeyForTranslation(langDefaultLocale), function(err, translated) {
                        if (translated) {
                            baseTranslation = translated.getTarget();
                        } else if (this.isloadCommonData) {
                            var manipulateKey = ResourceString.hashKey(this.commonPrjName, langDefaultLocale, res.getKey(), this.commonPrjType, res.getFlavor());
                            db.getResourceByCleanHashKey(manipulateKey, function(err, translated) {
                                if (translated){
                                    baseTranslation = translated.getTarget();
                                }
                            }.bind(this));
                        }
                    }.bind(this));
                }
                db.getResourceByCleanHashKey(res.cleanHashKeyForTranslation(locale), function(err, translated) {
                    var r = translated;

                    if (!translated && this.isloadCommonData) {
                        var manipulateKey = ResourceString.hashKey(this.commonPrjName, locale, res.getKey(), this.commonPrjType, res.getFlavor());
                        db.getResourceByCleanHashKey(manipulateKey, function(err, translated) {
                            if (translated && (baseTranslation !== translated.getTarget())){
                                this._addResource(resFileType, translated, res, locale);
                            } else if(!translated && customInheritLocale){
                                db.getResourceByCleanHashKey(res.cleanHashKeyForTranslation(customInheritLocale), function(err, translated) {
                                    if (!translated) {
                                        var manipulateKey = ResourceString.hashKey(this.commonPrjName, customInheritLocale, res.getKey(), this.commonPrjType, res.getFlavor());
                                        db.getResourceByCleanHashKey(manipulateKey, function(err, translated) {
                                            if (translated && (baseTranslation !== translated.getTarget())) {
                                                this._addResource(resFileType, translated, res, locale);
                                            } else {
                                                var newres = res.clone();
                                                newres.setTargetLocale(locale);
                                                newres.setTarget((r && r.getTarget()) || res.getSource());
                                                newres.setState("new");
                                                newres.setComment(note);
                                                this.newres.add(newres);
                                                this.logger.trace("No translation for " + res.reskey + " to " + locale);
                                            }
                                        }.bind(this))

                                    } else if (translated && (baseTranslation !== translated.getTarget())){
                                        this._addResource(resFileType, translated, res, locale);
                                    } else {
                                        var newres = res.clone();
                                        newres.setTargetLocale(locale);
                                        newres.setTarget((r && r.getTarget()) || res.getSource());
                                        newres.setState("new");
                                        newres.setComment(note);
                                        this.newres.add(newres);
                                        this.logger.trace("No translation for " + res.reskey + " to " + locale);
                                    }
                                }.bind(this));
                            } else {
                                var newres = res.clone();
                                newres.setTargetLocale(locale);
                                newres.setTarget((r && r.getTarget()) || res.getSource());
                                newres.setState("new");
                                newres.setComment(note);
                                this.newres.add(newres);
                                this.logger.trace("No translation for " + res.reskey + " to " + locale);
                            }
                        }.bind(this));
                    } else if (!translated && customInheritLocale){
                        db.getResourceByCleanHashKey(res.cleanHashKeyForTranslation(customInheritLocale), function(err, translated) {
                            if (translated && (baseTranslation != translated.getTarget())) {
                                this._addResource(resFileType, translated, res, locale);
                            } else {
                                var newres = res.clone();
                                newres.setTargetLocale(locale);
                                newres.setTarget((r && r.getTarget()) || res.getSource());
                                newres.setState("new");
                                newres.setComment(note);
                                this.newres.add(newres);
                                this.logger.trace("No translation for " + res.reskey + " to " + locale);
                            }
                        }.bind(this));
                    } else if (!translated || ( this.API.utils.cleanString(res.getSource()) !== this.API.utils.cleanString(r.getSource()) &&
                        this.API.utils.cleanString(res.getSource()) !== this.API.utils.cleanString(r.getKey()))) {
                        if (r) {
                            this.logger.trace("extracted   source: " + this.API.utils.cleanString(res.getSource()));
                            this.logger.trace("translation source: " + this.API.utils.cleanString(r.getSource()));
                        }
                        var note = r && 'The source string has changed. Please update the translation to match if necessary. Previous source: "' + r.getSource() + '"';
                        var newres = res.clone();
                        newres.setTargetLocale(locale);
                        newres.setTarget((r && r.getTarget()) || res.getSource());
                        newres.setState("new");
                        newres.setComment(note);

                        this.newres.add(newres);

                        this.logger.trace("No translation for " + res.reskey + " to " + locale);
                    } else {
                        if (res.reskey != r.reskey) {
                            // if reskeys don't match, we matched on cleaned string.
                            //so we need to overwrite reskey of the translated resource to match
                            r = r.clone();
                            r.reskey = res.reskey;
                        }
                        
                        if (baseTranslation != r.getTarget()) {
                            file = resFileType.getResourceFile(locale);
                            file.addResource(r);
                            this.logger.trace("Added " + r.reskey + " to " + file.pathName);
                        } else {
                            this.logger.trace("Same translation as base translation for " + res.reskey + " to " + locale);
                        }
                    }
                }.bind(this));
            }.bind(this));
        }
        resources = this.pseudo.getAll().filter(function(resource) {
            return resource.datatype === this.datatype;
        }.bind(this));
    } else {
        // generate mode
        this.genresources = this.project.getTranslations(translationLocales);
        this.customInherit = translationLocales.filter(function(locale){
            return this.project.getLocaleInherit(locale) !== undefined;
        }.bind(this));

        if (this.customInherit.length > 0) {
            this.customInherit.forEach(function(lo){
                var res = this.project.getTranslations([lo]);
                if (res.length === 0) {
                    var inheritlocale = this.project.getLocaleInherit(lo);
                    var inheritlocaleRes = this.project.getTranslations([inheritlocale]);
                    inheritlocaleRes.forEach(function(r){
                        var newres = r.clone();
                        newres.setTargetLocale(lo);
                        this.genresources.push(newres);
                    }.bind(this))
                }
            }.bind(this));
        }
    }

    if (mode === "localize") {
        for (var i = 0; i < resources.length; i++) {
            res = resources[i];
            if (res.getTargetLocale() !== this.project.sourceLocale && res.getSource() !== res.getTarget()) {
                file = resFileType.getResourceFile(res.getTargetLocale());
                file.addResource(res);
                this.logger.trace("Added " + res.reskey + " to " + file.pathName);
            }
        }
    } else {
        // generate mode:  compare baseTranslation data
        var locale;
        for (var i = 0; i< this.genresources.length;i++) {
            res = this.genresources[i];
            locale = res.getTargetLocale();
            baseLocale = Utils.isBaseLocale(locale);
            langDefaultLocale = Utils.getBaseLocale(locale);
            baseTranslation = res.getSource();

            if (baseLocale){
                langDefaultLocale = "en-US";
            }
            var langkey = res.cleanHashKeyForTranslation(langDefaultLocale);
            var enUSKey = res.cleanHashKeyForTranslation("en-US");
            
            db.getResourceByCleanHashKey(langkey, function(err, translated) {
                if (translated){
                    baseTranslation = translated.getTarget();
                } else {
                    db.getResourceByCleanHashKey(enUSKey, function(err, translated) {
                        if (translated){
                            baseTranslation = translated.getTarget();
                        }
                    }.bind(this));
                }
            }.bind(this));

            if ((locale == "en-US" && res.getSource() !== res.getTarget()) ||
                (baseTranslation !== res.getTarget())) {
                file = resFileType.getResourceFile(res.getTargetLocale());
                file.addResource(res);
            }
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

JavaScriptFileType.prototype._manipulateCommondata = function(tsdata) {
    var prots = this.project.getRepository().getTranslationSet();
    var commonts = tsdata.getBy({project: "common"});
    if (commonts.length > 0){
        this.commonPrjName = commonts[0].getProject();
        this.commonPrjType = commonts[0].getDataType();
        commonts.forEach(function(ts){
            prots.add(ts);
        }.bind(this));
    }
}

JavaScriptFileType.prototype._loadCommonXliff = function() {
    if (fs.existsSync(this.commonPath)){
        var list = fs.readdirSync(this.commonPath);
    }
    if (list && list.length !== 0) {
        list.forEach(function(file){
            var commonXliff = this.API.newXliff({
                sourceLocale: this.project.getSourceLocale(),
                project: this.project.getProjectId(),
                path: this.commonPath,
            });
            var pathName = path.join(this.commonPath, file);
            var data = fs.readFileSync(pathName, "utf-8");
            commonXliff.deserialize(data);
            var resources = commonXliff.getResources();
            var localts = this.project.getRepository().getTranslationSet();
            if (resources.length > 0){
                this.commonPrjName = resources[0].getProject();
                this.commonPrjType = resources[0].getDataType();
                resources.forEach(function(res){
                    localts.add(res);
                }.bind(this));
            }
        }.bind(this));
    }
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
    this.logger.trace("Found " + resources.length + " source resources for " + pb.getSourceLocale());

    resources.forEach(function(resource) {
        this.logger.trace("Generating pseudo for " + resource.getKey());
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
