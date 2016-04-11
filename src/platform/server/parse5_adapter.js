'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var parse5 = require('parse5/index');
var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
var serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
var treeAdapter = parser.treeAdapter;
var collection_1 = require('angular2/src/facade/collection');
var common_dom_1 = require('angular2/platform/common_dom');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var selector_1 = require('angular2/src/compiler/selector');
var xhr_1 = require('angular2/src/compiler/xhr');
var _attrToPropMap = {
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
};
var defDoc = null;
var mapProps = ['attribs', 'x-attribsNamespace', 'x-attribsPrefix'];
function _notImplemented(methodName) {
    return new exceptions_1.BaseException('This method is not implemented in Parse5DomAdapter: ' + methodName);
}
/* tslint:disable:requireParameterType */
var Parse5DomAdapter = (function (_super) {
    __extends(Parse5DomAdapter, _super);
    function Parse5DomAdapter() {
        _super.apply(this, arguments);
    }
    Parse5DomAdapter.makeCurrent = function () { common_dom_1.setRootDomAdapter(new Parse5DomAdapter()); };
    Parse5DomAdapter.prototype.hasProperty = function (element, name) {
        return _HTMLElementPropertyList.indexOf(name) > -1;
    };
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    Parse5DomAdapter.prototype.setProperty = function (el, name, value) {
        if (name === 'innerHTML') {
            this.setInnerHTML(el, value);
        }
        else if (name === 'className') {
            el.attribs['class'] = el.className = value;
        }
        else {
            el[name] = value;
        }
    };
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    Parse5DomAdapter.prototype.getProperty = function (el, name) { return el[name]; };
    Parse5DomAdapter.prototype.logError = function (error) { console.error(error); };
    Parse5DomAdapter.prototype.log = function (error) { console.log(error); };
    Parse5DomAdapter.prototype.logGroup = function (error) { console.error(error); };
    Parse5DomAdapter.prototype.logGroupEnd = function () { };
    Parse5DomAdapter.prototype.getXHR = function () { return xhr_1.XHR; };
    Object.defineProperty(Parse5DomAdapter.prototype, "attrToPropMap", {
        get: function () { return _attrToPropMap; },
        enumerable: true,
        configurable: true
    });
    Parse5DomAdapter.prototype.query = function (selector) { throw _notImplemented('query'); };
    Parse5DomAdapter.prototype.querySelector = function (el, selector) { return this.querySelectorAll(el, selector)[0]; };
    Parse5DomAdapter.prototype.querySelectorAll = function (el, selector) {
        var _this = this;
        var res = [];
        var _recursive = function (result, node, selector, matcher) {
            var cNodes = node.childNodes;
            if (cNodes && cNodes.length > 0) {
                for (var i = 0; i < cNodes.length; i++) {
                    var childNode = cNodes[i];
                    if (_this.elementMatches(childNode, selector, matcher)) {
                        result.push(childNode);
                    }
                    _recursive(result, childNode, selector, matcher);
                }
            }
        };
        var matcher = new selector_1.SelectorMatcher();
        matcher.addSelectables(selector_1.CssSelector.parse(selector));
        _recursive(res, el, selector, matcher);
        return res;
    };
    Parse5DomAdapter.prototype.elementMatches = function (node, selector, matcher) {
        if (matcher === void 0) { matcher = null; }
        if (this.isElementNode(node) && selector === '*') {
            return true;
        }
        var result = false;
        if (selector && selector.charAt(0) == '#') {
            result = this.getAttribute(node, 'id') == selector.substring(1);
        }
        else if (selector) {
            var result = false;
            if (matcher == null) {
                matcher = new selector_1.SelectorMatcher();
                matcher.addSelectables(selector_1.CssSelector.parse(selector));
            }
            var cssSelector = new selector_1.CssSelector();
            cssSelector.setElement(this.tagName(node));
            if (node.attribs) {
                for (var attrName in node.attribs) {
                    cssSelector.addAttribute(attrName, node.attribs[attrName]);
                }
            }
            var classList = this.classList(node);
            for (var i = 0; i < classList.length; i++) {
                cssSelector.addClassName(classList[i]);
            }
            matcher.match(cssSelector, function (selector, cb) { result = true; });
        }
        return result;
    };
    Parse5DomAdapter.prototype.on = function (el, evt, listener) {
        var listenersMap = el._eventListenersMap;
        if (lang_1.isBlank(listenersMap)) {
            var listenersMap = collection_1.StringMapWrapper.create();
            el._eventListenersMap = listenersMap;
        }
        var listeners = collection_1.StringMapWrapper.get(listenersMap, evt);
        if (lang_1.isBlank(listeners)) {
            listeners = [];
        }
        listeners.push(listener);
        collection_1.StringMapWrapper.set(listenersMap, evt, listeners);
    };
    Parse5DomAdapter.prototype.onAndCancel = function (el, evt, listener) {
        this.on(el, evt, listener);
        return function () {
            collection_1.ListWrapper.remove(collection_1.StringMapWrapper.get(el._eventListenersMap, evt), listener);
        };
    };
    Parse5DomAdapter.prototype.dispatchEvent = function (el, evt) {
        if (lang_1.isBlank(evt.target)) {
            evt.target = el;
        }
        if (lang_1.isPresent(el._eventListenersMap)) {
            var listeners = collection_1.StringMapWrapper.get(el._eventListenersMap, evt.type);
            if (lang_1.isPresent(listeners)) {
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i](evt);
                }
            }
        }
        if (lang_1.isPresent(el.parent)) {
            this.dispatchEvent(el.parent, evt);
        }
        if (lang_1.isPresent(el._window)) {
            this.dispatchEvent(el._window, evt);
        }
    };
    Parse5DomAdapter.prototype.createMouseEvent = function (eventType) { return this.createEvent(eventType); };
    Parse5DomAdapter.prototype.createEvent = function (eventType) {
        var evt = {
            type: eventType,
            defaultPrevented: false,
            preventDefault: function () { evt.defaultPrevented = true; }
        };
        return evt;
    };
    Parse5DomAdapter.prototype.preventDefault = function (evt) { evt.returnValue = false; };
    Parse5DomAdapter.prototype.isPrevented = function (evt) { return lang_1.isPresent(evt.returnValue) && !evt.returnValue; };
    Parse5DomAdapter.prototype.getInnerHTML = function (el) { return serializer.serialize(this.templateAwareRoot(el)); };
    Parse5DomAdapter.prototype.getOuterHTML = function (el) {
        serializer.html = '';
        serializer._serializeElement(el);
        return serializer.html;
    };
    Parse5DomAdapter.prototype.nodeName = function (node) { return node.tagName; };
    Parse5DomAdapter.prototype.nodeValue = function (node) { return node.nodeValue; };
    Parse5DomAdapter.prototype.type = function (node) { throw _notImplemented('type'); };
    Parse5DomAdapter.prototype.content = function (node) { return node.childNodes[0]; };
    Parse5DomAdapter.prototype.firstChild = function (el) { return el.firstChild; };
    Parse5DomAdapter.prototype.nextSibling = function (el) { return el.nextSibling; };
    Parse5DomAdapter.prototype.parentElement = function (el) { return el.parent; };
    Parse5DomAdapter.prototype.childNodes = function (el) { return el.childNodes; };
    Parse5DomAdapter.prototype.childNodesAsList = function (el) {
        var childNodes = el.childNodes;
        var res = collection_1.ListWrapper.createFixedSize(childNodes.length);
        for (var i = 0; i < childNodes.length; i++) {
            res[i] = childNodes[i];
        }
        return res;
    };
    Parse5DomAdapter.prototype.clearNodes = function (el) {
        while (el.childNodes.length > 0) {
            this.remove(el.childNodes[0]);
        }
    };
    Parse5DomAdapter.prototype.appendChild = function (el, node) {
        this.remove(node);
        treeAdapter.appendChild(this.templateAwareRoot(el), node);
    };
    Parse5DomAdapter.prototype.removeChild = function (el, node) {
        if (collection_1.ListWrapper.contains(el.childNodes, node)) {
            this.remove(node);
        }
    };
    Parse5DomAdapter.prototype.remove = function (el) {
        var parent = el.parent;
        if (parent) {
            var index = parent.childNodes.indexOf(el);
            parent.childNodes.splice(index, 1);
        }
        var prev = el.previousSibling;
        var next = el.nextSibling;
        if (prev) {
            prev.next = next;
        }
        if (next) {
            next.prev = prev;
        }
        el.prev = null;
        el.next = null;
        el.parent = null;
        return el;
    };
    Parse5DomAdapter.prototype.insertBefore = function (el, node) {
        this.remove(node);
        treeAdapter.insertBefore(el.parent, node, el);
    };
    Parse5DomAdapter.prototype.insertAllBefore = function (el, nodes) {
        var _this = this;
        nodes.forEach(function (n) { return _this.insertBefore(el, n); });
    };
    Parse5DomAdapter.prototype.insertAfter = function (el, node) {
        if (el.nextSibling) {
            this.insertBefore(el.nextSibling, node);
        }
        else {
            this.appendChild(el.parent, node);
        }
    };
    Parse5DomAdapter.prototype.setInnerHTML = function (el, value) {
        this.clearNodes(el);
        var content = parser.parseFragment(value);
        for (var i = 0; i < content.childNodes.length; i++) {
            treeAdapter.appendChild(el, content.childNodes[i]);
        }
    };
    Parse5DomAdapter.prototype.getText = function (el, isRecursive) {
        if (this.isTextNode(el)) {
            return el.data;
        }
        else if (this.isCommentNode(el)) {
            // In the DOM, comments within an element return an empty string for textContent
            // However, comment node instances return the comment content for textContent getter
            return isRecursive ? '' : el.data;
        }
        else if (lang_1.isBlank(el.childNodes) || el.childNodes.length == 0) {
            return '';
        }
        else {
            var textContent = '';
            for (var i = 0; i < el.childNodes.length; i++) {
                textContent += this.getText(el.childNodes[i], true);
            }
            return textContent;
        }
    };
    Parse5DomAdapter.prototype.setText = function (el, value) {
        if (this.isTextNode(el) || this.isCommentNode(el)) {
            el.data = value;
        }
        else {
            this.clearNodes(el);
            if (value !== '')
                treeAdapter.insertText(el, value);
        }
    };
    Parse5DomAdapter.prototype.getValue = function (el) { return el.value; };
    Parse5DomAdapter.prototype.setValue = function (el, value) { el.value = value; };
    Parse5DomAdapter.prototype.getChecked = function (el) { return el.checked; };
    Parse5DomAdapter.prototype.setChecked = function (el, value) { el.checked = value; };
    Parse5DomAdapter.prototype.createComment = function (text) { return treeAdapter.createCommentNode(text); };
    Parse5DomAdapter.prototype.createTemplate = function (html) {
        var template = treeAdapter.createElement('template', 'http://www.w3.org/1999/xhtml', []);
        var content = parser.parseFragment(html);
        treeAdapter.appendChild(template, content);
        return template;
    };
    Parse5DomAdapter.prototype.createElement = function (tagName) {
        return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
    };
    Parse5DomAdapter.prototype.createElementNS = function (ns, tagName) { return treeAdapter.createElement(tagName, ns, []); };
    Parse5DomAdapter.prototype.createTextNode = function (text) {
        var t = this.createComment(text);
        t.type = 'text';
        return t;
    };
    Parse5DomAdapter.prototype.createScriptTag = function (attrName, attrValue) {
        return treeAdapter.createElement('script', 'http://www.w3.org/1999/xhtml', [{ name: attrName, value: attrValue }]);
    };
    Parse5DomAdapter.prototype.createStyleElement = function (css) {
        var style = this.createElement('style');
        this.setText(style, css);
        return style;
    };
    Parse5DomAdapter.prototype.createShadowRoot = function (el) {
        el.shadowRoot = treeAdapter.createDocumentFragment();
        el.shadowRoot.parent = el;
        return el.shadowRoot;
    };
    Parse5DomAdapter.prototype.getShadowRoot = function (el) { return el.shadowRoot; };
    Parse5DomAdapter.prototype.getHost = function (el) { return el.host; };
    Parse5DomAdapter.prototype.getDistributedNodes = function (el) { throw _notImplemented('getDistributedNodes'); };
    Parse5DomAdapter.prototype.clone = function (node) {
        var _recursive = function (node) {
            var nodeClone = Object.create(Object.getPrototypeOf(node));
            for (var prop in node) {
                var desc = Object.getOwnPropertyDescriptor(node, prop);
                if (desc && 'value' in desc && typeof desc.value !== 'object') {
                    nodeClone[prop] = node[prop];
                }
            }
            nodeClone.parent = null;
            nodeClone.prev = null;
            nodeClone.next = null;
            nodeClone.children = null;
            mapProps.forEach(function (mapName) {
                if (lang_1.isPresent(node[mapName])) {
                    nodeClone[mapName] = {};
                    for (var prop in node[mapName]) {
                        nodeClone[mapName][prop] = node[mapName][prop];
                    }
                }
            });
            var cNodes = node.children;
            if (cNodes) {
                var cNodesClone = new Array(cNodes.length);
                for (var i = 0; i < cNodes.length; i++) {
                    var childNode = cNodes[i];
                    var childNodeClone = _recursive(childNode);
                    cNodesClone[i] = childNodeClone;
                    if (i > 0) {
                        childNodeClone.prev = cNodesClone[i - 1];
                        cNodesClone[i - 1].next = childNodeClone;
                    }
                    childNodeClone.parent = nodeClone;
                }
                nodeClone.children = cNodesClone;
            }
            return nodeClone;
        };
        return _recursive(node);
    };
    Parse5DomAdapter.prototype.getElementsByClassName = function (element, name) {
        return this.querySelectorAll(element, '.' + name);
    };
    Parse5DomAdapter.prototype.getElementsByTagName = function (element, name) {
        throw _notImplemented('getElementsByTagName');
    };
    Parse5DomAdapter.prototype.classList = function (element) {
        var classAttrValue = null;
        var attributes = element.attribs;
        if (attributes && attributes.hasOwnProperty('class')) {
            classAttrValue = attributes['class'];
        }
        return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
    };
    Parse5DomAdapter.prototype.addClass = function (element, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index == -1) {
            classList.push(className);
            element.attribs['class'] = element.className = classList.join(' ');
        }
    };
    Parse5DomAdapter.prototype.removeClass = function (element, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index > -1) {
            classList.splice(index, 1);
            element.attribs['class'] = element.className = classList.join(' ');
        }
    };
    Parse5DomAdapter.prototype.hasClass = function (element, className) {
        return collection_1.ListWrapper.contains(this.classList(element), className);
    };
    Parse5DomAdapter.prototype.hasStyle = function (element, styleName, styleValue) {
        if (styleValue === void 0) { styleValue = null; }
        var value = this.getStyle(element, styleName) || '';
        return styleValue ? value == styleValue : value.length > 0;
    };
    /** @internal */
    Parse5DomAdapter.prototype._readStyleAttribute = function (element) {
        var styleMap = {};
        var attributes = element.attribs;
        if (attributes && attributes.hasOwnProperty('style')) {
            var styleAttrValue = attributes['style'];
            var styleList = styleAttrValue.split(/;+/g);
            for (var i = 0; i < styleList.length; i++) {
                if (styleList[i].length > 0) {
                    var elems = styleList[i].split(/:+/g);
                    styleMap[elems[0].trim()] = elems[1].trim();
                }
            }
        }
        return styleMap;
    };
    /** @internal */
    Parse5DomAdapter.prototype._writeStyleAttribute = function (element, styleMap) {
        var styleAttrValue = '';
        for (var key in styleMap) {
            var newValue = styleMap[key];
            if (newValue && newValue.length > 0) {
                styleAttrValue += key + ':' + styleMap[key] + ';';
            }
        }
        element.attribs['style'] = styleAttrValue;
    };
    Parse5DomAdapter.prototype.setStyle = function (element, styleName, styleValue) {
        var styleMap = this._readStyleAttribute(element);
        styleMap[styleName] = styleValue;
        this._writeStyleAttribute(element, styleMap);
    };
    Parse5DomAdapter.prototype.removeStyle = function (element, styleName) { this.setStyle(element, styleName, null); };
    Parse5DomAdapter.prototype.getStyle = function (element, styleName) {
        var styleMap = this._readStyleAttribute(element);
        return styleMap.hasOwnProperty(styleName) ? styleMap[styleName] : '';
    };
    Parse5DomAdapter.prototype.tagName = function (element) { return element.tagName == 'style' ? 'STYLE' : element.tagName; };
    Parse5DomAdapter.prototype.attributeMap = function (element) {
        var res = new Map();
        var elAttrs = treeAdapter.getAttrList(element);
        for (var i = 0; i < elAttrs.length; i++) {
            var attrib = elAttrs[i];
            res.set(attrib.name, attrib.value);
        }
        return res;
    };
    Parse5DomAdapter.prototype.hasAttribute = function (element, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute);
    };
    Parse5DomAdapter.prototype.hasAttributeNS = function (element, ns, attribute) { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getAttribute = function (element, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute) ?
            element.attribs[attribute] :
            null;
    };
    Parse5DomAdapter.prototype.getAttributeNS = function (element, ns, attribute) { throw 'not implemented'; };
    Parse5DomAdapter.prototype.setAttribute = function (element, attribute, value) {
        if (attribute) {
            element.attribs[attribute] = value;
            if (attribute === 'class') {
                element.className = value;
            }
        }
    };
    Parse5DomAdapter.prototype.setAttributeNS = function (element, ns, attribute, value) { throw 'not implemented'; };
    Parse5DomAdapter.prototype.removeAttribute = function (element, attribute) {
        if (attribute) {
            collection_1.StringMapWrapper.delete(element.attribs, attribute);
        }
    };
    Parse5DomAdapter.prototype.removeAttributeNS = function (element, ns, name) { throw 'not implemented'; };
    Parse5DomAdapter.prototype.templateAwareRoot = function (el) { return this.isTemplateElement(el) ? this.content(el) : el; };
    Parse5DomAdapter.prototype.createHtmlDocument = function () {
        var newDoc = treeAdapter.createDocument();
        newDoc.title = 'fake title';
        var head = treeAdapter.createElement('head', null, []);
        var body = treeAdapter.createElement('body', 'http://www.w3.org/1999/xhtml', []);
        this.appendChild(newDoc, head);
        this.appendChild(newDoc, body);
        collection_1.StringMapWrapper.set(newDoc, 'head', head);
        collection_1.StringMapWrapper.set(newDoc, 'body', body);
        collection_1.StringMapWrapper.set(newDoc, '_window', collection_1.StringMapWrapper.create());
        return newDoc;
    };
    Parse5DomAdapter.prototype.defaultDoc = function () {
        if (defDoc === null) {
            defDoc = this.createHtmlDocument();
        }
        return defDoc;
    };
    Parse5DomAdapter.prototype.getBoundingClientRect = function (el) { return { left: 0, top: 0, width: 0, height: 0 }; };
    Parse5DomAdapter.prototype.getTitle = function () { return this.defaultDoc().title || ''; };
    Parse5DomAdapter.prototype.setTitle = function (newTitle) { this.defaultDoc().title = newTitle; };
    Parse5DomAdapter.prototype.isTemplateElement = function (el) {
        return this.isElementNode(el) && this.tagName(el) === 'template';
    };
    Parse5DomAdapter.prototype.isTextNode = function (node) { return treeAdapter.isTextNode(node); };
    Parse5DomAdapter.prototype.isCommentNode = function (node) { return treeAdapter.isCommentNode(node); };
    Parse5DomAdapter.prototype.isElementNode = function (node) { return node ? treeAdapter.isElementNode(node) : false; };
    Parse5DomAdapter.prototype.hasShadowRoot = function (node) { return lang_1.isPresent(node.shadowRoot); };
    Parse5DomAdapter.prototype.isShadowRoot = function (node) { return this.getShadowRoot(node) == node; };
    Parse5DomAdapter.prototype.importIntoDoc = function (node) { return this.clone(node); };
    Parse5DomAdapter.prototype.adoptNode = function (node) { return node; };
    Parse5DomAdapter.prototype.getHref = function (el) { return el.href; };
    Parse5DomAdapter.prototype.resolveAndSetHref = function (el, baseUrl, href) {
        if (href == null) {
            el.href = baseUrl;
        }
        else {
            el.href = baseUrl + '/../' + href;
        }
    };
    /** @internal */
    Parse5DomAdapter.prototype._buildRules = function (parsedRules, css) {
        var rules = [];
        for (var i = 0; i < parsedRules.length; i++) {
            var parsedRule = parsedRules[i];
            var rule = collection_1.StringMapWrapper.create();
            collection_1.StringMapWrapper.set(rule, 'cssText', css);
            collection_1.StringMapWrapper.set(rule, 'style', { content: '', cssText: '' });
            if (parsedRule.type == 'rule') {
                collection_1.StringMapWrapper.set(rule, 'type', 1);
                collection_1.StringMapWrapper.set(rule, 'selectorText', parsedRule.selectors.join(', ')
                    .replace(/\s{2,}/g, ' ')
                    .replace(/\s*~\s*/g, ' ~ ')
                    .replace(/\s*\+\s*/g, ' + ')
                    .replace(/\s*>\s*/g, ' > ')
                    .replace(/\[(\w+)=(\w+)\]/g, '[$1="$2"]'));
                if (lang_1.isBlank(parsedRule.declarations)) {
                    continue;
                }
                for (var j = 0; j < parsedRule.declarations.length; j++) {
                    var declaration = parsedRule.declarations[j];
                    collection_1.StringMapWrapper.set(collection_1.StringMapWrapper.get(rule, 'style'), declaration.property, declaration.value);
                    collection_1.StringMapWrapper.get(rule, 'style').cssText +=
                        declaration.property + ': ' + declaration.value + ';';
                }
            }
            else if (parsedRule.type == 'media') {
                collection_1.StringMapWrapper.set(rule, 'type', 4);
                collection_1.StringMapWrapper.set(rule, 'media', { mediaText: parsedRule.media });
                if (parsedRule.rules) {
                    collection_1.StringMapWrapper.set(rule, 'cssRules', this._buildRules(parsedRule.rules));
                }
            }
            rules.push(rule);
        }
        return rules;
    };
    Parse5DomAdapter.prototype.supportsDOMEvents = function () { return false; };
    Parse5DomAdapter.prototype.supportsNativeShadowDOM = function () { return false; };
    Parse5DomAdapter.prototype.getGlobalEventTarget = function (target) {
        if (target == 'window') {
            return this.defaultDoc()._window;
        }
        else if (target == 'document') {
            return this.defaultDoc();
        }
        else if (target == 'body') {
            return this.defaultDoc().body;
        }
    };
    Parse5DomAdapter.prototype.getBaseHref = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.resetBaseElement = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getHistory = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getLocation = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getUserAgent = function () { return 'Fake user agent'; };
    Parse5DomAdapter.prototype.getData = function (el, name) { return this.getAttribute(el, 'data-' + name); };
    Parse5DomAdapter.prototype.getComputedStyle = function (el) { throw 'not implemented'; };
    Parse5DomAdapter.prototype.setData = function (el, name, value) { this.setAttribute(el, 'data-' + name, value); };
    // TODO(tbosch): move this into a separate environment class once we have it
    Parse5DomAdapter.prototype.setGlobalVar = function (path, value) { lang_1.setValueOnPath(lang_1.global, path, value); };
    Parse5DomAdapter.prototype.requestAnimationFrame = function (callback) { return setTimeout(callback, 0); };
    Parse5DomAdapter.prototype.cancelAnimationFrame = function (id) { clearTimeout(id); };
    Parse5DomAdapter.prototype.performanceNow = function () { return lang_1.DateWrapper.toMillis(lang_1.DateWrapper.now()); };
    Parse5DomAdapter.prototype.getAnimationPrefix = function () { return ''; };
    Parse5DomAdapter.prototype.getTransitionEnd = function () { return 'transitionend'; };
    Parse5DomAdapter.prototype.supportsAnimation = function () { return true; };
    Parse5DomAdapter.prototype.replaceChild = function (el, newNode, oldNode) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.parse = function (templateHtml) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.invoke = function (el, methodName, args) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.getEventKey = function (event) { throw new Error('not implemented'); };
    return Parse5DomAdapter;
})(common_dom_1.DomAdapter);
exports.Parse5DomAdapter = Parse5DomAdapter;
// TODO: build a proper list, this one is all the keys of a HTMLInputElement
var _HTMLElementPropertyList = [
    'webkitEntries',
    'incremental',
    'webkitdirectory',
    'selectionDirection',
    'selectionEnd',
    'selectionStart',
    'labels',
    'validationMessage',
    'validity',
    'willValidate',
    'width',
    'valueAsNumber',
    'valueAsDate',
    'value',
    'useMap',
    'defaultValue',
    'type',
    'step',
    'src',
    'size',
    'required',
    'readOnly',
    'placeholder',
    'pattern',
    'name',
    'multiple',
    'min',
    'minLength',
    'maxLength',
    'max',
    'list',
    'indeterminate',
    'height',
    'formTarget',
    'formNoValidate',
    'formMethod',
    'formEnctype',
    'formAction',
    'files',
    'form',
    'disabled',
    'dirName',
    'checked',
    'defaultChecked',
    'autofocus',
    'autocomplete',
    'alt',
    'align',
    'accept',
    'onautocompleteerror',
    'onautocomplete',
    'onwaiting',
    'onvolumechange',
    'ontoggle',
    'ontimeupdate',
    'onsuspend',
    'onsubmit',
    'onstalled',
    'onshow',
    'onselect',
    'onseeking',
    'onseeked',
    'onscroll',
    'onresize',
    'onreset',
    'onratechange',
    'onprogress',
    'onplaying',
    'onplay',
    'onpause',
    'onmousewheel',
    'onmouseup',
    'onmouseover',
    'onmouseout',
    'onmousemove',
    'onmouseleave',
    'onmouseenter',
    'onmousedown',
    'onloadstart',
    'onloadedmetadata',
    'onloadeddata',
    'onload',
    'onkeyup',
    'onkeypress',
    'onkeydown',
    'oninvalid',
    'oninput',
    'onfocus',
    'onerror',
    'onended',
    'onemptied',
    'ondurationchange',
    'ondrop',
    'ondragstart',
    'ondragover',
    'ondragleave',
    'ondragenter',
    'ondragend',
    'ondrag',
    'ondblclick',
    'oncuechange',
    'oncontextmenu',
    'onclose',
    'onclick',
    'onchange',
    'oncanplaythrough',
    'oncanplay',
    'oncancel',
    'onblur',
    'onabort',
    'spellcheck',
    'isContentEditable',
    'contentEditable',
    'outerText',
    'innerText',
    'accessKey',
    'hidden',
    'webkitdropzone',
    'draggable',
    'tabIndex',
    'dir',
    'translate',
    'lang',
    'title',
    'childElementCount',
    'lastElementChild',
    'firstElementChild',
    'children',
    'onwebkitfullscreenerror',
    'onwebkitfullscreenchange',
    'nextElementSibling',
    'previousElementSibling',
    'onwheel',
    'onselectstart',
    'onsearch',
    'onpaste',
    'oncut',
    'oncopy',
    'onbeforepaste',
    'onbeforecut',
    'onbeforecopy',
    'shadowRoot',
    'dataset',
    'classList',
    'className',
    'outerHTML',
    'innerHTML',
    'scrollHeight',
    'scrollWidth',
    'scrollTop',
    'scrollLeft',
    'clientHeight',
    'clientWidth',
    'clientTop',
    'clientLeft',
    'offsetParent',
    'offsetHeight',
    'offsetWidth',
    'offsetTop',
    'offsetLeft',
    'localName',
    'prefix',
    'namespaceURI',
    'id',
    'style',
    'attributes',
    'tagName',
    'parentElement',
    'textContent',
    'baseURI',
    'ownerDocument',
    'nextSibling',
    'previousSibling',
    'lastChild',
    'firstChild',
    'childNodes',
    'parentNode',
    'nodeType',
    'nodeValue',
    'nodeName',
    'closure_lm_714617',
    '__jsaction'
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2U1X2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVYzdjBWSkZILnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vc2VydmVyL3BhcnNlNV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbIl9ub3RJbXBsZW1lbnRlZCIsIlBhcnNlNURvbUFkYXB0ZXIiLCJQYXJzZTVEb21BZGFwdGVyLmNvbnN0cnVjdG9yIiwiUGFyc2U1RG9tQWRhcHRlci5tYWtlQ3VycmVudCIsIlBhcnNlNURvbUFkYXB0ZXIuaGFzUHJvcGVydHkiLCJQYXJzZTVEb21BZGFwdGVyLnNldFByb3BlcnR5IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRQcm9wZXJ0eSIsIlBhcnNlNURvbUFkYXB0ZXIubG9nRXJyb3IiLCJQYXJzZTVEb21BZGFwdGVyLmxvZyIsIlBhcnNlNURvbUFkYXB0ZXIubG9nR3JvdXAiLCJQYXJzZTVEb21BZGFwdGVyLmxvZ0dyb3VwRW5kIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRYSFIiLCJQYXJzZTVEb21BZGFwdGVyLmF0dHJUb1Byb3BNYXAiLCJQYXJzZTVEb21BZGFwdGVyLnF1ZXJ5IiwiUGFyc2U1RG9tQWRhcHRlci5xdWVyeVNlbGVjdG9yIiwiUGFyc2U1RG9tQWRhcHRlci5xdWVyeVNlbGVjdG9yQWxsIiwiUGFyc2U1RG9tQWRhcHRlci5lbGVtZW50TWF0Y2hlcyIsIlBhcnNlNURvbUFkYXB0ZXIub24iLCJQYXJzZTVEb21BZGFwdGVyLm9uQW5kQ2FuY2VsIiwiUGFyc2U1RG9tQWRhcHRlci5kaXNwYXRjaEV2ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVNb3VzZUV2ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVFdmVudCIsIlBhcnNlNURvbUFkYXB0ZXIucHJldmVudERlZmF1bHQiLCJQYXJzZTVEb21BZGFwdGVyLmlzUHJldmVudGVkIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRJbm5lckhUTUwiLCJQYXJzZTVEb21BZGFwdGVyLmdldE91dGVySFRNTCIsIlBhcnNlNURvbUFkYXB0ZXIubm9kZU5hbWUiLCJQYXJzZTVEb21BZGFwdGVyLm5vZGVWYWx1ZSIsIlBhcnNlNURvbUFkYXB0ZXIudHlwZSIsIlBhcnNlNURvbUFkYXB0ZXIuY29udGVudCIsIlBhcnNlNURvbUFkYXB0ZXIuZmlyc3RDaGlsZCIsIlBhcnNlNURvbUFkYXB0ZXIubmV4dFNpYmxpbmciLCJQYXJzZTVEb21BZGFwdGVyLnBhcmVudEVsZW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNoaWxkTm9kZXMiLCJQYXJzZTVEb21BZGFwdGVyLmNoaWxkTm9kZXNBc0xpc3QiLCJQYXJzZTVEb21BZGFwdGVyLmNsZWFyTm9kZXMiLCJQYXJzZTVEb21BZGFwdGVyLmFwcGVuZENoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVDaGlsZCIsIlBhcnNlNURvbUFkYXB0ZXIucmVtb3ZlIiwiUGFyc2U1RG9tQWRhcHRlci5pbnNlcnRCZWZvcmUiLCJQYXJzZTVEb21BZGFwdGVyLmluc2VydEFsbEJlZm9yZSIsIlBhcnNlNURvbUFkYXB0ZXIuaW5zZXJ0QWZ0ZXIiLCJQYXJzZTVEb21BZGFwdGVyLnNldElubmVySFRNTCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0VGV4dCIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0VGV4dCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0VmFsdWUiLCJQYXJzZTVEb21BZGFwdGVyLnNldFZhbHVlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRDaGVja2VkIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRDaGVja2VkIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVDb21tZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVUZW1wbGF0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlRWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlRWxlbWVudE5TIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVUZXh0Tm9kZSIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlU2NyaXB0VGFnIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVTdHlsZUVsZW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVNoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldFNoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldEhvc3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldERpc3RyaWJ1dGVkTm9kZXMiLCJQYXJzZTVEb21BZGFwdGVyLmNsb25lIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRFbGVtZW50c0J5VGFnTmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIuY2xhc3NMaXN0IiwiUGFyc2U1RG9tQWRhcHRlci5hZGRDbGFzcyIsIlBhcnNlNURvbUFkYXB0ZXIucmVtb3ZlQ2xhc3MiLCJQYXJzZTVEb21BZGFwdGVyLmhhc0NsYXNzIiwiUGFyc2U1RG9tQWRhcHRlci5oYXNTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIuX3JlYWRTdHlsZUF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuX3dyaXRlU3R5bGVBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLnNldFN0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0U3R5bGUiLCJQYXJzZTVEb21BZGFwdGVyLnRhZ05hbWUiLCJQYXJzZTVEb21BZGFwdGVyLmF0dHJpYnV0ZU1hcCIsIlBhcnNlNURvbUFkYXB0ZXIuaGFzQXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5oYXNBdHRyaWJ1dGVOUyIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0QXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRBdHRyaWJ1dGVOUyIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0QXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRBdHRyaWJ1dGVOUyIsIlBhcnNlNURvbUFkYXB0ZXIucmVtb3ZlQXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVBdHRyaWJ1dGVOUyIsIlBhcnNlNURvbUFkYXB0ZXIudGVtcGxhdGVBd2FyZVJvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZUh0bWxEb2N1bWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuZGVmYXVsdERvYyIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRUaXRsZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0VGl0bGUiLCJQYXJzZTVEb21BZGFwdGVyLmlzVGVtcGxhdGVFbGVtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5pc1RleHROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5pc0NvbW1lbnROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5pc0VsZW1lbnROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5oYXNTaGFkb3dSb290IiwiUGFyc2U1RG9tQWRhcHRlci5pc1NoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmltcG9ydEludG9Eb2MiLCJQYXJzZTVEb21BZGFwdGVyLmFkb3B0Tm9kZSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0SHJlZiIsIlBhcnNlNURvbUFkYXB0ZXIucmVzb2x2ZUFuZFNldEhyZWYiLCJQYXJzZTVEb21BZGFwdGVyLl9idWlsZFJ1bGVzIiwiUGFyc2U1RG9tQWRhcHRlci5zdXBwb3J0c0RPTUV2ZW50cyIsIlBhcnNlNURvbUFkYXB0ZXIuc3VwcG9ydHNOYXRpdmVTaGFkb3dET00iLCJQYXJzZTVEb21BZGFwdGVyLmdldEdsb2JhbEV2ZW50VGFyZ2V0IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRCYXNlSHJlZiIsIlBhcnNlNURvbUFkYXB0ZXIucmVzZXRCYXNlRWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0SGlzdG9yeSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0TG9jYXRpb24iLCJQYXJzZTVEb21BZGFwdGVyLmdldFVzZXJBZ2VudCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0RGF0YSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0Q29tcHV0ZWRTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0RGF0YSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0R2xvYmFsVmFyIiwiUGFyc2U1RG9tQWRhcHRlci5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJQYXJzZTVEb21BZGFwdGVyLmNhbmNlbEFuaW1hdGlvbkZyYW1lIiwiUGFyc2U1RG9tQWRhcHRlci5wZXJmb3JtYW5jZU5vdyIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0QW5pbWF0aW9uUHJlZml4IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRUcmFuc2l0aW9uRW5kIiwiUGFyc2U1RG9tQWRhcHRlci5zdXBwb3J0c0FuaW1hdGlvbiIsIlBhcnNlNURvbUFkYXB0ZXIucmVwbGFjZUNoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5wYXJzZSIsIlBhcnNlNURvbUFkYXB0ZXIuaW52b2tlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRFdmVudEtleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDeEUsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUVyQywyQkFBd0QsZ0NBQWdDLENBQUMsQ0FBQTtBQUN6RiwyQkFBNEMsOEJBQThCLENBQUMsQ0FBQTtBQUMzRSxxQkFBNEUsMEJBQTBCLENBQUMsQ0FBQTtBQUN2RywyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSx5QkFBMkMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM1RSxvQkFBa0IsMkJBQTJCLENBQUMsQ0FBQTtB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RUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUNEcEMsaUNBQU1BLEdBQU5BLFVBQU9BLEVBQUVBO1FBQ1BxQyxJQUFJQSxNQUFNQSxHQUFHQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUN2QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDWEEsSUFBSUEsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDMUNBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JDQSxDQUFDQTtRQUNEQSxJQUFJQSxJQUFJQSxHQUFHQSxFQUFFQSxDQUFDQSxlQUFlQSxDQUFDQTtRQUM5QkEsSUFBSUEsSUFBSUEsR0FBR0EsRUFBRUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7UUFDMUJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ1RBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNUQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDZkEsRUFBRUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDZkEsRUFBRUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakJBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBO0lBQ1pBLENBQUNBO0lBQ0RyQyx1Q0FBWUEsR0FBWkEsVUFBYUEs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QUFPO0lBQ1AsWUFBWTtJQUNaLFNBQVM7SUFDVCxlQUFlO0lBQ2YsYUFBYTtJQUNiLFNBQVM7SUFDVCxlQUFlO0lBQ2YsYUFBYTtJQUNiLGlCQUFpQjtJQUNqQixXQUFXO0lBQ1gsWUFBWTtJQUNaLFlBQVk7SUFDWixZQUFZO0lBQ1osVUFBVTtJQUNWLFdBQVc7SUFDWCxVQUFVO0lBQ1YsbUJBQW1CO0lBQ25CLFlBQVk7Q0FDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHBhcnNlNSA9IHJlcXVpcmUoJ3BhcnNlNS9pbmRleCcpO1xudmFyIHBhcnNlciA9IG5ldyBwYXJzZTUuUGFyc2VyKHBhcnNlNS5UcmVlQWRhcHRlcnMuaHRtbHBhcnNlcjIpO1xudmFyIHNlcmlhbGl6ZXIgPSBuZXcgcGFyc2U1LlNlcmlhbGl6ZXIocGFyc2U1LlRyZWVBZGFwdGVycy5odG1scGFyc2VyMik7XG52YXIgdHJlZUFkYXB0ZXIgPSBwYXJzZXIudHJlZUFkYXB0ZXI7XG5cbmltcG9ydCB7TWFwV3JhcHBlciwgTGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0RvbUFkYXB0ZXIsIHNldFJvb3REb21BZGFwdGVyfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9jb21tb25fZG9tJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBnbG9iYWwsIFR5cGUsIHNldFZhbHVlT25QYXRoLCBEYXRlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U2VsZWN0b3JNYXRjaGVyLCBDc3NTZWxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NlbGVjdG9yJztcbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcblxudmFyIF9hdHRyVG9Qcm9wTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdpbm5lckh0bWwnOiAnaW5uZXJIVE1MJyxcbiAgJ3JlYWRvbmx5JzogJ3JlYWRPbmx5JyxcbiAgJ3RhYmluZGV4JzogJ3RhYkluZGV4Jyxcbn07XG52YXIgZGVmRG9jID0gbnVsbDtcblxudmFyIG1hcFByb3BzID0gWydhdHRyaWJzJywgJ3gtYXR0cmlic05hbWVzcGFjZScsICd4LWF0dHJpYnNQcmVmaXgnXTtcblxuZnVuY3Rpb24gX25vdEltcGxlbWVudGVkKG1ldGhvZE5hbWUpIHtcbiAgcmV0dXJuIG5ldyBCYXNlRXhjZXB0aW9uKCdUaGlzIG1ldGhvZCBpcyBub3QgaW1wbGVtZW50ZWQgaW4gUGFyc2U1RG9tQWRhcHRlcjogJyArIG1ldGhvZE5hbWUpO1xufVxuXG4vKiB0c2xpbnQ6ZGlzYWJsZTpyZXF1aXJlUGFyYW1ldGVyVHlwZSAqL1xuZXhwb3J0IGNsYXNzIFBhcnNlNURvbUFkYXB0ZXIgZXh0ZW5kcyBEb21BZGFwdGVyIHtcbiAgc3RhdGljIG1ha2VDdXJyZW50KCkgeyBzZXRSb290RG9tQWRhcHRlcihuZXcgUGFyc2U1RG9tQWRhcHRlcigpKTsgfVxuXG4gIGhhc1Byb3BlcnR5KGVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBfSFRNTEVsZW1lbnRQcm9wZXJ0eUxpc3QuaW5kZXhPZihuYW1lKSA+IC0xO1xuICB9XG4gIC8vIFRPRE8odGJvc2NoKTogZG9uJ3QgZXZlbiBjYWxsIHRoaXMgbWV0aG9kIHdoZW4gd2UgcnVuIHRoZSB0ZXN0cyBvbiBzZXJ2ZXIgc2lkZVxuICAvLyBieSBub3QgdXNpbmcgdGhlIERvbVJlbmRlcmVyIGluIHRlc3RzLiBLZWVwaW5nIHRoaXMgZm9yIG5vdyB0byBtYWtlIHRlc3RzIGhhcHB5Li4uXG4gIHNldFByb3BlcnR5KGVsOiAvKmVsZW1lbnQqLyBhbnksIG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIGlmIChuYW1lID09PSAnaW5uZXJIVE1MJykge1xuICAgICAgdGhpcy5zZXRJbm5lckhUTUwoZWwsIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdjbGFzc05hbWUnKSB7XG4gICAgICBlbC5hdHRyaWJzWydjbGFzcyddID0gZWwuY2xhc3NOYW1lID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsW25hbWVdID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIC8vIFRPRE8odGJvc2NoKTogZG9uJ3QgZXZlbiBjYWxsIHRoaXMgbWV0aG9kIHdoZW4gd2UgcnVuIHRoZSB0ZXN0cyBvbiBzZXJ2ZXIgc2lkZVxuICAvLyBieSBub3QgdXNpbmcgdGhlIERvbVJlbmRlcmVyIGluIHRlc3RzLiBLZWVwaW5nIHRoaXMgZm9yIG5vdyB0byBtYWtlIHRlc3RzIGhhcHB5Li4uXG4gIGdldFByb3BlcnR5KGVsOiAvKmVsZW1lbnQqLyBhbnksIG5hbWU6IHN0cmluZyk6IGFueSB7IHJldHVybiBlbFtuYW1lXTsgfVxuXG4gIGxvZ0Vycm9yKGVycm9yKSB7IGNvbnNvbGUuZXJyb3IoZXJyb3IpOyB9XG5cbiAgbG9nKGVycm9yKSB7IGNvbnNvbGUubG9nKGVycm9yKTsgfVxuXG4gIGxvZ0dyb3VwKGVycm9yKSB7IGNvbnNvbGUuZXJyb3IoZXJyb3IpOyB9XG5cbiAgbG9nR3JvdXBFbmQoKSB7fVxuXG4gIGdldFhIUigpOiBUeXBlIHsgcmV0dXJuIFhIUjsgfVxuXG4gIGdldCBhdHRyVG9Qcm9wTWFwKCkgeyByZXR1cm4gX2F0dHJUb1Byb3BNYXA7IH1cblxuICBxdWVyeShzZWxlY3RvcikgeyB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ3F1ZXJ5Jyk7IH1cbiAgcXVlcnlTZWxlY3RvcihlbCwgc2VsZWN0b3I6IHN0cmluZyk6IGFueSB7IHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoZWwsIHNlbGVjdG9yKVswXTsgfVxuICBxdWVyeVNlbGVjdG9yQWxsKGVsLCBzZWxlY3Rvcjogc3RyaW5nKTogYW55W10ge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICB2YXIgX3JlY3Vyc2l2ZSA9IChyZXN1bHQsIG5vZGUsIHNlbGVjdG9yLCBtYXRjaGVyKSA9PiB7XG4gICAgICB2YXIgY05vZGVzID0gbm9kZS5jaGlsZE5vZGVzO1xuICAgICAgaWYgKGNOb2RlcyAmJiBjTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBjTm9kZXNbaV07XG4gICAgICAgICAgaWYgKHRoaXMuZWxlbWVudE1hdGNoZXMoY2hpbGROb2RlLCBzZWxlY3RvciwgbWF0Y2hlcikpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNoaWxkTm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIF9yZWN1cnNpdmUocmVzdWx0LCBjaGlsZE5vZGUsIHNlbGVjdG9yLCBtYXRjaGVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdmFyIG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShzZWxlY3RvcikpO1xuICAgIF9yZWN1cnNpdmUocmVzLCBlbCwgc2VsZWN0b3IsIG1hdGNoZXIpO1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgZWxlbWVudE1hdGNoZXMobm9kZSwgc2VsZWN0b3I6IHN0cmluZywgbWF0Y2hlciA9IG51bGwpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5pc0VsZW1lbnROb2RlKG5vZGUpICYmIHNlbGVjdG9yID09PSAnKicpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYgKHNlbGVjdG9yICYmIHNlbGVjdG9yLmNoYXJBdCgwKSA9PSAnIycpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5vZGUsICdpZCcpID09IHNlbGVjdG9yLnN1YnN0cmluZygxKTtcbiAgICB9IGVsc2UgaWYgKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBpZiAobWF0Y2hlciA9PSBudWxsKSB7XG4gICAgICAgIG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2Uoc2VsZWN0b3IpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNzc1NlbGVjdG9yID0gbmV3IENzc1NlbGVjdG9yKCk7XG4gICAgICBjc3NTZWxlY3Rvci5zZXRFbGVtZW50KHRoaXMudGFnTmFtZShub2RlKSk7XG4gICAgICBpZiAobm9kZS5hdHRyaWJzKSB7XG4gICAgICAgIGZvciAodmFyIGF0dHJOYW1lIGluIG5vZGUuYXR0cmlicykge1xuICAgICAgICAgIGNzc1NlbGVjdG9yLmFkZEF0dHJpYnV0ZShhdHRyTmFtZSwgbm9kZS5hdHRyaWJzW2F0dHJOYW1lXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmNsYXNzTGlzdChub2RlKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNzc1NlbGVjdG9yLmFkZENsYXNzTmFtZShjbGFzc0xpc3RbaV0pO1xuICAgICAgfVxuXG4gICAgICBtYXRjaGVyLm1hdGNoKGNzc1NlbGVjdG9yLCBmdW5jdGlvbihzZWxlY3RvciwgY2IpIHsgcmVzdWx0ID0gdHJ1ZTsgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgb24oZWwsIGV2dCwgbGlzdGVuZXIpIHtcbiAgICB2YXIgbGlzdGVuZXJzTWFwOiB7W2s6IC8qYW55Ki8gc3RyaW5nXTogYW55fSA9IGVsLl9ldmVudExpc3RlbmVyc01hcDtcbiAgICBpZiAoaXNCbGFuayhsaXN0ZW5lcnNNYXApKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzTWFwOiB7W2s6IC8qYW55Ki8gc3RyaW5nXTogYW55fSA9IFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCk7XG4gICAgICBlbC5fZXZlbnRMaXN0ZW5lcnNNYXAgPSBsaXN0ZW5lcnNNYXA7XG4gICAgfVxuICAgIHZhciBsaXN0ZW5lcnMgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChsaXN0ZW5lcnNNYXAsIGV2dCk7XG4gICAgaWYgKGlzQmxhbmsobGlzdGVuZXJzKSkge1xuICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgfVxuICAgIGxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChsaXN0ZW5lcnNNYXAsIGV2dCwgbGlzdGVuZXJzKTtcbiAgfVxuICBvbkFuZENhbmNlbChlbCwgZXZ0LCBsaXN0ZW5lcik6IEZ1bmN0aW9uIHtcbiAgICB0aGlzLm9uKGVsLCBldnQsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKFN0cmluZ01hcFdyYXBwZXIuZ2V0PGFueVtdPihlbC5fZXZlbnRMaXN0ZW5lcnNNYXAsIGV2dCksIGxpc3RlbmVyKTtcbiAgICB9O1xuICB9XG4gIGRpc3BhdGNoRXZlbnQoZWwsIGV2dCkge1xuICAgIGlmIChpc0JsYW5rKGV2dC50YXJnZXQpKSB7XG4gICAgICBldnQudGFyZ2V0ID0gZWw7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoZWwuX2V2ZW50TGlzdGVuZXJzTWFwKSkge1xuICAgICAgdmFyIGxpc3RlbmVyczogYW55ID0gU3RyaW5nTWFwV3JhcHBlci5nZXQoZWwuX2V2ZW50TGlzdGVuZXJzTWFwLCBldnQudHlwZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGxpc3RlbmVycykpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsaXN0ZW5lcnNbaV0oZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGVsLnBhcmVudCkpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlbC5wYXJlbnQsIGV2dCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoZWwuX3dpbmRvdykpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlbC5fd2luZG93LCBldnQpO1xuICAgIH1cbiAgfVxuICBjcmVhdGVNb3VzZUV2ZW50KGV2ZW50VHlwZSk6IEV2ZW50IHsgcmV0dXJuIHRoaXMuY3JlYXRlRXZlbnQoZXZlbnRUeXBlKTsgfVxuICBjcmVhdGVFdmVudChldmVudFR5cGU6IHN0cmluZyk6IEV2ZW50IHtcbiAgICB2YXIgZXZ0ID0gPEV2ZW50PntcbiAgICAgIHR5cGU6IGV2ZW50VHlwZSxcbiAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGZhbHNlLFxuICAgICAgcHJldmVudERlZmF1bHQ6ICgpID0+IHsgZXZ0LmRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlOyB9XG4gICAgfTtcbiAgICByZXR1cm4gZXZ0O1xuICB9XG4gIHByZXZlbnREZWZhdWx0KGV2dCkgeyBldnQucmV0dXJuVmFsdWUgPSBmYWxzZTsgfVxuICBpc1ByZXZlbnRlZChldnQpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudChldnQucmV0dXJuVmFsdWUpICYmICFldnQucmV0dXJuVmFsdWU7IH1cbiAgZ2V0SW5uZXJIVE1MKGVsKTogc3RyaW5nIHsgcmV0dXJuIHNlcmlhbGl6ZXIuc2VyaWFsaXplKHRoaXMudGVtcGxhdGVBd2FyZVJvb3QoZWwpKTsgfVxuICBnZXRPdXRlckhUTUwoZWwpOiBzdHJpbmcge1xuICAgIHNlcmlhbGl6ZXIuaHRtbCA9ICcnO1xuICAgIHNlcmlhbGl6ZXIuX3NlcmlhbGl6ZUVsZW1lbnQoZWwpO1xuICAgIHJldHVybiBzZXJpYWxpemVyLmh0bWw7XG4gIH1cbiAgbm9kZU5hbWUobm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLnRhZ05hbWU7IH1cbiAgbm9kZVZhbHVlKG5vZGUpOiBzdHJpbmcgeyByZXR1cm4gbm9kZS5ub2RlVmFsdWU7IH1cbiAgdHlwZShub2RlOiBhbnkpOiBzdHJpbmcgeyB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ3R5cGUnKTsgfVxuICBjb250ZW50KG5vZGUpOiBzdHJpbmcgeyByZXR1cm4gbm9kZS5jaGlsZE5vZGVzWzBdOyB9XG4gIGZpcnN0Q2hpbGQoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLmZpcnN0Q2hpbGQ7IH1cbiAgbmV4dFNpYmxpbmcoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLm5leHRTaWJsaW5nOyB9XG4gIHBhcmVudEVsZW1lbnQoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLnBhcmVudDsgfVxuICBjaGlsZE5vZGVzKGVsKTogTm9kZVtdIHsgcmV0dXJuIGVsLmNoaWxkTm9kZXM7IH1cbiAgY2hpbGROb2Rlc0FzTGlzdChlbCk6IGFueVtdIHtcbiAgICB2YXIgY2hpbGROb2RlcyA9IGVsLmNoaWxkTm9kZXM7XG4gICAgdmFyIHJlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShjaGlsZE5vZGVzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXNbaV0gPSBjaGlsZE5vZGVzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIGNsZWFyTm9kZXMoZWwpIHtcbiAgICB3aGlsZSAoZWwuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnJlbW92ZShlbC5jaGlsZE5vZGVzWzBdKTtcbiAgICB9XG4gIH1cbiAgYXBwZW5kQ2hpbGQoZWwsIG5vZGUpIHtcbiAgICB0aGlzLnJlbW92ZShub2RlKTtcbiAgICB0cmVlQWRhcHRlci5hcHBlbmRDaGlsZCh0aGlzLnRlbXBsYXRlQXdhcmVSb290KGVsKSwgbm9kZSk7XG4gIH1cbiAgcmVtb3ZlQ2hpbGQoZWwsIG5vZGUpIHtcbiAgICBpZiAoTGlzdFdyYXBwZXIuY29udGFpbnMoZWwuY2hpbGROb2Rlcywgbm9kZSkpIHtcbiAgICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgIH1cbiAgfVxuICByZW1vdmUoZWwpOiBIVE1MRWxlbWVudCB7XG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudDtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICB2YXIgaW5kZXggPSBwYXJlbnQuY2hpbGROb2Rlcy5pbmRleE9mKGVsKTtcbiAgICAgIHBhcmVudC5jaGlsZE5vZGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIHZhciBwcmV2ID0gZWwucHJldmlvdXNTaWJsaW5nO1xuICAgIHZhciBuZXh0ID0gZWwubmV4dFNpYmxpbmc7XG4gICAgaWYgKHByZXYpIHtcbiAgICAgIHByZXYubmV4dCA9IG5leHQ7XG4gICAgfVxuICAgIGlmIChuZXh0KSB7XG4gICAgICBuZXh0LnByZXYgPSBwcmV2O1xuICAgIH1cbiAgICBlbC5wcmV2ID0gbnVsbDtcbiAgICBlbC5uZXh0ID0gbnVsbDtcbiAgICBlbC5wYXJlbnQgPSBudWxsO1xuICAgIHJldHVybiBlbDtcbiAgfVxuICBpbnNlcnRCZWZvcmUoZWwsIG5vZGUpIHtcbiAgICB0aGlzLnJlbW92ZShub2RlKTtcbiAgICB0cmVlQWRhcHRlci5pbnNlcnRCZWZvcmUoZWwucGFyZW50LCBub2RlLCBlbCk7XG4gIH1cbiAgaW5zZXJ0QWxsQmVmb3JlKGVsLCBub2RlcykgeyBub2Rlcy5mb3JFYWNoKG4gPT4gdGhpcy5pbnNlcnRCZWZvcmUoZWwsIG4pKTsgfVxuICBpbnNlcnRBZnRlcihlbCwgbm9kZSkge1xuICAgIGlmIChlbC5uZXh0U2libGluZykge1xuICAgICAgdGhpcy5pbnNlcnRCZWZvcmUoZWwubmV4dFNpYmxpbmcsIG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFwcGVuZENoaWxkKGVsLnBhcmVudCwgbm9kZSk7XG4gICAgfVxuICB9XG4gIHNldElubmVySFRNTChlbCwgdmFsdWUpIHtcbiAgICB0aGlzLmNsZWFyTm9kZXMoZWwpO1xuICAgIHZhciBjb250ZW50ID0gcGFyc2VyLnBhcnNlRnJhZ21lbnQodmFsdWUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29udGVudC5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0cmVlQWRhcHRlci5hcHBlbmRDaGlsZChlbCwgY29udGVudC5jaGlsZE5vZGVzW2ldKTtcbiAgICB9XG4gIH1cbiAgZ2V0VGV4dChlbCwgaXNSZWN1cnNpdmU/OiBib29sZWFuKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5pc1RleHROb2RlKGVsKSkge1xuICAgICAgcmV0dXJuIGVsLmRhdGE7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQ29tbWVudE5vZGUoZWwpKSB7XG4gICAgICAvLyBJbiB0aGUgRE9NLCBjb21tZW50cyB3aXRoaW4gYW4gZWxlbWVudCByZXR1cm4gYW4gZW1wdHkgc3RyaW5nIGZvciB0ZXh0Q29udGVudFxuICAgICAgLy8gSG93ZXZlciwgY29tbWVudCBub2RlIGluc3RhbmNlcyByZXR1cm4gdGhlIGNvbW1lbnQgY29udGVudCBmb3IgdGV4dENvbnRlbnQgZ2V0dGVyXG4gICAgICByZXR1cm4gaXNSZWN1cnNpdmUgPyAnJyA6IGVsLmRhdGE7XG4gICAgfSBlbHNlIGlmIChpc0JsYW5rKGVsLmNoaWxkTm9kZXMpIHx8IGVsLmNoaWxkTm9kZXMubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRleHRDb250ZW50ID0gJyc7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGV4dENvbnRlbnQgKz0gdGhpcy5nZXRUZXh0KGVsLmNoaWxkTm9kZXNbaV0sIHRydWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRleHRDb250ZW50O1xuICAgIH1cbiAgfVxuICBzZXRUZXh0KGVsLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuaXNUZXh0Tm9kZShlbCkgfHwgdGhpcy5pc0NvbW1lbnROb2RlKGVsKSkge1xuICAgICAgZWwuZGF0YSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsZWFyTm9kZXMoZWwpO1xuICAgICAgaWYgKHZhbHVlICE9PSAnJykgdHJlZUFkYXB0ZXIuaW5zZXJ0VGV4dChlbCwgdmFsdWUpO1xuICAgIH1cbiAgfVxuICBnZXRWYWx1ZShlbCk6IHN0cmluZyB7IHJldHVybiBlbC52YWx1ZTsgfVxuICBzZXRWYWx1ZShlbCwgdmFsdWU6IHN0cmluZykgeyBlbC52YWx1ZSA9IHZhbHVlOyB9XG4gIGdldENoZWNrZWQoZWwpOiBib29sZWFuIHsgcmV0dXJuIGVsLmNoZWNrZWQ7IH1cbiAgc2V0Q2hlY2tlZChlbCwgdmFsdWU6IGJvb2xlYW4pIHsgZWwuY2hlY2tlZCA9IHZhbHVlOyB9XG4gIGNyZWF0ZUNvbW1lbnQodGV4dDogc3RyaW5nKTogQ29tbWVudCB7IHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVDb21tZW50Tm9kZSh0ZXh0KTsgfVxuICBjcmVhdGVUZW1wbGF0ZShodG1sKTogSFRNTEVsZW1lbnQge1xuICAgIHZhciB0ZW1wbGF0ZSA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJywgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLCBbXSk7XG4gICAgdmFyIGNvbnRlbnQgPSBwYXJzZXIucGFyc2VGcmFnbWVudChodG1sKTtcbiAgICB0cmVlQWRhcHRlci5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSwgY29udGVudCk7XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9XG4gIGNyZWF0ZUVsZW1lbnQodGFnTmFtZSk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudCh0YWdOYW1lLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFtdKTtcbiAgfVxuICBjcmVhdGVFbGVtZW50TlMobnMsIHRhZ05hbWUpOiBIVE1MRWxlbWVudCB7IHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KHRhZ05hbWUsIG5zLCBbXSk7IH1cbiAgY3JlYXRlVGV4dE5vZGUodGV4dDogc3RyaW5nKTogVGV4dCB7XG4gICAgdmFyIHQgPSA8YW55PnRoaXMuY3JlYXRlQ29tbWVudCh0ZXh0KTtcbiAgICB0LnR5cGUgPSAndGV4dCc7XG4gICAgcmV0dXJuIHQ7XG4gIH1cbiAgY3JlYXRlU2NyaXB0VGFnKGF0dHJOYW1lOiBzdHJpbmcsIGF0dHJWYWx1ZTogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnc2NyaXB0JywgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLCBbe25hbWU6IGF0dHJOYW1lLCB2YWx1ZTogYXR0clZhbHVlfV0pO1xuICB9XG4gIGNyZWF0ZVN0eWxlRWxlbWVudChjc3M6IHN0cmluZyk6IEhUTUxTdHlsZUVsZW1lbnQge1xuICAgIHZhciBzdHlsZSA9IHRoaXMuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICB0aGlzLnNldFRleHQoc3R5bGUsIGNzcyk7XG4gICAgcmV0dXJuIDxIVE1MU3R5bGVFbGVtZW50PnN0eWxlO1xuICB9XG4gIGNyZWF0ZVNoYWRvd1Jvb3QoZWwpOiBIVE1MRWxlbWVudCB7XG4gICAgZWwuc2hhZG93Um9vdCA9IHRyZWVBZGFwdGVyLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBlbC5zaGFkb3dSb290LnBhcmVudCA9IGVsO1xuICAgIHJldHVybiBlbC5zaGFkb3dSb290O1xuICB9XG4gIGdldFNoYWRvd1Jvb3QoZWwpOiBFbGVtZW50IHsgcmV0dXJuIGVsLnNoYWRvd1Jvb3Q7IH1cbiAgZ2V0SG9zdChlbCk6IHN0cmluZyB7IHJldHVybiBlbC5ob3N0OyB9XG4gIGdldERpc3RyaWJ1dGVkTm9kZXMoZWw6IGFueSk6IE5vZGVbXSB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgnZ2V0RGlzdHJpYnV0ZWROb2RlcycpOyB9XG4gIGNsb25lKG5vZGU6IE5vZGUpOiBOb2RlIHtcbiAgICB2YXIgX3JlY3Vyc2l2ZSA9IChub2RlKSA9PiB7XG4gICAgICB2YXIgbm9kZUNsb25lID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2Yobm9kZSkpO1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiBub2RlKSB7XG4gICAgICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihub2RlLCBwcm9wKTtcbiAgICAgICAgaWYgKGRlc2MgJiYgJ3ZhbHVlJyBpbiBkZXNjICYmIHR5cGVvZiBkZXNjLnZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIG5vZGVDbG9uZVtwcm9wXSA9IG5vZGVbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5vZGVDbG9uZS5wYXJlbnQgPSBudWxsO1xuICAgICAgbm9kZUNsb25lLnByZXYgPSBudWxsO1xuICAgICAgbm9kZUNsb25lLm5leHQgPSBudWxsO1xuICAgICAgbm9kZUNsb25lLmNoaWxkcmVuID0gbnVsbDtcblxuICAgICAgbWFwUHJvcHMuZm9yRWFjaChtYXBOYW1lID0+IHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChub2RlW21hcE5hbWVdKSkge1xuICAgICAgICAgIG5vZGVDbG9uZVttYXBOYW1lXSA9IHt9O1xuICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gbm9kZVttYXBOYW1lXSkge1xuICAgICAgICAgICAgbm9kZUNsb25lW21hcE5hbWVdW3Byb3BdID0gbm9kZVttYXBOYW1lXVtwcm9wXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdmFyIGNOb2RlcyA9IG5vZGUuY2hpbGRyZW47XG4gICAgICBpZiAoY05vZGVzKSB7XG4gICAgICAgIHZhciBjTm9kZXNDbG9uZSA9IG5ldyBBcnJheShjTm9kZXMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgY2hpbGROb2RlID0gY05vZGVzW2ldO1xuICAgICAgICAgIHZhciBjaGlsZE5vZGVDbG9uZSA9IF9yZWN1cnNpdmUoY2hpbGROb2RlKTtcbiAgICAgICAgICBjTm9kZXNDbG9uZVtpXSA9IGNoaWxkTm9kZUNsb25lO1xuICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgY2hpbGROb2RlQ2xvbmUucHJldiA9IGNOb2Rlc0Nsb25lW2kgLSAxXTtcbiAgICAgICAgICAgIGNOb2Rlc0Nsb25lW2kgLSAxXS5uZXh0ID0gY2hpbGROb2RlQ2xvbmU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNoaWxkTm9kZUNsb25lLnBhcmVudCA9IG5vZGVDbG9uZTtcbiAgICAgICAgfVxuICAgICAgICBub2RlQ2xvbmUuY2hpbGRyZW4gPSBjTm9kZXNDbG9uZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlQ2xvbmU7XG4gICAgfTtcbiAgICByZXR1cm4gX3JlY3Vyc2l2ZShub2RlKTtcbiAgfVxuICBnZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50W10ge1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoZWxlbWVudCwgJy4nICsgbmFtZSk7XG4gIH1cbiAgZ2V0RWxlbWVudHNCeVRhZ05hbWUoZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudFtdIHtcbiAgICB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ2dldEVsZW1lbnRzQnlUYWdOYW1lJyk7XG4gIH1cbiAgY2xhc3NMaXN0KGVsZW1lbnQpOiBzdHJpbmdbXSB7XG4gICAgdmFyIGNsYXNzQXR0clZhbHVlID0gbnVsbDtcbiAgICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlicztcbiAgICBpZiAoYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KCdjbGFzcycpKSB7XG4gICAgICBjbGFzc0F0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbJ2NsYXNzJ107XG4gICAgfVxuICAgIHJldHVybiBjbGFzc0F0dHJWYWx1ZSA/IGNsYXNzQXR0clZhbHVlLnRyaW0oKS5zcGxpdCgvXFxzKy9nKSA6IFtdO1xuICB9XG4gIGFkZENsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuY2xhc3NMaXN0KGVsZW1lbnQpO1xuICAgIHZhciBpbmRleCA9IGNsYXNzTGlzdC5pbmRleE9mKGNsYXNzTmFtZSk7XG4gICAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgICBjbGFzc0xpc3QucHVzaChjbGFzc05hbWUpO1xuICAgICAgZWxlbWVudC5hdHRyaWJzWydjbGFzcyddID0gZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc0xpc3Quam9pbignICcpO1xuICAgIH1cbiAgfVxuICByZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykge1xuICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmNsYXNzTGlzdChlbGVtZW50KTtcbiAgICB2YXIgaW5kZXggPSBjbGFzc0xpc3QuaW5kZXhPZihjbGFzc05hbWUpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICBjbGFzc0xpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIGVsZW1lbnQuYXR0cmlic1snY2xhc3MnXSA9IGVsZW1lbnQuY2xhc3NOYW1lID0gY2xhc3NMaXN0LmpvaW4oJyAnKTtcbiAgICB9XG4gIH1cbiAgaGFzQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gTGlzdFdyYXBwZXIuY29udGFpbnModGhpcy5jbGFzc0xpc3QoZWxlbWVudCksIGNsYXNzTmFtZSk7XG4gIH1cbiAgaGFzU3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU6IHN0cmluZyA9IG51bGwpOiBib29sZWFuIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZSkgfHwgJyc7XG4gICAgcmV0dXJuIHN0eWxlVmFsdWUgPyB2YWx1ZSA9PSBzdHlsZVZhbHVlIDogdmFsdWUubGVuZ3RoID4gMDtcbiAgfVxuICAvKiogQGludGVybmFsICovXG4gIF9yZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCkge1xuICAgIHZhciBzdHlsZU1hcCA9IHt9O1xuICAgIHZhciBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJzO1xuICAgIGlmIChhdHRyaWJ1dGVzICYmIGF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoJ3N0eWxlJykpIHtcbiAgICAgIHZhciBzdHlsZUF0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbJ3N0eWxlJ107XG4gICAgICB2YXIgc3R5bGVMaXN0ID0gc3R5bGVBdHRyVmFsdWUuc3BsaXQoLzsrL2cpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHN0eWxlTGlzdFtpXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIGVsZW1zID0gc3R5bGVMaXN0W2ldLnNwbGl0KC86Ky9nKTtcbiAgICAgICAgICBzdHlsZU1hcFtlbGVtc1swXS50cmltKCldID0gZWxlbXNbMV0udHJpbSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHlsZU1hcDtcbiAgfVxuICAvKiogQGludGVybmFsICovXG4gIF93cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQsIHN0eWxlTWFwKSB7XG4gICAgdmFyIHN0eWxlQXR0clZhbHVlID0gJyc7XG4gICAgZm9yICh2YXIga2V5IGluIHN0eWxlTWFwKSB7XG4gICAgICB2YXIgbmV3VmFsdWUgPSBzdHlsZU1hcFtrZXldO1xuICAgICAgaWYgKG5ld1ZhbHVlICYmIG5ld1ZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc3R5bGVBdHRyVmFsdWUgKz0ga2V5ICsgJzonICsgc3R5bGVNYXBba2V5XSArICc7JztcbiAgICAgIH1cbiAgICB9XG4gICAgZWxlbWVudC5hdHRyaWJzWydzdHlsZSddID0gc3R5bGVBdHRyVmFsdWU7XG4gIH1cbiAgc2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU6IHN0cmluZykge1xuICAgIHZhciBzdHlsZU1hcCA9IHRoaXMuX3JlYWRTdHlsZUF0dHJpYnV0ZShlbGVtZW50KTtcbiAgICBzdHlsZU1hcFtzdHlsZU5hbWVdID0gc3R5bGVWYWx1ZTtcbiAgICB0aGlzLl93cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQsIHN0eWxlTWFwKTtcbiAgfVxuICByZW1vdmVTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZykgeyB0aGlzLnNldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZSwgbnVsbCk7IH1cbiAgZ2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBzdHlsZU1hcCA9IHRoaXMuX3JlYWRTdHlsZUF0dHJpYnV0ZShlbGVtZW50KTtcbiAgICByZXR1cm4gc3R5bGVNYXAuaGFzT3duUHJvcGVydHkoc3R5bGVOYW1lKSA/IHN0eWxlTWFwW3N0eWxlTmFtZV0gOiAnJztcbiAgfVxuICB0YWdOYW1lKGVsZW1lbnQpOiBzdHJpbmcgeyByZXR1cm4gZWxlbWVudC50YWdOYW1lID09ICdzdHlsZScgPyAnU1RZTEUnIDogZWxlbWVudC50YWdOYW1lOyB9XG4gIGF0dHJpYnV0ZU1hcChlbGVtZW50KTogTWFwPHN0cmluZywgc3RyaW5nPiB7XG4gICAgdmFyIHJlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgdmFyIGVsQXR0cnMgPSB0cmVlQWRhcHRlci5nZXRBdHRyTGlzdChlbGVtZW50KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsQXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhdHRyaWIgPSBlbEF0dHJzW2ldO1xuICAgICAgcmVzLnNldChhdHRyaWIubmFtZSwgYXR0cmliLnZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBoYXNBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZWxlbWVudC5hdHRyaWJzICYmIGVsZW1lbnQuYXR0cmlicy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGUpO1xuICB9XG4gIGhhc0F0dHJpYnV0ZU5TKGVsZW1lbnQsIG5zOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nKTogYm9vbGVhbiB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIGdldEF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGVsZW1lbnQuYXR0cmlicyAmJiBlbGVtZW50LmF0dHJpYnMuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlKSA/XG4gICAgICAgIGVsZW1lbnQuYXR0cmlic1thdHRyaWJ1dGVdIDpcbiAgICAgICAgbnVsbDtcbiAgfVxuICBnZXRBdHRyaWJ1dGVOUyhlbGVtZW50LCBuczogc3RyaW5nLCBhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHNldEF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgIGVsZW1lbnQuYXR0cmlic1thdHRyaWJ1dGVdID0gdmFsdWU7XG4gICAgICBpZiAoYXR0cmlidXRlID09PSAnY2xhc3MnKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHNldEF0dHJpYnV0ZU5TKGVsZW1lbnQsIG5zOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHJlbW92ZUF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZykge1xuICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZGVsZXRlKGVsZW1lbnQuYXR0cmlicywgYXR0cmlidXRlKTtcbiAgICB9XG4gIH1cbiAgcmVtb3ZlQXR0cmlidXRlTlMoZWxlbWVudCwgbnM6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHRlbXBsYXRlQXdhcmVSb290KGVsKTogYW55IHsgcmV0dXJuIHRoaXMuaXNUZW1wbGF0ZUVsZW1lbnQoZWwpID8gdGhpcy5jb250ZW50KGVsKSA6IGVsOyB9XG4gIGNyZWF0ZUh0bWxEb2N1bWVudCgpOiBEb2N1bWVudCB7XG4gICAgdmFyIG5ld0RvYyA9IHRyZWVBZGFwdGVyLmNyZWF0ZURvY3VtZW50KCk7XG4gICAgbmV3RG9jLnRpdGxlID0gJ2Zha2UgdGl0bGUnO1xuICAgIHZhciBoZWFkID0gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudCgnaGVhZCcsIG51bGwsIFtdKTtcbiAgICB2YXIgYm9keSA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoJ2JvZHknLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFtdKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKG5ld0RvYywgaGVhZCk7XG4gICAgdGhpcy5hcHBlbmRDaGlsZChuZXdEb2MsIGJvZHkpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgJ2hlYWQnLCBoZWFkKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChuZXdEb2MsICdib2R5JywgYm9keSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQobmV3RG9jLCAnX3dpbmRvdycsIFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCkpO1xuICAgIHJldHVybiBuZXdEb2M7XG4gIH1cbiAgZGVmYXVsdERvYygpOiBEb2N1bWVudCB7XG4gICAgaWYgKGRlZkRvYyA9PT0gbnVsbCkge1xuICAgICAgZGVmRG9jID0gdGhpcy5jcmVhdGVIdG1sRG9jdW1lbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZkRvYztcbiAgfVxuICBnZXRCb3VuZGluZ0NsaWVudFJlY3QoZWwpOiBhbnkgeyByZXR1cm4ge2xlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IDAsIGhlaWdodDogMH07IH1cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZGVmYXVsdERvYygpLnRpdGxlIHx8ICcnOyB9XG4gIHNldFRpdGxlKG5ld1RpdGxlOiBzdHJpbmcpIHsgdGhpcy5kZWZhdWx0RG9jKCkudGl0bGUgPSBuZXdUaXRsZTsgfVxuICBpc1RlbXBsYXRlRWxlbWVudChlbDogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNFbGVtZW50Tm9kZShlbCkgJiYgdGhpcy50YWdOYW1lKGVsKSA9PT0gJ3RlbXBsYXRlJztcbiAgfVxuICBpc1RleHROb2RlKG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIHRyZWVBZGFwdGVyLmlzVGV4dE5vZGUobm9kZSk7IH1cbiAgaXNDb21tZW50Tm9kZShub2RlKTogYm9vbGVhbiB7IHJldHVybiB0cmVlQWRhcHRlci5pc0NvbW1lbnROb2RlKG5vZGUpOyB9XG4gIGlzRWxlbWVudE5vZGUobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gbm9kZSA/IHRyZWVBZGFwdGVyLmlzRWxlbWVudE5vZGUobm9kZSkgOiBmYWxzZTsgfVxuICBoYXNTaGFkb3dSb290KG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudChub2RlLnNoYWRvd1Jvb3QpOyB9XG4gIGlzU2hhZG93Um9vdChub2RlKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldFNoYWRvd1Jvb3Qobm9kZSkgPT0gbm9kZTsgfVxuICBpbXBvcnRJbnRvRG9jKG5vZGUpOiBhbnkgeyByZXR1cm4gdGhpcy5jbG9uZShub2RlKTsgfVxuICBhZG9wdE5vZGUobm9kZSk6IGFueSB7IHJldHVybiBub2RlOyB9XG4gIGdldEhyZWYoZWwpOiBzdHJpbmcgeyByZXR1cm4gZWwuaHJlZjsgfVxuICByZXNvbHZlQW5kU2V0SHJlZihlbCwgYmFzZVVybDogc3RyaW5nLCBocmVmOiBzdHJpbmcpIHtcbiAgICBpZiAoaHJlZiA9PSBudWxsKSB7XG4gICAgICBlbC5ocmVmID0gYmFzZVVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuaHJlZiA9IGJhc2VVcmwgKyAnLy4uLycgKyBocmVmO1xuICAgIH1cbiAgfVxuICAvKiogQGludGVybmFsICovXG4gIF9idWlsZFJ1bGVzKHBhcnNlZFJ1bGVzLCBjc3M/KSB7XG4gICAgdmFyIHJ1bGVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJzZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBhcnNlZFJ1bGUgPSBwYXJzZWRSdWxlc1tpXTtcbiAgICAgIHZhciBydWxlOiB7W2tleTogc3RyaW5nXTogYW55fSA9IFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCk7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCAnY3NzVGV4dCcsIGNzcyk7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCAnc3R5bGUnLCB7Y29udGVudDogJycsIGNzc1RleHQ6ICcnfSk7XG4gICAgICBpZiAocGFyc2VkUnVsZS50eXBlID09ICdydWxlJykge1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCAndHlwZScsIDEpO1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChcbiAgICAgICAgICAgIHJ1bGUsICdzZWxlY3RvclRleHQnLCBwYXJzZWRSdWxlLnNlbGVjdG9ycy5qb2luKCcsICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHN7Mix9L2csICcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccyp+XFxzKi9nLCAnIH4gJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccypcXCtcXHMqL2csICcgKyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKj5cXHMqL2csICcgPiAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxbKFxcdyspPShcXHcrKVxcXS9nLCAnWyQxPVwiJDJcIl0nKSk7XG4gICAgICAgIGlmIChpc0JsYW5rKHBhcnNlZFJ1bGUuZGVjbGFyYXRpb25zKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFyc2VkUnVsZS5kZWNsYXJhdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICB2YXIgZGVjbGFyYXRpb24gPSBwYXJzZWRSdWxlLmRlY2xhcmF0aW9uc1tqXTtcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChcbiAgICAgICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5nZXQocnVsZSwgJ3N0eWxlJyksIGRlY2xhcmF0aW9uLnByb3BlcnR5LCBkZWNsYXJhdGlvbi52YWx1ZSk7XG4gICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5nZXQocnVsZSwgJ3N0eWxlJykuY3NzVGV4dCArPVxuICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5wcm9wZXJ0eSArICc6ICcgKyBkZWNsYXJhdGlvbi52YWx1ZSArICc7JztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZWRSdWxlLnR5cGUgPT0gJ21lZGlhJykge1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCAndHlwZScsIDQpO1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCAnbWVkaWEnLCB7bWVkaWFUZXh0OiBwYXJzZWRSdWxlLm1lZGlhfSk7XG4gICAgICAgIGlmIChwYXJzZWRSdWxlLnJ1bGVzKSB7XG4gICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgJ2Nzc1J1bGVzJywgdGhpcy5fYnVpbGRSdWxlcyhwYXJzZWRSdWxlLnJ1bGVzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJ1bGVzLnB1c2gocnVsZSk7XG4gICAgfVxuICAgIHJldHVybiBydWxlcztcbiAgfVxuICBzdXBwb3J0c0RPTUV2ZW50cygpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHN1cHBvcnRzTmF0aXZlU2hhZG93RE9NKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgZ2V0R2xvYmFsRXZlbnRUYXJnZXQodGFyZ2V0OiBzdHJpbmcpOiBhbnkge1xuICAgIGlmICh0YXJnZXQgPT0gJ3dpbmRvdycpIHtcbiAgICAgIHJldHVybiAoPGFueT50aGlzLmRlZmF1bHREb2MoKSkuX3dpbmRvdztcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PSAnZG9jdW1lbnQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZhdWx0RG9jKCk7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT0gJ2JvZHknKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZhdWx0RG9jKCkuYm9keTtcbiAgICB9XG4gIH1cbiAgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgcmVzZXRCYXNlRWxlbWVudCgpOiB2b2lkIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgZ2V0SGlzdG9yeSgpOiBIaXN0b3J5IHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgZ2V0TG9jYXRpb24oKTogTG9jYXRpb24geyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRVc2VyQWdlbnQoKTogc3RyaW5nIHsgcmV0dXJuICdGYWtlIHVzZXIgYWdlbnQnOyB9XG4gIGdldERhdGEoZWwsIG5hbWU6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShlbCwgJ2RhdGEtJyArIG5hbWUpOyB9XG4gIGdldENvbXB1dGVkU3R5bGUoZWwpOiBhbnkgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBzZXREYXRhKGVsLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5zZXRBdHRyaWJ1dGUoZWwsICdkYXRhLScgKyBuYW1lLCB2YWx1ZSk7IH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBtb3ZlIHRoaXMgaW50byBhIHNlcGFyYXRlIGVudmlyb25tZW50IGNsYXNzIG9uY2Ugd2UgaGF2ZSBpdFxuICBzZXRHbG9iYWxWYXIocGF0aDogc3RyaW5nLCB2YWx1ZTogYW55KSB7IHNldFZhbHVlT25QYXRoKGdsb2JhbCwgcGF0aCwgdmFsdWUpOyB9XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayk6IG51bWJlciB7IHJldHVybiBzZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTsgfVxuICBjYW5jZWxBbmltYXRpb25GcmFtZShpZDogbnVtYmVyKSB7IGNsZWFyVGltZW91dChpZCk7IH1cbiAgcGVyZm9ybWFuY2VOb3coKTogbnVtYmVyIHsgcmV0dXJuIERhdGVXcmFwcGVyLnRvTWlsbGlzKERhdGVXcmFwcGVyLm5vdygpKTsgfVxuICBnZXRBbmltYXRpb25QcmVmaXgoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG4gIGdldFRyYW5zaXRpb25FbmQoKTogc3RyaW5nIHsgcmV0dXJuICd0cmFuc2l0aW9uZW5kJzsgfVxuICBzdXBwb3J0c0FuaW1hdGlvbigpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICByZXBsYWNlQ2hpbGQoZWwsIG5ld05vZGUsIG9sZE5vZGUpIHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxuICBwYXJzZSh0ZW1wbGF0ZUh0bWw6IHN0cmluZykgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG4gIGludm9rZShlbDogRWxlbWVudCwgbWV0aG9kTmFtZTogc3RyaW5nLCBhcmdzOiBhbnlbXSk6IGFueSB7IHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7IH1cbiAgZ2V0RXZlbnRLZXkoZXZlbnQpOiBzdHJpbmcgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG59XG5cbi8vIFRPRE86IGJ1aWxkIGEgcHJvcGVyIGxpc3QsIHRoaXMgb25lIGlzIGFsbCB0aGUga2V5cyBvZiBhIEhUTUxJbnB1dEVsZW1lbnRcbnZhciBfSFRNTEVsZW1lbnRQcm9wZXJ0eUxpc3QgPSBbXG4gICd3ZWJraXRFbnRyaWVzJyxcbiAgJ2luY3JlbWVudGFsJyxcbiAgJ3dlYmtpdGRpcmVjdG9yeScsXG4gICdzZWxlY3Rpb25EaXJlY3Rpb24nLFxuICAnc2VsZWN0aW9uRW5kJyxcbiAgJ3NlbGVjdGlvblN0YXJ0JyxcbiAgJ2xhYmVscycsXG4gICd2YWxpZGF0aW9uTWVzc2FnZScsXG4gICd2YWxpZGl0eScsXG4gICd3aWxsVmFsaWRhdGUnLFxuICAnd2lkdGgnLFxuICAndmFsdWVBc051bWJlcicsXG4gICd2YWx1ZUFzRGF0ZScsXG4gICd2YWx1ZScsXG4gICd1c2VNYXAnLFxuICAnZGVmYXVsdFZhbHVlJyxcbiAgJ3R5cGUnLFxuICAnc3RlcCcsXG4gICdzcmMnLFxuICAnc2l6ZScsXG4gICdyZXF1aXJlZCcsXG4gICdyZWFkT25seScsXG4gICdwbGFjZWhvbGRlcicsXG4gICdwYXR0ZXJuJyxcbiAgJ25hbWUnLFxuICAnbXVsdGlwbGUnLFxuICAnbWluJyxcbiAgJ21pbkxlbmd0aCcsXG4gICdtYXhMZW5ndGgnLFxuICAnbWF4JyxcbiAgJ2xpc3QnLFxuICAnaW5kZXRlcm1pbmF0ZScsXG4gICdoZWlnaHQnLFxuICAnZm9ybVRhcmdldCcsXG4gICdmb3JtTm9WYWxpZGF0ZScsXG4gICdmb3JtTWV0aG9kJyxcbiAgJ2Zvcm1FbmN0eXBlJyxcbiAgJ2Zvcm1BY3Rpb24nLFxuICAnZmlsZXMnLFxuICAnZm9ybScsXG4gICdkaXNhYmxlZCcsXG4gICdkaXJOYW1lJyxcbiAgJ2NoZWNrZWQnLFxuICAnZGVmYXVsdENoZWNrZWQnLFxuICAnYXV0b2ZvY3VzJyxcbiAgJ2F1dG9jb21wbGV0ZScsXG4gICdhbHQnLFxuICAnYWxpZ24nLFxuICAnYWNjZXB0JyxcbiAgJ29uYXV0b2NvbXBsZXRlZXJyb3InLFxuICAnb25hdXRvY29tcGxldGUnLFxuICAnb253YWl0aW5nJyxcbiAgJ29udm9sdW1lY2hhbmdlJyxcbiAgJ29udG9nZ2xlJyxcbiAgJ29udGltZXVwZGF0ZScsXG4gICdvbnN1c3BlbmQnLFxuICAnb25zdWJtaXQnLFxuICAnb25zdGFsbGVkJyxcbiAgJ29uc2hvdycsXG4gICdvbnNlbGVjdCcsXG4gICdvbnNlZWtpbmcnLFxuICAnb25zZWVrZWQnLFxuICAnb25zY3JvbGwnLFxuICAnb25yZXNpemUnLFxuICAnb25yZXNldCcsXG4gICdvbnJhdGVjaGFuZ2UnLFxuICAnb25wcm9ncmVzcycsXG4gICdvbnBsYXlpbmcnLFxuICAnb25wbGF5JyxcbiAgJ29ucGF1c2UnLFxuICAnb25tb3VzZXdoZWVsJyxcbiAgJ29ubW91c2V1cCcsXG4gICdvbm1vdXNlb3ZlcicsXG4gICdvbm1vdXNlb3V0JyxcbiAgJ29ubW91c2Vtb3ZlJyxcbiAgJ29ubW91c2VsZWF2ZScsXG4gICdvbm1vdXNlZW50ZXInLFxuICAnb25tb3VzZWRvd24nLFxuICAnb25sb2Fkc3RhcnQnLFxuICAnb25sb2FkZWRtZXRhZGF0YScsXG4gICdvbmxvYWRlZGRhdGEnLFxuICAnb25sb2FkJyxcbiAgJ29ua2V5dXAnLFxuICAnb25rZXlwcmVzcycsXG4gICdvbmtleWRvd24nLFxuICAnb25pbnZhbGlkJyxcbiAgJ29uaW5wdXQnLFxuICAnb25mb2N1cycsXG4gICdvbmVycm9yJyxcbiAgJ29uZW5kZWQnLFxuICAnb25lbXB0aWVkJyxcbiAgJ29uZHVyYXRpb25jaGFuZ2UnLFxuICAnb25kcm9wJyxcbiAgJ29uZHJhZ3N0YXJ0JyxcbiAgJ29uZHJhZ292ZXInLFxuICAnb25kcmFnbGVhdmUnLFxuICAnb25kcmFnZW50ZXInLFxuICAnb25kcmFnZW5kJyxcbiAgJ29uZHJhZycsXG4gICdvbmRibGNsaWNrJyxcbiAgJ29uY3VlY2hhbmdlJyxcbiAgJ29uY29udGV4dG1lbnUnLFxuICAnb25jbG9zZScsXG4gICdvbmNsaWNrJyxcbiAgJ29uY2hhbmdlJyxcbiAgJ29uY2FucGxheXRocm91Z2gnLFxuICAnb25jYW5wbGF5JyxcbiAgJ29uY2FuY2VsJyxcbiAgJ29uYmx1cicsXG4gICdvbmFib3J0JyxcbiAgJ3NwZWxsY2hlY2snLFxuICAnaXNDb250ZW50RWRpdGFibGUnLFxuICAnY29udGVudEVkaXRhYmxlJyxcbiAgJ291dGVyVGV4dCcsXG4gICdpbm5lclRleHQnLFxuICAnYWNjZXNzS2V5JyxcbiAgJ2hpZGRlbicsXG4gICd3ZWJraXRkcm9wem9uZScsXG4gICdkcmFnZ2FibGUnLFxuICAndGFiSW5kZXgnLFxuICAnZGlyJyxcbiAgJ3RyYW5zbGF0ZScsXG4gICdsYW5nJyxcbiAgJ3RpdGxlJyxcbiAgJ2NoaWxkRWxlbWVudENvdW50JyxcbiAgJ2xhc3RFbGVtZW50Q2hpbGQnLFxuICAnZmlyc3RFbGVtZW50Q2hpbGQnLFxuICAnY2hpbGRyZW4nLFxuICAnb253ZWJraXRmdWxsc2NyZWVuZXJyb3InLFxuICAnb253ZWJraXRmdWxsc2NyZWVuY2hhbmdlJyxcbiAgJ25leHRFbGVtZW50U2libGluZycsXG4gICdwcmV2aW91c0VsZW1lbnRTaWJsaW5nJyxcbiAgJ29ud2hlZWwnLFxuICAnb25zZWxlY3RzdGFydCcsXG4gICdvbnNlYXJjaCcsXG4gICdvbnBhc3RlJyxcbiAgJ29uY3V0JyxcbiAgJ29uY29weScsXG4gICdvbmJlZm9yZXBhc3RlJyxcbiAgJ29uYmVmb3JlY3V0JyxcbiAgJ29uYmVmb3JlY29weScsXG4gICdzaGFkb3dSb290JyxcbiAgJ2RhdGFzZXQnLFxuICAnY2xhc3NMaXN0JyxcbiAgJ2NsYXNzTmFtZScsXG4gICdvdXRlckhUTUwnLFxuICAnaW5uZXJIVE1MJyxcbiAgJ3Njcm9sbEhlaWdodCcsXG4gICdzY3JvbGxXaWR0aCcsXG4gICdzY3JvbGxUb3AnLFxuICAnc2Nyb2xsTGVmdCcsXG4gICdjbGllbnRIZWlnaHQnLFxuICAnY2xpZW50V2lkdGgnLFxuICAnY2xpZW50VG9wJyxcbiAgJ2NsaWVudExlZnQnLFxuICAnb2Zmc2V0UGFyZW50JyxcbiAgJ29mZnNldEhlaWdodCcsXG4gICdvZmZzZXRXaWR0aCcsXG4gICdvZmZzZXRUb3AnLFxuICAnb2Zmc2V0TGVmdCcsXG4gICdsb2NhbE5hbWUnLFxuICAncHJlZml4JyxcbiAgJ25hbWVzcGFjZVVSSScsXG4gICdpZCcsXG4gICdzdHlsZScsXG4gICdhdHRyaWJ1dGVzJyxcbiAgJ3RhZ05hbWUnLFxuICAncGFyZW50RWxlbWVudCcsXG4gICd0ZXh0Q29udGVudCcsXG4gICdiYXNlVVJJJyxcbiAgJ293bmVyRG9jdW1lbnQnLFxuICAnbmV4dFNpYmxpbmcnLFxuICAncHJldmlvdXNTaWJsaW5nJyxcbiAgJ2xhc3RDaGlsZCcsXG4gICdmaXJzdENoaWxkJyxcbiAgJ2NoaWxkTm9kZXMnLFxuICAncGFyZW50Tm9kZScsXG4gICdub2RlVHlwZScsXG4gICdub2RlVmFsdWUnLFxuICAnbm9kZU5hbWUnLFxuICAnY2xvc3VyZV9sbV83MTQ2MTcnLFxuICAnX19qc2FjdGlvbidcbl07XG4iXX0=