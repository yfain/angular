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
    if (lang_1.isArray(obj))
        return arrayFromJson(obj, fn);
    if (lang_1.isString(obj) || lang_1.isBlank(obj) || lang_1.isBoolean(obj) || lang_1.isNumber(obj))
        return obj;
    return fn(obj);
}
function objToJson(obj) {
    if (lang_1.isArray(obj))
        return arrayToJson(obj);
    if (lang_1.isString(obj) || lang_1.isBlank(obj) || lang_1.isBoolean(obj) || lang_1.isNumber(obj))
        return obj;
    return obj.toJson();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC11MDc3Q05MMy50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2RpcmVjdGl2ZV9tZXRhZGF0YS50cyJdLCJuYW1lcyI6WyJDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciIsIkNvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyLmNvbnN0cnVjdG9yIiwiQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIuaWRlbnRpZmllciIsIkNvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIiwiQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUuY29uc3RydWN0b3IiLCJDb21waWxlTWV0YWRhdGFXaXRoVHlwZS50eXBlIiwiQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUuaWRlbnRpZmllciIsIm1ldGFkYXRhRnJvbUpzb24iLCJDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIiwiQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLnRvSnNvbiIsIkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuaWRlbnRpZmllciIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5mcm9tSnNvbiIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS50b0pzb24iLCJDb21waWxlUHJvdmlkZXJNZXRhZGF0YSIsIkNvbXBpbGVQcm92aWRlck1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlUHJvdmlkZXJNZXRhZGF0YS50b0pzb24iLCJDb21waWxlRmFjdG9yeU1ldGFkYXRhIiwiQ29tcGlsZUZhY3RvcnlNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEuaWRlbnRpZmllciIsIkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlRmFjdG9yeU1ldGFkYXRhLnRvSnNvbiIsIkNvbXBpbGVUeXBlTWV0YWRhdGEiLCJDb21waWxlVHlwZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbiIsIkNvbXBpbGVUeXBlTWV0YWRhdGEuaWRlbnRpZmllciIsIkNvbXBpbGVUeXBlTWV0YWRhdGEudHlwZSIsIkNvbXBpbGVUeXBlTWV0YWRhdGEudG9Kc29uIiwiQ29tcGlsZVF1ZXJ5TWV0YWRhdGEiLCJDb21waWxlUXVlcnlNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZVF1ZXJ5TWV0YWRhdGEudG9Kc29uIiwiQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEiLCJDb21waWxlVGVtcGxhdGVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEudG9Kc29uIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNyZWF0ZSIsIkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5pZGVudGlmaWVyIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLnRvSnNvbiIsImNyZWF0ZUhvc3RDb21wb25lbnRNZXRhIiwiQ29tcGlsZVBpcGVNZXRhZGF0YSIsIkNvbXBpbGVQaXBlTWV0YWRhdGEuY29uc3RydWN0b3IiLCJDb21waWxlUGlwZU1ldGFkYXRhLmlkZW50aWZpZXIiLCJDb21waWxlUGlwZU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZVBpcGVNZXRhZGF0YS50b0pzb24iLCJhcnJheUZyb21Kc29uIiwiYXJyYXlUb0pzb24iLCJvYmpGcm9tSnNvbiIsIm9ialRvSnNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFhTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ2hFLGlDQUdPLHFEQUFxRCxDQUFDLENBQUE7QUFDN0QscUJBQTJELGlDQUFpQyxDQUFDLENBQUE7QUFDN0YseUJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QscUJBQTJCLFFBQVEsQ0FBQyxDQUFBO0FBQ3BDLDJCQUFxRCxxQ0FBcUMsQ0FBQyxDQUFBO0FBRTNGLHdDQUF3QztBQUN4QyxrQ0FBa0M7QUFDbEMsSUFBSSxZQUFZLEdBQUcsMENBQTBDLENBQUM7QUFFOUQ7SUFBQUE7SUFJQUMsQ0FBQ0E7SUFEQ0Qsc0JBQUlBLHFEQUFVQTthQUFkQSxjQUE4Q0UsTUFBTUEsQ0FBNEJBLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBQ3BHQSxvQ0FBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxJQUlDO0FBSnFCLHFDQUE2QixnQ0FJbEQsQ0FBQTtBQUVEO0lBQXNERywyQ0FBNkJBO0lBQW5GQTtRQUFzREMsOEJBQTZCQTtJQU1uRkEsQ0FBQ0E7SUFIQ0Qsc0JBQUlBLHlDQUFJQTthQUFSQSxjQUFrQ0UsTUFBTUEsQ0FBc0JBLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBRWhGQSxzQkFBSUEsK0NBQVVBO2FBQWRBLGNBQThDRyxNQUFNQSxDQUE0QkEsMEJBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFDcEdBLDhCQUFDQTtBQUFEQSxDQUFDQSxBQU5ELEVBQXNELDZCQUE2QixFQU1sRjtBQU5xQiwr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Q0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3JCQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQTtnQkFDOUJBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2pDQSxjQUFjQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQTtnQkFDckNBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2pDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQTtnQkFDcENBLENBQUNBO1lBQ0hBLENBQUNBLENBQUNBLENBQUNBO1FBQ0xBLENBQUNBO1FBQ0RBLElBQUlBLFNBQVNBLEdBQTRCQSxFQUFFQSxDQUFDQTtRQUM1Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxVQUFrQkE7Z0JBQ2hDQSxzQ0FBc0NBO2dCQUN0Q0EsMkNBQTJDQTtnQkFDM0NBLElBQUlBLEtBQUtBLEdBQUdBLG1CQUFZQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQSxVQUFVQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0RBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNMQSxDQUFDQTtRQUNEQSxJQUFJQSxVQUFVQSxH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QSxFQUFFQSxDQUFDQSxDQUFDQSxlQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxjQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsZUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7SUFDakZBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0FBQ2pCQSxDQUFDQTtBQUVELG1CQUFtQixHQUFRO0lBQ3pCQyxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUMxQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsY0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLGVBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0lBQ2pGQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtBQUN0QkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIGlzTnVtYmVyLFxuICBpc0Jvb2xlYW4sXG4gIG5vcm1hbGl6ZUJvb2wsXG4gIG5vcm1hbGl6ZUJsYW5rLFxuICBzZXJpYWxpemVFbnVtLFxuICBUeXBlLFxuICBpc1N0cmluZyxcbiAgUmVnRXhwV3JhcHBlcixcbiAgU3RyaW5nV3JhcHBlcixcbiAgaXNBcnJheVxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHt1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENIQU5HRV9ERVRFQ1RJT05fU1RSQVRFR1lfVkFMVUVTXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9uLCBWSUVXX0VOQ0FQU1VMQVRJT05fVkFMVUVTfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7Q3NzU2VsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9zZWxlY3Rvcic7XG5pbXBvcnQge3NwbGl0QXRDb2xvbn0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3MsIExJRkVDWUNMRV9IT09LU19WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9pbnRlcmZhY2VzJztcblxuLy8gZ3JvdXAgMTogXCJwcm9wZXJ0eVwiIGZyb20gXCJbcHJvcGVydHldXCJcbi8vIGdyb3VwIDI6IFwiZXZlbnRcIiBmcm9tIFwiKGV2ZW50KVwiXG52YXIgSE9TVF9SRUdfRVhQID0gL14oPzooPzpcXFsoW15cXF1dKylcXF0pfCg/OlxcKChbXlxcKV0rKVxcKSkpJC9nO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBhYnN0cmFjdCB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiA8Q29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YT51bmltcGxlbWVudGVkKCk7IH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIGV4dGVuZHMgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBhYnN0cmFjdCB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgZ2V0IHR5cGUoKTogQ29tcGlsZVR5cGVNZXRhZGF0YSB7IHJldHVybiA8Q29tcGlsZVR5cGVNZXRhZGF0YT51bmltcGxlbWVudGVkKCk7IH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIDxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhPnVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWV0YWRhdGFGcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGFueSB7XG4gIHJldHVybiBfQ09NUElMRV9NRVRBREFUQV9GUk9NX0pTT05bZGF0YVsnY2xhc3MnXV0oZGF0YSk7XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBydW50aW1lOiBhbnk7XG4gIG5hbWU6IHN0cmluZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIG1vZHVsZVVybDogc3RyaW5nO1xuICBjb25zdENvbnN0cnVjdG9yOiBib29sZWFuO1xuICB2YWx1ZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHtydW50aW1lLCBuYW1lLCBtb2R1bGVVcmwsIHByZWZpeCwgY29uc3RDb25zdHJ1Y3RvciwgdmFsdWV9OiB7XG4gICAgcnVudGltZT86IGFueSxcbiAgICBuYW1lPzogc3RyaW5nLFxuICAgIG1vZHVsZVVybD86IHN0cmluZyxcbiAgICBwcmVmaXg/OiBzdHJpbmcsXG4gICAgY29uc3RDb25zdHJ1Y3Rvcj86IGJvb2xlYW4sXG4gICAgdmFsdWU/OiBhbnlcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5ydW50aW1lID0gcnVudGltZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsO1xuICAgIHRoaXMuY29uc3RDb25zdHJ1Y3RvciA9IGNvbnN0Q29uc3RydWN0b3I7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7XG4gICAgbGV0IHZhbHVlID0gaXNBcnJheShkYXRhWyd2YWx1ZSddKSA/IGFycmF5RnJvbUpzb24oZGF0YVsndmFsdWUnXSwgbWV0YWRhdGFGcm9tSnNvbikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmpGcm9tSnNvbihkYXRhWyd2YWx1ZSddLCBtZXRhZGF0YUZyb21Kc29uKTtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgICAgbmFtZTogZGF0YVsnbmFtZSddLFxuICAgICAgcHJlZml4OiBkYXRhWydwcmVmaXgnXSxcbiAgICAgIG1vZHVsZVVybDogZGF0YVsnbW9kdWxlVXJsJ10sXG4gICAgICBjb25zdENvbnN0cnVjdG9yOiBkYXRhWydjb25zdENvbnN0cnVjdG9yJ10sXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgbGV0IHZhbHVlID0gaXNBcnJheSh0aGlzLnZhbHVlKSA/IGFycmF5VG9Kc29uKHRoaXMudmFsdWUpIDogb2JqVG9Kc29uKHRoaXMudmFsdWUpO1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ2NsYXNzJzogJ0lkZW50aWZpZXInLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAnbW9kdWxlVXJsJzogdGhpcy5tb2R1bGVVcmwsXG4gICAgICAncHJlZml4JzogdGhpcy5wcmVmaXgsXG4gICAgICAnY29uc3RDb25zdHJ1Y3Rvcic6IHRoaXMuY29uc3RDb25zdHJ1Y3RvcixcbiAgICAgICd2YWx1ZSc6IHZhbHVlXG4gICAgfTtcbiAgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgaXNBdHRyaWJ1dGU6IGJvb2xlYW47XG4gIGlzU2VsZjogYm9vbGVhbjtcbiAgaXNIb3N0OiBib29sZWFuO1xuICBpc1NraXBTZWxmOiBib29sZWFuO1xuICBpc09wdGlvbmFsOiBib29sZWFuO1xuICBxdWVyeTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGE7XG4gIHZpZXdRdWVyeTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGE7XG4gIHRva2VuOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHtpc0F0dHJpYnV0ZSwgaXNTZWxmLCBpc0hvc3QsIGlzU2tpcFNlbGYsIGlzT3B0aW9uYWwsIHF1ZXJ5LCB2aWV3UXVlcnksIHRva2VufToge1xuICAgIGlzQXR0cmlidXRlPzogYm9vbGVhbixcbiAgICBpc1NlbGY/OiBib29sZWFuLFxuICAgIGlzSG9zdD86IGJvb2xlYW4sXG4gICAgaXNTa2lwU2VsZj86IGJvb2xlYW4sXG4gICAgaXNPcHRpb25hbD86IGJvb2xlYW4sXG4gICAgcXVlcnk/OiBDb21waWxlUXVlcnlNZXRhZGF0YSxcbiAgICB2aWV3UXVlcnk/OiBDb21waWxlUXVlcnlNZXRhZGF0YSxcbiAgICB0b2tlbj86IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBzdHJpbmdcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5pc0F0dHJpYnV0ZSA9IG5vcm1hbGl6ZUJvb2woaXNBdHRyaWJ1dGUpO1xuICAgIHRoaXMuaXNTZWxmID0gbm9ybWFsaXplQm9vbChpc1NlbGYpO1xuICAgIHRoaXMuaXNIb3N0ID0gbm9ybWFsaXplQm9vbChpc0hvc3QpO1xuICAgIHRoaXMuaXNTa2lwU2VsZiA9IG5vcm1hbGl6ZUJvb2woaXNTa2lwU2VsZik7XG4gICAgdGhpcy5pc09wdGlvbmFsID0gbm9ybWFsaXplQm9vbChpc09wdGlvbmFsKTtcbiAgICB0aGlzLnF1ZXJ5ID0gcXVlcnk7XG4gICAgdGhpcy52aWV3UXVlcnkgPSB2aWV3UXVlcnk7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7XG4gICAgICB0b2tlbjogb2JqRnJvbUpzb24oZGF0YVsndG9rZW4nXSwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICBxdWVyeTogb2JqRnJvbUpzb24oZGF0YVsncXVlcnknXSwgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdmlld1F1ZXJ5OiBvYmpGcm9tSnNvbihkYXRhWyd2aWV3UXVlcnknXSwgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgaXNBdHRyaWJ1dGU6IGRhdGFbJ2lzQXR0cmlidXRlJ10sXG4gICAgICBpc1NlbGY6IGRhdGFbJ2lzU2VsZiddLFxuICAgICAgaXNIb3N0OiBkYXRhWydpc0hvc3QnXSxcbiAgICAgIGlzU2tpcFNlbGY6IGRhdGFbJ2lzU2tpcFNlbGYnXSxcbiAgICAgIGlzT3B0aW9uYWw6IGRhdGFbJ2lzT3B0aW9uYWwnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gTm90ZTogUnVudGltZSB0eXBlIGNhbid0IGJlIHNlcmlhbGl6ZWQuLi5cbiAgICAgICd0b2tlbic6IG9ialRvSnNvbih0aGlzLnRva2VuKSxcbiAgICAgICdxdWVyeSc6IG9ialRvSnNvbih0aGlzLnF1ZXJ5KSxcbiAgICAgICd2aWV3UXVlcnknOiBvYmpUb0pzb24odGhpcy52aWV3UXVlcnkpLFxuICAgICAgJ2lzQXR0cmlidXRlJzogdGhpcy5pc0F0dHJpYnV0ZSxcbiAgICAgICdpc1NlbGYnOiB0aGlzLmlzU2VsZixcbiAgICAgICdpc0hvc3QnOiB0aGlzLmlzSG9zdCxcbiAgICAgICdpc1NraXBTZWxmJzogdGhpcy5pc1NraXBTZWxmLFxuICAgICAgJ2lzT3B0aW9uYWwnOiB0aGlzLmlzT3B0aW9uYWxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB7XG4gIHRva2VuOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nO1xuICB1c2VDbGFzczogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgdXNlVmFsdWU6IGFueTtcbiAgdXNlRXhpc3Rpbmc6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBzdHJpbmc7XG4gIHVzZUZhY3Rvcnk6IENvbXBpbGVGYWN0b3J5TWV0YWRhdGE7XG4gIGRlcHM6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuICBtdWx0aTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih7dG9rZW4sIHVzZUNsYXNzLCB1c2VWYWx1ZSwgdXNlRXhpc3RpbmcsIHVzZUZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICAgIHRva2VuPzogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IHN0cmluZyxcbiAgICB1c2VDbGFzcz86IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgdXNlVmFsdWU/OiBhbnksXG4gICAgdXNlRXhpc3Rpbmc/OiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nLFxuICAgIHVzZUZhY3Rvcnk/OiBDb21waWxlRmFjdG9yeU1ldGFkYXRhLFxuICAgIGRlcHM/OiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXSxcbiAgICBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLnVzZUNsYXNzID0gdXNlQ2xhc3M7XG4gICAgdGhpcy51c2VWYWx1ZSA9IHVzZVZhbHVlO1xuICAgIHRoaXMudXNlRXhpc3RpbmcgPSB1c2VFeGlzdGluZztcbiAgICB0aGlzLnVzZUZhY3RvcnkgPSB1c2VGYWN0b3J5O1xuICAgIHRoaXMuZGVwcyA9IGRlcHM7XG4gICAgdGhpcy5tdWx0aSA9IG11bHRpO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEoe1xuICAgICAgdG9rZW46IG9iakZyb21Kc29uKGRhdGFbJ3Rva2VuJ10sIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdXNlQ2xhc3M6IG9iakZyb21Kc29uKGRhdGFbJ3VzZUNsYXNzJ10sIENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdXNlRXhpc3Rpbmc6IG9iakZyb21Kc29uKGRhdGFbJ3VzZUV4aXN0aW5nJ10sIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdXNlVmFsdWU6IG9iakZyb21Kc29uKGRhdGFbJ3VzZVZhbHVlJ10sIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdXNlRmFjdG9yeTogb2JqRnJvbUpzb24oZGF0YVsndXNlRmFjdG9yeSddLCBDb21waWxlRmFjdG9yeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gTm90ZTogUnVudGltZSB0eXBlIGNhbid0IGJlIHNlcmlhbGl6ZWQuLi5cbiAgICAgICdjbGFzcyc6ICdQcm92aWRlcicsXG4gICAgICAndG9rZW4nOiBvYmpUb0pzb24odGhpcy50b2tlbiksXG4gICAgICAndXNlQ2xhc3MnOiBvYmpUb0pzb24odGhpcy51c2VDbGFzcyksXG4gICAgICAndXNlRXhpc3RpbmcnOiBvYmpUb0pzb24odGhpcy51c2VFeGlzdGluZyksXG4gICAgICAndXNlVmFsdWUnOiBvYmpUb0pzb24odGhpcy51c2VWYWx1ZSksXG4gICAgICAndXNlRmFjdG9yeSc6IG9ialRvSnNvbih0aGlzLnVzZUZhY3RvcnkpXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsXG4gICAgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBydW50aW1lOiBGdW5jdGlvbjtcbiAgbmFtZTogc3RyaW5nO1xuICBwcmVmaXg6IHN0cmluZztcbiAgbW9kdWxlVXJsOiBzdHJpbmc7XG4gIGNvbnN0Q29uc3RydWN0b3I6IGJvb2xlYW47XG4gIHZhbHVlOiBhbnk7XG4gIGRpRGVwczogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW107XG5cbiAgY29uc3RydWN0b3Ioe3J1bnRpbWUsIG5hbWUsIG1vZHVsZVVybCwgcHJlZml4LCBjb25zdENvbnN0cnVjdG9yLCBkaURlcHMsIHZhbHVlfToge1xuICAgIHJ1bnRpbWU/OiBGdW5jdGlvbixcbiAgICBuYW1lPzogc3RyaW5nLFxuICAgIHByZWZpeD86IHN0cmluZyxcbiAgICBtb2R1bGVVcmw/OiBzdHJpbmcsXG4gICAgY29uc3RDb25zdHJ1Y3Rvcj86IGJvb2xlYW4sXG4gICAgdmFsdWU/OiBib29sZWFuLFxuICAgIGRpRGVwcz86IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdXG4gIH0pIHtcbiAgICB0aGlzLnJ1bnRpbWUgPSBydW50aW1lO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wcmVmaXggPSBwcmVmaXg7XG4gICAgdGhpcy5tb2R1bGVVcmwgPSBtb2R1bGVVcmw7XG4gICAgdGhpcy5kaURlcHMgPSBkaURlcHM7XG4gICAgdGhpcy5jb25zdENvbnN0cnVjdG9yID0gY29uc3RDb25zdHJ1Y3RvcjtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXM7IH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlRmFjdG9yeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVGYWN0b3J5TWV0YWRhdGEoe1xuICAgICAgbmFtZTogZGF0YVsnbmFtZSddLFxuICAgICAgcHJlZml4OiBkYXRhWydwcmVmaXgnXSxcbiAgICAgIG1vZHVsZVVybDogZGF0YVsnbW9kdWxlVXJsJ10sXG4gICAgICBjb25zdENvbnN0cnVjdG9yOiBkYXRhWydjb25zdENvbnN0cnVjdG9yJ10sXG4gICAgICB2YWx1ZTogZGF0YVsndmFsdWUnXSxcbiAgICAgIGRpRGVwczogYXJyYXlGcm9tSnNvbihkYXRhWydkaURlcHMnXSwgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2NsYXNzJzogJ0ZhY3RvcnknLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAncHJlZml4JzogdGhpcy5wcmVmaXgsXG4gICAgICAnbW9kdWxlVXJsJzogdGhpcy5tb2R1bGVVcmwsXG4gICAgICAnY29uc3RDb25zdHJ1Y3Rvcic6IHRoaXMuY29uc3RDb25zdHJ1Y3RvcixcbiAgICAgICd2YWx1ZSc6IHRoaXMudmFsdWUsXG4gICAgICAnZGlEZXBzJzogYXJyYXlUb0pzb24odGhpcy5kaURlcHMpXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIHR5cGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlVHlwZU1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSwgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUge1xuICBydW50aW1lOiBUeXBlO1xuICBuYW1lOiBzdHJpbmc7XG4gIHByZWZpeDogc3RyaW5nO1xuICBtb2R1bGVVcmw6IHN0cmluZztcbiAgaXNIb3N0OiBib29sZWFuO1xuICBjb25zdENvbnN0cnVjdG9yOiBib29sZWFuO1xuICB2YWx1ZTogYW55O1xuICBkaURlcHM6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuXG4gIGNvbnN0cnVjdG9yKHtydW50aW1lLCBuYW1lLCBtb2R1bGVVcmwsIHByZWZpeCwgaXNIb3N0LCBjb25zdENvbnN0cnVjdG9yLCB2YWx1ZSwgZGlEZXBzfToge1xuICAgIHJ1bnRpbWU/OiBUeXBlLFxuICAgIG5hbWU/OiBzdHJpbmcsXG4gICAgbW9kdWxlVXJsPzogc3RyaW5nLFxuICAgIHByZWZpeD86IHN0cmluZyxcbiAgICBpc0hvc3Q/OiBib29sZWFuLFxuICAgIGNvbnN0Q29uc3RydWN0b3I/OiBib29sZWFuLFxuICAgIHZhbHVlPzogYW55LFxuICAgIGRpRGVwcz86IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdXG4gIH0gPSB7fSkge1xuICAgIHRoaXMucnVudGltZSA9IHJ1bnRpbWU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybDtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLmlzSG9zdCA9IG5vcm1hbGl6ZUJvb2woaXNIb3N0KTtcbiAgICB0aGlzLmNvbnN0Q29uc3RydWN0b3IgPSBjb25zdENvbnN0cnVjdG9yO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmRpRGVwcyA9IG5vcm1hbGl6ZUJsYW5rKGRpRGVwcyk7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlVHlwZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVUeXBlTWV0YWRhdGEoe1xuICAgICAgbmFtZTogZGF0YVsnbmFtZSddLFxuICAgICAgbW9kdWxlVXJsOiBkYXRhWydtb2R1bGVVcmwnXSxcbiAgICAgIHByZWZpeDogZGF0YVsncHJlZml4J10sXG4gICAgICBpc0hvc3Q6IGRhdGFbJ2lzSG9zdCddLFxuICAgICAgY29uc3RDb25zdHJ1Y3RvcjogZGF0YVsnY29uc3RDb25zdHJ1Y3RvciddLFxuICAgICAgdmFsdWU6IGRhdGFbJ3ZhbHVlJ10sXG4gICAgICBkaURlcHM6IGFycmF5RnJvbUpzb24oZGF0YVsnZGlEZXBzJ10sIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxuICBnZXQgdHlwZSgpOiBDb21waWxlVHlwZU1ldGFkYXRhIHsgcmV0dXJuIHRoaXM7IH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ2NsYXNzJzogJ1R5cGUnLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAnbW9kdWxlVXJsJzogdGhpcy5tb2R1bGVVcmwsXG4gICAgICAncHJlZml4JzogdGhpcy5wcmVmaXgsXG4gICAgICAnaXNIb3N0JzogdGhpcy5pc0hvc3QsXG4gICAgICAnY29uc3RDb25zdHJ1Y3Rvcic6IHRoaXMuY29uc3RDb25zdHJ1Y3RvcixcbiAgICAgICd2YWx1ZSc6IHRoaXMudmFsdWUsXG4gICAgICAnZGlEZXBzJzogYXJyYXlUb0pzb24odGhpcy5kaURlcHMpXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEge1xuICBzZWxlY3RvcnM6IEFycmF5PENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBzdHJpbmc+O1xuICBkZXNjZW5kYW50czogYm9vbGVhbjtcbiAgZmlyc3Q6IGJvb2xlYW47XG4gIHByb3BlcnR5TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHtzZWxlY3RvcnMsIGRlc2NlbmRhbnRzLCBmaXJzdCwgcHJvcGVydHlOYW1lfToge1xuICAgIHNlbGVjdG9ycz86IEFycmF5PENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBzdHJpbmc+LFxuICAgIGRlc2NlbmRhbnRzPzogYm9vbGVhbixcbiAgICBmaXJzdD86IGJvb2xlYW4sXG4gICAgcHJvcGVydHlOYW1lPzogc3RyaW5nXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuc2VsZWN0b3JzID0gc2VsZWN0b3JzO1xuICAgIHRoaXMuZGVzY2VuZGFudHMgPSBkZXNjZW5kYW50cztcbiAgICB0aGlzLmZpcnN0ID0gbm9ybWFsaXplQm9vbChmaXJzdCk7XG4gICAgdGhpcy5wcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWU7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlUXVlcnlNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlUXVlcnlNZXRhZGF0YSh7XG4gICAgICBzZWxlY3RvcnM6IGFycmF5RnJvbUpzb24oZGF0YVsnc2VsZWN0b3JzJ10sIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgZGVzY2VuZGFudHM6IGRhdGFbJ2Rlc2NlbmRhbnRzJ10sXG4gICAgICBmaXJzdDogZGF0YVsnZmlyc3QnXSxcbiAgICAgIHByb3BlcnR5TmFtZTogZGF0YVsncHJvcGVydHlOYW1lJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAnc2VsZWN0b3JzJzogYXJyYXlUb0pzb24odGhpcy5zZWxlY3RvcnMpLFxuICAgICAgJ2Rlc2NlbmRhbnRzJzogdGhpcy5kZXNjZW5kYW50cyxcbiAgICAgICdmaXJzdCc6IHRoaXMuZmlyc3QsXG4gICAgICAncHJvcGVydHlOYW1lJzogdGhpcy5wcm9wZXJ0eU5hbWVcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSB7XG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uO1xuICB0ZW1wbGF0ZTogc3RyaW5nO1xuICB0ZW1wbGF0ZVVybDogc3RyaW5nO1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdO1xuICBjb25zdHJ1Y3Rvcih7ZW5jYXBzdWxhdGlvbiwgdGVtcGxhdGUsIHRlbXBsYXRlVXJsLCBzdHlsZXMsIHN0eWxlVXJscywgbmdDb250ZW50U2VsZWN0b3JzfToge1xuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvbixcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgICBuZ0NvbnRlbnRTZWxlY3RvcnM/OiBzdHJpbmdbXVxuICB9ID0ge30pIHtcbiAgICB0aGlzLmVuY2Fwc3VsYXRpb24gPSBpc1ByZXNlbnQoZW5jYXBzdWxhdGlvbikgPyBlbmNhcHN1bGF0aW9uIDogVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQ7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMudGVtcGxhdGVVcmwgPSB0ZW1wbGF0ZVVybDtcbiAgICB0aGlzLnN0eWxlcyA9IGlzUHJlc2VudChzdHlsZXMpID8gc3R5bGVzIDogW107XG4gICAgdGhpcy5zdHlsZVVybHMgPSBpc1ByZXNlbnQoc3R5bGVVcmxzKSA/IHN0eWxlVXJscyA6IFtdO1xuICAgIHRoaXMubmdDb250ZW50U2VsZWN0b3JzID0gaXNQcmVzZW50KG5nQ29udGVudFNlbGVjdG9ycykgPyBuZ0NvbnRlbnRTZWxlY3RvcnMgOiBbXTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgIGVuY2Fwc3VsYXRpb246IGlzUHJlc2VudChkYXRhWydlbmNhcHN1bGF0aW9uJ10pID9cbiAgICAgICAgICAgICAgICAgICAgICAgICBWSUVXX0VOQ0FQU1VMQVRJT05fVkFMVUVTW2RhdGFbJ2VuY2Fwc3VsYXRpb24nXV0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbJ2VuY2Fwc3VsYXRpb24nXSxcbiAgICAgIHRlbXBsYXRlOiBkYXRhWyd0ZW1wbGF0ZSddLFxuICAgICAgdGVtcGxhdGVVcmw6IGRhdGFbJ3RlbXBsYXRlVXJsJ10sXG4gICAgICBzdHlsZXM6IGRhdGFbJ3N0eWxlcyddLFxuICAgICAgc3R5bGVVcmxzOiBkYXRhWydzdHlsZVVybHMnXSxcbiAgICAgIG5nQ29udGVudFNlbGVjdG9yczogZGF0YVsnbmdDb250ZW50U2VsZWN0b3JzJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdlbmNhcHN1bGF0aW9uJzpcbiAgICAgICAgICBpc1ByZXNlbnQodGhpcy5lbmNhcHN1bGF0aW9uKSA/IHNlcmlhbGl6ZUVudW0odGhpcy5lbmNhcHN1bGF0aW9uKSA6IHRoaXMuZW5jYXBzdWxhdGlvbixcbiAgICAgICd0ZW1wbGF0ZSc6IHRoaXMudGVtcGxhdGUsXG4gICAgICAndGVtcGxhdGVVcmwnOiB0aGlzLnRlbXBsYXRlVXJsLFxuICAgICAgJ3N0eWxlcyc6IHRoaXMuc3R5bGVzLFxuICAgICAgJ3N0eWxlVXJscyc6IHRoaXMuc3R5bGVVcmxzLFxuICAgICAgJ25nQ29udGVudFNlbGVjdG9ycyc6IHRoaXMubmdDb250ZW50U2VsZWN0b3JzXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIGRpcmVjdGl2ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIHtcbiAgc3RhdGljIGNyZWF0ZSh7dHlwZSwgaXNDb21wb25lbnQsIGR5bmFtaWNMb2FkYWJsZSwgc2VsZWN0b3IsIGV4cG9ydEFzLCBjaGFuZ2VEZXRlY3Rpb24sIGlucHV0cyxcbiAgICAgICAgICAgICAgICAgb3V0cHV0cywgaG9zdCwgbGlmZWN5Y2xlSG9va3MsIHByb3ZpZGVycywgdmlld1Byb3ZpZGVycywgcXVlcmllcywgdmlld1F1ZXJpZXMsXG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlfToge1xuICAgIHR5cGU/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIGlzQ29tcG9uZW50PzogYm9vbGVhbixcbiAgICBkeW5hbWljTG9hZGFibGU/OiBib29sZWFuLFxuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgbGlmZWN5Y2xlSG9va3M/OiBMaWZlY3ljbGVIb29rc1tdLFxuICAgIHByb3ZpZGVycz86XG4gICAgICAgIEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBhbnlbXT4sXG4gICAgdmlld1Byb3ZpZGVycz86XG4gICAgICAgIEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBhbnlbXT4sXG4gICAgcXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdmlld1F1ZXJpZXM/OiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIHRlbXBsYXRlPzogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGFcbiAgfSA9IHt9KTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB2YXIgaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICB2YXIgaG9zdFByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgdmFyIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChpc1ByZXNlbnQoaG9zdCkpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChob3N0LCAodmFsdWU6IHN0cmluZywga2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgdmFyIG1hdGNoZXMgPSBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goSE9TVF9SRUdfRVhQLCBrZXkpO1xuICAgICAgICBpZiAoaXNCbGFuayhtYXRjaGVzKSkge1xuICAgICAgICAgIGhvc3RBdHRyaWJ1dGVzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQobWF0Y2hlc1sxXSkpIHtcbiAgICAgICAgICBob3N0UHJvcGVydGllc1ttYXRjaGVzWzFdXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChtYXRjaGVzWzJdKSkge1xuICAgICAgICAgIGhvc3RMaXN0ZW5lcnNbbWF0Y2hlc1syXV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBpbnB1dHNNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGlzUHJlc2VudChpbnB1dHMpKSB7XG4gICAgICBpbnB1dHMuZm9yRWFjaCgoYmluZENvbmZpZzogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBlbFByb3BgXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICAgICAgdmFyIHBhcnRzID0gc3BsaXRBdENvbG9uKGJpbmRDb25maWcsIFtiaW5kQ29uZmlnLCBiaW5kQ29uZmlnXSk7XG4gICAgICAgIGlucHV0c01hcFtwYXJ0c1swXV0gPSBwYXJ0c1sxXTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgb3V0cHV0c01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAoaXNQcmVzZW50KG91dHB1dHMpKSB7XG4gICAgICBvdXRwdXRzLmZvckVhY2goKGJpbmRDb25maWc6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBjYW5vbmljYWwgc3ludGF4OiBgZGlyUHJvcDogZWxQcm9wYFxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBgOmAsIHVzZSBkaXJQcm9wID0gZWxQcm9wXG4gICAgICAgIHZhciBwYXJ0cyA9IHNwbGl0QXRDb2xvbihiaW5kQ29uZmlnLCBbYmluZENvbmZpZywgYmluZENvbmZpZ10pO1xuICAgICAgICBvdXRwdXRzTWFwW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGlzQ29tcG9uZW50OiBub3JtYWxpemVCb29sKGlzQ29tcG9uZW50KSxcbiAgICAgIGR5bmFtaWNMb2FkYWJsZTogbm9ybWFsaXplQm9vbChkeW5hbWljTG9hZGFibGUpLFxuICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgICAgZXhwb3J0QXM6IGV4cG9ydEFzLFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBjaGFuZ2VEZXRlY3Rpb24sXG4gICAgICBpbnB1dHM6IGlucHV0c01hcCxcbiAgICAgIG91dHB1dHM6IG91dHB1dHNNYXAsXG4gICAgICBob3N0TGlzdGVuZXJzOiBob3N0TGlzdGVuZXJzLFxuICAgICAgaG9zdFByb3BlcnRpZXM6IGhvc3RQcm9wZXJ0aWVzLFxuICAgICAgaG9zdEF0dHJpYnV0ZXM6IGhvc3RBdHRyaWJ1dGVzLFxuICAgICAgbGlmZWN5Y2xlSG9va3M6IGlzUHJlc2VudChsaWZlY3ljbGVIb29rcykgPyBsaWZlY3ljbGVIb29rcyA6IFtdLFxuICAgICAgcHJvdmlkZXJzOiBwcm92aWRlcnMsXG4gICAgICB2aWV3UHJvdmlkZXJzOiB2aWV3UHJvdmlkZXJzLFxuICAgICAgcXVlcmllczogcXVlcmllcyxcbiAgICAgIHZpZXdRdWVyaWVzOiB2aWV3UXVlcmllcyxcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICAgIH0pO1xuICB9XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIGlzQ29tcG9uZW50OiBib29sZWFuO1xuICBkeW5hbWljTG9hZGFibGU6IGJvb2xlYW47XG4gIHNlbGVjdG9yOiBzdHJpbmc7XG4gIGV4cG9ydEFzOiBzdHJpbmc7XG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k7XG4gIGlucHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIG91dHB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0TGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdFByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0QXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGxpZmVjeWNsZUhvb2tzOiBMaWZlY3ljbGVIb29rc1tdO1xuICBwcm92aWRlcnM6IEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IGFueVtdPjtcbiAgdmlld1Byb3ZpZGVyczogQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgYW55W10+O1xuICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuICB2aWV3UXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgdGVtcGxhdGU6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhO1xuICBjb25zdHJ1Y3Rvcih7dHlwZSwgaXNDb21wb25lbnQsIGR5bmFtaWNMb2FkYWJsZSwgc2VsZWN0b3IsIGV4cG9ydEFzLCBjaGFuZ2VEZXRlY3Rpb24sIGlucHV0cyxcbiAgICAgICAgICAgICAgIG91dHB1dHMsIGhvc3RMaXN0ZW5lcnMsIGhvc3RQcm9wZXJ0aWVzLCBob3N0QXR0cmlidXRlcywgbGlmZWN5Y2xlSG9va3MsIHByb3ZpZGVycyxcbiAgICAgICAgICAgICAgIHZpZXdQcm92aWRlcnMsIHF1ZXJpZXMsIHZpZXdRdWVyaWVzLCB0ZW1wbGF0ZX06IHtcbiAgICB0eXBlPzogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBpc0NvbXBvbmVudD86IGJvb2xlYW4sXG4gICAgZHluYW1pY0xvYWRhYmxlPzogYm9vbGVhbixcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICBpbnB1dHM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBvdXRwdXRzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdExpc3RlbmVycz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RQcm9wZXJ0aWVzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdEF0dHJpYnV0ZXM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBsaWZlY3ljbGVIb29rcz86IExpZmVjeWNsZUhvb2tzW10sXG4gICAgcHJvdmlkZXJzPzpcbiAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IGFueVtdPixcbiAgICB2aWV3UHJvdmlkZXJzPzpcbiAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IGFueVtdPixcbiAgICBxdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICB2aWV3UXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdGVtcGxhdGU/OiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YVxuICB9ID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuaXNDb21wb25lbnQgPSBpc0NvbXBvbmVudDtcbiAgICB0aGlzLmR5bmFtaWNMb2FkYWJsZSA9IGR5bmFtaWNMb2FkYWJsZTtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgdGhpcy5leHBvcnRBcyA9IGV4cG9ydEFzO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0aW9uID0gY2hhbmdlRGV0ZWN0aW9uO1xuICAgIHRoaXMuaW5wdXRzID0gaW5wdXRzO1xuICAgIHRoaXMub3V0cHV0cyA9IG91dHB1dHM7XG4gICAgdGhpcy5ob3N0TGlzdGVuZXJzID0gaG9zdExpc3RlbmVycztcbiAgICB0aGlzLmhvc3RQcm9wZXJ0aWVzID0gaG9zdFByb3BlcnRpZXM7XG4gICAgdGhpcy5ob3N0QXR0cmlidXRlcyA9IGhvc3RBdHRyaWJ1dGVzO1xuICAgIHRoaXMubGlmZWN5Y2xlSG9va3MgPSBsaWZlY3ljbGVIb29rcztcbiAgICB0aGlzLnByb3ZpZGVycyA9IG5vcm1hbGl6ZUJsYW5rKHByb3ZpZGVycyk7XG4gICAgdGhpcy52aWV3UHJvdmlkZXJzID0gbm9ybWFsaXplQmxhbmsodmlld1Byb3ZpZGVycyk7XG4gICAgdGhpcy5xdWVyaWVzID0gbm9ybWFsaXplQmxhbmsocXVlcmllcyk7XG4gICAgdGhpcy52aWV3UXVlcmllcyA9IG5vcm1hbGl6ZUJsYW5rKHZpZXdRdWVyaWVzKTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXMudHlwZTsgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgaXNDb21wb25lbnQ6IGRhdGFbJ2lzQ29tcG9uZW50J10sXG4gICAgICBkeW5hbWljTG9hZGFibGU6IGRhdGFbJ2R5bmFtaWNMb2FkYWJsZSddLFxuICAgICAgc2VsZWN0b3I6IGRhdGFbJ3NlbGVjdG9yJ10sXG4gICAgICBleHBvcnRBczogZGF0YVsnZXhwb3J0QXMnXSxcbiAgICAgIHR5cGU6IGlzUHJlc2VudChkYXRhWyd0eXBlJ10pID8gQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbihkYXRhWyd0eXBlJ10pIDogZGF0YVsndHlwZSddLFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBpc1ByZXNlbnQoZGF0YVsnY2hhbmdlRGV0ZWN0aW9uJ10pID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIENIQU5HRV9ERVRFQ1RJT05fU1RSQVRFR1lfVkFMVUVTW2RhdGFbJ2NoYW5nZURldGVjdGlvbiddXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWydjaGFuZ2VEZXRlY3Rpb24nXSxcbiAgICAgIGlucHV0czogZGF0YVsnaW5wdXRzJ10sXG4gICAgICBvdXRwdXRzOiBkYXRhWydvdXRwdXRzJ10sXG4gICAgICBob3N0TGlzdGVuZXJzOiBkYXRhWydob3N0TGlzdGVuZXJzJ10sXG4gICAgICBob3N0UHJvcGVydGllczogZGF0YVsnaG9zdFByb3BlcnRpZXMnXSxcbiAgICAgIGhvc3RBdHRyaWJ1dGVzOiBkYXRhWydob3N0QXR0cmlidXRlcyddLFxuICAgICAgbGlmZWN5Y2xlSG9va3M6XG4gICAgICAgICAgKDxhbnlbXT5kYXRhWydsaWZlY3ljbGVIb29rcyddKS5tYXAoaG9va1ZhbHVlID0+IExJRkVDWUNMRV9IT09LU19WQUxVRVNbaG9va1ZhbHVlXSksXG4gICAgICB0ZW1wbGF0ZTogaXNQcmVzZW50KGRhdGFbJ3RlbXBsYXRlJ10pID8gQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEuZnJvbUpzb24oZGF0YVsndGVtcGxhdGUnXSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbJ3RlbXBsYXRlJ10sXG4gICAgICBwcm92aWRlcnM6IGFycmF5RnJvbUpzb24oZGF0YVsncHJvdmlkZXJzJ10sIG1ldGFkYXRhRnJvbUpzb24pLFxuICAgICAgdmlld1Byb3ZpZGVyczogYXJyYXlGcm9tSnNvbihkYXRhWyd2aWV3UHJvdmlkZXJzJ10sIG1ldGFkYXRhRnJvbUpzb24pLFxuICAgICAgcXVlcmllczogYXJyYXlGcm9tSnNvbihkYXRhWydxdWVyaWVzJ10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHZpZXdRdWVyaWVzOiBhcnJheUZyb21Kc29uKGRhdGFbJ3ZpZXdRdWVyaWVzJ10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2NsYXNzJzogJ0RpcmVjdGl2ZScsXG4gICAgICAnaXNDb21wb25lbnQnOiB0aGlzLmlzQ29tcG9uZW50LFxuICAgICAgJ2R5bmFtaWNMb2FkYWJsZSc6IHRoaXMuZHluYW1pY0xvYWRhYmxlLFxuICAgICAgJ3NlbGVjdG9yJzogdGhpcy5zZWxlY3RvcixcbiAgICAgICdleHBvcnRBcyc6IHRoaXMuZXhwb3J0QXMsXG4gICAgICAndHlwZSc6IGlzUHJlc2VudCh0aGlzLnR5cGUpID8gdGhpcy50eXBlLnRvSnNvbigpIDogdGhpcy50eXBlLFxuICAgICAgJ2NoYW5nZURldGVjdGlvbic6IGlzUHJlc2VudCh0aGlzLmNoYW5nZURldGVjdGlvbikgPyBzZXJpYWxpemVFbnVtKHRoaXMuY2hhbmdlRGV0ZWN0aW9uKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0aW9uLFxuICAgICAgJ2lucHV0cyc6IHRoaXMuaW5wdXRzLFxuICAgICAgJ291dHB1dHMnOiB0aGlzLm91dHB1dHMsXG4gICAgICAnaG9zdExpc3RlbmVycyc6IHRoaXMuaG9zdExpc3RlbmVycyxcbiAgICAgICdob3N0UHJvcGVydGllcyc6IHRoaXMuaG9zdFByb3BlcnRpZXMsXG4gICAgICAnaG9zdEF0dHJpYnV0ZXMnOiB0aGlzLmhvc3RBdHRyaWJ1dGVzLFxuICAgICAgJ2xpZmVjeWNsZUhvb2tzJzogdGhpcy5saWZlY3ljbGVIb29rcy5tYXAoaG9vayA9PiBzZXJpYWxpemVFbnVtKGhvb2spKSxcbiAgICAgICd0ZW1wbGF0ZSc6IGlzUHJlc2VudCh0aGlzLnRlbXBsYXRlKSA/IHRoaXMudGVtcGxhdGUudG9Kc29uKCkgOiB0aGlzLnRlbXBsYXRlLFxuICAgICAgJ3Byb3ZpZGVycyc6IGFycmF5VG9Kc29uKHRoaXMucHJvdmlkZXJzKSxcbiAgICAgICd2aWV3UHJvdmlkZXJzJzogYXJyYXlUb0pzb24odGhpcy52aWV3UHJvdmlkZXJzKSxcbiAgICAgICdxdWVyaWVzJzogYXJyYXlUb0pzb24odGhpcy5xdWVyaWVzKSxcbiAgICAgICd2aWV3UXVlcmllcyc6IGFycmF5VG9Kc29uKHRoaXMudmlld1F1ZXJpZXMpXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnN0cnVjdCB7QGxpbmsgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhfSBmcm9tIHtAbGluayBDb21wb25lbnRUeXBlTWV0YWRhdGF9IGFuZCBhIHNlbGVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSG9zdENvbXBvbmVudE1ldGEoY29tcG9uZW50VHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZWxlY3Rvcjogc3RyaW5nKTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgdmFyIHRlbXBsYXRlID0gQ3NzU2VsZWN0b3IucGFyc2UoY29tcG9uZW50U2VsZWN0b3IpWzBdLmdldE1hdGNoaW5nRWxlbWVudFRlbXBsYXRlKCk7XG4gIHJldHVybiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuY3JlYXRlKHtcbiAgICB0eXBlOiBuZXcgQ29tcGlsZVR5cGVNZXRhZGF0YSh7XG4gICAgICBydW50aW1lOiBPYmplY3QsXG4gICAgICBuYW1lOiBgSG9zdCR7Y29tcG9uZW50VHlwZS5uYW1lfWAsXG4gICAgICBtb2R1bGVVcmw6IGNvbXBvbmVudFR5cGUubW9kdWxlVXJsLFxuICAgICAgaXNIb3N0OiB0cnVlXG4gICAgfSksXG4gICAgdGVtcGxhdGU6IG5ldyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YShcbiAgICAgICAge3RlbXBsYXRlOiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmw6ICcnLCBzdHlsZXM6IFtdLCBzdHlsZVVybHM6IFtdLCBuZ0NvbnRlbnRTZWxlY3RvcnM6IFtdfSksXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICAgIGlucHV0czogW10sXG4gICAgb3V0cHV0czogW10sXG4gICAgaG9zdDoge30sXG4gICAgbGlmZWN5Y2xlSG9va3M6IFtdLFxuICAgIGlzQ29tcG9uZW50OiB0cnVlLFxuICAgIGR5bmFtaWNMb2FkYWJsZTogZmFsc2UsXG4gICAgc2VsZWN0b3I6ICcqJyxcbiAgICBwcm92aWRlcnM6IFtdLFxuICAgIHZpZXdQcm92aWRlcnM6IFtdLFxuICAgIHF1ZXJpZXM6IFtdLFxuICAgIHZpZXdRdWVyaWVzOiBbXVxuICB9KTtcbn1cblxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVBpcGVNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIHtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgbmFtZTogc3RyaW5nO1xuICBwdXJlOiBib29sZWFuO1xuICBjb25zdHJ1Y3Rvcih7dHlwZSwgbmFtZSxcbiAgICAgICAgICAgICAgIHB1cmV9OiB7dHlwZT86IENvbXBpbGVUeXBlTWV0YWRhdGEsIG5hbWU/OiBzdHJpbmcsIHB1cmU/OiBib29sZWFufSA9IHt9KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucHVyZSA9IG5vcm1hbGl6ZUJvb2wocHVyZSk7XG4gIH1cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzLnR5cGU7IH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlUGlwZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVQaXBlTWV0YWRhdGEoe1xuICAgICAgdHlwZTogaXNQcmVzZW50KGRhdGFbJ3R5cGUnXSkgPyBDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uKGRhdGFbJ3R5cGUnXSkgOiBkYXRhWyd0eXBlJ10sXG4gICAgICBuYW1lOiBkYXRhWyduYW1lJ10sXG4gICAgICBwdXJlOiBkYXRhWydwdXJlJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdjbGFzcyc6ICdQaXBlJyxcbiAgICAgICd0eXBlJzogaXNQcmVzZW50KHRoaXMudHlwZSkgPyB0aGlzLnR5cGUudG9Kc29uKCkgOiBudWxsLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAncHVyZSc6IHRoaXMucHVyZVxuICAgIH07XG4gIH1cbn1cblxudmFyIF9DT01QSUxFX01FVEFEQVRBX0ZST01fSlNPTiA9IHtcbiAgJ0RpcmVjdGl2ZSc6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ1BpcGUnOiBDb21waWxlUGlwZU1ldGFkYXRhLmZyb21Kc29uLFxuICAnVHlwZSc6IENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24sXG4gICdQcm92aWRlcic6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhLmZyb21Kc29uLFxuICAnSWRlbnRpZmllcic6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24sXG4gICdGYWN0b3J5JzogQ29tcGlsZUZhY3RvcnlNZXRhZGF0YS5mcm9tSnNvblxufTtcblxuZnVuY3Rpb24gYXJyYXlGcm9tSnNvbihvYmo6IGFueVtdLCBmbjogKGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBhbnkpOiBhbnkge1xuICByZXR1cm4gaXNCbGFuayhvYmopID8gbnVsbCA6IG9iai5tYXAobyA9PiBvYmpGcm9tSnNvbihvLCBmbikpO1xufVxuXG5mdW5jdGlvbiBhcnJheVRvSnNvbihvYmo6IGFueVtdKTogc3RyaW5nIHwge1trZXk6IHN0cmluZ106IGFueX0ge1xuICByZXR1cm4gaXNCbGFuayhvYmopID8gbnVsbCA6IG9iai5tYXAob2JqVG9Kc29uKTtcbn1cblxuZnVuY3Rpb24gb2JqRnJvbUpzb24ob2JqOiBhbnksIGZuOiAoYToge1trZXk6IHN0cmluZ106IGFueX0pID0+IGFueSk6IGFueSB7XG4gIGlmIChpc0FycmF5KG9iaikpIHJldHVybiBhcnJheUZyb21Kc29uKG9iaiwgZm4pO1xuICBpZiAoaXNTdHJpbmcob2JqKSB8fCBpc0JsYW5rKG9iaikgfHwgaXNCb29sZWFuKG9iaikgfHwgaXNOdW1iZXIob2JqKSkgcmV0dXJuIG9iajtcbiAgcmV0dXJuIGZuKG9iaik7XG59XG5cbmZ1bmN0aW9uIG9ialRvSnNvbihvYmo6IGFueSk6IHN0cmluZyB8IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgaWYgKGlzQXJyYXkob2JqKSkgcmV0dXJuIGFycmF5VG9Kc29uKG9iaik7XG4gIGlmIChpc1N0cmluZyhvYmopIHx8IGlzQmxhbmsob2JqKSB8fCBpc0Jvb2xlYW4ob2JqKSB8fCBpc051bWJlcihvYmopKSByZXR1cm4gb2JqO1xuICByZXR1cm4gb2JqLnRvSnNvbigpO1xufVxuIl19