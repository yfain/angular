'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var parse_util_1 = require('angular2/src/compiler/parse_util');
var lang_1 = require('angular2/src/facade/lang');
var lexer_1 = require('angular2/src/compiler/css/lexer');
var lexer_2 = require('angular2/src/compiler/css/lexer');
exports.CssToken = lexer_2.CssToken;
(function (BlockType) {
    BlockType[BlockType["Import"] = 0] = "Import";
    BlockType[BlockType["Charset"] = 1] = "Charset";
    BlockType[BlockType["Namespace"] = 2] = "Namespace";
    BlockType[BlockType["Supports"] = 3] = "Supports";
    BlockType[BlockType["Keyframes"] = 4] = "Keyframes";
    BlockType[BlockType["MediaQuery"] = 5] = "MediaQuery";
    BlockType[BlockType["Selector"] = 6] = "Selector";
    BlockType[BlockType["FontFace"] = 7] = "FontFace";
    BlockType[BlockType["Page"] = 8] = "Page";
    BlockType[BlockType["Document"] = 9] = "Document";
    BlockType[BlockType["Viewport"] = 10] = "Viewport";
    BlockType[BlockType["Unsupported"] = 11] = "Unsupported";
})(exports.BlockType || (exports.BlockType = {}));
var BlockType = exports.BlockType;
var EOF_DELIM = 1;
var RBRACE_DELIM = 2;
var LBRACE_DELIM = 4;
var COMMA_DELIM = 8;
var COLON_DELIM = 16;
var SEMICOLON_DELIM = 32;
var NEWLINE_DELIM = 64;
var RPAREN_DELIM = 128;
function mergeTokens(tokens, separator) {
    if (separator === void 0) { separator = ''; }
    var mainToken = tokens[0];
    var str = mainToken.strValue;
    for (var i = 1; i < tokens.length; i++) {
        str += separator + tokens[i].strValue;
    }
    return new lexer_1.CssToken(mainToken.index, mainToken.column, mainToken.line, mainToken.type, str);
}
function getDelimFromToken(token) {
    return getDelimFromCharacter(token.numValue);
}
function getDelimFromCharacter(code) {
    switch (code) {
        case lexer_1.$EOF:
            return EOF_DELIM;
        case lexer_1.$COMMA:
            return COMMA_DELIM;
        case lexer_1.$COLON:
            return COLON_DELIM;
        case lexer_1.$SEMICOLON:
            return SEMICOLON_DELIM;
        case lexer_1.$RBRACE:
            return RBRACE_DELIM;
        case lexer_1.$LBRACE:
            return LBRACE_DELIM;
        case lexer_1.$RPAREN:
            return RPAREN_DELIM;
        default:
            return lexer_1.isNewline(code) ? NEWLINE_DELIM : 0;
    }
}
function characterContainsDelimiter(code, delimiters) {
    return lang_1.bitWiseAnd([getDelimFromCharacter(code), delimiters]) > 0;
}
var CssAST = (function () {
    function CssAST() {
    }
    CssAST.prototype.visit = function (visitor, context) { };
    return CssAST;
})();
exports.CssAST = CssAST;
var ParsedCssResult = (function () {
    function ParsedCssResult(errors, ast) {
        this.errors = errors;
        this.ast = ast;
    }
    return ParsedCssResult;
})();
exports.ParsedCssResult = ParsedCssResult;
var CssParser = (function () {
    function CssParser(_scanner, _fileName) {
        this._scanner = _scanner;
        this._fileName = _fileName;
        this._errors = [];
        this._file = new parse_util_1.ParseSourceFile(this._scanner.input, _fileName);
    }
    /** @internal */
    CssParser.prototype._resolveBlockType = function (token) {
        switch (token.strValue) {
            case '@-o-keyframes':
            case '@-moz-keyframes':
            case '@-webkit-keyframes':
            case '@keyframes':
                return BlockType.Keyframes;
            case '@charset':
                return BlockType.Charset;
            case '@import':
                return BlockType.Import;
            case '@namespace':
                return BlockType.Namespace;
            case '@page':
                return BlockType.Page;
            case '@document':
                return BlockType.Document;
            case '@media':
                return BlockType.MediaQuery;
            case '@font-face':
                return BlockType.FontFace;
            case '@viewport':
                return BlockType.Viewport;
            case '@supports':
                return BlockType.Supports;
            default:
                return BlockType.Unsupported;
        }
    };
    CssParser.prototype.parse = function () {
        var delimiters = EOF_DELIM;
        var ast = this._parseStyleSheet(delimiters);
        var errors = this._errors;
        this._errors = [];
        return new ParsedCssResult(errors, ast);
    };
    /** @internal */
    CssParser.prototype._parseStyleSheet = function (delimiters) {
        var results = [];
        this._scanner.consumeEmptyStatements();
        while (this._scanner.peek != lexer_1.$EOF) {
            this._scanner.setMode(lexer_1.CssLexerMode.BLOCK);
            results.push(this._parseRule(delimiters));
        }
        return new CssStyleSheetAST(results);
    };
    /** @internal */
    CssParser.prototype._parseRule = function (delimiters) {
        if (this._scanner.peek == lexer_1.$AT) {
            return this._parseAtRule(delimiters);
        }
        return this._parseSelectorRule(delimiters);
    };
    /** @internal */
    CssParser.prototype._parseAtRule = function (delimiters) {
        this._scanner.setMode(lexer_1.CssLexerMode.BLOCK);
        var token = this._scan();
        this._assertCondition(token.type == lexer_1.CssTokenType.AtKeyword, "The CSS Rule " + token.strValue + " is not a valid [@] rule.", token);
        var block, type = this._resolveBlockType(token);
        switch (type) {
            case BlockType.Charset:
            case BlockType.Namespace:
            case BlockType.Import:
                var value = this._parseValue(delimiters);
                this._scanner.setMode(lexer_1.CssLexerMode.BLOCK);
                this._scanner.consumeEmptyStatements();
                return new CssInlineRuleAST(type, value);
            case BlockType.Viewport:
            case BlockType.FontFace:
                block = this._parseStyleBlock(delimiters);
                return new CssBlockRuleAST(type, block);
            case BlockType.Keyframes:
                var tokens = this._collectUntilDelim(lang_1.bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                // keyframes only have one identifier name
                var name = tokens[0];
                return new CssKeyframeRuleAST(name, this._parseKeyframeBlock(delimiters));
            case BlockType.MediaQuery:
                this._scanner.setMode(lexer_1.CssLexerMode.MEDIA_QUERY);
                var tokens = this._collectUntilDelim(lang_1.bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                return new CssMediaQueryRuleAST(tokens, this._parseBlock(delimiters));
            case BlockType.Document:
            case BlockType.Supports:
            case BlockType.Page:
                this._scanner.setMode(lexer_1.CssLexerMode.AT_RULE_QUERY);
                var tokens = this._collectUntilDelim(lang_1.bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                return new CssBlockDefinitionRuleAST(type, tokens, this._parseBlock(delimiters));
            // if a custom @rule { ... } is used it should still tokenize the insides
            default:
                var listOfTokens = [];
                this._scanner.setMode(lexer_1.CssLexerMode.ALL);
                this._error(lexer_1.generateErrorMessage(this._scanner.input, "The CSS \"at\" rule \"" + token.strValue + "\" is not allowed to used here", token.strValue, token.index, token.line, token.column), token);
                this._collectUntilDelim(lang_1.bitWiseOr([delimiters, LBRACE_DELIM, SEMICOLON_DELIM]))
                    .forEach(function (token) { listOfTokens.push(token); });
                if (this._scanner.peek == lexer_1.$LBRACE) {
                    this._consume(lexer_1.CssTokenType.Character, '{');
                    this._collectUntilDelim(lang_1.bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]))
                        .forEach(function (token) { listOfTokens.push(token); });
                    this._consume(lexer_1.CssTokenType.Character, '}');
                }
                return new CssUnknownTokenListAST(token, listOfTokens);
        }
    };
    /** @internal */
    CssParser.prototype._parseSelectorRule = function (delimiters) {
        var selectors = this._parseSelectors(delimiters);
        var block = this._parseStyleBlock(delimiters);
        this._scanner.setMode(lexer_1.CssLexerMode.BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssSelectorRuleAST(selectors, block);
    };
    /** @internal */
    CssParser.prototype._parseSelectors = function (delimiters) {
        delimiters = lang_1.bitWiseOr([delimiters, LBRACE_DELIM]);
        var selectors = [];
        var isParsingSelectors = true;
        while (isParsingSelectors) {
            selectors.push(this._parseSelector(delimiters));
            isParsingSelectors = !characterContainsDelimiter(this._scanner.peek, delimiters);
            if (isParsingSelectors) {
                this._consume(lexer_1.CssTokenType.Character, ',');
                isParsingSelectors = !characterContainsDelimiter(this._scanner.peek, delimiters);
            }
        }
        return selectors;
    };
    /** @internal */
    CssParser.prototype._scan = function () {
        var output = this._scanner.scan();
        var token = output.token;
        var error = output.error;
        if (lang_1.isPresent(error)) {
            this._error(error.rawMessage, token);
        }
        return token;
    };
    /** @internal */
    CssParser.prototype._consume = function (type, value) {
        if (value === void 0) { value = null; }
        var output = this._scanner.consume(type, value);
        var token = output.token;
        var error = output.error;
        if (lang_1.isPresent(error)) {
            this._error(error.rawMessage, token);
        }
        return token;
    };
    /** @internal */
    CssParser.prototype._parseKeyframeBlock = function (delimiters) {
        delimiters = lang_1.bitWiseOr([delimiters, RBRACE_DELIM]);
        this._scanner.setMode(lexer_1.CssLexerMode.KEYFRAME_BLOCK);
        this._consume(lexer_1.CssTokenType.Character, '{');
        var definitions = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            definitions.push(this._parseKeyframeDefinition(delimiters));
        }
        this._consume(lexer_1.CssTokenType.Character, '}');
        return new CssBlockAST(definitions);
    };
    /** @internal */
    CssParser.prototype._parseKeyframeDefinition = function (delimiters) {
        var stepTokens = [];
        delimiters = lang_1.bitWiseOr([delimiters, LBRACE_DELIM]);
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            stepTokens.push(this._parseKeyframeLabel(lang_1.bitWiseOr([delimiters, COMMA_DELIM])));
            if (this._scanner.peek != lexer_1.$LBRACE) {
                this._consume(lexer_1.CssTokenType.Character, ',');
            }
        }
        var styles = this._parseStyleBlock(lang_1.bitWiseOr([delimiters, RBRACE_DELIM]));
        this._scanner.setMode(lexer_1.CssLexerMode.BLOCK);
        return new CssKeyframeDefinitionAST(stepTokens, styles);
    };
    /** @internal */
    CssParser.prototype._parseKeyframeLabel = function (delimiters) {
        this._scanner.setMode(lexer_1.CssLexerMode.KEYFRAME_BLOCK);
        return mergeTokens(this._collectUntilDelim(delimiters));
    };
    /** @internal */
    CssParser.prototype._parseSelector = function (delimiters) {
        delimiters = lang_1.bitWiseOr([delimiters, COMMA_DELIM, LBRACE_DELIM]);
        this._scanner.setMode(lexer_1.CssLexerMode.SELECTOR);
        var selectorCssTokens = [];
        var isComplex = false;
        var wsCssToken;
        var previousToken;
        var parenCount = 0;
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var code = this._scanner.peek;
            switch (code) {
                case lexer_1.$LPAREN:
                    parenCount++;
                    break;
                case lexer_1.$RPAREN:
                    parenCount--;
                    break;
                case lexer_1.$COLON:
                    this._scanner.setMode(lexer_1.CssLexerMode.PSEUDO_SELECTOR);
                    previousToken = this._consume(lexer_1.CssTokenType.Character, ':');
                    selectorCssTokens.push(previousToken);
                    continue;
                case lexer_1.$LBRACKET:
                    // if we are already inside an attribute selector then we can't
                    // jump into the mode again. Therefore this error will get picked
                    // up when the scan method is called below.
                    if (this._scanner.getMode() != lexer_1.CssLexerMode.ATTRIBUTE_SELECTOR) {
                        selectorCssTokens.push(this._consume(lexer_1.CssTokenType.Character, '['));
                        this._scanner.setMode(lexer_1.CssLexerMode.ATTRIBUTE_SELECTOR);
                        continue;
                    }
                    break;
                case lexer_1.$RBRACKET:
                    selectorCssTokens.push(this._consume(lexer_1.CssTokenType.Character, ']'));
                    this._scanner.setMode(lexer_1.CssLexerMode.SELECTOR);
                    continue;
            }
            var token = this._scan();
            // special case for the ":not(" selector since it
            // contains an inner selector that needs to be parsed
            // in isolation
            if (this._scanner.getMode() == lexer_1.CssLexerMode.PSEUDO_SELECTOR && lang_1.isPresent(previousToken) &&
                previousToken.numValue == lexer_1.$COLON && token.strValue == 'not' &&
                this._scanner.peek == lexer_1.$LPAREN) {
                selectorCssTokens.push(token);
                selectorCssTokens.push(this._consume(lexer_1.CssTokenType.Character, '('));
                // the inner selector inside of :not(...) can only be one
                // CSS selector (no commas allowed) therefore we parse only
                // one selector by calling the method below
                this._parseSelector(lang_1.bitWiseOr([delimiters, RPAREN_DELIM]))
                    .tokens.forEach(function (innerSelectorToken) { selectorCssTokens.push(innerSelectorToken); });
                selectorCssTokens.push(this._consume(lexer_1.CssTokenType.Character, ')'));
                continue;
            }
            previousToken = token;
            if (token.type == lexer_1.CssTokenType.Whitespace) {
                wsCssToken = token;
            }
            else {
                if (lang_1.isPresent(wsCssToken)) {
                    selectorCssTokens.push(wsCssToken);
                    wsCssToken = null;
                    isComplex = true;
                }
                selectorCssTokens.push(token);
            }
        }
        if (this._scanner.getMode() == lexer_1.CssLexerMode.ATTRIBUTE_SELECTOR) {
            this._error("Unbalanced CSS attribute selector at column " + previousToken.line + ":" + previousToken.column, previousToken);
        }
        else if (parenCount > 0) {
            this._error("Unbalanced pseudo selector function value at column " + previousToken.line + ":" + previousToken.column, previousToken);
        }
        return new CssSelectorAST(selectorCssTokens, isComplex);
    };
    /** @internal */
    CssParser.prototype._parseValue = function (delimiters) {
        delimiters = lang_1.bitWiseOr([delimiters, RBRACE_DELIM, SEMICOLON_DELIM, NEWLINE_DELIM]);
        this._scanner.setMode(lexer_1.CssLexerMode.STYLE_VALUE);
        var strValue = '';
        var tokens = [];
        var previous;
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var token;
            if (lang_1.isPresent(previous) && previous.type == lexer_1.CssTokenType.Identifier &&
                this._scanner.peek == lexer_1.$LPAREN) {
                token = this._consume(lexer_1.CssTokenType.Character, '(');
                tokens.push(token);
                strValue += token.strValue;
                this._scanner.setMode(lexer_1.CssLexerMode.STYLE_VALUE_FUNCTION);
                token = this._scan();
                tokens.push(token);
                strValue += token.strValue;
                this._scanner.setMode(lexer_1.CssLexerMode.STYLE_VALUE);
                token = this._consume(lexer_1.CssTokenType.Character, ')');
                tokens.push(token);
                strValue += token.strValue;
            }
            else {
                token = this._scan();
                if (token.type != lexer_1.CssTokenType.Whitespace) {
                    tokens.push(token);
                }
                strValue += token.strValue;
            }
            previous = token;
        }
        this._scanner.consumeWhitespace();
        var code = this._scanner.peek;
        if (code == lexer_1.$SEMICOLON) {
            this._consume(lexer_1.CssTokenType.Character, ';');
        }
        else if (code != lexer_1.$RBRACE) {
            this._error(lexer_1.generateErrorMessage(this._scanner.input, "The CSS key/value definition did not end with a semicolon", previous.strValue, previous.index, previous.line, previous.column), previous);
        }
        return new CssStyleValueAST(tokens, strValue);
    };
    /** @internal */
    CssParser.prototype._collectUntilDelim = function (delimiters, assertType) {
        if (assertType === void 0) { assertType = null; }
        var tokens = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var val = lang_1.isPresent(assertType) ? this._consume(assertType) : this._scan();
            tokens.push(val);
        }
        return tokens;
    };
    /** @internal */
    CssParser.prototype._parseBlock = function (delimiters) {
        delimiters = lang_1.bitWiseOr([delimiters, RBRACE_DELIM]);
        this._scanner.setMode(lexer_1.CssLexerMode.BLOCK);
        this._consume(lexer_1.CssTokenType.Character, '{');
        this._scanner.consumeEmptyStatements();
        var results = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            results.push(this._parseRule(delimiters));
        }
        this._consume(lexer_1.CssTokenType.Character, '}');
        this._scanner.setMode(lexer_1.CssLexerMode.BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssBlockAST(results);
    };
    /** @internal */
    CssParser.prototype._parseStyleBlock = function (delimiters) {
        delimiters = lang_1.bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]);
        this._scanner.setMode(lexer_1.CssLexerMode.STYLE_BLOCK);
        this._consume(lexer_1.CssTokenType.Character, '{');
        this._scanner.consumeEmptyStatements();
        var definitions = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            definitions.push(this._parseDefinition(delimiters));
            this._scanner.consumeEmptyStatements();
        }
        this._consume(lexer_1.CssTokenType.Character, '}');
        this._scanner.setMode(lexer_1.CssLexerMode.STYLE_BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssBlockAST(definitions);
    };
    /** @internal */
    CssParser.prototype._parseDefinition = function (delimiters) {
        this._scanner.setMode(lexer_1.CssLexerMode.STYLE_BLOCK);
        var prop = this._consume(lexer_1.CssTokenType.Identifier);
        var parseValue, value = null;
        // the colon value separates the prop from the style.
        // there are a few cases as to what could happen if it
        // is missing
        switch (this._scanner.peek) {
            case lexer_1.$COLON:
                this._consume(lexer_1.CssTokenType.Character, ':');
                parseValue = true;
                break;
            case lexer_1.$SEMICOLON:
            case lexer_1.$RBRACE:
            case lexer_1.$EOF:
                parseValue = false;
                break;
            default:
                var propStr = [prop.strValue];
                if (this._scanner.peek != lexer_1.$COLON) {
                    // this will throw the error
                    var nextValue = this._consume(lexer_1.CssTokenType.Character, ':');
                    propStr.push(nextValue.strValue);
                    var remainingTokens = this._collectUntilDelim(lang_1.bitWiseOr([delimiters, COLON_DELIM, SEMICOLON_DELIM]), lexer_1.CssTokenType.Identifier);
                    if (remainingTokens.length > 0) {
                        remainingTokens.forEach(function (token) { propStr.push(token.strValue); });
                    }
                    prop = new lexer_1.CssToken(prop.index, prop.column, prop.line, prop.type, propStr.join(' '));
                }
                // this means we've reached the end of the definition and/or block
                if (this._scanner.peek == lexer_1.$COLON) {
                    this._consume(lexer_1.CssTokenType.Character, ':');
                    parseValue = true;
                }
                else {
                    parseValue = false;
                }
                break;
        }
        if (parseValue) {
            value = this._parseValue(delimiters);
        }
        else {
            this._error(lexer_1.generateErrorMessage(this._scanner.input, "The CSS property was not paired with a style value", prop.strValue, prop.index, prop.line, prop.column), prop);
        }
        return new CssDefinitionAST(prop, value);
    };
    /** @internal */
    CssParser.prototype._assertCondition = function (status, errorMessage, problemToken) {
        if (!status) {
            this._error(errorMessage, problemToken);
            return true;
        }
        return false;
    };
    /** @internal */
    CssParser.prototype._error = function (message, problemToken) {
        var length = problemToken.strValue.length;
        var error = CssParseError.create(this._file, 0, problemToken.line, problemToken.column, length, message);
        this._errors.push(error);
    };
    return CssParser;
})();
exports.CssParser = CssParser;
var CssStyleValueAST = (function (_super) {
    __extends(CssStyleValueAST, _super);
    function CssStyleValueAST(tokens, strValue) {
        _super.call(this);
        this.tokens = tokens;
        this.strValue = strValue;
    }
    CssStyleValueAST.prototype.visit = function (visitor, context) { visitor.visitCssValue(this); };
    return CssStyleValueAST;
})(CssAST);
exports.CssStyleValueAST = CssStyleValueAST;
var CssRuleAST = (function (_super) {
    __extends(CssRuleAST, _super);
    function CssRuleAST() {
        _super.apply(this, arguments);
    }
    return CssRuleAST;
})(CssAST);
exports.CssRuleAST = CssRuleAST;
var CssBlockRuleAST = (function (_super) {
    __extends(CssBlockRuleAST, _super);
    function CssBlockRuleAST(type, block, name) {
        if (name === void 0) { name = null; }
        _super.call(this);
        this.type = type;
        this.block = block;
        this.name = name;
    }
    CssBlockRuleAST.prototype.visit = function (visitor, context) { visitor.visitCssBlock(this.block, context); };
    return CssBlockRuleAST;
})(CssRuleAST);
exports.CssBlockRuleAST = CssBlockRuleAST;
var CssKeyframeRuleAST = (function (_super) {
    __extends(CssKeyframeRuleAST, _super);
    function CssKeyframeRuleAST(name, block) {
        _super.call(this, BlockType.Keyframes, block, name);
    }
    CssKeyframeRuleAST.prototype.visit = function (visitor, context) { visitor.visitCssKeyframeRule(this, context); };
    return CssKeyframeRuleAST;
})(CssBlockRuleAST);
exports.CssKeyframeRuleAST = CssKeyframeRuleAST;
var CssKeyframeDefinitionAST = (function (_super) {
    __extends(CssKeyframeDefinitionAST, _super);
    function CssKeyframeDefinitionAST(_steps, block) {
        _super.call(this, BlockType.Keyframes, block, mergeTokens(_steps, ','));
        this.steps = _steps;
    }
    CssKeyframeDefinitionAST.prototype.visit = function (visitor, context) {
        visitor.visitCssKeyframeDefinition(this, context);
    };
    return CssKeyframeDefinitionAST;
})(CssBlockRuleAST);
exports.CssKeyframeDefinitionAST = CssKeyframeDefinitionAST;
var CssBlockDefinitionRuleAST = (function (_super) {
    __extends(CssBlockDefinitionRuleAST, _super);
    function CssBlockDefinitionRuleAST(type, query, block) {
        _super.call(this, type, block);
        this.query = query;
        this.strValue = query.map(function (token) { return token.strValue; }).join('');
        var firstCssToken = query[0];
        this.name = new lexer_1.CssToken(firstCssToken.index, firstCssToken.column, firstCssToken.line, lexer_1.CssTokenType.Identifier, this.strValue);
    }
    CssBlockDefinitionRuleAST.prototype.visit = function (visitor, context) { visitor.visitCssBlock(this.block, context); };
    return CssBlockDefinitionRuleAST;
})(CssBlockRuleAST);
exports.CssBlockDefinitionRuleAST = CssBlockDefinitionRuleAST;
var CssMediaQueryRuleAST = (function (_super) {
    __extends(CssMediaQueryRuleAST, _super);
    function CssMediaQueryRuleAST(query, block) {
        _super.call(this, BlockType.MediaQuery, query, block);
    }
    CssMediaQueryRuleAST.prototype.visit = function (visitor, context) { visitor.visitCssMediaQueryRule(this, context); };
    return CssMediaQueryRuleAST;
})(CssBlockDefinitionRuleAST);
exports.CssMediaQueryRuleAST = CssMediaQueryRuleAST;
var CssInlineRuleAST = (function (_super) {
    __extends(CssInlineRuleAST, _super);
    function CssInlineRuleAST(type, value) {
        _super.call(this);
        this.type = type;
        this.value = value;
    }
    CssInlineRuleAST.prototype.visit = function (visitor, context) { visitor.visitInlineCssRule(this, context); };
    return CssInlineRuleAST;
})(CssRuleAST);
exports.CssInlineRuleAST = CssInlineRuleAST;
var CssSelectorRuleAST = (function (_super) {
    __extends(CssSelectorRuleAST, _super);
    function CssSelectorRuleAST(selectors, block) {
        _super.call(this, BlockType.Selector, block);
        this.selectors = selectors;
        this.strValue = selectors.map(function (selector) { return selector.strValue; }).join(',');
    }
    CssSelectorRuleAST.prototype.visit = function (visitor, context) { visitor.visitCssSelectorRule(this, context); };
    return CssSelectorRuleAST;
})(CssBlockRuleAST);
exports.CssSelectorRuleAST = CssSelectorRuleAST;
var CssDefinitionAST = (function (_super) {
    __extends(CssDefinitionAST, _super);
    function CssDefinitionAST(property, value) {
        _super.call(this);
        this.property = property;
        this.value = value;
    }
    CssDefinitionAST.prototype.visit = function (visitor, context) { visitor.visitCssDefinition(this, context); };
    return CssDefinitionAST;
})(CssAST);
exports.CssDefinitionAST = CssDefinitionAST;
var CssSelectorAST = (function (_super) {
    __extends(CssSelectorAST, _super);
    function CssSelectorAST(tokens, isComplex) {
        if (isComplex === void 0) { isComplex = false; }
        _super.call(this);
        this.tokens = tokens;
        this.isComplex = isComplex;
        this.strValue = tokens.map(function (token) { return token.strValue; }).join('');
    }
    CssSelectorAST.prototype.visit = function (visitor, context) { visitor.visitCssSelector(this, context); };
    return CssSelectorAST;
})(CssAST);
exports.CssSelectorAST = CssSelectorAST;
var CssBlockAST = (function (_super) {
    __extends(CssBlockAST, _super);
    function CssBlockAST(entries) {
        _super.call(this);
        this.entries = entries;
    }
    CssBlockAST.prototype.visit = function (visitor, context) { visitor.visitCssBlock(this, context); };
    return CssBlockAST;
})(CssAST);
exports.CssBlockAST = CssBlockAST;
var CssStyleSheetAST = (function (_super) {
    __extends(CssStyleSheetAST, _super);
    function CssStyleSheetAST(rules) {
        _super.call(this);
        this.rules = rules;
    }
    CssStyleSheetAST.prototype.visit = function (visitor, context) { visitor.visitCssStyleSheet(this, context); };
    return CssStyleSheetAST;
})(CssAST);
exports.CssStyleSheetAST = CssStyleSheetAST;
var CssParseError = (function (_super) {
    __extends(CssParseError, _super);
    function CssParseError(span, message) {
        _super.call(this, span, message);
    }
    CssParseError.create = function (file, offset, line, col, length, errMsg) {
        var start = new parse_util_1.ParseLocation(file, offset, line, col);
        var end = new parse_util_1.ParseLocation(file, offset, line, col + length);
        var span = new parse_util_1.ParseSourceSpan(start, end);
        return new CssParseError(span, 'CSS Parse Error: ' + errMsg);
    };
    return CssParseError;
})(parse_util_1.ParseError);
exports.CssParseError = CssParseError;
var CssUnknownTokenListAST = (function (_super) {
    __extends(CssUnknownTokenListAST, _super);
    function CssUnknownTokenListAST(name, tokens) {
        _super.call(this);
        this.name = name;
        this.tokens = tokens;
    }
    CssUnknownTokenListAST.prototype.visit = function (visitor, context) { visitor.visitUnkownRule(this, context); };
    return CssUnknownTokenListAST;
})(CssRuleAST);
exports.CssUnknownTokenListAST = CssUnknownTokenListAST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1Qdk91Ump2eC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2Nzcy9wYXJzZXIudHMiXSwibmFtZXMiOlsiQmxvY2tUeXBlIiwibWVyZ2VUb2tlbnMiLCJnZXREZWxpbUZyb21Ub2tlbiIsImdldERlbGltRnJvbUNoYXJhY3RlciIsImNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyIiwiQ3NzQVNUIiwiQ3NzQVNULmNvbnN0cnVjdG9yIiwiQ3NzQVNULnZpc2l0IiwiUGFyc2VkQ3NzUmVzdWx0IiwiUGFyc2VkQ3NzUmVzdWx0LmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VyIiwiQ3NzUGFyc2VyLmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VyLl9yZXNvbHZlQmxvY2tUeXBlIiwiQ3NzUGFyc2VyLnBhcnNlIiwiQ3NzUGFyc2VyLl9wYXJzZVN0eWxlU2hlZXQiLCJDc3NQYXJzZXIuX3BhcnNlUnVsZSIsIkNzc1BhcnNlci5fcGFyc2VBdFJ1bGUiLCJDc3NQYXJzZXIuX3BhcnNlU2VsZWN0b3JSdWxlIiwiQ3NzUGFyc2VyLl9wYXJzZVNlbGVjdG9ycyIsIkNzc1BhcnNlci5fc2NhbiIsIkNzc1BhcnNlci5fY29uc3VtZSIsIkNzc1BhcnNlci5fcGFyc2VLZXlmcmFtZUJsb2NrIiwiQ3NzUGFyc2VyLl9wYXJzZUtleWZyYW1lRGVmaW5pdGlvbiIsIkNzc1BhcnNlci5fcGFyc2VLZXlmcmFtZUxhYmVsIiwiQ3NzUGFyc2VyLl9wYXJzZVNlbGVjdG9yIiwiQ3NzUGFyc2VyLl9wYXJzZVZhbHVlIiwiQ3NzUGFyc2VyLl9jb2xsZWN0VW50aWxEZWxpbSIsIkNzc1BhcnNlci5fcGFyc2VCbG9jayIsIkNzc1BhcnNlci5fcGFyc2VTdHlsZUJsb2NrIiwiQ3NzUGFyc2VyLl9wYXJzZURlZmluaXRpb24iLCJDc3NQYXJzZXIuX2Fzc2VydENvbmRpdGlvbiIsIkNzc1BhcnNlci5fZXJyb3IiLCJDc3NTdHlsZVZhbHVlQVNUIiwiQ3NzU3R5bGVWYWx1ZUFTVC5jb25zdHJ1Y3RvciIsIkNzc1N0eWxlVmFsdWVBU1QudmlzaXQiLCJDc3NSdWxlQVNUIiwiQ3NzUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc0Jsb2NrUnVsZUFTVCIsIkNzc0Jsb2NrUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc0Jsb2NrUnVsZUFTVC52aXNpdCIsIkNzc0tleWZyYW1lUnVsZUFTVCIsIkNzc0tleWZyYW1lUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc0tleWZyYW1lUnVsZUFTVC52aXNpdCIsIkNzc0tleWZyYW1lRGVmaW5pdGlvbkFTVCIsIkNzc0tleWZyYW1lRGVmaW5pdGlvbkFTVC5jb25zdHJ1Y3RvciIsIkNzc0tleWZyYW1lRGVmaW5pdGlvbkFTVC52aXNpdCIsIkNzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1QiLCJDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzQmxvY2tEZWZpbml0aW9uUnVsZUFTVC52aXNpdCIsIkNzc01lZGlhUXVlcnlSdWxlQVNUIiwiQ3NzTWVkaWFRdWVyeVJ1bGVBU1QuY29uc3RydWN0b3IiLCJDc3NNZWRpYVF1ZXJ5UnVsZUFTVC52aXNpdCIsIkNzc0lubGluZVJ1bGVBU1QiLCJDc3NJbmxpbmVSdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzSW5saW5lUnVsZUFTVC52aXNpdCIsIkNzc1NlbGVjdG9yUnVsZUFTVCIsIkNzc1NlbGVjdG9yUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc1NlbGVjdG9yUnVsZUFTVC52aXNpdCIsIkNzc0RlZmluaXRpb25BU1QiLCJDc3NEZWZpbml0aW9uQVNULmNvbnN0cnVjdG9yIiwiQ3NzRGVmaW5pdGlvbkFTVC52aXNpdCIsIkNzc1NlbGVjdG9yQVNUIiwiQ3NzU2VsZWN0b3JBU1QuY29uc3RydWN0b3IiLCJDc3NTZWxlY3RvckFTVC52aXNpdCIsIkNzc0Jsb2NrQVNUIiwiQ3NzQmxvY2tBU1QuY29uc3RydWN0b3IiLCJDc3NCbG9ja0FTVC52aXNpdCIsIkNzc1N0eWxlU2hlZXRBU1QiLCJDc3NTdHlsZVNoZWV0QVNULmNvbnN0cnVjdG9yIiwiQ3NzU3R5bGVTaGVldEFTVC52aXNpdCIsIkNzc1BhcnNlRXJyb3IiLCJDc3NQYXJzZUVycm9yLmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VFcnJvci5jcmVhdGUiLCJDc3NVbmtub3duVG9rZW5MaXN0QVNUIiwiQ3NzVW5rbm93blRva2VuTGlzdEFTVC5jb25zdHJ1Y3RvciIsIkNzc1Vua25vd25Ub2tlbkxpc3RBU1QudmlzaXQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQTBFLGtDQUFrQyxDQUFDLENBQUE7QUFFN0cscUJBQTZFLDBCQUEwQixDQUFDLENBQUE7QUFFeEcsc0JBQWtOLGlDQUFpQyxDQUFDLENBQUE7QUFFcFAsc0JBQXVCLGlDQUFpQyxDQUFDO0FBQWpELG9DQUFpRDtBQUV6RCxXQUFZLFNBQVM7SUFDbkJBLDZDQUFNQSxDQUFBQTtJQUNOQSwrQ0FBT0EsQ0FBQUE7SUFDUEEsbURBQVNBLENBQUFBO0lBQ1RBLGlEQUFRQSxDQUFBQTtJQUNSQSxtREFBU0EsQ0FBQUE7SUFDVEEscURBQVVBLENBQUFBO0lBQ1ZBLGlEQUFRQSxDQUFBQTtJQUNSQSxpREFBUUEsQ0FBQUE7SUFDUkEseUNBQUlBLENBQUFBO0lBQ0pBLGlEQUFRQSxDQUFBQTtJQUNSQSxrREFBUUEsQ0FBQUE7SUFDUkEsd0RBQVdBLENBQUFBO0FBQ2JBLENBQUNBLEVBYlcsaUJBQVMsS0FBVCxpQkFBUyxRQWFwQjtBQWJELElBQVksU0FBUyxHQUFULGlCQWFYLENBQUE7QUFFRCxJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDcEIsSUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLElBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQztBQUN2QixJQUFNLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDdEIsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLElBQU0sZUFBZSxH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QUFLQSxDQUFDQSxDQUFDQTtnQkFDMUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLHNCQUFzQkEsRUFBRUEsQ0FBQ0E7Z0JBQ3ZDQSxNQUFNQSxDQUFDQSxJQUFJQSxnQkFBZ0JBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBRTNDQSxLQUFLQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUN4QkEsS0FBS0EsU0FBU0EsQ0FBQ0EsUUFBUUE7Z0JBQ3JCQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO2dCQUMxQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsZUFBZUEsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFFMUNBLEtBQUtBLFNBQVNBLENBQUNBLFNBQVNBO2dCQUN0QkEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsVUFBVUEsRUFBRUEsWUFBWUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFGQSwwQ0FBMENBO2dCQUMxQ0EsSUFBSUEsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JCQSxNQUFNQSxDQUFDQSxJQUFJQSxrQkFBa0JBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFFNUVBLEtBQUtBLFNBQVNBLENBQUNBLFVBQVVBO2dCQUN2QkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0Esb0JBQVlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO2dCQUNoREEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsVUFBVUEsRUFBRUEsWUFBWUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7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QUFDQTtRQUNsQkEsSUFBSUEsTUFBTUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDaEJBLElBQUlBLFFBQWtCQSxDQUFDQTtRQUN2QkEsT0FBT0EsQ0FBQ0EsMEJBQTBCQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxVQUFVQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUNuRUEsSUFBSUEsS0FBS0EsQ0FBQ0E7WUFDVkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLElBQUlBLElBQUlBLG9CQUFZQSxDQUFDQSxVQUFVQTtnQkFDL0RBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLElBQUlBLGVBQU9BLENBQUNBLENBQUNBLENBQUNBO2dCQUNsQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0Esb0JBQVlBLENBQUNBLFNBQVNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO2dCQUNuREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25CQSxRQUFRQSxJQUFJQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQTtnQkFFM0JBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLG9CQUFZQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO2dCQUV6REEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7Z0JBQ3JCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkJBLFFBQVFBLElBQUlBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBO2dCQUUzQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0Esb0JBQVlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO2dCQUVoREEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0Esb0JBQVlBLENBQUNBLFNBQVNBLEVBQUVBLEdB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QUFHQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUMvREEsQ0FBQ0E7SUFHSEYsb0JBQUNBO0FBQURBLENBQUNBLEFBWEQsRUFBbUMsdUJBQVUsRUFXNUM7QUFYWSxxQkFBYSxnQkFXekIsQ0FBQTtBQUVEO0lBQTRDRywwQ0FBVUE7SUFDcERBLGdDQUFtQkEsSUFBSUEsRUFBU0EsTUFBa0JBO1FBQUlDLGlCQUFPQSxDQUFDQTtRQUEzQ0EsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBQUE7UUFBU0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBWUE7SUFBYUEsQ0FBQ0E7SUFDaEVELHNDQUFLQSxHQUFMQSxVQUFNQSxPQUFzQkEsRUFBRUEsT0FBYUEsSUFBSUUsT0FBT0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDMUZGLDZCQUFDQTtBQUFEQSxDQUFDQSxBQUhELEVBQTRDLFVBQVUsRUFHckQ7QUFIWSw4QkFBc0IseUJBR2xDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1BhcnNlU291cmNlU3BhbiwgUGFyc2VTb3VyY2VGaWxlLCBQYXJzZUxvY2F0aW9uLCBQYXJzZUVycm9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvcGFyc2VfdXRpbCc7XG5cbmltcG9ydCB7Yml0V2lzZU9yLCBiaXRXaXNlQW5kLCBOdW1iZXJXcmFwcGVyLCBTdHJpbmdXcmFwcGVyLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7Q3NzTGV4ZXJNb2RlLCBDc3NUb2tlbiwgQ3NzVG9rZW5UeXBlLCBDc3NTY2FubmVyLCBDc3NTY2FubmVyRXJyb3IsIGdlbmVyYXRlRXJyb3JNZXNzYWdlLCAkQVQsICRFT0YsICRSQlJBQ0UsICRMQlJBQ0UsICRMQlJBQ0tFVCwgJFJCUkFDS0VULCAkTFBBUkVOLCAkUlBBUkVOLCAkQ09NTUEsICRDT0xPTiwgJFNFTUlDT0xPTiwgaXNOZXdsaW5lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyJztcblxuZXhwb3J0IHtDc3NUb2tlbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2Nzcy9sZXhlcic7XG5cbmV4cG9ydCBlbnVtIEJsb2NrVHlwZSB7XG4gIEltcG9ydCxcbiAgQ2hhcnNldCxcbiAgTmFtZXNwYWNlLFxuICBTdXBwb3J0cyxcbiAgS2V5ZnJhbWVzLFxuICBNZWRpYVF1ZXJ5LFxuICBTZWxlY3RvcixcbiAgRm9udEZhY2UsXG4gIFBhZ2UsXG4gIERvY3VtZW50LFxuICBWaWV3cG9ydCxcbiAgVW5zdXBwb3J0ZWRcbn1cblxuY29uc3QgRU9GX0RFTElNID0gMTtcbmNvbnN0IFJCUkFDRV9ERUxJTSA9IDI7XG5jb25zdCBMQlJBQ0VfREVMSU0gPSA0O1xuY29uc3QgQ09NTUFfREVMSU0gPSA4O1xuY29uc3QgQ09MT05fREVMSU0gPSAxNjtcbmNvbnN0IFNFTUlDT0xPTl9ERUxJTSA9IDMyO1xuY29uc3QgTkVXTElORV9ERUxJTSA9IDY0O1xuY29uc3QgUlBBUkVOX0RFTElNID0gMTI4O1xuXG5mdW5jdGlvbiBtZXJnZVRva2Vucyh0b2tlbnM6IENzc1Rva2VuW10sIHNlcGFyYXRvcjogc3RyaW5nID0gJycpOiBDc3NUb2tlbiB7XG4gIHZhciBtYWluVG9rZW4gPSB0b2tlbnNbMF07XG4gIHZhciBzdHIgPSBtYWluVG9rZW4uc3RyVmFsdWU7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgc3RyICs9IHNlcGFyYXRvciArIHRva2Vuc1tpXS5zdHJWYWx1ZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgQ3NzVG9rZW4obWFpblRva2VuLmluZGV4LCBtYWluVG9rZW4uY29sdW1uLCBtYWluVG9rZW4ubGluZSwgbWFpblRva2VuLnR5cGUsIHN0cik7XG59XG5cbmZ1bmN0aW9uIGdldERlbGltRnJvbVRva2VuKHRva2VuOiBDc3NUb2tlbik6IG51bWJlciB7XG4gIHJldHVybiBnZXREZWxpbUZyb21DaGFyYWN0ZXIodG9rZW4ubnVtVmFsdWUpO1xufVxuXG5mdW5jdGlvbiBnZXREZWxpbUZyb21DaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkRU9GOlxuICAgICAgcmV0dXJuIEVPRl9ERUxJTTtcbiAgICBjYXNlICRDT01NQTpcbiAgICAgIHJldHVybiBDT01NQV9ERUxJTTtcbiAgICBjYXNlICRDT0xPTjpcbiAgICAgIHJldHVybiBDT0xPTl9ERUxJTTtcbiAgICBjYXNlICRTRU1JQ09MT046XG4gICAgICByZXR1cm4gU0VNSUNPTE9OX0RFTElNO1xuICAgIGNhc2UgJFJCUkFDRTpcbiAgICAgIHJldHVybiBSQlJBQ0VfREVMSU07XG4gICAgY2FzZSAkTEJSQUNFOlxuICAgICAgcmV0dXJuIExCUkFDRV9ERUxJTTtcbiAgICBjYXNlICRSUEFSRU46XG4gICAgICByZXR1cm4gUlBBUkVOX0RFTElNO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gaXNOZXdsaW5lKGNvZGUpID8gTkVXTElORV9ERUxJTSA6IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIoY29kZTogbnVtYmVyLCBkZWxpbWl0ZXJzOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGJpdFdpc2VBbmQoW2dldERlbGltRnJvbUNoYXJhY3Rlcihjb2RlKSwgZGVsaW1pdGVyc10pID4gMDtcbn1cblxuZXhwb3J0IGNsYXNzIENzc0FTVCB7XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpOiB2b2lkIHt9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3NzQVNUVmlzaXRvciB7XG4gIHZpc2l0Q3NzVmFsdWUoYXN0OiBDc3NTdHlsZVZhbHVlQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRJbmxpbmVDc3NSdWxlKGFzdDogQ3NzSW5saW5lUnVsZUFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzS2V5ZnJhbWVSdWxlKGFzdDogQ3NzS2V5ZnJhbWVSdWxlQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NLZXlmcmFtZURlZmluaXRpb24oYXN0OiBDc3NLZXlmcmFtZURlZmluaXRpb25BU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc01lZGlhUXVlcnlSdWxlKGFzdDogQ3NzTWVkaWFRdWVyeVJ1bGVBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc1NlbGVjdG9yUnVsZShhc3Q6IENzc1NlbGVjdG9yUnVsZUFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzU2VsZWN0b3IoYXN0OiBDc3NTZWxlY3RvckFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzRGVmaW5pdGlvbihhc3Q6IENzc0RlZmluaXRpb25BU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc0Jsb2NrKGFzdDogQ3NzQmxvY2tBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc1N0eWxlU2hlZXQoYXN0OiBDc3NTdHlsZVNoZWV0QVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRVbmtvd25SdWxlKGFzdDogQ3NzVW5rbm93blRva2VuTGlzdEFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZWRDc3NSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXJyb3JzOiBDc3NQYXJzZUVycm9yW10sIHB1YmxpYyBhc3Q6IENzc1N0eWxlU2hlZXRBU1QpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NQYXJzZXIge1xuICBwcml2YXRlIF9lcnJvcnM6IENzc1BhcnNlRXJyb3JbXSA9IFtdO1xuICBwcml2YXRlIF9maWxlOiBQYXJzZVNvdXJjZUZpbGU7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfc2Nhbm5lcjogQ3NzU2Nhbm5lciwgcHJpdmF0ZSBfZmlsZU5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX2ZpbGUgPSBuZXcgUGFyc2VTb3VyY2VGaWxlKHRoaXMuX3NjYW5uZXIuaW5wdXQsIF9maWxlTmFtZSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZXNvbHZlQmxvY2tUeXBlKHRva2VuOiBDc3NUb2tlbik6IEJsb2NrVHlwZSB7XG4gICAgc3dpdGNoICh0b2tlbi5zdHJWYWx1ZSkge1xuICAgICAgY2FzZSAnQC1vLWtleWZyYW1lcyc6XG4gICAgICBjYXNlICdALW1vei1rZXlmcmFtZXMnOlxuICAgICAgY2FzZSAnQC13ZWJraXQta2V5ZnJhbWVzJzpcbiAgICAgIGNhc2UgJ0BrZXlmcmFtZXMnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLktleWZyYW1lcztcblxuICAgICAgY2FzZSAnQGNoYXJzZXQnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLkNoYXJzZXQ7XG5cbiAgICAgIGNhc2UgJ0BpbXBvcnQnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLkltcG9ydDtcblxuICAgICAgY2FzZSAnQG5hbWVzcGFjZSc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuTmFtZXNwYWNlO1xuXG4gICAgICBjYXNlICdAcGFnZSc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuUGFnZTtcblxuICAgICAgY2FzZSAnQGRvY3VtZW50JzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5Eb2N1bWVudDtcblxuICAgICAgY2FzZSAnQG1lZGlhJzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5NZWRpYVF1ZXJ5O1xuXG4gICAgICBjYXNlICdAZm9udC1mYWNlJzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5Gb250RmFjZTtcblxuICAgICAgY2FzZSAnQHZpZXdwb3J0JzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5WaWV3cG9ydDtcblxuICAgICAgY2FzZSAnQHN1cHBvcnRzJzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5TdXBwb3J0cztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5VbnN1cHBvcnRlZDtcbiAgICB9XG4gIH1cblxuICBwYXJzZSgpOiBQYXJzZWRDc3NSZXN1bHQge1xuICAgIHZhciBkZWxpbWl0ZXJzOiBudW1iZXIgPSBFT0ZfREVMSU07XG4gICAgdmFyIGFzdCA9IHRoaXMuX3BhcnNlU3R5bGVTaGVldChkZWxpbWl0ZXJzKTtcblxuICAgIHZhciBlcnJvcnMgPSB0aGlzLl9lcnJvcnM7XG4gICAgdGhpcy5fZXJyb3JzID0gW107XG5cbiAgICByZXR1cm4gbmV3IFBhcnNlZENzc1Jlc3VsdChlcnJvcnMsIGFzdCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZVN0eWxlU2hlZXQoZGVsaW1pdGVycyk6IENzc1N0eWxlU2hlZXRBU1Qge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG4gICAgd2hpbGUgKHRoaXMuX3NjYW5uZXIucGVlayAhPSAkRU9GKSB7XG4gICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkJMT0NLKTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9wYXJzZVJ1bGUoZGVsaW1pdGVycykpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENzc1N0eWxlU2hlZXRBU1QocmVzdWx0cyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZVJ1bGUoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzUnVsZUFTVCB7XG4gICAgaWYgKHRoaXMuX3NjYW5uZXIucGVlayA9PSAkQVQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJzZUF0UnVsZShkZWxpbWl0ZXJzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3BhcnNlU2VsZWN0b3JSdWxlKGRlbGltaXRlcnMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VBdFJ1bGUoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzUnVsZUFTVCB7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5CTE9DSyk7XG5cbiAgICB2YXIgdG9rZW4gPSB0aGlzLl9zY2FuKCk7XG5cbiAgICB0aGlzLl9hc3NlcnRDb25kaXRpb24oXG4gICAgICAgIHRva2VuLnR5cGUgPT0gQ3NzVG9rZW5UeXBlLkF0S2V5d29yZCxcbiAgICAgICAgYFRoZSBDU1MgUnVsZSAke3Rva2VuLnN0clZhbHVlfSBpcyBub3QgYSB2YWxpZCBbQF0gcnVsZS5gLCB0b2tlbik7XG5cbiAgICB2YXIgYmxvY2ssIHR5cGUgPSB0aGlzLl9yZXNvbHZlQmxvY2tUeXBlKHRva2VuKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgQmxvY2tUeXBlLkNoYXJzZXQ6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5OYW1lc3BhY2U6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5JbXBvcnQ6XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuX3BhcnNlVmFsdWUoZGVsaW1pdGVycyk7XG4gICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgICAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDc3NJbmxpbmVSdWxlQVNUKHR5cGUsIHZhbHVlKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuVmlld3BvcnQ6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5Gb250RmFjZTpcbiAgICAgICAgYmxvY2sgPSB0aGlzLl9wYXJzZVN0eWxlQmxvY2soZGVsaW1pdGVycyk7XG4gICAgICAgIHJldHVybiBuZXcgQ3NzQmxvY2tSdWxlQVNUKHR5cGUsIGJsb2NrKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuS2V5ZnJhbWVzOlxuICAgICAgICB2YXIgdG9rZW5zID0gdGhpcy5fY29sbGVjdFVudGlsRGVsaW0oYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU0sIExCUkFDRV9ERUxJTV0pKTtcbiAgICAgICAgLy8ga2V5ZnJhbWVzIG9ubHkgaGF2ZSBvbmUgaWRlbnRpZmllciBuYW1lXG4gICAgICAgIHZhciBuYW1lID0gdG9rZW5zWzBdO1xuICAgICAgICByZXR1cm4gbmV3IENzc0tleWZyYW1lUnVsZUFTVChuYW1lLCB0aGlzLl9wYXJzZUtleWZyYW1lQmxvY2soZGVsaW1pdGVycykpO1xuXG4gICAgICBjYXNlIEJsb2NrVHlwZS5NZWRpYVF1ZXJ5OlxuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLk1FRElBX1FVRVJZKTtcbiAgICAgICAgdmFyIHRva2VucyA9IHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNLCBMQlJBQ0VfREVMSU1dKSk7XG4gICAgICAgIHJldHVybiBuZXcgQ3NzTWVkaWFRdWVyeVJ1bGVBU1QodG9rZW5zLCB0aGlzLl9wYXJzZUJsb2NrKGRlbGltaXRlcnMpKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuRG9jdW1lbnQ6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5TdXBwb3J0czpcbiAgICAgIGNhc2UgQmxvY2tUeXBlLlBhZ2U6XG4gICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQVRfUlVMRV9RVUVSWSk7XG4gICAgICAgIHZhciB0b2tlbnMgPSB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTSwgTEJSQUNFX0RFTElNXSkpO1xuICAgICAgICByZXR1cm4gbmV3IENzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1QodHlwZSwgdG9rZW5zLCB0aGlzLl9wYXJzZUJsb2NrKGRlbGltaXRlcnMpKTtcblxuICAgICAgLy8gaWYgYSBjdXN0b20gQHJ1bGUgeyAuLi4gfSBpcyB1c2VkIGl0IHNob3VsZCBzdGlsbCB0b2tlbml6ZSB0aGUgaW5zaWRlc1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIGxpc3RPZlRva2VucyA9IFtdO1xuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkFMTCk7XG4gICAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgICAgZ2VuZXJhdGVFcnJvck1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nhbm5lci5pbnB1dCxcbiAgICAgICAgICAgICAgICBgVGhlIENTUyBcImF0XCIgcnVsZSBcIiR7dG9rZW4uc3RyVmFsdWV9XCIgaXMgbm90IGFsbG93ZWQgdG8gdXNlZCBoZXJlYCwgdG9rZW4uc3RyVmFsdWUsXG4gICAgICAgICAgICAgICAgdG9rZW4uaW5kZXgsIHRva2VuLmxpbmUsIHRva2VuLmNvbHVtbiksXG4gICAgICAgICAgICB0b2tlbik7XG5cbiAgICAgICAgdGhpcy5fY29sbGVjdFVudGlsRGVsaW0oYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBMQlJBQ0VfREVMSU0sIFNFTUlDT0xPTl9ERUxJTV0pKVxuICAgICAgICAgICAgLmZvckVhY2goKHRva2VuKSA9PiB7IGxpc3RPZlRva2Vucy5wdXNoKHRva2VuKTsgfSk7XG4gICAgICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgPT0gJExCUkFDRSkge1xuICAgICAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ3snKTtcbiAgICAgICAgICB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTSwgTEJSQUNFX0RFTElNXSkpXG4gICAgICAgICAgICAgIC5mb3JFYWNoKCh0b2tlbikgPT4geyBsaXN0T2ZUb2tlbnMucHVzaCh0b2tlbik7IH0pO1xuICAgICAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ30nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IENzc1Vua25vd25Ub2tlbkxpc3RBU1QodG9rZW4sIGxpc3RPZlRva2Vucyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VTZWxlY3RvclJ1bGUoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzU2VsZWN0b3JSdWxlQVNUIHtcbiAgICB2YXIgc2VsZWN0b3JzID0gdGhpcy5fcGFyc2VTZWxlY3RvcnMoZGVsaW1pdGVycyk7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5fcGFyc2VTdHlsZUJsb2NrKGRlbGltaXRlcnMpO1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuICAgIHJldHVybiBuZXcgQ3NzU2VsZWN0b3JSdWxlQVNUKHNlbGVjdG9ycywgYmxvY2spO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VTZWxlY3RvcnMoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzU2VsZWN0b3JBU1RbXSB7XG4gICAgZGVsaW1pdGVycyA9IGJpdFdpc2VPcihbZGVsaW1pdGVycywgTEJSQUNFX0RFTElNXSk7XG5cbiAgICB2YXIgc2VsZWN0b3JzID0gW107XG4gICAgdmFyIGlzUGFyc2luZ1NlbGVjdG9ycyA9IHRydWU7XG4gICAgd2hpbGUgKGlzUGFyc2luZ1NlbGVjdG9ycykge1xuICAgICAgc2VsZWN0b3JzLnB1c2godGhpcy5fcGFyc2VTZWxlY3RvcihkZWxpbWl0ZXJzKSk7XG5cbiAgICAgIGlzUGFyc2luZ1NlbGVjdG9ycyA9ICFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpO1xuXG4gICAgICBpZiAoaXNQYXJzaW5nU2VsZWN0b3JzKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJywnKTtcbiAgICAgICAgaXNQYXJzaW5nU2VsZWN0b3JzID0gIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdG9ycztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NjYW4oKTogQ3NzVG9rZW4ge1xuICAgIHZhciBvdXRwdXQgPSB0aGlzLl9zY2FubmVyLnNjYW4oKTtcbiAgICB2YXIgdG9rZW4gPSBvdXRwdXQudG9rZW47XG4gICAgdmFyIGVycm9yID0gb3V0cHV0LmVycm9yO1xuICAgIGlmIChpc1ByZXNlbnQoZXJyb3IpKSB7XG4gICAgICB0aGlzLl9lcnJvcihlcnJvci5yYXdNZXNzYWdlLCB0b2tlbik7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbnN1bWUodHlwZTogQ3NzVG9rZW5UeXBlLCB2YWx1ZTogc3RyaW5nID0gbnVsbCk6IENzc1Rva2VuIHtcbiAgICB2YXIgb3V0cHV0ID0gdGhpcy5fc2Nhbm5lci5jb25zdW1lKHR5cGUsIHZhbHVlKTtcbiAgICB2YXIgdG9rZW4gPSBvdXRwdXQudG9rZW47XG4gICAgdmFyIGVycm9yID0gb3V0cHV0LmVycm9yO1xuICAgIGlmIChpc1ByZXNlbnQoZXJyb3IpKSB7XG4gICAgICB0aGlzLl9lcnJvcihlcnJvci5yYXdNZXNzYWdlLCB0b2tlbik7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlS2V5ZnJhbWVCbG9jayhkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NCbG9ja0FTVCB7XG4gICAgZGVsaW1pdGVycyA9IGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNXSk7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5LRVlGUkFNRV9CTE9DSyk7XG5cbiAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd7Jyk7XG5cbiAgICB2YXIgZGVmaW5pdGlvbnMgPSBbXTtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIGRlZmluaXRpb25zLnB1c2godGhpcy5fcGFyc2VLZXlmcmFtZURlZmluaXRpb24oZGVsaW1pdGVycykpO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ30nKTtcblxuICAgIHJldHVybiBuZXcgQ3NzQmxvY2tBU1QoZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VLZXlmcmFtZURlZmluaXRpb24oZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNUIHtcbiAgICB2YXIgc3RlcFRva2VucyA9IFtdO1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIExCUkFDRV9ERUxJTV0pO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgc3RlcFRva2Vucy5wdXNoKHRoaXMuX3BhcnNlS2V5ZnJhbWVMYWJlbChiaXRXaXNlT3IoW2RlbGltaXRlcnMsIENPTU1BX0RFTElNXSkpKTtcbiAgICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgIT0gJExCUkFDRSkge1xuICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcsJyk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBzdHlsZXMgPSB0aGlzLl9wYXJzZVN0eWxlQmxvY2soYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU1dKSk7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5CTE9DSyk7XG4gICAgcmV0dXJuIG5ldyBDc3NLZXlmcmFtZURlZmluaXRpb25BU1Qoc3RlcFRva2Vucywgc3R5bGVzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlS2V5ZnJhbWVMYWJlbChkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NUb2tlbiB7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5LRVlGUkFNRV9CTE9DSyk7XG4gICAgcmV0dXJuIG1lcmdlVG9rZW5zKHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKGRlbGltaXRlcnMpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlU2VsZWN0b3IoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzU2VsZWN0b3JBU1Qge1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIENPTU1BX0RFTElNLCBMQlJBQ0VfREVMSU1dKTtcbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNFTEVDVE9SKTtcblxuICAgIHZhciBzZWxlY3RvckNzc1Rva2VucyA9IFtdO1xuICAgIHZhciBpc0NvbXBsZXggPSBmYWxzZTtcbiAgICB2YXIgd3NDc3NUb2tlbjtcblxuICAgIHZhciBwcmV2aW91c1Rva2VuO1xuICAgIHZhciBwYXJlbkNvdW50ID0gMDtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIHZhciBjb2RlID0gdGhpcy5fc2Nhbm5lci5wZWVrO1xuICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgIGNhc2UgJExQQVJFTjpcbiAgICAgICAgICBwYXJlbkNvdW50Kys7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAkUlBBUkVOOlxuICAgICAgICAgIHBhcmVuQ291bnQtLTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICRDT0xPTjpcbiAgICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlBTRVVET19TRUxFQ1RPUik7XG4gICAgICAgICAgcHJldmlvdXNUb2tlbiA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJzonKTtcbiAgICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHByZXZpb3VzVG9rZW4pO1xuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGNhc2UgJExCUkFDS0VUOlxuICAgICAgICAgIC8vIGlmIHdlIGFyZSBhbHJlYWR5IGluc2lkZSBhbiBhdHRyaWJ1dGUgc2VsZWN0b3IgdGhlbiB3ZSBjYW4ndFxuICAgICAgICAgIC8vIGp1bXAgaW50byB0aGUgbW9kZSBhZ2Fpbi4gVGhlcmVmb3JlIHRoaXMgZXJyb3Igd2lsbCBnZXQgcGlja2VkXG4gICAgICAgICAgLy8gdXAgd2hlbiB0aGUgc2NhbiBtZXRob2QgaXMgY2FsbGVkIGJlbG93LlxuICAgICAgICAgIGlmICh0aGlzLl9zY2FubmVyLmdldE1vZGUoKSAhPSBDc3NMZXhlck1vZGUuQVRUUklCVVRFX1NFTEVDVE9SKSB7XG4gICAgICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ1snKSk7XG4gICAgICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkFUVFJJQlVURV9TRUxFQ1RPUik7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAkUkJSQUNLRVQ6XG4gICAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICddJykpO1xuICAgICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU0VMRUNUT1IpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgdG9rZW4gPSB0aGlzLl9zY2FuKCk7XG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgdGhlIFwiOm5vdChcIiBzZWxlY3RvciBzaW5jZSBpdFxuICAgICAgLy8gY29udGFpbnMgYW4gaW5uZXIgc2VsZWN0b3IgdGhhdCBuZWVkcyB0byBiZSBwYXJzZWRcbiAgICAgIC8vIGluIGlzb2xhdGlvblxuICAgICAgaWYgKHRoaXMuX3NjYW5uZXIuZ2V0TW9kZSgpID09IENzc0xleGVyTW9kZS5QU0VVRE9fU0VMRUNUT1IgJiYgaXNQcmVzZW50KHByZXZpb3VzVG9rZW4pICYmXG4gICAgICAgICAgcHJldmlvdXNUb2tlbi5udW1WYWx1ZSA9PSAkQ09MT04gJiYgdG9rZW4uc3RyVmFsdWUgPT0gJ25vdCcgJiZcbiAgICAgICAgICB0aGlzLl9zY2FubmVyLnBlZWsgPT0gJExQQVJFTikge1xuICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcoJykpO1xuXG4gICAgICAgIC8vIHRoZSBpbm5lciBzZWxlY3RvciBpbnNpZGUgb2YgOm5vdCguLi4pIGNhbiBvbmx5IGJlIG9uZVxuICAgICAgICAvLyBDU1Mgc2VsZWN0b3IgKG5vIGNvbW1hcyBhbGxvd2VkKSB0aGVyZWZvcmUgd2UgcGFyc2Ugb25seVxuICAgICAgICAvLyBvbmUgc2VsZWN0b3IgYnkgY2FsbGluZyB0aGUgbWV0aG9kIGJlbG93XG4gICAgICAgIHRoaXMuX3BhcnNlU2VsZWN0b3IoYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSUEFSRU5fREVMSU1dKSlcbiAgICAgICAgICAgIC50b2tlbnMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAoaW5uZXJTZWxlY3RvclRva2VuKSA9PiB7IHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2goaW5uZXJTZWxlY3RvclRva2VuKTsgfSk7XG5cbiAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcpJykpO1xuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBwcmV2aW91c1Rva2VuID0gdG9rZW47XG5cbiAgICAgIGlmICh0b2tlbi50eXBlID09IENzc1Rva2VuVHlwZS5XaGl0ZXNwYWNlKSB7XG4gICAgICAgIHdzQ3NzVG9rZW4gPSB0b2tlbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQod3NDc3NUb2tlbikpIHtcbiAgICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHdzQ3NzVG9rZW4pO1xuICAgICAgICAgIHdzQ3NzVG9rZW4gPSBudWxsO1xuICAgICAgICAgIGlzQ29tcGxleCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3NjYW5uZXIuZ2V0TW9kZSgpID09IENzc0xleGVyTW9kZS5BVFRSSUJVVEVfU0VMRUNUT1IpIHtcbiAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgIGBVbmJhbGFuY2VkIENTUyBhdHRyaWJ1dGUgc2VsZWN0b3IgYXQgY29sdW1uICR7cHJldmlvdXNUb2tlbi5saW5lfToke3ByZXZpb3VzVG9rZW4uY29sdW1ufWAsXG4gICAgICAgICAgcHJldmlvdXNUb2tlbik7XG4gICAgfSBlbHNlIGlmIChwYXJlbkNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgYFVuYmFsYW5jZWQgcHNldWRvIHNlbGVjdG9yIGZ1bmN0aW9uIHZhbHVlIGF0IGNvbHVtbiAke3ByZXZpb3VzVG9rZW4ubGluZX06JHtwcmV2aW91c1Rva2VuLmNvbHVtbn1gLFxuICAgICAgICAgIHByZXZpb3VzVG9rZW4pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ3NzU2VsZWN0b3JBU1Qoc2VsZWN0b3JDc3NUb2tlbnMsIGlzQ29tcGxleCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZVZhbHVlKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1N0eWxlVmFsdWVBU1Qge1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTSwgU0VNSUNPTE9OX0RFTElNLCBORVdMSU5FX0RFTElNXSk7XG5cbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFKTtcblxuICAgIHZhciBzdHJWYWx1ZSA9ICcnO1xuICAgIHZhciB0b2tlbnMgPSBbXTtcbiAgICB2YXIgcHJldmlvdXM6IENzc1Rva2VuO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgdmFyIHRva2VuO1xuICAgICAgaWYgKGlzUHJlc2VudChwcmV2aW91cykgJiYgcHJldmlvdXMudHlwZSA9PSBDc3NUb2tlblR5cGUuSWRlbnRpZmllciAmJlxuICAgICAgICAgIHRoaXMuX3NjYW5uZXIucGVlayA9PSAkTFBBUkVOKSB7XG4gICAgICAgIHRva2VuID0gdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnKCcpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIHN0clZhbHVlICs9IHRva2VuLnN0clZhbHVlO1xuXG4gICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU1RZTEVfVkFMVUVfRlVOQ1RJT04pO1xuXG4gICAgICAgIHRva2VuID0gdGhpcy5fc2NhbigpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIHN0clZhbHVlICs9IHRva2VuLnN0clZhbHVlO1xuXG4gICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU1RZTEVfVkFMVUUpO1xuXG4gICAgICAgIHRva2VuID0gdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnKScpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIHN0clZhbHVlICs9IHRva2VuLnN0clZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW4gPSB0aGlzLl9zY2FuKCk7XG4gICAgICAgIGlmICh0b2tlbi50eXBlICE9IENzc1Rva2VuVHlwZS5XaGl0ZXNwYWNlKSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIHN0clZhbHVlICs9IHRva2VuLnN0clZhbHVlO1xuICAgICAgfVxuXG4gICAgICBwcmV2aW91cyA9IHRva2VuO1xuICAgIH1cblxuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZVdoaXRlc3BhY2UoKTtcblxuICAgIHZhciBjb2RlID0gdGhpcy5fc2Nhbm5lci5wZWVrO1xuICAgIGlmIChjb2RlID09ICRTRU1JQ09MT04pIHtcbiAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJzsnKTtcbiAgICB9IGVsc2UgaWYgKGNvZGUgIT0gJFJCUkFDRSkge1xuICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgZ2VuZXJhdGVFcnJvck1lc3NhZ2UoXG4gICAgICAgICAgICAgIHRoaXMuX3NjYW5uZXIuaW5wdXQsIGBUaGUgQ1NTIGtleS92YWx1ZSBkZWZpbml0aW9uIGRpZCBub3QgZW5kIHdpdGggYSBzZW1pY29sb25gLFxuICAgICAgICAgICAgICBwcmV2aW91cy5zdHJWYWx1ZSwgcHJldmlvdXMuaW5kZXgsIHByZXZpb3VzLmxpbmUsIHByZXZpb3VzLmNvbHVtbiksXG4gICAgICAgICAgcHJldmlvdXMpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ3NzU3R5bGVWYWx1ZUFTVCh0b2tlbnMsIHN0clZhbHVlKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbGxlY3RVbnRpbERlbGltKGRlbGltaXRlcnM6IG51bWJlciwgYXNzZXJ0VHlwZTogQ3NzVG9rZW5UeXBlID0gbnVsbCk6IENzc1Rva2VuW10ge1xuICAgIHZhciB0b2tlbnMgPSBbXTtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIHZhciB2YWwgPSBpc1ByZXNlbnQoYXNzZXJ0VHlwZSkgPyB0aGlzLl9jb25zdW1lKGFzc2VydFR5cGUpIDogdGhpcy5fc2NhbigpO1xuICAgICAgdG9rZW5zLnB1c2godmFsKTtcbiAgICB9XG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlQmxvY2soZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzQmxvY2tBU1Qge1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTV0pO1xuXG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5CTE9DSyk7XG5cbiAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd7Jyk7XG4gICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG5cbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3BhcnNlUnVsZShkZWxpbWl0ZXJzKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnfScpO1xuXG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5CTE9DSyk7XG4gICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG5cbiAgICByZXR1cm4gbmV3IENzc0Jsb2NrQVNUKHJlc3VsdHMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VTdHlsZUJsb2NrKGRlbGltaXRlcnM6IG51bWJlcik6IENzc0Jsb2NrQVNUIHtcbiAgICBkZWxpbWl0ZXJzID0gYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU0sIExCUkFDRV9ERUxJTV0pO1xuXG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5TVFlMRV9CTE9DSyk7XG5cbiAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd7Jyk7XG4gICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG5cbiAgICB2YXIgZGVmaW5pdGlvbnMgPSBbXTtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIGRlZmluaXRpb25zLnB1c2godGhpcy5fcGFyc2VEZWZpbml0aW9uKGRlbGltaXRlcnMpKTtcbiAgICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ30nKTtcblxuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU1RZTEVfQkxPQ0spO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuXG4gICAgcmV0dXJuIG5ldyBDc3NCbG9ja0FTVChkZWZpbml0aW9ucyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZURlZmluaXRpb24oZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzRGVmaW5pdGlvbkFTVCB7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5TVFlMRV9CTE9DSyk7XG5cbiAgICB2YXIgcHJvcCA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIpO1xuICAgIHZhciBwYXJzZVZhbHVlLCB2YWx1ZSA9IG51bGw7XG5cbiAgICAvLyB0aGUgY29sb24gdmFsdWUgc2VwYXJhdGVzIHRoZSBwcm9wIGZyb20gdGhlIHN0eWxlLlxuICAgIC8vIHRoZXJlIGFyZSBhIGZldyBjYXNlcyBhcyB0byB3aGF0IGNvdWxkIGhhcHBlbiBpZiBpdFxuICAgIC8vIGlzIG1pc3NpbmdcbiAgICBzd2l0Y2ggKHRoaXMuX3NjYW5uZXIucGVlaykge1xuICAgICAgY2FzZSAkQ09MT046XG4gICAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJzonKTtcbiAgICAgICAgcGFyc2VWYWx1ZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICRTRU1JQ09MT046XG4gICAgICBjYXNlICRSQlJBQ0U6XG4gICAgICBjYXNlICRFT0Y6XG4gICAgICAgIHBhcnNlVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBwcm9wU3RyID0gW3Byb3Auc3RyVmFsdWVdO1xuICAgICAgICBpZiAodGhpcy5fc2Nhbm5lci5wZWVrICE9ICRDT0xPTikge1xuICAgICAgICAgIC8vIHRoaXMgd2lsbCB0aHJvdyB0aGUgZXJyb3JcbiAgICAgICAgICB2YXIgbmV4dFZhbHVlID0gdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnOicpO1xuICAgICAgICAgIHByb3BTdHIucHVzaChuZXh0VmFsdWUuc3RyVmFsdWUpO1xuXG4gICAgICAgICAgdmFyIHJlbWFpbmluZ1Rva2VucyA9IHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKFxuICAgICAgICAgICAgICBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIENPTE9OX0RFTElNLCBTRU1JQ09MT05fREVMSU1dKSwgQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIpO1xuICAgICAgICAgIGlmIChyZW1haW5pbmdUb2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVG9rZW5zLmZvckVhY2goKHRva2VuKSA9PiB7IHByb3BTdHIucHVzaCh0b2tlbi5zdHJWYWx1ZSk7IH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHByb3AgPSBuZXcgQ3NzVG9rZW4ocHJvcC5pbmRleCwgcHJvcC5jb2x1bW4sIHByb3AubGluZSwgcHJvcC50eXBlLCBwcm9wU3RyLmpvaW4oJyAnKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzIG1lYW5zIHdlJ3ZlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgZGVmaW5pdGlvbiBhbmQvb3IgYmxvY2tcbiAgICAgICAgaWYgKHRoaXMuX3NjYW5uZXIucGVlayA9PSAkQ09MT04pIHtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICc6Jyk7XG4gICAgICAgICAgcGFyc2VWYWx1ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFyc2VWYWx1ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChwYXJzZVZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuX3BhcnNlVmFsdWUoZGVsaW1pdGVycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgIGdlbmVyYXRlRXJyb3JNZXNzYWdlKFxuICAgICAgICAgICAgICB0aGlzLl9zY2FubmVyLmlucHV0LCBgVGhlIENTUyBwcm9wZXJ0eSB3YXMgbm90IHBhaXJlZCB3aXRoIGEgc3R5bGUgdmFsdWVgLFxuICAgICAgICAgICAgICBwcm9wLnN0clZhbHVlLCBwcm9wLmluZGV4LCBwcm9wLmxpbmUsIHByb3AuY29sdW1uKSxcbiAgICAgICAgICBwcm9wKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENzc0RlZmluaXRpb25BU1QocHJvcCwgdmFsdWUpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXNzZXJ0Q29uZGl0aW9uKHN0YXR1czogYm9vbGVhbiwgZXJyb3JNZXNzYWdlOiBzdHJpbmcsIHByb2JsZW1Ub2tlbjogQ3NzVG9rZW4pOiBib29sZWFuIHtcbiAgICBpZiAoIXN0YXR1cykge1xuICAgICAgdGhpcy5fZXJyb3IoZXJyb3JNZXNzYWdlLCBwcm9ibGVtVG9rZW4pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Vycm9yKG1lc3NhZ2U6IHN0cmluZywgcHJvYmxlbVRva2VuOiBDc3NUb2tlbikge1xuICAgIHZhciBsZW5ndGggPSBwcm9ibGVtVG9rZW4uc3RyVmFsdWUubGVuZ3RoO1xuICAgIHZhciBlcnJvciA9IENzc1BhcnNlRXJyb3IuY3JlYXRlKFxuICAgICAgICB0aGlzLl9maWxlLCAwLCBwcm9ibGVtVG9rZW4ubGluZSwgcHJvYmxlbVRva2VuLmNvbHVtbiwgbGVuZ3RoLCBtZXNzYWdlKTtcbiAgICB0aGlzLl9lcnJvcnMucHVzaChlcnJvcik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1N0eWxlVmFsdWVBU1QgZXh0ZW5kcyBDc3NBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW5zOiBDc3NUb2tlbltdLCBwdWJsaWMgc3RyVmFsdWU6IHN0cmluZykgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc1ZhbHVlKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NSdWxlQVNUIGV4dGVuZHMgQ3NzQVNUIHt9XG5cbmV4cG9ydCBjbGFzcyBDc3NCbG9ja1J1bGVBU1QgZXh0ZW5kcyBDc3NSdWxlQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHR5cGU6IEJsb2NrVHlwZSwgcHVibGljIGJsb2NrOiBDc3NCbG9ja0FTVCwgcHVibGljIG5hbWU6IENzc1Rva2VuID0gbnVsbCkge1xuICAgIHN1cGVyKCk7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzQmxvY2sodGhpcy5ibG9jaywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc0tleWZyYW1lUnVsZUFTVCBleHRlbmRzIENzc0Jsb2NrUnVsZUFTVCB7XG4gIGNvbnN0cnVjdG9yKG5hbWU6IENzc1Rva2VuLCBibG9jazogQ3NzQmxvY2tBU1QpIHsgc3VwZXIoQmxvY2tUeXBlLktleWZyYW1lcywgYmxvY2ssIG5hbWUpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0tleWZyYW1lUnVsZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNUIGV4dGVuZHMgQ3NzQmxvY2tSdWxlQVNUIHtcbiAgcHVibGljIHN0ZXBzO1xuICBjb25zdHJ1Y3Rvcihfc3RlcHM6IENzc1Rva2VuW10sIGJsb2NrOiBDc3NCbG9ja0FTVCkge1xuICAgIHN1cGVyKEJsb2NrVHlwZS5LZXlmcmFtZXMsIGJsb2NrLCBtZXJnZVRva2Vucyhfc3RlcHMsICcsJykpO1xuICAgIHRoaXMuc3RlcHMgPSBfc3RlcHM7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkge1xuICAgIHZpc2l0b3IudmlzaXRDc3NLZXlmcmFtZURlZmluaXRpb24odGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1QgZXh0ZW5kcyBDc3NCbG9ja1J1bGVBU1Qge1xuICBwdWJsaWMgc3RyVmFsdWU6IHN0cmluZztcbiAgY29uc3RydWN0b3IodHlwZTogQmxvY2tUeXBlLCBwdWJsaWMgcXVlcnk6IENzc1Rva2VuW10sIGJsb2NrOiBDc3NCbG9ja0FTVCkge1xuICAgIHN1cGVyKHR5cGUsIGJsb2NrKTtcbiAgICB0aGlzLnN0clZhbHVlID0gcXVlcnkubWFwKHRva2VuID0+IHRva2VuLnN0clZhbHVlKS5qb2luKCcnKTtcbiAgICB2YXIgZmlyc3RDc3NUb2tlbjogQ3NzVG9rZW4gPSBxdWVyeVswXTtcbiAgICB0aGlzLm5hbWUgPSBuZXcgQ3NzVG9rZW4oXG4gICAgICAgIGZpcnN0Q3NzVG9rZW4uaW5kZXgsIGZpcnN0Q3NzVG9rZW4uY29sdW1uLCBmaXJzdENzc1Rva2VuLmxpbmUsIENzc1Rva2VuVHlwZS5JZGVudGlmaWVyLFxuICAgICAgICB0aGlzLnN0clZhbHVlKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NCbG9jayh0aGlzLmJsb2NrLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzTWVkaWFRdWVyeVJ1bGVBU1QgZXh0ZW5kcyBDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNUIHtcbiAgY29uc3RydWN0b3IocXVlcnk6IENzc1Rva2VuW10sIGJsb2NrOiBDc3NCbG9ja0FTVCkgeyBzdXBlcihCbG9ja1R5cGUuTWVkaWFRdWVyeSwgcXVlcnksIGJsb2NrKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NNZWRpYVF1ZXJ5UnVsZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzSW5saW5lUnVsZUFTVCBleHRlbmRzIENzc1J1bGVBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdHlwZTogQmxvY2tUeXBlLCBwdWJsaWMgdmFsdWU6IENzc1N0eWxlVmFsdWVBU1QpIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRJbmxpbmVDc3NSdWxlKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NTZWxlY3RvclJ1bGVBU1QgZXh0ZW5kcyBDc3NCbG9ja1J1bGVBU1Qge1xuICBwdWJsaWMgc3RyVmFsdWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VsZWN0b3JzOiBDc3NTZWxlY3RvckFTVFtdLCBibG9jazogQ3NzQmxvY2tBU1QpIHtcbiAgICBzdXBlcihCbG9ja1R5cGUuU2VsZWN0b3IsIGJsb2NrKTtcbiAgICB0aGlzLnN0clZhbHVlID0gc2VsZWN0b3JzLm1hcChzZWxlY3RvciA9PiBzZWxlY3Rvci5zdHJWYWx1ZSkuam9pbignLCcpO1xuICB9XG5cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzU2VsZWN0b3JSdWxlKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NEZWZpbml0aW9uQVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHByb3BlcnR5OiBDc3NUb2tlbiwgcHVibGljIHZhbHVlOiBDc3NTdHlsZVZhbHVlQVNUKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzRGVmaW5pdGlvbih0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzU2VsZWN0b3JBU1QgZXh0ZW5kcyBDc3NBU1Qge1xuICBwdWJsaWMgc3RyVmFsdWU7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbnM6IENzc1Rva2VuW10sIHB1YmxpYyBpc0NvbXBsZXg6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdHJWYWx1ZSA9IHRva2Vucy5tYXAodG9rZW4gPT4gdG9rZW4uc3RyVmFsdWUpLmpvaW4oJycpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc1NlbGVjdG9yKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NCbG9ja0FTVCBleHRlbmRzIENzc0FTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbnRyaWVzOiBDc3NBU1RbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0Jsb2NrKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NTdHlsZVNoZWV0QVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJ1bGVzOiBDc3NBU1RbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc1N0eWxlU2hlZXQodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1BhcnNlRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgc3RhdGljIGNyZWF0ZShcbiAgICAgIGZpbGU6IFBhcnNlU291cmNlRmlsZSwgb2Zmc2V0OiBudW1iZXIsIGxpbmU6IG51bWJlciwgY29sOiBudW1iZXIsIGxlbmd0aDogbnVtYmVyLFxuICAgICAgZXJyTXNnOiBzdHJpbmcpOiBDc3NQYXJzZUVycm9yIHtcbiAgICB2YXIgc3RhcnQgPSBuZXcgUGFyc2VMb2NhdGlvbihmaWxlLCBvZmZzZXQsIGxpbmUsIGNvbCk7XG4gICAgdmFyIGVuZCA9IG5ldyBQYXJzZUxvY2F0aW9uKGZpbGUsIG9mZnNldCwgbGluZSwgY29sICsgbGVuZ3RoKTtcbiAgICB2YXIgc3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oc3RhcnQsIGVuZCk7XG4gICAgcmV0dXJuIG5ldyBDc3NQYXJzZUVycm9yKHNwYW4sICdDU1MgUGFyc2UgRXJyb3I6ICcgKyBlcnJNc2cpO1xuICB9XG5cbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTb3VyY2VTcGFuLCBtZXNzYWdlOiBzdHJpbmcpIHsgc3VwZXIoc3BhbiwgbWVzc2FnZSk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1Vua25vd25Ub2tlbkxpc3RBU1QgZXh0ZW5kcyBDc3NSdWxlQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWUsIHB1YmxpYyB0b2tlbnM6IENzc1Rva2VuW10pIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRVbmtvd25SdWxlKHRoaXMsIGNvbnRleHQpOyB9XG59XG4iXX0=