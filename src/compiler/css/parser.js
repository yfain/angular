'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var parse_util_1 = require("angular2/src/compiler/parse_util");
var lang_1 = require("angular2/src/facade/lang");
var lexer_1 = require("angular2/src/compiler/css/lexer");
var lexer_2 = require("angular2/src/compiler/css/lexer");
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
    if (separator === void 0) { separator = ""; }
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
                previousToken.numValue == lexer_1.$COLON && token.strValue == "not" &&
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
        var strValue = "";
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
                    prop = new lexer_1.CssToken(prop.index, prop.column, prop.line, prop.type, propStr.join(" "));
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
        _super.call(this, BlockType.Keyframes, block, mergeTokens(_steps, ","));
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
        this.strValue = query.map(function (token) { return token.strValue; }).join("");
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
        this.strValue = selectors.map(function (selector) { return selector.strValue; }).join(",");
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
        this.strValue = tokens.map(function (token) { return token.strValue; }).join("");
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
        return new CssParseError(span, "CSS Parse Error: " + errMsg);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1HSFU4TUNFVi50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2Nzcy9wYXJzZXIudHMiXSwibmFtZXMiOlsiQmxvY2tUeXBlIiwibWVyZ2VUb2tlbnMiLCJnZXREZWxpbUZyb21Ub2tlbiIsImdldERlbGltRnJvbUNoYXJhY3RlciIsImNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyIiwiQ3NzQVNUIiwiQ3NzQVNULmNvbnN0cnVjdG9yIiwiQ3NzQVNULnZpc2l0IiwiUGFyc2VkQ3NzUmVzdWx0IiwiUGFyc2VkQ3NzUmVzdWx0LmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VyIiwiQ3NzUGFyc2VyLmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VyLl9yZXNvbHZlQmxvY2tUeXBlIiwiQ3NzUGFyc2VyLnBhcnNlIiwiQ3NzUGFyc2VyLl9wYXJzZVN0eWxlU2hlZXQiLCJDc3NQYXJzZXIuX3BhcnNlUnVsZSIsIkNzc1BhcnNlci5fcGFyc2VBdFJ1bGUiLCJDc3NQYXJzZXIuX3BhcnNlU2VsZWN0b3JSdWxlIiwiQ3NzUGFyc2VyLl9wYXJzZVNlbGVjdG9ycyIsIkNzc1BhcnNlci5fc2NhbiIsIkNzc1BhcnNlci5fY29uc3VtZSIsIkNzc1BhcnNlci5fcGFyc2VLZXlmcmFtZUJsb2NrIiwiQ3NzUGFyc2VyLl9wYXJzZUtleWZyYW1lRGVmaW5pdGlvbiIsIkNzc1BhcnNlci5fcGFyc2VLZXlmcmFtZUxhYmVsIiwiQ3NzUGFyc2VyLl9wYXJzZVNlbGVjdG9yIiwiQ3NzUGFyc2VyLl9wYXJzZVZhbHVlIiwiQ3NzUGFyc2VyLl9jb2xsZWN0VW50aWxEZWxpbSIsIkNzc1BhcnNlci5fcGFyc2VCbG9jayIsIkNzc1BhcnNlci5fcGFyc2VTdHlsZUJsb2NrIiwiQ3NzUGFyc2VyLl9wYXJzZURlZmluaXRpb24iLCJDc3NQYXJzZXIuX2Fzc2VydENvbmRpdGlvbiIsIkNzc1BhcnNlci5fZXJyb3IiLCJDc3NTdHlsZVZhbHVlQVNUIiwiQ3NzU3R5bGVWYWx1ZUFTVC5jb25zdHJ1Y3RvciIsIkNzc1N0eWxlVmFsdWVBU1QudmlzaXQiLCJDc3NSdWxlQVNUIiwiQ3NzUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc0Jsb2NrUnVsZUFTVCIsIkNzc0Jsb2NrUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc0Jsb2NrUnVsZUFTVC52aXNpdCIsIkNzc0tleWZyYW1lUnVsZUFTVCIsIkNzc0tleWZyYW1lUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc0tleWZyYW1lUnVsZUFTVC52aXNpdCIsIkNzc0tleWZyYW1lRGVmaW5pdGlvbkFTVCIsIkNzc0tleWZyYW1lRGVmaW5pdGlvbkFTVC5jb25zdHJ1Y3RvciIsIkNzc0tleWZyYW1lRGVmaW5pdGlvbkFTVC52aXNpdCIsIkNzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1QiLCJDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzQmxvY2tEZWZpbml0aW9uUnVsZUFTVC52aXNpdCIsIkNzc01lZGlhUXVlcnlSdWxlQVNUIiwiQ3NzTWVkaWFRdWVyeVJ1bGVBU1QuY29uc3RydWN0b3IiLCJDc3NNZWRpYVF1ZXJ5UnVsZUFTVC52aXNpdCIsIkNzc0lubGluZVJ1bGVBU1QiLCJDc3NJbmxpbmVSdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzSW5saW5lUnVsZUFTVC52aXNpdCIsIkNzc1NlbGVjdG9yUnVsZUFTVCIsIkNzc1NlbGVjdG9yUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc1NlbGVjdG9yUnVsZUFTVC52aXNpdCIsIkNzc0RlZmluaXRpb25BU1QiLCJDc3NEZWZpbml0aW9uQVNULmNvbnN0cnVjdG9yIiwiQ3NzRGVmaW5pdGlvbkFTVC52aXNpdCIsIkNzc1NlbGVjdG9yQVNUIiwiQ3NzU2VsZWN0b3JBU1QuY29uc3RydWN0b3IiLCJDc3NTZWxlY3RvckFTVC52aXNpdCIsIkNzc0Jsb2NrQVNUIiwiQ3NzQmxvY2tBU1QuY29uc3RydWN0b3IiLCJDc3NCbG9ja0FTVC52aXNpdCIsIkNzc1N0eWxlU2hlZXRBU1QiLCJDc3NTdHlsZVNoZWV0QVNULmNvbnN0cnVjdG9yIiwiQ3NzU3R5bGVTaGVldEFTVC52aXNpdCIsIkNzc1BhcnNlRXJyb3IiLCJDc3NQYXJzZUVycm9yLmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VFcnJvci5jcmVhdGUiLCJDc3NVbmtub3duVG9rZW5MaXN0QVNUIiwiQ3NzVW5rbm93blRva2VuTGlzdEFTVC5jb25zdHJ1Y3RvciIsIkNzc1Vua25vd25Ub2tlbkxpc3RBU1QudmlzaXQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBS08sa0NBQWtDLENBQUMsQ0FBQTtBQUUxQyxxQkFNTywwQkFBMEIsQ0FBQyxDQUFBO0FBRWxDLHNCQW1CTyxpQ0FBaUMsQ0FBQyxDQUFBO0FBRXpDLHNCQUF1QixpQ0FBaUMsQ0FBQztBQUFqRCxvQ0FBaUQ7QUFFekQsV0FBWSxTQUFTO0lBQ25CQSw2Q0FBTUEsQ0FBQUE7SUFDTkEsK0NBQU9BLENBQUFBO0lBQ1BBLG1EQUFTQSxDQUFBQTtJQUNUQSxpREFBUUEsQ0FBQUE7SUFDUkEsbURBQVNBLENBQUFBO0lBQ1RBLHFEQUFVQSxDQUFBQTtJQUNWQSxpREFBUUEsQ0FBQUE7SUFDUkEsaURBQVFBLENBQUFBO0lBQ1JBLHlDQUFJQSxDQUFBQTtJQUNKQSxpREFBUUEsQ0FBQUE7SUFDUkEsa0RBQVFBLENBQUFBO0lBQ1JBLHdEQUFXQSxDQUFBQTtBQUNiQSxDQUFDQSxFQWJXLGlCQUFTLEtBQVQsaUJBQVMsUUFhcEI7QUFiRCxJQUFZLFNBQVMsR0FBVCxpQkFhWCxDQUFBO0FBRUQsSUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLElBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQztBQUN2QixJQUFNLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDdkIsSUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN2QixJQUFNLGVBQWUsR0FB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QSxDQUFDQSxDQUFDQTtnQkFDMUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLHNCQUFzQkEsRUFBRUEsQ0FBQ0E7Z0JBQ3ZDQSxNQUFNQSxDQUFDQSxJQUFJQSxnQkFBZ0JBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBRTNDQSxLQUFLQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUN4QkEsS0FBS0EsU0FBU0EsQ0FBQ0EsUUFBUUE7Z0JBQ3JCQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO2dCQUMxQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsZUFBZUEsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFFMUNBLEtBQUtBLFNBQVNBLENBQUNBLFNBQVNBO2dCQUN0QkEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsVUFBVUEsRUFBRUEsWUFBWUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFGQSwwQ0FBMENBO2dCQUMxQ0EsSUFBSUEsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JCQSxNQUFNQSxDQUFDQSxJQUFJQSxrQkFBa0JBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFFNUVBLEtBQUtBLFNBQVNBLENBQUNBLFVBQVVBO2dCQUN2QkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0Esb0JBQVlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO2dCQUNoREEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsVUFBVUEsRUFBRUEsWUFBWUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JB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R0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBR0hGLG9CQUFDQTtBQUFEQSxDQUFDQSxBQVZELEVBQW1DLHVCQUFVLEVBVTVDO0FBVlkscUJBQWEsZ0JBVXpCLENBQUE7QUFFRDtJQUE0Q0csMENBQVVBO0lBQ3BEQSxnQ0FBbUJBLElBQUlBLEVBQVNBLE1BQWtCQTtRQUFJQyxpQkFBT0EsQ0FBQ0E7UUFBM0NBLFNBQUlBLEdBQUpBLElBQUlBLENBQUFBO1FBQVNBLFdBQU1BLEdBQU5BLE1BQU1BLENBQVlBO0lBQWFBLENBQUNBO0lBQ2hFRCxzQ0FBS0EsR0FBTEEsVUFBTUEsT0FBc0JBLEVBQUVBLE9BQWFBLElBQUlFLE9BQU9BLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQzFGRiw2QkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxFQUE0QyxVQUFVLEVBR3JEO0FBSFksOEJBQXNCLHlCQUdsQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgUGFyc2VTb3VyY2VTcGFuLFxuICBQYXJzZVNvdXJjZUZpbGUsXG4gIFBhcnNlTG9jYXRpb24sXG4gIFBhcnNlRXJyb3Jcbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb21waWxlci9wYXJzZV91dGlsXCI7XG5cbmltcG9ydCB7XG4gIGJpdFdpc2VPcixcbiAgYml0V2lzZUFuZCxcbiAgTnVtYmVyV3JhcHBlcixcbiAgU3RyaW5nV3JhcHBlcixcbiAgaXNQcmVzZW50XG59IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcblxuaW1wb3J0IHtcbiAgQ3NzTGV4ZXJNb2RlLFxuICBDc3NUb2tlbixcbiAgQ3NzVG9rZW5UeXBlLFxuICBDc3NTY2FubmVyLFxuICBDc3NTY2FubmVyRXJyb3IsXG4gIGdlbmVyYXRlRXJyb3JNZXNzYWdlLFxuICAkQVQsXG4gICRFT0YsXG4gICRSQlJBQ0UsXG4gICRMQlJBQ0UsXG4gICRMQlJBQ0tFVCxcbiAgJFJCUkFDS0VULFxuICAkTFBBUkVOLFxuICAkUlBBUkVOLFxuICAkQ09NTUEsXG4gICRDT0xPTixcbiAgJFNFTUlDT0xPTixcbiAgaXNOZXdsaW5lXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyXCI7XG5cbmV4cG9ydCB7Q3NzVG9rZW59IGZyb20gXCJhbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyXCI7XG5cbmV4cG9ydCBlbnVtIEJsb2NrVHlwZSB7XG4gIEltcG9ydCxcbiAgQ2hhcnNldCxcbiAgTmFtZXNwYWNlLFxuICBTdXBwb3J0cyxcbiAgS2V5ZnJhbWVzLFxuICBNZWRpYVF1ZXJ5LFxuICBTZWxlY3RvcixcbiAgRm9udEZhY2UsXG4gIFBhZ2UsXG4gIERvY3VtZW50LFxuICBWaWV3cG9ydCxcbiAgVW5zdXBwb3J0ZWRcbn1cblxuY29uc3QgRU9GX0RFTElNID0gMTtcbmNvbnN0IFJCUkFDRV9ERUxJTSA9IDI7XG5jb25zdCBMQlJBQ0VfREVMSU0gPSA0O1xuY29uc3QgQ09NTUFfREVMSU0gPSA4O1xuY29uc3QgQ09MT05fREVMSU0gPSAxNjtcbmNvbnN0IFNFTUlDT0xPTl9ERUxJTSA9IDMyO1xuY29uc3QgTkVXTElORV9ERUxJTSA9IDY0O1xuY29uc3QgUlBBUkVOX0RFTElNID0gMTI4O1xuXG5mdW5jdGlvbiBtZXJnZVRva2Vucyh0b2tlbnM6IENzc1Rva2VuW10sIHNlcGFyYXRvcjogc3RyaW5nID0gXCJcIik6IENzc1Rva2VuIHtcbiAgdmFyIG1haW5Ub2tlbiA9IHRva2Vuc1swXTtcbiAgdmFyIHN0ciA9IG1haW5Ub2tlbi5zdHJWYWx1ZTtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBzdHIgKz0gc2VwYXJhdG9yICsgdG9rZW5zW2ldLnN0clZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBDc3NUb2tlbihtYWluVG9rZW4uaW5kZXgsIG1haW5Ub2tlbi5jb2x1bW4sIG1haW5Ub2tlbi5saW5lLCBtYWluVG9rZW4udHlwZSwgc3RyKTtcbn1cblxuZnVuY3Rpb24gZ2V0RGVsaW1Gcm9tVG9rZW4odG9rZW46IENzc1Rva2VuKTogbnVtYmVyIHtcbiAgcmV0dXJuIGdldERlbGltRnJvbUNoYXJhY3Rlcih0b2tlbi5udW1WYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIGdldERlbGltRnJvbUNoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBudW1iZXIge1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRFT0Y6XG4gICAgICByZXR1cm4gRU9GX0RFTElNO1xuICAgIGNhc2UgJENPTU1BOlxuICAgICAgcmV0dXJuIENPTU1BX0RFTElNO1xuICAgIGNhc2UgJENPTE9OOlxuICAgICAgcmV0dXJuIENPTE9OX0RFTElNO1xuICAgIGNhc2UgJFNFTUlDT0xPTjpcbiAgICAgIHJldHVybiBTRU1JQ09MT05fREVMSU07XG4gICAgY2FzZSAkUkJSQUNFOlxuICAgICAgcmV0dXJuIFJCUkFDRV9ERUxJTTtcbiAgICBjYXNlICRMQlJBQ0U6XG4gICAgICByZXR1cm4gTEJSQUNFX0RFTElNO1xuICAgIGNhc2UgJFJQQVJFTjpcbiAgICAgIHJldHVybiBSUEFSRU5fREVMSU07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBpc05ld2xpbmUoY29kZSkgPyBORVdMSU5FX0RFTElNIDogMDtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcihjb2RlOiBudW1iZXIsIGRlbGltaXRlcnM6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gYml0V2lzZUFuZChbZ2V0RGVsaW1Gcm9tQ2hhcmFjdGVyKGNvZGUpLCBkZWxpbWl0ZXJzXSkgPiAwO1xufVxuXG5leHBvcnQgY2xhc3MgQ3NzQVNUIHtcbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSk6IHZvaWQge31cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDc3NBU1RWaXNpdG9yIHtcbiAgdmlzaXRDc3NWYWx1ZShhc3Q6IENzc1N0eWxlVmFsdWVBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdElubGluZUNzc1J1bGUoYXN0OiBDc3NJbmxpbmVSdWxlQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NLZXlmcmFtZVJ1bGUoYXN0OiBDc3NLZXlmcmFtZVJ1bGVBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc0tleWZyYW1lRGVmaW5pdGlvbihhc3Q6IENzc0tleWZyYW1lRGVmaW5pdGlvbkFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzTWVkaWFRdWVyeVJ1bGUoYXN0OiBDc3NNZWRpYVF1ZXJ5UnVsZUFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzU2VsZWN0b3JSdWxlKGFzdDogQ3NzU2VsZWN0b3JSdWxlQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NTZWxlY3Rvcihhc3Q6IENzc1NlbGVjdG9yQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NEZWZpbml0aW9uKGFzdDogQ3NzRGVmaW5pdGlvbkFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzQmxvY2soYXN0OiBDc3NCbG9ja0FTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzU3R5bGVTaGVldChhc3Q6IENzc1N0eWxlU2hlZXRBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdFVua293blJ1bGUoYXN0OiBDc3NVbmtub3duVG9rZW5MaXN0QVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlZENzc1Jlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlcnJvcnM6IENzc1BhcnNlRXJyb3JbXSwgcHVibGljIGFzdDogQ3NzU3R5bGVTaGVldEFTVCkge31cbn1cblxuZXhwb3J0IGNsYXNzIENzc1BhcnNlciB7XG4gIHByaXZhdGUgX2Vycm9yczogQ3NzUGFyc2VFcnJvcltdID0gW107XG4gIHByaXZhdGUgX2ZpbGU6IFBhcnNlU291cmNlRmlsZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9zY2FubmVyOiBDc3NTY2FubmVyLCBwcml2YXRlIF9maWxlTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fZmlsZSA9IG5ldyBQYXJzZVNvdXJjZUZpbGUodGhpcy5fc2Nhbm5lci5pbnB1dCwgX2ZpbGVOYW1lKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jlc29sdmVCbG9ja1R5cGUodG9rZW46IENzc1Rva2VuKTogQmxvY2tUeXBlIHtcbiAgICBzd2l0Y2ggKHRva2VuLnN0clZhbHVlKSB7XG4gICAgICBjYXNlICdALW8ta2V5ZnJhbWVzJzpcbiAgICAgIGNhc2UgJ0AtbW96LWtleWZyYW1lcyc6XG4gICAgICBjYXNlICdALXdlYmtpdC1rZXlmcmFtZXMnOlxuICAgICAgY2FzZSAnQGtleWZyYW1lcyc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuS2V5ZnJhbWVzO1xuXG4gICAgICBjYXNlICdAY2hhcnNldCc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuQ2hhcnNldDtcblxuICAgICAgY2FzZSAnQGltcG9ydCc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuSW1wb3J0O1xuXG4gICAgICBjYXNlICdAbmFtZXNwYWNlJzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5OYW1lc3BhY2U7XG5cbiAgICAgIGNhc2UgJ0BwYWdlJzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5QYWdlO1xuXG4gICAgICBjYXNlICdAZG9jdW1lbnQnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLkRvY3VtZW50O1xuXG4gICAgICBjYXNlICdAbWVkaWEnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLk1lZGlhUXVlcnk7XG5cbiAgICAgIGNhc2UgJ0Bmb250LWZhY2UnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLkZvbnRGYWNlO1xuXG4gICAgICBjYXNlICdAdmlld3BvcnQnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLlZpZXdwb3J0O1xuXG4gICAgICBjYXNlICdAc3VwcG9ydHMnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLlN1cHBvcnRzO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLlVuc3VwcG9ydGVkO1xuICAgIH1cbiAgfVxuXG4gIHBhcnNlKCk6IFBhcnNlZENzc1Jlc3VsdCB7XG4gICAgdmFyIGRlbGltaXRlcnM6IG51bWJlciA9IEVPRl9ERUxJTTtcbiAgICB2YXIgYXN0ID0gdGhpcy5fcGFyc2VTdHlsZVNoZWV0KGRlbGltaXRlcnMpO1xuXG4gICAgdmFyIGVycm9ycyA9IHRoaXMuX2Vycm9ycztcbiAgICB0aGlzLl9lcnJvcnMgPSBbXTtcblxuICAgIHJldHVybiBuZXcgUGFyc2VkQ3NzUmVzdWx0KGVycm9ycywgYXN0KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlU3R5bGVTaGVldChkZWxpbWl0ZXJzKTogQ3NzU3R5bGVTaGVldEFTVCB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcbiAgICB3aGlsZSAodGhpcy5fc2Nhbm5lci5wZWVrICE9ICRFT0YpIHtcbiAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3BhcnNlUnVsZShkZWxpbWl0ZXJzKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQ3NzU3R5bGVTaGVldEFTVChyZXN1bHRzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlUnVsZShkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NSdWxlQVNUIHtcbiAgICBpZiAodGhpcy5fc2Nhbm5lci5wZWVrID09ICRBVCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlQXRSdWxlKGRlbGltaXRlcnMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcGFyc2VTZWxlY3RvclJ1bGUoZGVsaW1pdGVycyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZUF0UnVsZShkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NSdWxlQVNUIHtcbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkJMT0NLKTtcblxuICAgIHZhciB0b2tlbiA9IHRoaXMuX3NjYW4oKTtcblxuICAgIHRoaXMuX2Fzc2VydENvbmRpdGlvbih0b2tlbi50eXBlID09IENzc1Rva2VuVHlwZS5BdEtleXdvcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGBUaGUgQ1NTIFJ1bGUgJHt0b2tlbi5zdHJWYWx1ZX0gaXMgbm90IGEgdmFsaWQgW0BdIHJ1bGUuYCwgdG9rZW4pO1xuXG4gICAgdmFyIGJsb2NrLCB0eXBlID0gdGhpcy5fcmVzb2x2ZUJsb2NrVHlwZSh0b2tlbik7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIEJsb2NrVHlwZS5DaGFyc2V0OlxuICAgICAgY2FzZSBCbG9ja1R5cGUuTmFtZXNwYWNlOlxuICAgICAgY2FzZSBCbG9ja1R5cGUuSW1wb3J0OlxuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLl9wYXJzZVZhbHVlKGRlbGltaXRlcnMpO1xuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkJMT0NLKTtcbiAgICAgICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgQ3NzSW5saW5lUnVsZUFTVCh0eXBlLCB2YWx1ZSk7XG5cbiAgICAgIGNhc2UgQmxvY2tUeXBlLlZpZXdwb3J0OlxuICAgICAgY2FzZSBCbG9ja1R5cGUuRm9udEZhY2U6XG4gICAgICAgIGJsb2NrID0gdGhpcy5fcGFyc2VTdHlsZUJsb2NrKGRlbGltaXRlcnMpO1xuICAgICAgICByZXR1cm4gbmV3IENzc0Jsb2NrUnVsZUFTVCh0eXBlLCBibG9jayk7XG5cbiAgICAgIGNhc2UgQmxvY2tUeXBlLktleWZyYW1lczpcbiAgICAgICAgdmFyIHRva2VucyA9IHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNLCBMQlJBQ0VfREVMSU1dKSk7XG4gICAgICAgIC8vIGtleWZyYW1lcyBvbmx5IGhhdmUgb25lIGlkZW50aWZpZXIgbmFtZVxuICAgICAgICB2YXIgbmFtZSA9IHRva2Vuc1swXTtcbiAgICAgICAgcmV0dXJuIG5ldyBDc3NLZXlmcmFtZVJ1bGVBU1QobmFtZSwgdGhpcy5fcGFyc2VLZXlmcmFtZUJsb2NrKGRlbGltaXRlcnMpKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuTWVkaWFRdWVyeTpcbiAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5NRURJQV9RVUVSWSk7XG4gICAgICAgIHZhciB0b2tlbnMgPSB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTSwgTEJSQUNFX0RFTElNXSkpO1xuICAgICAgICByZXR1cm4gbmV3IENzc01lZGlhUXVlcnlSdWxlQVNUKHRva2VucywgdGhpcy5fcGFyc2VCbG9jayhkZWxpbWl0ZXJzKSk7XG5cbiAgICAgIGNhc2UgQmxvY2tUeXBlLkRvY3VtZW50OlxuICAgICAgY2FzZSBCbG9ja1R5cGUuU3VwcG9ydHM6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5QYWdlOlxuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkFUX1JVTEVfUVVFUlkpO1xuICAgICAgICB2YXIgdG9rZW5zID0gdGhpcy5fY29sbGVjdFVudGlsRGVsaW0oYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU0sIExCUkFDRV9ERUxJTV0pKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNUKHR5cGUsIHRva2VucywgdGhpcy5fcGFyc2VCbG9jayhkZWxpbWl0ZXJzKSk7XG5cbiAgICAgIC8vIGlmIGEgY3VzdG9tIEBydWxlIHsgLi4uIH0gaXMgdXNlZCBpdCBzaG91bGQgc3RpbGwgdG9rZW5pemUgdGhlIGluc2lkZXNcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBsaXN0T2ZUb2tlbnMgPSBbXTtcbiAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5BTEwpO1xuICAgICAgICB0aGlzLl9lcnJvcihnZW5lcmF0ZUVycm9yTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NjYW5uZXIuaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBgVGhlIENTUyBcImF0XCIgcnVsZSBcIiR7dG9rZW4uc3RyVmFsdWV9XCIgaXMgbm90IGFsbG93ZWQgdG8gdXNlZCBoZXJlYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuLnN0clZhbHVlLCB0b2tlbi5pbmRleCwgdG9rZW4ubGluZSwgdG9rZW4uY29sdW1uKSxcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4pO1xuXG4gICAgICAgIHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKGJpdFdpc2VPcihbZGVsaW1pdGVycywgTEJSQUNFX0RFTElNLCBTRU1JQ09MT05fREVMSU1dKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKCh0b2tlbikgPT4geyBsaXN0T2ZUb2tlbnMucHVzaCh0b2tlbik7IH0pO1xuICAgICAgICBpZiAodGhpcy5fc2Nhbm5lci5wZWVrID09ICRMQlJBQ0UpIHtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd7Jyk7XG4gICAgICAgICAgdGhpcy5fY29sbGVjdFVudGlsRGVsaW0oYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU0sIExCUkFDRV9ERUxJTV0pKVxuICAgICAgICAgICAgICAuZm9yRWFjaCgodG9rZW4pID0+IHsgbGlzdE9mVG9rZW5zLnB1c2godG9rZW4pOyB9KTtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd9Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBDc3NVbmtub3duVG9rZW5MaXN0QVNUKHRva2VuLCBsaXN0T2ZUb2tlbnMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlU2VsZWN0b3JSdWxlKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1NlbGVjdG9yUnVsZUFTVCB7XG4gICAgdmFyIHNlbGVjdG9ycyA9IHRoaXMuX3BhcnNlU2VsZWN0b3JzKGRlbGltaXRlcnMpO1xuICAgIHZhciBibG9jayA9IHRoaXMuX3BhcnNlU3R5bGVCbG9jayhkZWxpbWl0ZXJzKTtcbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkJMT0NLKTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcbiAgICByZXR1cm4gbmV3IENzc1NlbGVjdG9yUnVsZUFTVChzZWxlY3RvcnMsIGJsb2NrKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlU2VsZWN0b3JzKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1NlbGVjdG9yQVNUW10ge1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIExCUkFDRV9ERUxJTV0pO1xuXG4gICAgdmFyIHNlbGVjdG9ycyA9IFtdO1xuICAgIHZhciBpc1BhcnNpbmdTZWxlY3RvcnMgPSB0cnVlO1xuICAgIHdoaWxlIChpc1BhcnNpbmdTZWxlY3RvcnMpIHtcbiAgICAgIHNlbGVjdG9ycy5wdXNoKHRoaXMuX3BhcnNlU2VsZWN0b3IoZGVsaW1pdGVycykpO1xuXG4gICAgICBpc1BhcnNpbmdTZWxlY3RvcnMgPSAhY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKTtcblxuICAgICAgaWYgKGlzUGFyc2luZ1NlbGVjdG9ycykge1xuICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcsJyk7XG4gICAgICAgIGlzUGFyc2luZ1NlbGVjdG9ycyA9ICFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWxlY3RvcnM7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zY2FuKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgb3V0cHV0ID0gdGhpcy5fc2Nhbm5lci5zY2FuKCk7XG4gICAgdmFyIHRva2VuID0gb3V0cHV0LnRva2VuO1xuICAgIHZhciBlcnJvciA9IG91dHB1dC5lcnJvcjtcbiAgICBpZiAoaXNQcmVzZW50KGVycm9yKSkge1xuICAgICAgdGhpcy5fZXJyb3IoZXJyb3IucmF3TWVzc2FnZSwgdG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jb25zdW1lKHR5cGU6IENzc1Rva2VuVHlwZSwgdmFsdWU6IHN0cmluZyA9IG51bGwpOiBDc3NUb2tlbiB7XG4gICAgdmFyIG91dHB1dCA9IHRoaXMuX3NjYW5uZXIuY29uc3VtZSh0eXBlLCB2YWx1ZSk7XG4gICAgdmFyIHRva2VuID0gb3V0cHV0LnRva2VuO1xuICAgIHZhciBlcnJvciA9IG91dHB1dC5lcnJvcjtcbiAgICBpZiAoaXNQcmVzZW50KGVycm9yKSkge1xuICAgICAgdGhpcy5fZXJyb3IoZXJyb3IucmF3TWVzc2FnZSwgdG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZUtleWZyYW1lQmxvY2soZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzQmxvY2tBU1Qge1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTV0pO1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuS0VZRlJBTUVfQkxPQ0spO1xuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAneycpO1xuXG4gICAgdmFyIGRlZmluaXRpb25zID0gW107XG4gICAgd2hpbGUgKCFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpKSB7XG4gICAgICBkZWZpbml0aW9ucy5wdXNoKHRoaXMuX3BhcnNlS2V5ZnJhbWVEZWZpbml0aW9uKGRlbGltaXRlcnMpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd9Jyk7XG5cbiAgICByZXR1cm4gbmV3IENzc0Jsb2NrQVNUKGRlZmluaXRpb25zKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlS2V5ZnJhbWVEZWZpbml0aW9uKGRlbGltaXRlcnM6IG51bWJlcik6IENzc0tleWZyYW1lRGVmaW5pdGlvbkFTVCB7XG4gICAgdmFyIHN0ZXBUb2tlbnMgPSBbXTtcbiAgICBkZWxpbWl0ZXJzID0gYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBMQlJBQ0VfREVMSU1dKTtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIHN0ZXBUb2tlbnMucHVzaCh0aGlzLl9wYXJzZUtleWZyYW1lTGFiZWwoYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBDT01NQV9ERUxJTV0pKSk7XG4gICAgICBpZiAodGhpcy5fc2Nhbm5lci5wZWVrICE9ICRMQlJBQ0UpIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnLCcpO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgc3R5bGVzID0gdGhpcy5fcGFyc2VTdHlsZUJsb2NrKGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNXSkpO1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgIHJldHVybiBuZXcgQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNUKHN0ZXBUb2tlbnMsIHN0eWxlcyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZUtleWZyYW1lTGFiZWwoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzVG9rZW4ge1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuS0VZRlJBTUVfQkxPQ0spO1xuICAgIHJldHVybiBtZXJnZVRva2Vucyh0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShkZWxpbWl0ZXJzKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZVNlbGVjdG9yKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1NlbGVjdG9yQVNUIHtcbiAgICBkZWxpbWl0ZXJzID0gYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBDT01NQV9ERUxJTSwgTEJSQUNFX0RFTElNXSk7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5TRUxFQ1RPUik7XG5cbiAgICB2YXIgc2VsZWN0b3JDc3NUb2tlbnMgPSBbXTtcbiAgICB2YXIgaXNDb21wbGV4ID0gZmFsc2U7XG4gICAgdmFyIHdzQ3NzVG9rZW47XG5cbiAgICB2YXIgcHJldmlvdXNUb2tlbjtcbiAgICB2YXIgcGFyZW5Db3VudCA9IDA7XG4gICAgd2hpbGUgKCFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpKSB7XG4gICAgICB2YXIgY29kZSA9IHRoaXMuX3NjYW5uZXIucGVlaztcbiAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICBjYXNlICRMUEFSRU46XG4gICAgICAgICAgcGFyZW5Db3VudCsrO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJFJQQVJFTjpcbiAgICAgICAgICBwYXJlbkNvdW50LS07XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAkQ09MT046XG4gICAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5QU0VVRE9fU0VMRUNUT1IpO1xuICAgICAgICAgIHByZXZpb3VzVG9rZW4gPSB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICc6Jyk7XG4gICAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaChwcmV2aW91c1Rva2VuKTtcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBjYXNlICRMQlJBQ0tFVDpcbiAgICAgICAgICAvLyBpZiB3ZSBhcmUgYWxyZWFkeSBpbnNpZGUgYW4gYXR0cmlidXRlIHNlbGVjdG9yIHRoZW4gd2UgY2FuJ3RcbiAgICAgICAgICAvLyBqdW1wIGludG8gdGhlIG1vZGUgYWdhaW4uIFRoZXJlZm9yZSB0aGlzIGVycm9yIHdpbGwgZ2V0IHBpY2tlZFxuICAgICAgICAgIC8vIHVwIHdoZW4gdGhlIHNjYW4gbWV0aG9kIGlzIGNhbGxlZCBiZWxvdy5cbiAgICAgICAgICBpZiAodGhpcy5fc2Nhbm5lci5nZXRNb2RlKCkgIT0gQ3NzTGV4ZXJNb2RlLkFUVFJJQlVURV9TRUxFQ1RPUikge1xuICAgICAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICdbJykpO1xuICAgICAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5BVFRSSUJVVEVfU0VMRUNUT1IpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJFJCUkFDS0VUOlxuICAgICAgICAgIHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2godGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnXScpKTtcbiAgICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNFTEVDVE9SKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRva2VuID0gdGhpcy5fc2NhbigpO1xuXG4gICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHRoZSBcIjpub3QoXCIgc2VsZWN0b3Igc2luY2UgaXRcbiAgICAgIC8vIGNvbnRhaW5zIGFuIGlubmVyIHNlbGVjdG9yIHRoYXQgbmVlZHMgdG8gYmUgcGFyc2VkXG4gICAgICAvLyBpbiBpc29sYXRpb25cbiAgICAgIGlmICh0aGlzLl9zY2FubmVyLmdldE1vZGUoKSA9PSBDc3NMZXhlck1vZGUuUFNFVURPX1NFTEVDVE9SICYmIGlzUHJlc2VudChwcmV2aW91c1Rva2VuKSAmJlxuICAgICAgICAgIHByZXZpb3VzVG9rZW4ubnVtVmFsdWUgPT0gJENPTE9OICYmIHRva2VuLnN0clZhbHVlID09IFwibm90XCIgJiZcbiAgICAgICAgICB0aGlzLl9zY2FubmVyLnBlZWsgPT0gJExQQVJFTikge1xuICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcoJykpO1xuXG4gICAgICAgIC8vIHRoZSBpbm5lciBzZWxlY3RvciBpbnNpZGUgb2YgOm5vdCguLi4pIGNhbiBvbmx5IGJlIG9uZVxuICAgICAgICAvLyBDU1Mgc2VsZWN0b3IgKG5vIGNvbW1hcyBhbGxvd2VkKSB0aGVyZWZvcmUgd2UgcGFyc2Ugb25seVxuICAgICAgICAvLyBvbmUgc2VsZWN0b3IgYnkgY2FsbGluZyB0aGUgbWV0aG9kIGJlbG93XG4gICAgICAgIHRoaXMuX3BhcnNlU2VsZWN0b3IoYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSUEFSRU5fREVMSU1dKSlcbiAgICAgICAgICAgIC50b2tlbnMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAoaW5uZXJTZWxlY3RvclRva2VuKSA9PiB7IHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2goaW5uZXJTZWxlY3RvclRva2VuKTsgfSk7XG5cbiAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcpJykpO1xuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBwcmV2aW91c1Rva2VuID0gdG9rZW47XG5cbiAgICAgIGlmICh0b2tlbi50eXBlID09IENzc1Rva2VuVHlwZS5XaGl0ZXNwYWNlKSB7XG4gICAgICAgIHdzQ3NzVG9rZW4gPSB0b2tlbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQod3NDc3NUb2tlbikpIHtcbiAgICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHdzQ3NzVG9rZW4pO1xuICAgICAgICAgIHdzQ3NzVG9rZW4gPSBudWxsO1xuICAgICAgICAgIGlzQ29tcGxleCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3NjYW5uZXIuZ2V0TW9kZSgpID09IENzc0xleGVyTW9kZS5BVFRSSUJVVEVfU0VMRUNUT1IpIHtcbiAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgIGBVbmJhbGFuY2VkIENTUyBhdHRyaWJ1dGUgc2VsZWN0b3IgYXQgY29sdW1uICR7cHJldmlvdXNUb2tlbi5saW5lfToke3ByZXZpb3VzVG9rZW4uY29sdW1ufWAsXG4gICAgICAgICAgcHJldmlvdXNUb2tlbik7XG4gICAgfSBlbHNlIGlmIChwYXJlbkNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgYFVuYmFsYW5jZWQgcHNldWRvIHNlbGVjdG9yIGZ1bmN0aW9uIHZhbHVlIGF0IGNvbHVtbiAke3ByZXZpb3VzVG9rZW4ubGluZX06JHtwcmV2aW91c1Rva2VuLmNvbHVtbn1gLFxuICAgICAgICAgIHByZXZpb3VzVG9rZW4pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ3NzU2VsZWN0b3JBU1Qoc2VsZWN0b3JDc3NUb2tlbnMsIGlzQ29tcGxleCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZVZhbHVlKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1N0eWxlVmFsdWVBU1Qge1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTSwgU0VNSUNPTE9OX0RFTElNLCBORVdMSU5FX0RFTElNXSk7XG5cbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFKTtcblxuICAgIHZhciBzdHJWYWx1ZSA9IFwiXCI7XG4gICAgdmFyIHRva2VucyA9IFtdO1xuICAgIHZhciBwcmV2aW91czogQ3NzVG9rZW47XG4gICAgd2hpbGUgKCFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpKSB7XG4gICAgICB2YXIgdG9rZW47XG4gICAgICBpZiAoaXNQcmVzZW50KHByZXZpb3VzKSAmJiBwcmV2aW91cy50eXBlID09IENzc1Rva2VuVHlwZS5JZGVudGlmaWVyICYmXG4gICAgICAgICAgdGhpcy5fc2Nhbm5lci5wZWVrID09ICRMUEFSRU4pIHtcbiAgICAgICAgdG9rZW4gPSB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcoJyk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgc3RyVmFsdWUgKz0gdG9rZW4uc3RyVmFsdWU7XG5cbiAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5TVFlMRV9WQUxVRV9GVU5DVElPTik7XG5cbiAgICAgICAgdG9rZW4gPSB0aGlzLl9zY2FuKCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgc3RyVmFsdWUgKz0gdG9rZW4uc3RyVmFsdWU7XG5cbiAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5TVFlMRV9WQUxVRSk7XG5cbiAgICAgICAgdG9rZW4gPSB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcpJyk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgc3RyVmFsdWUgKz0gdG9rZW4uc3RyVmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2tlbiA9IHRoaXMuX3NjYW4oKTtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgIT0gQ3NzVG9rZW5UeXBlLldoaXRlc3BhY2UpIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgc3RyVmFsdWUgKz0gdG9rZW4uc3RyVmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHByZXZpb3VzID0gdG9rZW47XG4gICAgfVxuXG4gICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lV2hpdGVzcGFjZSgpO1xuXG4gICAgdmFyIGNvZGUgPSB0aGlzLl9zY2FubmVyLnBlZWs7XG4gICAgaWYgKGNvZGUgPT0gJFNFTUlDT0xPTikge1xuICAgICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnOycpO1xuICAgIH0gZWxzZSBpZiAoY29kZSAhPSAkUkJSQUNFKSB7XG4gICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICBnZW5lcmF0ZUVycm9yTWVzc2FnZSh0aGlzLl9zY2FubmVyLmlucHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBUaGUgQ1NTIGtleS92YWx1ZSBkZWZpbml0aW9uIGRpZCBub3QgZW5kIHdpdGggYSBzZW1pY29sb25gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzLnN0clZhbHVlLCBwcmV2aW91cy5pbmRleCwgcHJldmlvdXMubGluZSwgcHJldmlvdXMuY29sdW1uKSxcbiAgICAgICAgICBwcmV2aW91cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDc3NTdHlsZVZhbHVlQVNUKHRva2Vucywgc3RyVmFsdWUpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29sbGVjdFVudGlsRGVsaW0oZGVsaW1pdGVyczogbnVtYmVyLCBhc3NlcnRUeXBlOiBDc3NUb2tlblR5cGUgPSBudWxsKTogQ3NzVG9rZW5bXSB7XG4gICAgdmFyIHRva2VucyA9IFtdO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgdmFyIHZhbCA9IGlzUHJlc2VudChhc3NlcnRUeXBlKSA/IHRoaXMuX2NvbnN1bWUoYXNzZXJ0VHlwZSkgOiB0aGlzLl9zY2FuKCk7XG4gICAgICB0b2tlbnMucHVzaCh2YWwpO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VCbG9jayhkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NCbG9ja0FTVCB7XG4gICAgZGVsaW1pdGVycyA9IGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNXSk7XG5cbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkJMT0NLKTtcblxuICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ3snKTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcblxuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgd2hpbGUgKCFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpKSB7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5fcGFyc2VSdWxlKGRlbGltaXRlcnMpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd9Jyk7XG5cbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkJMT0NLKTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcblxuICAgIHJldHVybiBuZXcgQ3NzQmxvY2tBU1QocmVzdWx0cyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZVN0eWxlQmxvY2soZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzQmxvY2tBU1Qge1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTSwgTEJSQUNFX0RFTElNXSk7XG5cbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX0JMT0NLKTtcblxuICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ3snKTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcblxuICAgIHZhciBkZWZpbml0aW9ucyA9IFtdO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgZGVmaW5pdGlvbnMucHVzaCh0aGlzLl9wYXJzZURlZmluaXRpb24oZGVsaW1pdGVycykpO1xuICAgICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnfScpO1xuXG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5TVFlMRV9CTE9DSyk7XG4gICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG5cbiAgICByZXR1cm4gbmV3IENzc0Jsb2NrQVNUKGRlZmluaXRpb25zKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlRGVmaW5pdGlvbihkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NEZWZpbml0aW9uQVNUIHtcbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX0JMT0NLKTtcblxuICAgIHZhciBwcm9wID0gdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuSWRlbnRpZmllcik7XG4gICAgdmFyIHBhcnNlVmFsdWUsIHZhbHVlID0gbnVsbDtcblxuICAgIC8vIHRoZSBjb2xvbiB2YWx1ZSBzZXBhcmF0ZXMgdGhlIHByb3AgZnJvbSB0aGUgc3R5bGUuXG4gICAgLy8gdGhlcmUgYXJlIGEgZmV3IGNhc2VzIGFzIHRvIHdoYXQgY291bGQgaGFwcGVuIGlmIGl0XG4gICAgLy8gaXMgbWlzc2luZ1xuICAgIHN3aXRjaCAodGhpcy5fc2Nhbm5lci5wZWVrKSB7XG4gICAgICBjYXNlICRDT0xPTjpcbiAgICAgICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnOicpO1xuICAgICAgICBwYXJzZVZhbHVlID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJFNFTUlDT0xPTjpcbiAgICAgIGNhc2UgJFJCUkFDRTpcbiAgICAgIGNhc2UgJEVPRjpcbiAgICAgICAgcGFyc2VWYWx1ZSA9IGZhbHNlO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIHByb3BTdHIgPSBbcHJvcC5zdHJWYWx1ZV07XG4gICAgICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgIT0gJENPTE9OKSB7XG4gICAgICAgICAgLy8gdGhpcyB3aWxsIHRocm93IHRoZSBlcnJvclxuICAgICAgICAgIHZhciBuZXh0VmFsdWUgPSB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICc6Jyk7XG4gICAgICAgICAgcHJvcFN0ci5wdXNoKG5leHRWYWx1ZS5zdHJWYWx1ZSk7XG5cbiAgICAgICAgICB2YXIgcmVtYWluaW5nVG9rZW5zID0gdGhpcy5fY29sbGVjdFVudGlsRGVsaW0oXG4gICAgICAgICAgICAgIGJpdFdpc2VPcihbZGVsaW1pdGVycywgQ09MT05fREVMSU0sIFNFTUlDT0xPTl9ERUxJTV0pLCBDc3NUb2tlblR5cGUuSWRlbnRpZmllcik7XG4gICAgICAgICAgaWYgKHJlbWFpbmluZ1Rva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZW1haW5pbmdUb2tlbnMuZm9yRWFjaCgodG9rZW4pID0+IHsgcHJvcFN0ci5wdXNoKHRva2VuLnN0clZhbHVlKTsgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcHJvcCA9IG5ldyBDc3NUb2tlbihwcm9wLmluZGV4LCBwcm9wLmNvbHVtbiwgcHJvcC5saW5lLCBwcm9wLnR5cGUsIHByb3BTdHIuam9pbihcIiBcIikpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyBtZWFucyB3ZSd2ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGRlZmluaXRpb24gYW5kL29yIGJsb2NrXG4gICAgICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgPT0gJENPTE9OKSB7XG4gICAgICAgICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnOicpO1xuICAgICAgICAgIHBhcnNlVmFsdWUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcnNlVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAocGFyc2VWYWx1ZSkge1xuICAgICAgdmFsdWUgPSB0aGlzLl9wYXJzZVZhbHVlKGRlbGltaXRlcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lcnJvcihnZW5lcmF0ZUVycm9yTWVzc2FnZSh0aGlzLl9zY2FubmVyLmlucHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYFRoZSBDU1MgcHJvcGVydHkgd2FzIG5vdCBwYWlyZWQgd2l0aCBhIHN0eWxlIHZhbHVlYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3Auc3RyVmFsdWUsIHByb3AuaW5kZXgsIHByb3AubGluZSwgcHJvcC5jb2x1bW4pLFxuICAgICAgICAgICAgICAgICAgcHJvcCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDc3NEZWZpbml0aW9uQVNUKHByb3AsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Fzc2VydENvbmRpdGlvbihzdGF0dXM6IGJvb2xlYW4sIGVycm9yTWVzc2FnZTogc3RyaW5nLCBwcm9ibGVtVG9rZW46IENzc1Rva2VuKTogYm9vbGVhbiB7XG4gICAgaWYgKCFzdGF0dXMpIHtcbiAgICAgIHRoaXMuX2Vycm9yKGVycm9yTWVzc2FnZSwgcHJvYmxlbVRva2VuKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9lcnJvcihtZXNzYWdlOiBzdHJpbmcsIHByb2JsZW1Ub2tlbjogQ3NzVG9rZW4pIHtcbiAgICB2YXIgbGVuZ3RoID0gcHJvYmxlbVRva2VuLnN0clZhbHVlLmxlbmd0aDtcbiAgICB2YXIgZXJyb3IgPSBDc3NQYXJzZUVycm9yLmNyZWF0ZSh0aGlzLl9maWxlLCAwLCBwcm9ibGVtVG9rZW4ubGluZSwgcHJvYmxlbVRva2VuLmNvbHVtbiwgbGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UpO1xuICAgIHRoaXMuX2Vycm9ycy5wdXNoKGVycm9yKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzU3R5bGVWYWx1ZUFTVCBleHRlbmRzIENzc0FTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbnM6IENzc1Rva2VuW10sIHB1YmxpYyBzdHJWYWx1ZTogc3RyaW5nKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzVmFsdWUodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1J1bGVBU1QgZXh0ZW5kcyBDc3NBU1Qge31cblxuZXhwb3J0IGNsYXNzIENzc0Jsb2NrUnVsZUFTVCBleHRlbmRzIENzc1J1bGVBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdHlwZTogQmxvY2tUeXBlLCBwdWJsaWMgYmxvY2s6IENzc0Jsb2NrQVNULCBwdWJsaWMgbmFtZTogQ3NzVG9rZW4gPSBudWxsKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NCbG9jayh0aGlzLmJsb2NrLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzS2V5ZnJhbWVSdWxlQVNUIGV4dGVuZHMgQ3NzQmxvY2tSdWxlQVNUIHtcbiAgY29uc3RydWN0b3IobmFtZTogQ3NzVG9rZW4sIGJsb2NrOiBDc3NCbG9ja0FTVCkgeyBzdXBlcihCbG9ja1R5cGUuS2V5ZnJhbWVzLCBibG9jaywgbmFtZSk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzS2V5ZnJhbWVSdWxlKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NLZXlmcmFtZURlZmluaXRpb25BU1QgZXh0ZW5kcyBDc3NCbG9ja1J1bGVBU1Qge1xuICBwdWJsaWMgc3RlcHM7XG4gIGNvbnN0cnVjdG9yKF9zdGVwczogQ3NzVG9rZW5bXSwgYmxvY2s6IENzc0Jsb2NrQVNUKSB7XG4gICAgc3VwZXIoQmxvY2tUeXBlLktleWZyYW1lcywgYmxvY2ssIG1lcmdlVG9rZW5zKF9zdGVwcywgXCIsXCIpKTtcbiAgICB0aGlzLnN0ZXBzID0gX3N0ZXBzO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHtcbiAgICB2aXNpdG9yLnZpc2l0Q3NzS2V5ZnJhbWVEZWZpbml0aW9uKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNUIGV4dGVuZHMgQ3NzQmxvY2tSdWxlQVNUIHtcbiAgcHVibGljIHN0clZhbHVlOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKHR5cGU6IEJsb2NrVHlwZSwgcHVibGljIHF1ZXJ5OiBDc3NUb2tlbltdLCBibG9jazogQ3NzQmxvY2tBU1QpIHtcbiAgICBzdXBlcih0eXBlLCBibG9jayk7XG4gICAgdGhpcy5zdHJWYWx1ZSA9IHF1ZXJ5Lm1hcCh0b2tlbiA9PiB0b2tlbi5zdHJWYWx1ZSkuam9pbihcIlwiKTtcbiAgICB2YXIgZmlyc3RDc3NUb2tlbjogQ3NzVG9rZW4gPSBxdWVyeVswXTtcbiAgICB0aGlzLm5hbWUgPSBuZXcgQ3NzVG9rZW4oZmlyc3RDc3NUb2tlbi5pbmRleCwgZmlyc3RDc3NUb2tlbi5jb2x1bW4sIGZpcnN0Q3NzVG9rZW4ubGluZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIsIHRoaXMuc3RyVmFsdWUpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0Jsb2NrKHRoaXMuYmxvY2ssIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NNZWRpYVF1ZXJ5UnVsZUFTVCBleHRlbmRzIENzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1Qge1xuICBjb25zdHJ1Y3RvcihxdWVyeTogQ3NzVG9rZW5bXSwgYmxvY2s6IENzc0Jsb2NrQVNUKSB7IHN1cGVyKEJsb2NrVHlwZS5NZWRpYVF1ZXJ5LCBxdWVyeSwgYmxvY2spOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc01lZGlhUXVlcnlSdWxlKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NJbmxpbmVSdWxlQVNUIGV4dGVuZHMgQ3NzUnVsZUFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0eXBlOiBCbG9ja1R5cGUsIHB1YmxpYyB2YWx1ZTogQ3NzU3R5bGVWYWx1ZUFTVCkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdElubGluZUNzc1J1bGUodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1NlbGVjdG9yUnVsZUFTVCBleHRlbmRzIENzc0Jsb2NrUnVsZUFTVCB7XG4gIHB1YmxpYyBzdHJWYWx1ZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWxlY3RvcnM6IENzc1NlbGVjdG9yQVNUW10sIGJsb2NrOiBDc3NCbG9ja0FTVCkge1xuICAgIHN1cGVyKEJsb2NrVHlwZS5TZWxlY3RvciwgYmxvY2spO1xuICAgIHRoaXMuc3RyVmFsdWUgPSBzZWxlY3RvcnMubWFwKHNlbGVjdG9yID0+IHNlbGVjdG9yLnN0clZhbHVlKS5qb2luKFwiLFwiKTtcbiAgfVxuXG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc1NlbGVjdG9yUnVsZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzRGVmaW5pdGlvbkFTVCBleHRlbmRzIENzc0FTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm9wZXJ0eTogQ3NzVG9rZW4sIHB1YmxpYyB2YWx1ZTogQ3NzU3R5bGVWYWx1ZUFTVCkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0RlZmluaXRpb24odGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1NlbGVjdG9yQVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgcHVibGljIHN0clZhbHVlO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW5zOiBDc3NUb2tlbltdLCBwdWJsaWMgaXNDb21wbGV4OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RyVmFsdWUgPSB0b2tlbnMubWFwKHRva2VuID0+IHRva2VuLnN0clZhbHVlKS5qb2luKFwiXCIpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc1NlbGVjdG9yKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NCbG9ja0FTVCBleHRlbmRzIENzc0FTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbnRyaWVzOiBDc3NBU1RbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0Jsb2NrKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NTdHlsZVNoZWV0QVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJ1bGVzOiBDc3NBU1RbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc1N0eWxlU2hlZXQodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1BhcnNlRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgc3RhdGljIGNyZWF0ZShmaWxlOiBQYXJzZVNvdXJjZUZpbGUsIG9mZnNldDogbnVtYmVyLCBsaW5lOiBudW1iZXIsIGNvbDogbnVtYmVyLCBsZW5ndGg6IG51bWJlcixcbiAgICAgICAgICAgICAgICBlcnJNc2c6IHN0cmluZyk6IENzc1BhcnNlRXJyb3Ige1xuICAgIHZhciBzdGFydCA9IG5ldyBQYXJzZUxvY2F0aW9uKGZpbGUsIG9mZnNldCwgbGluZSwgY29sKTtcbiAgICB2YXIgZW5kID0gbmV3IFBhcnNlTG9jYXRpb24oZmlsZSwgb2Zmc2V0LCBsaW5lLCBjb2wgKyBsZW5ndGgpO1xuICAgIHZhciBzcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihzdGFydCwgZW5kKTtcbiAgICByZXR1cm4gbmV3IENzc1BhcnNlRXJyb3Ioc3BhbiwgXCJDU1MgUGFyc2UgRXJyb3I6IFwiICsgZXJyTXNnKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU291cmNlU3BhbiwgbWVzc2FnZTogc3RyaW5nKSB7IHN1cGVyKHNwYW4sIG1lc3NhZ2UpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NVbmtub3duVG9rZW5MaXN0QVNUIGV4dGVuZHMgQ3NzUnVsZUFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lLCBwdWJsaWMgdG9rZW5zOiBDc3NUb2tlbltdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0VW5rb3duUnVsZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuIl19