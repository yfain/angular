import { isPresent, isBlank, isNumber, isBoolean, normalizeBool, normalizeBlank, serializeEnum, isString, RegExpWrapper, isArray } from 'angular2/src/facade/lang';
import { unimplemented } from 'angular2/src/facade/exceptions';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES } from 'angular2/src/core/change_detection/change_detection';
import { ViewEncapsulation, VIEW_ENCAPSULATION_VALUES } from 'angular2/src/core/metadata/view';
import { CssSelector } from 'angular2/src/compiler/selector';
import { splitAtColon } from './util';
import { LIFECYCLE_HOOKS_VALUES } from 'angular2/src/core/linker/interfaces';
// group 1: "property" from "[property]"
// group 2: "event" from "(event)"
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))$/g;
export class CompileMetadataWithIdentifier {
    get identifier() { return unimplemented(); }
}
export class CompileMetadataWithType extends CompileMetadataWithIdentifier {
    get type() { return unimplemented(); }
    get identifier() { return unimplemented(); }
}
export function metadataFromJson(data) {
    return _COMPILE_METADATA_FROM_JSON[data['class']](data);
}
export class CompileIdentifierMetadata {
    constructor({ runtime, name, moduleUrl, prefix, constConstructor, value } = {}) {
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.constConstructor = constConstructor;
        this.value = value;
    }
    static fromJson(data) {
        let value = isArray(data['value']) ? arrayFromJson(data['value'], metadataFromJson) :
            objFromJson(data['value'], metadataFromJson);
        return new CompileIdentifierMetadata({
            name: data['name'],
            prefix: data['prefix'],
            moduleUrl: data['moduleUrl'],
            constConstructor: data['constConstructor'],
            value: value
        });
    }
    toJson() {
        let value = isArray(this.value) ? arrayToJson(this.value) : objToJson(this.value);
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Identifier',
            'name': this.name,
            'moduleUrl': this.moduleUrl,
            'prefix': this.prefix,
            'constConstructor': this.constConstructor,
            'value': value
        };
    }
    get identifier() { return this; }
}
export class CompileDiDependencyMetadata {
    constructor({ isAttribute, isSelf, isHost, isSkipSelf, isOptional, query, viewQuery, token } = {}) {
        this.isAttribute = normalizeBool(isAttribute);
        this.isSelf = normalizeBool(isSelf);
        this.isHost = normalizeBool(isHost);
        this.isSkipSelf = normalizeBool(isSkipSelf);
        this.isOptional = normalizeBool(isOptional);
        this.query = query;
        this.viewQuery = viewQuery;
        this.token = token;
    }
    static fromJson(data) {
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
    }
    toJson() {
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
    }
}
export class CompileProviderMetadata {
    constructor({ token, useClass, useValue, useExisting, useFactory, deps, multi }) {
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.deps = deps;
        this.multi = multi;
    }
    static fromJson(data) {
        return new CompileProviderMetadata({
            token: objFromJson(data['token'], CompileIdentifierMetadata.fromJson),
            useClass: objFromJson(data['useClass'], CompileTypeMetadata.fromJson),
            useExisting: objFromJson(data['useExisting'], CompileIdentifierMetadata.fromJson),
            useValue: objFromJson(data['useValue'], CompileIdentifierMetadata.fromJson),
            useFactory: objFromJson(data['useFactory'], CompileFactoryMetadata.fromJson)
        });
    }
    toJson() {
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Provider',
            'token': objToJson(this.token),
            'useClass': objToJson(this.useClass),
            'useExisting': objToJson(this.useExisting),
            'useValue': objToJson(this.useValue),
            'useFactory': objToJson(this.useFactory)
        };
    }
}
export class CompileFactoryMetadata {
    constructor({ runtime, name, moduleUrl, prefix, constConstructor, diDeps, value }) {
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.diDeps = diDeps;
        this.constConstructor = constConstructor;
        this.value = value;
    }
    get identifier() { return this; }
    static fromJson(data) {
        return new CompileFactoryMetadata({
            name: data['name'],
            prefix: data['prefix'],
            moduleUrl: data['moduleUrl'],
            constConstructor: data['constConstructor'],
            value: data['value'],
            diDeps: arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
        });
    }
    toJson() {
        return {
            'class': 'Factory',
            'name': this.name,
            'prefix': this.prefix,
            'moduleUrl': this.moduleUrl,
            'constConstructor': this.constConstructor,
            'value': this.value,
            'diDeps': arrayToJson(this.diDeps)
        };
    }
}
/**
 * Metadata regarding compilation of a type.
 */
export class CompileTypeMetadata {
    constructor({ runtime, name, moduleUrl, prefix, isHost, constConstructor, value, diDeps } = {}) {
        this.runtime = runtime;
        this.name = name;
        this.moduleUrl = moduleUrl;
        this.prefix = prefix;
        this.isHost = normalizeBool(isHost);
        this.constConstructor = constConstructor;
        this.value = value;
        this.diDeps = normalizeBlank(diDeps);
    }
    static fromJson(data) {
        return new CompileTypeMetadata({
            name: data['name'],
            moduleUrl: data['moduleUrl'],
            prefix: data['prefix'],
            isHost: data['isHost'],
            constConstructor: data['constConstructor'],
            value: data['value'],
            diDeps: arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
        });
    }
    get identifier() { return this; }
    get type() { return this; }
    toJson() {
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
    }
}
export class CompileQueryMetadata {
    constructor({ selectors, descendants, first, propertyName } = {}) {
        this.selectors = selectors;
        this.descendants = descendants;
        this.first = normalizeBool(first);
        this.propertyName = propertyName;
    }
    static fromJson(data) {
        return new CompileQueryMetadata({
            selectors: arrayFromJson(data['selectors'], CompileIdentifierMetadata.fromJson),
            descendants: data['descendants'],
            first: data['first'],
            propertyName: data['propertyName']
        });
    }
    toJson() {
        return {
            // Note: Runtime type can't be serialized...
            'selectors': arrayToJson(this.selectors),
            'descendants': this.descendants,
            'first': this.first,
            'propertyName': this.propertyName
        };
    }
}
/**
 * Metadata regarding compilation of a template.
 */
export class CompileTemplateMetadata {
    constructor({ encapsulation, template, templateUrl, styles, styleUrls, ngContentSelectors } = {}) {
        this.encapsulation = isPresent(encapsulation) ? encapsulation : ViewEncapsulation.Emulated;
        this.template = template;
        this.templateUrl = templateUrl;
        this.styles = isPresent(styles) ? styles : [];
        this.styleUrls = isPresent(styleUrls) ? styleUrls : [];
        this.ngContentSelectors = isPresent(ngContentSelectors) ? ngContentSelectors : [];
    }
    static fromJson(data) {
        return new CompileTemplateMetadata({
            encapsulation: isPresent(data['encapsulation']) ?
                VIEW_ENCAPSULATION_VALUES[data['encapsulation']] :
                data['encapsulation'],
            template: data['template'],
            templateUrl: data['templateUrl'],
            styles: data['styles'],
            styleUrls: data['styleUrls'],
            ngContentSelectors: data['ngContentSelectors']
        });
    }
    toJson() {
        return {
            'encapsulation': isPresent(this.encapsulation) ? serializeEnum(this.encapsulation) :
                this.encapsulation,
            'template': this.template,
            'templateUrl': this.templateUrl,
            'styles': this.styles,
            'styleUrls': this.styleUrls,
            'ngContentSelectors': this.ngContentSelectors
        };
    }
}
/**
 * Metadata regarding compilation of a directive.
 */
export class CompileDirectiveMetadata {
    constructor({ type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs, outputs, hostListeners, hostProperties, hostAttributes, lifecycleHooks, providers, viewProviders, queries, viewQueries, template } = {}) {
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
        this.providers = normalizeBlank(providers);
        this.viewProviders = normalizeBlank(viewProviders);
        this.queries = normalizeBlank(queries);
        this.viewQueries = normalizeBlank(viewQueries);
        this.template = template;
    }
    static create({ type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs, outputs, host, lifecycleHooks, providers, viewProviders, queries, viewQueries, template } = {}) {
        var hostListeners = {};
        var hostProperties = {};
        var hostAttributes = {};
        if (isPresent(host)) {
            StringMapWrapper.forEach(host, (value, key) => {
                var matches = RegExpWrapper.firstMatch(HOST_REG_EXP, key);
                if (isBlank(matches)) {
                    hostAttributes[key] = value;
                }
                else if (isPresent(matches[1])) {
                    hostProperties[matches[1]] = value;
                }
                else if (isPresent(matches[2])) {
                    hostListeners[matches[2]] = value;
                }
            });
        }
        var inputsMap = {};
        if (isPresent(inputs)) {
            inputs.forEach((bindConfig) => {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                inputsMap[parts[0]] = parts[1];
            });
        }
        var outputsMap = {};
        if (isPresent(outputs)) {
            outputs.forEach((bindConfig) => {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                outputsMap[parts[0]] = parts[1];
            });
        }
        return new CompileDirectiveMetadata({
            type: type,
            isComponent: normalizeBool(isComponent),
            dynamicLoadable: normalizeBool(dynamicLoadable),
            selector: selector,
            exportAs: exportAs,
            changeDetection: changeDetection,
            inputs: inputsMap,
            outputs: outputsMap,
            hostListeners: hostListeners,
            hostProperties: hostProperties,
            hostAttributes: hostAttributes,
            lifecycleHooks: isPresent(lifecycleHooks) ? lifecycleHooks : [],
            providers: providers,
            viewProviders: viewProviders,
            queries: queries,
            viewQueries: viewQueries,
            template: template
        });
    }
    get identifier() { return this.type; }
    static fromJson(data) {
        return new CompileDirectiveMetadata({
            isComponent: data['isComponent'],
            dynamicLoadable: data['dynamicLoadable'],
            selector: data['selector'],
            exportAs: data['exportAs'],
            type: isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
            changeDetection: isPresent(data['changeDetection']) ?
                CHANGE_DETECTION_STRATEGY_VALUES[data['changeDetection']] :
                data['changeDetection'],
            inputs: data['inputs'],
            outputs: data['outputs'],
            hostListeners: data['hostListeners'],
            hostProperties: data['hostProperties'],
            hostAttributes: data['hostAttributes'],
            lifecycleHooks: data['lifecycleHooks'].map(hookValue => LIFECYCLE_HOOKS_VALUES[hookValue]),
            template: isPresent(data['template']) ? CompileTemplateMetadata.fromJson(data['template']) :
                data['template'],
            providers: arrayFromJson(data['providers'], metadataFromJson),
            viewProviders: arrayFromJson(data['viewProviders'], metadataFromJson),
            queries: arrayFromJson(data['queries'], CompileQueryMetadata.fromJson),
            viewQueries: arrayFromJson(data['viewQueries'], CompileQueryMetadata.fromJson)
        });
    }
    toJson() {
        return {
            'class': 'Directive',
            'isComponent': this.isComponent,
            'dynamicLoadable': this.dynamicLoadable,
            'selector': this.selector,
            'exportAs': this.exportAs,
            'type': isPresent(this.type) ? this.type.toJson() : this.type,
            'changeDetection': isPresent(this.changeDetection) ? serializeEnum(this.changeDetection) :
                this.changeDetection,
            'inputs': this.inputs,
            'outputs': this.outputs,
            'hostListeners': this.hostListeners,
            'hostProperties': this.hostProperties,
            'hostAttributes': this.hostAttributes,
            'lifecycleHooks': this.lifecycleHooks.map(hook => serializeEnum(hook)),
            'template': isPresent(this.template) ? this.template.toJson() : this.template,
            'providers': arrayToJson(this.providers),
            'viewProviders': arrayToJson(this.viewProviders),
            'queries': arrayToJson(this.queries),
            'viewQueries': arrayToJson(this.viewQueries)
        };
    }
}
/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
export function createHostComponentMeta(componentType, componentSelector) {
    var template = CssSelector.parse(componentSelector)[0].getMatchingElementTemplate();
    return CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({
            runtime: Object,
            name: `Host${componentType.name}`,
            moduleUrl: componentType.moduleUrl,
            isHost: true
        }),
        template: new CompileTemplateMetadata({ template: template, templateUrl: '', styles: [], styleUrls: [], ngContentSelectors: [] }),
        changeDetection: ChangeDetectionStrategy.Default,
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
export class CompilePipeMetadata {
    constructor({ type, name, pure } = {}) {
        this.type = type;
        this.name = name;
        this.pure = normalizeBool(pure);
    }
    get identifier() { return this.type; }
    static fromJson(data) {
        return new CompilePipeMetadata({
            type: isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
            name: data['name'],
            pure: data['pure']
        });
    }
    toJson() {
        return {
            'class': 'Pipe',
            'type': isPresent(this.type) ? this.type.toJson() : null,
            'name': this.name,
            'pure': this.pure
        };
    }
}
var _COMPILE_METADATA_FROM_JSON = {
    'Directive': CompileDirectiveMetadata.fromJson,
    'Pipe': CompilePipeMetadata.fromJson,
    'Type': CompileTypeMetadata.fromJson,
    'Provider': CompileProviderMetadata.fromJson,
    'Identifier': CompileIdentifierMetadata.fromJson,
    'Factory': CompileFactoryMetadata.fromJson
};
function arrayFromJson(obj, fn) {
    return isBlank(obj) ? null : obj.map(o => objFromJson(o, fn));
}
function arrayToJson(obj) {
    return isBlank(obj) ? null : obj.map(objToJson);
}
function objFromJson(obj, fn) {
    if (isArray(obj))
        return arrayFromJson(obj, fn);
    if (isString(obj) || isBlank(obj) || isBoolean(obj) || isNumber(obj))
        return obj;
    return fn(obj);
}
function objToJson(obj) {
    if (isArray(obj))
        return arrayToJson(obj);
    if (isString(obj) || isBlank(obj) || isBoolean(obj) || isNumber(obj))
        return obj;
    return obj.toJson();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WdmlwQ0JVUC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2RpcmVjdGl2ZV9tZXRhZGF0YS50cyJdLCJuYW1lcyI6WyJDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciIsIkNvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyLmlkZW50aWZpZXIiLCJDb21waWxlTWV0YWRhdGFXaXRoVHlwZSIsIkNvbXBpbGVNZXRhZGF0YVdpdGhUeXBlLnR5cGUiLCJDb21waWxlTWV0YWRhdGFXaXRoVHlwZS5pZGVudGlmaWVyIiwibWV0YWRhdGFGcm9tSnNvbiIsIkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEiLCJDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5mcm9tSnNvbiIsIkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEudG9Kc29uIiwiQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5pZGVudGlmaWVyIiwiQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIiwiQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLnRvSnNvbiIsIkNvbXBpbGVQcm92aWRlck1ldGFkYXRhIiwiQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEuY29uc3RydWN0b3IiLCJDb21waWxlUHJvdmlkZXJNZXRhZGF0YS5mcm9tSnNvbiIsIkNvbXBpbGVQcm92aWRlck1ldGFkYXRhLnRvSnNvbiIsIkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEiLCJDb21waWxlRmFjdG9yeU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZUZhY3RvcnlNZXRhZGF0YS5pZGVudGlmaWVyIiwiQ29tcGlsZUZhY3RvcnlNZXRhZGF0YS5mcm9tSnNvbiIsIkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEudG9Kc29uIiwiQ29tcGlsZVR5cGVNZXRhZGF0YSIsIkNvbXBpbGVUeXBlTWV0YWRhdGEuY29uc3RydWN0b3IiLCJDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZVR5cGVNZXRhZGF0YS5pZGVudGlmaWVyIiwiQ29tcGlsZVR5cGVNZXRhZGF0YS50eXBlIiwiQ29tcGlsZVR5cGVNZXRhZGF0YS50b0pzb24iLCJDb21waWxlUXVlcnlNZXRhZGF0YSIsIkNvbXBpbGVRdWVyeU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlUXVlcnlNZXRhZGF0YS50b0pzb24iLCJDb21waWxlVGVtcGxhdGVNZXRhZGF0YSIsIkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlVGVtcGxhdGVNZXRhZGF0YS50b0pzb24iLCJDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEiLCJDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuY29uc3RydWN0b3IiLCJDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuY3JlYXRlIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmlkZW50aWZpZXIiLCJDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEudG9Kc29uIiwiY3JlYXRlSG9zdENvbXBvbmVudE1ldGEiLCJDb21waWxlUGlwZU1ldGFkYXRhIiwiQ29tcGlsZVBpcGVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVQaXBlTWV0YWRhdGEuaWRlbnRpZmllciIsIkNvbXBpbGVQaXBlTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlUGlwZU1ldGFkYXRhLnRvSnNvbiIsImFy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LENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0lBQ2pGQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUNqQkEsQ0FBQ0E7QUFFRCxtQkFBbUIsR0FBUTtJQUN6QkMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDMUNBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0lBQ2pGQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtBQUN0QkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgaXNOdW1iZXIsIGlzQm9vbGVhbiwgbm9ybWFsaXplQm9vbCwgbm9ybWFsaXplQmxhbmssIHNlcmlhbGl6ZUVudW0sIFR5cGUsIGlzU3RyaW5nLCBSZWdFeHBXcmFwcGVyLCBTdHJpbmdXcmFwcGVyLCBpc0FycmF5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHt1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ0hBTkdFX0RFVEVDVElPTl9TVFJBVEVHWV9WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9uLCBWSUVXX0VOQ0FQU1VMQVRJT05fVkFMVUVTfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7Q3NzU2VsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9zZWxlY3Rvcic7XG5pbXBvcnQge3NwbGl0QXRDb2xvbn0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3MsIExJRkVDWUNMRV9IT09LU19WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9pbnRlcmZhY2VzJztcblxuLy8gZ3JvdXAgMTogXCJwcm9wZXJ0eVwiIGZyb20gXCJbcHJvcGVydHldXCJcbi8vIGdyb3VwIDI6IFwiZXZlbnRcIiBmcm9tIFwiKGV2ZW50KVwiXG52YXIgSE9TVF9SRUdfRVhQID0gL14oPzooPzpcXFsoW15cXF1dKylcXF0pfCg/OlxcKChbXlxcKV0rKVxcKSkpJC9nO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBhYnN0cmFjdCB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiA8Q29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YT51bmltcGxlbWVudGVkKCk7IH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIGV4dGVuZHMgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBhYnN0cmFjdCB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgZ2V0IHR5cGUoKTogQ29tcGlsZVR5cGVNZXRhZGF0YSB7IHJldHVybiA8Q29tcGlsZVR5cGVNZXRhZGF0YT51bmltcGxlbWVudGVkKCk7IH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIDxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhPnVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWV0YWRhdGFGcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGFueSB7XG4gIHJldHVybiBfQ09NUElMRV9NRVRBREFUQV9GUk9NX0pTT05bZGF0YVsnY2xhc3MnXV0oZGF0YSk7XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICBydW50aW1lOiBhbnk7XG4gIG5hbWU6IHN0cmluZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIG1vZHVsZVVybDogc3RyaW5nO1xuICBjb25zdENvbnN0cnVjdG9yOiBib29sZWFuO1xuICB2YWx1ZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHtydW50aW1lLCBuYW1lLCBtb2R1bGVVcmwsIHByZWZpeCwgY29uc3RDb25zdHJ1Y3RvciwgdmFsdWV9OiB7XG4gICAgcnVudGltZT86IGFueSxcbiAgICBuYW1lPzogc3RyaW5nLFxuICAgIG1vZHVsZVVybD86IHN0cmluZyxcbiAgICBwcmVmaXg/OiBzdHJpbmcsXG4gICAgY29uc3RDb25zdHJ1Y3Rvcj86IGJvb2xlYW4sXG4gICAgdmFsdWU/OiBhbnlcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5ydW50aW1lID0gcnVudGltZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsO1xuICAgIHRoaXMuY29uc3RDb25zdHJ1Y3RvciA9IGNvbnN0Q29uc3RydWN0b3I7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7XG4gICAgbGV0IHZhbHVlID0gaXNBcnJheShkYXRhWyd2YWx1ZSddKSA/IGFycmF5RnJvbUpzb24oZGF0YVsndmFsdWUnXSwgbWV0YWRhdGFGcm9tSnNvbikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmpGcm9tSnNvbihkYXRhWyd2YWx1ZSddLCBtZXRhZGF0YUZyb21Kc29uKTtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgICAgbmFtZTogZGF0YVsnbmFtZSddLFxuICAgICAgcHJlZml4OiBkYXRhWydwcmVmaXgnXSxcbiAgICAgIG1vZHVsZVVybDogZGF0YVsnbW9kdWxlVXJsJ10sXG4gICAgICBjb25zdENvbnN0cnVjdG9yOiBkYXRhWydjb25zdENvbnN0cnVjdG9yJ10sXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgbGV0IHZhbHVlID0gaXNBcnJheSh0aGlzLnZhbHVlKSA/IGFycmF5VG9Kc29uKHRoaXMudmFsdWUpIDogb2JqVG9Kc29uKHRoaXMudmFsdWUpO1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ2NsYXNzJzogJ0lkZW50aWZpZXInLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAnbW9kdWxlVXJsJzogdGhpcy5tb2R1bGVVcmwsXG4gICAgICAncHJlZml4JzogdGhpcy5wcmVmaXgsXG4gICAgICAnY29uc3RDb25zdHJ1Y3Rvcic6IHRoaXMuY29uc3RDb25zdHJ1Y3RvcixcbiAgICAgICd2YWx1ZSc6IHZhbHVlXG4gICAgfTtcbiAgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgaXNBdHRyaWJ1dGU6IGJvb2xlYW47XG4gIGlzU2VsZjogYm9vbGVhbjtcbiAgaXNIb3N0OiBib29sZWFuO1xuICBpc1NraXBTZWxmOiBib29sZWFuO1xuICBpc09wdGlvbmFsOiBib29sZWFuO1xuICBxdWVyeTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGE7XG4gIHZpZXdRdWVyeTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGE7XG4gIHRva2VuOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih7aXNBdHRyaWJ1dGUsIGlzU2VsZiwgaXNIb3N0LCBpc1NraXBTZWxmLCBpc09wdGlvbmFsLCBxdWVyeSwgdmlld1F1ZXJ5LCB0b2tlbn06IHtcbiAgICBpc0F0dHJpYnV0ZT86IGJvb2xlYW4sXG4gICAgaXNTZWxmPzogYm9vbGVhbixcbiAgICBpc0hvc3Q/OiBib29sZWFuLFxuICAgIGlzU2tpcFNlbGY/OiBib29sZWFuLFxuICAgIGlzT3B0aW9uYWw/OiBib29sZWFuLFxuICAgIHF1ZXJ5PzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gICAgdmlld1F1ZXJ5PzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gICAgdG9rZW4/OiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfHN0cmluZ1xuICB9ID0ge30pIHtcbiAgICB0aGlzLmlzQXR0cmlidXRlID0gbm9ybWFsaXplQm9vbChpc0F0dHJpYnV0ZSk7XG4gICAgdGhpcy5pc1NlbGYgPSBub3JtYWxpemVCb29sKGlzU2VsZik7XG4gICAgdGhpcy5pc0hvc3QgPSBub3JtYWxpemVCb29sKGlzSG9zdCk7XG4gICAgdGhpcy5pc1NraXBTZWxmID0gbm9ybWFsaXplQm9vbChpc1NraXBTZWxmKTtcbiAgICB0aGlzLmlzT3B0aW9uYWwgPSBub3JtYWxpemVCb29sKGlzT3B0aW9uYWwpO1xuICAgIHRoaXMucXVlcnkgPSBxdWVyeTtcbiAgICB0aGlzLnZpZXdRdWVyeSA9IHZpZXdRdWVyeTtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHtcbiAgICAgIHRva2VuOiBvYmpGcm9tSnNvbihkYXRhWyd0b2tlbiddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHF1ZXJ5OiBvYmpGcm9tSnNvbihkYXRhWydxdWVyeSddLCBDb21waWxlUXVlcnlNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB2aWV3UXVlcnk6IG9iakZyb21Kc29uKGRhdGFbJ3ZpZXdRdWVyeSddLCBDb21waWxlUXVlcnlNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICBpc0F0dHJpYnV0ZTogZGF0YVsnaXNBdHRyaWJ1dGUnXSxcbiAgICAgIGlzU2VsZjogZGF0YVsnaXNTZWxmJ10sXG4gICAgICBpc0hvc3Q6IGRhdGFbJ2lzSG9zdCddLFxuICAgICAgaXNTa2lwU2VsZjogZGF0YVsnaXNTa2lwU2VsZiddLFxuICAgICAgaXNPcHRpb25hbDogZGF0YVsnaXNPcHRpb25hbCddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ3Rva2VuJzogb2JqVG9Kc29uKHRoaXMudG9rZW4pLFxuICAgICAgJ3F1ZXJ5Jzogb2JqVG9Kc29uKHRoaXMucXVlcnkpLFxuICAgICAgJ3ZpZXdRdWVyeSc6IG9ialRvSnNvbih0aGlzLnZpZXdRdWVyeSksXG4gICAgICAnaXNBdHRyaWJ1dGUnOiB0aGlzLmlzQXR0cmlidXRlLFxuICAgICAgJ2lzU2VsZic6IHRoaXMuaXNTZWxmLFxuICAgICAgJ2lzSG9zdCc6IHRoaXMuaXNIb3N0LFxuICAgICAgJ2lzU2tpcFNlbGYnOiB0aGlzLmlzU2tpcFNlbGYsXG4gICAgICAnaXNPcHRpb25hbCc6IHRoaXMuaXNPcHRpb25hbFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgdG9rZW46IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF8c3RyaW5nO1xuICB1c2VDbGFzczogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgdXNlVmFsdWU6IGFueTtcbiAgdXNlRXhpc3Rpbmc6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF8c3RyaW5nO1xuICB1c2VGYWN0b3J5OiBDb21waWxlRmFjdG9yeU1ldGFkYXRhO1xuICBkZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbiAgbXVsdGk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioe3Rva2VuLCB1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB0b2tlbj86IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBzdHJpbmcsXG4gICAgdXNlQ2xhc3M/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIHVzZVZhbHVlPzogYW55LFxuICAgIHVzZUV4aXN0aW5nPzogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YXxzdHJpbmcsXG4gICAgdXNlRmFjdG9yeT86IENvbXBpbGVGYWN0b3J5TWV0YWRhdGEsXG4gICAgZGVwcz86IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdLFxuICAgIG11bHRpPzogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIHRoaXMudXNlQ2xhc3MgPSB1c2VDbGFzcztcbiAgICB0aGlzLnVzZVZhbHVlID0gdXNlVmFsdWU7XG4gICAgdGhpcy51c2VFeGlzdGluZyA9IHVzZUV4aXN0aW5nO1xuICAgIHRoaXMudXNlRmFjdG9yeSA9IHVzZUZhY3Rvcnk7XG4gICAgdGhpcy5kZXBzID0gZGVwcztcbiAgICB0aGlzLm11bHRpID0gbXVsdGk7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSh7XG4gICAgICB0b2tlbjogb2JqRnJvbUpzb24oZGF0YVsndG9rZW4nXSwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB1c2VDbGFzczogb2JqRnJvbUpzb24oZGF0YVsndXNlQ2xhc3MnXSwgQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB1c2VFeGlzdGluZzogb2JqRnJvbUpzb24oZGF0YVsndXNlRXhpc3RpbmcnXSwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB1c2VWYWx1ZTogb2JqRnJvbUpzb24oZGF0YVsndXNlVmFsdWUnXSwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB1c2VGYWN0b3J5OiBvYmpGcm9tSnNvbihkYXRhWyd1c2VGYWN0b3J5J10sIENvbXBpbGVGYWN0b3J5TWV0YWRhdGEuZnJvbUpzb24pXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ2NsYXNzJzogJ1Byb3ZpZGVyJyxcbiAgICAgICd0b2tlbic6IG9ialRvSnNvbih0aGlzLnRva2VuKSxcbiAgICAgICd1c2VDbGFzcyc6IG9ialRvSnNvbih0aGlzLnVzZUNsYXNzKSxcbiAgICAgICd1c2VFeGlzdGluZyc6IG9ialRvSnNvbih0aGlzLnVzZUV4aXN0aW5nKSxcbiAgICAgICd1c2VWYWx1ZSc6IG9ialRvSnNvbih0aGlzLnVzZVZhbHVlKSxcbiAgICAgICd1c2VGYWN0b3J5Jzogb2JqVG9Kc29uKHRoaXMudXNlRmFjdG9yeSlcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlRmFjdG9yeU1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgICBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIHJ1bnRpbWU6IEZ1bmN0aW9uO1xuICBuYW1lOiBzdHJpbmc7XG4gIHByZWZpeDogc3RyaW5nO1xuICBtb2R1bGVVcmw6IHN0cmluZztcbiAgY29uc3RDb25zdHJ1Y3RvcjogYm9vbGVhbjtcbiAgdmFsdWU6IGFueTtcbiAgZGlEZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcblxuICBjb25zdHJ1Y3Rvcih7cnVudGltZSwgbmFtZSwgbW9kdWxlVXJsLCBwcmVmaXgsIGNvbnN0Q29uc3RydWN0b3IsIGRpRGVwcywgdmFsdWV9OiB7XG4gICAgcnVudGltZT86IEZ1bmN0aW9uLFxuICAgIG5hbWU/OiBzdHJpbmcsXG4gICAgcHJlZml4Pzogc3RyaW5nLFxuICAgIG1vZHVsZVVybD86IHN0cmluZyxcbiAgICBjb25zdENvbnN0cnVjdG9yPzogYm9vbGVhbixcbiAgICB2YWx1ZT86IGJvb2xlYW4sXG4gICAgZGlEZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW11cbiAgfSkge1xuICAgIHRoaXMucnVudGltZSA9IHJ1bnRpbWU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybDtcbiAgICB0aGlzLmRpRGVwcyA9IGRpRGVwcztcbiAgICB0aGlzLmNvbnN0Q29uc3RydWN0b3IgPSBjb25zdENvbnN0cnVjdG9yO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVGYWN0b3J5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSh7XG4gICAgICBuYW1lOiBkYXRhWyduYW1lJ10sXG4gICAgICBwcmVmaXg6IGRhdGFbJ3ByZWZpeCddLFxuICAgICAgbW9kdWxlVXJsOiBkYXRhWydtb2R1bGVVcmwnXSxcbiAgICAgIGNvbnN0Q29uc3RydWN0b3I6IGRhdGFbJ2NvbnN0Q29uc3RydWN0b3InXSxcbiAgICAgIHZhbHVlOiBkYXRhWyd2YWx1ZSddLFxuICAgICAgZGlEZXBzOiBhcnJheUZyb21Kc29uKGRhdGFbJ2RpRGVwcyddLCBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEuZnJvbUpzb24pXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAnY2xhc3MnOiAnRmFjdG9yeScsXG4gICAgICAnbmFtZSc6IHRoaXMubmFtZSxcbiAgICAgICdwcmVmaXgnOiB0aGlzLnByZWZpeCxcbiAgICAgICdtb2R1bGVVcmwnOiB0aGlzLm1vZHVsZVVybCxcbiAgICAgICdjb25zdENvbnN0cnVjdG9yJzogdGhpcy5jb25zdENvbnN0cnVjdG9yLFxuICAgICAgJ3ZhbHVlJzogdGhpcy52YWx1ZSxcbiAgICAgICdkaURlcHMnOiBhcnJheVRvSnNvbih0aGlzLmRpRGVwcylcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdHlwZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVUeXBlTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSB7XG4gIHJ1bnRpbWU6IFR5cGU7XG4gIG5hbWU6IHN0cmluZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIG1vZHVsZVVybDogc3RyaW5nO1xuICBpc0hvc3Q6IGJvb2xlYW47XG4gIGNvbnN0Q29uc3RydWN0b3I6IGJvb2xlYW47XG4gIHZhbHVlOiBhbnk7XG4gIGRpRGVwczogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW107XG5cbiAgY29uc3RydWN0b3Ioe3J1bnRpbWUsIG5hbWUsIG1vZHVsZVVybCwgcHJlZml4LCBpc0hvc3QsIGNvbnN0Q29uc3RydWN0b3IsIHZhbHVlLCBkaURlcHN9OiB7XG4gICAgcnVudGltZT86IFR5cGUsXG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBtb2R1bGVVcmw/OiBzdHJpbmcsXG4gICAgcHJlZml4Pzogc3RyaW5nLFxuICAgIGlzSG9zdD86IGJvb2xlYW4sXG4gICAgY29uc3RDb25zdHJ1Y3Rvcj86IGJvb2xlYW4sXG4gICAgdmFsdWU/OiBhbnksXG4gICAgZGlEZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW11cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5ydW50aW1lID0gcnVudGltZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMuaXNIb3N0ID0gbm9ybWFsaXplQm9vbChpc0hvc3QpO1xuICAgIHRoaXMuY29uc3RDb25zdHJ1Y3RvciA9IGNvbnN0Q29uc3RydWN0b3I7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuZGlEZXBzID0gbm9ybWFsaXplQmxhbmsoZGlEZXBzKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVUeXBlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVR5cGVNZXRhZGF0YSh7XG4gICAgICBuYW1lOiBkYXRhWyduYW1lJ10sXG4gICAgICBtb2R1bGVVcmw6IGRhdGFbJ21vZHVsZVVybCddLFxuICAgICAgcHJlZml4OiBkYXRhWydwcmVmaXgnXSxcbiAgICAgIGlzSG9zdDogZGF0YVsnaXNIb3N0J10sXG4gICAgICBjb25zdENvbnN0cnVjdG9yOiBkYXRhWydjb25zdENvbnN0cnVjdG9yJ10sXG4gICAgICB2YWx1ZTogZGF0YVsndmFsdWUnXSxcbiAgICAgIGRpRGVwczogYXJyYXlGcm9tSnNvbihkYXRhWydkaURlcHMnXSwgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG4gIGdldCB0eXBlKCk6IENvbXBpbGVUeXBlTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAnY2xhc3MnOiAnVHlwZScsXG4gICAgICAnbmFtZSc6IHRoaXMubmFtZSxcbiAgICAgICdtb2R1bGVVcmwnOiB0aGlzLm1vZHVsZVVybCxcbiAgICAgICdwcmVmaXgnOiB0aGlzLnByZWZpeCxcbiAgICAgICdpc0hvc3QnOiB0aGlzLmlzSG9zdCxcbiAgICAgICdjb25zdENvbnN0cnVjdG9yJzogdGhpcy5jb25zdENvbnN0cnVjdG9yLFxuICAgICAgJ3ZhbHVlJzogdGhpcy52YWx1ZSxcbiAgICAgICdkaURlcHMnOiBhcnJheVRvSnNvbih0aGlzLmRpRGVwcylcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUXVlcnlNZXRhZGF0YSB7XG4gIHNlbGVjdG9yczogQXJyYXk8Q29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YXxzdHJpbmc+O1xuICBkZXNjZW5kYW50czogYm9vbGVhbjtcbiAgZmlyc3Q6IGJvb2xlYW47XG4gIHByb3BlcnR5TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHtzZWxlY3RvcnMsIGRlc2NlbmRhbnRzLCBmaXJzdCwgcHJvcGVydHlOYW1lfToge1xuICAgIHNlbGVjdG9ycz86IEFycmF5PENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF8c3RyaW5nPixcbiAgICBkZXNjZW5kYW50cz86IGJvb2xlYW4sXG4gICAgZmlyc3Q/OiBib29sZWFuLFxuICAgIHByb3BlcnR5TmFtZT86IHN0cmluZ1xuICB9ID0ge30pIHtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbiAgICB0aGlzLmRlc2NlbmRhbnRzID0gZGVzY2VuZGFudHM7XG4gICAgdGhpcy5maXJzdCA9IG5vcm1hbGl6ZUJvb2woZmlyc3QpO1xuICAgIHRoaXMucHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEoe1xuICAgICAgc2VsZWN0b3JzOiBhcnJheUZyb21Kc29uKGRhdGFbJ3NlbGVjdG9ycyddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIGRlc2NlbmRhbnRzOiBkYXRhWydkZXNjZW5kYW50cyddLFxuICAgICAgZmlyc3Q6IGRhdGFbJ2ZpcnN0J10sXG4gICAgICBwcm9wZXJ0eU5hbWU6IGRhdGFbJ3Byb3BlcnR5TmFtZSddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ3NlbGVjdG9ycyc6IGFycmF5VG9Kc29uKHRoaXMuc2VsZWN0b3JzKSxcbiAgICAgICdkZXNjZW5kYW50cyc6IHRoaXMuZGVzY2VuZGFudHMsXG4gICAgICAnZmlyc3QnOiB0aGlzLmZpcnN0LFxuICAgICAgJ3Byb3BlcnR5TmFtZSc6IHRoaXMucHJvcGVydHlOYW1lXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEge1xuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbjtcbiAgdGVtcGxhdGU6IHN0cmluZztcbiAgdGVtcGxhdGVVcmw6IHN0cmluZztcbiAgc3R5bGVzOiBzdHJpbmdbXTtcbiAgc3R5bGVVcmxzOiBzdHJpbmdbXTtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcbiAgY29uc3RydWN0b3Ioe2VuY2Fwc3VsYXRpb24sIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCwgc3R5bGVzLCBzdHlsZVVybHMsIG5nQ29udGVudFNlbGVjdG9yc306IHtcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgbmdDb250ZW50U2VsZWN0b3JzPzogc3RyaW5nW11cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5lbmNhcHN1bGF0aW9uID0gaXNQcmVzZW50KGVuY2Fwc3VsYXRpb24pID8gZW5jYXBzdWxhdGlvbiA6IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkO1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLnRlbXBsYXRlVXJsID0gdGVtcGxhdGVVcmw7XG4gICAgdGhpcy5zdHlsZXMgPSBpc1ByZXNlbnQoc3R5bGVzKSA/IHN0eWxlcyA6IFtdO1xuICAgIHRoaXMuc3R5bGVVcmxzID0gaXNQcmVzZW50KHN0eWxlVXJscykgPyBzdHlsZVVybHMgOiBbXTtcbiAgICB0aGlzLm5nQ29udGVudFNlbGVjdG9ycyA9IGlzUHJlc2VudChuZ0NvbnRlbnRTZWxlY3RvcnMpID8gbmdDb250ZW50U2VsZWN0b3JzIDogW107XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSh7XG4gICAgICBlbmNhcHN1bGF0aW9uOiBpc1ByZXNlbnQoZGF0YVsnZW5jYXBzdWxhdGlvbiddKSA/XG4gICAgICAgICAgVklFV19FTkNBUFNVTEFUSU9OX1ZBTFVFU1tkYXRhWydlbmNhcHN1bGF0aW9uJ11dIDpcbiAgICAgICAgICBkYXRhWydlbmNhcHN1bGF0aW9uJ10sXG4gICAgICB0ZW1wbGF0ZTogZGF0YVsndGVtcGxhdGUnXSxcbiAgICAgIHRlbXBsYXRlVXJsOiBkYXRhWyd0ZW1wbGF0ZVVybCddLFxuICAgICAgc3R5bGVzOiBkYXRhWydzdHlsZXMnXSxcbiAgICAgIHN0eWxlVXJsczogZGF0YVsnc3R5bGVVcmxzJ10sXG4gICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IGRhdGFbJ25nQ29udGVudFNlbGVjdG9ycyddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAnZW5jYXBzdWxhdGlvbic6IGlzUHJlc2VudCh0aGlzLmVuY2Fwc3VsYXRpb24pID8gc2VyaWFsaXplRW51bSh0aGlzLmVuY2Fwc3VsYXRpb24pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVuY2Fwc3VsYXRpb24sXG4gICAgICAndGVtcGxhdGUnOiB0aGlzLnRlbXBsYXRlLFxuICAgICAgJ3RlbXBsYXRlVXJsJzogdGhpcy50ZW1wbGF0ZVVybCxcbiAgICAgICdzdHlsZXMnOiB0aGlzLnN0eWxlcyxcbiAgICAgICdzdHlsZVVybHMnOiB0aGlzLnN0eWxlVXJscyxcbiAgICAgICduZ0NvbnRlbnRTZWxlY3RvcnMnOiB0aGlzLm5nQ29udGVudFNlbGVjdG9yc1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSBkaXJlY3RpdmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSB7XG4gIHN0YXRpYyBjcmVhdGUoXG4gICAgICB7dHlwZSwgaXNDb21wb25lbnQsIGR5bmFtaWNMb2FkYWJsZSwgc2VsZWN0b3IsIGV4cG9ydEFzLCBjaGFuZ2VEZXRlY3Rpb24sIGlucHV0cywgb3V0cHV0cyxcbiAgICAgICBob3N0LCBsaWZlY3ljbGVIb29rcywgcHJvdmlkZXJzLCB2aWV3UHJvdmlkZXJzLCBxdWVyaWVzLCB2aWV3UXVlcmllcywgdGVtcGxhdGV9OiB7XG4gICAgICAgIHR5cGU/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgICAgICBpc0NvbXBvbmVudD86IGJvb2xlYW4sXG4gICAgICAgIGR5bmFtaWNMb2FkYWJsZT86IGJvb2xlYW4sXG4gICAgICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgICAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICAgICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgICAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgbGlmZWN5Y2xlSG9va3M/OiBMaWZlY3ljbGVIb29rc1tdLFxuICAgICAgICBwcm92aWRlcnM/OlxuICAgICAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGF8Q29tcGlsZVR5cGVNZXRhZGF0YXxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfGFueVtdPixcbiAgICAgICAgdmlld1Byb3ZpZGVycz86XG4gICAgICAgICAgICBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YXxDb21waWxlVHlwZU1ldGFkYXRhfENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF8YW55W10+LFxuICAgICAgICBxdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICAgICAgdmlld1F1ZXJpZXM/OiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgICAgICB0ZW1wbGF0ZT86IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhXG4gICAgICB9ID0ge30pOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHZhciBob3N0TGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIHZhciBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICB2YXIgaG9zdEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGlzUHJlc2VudChob3N0KSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGhvc3QsICh2YWx1ZTogc3RyaW5nLCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChIT1NUX1JFR19FWFAsIGtleSk7XG4gICAgICAgIGlmIChpc0JsYW5rKG1hdGNoZXMpKSB7XG4gICAgICAgICAgaG9zdEF0dHJpYnV0ZXNba2V5XSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChtYXRjaGVzWzFdKSkge1xuICAgICAgICAgIGhvc3RQcm9wZXJ0aWVzW21hdGNoZXNbMV1dID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KG1hdGNoZXNbMl0pKSB7XG4gICAgICAgICAgaG9zdExpc3RlbmVyc1ttYXRjaGVzWzJdXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIGlucHV0c01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAoaXNQcmVzZW50KGlucHV0cykpIHtcbiAgICAgIGlucHV0cy5mb3JFYWNoKChiaW5kQ29uZmlnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gY2Fub25pY2FsIHN5bnRheDogYGRpclByb3A6IGVsUHJvcGBcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYDpgLCB1c2UgZGlyUHJvcCA9IGVsUHJvcFxuICAgICAgICB2YXIgcGFydHMgPSBzcGxpdEF0Q29sb24oYmluZENvbmZpZywgW2JpbmRDb25maWcsIGJpbmRDb25maWddKTtcbiAgICAgICAgaW5wdXRzTWFwW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBvdXRwdXRzTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChpc1ByZXNlbnQob3V0cHV0cykpIHtcbiAgICAgIG91dHB1dHMuZm9yRWFjaCgoYmluZENvbmZpZzogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBlbFByb3BgXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICAgICAgdmFyIHBhcnRzID0gc3BsaXRBdENvbG9uKGJpbmRDb25maWcsIFtiaW5kQ29uZmlnLCBiaW5kQ29uZmlnXSk7XG4gICAgICAgIG91dHB1dHNNYXBbcGFydHNbMF1dID0gcGFydHNbMV07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSh7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgaXNDb21wb25lbnQ6IG5vcm1hbGl6ZUJvb2woaXNDb21wb25lbnQpLFxuICAgICAgZHluYW1pY0xvYWRhYmxlOiBub3JtYWxpemVCb29sKGR5bmFtaWNMb2FkYWJsZSksXG4gICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICBleHBvcnRBczogZXhwb3J0QXMsXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IGNoYW5nZURldGVjdGlvbixcbiAgICAgIGlucHV0czogaW5wdXRzTWFwLFxuICAgICAgb3V0cHV0czogb3V0cHV0c01hcCxcbiAgICAgIGhvc3RMaXN0ZW5lcnM6IGhvc3RMaXN0ZW5lcnMsXG4gICAgICBob3N0UHJvcGVydGllczogaG9zdFByb3BlcnRpZXMsXG4gICAgICBob3N0QXR0cmlidXRlczogaG9zdEF0dHJpYnV0ZXMsXG4gICAgICBsaWZlY3ljbGVIb29rczogaXNQcmVzZW50KGxpZmVjeWNsZUhvb2tzKSA/IGxpZmVjeWNsZUhvb2tzIDogW10sXG4gICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgIHZpZXdQcm92aWRlcnM6IHZpZXdQcm92aWRlcnMsXG4gICAgICBxdWVyaWVzOiBxdWVyaWVzLFxuICAgICAgdmlld1F1ZXJpZXM6IHZpZXdRdWVyaWVzLFxuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gICAgfSk7XG4gIH1cbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgaXNDb21wb25lbnQ6IGJvb2xlYW47XG4gIGR5bmFtaWNMb2FkYWJsZTogYm9vbGVhbjtcbiAgc2VsZWN0b3I6IHN0cmluZztcbiAgZXhwb3J0QXM6IHN0cmluZztcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTtcbiAgaW5wdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgb3V0cHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgbGlmZWN5Y2xlSG9va3M6IExpZmVjeWNsZUhvb2tzW107XG4gIHByb3ZpZGVyczogQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGF8Q29tcGlsZVR5cGVNZXRhZGF0YXxhbnlbXT47XG4gIHZpZXdQcm92aWRlcnM6IEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhfENvbXBpbGVUeXBlTWV0YWRhdGF8YW55W10+O1xuICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuICB2aWV3UXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgdGVtcGxhdGU6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhO1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHt0eXBlLCBpc0NvbXBvbmVudCwgZHluYW1pY0xvYWRhYmxlLCBzZWxlY3RvciwgZXhwb3J0QXMsIGNoYW5nZURldGVjdGlvbiwgaW5wdXRzLCBvdXRwdXRzLFxuICAgICAgIGhvc3RMaXN0ZW5lcnMsIGhvc3RQcm9wZXJ0aWVzLCBob3N0QXR0cmlidXRlcywgbGlmZWN5Y2xlSG9va3MsIHByb3ZpZGVycywgdmlld1Byb3ZpZGVycyxcbiAgICAgICBxdWVyaWVzLCB2aWV3UXVlcmllcywgdGVtcGxhdGV9OiB7XG4gICAgICAgIHR5cGU/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgICAgICBpc0NvbXBvbmVudD86IGJvb2xlYW4sXG4gICAgICAgIGR5bmFtaWNMb2FkYWJsZT86IGJvb2xlYW4sXG4gICAgICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgICAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICAgICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgICAgIGlucHV0cz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICBvdXRwdXRzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgIGhvc3RMaXN0ZW5lcnM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgaG9zdFByb3BlcnRpZXM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgaG9zdEF0dHJpYnV0ZXM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgbGlmZWN5Y2xlSG9va3M/OiBMaWZlY3ljbGVIb29rc1tdLFxuICAgICAgICBwcm92aWRlcnM/OlxuICAgICAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGF8Q29tcGlsZVR5cGVNZXRhZGF0YXxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfGFueVtdPixcbiAgICAgICAgdmlld1Byb3ZpZGVycz86XG4gICAgICAgICAgICBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YXxDb21waWxlVHlwZU1ldGFkYXRhfENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF8YW55W10+LFxuICAgICAgICBxdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICAgICAgdmlld1F1ZXJpZXM/OiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgICAgICB0ZW1wbGF0ZT86IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhXG4gICAgICB9ID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuaXNDb21wb25lbnQgPSBpc0NvbXBvbmVudDtcbiAgICB0aGlzLmR5bmFtaWNMb2FkYWJsZSA9IGR5bmFtaWNMb2FkYWJsZTtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgdGhpcy5leHBvcnRBcyA9IGV4cG9ydEFzO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0aW9uID0gY2hhbmdlRGV0ZWN0aW9uO1xuICAgIHRoaXMuaW5wdXRzID0gaW5wdXRzO1xuICAgIHRoaXMub3V0cHV0cyA9IG91dHB1dHM7XG4gICAgdGhpcy5ob3N0TGlzdGVuZXJzID0gaG9zdExpc3RlbmVycztcbiAgICB0aGlzLmhvc3RQcm9wZXJ0aWVzID0gaG9zdFByb3BlcnRpZXM7XG4gICAgdGhpcy5ob3N0QXR0cmlidXRlcyA9IGhvc3RBdHRyaWJ1dGVzO1xuICAgIHRoaXMubGlmZWN5Y2xlSG9va3MgPSBsaWZlY3ljbGVIb29rcztcbiAgICB0aGlzLnByb3ZpZGVycyA9IG5vcm1hbGl6ZUJsYW5rKHByb3ZpZGVycyk7XG4gICAgdGhpcy52aWV3UHJvdmlkZXJzID0gbm9ybWFsaXplQmxhbmsodmlld1Byb3ZpZGVycyk7XG4gICAgdGhpcy5xdWVyaWVzID0gbm9ybWFsaXplQmxhbmsocXVlcmllcyk7XG4gICAgdGhpcy52aWV3UXVlcmllcyA9IG5vcm1hbGl6ZUJsYW5rKHZpZXdRdWVyaWVzKTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXMudHlwZTsgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgaXNDb21wb25lbnQ6IGRhdGFbJ2lzQ29tcG9uZW50J10sXG4gICAgICBkeW5hbWljTG9hZGFibGU6IGRhdGFbJ2R5bmFtaWNMb2FkYWJsZSddLFxuICAgICAgc2VsZWN0b3I6IGRhdGFbJ3NlbGVjdG9yJ10sXG4gICAgICBleHBvcnRBczogZGF0YVsnZXhwb3J0QXMnXSxcbiAgICAgIHR5cGU6IGlzUHJlc2VudChkYXRhWyd0eXBlJ10pID8gQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbihkYXRhWyd0eXBlJ10pIDogZGF0YVsndHlwZSddLFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBpc1ByZXNlbnQoZGF0YVsnY2hhbmdlRGV0ZWN0aW9uJ10pID9cbiAgICAgICAgICBDSEFOR0VfREVURUNUSU9OX1NUUkFURUdZX1ZBTFVFU1tkYXRhWydjaGFuZ2VEZXRlY3Rpb24nXV0gOlxuICAgICAgICAgIGRhdGFbJ2NoYW5nZURldGVjdGlvbiddLFxuICAgICAgaW5wdXRzOiBkYXRhWydpbnB1dHMnXSxcbiAgICAgIG91dHB1dHM6IGRhdGFbJ291dHB1dHMnXSxcbiAgICAgIGhvc3RMaXN0ZW5lcnM6IGRhdGFbJ2hvc3RMaXN0ZW5lcnMnXSxcbiAgICAgIGhvc3RQcm9wZXJ0aWVzOiBkYXRhWydob3N0UHJvcGVydGllcyddLFxuICAgICAgaG9zdEF0dHJpYnV0ZXM6IGRhdGFbJ2hvc3RBdHRyaWJ1dGVzJ10sXG4gICAgICBsaWZlY3ljbGVIb29rczpcbiAgICAgICAgICAoPGFueVtdPmRhdGFbJ2xpZmVjeWNsZUhvb2tzJ10pLm1hcChob29rVmFsdWUgPT4gTElGRUNZQ0xFX0hPT0tTX1ZBTFVFU1tob29rVmFsdWVdKSxcbiAgICAgIHRlbXBsYXRlOiBpc1ByZXNlbnQoZGF0YVsndGVtcGxhdGUnXSkgPyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YS5mcm9tSnNvbihkYXRhWyd0ZW1wbGF0ZSddKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVsndGVtcGxhdGUnXSxcbiAgICAgIHByb3ZpZGVyczogYXJyYXlGcm9tSnNvbihkYXRhWydwcm92aWRlcnMnXSwgbWV0YWRhdGFGcm9tSnNvbiksXG4gICAgICB2aWV3UHJvdmlkZXJzOiBhcnJheUZyb21Kc29uKGRhdGFbJ3ZpZXdQcm92aWRlcnMnXSwgbWV0YWRhdGFGcm9tSnNvbiksXG4gICAgICBxdWVyaWVzOiBhcnJheUZyb21Kc29uKGRhdGFbJ3F1ZXJpZXMnXSwgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdmlld1F1ZXJpZXM6IGFycmF5RnJvbUpzb24oZGF0YVsndmlld1F1ZXJpZXMnXSwgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24pXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAnY2xhc3MnOiAnRGlyZWN0aXZlJyxcbiAgICAgICdpc0NvbXBvbmVudCc6IHRoaXMuaXNDb21wb25lbnQsXG4gICAgICAnZHluYW1pY0xvYWRhYmxlJzogdGhpcy5keW5hbWljTG9hZGFibGUsXG4gICAgICAnc2VsZWN0b3InOiB0aGlzLnNlbGVjdG9yLFxuICAgICAgJ2V4cG9ydEFzJzogdGhpcy5leHBvcnRBcyxcbiAgICAgICd0eXBlJzogaXNQcmVzZW50KHRoaXMudHlwZSkgPyB0aGlzLnR5cGUudG9Kc29uKCkgOiB0aGlzLnR5cGUsXG4gICAgICAnY2hhbmdlRGV0ZWN0aW9uJzogaXNQcmVzZW50KHRoaXMuY2hhbmdlRGV0ZWN0aW9uKSA/IHNlcmlhbGl6ZUVudW0odGhpcy5jaGFuZ2VEZXRlY3Rpb24pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAnaW5wdXRzJzogdGhpcy5pbnB1dHMsXG4gICAgICAnb3V0cHV0cyc6IHRoaXMub3V0cHV0cyxcbiAgICAgICdob3N0TGlzdGVuZXJzJzogdGhpcy5ob3N0TGlzdGVuZXJzLFxuICAgICAgJ2hvc3RQcm9wZXJ0aWVzJzogdGhpcy5ob3N0UHJvcGVydGllcyxcbiAgICAgICdob3N0QXR0cmlidXRlcyc6IHRoaXMuaG9zdEF0dHJpYnV0ZXMsXG4gICAgICAnbGlmZWN5Y2xlSG9va3MnOiB0aGlzLmxpZmVjeWNsZUhvb2tzLm1hcChob29rID0+IHNlcmlhbGl6ZUVudW0oaG9vaykpLFxuICAgICAgJ3RlbXBsYXRlJzogaXNQcmVzZW50KHRoaXMudGVtcGxhdGUpID8gdGhpcy50ZW1wbGF0ZS50b0pzb24oKSA6IHRoaXMudGVtcGxhdGUsXG4gICAgICAncHJvdmlkZXJzJzogYXJyYXlUb0pzb24odGhpcy5wcm92aWRlcnMpLFxuICAgICAgJ3ZpZXdQcm92aWRlcnMnOiBhcnJheVRvSnNvbih0aGlzLnZpZXdQcm92aWRlcnMpLFxuICAgICAgJ3F1ZXJpZXMnOiBhcnJheVRvSnNvbih0aGlzLnF1ZXJpZXMpLFxuICAgICAgJ3ZpZXdRdWVyaWVzJzogYXJyYXlUb0pzb24odGhpcy52aWV3UXVlcmllcylcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQ29uc3RydWN0IHtAbGluayBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGF9IGZyb20ge0BsaW5rIENvbXBvbmVudFR5cGVNZXRhZGF0YX0gYW5kIGEgc2VsZWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIb3N0Q29tcG9uZW50TWV0YShcbiAgICBjb21wb25lbnRUeXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLCBjb21wb25lbnRTZWxlY3Rvcjogc3RyaW5nKTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgdmFyIHRlbXBsYXRlID0gQ3NzU2VsZWN0b3IucGFyc2UoY29tcG9uZW50U2VsZWN0b3IpWzBdLmdldE1hdGNoaW5nRWxlbWVudFRlbXBsYXRlKCk7XG4gIHJldHVybiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuY3JlYXRlKHtcbiAgICB0eXBlOiBuZXcgQ29tcGlsZVR5cGVNZXRhZGF0YSh7XG4gICAgICBydW50aW1lOiBPYmplY3QsXG4gICAgICBuYW1lOiBgSG9zdCR7Y29tcG9uZW50VHlwZS5uYW1lfWAsXG4gICAgICBtb2R1bGVVcmw6IGNvbXBvbmVudFR5cGUubW9kdWxlVXJsLFxuICAgICAgaXNIb3N0OiB0cnVlXG4gICAgfSksXG4gICAgdGVtcGxhdGU6IG5ldyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YShcbiAgICAgICAge3RlbXBsYXRlOiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmw6ICcnLCBzdHlsZXM6IFtdLCBzdHlsZVVybHM6IFtdLCBuZ0NvbnRlbnRTZWxlY3RvcnM6IFtdfSksXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICAgIGlucHV0czogW10sXG4gICAgb3V0cHV0czogW10sXG4gICAgaG9zdDoge30sXG4gICAgbGlmZWN5Y2xlSG9va3M6IFtdLFxuICAgIGlzQ29tcG9uZW50OiB0cnVlLFxuICAgIGR5bmFtaWNMb2FkYWJsZTogZmFsc2UsXG4gICAgc2VsZWN0b3I6ICcqJyxcbiAgICBwcm92aWRlcnM6IFtdLFxuICAgIHZpZXdQcm92aWRlcnM6IFtdLFxuICAgIHF1ZXJpZXM6IFtdLFxuICAgIHZpZXdRdWVyaWVzOiBbXVxuICB9KTtcbn1cblxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVBpcGVNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIHtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgbmFtZTogc3RyaW5nO1xuICBwdXJlOiBib29sZWFuO1xuICBjb25zdHJ1Y3Rvcih7dHlwZSwgbmFtZSwgcHVyZX06IHt0eXBlPzogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT86IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVyZT86IGJvb2xlYW59ID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wdXJlID0gbm9ybWFsaXplQm9vbChwdXJlKTtcbiAgfVxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXMudHlwZTsgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVQaXBlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVBpcGVNZXRhZGF0YSh7XG4gICAgICB0eXBlOiBpc1ByZXNlbnQoZGF0YVsndHlwZSddKSA/IENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24oZGF0YVsndHlwZSddKSA6IGRhdGFbJ3R5cGUnXSxcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIHB1cmU6IGRhdGFbJ3B1cmUnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2NsYXNzJzogJ1BpcGUnLFxuICAgICAgJ3R5cGUnOiBpc1ByZXNlbnQodGhpcy50eXBlKSA/IHRoaXMudHlwZS50b0pzb24oKSA6IG51bGwsXG4gICAgICAnbmFtZSc6IHRoaXMubmFtZSxcbiAgICAgICdwdXJlJzogdGhpcy5wdXJlXG4gICAgfTtcbiAgfVxufVxuXG52YXIgX0NPTVBJTEVfTUVUQURBVEFfRlJPTV9KU09OID0ge1xuICAnRGlyZWN0aXZlJzogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmZyb21Kc29uLFxuICAnUGlwZSc6IENvbXBpbGVQaXBlTWV0YWRhdGEuZnJvbUpzb24sXG4gICdUeXBlJzogQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ1Byb3ZpZGVyJzogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEuZnJvbUpzb24sXG4gICdJZGVudGlmaWVyJzogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ0ZhY3RvcnknOiBDb21waWxlRmFjdG9yeU1ldGFkYXRhLmZyb21Kc29uXG59O1xuXG5mdW5jdGlvbiBhcnJheUZyb21Kc29uKG9iajogYW55W10sIGZuOiAoYToge1trZXk6IHN0cmluZ106IGFueX0pID0+IGFueSk6IGFueSB7XG4gIHJldHVybiBpc0JsYW5rKG9iaikgPyBudWxsIDogb2JqLm1hcChvID0+IG9iakZyb21Kc29uKG8sIGZuKSk7XG59XG5cbmZ1bmN0aW9uIGFycmF5VG9Kc29uKG9iajogYW55W10pOiBzdHJpbmd8e1trZXk6IHN0cmluZ106IGFueX0ge1xuICByZXR1cm4gaXNCbGFuayhvYmopID8gbnVsbCA6IG9iai5tYXAob2JqVG9Kc29uKTtcbn1cblxuZnVuY3Rpb24gb2JqRnJvbUpzb24ob2JqOiBhbnksIGZuOiAoYToge1trZXk6IHN0cmluZ106IGFueX0pID0+IGFueSk6IGFueSB7XG4gIGlmIChpc0FycmF5KG9iaikpIHJldHVybiBhcnJheUZyb21Kc29uKG9iaiwgZm4pO1xuICBpZiAoaXNTdHJpbmcob2JqKSB8fCBpc0JsYW5rKG9iaikgfHwgaXNCb29sZWFuKG9iaikgfHwgaXNOdW1iZXIob2JqKSkgcmV0dXJuIG9iajtcbiAgcmV0dXJuIGZuKG9iaik7XG59XG5cbmZ1bmN0aW9uIG9ialRvSnNvbihvYmo6IGFueSk6IHN0cmluZ3x7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGlmIChpc0FycmF5KG9iaikpIHJldHVybiBhcnJheVRvSnNvbihvYmopO1xuICBpZiAoaXNTdHJpbmcob2JqKSB8fCBpc0JsYW5rKG9iaikgfHwgaXNCb29sZWFuKG9iaikgfHwgaXNOdW1iZXIob2JqKSkgcmV0dXJuIG9iajtcbiAgcmV0dXJuIG9iai50b0pzb24oKTtcbn1cbiJdfQ==