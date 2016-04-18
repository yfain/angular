import { isPresent, isBlank, isNumber, isBoolean, normalizeBool, normalizeBlank, serializeEnum, isString, RegExpWrapper, isArray } from 'angular2/src/facade/lang';
import { unimplemented, BaseException } from 'angular2/src/facade/exceptions';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES } from 'angular2/src/core/change_detection/change_detection';
import { ViewEncapsulation, VIEW_ENCAPSULATION_VALUES } from 'angular2/src/core/metadata/view';
import { CssSelector } from 'angular2/src/compiler/selector';
import { splitAtColon } from './util';
import { LIFECYCLE_HOOKS_VALUES } from 'angular2/src/core/metadata/lifecycle_hooks';
import { getUrlScheme } from './url_resolver';
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
    constructor({ runtime, name, moduleUrl, prefix, value } = {}) {
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.value = value;
    }
    static fromJson(data) {
        let value = isArray(data['value']) ? _arrayFromJson(data['value'], metadataFromJson) :
            _objFromJson(data['value'], metadataFromJson);
        return new CompileIdentifierMetadata({ name: data['name'], prefix: data['prefix'], moduleUrl: data['moduleUrl'], value: value });
    }
    toJson() {
        let value = isArray(this.value) ? _arrayToJson(this.value) : _objToJson(this.value);
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Identifier',
            'name': this.name,
            'moduleUrl': this.moduleUrl,
            'prefix': this.prefix,
            'value': value
        };
    }
    get identifier() { return this; }
}
export class CompileDiDependencyMetadata {
    constructor({ isAttribute, isSelf, isHost, isSkipSelf, isOptional, isValue, query, viewQuery, token, value } = {}) {
        this.isAttribute = normalizeBool(isAttribute);
        this.isSelf = normalizeBool(isSelf);
        this.isHost = normalizeBool(isHost);
        this.isSkipSelf = normalizeBool(isSkipSelf);
        this.isOptional = normalizeBool(isOptional);
        this.isValue = normalizeBool(isValue);
        this.query = query;
        this.viewQuery = viewQuery;
        this.token = token;
        this.value = value;
    }
    static fromJson(data) {
        return new CompileDiDependencyMetadata({
            token: _objFromJson(data['token'], CompileTokenMetadata.fromJson),
            query: _objFromJson(data['query'], CompileQueryMetadata.fromJson),
            viewQuery: _objFromJson(data['viewQuery'], CompileQueryMetadata.fromJson),
            value: data['value'],
            isAttribute: data['isAttribute'],
            isSelf: data['isSelf'],
            isHost: data['isHost'],
            isSkipSelf: data['isSkipSelf'],
            isOptional: data['isOptional'],
            isValue: data['isValue']
        });
    }
    toJson() {
        return {
            'token': _objToJson(this.token),
            'query': _objToJson(this.query),
            'viewQuery': _objToJson(this.viewQuery),
            'value': this.value,
            'isAttribute': this.isAttribute,
            'isSelf': this.isSelf,
            'isHost': this.isHost,
            'isSkipSelf': this.isSkipSelf,
            'isOptional': this.isOptional,
            'isValue': this.isValue
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
        this.deps = normalizeBlank(deps);
        this.multi = normalizeBool(multi);
    }
    static fromJson(data) {
        return new CompileProviderMetadata({
            token: _objFromJson(data['token'], CompileTokenMetadata.fromJson),
            useClass: _objFromJson(data['useClass'], CompileTypeMetadata.fromJson),
            useExisting: _objFromJson(data['useExisting'], CompileTokenMetadata.fromJson),
            useValue: _objFromJson(data['useValue'], CompileIdentifierMetadata.fromJson),
            useFactory: _objFromJson(data['useFactory'], CompileFactoryMetadata.fromJson),
            multi: data['multi'],
            deps: _arrayFromJson(data['deps'], CompileDiDependencyMetadata.fromJson)
        });
    }
    toJson() {
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Provider',
            'token': _objToJson(this.token),
            'useClass': _objToJson(this.useClass),
            'useExisting': _objToJson(this.useExisting),
            'useValue': _objToJson(this.useValue),
            'useFactory': _objToJson(this.useFactory),
            'multi': this.multi,
            'deps': _arrayToJson(this.deps)
        };
    }
}
export class CompileFactoryMetadata {
    constructor({ runtime, name, moduleUrl, prefix, diDeps, value }) {
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.diDeps = _normalizeArray(diDeps);
        this.value = value;
    }
    get identifier() { return this; }
    static fromJson(data) {
        return new CompileFactoryMetadata({
            name: data['name'],
            prefix: data['prefix'],
            moduleUrl: data['moduleUrl'],
            value: data['value'],
            diDeps: _arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
        });
    }
    toJson() {
        return {
            'class': 'Factory',
            'name': this.name,
            'prefix': this.prefix,
            'moduleUrl': this.moduleUrl,
            'value': this.value,
            'diDeps': _arrayToJson(this.diDeps)
        };
    }
}
export class CompileTokenMetadata {
    constructor({ value, identifier, identifierIsInstance }) {
        this.value = value;
        this.identifier = identifier;
        this.identifierIsInstance = normalizeBool(identifierIsInstance);
    }
    static fromJson(data) {
        return new CompileTokenMetadata({
            value: data['value'],
            identifier: _objFromJson(data['identifier'], CompileIdentifierMetadata.fromJson),
            identifierIsInstance: data['identifierIsInstance']
        });
    }
    toJson() {
        return {
            'value': this.value,
            'identifier': _objToJson(this.identifier),
            'identifierIsInstance': this.identifierIsInstance
        };
    }
    get runtimeCacheKey() {
        if (isPresent(this.identifier)) {
            return this.identifier.runtime;
        }
        else {
            return this.value;
        }
    }
    get assetCacheKey() {
        if (isPresent(this.identifier)) {
            return isPresent(this.identifier.moduleUrl) &&
                isPresent(getUrlScheme(this.identifier.moduleUrl)) ?
                `${this.identifier.name}|${this.identifier.moduleUrl}|${this.identifierIsInstance}` :
                null;
        }
        else {
            return this.value;
        }
    }
    equalsTo(token2) {
        var rk = this.runtimeCacheKey;
        var ak = this.assetCacheKey;
        return (isPresent(rk) && rk == token2.runtimeCacheKey) ||
            (isPresent(ak) && ak == token2.assetCacheKey);
    }
    get name() { return isPresent(this.value) ? this.value : this.identifier.name; }
}
export class CompileTokenMap {
    constructor() {
        this._valueMap = new Map();
        this._values = [];
    }
    add(token, value) {
        var existing = this.get(token);
        if (isPresent(existing)) {
            throw new BaseException(`Can only add to a TokenMap! Token: ${token.name}`);
        }
        this._values.push(value);
        var rk = token.runtimeCacheKey;
        if (isPresent(rk)) {
            this._valueMap.set(rk, value);
        }
        var ak = token.assetCacheKey;
        if (isPresent(ak)) {
            this._valueMap.set(ak, value);
        }
    }
    get(token) {
        var rk = token.runtimeCacheKey;
        var ak = token.assetCacheKey;
        var result;
        if (isPresent(rk)) {
            result = this._valueMap.get(rk);
        }
        if (isBlank(result) && isPresent(ak)) {
            result = this._valueMap.get(ak);
        }
        return result;
    }
    values() { return this._values; }
    get size() { return this._values.length; }
}
/**
 * Metadata regarding compilation of a type.
 */
export class CompileTypeMetadata {
    constructor({ runtime, name, moduleUrl, prefix, isHost, value, diDeps } = {}) {
        this.runtime = runtime;
        this.name = name;
        this.moduleUrl = moduleUrl;
        this.prefix = prefix;
        this.isHost = normalizeBool(isHost);
        this.value = value;
        this.diDeps = _normalizeArray(diDeps);
    }
    static fromJson(data) {
        return new CompileTypeMetadata({
            name: data['name'],
            moduleUrl: data['moduleUrl'],
            prefix: data['prefix'],
            isHost: data['isHost'],
            value: data['value'],
            diDeps: _arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
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
            'value': this.value,
            'diDeps': _arrayToJson(this.diDeps)
        };
    }
}
export class CompileQueryMetadata {
    constructor({ selectors, descendants, first, propertyName } = {}) {
        this.selectors = selectors;
        this.descendants = normalizeBool(descendants);
        this.first = normalizeBool(first);
        this.propertyName = propertyName;
    }
    static fromJson(data) {
        return new CompileQueryMetadata({
            selectors: _arrayFromJson(data['selectors'], CompileTokenMetadata.fromJson),
            descendants: data['descendants'],
            first: data['first'],
            propertyName: data['propertyName']
        });
    }
    toJson() {
        return {
            'selectors': _arrayToJson(this.selectors),
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
            'encapsulation': isPresent(this.encapsulation) ? serializeEnum(this.encapsulation) : this.encapsulation,
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
    constructor({ type, isComponent, selector, exportAs, changeDetection, inputs, outputs, hostListeners, hostProperties, hostAttributes, lifecycleHooks, providers, viewProviders, queries, viewQueries, template } = {}) {
        this.type = type;
        this.isComponent = isComponent;
        this.selector = selector;
        this.exportAs = exportAs;
        this.changeDetection = changeDetection;
        this.inputs = inputs;
        this.outputs = outputs;
        this.hostListeners = hostListeners;
        this.hostProperties = hostProperties;
        this.hostAttributes = hostAttributes;
        this.lifecycleHooks = _normalizeArray(lifecycleHooks);
        this.providers = _normalizeArray(providers);
        this.viewProviders = _normalizeArray(viewProviders);
        this.queries = _normalizeArray(queries);
        this.viewQueries = _normalizeArray(viewQueries);
        this.template = template;
    }
    static create({ type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host, lifecycleHooks, providers, viewProviders, queries, viewQueries, template } = {}) {
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
            providers: _arrayFromJson(data['providers'], metadataFromJson),
            viewProviders: _arrayFromJson(data['viewProviders'], metadataFromJson),
            queries: _arrayFromJson(data['queries'], CompileQueryMetadata.fromJson),
            viewQueries: _arrayFromJson(data['viewQueries'], CompileQueryMetadata.fromJson)
        });
    }
    toJson() {
        return {
            'class': 'Directive',
            'isComponent': this.isComponent,
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
            'providers': _arrayToJson(this.providers),
            'viewProviders': _arrayToJson(this.viewProviders),
            'queries': _arrayToJson(this.queries),
            'viewQueries': _arrayToJson(this.viewQueries)
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
            name: `${componentType.name}_Host`,
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
        selector: '*',
        providers: [],
        viewProviders: [],
        queries: [],
        viewQueries: []
    });
}
export class CompilePipeMetadata {
    constructor({ type, name, pure, lifecycleHooks } = {}) {
        this.type = type;
        this.name = name;
        this.pure = normalizeBool(pure);
        this.lifecycleHooks = _normalizeArray(lifecycleHooks);
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
function _arrayFromJson(obj, fn) {
    return isBlank(obj) ? null : obj.map(o => _objFromJson(o, fn));
}
function _arrayToJson(obj) {
    return isBlank(obj) ? null : obj.map(_objToJson);
}
function _objFromJson(obj, fn) {
    if (isArray(obj))
        return _arrayFromJson(obj, fn);
    if (isString(obj) || isBlank(obj) || isBoolean(obj) || isNumber(obj))
        return obj;
    return fn(obj);
}
function _objToJson(obj) {
    if (isArray(obj))
        return _arrayToJson(obj);
    if (isString(obj) || isBlank(obj) || isBoolean(obj) || isNumber(obj))
        return obj;
    return obj.toJson();
}
function _normalizeArray(obj) {
    return isPresent(obj) ? obj : [];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtbk1TZXZSa3EudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9jb21waWxlX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQ0wsU0FBUyxFQUNULE9BQU8sRUFDUCxRQUFRLEVBQ1IsU0FBUyxFQUNULGFBQWEsRUFDYixjQUFjLEVBQ2QsYUFBYSxFQUViLFFBQVEsRUFDUixhQUFhLEVBRWIsT0FBTyxFQUNSLE1BQU0sMEJBQTBCO09BQzFCLEVBQUMsYUFBYSxFQUFFLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNwRSxFQUFDLGdCQUFnQixFQUF5QixNQUFNLGdDQUFnQztPQUNoRixFQUNMLHVCQUF1QixFQUN2QixnQ0FBZ0MsRUFDakMsTUFBTSxxREFBcUQ7T0FDckQsRUFBQyxpQkFBaUIsRUFBRSx5QkFBeUIsRUFBQyxNQUFNLGlDQUFpQztPQUNyRixFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNuRCxFQUFDLFlBQVksRUFBQyxNQUFNLFFBQVE7T0FDNUIsRUFBaUIsc0JBQXNCLEVBQUMsTUFBTSw0Q0FBNEM7T0FDMUYsRUFBQyxZQUFZLEVBQUMsTUFBTSxnQkFBZ0I7QUFFM0Msd0NBQXdDO0FBQ3hDLGtDQUFrQztBQUNsQyxJQUFJLFlBQVksR0FBRywwQ0FBMEMsQ0FBQztBQUU5RDtJQUdFLElBQUksVUFBVSxLQUFnQyxNQUFNLENBQTRCLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNwRyxDQUFDO0FBRUQsNkNBQXNELDZCQUE2QjtJQUdqRixJQUFJLElBQUksS0FBMEIsTUFBTSxDQUFzQixhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFaEYsSUFBSSxVQUFVLEtBQWdDLE1BQU0sQ0FBNEIsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3BHLENBQUM7QUFFRCxp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QztJQUNqRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2pGLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakIsQ0FBQztBQUVELG9CQUFvQixHQUFRO0lBQzFCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNqRixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3RCLENBQUM7QUFFRCx5QkFBeUIsR0FBVTtJQUNqQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgaXNOdW1iZXIsXG4gIGlzQm9vbGVhbixcbiAgbm9ybWFsaXplQm9vbCxcbiAgbm9ybWFsaXplQmxhbmssXG4gIHNlcmlhbGl6ZUVudW0sXG4gIFR5cGUsXG4gIGlzU3RyaW5nLFxuICBSZWdFeHBXcmFwcGVyLFxuICBTdHJpbmdXcmFwcGVyLFxuICBpc0FycmF5XG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWQsIEJhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIE1hcFdyYXBwZXIsIFNldFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ0hBTkdFX0RFVEVDVElPTl9TVFJBVEVHWV9WQUxVRVNcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb24sIFZJRVdfRU5DQVBTVUxBVElPTl9WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NlbGVjdG9yJztcbmltcG9ydCB7c3BsaXRBdENvbG9ufSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rcywgTElGRUNZQ0xFX0hPT0tTX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7Z2V0VXJsU2NoZW1lfSBmcm9tICcuL3VybF9yZXNvbHZlcic7XG5cbi8vIGdyb3VwIDE6IFwicHJvcGVydHlcIiBmcm9tIFwiW3Byb3BlcnR5XVwiXG4vLyBncm91cCAyOiBcImV2ZW50XCIgZnJvbSBcIihldmVudClcIlxudmFyIEhPU1RfUkVHX0VYUCA9IC9eKD86KD86XFxbKFteXFxdXSspXFxdKXwoPzpcXCgoW15cXCldKylcXCkpKSQvZztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyIHtcbiAgYWJzdHJhY3QgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gPENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGE+dW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSBleHRlbmRzIENvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyIHtcbiAgYWJzdHJhY3QgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIGdldCB0eXBlKCk6IENvbXBpbGVUeXBlTWV0YWRhdGEgeyByZXR1cm4gPENvbXBpbGVUeXBlTWV0YWRhdGE+dW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiA8Q29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YT51bmltcGxlbWVudGVkKCk7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ldGFkYXRhRnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBhbnkge1xuICByZXR1cm4gX0NPTVBJTEVfTUVUQURBVEFfRlJPTV9KU09OW2RhdGFbJ2NsYXNzJ11dKGRhdGEpO1xufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyIHtcbiAgcnVudGltZTogYW55O1xuICBuYW1lOiBzdHJpbmc7XG4gIHByZWZpeDogc3RyaW5nO1xuICBtb2R1bGVVcmw6IHN0cmluZztcbiAgdmFsdWU6IGFueTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHtydW50aW1lLCBuYW1lLCBtb2R1bGVVcmwsIHByZWZpeCwgdmFsdWV9OlxuICAgICAgICAgIHtydW50aW1lPzogYW55LCBuYW1lPzogc3RyaW5nLCBtb2R1bGVVcmw/OiBzdHJpbmcsIHByZWZpeD86IHN0cmluZywgdmFsdWU/OiBhbnl9ID0ge30pIHtcbiAgICB0aGlzLnJ1bnRpbWUgPSBydW50aW1lO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wcmVmaXggPSBwcmVmaXg7XG4gICAgdGhpcy5tb2R1bGVVcmwgPSBtb2R1bGVVcmw7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7XG4gICAgbGV0IHZhbHVlID0gaXNBcnJheShkYXRhWyd2YWx1ZSddKSA/IF9hcnJheUZyb21Kc29uKGRhdGFbJ3ZhbHVlJ10sIG1ldGFkYXRhRnJvbUpzb24pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX29iakZyb21Kc29uKGRhdGFbJ3ZhbHVlJ10sIG1ldGFkYXRhRnJvbUpzb24pO1xuICAgIHJldHVybiBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YShcbiAgICAgICAge25hbWU6IGRhdGFbJ25hbWUnXSwgcHJlZml4OiBkYXRhWydwcmVmaXgnXSwgbW9kdWxlVXJsOiBkYXRhWydtb2R1bGVVcmwnXSwgdmFsdWU6IHZhbHVlfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCB2YWx1ZSA9IGlzQXJyYXkodGhpcy52YWx1ZSkgPyBfYXJyYXlUb0pzb24odGhpcy52YWx1ZSkgOiBfb2JqVG9Kc29uKHRoaXMudmFsdWUpO1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ2NsYXNzJzogJ0lkZW50aWZpZXInLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAnbW9kdWxlVXJsJzogdGhpcy5tb2R1bGVVcmwsXG4gICAgICAncHJlZml4JzogdGhpcy5wcmVmaXgsXG4gICAgICAndmFsdWUnOiB2YWx1ZVxuICAgIH07XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXM7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGlzQXR0cmlidXRlOiBib29sZWFuO1xuICBpc1NlbGY6IGJvb2xlYW47XG4gIGlzSG9zdDogYm9vbGVhbjtcbiAgaXNTa2lwU2VsZjogYm9vbGVhbjtcbiAgaXNPcHRpb25hbDogYm9vbGVhbjtcbiAgaXNWYWx1ZTogYm9vbGVhbjtcbiAgcXVlcnk6IENvbXBpbGVRdWVyeU1ldGFkYXRhO1xuICB2aWV3UXVlcnk6IENvbXBpbGVRdWVyeU1ldGFkYXRhO1xuICB0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGE7XG4gIHZhbHVlOiBhbnk7XG5cbiAgY29uc3RydWN0b3Ioe2lzQXR0cmlidXRlLCBpc1NlbGYsIGlzSG9zdCwgaXNTa2lwU2VsZiwgaXNPcHRpb25hbCwgaXNWYWx1ZSwgcXVlcnksIHZpZXdRdWVyeSxcbiAgICAgICAgICAgICAgIHRva2VuLCB2YWx1ZX06IHtcbiAgICBpc0F0dHJpYnV0ZT86IGJvb2xlYW4sXG4gICAgaXNTZWxmPzogYm9vbGVhbixcbiAgICBpc0hvc3Q/OiBib29sZWFuLFxuICAgIGlzU2tpcFNlbGY/OiBib29sZWFuLFxuICAgIGlzT3B0aW9uYWw/OiBib29sZWFuLFxuICAgIGlzVmFsdWU/OiBib29sZWFuLFxuICAgIHF1ZXJ5PzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gICAgdmlld1F1ZXJ5PzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gICAgdG9rZW4/OiBDb21waWxlVG9rZW5NZXRhZGF0YSxcbiAgICB2YWx1ZT86IGFueVxuICB9ID0ge30pIHtcbiAgICB0aGlzLmlzQXR0cmlidXRlID0gbm9ybWFsaXplQm9vbChpc0F0dHJpYnV0ZSk7XG4gICAgdGhpcy5pc1NlbGYgPSBub3JtYWxpemVCb29sKGlzU2VsZik7XG4gICAgdGhpcy5pc0hvc3QgPSBub3JtYWxpemVCb29sKGlzSG9zdCk7XG4gICAgdGhpcy5pc1NraXBTZWxmID0gbm9ybWFsaXplQm9vbChpc1NraXBTZWxmKTtcbiAgICB0aGlzLmlzT3B0aW9uYWwgPSBub3JtYWxpemVCb29sKGlzT3B0aW9uYWwpO1xuICAgIHRoaXMuaXNWYWx1ZSA9IG5vcm1hbGl6ZUJvb2woaXNWYWx1ZSk7XG4gICAgdGhpcy5xdWVyeSA9IHF1ZXJ5O1xuICAgIHRoaXMudmlld1F1ZXJ5ID0gdmlld1F1ZXJ5O1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHtcbiAgICAgIHRva2VuOiBfb2JqRnJvbUpzb24oZGF0YVsndG9rZW4nXSwgQ29tcGlsZVRva2VuTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgcXVlcnk6IF9vYmpGcm9tSnNvbihkYXRhWydxdWVyeSddLCBDb21waWxlUXVlcnlNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB2aWV3UXVlcnk6IF9vYmpGcm9tSnNvbihkYXRhWyd2aWV3UXVlcnknXSwgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdmFsdWU6IGRhdGFbJ3ZhbHVlJ10sXG4gICAgICBpc0F0dHJpYnV0ZTogZGF0YVsnaXNBdHRyaWJ1dGUnXSxcbiAgICAgIGlzU2VsZjogZGF0YVsnaXNTZWxmJ10sXG4gICAgICBpc0hvc3Q6IGRhdGFbJ2lzSG9zdCddLFxuICAgICAgaXNTa2lwU2VsZjogZGF0YVsnaXNTa2lwU2VsZiddLFxuICAgICAgaXNPcHRpb25hbDogZGF0YVsnaXNPcHRpb25hbCddLFxuICAgICAgaXNWYWx1ZTogZGF0YVsnaXNWYWx1ZSddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAndG9rZW4nOiBfb2JqVG9Kc29uKHRoaXMudG9rZW4pLFxuICAgICAgJ3F1ZXJ5JzogX29ialRvSnNvbih0aGlzLnF1ZXJ5KSxcbiAgICAgICd2aWV3UXVlcnknOiBfb2JqVG9Kc29uKHRoaXMudmlld1F1ZXJ5KSxcbiAgICAgICd2YWx1ZSc6IHRoaXMudmFsdWUsXG4gICAgICAnaXNBdHRyaWJ1dGUnOiB0aGlzLmlzQXR0cmlidXRlLFxuICAgICAgJ2lzU2VsZic6IHRoaXMuaXNTZWxmLFxuICAgICAgJ2lzSG9zdCc6IHRoaXMuaXNIb3N0LFxuICAgICAgJ2lzU2tpcFNlbGYnOiB0aGlzLmlzU2tpcFNlbGYsXG4gICAgICAnaXNPcHRpb25hbCc6IHRoaXMuaXNPcHRpb25hbCxcbiAgICAgICdpc1ZhbHVlJzogdGhpcy5pc1ZhbHVlXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEge1xuICB0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGE7XG4gIHVzZUNsYXNzOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICB1c2VWYWx1ZTogYW55O1xuICB1c2VFeGlzdGluZzogQ29tcGlsZVRva2VuTWV0YWRhdGE7XG4gIHVzZUZhY3Rvcnk6IENvbXBpbGVGYWN0b3J5TWV0YWRhdGE7XG4gIGRlcHM6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuICBtdWx0aTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih7dG9rZW4sIHVzZUNsYXNzLCB1c2VWYWx1ZSwgdXNlRXhpc3RpbmcsIHVzZUZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICAgIHRva2VuPzogQ29tcGlsZVRva2VuTWV0YWRhdGEsXG4gICAgdXNlQ2xhc3M/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIHVzZVZhbHVlPzogYW55LFxuICAgIHVzZUV4aXN0aW5nPzogQ29tcGlsZVRva2VuTWV0YWRhdGEsXG4gICAgdXNlRmFjdG9yeT86IENvbXBpbGVGYWN0b3J5TWV0YWRhdGEsXG4gICAgZGVwcz86IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdLFxuICAgIG11bHRpPzogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIHRoaXMudXNlQ2xhc3MgPSB1c2VDbGFzcztcbiAgICB0aGlzLnVzZVZhbHVlID0gdXNlVmFsdWU7XG4gICAgdGhpcy51c2VFeGlzdGluZyA9IHVzZUV4aXN0aW5nO1xuICAgIHRoaXMudXNlRmFjdG9yeSA9IHVzZUZhY3Rvcnk7XG4gICAgdGhpcy5kZXBzID0gbm9ybWFsaXplQmxhbmsoZGVwcyk7XG4gICAgdGhpcy5tdWx0aSA9IG5vcm1hbGl6ZUJvb2wobXVsdGkpO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEoe1xuICAgICAgdG9rZW46IF9vYmpGcm9tSnNvbihkYXRhWyd0b2tlbiddLCBDb21waWxlVG9rZW5NZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB1c2VDbGFzczogX29iakZyb21Kc29uKGRhdGFbJ3VzZUNsYXNzJ10sIENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdXNlRXhpc3Rpbmc6IF9vYmpGcm9tSnNvbihkYXRhWyd1c2VFeGlzdGluZyddLCBDb21waWxlVG9rZW5NZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB1c2VWYWx1ZTogX29iakZyb21Kc29uKGRhdGFbJ3VzZVZhbHVlJ10sIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdXNlRmFjdG9yeTogX29iakZyb21Kc29uKGRhdGFbJ3VzZUZhY3RvcnknXSwgQ29tcGlsZUZhY3RvcnlNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICBtdWx0aTogZGF0YVsnbXVsdGknXSxcbiAgICAgIGRlcHM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ2RlcHMnXSwgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gTm90ZTogUnVudGltZSB0eXBlIGNhbid0IGJlIHNlcmlhbGl6ZWQuLi5cbiAgICAgICdjbGFzcyc6ICdQcm92aWRlcicsXG4gICAgICAndG9rZW4nOiBfb2JqVG9Kc29uKHRoaXMudG9rZW4pLFxuICAgICAgJ3VzZUNsYXNzJzogX29ialRvSnNvbih0aGlzLnVzZUNsYXNzKSxcbiAgICAgICd1c2VFeGlzdGluZyc6IF9vYmpUb0pzb24odGhpcy51c2VFeGlzdGluZyksXG4gICAgICAndXNlVmFsdWUnOiBfb2JqVG9Kc29uKHRoaXMudXNlVmFsdWUpLFxuICAgICAgJ3VzZUZhY3RvcnknOiBfb2JqVG9Kc29uKHRoaXMudXNlRmFjdG9yeSksXG4gICAgICAnbXVsdGknOiB0aGlzLm11bHRpLFxuICAgICAgJ2RlcHMnOiBfYXJyYXlUb0pzb24odGhpcy5kZXBzKVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVGYWN0b3J5TWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICAgIENvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyIHtcbiAgcnVudGltZTogRnVuY3Rpb247XG4gIG5hbWU6IHN0cmluZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIG1vZHVsZVVybDogc3RyaW5nO1xuICB2YWx1ZTogYW55O1xuICBkaURlcHM6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuXG4gIGNvbnN0cnVjdG9yKHtydW50aW1lLCBuYW1lLCBtb2R1bGVVcmwsIHByZWZpeCwgZGlEZXBzLCB2YWx1ZX06IHtcbiAgICBydW50aW1lPzogRnVuY3Rpb24sXG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBwcmVmaXg/OiBzdHJpbmcsXG4gICAgbW9kdWxlVXJsPzogc3RyaW5nLFxuICAgIHZhbHVlPzogYm9vbGVhbixcbiAgICBkaURlcHM/OiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXVxuICB9KSB7XG4gICAgdGhpcy5ydW50aW1lID0gcnVudGltZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsO1xuICAgIHRoaXMuZGlEZXBzID0gX25vcm1hbGl6ZUFycmF5KGRpRGVwcyk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRmFjdG9yeU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIHByZWZpeDogZGF0YVsncHJlZml4J10sXG4gICAgICBtb2R1bGVVcmw6IGRhdGFbJ21vZHVsZVVybCddLFxuICAgICAgdmFsdWU6IGRhdGFbJ3ZhbHVlJ10sXG4gICAgICBkaURlcHM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ2RpRGVwcyddLCBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEuZnJvbUpzb24pXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAnY2xhc3MnOiAnRmFjdG9yeScsXG4gICAgICAnbmFtZSc6IHRoaXMubmFtZSxcbiAgICAgICdwcmVmaXgnOiB0aGlzLnByZWZpeCxcbiAgICAgICdtb2R1bGVVcmwnOiB0aGlzLm1vZHVsZVVybCxcbiAgICAgICd2YWx1ZSc6IHRoaXMudmFsdWUsXG4gICAgICAnZGlEZXBzJzogX2FycmF5VG9Kc29uKHRoaXMuZGlEZXBzKVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVUb2tlbk1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIge1xuICB2YWx1ZTogYW55O1xuICBpZGVudGlmaWVyOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhO1xuICBpZGVudGlmaWVySXNJbnN0YW5jZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih7dmFsdWUsIGlkZW50aWZpZXIsIGlkZW50aWZpZXJJc0luc3RhbmNlfToge1xuICAgIHZhbHVlPzogYW55LFxuICAgIGlkZW50aWZpZXI/OiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICAgIGlkZW50aWZpZXJJc0luc3RhbmNlPzogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuaWRlbnRpZmllciA9IGlkZW50aWZpZXI7XG4gICAgdGhpcy5pZGVudGlmaWVySXNJbnN0YW5jZSA9IG5vcm1hbGl6ZUJvb2woaWRlbnRpZmllcklzSW5zdGFuY2UpO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVRva2VuTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVRva2VuTWV0YWRhdGEoe1xuICAgICAgdmFsdWU6IGRhdGFbJ3ZhbHVlJ10sXG4gICAgICBpZGVudGlmaWVyOiBfb2JqRnJvbUpzb24oZGF0YVsnaWRlbnRpZmllciddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIGlkZW50aWZpZXJJc0luc3RhbmNlOiBkYXRhWydpZGVudGlmaWVySXNJbnN0YW5jZSddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAndmFsdWUnOiB0aGlzLnZhbHVlLFxuICAgICAgJ2lkZW50aWZpZXInOiBfb2JqVG9Kc29uKHRoaXMuaWRlbnRpZmllciksXG4gICAgICAnaWRlbnRpZmllcklzSW5zdGFuY2UnOiB0aGlzLmlkZW50aWZpZXJJc0luc3RhbmNlXG4gICAgfTtcbiAgfVxuXG4gIGdldCBydW50aW1lQ2FjaGVLZXkoKTogYW55IHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuaWRlbnRpZmllcikpIHtcbiAgICAgIHJldHVybiB0aGlzLmlkZW50aWZpZXIucnVudGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGFzc2V0Q2FjaGVLZXkoKTogYW55IHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuaWRlbnRpZmllcikpIHtcbiAgICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5pZGVudGlmaWVyLm1vZHVsZVVybCkgJiZcbiAgICAgICAgICAgICAgICAgICAgIGlzUHJlc2VudChnZXRVcmxTY2hlbWUodGhpcy5pZGVudGlmaWVyLm1vZHVsZVVybCkpID9cbiAgICAgICAgICAgICAgICAgYCR7dGhpcy5pZGVudGlmaWVyLm5hbWV9fCR7dGhpcy5pZGVudGlmaWVyLm1vZHVsZVVybH18JHt0aGlzLmlkZW50aWZpZXJJc0luc3RhbmNlfWAgOlxuICAgICAgICAgICAgICAgICBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG4gIH1cblxuICBlcXVhbHNUbyh0b2tlbjI6IENvbXBpbGVUb2tlbk1ldGFkYXRhKTogYm9vbGVhbiB7XG4gICAgdmFyIHJrID0gdGhpcy5ydW50aW1lQ2FjaGVLZXk7XG4gICAgdmFyIGFrID0gdGhpcy5hc3NldENhY2hlS2V5O1xuICAgIHJldHVybiAoaXNQcmVzZW50KHJrKSAmJiByayA9PSB0b2tlbjIucnVudGltZUNhY2hlS2V5KSB8fFxuICAgICAgICAgICAoaXNQcmVzZW50KGFrKSAmJiBhayA9PSB0b2tlbjIuYXNzZXRDYWNoZUtleSk7XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gaXNQcmVzZW50KHRoaXMudmFsdWUpID8gdGhpcy52YWx1ZSA6IHRoaXMuaWRlbnRpZmllci5uYW1lOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlVG9rZW5NYXA8VkFMVUU+IHtcbiAgcHJpdmF0ZSBfdmFsdWVNYXAgPSBuZXcgTWFwPGFueSwgVkFMVUU+KCk7XG4gIHByaXZhdGUgX3ZhbHVlczogVkFMVUVbXSA9IFtdO1xuXG4gIGFkZCh0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGEsIHZhbHVlOiBWQUxVRSkge1xuICAgIHZhciBleGlzdGluZyA9IHRoaXMuZ2V0KHRva2VuKTtcbiAgICBpZiAoaXNQcmVzZW50KGV4aXN0aW5nKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbiBvbmx5IGFkZCB0byBhIFRva2VuTWFwISBUb2tlbjogJHt0b2tlbi5uYW1lfWApO1xuICAgIH1cbiAgICB0aGlzLl92YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgdmFyIHJrID0gdG9rZW4ucnVudGltZUNhY2hlS2V5O1xuICAgIGlmIChpc1ByZXNlbnQocmspKSB7XG4gICAgICB0aGlzLl92YWx1ZU1hcC5zZXQocmssIHZhbHVlKTtcbiAgICB9XG4gICAgdmFyIGFrID0gdG9rZW4uYXNzZXRDYWNoZUtleTtcbiAgICBpZiAoaXNQcmVzZW50KGFrKSkge1xuICAgICAgdGhpcy5fdmFsdWVNYXAuc2V0KGFrLCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGdldCh0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGEpOiBWQUxVRSB7XG4gICAgdmFyIHJrID0gdG9rZW4ucnVudGltZUNhY2hlS2V5O1xuICAgIHZhciBhayA9IHRva2VuLmFzc2V0Q2FjaGVLZXk7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZiAoaXNQcmVzZW50KHJrKSkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fdmFsdWVNYXAuZ2V0KHJrKTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiBpc1ByZXNlbnQoYWspKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl92YWx1ZU1hcC5nZXQoYWspO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHZhbHVlcygpOiBWQUxVRVtdIHsgcmV0dXJuIHRoaXMuX3ZhbHVlczsgfVxuICBnZXQgc2l6ZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fdmFsdWVzLmxlbmd0aDsgfVxufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIHR5cGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlVHlwZU1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSwgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUge1xuICBydW50aW1lOiBUeXBlO1xuICBuYW1lOiBzdHJpbmc7XG4gIHByZWZpeDogc3RyaW5nO1xuICBtb2R1bGVVcmw6IHN0cmluZztcbiAgaXNIb3N0OiBib29sZWFuO1xuICB2YWx1ZTogYW55O1xuICBkaURlcHM6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuXG4gIGNvbnN0cnVjdG9yKHtydW50aW1lLCBuYW1lLCBtb2R1bGVVcmwsIHByZWZpeCwgaXNIb3N0LCB2YWx1ZSwgZGlEZXBzfToge1xuICAgIHJ1bnRpbWU/OiBUeXBlLFxuICAgIG5hbWU/OiBzdHJpbmcsXG4gICAgbW9kdWxlVXJsPzogc3RyaW5nLFxuICAgIHByZWZpeD86IHN0cmluZyxcbiAgICBpc0hvc3Q/OiBib29sZWFuLFxuICAgIHZhbHVlPzogYW55LFxuICAgIGRpRGVwcz86IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdXG4gIH0gPSB7fSkge1xuICAgIHRoaXMucnVudGltZSA9IHJ1bnRpbWU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybDtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLmlzSG9zdCA9IG5vcm1hbGl6ZUJvb2woaXNIb3N0KTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5kaURlcHMgPSBfbm9ybWFsaXplQXJyYXkoZGlEZXBzKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVUeXBlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVR5cGVNZXRhZGF0YSh7XG4gICAgICBuYW1lOiBkYXRhWyduYW1lJ10sXG4gICAgICBtb2R1bGVVcmw6IGRhdGFbJ21vZHVsZVVybCddLFxuICAgICAgcHJlZml4OiBkYXRhWydwcmVmaXgnXSxcbiAgICAgIGlzSG9zdDogZGF0YVsnaXNIb3N0J10sXG4gICAgICB2YWx1ZTogZGF0YVsndmFsdWUnXSxcbiAgICAgIGRpRGVwczogX2FycmF5RnJvbUpzb24oZGF0YVsnZGlEZXBzJ10sIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxuICBnZXQgdHlwZSgpOiBDb21waWxlVHlwZU1ldGFkYXRhIHsgcmV0dXJuIHRoaXM7IH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ2NsYXNzJzogJ1R5cGUnLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAnbW9kdWxlVXJsJzogdGhpcy5tb2R1bGVVcmwsXG4gICAgICAncHJlZml4JzogdGhpcy5wcmVmaXgsXG4gICAgICAnaXNIb3N0JzogdGhpcy5pc0hvc3QsXG4gICAgICAndmFsdWUnOiB0aGlzLnZhbHVlLFxuICAgICAgJ2RpRGVwcyc6IF9hcnJheVRvSnNvbih0aGlzLmRpRGVwcylcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUXVlcnlNZXRhZGF0YSB7XG4gIHNlbGVjdG9yczogQXJyYXk8Q29tcGlsZVRva2VuTWV0YWRhdGE+O1xuICBkZXNjZW5kYW50czogYm9vbGVhbjtcbiAgZmlyc3Q6IGJvb2xlYW47XG4gIHByb3BlcnR5TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHtzZWxlY3RvcnMsIGRlc2NlbmRhbnRzLCBmaXJzdCwgcHJvcGVydHlOYW1lfToge1xuICAgIHNlbGVjdG9ycz86IEFycmF5PENvbXBpbGVUb2tlbk1ldGFkYXRhPixcbiAgICBkZXNjZW5kYW50cz86IGJvb2xlYW4sXG4gICAgZmlyc3Q/OiBib29sZWFuLFxuICAgIHByb3BlcnR5TmFtZT86IHN0cmluZ1xuICB9ID0ge30pIHtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbiAgICB0aGlzLmRlc2NlbmRhbnRzID0gbm9ybWFsaXplQm9vbChkZXNjZW5kYW50cyk7XG4gICAgdGhpcy5maXJzdCA9IG5vcm1hbGl6ZUJvb2woZmlyc3QpO1xuICAgIHRoaXMucHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEoe1xuICAgICAgc2VsZWN0b3JzOiBfYXJyYXlGcm9tSnNvbihkYXRhWydzZWxlY3RvcnMnXSwgQ29tcGlsZVRva2VuTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgZGVzY2VuZGFudHM6IGRhdGFbJ2Rlc2NlbmRhbnRzJ10sXG4gICAgICBmaXJzdDogZGF0YVsnZmlyc3QnXSxcbiAgICAgIHByb3BlcnR5TmFtZTogZGF0YVsncHJvcGVydHlOYW1lJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdzZWxlY3RvcnMnOiBfYXJyYXlUb0pzb24odGhpcy5zZWxlY3RvcnMpLFxuICAgICAgJ2Rlc2NlbmRhbnRzJzogdGhpcy5kZXNjZW5kYW50cyxcbiAgICAgICdmaXJzdCc6IHRoaXMuZmlyc3QsXG4gICAgICAncHJvcGVydHlOYW1lJzogdGhpcy5wcm9wZXJ0eU5hbWVcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSB7XG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uO1xuICB0ZW1wbGF0ZTogc3RyaW5nO1xuICB0ZW1wbGF0ZVVybDogc3RyaW5nO1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdO1xuICBjb25zdHJ1Y3Rvcih7ZW5jYXBzdWxhdGlvbiwgdGVtcGxhdGUsIHRlbXBsYXRlVXJsLCBzdHlsZXMsIHN0eWxlVXJscywgbmdDb250ZW50U2VsZWN0b3JzfToge1xuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvbixcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgICBuZ0NvbnRlbnRTZWxlY3RvcnM/OiBzdHJpbmdbXVxuICB9ID0ge30pIHtcbiAgICB0aGlzLmVuY2Fwc3VsYXRpb24gPSBpc1ByZXNlbnQoZW5jYXBzdWxhdGlvbikgPyBlbmNhcHN1bGF0aW9uIDogVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQ7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMudGVtcGxhdGVVcmwgPSB0ZW1wbGF0ZVVybDtcbiAgICB0aGlzLnN0eWxlcyA9IGlzUHJlc2VudChzdHlsZXMpID8gc3R5bGVzIDogW107XG4gICAgdGhpcy5zdHlsZVVybHMgPSBpc1ByZXNlbnQoc3R5bGVVcmxzKSA/IHN0eWxlVXJscyA6IFtdO1xuICAgIHRoaXMubmdDb250ZW50U2VsZWN0b3JzID0gaXNQcmVzZW50KG5nQ29udGVudFNlbGVjdG9ycykgPyBuZ0NvbnRlbnRTZWxlY3RvcnMgOiBbXTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgIGVuY2Fwc3VsYXRpb246IGlzUHJlc2VudChkYXRhWydlbmNhcHN1bGF0aW9uJ10pID9cbiAgICAgICAgICAgICAgICAgICAgICAgICBWSUVXX0VOQ0FQU1VMQVRJT05fVkFMVUVTW2RhdGFbJ2VuY2Fwc3VsYXRpb24nXV0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbJ2VuY2Fwc3VsYXRpb24nXSxcbiAgICAgIHRlbXBsYXRlOiBkYXRhWyd0ZW1wbGF0ZSddLFxuICAgICAgdGVtcGxhdGVVcmw6IGRhdGFbJ3RlbXBsYXRlVXJsJ10sXG4gICAgICBzdHlsZXM6IGRhdGFbJ3N0eWxlcyddLFxuICAgICAgc3R5bGVVcmxzOiBkYXRhWydzdHlsZVVybHMnXSxcbiAgICAgIG5nQ29udGVudFNlbGVjdG9yczogZGF0YVsnbmdDb250ZW50U2VsZWN0b3JzJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdlbmNhcHN1bGF0aW9uJzpcbiAgICAgICAgICBpc1ByZXNlbnQodGhpcy5lbmNhcHN1bGF0aW9uKSA/IHNlcmlhbGl6ZUVudW0odGhpcy5lbmNhcHN1bGF0aW9uKSA6IHRoaXMuZW5jYXBzdWxhdGlvbixcbiAgICAgICd0ZW1wbGF0ZSc6IHRoaXMudGVtcGxhdGUsXG4gICAgICAndGVtcGxhdGVVcmwnOiB0aGlzLnRlbXBsYXRlVXJsLFxuICAgICAgJ3N0eWxlcyc6IHRoaXMuc3R5bGVzLFxuICAgICAgJ3N0eWxlVXJscyc6IHRoaXMuc3R5bGVVcmxzLFxuICAgICAgJ25nQ29udGVudFNlbGVjdG9ycyc6IHRoaXMubmdDb250ZW50U2VsZWN0b3JzXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIGRpcmVjdGl2ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIHtcbiAgc3RhdGljIGNyZWF0ZSh7dHlwZSwgaXNDb21wb25lbnQsIHNlbGVjdG9yLCBleHBvcnRBcywgY2hhbmdlRGV0ZWN0aW9uLCBpbnB1dHMsIG91dHB1dHMsIGhvc3QsXG4gICAgICAgICAgICAgICAgIGxpZmVjeWNsZUhvb2tzLCBwcm92aWRlcnMsIHZpZXdQcm92aWRlcnMsIHF1ZXJpZXMsIHZpZXdRdWVyaWVzLCB0ZW1wbGF0ZX06IHtcbiAgICB0eXBlPzogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBpc0NvbXBvbmVudD86IGJvb2xlYW4sXG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBsaWZlY3ljbGVIb29rcz86IExpZmVjeWNsZUhvb2tzW10sXG4gICAgcHJvdmlkZXJzPzpcbiAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IGFueVtdPixcbiAgICB2aWV3UHJvdmlkZXJzPzpcbiAgICAgICAgQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IGFueVtdPixcbiAgICBxdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICB2aWV3UXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdGVtcGxhdGU/OiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YVxuICB9ID0ge30pOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHZhciBob3N0TGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIHZhciBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICB2YXIgaG9zdEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGlzUHJlc2VudChob3N0KSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGhvc3QsICh2YWx1ZTogc3RyaW5nLCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChIT1NUX1JFR19FWFAsIGtleSk7XG4gICAgICAgIGlmIChpc0JsYW5rKG1hdGNoZXMpKSB7XG4gICAgICAgICAgaG9zdEF0dHJpYnV0ZXNba2V5XSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChtYXRjaGVzWzFdKSkge1xuICAgICAgICAgIGhvc3RQcm9wZXJ0aWVzW21hdGNoZXNbMV1dID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KG1hdGNoZXNbMl0pKSB7XG4gICAgICAgICAgaG9zdExpc3RlbmVyc1ttYXRjaGVzWzJdXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIGlucHV0c01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAoaXNQcmVzZW50KGlucHV0cykpIHtcbiAgICAgIGlucHV0cy5mb3JFYWNoKChiaW5kQ29uZmlnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gY2Fub25pY2FsIHN5bnRheDogYGRpclByb3A6IGVsUHJvcGBcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYDpgLCB1c2UgZGlyUHJvcCA9IGVsUHJvcFxuICAgICAgICB2YXIgcGFydHMgPSBzcGxpdEF0Q29sb24oYmluZENvbmZpZywgW2JpbmRDb25maWcsIGJpbmRDb25maWddKTtcbiAgICAgICAgaW5wdXRzTWFwW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBvdXRwdXRzTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChpc1ByZXNlbnQob3V0cHV0cykpIHtcbiAgICAgIG91dHB1dHMuZm9yRWFjaCgoYmluZENvbmZpZzogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBlbFByb3BgXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICAgICAgdmFyIHBhcnRzID0gc3BsaXRBdENvbG9uKGJpbmRDb25maWcsIFtiaW5kQ29uZmlnLCBiaW5kQ29uZmlnXSk7XG4gICAgICAgIG91dHB1dHNNYXBbcGFydHNbMF1dID0gcGFydHNbMV07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSh7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgaXNDb21wb25lbnQ6IG5vcm1hbGl6ZUJvb2woaXNDb21wb25lbnQpLFxuICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgICAgZXhwb3J0QXM6IGV4cG9ydEFzLFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBjaGFuZ2VEZXRlY3Rpb24sXG4gICAgICBpbnB1dHM6IGlucHV0c01hcCxcbiAgICAgIG91dHB1dHM6IG91dHB1dHNNYXAsXG4gICAgICBob3N0TGlzdGVuZXJzOiBob3N0TGlzdGVuZXJzLFxuICAgICAgaG9zdFByb3BlcnRpZXM6IGhvc3RQcm9wZXJ0aWVzLFxuICAgICAgaG9zdEF0dHJpYnV0ZXM6IGhvc3RBdHRyaWJ1dGVzLFxuICAgICAgbGlmZWN5Y2xlSG9va3M6IGlzUHJlc2VudChsaWZlY3ljbGVIb29rcykgPyBsaWZlY3ljbGVIb29rcyA6IFtdLFxuICAgICAgcHJvdmlkZXJzOiBwcm92aWRlcnMsXG4gICAgICB2aWV3UHJvdmlkZXJzOiB2aWV3UHJvdmlkZXJzLFxuICAgICAgcXVlcmllczogcXVlcmllcyxcbiAgICAgIHZpZXdRdWVyaWVzOiB2aWV3UXVlcmllcyxcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICAgIH0pO1xuICB9XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIGlzQ29tcG9uZW50OiBib29sZWFuO1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuICBleHBvcnRBczogc3RyaW5nO1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5O1xuICBpbnB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBvdXRwdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBsaWZlY3ljbGVIb29rczogTGlmZWN5Y2xlSG9va3NbXTtcbiAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuICB2aWV3UHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuICB2aWV3UXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcblxuICB0ZW1wbGF0ZTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGE7XG4gIGNvbnN0cnVjdG9yKHt0eXBlLCBpc0NvbXBvbmVudCwgc2VsZWN0b3IsIGV4cG9ydEFzLCBjaGFuZ2VEZXRlY3Rpb24sIGlucHV0cywgb3V0cHV0cyxcbiAgICAgICAgICAgICAgIGhvc3RMaXN0ZW5lcnMsIGhvc3RQcm9wZXJ0aWVzLCBob3N0QXR0cmlidXRlcywgbGlmZWN5Y2xlSG9va3MsIHByb3ZpZGVycyxcbiAgICAgICAgICAgICAgIHZpZXdQcm92aWRlcnMsIHF1ZXJpZXMsIHZpZXdRdWVyaWVzLCB0ZW1wbGF0ZX06IHtcbiAgICB0eXBlPzogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBpc0NvbXBvbmVudD86IGJvb2xlYW4sXG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgaW5wdXRzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgb3V0cHV0cz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RMaXN0ZW5lcnM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBob3N0UHJvcGVydGllcz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RBdHRyaWJ1dGVzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgbGlmZWN5Y2xlSG9va3M/OiBMaWZlY3ljbGVIb29rc1tdLFxuICAgIHByb3ZpZGVycz86XG4gICAgICAgIEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBhbnlbXT4sXG4gICAgdmlld1Byb3ZpZGVycz86XG4gICAgICAgIEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBhbnlbXT4sXG4gICAgcXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdmlld1F1ZXJpZXM/OiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIHRlbXBsYXRlPzogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGFcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmlzQ29tcG9uZW50ID0gaXNDb21wb25lbnQ7XG4gICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIHRoaXMuZXhwb3J0QXMgPSBleHBvcnRBcztcbiAgICB0aGlzLmNoYW5nZURldGVjdGlvbiA9IGNoYW5nZURldGVjdGlvbjtcbiAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICB0aGlzLm91dHB1dHMgPSBvdXRwdXRzO1xuICAgIHRoaXMuaG9zdExpc3RlbmVycyA9IGhvc3RMaXN0ZW5lcnM7XG4gICAgdGhpcy5ob3N0UHJvcGVydGllcyA9IGhvc3RQcm9wZXJ0aWVzO1xuICAgIHRoaXMuaG9zdEF0dHJpYnV0ZXMgPSBob3N0QXR0cmlidXRlcztcbiAgICB0aGlzLmxpZmVjeWNsZUhvb2tzID0gX25vcm1hbGl6ZUFycmF5KGxpZmVjeWNsZUhvb2tzKTtcbiAgICB0aGlzLnByb3ZpZGVycyA9IF9ub3JtYWxpemVBcnJheShwcm92aWRlcnMpO1xuICAgIHRoaXMudmlld1Byb3ZpZGVycyA9IF9ub3JtYWxpemVBcnJheSh2aWV3UHJvdmlkZXJzKTtcbiAgICB0aGlzLnF1ZXJpZXMgPSBfbm9ybWFsaXplQXJyYXkocXVlcmllcyk7XG4gICAgdGhpcy52aWV3UXVlcmllcyA9IF9ub3JtYWxpemVBcnJheSh2aWV3UXVlcmllcyk7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzLnR5cGU7IH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgIGlzQ29tcG9uZW50OiBkYXRhWydpc0NvbXBvbmVudCddLFxuICAgICAgc2VsZWN0b3I6IGRhdGFbJ3NlbGVjdG9yJ10sXG4gICAgICBleHBvcnRBczogZGF0YVsnZXhwb3J0QXMnXSxcbiAgICAgIHR5cGU6IGlzUHJlc2VudChkYXRhWyd0eXBlJ10pID8gQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbihkYXRhWyd0eXBlJ10pIDogZGF0YVsndHlwZSddLFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBpc1ByZXNlbnQoZGF0YVsnY2hhbmdlRGV0ZWN0aW9uJ10pID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIENIQU5HRV9ERVRFQ1RJT05fU1RSQVRFR1lfVkFMVUVTW2RhdGFbJ2NoYW5nZURldGVjdGlvbiddXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWydjaGFuZ2VEZXRlY3Rpb24nXSxcbiAgICAgIGlucHV0czogZGF0YVsnaW5wdXRzJ10sXG4gICAgICBvdXRwdXRzOiBkYXRhWydvdXRwdXRzJ10sXG4gICAgICBob3N0TGlzdGVuZXJzOiBkYXRhWydob3N0TGlzdGVuZXJzJ10sXG4gICAgICBob3N0UHJvcGVydGllczogZGF0YVsnaG9zdFByb3BlcnRpZXMnXSxcbiAgICAgIGhvc3RBdHRyaWJ1dGVzOiBkYXRhWydob3N0QXR0cmlidXRlcyddLFxuICAgICAgbGlmZWN5Y2xlSG9va3M6XG4gICAgICAgICAgKDxhbnlbXT5kYXRhWydsaWZlY3ljbGVIb29rcyddKS5tYXAoaG9va1ZhbHVlID0+IExJRkVDWUNMRV9IT09LU19WQUxVRVNbaG9va1ZhbHVlXSksXG4gICAgICB0ZW1wbGF0ZTogaXNQcmVzZW50KGRhdGFbJ3RlbXBsYXRlJ10pID8gQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEuZnJvbUpzb24oZGF0YVsndGVtcGxhdGUnXSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbJ3RlbXBsYXRlJ10sXG4gICAgICBwcm92aWRlcnM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ3Byb3ZpZGVycyddLCBtZXRhZGF0YUZyb21Kc29uKSxcbiAgICAgIHZpZXdQcm92aWRlcnM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ3ZpZXdQcm92aWRlcnMnXSwgbWV0YWRhdGFGcm9tSnNvbiksXG4gICAgICBxdWVyaWVzOiBfYXJyYXlGcm9tSnNvbihkYXRhWydxdWVyaWVzJ10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHZpZXdRdWVyaWVzOiBfYXJyYXlGcm9tSnNvbihkYXRhWyd2aWV3UXVlcmllcyddLCBDb21waWxlUXVlcnlNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdjbGFzcyc6ICdEaXJlY3RpdmUnLFxuICAgICAgJ2lzQ29tcG9uZW50JzogdGhpcy5pc0NvbXBvbmVudCxcbiAgICAgICdzZWxlY3Rvcic6IHRoaXMuc2VsZWN0b3IsXG4gICAgICAnZXhwb3J0QXMnOiB0aGlzLmV4cG9ydEFzLFxuICAgICAgJ3R5cGUnOiBpc1ByZXNlbnQodGhpcy50eXBlKSA/IHRoaXMudHlwZS50b0pzb24oKSA6IHRoaXMudHlwZSxcbiAgICAgICdjaGFuZ2VEZXRlY3Rpb24nOiBpc1ByZXNlbnQodGhpcy5jaGFuZ2VEZXRlY3Rpb24pID8gc2VyaWFsaXplRW51bSh0aGlzLmNoYW5nZURldGVjdGlvbikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZURldGVjdGlvbixcbiAgICAgICdpbnB1dHMnOiB0aGlzLmlucHV0cyxcbiAgICAgICdvdXRwdXRzJzogdGhpcy5vdXRwdXRzLFxuICAgICAgJ2hvc3RMaXN0ZW5lcnMnOiB0aGlzLmhvc3RMaXN0ZW5lcnMsXG4gICAgICAnaG9zdFByb3BlcnRpZXMnOiB0aGlzLmhvc3RQcm9wZXJ0aWVzLFxuICAgICAgJ2hvc3RBdHRyaWJ1dGVzJzogdGhpcy5ob3N0QXR0cmlidXRlcyxcbiAgICAgICdsaWZlY3ljbGVIb29rcyc6IHRoaXMubGlmZWN5Y2xlSG9va3MubWFwKGhvb2sgPT4gc2VyaWFsaXplRW51bShob29rKSksXG4gICAgICAndGVtcGxhdGUnOiBpc1ByZXNlbnQodGhpcy50ZW1wbGF0ZSkgPyB0aGlzLnRlbXBsYXRlLnRvSnNvbigpIDogdGhpcy50ZW1wbGF0ZSxcbiAgICAgICdwcm92aWRlcnMnOiBfYXJyYXlUb0pzb24odGhpcy5wcm92aWRlcnMpLFxuICAgICAgJ3ZpZXdQcm92aWRlcnMnOiBfYXJyYXlUb0pzb24odGhpcy52aWV3UHJvdmlkZXJzKSxcbiAgICAgICdxdWVyaWVzJzogX2FycmF5VG9Kc29uKHRoaXMucXVlcmllcyksXG4gICAgICAndmlld1F1ZXJpZXMnOiBfYXJyYXlUb0pzb24odGhpcy52aWV3UXVlcmllcylcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQ29uc3RydWN0IHtAbGluayBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGF9IGZyb20ge0BsaW5rIENvbXBvbmVudFR5cGVNZXRhZGF0YX0gYW5kIGEgc2VsZWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIb3N0Q29tcG9uZW50TWV0YShjb21wb25lbnRUeXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlbGVjdG9yOiBzdHJpbmcpOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICB2YXIgdGVtcGxhdGUgPSBDc3NTZWxlY3Rvci5wYXJzZShjb21wb25lbnRTZWxlY3RvcilbMF0uZ2V0TWF0Y2hpbmdFbGVtZW50VGVtcGxhdGUoKTtcbiAgcmV0dXJuIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5jcmVhdGUoe1xuICAgIHR5cGU6IG5ldyBDb21waWxlVHlwZU1ldGFkYXRhKHtcbiAgICAgIHJ1bnRpbWU6IE9iamVjdCxcbiAgICAgIG5hbWU6IGAke2NvbXBvbmVudFR5cGUubmFtZX1fSG9zdGAsXG4gICAgICBtb2R1bGVVcmw6IGNvbXBvbmVudFR5cGUubW9kdWxlVXJsLFxuICAgICAgaXNIb3N0OiB0cnVlXG4gICAgfSksXG4gICAgdGVtcGxhdGU6IG5ldyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YShcbiAgICAgICAge3RlbXBsYXRlOiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmw6ICcnLCBzdHlsZXM6IFtdLCBzdHlsZVVybHM6IFtdLCBuZ0NvbnRlbnRTZWxlY3RvcnM6IFtdfSksXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICAgIGlucHV0czogW10sXG4gICAgb3V0cHV0czogW10sXG4gICAgaG9zdDoge30sXG4gICAgbGlmZWN5Y2xlSG9va3M6IFtdLFxuICAgIGlzQ29tcG9uZW50OiB0cnVlLFxuICAgIHNlbGVjdG9yOiAnKicsXG4gICAgcHJvdmlkZXJzOiBbXSxcbiAgICB2aWV3UHJvdmlkZXJzOiBbXSxcbiAgICBxdWVyaWVzOiBbXSxcbiAgICB2aWV3UXVlcmllczogW11cbiAgfSk7XG59XG5cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVQaXBlTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSB7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIG5hbWU6IHN0cmluZztcbiAgcHVyZTogYm9vbGVhbjtcbiAgbGlmZWN5Y2xlSG9va3M6IExpZmVjeWNsZUhvb2tzW107XG5cbiAgY29uc3RydWN0b3Ioe3R5cGUsIG5hbWUsIHB1cmUsIGxpZmVjeWNsZUhvb2tzfToge1xuICAgIHR5cGU/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIG5hbWU/OiBzdHJpbmcsXG4gICAgcHVyZT86IGJvb2xlYW4sXG4gICAgbGlmZWN5Y2xlSG9va3M/OiBMaWZlY3ljbGVIb29rc1tdXG4gIH0gPSB7fSkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnB1cmUgPSBub3JtYWxpemVCb29sKHB1cmUpO1xuICAgIHRoaXMubGlmZWN5Y2xlSG9va3MgPSBfbm9ybWFsaXplQXJyYXkobGlmZWN5Y2xlSG9va3MpO1xuICB9XG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpcy50eXBlOyB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVBpcGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlUGlwZU1ldGFkYXRhKHtcbiAgICAgIHR5cGU6IGlzUHJlc2VudChkYXRhWyd0eXBlJ10pID8gQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbihkYXRhWyd0eXBlJ10pIDogZGF0YVsndHlwZSddLFxuICAgICAgbmFtZTogZGF0YVsnbmFtZSddLFxuICAgICAgcHVyZTogZGF0YVsncHVyZSddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAnY2xhc3MnOiAnUGlwZScsXG4gICAgICAndHlwZSc6IGlzUHJlc2VudCh0aGlzLnR5cGUpID8gdGhpcy50eXBlLnRvSnNvbigpIDogbnVsbCxcbiAgICAgICduYW1lJzogdGhpcy5uYW1lLFxuICAgICAgJ3B1cmUnOiB0aGlzLnB1cmVcbiAgICB9O1xuICB9XG59XG5cbnZhciBfQ09NUElMRV9NRVRBREFUQV9GUk9NX0pTT04gPSB7XG4gICdEaXJlY3RpdmUnOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuZnJvbUpzb24sXG4gICdQaXBlJzogQ29tcGlsZVBpcGVNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ1R5cGUnOiBDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uLFxuICAnUHJvdmlkZXInOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ0lkZW50aWZpZXInOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uLFxuICAnRmFjdG9yeSc6IENvbXBpbGVGYWN0b3J5TWV0YWRhdGEuZnJvbUpzb25cbn07XG5cbmZ1bmN0aW9uIF9hcnJheUZyb21Kc29uKG9iajogYW55W10sIGZuOiAoYToge1trZXk6IHN0cmluZ106IGFueX0pID0+IGFueSk6IGFueSB7XG4gIHJldHVybiBpc0JsYW5rKG9iaikgPyBudWxsIDogb2JqLm1hcChvID0+IF9vYmpGcm9tSnNvbihvLCBmbikpO1xufVxuXG5mdW5jdGlvbiBfYXJyYXlUb0pzb24ob2JqOiBhbnlbXSk6IHN0cmluZyB8IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgcmV0dXJuIGlzQmxhbmsob2JqKSA/IG51bGwgOiBvYmoubWFwKF9vYmpUb0pzb24pO1xufVxuXG5mdW5jdGlvbiBfb2JqRnJvbUpzb24ob2JqOiBhbnksIGZuOiAoYToge1trZXk6IHN0cmluZ106IGFueX0pID0+IGFueSk6IGFueSB7XG4gIGlmIChpc0FycmF5KG9iaikpIHJldHVybiBfYXJyYXlGcm9tSnNvbihvYmosIGZuKTtcbiAgaWYgKGlzU3RyaW5nKG9iaikgfHwgaXNCbGFuayhvYmopIHx8IGlzQm9vbGVhbihvYmopIHx8IGlzTnVtYmVyKG9iaikpIHJldHVybiBvYmo7XG4gIHJldHVybiBmbihvYmopO1xufVxuXG5mdW5jdGlvbiBfb2JqVG9Kc29uKG9iajogYW55KTogc3RyaW5nIHwge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBpZiAoaXNBcnJheShvYmopKSByZXR1cm4gX2FycmF5VG9Kc29uKG9iaik7XG4gIGlmIChpc1N0cmluZyhvYmopIHx8IGlzQmxhbmsob2JqKSB8fCBpc0Jvb2xlYW4ob2JqKSB8fCBpc051bWJlcihvYmopKSByZXR1cm4gb2JqO1xuICByZXR1cm4gb2JqLnRvSnNvbigpO1xufVxuXG5mdW5jdGlvbiBfbm9ybWFsaXplQXJyYXkob2JqOiBhbnlbXSk6IGFueVtdIHtcbiAgcmV0dXJuIGlzUHJlc2VudChvYmopID8gb2JqIDogW107XG59XG4iXX0=