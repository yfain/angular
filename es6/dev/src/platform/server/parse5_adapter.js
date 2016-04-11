var parse5 = require('parse5/index');
var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
var serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
var treeAdapter = parser.treeAdapter;
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { DomAdapter, setRootDomAdapter } from 'angular2/platform/common_dom';
import { isPresent, isBlank, global, setValueOnPath, DateWrapper } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { SelectorMatcher, CssSelector } from 'angular2/src/compiler/selector';
import { XHR } from 'angular2/src/compiler/xhr';
var _attrToPropMap = {
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
};
var defDoc = null;
var mapProps = ['attribs', 'x-attribsNamespace', 'x-attribsPrefix'];
function _notImplemented(methodName) {
    return new BaseException('This method is not implemented in Parse5DomAdapter: ' + methodName);
}
/* tslint:disable:requireParameterType */
export class Parse5DomAdapter extends DomAdapter {
    static makeCurrent() { setRootDomAdapter(new Parse5DomAdapter()); }
    hasProperty(element, name) {
        return _HTMLElementPropertyList.indexOf(name) > -1;
    }
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    setProperty(el, name, value) {
        if (name === 'innerHTML') {
            this.setInnerHTML(el, value);
        }
        else if (name === 'className') {
            el.attribs['class'] = el.className = value;
        }
        else {
            el[name] = value;
        }
    }
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    getProperty(el, name) { return el[name]; }
    logError(error) { console.error(error); }
    log(error) { console.log(error); }
    logGroup(error) { console.error(error); }
    logGroupEnd() { }
    getXHR() { return XHR; }
    get attrToPropMap() { return _attrToPropMap; }
    query(selector) { throw _notImplemented('query'); }
    querySelector(el, selector) { return this.querySelectorAll(el, selector)[0]; }
    querySelectorAll(el, selector) {
        var res = [];
        var _recursive = (result, node, selector, matcher) => {
            var cNodes = node.childNodes;
            if (cNodes && cNodes.length > 0) {
                for (var i = 0; i < cNodes.length; i++) {
                    var childNode = cNodes[i];
                    if (this.elementMatches(childNode, selector, matcher)) {
                        result.push(childNode);
                    }
                    _recursive(result, childNode, selector, matcher);
                }
            }
        };
        var matcher = new SelectorMatcher();
        matcher.addSelectables(CssSelector.parse(selector));
        _recursive(res, el, selector, matcher);
        return res;
    }
    elementMatches(node, selector, matcher = null) {
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
                matcher = new SelectorMatcher();
                matcher.addSelectables(CssSelector.parse(selector));
            }
            var cssSelector = new CssSelector();
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
    }
    on(el, evt, listener) {
        var listenersMap = el._eventListenersMap;
        if (isBlank(listenersMap)) {
            var listenersMap = StringMapWrapper.create();
            el._eventListenersMap = listenersMap;
        }
        var listeners = StringMapWrapper.get(listenersMap, evt);
        if (isBlank(listeners)) {
            listeners = [];
        }
        listeners.push(listener);
        StringMapWrapper.set(listenersMap, evt, listeners);
    }
    onAndCancel(el, evt, listener) {
        this.on(el, evt, listener);
        return () => {
            ListWrapper.remove(StringMapWrapper.get(el._eventListenersMap, evt), listener);
        };
    }
    dispatchEvent(el, evt) {
        if (isBlank(evt.target)) {
            evt.target = el;
        }
        if (isPresent(el._eventListenersMap)) {
            var listeners = StringMapWrapper.get(el._eventListenersMap, evt.type);
            if (isPresent(listeners)) {
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i](evt);
                }
            }
        }
        if (isPresent(el.parent)) {
            this.dispatchEvent(el.parent, evt);
        }
        if (isPresent(el._window)) {
            this.dispatchEvent(el._window, evt);
        }
    }
    createMouseEvent(eventType) { return this.createEvent(eventType); }
    createEvent(eventType) {
        var evt = {
            type: eventType,
            defaultPrevented: false,
            preventDefault: () => { evt.defaultPrevented = true; }
        };
        return evt;
    }
    preventDefault(evt) { evt.returnValue = false; }
    isPrevented(evt) { return isPresent(evt.returnValue) && !evt.returnValue; }
    getInnerHTML(el) { return serializer.serialize(this.templateAwareRoot(el)); }
    getOuterHTML(el) {
        serializer.html = '';
        serializer._serializeElement(el);
        return serializer.html;
    }
    nodeName(node) { return node.tagName; }
    nodeValue(node) { return node.nodeValue; }
    type(node) { throw _notImplemented('type'); }
    content(node) { return node.childNodes[0]; }
    firstChild(el) { return el.firstChild; }
    nextSibling(el) { return el.nextSibling; }
    parentElement(el) { return el.parent; }
    childNodes(el) { return el.childNodes; }
    childNodesAsList(el) {
        var childNodes = el.childNodes;
        var res = ListWrapper.createFixedSize(childNodes.length);
        for (var i = 0; i < childNodes.length; i++) {
            res[i] = childNodes[i];
        }
        return res;
    }
    clearNodes(el) {
        while (el.childNodes.length > 0) {
            this.remove(el.childNodes[0]);
        }
    }
    appendChild(el, node) {
        this.remove(node);
        treeAdapter.appendChild(this.templateAwareRoot(el), node);
    }
    removeChild(el, node) {
        if (ListWrapper.contains(el.childNodes, node)) {
            this.remove(node);
        }
    }
    remove(el) {
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
    }
    insertBefore(el, node) {
        this.remove(node);
        treeAdapter.insertBefore(el.parent, node, el);
    }
    insertAllBefore(el, nodes) { nodes.forEach(n => this.insertBefore(el, n)); }
    insertAfter(el, node) {
        if (el.nextSibling) {
            this.insertBefore(el.nextSibling, node);
        }
        else {
            this.appendChild(el.parent, node);
        }
    }
    setInnerHTML(el, value) {
        this.clearNodes(el);
        var content = parser.parseFragment(value);
        for (var i = 0; i < content.childNodes.length; i++) {
            treeAdapter.appendChild(el, content.childNodes[i]);
        }
    }
    getText(el, isRecursive) {
        if (this.isTextNode(el)) {
            return el.data;
        }
        else if (this.isCommentNode(el)) {
            // In the DOM, comments within an element return an empty string for textContent
            // However, comment node instances return the comment content for textContent getter
            return isRecursive ? '' : el.data;
        }
        else if (isBlank(el.childNodes) || el.childNodes.length == 0) {
            return '';
        }
        else {
            var textContent = '';
            for (var i = 0; i < el.childNodes.length; i++) {
                textContent += this.getText(el.childNodes[i], true);
            }
            return textContent;
        }
    }
    setText(el, value) {
        if (this.isTextNode(el) || this.isCommentNode(el)) {
            el.data = value;
        }
        else {
            this.clearNodes(el);
            if (value !== '')
                treeAdapter.insertText(el, value);
        }
    }
    getValue(el) { return el.value; }
    setValue(el, value) { el.value = value; }
    getChecked(el) { return el.checked; }
    setChecked(el, value) { el.checked = value; }
    createComment(text) { return treeAdapter.createCommentNode(text); }
    createTemplate(html) {
        var template = treeAdapter.createElement('template', 'http://www.w3.org/1999/xhtml', []);
        var content = parser.parseFragment(html);
        treeAdapter.appendChild(template, content);
        return template;
    }
    createElement(tagName) {
        return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
    }
    createElementNS(ns, tagName) { return treeAdapter.createElement(tagName, ns, []); }
    createTextNode(text) {
        var t = this.createComment(text);
        t.type = 'text';
        return t;
    }
    createScriptTag(attrName, attrValue) {
        return treeAdapter.createElement('script', 'http://www.w3.org/1999/xhtml', [{ name: attrName, value: attrValue }]);
    }
    createStyleElement(css) {
        var style = this.createElement('style');
        this.setText(style, css);
        return style;
    }
    createShadowRoot(el) {
        el.shadowRoot = treeAdapter.createDocumentFragment();
        el.shadowRoot.parent = el;
        return el.shadowRoot;
    }
    getShadowRoot(el) { return el.shadowRoot; }
    getHost(el) { return el.host; }
    getDistributedNodes(el) { throw _notImplemented('getDistributedNodes'); }
    clone(node) {
        var _recursive = (node) => {
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
            mapProps.forEach(mapName => {
                if (isPresent(node[mapName])) {
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
    }
    getElementsByClassName(element, name) {
        return this.querySelectorAll(element, '.' + name);
    }
    getElementsByTagName(element, name) {
        throw _notImplemented('getElementsByTagName');
    }
    classList(element) {
        var classAttrValue = null;
        var attributes = element.attribs;
        if (attributes && attributes.hasOwnProperty('class')) {
            classAttrValue = attributes['class'];
        }
        return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
    }
    addClass(element, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index == -1) {
            classList.push(className);
            element.attribs['class'] = element.className = classList.join(' ');
        }
    }
    removeClass(element, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index > -1) {
            classList.splice(index, 1);
            element.attribs['class'] = element.className = classList.join(' ');
        }
    }
    hasClass(element, className) {
        return ListWrapper.contains(this.classList(element), className);
    }
    hasStyle(element, styleName, styleValue = null) {
        var value = this.getStyle(element, styleName) || '';
        return styleValue ? value == styleValue : value.length > 0;
    }
    /** @internal */
    _readStyleAttribute(element) {
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
    }
    /** @internal */
    _writeStyleAttribute(element, styleMap) {
        var styleAttrValue = '';
        for (var key in styleMap) {
            var newValue = styleMap[key];
            if (newValue && newValue.length > 0) {
                styleAttrValue += key + ':' + styleMap[key] + ';';
            }
        }
        element.attribs['style'] = styleAttrValue;
    }
    setStyle(element, styleName, styleValue) {
        var styleMap = this._readStyleAttribute(element);
        styleMap[styleName] = styleValue;
        this._writeStyleAttribute(element, styleMap);
    }
    removeStyle(element, styleName) { this.setStyle(element, styleName, null); }
    getStyle(element, styleName) {
        var styleMap = this._readStyleAttribute(element);
        return styleMap.hasOwnProperty(styleName) ? styleMap[styleName] : '';
    }
    tagName(element) { return element.tagName == 'style' ? 'STYLE' : element.tagName; }
    attributeMap(element) {
        var res = new Map();
        var elAttrs = treeAdapter.getAttrList(element);
        for (var i = 0; i < elAttrs.length; i++) {
            var attrib = elAttrs[i];
            res.set(attrib.name, attrib.value);
        }
        return res;
    }
    hasAttribute(element, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute);
    }
    hasAttributeNS(element, ns, attribute) { throw 'not implemented'; }
    getAttribute(element, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute) ?
            element.attribs[attribute] :
            null;
    }
    getAttributeNS(element, ns, attribute) { throw 'not implemented'; }
    setAttribute(element, attribute, value) {
        if (attribute) {
            element.attribs[attribute] = value;
            if (attribute === 'class') {
                element.className = value;
            }
        }
    }
    setAttributeNS(element, ns, attribute, value) { throw 'not implemented'; }
    removeAttribute(element, attribute) {
        if (attribute) {
            StringMapWrapper.delete(element.attribs, attribute);
        }
    }
    removeAttributeNS(element, ns, name) { throw 'not implemented'; }
    templateAwareRoot(el) { return this.isTemplateElement(el) ? this.content(el) : el; }
    createHtmlDocument() {
        var newDoc = treeAdapter.createDocument();
        newDoc.title = 'fake title';
        var head = treeAdapter.createElement('head', null, []);
        var body = treeAdapter.createElement('body', 'http://www.w3.org/1999/xhtml', []);
        this.appendChild(newDoc, head);
        this.appendChild(newDoc, body);
        StringMapWrapper.set(newDoc, 'head', head);
        StringMapWrapper.set(newDoc, 'body', body);
        StringMapWrapper.set(newDoc, '_window', StringMapWrapper.create());
        return newDoc;
    }
    defaultDoc() {
        if (defDoc === null) {
            defDoc = this.createHtmlDocument();
        }
        return defDoc;
    }
    getBoundingClientRect(el) { return { left: 0, top: 0, width: 0, height: 0 }; }
    getTitle() { return this.defaultDoc().title || ''; }
    setTitle(newTitle) { this.defaultDoc().title = newTitle; }
    isTemplateElement(el) {
        return this.isElementNode(el) && this.tagName(el) === 'template';
    }
    isTextNode(node) { return treeAdapter.isTextNode(node); }
    isCommentNode(node) { return treeAdapter.isCommentNode(node); }
    isElementNode(node) { return node ? treeAdapter.isElementNode(node) : false; }
    hasShadowRoot(node) { return isPresent(node.shadowRoot); }
    isShadowRoot(node) { return this.getShadowRoot(node) == node; }
    importIntoDoc(node) { return this.clone(node); }
    adoptNode(node) { return node; }
    getHref(el) { return el.href; }
    resolveAndSetHref(el, baseUrl, href) {
        if (href == null) {
            el.href = baseUrl;
        }
        else {
            el.href = baseUrl + '/../' + href;
        }
    }
    /** @internal */
    _buildRules(parsedRules, css) {
        var rules = [];
        for (var i = 0; i < parsedRules.length; i++) {
            var parsedRule = parsedRules[i];
            var rule = StringMapWrapper.create();
            StringMapWrapper.set(rule, 'cssText', css);
            StringMapWrapper.set(rule, 'style', { content: '', cssText: '' });
            if (parsedRule.type == 'rule') {
                StringMapWrapper.set(rule, 'type', 1);
                StringMapWrapper.set(rule, 'selectorText', parsedRule.selectors.join(', ')
                    .replace(/\s{2,}/g, ' ')
                    .replace(/\s*~\s*/g, ' ~ ')
                    .replace(/\s*\+\s*/g, ' + ')
                    .replace(/\s*>\s*/g, ' > ')
                    .replace(/\[(\w+)=(\w+)\]/g, '[$1="$2"]'));
                if (isBlank(parsedRule.declarations)) {
                    continue;
                }
                for (var j = 0; j < parsedRule.declarations.length; j++) {
                    var declaration = parsedRule.declarations[j];
                    StringMapWrapper.set(StringMapWrapper.get(rule, 'style'), declaration.property, declaration.value);
                    StringMapWrapper.get(rule, 'style').cssText +=
                        declaration.property + ': ' + declaration.value + ';';
                }
            }
            else if (parsedRule.type == 'media') {
                StringMapWrapper.set(rule, 'type', 4);
                StringMapWrapper.set(rule, 'media', { mediaText: parsedRule.media });
                if (parsedRule.rules) {
                    StringMapWrapper.set(rule, 'cssRules', this._buildRules(parsedRule.rules));
                }
            }
            rules.push(rule);
        }
        return rules;
    }
    supportsDOMEvents() { return false; }
    supportsNativeShadowDOM() { return false; }
    getGlobalEventTarget(target) {
        if (target == 'window') {
            return this.defaultDoc()._window;
        }
        else if (target == 'document') {
            return this.defaultDoc();
        }
        else if (target == 'body') {
            return this.defaultDoc().body;
        }
    }
    getBaseHref() { throw 'not implemented'; }
    resetBaseElement() { throw 'not implemented'; }
    getHistory() { throw 'not implemented'; }
    getLocation() { throw 'not implemented'; }
    getUserAgent() { return 'Fake user agent'; }
    getData(el, name) { return this.getAttribute(el, 'data-' + name); }
    getComputedStyle(el) { throw 'not implemented'; }
    setData(el, name, value) { this.setAttribute(el, 'data-' + name, value); }
    // TODO(tbosch): move this into a separate environment class once we have it
    setGlobalVar(path, value) { setValueOnPath(global, path, value); }
    requestAnimationFrame(callback) { return setTimeout(callback, 0); }
    cancelAnimationFrame(id) { clearTimeout(id); }
    performanceNow() { return DateWrapper.toMillis(DateWrapper.now()); }
    getAnimationPrefix() { return ''; }
    getTransitionEnd() { return 'transitionend'; }
    supportsAnimation() { return true; }
    replaceChild(el, newNode, oldNode) { throw new Error('not implemented'); }
    parse(templateHtml) { throw new Error('not implemented'); }
    invoke(el, methodName, args) { throw new Error('not implemented'); }
    getEventKey(event) { throw new Error('not implemented'); }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2U1X2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXczRFJsWEppLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vc2VydmVyL3BhcnNlNV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbIl9ub3RJbXBsZW1lbnRlZCIsIlBhcnNlNURvbUFkYXB0ZXIiLCJQYXJzZTVEb21BZGFwdGVyLm1ha2VDdXJyZW50IiwiUGFyc2U1RG9tQWRhcHRlci5oYXNQcm9wZXJ0eSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0UHJvcGVydHkiLCJQYXJzZTVEb21BZGFwdGVyLmdldFByb3BlcnR5IiwiUGFyc2U1RG9tQWRhcHRlci5sb2dFcnJvciIsIlBhcnNlNURvbUFkYXB0ZXIubG9nIiwiUGFyc2U1RG9tQWRhcHRlci5sb2dHcm91cCIsIlBhcnNlNURvbUFkYXB0ZXIubG9nR3JvdXBFbmQiLCJQYXJzZTVEb21BZGFwdGVyLmdldFhIUiIsIlBhcnNlNURvbUFkYXB0ZXIuYXR0clRvUHJvcE1hcCIsIlBhcnNlNURvbUFkYXB0ZXIucXVlcnkiLCJQYXJzZTVEb21BZGFwdGVyLnF1ZXJ5U2VsZWN0b3IiLCJQYXJzZTVEb21BZGFwdGVyLnF1ZXJ5U2VsZWN0b3JBbGwiLCJQYXJzZTVEb21BZGFwdGVyLmVsZW1lbnRNYXRjaGVzIiwiUGFyc2U1RG9tQWRhcHRlci5vbiIsIlBhcnNlNURvbUFkYXB0ZXIub25BbmRDYW5jZWwiLCJQYXJzZTVEb21BZGFwdGVyLmRpc3BhdGNoRXZlbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZU1vdXNlRXZlbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZUV2ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5wcmV2ZW50RGVmYXVsdCIsIlBhcnNlNURvbUFkYXB0ZXIuaXNQcmV2ZW50ZWQiLCJQYXJzZTVEb21BZGFwdGVyLmdldElubmVySFRNTCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0T3V0ZXJIVE1MIiwiUGFyc2U1RG9tQWRhcHRlci5ub2RlTmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIubm9kZVZhbHVlIiwiUGFyc2U1RG9tQWRhcHRlci50eXBlIiwiUGFyc2U1RG9tQWRhcHRlci5jb250ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5maXJzdENoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5uZXh0U2libGluZyIsIlBhcnNlNURvbUFkYXB0ZXIucGFyZW50RWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuY2hpbGROb2RlcyIsIlBhcnNlNURvbUFkYXB0ZXIuY2hpbGROb2Rlc0FzTGlzdCIsIlBhcnNlNURvbUFkYXB0ZXIuY2xlYXJOb2RlcyIsIlBhcnNlNURvbUFkYXB0ZXIuYXBwZW5kQ2hpbGQiLCJQYXJzZTVEb21BZGFwdGVyLnJlbW92ZUNoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmUiLCJQYXJzZTVEb21BZGFwdGVyLmluc2VydEJlZm9yZSIsIlBhcnNlNURvbUFkYXB0ZXIuaW5zZXJ0QWxsQmVmb3JlIiwiUGFyc2U1RG9tQWRhcHRlci5pbnNlcnRBZnRlciIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0SW5uZXJIVE1MIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRUZXh0IiwiUGFyc2U1RG9tQWRhcHRlci5zZXRUZXh0IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRWYWx1ZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0VmFsdWUiLCJQYXJzZTVEb21BZGFwdGVyLmdldENoZWNrZWQiLCJQYXJzZTVEb21BZGFwdGVyLnNldENoZWNrZWQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZUNvbW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVRlbXBsYXRlIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVFbGVtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVFbGVtZW50TlMiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVRleHROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVTY3JpcHRUYWciLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVN0eWxlRWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlU2hhZG93Um9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0U2hhZG93Um9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0SG9zdCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0RGlzdHJpYnV0ZWROb2RlcyIsIlBhcnNlNURvbUFkYXB0ZXIuY2xvbmUiLCJQYXJzZTVEb21BZGFwdGVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJQYXJzZTVEb21BZGFwdGVyLmdldEVsZW1lbnRzQnlUYWdOYW1lIiwiUGFyc2U1RG9tQWRhcHRlci5jbGFzc0xpc3QiLCJQYXJzZTVEb21BZGFwdGVyLmFkZENsYXNzIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVDbGFzcyIsIlBhcnNlNURvbUFkYXB0ZXIuaGFzQ2xhc3MiLCJQYXJzZTVEb21BZGFwdGVyLmhhc1N0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5fcmVhZFN0eWxlQXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5fd3JpdGVTdHlsZUF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0U3R5bGUiLCJQYXJzZTVEb21BZGFwdGVyLnJlbW92ZVN0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIudGFnTmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIuYXR0cmlidXRlTWFwIiwiUGFyc2U1RG9tQWRhcHRlci5oYXNBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLmhhc0F0dHJpYnV0ZU5TIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLmdldEF0dHJpYnV0ZU5TIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLnNldEF0dHJpYnV0ZU5TIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLnJlbW92ZUF0dHJpYnV0ZU5TIiwiUGFyc2U1RG9tQWRhcHRlci50ZW1wbGF0ZUF3YXJlUm9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlSHRtbERvY3VtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5kZWZhdWx0RG9jIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldFRpdGxlIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRUaXRsZSIsIlBhcnNlNURvbUFkYXB0ZXIuaXNUZW1wbGF0ZUVsZW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmlzVGV4dE5vZGUiLCJQYXJzZTVEb21BZGFwdGVyLmlzQ29tbWVudE5vZGUiLCJQYXJzZTVEb21BZGFwdGVyLmlzRWxlbWVudE5vZGUiLCJQYXJzZTVEb21BZGFwdGVyLmhhc1NoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmlzU2hhZG93Um9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuaW1wb3J0SW50b0RvYyIsIlBhcnNlNURvbUFkYXB0ZXIuYWRvcHROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRIcmVmIiwiUGFyc2U1RG9tQWRhcHRlci5yZXNvbHZlQW5kU2V0SHJlZiIsIlBhcnNlNURvbUFkYXB0ZXIuX2J1aWxkUnVsZXMiLCJQYXJzZTVEb21BZGFwdGVyLnN1cHBvcnRzRE9NRXZlbnRzIiwiUGFyc2U1RG9tQWRhcHRlci5zdXBwb3J0c05hdGl2ZVNoYWRvd0RPTSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0R2xvYmFsRXZlbnRUYXJnZXQiLCJQYXJzZTVEb21BZGFwdGVyLmdldEJhc2VIcmVmIiwiUGFyc2U1RG9tQWRhcHRlci5yZXNldEJhc2VFbGVtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRIaXN0b3J5IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRMb2NhdGlvbiIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0VXNlckFnZW50IiwiUGFyc2U1RG9tQWRhcHRlci5nZXREYXRhIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRDb21wdXRlZFN0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5zZXREYXRhIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRHbG9iYWxWYXIiLCJQYXJzZTVEb21BZGFwdGVyLnJlcXVlc3RBbmltYXRpb25GcmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIuY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJQYXJzZTVEb21BZGFwdGVyLnBlcmZvcm1hbmNlTm93IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRBbmltYXRpb25QcmVmaXgiLCJQYXJzZTVEb21BZGFwdGVyLmdldFRyYW5zaXRpb25FbmQiLCJQYXJzZTVEb21BZGFwdGVyLnN1cHBvcnRzQW5pbWF0aW9uIiwiUGFyc2U1RG9tQWRhcHRlci5yZXBsYWNlQ2hpbGQiLCJQYXJzZTVEb21BZGFwdGVyLnBhcnNlIiwiUGFyc2U1RG9tQWRhcHRlci5pbnZva2UiLCJQYXJzZTVEb21BZGFwdGVyLmdldEV2ZW50S2V5Il0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDeEUsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztPQUU5QixFQUFhLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUNqRixFQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDhCQUE4QjtPQUNuRSxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFRLGNBQWMsRUFBRSxXQUFXLEVBQUMsTUFBTSwwQkFBMEI7T0FDL0YsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsZUFBZSxFQUFF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QSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUMxQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckNBLENBQUNBO1FBQ0RBLElBQUlBLElBQUlBLEdBQUdBLEVBQUVBLENBQUNBLGVBQWVBLENBQUNBO1FBQzlCQSxJQUFJQSxJQUFJQSxHQUFHQSxFQUFFQSxDQUFDQSxXQUFXQSxDQUFDQTtRQUMxQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDVEEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ1RBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNmQSxFQUFFQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNmQSxFQUFFQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDWkEsQ0FBQ0E7SUFDRHBDLFlBQVlBLENBQUNBLEVBQUVBLEVBQUVBLElBQUlBO1FBQ25CcUMsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDbEJBLFdBQVdBLENBQUNBLFlBQVlBLENBQUNBLEVBQUVBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO0lBQ2hEQSxDQUFDQTtJQUNEckMsZUFBZUEsQ0FBQ0EsRUFBRUEsRUFBRUEsS0FBS0EsSUFBSXNDLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENB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S0FBS0EsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzlEQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDL0JBLENBQUNBO1lBQ0hBLENBQUNBO1lBQ0RBLFNBQVNBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBO1lBQ3hCQSxTQUFTQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUN0QkEsU0FBU0EsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDdEJBLFNBQVNBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBO1lBRTFCQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQTtnQkFDdEJBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUM3QkEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7b0JBQ3hCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDL0JBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUNqREEsQ0FBQ0E7Z0JBQ0hBLENBQUNBO1lBQ0hBLENBQUNBLENBQUNBLENBQUNBO1lBQ0hBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO1lBQzNCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDWEEsSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzNDQSxH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V0FBVztJQUNYLFVBQVU7SUFDVixtQkFBbUI7SUFDbkIsWUFBWTtDQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgcGFyc2U1ID0gcmVxdWlyZSgncGFyc2U1L2luZGV4Jyk7XG52YXIgcGFyc2VyID0gbmV3IHBhcnNlNS5QYXJzZXIocGFyc2U1LlRyZWVBZGFwdGVycy5odG1scGFyc2VyMik7XG52YXIgc2VyaWFsaXplciA9IG5ldyBwYXJzZTUuU2VyaWFsaXplcihwYXJzZTUuVHJlZUFkYXB0ZXJzLmh0bWxwYXJzZXIyKTtcbnZhciB0cmVlQWRhcHRlciA9IHBhcnNlci50cmVlQWRhcHRlcjtcblxuaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RG9tQWRhcHRlciwgc2V0Um9vdERvbUFkYXB0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbl9kb20nO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIGdsb2JhbCwgVHlwZSwgc2V0VmFsdWVPblBhdGgsIERhdGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTZWxlY3Rvck1hdGNoZXIsIENzc1NlbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvc2VsZWN0b3InO1xuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuXG52YXIgX2F0dHJUb1Byb3BNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAnY2xhc3MnOiAnY2xhc3NOYW1lJyxcbiAgJ2lubmVySHRtbCc6ICdpbm5lckhUTUwnLFxuICAncmVhZG9ubHknOiAncmVhZE9ubHknLFxuICAndGFiaW5kZXgnOiAndGFiSW5kZXgnLFxufTtcbnZhciBkZWZEb2MgPSBudWxsO1xuXG52YXIgbWFwUHJvcHMgPSBbJ2F0dHJpYnMnLCAneC1hdHRyaWJzTmFtZXNwYWNlJywgJ3gtYXR0cmlic1ByZWZpeCddO1xuXG5mdW5jdGlvbiBfbm90SW1wbGVtZW50ZWQobWV0aG9kTmFtZSkge1xuICByZXR1cm4gbmV3IEJhc2VFeGNlcHRpb24oJ1RoaXMgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZCBpbiBQYXJzZTVEb21BZGFwdGVyOiAnICsgbWV0aG9kTmFtZSk7XG59XG5cbi8qIHRzbGludDpkaXNhYmxlOnJlcXVpcmVQYXJhbWV0ZXJUeXBlICovXG5leHBvcnQgY2xhc3MgUGFyc2U1RG9tQWRhcHRlciBleHRlbmRzIERvbUFkYXB0ZXIge1xuICBzdGF0aWMgbWFrZUN1cnJlbnQoKSB7IHNldFJvb3REb21BZGFwdGVyKG5ldyBQYXJzZTVEb21BZGFwdGVyKCkpOyB9XG5cbiAgaGFzUHJvcGVydHkoZWxlbWVudCwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIF9IVE1MRWxlbWVudFByb3BlcnR5TGlzdC5pbmRleE9mKG5hbWUpID4gLTE7XG4gIH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBkb24ndCBldmVuIGNhbGwgdGhpcyBtZXRob2Qgd2hlbiB3ZSBydW4gdGhlIHRlc3RzIG9uIHNlcnZlciBzaWRlXG4gIC8vIGJ5IG5vdCB1c2luZyB0aGUgRG9tUmVuZGVyZXIgaW4gdGVzdHMuIEtlZXBpbmcgdGhpcyBmb3Igbm93IHRvIG1ha2UgdGVzdHMgaGFwcHkuLi5cbiAgc2V0UHJvcGVydHkoZWw6IC8qZWxlbWVudCovIGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgaWYgKG5hbWUgPT09ICdpbm5lckhUTUwnKSB7XG4gICAgICB0aGlzLnNldElubmVySFRNTChlbCwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ2NsYXNzTmFtZScpIHtcbiAgICAgIGVsLmF0dHJpYnNbJ2NsYXNzJ10gPSBlbC5jbGFzc05hbWUgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBkb24ndCBldmVuIGNhbGwgdGhpcyBtZXRob2Qgd2hlbiB3ZSBydW4gdGhlIHRlc3RzIG9uIHNlcnZlciBzaWRlXG4gIC8vIGJ5IG5vdCB1c2luZyB0aGUgRG9tUmVuZGVyZXIgaW4gdGVzdHMuIEtlZXBpbmcgdGhpcyBmb3Igbm93IHRvIG1ha2UgdGVzdHMgaGFwcHkuLi5cbiAgZ2V0UHJvcGVydHkoZWw6IC8qZWxlbWVudCovIGFueSwgbmFtZTogc3RyaW5nKTogYW55IHsgcmV0dXJuIGVsW25hbWVdOyB9XG5cbiAgbG9nRXJyb3IoZXJyb3IpIHsgY29uc29sZS5lcnJvcihlcnJvcik7IH1cblxuICBsb2coZXJyb3IpIHsgY29uc29sZS5sb2coZXJyb3IpOyB9XG5cbiAgbG9nR3JvdXAoZXJyb3IpIHsgY29uc29sZS5lcnJvcihlcnJvcik7IH1cblxuICBsb2dHcm91cEVuZCgpIHt9XG5cbiAgZ2V0WEhSKCk6IFR5cGUgeyByZXR1cm4gWEhSOyB9XG5cbiAgZ2V0IGF0dHJUb1Byb3BNYXAoKSB7IHJldHVybiBfYXR0clRvUHJvcE1hcDsgfVxuXG4gIHF1ZXJ5KHNlbGVjdG9yKSB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgncXVlcnknKTsgfVxuICBxdWVyeVNlbGVjdG9yKGVsLCBzZWxlY3Rvcjogc3RyaW5nKTogYW55IHsgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChlbCwgc2VsZWN0b3IpWzBdOyB9XG4gIHF1ZXJ5U2VsZWN0b3JBbGwoZWwsIHNlbGVjdG9yOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIHZhciBfcmVjdXJzaXZlID0gKHJlc3VsdCwgbm9kZSwgc2VsZWN0b3IsIG1hdGNoZXIpID0+IHtcbiAgICAgIHZhciBjTm9kZXMgPSBub2RlLmNoaWxkTm9kZXM7XG4gICAgICBpZiAoY05vZGVzICYmIGNOb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY05vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGNoaWxkTm9kZSA9IGNOb2Rlc1tpXTtcbiAgICAgICAgICBpZiAodGhpcy5lbGVtZW50TWF0Y2hlcyhjaGlsZE5vZGUsIHNlbGVjdG9yLCBtYXRjaGVyKSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goY2hpbGROb2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3JlY3Vyc2l2ZShyZXN1bHQsIGNoaWxkTm9kZSwgc2VsZWN0b3IsIG1hdGNoZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgbWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICBtYXRjaGVyLmFkZFNlbGVjdGFibGVzKENzc1NlbGVjdG9yLnBhcnNlKHNlbGVjdG9yKSk7XG4gICAgX3JlY3Vyc2l2ZShyZXMsIGVsLCBzZWxlY3RvciwgbWF0Y2hlcik7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBlbGVtZW50TWF0Y2hlcyhub2RlLCBzZWxlY3Rvcjogc3RyaW5nLCBtYXRjaGVyID0gbnVsbCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmlzRWxlbWVudE5vZGUobm9kZSkgJiYgc2VsZWN0b3IgPT09ICcqJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICBpZiAoc2VsZWN0b3IgJiYgc2VsZWN0b3IuY2hhckF0KDApID09ICcjJykge1xuICAgICAgcmVzdWx0ID0gdGhpcy5nZXRBdHRyaWJ1dGUobm9kZSwgJ2lkJykgPT0gc2VsZWN0b3Iuc3Vic3RyaW5nKDEpO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IpIHtcbiAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICAgIGlmIChtYXRjaGVyID09IG51bGwpIHtcbiAgICAgICAgbWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICAgICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShzZWxlY3RvcikpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3NzU2VsZWN0b3IgPSBuZXcgQ3NzU2VsZWN0b3IoKTtcbiAgICAgIGNzc1NlbGVjdG9yLnNldEVsZW1lbnQodGhpcy50YWdOYW1lKG5vZGUpKTtcbiAgICAgIGlmIChub2RlLmF0dHJpYnMpIHtcbiAgICAgICAgZm9yICh2YXIgYXR0ck5hbWUgaW4gbm9kZS5hdHRyaWJzKSB7XG4gICAgICAgICAgY3NzU2VsZWN0b3IuYWRkQXR0cmlidXRlKGF0dHJOYW1lLCBub2RlLmF0dHJpYnNbYXR0ck5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuY2xhc3NMaXN0KG5vZGUpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY3NzU2VsZWN0b3IuYWRkQ2xhc3NOYW1lKGNsYXNzTGlzdFtpXSk7XG4gICAgICB9XG5cbiAgICAgIG1hdGNoZXIubWF0Y2goY3NzU2VsZWN0b3IsIGZ1bmN0aW9uKHNlbGVjdG9yLCBjYikgeyByZXN1bHQgPSB0cnVlOyB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBvbihlbCwgZXZ0LCBsaXN0ZW5lcikge1xuICAgIHZhciBsaXN0ZW5lcnNNYXA6IHtbazogLyphbnkqLyBzdHJpbmddOiBhbnl9ID0gZWwuX2V2ZW50TGlzdGVuZXJzTWFwO1xuICAgIGlmIChpc0JsYW5rKGxpc3RlbmVyc01hcCkpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnNNYXA6IHtbazogLyphbnkqLyBzdHJpbmddOiBhbnl9ID0gU3RyaW5nTWFwV3JhcHBlci5jcmVhdGUoKTtcbiAgICAgIGVsLl9ldmVudExpc3RlbmVyc01hcCA9IGxpc3RlbmVyc01hcDtcbiAgICB9XG4gICAgdmFyIGxpc3RlbmVycyA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KGxpc3RlbmVyc01hcCwgZXZ0KTtcbiAgICBpZiAoaXNCbGFuayhsaXN0ZW5lcnMpKSB7XG4gICAgICBsaXN0ZW5lcnMgPSBbXTtcbiAgICB9XG4gICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KGxpc3RlbmVyc01hcCwgZXZ0LCBsaXN0ZW5lcnMpO1xuICB9XG4gIG9uQW5kQ2FuY2VsKGVsLCBldnQsIGxpc3RlbmVyKTogRnVuY3Rpb24ge1xuICAgIHRoaXMub24oZWwsIGV2dCwgbGlzdGVuZXIpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBMaXN0V3JhcHBlci5yZW1vdmUoU3RyaW5nTWFwV3JhcHBlci5nZXQ8YW55W10+KGVsLl9ldmVudExpc3RlbmVyc01hcCwgZXZ0KSwgbGlzdGVuZXIpO1xuICAgIH07XG4gIH1cbiAgZGlzcGF0Y2hFdmVudChlbCwgZXZ0KSB7XG4gICAgaWYgKGlzQmxhbmsoZXZ0LnRhcmdldCkpIHtcbiAgICAgIGV2dC50YXJnZXQgPSBlbDtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChlbC5fZXZlbnRMaXN0ZW5lcnNNYXApKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzOiBhbnkgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChlbC5fZXZlbnRMaXN0ZW5lcnNNYXAsIGV2dC50eXBlKTtcbiAgICAgIGlmIChpc1ByZXNlbnQobGlzdGVuZXJzKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxpc3RlbmVyc1tpXShldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoZWwucGFyZW50KSkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGVsLnBhcmVudCwgZXZ0KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChlbC5fd2luZG93KSkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGVsLl93aW5kb3csIGV2dCk7XG4gICAgfVxuICB9XG4gIGNyZWF0ZU1vdXNlRXZlbnQoZXZlbnRUeXBlKTogRXZlbnQgeyByZXR1cm4gdGhpcy5jcmVhdGVFdmVudChldmVudFR5cGUpOyB9XG4gIGNyZWF0ZUV2ZW50KGV2ZW50VHlwZTogc3RyaW5nKTogRXZlbnQge1xuICAgIHZhciBldnQgPSA8RXZlbnQ+e1xuICAgICAgdHlwZTogZXZlbnRUeXBlLFxuICAgICAgZGVmYXVsdFByZXZlbnRlZDogZmFsc2UsXG4gICAgICBwcmV2ZW50RGVmYXVsdDogKCkgPT4geyBldnQuZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7IH1cbiAgICB9O1xuICAgIHJldHVybiBldnQ7XG4gIH1cbiAgcHJldmVudERlZmF1bHQoZXZ0KSB7IGV2dC5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9XG4gIGlzUHJldmVudGVkKGV2dCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KGV2dC5yZXR1cm5WYWx1ZSkgJiYgIWV2dC5yZXR1cm5WYWx1ZTsgfVxuICBnZXRJbm5lckhUTUwoZWwpOiBzdHJpbmcgeyByZXR1cm4gc2VyaWFsaXplci5zZXJpYWxpemUodGhpcy50ZW1wbGF0ZUF3YXJlUm9vdChlbCkpOyB9XG4gIGdldE91dGVySFRNTChlbCk6IHN0cmluZyB7XG4gICAgc2VyaWFsaXplci5odG1sID0gJyc7XG4gICAgc2VyaWFsaXplci5fc2VyaWFsaXplRWxlbWVudChlbCk7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZXIuaHRtbDtcbiAgfVxuICBub2RlTmFtZShub2RlKTogc3RyaW5nIHsgcmV0dXJuIG5vZGUudGFnTmFtZTsgfVxuICBub2RlVmFsdWUobm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLm5vZGVWYWx1ZTsgfVxuICB0eXBlKG5vZGU6IGFueSk6IHN0cmluZyB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgndHlwZScpOyB9XG4gIGNvbnRlbnQobm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLmNoaWxkTm9kZXNbMF07IH1cbiAgZmlyc3RDaGlsZChlbCk6IE5vZGUgeyByZXR1cm4gZWwuZmlyc3RDaGlsZDsgfVxuICBuZXh0U2libGluZyhlbCk6IE5vZGUgeyByZXR1cm4gZWwubmV4dFNpYmxpbmc7IH1cbiAgcGFyZW50RWxlbWVudChlbCk6IE5vZGUgeyByZXR1cm4gZWwucGFyZW50OyB9XG4gIGNoaWxkTm9kZXMoZWwpOiBOb2RlW10geyByZXR1cm4gZWwuY2hpbGROb2RlczsgfVxuICBjaGlsZE5vZGVzQXNMaXN0KGVsKTogYW55W10ge1xuICAgIHZhciBjaGlsZE5vZGVzID0gZWwuY2hpbGROb2RlcztcbiAgICB2YXIgcmVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGNoaWxkTm9kZXMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc1tpXSA9IGNoaWxkTm9kZXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgY2xlYXJOb2RlcyhlbCkge1xuICAgIHdoaWxlIChlbC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVtb3ZlKGVsLmNoaWxkTm9kZXNbMF0pO1xuICAgIH1cbiAgfVxuICBhcHBlbmRDaGlsZChlbCwgbm9kZSkge1xuICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKHRoaXMudGVtcGxhdGVBd2FyZVJvb3QoZWwpLCBub2RlKTtcbiAgfVxuICByZW1vdmVDaGlsZChlbCwgbm9kZSkge1xuICAgIGlmIChMaXN0V3JhcHBlci5jb250YWlucyhlbC5jaGlsZE5vZGVzLCBub2RlKSkge1xuICAgICAgdGhpcy5yZW1vdmUobm9kZSk7XG4gICAgfVxuICB9XG4gIHJlbW92ZShlbCk6IEhUTUxFbGVtZW50IHtcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50O1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHZhciBpbmRleCA9IHBhcmVudC5jaGlsZE5vZGVzLmluZGV4T2YoZWwpO1xuICAgICAgcGFyZW50LmNoaWxkTm9kZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgdmFyIHByZXYgPSBlbC5wcmV2aW91c1NpYmxpbmc7XG4gICAgdmFyIG5leHQgPSBlbC5uZXh0U2libGluZztcbiAgICBpZiAocHJldikge1xuICAgICAgcHJldi5uZXh0ID0gbmV4dDtcbiAgICB9XG4gICAgaWYgKG5leHQpIHtcbiAgICAgIG5leHQucHJldiA9IHByZXY7XG4gICAgfVxuICAgIGVsLnByZXYgPSBudWxsO1xuICAgIGVsLm5leHQgPSBudWxsO1xuICAgIGVsLnBhcmVudCA9IG51bGw7XG4gICAgcmV0dXJuIGVsO1xuICB9XG4gIGluc2VydEJlZm9yZShlbCwgbm9kZSkge1xuICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgIHRyZWVBZGFwdGVyLmluc2VydEJlZm9yZShlbC5wYXJlbnQsIG5vZGUsIGVsKTtcbiAgfVxuICBpbnNlcnRBbGxCZWZvcmUoZWwsIG5vZGVzKSB7IG5vZGVzLmZvckVhY2gobiA9PiB0aGlzLmluc2VydEJlZm9yZShlbCwgbikpOyB9XG4gIGluc2VydEFmdGVyKGVsLCBub2RlKSB7XG4gICAgaWYgKGVsLm5leHRTaWJsaW5nKSB7XG4gICAgICB0aGlzLmluc2VydEJlZm9yZShlbC5uZXh0U2libGluZywgbm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoZWwucGFyZW50LCBub2RlKTtcbiAgICB9XG4gIH1cbiAgc2V0SW5uZXJIVE1MKGVsLCB2YWx1ZSkge1xuICAgIHRoaXMuY2xlYXJOb2RlcyhlbCk7XG4gICAgdmFyIGNvbnRlbnQgPSBwYXJzZXIucGFyc2VGcmFnbWVudCh2YWx1ZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250ZW50LmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKGVsLCBjb250ZW50LmNoaWxkTm9kZXNbaV0pO1xuICAgIH1cbiAgfVxuICBnZXRUZXh0KGVsLCBpc1JlY3Vyc2l2ZT86IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmlzVGV4dE5vZGUoZWwpKSB7XG4gICAgICByZXR1cm4gZWwuZGF0YTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNDb21tZW50Tm9kZShlbCkpIHtcbiAgICAgIC8vIEluIHRoZSBET00sIGNvbW1lbnRzIHdpdGhpbiBhbiBlbGVtZW50IHJldHVybiBhbiBlbXB0eSBzdHJpbmcgZm9yIHRleHRDb250ZW50XG4gICAgICAvLyBIb3dldmVyLCBjb21tZW50IG5vZGUgaW5zdGFuY2VzIHJldHVybiB0aGUgY29tbWVudCBjb250ZW50IGZvciB0ZXh0Q29udGVudCBnZXR0ZXJcbiAgICAgIHJldHVybiBpc1JlY3Vyc2l2ZSA/ICcnIDogZWwuZGF0YTtcbiAgICB9IGVsc2UgaWYgKGlzQmxhbmsoZWwuY2hpbGROb2RlcykgfHwgZWwuY2hpbGROb2Rlcy5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdGV4dENvbnRlbnQgPSAnJztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWwuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0ZXh0Q29udGVudCArPSB0aGlzLmdldFRleHQoZWwuY2hpbGROb2Rlc1tpXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGV4dENvbnRlbnQ7XG4gICAgfVxuICB9XG4gIHNldFRleHQoZWwsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5pc1RleHROb2RlKGVsKSB8fCB0aGlzLmlzQ29tbWVudE5vZGUoZWwpKSB7XG4gICAgICBlbC5kYXRhID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2xlYXJOb2RlcyhlbCk7XG4gICAgICBpZiAodmFsdWUgIT09ICcnKSB0cmVlQWRhcHRlci5pbnNlcnRUZXh0KGVsLCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGdldFZhbHVlKGVsKTogc3RyaW5nIHsgcmV0dXJuIGVsLnZhbHVlOyB9XG4gIHNldFZhbHVlKGVsLCB2YWx1ZTogc3RyaW5nKSB7IGVsLnZhbHVlID0gdmFsdWU7IH1cbiAgZ2V0Q2hlY2tlZChlbCk6IGJvb2xlYW4geyByZXR1cm4gZWwuY2hlY2tlZDsgfVxuICBzZXRDaGVja2VkKGVsLCB2YWx1ZTogYm9vbGVhbikgeyBlbC5jaGVja2VkID0gdmFsdWU7IH1cbiAgY3JlYXRlQ29tbWVudCh0ZXh0OiBzdHJpbmcpOiBDb21tZW50IHsgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUNvbW1lbnROb2RlKHRleHQpOyB9XG4gIGNyZWF0ZVRlbXBsYXRlKGh0bWwpOiBIVE1MRWxlbWVudCB7XG4gICAgdmFyIHRlbXBsYXRlID0gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFtdKTtcbiAgICB2YXIgY29udGVudCA9IHBhcnNlci5wYXJzZUZyYWdtZW50KGh0bWwpO1xuICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKHRlbXBsYXRlLCBjb250ZW50KTtcbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH1cbiAgY3JlYXRlRWxlbWVudCh0YWdOYW1lKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KHRhZ05hbWUsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgW10pO1xuICB9XG4gIGNyZWF0ZUVsZW1lbnROUyhucywgdGFnTmFtZSk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgbnMsIFtdKTsgfVxuICBjcmVhdGVUZXh0Tm9kZSh0ZXh0OiBzdHJpbmcpOiBUZXh0IHtcbiAgICB2YXIgdCA9IDxhbnk+dGhpcy5jcmVhdGVDb21tZW50KHRleHQpO1xuICAgIHQudHlwZSA9ICd0ZXh0JztcbiAgICByZXR1cm4gdDtcbiAgfVxuICBjcmVhdGVTY3JpcHRUYWcoYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICdzY3JpcHQnLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFt7bmFtZTogYXR0ck5hbWUsIHZhbHVlOiBhdHRyVmFsdWV9XSk7XG4gIH1cbiAgY3JlYXRlU3R5bGVFbGVtZW50KGNzczogc3RyaW5nKTogSFRNTFN0eWxlRWxlbWVudCB7XG4gICAgdmFyIHN0eWxlID0gdGhpcy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHRoaXMuc2V0VGV4dChzdHlsZSwgY3NzKTtcbiAgICByZXR1cm4gPEhUTUxTdHlsZUVsZW1lbnQ+c3R5bGU7XG4gIH1cbiAgY3JlYXRlU2hhZG93Um9vdChlbCk6IEhUTUxFbGVtZW50IHtcbiAgICBlbC5zaGFkb3dSb290ID0gdHJlZUFkYXB0ZXIuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGVsLnNoYWRvd1Jvb3QucGFyZW50ID0gZWw7XG4gICAgcmV0dXJuIGVsLnNoYWRvd1Jvb3Q7XG4gIH1cbiAgZ2V0U2hhZG93Um9vdChlbCk6IEVsZW1lbnQgeyByZXR1cm4gZWwuc2hhZG93Um9vdDsgfVxuICBnZXRIb3N0KGVsKTogc3RyaW5nIHsgcmV0dXJuIGVsLmhvc3Q7IH1cbiAgZ2V0RGlzdHJpYnV0ZWROb2RlcyhlbDogYW55KTogTm9kZVtdIHsgdGhyb3cgX25vdEltcGxlbWVudGVkKCdnZXREaXN0cmlidXRlZE5vZGVzJyk7IH1cbiAgY2xvbmUobm9kZTogTm9kZSk6IE5vZGUge1xuICAgIHZhciBfcmVjdXJzaXZlID0gKG5vZGUpID0+IHtcbiAgICAgIHZhciBub2RlQ2xvbmUgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZihub2RlKSk7XG4gICAgICBmb3IgKHZhciBwcm9wIGluIG5vZGUpIHtcbiAgICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5vZGUsIHByb3ApO1xuICAgICAgICBpZiAoZGVzYyAmJiAndmFsdWUnIGluIGRlc2MgJiYgdHlwZW9mIGRlc2MudmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgbm9kZUNsb25lW3Byb3BdID0gbm9kZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9kZUNsb25lLnBhcmVudCA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUucHJldiA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUubmV4dCA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUuY2hpbGRyZW4gPSBudWxsO1xuXG4gICAgICBtYXBQcm9wcy5mb3JFYWNoKG1hcE5hbWUgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KG5vZGVbbWFwTmFtZV0pKSB7XG4gICAgICAgICAgbm9kZUNsb25lW21hcE5hbWVdID0ge307XG4gICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBub2RlW21hcE5hbWVdKSB7XG4gICAgICAgICAgICBub2RlQ2xvbmVbbWFwTmFtZV1bcHJvcF0gPSBub2RlW21hcE5hbWVdW3Byb3BdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXIgY05vZGVzID0gbm9kZS5jaGlsZHJlbjtcbiAgICAgIGlmIChjTm9kZXMpIHtcbiAgICAgICAgdmFyIGNOb2Rlc0Nsb25lID0gbmV3IEFycmF5KGNOb2Rlcy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBjTm9kZXNbaV07XG4gICAgICAgICAgdmFyIGNoaWxkTm9kZUNsb25lID0gX3JlY3Vyc2l2ZShjaGlsZE5vZGUpO1xuICAgICAgICAgIGNOb2Rlc0Nsb25lW2ldID0gY2hpbGROb2RlQ2xvbmU7XG4gICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICBjaGlsZE5vZGVDbG9uZS5wcmV2ID0gY05vZGVzQ2xvbmVbaSAtIDFdO1xuICAgICAgICAgICAgY05vZGVzQ2xvbmVbaSAtIDFdLm5leHQgPSBjaGlsZE5vZGVDbG9uZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2hpbGROb2RlQ2xvbmUucGFyZW50ID0gbm9kZUNsb25lO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVDbG9uZS5jaGlsZHJlbiA9IGNOb2Rlc0Nsb25lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGVDbG9uZTtcbiAgICB9O1xuICAgIHJldHVybiBfcmVjdXJzaXZlKG5vZGUpO1xuICB9XG4gIGdldEVsZW1lbnRzQnlDbGFzc05hbWUoZWxlbWVudCwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChlbGVtZW50LCAnLicgKyBuYW1lKTtcbiAgfVxuICBnZXRFbGVtZW50c0J5VGFnTmFtZShlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50W10ge1xuICAgIHRocm93IF9ub3RJbXBsZW1lbnRlZCgnZ2V0RWxlbWVudHNCeVRhZ05hbWUnKTtcbiAgfVxuICBjbGFzc0xpc3QoZWxlbWVudCk6IHN0cmluZ1tdIHtcbiAgICB2YXIgY2xhc3NBdHRyVmFsdWUgPSBudWxsO1xuICAgIHZhciBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJzO1xuICAgIGlmIChhdHRyaWJ1dGVzICYmIGF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoJ2NsYXNzJykpIHtcbiAgICAgIGNsYXNzQXR0clZhbHVlID0gYXR0cmlidXRlc1snY2xhc3MnXTtcbiAgICB9XG4gICAgcmV0dXJuIGNsYXNzQXR0clZhbHVlID8gY2xhc3NBdHRyVmFsdWUudHJpbSgpLnNwbGl0KC9cXHMrL2cpIDogW107XG4gIH1cbiAgYWRkQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgICB2YXIgY2xhc3NMaXN0ID0gdGhpcy5jbGFzc0xpc3QoZWxlbWVudCk7XG4gICAgdmFyIGluZGV4ID0gY2xhc3NMaXN0LmluZGV4T2YoY2xhc3NOYW1lKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICAgIGNsYXNzTGlzdC5wdXNoKGNsYXNzTmFtZSk7XG4gICAgICBlbGVtZW50LmF0dHJpYnNbJ2NsYXNzJ10gPSBlbGVtZW50LmNsYXNzTmFtZSA9IGNsYXNzTGlzdC5qb2luKCcgJyk7XG4gICAgfVxuICB9XG4gIHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuY2xhc3NMaXN0KGVsZW1lbnQpO1xuICAgIHZhciBpbmRleCA9IGNsYXNzTGlzdC5pbmRleE9mKGNsYXNzTmFtZSk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIGNsYXNzTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgZWxlbWVudC5hdHRyaWJzWydjbGFzcyddID0gZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc0xpc3Quam9pbignICcpO1xuICAgIH1cbiAgfVxuICBoYXNDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLmNsYXNzTGlzdChlbGVtZW50KSwgY2xhc3NOYW1lKTtcbiAgfVxuICBoYXNTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nID0gbnVsbCk6IGJvb2xlYW4ge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lKSB8fCAnJztcbiAgICByZXR1cm4gc3R5bGVWYWx1ZSA/IHZhbHVlID09IHN0eWxlVmFsdWUgOiB2YWx1ZS5sZW5ndGggPiAwO1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlYWRTdHlsZUF0dHJpYnV0ZShlbGVtZW50KSB7XG4gICAgdmFyIHN0eWxlTWFwID0ge307XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBlbGVtZW50LmF0dHJpYnM7XG4gICAgaWYgKGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eSgnc3R5bGUnKSkge1xuICAgICAgdmFyIHN0eWxlQXR0clZhbHVlID0gYXR0cmlidXRlc1snc3R5bGUnXTtcbiAgICAgIHZhciBzdHlsZUxpc3QgPSBzdHlsZUF0dHJWYWx1ZS5zcGxpdCgvOysvZyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc3R5bGVMaXN0W2ldLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgZWxlbXMgPSBzdHlsZUxpc3RbaV0uc3BsaXQoLzorL2cpO1xuICAgICAgICAgIHN0eWxlTWFwW2VsZW1zWzBdLnRyaW0oKV0gPSBlbGVtc1sxXS50cmltKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0eWxlTWFwO1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3dyaXRlU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCwgc3R5bGVNYXApIHtcbiAgICB2YXIgc3R5bGVBdHRyVmFsdWUgPSAnJztcbiAgICBmb3IgKHZhciBrZXkgaW4gc3R5bGVNYXApIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHN0eWxlTWFwW2tleV07XG4gICAgICBpZiAobmV3VmFsdWUgJiYgbmV3VmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICBzdHlsZUF0dHJWYWx1ZSArPSBrZXkgKyAnOicgKyBzdHlsZU1hcFtrZXldICsgJzsnO1xuICAgICAgfVxuICAgIH1cbiAgICBlbGVtZW50LmF0dHJpYnNbJ3N0eWxlJ10gPSBzdHlsZUF0dHJWYWx1ZTtcbiAgfVxuICBzZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nKSB7XG4gICAgdmFyIHN0eWxlTWFwID0gdGhpcy5fcmVhZFN0eWxlQXR0cmlidXRlKGVsZW1lbnQpO1xuICAgIHN0eWxlTWFwW3N0eWxlTmFtZV0gPSBzdHlsZVZhbHVlO1xuICAgIHRoaXMuX3dyaXRlU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCwgc3R5bGVNYXApO1xuICB9XG4gIHJlbW92ZVN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nKSB7IHRoaXMuc2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lLCBudWxsKTsgfVxuICBnZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdmFyIHN0eWxlTWFwID0gdGhpcy5fcmVhZFN0eWxlQXR0cmlidXRlKGVsZW1lbnQpO1xuICAgIHJldHVybiBzdHlsZU1hcC5oYXNPd25Qcm9wZXJ0eShzdHlsZU5hbWUpID8gc3R5bGVNYXBbc3R5bGVOYW1lXSA6ICcnO1xuICB9XG4gIHRhZ05hbWUoZWxlbWVudCk6IHN0cmluZyB7IHJldHVybiBlbGVtZW50LnRhZ05hbWUgPT0gJ3N0eWxlJyA/ICdTVFlMRScgOiBlbGVtZW50LnRhZ05hbWU7IH1cbiAgYXR0cmlidXRlTWFwKGVsZW1lbnQpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICB2YXIgcmVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICB2YXIgZWxBdHRycyA9IHRyZWVBZGFwdGVyLmdldEF0dHJMaXN0KGVsZW1lbnQpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxBdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGF0dHJpYiA9IGVsQXR0cnNbaV07XG4gICAgICByZXMuc2V0KGF0dHJpYi5uYW1lLCBhdHRyaWIudmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIGhhc0F0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlbGVtZW50LmF0dHJpYnMgJiYgZWxlbWVudC5hdHRyaWJzLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZSk7XG4gIH1cbiAgaGFzQXR0cmlidXRlTlMoZWxlbWVudCwgbnM6IHN0cmluZywgYXR0cmlidXRlOiBzdHJpbmcpOiBib29sZWFuIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgZ2V0QXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZWxlbWVudC5hdHRyaWJzICYmIGVsZW1lbnQuYXR0cmlicy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGUpID9cbiAgICAgICAgZWxlbWVudC5hdHRyaWJzW2F0dHJpYnV0ZV0gOlxuICAgICAgICBudWxsO1xuICB9XG4gIGdldEF0dHJpYnV0ZU5TKGVsZW1lbnQsIG5zOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgc2V0QXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKGF0dHJpYnV0ZSkge1xuICAgICAgZWxlbWVudC5hdHRyaWJzW2F0dHJpYnV0ZV0gPSB2YWx1ZTtcbiAgICAgIGlmIChhdHRyaWJ1dGUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgc2V0QXR0cmlidXRlTlMoZWxlbWVudCwgbnM6IHN0cmluZywgYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgcmVtb3ZlQXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgaWYgKGF0dHJpYnV0ZSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5kZWxldGUoZWxlbWVudC5hdHRyaWJzLCBhdHRyaWJ1dGUpO1xuICAgIH1cbiAgfVxuICByZW1vdmVBdHRyaWJ1dGVOUyhlbGVtZW50LCBuczogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgdGVtcGxhdGVBd2FyZVJvb3QoZWwpOiBhbnkgeyByZXR1cm4gdGhpcy5pc1RlbXBsYXRlRWxlbWVudChlbCkgPyB0aGlzLmNvbnRlbnQoZWwpIDogZWw7IH1cbiAgY3JlYXRlSHRtbERvY3VtZW50KCk6IERvY3VtZW50IHtcbiAgICB2YXIgbmV3RG9jID0gdHJlZUFkYXB0ZXIuY3JlYXRlRG9jdW1lbnQoKTtcbiAgICBuZXdEb2MudGl0bGUgPSAnZmFrZSB0aXRsZSc7XG4gICAgdmFyIGhlYWQgPSB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KCdoZWFkJywgbnVsbCwgW10pO1xuICAgIHZhciBib2R5ID0gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudCgnYm9keScsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgW10pO1xuICAgIHRoaXMuYXBwZW5kQ2hpbGQobmV3RG9jLCBoZWFkKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKG5ld0RvYywgYm9keSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQobmV3RG9jLCAnaGVhZCcsIGhlYWQpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgJ2JvZHknLCBib2R5KTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChuZXdEb2MsICdfd2luZG93JywgU3RyaW5nTWFwV3JhcHBlci5jcmVhdGUoKSk7XG4gICAgcmV0dXJuIG5ld0RvYztcbiAgfVxuICBkZWZhdWx0RG9jKCk6IERvY3VtZW50IHtcbiAgICBpZiAoZGVmRG9jID09PSBudWxsKSB7XG4gICAgICBkZWZEb2MgPSB0aGlzLmNyZWF0ZUh0bWxEb2N1bWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gZGVmRG9jO1xuICB9XG4gIGdldEJvdW5kaW5nQ2xpZW50UmVjdChlbCk6IGFueSB7IHJldHVybiB7bGVmdDogMCwgdG9wOiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwfTsgfVxuICBnZXRUaXRsZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5kZWZhdWx0RG9jKCkudGl0bGUgfHwgJyc7IH1cbiAgc2V0VGl0bGUobmV3VGl0bGU6IHN0cmluZykgeyB0aGlzLmRlZmF1bHREb2MoKS50aXRsZSA9IG5ld1RpdGxlOyB9XG4gIGlzVGVtcGxhdGVFbGVtZW50KGVsOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0VsZW1lbnROb2RlKGVsKSAmJiB0aGlzLnRhZ05hbWUoZWwpID09PSAndGVtcGxhdGUnO1xuICB9XG4gIGlzVGV4dE5vZGUobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gdHJlZUFkYXB0ZXIuaXNUZXh0Tm9kZShub2RlKTsgfVxuICBpc0NvbW1lbnROb2RlKG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIHRyZWVBZGFwdGVyLmlzQ29tbWVudE5vZGUobm9kZSk7IH1cbiAgaXNFbGVtZW50Tm9kZShub2RlKTogYm9vbGVhbiB7IHJldHVybiBub2RlID8gdHJlZUFkYXB0ZXIuaXNFbGVtZW50Tm9kZShub2RlKSA6IGZhbHNlOyB9XG4gIGhhc1NoYWRvd1Jvb3Qobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KG5vZGUuc2hhZG93Um9vdCk7IH1cbiAgaXNTaGFkb3dSb290KG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0U2hhZG93Um9vdChub2RlKSA9PSBub2RlOyB9XG4gIGltcG9ydEludG9Eb2Mobm9kZSk6IGFueSB7IHJldHVybiB0aGlzLmNsb25lKG5vZGUpOyB9XG4gIGFkb3B0Tm9kZShub2RlKTogYW55IHsgcmV0dXJuIG5vZGU7IH1cbiAgZ2V0SHJlZihlbCk6IHN0cmluZyB7IHJldHVybiBlbC5ocmVmOyB9XG4gIHJlc29sdmVBbmRTZXRIcmVmKGVsLCBiYXNlVXJsOiBzdHJpbmcsIGhyZWY6IHN0cmluZykge1xuICAgIGlmIChocmVmID09IG51bGwpIHtcbiAgICAgIGVsLmhyZWYgPSBiYXNlVXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5ocmVmID0gYmFzZVVybCArICcvLi4vJyArIGhyZWY7XG4gICAgfVxuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2J1aWxkUnVsZXMocGFyc2VkUnVsZXMsIGNzcz8pIHtcbiAgICB2YXIgcnVsZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnNlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGFyc2VkUnVsZSA9IHBhcnNlZFJ1bGVzW2ldO1xuICAgICAgdmFyIHJ1bGU6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gU3RyaW5nTWFwV3JhcHBlci5jcmVhdGUoKTtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsICdjc3NUZXh0JywgY3NzKTtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsICdzdHlsZScsIHtjb250ZW50OiAnJywgY3NzVGV4dDogJyd9KTtcbiAgICAgIGlmIChwYXJzZWRSdWxlLnR5cGUgPT0gJ3J1bGUnKSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsICd0eXBlJywgMSk7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KFxuICAgICAgICAgICAgcnVsZSwgJ3NlbGVjdG9yVGV4dCcsIHBhcnNlZFJ1bGUuc2VsZWN0b3JzLmpvaW4oJywgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcc3syLH0vZywgJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKn5cXHMqL2csICcgfiAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKlxcK1xccyovZywgJyArICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMqPlxccyovZywgJyA+ICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFsoXFx3Kyk9KFxcdyspXFxdL2csICdbJDE9XCIkMlwiXScpKTtcbiAgICAgICAgaWYgKGlzQmxhbmsocGFyc2VkUnVsZS5kZWNsYXJhdGlvbnMpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwYXJzZWRSdWxlLmRlY2xhcmF0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHZhciBkZWNsYXJhdGlvbiA9IHBhcnNlZFJ1bGUuZGVjbGFyYXRpb25zW2pdO1xuICAgICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KFxuICAgICAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmdldChydWxlLCAnc3R5bGUnKSwgZGVjbGFyYXRpb24ucHJvcGVydHksIGRlY2xhcmF0aW9uLnZhbHVlKTtcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmdldChydWxlLCAnc3R5bGUnKS5jc3NUZXh0ICs9XG4gICAgICAgICAgICAgIGRlY2xhcmF0aW9uLnByb3BlcnR5ICsgJzogJyArIGRlY2xhcmF0aW9uLnZhbHVlICsgJzsnO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBhcnNlZFJ1bGUudHlwZSA9PSAnbWVkaWEnKSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsICd0eXBlJywgNCk7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsICdtZWRpYScsIHttZWRpYVRleHQ6IHBhcnNlZFJ1bGUubWVkaWF9KTtcbiAgICAgICAgaWYgKHBhcnNlZFJ1bGUucnVsZXMpIHtcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCAnY3NzUnVsZXMnLCB0aGlzLl9idWlsZFJ1bGVzKHBhcnNlZFJ1bGUucnVsZXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcnVsZXMucHVzaChydWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJ1bGVzO1xuICB9XG4gIHN1cHBvcnRzRE9NRXZlbnRzKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgc3VwcG9ydHNOYXRpdmVTaGFkb3dET00oKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICBnZXRHbG9iYWxFdmVudFRhcmdldCh0YXJnZXQ6IHN0cmluZyk6IGFueSB7XG4gICAgaWYgKHRhcmdldCA9PSAnd2luZG93Jykge1xuICAgICAgcmV0dXJuICg8YW55PnRoaXMuZGVmYXVsdERvYygpKS5fd2luZG93O1xuICAgIH0gZWxzZSBpZiAodGFyZ2V0ID09ICdkb2N1bWVudCcpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmF1bHREb2MoKTtcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PSAnYm9keScpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmF1bHREb2MoKS5ib2R5O1xuICAgIH1cbiAgfVxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICByZXNldEJhc2VFbGVtZW50KCk6IHZvaWQgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRIaXN0b3J5KCk6IEhpc3RvcnkgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRMb2NhdGlvbigpOiBMb2NhdGlvbiB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIGdldFVzZXJBZ2VudCgpOiBzdHJpbmcgeyByZXR1cm4gJ0Zha2UgdXNlciBhZ2VudCc7IH1cbiAgZ2V0RGF0YShlbCwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKGVsLCAnZGF0YS0nICsgbmFtZSk7IH1cbiAgZ2V0Q29tcHV0ZWRTdHlsZShlbCk6IGFueSB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHNldERhdGEoZWwsIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgeyB0aGlzLnNldEF0dHJpYnV0ZShlbCwgJ2RhdGEtJyArIG5hbWUsIHZhbHVlKTsgfVxuICAvLyBUT0RPKHRib3NjaCk6IG1vdmUgdGhpcyBpbnRvIGEgc2VwYXJhdGUgZW52aXJvbm1lbnQgY2xhc3Mgb25jZSB3ZSBoYXZlIGl0XG4gIHNldEdsb2JhbFZhcihwYXRoOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHsgc2V0VmFsdWVPblBhdGgoZ2xvYmFsLCBwYXRoLCB2YWx1ZSk7IH1cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKTogbnVtYmVyIHsgcmV0dXJuIHNldFRpbWVvdXQoY2FsbGJhY2ssIDApOyB9XG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkOiBudW1iZXIpIHsgY2xlYXJUaW1lb3V0KGlkKTsgfVxuICBwZXJmb3JtYW5jZU5vdygpOiBudW1iZXIgeyByZXR1cm4gRGF0ZVdyYXBwZXIudG9NaWxsaXMoRGF0ZVdyYXBwZXIubm93KCkpOyB9XG4gIGdldEFuaW1hdGlvblByZWZpeCgpOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cbiAgZ2V0VHJhbnNpdGlvbkVuZCgpOiBzdHJpbmcgeyByZXR1cm4gJ3RyYW5zaXRpb25lbmQnOyB9XG4gIHN1cHBvcnRzQW5pbWF0aW9uKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuXG4gIHJlcGxhY2VDaGlsZChlbCwgbmV3Tm9kZSwgb2xkTm9kZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG4gIHBhcnNlKHRlbXBsYXRlSHRtbDogc3RyaW5nKSB7IHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7IH1cbiAgaW52b2tlKGVsOiBFbGVtZW50LCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKTogYW55IHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxuICBnZXRFdmVudEtleShldmVudCk6IHN0cmluZyB7IHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7IH1cbn1cblxuLy8gVE9ETzogYnVpbGQgYSBwcm9wZXIgbGlzdCwgdGhpcyBvbmUgaXMgYWxsIHRoZSBrZXlzIG9mIGEgSFRNTElucHV0RWxlbWVudFxudmFyIF9IVE1MRWxlbWVudFByb3BlcnR5TGlzdCA9IFtcbiAgJ3dlYmtpdEVudHJpZXMnLFxuICAnaW5jcmVtZW50YWwnLFxuICAnd2Via2l0ZGlyZWN0b3J5JyxcbiAgJ3NlbGVjdGlvbkRpcmVjdGlvbicsXG4gICdzZWxlY3Rpb25FbmQnLFxuICAnc2VsZWN0aW9uU3RhcnQnLFxuICAnbGFiZWxzJyxcbiAgJ3ZhbGlkYXRpb25NZXNzYWdlJyxcbiAgJ3ZhbGlkaXR5JyxcbiAgJ3dpbGxWYWxpZGF0ZScsXG4gICd3aWR0aCcsXG4gICd2YWx1ZUFzTnVtYmVyJyxcbiAgJ3ZhbHVlQXNEYXRlJyxcbiAgJ3ZhbHVlJyxcbiAgJ3VzZU1hcCcsXG4gICdkZWZhdWx0VmFsdWUnLFxuICAndHlwZScsXG4gICdzdGVwJyxcbiAgJ3NyYycsXG4gICdzaXplJyxcbiAgJ3JlcXVpcmVkJyxcbiAgJ3JlYWRPbmx5JyxcbiAgJ3BsYWNlaG9sZGVyJyxcbiAgJ3BhdHRlcm4nLFxuICAnbmFtZScsXG4gICdtdWx0aXBsZScsXG4gICdtaW4nLFxuICAnbWluTGVuZ3RoJyxcbiAgJ21heExlbmd0aCcsXG4gICdtYXgnLFxuICAnbGlzdCcsXG4gICdpbmRldGVybWluYXRlJyxcbiAgJ2hlaWdodCcsXG4gICdmb3JtVGFyZ2V0JyxcbiAgJ2Zvcm1Ob1ZhbGlkYXRlJyxcbiAgJ2Zvcm1NZXRob2QnLFxuICAnZm9ybUVuY3R5cGUnLFxuICAnZm9ybUFjdGlvbicsXG4gICdmaWxlcycsXG4gICdmb3JtJyxcbiAgJ2Rpc2FibGVkJyxcbiAgJ2Rpck5hbWUnLFxuICAnY2hlY2tlZCcsXG4gICdkZWZhdWx0Q2hlY2tlZCcsXG4gICdhdXRvZm9jdXMnLFxuICAnYXV0b2NvbXBsZXRlJyxcbiAgJ2FsdCcsXG4gICdhbGlnbicsXG4gICdhY2NlcHQnLFxuICAnb25hdXRvY29tcGxldGVlcnJvcicsXG4gICdvbmF1dG9jb21wbGV0ZScsXG4gICdvbndhaXRpbmcnLFxuICAnb252b2x1bWVjaGFuZ2UnLFxuICAnb250b2dnbGUnLFxuICAnb250aW1ldXBkYXRlJyxcbiAgJ29uc3VzcGVuZCcsXG4gICdvbnN1Ym1pdCcsXG4gICdvbnN0YWxsZWQnLFxuICAnb25zaG93JyxcbiAgJ29uc2VsZWN0JyxcbiAgJ29uc2Vla2luZycsXG4gICdvbnNlZWtlZCcsXG4gICdvbnNjcm9sbCcsXG4gICdvbnJlc2l6ZScsXG4gICdvbnJlc2V0JyxcbiAgJ29ucmF0ZWNoYW5nZScsXG4gICdvbnByb2dyZXNzJyxcbiAgJ29ucGxheWluZycsXG4gICdvbnBsYXknLFxuICAnb25wYXVzZScsXG4gICdvbm1vdXNld2hlZWwnLFxuICAnb25tb3VzZXVwJyxcbiAgJ29ubW91c2VvdmVyJyxcbiAgJ29ubW91c2VvdXQnLFxuICAnb25tb3VzZW1vdmUnLFxuICAnb25tb3VzZWxlYXZlJyxcbiAgJ29ubW91c2VlbnRlcicsXG4gICdvbm1vdXNlZG93bicsXG4gICdvbmxvYWRzdGFydCcsXG4gICdvbmxvYWRlZG1ldGFkYXRhJyxcbiAgJ29ubG9hZGVkZGF0YScsXG4gICdvbmxvYWQnLFxuICAnb25rZXl1cCcsXG4gICdvbmtleXByZXNzJyxcbiAgJ29ua2V5ZG93bicsXG4gICdvbmludmFsaWQnLFxuICAnb25pbnB1dCcsXG4gICdvbmZvY3VzJyxcbiAgJ29uZXJyb3InLFxuICAnb25lbmRlZCcsXG4gICdvbmVtcHRpZWQnLFxuICAnb25kdXJhdGlvbmNoYW5nZScsXG4gICdvbmRyb3AnLFxuICAnb25kcmFnc3RhcnQnLFxuICAnb25kcmFnb3ZlcicsXG4gICdvbmRyYWdsZWF2ZScsXG4gICdvbmRyYWdlbnRlcicsXG4gICdvbmRyYWdlbmQnLFxuICAnb25kcmFnJyxcbiAgJ29uZGJsY2xpY2snLFxuICAnb25jdWVjaGFuZ2UnLFxuICAnb25jb250ZXh0bWVudScsXG4gICdvbmNsb3NlJyxcbiAgJ29uY2xpY2snLFxuICAnb25jaGFuZ2UnLFxuICAnb25jYW5wbGF5dGhyb3VnaCcsXG4gICdvbmNhbnBsYXknLFxuICAnb25jYW5jZWwnLFxuICAnb25ibHVyJyxcbiAgJ29uYWJvcnQnLFxuICAnc3BlbGxjaGVjaycsXG4gICdpc0NvbnRlbnRFZGl0YWJsZScsXG4gICdjb250ZW50RWRpdGFibGUnLFxuICAnb3V0ZXJUZXh0JyxcbiAgJ2lubmVyVGV4dCcsXG4gICdhY2Nlc3NLZXknLFxuICAnaGlkZGVuJyxcbiAgJ3dlYmtpdGRyb3B6b25lJyxcbiAgJ2RyYWdnYWJsZScsXG4gICd0YWJJbmRleCcsXG4gICdkaXInLFxuICAndHJhbnNsYXRlJyxcbiAgJ2xhbmcnLFxuICAndGl0bGUnLFxuICAnY2hpbGRFbGVtZW50Q291bnQnLFxuICAnbGFzdEVsZW1lbnRDaGlsZCcsXG4gICdmaXJzdEVsZW1lbnRDaGlsZCcsXG4gICdjaGlsZHJlbicsXG4gICdvbndlYmtpdGZ1bGxzY3JlZW5lcnJvcicsXG4gICdvbndlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLFxuICAnbmV4dEVsZW1lbnRTaWJsaW5nJyxcbiAgJ3ByZXZpb3VzRWxlbWVudFNpYmxpbmcnLFxuICAnb253aGVlbCcsXG4gICdvbnNlbGVjdHN0YXJ0JyxcbiAgJ29uc2VhcmNoJyxcbiAgJ29ucGFzdGUnLFxuICAnb25jdXQnLFxuICAnb25jb3B5JyxcbiAgJ29uYmVmb3JlcGFzdGUnLFxuICAnb25iZWZvcmVjdXQnLFxuICAnb25iZWZvcmVjb3B5JyxcbiAgJ3NoYWRvd1Jvb3QnLFxuICAnZGF0YXNldCcsXG4gICdjbGFzc0xpc3QnLFxuICAnY2xhc3NOYW1lJyxcbiAgJ291dGVySFRNTCcsXG4gICdpbm5lckhUTUwnLFxuICAnc2Nyb2xsSGVpZ2h0JyxcbiAgJ3Njcm9sbFdpZHRoJyxcbiAgJ3Njcm9sbFRvcCcsXG4gICdzY3JvbGxMZWZ0JyxcbiAgJ2NsaWVudEhlaWdodCcsXG4gICdjbGllbnRXaWR0aCcsXG4gICdjbGllbnRUb3AnLFxuICAnY2xpZW50TGVmdCcsXG4gICdvZmZzZXRQYXJlbnQnLFxuICAnb2Zmc2V0SGVpZ2h0JyxcbiAgJ29mZnNldFdpZHRoJyxcbiAgJ29mZnNldFRvcCcsXG4gICdvZmZzZXRMZWZ0JyxcbiAgJ2xvY2FsTmFtZScsXG4gICdwcmVmaXgnLFxuICAnbmFtZXNwYWNlVVJJJyxcbiAgJ2lkJyxcbiAgJ3N0eWxlJyxcbiAgJ2F0dHJpYnV0ZXMnLFxuICAndGFnTmFtZScsXG4gICdwYXJlbnRFbGVtZW50JyxcbiAgJ3RleHRDb250ZW50JyxcbiAgJ2Jhc2VVUkknLFxuICAnb3duZXJEb2N1bWVudCcsXG4gICduZXh0U2libGluZycsXG4gICdwcmV2aW91c1NpYmxpbmcnLFxuICAnbGFzdENoaWxkJyxcbiAgJ2ZpcnN0Q2hpbGQnLFxuICAnY2hpbGROb2RlcycsXG4gICdwYXJlbnROb2RlJyxcbiAgJ25vZGVUeXBlJyxcbiAgJ25vZGVWYWx1ZScsXG4gICdub2RlTmFtZScsXG4gICdjbG9zdXJlX2xtXzcxNDYxNycsXG4gICdfX2pzYWN0aW9uJ1xuXTtcbiJdfQ==