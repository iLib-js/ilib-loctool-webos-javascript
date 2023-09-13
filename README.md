# ilib-loctool-webos-javascript

ilib-webos-loctool-javascript is a plugin for the loctool that
allows it to read and localize javascript files. This plugin is optimized for webOS platform.

### JavaScript FileType
This plugin expects to be used [iLib](https://github.com/iLib-js/iLib) library directory or [Enact](https://enactjs.com/) framework to internationalize your JavaScript code.   
It extracts string usages used in the examples below by considering them as strings that need to be translated.
* [getString](https://ilib-js.github.io/iLib/docs/api/jsdoc/ResBundle.html#getString) from iLib
* [$L](https://enactjs.com/docs/modules/i18n/$L/) from Enact framework
```javascript
getString("Hello");
getString("Channel", "speaker_channel");
$L("Hello");
$L({value: "Channel", key: "speaker_channel"});
```

#### Sample
The simple sample is provided in the [ilib-loctool-samples](https://github.com/iLib-js/ilib-loctool-samples) repository.
Please check the [webos-js](https://github.com/iLib-js/ilib-loctool-samples/tree/main/webos-js) sample to see how the JavaScript file type is localized.

## License

Copyright (c) 2019-2023, JEDLSoft

This plugin is license under Apache2. See the [LICENSE](./LICENSE)
file for more details.

## Release Notes
### v1.10.4
* Updated loctool dependency information to be written both `peerDependencies` and `devDependencies`.

### v1.10.3
* Moved `loctool` package to `peerDependencies` in `package.json`.

### v1.10.2
* Moved `loctool` package to `dependencies` in `package.json` because it is actually used in codes.

### v1.10.1
* Updated dependencies. (loctool: 2.23.1)
* Update to be included `npm-shrinkwrap.json` in the published files.

### v1.10.0
* Updated dependencies. (loctool: 2.22.0)
* Added ability to disable pseudo-localization in plugin when a project's pseudo-localization is enabled.
    ~~~~
       "settings": {
            "javascript": {
                "disablePseudo": true
            }
        }
    ~~~~

### v1.9.0
* Updated dependencies. (loctool: 2.21.0)
* Updated not to load common data repeatedly if it's loaded from another plugin in a project.

### v1.8.2
* Updated dependencies.

### v1.8.1
* Updated dependencies.

### v1.8.0
* Updated dependencies. (loctool: 2.20.2)
* Fixed an issue where common's locale inheritance data values were not checked.
* Updated to match translation's reskey and resource's reskey when they are different.
* Updated to check common data's as well when getting base translation.

### v1.7.0
* Updated to custom locale inheritance feature work properly in `generate` mode.
* Added guard code to prevent errors when the common data path is incorrect.
* Updated to generate resources by comparing base translation data even in `generate` mode.
* Fixed an issue where localeinherit related data was not created properly according to the order of locales.
* Fixed an issue where data is duplicated when it is the same as base translation in `generate` mode.

### v1.6.0
* Updated dependencies. (loctool: 2.20.0)
* Added ability to define custom locale inheritance.
    ~~~~
       "settings": {
            "localeInherit": {
                "en-AU": "en-GB"
            }
        }
    ~~~~
* Added ability to use common locale data.
  * App's xliff data has a higher priority, if there's no matched string there, then loctool checks data in the commonXliff directory.
    ~~~~
       "settings": {
            "webos": {
                "commonXliff": "./common"
            }
        }
    ~~~~
* Fixed an issue where multi-space could not be properly parsed in key-value use cases.

### v1.5.0
* Updated dependencies. (loctool: 2.18.0)
* Added ability to override language default locale.
    ~~~~
       "settings": {
            "localeMap": {
                "es-CO": "es"
            }
        }
    ~~~~
* Updated generate mode to use loctool's new public method.

### v1.4.7
* Updated to check language default locale translation not to generate duplicate resources.
* Updated to make source and key policy clear to avoid confusion.

### v1.4.6
* Updated dependencies. (loctool: 2.16.3)
* Used the logger provided by the loctool instead of using log4js directly.
* Added node 16 version testing for circleCI. (minimum version of node is v10.0.0)
* Fixed an issue where the $L(key,value) usage could not be parsed properly.

### v1.4.5
* Update dependent module version to have the latest one.(loctool: 2.16.2)

### v1.4.4
* Fixed pseudo localization to work properly
* Updated dependent module version to have the latest one.(loctool: 2.14.1)

### v1.4.3
* Updated dependent module version to have the latest one.(loctool: 2.13.0)

### v1.4.2
* Updated dependent module version to have the latest one.(loctool: 2.12.0)

### v1.4.1
* Updated dependent module version to have the latest one.(loctool: 2.10.3)

### v1.4.0
* Removed commented lines before parsing so that strings in the comments will not be extracted.
* Updated dependent module version to have the latest one.

### v1.3.0
* Updated regular Expression to extract case when resbundle object name is not `rb` or `RB`.
* Updated code to print log with log4js.
* Supported loctool's generate mode.

### v1.2.0
* Supported pseudo localization

### v1.1.0
* Supported xliff 2.0 style
   * Update code to return translation data properly with xliff 2.0 format