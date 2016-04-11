'use strict';var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var metadata_1 = require('angular2/src/core/metadata');
/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
var StaticType = (function () {
    function StaticType(moduleId, name) {
        this.moduleId = moduleId;
        this.name = name;
    }
    return StaticType;
})();
exports.StaticType = StaticType;
/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
var StaticReflector = (function () {
    function StaticReflector(host) {
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
    StaticReflector.prototype.getStaticType = function (moduleId, name) {
        var key = "\"" + moduleId + "\"." + name;
        var result = this.typeCache.get(key);
        if (!lang_1.isPresent(result)) {
            result = new StaticType(moduleId, name);
            this.typeCache.set(key, result);
        }
        return result;
    };
    StaticReflector.prototype.annotations = function (type) {
        var _this = this;
        var annotations = this.annotationCache.get(type);
        if (!lang_1.isPresent(annotations)) {
            var classMetadata = this.getTypeMetadata(type);
            if (lang_1.isPresent(classMetadata['decorators'])) {
                annotations = classMetadata['decorators']
                    .map(function (decorator) { return _this.convertKnownDecorator(type.moduleId, decorator); })
                    .filter(function (decorator) { return lang_1.isPresent(decorator); });
            }
            this.annotationCache.set(type, annotations);
        }
        return annotations;
    };
    StaticReflector.prototype.propMetadata = function (type) {
        var propMetadata = this.propertyCache.get(type);
        if (!lang_1.isPresent(propMetadata)) {
            var classMetadata = this.getTypeMetadata(type);
            propMetadata = this.getPropertyMetadata(type.moduleId, classMetadata['members']);
            this.propertyCache.set(type, propMetadata);
        }
        return propMetadata;
    };
    StaticReflector.prototype.parameters = function (type) {
        var parameters = this.parameterCache.get(type);
        if (!lang_1.isPresent(parameters)) {
            var classMetadata = this.getTypeMetadata(type);
            var ctorData = classMetadata['members']['__ctor__'];
            if (lang_1.isPresent(ctorData)) {
                var ctor = ctorData.find(function (a) { return a['__symbolic'] === 'constructor'; });
                parameters = this.simplify(type.moduleId, ctor['parameters']);
                this.parameterCache.set(type, parameters);
            }
        }
        return parameters;
    };
    StaticReflector.prototype.initializeConversionMap = function () {
        var _this = this;
        var core_metadata = 'angular2/src/core/metadata';
        var conversionMap = this.conversionMap;
        conversionMap.set(this.getStaticType(core_metadata, 'Directive'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.DirectiveMetadata({
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
        conversionMap.set(this.getStaticType(core_metadata, 'Component'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.ComponentMetadata({
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
        conversionMap.set(this.getStaticType(core_metadata, 'Input'), function (moduleContext, expression) {
            return new metadata_1.InputMetadata(_this.getDecoratorParameter(moduleContext, expression, 0));
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Output'), function (moduleContext, expression) {
            return new metadata_1.OutputMetadata(_this.getDecoratorParameter(moduleContext, expression, 0));
        });
        conversionMap.set(this.getStaticType(core_metadata, 'View'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.ViewMetadata({
                templateUrl: p0['templateUrl'],
                template: p0['template'],
                directives: p0['directives'],
                pipes: p0['pipes'],
                encapsulation: p0['encapsulation'],
                styles: p0['styles'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Attribute'), function (moduleContext, expression) {
            return new metadata_1.AttributeMetadata(_this.getDecoratorParameter(moduleContext, expression, 0));
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Query'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            var p1 = _this.getDecoratorParameter(moduleContext, expression, 1);
            if (!lang_1.isPresent(p1)) {
                p1 = {};
            }
            return new metadata_1.QueryMetadata(p0, { descendants: p1.descendants, first: p1.first });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChildren'), function (moduleContext, expression) {
            return new metadata_1.ContentChildrenMetadata(_this.getDecoratorParameter(moduleContext, expression, 0));
        });
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChild'), function (moduleContext, expression) {
            return new metadata_1.ContentChildMetadata(_this.getDecoratorParameter(moduleContext, expression, 0));
        });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChildren'), function (moduleContext, expression) {
            return new metadata_1.ViewChildrenMetadata(_this.getDecoratorParameter(moduleContext, expression, 0));
        });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChild'), function (moduleContext, expression) {
            return new metadata_1.ViewChildMetadata(_this.getDecoratorParameter(moduleContext, expression, 0));
        });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewQuery'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            var p1 = _this.getDecoratorParameter(moduleContext, expression, 1);
            if (!lang_1.isPresent(p1)) {
                p1 = {};
            }
            return new metadata_1.ViewQueryMetadata(p0, {
                descendants: p1['descendants'],
                first: p1['first'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Pipe'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.PipeMetadata({
                name: p0['name'],
                pure: p0['pure'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'HostBinding'), function (moduleContext, expression) {
            return new metadata_1.HostBindingMetadata(_this.getDecoratorParameter(moduleContext, expression, 0));
        });
        conversionMap.set(this.getStaticType(core_metadata, 'HostListener'), function (moduleContext, expression) { return new metadata_1.HostListenerMetadata(_this.getDecoratorParameter(moduleContext, expression, 0), _this.getDecoratorParameter(moduleContext, expression, 1)); });
        return null;
    };
    StaticReflector.prototype.convertKnownDecorator = function (moduleContext, expression) {
        var converter = this.conversionMap.get(this.getDecoratorType(moduleContext, expression));
        if (lang_1.isPresent(converter))
            return converter(moduleContext, expression);
        return null;
    };
    StaticReflector.prototype.getDecoratorType = function (moduleContext, expression) {
        if (isMetadataSymbolicCallExpression(expression)) {
            var target = expression['expression'];
            if (isMetadataSymbolicReferenceExpression(target)) {
                var moduleId = this.normalizeModuleName(moduleContext, target['module']);
                return this.getStaticType(moduleId, target['name']);
            }
        }
        return null;
    };
    StaticReflector.prototype.getDecoratorParameter = function (moduleContext, expression, index) {
        if (isMetadataSymbolicCallExpression(expression) && lang_1.isPresent(expression['arguments']) &&
            expression['arguments'].length <= index + 1) {
            return this.simplify(moduleContext, expression['arguments'][index]);
        }
        return null;
    };
    StaticReflector.prototype.getPropertyMetadata = function (moduleContext, value) {
        var _this = this;
        if (lang_1.isPresent(value)) {
            var result = {};
            collection_1.StringMapWrapper.forEach(value, function (value, name) {
                var data = _this.getMemberData(moduleContext, value);
                if (lang_1.isPresent(data)) {
                    var propertyData = data.filter(function (d) { return d['kind'] == 'property'; })
                        .map(function (d) { return d['directives']; })
                        .reduce(function (p, c) { return p.concat(c); }, []);
                    if (propertyData.length != 0) {
                        collection_1.StringMapWrapper.set(result, name, propertyData);
                    }
                }
            });
            return result;
        }
        return null;
    };
    // clang-format off
    StaticReflector.prototype.getMemberData = function (moduleContext, member) {
        var _this = this;
        // clang-format on
        var result = [];
        if (lang_1.isPresent(member)) {
            for (var _i = 0; _i < member.length; _i++) {
                var item = member[_i];
                result.push({
                    kind: item['__symbolic'],
                    directives: lang_1.isPresent(item['decorators']) ?
                        item['decorators']
                            .map(function (decorator) { return _this.convertKnownDecorator(moduleContext, decorator); })
                            .filter(function (d) { return lang_1.isPresent(d); }) :
                        null
                });
            }
        }
        return result;
    };
    /** @internal */
    StaticReflector.prototype.simplify = function (moduleContext, value) {
        var _this = this;
        function simplify(expression) {
            if (lang_1.isPrimitive(expression)) {
                return expression;
            }
            if (lang_1.isArray(expression)) {
                var result = [];
                for (var _i = 0, _a = expression; _i < _a.length; _i++) {
                    var item = _a[_i];
                    result.push(simplify(item));
                }
                return result;
            }
            if (lang_1.isPresent(expression)) {
                if (lang_1.isPresent(expression['__symbolic'])) {
                    switch (expression['__symbolic']) {
                        case 'binop':
                            var left = simplify(expression['left']);
                            var right = simplify(expression['right']);
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
                            var operand = simplify(expression['operand']);
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
                            var indexTarget = simplify(expression['expression']);
                            var index = simplify(expression['index']);
                            if (lang_1.isPresent(indexTarget) && lang_1.isPrimitive(index))
                                return indexTarget[index];
                            return null;
                        case 'select':
                            var selectTarget = simplify(expression['expression']);
                            var member = simplify(expression['member']);
                            if (lang_1.isPresent(selectTarget) && lang_1.isPrimitive(member))
                                return selectTarget[member];
                            return null;
                        case 'reference':
                            var referenceModuleName = _this.normalizeModuleName(moduleContext, expression['module']);
                            var referenceModule = _this.getModuleMetadata(referenceModuleName);
                            var referenceValue = referenceModule['metadata'][expression['name']];
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
                var result = {};
                collection_1.StringMapWrapper.forEach(expression, function (value, name) { result[name] = simplify(value); });
                return result;
            }
            return null;
        }
        return simplify(value);
    };
    StaticReflector.prototype.getModuleMetadata = function (module) {
        var moduleMetadata = this.metadataCache.get(module);
        if (!lang_1.isPresent(moduleMetadata)) {
            moduleMetadata = this.host.getMetadataFor(module);
            if (!lang_1.isPresent(moduleMetadata)) {
                moduleMetadata = { __symbolic: 'module', module: module, metadata: {} };
            }
            this.metadataCache.set(module, moduleMetadata);
        }
        return moduleMetadata;
    };
    StaticReflector.prototype.getTypeMetadata = function (type) {
        var moduleMetadata = this.getModuleMetadata(type.moduleId);
        var result = moduleMetadata['metadata'][type.name];
        if (!lang_1.isPresent(result)) {
            result = { __symbolic: 'class' };
        }
        return result;
    };
    StaticReflector.prototype.normalizeModuleName = function (from, to) {
        if (to.startsWith('.')) {
            return pathTo(from, to);
        }
        return to;
    };
    return StaticReflector;
})();
exports.StaticReflector = StaticReflector;
function isMetadataSymbolicCallExpression(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) && expression['__symbolic'] == 'call';
}
function isMetadataSymbolicReferenceExpression(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) &&
        expression['__symbolic'] == 'reference';
}
function isClassMetadata(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) && expression['__symbolic'] == 'class';
}
function splitPath(path) {
    return path.split(/\/|\\/g);
}
function resolvePath(pathParts) {
    var result = [];
    collection_1.ListWrapper.forEachWithIndex(pathParts, function (part, index) {
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
    var result = to;
    if (to.startsWith('.')) {
        var fromParts = splitPath(from);
        fromParts.pop(); // remove the file name.
        var toParts = splitPath(to);
        result = resolvePath(fromParts.concat(toParts));
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUHZPdVJqdngudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9zdGF0aWNfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbIlN0YXRpY1R5cGUiLCJTdGF0aWNUeXBlLmNvbnN0cnVjdG9yIiwiU3RhdGljUmVmbGVjdG9yIiwiU3RhdGljUmVmbGVjdG9yLmNvbnN0cnVjdG9yIiwiU3RhdGljUmVmbGVjdG9yLmdldFN0YXRpY1R5cGUiLCJTdGF0aWNSZWZsZWN0b3IuYW5ub3RhdGlvbnMiLCJTdGF0aWNSZWZsZWN0b3IucHJvcE1ldGFkYXRhIiwiU3RhdGljUmVmbGVjdG9yLnBhcmFtZXRlcnMiLCJTdGF0aWNSZWZsZWN0b3IuaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAiLCJTdGF0aWNSZWZsZWN0b3IuY29udmVydEtub3duRGVjb3JhdG9yIiwiU3RhdGljUmVmbGVjdG9yLmdldERlY29yYXRvclR5cGUiLCJTdGF0aWNSZWZsZWN0b3IuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyIiwiU3RhdGljUmVmbGVjdG9yLmdldFByb3BlcnR5TWV0YWRhdGEiLCJTdGF0aWNSZWZsZWN0b3IuZ2V0TWVtYmVyRGF0YSIsIlN0YXRpY1JlZmxlY3Rvci5zaW1wbGlmeSIsIlN0YXRpY1JlZmxlY3Rvci5zaW1wbGlmeS5zaW1wbGlmeSIsIlN0YXRpY1JlZmxlY3Rvci5nZXRNb2R1bGVNZXRhZGF0YSIsIlN0YXRpY1JlZmxlY3Rvci5nZXRUeXBlTWV0YWRhdGEiLCJTdGF0aWNSZWZsZWN0b3Iubm9ybWFsaXplTW9kdWxlTmFtZSIsImlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uIiwiaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiIsImlzQ2xhc3NNZXRhZGF0YSIsInNwbGl0UGF0aCIsInJlc29sdmVQYXRoIiwicGF0aFRvIl0sIm1hcHBpbmdzIjoiQUFBQSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSxxQkFBaUYsMEJBQTBCLENBQUMsQ0FBQTtBQUM1Ryx5QkFBdVMsNEJBQTRCLENBQUMsQ0FBQTtBQW1CcFU7Ozs7R0FJRztBQUNIO0lBQ0VBLG9CQUFtQkEsUUFBZ0JBLEVBQVNBLElBQVlBO1FBQXJDQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFRQTtRQUFTQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFRQTtJQUFHQSxDQUFDQTtJQUM5REQsaUJBQUNBO0FBQURBLENBQUNBLEFBRkQsSUFFQztBQUZZLGtCQUFVLGFBRXRCLENBQUE7QUFFRDs7O0dBR0c7QUFDSDtJQU9FRSx5QkFBb0JBLElBQXlCQTtRQUF6QkMsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBcUJBO1FBTnJDQSxjQUFTQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFzQkEsQ0FBQ0E7UUFDMUNBLG9CQUFlQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFxQkEsQ0FBQ0E7UUFDL0NBLGtCQUFhQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFvQ0EsQ0FBQ0E7UUFDNURBLG1CQUFjQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFxQkEsQ0FBQ0E7UUFDOUNBLGtCQUFhQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFnQ0EsQ0FBQ0E7UUEyRHhEQSxrQkFBYUEsR0FBR0EsSUFBSUEsR0FBR0EsRUFBK0RBLENBQUNBO1FBekQ5Q0EsSUFBSUEsQ0FBQ0EsdUJBQXVCQSxFQUFFQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUVsRkQ7Ozs7OztPQU1HQTtJQUNJQSx1Q0FBYUEsR0FBcEJBLFVBQXFCQSxRQUFnQkEsRUFBRUEsSUFBWUE7UUFDakRFLElBQUlBLEdBQUdBLEdBQUdBLE9BQUlBLFFBQVFBLFdBQUtBLElBQU1BLENBQUNBO1FBQ2xDQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxNQUFNQSxHQUFHQSxJQUFJQSxVQUFVQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUN4Q0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDbENBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUVNRixxQ0FBV0EsR0FBbEJBLFVBQW1CQSxJQUFnQkE7UUFBbkNHLGlCQVlDQTtRQVhDQSxJQUFJQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNqREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxhQUFhQSxHQUFHQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUMvQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLGFBQWFBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMzQ0EsV0FBV0EsR0FBV0EsYUFBYUEsQ0FBQ0EsWUFBWUEsQ0FBRUE7cUJBQy9CQSxHQUFHQSxDQUFDQSxVQUFBQSxTQUFTQSxJQUFJQSxPQUFBQSxLQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLFNBQVNBLENBQUNBLEVBQXBEQSxDQUFvREEsQ0FBQ0E7cUJBQ3RFQSxNQUFNQSxDQUFDQSxVQUFBQSxTQUFTQSxJQUFJQSxPQUFBQSxnQkFBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBcEJBLENBQW9CQSxDQUFDQSxDQUFDQTtZQUMvREEsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDOUNBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUVNSCxzQ0FBWUEsR0FBbkJBLFVBQW9CQSxJQUFnQkE7UUFDbENJLElBQUlBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2hEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLElBQUlBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQy9DQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLGFBQWFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pGQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxFQUFFQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUM3Q0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7SUFDdEJBLENBQUNBO0lBRU1KLG9DQUFVQSxHQUFqQkEsVUFBa0JBLElBQWdCQTtRQUNoQ0ssSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDL0NBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzQkEsSUFBSUEsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLElBQUlBLFFBQVFBLEdBQUdBLGFBQWFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1lBQ3BEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hCQSxJQUFJQSxJQUFJQSxHQUFXQSxRQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFBQSxDQUFDQSxJQUFJQSxPQUFBQSxDQUFDQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxhQUFhQSxFQUFqQ0EsQ0FBaUNBLENBQUNBLENBQUNBO2dCQUMxRUEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzlEQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtZQUM1Q0EsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0lBR09MLGlEQUF1QkEsR0FBL0JBO1FBQUFNLGlCQXFJQ0E7UUFwSUNBLElBQUlBLGFBQWFBLEdBQUdBLDRCQUE0QkEsQ0FBQ0E7UUFDakRBLElBQUlBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBO1FBQ3ZDQSxhQUFhQSxDQUFDQSxHQUFHQSxDQUNiQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxhQUFhQSxFQUFFQSxXQUFXQSxDQUFDQSxFQUFFQSxVQUFDQSxhQUFhQSxFQUFFQSxVQUFVQTtZQUN4RUEsSUFBSUEsRUFBRUEsR0FBR0EsS0FBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxhQUFhQSxFQUFFQSxVQUFVQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQkEsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDVkEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsNEJBQWlCQSxDQUFDQTtnQkFDM0JBLFFBQVFBLEVBQUVBLEVBQUVBLENBQUNBLFVBQVVBLENBQUNBO2dCQUN4QkEsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7Z0JBQ3BCQSxPQUFPQSxFQUFFQSxFQUFFQSxDQUFDQSxTQUFTQSxDQUFDQTtnQkFDdEJBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBLFFBQVFBLENBQUNBO2dCQUNwQkEsSUFBSUEsRUFBRUEsRUFBRUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7Z0JBQ2hCQSxRQUFRQSxFQUFFQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQTtnQkFDeEJBLFNBQVNBLEVBQUVBLEVBQUVBLENBQUNBLFdBQVdBLENBQUNBO2dCQUMxQkEsUUFBUUEsRUFBRUEsRUFBRUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7Z0JBQ3hCQSxPQUFPQSxFQUFFQSxFQUFFQSxDQUFDQSxTQUFTQSxDQUFDQTthQUN2QkEsQ0FBQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDUEEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FDYkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFBRUEsV0FBV0EsQ0FBQ0EsRUFBRUEsVUFBQ0EsYUFBYUEsRUFBRUEsVUFBVUE7WUFDeEVBLElBQUlBLEVBQUVBLEdBQUdBLEtBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ1ZBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLDRCQUFpQkEsQ0FBQ0E7Z0JBQzNCQSxRQUFRQSxFQUFFQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQTtnQkFDeEJBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBLFFBQVFBLENBQUNBO2dCQUNwQkEsT0FBT0EsRUFBRUEsRUFBRUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7Z0JBQ3RCQSxVQUFVQSxFQUFFQSxFQUFFQSxDQUFDQSxZQUFZQSxDQUFDQTtnQkFDNUJBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBLFFBQVFBLENBQUNBO2dCQUNwQkEsSUFBSUEsRUFBRUEsRUFBRUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7Z0JBQ2hCQSxRQUFRQSxFQUFFQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQTtnQkFDeEJBLFFBQVFBLEVBQUVBLEVBQUVBLENBQUNBLFVBQVVBLENBQUNBO2dCQUN4QkEsUUFBUUEsRUFBRUEsRUFBRUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7Z0JBQ3hCQSxTQUFTQSxFQUFFQSxFQUFFQSxDQUFDQSxXQUFXQSxDQUFDQTtnQkFDMUJBLFlBQVlBLEVBQUVBLEVBQUVBLENBQUNBLGNBQWNBLENBQUNBO2dCQUNoQ0EsYUFBYUEsRUFBRUEsRUFBRUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7Z0JBQ2xDQSxlQUFlQSxFQUFFQSxFQUFFQSxDQUFDQSxpQkFBaUJBLENBQUNBO2dCQUN0Q0EsT0FBT0EsRUFBRUEsRUFBRUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7Z0JBQ3RCQSxXQUFXQSxFQUFFQSxFQUFFQSxDQUFDQSxhQUFhQSxDQUFDQTtnQkFDOUJBLFFBQVFBLEVBQUVBLEVBQUVBLENBQUNBLFVBQVVBLENBQUNBO2dCQUN4QkEsU0FBU0EsRUFBRUEsRUFBRUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7Z0JBQzFCQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxRQUFRQSxDQUFDQTtnQkFDcEJBLFVBQVVBLEVBQUVBLEVBQUVBLENBQUNBLFlBQVlBLENBQUNBO2dCQUM1QkEsS0FBS0EsRUFBRUEsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0JBQ2xCQSxhQUFhQSxFQUFFQSxFQUFFQSxDQUFDQSxlQUFlQSxDQUFDQTthQUNuQ0EsQ0FBQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDUEEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FDYkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFBRUEsT0FBT0EsQ0FBQ0EsRUFDMUNBLFVBQUNBLGFBQWFBLEVBQUVBLFVBQVVBO21CQUN0QkEsSUFBSUEsd0JBQWFBLENBQUNBLEtBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFBM0VBLENBQTJFQSxDQUFDQSxDQUFDQTtRQUNyRkEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FDYkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFBRUEsUUFBUUEsQ0FBQ0EsRUFDM0NBLFVBQUNBLGFBQWFBLEVBQUVBLFVBQVVBO21CQUN0QkEsSUFBSUEseUJBQWNBLENBQUNBLEtBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFBNUVBLENBQTRFQSxDQUFDQSxDQUFDQTtRQUN0RkEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFBRUEsTUFBTUEsQ0FBQ0EsRUFBRUEsVUFBQ0EsYUFBYUEsRUFBRUEsVUFBVUE7WUFDckZBLElBQUlBLEVBQUVBLEdBQUdBLEtBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ1ZBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLHVCQUFZQSxDQUFDQTtnQkFDdEJBLFdBQVdBLEVBQUVBLEVBQUVBLENBQUNBLGFBQWFBLENBQUNBO2dCQUM5QkEsUUFBUUEsRUFBRUEsRUFBRUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7Z0JBQ3hCQSxVQUFVQSxFQUFFQSxFQUFFQSxDQUFDQSxZQUFZQSxDQUFDQTtnQkFDNUJBLEtBQUtBLEVBQUVBLEVBQUVBLENBQUNBLE9BQU9BLENBQUNBO2dCQUNsQkEsYUFBYUEsRUFBRUEsRUFBRUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7Z0JBQ2xDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxRQUFRQSxDQUFDQTthQUNyQkEsQ0FBQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDSEEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FDYkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFBRUEsV0FBV0EsQ0FBQ0EsRUFDOUNBLFVBQUNBLGFBQWFBLEVBQUVBLFVBQVVBO21CQUN0QkEsSUFBSUEsNEJBQWlCQSxDQUFDQSxLQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLGFBQWFBLEVBQUVBLFVBQVVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQS9FQSxDQUErRUEsQ0FBQ0EsQ0FBQ0E7UUFDekZBLGFBQWFBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGFBQWFBLEVBQUVBLE9BQU9BLENBQUNBLEVBQUVBLFVBQUNBLGFBQWFBLEVBQUVBLFVBQVVBO1lBQ3RGQSxJQUFJQSxFQUFFQSxHQUFHQSxLQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLGFBQWFBLEVBQUVBLFVBQVVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xFQSxJQUFJQSxFQUFFQSxHQUFHQSxLQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLGFBQWFBLEVBQUVBLFVBQVVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25CQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUNWQSxDQUFDQTtZQUNEQSxNQUFN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QUFNQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFVBQVVBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUN4Q0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQ2pDQSxLQUFLQSxPQUFPQTs0QkFDVkEsSUFBSUEsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ3hDQSxJQUFJQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDMUNBLE1BQU1BLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dDQUMvQkEsS0FBS0EsSUFBSUE7b0NBQ1BBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBO2dDQUN2QkEsS0FBS0EsSUFBSUE7b0NBQ1BBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBO2dDQUN2QkEsS0FBS0EsR0FBR0E7b0NBQ05BLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUN0QkEsS0FBS0EsR0FBR0E7b0NBQ05BLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUN0QkEsS0FBS0EsR0FBR0E7b0NBQ05BLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUN0QkEsS0FBS0EsSUFBSUE7b0NBQ1BBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBO2dDQUN2QkEsS0FBS0EsSUFBSUE7b0NBQ1BBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBO2dDQUN2QkEsS0FBS0EsS0FBS0E7b0NBQ1JBLE1BQU1BLENBQUNBLElBQUlBLEtBQUtBLEtBQUtBLENBQUNBO2dDQUN4QkEsS0FBS0EsS0FBS0E7b0NBQ1JBLE1BQU1BLENBQUNBLElBQUlBLEtBQUtBLEtBQUtBLENBQUNBO2dDQUN4QkEsS0FBS0EsR0FBR0E7b0NBQ05BLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUN0QkEsS0FBS0EsR0FBR0E7b0NBQ05BLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUN0QkEsS0FBS0EsSUFBSUE7b0NBQ1BBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBO2dDQUN2QkEsS0FBS0EsSUFBSUE7b0NBQ1BBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBO2dDQUN2QkEsS0FBS0EsSUFBSUE7b0NBQ1BBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBO2dDQUN2QkEsS0FBS0EsSUFBSUE7b0NBQ1BBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLEtBQUtBLENBQUNBO2dDQUN2QkEsS0FBS0EsR0FBR0E7b0NBQ05BLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUN0QkEsS0FBS0EsR0FBR0E7b0NBQ05BLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUN0QkEsS0FBS0EsR0FBR0E7b0NBQ05BLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUN0QkEsS0FBS0EsR0FBR0E7b0NBQ05BLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO2dDQUN0QkEsS0FBS0EsR0FBR0E7b0NBQ05BLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBOzRCQUN4QkEsQ0FBQ0E7NEJBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO3dCQUNkQSxLQUFLQSxLQUFLQTs0QkFDUkEsSUFBSUEsT0FBT0EsR0FBR0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQzlDQSxNQUFNQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDL0JBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQTtnQ0FDakJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQTtnQ0FDbEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQTtnQ0FDbEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQTs0QkFDcEJBLENBQUNBOzRCQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTt3QkFDZEEsS0FBS0EsT0FBT0E7NEJBQ1ZBLElBQUlBLFdBQVdBLEdBQUdBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBOzRCQUNyREEsSUFBSUEsS0FBS0EsR0FBR0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQzFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsa0JBQVdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTs0QkFDNUVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO3dCQUNkQSxLQUFLQSxRQUFRQTs0QkFDWEEsSUFBSUEsWUFBWUEsR0FBR0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ3REQSxJQUFJQSxNQUFNQSxHQUFHQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFD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QU1BLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0FBQzFCQSxDQUFDQTtBQUVELGdCQUFnQixJQUFZLEVBQUUsRUFBVTtJQUN0Q0MsSUFBSUEsTUFBTUEsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDaEJBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3ZCQSxJQUFJQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNoQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsd0JBQXdCQTtRQUMxQ0EsSUFBSUEsT0FBT0EsR0FBR0EsU0FBU0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDNUJBLE1BQU1BLEdBQUdBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO0lBQ2xEQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtBQUNoQkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtpc0FycmF5LCBpc0JsYW5rLCBpc051bWJlciwgaXNQcmVzZW50LCBpc1ByaW1pdGl2ZSwgaXNTdHJpbmcsIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0F0dHJpYnV0ZU1ldGFkYXRhLCBEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcG9uZW50TWV0YWRhdGEsIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLCBDb250ZW50Q2hpbGRNZXRhZGF0YSwgSW5wdXRNZXRhZGF0YSwgSG9zdEJpbmRpbmdNZXRhZGF0YSwgSG9zdExpc3RlbmVyTWV0YWRhdGEsIE91dHB1dE1ldGFkYXRhLCBQaXBlTWV0YWRhdGEsIFZpZXdNZXRhZGF0YSwgVmlld0NoaWxkTWV0YWRhdGEsIFZpZXdDaGlsZHJlbk1ldGFkYXRhLCBWaWV3UXVlcnlNZXRhZGF0YSwgUXVlcnlNZXRhZGF0YSx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcblxuLyoqXG4gKiBUaGUgaG9zdCBvZiB0aGUgc3RhdGljIHJlc29sdmVyIGlzIGV4cGVjdGVkIHRvIGJlIGFibGUgdG8gcHJvdmlkZSBtb2R1bGUgbWV0YWRhdGEgaW4gdGhlIGZvcm0gb2ZcbiAqIE1vZHVsZU1ldGFkYXRhLiBBbmd1bGFyIDIgQ0xJIHdpbGwgcHJvZHVjZSB0aGlzIG1ldGFkYXRhIGZvciBhIG1vZHVsZSB3aGVuZXZlciBhIC5kLnRzIGZpbGVzIGlzXG4gKiBwcm9kdWNlZCBhbmQgdGhlIG1vZHVsZSBoYXMgZXhwb3J0ZWQgdmFyaWFibGVzIG9yIGNsYXNzZXMgd2l0aCBkZWNvcmF0b3JzLiBNb2R1bGUgbWV0YWRhdGEgY2FuXG4gKiBhbHNvIGJlIHByb2R1Y2VkIGRpcmVjdGx5IGZyb20gVHlwZVNjcmlwdCBzb3VyY2VzIGJ5IHVzaW5nIE1ldGFkYXRhQ29sbGVjdG9yIGluIHRvb2xzL21ldGFkYXRhLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRpY1JlZmxlY3Rvckhvc3Qge1xuICAvKipcbiAgICogIFJldHVybiBhIE1vZHVsZU1ldGFkYXRhIGZvciB0aGUgZ2l2ZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVJZCBpcyBhIHN0cmluZyBpZGVudGlmaWVyIGZvciBhIG1vZHVsZSBpbiB0aGUgZm9ybSB0aGF0IHdvdWxkIGV4cGVjdGVkIGluIGFcbiAgICogICAgICAgICAgICAgICAgIG1vZHVsZSBpbXBvcnQgb2YgYW4gaW1wb3J0IHN0YXRlbWVudC5cbiAgICogQHJldHVybnMgdGhlIG1ldGFkYXRhIGZvciB0aGUgZ2l2ZW4gbW9kdWxlLlxuICAgKi9cbiAgZ2V0TWV0YWRhdGFGb3IobW9kdWxlSWQ6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xufVxuXG4vKipcbiAqIEEgdG9rZW4gcmVwcmVzZW50aW5nIHRoZSBhIHJlZmVyZW5jZSB0byBhIHN0YXRpYyB0eXBlLlxuICpcbiAqIFRoaXMgdG9rZW4gaXMgdW5pcXVlIGZvciBhIG1vZHVsZUlkIGFuZCBuYW1lIGFuZCBjYW4gYmUgdXNlZCBhcyBhIGhhc2ggdGFibGUga2V5LlxuICovXG5leHBvcnQgY2xhc3MgU3RhdGljVHlwZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtb2R1bGVJZDogc3RyaW5nLCBwdWJsaWMgbmFtZTogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIEEgc3RhdGljIHJlZmxlY3RvciBpbXBsZW1lbnRzIGVub3VnaCBvZiB0aGUgUmVmbGVjdG9yIEFQSSB0aGF0IGlzIG5lY2Vzc2FyeSB0byBjb21waWxlXG4gKiB0ZW1wbGF0ZXMgc3RhdGljYWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0YXRpY1JlZmxlY3RvciB7XG4gIHByaXZhdGUgdHlwZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIFN0YXRpY1R5cGU+KCk7XG4gIHByaXZhdGUgYW5ub3RhdGlvbkNhY2hlID0gbmV3IE1hcDxTdGF0aWNUeXBlLCBhbnlbXT4oKTtcbiAgcHJpdmF0ZSBwcm9wZXJ0eUNhY2hlID0gbmV3IE1hcDxTdGF0aWNUeXBlLCB7W2tleTogc3RyaW5nXTogYW55fT4oKTtcbiAgcHJpdmF0ZSBwYXJhbWV0ZXJDYWNoZSA9IG5ldyBNYXA8U3RhdGljVHlwZSwgYW55W10+KCk7XG4gIHByaXZhdGUgbWV0YWRhdGFDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCB7W2tleTogc3RyaW5nXTogYW55fT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhvc3Q6IFN0YXRpY1JlZmxlY3Rvckhvc3QpIHsgdGhpcy5pbml0aWFsaXplQ29udmVyc2lvbk1hcCgpOyB9XG5cbiAgLyoqXG4gICAqIGdldFN0YXRpY3R5cGUgcHJvZHVjZXMgYSBUeXBlIHdob3NlIG1ldGFkYXRhIGlzIGtub3duIGJ1dCB3aG9zZSBpbXBsZW1lbnRhdGlvbiBpcyBub3QgbG9hZGVkLlxuICAgKiBBbGwgdHlwZXMgcGFzc2VkIHRvIHRoZSBTdGF0aWNSZXNvbHZlciBzaG91bGQgYmUgcHNldWRvLXR5cGVzIHJldHVybmVkIGJ5IHRoaXMgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0gbW9kdWxlSWQgdGhlIG1vZHVsZSBpZGVudGlmaWVyIGFzIHdvdWxkIGJlIHBhc3NlZCB0byBhbiBpbXBvcnQgc3RhdGVtZW50LlxuICAgKiBAcGFyYW0gbmFtZSB0aGUgbmFtZSBvZiB0aGUgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBnZXRTdGF0aWNUeXBlKG1vZHVsZUlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IFN0YXRpY1R5cGUge1xuICAgIGxldCBrZXkgPSBgXCIke21vZHVsZUlkfVwiLiR7bmFtZX1gO1xuICAgIGxldCByZXN1bHQgPSB0aGlzLnR5cGVDYWNoZS5nZXQoa2V5KTtcbiAgICBpZiAoIWlzUHJlc2VudChyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSBuZXcgU3RhdGljVHlwZShtb2R1bGVJZCwgbmFtZSk7XG4gICAgICB0aGlzLnR5cGVDYWNoZS5zZXQoa2V5LCByZXN1bHQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHVibGljIGFubm90YXRpb25zKHR5cGU6IFN0YXRpY1R5cGUpOiBhbnlbXSB7XG4gICAgbGV0IGFubm90YXRpb25zID0gdGhpcy5hbm5vdGF0aW9uQ2FjaGUuZ2V0KHR5cGUpO1xuICAgIGlmICghaXNQcmVzZW50KGFubm90YXRpb25zKSkge1xuICAgICAgbGV0IGNsYXNzTWV0YWRhdGEgPSB0aGlzLmdldFR5cGVNZXRhZGF0YSh0eXBlKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY2xhc3NNZXRhZGF0YVsnZGVjb3JhdG9ycyddKSkge1xuICAgICAgICBhbm5vdGF0aW9ucyA9ICg8YW55W10+Y2xhc3NNZXRhZGF0YVsnZGVjb3JhdG9ycyddKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGRlY29yYXRvciA9PiB0aGlzLmNvbnZlcnRLbm93bkRlY29yYXRvcih0eXBlLm1vZHVsZUlkLCBkZWNvcmF0b3IpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGRlY29yYXRvciA9PiBpc1ByZXNlbnQoZGVjb3JhdG9yKSk7XG4gICAgICB9XG4gICAgICB0aGlzLmFubm90YXRpb25DYWNoZS5zZXQodHlwZSwgYW5ub3RhdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gYW5ub3RhdGlvbnM7XG4gIH1cblxuICBwdWJsaWMgcHJvcE1ldGFkYXRhKHR5cGU6IFN0YXRpY1R5cGUpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgbGV0IHByb3BNZXRhZGF0YSA9IHRoaXMucHJvcGVydHlDYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQocHJvcE1ldGFkYXRhKSkge1xuICAgICAgbGV0IGNsYXNzTWV0YWRhdGEgPSB0aGlzLmdldFR5cGVNZXRhZGF0YSh0eXBlKTtcbiAgICAgIHByb3BNZXRhZGF0YSA9IHRoaXMuZ2V0UHJvcGVydHlNZXRhZGF0YSh0eXBlLm1vZHVsZUlkLCBjbGFzc01ldGFkYXRhWydtZW1iZXJzJ10pO1xuICAgICAgdGhpcy5wcm9wZXJ0eUNhY2hlLnNldCh0eXBlLCBwcm9wTWV0YWRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcE1ldGFkYXRhO1xuICB9XG5cbiAgcHVibGljIHBhcmFtZXRlcnModHlwZTogU3RhdGljVHlwZSk6IGFueVtdIHtcbiAgICBsZXQgcGFyYW1ldGVycyA9IHRoaXMucGFyYW1ldGVyQ2FjaGUuZ2V0KHR5cGUpO1xuICAgIGlmICghaXNQcmVzZW50KHBhcmFtZXRlcnMpKSB7XG4gICAgICBsZXQgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgbGV0IGN0b3JEYXRhID0gY2xhc3NNZXRhZGF0YVsnbWVtYmVycyddWydfX2N0b3JfXyddO1xuICAgICAgaWYgKGlzUHJlc2VudChjdG9yRGF0YSkpIHtcbiAgICAgICAgbGV0IGN0b3IgPSAoPGFueVtdPmN0b3JEYXRhKS5maW5kKGEgPT4gYVsnX19zeW1ib2xpYyddID09PSAnY29uc3RydWN0b3InKTtcbiAgICAgICAgcGFyYW1ldGVycyA9IHRoaXMuc2ltcGxpZnkodHlwZS5tb2R1bGVJZCwgY3RvclsncGFyYW1ldGVycyddKTtcbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJDYWNoZS5zZXQodHlwZSwgcGFyYW1ldGVycyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJzaW9uTWFwID0gbmV3IE1hcDxTdGF0aWNUeXBlLCAobW9kdWxlQ29udGV4dDogc3RyaW5nLCBleHByZXNzaW9uOiBhbnkpID0+IGFueT4oKTtcbiAgcHJpdmF0ZSBpbml0aWFsaXplQ29udmVyc2lvbk1hcCgpOiBhbnkge1xuICAgIGxldCBjb3JlX21ldGFkYXRhID0gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcbiAgICBsZXQgY29udmVyc2lvbk1hcCA9IHRoaXMuY29udmVyc2lvbk1hcDtcbiAgICBjb252ZXJzaW9uTWFwLnNldChcbiAgICAgICAgdGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdEaXJlY3RpdmUnKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgICAgICBpZiAoIWlzUHJlc2VudChwMCkpIHtcbiAgICAgICAgICAgIHAwID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgICAgICAgc2VsZWN0b3I6IHAwWydzZWxlY3RvciddLFxuICAgICAgICAgICAgaW5wdXRzOiBwMFsnaW5wdXRzJ10sXG4gICAgICAgICAgICBvdXRwdXRzOiBwMFsnb3V0cHV0cyddLFxuICAgICAgICAgICAgZXZlbnRzOiBwMFsnZXZlbnRzJ10sXG4gICAgICAgICAgICBob3N0OiBwMFsnaG9zdCddLFxuICAgICAgICAgICAgYmluZGluZ3M6IHAwWydiaW5kaW5ncyddLFxuICAgICAgICAgICAgcHJvdmlkZXJzOiBwMFsncHJvdmlkZXJzJ10sXG4gICAgICAgICAgICBleHBvcnRBczogcDBbJ2V4cG9ydEFzJ10sXG4gICAgICAgICAgICBxdWVyaWVzOiBwMFsncXVlcmllcyddLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldChcbiAgICAgICAgdGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdDb21wb25lbnQnKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgICAgICBpZiAoIWlzUHJlc2VudChwMCkpIHtcbiAgICAgICAgICAgIHAwID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50TWV0YWRhdGEoe1xuICAgICAgICAgICAgc2VsZWN0b3I6IHAwWydzZWxlY3RvciddLFxuICAgICAgICAgICAgaW5wdXRzOiBwMFsnaW5wdXRzJ10sXG4gICAgICAgICAgICBvdXRwdXRzOiBwMFsnb3V0cHV0cyddLFxuICAgICAgICAgICAgcHJvcGVydGllczogcDBbJ3Byb3BlcnRpZXMnXSxcbiAgICAgICAgICAgIGV2ZW50czogcDBbJ2V2ZW50cyddLFxuICAgICAgICAgICAgaG9zdDogcDBbJ2hvc3QnXSxcbiAgICAgICAgICAgIGV4cG9ydEFzOiBwMFsnZXhwb3J0QXMnXSxcbiAgICAgICAgICAgIG1vZHVsZUlkOiBwMFsnbW9kdWxlSWQnXSxcbiAgICAgICAgICAgIGJpbmRpbmdzOiBwMFsnYmluZGluZ3MnXSxcbiAgICAgICAgICAgIHByb3ZpZGVyczogcDBbJ3Byb3ZpZGVycyddLFxuICAgICAgICAgICAgdmlld0JpbmRpbmdzOiBwMFsndmlld0JpbmRpbmdzJ10sXG4gICAgICAgICAgICB2aWV3UHJvdmlkZXJzOiBwMFsndmlld1Byb3ZpZGVycyddLFxuICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBwMFsnY2hhbmdlRGV0ZWN0aW9uJ10sXG4gICAgICAgICAgICBxdWVyaWVzOiBwMFsncXVlcmllcyddLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHAwWyd0ZW1wbGF0ZVVybCddLFxuICAgICAgICAgICAgdGVtcGxhdGU6IHAwWyd0ZW1wbGF0ZSddLFxuICAgICAgICAgICAgc3R5bGVVcmxzOiBwMFsnc3R5bGVVcmxzJ10sXG4gICAgICAgICAgICBzdHlsZXM6IHAwWydzdHlsZXMnXSxcbiAgICAgICAgICAgIGRpcmVjdGl2ZXM6IHAwWydkaXJlY3RpdmVzJ10sXG4gICAgICAgICAgICBwaXBlczogcDBbJ3BpcGVzJ10sXG4gICAgICAgICAgICBlbmNhcHN1bGF0aW9uOiBwMFsnZW5jYXBzdWxhdGlvbiddXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KFxuICAgICAgICB0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0lucHV0JyksXG4gICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PlxuICAgICAgICAgICAgbmV3IElucHV0TWV0YWRhdGEodGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldChcbiAgICAgICAgdGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdPdXRwdXQnKSxcbiAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+XG4gICAgICAgICAgICBuZXcgT3V0cHV0TWV0YWRhdGEodGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1ZpZXcnKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgaWYgKCFpc1ByZXNlbnQocDApKSB7XG4gICAgICAgIHAwID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFZpZXdNZXRhZGF0YSh7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBwMFsndGVtcGxhdGVVcmwnXSxcbiAgICAgICAgdGVtcGxhdGU6IHAwWyd0ZW1wbGF0ZSddLFxuICAgICAgICBkaXJlY3RpdmVzOiBwMFsnZGlyZWN0aXZlcyddLFxuICAgICAgICBwaXBlczogcDBbJ3BpcGVzJ10sXG4gICAgICAgIGVuY2Fwc3VsYXRpb246IHAwWydlbmNhcHN1bGF0aW9uJ10sXG4gICAgICAgIHN0eWxlczogcDBbJ3N0eWxlcyddLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQoXG4gICAgICAgIHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnQXR0cmlidXRlJyksXG4gICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PlxuICAgICAgICAgICAgbmV3IEF0dHJpYnV0ZU1ldGFkYXRhKHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApKSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdRdWVyeScpLCAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4ge1xuICAgICAgbGV0IHAwID0gdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCk7XG4gICAgICBsZXQgcDEgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAxKTtcbiAgICAgIGlmICghaXNQcmVzZW50KHAxKSkge1xuICAgICAgICBwMSA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1ldGFkYXRhKHAwLCB7ZGVzY2VuZGFudHM6IHAxLmRlc2NlbmRhbnRzLCBmaXJzdDogcDEuZmlyc3R9KTtcbiAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldChcbiAgICAgICAgdGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdDb250ZW50Q2hpbGRyZW4nKSxcbiAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+XG4gICAgICAgICAgICBuZXcgQ29udGVudENoaWxkcmVuTWV0YWRhdGEodGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldChcbiAgICAgICAgdGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdDb250ZW50Q2hpbGQnKSxcbiAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+XG4gICAgICAgICAgICBuZXcgQ29udGVudENoaWxkTWV0YWRhdGEodGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldChcbiAgICAgICAgdGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdWaWV3Q2hpbGRyZW4nKSxcbiAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+XG4gICAgICAgICAgICBuZXcgVmlld0NoaWxkcmVuTWV0YWRhdGEodGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldChcbiAgICAgICAgdGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdWaWV3Q2hpbGQnKSxcbiAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+XG4gICAgICAgICAgICBuZXcgVmlld0NoaWxkTWV0YWRhdGEodGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldChcbiAgICAgICAgdGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdWaWV3UXVlcnknKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgICAgICBsZXQgcDEgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAxKTtcbiAgICAgICAgICBpZiAoIWlzUHJlc2VudChwMSkpIHtcbiAgICAgICAgICAgIHAxID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgVmlld1F1ZXJ5TWV0YWRhdGEocDAsIHtcbiAgICAgICAgICAgIGRlc2NlbmRhbnRzOiBwMVsnZGVzY2VuZGFudHMnXSxcbiAgICAgICAgICAgIGZpcnN0OiBwMVsnZmlyc3QnXSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdQaXBlJyksIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgIGlmICghaXNQcmVzZW50KHAwKSkge1xuICAgICAgICBwMCA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBQaXBlTWV0YWRhdGEoe1xuICAgICAgICBuYW1lOiBwMFsnbmFtZSddLFxuICAgICAgICBwdXJlOiBwMFsncHVyZSddLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQoXG4gICAgICAgIHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnSG9zdEJpbmRpbmcnKSxcbiAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+XG4gICAgICAgICAgICBuZXcgSG9zdEJpbmRpbmdNZXRhZGF0YSh0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KFxuICAgICAgICB0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0hvc3RMaXN0ZW5lcicpLFxuICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4gbmV3IEhvc3RMaXN0ZW5lck1ldGFkYXRhKFxuICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCksXG4gICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAxKSkpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0S25vd25EZWNvcmF0b3IobW9kdWxlQ29udGV4dDogc3RyaW5nLCBleHByZXNzaW9uOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGFueSB7XG4gICAgbGV0IGNvbnZlcnRlciA9IHRoaXMuY29udmVyc2lvbk1hcC5nZXQodGhpcy5nZXREZWNvcmF0b3JUeXBlKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pKTtcbiAgICBpZiAoaXNQcmVzZW50KGNvbnZlcnRlcikpIHJldHVybiBjb252ZXJ0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldERlY29yYXRvclR5cGUobW9kdWxlQ29udGV4dDogc3RyaW5nLCBleHByZXNzaW9uOiB7W2tleTogc3RyaW5nXTogYW55fSk6IFN0YXRpY1R5cGUge1xuICAgIGlmIChpc01ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbihleHByZXNzaW9uKSkge1xuICAgICAgbGV0IHRhcmdldCA9IGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXTtcbiAgICAgIGlmIChpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKHRhcmdldCkpIHtcbiAgICAgICAgbGV0IG1vZHVsZUlkID0gdGhpcy5ub3JtYWxpemVNb2R1bGVOYW1lKG1vZHVsZUNvbnRleHQsIHRhcmdldFsnbW9kdWxlJ10pO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGF0aWNUeXBlKG1vZHVsZUlkLCB0YXJnZXRbJ25hbWUnXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREZWNvcmF0b3JQYXJhbWV0ZXIoXG4gICAgICBtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IHtba2V5OiBzdHJpbmddOiBhbnl9LCBpbmRleDogbnVtYmVyKTogYW55IHtcbiAgICBpZiAoaXNNZXRhZGF0YVN5bWJvbGljQ2FsbEV4cHJlc3Npb24oZXhwcmVzc2lvbikgJiYgaXNQcmVzZW50KGV4cHJlc3Npb25bJ2FyZ3VtZW50cyddKSAmJlxuICAgICAgICAoPGFueVtdPmV4cHJlc3Npb25bJ2FyZ3VtZW50cyddKS5sZW5ndGggPD0gaW5kZXggKyAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaW1wbGlmeShtb2R1bGVDb250ZXh0LCAoPGFueVtdPmV4cHJlc3Npb25bJ2FyZ3VtZW50cyddKVtpbmRleF0pO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UHJvcGVydHlNZXRhZGF0YShtb2R1bGVDb250ZXh0OiBzdHJpbmcsIHZhbHVlOiB7W2tleTogc3RyaW5nXTogYW55fSk6XG4gICAgICB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgIGxldCByZXN1bHQgPSB7fTtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh2YWx1ZSwgKHZhbHVlLCBuYW1lKSA9PiB7XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5nZXRNZW1iZXJEYXRhKG1vZHVsZUNvbnRleHQsIHZhbHVlKTtcbiAgICAgICAgaWYgKGlzUHJlc2VudChkYXRhKSkge1xuICAgICAgICAgIGxldCBwcm9wZXJ0eURhdGEgPSBkYXRhLmZpbHRlcihkID0+IGRbJ2tpbmQnXSA9PSAncHJvcGVydHknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChkID0+IGRbJ2RpcmVjdGl2ZXMnXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoKHAsIGMpID0+ICg8YW55W10+cCkuY29uY2F0KDxhbnlbXT5jKSwgW10pO1xuICAgICAgICAgIGlmIChwcm9wZXJ0eURhdGEubGVuZ3RoICE9IDApIHtcbiAgICAgICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJlc3VsdCwgbmFtZSwgcHJvcGVydHlEYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gIHByaXZhdGUgZ2V0TWVtYmVyRGF0YShtb2R1bGVDb250ZXh0OiBzdHJpbmcsIG1lbWJlcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfVtdKTogeyBba2V5OiBzdHJpbmddOiBhbnkgfVtdIHtcbiAgICAvLyBjbGFuZy1mb3JtYXQgb25cbiAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgaWYgKGlzUHJlc2VudChtZW1iZXIpKSB7XG4gICAgICBmb3IgKGxldCBpdGVtIG9mIG1lbWJlcikge1xuICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAga2luZDogaXRlbVsnX19zeW1ib2xpYyddLFxuICAgICAgICAgIGRpcmVjdGl2ZXM6IGlzUHJlc2VudChpdGVtWydkZWNvcmF0b3JzJ10pID9cbiAgICAgICAgICAgICAgKDxhbnlbXT5pdGVtWydkZWNvcmF0b3JzJ10pXG4gICAgICAgICAgICAgICAgICAubWFwKGRlY29yYXRvciA9PiB0aGlzLmNvbnZlcnRLbm93bkRlY29yYXRvcihtb2R1bGVDb250ZXh0LCBkZWNvcmF0b3IpKVxuICAgICAgICAgICAgICAgICAgLmZpbHRlcihkID0+IGlzUHJlc2VudChkKSkgOlxuICAgICAgICAgICAgICBudWxsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgc2ltcGxpZnkobW9kdWxlQ29udGV4dDogc3RyaW5nLCB2YWx1ZTogYW55KTogYW55IHtcbiAgICBsZXQgX3RoaXMgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gc2ltcGxpZnkoZXhwcmVzc2lvbjogYW55KTogYW55IHtcbiAgICAgIGlmIChpc1ByaW1pdGl2ZShleHByZXNzaW9uKSkge1xuICAgICAgICByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICAgIH1cbiAgICAgIGlmIChpc0FycmF5KGV4cHJlc3Npb24pKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaXRlbSBvZiAoPGFueT5leHByZXNzaW9uKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHNpbXBsaWZ5KGl0ZW0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChleHByZXNzaW9uKSkge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSkpIHtcbiAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSkge1xuICAgICAgICAgICAgY2FzZSAnYmlub3AnOlxuICAgICAgICAgICAgICBsZXQgbGVmdCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2xlZnQnXSk7XG4gICAgICAgICAgICAgIGxldCByaWdodCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ3JpZ2h0J10pO1xuICAgICAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ29wZXJhdG9yJ10pIHtcbiAgICAgICAgICAgICAgICBjYXNlICcmJic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAmJiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICd8fCc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCB8fCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IHwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnXic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCBeIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgJiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc9PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA9PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICchPSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAhPSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc9PT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyE9PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAhPT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc8PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA8PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA+PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc8PCc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA8PCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc+Pic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA+PiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICsgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAtIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgKiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICcvJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IC8gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAlIHJpZ2h0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSAncHJlJzpcbiAgICAgICAgICAgICAgbGV0IG9wZXJhbmQgPSBzaW1wbGlmeShleHByZXNzaW9uWydvcGVyYW5kJ10pO1xuICAgICAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ29wZXJhdG9yJ10pIHtcbiAgICAgICAgICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIC1vcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuICFvcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJ34nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIH5vcGVyYW5kO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSAnaW5kZXgnOlxuICAgICAgICAgICAgICBsZXQgaW5kZXhUYXJnZXQgPSBzaW1wbGlmeShleHByZXNzaW9uWydleHByZXNzaW9uJ10pO1xuICAgICAgICAgICAgICBsZXQgaW5kZXggPSBzaW1wbGlmeShleHByZXNzaW9uWydpbmRleCddKTtcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChpbmRleFRhcmdldCkgJiYgaXNQcmltaXRpdmUoaW5kZXgpKSByZXR1cm4gaW5kZXhUYXJnZXRbaW5kZXhdO1xuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgICAgICAgIGxldCBzZWxlY3RUYXJnZXQgPSBzaW1wbGlmeShleHByZXNzaW9uWydleHByZXNzaW9uJ10pO1xuICAgICAgICAgICAgICBsZXQgbWVtYmVyID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnbWVtYmVyJ10pO1xuICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KHNlbGVjdFRhcmdldCkgJiYgaXNQcmltaXRpdmUobWVtYmVyKSkgcmV0dXJuIHNlbGVjdFRhcmdldFttZW1iZXJdO1xuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgJ3JlZmVyZW5jZSc6XG4gICAgICAgICAgICAgIGxldCByZWZlcmVuY2VNb2R1bGVOYW1lID1cbiAgICAgICAgICAgICAgICAgIF90aGlzLm5vcm1hbGl6ZU1vZHVsZU5hbWUobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvblsnbW9kdWxlJ10pO1xuICAgICAgICAgICAgICBsZXQgcmVmZXJlbmNlTW9kdWxlID0gX3RoaXMuZ2V0TW9kdWxlTWV0YWRhdGEocmVmZXJlbmNlTW9kdWxlTmFtZSk7XG4gICAgICAgICAgICAgIGxldCByZWZlcmVuY2VWYWx1ZSA9IHJlZmVyZW5jZU1vZHVsZVsnbWV0YWRhdGEnXVtleHByZXNzaW9uWyduYW1lJ11dO1xuICAgICAgICAgICAgICBpZiAoaXNDbGFzc01ldGFkYXRhKHJlZmVyZW5jZVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gYSBwc2V1ZG8gdHlwZVxuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5nZXRTdGF0aWNUeXBlKHJlZmVyZW5jZU1vZHVsZU5hbWUsIGV4cHJlc3Npb25bJ25hbWUnXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnNpbXBsaWZ5KHJlZmVyZW5jZU1vZHVsZU5hbWUsIHJlZmVyZW5jZVZhbHVlKTtcbiAgICAgICAgICAgIGNhc2UgJ2NhbGwnOlxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlc3VsdCA9IHt9O1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZXhwcmVzc2lvbiwgKHZhbHVlLCBuYW1lKSA9PiB7IHJlc3VsdFtuYW1lXSA9IHNpbXBsaWZ5KHZhbHVlKTsgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2ltcGxpZnkodmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRNb2R1bGVNZXRhZGF0YShtb2R1bGU6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLm1ldGFkYXRhQ2FjaGUuZ2V0KG1vZHVsZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICBtb2R1bGVNZXRhZGF0YSA9IHRoaXMuaG9zdC5nZXRNZXRhZGF0YUZvcihtb2R1bGUpO1xuICAgICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICAgIG1vZHVsZU1ldGFkYXRhID0ge19fc3ltYm9saWM6ICdtb2R1bGUnLCBtb2R1bGU6IG1vZHVsZSwgbWV0YWRhdGE6IHt9fTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0YWRhdGFDYWNoZS5zZXQobW9kdWxlLCBtb2R1bGVNZXRhZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBtb2R1bGVNZXRhZGF0YTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VHlwZU1ldGFkYXRhKHR5cGU6IFN0YXRpY1R5cGUpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgbGV0IG1vZHVsZU1ldGFkYXRhID0gdGhpcy5nZXRNb2R1bGVNZXRhZGF0YSh0eXBlLm1vZHVsZUlkKTtcbiAgICBsZXQgcmVzdWx0ID0gbW9kdWxlTWV0YWRhdGFbJ21ldGFkYXRhJ11bdHlwZS5uYW1lXTtcbiAgICBpZiAoIWlzUHJlc2VudChyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSB7X19zeW1ib2xpYzogJ2NsYXNzJ307XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIG5vcm1hbGl6ZU1vZHVsZU5hbWUoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodG8uc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgICByZXR1cm4gcGF0aFRvKGZyb20sIHRvKTtcbiAgICB9XG4gICAgcmV0dXJuIHRvO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uKGV4cHJlc3Npb246IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzUHJpbWl0aXZlKGV4cHJlc3Npb24pICYmICFpc0FycmF5KGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSA9PSAnY2FsbCc7XG59XG5cbmZ1bmN0aW9uIGlzTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24oZXhwcmVzc2lvbjogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAhaXNQcmltaXRpdmUoZXhwcmVzc2lvbikgJiYgIWlzQXJyYXkoZXhwcmVzc2lvbikgJiZcbiAgICAgIGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSA9PSAncmVmZXJlbmNlJztcbn1cblxuZnVuY3Rpb24gaXNDbGFzc01ldGFkYXRhKGV4cHJlc3Npb246IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzUHJpbWl0aXZlKGV4cHJlc3Npb24pICYmICFpc0FycmF5KGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSA9PSAnY2xhc3MnO1xufVxuXG5mdW5jdGlvbiBzcGxpdFBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nW10ge1xuICByZXR1cm4gcGF0aC5zcGxpdCgvXFwvfFxcXFwvZyk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVQYXRoKHBhdGhQYXJ0czogc3RyaW5nW10pOiBzdHJpbmcge1xuICBsZXQgcmVzdWx0ID0gW107XG4gIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgocGF0aFBhcnRzLCAocGFydCwgaW5kZXgpID0+IHtcbiAgICBzd2l0Y2ggKHBhcnQpIHtcbiAgICAgIGNhc2UgJyc6XG4gICAgICBjYXNlICcuJzpcbiAgICAgICAgaWYgKGluZGV4ID4gMCkgcmV0dXJuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJy4uJzpcbiAgICAgICAgaWYgKGluZGV4ID4gMCAmJiByZXN1bHQubGVuZ3RoICE9IDApIHJlc3VsdC5wb3AoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXN1bHQucHVzaChwYXJ0KTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQuam9pbignLycpO1xufVxuXG5mdW5jdGlvbiBwYXRoVG8oZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdCA9IHRvO1xuICBpZiAodG8uc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgbGV0IGZyb21QYXJ0cyA9IHNwbGl0UGF0aChmcm9tKTtcbiAgICBmcm9tUGFydHMucG9wKCk7ICAvLyByZW1vdmUgdGhlIGZpbGUgbmFtZS5cbiAgICBsZXQgdG9QYXJ0cyA9IHNwbGl0UGF0aCh0byk7XG4gICAgcmVzdWx0ID0gcmVzb2x2ZVBhdGgoZnJvbVBhcnRzLmNvbmNhdCh0b1BhcnRzKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==