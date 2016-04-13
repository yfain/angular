'use strict';"use strict";
var html_parser_1 = require('angular2/src/compiler/html_parser');
var html_ast_1 = require('angular2/src/compiler/html_ast');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var message_1 = require('./message');
var shared_1 = require('./shared');
var _I18N_ATTR = "i18n";
var _PLACEHOLDER_ELEMENT = "ph";
var _NAME_ATTR = "name";
var _I18N_ATTR_PREFIX = "i18n-";
var _PLACEHOLDER_EXPANDED_REGEXP = lang_1.RegExpWrapper.create("\\<ph(\\s)+name=(\"(\\w)+\")\\>\\<\\/ph\\>");
/**
 * Creates an i18n-ed version of the parsed template.
 *
 * Algorithm:
 *
 * To understand the algorithm, you need to know how partitioning works.
 * Partitioning is required as we can use two i18n comments to group node siblings together.
 * That is why we cannot just use nodes.
 *
 * Partitioning transforms an array of HtmlAst into an array of Part.
 * A part can optionally contain a root element or a root text node. And it can also contain
 * children.
 * A part can contain i18n property, in which case it needs to be transalted.
 *
 * Example:
 *
 * The following array of nodes will be split into four parts:
 *
 * ```
 * <a>A</a>
 * <b i18n>B</b>
 * <!-- i18n -->
 * <c>C</c>
 * D
 * <!-- /i18n -->
 * E
 * ```
 *
 * Part 1 containing the a tag. It should not be translated.
 * Part 2 containing the b tag. It should be translated.
 * Part 3 containing the c tag and the D text node. It should be translated.
 * Part 4 containing the E text node. It should not be translated.
 *
 *
 * It is also important to understand how we stringify nodes to create a message.
 *
 * We walk the tree and replace every element node with a placeholder. We also replace
 * all expressions in interpolation with placeholders. We also insert a placeholder element
 * to wrap a text node containing interpolation.
 *
 * Example:
 *
 * The following tree:
 *
 * ```
 * <a>A{{I}}</a><b>B</b>
 * ```
 *
 * will be stringified into:
 * ```
 * <ph name="e0"><ph name="t1">A<ph name="0"/></ph></ph><ph name="e2">B</ph>
 * ```
 *
 * This is what the algorithm does:
 *
 * 1. Use the provided html parser to get the html AST of the template.
 * 2. Partition the root nodes, and process each part separately.
 * 3. If a part does not have the i18n attribute, recurse to process children and attributes.
 * 4. If a part has the i18n attribute, merge the translated i18n part with the original tree.
 *
 * This is how the merging works:
 *
 * 1. Use the stringify function to get the message id. Look up the message in the map.
 * 2. Get the translated message. At this point we have two trees: the original tree
 * and the translated tree, where all the elements are replaced with placeholders.
 * 3. Use the original tree to create a mapping Index:number -> HtmlAst.
 * 4. Walk the translated tree.
 * 5. If we encounter a placeholder element, get is name property.
 * 6. Get the type and the index of the node using the name property.
 * 7. If the type is 'e', which means element, then:
 *     - translate the attributes of the original element
 *     - recurse to merge the children
 *     - create a new element using the original element name, original position,
 *     and translated children and attributes
 * 8. If the type if 't', which means text, then:
 *     - get the list of expressions from the original node.
 *     - get the string version of the interpolation subtree
 *     - find all the placeholders in the translated message, and replace them with the
 *     corresponding original expressions
 */
var I18nHtmlParser = (function () {
    function I18nHtmlParser(_htmlParser, _parser, _messagesContent, _messages) {
        this._htmlParser = _htmlParser;
        this._parser = _parser;
        this._messagesContent = _messagesContent;
        this._messages = _messages;
    }
    I18nHtmlParser.prototype.parse = function (sourceContent, sourceUrl) {
        this.errors = [];
        var res = this._htmlParser.parse(sourceContent, sourceUrl);
        if (res.errors.length > 0) {
            return res;
        }
        else {
            var nodes = this._recurse(res.rootNodes);
            return this.errors.length > 0 ? new html_parser_1.HtmlParseTreeResult([], this.errors) :
                new html_parser_1.HtmlParseTreeResult(nodes, []);
        }
    };
    I18nHtmlParser.prototype._processI18nPart = function (p) {
        try {
            return p.hasI18n ? this._mergeI18Part(p) : this._recurseIntoI18nPart(p);
        }
        catch (e) {
            if (e instanceof shared_1.I18nError) {
                this.errors.push(e);
                return [];
            }
            else {
                throw e;
            }
        }
    };
    I18nHtmlParser.prototype._mergeI18Part = function (p) {
        var messageId = message_1.id(p.createMessage(this._parser));
        if (!collection_1.StringMapWrapper.contains(this._messages, messageId)) {
            throw new shared_1.I18nError(p.sourceSpan, "Cannot find message for id '" + messageId + "'");
        }
        var parsedMessage = this._messages[messageId];
        return this._mergeTrees(p, parsedMessage, p.children);
    };
    I18nHtmlParser.prototype._recurseIntoI18nPart = function (p) {
        // we found an element without an i18n attribute
        // we need to recurse in cause its children may have i18n set
        // we also need to translate its attributes
        if (lang_1.isPresent(p.rootElement)) {
            var root = p.rootElement;
            var children = this._recurse(p.children);
            var attrs = this._i18nAttributes(root);
            return [
                new html_ast_1.HtmlElementAst(root.name, attrs, children, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)
            ];
        }
        else if (lang_1.isPresent(p.rootTextNode)) {
            return [p.rootTextNode];
        }
        else {
            return this._recurse(p.children);
        }
    };
    I18nHtmlParser.prototype._recurse = function (nodes) {
        var _this = this;
        var ps = shared_1.partition(nodes, this.errors);
        return collection_1.ListWrapper.flatten(ps.map(function (p) { return _this._processI18nPart(p); }));
    };
    I18nHtmlParser.prototype._mergeTrees = function (p, translated, original) {
        var l = new _CreateNodeMapping();
        html_ast_1.htmlVisitAll(l, original);
        // merge the translated tree with the original tree.
        // we do it by preserving the source code position of the original tree
        var merged = this._mergeTreesHelper(translated, l.mapping);
        // if the root element is present, we need to create a new root element with its attributes
        // translated
        if (lang_1.isPresent(p.rootElement)) {
            var root = p.rootElement;
            var attrs = this._i18nAttributes(root);
            return [
                new html_ast_1.HtmlElementAst(root.name, attrs, merged, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)
            ];
        }
        else if (lang_1.isPresent(p.rootTextNode)) {
            throw new exceptions_1.BaseException("should not be reached");
        }
        else {
            return merged;
        }
    };
    I18nHtmlParser.prototype._mergeTreesHelper = function (translated, mapping) {
        var _this = this;
        return translated.map(function (t) {
            if (t instanceof html_ast_1.HtmlElementAst) {
                return _this._mergeElementOrInterpolation(t, translated, mapping);
            }
            else if (t instanceof html_ast_1.HtmlTextAst) {
                return t;
            }
            else {
                throw new exceptions_1.BaseException("should not be reached");
            }
        });
    };
    I18nHtmlParser.prototype._mergeElementOrInterpolation = function (t, translated, mapping) {
        var name = this._getName(t);
        var type = name[0];
        var index = lang_1.NumberWrapper.parseInt(name.substring(1), 10);
        var originalNode = mapping[index];
        if (type == "t") {
            return this._mergeTextInterpolation(t, originalNode);
        }
        else if (type == "e") {
            return this._mergeElement(t, originalNode, mapping);
        }
        else {
            throw new exceptions_1.BaseException("should not be reached");
        }
    };
    I18nHtmlParser.prototype._getName = function (t) {
        if (t.name != _PLACEHOLDER_ELEMENT) {
            throw new shared_1.I18nError(t.sourceSpan, "Unexpected tag \"" + t.name + "\". Only \"" + _PLACEHOLDER_ELEMENT + "\" tags are allowed.");
        }
        var names = t.attrs.filter(function (a) { return a.name == _NAME_ATTR; });
        if (names.length == 0) {
            throw new shared_1.I18nError(t.sourceSpan, "Missing \"" + _NAME_ATTR + "\" attribute.");
        }
        return names[0].value;
    };
    I18nHtmlParser.prototype._mergeTextInterpolation = function (t, originalNode) {
        var split = this._parser.splitInterpolation(originalNode.value, originalNode.sourceSpan.toString());
        var exps = lang_1.isPresent(split) ? split.expressions : [];
        var messageSubstring = this._messagesContent.substring(t.startSourceSpan.end.offset, t.endSourceSpan.start.offset);
        var translated = this._replacePlaceholdersWithExpressions(messageSubstring, exps, originalNode.sourceSpan);
        return new html_ast_1.HtmlTextAst(translated, originalNode.sourceSpan);
    };
    I18nHtmlParser.prototype._mergeElement = function (t, originalNode, mapping) {
        var children = this._mergeTreesHelper(t.children, mapping);
        return new html_ast_1.HtmlElementAst(originalNode.name, this._i18nAttributes(originalNode), children, originalNode.sourceSpan, originalNode.startSourceSpan, originalNode.endSourceSpan);
    };
    I18nHtmlParser.prototype._i18nAttributes = function (el) {
        var _this = this;
        var res = [];
        el.attrs.forEach(function (attr) {
            if (attr.name.startsWith(shared_1.I18N_ATTR_PREFIX) || attr.name == shared_1.I18N_ATTR)
                return;
            var i18ns = el.attrs.filter(function (a) { return a.name == "i18n-" + attr.name; });
            if (i18ns.length == 0) {
                res.push(attr);
                return;
            }
            var i18n = i18ns[0];
            var messageId = message_1.id(shared_1.messageFromAttribute(_this._parser, el, i18n));
            if (collection_1.StringMapWrapper.contains(_this._messages, messageId)) {
                var updatedMessage = _this._replaceInterpolationInAttr(attr, _this._messages[messageId]);
                res.push(new html_ast_1.HtmlAttrAst(attr.name, updatedMessage, attr.sourceSpan));
            }
            else {
                throw new shared_1.I18nError(attr.sourceSpan, "Cannot find message for id '" + messageId + "'");
            }
        });
        return res;
    };
    I18nHtmlParser.prototype._replaceInterpolationInAttr = function (attr, msg) {
        var split = this._parser.splitInterpolation(attr.value, attr.sourceSpan.toString());
        var exps = lang_1.isPresent(split) ? split.expressions : [];
        var first = msg[0];
        var last = msg[msg.length - 1];
        var start = first.sourceSpan.start.offset;
        var end = last instanceof html_ast_1.HtmlElementAst ? last.endSourceSpan.end.offset : last.sourceSpan.end.offset;
        var messageSubstring = this._messagesContent.substring(start, end);
        return this._replacePlaceholdersWithExpressions(messageSubstring, exps, attr.sourceSpan);
    };
    ;
    I18nHtmlParser.prototype._replacePlaceholdersWithExpressions = function (message, exps, sourceSpan) {
        var _this = this;
        var expMap = this._buildExprMap(exps);
        return lang_1.RegExpWrapper.replaceAll(_PLACEHOLDER_EXPANDED_REGEXP, message, function (match) {
            var nameWithQuotes = match[2];
            var name = nameWithQuotes.substring(1, nameWithQuotes.length - 1);
            return _this._convertIntoExpression(name, expMap, sourceSpan);
        });
    };
    I18nHtmlParser.prototype._buildExprMap = function (exps) {
        var expMap = new Map();
        var usedNames = new Map();
        for (var i = 0; i < exps.length; i++) {
            var phName = shared_1.getPhNameFromBinding(exps[i], i);
            expMap.set(shared_1.dedupePhName(usedNames, phName), exps[i]);
        }
        return expMap;
    };
    I18nHtmlParser.prototype._convertIntoExpression = function (name, expMap, sourceSpan) {
        if (expMap.has(name)) {
            return "{{" + expMap.get(name) + "}}";
        }
        else {
            throw new shared_1.I18nError(sourceSpan, "Invalid interpolation name '" + name + "'");
        }
    };
    return I18nHtmlParser;
}());
exports.I18nHtmlParser = I18nHtmlParser;
var _CreateNodeMapping = (function () {
    function _CreateNodeMapping() {
        this.mapping = [];
    }
    _CreateNodeMapping.prototype.visitElement = function (ast, context) {
        this.mapping.push(ast);
        html_ast_1.htmlVisitAll(this, ast.children);
        return null;
    };
    _CreateNodeMapping.prototype.visitAttr = function (ast, context) { return null; };
    _CreateNodeMapping.prototype.visitText = function (ast, context) {
        this.mapping.push(ast);
        return null;
    };
    _CreateNodeMapping.prototype.visitComment = function (ast, context) { return ""; };
    return _CreateNodeMapping;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9odG1sX3BhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtRWhkdG5TVzcudG1wL2FuZ3VsYXIyL3NyYy9pMThuL2kxOG5faHRtbF9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDRCQUE4QyxtQ0FBbUMsQ0FBQyxDQUFBO0FBRWxGLHlCQVFPLGdDQUFnQyxDQUFDLENBQUE7QUFDeEMsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0UscUJBQXNELDBCQUEwQixDQUFDLENBQUE7QUFDakYsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFFN0Qsd0JBQTBCLFdBQVcsQ0FBQyxDQUFBO0FBQ3RDLHVCQVdPLFVBQVUsQ0FBQyxDQUFBO0FBRWxCLElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUMxQixJQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQztBQUNsQyxJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDMUIsSUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUM7QUFDbEMsSUFBSSw0QkFBNEIsR0FBRyxvQkFBYSxDQUFDLE1BQU0sQ0FBQyw0Q0FBMEMsQ0FBQyxDQUFDO0FBRXBHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBK0VHO0FBQ0g7SUFHRSx3QkFBb0IsV0FBdUIsRUFBVSxPQUFlLEVBQ2hELGdCQUF3QixFQUFVLFNBQXFDO1FBRHZFLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNoRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVE7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUE0QjtJQUFHLENBQUM7SUFFL0YsOEJBQUssR0FBTCxVQUFNLGFBQXFCLEVBQUUsU0FBaUI7UUFDNUMsSUFBSSxDQUFDLE1BQU0s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c291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtIdG1sUGFyc2VyLCBIdG1sUGFyc2VUcmVlUmVzdWx0fSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9wYXJzZXInO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW4sIFBhcnNlRXJyb3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9wYXJzZV91dGlsJztcbmltcG9ydCB7XG4gIEh0bWxBc3QsXG4gIEh0bWxBc3RWaXNpdG9yLFxuICBIdG1sRWxlbWVudEFzdCxcbiAgSHRtbEF0dHJBc3QsXG4gIEh0bWxUZXh0QXN0LFxuICBIdG1sQ29tbWVudEFzdCxcbiAgaHRtbFZpc2l0QWxsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX2FzdCc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtSZWdFeHBXcmFwcGVyLCBOdW1iZXJXcmFwcGVyLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1BhcnNlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvcGFyc2VyJztcbmltcG9ydCB7TWVzc2FnZSwgaWR9IGZyb20gJy4vbWVzc2FnZSc7XG5pbXBvcnQge1xuICBtZXNzYWdlRnJvbUF0dHJpYnV0ZSxcbiAgSTE4bkVycm9yLFxuICBJMThOX0FUVFJfUFJFRklYLFxuICBJMThOX0FUVFIsXG4gIHBhcnRpdGlvbixcbiAgUGFydCxcbiAgc3RyaW5naWZ5Tm9kZXMsXG4gIG1lYW5pbmcsXG4gIGdldFBoTmFtZUZyb21CaW5kaW5nLFxuICBkZWR1cGVQaE5hbWVcbn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBfSTE4Tl9BVFRSID0gXCJpMThuXCI7XG5jb25zdCBfUExBQ0VIT0xERVJfRUxFTUVOVCA9IFwicGhcIjtcbmNvbnN0IF9OQU1FX0FUVFIgPSBcIm5hbWVcIjtcbmNvbnN0IF9JMThOX0FUVFJfUFJFRklYID0gXCJpMThuLVwiO1xubGV0IF9QTEFDRUhPTERFUl9FWFBBTkRFRF9SRUdFWFAgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZShgXFxcXDxwaChcXFxccykrbmFtZT0oXCIoXFxcXHcpK1wiKVxcXFw+XFxcXDxcXFxcL3BoXFxcXD5gKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGkxOG4tZWQgdmVyc2lvbiBvZiB0aGUgcGFyc2VkIHRlbXBsYXRlLlxuICpcbiAqIEFsZ29yaXRobTpcbiAqXG4gKiBUbyB1bmRlcnN0YW5kIHRoZSBhbGdvcml0aG0sIHlvdSBuZWVkIHRvIGtub3cgaG93IHBhcnRpdGlvbmluZyB3b3Jrcy5cbiAqIFBhcnRpdGlvbmluZyBpcyByZXF1aXJlZCBhcyB3ZSBjYW4gdXNlIHR3byBpMThuIGNvbW1lbnRzIHRvIGdyb3VwIG5vZGUgc2libGluZ3MgdG9nZXRoZXIuXG4gKiBUaGF0IGlzIHdoeSB3ZSBjYW5ub3QganVzdCB1c2Ugbm9kZXMuXG4gKlxuICogUGFydGl0aW9uaW5nIHRyYW5zZm9ybXMgYW4gYXJyYXkgb2YgSHRtbEFzdCBpbnRvIGFuIGFycmF5IG9mIFBhcnQuXG4gKiBBIHBhcnQgY2FuIG9wdGlvbmFsbHkgY29udGFpbiBhIHJvb3QgZWxlbWVudCBvciBhIHJvb3QgdGV4dCBub2RlLiBBbmQgaXQgY2FuIGFsc28gY29udGFpblxuICogY2hpbGRyZW4uXG4gKiBBIHBhcnQgY2FuIGNvbnRhaW4gaTE4biBwcm9wZXJ0eSwgaW4gd2hpY2ggY2FzZSBpdCBuZWVkcyB0byBiZSB0cmFuc2FsdGVkLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogVGhlIGZvbGxvd2luZyBhcnJheSBvZiBub2RlcyB3aWxsIGJlIHNwbGl0IGludG8gZm91ciBwYXJ0czpcbiAqXG4gKiBgYGBcbiAqIDxhPkE8L2E+XG4gKiA8YiBpMThuPkI8L2I+XG4gKiA8IS0tIGkxOG4gLS0+XG4gKiA8Yz5DPC9jPlxuICogRFxuICogPCEtLSAvaTE4biAtLT5cbiAqIEVcbiAqIGBgYFxuICpcbiAqIFBhcnQgMSBjb250YWluaW5nIHRoZSBhIHRhZy4gSXQgc2hvdWxkIG5vdCBiZSB0cmFuc2xhdGVkLlxuICogUGFydCAyIGNvbnRhaW5pbmcgdGhlIGIgdGFnLiBJdCBzaG91bGQgYmUgdHJhbnNsYXRlZC5cbiAqIFBhcnQgMyBjb250YWluaW5nIHRoZSBjIHRhZyBhbmQgdGhlIEQgdGV4dCBub2RlLiBJdCBzaG91bGQgYmUgdHJhbnNsYXRlZC5cbiAqIFBhcnQgNCBjb250YWluaW5nIHRoZSBFIHRleHQgbm9kZS4gSXQgc2hvdWxkIG5vdCBiZSB0cmFuc2xhdGVkLlxuICpcbiAqXG4gKiBJdCBpcyBhbHNvIGltcG9ydGFudCB0byB1bmRlcnN0YW5kIGhvdyB3ZSBzdHJpbmdpZnkgbm9kZXMgdG8gY3JlYXRlIGEgbWVzc2FnZS5cbiAqXG4gKiBXZSB3YWxrIHRoZSB0cmVlIGFuZCByZXBsYWNlIGV2ZXJ5IGVsZW1lbnQgbm9kZSB3aXRoIGEgcGxhY2Vob2xkZXIuIFdlIGFsc28gcmVwbGFjZVxuICogYWxsIGV4cHJlc3Npb25zIGluIGludGVycG9sYXRpb24gd2l0aCBwbGFjZWhvbGRlcnMuIFdlIGFsc28gaW5zZXJ0IGEgcGxhY2Vob2xkZXIgZWxlbWVudFxuICogdG8gd3JhcCBhIHRleHQgbm9kZSBjb250YWluaW5nIGludGVycG9sYXRpb24uXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBUaGUgZm9sbG93aW5nIHRyZWU6XG4gKlxuICogYGBgXG4gKiA8YT5Be3tJfX08L2E+PGI+QjwvYj5cbiAqIGBgYFxuICpcbiAqIHdpbGwgYmUgc3RyaW5naWZpZWQgaW50bzpcbiAqIGBgYFxuICogPHBoIG5hbWU9XCJlMFwiPjxwaCBuYW1lPVwidDFcIj5BPHBoIG5hbWU9XCIwXCIvPjwvcGg+PC9waD48cGggbmFtZT1cImUyXCI+QjwvcGg+XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGlzIHdoYXQgdGhlIGFsZ29yaXRobSBkb2VzOlxuICpcbiAqIDEuIFVzZSB0aGUgcHJvdmlkZWQgaHRtbCBwYXJzZXIgdG8gZ2V0IHRoZSBodG1sIEFTVCBvZiB0aGUgdGVtcGxhdGUuXG4gKiAyLiBQYXJ0aXRpb24gdGhlIHJvb3Qgbm9kZXMsIGFuZCBwcm9jZXNzIGVhY2ggcGFydCBzZXBhcmF0ZWx5LlxuICogMy4gSWYgYSBwYXJ0IGRvZXMgbm90IGhhdmUgdGhlIGkxOG4gYXR0cmlidXRlLCByZWN1cnNlIHRvIHByb2Nlc3MgY2hpbGRyZW4gYW5kIGF0dHJpYnV0ZXMuXG4gKiA0LiBJZiBhIHBhcnQgaGFzIHRoZSBpMThuIGF0dHJpYnV0ZSwgbWVyZ2UgdGhlIHRyYW5zbGF0ZWQgaTE4biBwYXJ0IHdpdGggdGhlIG9yaWdpbmFsIHRyZWUuXG4gKlxuICogVGhpcyBpcyBob3cgdGhlIG1lcmdpbmcgd29ya3M6XG4gKlxuICogMS4gVXNlIHRoZSBzdHJpbmdpZnkgZnVuY3Rpb24gdG8gZ2V0IHRoZSBtZXNzYWdlIGlkLiBMb29rIHVwIHRoZSBtZXNzYWdlIGluIHRoZSBtYXAuXG4gKiAyLiBHZXQgdGhlIHRyYW5zbGF0ZWQgbWVzc2FnZS4gQXQgdGhpcyBwb2ludCB3ZSBoYXZlIHR3byB0cmVlczogdGhlIG9yaWdpbmFsIHRyZWVcbiAqIGFuZCB0aGUgdHJhbnNsYXRlZCB0cmVlLCB3aGVyZSBhbGwgdGhlIGVsZW1lbnRzIGFyZSByZXBsYWNlZCB3aXRoIHBsYWNlaG9sZGVycy5cbiAqIDMuIFVzZSB0aGUgb3JpZ2luYWwgdHJlZSB0byBjcmVhdGUgYSBtYXBwaW5nIEluZGV4Om51bWJlciAtPiBIdG1sQXN0LlxuICogNC4gV2FsayB0aGUgdHJhbnNsYXRlZCB0cmVlLlxuICogNS4gSWYgd2UgZW5jb3VudGVyIGEgcGxhY2Vob2xkZXIgZWxlbWVudCwgZ2V0IGlzIG5hbWUgcHJvcGVydHkuXG4gKiA2LiBHZXQgdGhlIHR5cGUgYW5kIHRoZSBpbmRleCBvZiB0aGUgbm9kZSB1c2luZyB0aGUgbmFtZSBwcm9wZXJ0eS5cbiAqIDcuIElmIHRoZSB0eXBlIGlzICdlJywgd2hpY2ggbWVhbnMgZWxlbWVudCwgdGhlbjpcbiAqICAgICAtIHRyYW5zbGF0ZSB0aGUgYXR0cmlidXRlcyBvZiB0aGUgb3JpZ2luYWwgZWxlbWVudFxuICogICAgIC0gcmVjdXJzZSB0byBtZXJnZSB0aGUgY2hpbGRyZW5cbiAqICAgICAtIGNyZWF0ZSBhIG5ldyBlbGVtZW50IHVzaW5nIHRoZSBvcmlnaW5hbCBlbGVtZW50IG5hbWUsIG9yaWdpbmFsIHBvc2l0aW9uLFxuICogICAgIGFuZCB0cmFuc2xhdGVkIGNoaWxkcmVuIGFuZCBhdHRyaWJ1dGVzXG4gKiA4LiBJZiB0aGUgdHlwZSBpZiAndCcsIHdoaWNoIG1lYW5zIHRleHQsIHRoZW46XG4gKiAgICAgLSBnZXQgdGhlIGxpc3Qgb2YgZXhwcmVzc2lvbnMgZnJvbSB0aGUgb3JpZ2luYWwgbm9kZS5cbiAqICAgICAtIGdldCB0aGUgc3RyaW5nIHZlcnNpb24gb2YgdGhlIGludGVycG9sYXRpb24gc3VidHJlZVxuICogICAgIC0gZmluZCBhbGwgdGhlIHBsYWNlaG9sZGVycyBpbiB0aGUgdHJhbnNsYXRlZCBtZXNzYWdlLCBhbmQgcmVwbGFjZSB0aGVtIHdpdGggdGhlXG4gKiAgICAgY29ycmVzcG9uZGluZyBvcmlnaW5hbCBleHByZXNzaW9uc1xuICovXG5leHBvcnQgY2xhc3MgSTE4bkh0bWxQYXJzZXIgaW1wbGVtZW50cyBIdG1sUGFyc2VyIHtcbiAgZXJyb3JzOiBQYXJzZUVycm9yW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaHRtbFBhcnNlcjogSHRtbFBhcnNlciwgcHJpdmF0ZSBfcGFyc2VyOiBQYXJzZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX21lc3NhZ2VzQ29udGVudDogc3RyaW5nLCBwcml2YXRlIF9tZXNzYWdlczoge1trZXk6IHN0cmluZ106IEh0bWxBc3RbXX0pIHt9XG5cbiAgcGFyc2Uoc291cmNlQ29udGVudDogc3RyaW5nLCBzb3VyY2VVcmw6IHN0cmluZyk6IEh0bWxQYXJzZVRyZWVSZXN1bHQge1xuICAgIHRoaXMuZXJyb3JzID0gW107XG5cbiAgICBsZXQgcmVzID0gdGhpcy5faHRtbFBhcnNlci5wYXJzZShzb3VyY2VDb250ZW50LCBzb3VyY2VVcmwpO1xuICAgIGlmIChyZXMuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBub2RlcyA9IHRoaXMuX3JlY3Vyc2UocmVzLnJvb3ROb2Rlcyk7XG4gICAgICByZXR1cm4gdGhpcy5lcnJvcnMubGVuZ3RoID4gMCA/IG5ldyBIdG1sUGFyc2VUcmVlUmVzdWx0KFtdLCB0aGlzLmVycm9ycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgSHRtbFBhcnNlVHJlZVJlc3VsdChub2RlcywgW10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Byb2Nlc3NJMThuUGFydChwOiBQYXJ0KTogSHRtbEFzdFtdIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHAuaGFzSTE4biA/IHRoaXMuX21lcmdlSTE4UGFydChwKSA6IHRoaXMuX3JlY3Vyc2VJbnRvSTE4blBhcnQocCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBJMThuRXJyb3IpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaChlKTtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZUkxOFBhcnQocDogUGFydCk6IEh0bWxBc3RbXSB7XG4gICAgbGV0IG1lc3NhZ2VJZCA9IGlkKHAuY3JlYXRlTWVzc2FnZSh0aGlzLl9wYXJzZXIpKTtcbiAgICBpZiAoIVN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModGhpcy5fbWVzc2FnZXMsIG1lc3NhZ2VJZCkpIHtcbiAgICAgIHRocm93IG5ldyBJMThuRXJyb3IocC5zb3VyY2VTcGFuLCBgQ2Fubm90IGZpbmQgbWVzc2FnZSBmb3IgaWQgJyR7bWVzc2FnZUlkfSdgKTtcbiAgICB9XG5cbiAgICBsZXQgcGFyc2VkTWVzc2FnZSA9IHRoaXMuX21lc3NhZ2VzW21lc3NhZ2VJZF07XG4gICAgcmV0dXJuIHRoaXMuX21lcmdlVHJlZXMocCwgcGFyc2VkTWVzc2FnZSwgcC5jaGlsZHJlbik7XG4gIH1cblxuICBwcml2YXRlIF9yZWN1cnNlSW50b0kxOG5QYXJ0KHA6IFBhcnQpOiBIdG1sQXN0W10ge1xuICAgIC8vIHdlIGZvdW5kIGFuIGVsZW1lbnQgd2l0aG91dCBhbiBpMThuIGF0dHJpYnV0ZVxuICAgIC8vIHdlIG5lZWQgdG8gcmVjdXJzZSBpbiBjYXVzZSBpdHMgY2hpbGRyZW4gbWF5IGhhdmUgaTE4biBzZXRcbiAgICAvLyB3ZSBhbHNvIG5lZWQgdG8gdHJhbnNsYXRlIGl0cyBhdHRyaWJ1dGVzXG4gICAgaWYgKGlzUHJlc2VudChwLnJvb3RFbGVtZW50KSkge1xuICAgICAgbGV0IHJvb3QgPSBwLnJvb3RFbGVtZW50O1xuICAgICAgbGV0IGNoaWxkcmVuID0gdGhpcy5fcmVjdXJzZShwLmNoaWxkcmVuKTtcbiAgICAgIGxldCBhdHRycyA9IHRoaXMuX2kxOG5BdHRyaWJ1dGVzKHJvb3QpO1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbmV3IEh0bWxFbGVtZW50QXN0KHJvb3QubmFtZSwgYXR0cnMsIGNoaWxkcmVuLCByb290LnNvdXJjZVNwYW4sIHJvb3Quc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdC5lbmRTb3VyY2VTcGFuKVxuICAgICAgXTtcblxuICAgICAgLy8gYSB0ZXh0IG5vZGUgd2l0aG91dCBpMThuIG9yIGludGVycG9sYXRpb24sIG5vdGhpbmcgdG8gZG9cbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwLnJvb3RUZXh0Tm9kZSkpIHtcbiAgICAgIHJldHVybiBbcC5yb290VGV4dE5vZGVdO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZWN1cnNlKHAuY2hpbGRyZW4pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlY3Vyc2Uobm9kZXM6IEh0bWxBc3RbXSk6IEh0bWxBc3RbXSB7XG4gICAgbGV0IHBzID0gcGFydGl0aW9uKG5vZGVzLCB0aGlzLmVycm9ycyk7XG4gICAgcmV0dXJuIExpc3RXcmFwcGVyLmZsYXR0ZW4ocHMubWFwKHAgPT4gdGhpcy5fcHJvY2Vzc0kxOG5QYXJ0KHApKSk7XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZVRyZWVzKHA6IFBhcnQsIHRyYW5zbGF0ZWQ6IEh0bWxBc3RbXSwgb3JpZ2luYWw6IEh0bWxBc3RbXSk6IEh0bWxBc3RbXSB7XG4gICAgbGV0IGwgPSBuZXcgX0NyZWF0ZU5vZGVNYXBwaW5nKCk7XG4gICAgaHRtbFZpc2l0QWxsKGwsIG9yaWdpbmFsKTtcblxuICAgIC8vIG1lcmdlIHRoZSB0cmFuc2xhdGVkIHRyZWUgd2l0aCB0aGUgb3JpZ2luYWwgdHJlZS5cbiAgICAvLyB3ZSBkbyBpdCBieSBwcmVzZXJ2aW5nIHRoZSBzb3VyY2UgY29kZSBwb3NpdGlvbiBvZiB0aGUgb3JpZ2luYWwgdHJlZVxuICAgIGxldCBtZXJnZWQgPSB0aGlzLl9tZXJnZVRyZWVzSGVscGVyKHRyYW5zbGF0ZWQsIGwubWFwcGluZyk7XG5cbiAgICAvLyBpZiB0aGUgcm9vdCBlbGVtZW50IGlzIHByZXNlbnQsIHdlIG5lZWQgdG8gY3JlYXRlIGEgbmV3IHJvb3QgZWxlbWVudCB3aXRoIGl0cyBhdHRyaWJ1dGVzXG4gICAgLy8gdHJhbnNsYXRlZFxuICAgIGlmIChpc1ByZXNlbnQocC5yb290RWxlbWVudCkpIHtcbiAgICAgIGxldCByb290ID0gcC5yb290RWxlbWVudDtcbiAgICAgIGxldCBhdHRycyA9IHRoaXMuX2kxOG5BdHRyaWJ1dGVzKHJvb3QpO1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbmV3IEh0bWxFbGVtZW50QXN0KHJvb3QubmFtZSwgYXR0cnMsIG1lcmdlZCwgcm9vdC5zb3VyY2VTcGFuLCByb290LnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3QuZW5kU291cmNlU3BhbilcbiAgICAgIF07XG5cbiAgICAgIC8vIHRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiB3aXRoIGEgcGFydC4gUGFydHMgdGhhdCBoYXZlIHJvb3QgdGV4dCBub2RlIHNob3VsZCBub3QgYmUgbWVyZ2VkLlxuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHAucm9vdFRleHROb2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJzaG91bGQgbm90IGJlIHJlYWNoZWRcIik7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1lcmdlZDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZVRyZWVzSGVscGVyKHRyYW5zbGF0ZWQ6IEh0bWxBc3RbXSwgbWFwcGluZzogSHRtbEFzdFtdKTogSHRtbEFzdFtdIHtcbiAgICByZXR1cm4gdHJhbnNsYXRlZC5tYXAodCA9PiB7XG4gICAgICBpZiAodCBpbnN0YW5jZW9mIEh0bWxFbGVtZW50QXN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tZXJnZUVsZW1lbnRPckludGVycG9sYXRpb24odCwgdHJhbnNsYXRlZCwgbWFwcGluZyk7XG5cbiAgICAgIH0gZWxzZSBpZiAodCBpbnN0YW5jZW9mIEh0bWxUZXh0QXN0KSB7XG4gICAgICAgIHJldHVybiB0O1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcInNob3VsZCBub3QgYmUgcmVhY2hlZFwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlRWxlbWVudE9ySW50ZXJwb2xhdGlvbih0OiBIdG1sRWxlbWVudEFzdCwgdHJhbnNsYXRlZDogSHRtbEFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwcGluZzogSHRtbEFzdFtdKTogSHRtbEFzdCB7XG4gICAgbGV0IG5hbWUgPSB0aGlzLl9nZXROYW1lKHQpO1xuICAgIGxldCB0eXBlID0gbmFtZVswXTtcbiAgICBsZXQgaW5kZXggPSBOdW1iZXJXcmFwcGVyLnBhcnNlSW50KG5hbWUuc3Vic3RyaW5nKDEpLCAxMCk7XG4gICAgbGV0IG9yaWdpbmFsTm9kZSA9IG1hcHBpbmdbaW5kZXhdO1xuXG4gICAgaWYgKHR5cGUgPT0gXCJ0XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tZXJnZVRleHRJbnRlcnBvbGF0aW9uKHQsIDxIdG1sVGV4dEFzdD5vcmlnaW5hbE5vZGUpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImVcIikge1xuICAgICAgcmV0dXJuIHRoaXMuX21lcmdlRWxlbWVudCh0LCA8SHRtbEVsZW1lbnRBc3Q+b3JpZ2luYWxOb2RlLCBtYXBwaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJzaG91bGQgbm90IGJlIHJlYWNoZWRcIik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TmFtZSh0OiBIdG1sRWxlbWVudEFzdCk6IHN0cmluZyB7XG4gICAgaWYgKHQubmFtZSAhPSBfUExBQ0VIT0xERVJfRUxFTUVOVCkge1xuICAgICAgdGhyb3cgbmV3IEkxOG5FcnJvcihcbiAgICAgICAgICB0LnNvdXJjZVNwYW4sXG4gICAgICAgICAgYFVuZXhwZWN0ZWQgdGFnIFwiJHt0Lm5hbWV9XCIuIE9ubHkgXCIke19QTEFDRUhPTERFUl9FTEVNRU5UfVwiIHRhZ3MgYXJlIGFsbG93ZWQuYCk7XG4gICAgfVxuICAgIGxldCBuYW1lcyA9IHQuYXR0cnMuZmlsdGVyKGEgPT4gYS5uYW1lID09IF9OQU1FX0FUVFIpO1xuICAgIGlmIChuYW1lcy5sZW5ndGggPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEkxOG5FcnJvcih0LnNvdXJjZVNwYW4sIGBNaXNzaW5nIFwiJHtfTkFNRV9BVFRSfVwiIGF0dHJpYnV0ZS5gKTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzWzBdLnZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWVyZ2VUZXh0SW50ZXJwb2xhdGlvbih0OiBIdG1sRWxlbWVudEFzdCwgb3JpZ2luYWxOb2RlOiBIdG1sVGV4dEFzdCk6IEh0bWxUZXh0QXN0IHtcbiAgICBsZXQgc3BsaXQgPVxuICAgICAgICB0aGlzLl9wYXJzZXIuc3BsaXRJbnRlcnBvbGF0aW9uKG9yaWdpbmFsTm9kZS52YWx1ZSwgb3JpZ2luYWxOb2RlLnNvdXJjZVNwYW4udG9TdHJpbmcoKSk7XG4gICAgbGV0IGV4cHMgPSBpc1ByZXNlbnQoc3BsaXQpID8gc3BsaXQuZXhwcmVzc2lvbnMgOiBbXTtcblxuICAgIGxldCBtZXNzYWdlU3Vic3RyaW5nID1cbiAgICAgICAgdGhpcy5fbWVzc2FnZXNDb250ZW50LnN1YnN0cmluZyh0LnN0YXJ0U291cmNlU3Bhbi5lbmQub2Zmc2V0LCB0LmVuZFNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0KTtcbiAgICBsZXQgdHJhbnNsYXRlZCA9XG4gICAgICAgIHRoaXMuX3JlcGxhY2VQbGFjZWhvbGRlcnNXaXRoRXhwcmVzc2lvbnMobWVzc2FnZVN1YnN0cmluZywgZXhwcywgb3JpZ2luYWxOb2RlLnNvdXJjZVNwYW4pO1xuXG4gICAgcmV0dXJuIG5ldyBIdG1sVGV4dEFzdCh0cmFuc2xhdGVkLCBvcmlnaW5hbE5vZGUuc291cmNlU3Bhbik7XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZUVsZW1lbnQodDogSHRtbEVsZW1lbnRBc3QsIG9yaWdpbmFsTm9kZTogSHRtbEVsZW1lbnRBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nOiBIdG1sQXN0W10pOiBIdG1sRWxlbWVudEFzdCB7XG4gICAgbGV0IGNoaWxkcmVuID0gdGhpcy5fbWVyZ2VUcmVlc0hlbHBlcih0LmNoaWxkcmVuLCBtYXBwaW5nKTtcbiAgICByZXR1cm4gbmV3IEh0bWxFbGVtZW50QXN0KG9yaWdpbmFsTm9kZS5uYW1lLCB0aGlzLl9pMThuQXR0cmlidXRlcyhvcmlnaW5hbE5vZGUpLCBjaGlsZHJlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsTm9kZS5zb3VyY2VTcGFuLCBvcmlnaW5hbE5vZGUuc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxOb2RlLmVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgcHJpdmF0ZSBfaTE4bkF0dHJpYnV0ZXMoZWw6IEh0bWxFbGVtZW50QXN0KTogSHRtbEF0dHJBc3RbXSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGVsLmF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoSTE4Tl9BVFRSX1BSRUZJWCkgfHwgYXR0ci5uYW1lID09IEkxOE5fQVRUUikgcmV0dXJuO1xuXG4gICAgICBsZXQgaTE4bnMgPSBlbC5hdHRycy5maWx0ZXIoYSA9PiBhLm5hbWUgPT0gYGkxOG4tJHthdHRyLm5hbWV9YCk7XG4gICAgICBpZiAoaTE4bnMubGVuZ3RoID09IDApIHtcbiAgICAgICAgcmVzLnB1c2goYXR0cik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IGkxOG4gPSBpMThuc1swXTtcbiAgICAgIGxldCBtZXNzYWdlSWQgPSBpZChtZXNzYWdlRnJvbUF0dHJpYnV0ZSh0aGlzLl9wYXJzZXIsIGVsLCBpMThuKSk7XG5cbiAgICAgIGlmIChTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKHRoaXMuX21lc3NhZ2VzLCBtZXNzYWdlSWQpKSB7XG4gICAgICAgIGxldCB1cGRhdGVkTWVzc2FnZSA9IHRoaXMuX3JlcGxhY2VJbnRlcnBvbGF0aW9uSW5BdHRyKGF0dHIsIHRoaXMuX21lc3NhZ2VzW21lc3NhZ2VJZF0pO1xuICAgICAgICByZXMucHVzaChuZXcgSHRtbEF0dHJBc3QoYXR0ci5uYW1lLCB1cGRhdGVkTWVzc2FnZSwgYXR0ci5zb3VyY2VTcGFuKSk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBJMThuRXJyb3IoYXR0ci5zb3VyY2VTcGFuLCBgQ2Fubm90IGZpbmQgbWVzc2FnZSBmb3IgaWQgJyR7bWVzc2FnZUlkfSdgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwbGFjZUludGVycG9sYXRpb25JbkF0dHIoYXR0cjogSHRtbEF0dHJBc3QsIG1zZzogSHRtbEFzdFtdKTogc3RyaW5nIHtcbiAgICBsZXQgc3BsaXQgPSB0aGlzLl9wYXJzZXIuc3BsaXRJbnRlcnBvbGF0aW9uKGF0dHIudmFsdWUsIGF0dHIuc291cmNlU3Bhbi50b1N0cmluZygpKTtcbiAgICBsZXQgZXhwcyA9IGlzUHJlc2VudChzcGxpdCkgPyBzcGxpdC5leHByZXNzaW9ucyA6IFtdO1xuXG4gICAgbGV0IGZpcnN0ID0gbXNnWzBdO1xuICAgIGxldCBsYXN0ID0gbXNnW21zZy5sZW5ndGggLSAxXTtcblxuICAgIGxldCBzdGFydCA9IGZpcnN0LnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0O1xuICAgIGxldCBlbmQgPVxuICAgICAgICBsYXN0IGluc3RhbmNlb2YgSHRtbEVsZW1lbnRBc3QgPyBsYXN0LmVuZFNvdXJjZVNwYW4uZW5kLm9mZnNldCA6IGxhc3Quc291cmNlU3Bhbi5lbmQub2Zmc2V0O1xuICAgIGxldCBtZXNzYWdlU3Vic3RyaW5nID0gdGhpcy5fbWVzc2FnZXNDb250ZW50LnN1YnN0cmluZyhzdGFydCwgZW5kKTtcblxuICAgIHJldHVybiB0aGlzLl9yZXBsYWNlUGxhY2Vob2xkZXJzV2l0aEV4cHJlc3Npb25zKG1lc3NhZ2VTdWJzdHJpbmcsIGV4cHMsIGF0dHIuc291cmNlU3Bhbik7XG4gIH07XG5cbiAgcHJpdmF0ZSBfcmVwbGFjZVBsYWNlaG9sZGVyc1dpdGhFeHByZXNzaW9ucyhtZXNzYWdlOiBzdHJpbmcsIGV4cHM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IHN0cmluZyB7XG4gICAgbGV0IGV4cE1hcCA9IHRoaXMuX2J1aWxkRXhwck1hcChleHBzKTtcbiAgICByZXR1cm4gUmVnRXhwV3JhcHBlci5yZXBsYWNlQWxsKF9QTEFDRUhPTERFUl9FWFBBTkRFRF9SRUdFWFAsIG1lc3NhZ2UsIChtYXRjaCkgPT4ge1xuICAgICAgbGV0IG5hbWVXaXRoUXVvdGVzID0gbWF0Y2hbMl07XG4gICAgICBsZXQgbmFtZSA9IG5hbWVXaXRoUXVvdGVzLnN1YnN0cmluZygxLCBuYW1lV2l0aFF1b3Rlcy5sZW5ndGggLSAxKTtcbiAgICAgIHJldHVybiB0aGlzLl9jb252ZXJ0SW50b0V4cHJlc3Npb24obmFtZSwgZXhwTWFwLCBzb3VyY2VTcGFuKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkRXhwck1hcChleHBzOiBzdHJpbmdbXSk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGxldCBleHBNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgIGxldCB1c2VkTmFtZXMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBleHBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgcGhOYW1lID0gZ2V0UGhOYW1lRnJvbUJpbmRpbmcoZXhwc1tpXSwgaSk7XG4gICAgICBleHBNYXAuc2V0KGRlZHVwZVBoTmFtZSh1c2VkTmFtZXMsIHBoTmFtZSksIGV4cHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZXhwTWFwO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29udmVydEludG9FeHByZXNzaW9uKG5hbWU6IHN0cmluZywgZXhwTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgaWYgKGV4cE1hcC5oYXMobmFtZSkpIHtcbiAgICAgIHJldHVybiBge3ske2V4cE1hcC5nZXQobmFtZSl9fX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSTE4bkVycm9yKHNvdXJjZVNwYW4sIGBJbnZhbGlkIGludGVycG9sYXRpb24gbmFtZSAnJHtuYW1lfSdgKTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgX0NyZWF0ZU5vZGVNYXBwaW5nIGltcGxlbWVudHMgSHRtbEFzdFZpc2l0b3Ige1xuICBtYXBwaW5nOiBIdG1sQXN0W10gPSBbXTtcblxuICB2aXNpdEVsZW1lbnQoYXN0OiBIdG1sRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLm1hcHBpbmcucHVzaChhc3QpO1xuICAgIGh0bWxWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4pO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRBdHRyKGFzdDogSHRtbEF0dHJBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRUZXh0KGFzdDogSHRtbFRleHRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5tYXBwaW5nLnB1c2goYXN0KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0Q29tbWVudChhc3Q6IEh0bWxDb21tZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gXCJcIjsgfVxufVxuIl19