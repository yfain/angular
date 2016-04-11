import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { isArray, isPresent, isPrimitive } from 'angular2/src/facade/lang';
import { AttributeMetadata, DirectiveMetadata, ComponentMetadata, ContentChildrenMetadata, ContentChildMetadata, InputMetadata, HostBindingMetadata, HostListenerMetadata, OutputMetadata, PipeMetadata, ViewMetadata, ViewChildMetadata, ViewChildrenMetadata, ViewQueryMetadata, QueryMetadata } from 'angular2/src/core/metadata';
/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
export class StaticType {
    constructor(moduleId, name) {
        this.moduleId = moduleId;
        this.name = name;
    }
}
/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
export class StaticReflector {
    constructor(host) {
        this.host = host;
        this.typeCache = new Map();
        this.annotationCache = new Map();
        this.propertyCache = new Map();
        this.parameterCache = new Map();
        this.metadataCache = new Map();
        this.conversionMap = new Map();
        this.initializeConversionMap();
    }
    /**
     * getStatictype produces a Type whose metadata is known but whose implementation is not loaded.
     * All types passed to the StaticResolver should be pseudo-types returned by this method.
     *
     * @param moduleId the module identifier as would be passed to an import statement.
     * @param name the name of the type.
     */
    getStaticType(moduleId, name) {
        let key = `"${moduleId}".${name}`;
        let result = this.typeCache.get(key);
        if (!isPresent(result)) {
            result = new StaticType(moduleId, name);
            this.typeCache.set(key, result);
        }
        return result;
    }
    annotations(type) {
        let annotations = this.annotationCache.get(type);
        if (!isPresent(annotations)) {
            let classMetadata = this.getTypeMetadata(type);
            if (isPresent(classMetadata['decorators'])) {
                annotations = classMetadata['decorators']
                    .map(decorator => this.convertKnownDecorator(type.moduleId, decorator))
                    .filter(decorator => isPresent(decorator));
            }
            this.annotationCache.set(type, annotations);
        }
        return annotations;
    }
    propMetadata(type) {
        let propMetadata = this.propertyCache.get(type);
        if (!isPresent(propMetadata)) {
            let classMetadata = this.getTypeMetadata(type);
            propMetadata = this.getPropertyMetadata(type.moduleId, classMetadata['members']);
            this.propertyCache.set(type, propMetadata);
        }
        return propMetadata;
    }
    parameters(type) {
        let parameters = this.parameterCache.get(type);
        if (!isPresent(parameters)) {
            let classMetadata = this.getTypeMetadata(type);
            let ctorData = classMetadata['members']['__ctor__'];
            if (isPresent(ctorData)) {
                let ctor = ctorData.find(a => a['__symbolic'] === 'constructor');
                parameters = this.simplify(type.moduleId, ctor['parameters']);
                this.parameterCache.set(type, parameters);
            }
        }
        return parameters;
    }
    initializeConversionMap() {
        let core_metadata = 'angular2/src/core/metadata';
        let conversionMap = this.conversionMap;
        conversionMap.set(this.getStaticType(core_metadata, 'Directive'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            if (!isPresent(p0)) {
                p0 = {};
            }
            return new DirectiveMetadata({
                selector: p0['selector'],
                inputs: p0['inputs'],
                outputs: p0['outputs'],
                events: p0['events'],
                host: p0['host'],
                bindings: p0['bindings'],
                providers: p0['providers'],
                exportAs: p0['exportAs'],
                queries: p0['queries'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Component'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            if (!isPresent(p0)) {
                p0 = {};
            }
            return new ComponentMetadata({
                selector: p0['selector'],
                inputs: p0['inputs'],
                outputs: p0['outputs'],
                properties: p0['properties'],
                events: p0['events'],
                host: p0['host'],
                exportAs: p0['exportAs'],
                moduleId: p0['moduleId'],
                bindings: p0['bindings'],
                providers: p0['providers'],
                viewBindings: p0['viewBindings'],
                viewProviders: p0['viewProviders'],
                changeDetection: p0['changeDetection'],
                queries: p0['queries'],
                templateUrl: p0['templateUrl'],
                template: p0['template'],
                styleUrls: p0['styleUrls'],
                styles: p0['styles'],
                directives: p0['directives'],
                pipes: p0['pipes'],
                encapsulation: p0['encapsulation']
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Input'), (moduleContext, expression) => new InputMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'Output'), (moduleContext, expression) => new OutputMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'View'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            if (!isPresent(p0)) {
                p0 = {};
            }
            return new ViewMetadata({
                templateUrl: p0['templateUrl'],
                template: p0['template'],
                directives: p0['directives'],
                pipes: p0['pipes'],
                encapsulation: p0['encapsulation'],
                styles: p0['styles'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Attribute'), (moduleContext, expression) => new AttributeMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'Query'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            let p1 = this.getDecoratorParameter(moduleContext, expression, 1);
            if (!isPresent(p1)) {
                p1 = {};
            }
            return new QueryMetadata(p0, { descendants: p1.descendants, first: p1.first });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChildren'), (moduleContext, expression) => new ContentChildrenMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChild'), (moduleContext, expression) => new ContentChildMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChildren'), (moduleContext, expression) => new ViewChildrenMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChild'), (moduleContext, expression) => new ViewChildMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'ViewQuery'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            let p1 = this.getDecoratorParameter(moduleContext, expression, 1);
            if (!isPresent(p1)) {
                p1 = {};
            }
            return new ViewQueryMetadata(p0, {
                descendants: p1['descendants'],
                first: p1['first'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Pipe'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            if (!isPresent(p0)) {
                p0 = {};
            }
            return new PipeMetadata({
                name: p0['name'],
                pure: p0['pure'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'HostBinding'), (moduleContext, expression) => new HostBindingMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'HostListener'), (moduleContext, expression) => new HostListenerMetadata(this.getDecoratorParameter(moduleContext, expression, 0), this.getDecoratorParameter(moduleContext, expression, 1)));
        return null;
    }
    convertKnownDecorator(moduleContext, expression) {
        let converter = this.conversionMap.get(this.getDecoratorType(moduleContext, expression));
        if (isPresent(converter))
            return converter(moduleContext, expression);
        return null;
    }
    getDecoratorType(moduleContext, expression) {
        if (isMetadataSymbolicCallExpression(expression)) {
            let target = expression['expression'];
            if (isMetadataSymbolicReferenceExpression(target)) {
                let moduleId = this.normalizeModuleName(moduleContext, target['module']);
                return this.getStaticType(moduleId, target['name']);
            }
        }
        return null;
    }
    getDecoratorParameter(moduleContext, expression, index) {
        if (isMetadataSymbolicCallExpression(expression) && isPresent(expression['arguments']) &&
            expression['arguments'].length <= index + 1) {
            return this.simplify(moduleContext, expression['arguments'][index]);
        }
        return null;
    }
    getPropertyMetadata(moduleContext, value) {
        if (isPresent(value)) {
            let result = {};
            StringMapWrapper.forEach(value, (value, name) => {
                let data = this.getMemberData(moduleContext, value);
                if (isPresent(data)) {
                    let propertyData = data.filter(d => d['kind'] == 'property')
                        .map(d => d['directives'])
                        .reduce((p, c) => p.concat(c), []);
                    if (propertyData.length != 0) {
                        StringMapWrapper.set(result, name, propertyData);
                    }
                }
            });
            return result;
        }
        return null;
    }
    // clang-format off
    getMemberData(moduleContext, member) {
        // clang-format on
        let result = [];
        if (isPresent(member)) {
            for (let item of member) {
                result.push({
                    kind: item['__symbolic'],
                    directives: isPresent(item['decorators']) ?
                        item['decorators']
                            .map(decorator => this.convertKnownDecorator(moduleContext, decorator))
                            .filter(d => isPresent(d)) :
                        null
                });
            }
        }
        return result;
    }
    /** @internal */
    simplify(moduleContext, value) {
        let _this = this;
        function simplify(expression) {
            if (isPrimitive(expression)) {
                return expression;
            }
            if (isArray(expression)) {
                let result = [];
                for (let item of expression) {
                    result.push(simplify(item));
                }
                return result;
            }
            if (isPresent(expression)) {
                if (isPresent(expression['__symbolic'])) {
                    switch (expression['__symbolic']) {
                        case 'binop':
                            let left = simplify(expression['left']);
                            let right = simplify(expression['right']);
                            switch (expression['operator']) {
                                case '&&':
                                    return left && right;
                                case '||':
                                    return left || right;
                                case '|':
                                    return left | right;
                                case '^':
                                    return left ^ right;
                                case '&':
                                    return left & right;
                                case '==':
                                    return left == right;
                                case '!=':
                                    return left != right;
                                case '===':
                                    return left === right;
                                case '!==':
                                    return left !== right;
                                case '<':
                                    return left < right;
                                case '>':
                                    return left > right;
                                case '<=':
                                    return left <= right;
                                case '>=':
                                    return left >= right;
                                case '<<':
                                    return left << right;
                                case '>>':
                                    return left >> right;
                                case '+':
                                    return left + right;
                                case '-':
                                    return left - right;
                                case '*':
                                    return left * right;
                                case '/':
                                    return left / right;
                                case '%':
                                    return left % right;
                            }
                            return null;
                        case 'pre':
                            let operand = simplify(expression['operand']);
                            switch (expression['operator']) {
                                case '+':
                                    return operand;
                                case '-':
                                    return -operand;
                                case '!':
                                    return !operand;
                                case '~':
                                    return ~operand;
                            }
                            return null;
                        case 'index':
                            let indexTarget = simplify(expression['expression']);
                            let index = simplify(expression['index']);
                            if (isPresent(indexTarget) && isPrimitive(index))
                                return indexTarget[index];
                            return null;
                        case 'select':
                            let selectTarget = simplify(expression['expression']);
                            let member = simplify(expression['member']);
                            if (isPresent(selectTarget) && isPrimitive(member))
                                return selectTarget[member];
                            return null;
                        case 'reference':
                            let referenceModuleName = _this.normalizeModuleName(moduleContext, expression['module']);
                            let referenceModule = _this.getModuleMetadata(referenceModuleName);
                            let referenceValue = referenceModule['metadata'][expression['name']];
                            if (isClassMetadata(referenceValue)) {
                                // Convert to a pseudo type
                                return _this.getStaticType(referenceModuleName, expression['name']);
                            }
                            return _this.simplify(referenceModuleName, referenceValue);
                        case 'call':
                            return null;
                    }
                    return null;
                }
                let result = {};
                StringMapWrapper.forEach(expression, (value, name) => { result[name] = simplify(value); });
                return result;
            }
            return null;
        }
        return simplify(value);
    }
    getModuleMetadata(module) {
        let moduleMetadata = this.metadataCache.get(module);
        if (!isPresent(moduleMetadata)) {
            moduleMetadata = this.host.getMetadataFor(module);
            if (!isPresent(moduleMetadata)) {
                moduleMetadata = { __symbolic: 'module', module: module, metadata: {} };
            }
            this.metadataCache.set(module, moduleMetadata);
        }
        return moduleMetadata;
    }
    getTypeMetadata(type) {
        let moduleMetadata = this.getModuleMetadata(type.moduleId);
        let result = moduleMetadata['metadata'][type.name];
        if (!isPresent(result)) {
            result = { __symbolic: 'class' };
        }
        return result;
    }
    normalizeModuleName(from, to) {
        if (to.startsWith('.')) {
            return pathTo(from, to);
        }
        return to;
    }
}
function isMetadataSymbolicCallExpression(expression) {
    return !isPrimitive(expression) && !isArray(expression) && expression['__symbolic'] == 'call';
}
function isMetadataSymbolicReferenceExpression(expression) {
    return !isPrimitive(expression) && !isArray(expression) &&
        expression['__symbolic'] == 'reference';
}
function isClassMetadata(expression) {
    return !isPrimitive(expression) && !isArray(expression) && expression['__symbolic'] == 'class';
}
function splitPath(path) {
    return path.split(/\/|\\/g);
}
function resolvePath(pathParts) {
    let result = [];
    ListWrapper.forEachWithIndex(pathParts, (part, index) => {
        switch (part) {
            case '':
            case '.':
                if (index > 0)
                    return;
                break;
            case '..':
                if (index > 0 && result.length != 0)
                    result.pop();
                return;
        }
        result.push(part);
    });
    return result.join('/');
}
function pathTo(from, to) {
    let result = to;
    if (to.startsWith('.')) {
        let fromParts = splitPath(from);
        fromParts.pop(); // remove the file name.
        let toParts = splitPath(to);
        result = resolvePath(fromParts.concat(toParts));
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVnZpcENCVVAudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9zdGF0aWNfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbIlN0YXRpY1R5cGUiLCJTdGF0aWNUeXBlLmNvbnN0cnVjdG9yIiwiU3RhdGljUmVmbGVjdG9yIiwiU3RhdGljUmVmbGVjdG9yLmNvbnN0cnVjdG9yIiwiU3RhdGljUmVmbGVjdG9yLmdldFN0YXRpY1R5cGUiLCJTdGF0aWNSZWZsZWN0b3IuYW5ub3RhdGlvbnMiLCJTdGF0aWNSZWZsZWN0b3IucHJvcE1ldGFkYXRhIiwiU3RhdGljUmVmbGVjdG9yLnBhcmFtZXRlcnMiLCJTdGF0aWNSZWZsZWN0b3IuaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAiLCJTdGF0aWNSZWZsZWN0b3IuY29udmVydEtub3duRGVjb3JhdG9yIiwiU3RhdGljUmVmbGVjdG9yLmdldERlY29yYXRvclR5cGUiLCJTdGF0aWNSZWZsZWN0b3IuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyIiwiU3RhdGljUmVmbGVjdG9yLmdldFByb3BlcnR5TWV0YWRhdGEiLCJTdGF0aWNSZWZsZWN0b3IuZ2V0TWVtYmVyRGF0YSIsIlN0YXRpY1JlZmxlY3Rvci5zaW1wbGlmeSIsIlN0YXRpY1JlZmxlY3Rvci5zaW1wbGlmeS5zaW1wbGlmeSIsIlN0YXRpY1JlZmxlY3Rvci5nZXRNb2R1bGVNZXRhZGF0YSIsIlN0YXRpY1JlZmxlY3Rvci5nZXRUeXBlTWV0YWRhdGEiLCJTdGF0aWNSZWZsZWN0b3Iubm9ybWFsaXplTW9kdWxlTmFtZSIsImlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uIiwiaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiIsImlzQ2xhc3NNZXRhZGF0YSIsInNwbGl0UGF0aCIsInJlc29sdmVQYXRoIiwicGF0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Q0FBQ0EsQ0FBQ0E7NEJBQzFDQSxNQUFNQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDL0JBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEtBQUtBO29DQUNSQSxNQUFNQSxDQUFDQSxJQUFJQSxLQUFLQSxLQUFLQSxDQUFDQTtnQ0FDeEJBLEtBQUtBLEtBQUtBO29DQUNSQSxNQUFNQSxDQUFDQSxJQUFJQSxLQUFLQSxLQUFLQSxDQUFDQTtnQ0FDeEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTs0QkFDeEJBLENBQUNBOzRCQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTt3QkFDZEEsS0FBS0EsS0FBS0E7NEJBQ1JBLElBQUlBLE9BQU9BLEdBQUdBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBOzRCQUM5Q0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQy9CQSxLQUFLQSxHQUFHQTtvQ0FDTkEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0NBQ2pCQSxLQUFLQSxHQUFHQTtvQ0FDTkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0NBQ2xCQSxLQUFLQSxHQUFHQTtvQ0FDTkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0NBQ2xCQSxLQUFLQSxHQUFHQTtvQ0FDTkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7NEJBQ3BCQSxDQUFDQTs0QkFDREEsTUFBTUEsQ0FBQ0Es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QUNBO0FBQ2hCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzQXJyYXksIGlzQmxhbmssIGlzTnVtYmVyLCBpc1ByZXNlbnQsIGlzUHJpbWl0aXZlLCBpc1N0cmluZywgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QXR0cmlidXRlTWV0YWRhdGEsIERpcmVjdGl2ZU1ldGFkYXRhLCBDb21wb25lbnRNZXRhZGF0YSwgQ29udGVudENoaWxkcmVuTWV0YWRhdGEsIENvbnRlbnRDaGlsZE1ldGFkYXRhLCBJbnB1dE1ldGFkYXRhLCBIb3N0QmluZGluZ01ldGFkYXRhLCBIb3N0TGlzdGVuZXJNZXRhZGF0YSwgT3V0cHV0TWV0YWRhdGEsIFBpcGVNZXRhZGF0YSwgVmlld01ldGFkYXRhLCBWaWV3Q2hpbGRNZXRhZGF0YSwgVmlld0NoaWxkcmVuTWV0YWRhdGEsIFZpZXdRdWVyeU1ldGFkYXRhLCBRdWVyeU1ldGFkYXRhLH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuXG4vKipcbiAqIFRoZSBob3N0IG9mIHRoZSBzdGF0aWMgcmVzb2x2ZXIgaXMgZXhwZWN0ZWQgdG8gYmUgYWJsZSB0byBwcm92aWRlIG1vZHVsZSBtZXRhZGF0YSBpbiB0aGUgZm9ybSBvZlxuICogTW9kdWxlTWV0YWRhdGEuIEFuZ3VsYXIgMiBDTEkgd2lsbCBwcm9kdWNlIHRoaXMgbWV0YWRhdGEgZm9yIGEgbW9kdWxlIHdoZW5ldmVyIGEgLmQudHMgZmlsZXMgaXNcbiAqIHByb2R1Y2VkIGFuZCB0aGUgbW9kdWxlIGhhcyBleHBvcnRlZCB2YXJpYWJsZXMgb3IgY2xhc3NlcyB3aXRoIGRlY29yYXRvcnMuIE1vZHVsZSBtZXRhZGF0YSBjYW5cbiAqIGFsc28gYmUgcHJvZHVjZWQgZGlyZWN0bHkgZnJvbSBUeXBlU2NyaXB0IHNvdXJjZXMgYnkgdXNpbmcgTWV0YWRhdGFDb2xsZWN0b3IgaW4gdG9vbHMvbWV0YWRhdGEuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGljUmVmbGVjdG9ySG9zdCB7XG4gIC8qKlxuICAgKiAgUmV0dXJuIGEgTW9kdWxlTWV0YWRhdGEgZm9yIHRoZSBnaXZlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIG1vZHVsZUlkIGlzIGEgc3RyaW5nIGlkZW50aWZpZXIgZm9yIGEgbW9kdWxlIGluIHRoZSBmb3JtIHRoYXQgd291bGQgZXhwZWN0ZWQgaW4gYVxuICAgKiAgICAgICAgICAgICAgICAgbW9kdWxlIGltcG9ydCBvZiBhbiBpbXBvcnQgc3RhdGVtZW50LlxuICAgKiBAcmV0dXJucyB0aGUgbWV0YWRhdGEgZm9yIHRoZSBnaXZlbiBtb2R1bGUuXG4gICAqL1xuICBnZXRNZXRhZGF0YUZvcihtb2R1bGVJZDogc3RyaW5nKToge1trZXk6IHN0cmluZ106IGFueX07XG59XG5cbi8qKlxuICogQSB0b2tlbiByZXByZXNlbnRpbmcgdGhlIGEgcmVmZXJlbmNlIHRvIGEgc3RhdGljIHR5cGUuXG4gKlxuICogVGhpcyB0b2tlbiBpcyB1bmlxdWUgZm9yIGEgbW9kdWxlSWQgYW5kIG5hbWUgYW5kIGNhbiBiZSB1c2VkIGFzIGEgaGFzaCB0YWJsZSBrZXkuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNUeXBlIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1vZHVsZUlkOiBzdHJpbmcsIHB1YmxpYyBuYW1lOiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogQSBzdGF0aWMgcmVmbGVjdG9yIGltcGxlbWVudHMgZW5vdWdoIG9mIHRoZSBSZWZsZWN0b3IgQVBJIHRoYXQgaXMgbmVjZXNzYXJ5IHRvIGNvbXBpbGVcbiAqIHRlbXBsYXRlcyBzdGF0aWNhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgU3RhdGljUmVmbGVjdG9yIHtcbiAgcHJpdmF0ZSB0eXBlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgU3RhdGljVHlwZT4oKTtcbiAgcHJpdmF0ZSBhbm5vdGF0aW9uQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1R5cGUsIGFueVtdPigpO1xuICBwcml2YXRlIHByb3BlcnR5Q2FjaGUgPSBuZXcgTWFwPFN0YXRpY1R5cGUsIHtba2V5OiBzdHJpbmddOiBhbnl9PigpO1xuICBwcml2YXRlIHBhcmFtZXRlckNhY2hlID0gbmV3IE1hcDxTdGF0aWNUeXBlLCBhbnlbXT4oKTtcbiAgcHJpdmF0ZSBtZXRhZGF0YUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHtba2V5OiBzdHJpbmddOiBhbnl9PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogU3RhdGljUmVmbGVjdG9ySG9zdCkgeyB0aGlzLmluaXRpYWxpemVDb252ZXJzaW9uTWFwKCk7IH1cblxuICAvKipcbiAgICogZ2V0U3RhdGljdHlwZSBwcm9kdWNlcyBhIFR5cGUgd2hvc2UgbWV0YWRhdGEgaXMga25vd24gYnV0IHdob3NlIGltcGxlbWVudGF0aW9uIGlzIG5vdCBsb2FkZWQuXG4gICAqIEFsbCB0eXBlcyBwYXNzZWQgdG8gdGhlIFN0YXRpY1Jlc29sdmVyIHNob3VsZCBiZSBwc2V1ZG8tdHlwZXMgcmV0dXJuZWQgYnkgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVJZCB0aGUgbW9kdWxlIGlkZW50aWZpZXIgYXMgd291bGQgYmUgcGFzc2VkIHRvIGFuIGltcG9ydCBzdGF0ZW1lbnQuXG4gICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgcHVibGljIGdldFN0YXRpY1R5cGUobW9kdWxlSWQ6IHN0cmluZywgbmFtZTogc3RyaW5nKTogU3RhdGljVHlwZSB7XG4gICAgbGV0IGtleSA9IGBcIiR7bW9kdWxlSWR9XCIuJHtuYW1lfWA7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMudHlwZUNhY2hlLmdldChrZXkpO1xuICAgIGlmICghaXNQcmVzZW50KHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IG5ldyBTdGF0aWNUeXBlKG1vZHVsZUlkLCBuYW1lKTtcbiAgICAgIHRoaXMudHlwZUNhY2hlLnNldChrZXksIHJlc3VsdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwdWJsaWMgYW5ub3RhdGlvbnModHlwZTogU3RhdGljVHlwZSk6IGFueVtdIHtcbiAgICBsZXQgYW5ub3RhdGlvbnMgPSB0aGlzLmFubm90YXRpb25DYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgICBsZXQgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgaWYgKGlzUHJlc2VudChjbGFzc01ldGFkYXRhWydkZWNvcmF0b3JzJ10pKSB7XG4gICAgICAgIGFubm90YXRpb25zID0gKDxhbnlbXT5jbGFzc01ldGFkYXRhWydkZWNvcmF0b3JzJ10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IHRoaXMuY29udmVydEtub3duRGVjb3JhdG9yKHR5cGUubW9kdWxlSWQsIGRlY29yYXRvcikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZGVjb3JhdG9yID0+IGlzUHJlc2VudChkZWNvcmF0b3IpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYW5ub3RhdGlvbkNhY2hlLnNldCh0eXBlLCBhbm5vdGF0aW9ucyk7XG4gICAgfVxuICAgIHJldHVybiBhbm5vdGF0aW9ucztcbiAgfVxuXG4gIHB1YmxpYyBwcm9wTWV0YWRhdGEodHlwZTogU3RhdGljVHlwZSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgcHJvcE1ldGFkYXRhID0gdGhpcy5wcm9wZXJ0eUNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChwcm9wTWV0YWRhdGEpKSB7XG4gICAgICBsZXQgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgcHJvcE1ldGFkYXRhID0gdGhpcy5nZXRQcm9wZXJ0eU1ldGFkYXRhKHR5cGUubW9kdWxlSWQsIGNsYXNzTWV0YWRhdGFbJ21lbWJlcnMnXSk7XG4gICAgICB0aGlzLnByb3BlcnR5Q2FjaGUuc2V0KHR5cGUsIHByb3BNZXRhZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wTWV0YWRhdGE7XG4gIH1cblxuICBwdWJsaWMgcGFyYW1ldGVycyh0eXBlOiBTdGF0aWNUeXBlKTogYW55W10ge1xuICAgIGxldCBwYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJDYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQocGFyYW1ldGVycykpIHtcbiAgICAgIGxldCBjbGFzc01ldGFkYXRhID0gdGhpcy5nZXRUeXBlTWV0YWRhdGEodHlwZSk7XG4gICAgICBsZXQgY3RvckRhdGEgPSBjbGFzc01ldGFkYXRhWydtZW1iZXJzJ11bJ19fY3Rvcl9fJ107XG4gICAgICBpZiAoaXNQcmVzZW50KGN0b3JEYXRhKSkge1xuICAgICAgICBsZXQgY3RvciA9ICg8YW55W10+Y3RvckRhdGEpLmZpbmQoYSA9PiBhWydfX3N5bWJvbGljJ10gPT09ICdjb25zdHJ1Y3RvcicpO1xuICAgICAgICBwYXJhbWV0ZXJzID0gdGhpcy5zaW1wbGlmeSh0eXBlLm1vZHVsZUlkLCBjdG9yWydwYXJhbWV0ZXJzJ10pO1xuICAgICAgICB0aGlzLnBhcmFtZXRlckNhY2hlLnNldCh0eXBlLCBwYXJhbWV0ZXJzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnNpb25NYXAgPSBuZXcgTWFwPFN0YXRpY1R5cGUsIChtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IGFueSkgPT4gYW55PigpO1xuICBwcml2YXRlIGluaXRpYWxpemVDb252ZXJzaW9uTWFwKCk6IGFueSB7XG4gICAgbGV0IGNvcmVfbWV0YWRhdGEgPSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuICAgIGxldCBjb252ZXJzaW9uTWFwID0gdGhpcy5jb252ZXJzaW9uTWFwO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KFxuICAgICAgICB0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0RpcmVjdGl2ZScpLCAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgICAgIGlmICghaXNQcmVzZW50KHAwKSkge1xuICAgICAgICAgICAgcDAgPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVNZXRhZGF0YSh7XG4gICAgICAgICAgICBzZWxlY3RvcjogcDBbJ3NlbGVjdG9yJ10sXG4gICAgICAgICAgICBpbnB1dHM6IHAwWydpbnB1dHMnXSxcbiAgICAgICAgICAgIG91dHB1dHM6IHAwWydvdXRwdXRzJ10sXG4gICAgICAgICAgICBldmVudHM6IHAwWydldmVudHMnXSxcbiAgICAgICAgICAgIGhvc3Q6IHAwWydob3N0J10sXG4gICAgICAgICAgICBiaW5kaW5nczogcDBbJ2JpbmRpbmdzJ10sXG4gICAgICAgICAgICBwcm92aWRlcnM6IHAwWydwcm92aWRlcnMnXSxcbiAgICAgICAgICAgIGV4cG9ydEFzOiBwMFsnZXhwb3J0QXMnXSxcbiAgICAgICAgICAgIHF1ZXJpZXM6IHAwWydxdWVyaWVzJ10sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KFxuICAgICAgICB0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0NvbXBvbmVudCcpLCAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgICAgIGlmICghaXNQcmVzZW50KHAwKSkge1xuICAgICAgICAgICAgcDAgPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRNZXRhZGF0YSh7XG4gICAgICAgICAgICBzZWxlY3RvcjogcDBbJ3NlbGVjdG9yJ10sXG4gICAgICAgICAgICBpbnB1dHM6IHAwWydpbnB1dHMnXSxcbiAgICAgICAgICAgIG91dHB1dHM6IHAwWydvdXRwdXRzJ10sXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBwMFsncHJvcGVydGllcyddLFxuICAgICAgICAgICAgZXZlbnRzOiBwMFsnZXZlbnRzJ10sXG4gICAgICAgICAgICBob3N0OiBwMFsnaG9zdCddLFxuICAgICAgICAgICAgZXhwb3J0QXM6IHAwWydleHBvcnRBcyddLFxuICAgICAgICAgICAgbW9kdWxlSWQ6IHAwWydtb2R1bGVJZCddLFxuICAgICAgICAgICAgYmluZGluZ3M6IHAwWydiaW5kaW5ncyddLFxuICAgICAgICAgICAgcHJvdmlkZXJzOiBwMFsncHJvdmlkZXJzJ10sXG4gICAgICAgICAgICB2aWV3QmluZGluZ3M6IHAwWyd2aWV3QmluZGluZ3MnXSxcbiAgICAgICAgICAgIHZpZXdQcm92aWRlcnM6IHAwWyd2aWV3UHJvdmlkZXJzJ10sXG4gICAgICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IHAwWydjaGFuZ2VEZXRlY3Rpb24nXSxcbiAgICAgICAgICAgIHF1ZXJpZXM6IHAwWydxdWVyaWVzJ10sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogcDBbJ3RlbXBsYXRlVXJsJ10sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogcDBbJ3RlbXBsYXRlJ10sXG4gICAgICAgICAgICBzdHlsZVVybHM6IHAwWydzdHlsZVVybHMnXSxcbiAgICAgICAgICAgIHN0eWxlczogcDBbJ3N0eWxlcyddLFxuICAgICAgICAgICAgZGlyZWN0aXZlczogcDBbJ2RpcmVjdGl2ZXMnXSxcbiAgICAgICAgICAgIHBpcGVzOiBwMFsncGlwZXMnXSxcbiAgICAgICAgICAgIGVuY2Fwc3VsYXRpb246IHAwWydlbmNhcHN1bGF0aW9uJ11cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQoXG4gICAgICAgIHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnSW5wdXQnKSxcbiAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+XG4gICAgICAgICAgICBuZXcgSW5wdXRNZXRhZGF0YSh0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KFxuICAgICAgICB0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ091dHB1dCcpLFxuICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT5cbiAgICAgICAgICAgIG5ldyBPdXRwdXRNZXRhZGF0YSh0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnVmlldycpLCAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4ge1xuICAgICAgbGV0IHAwID0gdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCk7XG4gICAgICBpZiAoIWlzUHJlc2VudChwMCkpIHtcbiAgICAgICAgcDAgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVmlld01ldGFkYXRhKHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IHAwWyd0ZW1wbGF0ZVVybCddLFxuICAgICAgICB0ZW1wbGF0ZTogcDBbJ3RlbXBsYXRlJ10sXG4gICAgICAgIGRpcmVjdGl2ZXM6IHAwWydkaXJlY3RpdmVzJ10sXG4gICAgICAgIHBpcGVzOiBwMFsncGlwZXMnXSxcbiAgICAgICAgZW5jYXBzdWxhdGlvbjogcDBbJ2VuY2Fwc3VsYXRpb24nXSxcbiAgICAgICAgc3R5bGVzOiBwMFsnc3R5bGVzJ10sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldChcbiAgICAgICAgdGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdBdHRyaWJ1dGUnKSxcbiAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+XG4gICAgICAgICAgICBuZXcgQXR0cmlidXRlTWV0YWRhdGEodGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1F1ZXJ5JyksIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgIGxldCBwMSA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDEpO1xuICAgICAgaWYgKCFpc1ByZXNlbnQocDEpKSB7XG4gICAgICAgIHAxID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWV0YWRhdGEocDAsIHtkZXNjZW5kYW50czogcDEuZGVzY2VuZGFudHMsIGZpcnN0OiBwMS5maXJzdH0pO1xuICAgIH0pO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KFxuICAgICAgICB0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0NvbnRlbnRDaGlsZHJlbicpLFxuICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT5cbiAgICAgICAgICAgIG5ldyBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSh0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KFxuICAgICAgICB0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0NvbnRlbnRDaGlsZCcpLFxuICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT5cbiAgICAgICAgICAgIG5ldyBDb250ZW50Q2hpbGRNZXRhZGF0YSh0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KFxuICAgICAgICB0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1ZpZXdDaGlsZHJlbicpLFxuICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT5cbiAgICAgICAgICAgIG5ldyBWaWV3Q2hpbGRyZW5NZXRhZGF0YSh0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KFxuICAgICAgICB0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1ZpZXdDaGlsZCcpLFxuICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT5cbiAgICAgICAgICAgIG5ldyBWaWV3Q2hpbGRNZXRhZGF0YSh0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KFxuICAgICAgICB0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1ZpZXdRdWVyeScpLCAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgICAgIGxldCBwMSA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDEpO1xuICAgICAgICAgIGlmICghaXNQcmVzZW50KHAxKSkge1xuICAgICAgICAgICAgcDEgPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBWaWV3UXVlcnlNZXRhZGF0YShwMCwge1xuICAgICAgICAgICAgZGVzY2VuZGFudHM6IHAxWydkZXNjZW5kYW50cyddLFxuICAgICAgICAgICAgZmlyc3Q6IHAxWydmaXJzdCddLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1BpcGUnKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgaWYgKCFpc1ByZXNlbnQocDApKSB7XG4gICAgICAgIHAwID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFBpcGVNZXRhZGF0YSh7XG4gICAgICAgIG5hbWU6IHAwWyduYW1lJ10sXG4gICAgICAgIHB1cmU6IHAwWydwdXJlJ10sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldChcbiAgICAgICAgdGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdIb3N0QmluZGluZycpLFxuICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT5cbiAgICAgICAgICAgIG5ldyBIb3N0QmluZGluZ01ldGFkYXRhKHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApKSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQoXG4gICAgICAgIHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnSG9zdExpc3RlbmVyJyksXG4gICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgSG9zdExpc3RlbmVyTWV0YWRhdGEoXG4gICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSxcbiAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDEpKSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRLbm93bkRlY29yYXRvcihtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYW55IHtcbiAgICBsZXQgY29udmVydGVyID0gdGhpcy5jb252ZXJzaW9uTWFwLmdldCh0aGlzLmdldERlY29yYXRvclR5cGUobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikpO1xuICAgIGlmIChpc1ByZXNlbnQoY29udmVydGVyKSkgcmV0dXJuIGNvbnZlcnRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGVjb3JhdG9yVHlwZShtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IHtba2V5OiBzdHJpbmddOiBhbnl9KTogU3RhdGljVHlwZSB7XG4gICAgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uKGV4cHJlc3Npb24pKSB7XG4gICAgICBsZXQgdGFyZ2V0ID0gZXhwcmVzc2lvblsnZXhwcmVzc2lvbiddO1xuICAgICAgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24odGFyZ2V0KSkge1xuICAgICAgICBsZXQgbW9kdWxlSWQgPSB0aGlzLm5vcm1hbGl6ZU1vZHVsZU5hbWUobW9kdWxlQ29udGV4dCwgdGFyZ2V0Wydtb2R1bGUnXSk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRpY1R5cGUobW9kdWxlSWQsIHRhcmdldFsnbmFtZSddKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldERlY29yYXRvclBhcmFtZXRlcihcbiAgICAgIG1vZHVsZUNvbnRleHQ6IHN0cmluZywgZXhwcmVzc2lvbjoge1trZXk6IHN0cmluZ106IGFueX0sIGluZGV4OiBudW1iZXIpOiBhbnkge1xuICAgIGlmIChpc01ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbihleHByZXNzaW9uKSAmJiBpc1ByZXNlbnQoZXhwcmVzc2lvblsnYXJndW1lbnRzJ10pICYmXG4gICAgICAgICg8YW55W10+ZXhwcmVzc2lvblsnYXJndW1lbnRzJ10pLmxlbmd0aCA8PSBpbmRleCArIDEpIHtcbiAgICAgIHJldHVybiB0aGlzLnNpbXBsaWZ5KG1vZHVsZUNvbnRleHQsICg8YW55W10+ZXhwcmVzc2lvblsnYXJndW1lbnRzJ10pW2luZGV4XSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQcm9wZXJ0eU1ldGFkYXRhKG1vZHVsZUNvbnRleHQ6IHN0cmluZywgdmFsdWU6IHtba2V5OiBzdHJpbmddOiBhbnl9KTpcbiAgICAgIHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBpZiAoaXNQcmVzZW50KHZhbHVlKSkge1xuICAgICAgbGV0IHJlc3VsdCA9IHt9O1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHZhbHVlLCAodmFsdWUsIG5hbWUpID0+IHtcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmdldE1lbWJlckRhdGEobW9kdWxlQ29udGV4dCwgdmFsdWUpO1xuICAgICAgICBpZiAoaXNQcmVzZW50KGRhdGEpKSB7XG4gICAgICAgICAgbGV0IHByb3BlcnR5RGF0YSA9IGRhdGEuZmlsdGVyKGQgPT4gZFsna2luZCddID09ICdwcm9wZXJ0eScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGQgPT4gZFsnZGlyZWN0aXZlcyddKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgocCwgYykgPT4gKDxhbnlbXT5wKS5jb25jYXQoPGFueVtdPmMpLCBbXSk7XG4gICAgICAgICAgaWYgKHByb3BlcnR5RGF0YS5sZW5ndGggIT0gMCkge1xuICAgICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocmVzdWx0LCBuYW1lLCBwcm9wZXJ0eURhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIGNsYW5nLWZvcm1hdCBvZmZcbiAgcHJpdmF0ZSBnZXRNZW1iZXJEYXRhKG1vZHVsZUNvbnRleHQ6IHN0cmluZywgbWVtYmVyOiB7IFtrZXk6IHN0cmluZ106IGFueSB9W10pOiB7IFtrZXk6IHN0cmluZ106IGFueSB9W10ge1xuICAgIC8vIGNsYW5nLWZvcm1hdCBvblxuICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICBpZiAoaXNQcmVzZW50KG1lbWJlcikpIHtcbiAgICAgIGZvciAobGV0IGl0ZW0gb2YgbWVtYmVyKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICBraW5kOiBpdGVtWydfX3N5bWJvbGljJ10sXG4gICAgICAgICAgZGlyZWN0aXZlczogaXNQcmVzZW50KGl0ZW1bJ2RlY29yYXRvcnMnXSkgP1xuICAgICAgICAgICAgICAoPGFueVtdPml0ZW1bJ2RlY29yYXRvcnMnXSlcbiAgICAgICAgICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IHRoaXMuY29udmVydEtub3duRGVjb3JhdG9yKG1vZHVsZUNvbnRleHQsIGRlY29yYXRvcikpXG4gICAgICAgICAgICAgICAgICAuZmlsdGVyKGQgPT4gaXNQcmVzZW50KGQpKSA6XG4gICAgICAgICAgICAgIG51bGxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBzaW1wbGlmeShtb2R1bGVDb250ZXh0OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBhbnkge1xuICAgIGxldCBfdGhpcyA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBzaW1wbGlmeShleHByZXNzaW9uOiBhbnkpOiBhbnkge1xuICAgICAgaWYgKGlzUHJpbWl0aXZlKGV4cHJlc3Npb24pKSB7XG4gICAgICAgIHJldHVybiBleHByZXNzaW9uO1xuICAgICAgfVxuICAgICAgaWYgKGlzQXJyYXkoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpdGVtIG9mICg8YW55PmV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goc2ltcGxpZnkoaXRlbSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KGV4cHJlc3Npb24pKSB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZXhwcmVzc2lvblsnX19zeW1ib2xpYyddKSkge1xuICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnX19zeW1ib2xpYyddKSB7XG4gICAgICAgICAgICBjYXNlICdiaW5vcCc6XG4gICAgICAgICAgICAgIGxldCBsZWZ0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnbGVmdCddKTtcbiAgICAgICAgICAgICAgbGV0IHJpZ2h0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsncmlnaHQnXSk7XG4gICAgICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnb3BlcmF0b3InXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJyYmJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICYmIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ3x8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IHx8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgfCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IF4gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAmIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID09IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyE9JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICE9IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICE9PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA+IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDw9IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID49IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzw8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDw8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz4+JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID4+IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgKyByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IC0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAqIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgLyByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICUgcmlnaHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlICdwcmUnOlxuICAgICAgICAgICAgICBsZXQgb3BlcmFuZCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ29wZXJhbmQnXSk7XG4gICAgICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnb3BlcmF0b3InXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wZXJhbmQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gLW9wZXJhbmQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gIW9wZXJhbmQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnfic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gfm9wZXJhbmQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlICdpbmRleCc6XG4gICAgICAgICAgICAgIGxldCBpbmRleFRhcmdldCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXSk7XG4gICAgICAgICAgICAgIGxldCBpbmRleCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2luZGV4J10pO1xuICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KGluZGV4VGFyZ2V0KSAmJiBpc1ByaW1pdGl2ZShpbmRleCkpIHJldHVybiBpbmRleFRhcmdldFtpbmRleF07XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgICAgICAgICAgbGV0IHNlbGVjdFRhcmdldCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXSk7XG4gICAgICAgICAgICAgIGxldCBtZW1iZXIgPSBzaW1wbGlmeShleHByZXNzaW9uWydtZW1iZXInXSk7XG4gICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoc2VsZWN0VGFyZ2V0KSAmJiBpc1ByaW1pdGl2ZShtZW1iZXIpKSByZXR1cm4gc2VsZWN0VGFyZ2V0W21lbWJlcl07XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSAncmVmZXJlbmNlJzpcbiAgICAgICAgICAgICAgbGV0IHJlZmVyZW5jZU1vZHVsZU5hbWUgPVxuICAgICAgICAgICAgICAgICAgX3RoaXMubm9ybWFsaXplTW9kdWxlTmFtZShtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uWydtb2R1bGUnXSk7XG4gICAgICAgICAgICAgIGxldCByZWZlcmVuY2VNb2R1bGUgPSBfdGhpcy5nZXRNb2R1bGVNZXRhZGF0YShyZWZlcmVuY2VNb2R1bGVOYW1lKTtcbiAgICAgICAgICAgICAgbGV0IHJlZmVyZW5jZVZhbHVlID0gcmVmZXJlbmNlTW9kdWxlWydtZXRhZGF0YSddW2V4cHJlc3Npb25bJ25hbWUnXV07XG4gICAgICAgICAgICAgIGlmIChpc0NsYXNzTWV0YWRhdGEocmVmZXJlbmNlVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gQ29udmVydCB0byBhIHBzZXVkbyB0eXBlXG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmdldFN0YXRpY1R5cGUocmVmZXJlbmNlTW9kdWxlTmFtZSwgZXhwcmVzc2lvblsnbmFtZSddKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuc2ltcGxpZnkocmVmZXJlbmNlTW9kdWxlTmFtZSwgcmVmZXJlbmNlVmFsdWUpO1xuICAgICAgICAgICAgY2FzZSAnY2FsbCc6XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVzdWx0ID0ge307XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChleHByZXNzaW9uLCAodmFsdWUsIG5hbWUpID0+IHsgcmVzdWx0W25hbWVdID0gc2ltcGxpZnkodmFsdWUpOyB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBzaW1wbGlmeSh2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIGdldE1vZHVsZU1ldGFkYXRhKG1vZHVsZTogc3RyaW5nKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCBtb2R1bGVNZXRhZGF0YSA9IHRoaXMubWV0YWRhdGFDYWNoZS5nZXQobW9kdWxlKTtcbiAgICBpZiAoIWlzUHJlc2VudChtb2R1bGVNZXRhZGF0YSkpIHtcbiAgICAgIG1vZHVsZU1ldGFkYXRhID0gdGhpcy5ob3N0LmdldE1ldGFkYXRhRm9yKG1vZHVsZSk7XG4gICAgICBpZiAoIWlzUHJlc2VudChtb2R1bGVNZXRhZGF0YSkpIHtcbiAgICAgICAgbW9kdWxlTWV0YWRhdGEgPSB7X19zeW1ib2xpYzogJ21vZHVsZScsIG1vZHVsZTogbW9kdWxlLCBtZXRhZGF0YToge319O1xuICAgICAgfVxuICAgICAgdGhpcy5tZXRhZGF0YUNhY2hlLnNldChtb2R1bGUsIG1vZHVsZU1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZHVsZU1ldGFkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUeXBlTWV0YWRhdGEodHlwZTogU3RhdGljVHlwZSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLmdldE1vZHVsZU1ldGFkYXRhKHR5cGUubW9kdWxlSWQpO1xuICAgIGxldCByZXN1bHQgPSBtb2R1bGVNZXRhZGF0YVsnbWV0YWRhdGEnXVt0eXBlLm5hbWVdO1xuICAgIGlmICghaXNQcmVzZW50KHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IHtfX3N5bWJvbGljOiAnY2xhc3MnfTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgbm9ybWFsaXplTW9kdWxlTmFtZShmcm9tOiBzdHJpbmcsIHRvOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0by5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgIHJldHVybiBwYXRoVG8oZnJvbSwgdG8pO1xuICAgIH1cbiAgICByZXR1cm4gdG87XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNNZXRhZGF0YVN5bWJvbGljQ2FsbEV4cHJlc3Npb24oZXhwcmVzc2lvbjogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAhaXNQcmltaXRpdmUoZXhwcmVzc2lvbikgJiYgIWlzQXJyYXkoZXhwcmVzc2lvbikgJiYgZXhwcmVzc2lvblsnX19zeW1ib2xpYyddID09ICdjYWxsJztcbn1cblxuZnVuY3Rpb24gaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbihleHByZXNzaW9uOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpc1ByaW1pdGl2ZShleHByZXNzaW9uKSAmJiAhaXNBcnJheShleHByZXNzaW9uKSAmJlxuICAgICAgZXhwcmVzc2lvblsnX19zeW1ib2xpYyddID09ICdyZWZlcmVuY2UnO1xufVxuXG5mdW5jdGlvbiBpc0NsYXNzTWV0YWRhdGEoZXhwcmVzc2lvbjogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAhaXNQcmltaXRpdmUoZXhwcmVzc2lvbikgJiYgIWlzQXJyYXkoZXhwcmVzc2lvbikgJiYgZXhwcmVzc2lvblsnX19zeW1ib2xpYyddID09ICdjbGFzcyc7XG59XG5cbmZ1bmN0aW9uIHNwbGl0UGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBwYXRoLnNwbGl0KC9cXC98XFxcXC9nKTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVBhdGgocGF0aFBhcnRzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIGxldCByZXN1bHQgPSBbXTtcbiAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChwYXRoUGFydHMsIChwYXJ0LCBpbmRleCkgPT4ge1xuICAgIHN3aXRjaCAocGFydCkge1xuICAgICAgY2FzZSAnJzpcbiAgICAgIGNhc2UgJy4nOlxuICAgICAgICBpZiAoaW5kZXggPiAwKSByZXR1cm47XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLi4nOlxuICAgICAgICBpZiAoaW5kZXggPiAwICYmIHJlc3VsdC5sZW5ndGggIT0gMCkgcmVzdWx0LnBvcCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlc3VsdC5wdXNoKHBhcnQpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdC5qb2luKCcvJyk7XG59XG5cbmZ1bmN0aW9uIHBhdGhUbyhmcm9tOiBzdHJpbmcsIHRvOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgcmVzdWx0ID0gdG87XG4gIGlmICh0by5zdGFydHNXaXRoKCcuJykpIHtcbiAgICBsZXQgZnJvbVBhcnRzID0gc3BsaXRQYXRoKGZyb20pO1xuICAgIGZyb21QYXJ0cy5wb3AoKTsgIC8vIHJlbW92ZSB0aGUgZmlsZSBuYW1lLlxuICAgIGxldCB0b1BhcnRzID0gc3BsaXRQYXRoKHRvKTtcbiAgICByZXN1bHQgPSByZXNvbHZlUGF0aChmcm9tUGFydHMuY29uY2F0KHRvUGFydHMpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19