'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var application_tokens_1 = require('angular2/src/core/application_tokens');
var di_2 = require('angular2/src/core/di');
/**
 * Create a {@link UrlResolver} with no package prefix.
 */
function createWithoutPackagePrefix() {
    return new UrlResolver();
}
exports.createWithoutPackagePrefix = createWithoutPackagePrefix;
/**
 * A default provider for {@link PACKAGE_ROOT_URL} that maps to '/'.
 */
exports.DEFAULT_PACKAGE_URL_PROVIDER = new di_2.Provider(application_tokens_1.PACKAGE_ROOT_URL, { useValue: '/' });
/**
 * Used by the {@link Compiler} when resolving HTML and CSS template URLs.
 *
 * This class can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 *
 * ## Example
 *
 * {@example compiler/ts/url_resolver/url_resolver.ts region='url_resolver'}
 */
var UrlResolver = (function () {
    function UrlResolver(packagePrefix) {
        if (packagePrefix === void 0) { packagePrefix = null; }
        if (lang_1.isPresent(packagePrefix)) {
            this._packagePrefix = lang_1.StringWrapper.stripRight(packagePrefix, '/') + '/';
        }
    }
    /**
     * Resolves the `url` given the `baseUrl`:
     * - when the `url` is null, the `baseUrl` is returned,
     * - if `url` is relative ('path/to/here', './path/to/here'), the resolved url is a combination of
     * `baseUrl` and `url`,
     * - if `url` is absolute (it has a scheme: 'http://', 'https://' or start with '/'), the `url` is
     * returned as is (ignoring the `baseUrl`)
     *
     * @param {string} baseUrl
     * @param {string} url
     * @returns {string} the resolved URL
     */
    UrlResolver.prototype.resolve = function (baseUrl, url) {
        var resolvedUrl = url;
        if (lang_1.isPresent(baseUrl) && baseUrl.length > 0) {
            resolvedUrl = _resolveUrl(baseUrl, resolvedUrl);
        }
        if (lang_1.isPresent(this._packagePrefix) && getUrlScheme(resolvedUrl) == 'package') {
            resolvedUrl = resolvedUrl.replace('package:', this._packagePrefix);
        }
        return resolvedUrl;
    };
    UrlResolver = __decorate([
        di_1.Injectable(),
        __param(0, di_1.Inject(application_tokens_1.PACKAGE_ROOT_URL)), 
        __metadata('design:paramtypes', [String])
    ], UrlResolver);
    return UrlResolver;
})();
exports.UrlResolver = UrlResolver;
/**
 * Extract the scheme of a URL.
 */
function getUrlScheme(url) {
    var match = _split(url);
    return (match && match[_ComponentIndex.Scheme]) || '';
}
exports.getUrlScheme = getUrlScheme;
// The code below is adapted from Traceur:
// https://github.com/google/traceur-compiler/blob/9511c1dafa972bf0de1202a8a863bad02f0f95a8/src/runtime/url.js
/**
 * Builds a URI string from already-encoded parts.
 *
 * No encoding is performed.  Any component may be omitted as either null or
 * undefined.
 *
 * @param {?string=} opt_scheme The scheme such as 'http'.
 * @param {?string=} opt_userInfo The user name before the '@'.
 * @param {?string=} opt_domain The domain such as 'www.google.com', already
 *     URI-encoded.
 * @param {(string|null)=} opt_port The port number.
 * @param {?string=} opt_path The path, already URI-encoded.  If it is not
 *     empty, it must begin with a slash.
 * @param {?string=} opt_queryData The URI-encoded query data.
 * @param {?string=} opt_fragment The URI-encoded fragment identifier.
 * @return {string} The fully combined URI.
 */
function _buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (lang_1.isPresent(opt_scheme)) {
        out.push(opt_scheme + ':');
    }
    if (lang_1.isPresent(opt_domain)) {
        out.push('//');
        if (lang_1.isPresent(opt_userInfo)) {
            out.push(opt_userInfo + '@');
        }
        out.push(opt_domain);
        if (lang_1.isPresent(opt_port)) {
            out.push(':' + opt_port);
        }
    }
    if (lang_1.isPresent(opt_path)) {
        out.push(opt_path);
    }
    if (lang_1.isPresent(opt_queryData)) {
        out.push('?' + opt_queryData);
    }
    if (lang_1.isPresent(opt_fragment)) {
        out.push('#' + opt_fragment);
    }
    return out.join('');
}
/**
 * A regular expression for breaking a URI into its component parts.
 *
 * {@link http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234} says
 * As the "first-match-wins" algorithm is identical to the "greedy"
 * disambiguation method used by POSIX regular expressions, it is natural and
 * commonplace to use a regular expression for parsing the potential five
 * components of a URI reference.
 *
 * The following line is the regular expression for breaking-down a
 * well-formed URI reference into its components.
 *
 * <pre>
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 * </pre>
 *
 * The numbers in the second line above are only to assist readability; they
 * indicate the reference points for each subexpression (i.e., each paired
 * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
 * For example, matching the above expression to
 * <pre>
 *     http://www.ics.uci.edu/pub/ietf/uri/#Related
 * </pre>
 * results in the following subexpression matches:
 * <pre>
 *    $1 = http:
 *    $2 = http
 *    $3 = //www.ics.uci.edu
 *    $4 = www.ics.uci.edu
 *    $5 = /pub/ietf/uri/
 *    $6 = <undefined>
 *    $7 = <undefined>
 *    $8 = #Related
 *    $9 = Related
 * </pre>
 * where <undefined> indicates that the component is not present, as is the
 * case for the query component in the above example. Therefore, we can
 * determine the value of the five components as
 * <pre>
 *    scheme    = $2
 *    authority = $4
 *    path      = $5
 *    query     = $7
 *    fragment  = $9
 * </pre>
 *
 * The regular expression has been modified slightly to expose the
 * userInfo, domain, and port separately from the authority.
 * The modified version yields
 * <pre>
 *    $1 = http              scheme
 *    $2 = <undefined>       userInfo -\
 *    $3 = www.ics.uci.edu   domain     | authority
 *    $4 = <undefined>       port     -/
 *    $5 = /pub/ietf/uri/    path
 *    $6 = <undefined>       query without ?
 *    $7 = Related           fragment without #
 * </pre>
 * @type {!RegExp}
 * @internal
 */
var _splitRe = lang_1.RegExpWrapper.create('^' +
    '(?:' +
    '([^:/?#.]+)' +
    // used by other URL parts such as :,
    // ?, /, #, and .
    ':)?' +
    '(?://' +
    '(?:([^/?#]*)@)?' +
    '([\\w\\d\\-\\u0100-\\uffff.%]*)' +
    // digits, dashes, dots, percent
    // escapes, and unicode characters.
    '(?::([0-9]+))?' +
    ')?' +
    '([^?#]+)?' +
    '(?:\\?([^#]*))?' +
    '(?:#(.*))?' +
    '$');
/**
 * The index of each URI component in the return value of goog.uri.utils.split.
 * @enum {number}
 */
var _ComponentIndex;
(function (_ComponentIndex) {
    _ComponentIndex[_ComponentIndex["Scheme"] = 1] = "Scheme";
    _ComponentIndex[_ComponentIndex["UserInfo"] = 2] = "UserInfo";
    _ComponentIndex[_ComponentIndex["Domain"] = 3] = "Domain";
    _ComponentIndex[_ComponentIndex["Port"] = 4] = "Port";
    _ComponentIndex[_ComponentIndex["Path"] = 5] = "Path";
    _ComponentIndex[_ComponentIndex["QueryData"] = 6] = "QueryData";
    _ComponentIndex[_ComponentIndex["Fragment"] = 7] = "Fragment";
})(_ComponentIndex || (_ComponentIndex = {}));
/**
 * Splits a URI into its component parts.
 *
 * Each component can be accessed via the component indices; for example:
 * <pre>
 * goog.uri.utils.split(someStr)[goog.uri.utils.CompontentIndex.QUERY_DATA];
 * </pre>
 *
 * @param {string} uri The URI string to examine.
 * @return {!Array.<string|undefined>} Each component still URI-encoded.
 *     Each component that is present will contain the encoded value, whereas
 *     components that are not present will be undefined or empty, depending
 *     on the browser's regular expression implementation.  Never null, since
 *     arbitrary strings may still look like path names.
 */
function _split(uri) {
    return lang_1.RegExpWrapper.firstMatch(_splitRe, uri);
}
/**
  * Removes dot segments in given path component, as described in
  * RFC 3986, section 5.2.4.
  *
  * @param {string} path A non-empty path component.
  * @return {string} Path component with removed dot segments.
  */
function _removeDotSegments(path) {
    if (path == '/')
        return '/';
    var leadingSlash = path[0] == '/' ? '/' : '';
    var trailingSlash = path[path.length - 1] === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
        var segment = segments[pos];
        switch (segment) {
            case '':
            case '.':
                break;
            case '..':
                if (out.length > 0) {
                    out.pop();
                }
                else {
                    up++;
                }
                break;
            default:
                out.push(segment);
        }
    }
    if (leadingSlash == '') {
        while (up-- > 0) {
            out.unshift('..');
        }
        if (out.length === 0)
            out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
}
/**
 * Takes an array of the parts from split and canonicalizes the path part
 * and then joins all the parts.
 * @param {Array.<string?>} parts
 * @return {string}
 */
function _joinAndCanonicalizePath(parts) {
    var path = parts[_ComponentIndex.Path];
    path = lang_1.isBlank(path) ? '' : _removeDotSegments(path);
    parts[_ComponentIndex.Path] = path;
    return _buildFromEncodedParts(parts[_ComponentIndex.Scheme], parts[_ComponentIndex.UserInfo], parts[_ComponentIndex.Domain], parts[_ComponentIndex.Port], path, parts[_ComponentIndex.QueryData], parts[_ComponentIndex.Fragment]);
}
/**
 * Resolves a URL.
 * @param {string} base The URL acting as the base URL.
 * @param {string} to The URL to resolve.
 * @return {string}
 */
function _resolveUrl(base, url) {
    var parts = _split(encodeURI(url));
    var baseParts = _split(base);
    if (lang_1.isPresent(parts[_ComponentIndex.Scheme])) {
        return _joinAndCanonicalizePath(parts);
    }
    else {
        parts[_ComponentIndex.Scheme] = baseParts[_ComponentIndex.Scheme];
    }
    for (var i = _ComponentIndex.Scheme; i <= _ComponentIndex.Port; i++) {
        if (lang_1.isBlank(parts[i])) {
            parts[i] = baseParts[i];
        }
    }
    if (parts[_ComponentIndex.Path][0] == '/') {
        return _joinAndCanonicalizePath(parts);
    }
    var path = baseParts[_ComponentIndex.Path];
    if (lang_1.isBlank(path))
        path = '/';
    var index = path.lastIndexOf('/');
    path = path.substring(0, index + 1) + parts[_ComponentIndex.Path];
    parts[_ComponentIndex.Path] = path;
    return _joinAndCanonicalizePath(parts);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1Qdk91Ump2eC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3VybF9yZXNvbHZlci50cyJdLCJuYW1lcyI6WyJjcmVhdGVXaXRob3V0UGFja2FnZVByZWZpeCIsIlVybFJlc29sdmVyIiwiVXJsUmVzb2x2ZXIuY29uc3RydWN0b3IiLCJVcmxSZXNvbHZlci5yZXNvbHZlIiwiZ2V0VXJsU2NoZW1lIiwiX2J1aWxkRnJvbUVuY29kZWRQYXJ0cyIsIl9Db21wb25lbnRJbmRleCIsIl9zcGxpdCIsIl9yZW1vdmVEb3RTZWdtZW50cyIsIl9qb2luQW5kQ2Fub25pY2FsaXplUGF0aCIsIl9yZXNvbHZlVXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQkFBaUMsc0JBQXNCLENBQUMsQ0FBQTtBQUN4RCxxQkFBK0UsMEJBQTBCLENBQUMsQ0FBQTtBQUcxRyxtQ0FBK0Isc0NBQXNDLENBQUMsQ0FBQTtBQUN0RSxtQkFBdUIsc0JBQXNCLENBQUMsQ0FBQTtBQUU5Qzs7R0FFRztBQUNIO0lBQ0VBLE1BQU1BLENBQUNBLElBQUlBLFdBQVdBLEVBQUVBLENBQUNBO0FBQzNCQSxDQUFDQTtBQUZlLGtDQUEwQiw2QkFFekMsQ0FBQTtBQUVEOztHQUVHO0FBQ1Esb0NBQTRCLEdBQUcsSUFBSSxhQUFRLENBQUMscUNBQWdCLEVBQUUsRUFBQyxRQUFRLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUUxRjs7Ozs7Ozs7OztHQVVHO0FBQ0g7SUFJRUMscUJBQXNDQSxhQUE0QkE7UUFBdERDLDZCQUFzREEsR0FBdERBLG9CQUFzREE7UUFDaEVBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3QkEsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0Esb0JBQWFBLENBQUNB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Q0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGUsIEluamVjdH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtTdHJpbmdXcmFwcGVyLCBpc1ByZXNlbnQsIGlzQmxhbmssIFJlZ0V4cFdyYXBwZXIsIG5vcm1hbGl6ZUJsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UEFDS0FHRV9ST09UX1VSTH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fdG9rZW5zJztcbmltcG9ydCB7UHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuLyoqXG4gKiBDcmVhdGUgYSB7QGxpbmsgVXJsUmVzb2x2ZXJ9IHdpdGggbm8gcGFja2FnZSBwcmVmaXguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXaXRob3V0UGFja2FnZVByZWZpeCgpOiBVcmxSZXNvbHZlciB7XG4gIHJldHVybiBuZXcgVXJsUmVzb2x2ZXIoKTtcbn1cblxuLyoqXG4gKiBBIGRlZmF1bHQgcHJvdmlkZXIgZm9yIHtAbGluayBQQUNLQUdFX1JPT1RfVVJMfSB0aGF0IG1hcHMgdG8gJy8nLlxuICovXG5leHBvcnQgdmFyIERFRkFVTFRfUEFDS0FHRV9VUkxfUFJPVklERVIgPSBuZXcgUHJvdmlkZXIoUEFDS0FHRV9ST09UX1VSTCwge3VzZVZhbHVlOiAnLyd9KTtcblxuLyoqXG4gKiBVc2VkIGJ5IHRoZSB7QGxpbmsgQ29tcGlsZXJ9IHdoZW4gcmVzb2x2aW5nIEhUTUwgYW5kIENTUyB0ZW1wbGF0ZSBVUkxzLlxuICpcbiAqIFRoaXMgY2xhc3MgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGFwcGxpY2F0aW9uIGRldmVsb3BlciB0byBjcmVhdGUgY3VzdG9tIGJlaGF2aW9yLlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcGlsZXJ9XG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21waWxlci90cy91cmxfcmVzb2x2ZXIvdXJsX3Jlc29sdmVyLnRzIHJlZ2lvbj0ndXJsX3Jlc29sdmVyJ31cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFVybFJlc29sdmVyIHtcbiAgcHJpdmF0ZSBfcGFja2FnZVByZWZpeDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoUEFDS0FHRV9ST09UX1VSTCkgcGFja2FnZVByZWZpeDogc3RyaW5nID0gbnVsbCkge1xuICAgIGlmIChpc1ByZXNlbnQocGFja2FnZVByZWZpeCkpIHtcbiAgICAgIHRoaXMuX3BhY2thZ2VQcmVmaXggPSBTdHJpbmdXcmFwcGVyLnN0cmlwUmlnaHQocGFja2FnZVByZWZpeCwgJy8nKSArICcvJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgdGhlIGB1cmxgIGdpdmVuIHRoZSBgYmFzZVVybGA6XG4gICAqIC0gd2hlbiB0aGUgYHVybGAgaXMgbnVsbCwgdGhlIGBiYXNlVXJsYCBpcyByZXR1cm5lZCxcbiAgICogLSBpZiBgdXJsYCBpcyByZWxhdGl2ZSAoJ3BhdGgvdG8vaGVyZScsICcuL3BhdGgvdG8vaGVyZScpLCB0aGUgcmVzb2x2ZWQgdXJsIGlzIGEgY29tYmluYXRpb24gb2ZcbiAgICogYGJhc2VVcmxgIGFuZCBgdXJsYCxcbiAgICogLSBpZiBgdXJsYCBpcyBhYnNvbHV0ZSAoaXQgaGFzIGEgc2NoZW1lOiAnaHR0cDovLycsICdodHRwczovLycgb3Igc3RhcnQgd2l0aCAnLycpLCB0aGUgYHVybGAgaXNcbiAgICogcmV0dXJuZWQgYXMgaXMgKGlnbm9yaW5nIHRoZSBgYmFzZVVybGApXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVXJsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHJldHVybnMge3N0cmluZ30gdGhlIHJlc29sdmVkIFVSTFxuICAgKi9cbiAgcmVzb2x2ZShiYXNlVXJsOiBzdHJpbmcsIHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgcmVzb2x2ZWRVcmwgPSB1cmw7XG4gICAgaWYgKGlzUHJlc2VudChiYXNlVXJsKSAmJiBiYXNlVXJsLmxlbmd0aCA+IDApIHtcbiAgICAgIHJlc29sdmVkVXJsID0gX3Jlc29sdmVVcmwoYmFzZVVybCwgcmVzb2x2ZWRVcmwpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3BhY2thZ2VQcmVmaXgpICYmIGdldFVybFNjaGVtZShyZXNvbHZlZFVybCkgPT0gJ3BhY2thZ2UnKSB7XG4gICAgICByZXNvbHZlZFVybCA9IHJlc29sdmVkVXJsLnJlcGxhY2UoJ3BhY2thZ2U6JywgdGhpcy5fcGFja2FnZVByZWZpeCk7XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlZFVybDtcbiAgfVxufVxuXG4vKipcbiAqIEV4dHJhY3QgdGhlIHNjaGVtZSBvZiBhIFVSTC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFVybFNjaGVtZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhciBtYXRjaCA9IF9zcGxpdCh1cmwpO1xuICByZXR1cm4gKG1hdGNoICYmIG1hdGNoW19Db21wb25lbnRJbmRleC5TY2hlbWVdKSB8fCAnJztcbn1cblxuLy8gVGhlIGNvZGUgYmVsb3cgaXMgYWRhcHRlZCBmcm9tIFRyYWNldXI6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3RyYWNldXItY29tcGlsZXIvYmxvYi85NTExYzFkYWZhOTcyYmYwZGUxMjAyYThhODYzYmFkMDJmMGY5NWE4L3NyYy9ydW50aW1lL3VybC5qc1xuXG4vKipcbiAqIEJ1aWxkcyBhIFVSSSBzdHJpbmcgZnJvbSBhbHJlYWR5LWVuY29kZWQgcGFydHMuXG4gKlxuICogTm8gZW5jb2RpbmcgaXMgcGVyZm9ybWVkLiAgQW55IGNvbXBvbmVudCBtYXkgYmUgb21pdHRlZCBhcyBlaXRoZXIgbnVsbCBvclxuICogdW5kZWZpbmVkLlxuICpcbiAqIEBwYXJhbSB7P3N0cmluZz19IG9wdF9zY2hlbWUgVGhlIHNjaGVtZSBzdWNoIGFzICdodHRwJy5cbiAqIEBwYXJhbSB7P3N0cmluZz19IG9wdF91c2VySW5mbyBUaGUgdXNlciBuYW1lIGJlZm9yZSB0aGUgJ0AnLlxuICogQHBhcmFtIHs/c3RyaW5nPX0gb3B0X2RvbWFpbiBUaGUgZG9tYWluIHN1Y2ggYXMgJ3d3dy5nb29nbGUuY29tJywgYWxyZWFkeVxuICogICAgIFVSSS1lbmNvZGVkLlxuICogQHBhcmFtIHsoc3RyaW5nfG51bGwpPX0gb3B0X3BvcnQgVGhlIHBvcnQgbnVtYmVyLlxuICogQHBhcmFtIHs/c3RyaW5nPX0gb3B0X3BhdGggVGhlIHBhdGgsIGFscmVhZHkgVVJJLWVuY29kZWQuICBJZiBpdCBpcyBub3RcbiAqICAgICBlbXB0eSwgaXQgbXVzdCBiZWdpbiB3aXRoIGEgc2xhc2guXG4gKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfcXVlcnlEYXRhIFRoZSBVUkktZW5jb2RlZCBxdWVyeSBkYXRhLlxuICogQHBhcmFtIHs/c3RyaW5nPX0gb3B0X2ZyYWdtZW50IFRoZSBVUkktZW5jb2RlZCBmcmFnbWVudCBpZGVudGlmaWVyLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgZnVsbHkgY29tYmluZWQgVVJJLlxuICovXG5mdW5jdGlvbiBfYnVpbGRGcm9tRW5jb2RlZFBhcnRzKFxuICAgIG9wdF9zY2hlbWU/OiBzdHJpbmcsIG9wdF91c2VySW5mbz86IHN0cmluZywgb3B0X2RvbWFpbj86IHN0cmluZywgb3B0X3BvcnQ/OiBzdHJpbmcsXG4gICAgb3B0X3BhdGg/OiBzdHJpbmcsIG9wdF9xdWVyeURhdGE/OiBzdHJpbmcsIG9wdF9mcmFnbWVudD86IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhciBvdXQgPSBbXTtcblxuICBpZiAoaXNQcmVzZW50KG9wdF9zY2hlbWUpKSB7XG4gICAgb3V0LnB1c2gob3B0X3NjaGVtZSArICc6Jyk7XG4gIH1cblxuICBpZiAoaXNQcmVzZW50KG9wdF9kb21haW4pKSB7XG4gICAgb3V0LnB1c2goJy8vJyk7XG5cbiAgICBpZiAoaXNQcmVzZW50KG9wdF91c2VySW5mbykpIHtcbiAgICAgIG91dC5wdXNoKG9wdF91c2VySW5mbyArICdAJyk7XG4gICAgfVxuXG4gICAgb3V0LnB1c2gob3B0X2RvbWFpbik7XG5cbiAgICBpZiAoaXNQcmVzZW50KG9wdF9wb3J0KSkge1xuICAgICAgb3V0LnB1c2goJzonICsgb3B0X3BvcnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChpc1ByZXNlbnQob3B0X3BhdGgpKSB7XG4gICAgb3V0LnB1c2gob3B0X3BhdGgpO1xuICB9XG5cbiAgaWYgKGlzUHJlc2VudChvcHRfcXVlcnlEYXRhKSkge1xuICAgIG91dC5wdXNoKCc/JyArIG9wdF9xdWVyeURhdGEpO1xuICB9XG5cbiAgaWYgKGlzUHJlc2VudChvcHRfZnJhZ21lbnQpKSB7XG4gICAgb3V0LnB1c2goJyMnICsgb3B0X2ZyYWdtZW50KTtcbiAgfVxuXG4gIHJldHVybiBvdXQuam9pbignJyk7XG59XG5cbi8qKlxuICogQSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIGJyZWFraW5nIGEgVVJJIGludG8gaXRzIGNvbXBvbmVudCBwYXJ0cy5cbiAqXG4gKiB7QGxpbmsgaHR0cDovL3d3dy5nYml2LmNvbS9wcm90b2NvbHMvdXJpL3JmYy9yZmMzOTg2Lmh0bWwjUkZDMjIzNH0gc2F5c1xuICogQXMgdGhlIFwiZmlyc3QtbWF0Y2gtd2luc1wiIGFsZ29yaXRobSBpcyBpZGVudGljYWwgdG8gdGhlIFwiZ3JlZWR5XCJcbiAqIGRpc2FtYmlndWF0aW9uIG1ldGhvZCB1c2VkIGJ5IFBPU0lYIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGl0IGlzIG5hdHVyYWwgYW5kXG4gKiBjb21tb25wbGFjZSB0byB1c2UgYSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIHBhcnNpbmcgdGhlIHBvdGVudGlhbCBmaXZlXG4gKiBjb21wb25lbnRzIG9mIGEgVVJJIHJlZmVyZW5jZS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGxpbmUgaXMgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgYnJlYWtpbmctZG93biBhXG4gKiB3ZWxsLWZvcm1lZCBVUkkgcmVmZXJlbmNlIGludG8gaXRzIGNvbXBvbmVudHMuXG4gKlxuICogPHByZT5cbiAqIF4oKFteOi8/I10rKTopPygvLyhbXi8/I10qKSk/KFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT9cbiAqICAxMiAgICAgICAgICAgIDMgIDQgICAgICAgICAgNSAgICAgICA2ICA3ICAgICAgICA4IDlcbiAqIDwvcHJlPlxuICpcbiAqIFRoZSBudW1iZXJzIGluIHRoZSBzZWNvbmQgbGluZSBhYm92ZSBhcmUgb25seSB0byBhc3Npc3QgcmVhZGFiaWxpdHk7IHRoZXlcbiAqIGluZGljYXRlIHRoZSByZWZlcmVuY2UgcG9pbnRzIGZvciBlYWNoIHN1YmV4cHJlc3Npb24gKGkuZS4sIGVhY2ggcGFpcmVkXG4gKiBwYXJlbnRoZXNpcykuIFdlIHJlZmVyIHRvIHRoZSB2YWx1ZSBtYXRjaGVkIGZvciBzdWJleHByZXNzaW9uIDxuPiBhcyAkPG4+LlxuICogRm9yIGV4YW1wbGUsIG1hdGNoaW5nIHRoZSBhYm92ZSBleHByZXNzaW9uIHRvXG4gKiA8cHJlPlxuICogICAgIGh0dHA6Ly93d3cuaWNzLnVjaS5lZHUvcHViL2lldGYvdXJpLyNSZWxhdGVkXG4gKiA8L3ByZT5cbiAqIHJlc3VsdHMgaW4gdGhlIGZvbGxvd2luZyBzdWJleHByZXNzaW9uIG1hdGNoZXM6XG4gKiA8cHJlPlxuICogICAgJDEgPSBodHRwOlxuICogICAgJDIgPSBodHRwXG4gKiAgICAkMyA9IC8vd3d3Lmljcy51Y2kuZWR1XG4gKiAgICAkNCA9IHd3dy5pY3MudWNpLmVkdVxuICogICAgJDUgPSAvcHViL2lldGYvdXJpL1xuICogICAgJDYgPSA8dW5kZWZpbmVkPlxuICogICAgJDcgPSA8dW5kZWZpbmVkPlxuICogICAgJDggPSAjUmVsYXRlZFxuICogICAgJDkgPSBSZWxhdGVkXG4gKiA8L3ByZT5cbiAqIHdoZXJlIDx1bmRlZmluZWQ+IGluZGljYXRlcyB0aGF0IHRoZSBjb21wb25lbnQgaXMgbm90IHByZXNlbnQsIGFzIGlzIHRoZVxuICogY2FzZSBmb3IgdGhlIHF1ZXJ5IGNvbXBvbmVudCBpbiB0aGUgYWJvdmUgZXhhbXBsZS4gVGhlcmVmb3JlLCB3ZSBjYW5cbiAqIGRldGVybWluZSB0aGUgdmFsdWUgb2YgdGhlIGZpdmUgY29tcG9uZW50cyBhc1xuICogPHByZT5cbiAqICAgIHNjaGVtZSAgICA9ICQyXG4gKiAgICBhdXRob3JpdHkgPSAkNFxuICogICAgcGF0aCAgICAgID0gJDVcbiAqICAgIHF1ZXJ5ICAgICA9ICQ3XG4gKiAgICBmcmFnbWVudCAgPSAkOVxuICogPC9wcmU+XG4gKlxuICogVGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBoYXMgYmVlbiBtb2RpZmllZCBzbGlnaHRseSB0byBleHBvc2UgdGhlXG4gKiB1c2VySW5mbywgZG9tYWluLCBhbmQgcG9ydCBzZXBhcmF0ZWx5IGZyb20gdGhlIGF1dGhvcml0eS5cbiAqIFRoZSBtb2RpZmllZCB2ZXJzaW9uIHlpZWxkc1xuICogPHByZT5cbiAqICAgICQxID0gaHR0cCAgICAgICAgICAgICAgc2NoZW1lXG4gKiAgICAkMiA9IDx1bmRlZmluZWQ+ICAgICAgIHVzZXJJbmZvIC1cXFxuICogICAgJDMgPSB3d3cuaWNzLnVjaS5lZHUgICBkb21haW4gICAgIHwgYXV0aG9yaXR5XG4gKiAgICAkNCA9IDx1bmRlZmluZWQ+ICAgICAgIHBvcnQgICAgIC0vXG4gKiAgICAkNSA9IC9wdWIvaWV0Zi91cmkvICAgIHBhdGhcbiAqICAgICQ2ID0gPHVuZGVmaW5lZD4gICAgICAgcXVlcnkgd2l0aG91dCA/XG4gKiAgICAkNyA9IFJlbGF0ZWQgICAgICAgICAgIGZyYWdtZW50IHdpdGhvdXQgI1xuICogPC9wcmU+XG4gKiBAdHlwZSB7IVJlZ0V4cH1cbiAqIEBpbnRlcm5hbFxuICovXG52YXIgX3NwbGl0UmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZShcbiAgICAnXicgK1xuICAgICcoPzonICtcbiAgICAnKFteOi8/Iy5dKyknICsgIC8vIHNjaGVtZSAtIGlnbm9yZSBzcGVjaWFsIGNoYXJhY3RlcnNcbiAgICAgICAgICAgICAgICAgICAgIC8vIHVzZWQgYnkgb3RoZXIgVVJMIHBhcnRzIHN1Y2ggYXMgOixcbiAgICAgICAgICAgICAgICAgICAgIC8vID8sIC8sICMsIGFuZCAuXG4gICAgJzopPycgK1xuICAgICcoPzovLycgK1xuICAgICcoPzooW14vPyNdKilAKT8nICsgICAgICAgICAgICAgICAgICAvLyB1c2VySW5mb1xuICAgICcoW1xcXFx3XFxcXGRcXFxcLVxcXFx1MDEwMC1cXFxcdWZmZmYuJV0qKScgKyAgLy8gZG9tYWluIC0gcmVzdHJpY3QgdG8gbGV0dGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZGlnaXRzLCBkYXNoZXMsIGRvdHMsIHBlcmNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXNjYXBlcywgYW5kIHVuaWNvZGUgY2hhcmFjdGVycy5cbiAgICAnKD86OihbMC05XSspKT8nICsgICAgICAgICAgICAgICAgICAgLy8gcG9ydFxuICAgICcpPycgK1xuICAgICcoW14/I10rKT8nICsgICAgICAgIC8vIHBhdGhcbiAgICAnKD86XFxcXD8oW14jXSopKT8nICsgIC8vIHF1ZXJ5XG4gICAgJyg/OiMoLiopKT8nICsgICAgICAgLy8gZnJhZ21lbnRcbiAgICAnJCcpO1xuXG4vKipcbiAqIFRoZSBpbmRleCBvZiBlYWNoIFVSSSBjb21wb25lbnQgaW4gdGhlIHJldHVybiB2YWx1ZSBvZiBnb29nLnVyaS51dGlscy5zcGxpdC5cbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmVudW0gX0NvbXBvbmVudEluZGV4IHtcbiAgU2NoZW1lID0gMSxcbiAgVXNlckluZm8sXG4gIERvbWFpbixcbiAgUG9ydCxcbiAgUGF0aCxcbiAgUXVlcnlEYXRhLFxuICBGcmFnbWVudFxufVxuXG4vKipcbiAqIFNwbGl0cyBhIFVSSSBpbnRvIGl0cyBjb21wb25lbnQgcGFydHMuXG4gKlxuICogRWFjaCBjb21wb25lbnQgY2FuIGJlIGFjY2Vzc2VkIHZpYSB0aGUgY29tcG9uZW50IGluZGljZXM7IGZvciBleGFtcGxlOlxuICogPHByZT5cbiAqIGdvb2cudXJpLnV0aWxzLnNwbGl0KHNvbWVTdHIpW2dvb2cudXJpLnV0aWxzLkNvbXBvbnRlbnRJbmRleC5RVUVSWV9EQVRBXTtcbiAqIDwvcHJlPlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmkgVGhlIFVSSSBzdHJpbmcgdG8gZXhhbWluZS5cbiAqIEByZXR1cm4geyFBcnJheS48c3RyaW5nfHVuZGVmaW5lZD59IEVhY2ggY29tcG9uZW50IHN0aWxsIFVSSS1lbmNvZGVkLlxuICogICAgIEVhY2ggY29tcG9uZW50IHRoYXQgaXMgcHJlc2VudCB3aWxsIGNvbnRhaW4gdGhlIGVuY29kZWQgdmFsdWUsIHdoZXJlYXNcbiAqICAgICBjb21wb25lbnRzIHRoYXQgYXJlIG5vdCBwcmVzZW50IHdpbGwgYmUgdW5kZWZpbmVkIG9yIGVtcHR5LCBkZXBlbmRpbmdcbiAqICAgICBvbiB0aGUgYnJvd3NlcidzIHJlZ3VsYXIgZXhwcmVzc2lvbiBpbXBsZW1lbnRhdGlvbi4gIE5ldmVyIG51bGwsIHNpbmNlXG4gKiAgICAgYXJiaXRyYXJ5IHN0cmluZ3MgbWF5IHN0aWxsIGxvb2sgbGlrZSBwYXRoIG5hbWVzLlxuICovXG5mdW5jdGlvbiBfc3BsaXQodXJpOiBzdHJpbmcpOiBBcnJheTxzdHJpbmd8YW55PiB7XG4gIHJldHVybiBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goX3NwbGl0UmUsIHVyaSk7XG59XG5cbi8qKlxuICAqIFJlbW92ZXMgZG90IHNlZ21lbnRzIGluIGdpdmVuIHBhdGggY29tcG9uZW50LCBhcyBkZXNjcmliZWQgaW5cbiAgKiBSRkMgMzk4Niwgc2VjdGlvbiA1LjIuNC5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIEEgbm9uLWVtcHR5IHBhdGggY29tcG9uZW50LlxuICAqIEByZXR1cm4ge3N0cmluZ30gUGF0aCBjb21wb25lbnQgd2l0aCByZW1vdmVkIGRvdCBzZWdtZW50cy5cbiAgKi9cbmZ1bmN0aW9uIF9yZW1vdmVEb3RTZWdtZW50cyhwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAocGF0aCA9PSAnLycpIHJldHVybiAnLyc7XG5cbiAgdmFyIGxlYWRpbmdTbGFzaCA9IHBhdGhbMF0gPT0gJy8nID8gJy8nIDogJyc7XG4gIHZhciB0cmFpbGluZ1NsYXNoID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdID09PSAnLycgPyAnLycgOiAnJztcbiAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xuXG4gIHZhciBvdXQ6IHN0cmluZ1tdID0gW107XG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIHBvcyA9IDA7IHBvcyA8IHNlZ21lbnRzLmxlbmd0aDsgcG9zKyspIHtcbiAgICB2YXIgc2VnbWVudCA9IHNlZ21lbnRzW3Bvc107XG4gICAgc3dpdGNoIChzZWdtZW50KSB7XG4gICAgICBjYXNlICcnOlxuICAgICAgY2FzZSAnLic6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLi4nOlxuICAgICAgICBpZiAob3V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBvdXQucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXArKztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG91dC5wdXNoKHNlZ21lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChsZWFkaW5nU2xhc2ggPT0gJycpIHtcbiAgICB3aGlsZSAodXAtLSA+IDApIHtcbiAgICAgIG91dC51bnNoaWZ0KCcuLicpO1xuICAgIH1cblxuICAgIGlmIChvdXQubGVuZ3RoID09PSAwKSBvdXQucHVzaCgnLicpO1xuICB9XG5cbiAgcmV0dXJuIGxlYWRpbmdTbGFzaCArIG91dC5qb2luKCcvJykgKyB0cmFpbGluZ1NsYXNoO1xufVxuXG4vKipcbiAqIFRha2VzIGFuIGFycmF5IG9mIHRoZSBwYXJ0cyBmcm9tIHNwbGl0IGFuZCBjYW5vbmljYWxpemVzIHRoZSBwYXRoIHBhcnRcbiAqIGFuZCB0aGVuIGpvaW5zIGFsbCB0aGUgcGFydHMuXG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc/Pn0gcGFydHNcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gX2pvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzOiBhbnlbXSk6IHN0cmluZyB7XG4gIHZhciBwYXRoID0gcGFydHNbX0NvbXBvbmVudEluZGV4LlBhdGhdO1xuICBwYXRoID0gaXNCbGFuayhwYXRoKSA/ICcnIDogX3JlbW92ZURvdFNlZ21lbnRzKHBhdGgpO1xuICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF0gPSBwYXRoO1xuXG4gIHJldHVybiBfYnVpbGRGcm9tRW5jb2RlZFBhcnRzKFxuICAgICAgcGFydHNbX0NvbXBvbmVudEluZGV4LlNjaGVtZV0sIHBhcnRzW19Db21wb25lbnRJbmRleC5Vc2VySW5mb10sIHBhcnRzW19Db21wb25lbnRJbmRleC5Eb21haW5dLFxuICAgICAgcGFydHNbX0NvbXBvbmVudEluZGV4LlBvcnRdLCBwYXRoLCBwYXJ0c1tfQ29tcG9uZW50SW5kZXguUXVlcnlEYXRhXSxcbiAgICAgIHBhcnRzW19Db21wb25lbnRJbmRleC5GcmFnbWVudF0pO1xufVxuXG4vKipcbiAqIFJlc29sdmVzIGEgVVJMLlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2UgVGhlIFVSTCBhY3RpbmcgYXMgdGhlIGJhc2UgVVJMLlxuICogQHBhcmFtIHtzdHJpbmd9IHRvIFRoZSBVUkwgdG8gcmVzb2x2ZS5cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gX3Jlc29sdmVVcmwoYmFzZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhciBwYXJ0cyA9IF9zcGxpdChlbmNvZGVVUkkodXJsKSk7XG4gIHZhciBiYXNlUGFydHMgPSBfc3BsaXQoYmFzZSk7XG5cbiAgaWYgKGlzUHJlc2VudChwYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXSkpIHtcbiAgICByZXR1cm4gX2pvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXSA9IGJhc2VQYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSBfQ29tcG9uZW50SW5kZXguU2NoZW1lOyBpIDw9IF9Db21wb25lbnRJbmRleC5Qb3J0OyBpKyspIHtcbiAgICBpZiAoaXNCbGFuayhwYXJ0c1tpXSkpIHtcbiAgICAgIHBhcnRzW2ldID0gYmFzZVBhcnRzW2ldO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF1bMF0gPT0gJy8nKSB7XG4gICAgcmV0dXJuIF9qb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gIH1cblxuICB2YXIgcGF0aCA9IGJhc2VQYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF07XG4gIGlmIChpc0JsYW5rKHBhdGgpKSBwYXRoID0gJy8nO1xuICB2YXIgaW5kZXggPSBwYXRoLmxhc3RJbmRleE9mKCcvJyk7XG4gIHBhdGggPSBwYXRoLnN1YnN0cmluZygwLCBpbmRleCArIDEpICsgcGFydHNbX0NvbXBvbmVudEluZGV4LlBhdGhdO1xuICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF0gPSBwYXRoO1xuICByZXR1cm4gX2pvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbn1cbiJdfQ==