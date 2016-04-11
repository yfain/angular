'use strict';var html_ast_1 = require('angular2/src/compiler/html_ast');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var message_1 = require('./message');
var shared_1 = require('./shared');
/**
 * All messages extracted from a template.
 */
var ExtractionResult = (function () {
    function ExtractionResult(messages, errors) {
        this.messages = messages;
        this.errors = errors;
    }
    return ExtractionResult;
})();
exports.ExtractionResult = ExtractionResult;
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
function removeDuplicates(messages) {
    var uniq = {};
    messages.forEach(function (m) {
        if (!collection_1.StringMapWrapper.contains(uniq, message_1.id(m))) {
            uniq[message_1.id(m)] = m;
        }
    });
    return collection_1.StringMapWrapper.values(uniq);
}
exports.removeDuplicates = removeDuplicates;
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
var MessageExtractor = (function () {
    function MessageExtractor(_htmlParser, _parser) {
        this._htmlParser = _htmlParser;
        this._parser = _parser;
    }
    MessageExtractor.prototype.extract = function (template, sourceUrl) {
        this.messages = [];
        this.errors = [];
        var res = this._htmlParser.parse(template, sourceUrl);
        if (res.errors.length > 0) {
            return new ExtractionResult([], res.errors);
        }
        else {
            this._recurse(res.rootNodes);
            return new ExtractionResult(this.messages, this.errors);
        }
    };
    MessageExtractor.prototype._extractMessagesFromPart = function (p) {
        if (p.hasI18n) {
            this.messages.push(p.createMessage(this._parser));
            this._recurseToExtractMessagesFromAttributes(p.children);
        }
        else {
            this._recurse(p.children);
        }
        if (lang_1.isPresent(p.rootElement)) {
            this._extractMessagesFromAttributes(p.rootElement);
        }
    };
    MessageExtractor.prototype._recurse = function (nodes) {
        var _this = this;
        if (lang_1.isPresent(nodes)) {
            var ps = shared_1.partition(nodes, this.errors);
            ps.forEach(function (p) { return _this._extractMessagesFromPart(p); });
        }
    };
    MessageExtractor.prototype._recurseToExtractMessagesFromAttributes = function (nodes) {
        var _this = this;
        nodes.forEach(function (n) {
            if (n instanceof html_ast_1.HtmlElementAst) {
                _this._extractMessagesFromAttributes(n);
                _this._recurseToExtractMessagesFromAttributes(n.children);
            }
        });
    };
    MessageExtractor.prototype._extractMessagesFromAttributes = function (p) {
        var _this = this;
        p.attrs.forEach(function (attr) {
            if (attr.name.startsWith(shared_1.I18N_ATTR_PREFIX)) {
                try {
                    _this.messages.push(shared_1.messageFromAttribute(_this._parser, p, attr));
                }
                catch (e) {
                    if (e instanceof shared_1.I18nError) {
                        _this.errors.push(e);
                    }
                    else {
                        throw e;
                    }
                }
            }
        });
    };
    return MessageExtractor;
})();
exports.MessageExtractor = MessageExtractor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZV9leHRyYWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVYzdjBWSkZILnRtcC9hbmd1bGFyMi9zcmMvaTE4bi9tZXNzYWdlX2V4dHJhY3Rvci50cyJdLCJuYW1lcyI6WyJFeHRyYWN0aW9uUmVzdWx0IiwiRXh0cmFjdGlvblJlc3VsdC5jb25zdHJ1Y3RvciIsInJlbW92ZUR1cGxpY2F0ZXMiLCJNZXNzYWdlRXh0cmFjdG9yIiwiTWVzc2FnZUV4dHJhY3Rvci5jb25zdHJ1Y3RvciIsIk1lc3NhZ2VFeHRyYWN0b3IuZXh0cmFjdCIsIk1lc3NhZ2VFeHRyYWN0b3IuX2V4dHJhY3RNZXNzYWdlc0Zyb21QYXJ0IiwiTWVzc2FnZUV4dHJhY3Rvci5fcmVjdXJzZSIsIk1lc3NhZ2VFeHRyYWN0b3IuX3JlY3Vyc2VUb0V4dHJhY3RNZXNzYWdlc0Zyb21BdHRyaWJ1dGVzIiwiTWVzc2FnZUV4dHJhY3Rvci5fZXh0cmFjdE1lc3NhZ2VzRnJvbUF0dHJpYnV0ZXMiXSwibWFwcGluZ3MiOiJBQUVBLHlCQUE4RyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9JLHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzVELDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRWhFLHdCQUEwQixXQUFXLENBQUMsQ0FBQTtBQUN0Qyx1QkFBdUgsVUFBVSxDQUFDLENBQUE7QUFFbEk7O0dBRUc7QUFDSDtJQUNFQSwwQkFBbUJBLFFBQW1CQSxFQUFTQSxNQUFvQkE7UUFBaERDLGFBQVFBLEdBQVJBLFFBQVFBLENBQVdBO1FBQVNBLFdBQU1BLEdBQU5BLE1BQU1BLENBQWNBO0lBQUdBLENBQUNBO0lBQ3pFRCx1QkFBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxJQUVDO0FBRlksd0JBQWdCLG1CQUU1QixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILDBCQUFpQyxRQUFtQjtJQUNsREUsSUFBSUEsSUFBSUEsR0FBNkJB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Z0JBQUFBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNYQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxrQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQzNCQSxLQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDdEJBLENBQUNBO29CQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFDTkEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7b0JBQ1ZBLENBQUNBO2dCQUNIQSxDQUFDQTtZQUNIQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUNITix1QkFBQ0E7QUFBREEsQ0FBQ0EsQUEvREQsSUErREM7QUEvRFksd0JBQWdCLG1CQStENUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SHRtbFBhcnNlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFuLCBQYXJzZUVycm9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvcGFyc2VfdXRpbCc7XG5pbXBvcnQge0h0bWxBc3QsIEh0bWxBc3RWaXNpdG9yLCBIdG1sRWxlbWVudEFzdCwgSHRtbEF0dHJBc3QsIEh0bWxUZXh0QXN0LCBIdG1sQ29tbWVudEFzdCwgaHRtbFZpc2l0QWxsfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9hc3QnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1BhcnNlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvcGFyc2VyJztcbmltcG9ydCB7TWVzc2FnZSwgaWR9IGZyb20gJy4vbWVzc2FnZSc7XG5pbXBvcnQge0kxOG5FcnJvciwgUGFydCwgSTE4Tl9BVFRSX1BSRUZJWCwgcGFydGl0aW9uLCBtZWFuaW5nLCBkZXNjcmlwdGlvbiwgc3RyaW5naWZ5Tm9kZXMsIG1lc3NhZ2VGcm9tQXR0cmlidXRlfSBmcm9tICcuL3NoYXJlZCc7XG5cbi8qKlxuICogQWxsIG1lc3NhZ2VzIGV4dHJhY3RlZCBmcm9tIGEgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHRyYWN0aW9uUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIG1lc3NhZ2VzOiBNZXNzYWdlW10sIHB1YmxpYyBlcnJvcnM6IFBhcnNlRXJyb3JbXSkge31cbn1cblxuLyoqXG4gKiBSZW1vdmVzIGR1cGxpY2F0ZSBtZXNzYWdlcy5cbiAqXG4gKiBFLmcuXG4gKlxuICogYGBgXG4gKiAgdmFyIG0gPSBbbmV3IE1lc3NhZ2UoXCJtZXNzYWdlXCIsIFwibWVhbmluZ1wiLCBcImRlc2MxXCIpLCBuZXcgTWVzc2FnZShcIm1lc3NhZ2VcIiwgXCJtZWFuaW5nXCIsXG4gKiBcImRlc2MyXCIpXTtcbiAqICBleHBlY3QocmVtb3ZlRHVwbGljYXRlcyhtKSkudG9FcXVhbChbbmV3IE1lc3NhZ2UoXCJtZXNzYWdlXCIsIFwibWVhbmluZ1wiLCBcImRlc2MxXCIpXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUR1cGxpY2F0ZXMobWVzc2FnZXM6IE1lc3NhZ2VbXSk6IE1lc3NhZ2VbXSB7XG4gIGxldCB1bmlxOiB7W2tleTogc3RyaW5nXTogTWVzc2FnZX0gPSB7fTtcbiAgbWVzc2FnZXMuZm9yRWFjaChtID0+IHtcbiAgICBpZiAoIVN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModW5pcSwgaWQobSkpKSB7XG4gICAgICB1bmlxW2lkKG0pXSA9IG07XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIudmFsdWVzKHVuaXEpO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIGFsbCBtZXNzYWdlcyBmcm9tIGEgdGVtcGxhdGUuXG4gKlxuICogQWxnb3JpdGhtOlxuICpcbiAqIFRvIHVuZGVyc3RhbmQgdGhlIGFsZ29yaXRobSwgeW91IG5lZWQgdG8ga25vdyBob3cgcGFydGl0aW9uaW5nIHdvcmtzLlxuICogUGFydGl0aW9uaW5nIGlzIHJlcXVpcmVkIGFzIHdlIGNhbiB1c2UgdHdvIGkxOG4gY29tbWVudHMgdG8gZ3JvdXAgbm9kZSBzaWJsaW5ncyB0b2dldGhlci5cbiAqIFRoYXQgaXMgd2h5IHdlIGNhbm5vdCBqdXN0IHVzZSBub2Rlcy5cbiAqXG4gKiBQYXJ0aXRpb25pbmcgdHJhbnNmb3JtcyBhbiBhcnJheSBvZiBIdG1sQXN0IGludG8gYW4gYXJyYXkgb2YgUGFydC5cbiAqIEEgcGFydCBjYW4gb3B0aW9uYWxseSBjb250YWluIGEgcm9vdCBlbGVtZW50IG9yIGEgcm9vdCB0ZXh0IG5vZGUuIEFuZCBpdCBjYW4gYWxzbyBjb250YWluXG4gKiBjaGlsZHJlbi5cbiAqIEEgcGFydCBjYW4gY29udGFpbiBpMThuIHByb3BlcnR5LCBpbiB3aGljaCBjYXNlIGl0IG5lZWRzIHRvIGJlIGV4dHJhY3RlZC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgYXJyYXkgb2Ygbm9kZXMgd2lsbCBiZSBzcGxpdCBpbnRvIGZvdXIgcGFydHM6XG4gKlxuICogYGBgXG4gKiA8YT5BPC9hPlxuICogPGIgaTE4bj5CPC9iPlxuICogPCEtLSBpMThuIC0tPlxuICogPGM+QzwvYz5cbiAqIERcbiAqIDwhLS0gL2kxOG4gLS0+XG4gKiBFXG4gKiBgYGBcbiAqXG4gKiBQYXJ0IDEgY29udGFpbmluZyB0aGUgYSB0YWcuIEl0IHNob3VsZCBub3QgYmUgdHJhbnNsYXRlZC5cbiAqIFBhcnQgMiBjb250YWluaW5nIHRoZSBiIHRhZy4gSXQgc2hvdWxkIGJlIHRyYW5zbGF0ZWQuXG4gKiBQYXJ0IDMgY29udGFpbmluZyB0aGUgYyB0YWcgYW5kIHRoZSBEIHRleHQgbm9kZS4gSXQgc2hvdWxkIGJlIHRyYW5zbGF0ZWQuXG4gKiBQYXJ0IDQgY29udGFpbmluZyB0aGUgRSB0ZXh0IG5vZGUuIEl0IHNob3VsZCBub3QgYmUgdHJhbnNsYXRlZC4uXG4gKlxuICogSXQgaXMgYWxzbyBpbXBvcnRhbnQgdG8gdW5kZXJzdGFuZCBob3cgd2Ugc3RyaW5naWZ5IG5vZGVzIHRvIGNyZWF0ZSBhIG1lc3NhZ2UuXG4gKlxuICogV2Ugd2FsayB0aGUgdHJlZSBhbmQgcmVwbGFjZSBldmVyeSBlbGVtZW50IG5vZGUgd2l0aCBhIHBsYWNlaG9sZGVyLiBXZSBhbHNvIHJlcGxhY2VcbiAqIGFsbCBleHByZXNzaW9ucyBpbiBpbnRlcnBvbGF0aW9uIHdpdGggcGxhY2Vob2xkZXJzLiBXZSBhbHNvIGluc2VydCBhIHBsYWNlaG9sZGVyIGVsZW1lbnRcbiAqIHRvIHdyYXAgYSB0ZXh0IG5vZGUgY29udGFpbmluZyBpbnRlcnBvbGF0aW9uLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogVGhlIGZvbGxvd2luZyB0cmVlOlxuICpcbiAqIGBgYFxuICogPGE+QXt7SX19PC9hPjxiPkI8L2I+XG4gKiBgYGBcbiAqXG4gKiB3aWxsIGJlIHN0cmluZ2lmaWVkIGludG86XG4gKiBgYGBcbiAqIDxwaCBuYW1lPVwiZTBcIj48cGggbmFtZT1cInQxXCI+QTxwaCBuYW1lPVwiMFwiLz48L3BoPjwvcGg+PHBoIG5hbWU9XCJlMlwiPkI8L3BoPlxuICogYGBgXG4gKlxuICogVGhpcyBpcyB3aGF0IHRoZSBhbGdvcml0aG0gZG9lczpcbiAqXG4gKiAxLiBVc2UgdGhlIHByb3ZpZGVkIGh0bWwgcGFyc2VyIHRvIGdldCB0aGUgaHRtbCBBU1Qgb2YgdGhlIHRlbXBsYXRlLlxuICogMi4gUGFydGl0aW9uIHRoZSByb290IG5vZGVzLCBhbmQgcHJvY2VzcyBlYWNoIHBhcnQgc2VwYXJhdGVseS5cbiAqIDMuIElmIGEgcGFydCBkb2VzIG5vdCBoYXZlIHRoZSBpMThuIGF0dHJpYnV0ZSwgcmVjdXJzZSB0byBwcm9jZXNzIGNoaWxkcmVuIGFuZCBhdHRyaWJ1dGVzLlxuICogNC4gSWYgYSBwYXJ0IGhhcyB0aGUgaTE4biBhdHRyaWJ1dGUsIHN0cmluZ2lmeSB0aGUgbm9kZXMgdG8gY3JlYXRlIGEgTWVzc2FnZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1lc3NhZ2VFeHRyYWN0b3Ige1xuICBtZXNzYWdlczogTWVzc2FnZVtdO1xuICBlcnJvcnM6IFBhcnNlRXJyb3JbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9odG1sUGFyc2VyOiBIdG1sUGFyc2VyLCBwcml2YXRlIF9wYXJzZXI6IFBhcnNlcikge31cblxuICBleHRyYWN0KHRlbXBsYXRlOiBzdHJpbmcsIHNvdXJjZVVybDogc3RyaW5nKTogRXh0cmFjdGlvblJlc3VsdCB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuICAgIHRoaXMuZXJyb3JzID0gW107XG5cbiAgICBsZXQgcmVzID0gdGhpcy5faHRtbFBhcnNlci5wYXJzZSh0ZW1wbGF0ZSwgc291cmNlVXJsKTtcbiAgICBpZiAocmVzLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gbmV3IEV4dHJhY3Rpb25SZXN1bHQoW10sIHJlcy5lcnJvcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZWN1cnNlKHJlcy5yb290Tm9kZXMpO1xuICAgICAgcmV0dXJuIG5ldyBFeHRyYWN0aW9uUmVzdWx0KHRoaXMubWVzc2FnZXMsIHRoaXMuZXJyb3JzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9leHRyYWN0TWVzc2FnZXNGcm9tUGFydChwOiBQYXJ0KTogdm9pZCB7XG4gICAgaWYgKHAuaGFzSTE4bikge1xuICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKHAuY3JlYXRlTWVzc2FnZSh0aGlzLl9wYXJzZXIpKTtcbiAgICAgIHRoaXMuX3JlY3Vyc2VUb0V4dHJhY3RNZXNzYWdlc0Zyb21BdHRyaWJ1dGVzKHAuY2hpbGRyZW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZWN1cnNlKHAuY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQocC5yb290RWxlbWVudCkpIHtcbiAgICAgIHRoaXMuX2V4dHJhY3RNZXNzYWdlc0Zyb21BdHRyaWJ1dGVzKHAucm9vdEVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlY3Vyc2Uobm9kZXM6IEh0bWxBc3RbXSk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQobm9kZXMpKSB7XG4gICAgICBsZXQgcHMgPSBwYXJ0aXRpb24obm9kZXMsIHRoaXMuZXJyb3JzKTtcbiAgICAgIHBzLmZvckVhY2gocCA9PiB0aGlzLl9leHRyYWN0TWVzc2FnZXNGcm9tUGFydChwKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVjdXJzZVRvRXh0cmFjdE1lc3NhZ2VzRnJvbUF0dHJpYnV0ZXMobm9kZXM6IEh0bWxBc3RbXSk6IHZvaWQge1xuICAgIG5vZGVzLmZvckVhY2gobiA9PiB7XG4gICAgICBpZiAobiBpbnN0YW5jZW9mIEh0bWxFbGVtZW50QXN0KSB7XG4gICAgICAgIHRoaXMuX2V4dHJhY3RNZXNzYWdlc0Zyb21BdHRyaWJ1dGVzKG4pO1xuICAgICAgICB0aGlzLl9yZWN1cnNlVG9FeHRyYWN0TWVzc2FnZXNGcm9tQXR0cmlidXRlcyhuLmNoaWxkcmVuKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2V4dHJhY3RNZXNzYWdlc0Zyb21BdHRyaWJ1dGVzKHA6IEh0bWxFbGVtZW50QXN0KTogdm9pZCB7XG4gICAgcC5hdHRycy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgaWYgKGF0dHIubmFtZS5zdGFydHNXaXRoKEkxOE5fQVRUUl9QUkVGSVgpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2VGcm9tQXR0cmlidXRlKHRoaXMuX3BhcnNlciwgcCwgYXR0cikpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBJMThuRXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0iXX0=