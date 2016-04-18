import { HtmlParseTreeResult } from 'angular2/src/compiler/html_parser';
import { HtmlElementAst, HtmlAttrAst, HtmlTextAst, htmlVisitAll } from 'angular2/src/compiler/html_ast';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { RegExpWrapper, NumberWrapper, isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { id } from './message';
import { messageFromAttribute, I18nError, I18N_ATTR_PREFIX, I18N_ATTR, partition } from './shared';
const _I18N_ATTR = "i18n";
const _PLACEHOLDER_ELEMENT = "ph";
const _NAME_ATTR = "name";
const _I18N_ATTR_PREFIX = "i18n-";
let _PLACEHOLDER_EXPANDED_REGEXP = RegExpWrapper.create(`\\<ph(\\s)+name=("(\\d)+")\\>\\<\\/ph\\>`);
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
export class I18nHtmlParser {
    constructor(_htmlParser, _parser, _messagesContent, _messages) {
        this._htmlParser = _htmlParser;
        this._parser = _parser;
        this._messagesContent = _messagesContent;
        this._messages = _messages;
    }
    parse(sourceContent, sourceUrl) {
        this.errors = [];
        let res = this._htmlParser.parse(sourceContent, sourceUrl);
        if (res.errors.length > 0) {
            return res;
        }
        else {
            let nodes = this._recurse(res.rootNodes);
            return this.errors.length > 0 ? new HtmlParseTreeResult([], this.errors) :
                new HtmlParseTreeResult(nodes, []);
        }
    }
    _processI18nPart(p) {
        try {
            return p.hasI18n ? this._mergeI18Part(p) : this._recurseIntoI18nPart(p);
        }
        catch (e) {
            if (e instanceof I18nError) {
                this.errors.push(e);
                return [];
            }
            else {
                throw e;
            }
        }
    }
    _mergeI18Part(p) {
        let messageId = id(p.createMessage(this._parser));
        if (!StringMapWrapper.contains(this._messages, messageId)) {
            throw new I18nError(p.sourceSpan, `Cannot find message for id '${messageId}'`);
        }
        let parsedMessage = this._messages[messageId];
        return this._mergeTrees(p, parsedMessage, p.children);
    }
    _recurseIntoI18nPart(p) {
        // we found an element without an i18n attribute
        // we need to recurse in cause its children may have i18n set
        // we also need to translate its attributes
        if (isPresent(p.rootElement)) {
            let root = p.rootElement;
            let children = this._recurse(p.children);
            let attrs = this._i18nAttributes(root);
            return [
                new HtmlElementAst(root.name, attrs, children, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)
            ];
        }
        else if (isPresent(p.rootTextNode)) {
            return [p.rootTextNode];
        }
        else {
            return this._recurse(p.children);
        }
    }
    _recurse(nodes) {
        let ps = partition(nodes, this.errors);
        return ListWrapper.flatten(ps.map(p => this._processI18nPart(p)));
    }
    _mergeTrees(p, translated, original) {
        let l = new _CreateNodeMapping();
        htmlVisitAll(l, original);
        // merge the translated tree with the original tree.
        // we do it by preserving the source code position of the original tree
        let merged = this._mergeTreesHelper(translated, l.mapping);
        // if the root element is present, we need to create a new root element with its attributes
        // translated
        if (isPresent(p.rootElement)) {
            let root = p.rootElement;
            let attrs = this._i18nAttributes(root);
            return [
                new HtmlElementAst(root.name, attrs, merged, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)
            ];
        }
        else if (isPresent(p.rootTextNode)) {
            throw new BaseException("should not be reached");
        }
        else {
            return merged;
        }
    }
    _mergeTreesHelper(translated, mapping) {
        return translated.map(t => {
            if (t instanceof HtmlElementAst) {
                return this._mergeElementOrInterpolation(t, translated, mapping);
            }
            else if (t instanceof HtmlTextAst) {
                return t;
            }
            else {
                throw new BaseException("should not be reached");
            }
        });
    }
    _mergeElementOrInterpolation(t, translated, mapping) {
        let name = this._getName(t);
        let type = name[0];
        let index = NumberWrapper.parseInt(name.substring(1), 10);
        let originalNode = mapping[index];
        if (type == "t") {
            return this._mergeTextInterpolation(t, originalNode);
        }
        else if (type == "e") {
            return this._mergeElement(t, originalNode, mapping);
        }
        else {
            throw new BaseException("should not be reached");
        }
    }
    _getName(t) {
        if (t.name != _PLACEHOLDER_ELEMENT) {
            throw new I18nError(t.sourceSpan, `Unexpected tag "${t.name}". Only "${_PLACEHOLDER_ELEMENT}" tags are allowed.`);
        }
        let names = t.attrs.filter(a => a.name == _NAME_ATTR);
        if (names.length == 0) {
            throw new I18nError(t.sourceSpan, `Missing "${_NAME_ATTR}" attribute.`);
        }
        return names[0].value;
    }
    _mergeTextInterpolation(t, originalNode) {
        let split = this._parser.splitInterpolation(originalNode.value, originalNode.sourceSpan.toString());
        let exps = isPresent(split) ? split.expressions : [];
        let messageSubstring = this._messagesContent.substring(t.startSourceSpan.end.offset, t.endSourceSpan.start.offset);
        let translated = this._replacePlaceholdersWithExpressions(messageSubstring, exps, originalNode.sourceSpan);
        return new HtmlTextAst(translated, originalNode.sourceSpan);
    }
    _mergeElement(t, originalNode, mapping) {
        let children = this._mergeTreesHelper(t.children, mapping);
        return new HtmlElementAst(originalNode.name, this._i18nAttributes(originalNode), children, originalNode.sourceSpan, originalNode.startSourceSpan, originalNode.endSourceSpan);
    }
    _i18nAttributes(el) {
        let res = [];
        el.attrs.forEach(attr => {
            if (attr.name.startsWith(I18N_ATTR_PREFIX) || attr.name == I18N_ATTR)
                return;
            let i18ns = el.attrs.filter(a => a.name == `i18n-${attr.name}`);
            if (i18ns.length == 0) {
                res.push(attr);
                return;
            }
            let i18n = i18ns[0];
            let messageId = id(messageFromAttribute(this._parser, el, i18n));
            if (StringMapWrapper.contains(this._messages, messageId)) {
                let updatedMessage = this._replaceInterpolationInAttr(attr, this._messages[messageId]);
                res.push(new HtmlAttrAst(attr.name, updatedMessage, attr.sourceSpan));
            }
            else {
                throw new I18nError(attr.sourceSpan, `Cannot find message for id '${messageId}'`);
            }
        });
        return res;
    }
    _replaceInterpolationInAttr(attr, msg) {
        let split = this._parser.splitInterpolation(attr.value, attr.sourceSpan.toString());
        let exps = isPresent(split) ? split.expressions : [];
        let first = msg[0];
        let last = msg[msg.length - 1];
        let start = first.sourceSpan.start.offset;
        let end = last instanceof HtmlElementAst ? last.endSourceSpan.end.offset : last.sourceSpan.end.offset;
        let messageSubstring = this._messagesContent.substring(start, end);
        return this._replacePlaceholdersWithExpressions(messageSubstring, exps, attr.sourceSpan);
    }
    ;
    _replacePlaceholdersWithExpressions(message, exps, sourceSpan) {
        return RegExpWrapper.replaceAll(_PLACEHOLDER_EXPANDED_REGEXP, message, (match) => {
            let nameWithQuotes = match[2];
            let name = nameWithQuotes.substring(1, nameWithQuotes.length - 1);
            let index = NumberWrapper.parseInt(name, 10);
            return this._convertIntoExpression(index, exps, sourceSpan);
        });
    }
    _convertIntoExpression(index, exps, sourceSpan) {
        if (index >= 0 && index < exps.length) {
            return `{{${exps[index]}}}`;
        }
        else {
            throw new I18nError(sourceSpan, `Invalid interpolation index '${index}'`);
        }
    }
}
class _CreateNodeMapping {
    constructor() {
        this.mapping = [];
    }
    visitElement(ast, context) {
        this.mapping.push(ast);
        htmlVisitAll(this, ast.children);
        return null;
    }
    visitAttr(ast, context) { return null; }
    visitText(ast, context) {
        this.mapping.push(ast);
        return null;
    }
    visitComment(ast, context) { return ""; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9odG1sX3BhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZXlaSm9WdEUudG1wL2FuZ3VsYXIyL3NyYy9pMThuL2kxOG5faHRtbF9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBYSxtQkFBbUIsRUFBQyxNQUFNLG1DQUFtQztPQUUxRSxFQUdMLGNBQWMsRUFDZCxXQUFXLEVBQ1gsV0FBVyxFQUVYLFlBQVksRUFDYixNQUFNLGdDQUFnQztPQUNoQyxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUNyRSxFQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BQ3pFLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BRXJELEVBQVUsRUFBRSxFQUFDLE1BQU0sV0FBVztPQUM5QixFQUNMLG9CQUFvQixFQUNwQixTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLFNBQVMsRUFDVCxTQUFTLEVBSVYsTUFBTSxVQUFVO0FBRWpCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUMxQixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQztBQUNsQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDMUIsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUM7QUFDbEMsSUFBSSw0QkFBNEIsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7QUFFcEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0ErRUc7QUFDSDtJQUdFLFlBQW9CLFdBQXVCLEVBQVUsT0FBZSxFQUNoRCxnQkFBd0IsRUFBVSxTQUFxQztRQUR2RSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUFVLFlBQU8sR0FBUCxPQUFPLENB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Q0FBQztJQUVELFNBQVMsQ0FBQyxHQUFnQixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUUvRCxTQUFTLENBQUMsR0FBZ0IsRUFBRSxPQUFZO1FBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsWUFBWSxDQUFDLEdBQW1CLEVBQUUsT0FBWSxJQUFTLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SHRtbFBhcnNlciwgSHRtbFBhcnNlVHJlZVJlc3VsdH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFuLCBQYXJzZUVycm9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvcGFyc2VfdXRpbCc7XG5pbXBvcnQge1xuICBIdG1sQXN0LFxuICBIdG1sQXN0VmlzaXRvcixcbiAgSHRtbEVsZW1lbnRBc3QsXG4gIEh0bWxBdHRyQXN0LFxuICBIdG1sVGV4dEFzdCxcbiAgSHRtbENvbW1lbnRBc3QsXG4gIGh0bWxWaXNpdEFsbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9hc3QnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UmVnRXhwV3JhcHBlciwgTnVtYmVyV3JhcHBlciwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9leHByZXNzaW9uX3BhcnNlci9wYXJzZXInO1xuaW1wb3J0IHtNZXNzYWdlLCBpZH0gZnJvbSAnLi9tZXNzYWdlJztcbmltcG9ydCB7XG4gIG1lc3NhZ2VGcm9tQXR0cmlidXRlLFxuICBJMThuRXJyb3IsXG4gIEkxOE5fQVRUUl9QUkVGSVgsXG4gIEkxOE5fQVRUUixcbiAgcGFydGl0aW9uLFxuICBQYXJ0LFxuICBzdHJpbmdpZnlOb2RlcyxcbiAgbWVhbmluZ1xufSBmcm9tICcuL3NoYXJlZCc7XG5cbmNvbnN0IF9JMThOX0FUVFIgPSBcImkxOG5cIjtcbmNvbnN0IF9QTEFDRUhPTERFUl9FTEVNRU5UID0gXCJwaFwiO1xuY29uc3QgX05BTUVfQVRUUiA9IFwibmFtZVwiO1xuY29uc3QgX0kxOE5fQVRUUl9QUkVGSVggPSBcImkxOG4tXCI7XG5sZXQgX1BMQUNFSE9MREVSX0VYUEFOREVEX1JFR0VYUCA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKGBcXFxcPHBoKFxcXFxzKStuYW1lPShcIihcXFxcZCkrXCIpXFxcXD5cXFxcPFxcXFwvcGhcXFxcPmApO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gaTE4bi1lZCB2ZXJzaW9uIG9mIHRoZSBwYXJzZWQgdGVtcGxhdGUuXG4gKlxuICogQWxnb3JpdGhtOlxuICpcbiAqIFRvIHVuZGVyc3RhbmQgdGhlIGFsZ29yaXRobSwgeW91IG5lZWQgdG8ga25vdyBob3cgcGFydGl0aW9uaW5nIHdvcmtzLlxuICogUGFydGl0aW9uaW5nIGlzIHJlcXVpcmVkIGFzIHdlIGNhbiB1c2UgdHdvIGkxOG4gY29tbWVudHMgdG8gZ3JvdXAgbm9kZSBzaWJsaW5ncyB0b2dldGhlci5cbiAqIFRoYXQgaXMgd2h5IHdlIGNhbm5vdCBqdXN0IHVzZSBub2Rlcy5cbiAqXG4gKiBQYXJ0aXRpb25pbmcgdHJhbnNmb3JtcyBhbiBhcnJheSBvZiBIdG1sQXN0IGludG8gYW4gYXJyYXkgb2YgUGFydC5cbiAqIEEgcGFydCBjYW4gb3B0aW9uYWxseSBjb250YWluIGEgcm9vdCBlbGVtZW50IG9yIGEgcm9vdCB0ZXh0IG5vZGUuIEFuZCBpdCBjYW4gYWxzbyBjb250YWluXG4gKiBjaGlsZHJlbi5cbiAqIEEgcGFydCBjYW4gY29udGFpbiBpMThuIHByb3BlcnR5LCBpbiB3aGljaCBjYXNlIGl0IG5lZWRzIHRvIGJlIHRyYW5zYWx0ZWQuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGFycmF5IG9mIG5vZGVzIHdpbGwgYmUgc3BsaXQgaW50byBmb3VyIHBhcnRzOlxuICpcbiAqIGBgYFxuICogPGE+QTwvYT5cbiAqIDxiIGkxOG4+QjwvYj5cbiAqIDwhLS0gaTE4biAtLT5cbiAqIDxjPkM8L2M+XG4gKiBEXG4gKiA8IS0tIC9pMThuIC0tPlxuICogRVxuICogYGBgXG4gKlxuICogUGFydCAxIGNvbnRhaW5pbmcgdGhlIGEgdGFnLiBJdCBzaG91bGQgbm90IGJlIHRyYW5zbGF0ZWQuXG4gKiBQYXJ0IDIgY29udGFpbmluZyB0aGUgYiB0YWcuIEl0IHNob3VsZCBiZSB0cmFuc2xhdGVkLlxuICogUGFydCAzIGNvbnRhaW5pbmcgdGhlIGMgdGFnIGFuZCB0aGUgRCB0ZXh0IG5vZGUuIEl0IHNob3VsZCBiZSB0cmFuc2xhdGVkLlxuICogUGFydCA0IGNvbnRhaW5pbmcgdGhlIEUgdGV4dCBub2RlLiBJdCBzaG91bGQgbm90IGJlIHRyYW5zbGF0ZWQuXG4gKlxuICpcbiAqIEl0IGlzIGFsc28gaW1wb3J0YW50IHRvIHVuZGVyc3RhbmQgaG93IHdlIHN0cmluZ2lmeSBub2RlcyB0byBjcmVhdGUgYSBtZXNzYWdlLlxuICpcbiAqIFdlIHdhbGsgdGhlIHRyZWUgYW5kIHJlcGxhY2UgZXZlcnkgZWxlbWVudCBub2RlIHdpdGggYSBwbGFjZWhvbGRlci4gV2UgYWxzbyByZXBsYWNlXG4gKiBhbGwgZXhwcmVzc2lvbnMgaW4gaW50ZXJwb2xhdGlvbiB3aXRoIHBsYWNlaG9sZGVycy4gV2UgYWxzbyBpbnNlcnQgYSBwbGFjZWhvbGRlciBlbGVtZW50XG4gKiB0byB3cmFwIGEgdGV4dCBub2RlIGNvbnRhaW5pbmcgaW50ZXJwb2xhdGlvbi5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgdHJlZTpcbiAqXG4gKiBgYGBcbiAqIDxhPkF7e0l9fTwvYT48Yj5CPC9iPlxuICogYGBgXG4gKlxuICogd2lsbCBiZSBzdHJpbmdpZmllZCBpbnRvOlxuICogYGBgXG4gKiA8cGggbmFtZT1cImUwXCI+PHBoIG5hbWU9XCJ0MVwiPkE8cGggbmFtZT1cIjBcIi8+PC9waD48L3BoPjxwaCBuYW1lPVwiZTJcIj5CPC9waD5cbiAqIGBgYFxuICpcbiAqIFRoaXMgaXMgd2hhdCB0aGUgYWxnb3JpdGhtIGRvZXM6XG4gKlxuICogMS4gVXNlIHRoZSBwcm92aWRlZCBodG1sIHBhcnNlciB0byBnZXQgdGhlIGh0bWwgQVNUIG9mIHRoZSB0ZW1wbGF0ZS5cbiAqIDIuIFBhcnRpdGlvbiB0aGUgcm9vdCBub2RlcywgYW5kIHByb2Nlc3MgZWFjaCBwYXJ0IHNlcGFyYXRlbHkuXG4gKiAzLiBJZiBhIHBhcnQgZG9lcyBub3QgaGF2ZSB0aGUgaTE4biBhdHRyaWJ1dGUsIHJlY3Vyc2UgdG8gcHJvY2VzcyBjaGlsZHJlbiBhbmQgYXR0cmlidXRlcy5cbiAqIDQuIElmIGEgcGFydCBoYXMgdGhlIGkxOG4gYXR0cmlidXRlLCBtZXJnZSB0aGUgdHJhbnNsYXRlZCBpMThuIHBhcnQgd2l0aCB0aGUgb3JpZ2luYWwgdHJlZS5cbiAqXG4gKiBUaGlzIGlzIGhvdyB0aGUgbWVyZ2luZyB3b3JrczpcbiAqXG4gKiAxLiBVc2UgdGhlIHN0cmluZ2lmeSBmdW5jdGlvbiB0byBnZXQgdGhlIG1lc3NhZ2UgaWQuIExvb2sgdXAgdGhlIG1lc3NhZ2UgaW4gdGhlIG1hcC5cbiAqIDIuIEdldCB0aGUgdHJhbnNsYXRlZCBtZXNzYWdlLiBBdCB0aGlzIHBvaW50IHdlIGhhdmUgdHdvIHRyZWVzOiB0aGUgb3JpZ2luYWwgdHJlZVxuICogYW5kIHRoZSB0cmFuc2xhdGVkIHRyZWUsIHdoZXJlIGFsbCB0aGUgZWxlbWVudHMgYXJlIHJlcGxhY2VkIHdpdGggcGxhY2Vob2xkZXJzLlxuICogMy4gVXNlIHRoZSBvcmlnaW5hbCB0cmVlIHRvIGNyZWF0ZSBhIG1hcHBpbmcgSW5kZXg6bnVtYmVyIC0+IEh0bWxBc3QuXG4gKiA0LiBXYWxrIHRoZSB0cmFuc2xhdGVkIHRyZWUuXG4gKiA1LiBJZiB3ZSBlbmNvdW50ZXIgYSBwbGFjZWhvbGRlciBlbGVtZW50LCBnZXQgaXMgbmFtZSBwcm9wZXJ0eS5cbiAqIDYuIEdldCB0aGUgdHlwZSBhbmQgdGhlIGluZGV4IG9mIHRoZSBub2RlIHVzaW5nIHRoZSBuYW1lIHByb3BlcnR5LlxuICogNy4gSWYgdGhlIHR5cGUgaXMgJ2UnLCB3aGljaCBtZWFucyBlbGVtZW50LCB0aGVuOlxuICogICAgIC0gdHJhbnNsYXRlIHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSBvcmlnaW5hbCBlbGVtZW50XG4gKiAgICAgLSByZWN1cnNlIHRvIG1lcmdlIHRoZSBjaGlsZHJlblxuICogICAgIC0gY3JlYXRlIGEgbmV3IGVsZW1lbnQgdXNpbmcgdGhlIG9yaWdpbmFsIGVsZW1lbnQgbmFtZSwgb3JpZ2luYWwgcG9zaXRpb24sXG4gKiAgICAgYW5kIHRyYW5zbGF0ZWQgY2hpbGRyZW4gYW5kIGF0dHJpYnV0ZXNcbiAqIDguIElmIHRoZSB0eXBlIGlmICd0Jywgd2hpY2ggbWVhbnMgdGV4dCwgdGhlbjpcbiAqICAgICAtIGdldCB0aGUgbGlzdCBvZiBleHByZXNzaW9ucyBmcm9tIHRoZSBvcmlnaW5hbCBub2RlLlxuICogICAgIC0gZ2V0IHRoZSBzdHJpbmcgdmVyc2lvbiBvZiB0aGUgaW50ZXJwb2xhdGlvbiBzdWJ0cmVlXG4gKiAgICAgLSBmaW5kIGFsbCB0aGUgcGxhY2Vob2xkZXJzIGluIHRoZSB0cmFuc2xhdGVkIG1lc3NhZ2UsIGFuZCByZXBsYWNlIHRoZW0gd2l0aCB0aGVcbiAqICAgICBjb3JyZXNwb25kaW5nIG9yaWdpbmFsIGV4cHJlc3Npb25zXG4gKi9cbmV4cG9ydCBjbGFzcyBJMThuSHRtbFBhcnNlciBpbXBsZW1lbnRzIEh0bWxQYXJzZXIge1xuICBlcnJvcnM6IFBhcnNlRXJyb3JbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9odG1sUGFyc2VyOiBIdG1sUGFyc2VyLCBwcml2YXRlIF9wYXJzZXI6IFBhcnNlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfbWVzc2FnZXNDb250ZW50OiBzdHJpbmcsIHByaXZhdGUgX21lc3NhZ2VzOiB7W2tleTogc3RyaW5nXTogSHRtbEFzdFtdfSkge31cblxuICBwYXJzZShzb3VyY2VDb250ZW50OiBzdHJpbmcsIHNvdXJjZVVybDogc3RyaW5nKTogSHRtbFBhcnNlVHJlZVJlc3VsdCB7XG4gICAgdGhpcy5lcnJvcnMgPSBbXTtcblxuICAgIGxldCByZXMgPSB0aGlzLl9odG1sUGFyc2VyLnBhcnNlKHNvdXJjZUNvbnRlbnQsIHNvdXJjZVVybCk7XG4gICAgaWYgKHJlcy5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG5vZGVzID0gdGhpcy5fcmVjdXJzZShyZXMucm9vdE5vZGVzKTtcbiAgICAgIHJldHVybiB0aGlzLmVycm9ycy5sZW5ndGggPiAwID8gbmV3IEh0bWxQYXJzZVRyZWVSZXN1bHQoW10sIHRoaXMuZXJyb3JzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBIdG1sUGFyc2VUcmVlUmVzdWx0KG5vZGVzLCBbXSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcHJvY2Vzc0kxOG5QYXJ0KHA6IFBhcnQpOiBIdG1sQXN0W10ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gcC5oYXNJMThuID8gdGhpcy5fbWVyZ2VJMThQYXJ0KHApIDogdGhpcy5fcmVjdXJzZUludG9JMThuUGFydChwKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEkxOG5FcnJvcikge1xuICAgICAgICB0aGlzLmVycm9ycy5wdXNoKGUpO1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlSTE4UGFydChwOiBQYXJ0KTogSHRtbEFzdFtdIHtcbiAgICBsZXQgbWVzc2FnZUlkID0gaWQocC5jcmVhdGVNZXNzYWdlKHRoaXMuX3BhcnNlcikpO1xuICAgIGlmICghU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyh0aGlzLl9tZXNzYWdlcywgbWVzc2FnZUlkKSkge1xuICAgICAgdGhyb3cgbmV3IEkxOG5FcnJvcihwLnNvdXJjZVNwYW4sIGBDYW5ub3QgZmluZCBtZXNzYWdlIGZvciBpZCAnJHttZXNzYWdlSWR9J2ApO1xuICAgIH1cblxuICAgIGxldCBwYXJzZWRNZXNzYWdlID0gdGhpcy5fbWVzc2FnZXNbbWVzc2FnZUlkXTtcbiAgICByZXR1cm4gdGhpcy5fbWVyZ2VUcmVlcyhwLCBwYXJzZWRNZXNzYWdlLCBwLmNoaWxkcmVuKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlY3Vyc2VJbnRvSTE4blBhcnQocDogUGFydCk6IEh0bWxBc3RbXSB7XG4gICAgLy8gd2UgZm91bmQgYW4gZWxlbWVudCB3aXRob3V0IGFuIGkxOG4gYXR0cmlidXRlXG4gICAgLy8gd2UgbmVlZCB0byByZWN1cnNlIGluIGNhdXNlIGl0cyBjaGlsZHJlbiBtYXkgaGF2ZSBpMThuIHNldFxuICAgIC8vIHdlIGFsc28gbmVlZCB0byB0cmFuc2xhdGUgaXRzIGF0dHJpYnV0ZXNcbiAgICBpZiAoaXNQcmVzZW50KHAucm9vdEVsZW1lbnQpKSB7XG4gICAgICBsZXQgcm9vdCA9IHAucm9vdEVsZW1lbnQ7XG4gICAgICBsZXQgY2hpbGRyZW4gPSB0aGlzLl9yZWN1cnNlKHAuY2hpbGRyZW4pO1xuICAgICAgbGV0IGF0dHJzID0gdGhpcy5faTE4bkF0dHJpYnV0ZXMocm9vdCk7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBuZXcgSHRtbEVsZW1lbnRBc3Qocm9vdC5uYW1lLCBhdHRycywgY2hpbGRyZW4sIHJvb3Quc291cmNlU3Bhbiwgcm9vdC5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICByb290LmVuZFNvdXJjZVNwYW4pXG4gICAgICBdO1xuXG4gICAgICAvLyBhIHRleHQgbm9kZSB3aXRob3V0IGkxOG4gb3IgaW50ZXJwb2xhdGlvbiwgbm90aGluZyB0byBkb1xuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHAucm9vdFRleHROb2RlKSkge1xuICAgICAgcmV0dXJuIFtwLnJvb3RUZXh0Tm9kZV07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlY3Vyc2UocC5jaGlsZHJlbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVjdXJzZShub2RlczogSHRtbEFzdFtdKTogSHRtbEFzdFtdIHtcbiAgICBsZXQgcHMgPSBwYXJ0aXRpb24obm9kZXMsIHRoaXMuZXJyb3JzKTtcbiAgICByZXR1cm4gTGlzdFdyYXBwZXIuZmxhdHRlbihwcy5tYXAocCA9PiB0aGlzLl9wcm9jZXNzSTE4blBhcnQocCkpKTtcbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlVHJlZXMocDogUGFydCwgdHJhbnNsYXRlZDogSHRtbEFzdFtdLCBvcmlnaW5hbDogSHRtbEFzdFtdKTogSHRtbEFzdFtdIHtcbiAgICBsZXQgbCA9IG5ldyBfQ3JlYXRlTm9kZU1hcHBpbmcoKTtcbiAgICBodG1sVmlzaXRBbGwobCwgb3JpZ2luYWwpO1xuXG4gICAgLy8gbWVyZ2UgdGhlIHRyYW5zbGF0ZWQgdHJlZSB3aXRoIHRoZSBvcmlnaW5hbCB0cmVlLlxuICAgIC8vIHdlIGRvIGl0IGJ5IHByZXNlcnZpbmcgdGhlIHNvdXJjZSBjb2RlIHBvc2l0aW9uIG9mIHRoZSBvcmlnaW5hbCB0cmVlXG4gICAgbGV0IG1lcmdlZCA9IHRoaXMuX21lcmdlVHJlZXNIZWxwZXIodHJhbnNsYXRlZCwgbC5tYXBwaW5nKTtcblxuICAgIC8vIGlmIHRoZSByb290IGVsZW1lbnQgaXMgcHJlc2VudCwgd2UgbmVlZCB0byBjcmVhdGUgYSBuZXcgcm9vdCBlbGVtZW50IHdpdGggaXRzIGF0dHJpYnV0ZXNcbiAgICAvLyB0cmFuc2xhdGVkXG4gICAgaWYgKGlzUHJlc2VudChwLnJvb3RFbGVtZW50KSkge1xuICAgICAgbGV0IHJvb3QgPSBwLnJvb3RFbGVtZW50O1xuICAgICAgbGV0IGF0dHJzID0gdGhpcy5faTE4bkF0dHJpYnV0ZXMocm9vdCk7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBuZXcgSHRtbEVsZW1lbnRBc3Qocm9vdC5uYW1lLCBhdHRycywgbWVyZ2VkLCByb290LnNvdXJjZVNwYW4sIHJvb3Quc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdC5lbmRTb3VyY2VTcGFuKVxuICAgICAgXTtcblxuICAgICAgLy8gdGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIHdpdGggYSBwYXJ0LiBQYXJ0cyB0aGF0IGhhdmUgcm9vdCB0ZXh0IG5vZGUgc2hvdWxkIG5vdCBiZSBtZXJnZWQuXG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocC5yb290VGV4dE5vZGUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcInNob3VsZCBub3QgYmUgcmVhY2hlZFwiKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWVyZ2VkO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlVHJlZXNIZWxwZXIodHJhbnNsYXRlZDogSHRtbEFzdFtdLCBtYXBwaW5nOiBIdG1sQXN0W10pOiBIdG1sQXN0W10ge1xuICAgIHJldHVybiB0cmFuc2xhdGVkLm1hcCh0ID0+IHtcbiAgICAgIGlmICh0IGluc3RhbmNlb2YgSHRtbEVsZW1lbnRBc3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21lcmdlRWxlbWVudE9ySW50ZXJwb2xhdGlvbih0LCB0cmFuc2xhdGVkLCBtYXBwaW5nKTtcblxuICAgICAgfSBlbHNlIGlmICh0IGluc3RhbmNlb2YgSHRtbFRleHRBc3QpIHtcbiAgICAgICAgcmV0dXJuIHQ7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwic2hvdWxkIG5vdCBiZSByZWFjaGVkXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWVyZ2VFbGVtZW50T3JJbnRlcnBvbGF0aW9uKHQ6IEh0bWxFbGVtZW50QXN0LCB0cmFuc2xhdGVkOiBIdG1sQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nOiBIdG1sQXN0W10pOiBIdG1sQXN0IHtcbiAgICBsZXQgbmFtZSA9IHRoaXMuX2dldE5hbWUodCk7XG4gICAgbGV0IHR5cGUgPSBuYW1lWzBdO1xuICAgIGxldCBpbmRleCA9IE51bWJlcldyYXBwZXIucGFyc2VJbnQobmFtZS5zdWJzdHJpbmcoMSksIDEwKTtcbiAgICBsZXQgb3JpZ2luYWxOb2RlID0gbWFwcGluZ1tpbmRleF07XG5cbiAgICBpZiAodHlwZSA9PSBcInRcIikge1xuICAgICAgcmV0dXJuIHRoaXMuX21lcmdlVGV4dEludGVycG9sYXRpb24odCwgPEh0bWxUZXh0QXN0Pm9yaWdpbmFsTm9kZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWVyZ2VFbGVtZW50KHQsIDxIdG1sRWxlbWVudEFzdD5vcmlnaW5hbE5vZGUsIG1hcHBpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcInNob3VsZCBub3QgYmUgcmVhY2hlZFwiKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXROYW1lKHQ6IEh0bWxFbGVtZW50QXN0KTogc3RyaW5nIHtcbiAgICBpZiAodC5uYW1lICE9IF9QTEFDRUhPTERFUl9FTEVNRU5UKSB7XG4gICAgICB0aHJvdyBuZXcgSTE4bkVycm9yKFxuICAgICAgICAgIHQuc291cmNlU3BhbixcbiAgICAgICAgICBgVW5leHBlY3RlZCB0YWcgXCIke3QubmFtZX1cIi4gT25seSBcIiR7X1BMQUNFSE9MREVSX0VMRU1FTlR9XCIgdGFncyBhcmUgYWxsb3dlZC5gKTtcbiAgICB9XG4gICAgbGV0IG5hbWVzID0gdC5hdHRycy5maWx0ZXIoYSA9PiBhLm5hbWUgPT0gX05BTUVfQVRUUik7XG4gICAgaWYgKG5hbWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgSTE4bkVycm9yKHQuc291cmNlU3BhbiwgYE1pc3NpbmcgXCIke19OQU1FX0FUVFJ9XCIgYXR0cmlidXRlLmApO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZXNbMF0udmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZVRleHRJbnRlcnBvbGF0aW9uKHQ6IEh0bWxFbGVtZW50QXN0LCBvcmlnaW5hbE5vZGU6IEh0bWxUZXh0QXN0KTogSHRtbFRleHRBc3Qge1xuICAgIGxldCBzcGxpdCA9XG4gICAgICAgIHRoaXMuX3BhcnNlci5zcGxpdEludGVycG9sYXRpb24ob3JpZ2luYWxOb2RlLnZhbHVlLCBvcmlnaW5hbE5vZGUuc291cmNlU3Bhbi50b1N0cmluZygpKTtcbiAgICBsZXQgZXhwcyA9IGlzUHJlc2VudChzcGxpdCkgPyBzcGxpdC5leHByZXNzaW9ucyA6IFtdO1xuXG4gICAgbGV0IG1lc3NhZ2VTdWJzdHJpbmcgPVxuICAgICAgICB0aGlzLl9tZXNzYWdlc0NvbnRlbnQuc3Vic3RyaW5nKHQuc3RhcnRTb3VyY2VTcGFuLmVuZC5vZmZzZXQsIHQuZW5kU291cmNlU3Bhbi5zdGFydC5vZmZzZXQpO1xuICAgIGxldCB0cmFuc2xhdGVkID1cbiAgICAgICAgdGhpcy5fcmVwbGFjZVBsYWNlaG9sZGVyc1dpdGhFeHByZXNzaW9ucyhtZXNzYWdlU3Vic3RyaW5nLCBleHBzLCBvcmlnaW5hbE5vZGUuc291cmNlU3Bhbik7XG5cbiAgICByZXR1cm4gbmV3IEh0bWxUZXh0QXN0KHRyYW5zbGF0ZWQsIG9yaWdpbmFsTm9kZS5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlRWxlbWVudCh0OiBIdG1sRWxlbWVudEFzdCwgb3JpZ2luYWxOb2RlOiBIdG1sRWxlbWVudEFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmc6IEh0bWxBc3RbXSk6IEh0bWxFbGVtZW50QXN0IHtcbiAgICBsZXQgY2hpbGRyZW4gPSB0aGlzLl9tZXJnZVRyZWVzSGVscGVyKHQuY2hpbGRyZW4sIG1hcHBpbmcpO1xuICAgIHJldHVybiBuZXcgSHRtbEVsZW1lbnRBc3Qob3JpZ2luYWxOb2RlLm5hbWUsIHRoaXMuX2kxOG5BdHRyaWJ1dGVzKG9yaWdpbmFsTm9kZSksIGNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxOb2RlLnNvdXJjZVNwYW4sIG9yaWdpbmFsTm9kZS5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbE5vZGUuZW5kU291cmNlU3Bhbik7XG4gIH1cblxuICBwcml2YXRlIF9pMThuQXR0cmlidXRlcyhlbDogSHRtbEVsZW1lbnRBc3QpOiBIdG1sQXR0ckFzdFtdIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgZWwuYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGlmIChhdHRyLm5hbWUuc3RhcnRzV2l0aChJMThOX0FUVFJfUFJFRklYKSB8fCBhdHRyLm5hbWUgPT0gSTE4Tl9BVFRSKSByZXR1cm47XG5cbiAgICAgIGxldCBpMThucyA9IGVsLmF0dHJzLmZpbHRlcihhID0+IGEubmFtZSA9PSBgaTE4bi0ke2F0dHIubmFtZX1gKTtcbiAgICAgIGlmIChpMThucy5sZW5ndGggPT0gMCkge1xuICAgICAgICByZXMucHVzaChhdHRyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgaTE4biA9IGkxOG5zWzBdO1xuICAgICAgbGV0IG1lc3NhZ2VJZCA9IGlkKG1lc3NhZ2VGcm9tQXR0cmlidXRlKHRoaXMuX3BhcnNlciwgZWwsIGkxOG4pKTtcblxuICAgICAgaWYgKFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModGhpcy5fbWVzc2FnZXMsIG1lc3NhZ2VJZCkpIHtcbiAgICAgICAgbGV0IHVwZGF0ZWRNZXNzYWdlID0gdGhpcy5fcmVwbGFjZUludGVycG9sYXRpb25JbkF0dHIoYXR0ciwgdGhpcy5fbWVzc2FnZXNbbWVzc2FnZUlkXSk7XG4gICAgICAgIHJlcy5wdXNoKG5ldyBIdG1sQXR0ckFzdChhdHRyLm5hbWUsIHVwZGF0ZWRNZXNzYWdlLCBhdHRyLnNvdXJjZVNwYW4pKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEkxOG5FcnJvcihhdHRyLnNvdXJjZVNwYW4sIGBDYW5ub3QgZmluZCBtZXNzYWdlIGZvciBpZCAnJHttZXNzYWdlSWR9J2ApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBwcml2YXRlIF9yZXBsYWNlSW50ZXJwb2xhdGlvbkluQXR0cihhdHRyOiBIdG1sQXR0ckFzdCwgbXNnOiBIdG1sQXN0W10pOiBzdHJpbmcge1xuICAgIGxldCBzcGxpdCA9IHRoaXMuX3BhcnNlci5zcGxpdEludGVycG9sYXRpb24oYXR0ci52YWx1ZSwgYXR0ci5zb3VyY2VTcGFuLnRvU3RyaW5nKCkpO1xuICAgIGxldCBleHBzID0gaXNQcmVzZW50KHNwbGl0KSA/IHNwbGl0LmV4cHJlc3Npb25zIDogW107XG5cbiAgICBsZXQgZmlyc3QgPSBtc2dbMF07XG4gICAgbGV0IGxhc3QgPSBtc2dbbXNnLmxlbmd0aCAtIDFdO1xuXG4gICAgbGV0IHN0YXJ0ID0gZmlyc3Quc291cmNlU3Bhbi5zdGFydC5vZmZzZXQ7XG4gICAgbGV0IGVuZCA9XG4gICAgICAgIGxhc3QgaW5zdGFuY2VvZiBIdG1sRWxlbWVudEFzdCA/IGxhc3QuZW5kU291cmNlU3Bhbi5lbmQub2Zmc2V0IDogbGFzdC5zb3VyY2VTcGFuLmVuZC5vZmZzZXQ7XG4gICAgbGV0IG1lc3NhZ2VTdWJzdHJpbmcgPSB0aGlzLl9tZXNzYWdlc0NvbnRlbnQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpO1xuXG4gICAgcmV0dXJuIHRoaXMuX3JlcGxhY2VQbGFjZWhvbGRlcnNXaXRoRXhwcmVzc2lvbnMobWVzc2FnZVN1YnN0cmluZywgZXhwcywgYXR0ci5zb3VyY2VTcGFuKTtcbiAgfTtcblxuICBwcml2YXRlIF9yZXBsYWNlUGxhY2Vob2xkZXJzV2l0aEV4cHJlc3Npb25zKG1lc3NhZ2U6IHN0cmluZywgZXhwczogc3RyaW5nW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogc3RyaW5nIHtcbiAgICByZXR1cm4gUmVnRXhwV3JhcHBlci5yZXBsYWNlQWxsKF9QTEFDRUhPTERFUl9FWFBBTkRFRF9SRUdFWFAsIG1lc3NhZ2UsIChtYXRjaCkgPT4ge1xuICAgICAgbGV0IG5hbWVXaXRoUXVvdGVzID0gbWF0Y2hbMl07XG4gICAgICBsZXQgbmFtZSA9IG5hbWVXaXRoUXVvdGVzLnN1YnN0cmluZygxLCBuYW1lV2l0aFF1b3Rlcy5sZW5ndGggLSAxKTtcbiAgICAgIGxldCBpbmRleCA9IE51bWJlcldyYXBwZXIucGFyc2VJbnQobmFtZSwgMTApO1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbnZlcnRJbnRvRXhwcmVzc2lvbihpbmRleCwgZXhwcywgc291cmNlU3Bhbik7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jb252ZXJ0SW50b0V4cHJlc3Npb24oaW5kZXg6IG51bWJlciwgZXhwczogc3RyaW5nW10sIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgZXhwcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBge3ske2V4cHNbaW5kZXhdfX19YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEkxOG5FcnJvcihzb3VyY2VTcGFuLCBgSW52YWxpZCBpbnRlcnBvbGF0aW9uIGluZGV4ICcke2luZGV4fSdgKTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgX0NyZWF0ZU5vZGVNYXBwaW5nIGltcGxlbWVudHMgSHRtbEFzdFZpc2l0b3Ige1xuICBtYXBwaW5nOiBIdG1sQXN0W10gPSBbXTtcblxuICB2aXNpdEVsZW1lbnQoYXN0OiBIdG1sRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLm1hcHBpbmcucHVzaChhc3QpO1xuICAgIGh0bWxWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4pO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRBdHRyKGFzdDogSHRtbEF0dHJBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRUZXh0KGFzdDogSHRtbFRleHRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5tYXBwaW5nLnB1c2goYXN0KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0Q29tbWVudChhc3Q6IEh0bWxDb21tZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gXCJcIjsgfVxufSJdfQ==