import { HtmlElementAst } from 'angular2/src/compiler/html_ast';
import { isPresent } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { id } from './message';
import { I18nError, partition, isI18nAttr, messageFromAttribute } from './shared';
/**
 * All messages extracted from a template.
 */
export class ExtractionResult {
    constructor(messages, errors) {
        this.messages = messages;
        this.errors = errors;
    }
}
/**
 * Removes duplicate messages.
 *
 * E.g.
 *
 * ```
 *  var m = [new Message("message", "meaning", "desc1"), new Message("message", "meaning",
 * "desc2")];
 *  expect(removeDuplicates(m)).toEqual([new Message("message", "meaning", "desc1")]);
 * ```
 */
export function removeDuplicates(messages) {
    let uniq = {};
    messages.forEach(m => {
        if (!StringMapWrapper.contains(uniq, id(m))) {
            uniq[id(m)] = m;
        }
    });
    return StringMapWrapper.values(uniq);
}
/**
 * Extracts all messages from a template.
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
 * A part can contain i18n property, in which case it needs to be extracted.
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
 * Part 4 containing the E text node. It should not be translated..
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
 * 4. If a part has the i18n attribute, stringify the nodes to create a Message.
 */
export class MessageExtractor {
    constructor(_htmlParser, _parser) {
        this._htmlParser = _htmlParser;
        this._parser = _parser;
    }
    extract(template, sourceUrl) {
        this.messages = [];
        this.errors = [];
        let res = this._htmlParser.parse(template, sourceUrl);
        if (res.errors.length > 0) {
            return new ExtractionResult([], res.errors);
        }
        else {
            this._recurse(res.rootNodes);
            return new ExtractionResult(this.messages, this.errors);
        }
    }
    _extractMessagesFromPart(p) {
        if (p.hasI18n) {
            this.messages.push(p.createMessage(this._parser));
            this._recurseToExtractMessagesFromAttributes(p.children);
        }
        else {
            this._recurse(p.children);
        }
        if (isPresent(p.rootElement)) {
            this._extractMessagesFromAttributes(p.rootElement);
        }
    }
    _recurse(nodes) {
        if (isPresent(nodes)) {
            let ps = partition(nodes, this.errors);
            ps.forEach(p => this._extractMessagesFromPart(p));
        }
    }
    _recurseToExtractMessagesFromAttributes(nodes) {
        nodes.forEach(n => {
            if (n instanceof HtmlElementAst) {
                this._extractMessagesFromAttributes(n);
                this._recurseToExtractMessagesFromAttributes(n.children);
            }
        });
    }
    _extractMessagesFromAttributes(p) {
        p.attrs.forEach(attr => {
            if (isI18nAttr(attr.name)) {
                try {
                    this.messages.push(messageFromAttribute(this._parser, p, attr));
                }
                catch (e) {
                    if (e instanceof I18nError) {
                        this.errors.push(e);
                    }
                    else {
                        throw e;
                    }
                }
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZV9leHRyYWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvaTE4bi9tZXNzYWdlX2V4dHJhY3Rvci50cyJdLCJuYW1lcyI6WyJFeHRyYWN0aW9uUmVzdWx0IiwiRXh0cmFjdGlvblJlc3VsdC5jb25zdHJ1Y3RvciIsInJlbW92ZUR1cGxpY2F0ZXMiLCJNZXNzYWdlRXh0cmFjdG9yIiwiTWVzc2FnZUV4dHJhY3Rvci5jb25zdHJ1Y3RvciIsIk1lc3NhZ2VFeHRyYWN0b3IuZXh0cmFjdCIsIk1lc3NhZ2VFeHRyYWN0b3IuX2V4dHJhY3RNZXNzYWdlc0Zyb21QYXJ0IiwiTWVzc2FnZUV4dHJhY3Rvci5fcmVjdXJzZSIsIk1lc3NhZ2VFeHRyYWN0b3IuX3JlY3Vyc2VUb0V4dHJhY3RNZXNzYWdlc0Zyb21BdHRyaWJ1dGVzIiwiTWVzc2FnZUV4dHJhY3Rvci5fZXh0cmFjdE1lc3NhZ2VzRnJvbUF0dHJpYnV0ZXMiXSwibWFwcGluZ3MiOiJPQUVPLEVBR0wsY0FBYyxFQUtmLE1BQU0sZ0NBQWdDO09BQ2hDLEVBQUMsU0FBUyxFQUFVLE1BQU0sMEJBQTBCO09BQ3BELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFeEQsRUFBVSxFQUFFLEVBQUMsTUFBTSxXQUFXO09BQzlCLEVBQ0wsU0FBUyxFQUVULFNBQVMsRUFHVCxVQUFVLEVBRVYsb0JBQW9CLEVBQ3JCLE1BQU0sVUFBVTtBQUVqQjs7R0FFRztBQUNIO0lBQ0VBLFlBQW1CQSxRQUFtQkEsRUFBU0EsTUFBb0JBO1FBQWhEQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFXQTtRQUFTQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUFjQTtJQUFHQSxDQUFDQTtBQUN6RUQsQ0FBQ0E7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsaUNBQWlDLFFBQW1CO0lBQ2xERSxJQUFJQSxJQUFJQSxHQUE2QkEsRUFBRUEsQ0FBQ0E7SUFDeENBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLENB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QkFDTkEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7b0JBQ1ZBLENBQUNBO2dCQUNIQSxDQUFDQTtZQUNIQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtBQUNITixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtIdG1sUGFyc2VyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9wYXJzZXInO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW4sIFBhcnNlRXJyb3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9wYXJzZV91dGlsJztcbmltcG9ydCB7XG4gIEh0bWxBc3QsXG4gIEh0bWxBc3RWaXNpdG9yLFxuICBIdG1sRWxlbWVudEFzdCxcbiAgSHRtbEF0dHJBc3QsXG4gIEh0bWxUZXh0QXN0LFxuICBIdG1sQ29tbWVudEFzdCxcbiAgaHRtbFZpc2l0QWxsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX2FzdCc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UGFyc2VyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL3BhcnNlci9wYXJzZXInO1xuaW1wb3J0IHtNZXNzYWdlLCBpZH0gZnJvbSAnLi9tZXNzYWdlJztcbmltcG9ydCB7XG4gIEkxOG5FcnJvcixcbiAgUGFydCxcbiAgcGFydGl0aW9uLFxuICBtZWFuaW5nLFxuICBkZXNjcmlwdGlvbixcbiAgaXNJMThuQXR0cixcbiAgc3RyaW5naWZ5Tm9kZXMsXG4gIG1lc3NhZ2VGcm9tQXR0cmlidXRlXG59IGZyb20gJy4vc2hhcmVkJztcblxuLyoqXG4gKiBBbGwgbWVzc2FnZXMgZXh0cmFjdGVkIGZyb20gYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEV4dHJhY3Rpb25SZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbWVzc2FnZXM6IE1lc3NhZ2VbXSwgcHVibGljIGVycm9yczogUGFyc2VFcnJvcltdKSB7fVxufVxuXG4vKipcbiAqIFJlbW92ZXMgZHVwbGljYXRlIG1lc3NhZ2VzLlxuICpcbiAqIEUuZy5cbiAqXG4gKiBgYGBcbiAqICB2YXIgbSA9IFtuZXcgTWVzc2FnZShcIm1lc3NhZ2VcIiwgXCJtZWFuaW5nXCIsIFwiZGVzYzFcIiksIG5ldyBNZXNzYWdlKFwibWVzc2FnZVwiLCBcIm1lYW5pbmdcIixcbiAqIFwiZGVzYzJcIildO1xuICogIGV4cGVjdChyZW1vdmVEdXBsaWNhdGVzKG0pKS50b0VxdWFsKFtuZXcgTWVzc2FnZShcIm1lc3NhZ2VcIiwgXCJtZWFuaW5nXCIsIFwiZGVzYzFcIildKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRHVwbGljYXRlcyhtZXNzYWdlczogTWVzc2FnZVtdKTogTWVzc2FnZVtdIHtcbiAgbGV0IHVuaXE6IHtba2V5OiBzdHJpbmddOiBNZXNzYWdlfSA9IHt9O1xuICBtZXNzYWdlcy5mb3JFYWNoKG0gPT4ge1xuICAgIGlmICghU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyh1bmlxLCBpZChtKSkpIHtcbiAgICAgIHVuaXFbaWQobSldID0gbTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gU3RyaW5nTWFwV3JhcHBlci52YWx1ZXModW5pcSk7XG59XG5cbi8qKlxuICogRXh0cmFjdHMgYWxsIG1lc3NhZ2VzIGZyb20gYSB0ZW1wbGF0ZS5cbiAqXG4gKiBBbGdvcml0aG06XG4gKlxuICogVG8gdW5kZXJzdGFuZCB0aGUgYWxnb3JpdGhtLCB5b3UgbmVlZCB0byBrbm93IGhvdyBwYXJ0aXRpb25pbmcgd29ya3MuXG4gKiBQYXJ0aXRpb25pbmcgaXMgcmVxdWlyZWQgYXMgd2UgY2FuIHVzZSB0d28gaTE4biBjb21tZW50cyB0byBncm91cCBub2RlIHNpYmxpbmdzIHRvZ2V0aGVyLlxuICogVGhhdCBpcyB3aHkgd2UgY2Fubm90IGp1c3QgdXNlIG5vZGVzLlxuICpcbiAqIFBhcnRpdGlvbmluZyB0cmFuc2Zvcm1zIGFuIGFycmF5IG9mIEh0bWxBc3QgaW50byBhbiBhcnJheSBvZiBQYXJ0LlxuICogQSBwYXJ0IGNhbiBvcHRpb25hbGx5IGNvbnRhaW4gYSByb290IGVsZW1lbnQgb3IgYSByb290IHRleHQgbm9kZS4gQW5kIGl0IGNhbiBhbHNvIGNvbnRhaW5cbiAqIGNoaWxkcmVuLlxuICogQSBwYXJ0IGNhbiBjb250YWluIGkxOG4gcHJvcGVydHksIGluIHdoaWNoIGNhc2UgaXQgbmVlZHMgdG8gYmUgZXh0cmFjdGVkLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogVGhlIGZvbGxvd2luZyBhcnJheSBvZiBub2RlcyB3aWxsIGJlIHNwbGl0IGludG8gZm91ciBwYXJ0czpcbiAqXG4gKiBgYGBcbiAqIDxhPkE8L2E+XG4gKiA8YiBpMThuPkI8L2I+XG4gKiA8IS0tIGkxOG4gLS0+XG4gKiA8Yz5DPC9jPlxuICogRFxuICogPCEtLSAvaTE4biAtLT5cbiAqIEVcbiAqIGBgYFxuICpcbiAqIFBhcnQgMSBjb250YWluaW5nIHRoZSBhIHRhZy4gSXQgc2hvdWxkIG5vdCBiZSB0cmFuc2xhdGVkLlxuICogUGFydCAyIGNvbnRhaW5pbmcgdGhlIGIgdGFnLiBJdCBzaG91bGQgYmUgdHJhbnNsYXRlZC5cbiAqIFBhcnQgMyBjb250YWluaW5nIHRoZSBjIHRhZyBhbmQgdGhlIEQgdGV4dCBub2RlLiBJdCBzaG91bGQgYmUgdHJhbnNsYXRlZC5cbiAqIFBhcnQgNCBjb250YWluaW5nIHRoZSBFIHRleHQgbm9kZS4gSXQgc2hvdWxkIG5vdCBiZSB0cmFuc2xhdGVkLi5cbiAqXG4gKiBJdCBpcyBhbHNvIGltcG9ydGFudCB0byB1bmRlcnN0YW5kIGhvdyB3ZSBzdHJpbmdpZnkgbm9kZXMgdG8gY3JlYXRlIGEgbWVzc2FnZS5cbiAqXG4gKiBXZSB3YWxrIHRoZSB0cmVlIGFuZCByZXBsYWNlIGV2ZXJ5IGVsZW1lbnQgbm9kZSB3aXRoIGEgcGxhY2Vob2xkZXIuIFdlIGFsc28gcmVwbGFjZVxuICogYWxsIGV4cHJlc3Npb25zIGluIGludGVycG9sYXRpb24gd2l0aCBwbGFjZWhvbGRlcnMuIFdlIGFsc28gaW5zZXJ0IGEgcGxhY2Vob2xkZXIgZWxlbWVudFxuICogdG8gd3JhcCBhIHRleHQgbm9kZSBjb250YWluaW5nIGludGVycG9sYXRpb24uXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBUaGUgZm9sbG93aW5nIHRyZWU6XG4gKlxuICogYGBgXG4gKiA8YT5Be3tJfX08L2E+PGI+QjwvYj5cbiAqIGBgYFxuICpcbiAqIHdpbGwgYmUgc3RyaW5naWZpZWQgaW50bzpcbiAqIGBgYFxuICogPHBoIG5hbWU9XCJlMFwiPjxwaCBuYW1lPVwidDFcIj5BPHBoIG5hbWU9XCIwXCIvPjwvcGg+PC9waD48cGggbmFtZT1cImUyXCI+QjwvcGg+XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGlzIHdoYXQgdGhlIGFsZ29yaXRobSBkb2VzOlxuICpcbiAqIDEuIFVzZSB0aGUgcHJvdmlkZWQgaHRtbCBwYXJzZXIgdG8gZ2V0IHRoZSBodG1sIEFTVCBvZiB0aGUgdGVtcGxhdGUuXG4gKiAyLiBQYXJ0aXRpb24gdGhlIHJvb3Qgbm9kZXMsIGFuZCBwcm9jZXNzIGVhY2ggcGFydCBzZXBhcmF0ZWx5LlxuICogMy4gSWYgYSBwYXJ0IGRvZXMgbm90IGhhdmUgdGhlIGkxOG4gYXR0cmlidXRlLCByZWN1cnNlIHRvIHByb2Nlc3MgY2hpbGRyZW4gYW5kIGF0dHJpYnV0ZXMuXG4gKiA0LiBJZiBhIHBhcnQgaGFzIHRoZSBpMThuIGF0dHJpYnV0ZSwgc3RyaW5naWZ5IHRoZSBub2RlcyB0byBjcmVhdGUgYSBNZXNzYWdlLlxuICovXG5leHBvcnQgY2xhc3MgTWVzc2FnZUV4dHJhY3RvciB7XG4gIG1lc3NhZ2VzOiBNZXNzYWdlW107XG4gIGVycm9yczogUGFyc2VFcnJvcltdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2h0bWxQYXJzZXI6IEh0bWxQYXJzZXIsIHByaXZhdGUgX3BhcnNlcjogUGFyc2VyKSB7fVxuXG4gIGV4dHJhY3QodGVtcGxhdGU6IHN0cmluZywgc291cmNlVXJsOiBzdHJpbmcpOiBFeHRyYWN0aW9uUmVzdWx0IHtcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XG4gICAgdGhpcy5lcnJvcnMgPSBbXTtcblxuICAgIGxldCByZXMgPSB0aGlzLl9odG1sUGFyc2VyLnBhcnNlKHRlbXBsYXRlLCBzb3VyY2VVcmwpO1xuICAgIGlmIChyZXMuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBuZXcgRXh0cmFjdGlvblJlc3VsdChbXSwgcmVzLmVycm9ycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3JlY3Vyc2UocmVzLnJvb3ROb2Rlcyk7XG4gICAgICByZXR1cm4gbmV3IEV4dHJhY3Rpb25SZXN1bHQodGhpcy5tZXNzYWdlcywgdGhpcy5lcnJvcnMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2V4dHJhY3RNZXNzYWdlc0Zyb21QYXJ0KHA6IFBhcnQpOiB2b2lkIHtcbiAgICBpZiAocC5oYXNJMThuKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnB1c2gocC5jcmVhdGVNZXNzYWdlKHRoaXMuX3BhcnNlcikpO1xuICAgICAgdGhpcy5fcmVjdXJzZVRvRXh0cmFjdE1lc3NhZ2VzRnJvbUF0dHJpYnV0ZXMocC5jaGlsZHJlbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3JlY3Vyc2UocC5jaGlsZHJlbik7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudChwLnJvb3RFbGVtZW50KSkge1xuICAgICAgdGhpcy5fZXh0cmFjdE1lc3NhZ2VzRnJvbUF0dHJpYnV0ZXMocC5yb290RWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVjdXJzZShub2RlczogSHRtbEFzdFtdKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudChub2RlcykpIHtcbiAgICAgIGxldCBwcyA9IHBhcnRpdGlvbihub2RlcywgdGhpcy5lcnJvcnMpO1xuICAgICAgcHMuZm9yRWFjaChwID0+IHRoaXMuX2V4dHJhY3RNZXNzYWdlc0Zyb21QYXJ0KHApKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZWN1cnNlVG9FeHRyYWN0TWVzc2FnZXNGcm9tQXR0cmlidXRlcyhub2RlczogSHRtbEFzdFtdKTogdm9pZCB7XG4gICAgbm9kZXMuZm9yRWFjaChuID0+IHtcbiAgICAgIGlmIChuIGluc3RhbmNlb2YgSHRtbEVsZW1lbnRBc3QpIHtcbiAgICAgICAgdGhpcy5fZXh0cmFjdE1lc3NhZ2VzRnJvbUF0dHJpYnV0ZXMobik7XG4gICAgICAgIHRoaXMuX3JlY3Vyc2VUb0V4dHJhY3RNZXNzYWdlc0Zyb21BdHRyaWJ1dGVzKG4uY2hpbGRyZW4pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZXh0cmFjdE1lc3NhZ2VzRnJvbUF0dHJpYnV0ZXMocDogSHRtbEVsZW1lbnRBc3QpOiB2b2lkIHtcbiAgICBwLmF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBpZiAoaXNJMThuQXR0cihhdHRyLm5hbWUpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2VGcm9tQXR0cmlidXRlKHRoaXMuX3BhcnNlciwgcCwgYXR0cikpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBJMThuRXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0iXX0=