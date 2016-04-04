'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var view_1 = require('angular2/src/core/metadata/view');
var selector_1 = require('angular2/src/compiler/selector');
var util_1 = require('./util');
var interfaces_1 = require('angular2/src/core/linker/interfaces');
// group 1: "property" from "[property]"
// group 2: "event" from "(event)"
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))$/g;
var CompileMetadataWithIdentifier = (function () {
    function CompileMetadataWithIdentifier() {
    }
    Object.defineProperty(CompileMetadataWithIdentifier.prototype, "identifier", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return CompileMetadataWithIdentifier;
})();
exports.CompileMetadataWithIdentifier = CompileMetadataWithIdentifier;
var CompileMetadataWithType = (function (_super) {
    __extends(CompileMetadataWithType, _super);
    function CompileMetadataWithType() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(CompileMetadataWithType.prototype, "type", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CompileMetadataWithType.prototype, "identifier", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return CompileMetadataWithType;
})(CompileMetadataWithIdentifier);
exports.CompileMetadataWithType = CompileMetadataWithType;
function metadataFromJson(data) {
    return _COMPILE_METADATA_FROM_JSON[data['class']](data);
}
exports.metadataFromJson = metadataFromJson;
var CompileIdentifierMetadata = (function () {
    function CompileIdentifierMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, runtime = _b.runtime, name = _b.name, moduleUrl = _b.moduleUrl, prefix = _b.prefix, constConstructor = _b.constConstructor, value = _b.value;
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.constConstructor = constConstructor;
        this.value = value;
    }
    CompileIdentifierMetadata.fromJson = function (data) {
        var value = lang_1.isArray(data['value']) ? arrayFromJson(data['value'], metadataFromJson) :
            objFromJson(data['value'], metadataFromJson);
        return new CompileIdentifierMetadata({
            name: data['name'],
            prefix: data['prefix'],
            moduleUrl: data['moduleUrl'],
            constConstructor: data['constConstructor'],
            value: value
        });
    };
    CompileIdentifierMetadata.prototype.toJson = function () {
        var value = lang_1.isArray(this.value) ? arrayToJson(this.value) : objToJson(this.value);
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Identifier',
            'name': this.name,
            'moduleUrl': this.moduleUrl,
            'prefix': this.prefix,
            'constConstructor': this.constConstructor,
            'value': value
        };
    };
    Object.defineProperty(CompileIdentifierMetadata.prototype, "identifier", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    return CompileIdentifierMetadata;
})();
exports.CompileIdentifierMetadata = CompileIdentifierMetadata;
var CompileDiDependencyMetadata = (function () {
    function CompileDiDependencyMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, isAttribute = _b.isAttribute, isSelf = _b.isSelf, isHost = _b.isHost, isSkipSelf = _b.isSkipSelf, isOptional = _b.isOptional, query = _b.query, viewQuery = _b.viewQuery, token = _b.token;
        this.isAttribute = lang_1.normalizeBool(isAttribute);
        this.isSelf = lang_1.normalizeBool(isSelf);
        this.isHost = lang_1.normalizeBool(isHost);
        this.isSkipSelf = lang_1.normalizeBool(isSkipSelf);
        this.isOptional = lang_1.normalizeBool(isOptional);
        this.query = query;
        this.viewQuery = viewQuery;
        this.token = token;
    }
    CompileDiDependencyMetadata.fromJson = function (data) {
        return new CompileDiDependencyMetadata({
            token: objFromJson(data['token'], CompileIdentifierMetadata.fromJson),
            query: objFromJson(data['query'], CompileQueryMetadata.fromJson),
            viewQuery: objFromJson(data['viewQuery'], CompileQueryMetadata.fromJson),
            isAttribute: data['isAttribute'],
            isSelf: data['isSelf'],
            isHost: data['isHost'],
            isSkipSelf: data['isSkipSelf'],
            isOptional: data['isOptional']
        });
    };
    CompileDiDependencyMetadata.prototype.toJson = function () {
        return {
            // Note: Runtime type can't be serialized...
            'token': objToJson(this.token),
            'query': objToJson(this.query),
            'viewQuery': objToJson(this.viewQuery),
            'isAttribute': this.isAttribute,
            'isSelf': this.isSelf,
            'isHost': this.isHost,
            'isSkipSelf': this.isSkipSelf,
            'isOptional': this.isOptional
        };
    };
    return CompileDiDependencyMetadata;
})();
exports.CompileDiDependencyMetadata = CompileDiDependencyMetadata;
var CompileProviderMetadata = (function () {
    function CompileProviderMetadata(_a) {
        var token = _a.token, useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.deps = deps;
        this.multi = multi;
    }
    CompileProviderMetadata.fromJson = function (data) {
        return new CompileProviderMetadata({
            token: objFromJson(data['token'], CompileIdentifierMetadata.fromJson),
            useClass: objFromJson(data['useClass'], CompileTypeMetadata.fromJson),
            useExisting: objFromJson(data['useExisting'], CompileIdentifierMetadata.fromJson),
            useValue: objFromJson(data['useValue'], CompileIdentifierMetadata.fromJson),
            useFactory: objFromJson(data['useFactory'], CompileFactoryMetadata.fromJson)
        });
    };
    CompileProviderMetadata.prototype.toJson = function () {
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Provider',
            'token': objToJson(this.token),
            'useClass': objToJson(this.useClass),
            'useExisting': objToJson(this.useExisting),
            'useValue': objToJson(this.useValue),
            'useFactory': objToJson(this.useFactory)
        };
    };
    return CompileProviderMetadata;
})();
exports.CompileProviderMetadata = CompileProviderMetadata;
var CompileFactoryMetadata = (function () {
    function CompileFactoryMetadata(_a) {
        var runtime = _a.runtime, name = _a.name, moduleUrl = _a.moduleUrl, prefix = _a.prefix, constConstructor = _a.constConstructor, diDeps = _a.diDeps, value = _a.value;
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.diDeps = diDeps;
        this.constConstructor = constConstructor;
        this.value = value;
    }
    Object.defineProperty(CompileFactoryMetadata.prototype, "identifier", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    CompileFactoryMetadata.fromJson = function (data) {
        return new CompileFactoryMetadata({
            name: data['name'],
            prefix: data['prefix'],
            moduleUrl: data['moduleUrl'],
            constConstructor: data['constConstructor'],
            value: data['value'],
            diDeps: arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
        });
    };
    CompileFactoryMetadata.prototype.toJson = function () {
        return {
            'class': 'Factory',
            'name': this.name,
            'prefix': this.prefix,
            'moduleUrl': this.moduleUrl,
            'constConstructor': this.constConstructor,
            'value': this.value,
            'diDeps': arrayToJson(this.diDeps)
        };
    };
    return CompileFactoryMetadata;
})();
exports.CompileFactoryMetadata = CompileFactoryMetadata;
/**
 * Metadata regarding compilation of a type.
 */
var CompileTypeMetadata = (function () {
    function CompileTypeMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, runtime = _b.runtime, name = _b.name, moduleUrl = _b.moduleUrl, prefix = _b.prefix, isHost = _b.isHost, constConstructor = _b.constConstructor, value = _b.value, diDeps = _b.diDeps;
        this.runtime = runtime;
        this.name = name;
        this.moduleUrl = moduleUrl;
        this.prefix = prefix;
        this.isHost = lang_1.normalizeBool(isHost);
        this.constConstructor = constConstructor;
        this.value = value;
        this.diDeps = lang_1.normalizeBlank(diDeps);
    }
    CompileTypeMetadata.fromJson = function (data) {
        return new CompileTypeMetadata({
            name: data['name'],
            moduleUrl: data['moduleUrl'],
            prefix: data['prefix'],
            isHost: data['isHost'],
            constConstructor: data['constConstructor'],
            value: data['value'],
            diDeps: arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
        });
    };
    Object.defineProperty(CompileTypeMetadata.prototype, "identifier", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CompileTypeMetadata.prototype, "type", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    CompileTypeMetadata.prototype.toJson = function () {
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Type',
            'name': this.name,
            'moduleUrl': this.moduleUrl,
            'prefix': this.prefix,
            'isHost': this.isHost,
            'constConstructor': this.constConstructor,
            'value': this.value,
            'diDeps': arrayToJson(this.diDeps)
        };
    };
    return CompileTypeMetadata;
})();
exports.CompileTypeMetadata = CompileTypeMetadata;
var CompileQueryMetadata = (function () {
    function CompileQueryMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, selectors = _b.selectors, descendants = _b.descendants, first = _b.first, propertyName = _b.propertyName;
        this.selectors = selectors;
        this.descendants = descendants;
        this.first = lang_1.normalizeBool(first);
        this.propertyName = propertyName;
    }
    CompileQueryMetadata.fromJson = function (data) {
        return new CompileQueryMetadata({
            selectors: arrayFromJson(data['selectors'], CompileIdentifierMetadata.fromJson),
            descendants: data['descendants'],
            first: data['first'],
            propertyName: data['propertyName']
        });
    };
    CompileQueryMetadata.prototype.toJson = function () {
        return {
            // Note: Runtime type can't be serialized...
            'selectors': arrayToJson(this.selectors),
            'descendants': this.descendants,
            'first': this.first,
            'propertyName': this.propertyName
        };
    };
    return CompileQueryMetadata;
})();
exports.CompileQueryMetadata = CompileQueryMetadata;
/**
 * Metadata regarding compilation of a template.
 */
var CompileTemplateMetadata = (function () {
    function CompileTemplateMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, encapsulation = _b.encapsulation, template = _b.template, templateUrl = _b.templateUrl, styles = _b.styles, styleUrls = _b.styleUrls, ngContentSelectors = _b.ngContentSelectors;
        this.encapsulation = lang_1.isPresent(encapsulation) ? encapsulation : view_1.ViewEncapsulation.Emulated;
        this.template = template;
        this.templateUrl = templateUrl;
        this.styles = lang_1.isPresent(styles) ? styles : [];
        this.styleUrls = lang_1.isPresent(styleUrls) ? styleUrls : [];
        this.ngContentSelectors = lang_1.isPresent(ngContentSelectors) ? ngContentSelectors : [];
    }
    CompileTemplateMetadata.fromJson = function (data) {
        return new CompileTemplateMetadata({
            encapsulation: lang_1.isPresent(data['encapsulation']) ?
                view_1.VIEW_ENCAPSULATION_VALUES[data['encapsulation']] :
                data['encapsulation'],
            template: data['template'],
            templateUrl: data['templateUrl'],
            styles: data['styles'],
            styleUrls: data['styleUrls'],
            ngContentSelectors: data['ngContentSelectors']
        });
    };
    CompileTemplateMetadata.prototype.toJson = function () {
        return {
            'encapsulation': lang_1.isPresent(this.encapsulation) ? lang_1.serializeEnum(this.encapsulation) : this.encapsulation,
            'template': this.template,
            'templateUrl': this.templateUrl,
            'styles': this.styles,
            'styleUrls': this.styleUrls,
            'ngContentSelectors': this.ngContentSelectors
        };
    };
    return CompileTemplateMetadata;
})();
exports.CompileTemplateMetadata = CompileTemplateMetadata;
/**
 * Metadata regarding compilation of a directive.
 */
var CompileDirectiveMetadata = (function () {
    function CompileDirectiveMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, type = _b.type, isComponent = _b.isComponent, dynamicLoadable = _b.dynamicLoadable, selector = _b.selector, exportAs = _b.exportAs, changeDetection = _b.changeDetection, inputs = _b.inputs, outputs = _b.outputs, hostListeners = _b.hostListeners, hostProperties = _b.hostProperties, hostAttributes = _b.hostAttributes, lifecycleHooks = _b.lifecycleHooks, providers = _b.providers, viewProviders = _b.viewProviders, queries = _b.queries, viewQueries = _b.viewQueries, template = _b.template;
        this.type = type;
        this.isComponent = isComponent;
        this.dynamicLoadable = dynamicLoadable;
        this.selector = selector;
        this.exportAs = exportAs;
        this.changeDetection = changeDetection;
        this.inputs = inputs;
        this.outputs = outputs;
        this.hostListeners = hostListeners;
        this.hostProperties = hostProperties;
        this.hostAttributes = hostAttributes;
        this.lifecycleHooks = lifecycleHooks;
        this.providers = lang_1.normalizeBlank(providers);
        this.viewProviders = lang_1.normalizeBlank(viewProviders);
        this.queries = lang_1.normalizeBlank(queries);
        this.viewQueries = lang_1.normalizeBlank(viewQueries);
        this.template = template;
    }
    CompileDirectiveMetadata.create = function (_a) {
        var _b = _a === void 0 ? {} : _a, type = _b.type, isComponent = _b.isComponent, dynamicLoadable = _b.dynamicLoadable, selector = _b.selector, exportAs = _b.exportAs, changeDetection = _b.changeDetection, inputs = _b.inputs, outputs = _b.outputs, host = _b.host, lifecycleHooks = _b.lifecycleHooks, providers = _b.providers, viewProviders = _b.viewProviders, queries = _b.queries, viewQueries = _b.viewQueries, template = _b.template;
        var hostListeners = {};
        var hostProperties = {};
        var hostAttributes = {};
        if (lang_1.isPresent(host)) {
            collection_1.StringMapWrapper.forEach(host, function (value, key) {
                var matches = lang_1.RegExpWrapper.firstMatch(HOST_REG_EXP, key);
                if (lang_1.isBlank(matches)) {
                    hostAttributes[key] = value;
                }
                else if (lang_1.isPresent(matches[1])) {
                    hostProperties[matches[1]] = value;
                }
                else if (lang_1.isPresent(matches[2])) {
                    hostListeners[matches[2]] = value;
                }
            });
        }
        var inputsMap = {};
        if (lang_1.isPresent(inputs)) {
            inputs.forEach(function (bindConfig) {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = util_1.splitAtColon(bindConfig, [bindConfig, bindConfig]);
                inputsMap[parts[0]] = parts[1];
            });
        }
        var outputsMap = {};
        if (lang_1.isPresent(outputs)) {
            outputs.forEach(function (bindConfig) {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = util_1.splitAtColon(bindConfig, [bindConfig, bindConfig]);
                outputsMap[parts[0]] = parts[1];
            });
        }
        return new CompileDirectiveMetadata({
            type: type,
            isComponent: lang_1.normalizeBool(isComponent),
            dynamicLoadable: lang_1.normalizeBool(dynamicLoadable),
            selector: selector,
            exportAs: exportAs,
            changeDetection: changeDetection,
            inputs: inputsMap,
            outputs: outputsMap,
            hostListeners: hostListeners,
            hostProperties: hostProperties,
            hostAttributes: hostAttributes,
            lifecycleHooks: lang_1.isPresent(lifecycleHooks) ? lifecycleHooks : [],
            providers: providers,
            viewProviders: viewProviders,
            queries: queries,
            viewQueries: viewQueries,
            template: template
        });
    };
    Object.defineProperty(CompileDirectiveMetadata.prototype, "identifier", {
        get: function () { return this.type; },
        enumerable: true,
        configurable: true
    });
    CompileDirectiveMetadata.fromJson = function (data) {
        return new CompileDirectiveMetadata({
            isComponent: data['isComponent'],
            dynamicLoadable: data['dynamicLoadable'],
            selector: data['selector'],
            exportAs: data['exportAs'],
            type: lang_1.isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
            changeDetection: lang_1.isPresent(data['changeDetection']) ?
                change_detection_1.CHANGE_DETECTION_STRATEGY_VALUES[data['changeDetection']] :
                data['changeDetection'],
            inputs: data['inputs'],
            outputs: data['outputs'],
            hostListeners: data['hostListeners'],
            hostProperties: data['hostProperties'],
            hostAttributes: data['hostAttributes'],
            lifecycleHooks: data['lifecycleHooks'].map(function (hookValue) { return interfaces_1.LIFECYCLE_HOOKS_VALUES[hookValue]; }),
            template: lang_1.isPresent(data['template']) ? CompileTemplateMetadata.fromJson(data['template']) :
                data['template'],
            providers: arrayFromJson(data['providers'], metadataFromJson),
            viewProviders: arrayFromJson(data['viewProviders'], metadataFromJson),
            queries: arrayFromJson(data['queries'], CompileQueryMetadata.fromJson),
            viewQueries: arrayFromJson(data['viewQueries'], CompileQueryMetadata.fromJson)
        });
    };
    CompileDirectiveMetadata.prototype.toJson = function () {
        return {
            'class': 'Directive',
            'isComponent': this.isComponent,
            'dynamicLoadable': this.dynamicLoadable,
            'selector': this.selector,
            'exportAs': this.exportAs,
            'type': lang_1.isPresent(this.type) ? this.type.toJson() : this.type,
            'changeDetection': lang_1.isPresent(this.changeDetection) ? lang_1.serializeEnum(this.changeDetection) :
                this.changeDetection,
            'inputs': this.inputs,
            'outputs': this.outputs,
            'hostListeners': this.hostListeners,
            'hostProperties': this.hostProperties,
            'hostAttributes': this.hostAttributes,
            'lifecycleHooks': this.lifecycleHooks.map(function (hook) { return lang_1.serializeEnum(hook); }),
            'template': lang_1.isPresent(this.template) ? this.template.toJson() : this.template,
            'providers': arrayToJson(this.providers),
            'viewProviders': arrayToJson(this.viewProviders),
            'queries': arrayToJson(this.queries),
            'viewQueries': arrayToJson(this.viewQueries)
        };
    };
    return CompileDirectiveMetadata;
})();
exports.CompileDirectiveMetadata = CompileDirectiveMetadata;
/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
function createHostComponentMeta(componentType, componentSelector) {
    var template = selector_1.CssSelector.parse(componentSelector)[0].getMatchingElementTemplate();
    return CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({
            runtime: Object,
            name: "Host" + componentType.name,
            moduleUrl: componentType.moduleUrl,
            isHost: true
        }),
        template: new CompileTemplateMetadata({ template: template, templateUrl: '', styles: [], styleUrls: [], ngContentSelectors: [] }),
        changeDetection: change_detection_1.ChangeDetectionStrategy.Default,
        inputs: [],
        outputs: [],
        host: {},
        lifecycleHooks: [],
        isComponent: true,
        dynamicLoadable: false,
        selector: '*',
        providers: [],
        viewProviders: [],
        queries: [],
        viewQueries: []
    });
}
exports.createHostComponentMeta = createHostComponentMeta;
var CompilePipeMetadata = (function () {
    function CompilePipeMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, type = _b.type, name = _b.name, pure = _b.pure;
        this.type = type;
        this.name = name;
        this.pure = lang_1.normalizeBool(pure);
    }
    Object.defineProperty(CompilePipeMetadata.prototype, "identifier", {
        get: function () { return this.type; },
        enumerable: true,
        configurable: true
    });
    CompilePipeMetadata.fromJson = function (data) {
        return new CompilePipeMetadata({
            type: lang_1.isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
            name: data['name'],
            pure: data['pure']
        });
    };
    CompilePipeMetadata.prototype.toJson = function () {
        return {
            'class': 'Pipe',
            'type': lang_1.isPresent(this.type) ? this.type.toJson() : null,
            'name': this.name,
            'pure': this.pure
        };
    };
    return CompilePipeMetadata;
})();
exports.CompilePipeMetadata = CompilePipeMetadata;
var _COMPILE_METADATA_FROM_JSON = {
    'Directive': CompileDirectiveMetadata.fromJson,
    'Pipe': CompilePipeMetadata.fromJson,
    'Type': CompileTypeMetadata.fromJson,
    'Provider': CompileProviderMetadata.fromJson,
    'Identifier': CompileIdentifierMetadata.fromJson,
    'Factory': CompileFactoryMetadata.fromJson
};
function arrayFromJson(obj, fn) {
    return lang_1.isBlank(obj) ? null : obj.map(function (o) { return objFromJson(o, fn); });
}
function arrayToJson(obj) {
    return lang_1.isBlank(obj) ? null : obj.map(objToJson);
}
function objFromJson(obj, fn) {
    return (lang_1.isString(obj) || lang_1.isBlank(obj) || lang_1.isBoolean(obj) || lang_1.isNumber(obj)) ? obj : fn(obj);
}
function objToJson(obj) {
    return (lang_1.isString(obj) || lang_1.isBlank(obj) || lang_1.isBoolean(obj) || lang_1.isNumber(obj)) ? obj : obj.toJson();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2RpcmVjdGl2ZV9tZXRhZGF0YS50cyJdLCJuYW1lcyI6WyJDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciIsIkNvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyLmNvbnN0cnVjdG9yIiwiQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIuaWRlbnRpZmllciIsIkNvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIiwiQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUuY29uc3RydWN0b3IiLCJDb21waWxlTWV0YWRhdGFXaXRoVHlwZS50eXBlIiwiQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUuaWRlbnRpZmllciIsIm1ldGFkYXRhRnJvbUpzb24iLCJDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIiwiQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLnRvSnNvbiIsIkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuaWRlbnRpZmllciIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5mcm9tSnNvbiIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS50b0pzb24iLCJDb21waWxlUHJvdmlkZXJNZXRhZGF0YSIsIkNvbXBpbGVQcm92aWRlck1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlUHJvdmlkZXJNZXRhZGF0YS50b0pzb24iLCJDb21waWxlRmFjdG9yeU1ldGFkYXRhIiwiQ29tcGlsZUZhY3RvcnlNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEuaWRlbnRpZmllciIsIkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlRmFjdG9yeU1ldGFkYXRhLnRvSnNvbiIsIkNvbXBpbGVUeXBlTWV0YWRhdGEiLCJDb21waWxlVHlwZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbiIsIkNvbXBpbGVUeXBlTWV0YWRhdGEuaWRlbnRpZmllciIsIkNvbXBpbGVUeXBlTWV0YWRhdGEudHlwZSIsIkNvbXBpbGVUeXBlTWV0YWRhdGEudG9Kc29uIiwiQ29tcGlsZVF1ZXJ5TWV0YWRhdGEiLCJDb21waWxlUXVlcnlNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZVF1ZXJ5TWV0YWRhdGEudG9Kc29uIiwiQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEiLCJDb21waWxlVGVtcGxhdGVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEudG9Kc29uIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNyZWF0ZSIsIkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5pZGVudGlmaWVyIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLnRvSnNvbiIsImNyZWF0ZUhvc3RDb21wb25lbnRNZXRhIiwiQ29tcGlsZVBpcGVNZXRhZGF0YSIsIkNvbXBpbGVQaXBlTWV0YWRhdGEuY29uc3RydWN0b3IiLCJDb21waWxlUGlwZU1ldGFkYXRhLmlkZW50aWZpZXIiLCJDb21waWxlUGlwZU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZVBpcGVNZXRhZGF0YS50b0pzb24iLCJhcnJheUZyb21Kc29uIiwiYXJyYXlUb0pzb24iLCJvYmpGcm9tSnNvbiIsIm9ialRvSnNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFhTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ2hFLGlDQUdPLHFEQUFxRCxDQUFDLENBQUE7QUFDN0QscUJBQTJELGlDQUFpQyxDQUFDLENBQUE7QUFDN0YseUJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QscUJBQTJCLFFBQVEsQ0FBQyxDQUFBO0FBQ3BDLDJCQUFxRCxxQ0FBcUMsQ0FBQyxDQUFBO0FBRTNGLHdDQUF3QztBQUN4QyxrQ0FBa0M7QUFDbEMsSUFBSSxZQUFZLEdBQUcsMENBQTBDLENBQUM7QUFFOUQ7SUFBQUE7SUFJQUMsQ0FBQ0E7SUFEQ0Qsc0JBQUlBLHFEQUFVQTthQUFkQSxjQUE4Q0UsTUFBTUEsQ0FBNEJBLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBQ3BHQSxvQ0FBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxJQUlDO0FBSnFCLHFDQUE2QixnQ0FJbEQsQ0FBQTtBQUVEO0lBQXNERywyQ0FBNkJBO0lBQW5GQTtRQUFzREMsOEJBQTZCQTtJQU1uRkEsQ0FBQ0E7SUFIQ0Qsc0JBQUlBLHlDQUFJQTthQUFSQSxjQUFrQ0UsTUFBTUEsQ0FBc0JBLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBRWhGQSxzQkFBSUEsK0NBQVVBO2FBQWRBLGNBQThDRyxNQUFNQSxDQUE0QkEsMEJBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFDcEdBLDhCQUFDQTtBQUFEQSxDQUFDQSxBQU5ELEVBQXNELDZCQUE2QixFQU1sRjtBQU5xQiwrQkFBdUIsMEJBTTVDLENBQUE7QUFFRCwwQkFBaUMsSUFBMEI7SUFDekRJLE1BQU1B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QSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQTtnQkFDOUJBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2pDQSxjQUFjQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQTtnQkFDckNBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2pDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQTtnQkFDcENBLENBQUNBO1lBQ0hBLENBQUNBLENBQUNBLENBQUNBO1FBQ0xBLENBQUNBO1FBQ0RBLElBQUlBLFNBQVNBLEdBQTRCQSxFQUFFQSxDQUFDQTtRQUM1Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxVQUFrQkE7Z0JBQ2hDQSxzQ0FBc0NBO2dCQUN0Q0EsMkNBQTJDQTtnQkFDM0NBLElBQUlBLEtBQUtBLEdBQUdBLG1CQUFZQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQSxVQUFVQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0RBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNMQSxDQUFDQTtRQUNEQSxJQUFJQSxVQUFVQSxHQUE0QkEsRUFBRUEsQ0FBQ0E7UUFDN0NBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQ0EsVUFBa0JBO2dCQUNqQ0Esc0NBQXNDQTtnQkFDdENBLDJDQUEyQ0E7Z0JBQzNDQSxJQUFJQSxLQUFLQSxHQUFHQSxtQkFBWUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0EsVUFBVUEsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9EQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsd0JBQXdCQSxDQUFDQTtZQUNsQ0EsSUFBSUEsRUFBRUEsSUFBSUE7WUFDVkEsV0FBV0EsRUFBRUEsb0JBQWFBLENBQUNBLFdBQVdBLENBQUNBO1lBQ3ZDQSxlQUFlQSxFQUFFQSxvQkFBYUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7WUFDL0NBLFFBQVFBLEVBQUVBLFFBQVFBO1lBQ2xCQSxRQUFRQSxFQUFFQSxRQUFRQTtZQUNsQkEsZUFBZUEsRUFBRUEsZUFBZUE7WUFDaENBLE1BQU1BLEVBQUVBLFNBQVNBO1lBQ2pCQSxPQUFPQSxFQUFFQSxVQUFVQTtZQUNuQkEsYUFBYUEsRUFBRUEsYUFBYUE7WUFDNUJBLGNBQWNBLEVBQUVBLGNBQWNBO1lBQzlCQSxjQUFjQSxFQUFFQSxjQUFjQTtZQUM5QkEsY0FBY0EsRUFBRUEsZ0JBQVNBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLGNBQWNBLEdBQUdBLEVBQUVBO1lBQy9EQSxTQUFTQSxFQUFFQSxTQUFTQTtZQUNwQkEsYUFBYUEsRUFBRUEsYUFBYUE7WUFDNUJBLE9BQU9BLEVBQUVBLE9BQU9BO1lBQ2hCQSxXQUFXQSxFQUFFQSxXQUFXQTtZQUN4QkEsUUFBUUEsRUFBRUEsUUFBUUE7U0FDbkJBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBNERERixzQkFBSUEsZ0RBQVVBO2FBQWRBLGNBQThDRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFIO0lBRTFEQSxpQ0FBUUEsR0FBZkEsVUFBZ0JBLElBQTBCQTtRQUN4Q0ksTUFBTUEsQ0FBQ0EsSUFBSUEsd0JBQXdCQSxDQUFDQTtZQUNsQ0EsV0FBV0EsRUFBRUEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7WUFDaENBLGVBQWVBLEVBQUVBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0E7WUFDeENBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBO1lBQzFCQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQTtZQUMxQkEsSUFBSUEsRUFBRUEsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7WUFDekZBLGVBQWVBLEVBQUVBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO2dCQUM5QkEsbURBQWdDQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO2dCQUN6REEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtZQUM1Q0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDdEJBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1lBQ3hCQSxhQUFhQSxFQUFFQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQTtZQUNwQ0EsY0FBY0EsRUFBRUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtZQUN0Q0EsY0FBY0EsRUFBRUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtZQUN0Q0EsY0FBY0EsRUFDRkEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFBQSxTQUFTQSxJQUFJQSxPQUFBQSxtQ0FBc0JBLENBQUNBLFNBQVNBLENBQUNBLEVBQWpDQSxDQUFpQ0EsQ0FBQ0E7WUFDdkZBLFFBQVFBLEVBQUVBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxHQUFHQSx1QkFBdUJBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO2dCQUNsREEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7WUFDeERBLFNBQVNBLEVBQUVBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEVBQUVBLGdCQUFnQkEsQ0FBQ0E7WUFDN0RBLGFBQWFBLEVBQUVBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLEVBQUVBLGdCQUFnQkEsQ0FBQ0E7WUFDckVBLE9BQU9BLEVBQUVBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEVBQUVBLG9CQUFvQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDdEVBLFdBQVdBLEVBQUVBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLEVBQUVBLG9CQUFvQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7U0FDL0VBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRURKLHlDQUFNQSxHQUFOQTtRQUNFSyxNQUFNQSxDQUFDQTtZQUNMQSxPQUFPQSxFQUFFQSxXQUFXQTtZQUNwQkEsYUFBYUEsRUFBRUEsSUFBSUEsQ0FBQ0EsV0FBV0E7WUFDL0JBLGlCQUFpQkEsRUFBRUEsSUFBSUEsQ0FBQ0EsZUFBZUE7WUFDdkNBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBO1lBQ3pCQSxVQUFVQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQTtZQUN6QkEsTUFBTUEsRUFBRUEsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBO1lBQzdEQSxpQkFBaUJBLEVBQUVBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxvQkFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7Z0JBQ25DQSxJQUFJQSxDQUFDQSxlQUFlQTtZQUN6RUEsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsTUFBTUE7WUFDckJBLFNBQVNBLEVBQUVBLElBQUlBLENBQUNBLE9BQU9BO1lBQ3ZCQSxlQUFlQSxFQUFFQSxJQUFJQSxDQUFDQSxhQUFhQTtZQUNuQ0EsZ0JBQWdCQSxFQUFFQSxJQUFJQSxDQUFDQSxjQUFjQTtZQUNyQ0EsZ0JBQWdCQSxFQUFFQSxJQUFJQSxDQUFDQSxjQUFjQTtZQUNyQ0EsZ0JBQWdCQSxFQUFFQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFBQSxJQUFJQSxJQUFJQSxPQUFBQSxvQkFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBbkJBLENBQW1CQSxDQUFDQTtZQUN0RUEsVUFBVUEsRUFBRUEsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBO1lBQzdFQSxXQUFXQSxFQUFFQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtZQUN4Q0EsZUFBZUEsRUFBRUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7WUFDaERBLFNBQVNBLEVBQUVBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBO1lBQ3BDQSxhQUFhQSxFQUFFQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQTtTQUM3Q0EsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFDSEwsK0JBQUNBO0FBQURBLENBQUNBLEFBMUxELElBMExDO0FBMUxZLGdDQUF3QiwyQkEwTHBDLENBQUE7QUFFRDs7R0FFRztBQUNILGlDQUF3QyxhQUFrQyxFQUNsQyxpQkFBeUI7SUFDL0RNLElBQUlBLFFBQVFBLEdBQUdBLHNCQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLDBCQUEwQkEsRUFBRUEsQ0FBQ0E7SUFDcEZBLE1BQU1BLENBQUNBLHdCQUF3QkEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDckNBLElBQUlBLEVBQUVBLElBQUlBLG1CQUFtQkEsQ0FBQ0E7WUFDNUJBLE9BQU9BLEVBQUVBLE1BQU1BO1lBQ2ZBLElBQUlBLEVBQUVBLFNBQU9BLGFBQWFBLENBQUNBLElBQU1BO1lBQ2pDQSxTQUFTQSxFQUFFQSxhQUFhQSxDQUFDQSxTQUFTQTtZQUNsQ0EsTUFBTUEsRUFBRUEsSUFBSUE7U0FDYkEsQ0FBQ0E7UUFDRkEsUUFBUUEsRUFBRUEsSUFBSUEsdUJBQXVCQSxDQUNqQ0EsRUFBQ0EsUUFBUUEsRUFBRUEsUUFBUUEsRUFBRUEsV0FBV0EsRUFBRUEsRUFBRUEsRUFBRUEsTUFBTUEsRUFBRUEsRUFBRUEsRUFBRUEsU0FBU0EsRUFBRUEsRUFBRUEsRUFBRUEsa0JBQWtCQSxFQUFFQSxFQUFFQSxFQUFDQSxDQUFDQTtRQUM3RkEsZUFBZUEsRUFBRUEsMENBQXVCQSxDQUFDQSxPQUFPQTtRQUNoREEsTUFBTUEsRUFBRUEsRUFBRUE7UUFDVkEsT0FBT0EsRUFBRUEsRUFBRUE7UUFDWEEsSUFBSUEsRUFBRUEsRUFBRUE7UUFDUkEsY0FBY0EsRUFBRUEsRUFBRUE7UUFDbEJBLFdBQVdBLEVBQUVBLElBQUlBO1FBQ2pCQSxlQUFlQSxFQUFFQSxLQUFLQTtRQUN0QkEsUUFBUUEsRUFBRUEsR0FBR0E7UUFDYkEsU0FBU0EsRUFBRUEsRUFBRUE7UUFDYkEsYUFBYUEsRUFBRUEsRUFBRUE7UUFDakJBLE9BQU9BLEVBQUVBLEVBQUVBO1FBQ1hBLFdBQVdBLEVBQUVBLEVBQUVBO0tBQ2hCQSxDQUFDQSxDQUFDQTtBQUNMQSxDQUFDQTtBQXpCZSwrQkFBdUIsMEJBeUJ0QyxDQUFBO0FBR0Q7SUFJRUMsNkJBQVlBLEVBQ3dFQTtpQ0FBRkMsRUFBRUEsT0FEdkVBLElBQUlBLFlBQUVBLElBQUlBLFlBQ1ZBLElBQUlBO1FBQ2ZBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0Esb0JBQWFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQ2xDQSxDQUFDQTtJQUNERCxzQkFBSUEsMkNBQVVBO2FBQWRBLGNBQThDRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBRTFEQSw0QkFBUUEsR0FBZkEsVUFBZ0JBLElBQTBCQTtRQUN4Q0csTUFBTUEsQ0FBQ0EsSUFBSUEsbUJBQW1CQSxDQUFDQTtZQUM3QkEsSUFBSUEsRUFBRUEsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7WUFDekZBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBO1lBQ2xCQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtTQUNuQkEsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFREgsb0NBQU1BLEdBQU5BO1FBQ0VJLE1BQU1BLENBQUNBO1lBQ0xBLE9BQU9BLEVBQUVBLE1BQU1BO1lBQ2ZBLE1BQU1BLEVBQUVBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxHQUFHQSxJQUFJQTtZQUN4REEsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUE7WUFDakJBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLElBQUlBO1NBQ2xCQSxDQUFDQTtJQUNKQSxDQUFDQTtJQUNISiwwQkFBQ0E7QUFBREEsQ0FBQ0EsQUE1QkQsSUE0QkM7QUE1QlksMkJBQW1CLHNCQTRCL0IsQ0FBQTtBQUVELElBQUksMkJBQTJCLEdBQUc7SUFDaEMsV0FBVyxFQUFFLHdCQUF3QixDQUFDLFFBQVE7SUFDOUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLFFBQVE7SUFDcEMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLFFBQVE7SUFDcEMsVUFBVSxFQUFFLHVCQUF1QixDQUFDLFFBQVE7SUFDNUMsWUFBWSxFQUFFLHlCQUF5QixDQUFDLFFBQVE7SUFDaEQsU0FBUyxFQUFFLHNCQUFzQixDQUFDLFFBQVE7Q0FDM0MsQ0FBQztBQUVGLHVCQUF1QixHQUFVLEVBQUUsRUFBb0M7SUFDckVLLE1BQU1BLENBQUNBLGNBQU9BLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLFVBQUFBLENBQUNBLElBQUlBLE9BQUFBLFdBQVdBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQWxCQSxDQUFrQkEsQ0FBQ0EsQ0FBQ0E7QUFDaEVBLENBQUNBO0FBRUQscUJBQXFCLEdBQVU7SUFDN0JDLE1BQU1BLENBQUNBLGNBQU9BLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0FBQ2xEQSxDQUFDQTtBQUVELHFCQUFxQixHQUFRLEVBQUUsRUFBb0M7SUFDakVDLE1BQU1BLENBQUNBLENBQUNBLGVBQVFBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLGNBQU9BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLGdCQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxlQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUM1RkEsQ0FBQ0E7QUFFRCxtQkFBbUIsR0FBUTtJQUN6QkMsTUFBTUEsQ0FBQ0EsQ0FBQ0EsZUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsY0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLGVBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO0FBQ2pHQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgaXNOdW1iZXIsXG4gIGlzQm9vbGVhbixcbiAgbm9ybWFsaXplQm9vbCxcbiAgbm9ybWFsaXplQmxhbmssXG4gIHNlcmlhbGl6ZUVudW0sXG4gIFR5cGUsXG4gIGlzU3RyaW5nLFxuICBSZWdFeHBXcmFwcGVyLFxuICBTdHJpbmdXcmFwcGVyLFxuICBpc0FycmF5XG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ0hBTkdFX0RFVEVDVElPTl9TVFJBVEVHWV9WQUxVRVNcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb24sIFZJRVdfRU5DQVBTVUxBVElPTl9WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NlbGVjdG9yJztcbmltcG9ydCB7c3BsaXRBdENvbG9ufSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rcywgTElGRUNZQ0xFX0hPT0tTX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2ludGVyZmFjZXMnO1xuXG4vLyBncm91cCAxOiBcInByb3BlcnR5XCIgZnJvbSBcIltwcm9wZXJ0eV1cIlxuLy8gZ3JvdXAgMjogXCJldmVudFwiIGZyb20gXCIoZXZlbnQpXCJcbnZhciBIT1NUX1JFR19FWFAgPSAvXig/Oig/OlxcWyhbXlxcXV0rKVxcXSl8KD86XFwoKFteXFwpXSspXFwpKSkkL2c7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIGFic3RyYWN0IHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIDxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhPnVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUgZXh0ZW5kcyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIGFic3RyYWN0IHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICBnZXQgdHlwZSgpOiBDb21waWxlVHlwZU1ldGFkYXRhIHsgcmV0dXJuIDxDb21waWxlVHlwZU1ldGFkYXRhPnVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gPENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGE+dW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXRhZGF0YUZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYW55IHtcbiAgcmV0dXJuIF9DT01QSUxFX01FVEFEQVRBX0ZST01fSlNPTltkYXRhWydjbGFzcyddXShkYXRhKTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIHJ1bnRpbWU6IGFueTtcbiAgbmFtZTogc3RyaW5nO1xuICBwcmVmaXg6IHN0cmluZztcbiAgbW9kdWxlVXJsOiBzdHJpbmc7XG4gIGNvbnN0Q29uc3RydWN0b3I6IGJvb2xlYW47XG4gIHZhbHVlOiBhbnk7XG5cbiAgY29uc3RydWN0b3Ioe3J1bnRpbWUsIG5hbWUsIG1vZHVsZVVybCwgcHJlZml4LCBjb25zdENvbnN0cnVjdG9yLCB2YWx1ZX06IHtcbiAgICBydW50aW1lPzogYW55LFxuICAgIG5hbWU/OiBzdHJpbmcsXG4gICAgc3RhdGljTWV0aG9kTmFtZT86IHN0cmluZyxcbiAgICBtb2R1bGVVcmw/OiBzdHJpbmcsXG4gICAgcHJlZml4Pzogc3RyaW5nLFxuICAgIGNvbnN0Q29uc3RydWN0b3I/OiBib29sZWFuLFxuICAgIHZhbHVlPzogYW55XG4gIH0gPSB7fSkge1xuICAgIHRoaXMucnVudGltZSA9IHJ1bnRpbWU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybDtcbiAgICB0aGlzLmNvbnN0Q29uc3RydWN0b3IgPSBjb25zdENvbnN0cnVjdG9yO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEge1xuICAgIGxldCB2YWx1ZSA9IGlzQXJyYXkoZGF0YVsndmFsdWUnXSkgPyBhcnJheUZyb21Kc29uKGRhdGFbJ3ZhbHVlJ10sIG1ldGFkYXRhRnJvbUpzb24pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqRnJvbUpzb24oZGF0YVsndmFsdWUnXSwgbWV0YWRhdGFGcm9tSnNvbik7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIHByZWZpeDogZGF0YVsncHJlZml4J10sXG4gICAgICBtb2R1bGVVcmw6IGRhdGFbJ21vZHVsZVVybCddLFxuICAgICAgY29uc3RDb25zdHJ1Y3RvcjogZGF0YVsnY29uc3RDb25zdHJ1Y3RvciddLFxuICAgICAgdmFsdWU6IHZhbHVlXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCB2YWx1ZSA9IGlzQXJyYXkodGhpcy52YWx1ZSkgPyBhcnJheVRvSnNvbih0aGlzLnZhbHVlKSA6IG9ialRvSnNvbih0aGlzLnZhbHVlKTtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gTm90ZTogUnVudGltZSB0eXBlIGNhbid0IGJlIHNlcmlhbGl6ZWQuLi5cbiAgICAgICdjbGFzcyc6ICdJZGVudGlmaWVyJyxcbiAgICAgICduYW1lJzogdGhpcy5uYW1lLFxuICAgICAgJ21vZHVsZVVybCc6IHRoaXMubW9kdWxlVXJsLFxuICAgICAgJ3ByZWZpeCc6IHRoaXMucHJlZml4LFxuICAgICAgJ2NvbnN0Q29uc3RydWN0b3InOiB0aGlzLmNvbnN0Q29uc3RydWN0b3IsXG4gICAgICAndmFsdWUnOiB2YWx1ZVxuICAgIH07XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXM7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGlzQXR0cmlidXRlOiBib29sZWFuO1xuICBpc1NlbGY6IGJvb2xlYW47XG4gIGlzSG9zdDogYm9vbGVhbjtcbiAgaXNTa2lwU2VsZjogYm9vbGVhbjtcbiAgaXNPcHRpb25hbDogYm9vbGVhbjtcbiAgcXVlcnk6IENvbXBpbGVRdWVyeU1ldGFkYXRhO1xuICB2aWV3UXVlcnk6IENvbXBpbGVRdWVyeU1ldGFkYXRhO1xuICB0b2tlbjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih7aXNBdHRyaWJ1dGUsIGlzU2VsZiwgaXNIb3N0LCBpc1NraXBTZWxmLCBpc09wdGlvbmFsLCBxdWVyeSwgdmlld1F1ZXJ5LCB0b2tlbn06IHtcbiAgICBpc0F0dHJpYnV0ZT86IGJvb2xlYW4sXG4gICAgaXNTZWxmPzogYm9vbGVhbixcbiAgICBpc0hvc3Q/OiBib29sZWFuLFxuICAgIGlzU2tpcFNlbGY/OiBib29sZWFuLFxuICAgIGlzT3B0aW9uYWw/OiBib29sZWFuLFxuICAgIHF1ZXJ5PzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gICAgdmlld1F1ZXJ5PzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gICAgdG9rZW4/OiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuaXNBdHRyaWJ1dGUgPSBub3JtYWxpemVCb29sKGlzQXR0cmlidXRlKTtcbiAgICB0aGlzLmlzU2VsZiA9IG5vcm1hbGl6ZUJvb2woaXNTZWxmKTtcbiAgICB0aGlzLmlzSG9zdCA9IG5vcm1hbGl6ZUJvb2woaXNIb3N0KTtcbiAgICB0aGlzLmlzU2tpcFNlbGYgPSBub3JtYWxpemVCb29sKGlzU2tpcFNlbGYpO1xuICAgIHRoaXMuaXNPcHRpb25hbCA9IG5vcm1hbGl6ZUJvb2woaXNPcHRpb25hbCk7XG4gICAgdGhpcy5xdWVyeSA9IHF1ZXJ5O1xuICAgIHRoaXMudmlld1F1ZXJ5ID0gdmlld1F1ZXJ5O1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEoe1xuICAgICAgdG9rZW46IG9iakZyb21Kc29uKGRhdGFbJ3Rva2VuJ10sIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgcXVlcnk6IG9iakZyb21Kc29uKGRhdGFbJ3F1ZXJ5J10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHZpZXdRdWVyeTogb2JqRnJvbUpzb24oZGF0YVsndmlld1F1ZXJ5J10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIGlzQXR0cmlidXRlOiBkYXRhWydpc0F0dHJpYnV0ZSddLFxuICAgICAgaXNTZWxmOiBkYXRhWydpc1NlbGYnXSxcbiAgICAgIGlzSG9zdDogZGF0YVsnaXNIb3N0J10sXG4gICAgICBpc1NraXBTZWxmOiBkYXRhWydpc1NraXBTZWxmJ10sXG4gICAgICBpc09wdGlvbmFsOiBkYXRhWydpc09wdGlvbmFsJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAndG9rZW4nOiBvYmpUb0pzb24odGhpcy50b2tlbiksXG4gICAgICAncXVlcnknOiBvYmpUb0pzb24odGhpcy5xdWVyeSksXG4gICAgICAndmlld1F1ZXJ5Jzogb2JqVG9Kc29uKHRoaXMudmlld1F1ZXJ5KSxcbiAgICAgICdpc0F0dHJpYnV0ZSc6IHRoaXMuaXNBdHRyaWJ1dGUsXG4gICAgICAnaXNTZWxmJzogdGhpcy5pc1NlbGYsXG4gICAgICAnaXNIb3N0JzogdGhpcy5pc0hvc3QsXG4gICAgICAnaXNTa2lwU2VsZic6IHRoaXMuaXNTa2lwU2VsZixcbiAgICAgICdpc09wdGlvbmFsJzogdGhpcy5pc09wdGlvbmFsXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEge1xuICB0b2tlbjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IHN0cmluZztcbiAgdXNlQ2xhc3M6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIHVzZVZhbHVlOiBhbnk7XG4gIHVzZUV4aXN0aW5nOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nO1xuICB1c2VGYWN0b3J5OiBDb21waWxlRmFjdG9yeU1ldGFkYXRhO1xuICBkZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbiAgbXVsdGk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioe3Rva2VuLCB1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB0b2tlbj86IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBzdHJpbmcsXG4gICAgdXNlQ2xhc3M/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIHVzZVZhbHVlPzogYW55LFxuICAgIHVzZUV4aXN0aW5nPzogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IHN0cmluZyxcbiAgICB1c2VGYWN0b3J5PzogQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSxcbiAgICBkZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW10sXG4gICAgbXVsdGk/OiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gICAgdGhpcy51c2VDbGFzcyA9IHVzZUNsYXNzO1xuICAgIHRoaXMudXNlVmFsdWUgPSB1c2VWYWx1ZTtcbiAgICB0aGlzLnVzZUV4aXN0aW5nID0gdXNlRXhpc3Rpbmc7XG4gICAgdGhpcy51c2VGYWN0b3J5ID0gdXNlRmFjdG9yeTtcbiAgICB0aGlzLmRlcHMgPSBkZXBzO1xuICAgIHRoaXMubXVsdGkgPSBtdWx0aTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVQcm92aWRlck1ldGFkYXRhKHtcbiAgICAgIHRva2VuOiBvYmpGcm9tSnNvbihkYXRhWyd0b2tlbiddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZUNsYXNzOiBvYmpGcm9tSnNvbihkYXRhWyd1c2VDbGFzcyddLCBDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZUV4aXN0aW5nOiBvYmpGcm9tSnNvbihkYXRhWyd1c2VFeGlzdGluZyddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZVZhbHVlOiBvYmpGcm9tSnNvbihkYXRhWyd1c2VWYWx1ZSddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZUZhY3Rvcnk6IG9iakZyb21Kc29uKGRhdGFbJ3VzZUZhY3RvcnknXSwgQ29tcGlsZUZhY3RvcnlNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAnY2xhc3MnOiAnUHJvdmlkZXInLFxuICAgICAgJ3Rva2VuJzogb2JqVG9Kc29uKHRoaXMudG9rZW4pLFxuICAgICAgJ3VzZUNsYXNzJzogb2JqVG9Kc29uKHRoaXMudXNlQ2xhc3MpLFxuICAgICAgJ3VzZUV4aXN0aW5nJzogb2JqVG9Kc29uKHRoaXMudXNlRXhpc3RpbmcpLFxuICAgICAgJ3VzZVZhbHVlJzogb2JqVG9Kc29uKHRoaXMudXNlVmFsdWUpLFxuICAgICAgJ3VzZUZhY3RvcnknOiBvYmpUb0pzb24odGhpcy51c2VGYWN0b3J5KVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVGYWN0b3J5TWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICAgIENvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyIHtcbiAgcnVudGltZTogRnVuY3Rpb247XG4gIG5hbWU6IHN0cmluZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIG1vZHVsZVVybDogc3RyaW5nO1xuICBjb25zdENvbnN0cnVjdG9yOiBib29sZWFuO1xuICB2YWx1ZTogYW55O1xuICBkaURlcHM6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuXG4gIGNvbnN0cnVjdG9yKHtydW50aW1lLCBuYW1lLCBtb2R1bGVVcmwsIHByZWZpeCwgY29uc3RDb25zdHJ1Y3RvciwgZGlEZXBzLCB2YWx1ZX06IHtcbiAgICBydW50aW1lPzogRnVuY3Rpb24sXG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBwcmVmaXg/OiBzdHJpbmcsXG4gICAgbW9kdWxlVXJsPzogc3RyaW5nLFxuICAgIGNvbnN0Q29uc3RydWN0b3I/OiBib29sZWFuLFxuICAgIHZhbHVlPzogYm9vbGVhbixcbiAgICBkaURlcHM/OiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXVxuICB9KSB7XG4gICAgdGhpcy5ydW50aW1lID0gcnVudGltZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsO1xuICAgIHRoaXMuZGlEZXBzID0gZGlEZXBzO1xuICAgIHRoaXMuY29uc3RDb25zdHJ1Y3RvciA9IGNvbnN0Q29uc3RydWN0b3I7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRmFjdG9yeU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIHByZWZpeDogZGF0YVsncHJlZml4J10sXG4gICAgICBtb2R1bGVVcmw6IGRhdGFbJ21vZHVsZVVybCddLFxuICAgICAgY29uc3RDb25zdHJ1Y3RvcjogZGF0YVsnY29uc3RDb25zdHJ1Y3RvciddLFxuICAgICAgdmFsdWU6IGRhdGFbJ3ZhbHVlJ10sXG4gICAgICBkaURlcHM6IGFycmF5RnJvbUpzb24oZGF0YVsnZGlEZXBzJ10sIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdjbGFzcyc6ICdGYWN0b3J5JyxcbiAgICAgICduYW1lJzogdGhpcy5uYW1lLFxuICAgICAgJ3ByZWZpeCc6IHRoaXMucHJlZml4LFxuICAgICAgJ21vZHVsZVVybCc6IHRoaXMubW9kdWxlVXJsLFxuICAgICAgJ2NvbnN0Q29uc3RydWN0b3InOiB0aGlzLmNvbnN0Q29uc3RydWN0b3IsXG4gICAgICAndmFsdWUnOiB0aGlzLnZhbHVlLFxuICAgICAgJ2RpRGVwcyc6IGFycmF5VG9Kc29uKHRoaXMuZGlEZXBzKVxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSB0eXBlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZVR5cGVNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIHtcbiAgcnVudGltZTogVHlwZTtcbiAgbmFtZTogc3RyaW5nO1xuICBwcmVmaXg6IHN0cmluZztcbiAgbW9kdWxlVXJsOiBzdHJpbmc7XG4gIGlzSG9zdDogYm9vbGVhbjtcbiAgY29uc3RDb25zdHJ1Y3RvcjogYm9vbGVhbjtcbiAgdmFsdWU6IGFueTtcbiAgZGlEZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcblxuICBjb25zdHJ1Y3Rvcih7cnVudGltZSwgbmFtZSwgbW9kdWxlVXJsLCBwcmVmaXgsIGlzSG9zdCwgY29uc3RDb25zdHJ1Y3RvciwgdmFsdWUsIGRpRGVwc306IHtcbiAgICBydW50aW1lPzogVHlwZSxcbiAgICBuYW1lPzogc3RyaW5nLFxuICAgIG1vZHVsZVVybD86IHN0cmluZyxcbiAgICBwcmVmaXg/OiBzdHJpbmcsXG4gICAgaXNIb3N0PzogYm9vbGVhbixcbiAgICBjb25zdENvbnN0cnVjdG9yPzogYm9vbGVhbixcbiAgICB2YWx1ZT86IGFueSxcbiAgICBkaURlcHM/OiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXVxuICB9ID0ge30pIHtcbiAgICB0aGlzLnJ1bnRpbWUgPSBydW50aW1lO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5tb2R1bGVVcmwgPSBtb2R1bGVVcmw7XG4gICAgdGhpcy5wcmVmaXggPSBwcmVmaXg7XG4gICAgdGhpcy5pc0hvc3QgPSBub3JtYWxpemVCb29sKGlzSG9zdCk7XG4gICAgdGhpcy5jb25zdENvbnN0cnVjdG9yID0gY29uc3RDb25zdHJ1Y3RvcjtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5kaURlcHMgPSBub3JtYWxpemVCbGFuayhkaURlcHMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVR5cGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlVHlwZU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIG1vZHVsZVVybDogZGF0YVsnbW9kdWxlVXJsJ10sXG4gICAgICBwcmVmaXg6IGRhdGFbJ3ByZWZpeCddLFxuICAgICAgaXNIb3N0OiBkYXRhWydpc0hvc3QnXSxcbiAgICAgIGNvbnN0Q29uc3RydWN0b3I6IGRhdGFbJ2NvbnN0Q29uc3RydWN0b3InXSxcbiAgICAgIHZhbHVlOiBkYXRhWyd2YWx1ZSddLFxuICAgICAgZGlEZXBzOiBhcnJheUZyb21Kc29uKGRhdGFbJ2RpRGVwcyddLCBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEuZnJvbUpzb24pXG4gICAgfSk7XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXM7IH1cbiAgZ2V0IHR5cGUoKTogQ29tcGlsZVR5cGVNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gTm90ZTogUnVudGltZSB0eXBlIGNhbid0IGJlIHNlcmlhbGl6ZWQuLi5cbiAgICAgICdjbGFzcyc6ICdUeXBlJyxcbiAgICAgICduYW1lJzogdGhpcy5uYW1lLFxuICAgICAgJ21vZHVsZVVybCc6IHRoaXMubW9kdWxlVXJsLFxuICAgICAgJ3ByZWZpeCc6IHRoaXMucHJlZml4LFxuICAgICAgJ2lzSG9zdCc6IHRoaXMuaXNIb3N0LFxuICAgICAgJ2NvbnN0Q29uc3RydWN0b3InOiB0aGlzLmNvbnN0Q29uc3RydWN0b3IsXG4gICAgICAndmFsdWUnOiB0aGlzLnZhbHVlLFxuICAgICAgJ2RpRGVwcyc6IGFycmF5VG9Kc29uKHRoaXMuZGlEZXBzKVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVRdWVyeU1ldGFkYXRhIHtcbiAgc2VsZWN0b3JzOiBBcnJheTxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nPjtcbiAgZGVzY2VuZGFudHM6IGJvb2xlYW47XG4gIGZpcnN0OiBib29sZWFuO1xuICBwcm9wZXJ0eU5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih7c2VsZWN0b3JzLCBkZXNjZW5kYW50cywgZmlyc3QsIHByb3BlcnR5TmFtZX06IHtcbiAgICBzZWxlY3RvcnM/OiBBcnJheTxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nPixcbiAgICBkZXNjZW5kYW50cz86IGJvb2xlYW4sXG4gICAgZmlyc3Q/OiBib29sZWFuLFxuICAgIHByb3BlcnR5TmFtZT86IHN0cmluZ1xuICB9ID0ge30pIHtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbiAgICB0aGlzLmRlc2NlbmRhbnRzID0gZGVzY2VuZGFudHM7XG4gICAgdGhpcy5maXJzdCA9IG5vcm1hbGl6ZUJvb2woZmlyc3QpO1xuICAgIHRoaXMucHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEoe1xuICAgICAgc2VsZWN0b3JzOiBhcnJheUZyb21Kc29uKGRhdGFbJ3NlbGVjdG9ycyddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIGRlc2NlbmRhbnRzOiBkYXRhWydkZXNjZW5kYW50cyddLFxuICAgICAgZmlyc3Q6IGRhdGFbJ2ZpcnN0J10sXG4gICAgICBwcm9wZXJ0eU5hbWU6IGRhdGFbJ3Byb3BlcnR5TmFtZSddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ3NlbGVjdG9ycyc6IGFycmF5VG9Kc29uKHRoaXMuc2VsZWN0b3JzKSxcbiAgICAgICdkZXNjZW5kYW50cyc6IHRoaXMuZGVzY2VuZGFudHMsXG4gICAgICAnZmlyc3QnOiB0aGlzLmZpcnN0LFxuICAgICAgJ3Byb3BlcnR5TmFtZSc6IHRoaXMucHJvcGVydHlOYW1lXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEge1xuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbjtcbiAgdGVtcGxhdGU6IHN0cmluZztcbiAgdGVtcGxhdGVVcmw6IHN0cmluZztcbiAgc3R5bGVzOiBzdHJpbmdbXTtcbiAgc3R5bGVVcmxzOiBzdHJpbmdbXTtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcbiAgY29uc3RydWN0b3Ioe2VuY2Fwc3VsYXRpb24sIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCwgc3R5bGVzLCBzdHlsZVVybHMsIG5nQ29udGVudFNlbGVjdG9yc306IHtcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgbmdDb250ZW50U2VsZWN0b3JzPzogc3RyaW5nW11cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5lbmNhcHN1bGF0aW9uID0gaXNQcmVzZW50KGVuY2Fwc3VsYXRpb24pID8gZW5jYXBzdWxhdGlvbiA6IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkO1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLnRlbXBsYXRlVXJsID0gdGVtcGxhdGVVcmw7XG4gICAgdGhpcy5zdHlsZXMgPSBpc1ByZXNlbnQoc3R5bGVzKSA/IHN0eWxlcyA6IFtdO1xuICAgIHRoaXMuc3R5bGVVcmxzID0gaXNQcmVzZW50KHN0eWxlVXJscykgPyBzdHlsZVVybHMgOiBbXTtcbiAgICB0aGlzLm5nQ29udGVudFNlbGVjdG9ycyA9IGlzUHJlc2VudChuZ0NvbnRlbnRTZWxlY3RvcnMpID8gbmdDb250ZW50U2VsZWN0b3JzIDogW107XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSh7XG4gICAgICBlbmNhcHN1bGF0aW9uOiBpc1ByZXNlbnQoZGF0YVsnZW5jYXBzdWxhdGlvbiddKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgVklFV19FTkNBUFNVTEFUSU9OX1ZBTFVFU1tkYXRhWydlbmNhcHN1bGF0aW9uJ11dIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWydlbmNhcHN1bGF0aW9uJ10sXG4gICAgICB0ZW1wbGF0ZTogZGF0YVsndGVtcGxhdGUnXSxcbiAgICAgIHRlbXBsYXRlVXJsOiBkYXRhWyd0ZW1wbGF0ZVVybCddLFxuICAgICAgc3R5bGVzOiBkYXRhWydzdHlsZXMnXSxcbiAgICAgIHN0eWxlVXJsczogZGF0YVsnc3R5bGVVcmxzJ10sXG4gICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IGRhdGFbJ25nQ29udGVudFNlbGVjdG9ycyddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAnZW5jYXBzdWxhdGlvbic6XG4gICAgICAgICAgaXNQcmVzZW50KHRoaXMuZW5jYXBzdWxhdGlvbikgPyBzZXJpYWxpemVFbnVtKHRoaXMuZW5jYXBzdWxhdGlvbikgOiB0aGlzLmVuY2Fwc3VsYXRpb24sXG4gICAgICAndGVtcGxhdGUnOiB0aGlzLnRlbXBsYXRlLFxuICAgICAgJ3RlbXBsYXRlVXJsJzogdGhpcy50ZW1wbGF0ZVVybCxcbiAgICAgICdzdHlsZXMnOiB0aGlzLnN0eWxlcyxcbiAgICAgICdzdHlsZVVybHMnOiB0aGlzLnN0eWxlVXJscyxcbiAgICAgICduZ0NvbnRlbnRTZWxlY3RvcnMnOiB0aGlzLm5nQ29udGVudFNlbGVjdG9yc1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSBkaXJlY3RpdmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSB7XG4gIHN0YXRpYyBjcmVhdGUoe3R5cGUsIGlzQ29tcG9uZW50LCBkeW5hbWljTG9hZGFibGUsIHNlbGVjdG9yLCBleHBvcnRBcywgY2hhbmdlRGV0ZWN0aW9uLCBpbnB1dHMsXG4gICAgICAgICAgICAgICAgIG91dHB1dHMsIGhvc3QsIGxpZmVjeWNsZUhvb2tzLCBwcm92aWRlcnMsIHZpZXdQcm92aWRlcnMsIHF1ZXJpZXMsIHZpZXdRdWVyaWVzLFxuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZX06IHtcbiAgICB0eXBlPzogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBpc0NvbXBvbmVudD86IGJvb2xlYW4sXG4gICAgZHluYW1pY0xvYWRhYmxlPzogYm9vbGVhbixcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGxpZmVjeWNsZUhvb2tzPzogTGlmZWN5Y2xlSG9va3NbXSxcbiAgICBwcm92aWRlcnM/OlxuICAgICAgICBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB8IENvbXBpbGVUeXBlTWV0YWRhdGEgfCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgYW55W10+LFxuICAgIHZpZXdQcm92aWRlcnM/OlxuICAgICAgICBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB8IENvbXBpbGVUeXBlTWV0YWRhdGEgfCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgYW55W10+LFxuICAgIHF1ZXJpZXM/OiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIHZpZXdRdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICB0ZW1wbGF0ZT86IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhXG4gIH0gPSB7fSk6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgdmFyIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgdmFyIGhvc3RQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIHZhciBob3N0QXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAoaXNQcmVzZW50KGhvc3QpKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaG9zdCwgKHZhbHVlOiBzdHJpbmcsIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHZhciBtYXRjaGVzID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKEhPU1RfUkVHX0VYUCwga2V5KTtcbiAgICAgICAgaWYgKGlzQmxhbmsobWF0Y2hlcykpIHtcbiAgICAgICAgICBob3N0QXR0cmlidXRlc1trZXldID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KG1hdGNoZXNbMV0pKSB7XG4gICAgICAgICAgaG9zdFByb3BlcnRpZXNbbWF0Y2hlc1sxXV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQobWF0Y2hlc1syXSkpIHtcbiAgICAgICAgICBob3N0TGlzdGVuZXJzW21hdGNoZXNbMl1dID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgaW5wdXRzTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChpc1ByZXNlbnQoaW5wdXRzKSkge1xuICAgICAgaW5wdXRzLmZvckVhY2goKGJpbmRDb25maWc6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBjYW5vbmljYWwgc3ludGF4OiBgZGlyUHJvcDogZWxQcm9wYFxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBgOmAsIHVzZSBkaXJQcm9wID0gZWxQcm9wXG4gICAgICAgIHZhciBwYXJ0cyA9IHNwbGl0QXRDb2xvbihiaW5kQ29uZmlnLCBbYmluZENvbmZpZywgYmluZENvbmZpZ10pO1xuICAgICAgICBpbnB1dHNNYXBbcGFydHNbMF1dID0gcGFydHNbMV07XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIG91dHB1dHNNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGlzUHJlc2VudChvdXRwdXRzKSkge1xuICAgICAgb3V0cHV0cy5mb3JFYWNoKChiaW5kQ29uZmlnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gY2Fub25pY2FsIHN5bnRheDogYGRpclByb3A6IGVsUHJvcGBcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYDpgLCB1c2UgZGlyUHJvcCA9IGVsUHJvcFxuICAgICAgICB2YXIgcGFydHMgPSBzcGxpdEF0Q29sb24oYmluZENvbmZpZywgW2JpbmRDb25maWcsIGJpbmRDb25maWddKTtcbiAgICAgICAgb3V0cHV0c01hcFtwYXJ0c1swXV0gPSBwYXJ0c1sxXTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBpc0NvbXBvbmVudDogbm9ybWFsaXplQm9vbChpc0NvbXBvbmVudCksXG4gICAgICBkeW5hbWljTG9hZGFibGU6IG5vcm1hbGl6ZUJvb2woZHluYW1pY0xvYWRhYmxlKSxcbiAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgIGV4cG9ydEFzOiBleHBvcnRBcyxcbiAgICAgIGNoYW5nZURldGVjdGlvbjogY2hhbmdlRGV0ZWN0aW9uLFxuICAgICAgaW5wdXRzOiBpbnB1dHNNYXAsXG4gICAgICBvdXRwdXRzOiBvdXRwdXRzTWFwLFxuICAgICAgaG9zdExpc3RlbmVyczogaG9zdExpc3RlbmVycyxcbiAgICAgIGhvc3RQcm9wZXJ0aWVzOiBob3N0UHJvcGVydGllcyxcbiAgICAgIGhvc3RBdHRyaWJ1dGVzOiBob3N0QXR0cmlidXRlcyxcbiAgICAgIGxpZmVjeWNsZUhvb2tzOiBpc1ByZXNlbnQobGlmZWN5Y2xlSG9va3MpID8gbGlmZWN5Y2xlSG9va3MgOiBbXSxcbiAgICAgIHByb3ZpZGVyczogcHJvdmlkZXJzLFxuICAgICAgdmlld1Byb3ZpZGVyczogdmlld1Byb3ZpZGVycyxcbiAgICAgIHF1ZXJpZXM6IHF1ZXJpZXMsXG4gICAgICB2aWV3UXVlcmllczogdmlld1F1ZXJpZXMsXG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgICB9KTtcbiAgfVxuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBpc0NvbXBvbmVudDogYm9vbGVhbjtcbiAgZHluYW1pY0xvYWRhYmxlOiBib29sZWFuO1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuICBleHBvcnRBczogc3RyaW5nO1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5O1xuICBpbnB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBvdXRwdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBsaWZlY3ljbGVIb29rczogTGlmZWN5Y2xlSG9va3NbXTtcbiAgcHJvdmlkZXJzOiBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB8IENvbXBpbGVUeXBlTWV0YWRhdGEgfCBhbnlbXT47XG4gIHZpZXdQcm92aWRlcnM6IEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IGFueVtdPjtcbiAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgdmlld1F1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW107XG4gIHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YTtcbiAgY29uc3RydWN0b3Ioe3R5cGUsIGlzQ29tcG9uZW50LCBkeW5hbWljTG9hZGFibGUsIHNlbGVjdG9yLCBleHBvcnRBcywgY2hhbmdlRGV0ZWN0aW9uLCBpbnB1dHMsXG4gICAgICAgICAgICAgICBvdXRwdXRzLCBob3N0TGlzdGVuZXJzLCBob3N0UHJvcGVydGllcywgaG9zdEF0dHJpYnV0ZXMsIGxpZmVjeWNsZUhvb2tzLCBwcm92aWRlcnMsXG4gICAgICAgICAgICAgICB2aWV3UHJvdmlkZXJzLCBxdWVyaWVzLCB2aWV3UXVlcmllcywgdGVtcGxhdGV9OiB7XG4gICAgdHlwZT86IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgaXNDb21wb25lbnQ/OiBib29sZWFuLFxuICAgIGR5bmFtaWNMb2FkYWJsZT86IGJvb2xlYW4sXG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgaW5wdXRzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgb3V0cHV0cz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RMaXN0ZW5lcnM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBob3N0UHJvcGVydGllcz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RBdHRyaWJ1dGVzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgbGlmZWN5Y2xlSG9va3M/OiBMaWZlY3ljbGVIb29rc1tdLFxuICAgIHByb3ZpZGVycz86XG4gICAgICAgIEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBhbnlbXT4sXG4gICAgdmlld1Byb3ZpZGVycz86XG4gICAgICAgIEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBhbnlbXT4sXG4gICAgcXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdmlld1F1ZXJpZXM/OiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIHRlbXBsYXRlPzogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGFcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmlzQ29tcG9uZW50ID0gaXNDb21wb25lbnQ7XG4gICAgdGhpcy5keW5hbWljTG9hZGFibGUgPSBkeW5hbWljTG9hZGFibGU7XG4gICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIHRoaXMuZXhwb3J0QXMgPSBleHBvcnRBcztcbiAgICB0aGlzLmNoYW5nZURldGVjdGlvbiA9IGNoYW5nZURldGVjdGlvbjtcbiAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICB0aGlzLm91dHB1dHMgPSBvdXRwdXRzO1xuICAgIHRoaXMuaG9zdExpc3RlbmVycyA9IGhvc3RMaXN0ZW5lcnM7XG4gICAgdGhpcy5ob3N0UHJvcGVydGllcyA9IGhvc3RQcm9wZXJ0aWVzO1xuICAgIHRoaXMuaG9zdEF0dHJpYnV0ZXMgPSBob3N0QXR0cmlidXRlcztcbiAgICB0aGlzLmxpZmVjeWNsZUhvb2tzID0gbGlmZWN5Y2xlSG9va3M7XG4gICAgdGhpcy5wcm92aWRlcnMgPSBub3JtYWxpemVCbGFuayhwcm92aWRlcnMpO1xuICAgIHRoaXMudmlld1Byb3ZpZGVycyA9IG5vcm1hbGl6ZUJsYW5rKHZpZXdQcm92aWRlcnMpO1xuICAgIHRoaXMucXVlcmllcyA9IG5vcm1hbGl6ZUJsYW5rKHF1ZXJpZXMpO1xuICAgIHRoaXMudmlld1F1ZXJpZXMgPSBub3JtYWxpemVCbGFuayh2aWV3UXVlcmllcyk7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzLnR5cGU7IH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgIGlzQ29tcG9uZW50OiBkYXRhWydpc0NvbXBvbmVudCddLFxuICAgICAgZHluYW1pY0xvYWRhYmxlOiBkYXRhWydkeW5hbWljTG9hZGFibGUnXSxcbiAgICAgIHNlbGVjdG9yOiBkYXRhWydzZWxlY3RvciddLFxuICAgICAgZXhwb3J0QXM6IGRhdGFbJ2V4cG9ydEFzJ10sXG4gICAgICB0eXBlOiBpc1ByZXNlbnQoZGF0YVsndHlwZSddKSA/IENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24oZGF0YVsndHlwZSddKSA6IGRhdGFbJ3R5cGUnXSxcbiAgICAgIGNoYW5nZURldGVjdGlvbjogaXNQcmVzZW50KGRhdGFbJ2NoYW5nZURldGVjdGlvbiddKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBDSEFOR0VfREVURUNUSU9OX1NUUkFURUdZX1ZBTFVFU1tkYXRhWydjaGFuZ2VEZXRlY3Rpb24nXV0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVsnY2hhbmdlRGV0ZWN0aW9uJ10sXG4gICAgICBpbnB1dHM6IGRhdGFbJ2lucHV0cyddLFxuICAgICAgb3V0cHV0czogZGF0YVsnb3V0cHV0cyddLFxuICAgICAgaG9zdExpc3RlbmVyczogZGF0YVsnaG9zdExpc3RlbmVycyddLFxuICAgICAgaG9zdFByb3BlcnRpZXM6IGRhdGFbJ2hvc3RQcm9wZXJ0aWVzJ10sXG4gICAgICBob3N0QXR0cmlidXRlczogZGF0YVsnaG9zdEF0dHJpYnV0ZXMnXSxcbiAgICAgIGxpZmVjeWNsZUhvb2tzOlxuICAgICAgICAgICg8YW55W10+ZGF0YVsnbGlmZWN5Y2xlSG9va3MnXSkubWFwKGhvb2tWYWx1ZSA9PiBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTW2hvb2tWYWx1ZV0pLFxuICAgICAgdGVtcGxhdGU6IGlzUHJlc2VudChkYXRhWyd0ZW1wbGF0ZSddKSA/IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLmZyb21Kc29uKGRhdGFbJ3RlbXBsYXRlJ10pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWyd0ZW1wbGF0ZSddLFxuICAgICAgcHJvdmlkZXJzOiBhcnJheUZyb21Kc29uKGRhdGFbJ3Byb3ZpZGVycyddLCBtZXRhZGF0YUZyb21Kc29uKSxcbiAgICAgIHZpZXdQcm92aWRlcnM6IGFycmF5RnJvbUpzb24oZGF0YVsndmlld1Byb3ZpZGVycyddLCBtZXRhZGF0YUZyb21Kc29uKSxcbiAgICAgIHF1ZXJpZXM6IGFycmF5RnJvbUpzb24oZGF0YVsncXVlcmllcyddLCBDb21waWxlUXVlcnlNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB2aWV3UXVlcmllczogYXJyYXlGcm9tSnNvbihkYXRhWyd2aWV3UXVlcmllcyddLCBDb21waWxlUXVlcnlNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdjbGFzcyc6ICdEaXJlY3RpdmUnLFxuICAgICAgJ2lzQ29tcG9uZW50JzogdGhpcy5pc0NvbXBvbmVudCxcbiAgICAgICdkeW5hbWljTG9hZGFibGUnOiB0aGlzLmR5bmFtaWNMb2FkYWJsZSxcbiAgICAgICdzZWxlY3Rvcic6IHRoaXMuc2VsZWN0b3IsXG4gICAgICAnZXhwb3J0QXMnOiB0aGlzLmV4cG9ydEFzLFxuICAgICAgJ3R5cGUnOiBpc1ByZXNlbnQodGhpcy50eXBlKSA/IHRoaXMudHlwZS50b0pzb24oKSA6IHRoaXMudHlwZSxcbiAgICAgICdjaGFuZ2VEZXRlY3Rpb24nOiBpc1ByZXNlbnQodGhpcy5jaGFuZ2VEZXRlY3Rpb24pID8gc2VyaWFsaXplRW51bSh0aGlzLmNoYW5nZURldGVjdGlvbikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZURldGVjdGlvbixcbiAgICAgICdpbnB1dHMnOiB0aGlzLmlucHV0cyxcbiAgICAgICdvdXRwdXRzJzogdGhpcy5vdXRwdXRzLFxuICAgICAgJ2hvc3RMaXN0ZW5lcnMnOiB0aGlzLmhvc3RMaXN0ZW5lcnMsXG4gICAgICAnaG9zdFByb3BlcnRpZXMnOiB0aGlzLmhvc3RQcm9wZXJ0aWVzLFxuICAgICAgJ2hvc3RBdHRyaWJ1dGVzJzogdGhpcy5ob3N0QXR0cmlidXRlcyxcbiAgICAgICdsaWZlY3ljbGVIb29rcyc6IHRoaXMubGlmZWN5Y2xlSG9va3MubWFwKGhvb2sgPT4gc2VyaWFsaXplRW51bShob29rKSksXG4gICAgICAndGVtcGxhdGUnOiBpc1ByZXNlbnQodGhpcy50ZW1wbGF0ZSkgPyB0aGlzLnRlbXBsYXRlLnRvSnNvbigpIDogdGhpcy50ZW1wbGF0ZSxcbiAgICAgICdwcm92aWRlcnMnOiBhcnJheVRvSnNvbih0aGlzLnByb3ZpZGVycyksXG4gICAgICAndmlld1Byb3ZpZGVycyc6IGFycmF5VG9Kc29uKHRoaXMudmlld1Byb3ZpZGVycyksXG4gICAgICAncXVlcmllcyc6IGFycmF5VG9Kc29uKHRoaXMucXVlcmllcyksXG4gICAgICAndmlld1F1ZXJpZXMnOiBhcnJheVRvSnNvbih0aGlzLnZpZXdRdWVyaWVzKVxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3Qge0BsaW5rIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YX0gZnJvbSB7QGxpbmsgQ29tcG9uZW50VHlwZU1ldGFkYXRhfSBhbmQgYSBzZWxlY3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhvc3RDb21wb25lbnRNZXRhKGNvbXBvbmVudFR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VsZWN0b3I6IHN0cmluZyk6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gIHZhciB0ZW1wbGF0ZSA9IENzc1NlbGVjdG9yLnBhcnNlKGNvbXBvbmVudFNlbGVjdG9yKVswXS5nZXRNYXRjaGluZ0VsZW1lbnRUZW1wbGF0ZSgpO1xuICByZXR1cm4gQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNyZWF0ZSh7XG4gICAgdHlwZTogbmV3IENvbXBpbGVUeXBlTWV0YWRhdGEoe1xuICAgICAgcnVudGltZTogT2JqZWN0LFxuICAgICAgbmFtZTogYEhvc3Qke2NvbXBvbmVudFR5cGUubmFtZX1gLFxuICAgICAgbW9kdWxlVXJsOiBjb21wb25lbnRUeXBlLm1vZHVsZVVybCxcbiAgICAgIGlzSG9zdDogdHJ1ZVxuICAgIH0pLFxuICAgIHRlbXBsYXRlOiBuZXcgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEoXG4gICAgICAgIHt0ZW1wbGF0ZTogdGVtcGxhdGUsIHRlbXBsYXRlVXJsOiAnJywgc3R5bGVzOiBbXSwgc3R5bGVVcmxzOiBbXSwgbmdDb250ZW50U2VsZWN0b3JzOiBbXX0pLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgICBpbnB1dHM6IFtdLFxuICAgIG91dHB1dHM6IFtdLFxuICAgIGhvc3Q6IHt9LFxuICAgIGxpZmVjeWNsZUhvb2tzOiBbXSxcbiAgICBpc0NvbXBvbmVudDogdHJ1ZSxcbiAgICBkeW5hbWljTG9hZGFibGU6IGZhbHNlLFxuICAgIHNlbGVjdG9yOiAnKicsXG4gICAgcHJvdmlkZXJzOiBbXSxcbiAgICB2aWV3UHJvdmlkZXJzOiBbXSxcbiAgICBxdWVyaWVzOiBbXSxcbiAgICB2aWV3UXVlcmllczogW11cbiAgfSk7XG59XG5cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVQaXBlTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSB7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIG5hbWU6IHN0cmluZztcbiAgcHVyZTogYm9vbGVhbjtcbiAgY29uc3RydWN0b3Ioe3R5cGUsIG5hbWUsXG4gICAgICAgICAgICAgICBwdXJlfToge3R5cGU/OiBDb21waWxlVHlwZU1ldGFkYXRhLCBuYW1lPzogc3RyaW5nLCBwdXJlPzogYm9vbGVhbn0gPSB7fSkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnB1cmUgPSBub3JtYWxpemVCb29sKHB1cmUpO1xuICB9XG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpcy50eXBlOyB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVBpcGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlUGlwZU1ldGFkYXRhKHtcbiAgICAgIHR5cGU6IGlzUHJlc2VudChkYXRhWyd0eXBlJ10pID8gQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbihkYXRhWyd0eXBlJ10pIDogZGF0YVsndHlwZSddLFxuICAgICAgbmFtZTogZGF0YVsnbmFtZSddLFxuICAgICAgcHVyZTogZGF0YVsncHVyZSddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAnY2xhc3MnOiAnUGlwZScsXG4gICAgICAndHlwZSc6IGlzUHJlc2VudCh0aGlzLnR5cGUpID8gdGhpcy50eXBlLnRvSnNvbigpIDogbnVsbCxcbiAgICAgICduYW1lJzogdGhpcy5uYW1lLFxuICAgICAgJ3B1cmUnOiB0aGlzLnB1cmVcbiAgICB9O1xuICB9XG59XG5cbnZhciBfQ09NUElMRV9NRVRBREFUQV9GUk9NX0pTT04gPSB7XG4gICdEaXJlY3RpdmUnOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuZnJvbUpzb24sXG4gICdQaXBlJzogQ29tcGlsZVBpcGVNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ1R5cGUnOiBDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uLFxuICAnUHJvdmlkZXInOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ0lkZW50aWZpZXInOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uLFxuICAnRmFjdG9yeSc6IENvbXBpbGVGYWN0b3J5TWV0YWRhdGEuZnJvbUpzb25cbn07XG5cbmZ1bmN0aW9uIGFycmF5RnJvbUpzb24ob2JqOiBhbnlbXSwgZm46IChhOiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYW55KTogYW55IHtcbiAgcmV0dXJuIGlzQmxhbmsob2JqKSA/IG51bGwgOiBvYmoubWFwKG8gPT4gb2JqRnJvbUpzb24obywgZm4pKTtcbn1cblxuZnVuY3Rpb24gYXJyYXlUb0pzb24ob2JqOiBhbnlbXSk6IHN0cmluZyB8IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgcmV0dXJuIGlzQmxhbmsob2JqKSA/IG51bGwgOiBvYmoubWFwKG9ialRvSnNvbik7XG59XG5cbmZ1bmN0aW9uIG9iakZyb21Kc29uKG9iajogYW55LCBmbjogKGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBhbnkpOiBhbnkge1xuICByZXR1cm4gKGlzU3RyaW5nKG9iaikgfHwgaXNCbGFuayhvYmopIHx8IGlzQm9vbGVhbihvYmopIHx8IGlzTnVtYmVyKG9iaikpID8gb2JqIDogZm4ob2JqKTtcbn1cblxuZnVuY3Rpb24gb2JqVG9Kc29uKG9iajogYW55KTogc3RyaW5nIHwge1trZXk6IHN0cmluZ106IGFueX0ge1xuICByZXR1cm4gKGlzU3RyaW5nKG9iaikgfHwgaXNCbGFuayhvYmopIHx8IGlzQm9vbGVhbihvYmopIHx8IGlzTnVtYmVyKG9iaikpID8gb2JqIDogb2JqLnRvSnNvbigpO1xufVxuIl19