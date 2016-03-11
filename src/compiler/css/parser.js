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
    return (getDelimFromCharacter(code) & delimiters) > 0;
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
    CssParser.prototype._parseStyleSheet = function (delimiters) {
        var results = [];
        this._scanner.consumeEmptyStatements();
        while (this._scanner.peek != lexer_1.$EOF) {
            this._scanner.setMode(lexer_1.CssLexerMode.BLOCK);
            results.push(this._parseRule(delimiters));
        }
        return new CssStyleSheetAST(results);
    };
    CssParser.prototype._parseRule = function (delimiters) {
        if (this._scanner.peek == lexer_1.$AT) {
            return this._parseAtRule(delimiters);
        }
        return this._parseSelectorRule(delimiters);
    };
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
                var tokens = this._collectUntilDelim(delimiters | RBRACE_DELIM | LBRACE_DELIM);
                // keyframes only have one identifier name
                var name = tokens[0];
                return new CssKeyframeRuleAST(name, this._parseKeyframeBlock(delimiters));
            case BlockType.MediaQuery:
                this._scanner.setMode(lexer_1.CssLexerMode.MEDIA_QUERY);
                var tokens = this._collectUntilDelim(delimiters | RBRACE_DELIM | LBRACE_DELIM);
                return new CssMediaQueryRuleAST(tokens, this._parseBlock(delimiters));
            case BlockType.Document:
            case BlockType.Supports:
            case BlockType.Page:
                this._scanner.setMode(lexer_1.CssLexerMode.AT_RULE_QUERY);
                var tokens = this._collectUntilDelim(delimiters | RBRACE_DELIM | LBRACE_DELIM);
                return new CssBlockDefinitionRuleAST(type, tokens, this._parseBlock(delimiters));
            // if a custom @rule { ... } is used it should still tokenize the insides
            default:
                var listOfTokens = [token];
                this._scanner.setMode(lexer_1.CssLexerMode.ALL);
                this._error(lexer_1.generateErrorMessage(this._scanner.input, "The CSS \"at\" rule \"" + token.strValue + "\" is not allowed to used here", token.strValue, token.index, token.line, token.column), token);
                this._collectUntilDelim(delimiters | LBRACE_DELIM | SEMICOLON_DELIM)
                    .forEach(function (token) { listOfTokens.push(token); });
                if (this._scanner.peek == lexer_1.$LBRACE) {
                    this._consume(lexer_1.CssTokenType.Character, '{');
                    this._collectUntilDelim(delimiters | RBRACE_DELIM | LBRACE_DELIM)
                        .forEach(function (token) { listOfTokens.push(token); });
                    this._consume(lexer_1.CssTokenType.Character, '}');
                }
                return new CssUnknownTokenListAST(listOfTokens);
        }
    };
    CssParser.prototype._parseSelectorRule = function (delimiters) {
        var selectors = this._parseSelectors(delimiters);
        var block = this._parseStyleBlock(delimiters);
        this._scanner.setMode(lexer_1.CssLexerMode.BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssSelectorRuleAST(selectors, block);
    };
    CssParser.prototype._parseSelectors = function (delimiters) {
        delimiters |= LBRACE_DELIM;
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
    CssParser.prototype._scan = function () {
        var output = this._scanner.scan();
        var token = output.token;
        var error = output.error;
        if (lang_1.isPresent(error)) {
            this._error(error.rawMessage, token);
        }
        return token;
    };
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
    CssParser.prototype._parseKeyframeBlock = function (delimiters) {
        delimiters |= RBRACE_DELIM;
        this._scanner.setMode(lexer_1.CssLexerMode.KEYFRAME_BLOCK);
        this._consume(lexer_1.CssTokenType.Character, '{');
        var definitions = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            definitions.push(this._parseKeyframeDefinition(delimiters));
        }
        this._consume(lexer_1.CssTokenType.Character, '}');
        return new CssBlockAST(definitions);
    };
    CssParser.prototype._parseKeyframeDefinition = function (delimiters) {
        var stepTokens = [];
        delimiters |= LBRACE_DELIM;
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            stepTokens.push(this._parseKeyframeLabel(delimiters | COMMA_DELIM));
            if (this._scanner.peek != lexer_1.$LBRACE) {
                this._consume(lexer_1.CssTokenType.Character, ',');
            }
        }
        var styles = this._parseStyleBlock(delimiters | RBRACE_DELIM);
        this._scanner.setMode(lexer_1.CssLexerMode.BLOCK);
        return new CssKeyframeDefinitionAST(stepTokens, styles);
    };
    CssParser.prototype._parseKeyframeLabel = function (delimiters) {
        this._scanner.setMode(lexer_1.CssLexerMode.KEYFRAME_BLOCK);
        return mergeTokens(this._collectUntilDelim(delimiters));
    };
    CssParser.prototype._parseSelector = function (delimiters) {
        delimiters |= COMMA_DELIM | LBRACE_DELIM;
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
                    break;
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
                    break;
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
                this._parseSelector(delimiters | RPAREN_DELIM).tokens.forEach(function (innerSelectorToken) { selectorCssTokens.push(innerSelectorToken); });
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
            this._error("Unbalanced CSS attribute selector at column " + previousToken.line + ":" +
                previousToken.column, previousToken);
        }
        else if (parenCount > 0) {
            this._error("Unbalanced pseudo selector function value at column " + previousToken.line +
                ":" + previousToken.column, previousToken);
        }
        return new CssSelectorAST(selectorCssTokens, isComplex);
    };
    CssParser.prototype._parseValue = function (delimiters) {
        delimiters |= RBRACE_DELIM | SEMICOLON_DELIM | NEWLINE_DELIM;
        this._scanner.setMode(lexer_1.CssLexerMode.STYLE_VALUE);
        var tokens = [];
        var previous;
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var token;
            if (lang_1.isPresent(previous) && previous.type == lexer_1.CssTokenType.Identifier && this._scanner.peek == lexer_1.$LPAREN) {
                tokens.push(this._consume(lexer_1.CssTokenType.Character, '('));
                this._scanner.setMode(lexer_1.CssLexerMode.STYLE_VALUE_FUNCTION);
                tokens.push(this._scan());
                this._scanner.setMode(lexer_1.CssLexerMode.STYLE_VALUE);
                token = this._consume(lexer_1.CssTokenType.Character, ')');
                tokens.push(token);
            }
            else {
                token = this._scan();
                if (token.type != lexer_1.CssTokenType.Whitespace) {
                    tokens.push(token);
                }
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
        return new CssStyleValueAST(tokens);
    };
    CssParser.prototype._collectUntilDelim = function (delimiters, assertType) {
        if (assertType === void 0) { assertType = null; }
        var tokens = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var val = lang_1.isPresent(assertType) ? this._consume(assertType) : this._scan();
            tokens.push(val);
        }
        return tokens;
    };
    CssParser.prototype._parseBlock = function (delimiters) {
        delimiters |= RBRACE_DELIM;
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
    CssParser.prototype._parseStyleBlock = function (delimiters) {
        delimiters |= RBRACE_DELIM | LBRACE_DELIM;
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
                    var remainingTokens = this._collectUntilDelim(delimiters | COLON_DELIM | SEMICOLON_DELIM, lexer_1.CssTokenType.Identifier);
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
    CssParser.prototype._assertCondition = function (status, errorMessage, problemToken) {
        if (!status) {
            this._error(errorMessage, problemToken);
            return true;
        }
        return false;
    };
    CssParser.prototype._error = function (message, problemToken) {
        var length = problemToken.strValue.length;
        var error = new CssParseError(this._file, 0, problemToken.line, problemToken.column, length, message);
        this._errors.push(error);
    };
    return CssParser;
})();
exports.CssParser = CssParser;
var CssStyleValueAST = (function (_super) {
    __extends(CssStyleValueAST, _super);
    function CssStyleValueAST(tokens) {
        _super.call(this);
        this.tokens = tokens;
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
    function CssKeyframeDefinitionAST(steps, block) {
        _super.call(this, BlockType.Keyframes, block, mergeTokens(steps, ","));
        this.steps = steps;
    }
    CssKeyframeDefinitionAST.prototype.visit = function (visitor, context) { visitor.visitCssKeyframeDefinition(this, context); };
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
    function CssParseError(file, offset, line, col, length, errMsg) {
        var start = new parse_util_1.ParseLocation(file, offset, line, col);
        var end = new parse_util_1.ParseLocation(file, offset, line, col + length);
        var span = new parse_util_1.ParseSourceSpan(start, end);
        _super.call(this, span, "CSS Parse Error: " + errMsg);
    }
    return CssParseError;
})(parse_util_1.ParseError);
exports.CssParseError = CssParseError;
var CssUnknownTokenListAST = (function (_super) {
    __extends(CssUnknownTokenListAST, _super);
    function CssUnknownTokenListAST(tokens) {
        _super.call(this);
        this.tokens = tokens;
    }
    CssUnknownTokenListAST.prototype.visit = function (visitor, context) { visitor.visitUnkownRule(this, context); };
    return CssUnknownTokenListAST;
})(CssAST);
exports.CssUnknownTokenListAST = CssUnknownTokenListAST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2Nzcy9wYXJzZXIudHMiXSwibmFtZXMiOlsiQmxvY2tUeXBlIiwibWVyZ2VUb2tlbnMiLCJnZXREZWxpbUZyb21Ub2tlbiIsImdldERlbGltRnJvbUNoYXJhY3RlciIsImNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyIiwiQ3NzQVNUIiwiQ3NzQVNULmNvbnN0cnVjdG9yIiwiQ3NzQVNULnZpc2l0IiwiUGFyc2VkQ3NzUmVzdWx0IiwiUGFyc2VkQ3NzUmVzdWx0LmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VyIiwiQ3NzUGFyc2VyLmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VyLl9yZXNvbHZlQmxvY2tUeXBlIiwiQ3NzUGFyc2VyLnBhcnNlIiwiQ3NzUGFyc2VyLl9wYXJzZVN0eWxlU2hlZXQiLCJDc3NQYXJzZXIuX3BhcnNlUnVsZSIsIkNzc1BhcnNlci5fcGFyc2VBdFJ1bGUiLCJDc3NQYXJzZXIuX3BhcnNlU2VsZWN0b3JSdWxlIiwiQ3NzUGFyc2VyLl9wYXJzZVNlbGVjdG9ycyIsIkNzc1BhcnNlci5fc2NhbiIsIkNzc1BhcnNlci5fY29uc3VtZSIsIkNzc1BhcnNlci5fcGFyc2VLZXlmcmFtZUJsb2NrIiwiQ3NzUGFyc2VyLl9wYXJzZUtleWZyYW1lRGVmaW5pdGlvbiIsIkNzc1BhcnNlci5fcGFyc2VLZXlmcmFtZUxhYmVsIiwiQ3NzUGFyc2VyLl9wYXJzZVNlbGVjdG9yIiwiQ3NzUGFyc2VyLl9wYXJzZVZhbHVlIiwiQ3NzUGFyc2VyLl9jb2xsZWN0VW50aWxEZWxpbSIsIkNzc1BhcnNlci5fcGFyc2VCbG9jayIsIkNzc1BhcnNlci5fcGFyc2VTdHlsZUJsb2NrIiwiQ3NzUGFyc2VyLl9wYXJzZURlZmluaXRpb24iLCJDc3NQYXJzZXIuX2Fzc2VydENvbmRpdGlvbiIsIkNzc1BhcnNlci5fZXJyb3IiLCJDc3NTdHlsZVZhbHVlQVNUIiwiQ3NzU3R5bGVWYWx1ZUFTVC5jb25zdHJ1Y3RvciIsIkNzc1N0eWxlVmFsdWVBU1QudmlzaXQiLCJDc3NSdWxlQVNUIiwiQ3NzUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc0Jsb2NrUnVsZUFTVCIsIkNzc0Jsb2NrUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc0Jsb2NrUnVsZUFTVC52aXNpdCIsIkNzc0tleWZyYW1lUnVsZUFTVCIsIkNzc0tleWZyYW1lUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc0tleWZyYW1lUnVsZUFTVC52aXNpdCIsIkNzc0tleWZyYW1lRGVmaW5pdGlvbkFTVCIsIkNzc0tleWZyYW1lRGVmaW5pdGlvbkFTVC5jb25zdHJ1Y3RvciIsIkNzc0tleWZyYW1lRGVmaW5pdGlvbkFTVC52aXNpdCIsIkNzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1QiLCJDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzQmxvY2tEZWZpbml0aW9uUnVsZUFTVC52aXNpdCIsIkNzc01lZGlhUXVlcnlSdWxlQVNUIiwiQ3NzTWVkaWFRdWVyeVJ1bGVBU1QuY29uc3RydWN0b3IiLCJDc3NNZWRpYVF1ZXJ5UnVsZUFTVC52aXNpdCIsIkNzc0lubGluZVJ1bGVBU1QiLCJDc3NJbmxpbmVSdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzSW5saW5lUnVsZUFTVC52aXNpdCIsIkNzc1NlbGVjdG9yUnVsZUFTVCIsIkNzc1NlbGVjdG9yUnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc1NlbGVjdG9yUnVsZUFTVC52aXNpdCIsIkNzc0RlZmluaXRpb25BU1QiLCJDc3NEZWZpbml0aW9uQVNULmNvbnN0cnVjdG9yIiwiQ3NzRGVmaW5pdGlvbkFTVC52aXNpdCIsIkNzc1NlbGVjdG9yQVNUIiwiQ3NzU2VsZWN0b3JBU1QuY29uc3RydWN0b3IiLCJDc3NTZWxlY3RvckFTVC52aXNpdCIsIkNzc0Jsb2NrQVNUIiwiQ3NzQmxvY2tBU1QuY29uc3RydWN0b3IiLCJDc3NCbG9ja0FTVC52aXNpdCIsIkNzc1N0eWxlU2hlZXRBU1QiLCJDc3NTdHlsZVNoZWV0QVNULmNvbnN0cnVjdG9yIiwiQ3NzU3R5bGVTaGVldEFTVC52aXNpdCIsIkNzc1BhcnNlRXJyb3IiLCJDc3NQYXJzZUVycm9yLmNvbnN0cnVjdG9yIiwiQ3NzVW5rbm93blRva2VuTGlzdEFTVCIsIkNzc1Vua25vd25Ub2tlbkxpc3RBU1QuY29uc3RydWN0b3IiLCJDc3NVbmtub3duVG9rZW5MaXN0QVNULnZpc2l0Il0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJCQUtPLGtDQUFrQyxDQUFDLENBQUE7QUFFMUMscUJBQXNELDBCQUEwQixDQUFDLENBQUE7QUFHakYsc0JBbUJPLGlDQUFpQyxDQUFDLENBQUE7QUFFekMsc0JBRU8saUNBQWlDLENBQUM7QUFEdkMsb0NBQ3VDO0FBRXpDLFdBQVksU0FBUztJQUNuQkEsNkNBQU1BLENBQUFBO0lBQ05BLCtDQUFPQSxDQUFBQTtJQUNQQSxtREFBU0EsQ0FBQUE7SUFDVEEsaURBQVFBLENBQUFBO0lBQ1JBLG1EQUFTQSxDQUFBQTtJQUNUQSxxREFBVUEsQ0FBQUE7SUFDVkEsaURBQVFBLENBQUFBO0lBQ1JBLGlEQUFRQSxDQUFBQTtJQUNSQSx5Q0FBSUEsQ0FBQUE7SUFDSkEsaURBQVFBLENBQUFBO0lBQ1JBLGtEQUFRQSxDQUFBQTtJQUNSQSx3REFBV0EsQ0FBQUE7QUFDYkEsQ0FBQ0EsRUFiVyxpQkFBUyxLQUFULGlCQUFTLFFBYXBCO0FBYkQsSUFBWSxTQUFTLEdBQVQsaUJBYVgsQ0FBQTtBQUVELElBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNwQixJQUFNLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDdkIsSUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQUN0QixJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdkIsSUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBQzNCLElBQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUN6QixJQUFNLFlBQVksR0FBRyxHQUFHLENB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cmNlRmlsZSxcbiAgUGFyc2VMb2NhdGlvbixcbiAgUGFyc2VFcnJvclxufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3BhcnNlX3V0aWxcIjtcblxuaW1wb3J0IHtOdW1iZXJXcmFwcGVyLCBTdHJpbmdXcmFwcGVyLCBpc1ByZXNlbnR9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuaW1wb3J0IHtcbiAgQ3NzTGV4ZXJNb2RlLFxuICBDc3NUb2tlbixcbiAgQ3NzVG9rZW5UeXBlLFxuICBDc3NTY2FubmVyLFxuICBDc3NTY2FubmVyRXJyb3IsXG4gIGdlbmVyYXRlRXJyb3JNZXNzYWdlLFxuICAkQVQsXG4gICRFT0YsXG4gICRSQlJBQ0UsXG4gICRMQlJBQ0UsXG4gICRMQlJBQ0tFVCxcbiAgJFJCUkFDS0VULFxuICAkTFBBUkVOLFxuICAkUlBBUkVOLFxuICAkQ09NTUEsXG4gICRDT0xPTixcbiAgJFNFTUlDT0xPTixcbiAgaXNOZXdsaW5lXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyXCI7XG5cbmV4cG9ydCB7XG4gIENzc1Rva2VuXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyXCI7XG5cbmV4cG9ydCBlbnVtIEJsb2NrVHlwZSB7XG4gIEltcG9ydCxcbiAgQ2hhcnNldCxcbiAgTmFtZXNwYWNlLFxuICBTdXBwb3J0cyxcbiAgS2V5ZnJhbWVzLFxuICBNZWRpYVF1ZXJ5LFxuICBTZWxlY3RvcixcbiAgRm9udEZhY2UsXG4gIFBhZ2UsXG4gIERvY3VtZW50LFxuICBWaWV3cG9ydCxcbiAgVW5zdXBwb3J0ZWRcbn1cblxuY29uc3QgRU9GX0RFTElNID0gMTtcbmNvbnN0IFJCUkFDRV9ERUxJTSA9IDI7XG5jb25zdCBMQlJBQ0VfREVMSU0gPSA0O1xuY29uc3QgQ09NTUFfREVMSU0gPSA4O1xuY29uc3QgQ09MT05fREVMSU0gPSAxNjtcbmNvbnN0IFNFTUlDT0xPTl9ERUxJTSA9IDMyO1xuY29uc3QgTkVXTElORV9ERUxJTSA9IDY0O1xuY29uc3QgUlBBUkVOX0RFTElNID0gMTI4O1xuXG5mdW5jdGlvbiBtZXJnZVRva2Vucyh0b2tlbnM6IENzc1Rva2VuW10sIHNlcGFyYXRvcjogc3RyaW5nID0gXCJcIik6IENzc1Rva2VuIHtcbiAgdmFyIG1haW5Ub2tlbiA9IHRva2Vuc1swXTtcbiAgdmFyIHN0ciA9IG1haW5Ub2tlbi5zdHJWYWx1ZTtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBzdHIgKz0gc2VwYXJhdG9yICsgdG9rZW5zW2ldLnN0clZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBDc3NUb2tlbihtYWluVG9rZW4uaW5kZXgsIG1haW5Ub2tlbi5jb2x1bW4sIG1haW5Ub2tlbi5saW5lLCBtYWluVG9rZW4udHlwZSwgc3RyKTtcbn1cblxuZnVuY3Rpb24gZ2V0RGVsaW1Gcm9tVG9rZW4odG9rZW46IENzc1Rva2VuKTogbnVtYmVyIHtcbiAgcmV0dXJuIGdldERlbGltRnJvbUNoYXJhY3Rlcih0b2tlbi5udW1WYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIGdldERlbGltRnJvbUNoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBudW1iZXIge1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRFT0Y6XG4gICAgICByZXR1cm4gRU9GX0RFTElNO1xuICAgIGNhc2UgJENPTU1BOlxuICAgICAgcmV0dXJuIENPTU1BX0RFTElNO1xuICAgIGNhc2UgJENPTE9OOlxuICAgICAgcmV0dXJuIENPTE9OX0RFTElNO1xuICAgIGNhc2UgJFNFTUlDT0xPTjpcbiAgICAgIHJldHVybiBTRU1JQ09MT05fREVMSU07XG4gICAgY2FzZSAkUkJSQUNFOlxuICAgICAgcmV0dXJuIFJCUkFDRV9ERUxJTTtcbiAgICBjYXNlICRMQlJBQ0U6XG4gICAgICByZXR1cm4gTEJSQUNFX0RFTElNO1xuICAgIGNhc2UgJFJQQVJFTjpcbiAgICAgIHJldHVybiBSUEFSRU5fREVMSU07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBpc05ld2xpbmUoY29kZSkgPyBORVdMSU5FX0RFTElNIDogMDtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcihjb2RlOiBudW1iZXIsIGRlbGltaXRlcnM6IG51bWJlcikge1xuICByZXR1cm4gKGdldERlbGltRnJvbUNoYXJhY3Rlcihjb2RlKSAmIGRlbGltaXRlcnMpID4gMDtcbn1cblxuZXhwb3J0IGNsYXNzIENzc0FTVCB7XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpOiB2b2lkIHt9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3NzQVNUVmlzaXRvciB7XG4gIHZpc2l0Q3NzVmFsdWUoYXN0OiBDc3NTdHlsZVZhbHVlQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRJbmxpbmVDc3NSdWxlKGFzdDogQ3NzSW5saW5lUnVsZUFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzS2V5ZnJhbWVSdWxlKGFzdDogQ3NzS2V5ZnJhbWVSdWxlQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NLZXlmcmFtZURlZmluaXRpb24oYXN0OiBDc3NLZXlmcmFtZURlZmluaXRpb25BU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc01lZGlhUXVlcnlSdWxlKGFzdDogQ3NzTWVkaWFRdWVyeVJ1bGVBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc1NlbGVjdG9yUnVsZShhc3Q6IENzc1NlbGVjdG9yUnVsZUFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzU2VsZWN0b3IoYXN0OiBDc3NTZWxlY3RvckFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzRGVmaW5pdGlvbihhc3Q6IENzc0RlZmluaXRpb25BU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc0Jsb2NrKGFzdDogQ3NzQmxvY2tBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc1N0eWxlU2hlZXQoYXN0OiBDc3NTdHlsZVNoZWV0QVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRVbmtvd25SdWxlKGFzdDogQ3NzVW5rbm93blRva2VuTGlzdEFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZWRDc3NSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXJyb3JzOiBDc3NQYXJzZUVycm9yW10sIHB1YmxpYyBhc3Q6IENzc1N0eWxlU2hlZXRBU1QpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NQYXJzZXIge1xuICBwcml2YXRlIF9lcnJvcnM6IENzc1BhcnNlRXJyb3JbXSA9IFtdO1xuICBwcml2YXRlIF9maWxlOiBQYXJzZVNvdXJjZUZpbGU7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfc2Nhbm5lcjogQ3NzU2Nhbm5lciwgcHJpdmF0ZSBfZmlsZU5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX2ZpbGUgPSBuZXcgUGFyc2VTb3VyY2VGaWxlKHRoaXMuX3NjYW5uZXIuaW5wdXQsIF9maWxlTmFtZSk7XG4gIH1cblxuICBfcmVzb2x2ZUJsb2NrVHlwZSh0b2tlbjogQ3NzVG9rZW4pOiBCbG9ja1R5cGUge1xuICAgIHN3aXRjaCAodG9rZW4uc3RyVmFsdWUpIHtcbiAgICAgIGNhc2UgJ0Atby1rZXlmcmFtZXMnOlxuICAgICAgY2FzZSAnQC1tb3ota2V5ZnJhbWVzJzpcbiAgICAgIGNhc2UgJ0Atd2Via2l0LWtleWZyYW1lcyc6XG4gICAgICBjYXNlICdAa2V5ZnJhbWVzJzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5LZXlmcmFtZXM7XG5cbiAgICAgIGNhc2UgJ0BjaGFyc2V0JzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5DaGFyc2V0O1xuXG4gICAgICBjYXNlICdAaW1wb3J0JzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5JbXBvcnQ7XG5cbiAgICAgIGNhc2UgJ0BuYW1lc3BhY2UnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLk5hbWVzcGFjZTtcblxuICAgICAgY2FzZSAnQHBhZ2UnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLlBhZ2U7XG5cbiAgICAgIGNhc2UgJ0Bkb2N1bWVudCc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuRG9jdW1lbnQ7XG5cbiAgICAgIGNhc2UgJ0BtZWRpYSc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuTWVkaWFRdWVyeTtcblxuICAgICAgY2FzZSAnQGZvbnQtZmFjZSc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuRm9udEZhY2U7XG5cbiAgICAgIGNhc2UgJ0B2aWV3cG9ydCc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuVmlld3BvcnQ7XG5cbiAgICAgIGNhc2UgJ0BzdXBwb3J0cyc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuU3VwcG9ydHM7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuVW5zdXBwb3J0ZWQ7XG4gICAgfVxuICB9XG5cbiAgcGFyc2UoKTogUGFyc2VkQ3NzUmVzdWx0IHtcbiAgICB2YXIgZGVsaW1pdGVyczogbnVtYmVyID0gRU9GX0RFTElNO1xuICAgIHZhciBhc3QgPSB0aGlzLl9wYXJzZVN0eWxlU2hlZXQoZGVsaW1pdGVycyk7XG5cbiAgICB2YXIgZXJyb3JzID0gdGhpcy5fZXJyb3JzO1xuICAgIHRoaXMuX2Vycm9ycyA9IFtdO1xuXG4gICAgcmV0dXJuIG5ldyBQYXJzZWRDc3NSZXN1bHQoZXJyb3JzLCBhc3QpO1xuICB9XG5cbiAgX3BhcnNlU3R5bGVTaGVldChkZWxpbWl0ZXJzKTogQ3NzU3R5bGVTaGVldEFTVCB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcbiAgICB3aGlsZSAodGhpcy5fc2Nhbm5lci5wZWVrICE9ICRFT0YpIHtcbiAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3BhcnNlUnVsZShkZWxpbWl0ZXJzKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQ3NzU3R5bGVTaGVldEFTVChyZXN1bHRzKTtcbiAgfVxuXG4gIF9wYXJzZVJ1bGUoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzUnVsZUFTVCB7XG4gICAgaWYgKHRoaXMuX3NjYW5uZXIucGVlayA9PSAkQVQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJzZUF0UnVsZShkZWxpbWl0ZXJzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3BhcnNlU2VsZWN0b3JSdWxlKGRlbGltaXRlcnMpO1xuICB9XG5cbiAgX3BhcnNlQXRSdWxlKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1J1bGVBU1Qge1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuXG4gICAgdmFyIHRva2VuID0gdGhpcy5fc2NhbigpO1xuXG4gICAgdGhpcy5fYXNzZXJ0Q29uZGl0aW9uKHRva2VuLnR5cGUgPT0gQ3NzVG9rZW5UeXBlLkF0S2V5d29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYFRoZSBDU1MgUnVsZSAke3Rva2VuLnN0clZhbHVlfSBpcyBub3QgYSB2YWxpZCBbQF0gcnVsZS5gLCB0b2tlbik7XG5cbiAgICB2YXIgYmxvY2ssIHR5cGUgPSB0aGlzLl9yZXNvbHZlQmxvY2tUeXBlKHRva2VuKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgQmxvY2tUeXBlLkNoYXJzZXQ6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5OYW1lc3BhY2U6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5JbXBvcnQ6XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuX3BhcnNlVmFsdWUoZGVsaW1pdGVycyk7XG4gICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgICAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDc3NJbmxpbmVSdWxlQVNUKHR5cGUsIHZhbHVlKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuVmlld3BvcnQ6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5Gb250RmFjZTpcbiAgICAgICAgYmxvY2sgPSB0aGlzLl9wYXJzZVN0eWxlQmxvY2soZGVsaW1pdGVycyk7XG4gICAgICAgIHJldHVybiBuZXcgQ3NzQmxvY2tSdWxlQVNUKHR5cGUsIGJsb2NrKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuS2V5ZnJhbWVzOlxuICAgICAgICB2YXIgdG9rZW5zID0gdGhpcy5fY29sbGVjdFVudGlsRGVsaW0oZGVsaW1pdGVycyB8IFJCUkFDRV9ERUxJTSB8IExCUkFDRV9ERUxJTSk7XG4gICAgICAgIC8vIGtleWZyYW1lcyBvbmx5IGhhdmUgb25lIGlkZW50aWZpZXIgbmFtZVxuICAgICAgICB2YXIgbmFtZSA9IHRva2Vuc1swXTtcbiAgICAgICAgcmV0dXJuIG5ldyBDc3NLZXlmcmFtZVJ1bGVBU1QobmFtZSwgdGhpcy5fcGFyc2VLZXlmcmFtZUJsb2NrKGRlbGltaXRlcnMpKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuTWVkaWFRdWVyeTpcbiAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5NRURJQV9RVUVSWSk7XG4gICAgICAgIHZhciB0b2tlbnMgPSB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShkZWxpbWl0ZXJzIHwgUkJSQUNFX0RFTElNIHwgTEJSQUNFX0RFTElNKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDc3NNZWRpYVF1ZXJ5UnVsZUFTVCh0b2tlbnMsIHRoaXMuX3BhcnNlQmxvY2soZGVsaW1pdGVycykpO1xuXG4gICAgICBjYXNlIEJsb2NrVHlwZS5Eb2N1bWVudDpcbiAgICAgIGNhc2UgQmxvY2tUeXBlLlN1cHBvcnRzOlxuICAgICAgY2FzZSBCbG9ja1R5cGUuUGFnZTpcbiAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5BVF9SVUxFX1FVRVJZKTtcbiAgICAgICAgdmFyIHRva2VucyA9IHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKGRlbGltaXRlcnMgfCBSQlJBQ0VfREVMSU0gfCBMQlJBQ0VfREVMSU0pO1xuICAgICAgICByZXR1cm4gbmV3IENzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1QodHlwZSwgdG9rZW5zLCB0aGlzLl9wYXJzZUJsb2NrKGRlbGltaXRlcnMpKTtcblxuICAgICAgLy8gaWYgYSBjdXN0b20gQHJ1bGUgeyAuLi4gfSBpcyB1c2VkIGl0IHNob3VsZCBzdGlsbCB0b2tlbml6ZSB0aGUgaW5zaWRlc1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIGxpc3RPZlRva2VucyA9IFt0b2tlbl07XG4gICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQUxMKTtcbiAgICAgICAgdGhpcy5fZXJyb3IoZ2VuZXJhdGVFcnJvck1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY2FubmVyLmlucHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgYFRoZSBDU1MgXCJhdFwiIHJ1bGUgXCIke3Rva2VuLnN0clZhbHVlfVwiIGlzIG5vdCBhbGxvd2VkIHRvIHVzZWQgaGVyZWAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5zdHJWYWx1ZSwgdG9rZW4uaW5kZXgsIHRva2VuLmxpbmUsIHRva2VuLmNvbHVtbiksXG4gICAgICAgICAgICAgICAgICAgIHRva2VuKTtcblxuICAgICAgICB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShkZWxpbWl0ZXJzIHwgTEJSQUNFX0RFTElNIHwgU0VNSUNPTE9OX0RFTElNKVxuICAgICAgICAgICAgLmZvckVhY2goKHRva2VuKSA9PiB7IGxpc3RPZlRva2Vucy5wdXNoKHRva2VuKTsgfSk7XG4gICAgICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgPT0gJExCUkFDRSkge1xuICAgICAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ3snKTtcbiAgICAgICAgICB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShkZWxpbWl0ZXJzIHwgUkJSQUNFX0RFTElNIHwgTEJSQUNFX0RFTElNKVxuICAgICAgICAgICAgICAuZm9yRWFjaCgodG9rZW4pID0+IHsgbGlzdE9mVG9rZW5zLnB1c2godG9rZW4pOyB9KTtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd9Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBDc3NVbmtub3duVG9rZW5MaXN0QVNUKGxpc3RPZlRva2Vucyk7XG4gICAgfVxuICB9XG5cbiAgX3BhcnNlU2VsZWN0b3JSdWxlKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1NlbGVjdG9yUnVsZUFTVCB7XG4gICAgdmFyIHNlbGVjdG9ycyA9IHRoaXMuX3BhcnNlU2VsZWN0b3JzKGRlbGltaXRlcnMpO1xuICAgIHZhciBibG9jayA9IHRoaXMuX3BhcnNlU3R5bGVCbG9jayhkZWxpbWl0ZXJzKTtcbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkJMT0NLKTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcbiAgICByZXR1cm4gbmV3IENzc1NlbGVjdG9yUnVsZUFTVChzZWxlY3RvcnMsIGJsb2NrKTtcbiAgfVxuXG4gIF9wYXJzZVNlbGVjdG9ycyhkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NTZWxlY3RvckFTVFtdIHtcbiAgICBkZWxpbWl0ZXJzIHw9IExCUkFDRV9ERUxJTTtcblxuICAgIHZhciBzZWxlY3RvcnMgPSBbXTtcbiAgICB2YXIgaXNQYXJzaW5nU2VsZWN0b3JzID0gdHJ1ZTtcbiAgICB3aGlsZSAoaXNQYXJzaW5nU2VsZWN0b3JzKSB7XG4gICAgICBzZWxlY3RvcnMucHVzaCh0aGlzLl9wYXJzZVNlbGVjdG9yKGRlbGltaXRlcnMpKTtcblxuICAgICAgaXNQYXJzaW5nU2VsZWN0b3JzID0gIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycyk7XG5cbiAgICAgIGlmIChpc1BhcnNpbmdTZWxlY3RvcnMpIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnLCcpO1xuICAgICAgICBpc1BhcnNpbmdTZWxlY3RvcnMgPSAhY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZWN0b3JzO1xuICB9XG5cbiAgX3NjYW4oKTogQ3NzVG9rZW4ge1xuICAgIHZhciBvdXRwdXQgPSB0aGlzLl9zY2FubmVyLnNjYW4oKTtcbiAgICB2YXIgdG9rZW4gPSBvdXRwdXQudG9rZW47XG4gICAgdmFyIGVycm9yID0gb3V0cHV0LmVycm9yO1xuICAgIGlmIChpc1ByZXNlbnQoZXJyb3IpKSB7XG4gICAgICB0aGlzLl9lcnJvcihlcnJvci5yYXdNZXNzYWdlLCB0b2tlbik7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIF9jb25zdW1lKHR5cGU6IENzc1Rva2VuVHlwZSwgdmFsdWU6IHN0cmluZyA9IG51bGwpOiBDc3NUb2tlbiB7XG4gICAgdmFyIG91dHB1dCA9IHRoaXMuX3NjYW5uZXIuY29uc3VtZSh0eXBlLCB2YWx1ZSk7XG4gICAgdmFyIHRva2VuID0gb3V0cHV0LnRva2VuO1xuICAgIHZhciBlcnJvciA9IG91dHB1dC5lcnJvcjtcbiAgICBpZiAoaXNQcmVzZW50KGVycm9yKSkge1xuICAgICAgdGhpcy5fZXJyb3IoZXJyb3IucmF3TWVzc2FnZSwgdG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICBfcGFyc2VLZXlmcmFtZUJsb2NrKGRlbGltaXRlcnM6IG51bWJlcik6IENzc0Jsb2NrQVNUIHtcbiAgICBkZWxpbWl0ZXJzIHw9IFJCUkFDRV9ERUxJTTtcbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLktFWUZSQU1FX0JMT0NLKTtcblxuICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ3snKTtcblxuICAgIHZhciBkZWZpbml0aW9ucyA9IFtdO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgZGVmaW5pdGlvbnMucHVzaCh0aGlzLl9wYXJzZUtleWZyYW1lRGVmaW5pdGlvbihkZWxpbWl0ZXJzKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnfScpO1xuXG4gICAgcmV0dXJuIG5ldyBDc3NCbG9ja0FTVChkZWZpbml0aW9ucyk7XG4gIH1cblxuICBfcGFyc2VLZXlmcmFtZURlZmluaXRpb24oZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNUIHtcbiAgICB2YXIgc3RlcFRva2VucyA9IFtdO1xuICAgIGRlbGltaXRlcnMgfD0gTEJSQUNFX0RFTElNO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgc3RlcFRva2Vucy5wdXNoKHRoaXMuX3BhcnNlS2V5ZnJhbWVMYWJlbChkZWxpbWl0ZXJzIHwgQ09NTUFfREVMSU0pKTtcbiAgICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgIT0gJExCUkFDRSkge1xuICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcsJyk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBzdHlsZXMgPSB0aGlzLl9wYXJzZVN0eWxlQmxvY2soZGVsaW1pdGVycyB8IFJCUkFDRV9ERUxJTSk7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5CTE9DSyk7XG4gICAgcmV0dXJuIG5ldyBDc3NLZXlmcmFtZURlZmluaXRpb25BU1Qoc3RlcFRva2Vucywgc3R5bGVzKTtcbiAgfVxuXG4gIF9wYXJzZUtleWZyYW1lTGFiZWwoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzVG9rZW4ge1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuS0VZRlJBTUVfQkxPQ0spO1xuICAgIHJldHVybiBtZXJnZVRva2Vucyh0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShkZWxpbWl0ZXJzKSk7XG4gIH1cblxuICBfcGFyc2VTZWxlY3RvcihkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NTZWxlY3RvckFTVCB7XG4gICAgZGVsaW1pdGVycyB8PSBDT01NQV9ERUxJTSB8IExCUkFDRV9ERUxJTTtcbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNFTEVDVE9SKTtcblxuICAgIHZhciBzZWxlY3RvckNzc1Rva2VucyA9IFtdO1xuICAgIHZhciBpc0NvbXBsZXggPSBmYWxzZTtcbiAgICB2YXIgd3NDc3NUb2tlbjtcblxuICAgIHZhciBwcmV2aW91c1Rva2VuO1xuICAgIHZhciBwYXJlbkNvdW50ID0gMDtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIHZhciBjb2RlID0gdGhpcy5fc2Nhbm5lci5wZWVrO1xuICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgIGNhc2UgJExQQVJFTjpcbiAgICAgICAgICBwYXJlbkNvdW50Kys7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAkUlBBUkVOOlxuICAgICAgICAgIHBhcmVuQ291bnQtLTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICRDT0xPTjpcbiAgICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlBTRVVET19TRUxFQ1RPUik7XG4gICAgICAgICAgcHJldmlvdXNUb2tlbiA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJzonKTtcbiAgICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHByZXZpb3VzVG9rZW4pO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJExCUkFDS0VUOlxuICAgICAgICAgIC8vIGlmIHdlIGFyZSBhbHJlYWR5IGluc2lkZSBhbiBhdHRyaWJ1dGUgc2VsZWN0b3IgdGhlbiB3ZSBjYW4ndFxuICAgICAgICAgIC8vIGp1bXAgaW50byB0aGUgbW9kZSBhZ2Fpbi4gVGhlcmVmb3JlIHRoaXMgZXJyb3Igd2lsbCBnZXQgcGlja2VkXG4gICAgICAgICAgLy8gdXAgd2hlbiB0aGUgc2NhbiBtZXRob2QgaXMgY2FsbGVkIGJlbG93LlxuICAgICAgICAgIGlmICh0aGlzLl9zY2FubmVyLmdldE1vZGUoKSAhPSBDc3NMZXhlck1vZGUuQVRUUklCVVRFX1NFTEVDVE9SKSB7XG4gICAgICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ1snKSk7XG4gICAgICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkFUVFJJQlVURV9TRUxFQ1RPUik7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAkUkJSQUNLRVQ6XG4gICAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICddJykpO1xuICAgICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU0VMRUNUT1IpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB2YXIgdG9rZW4gPSB0aGlzLl9zY2FuKCk7XG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgdGhlIFwiOm5vdChcIiBzZWxlY3RvciBzaW5jZSBpdFxuICAgICAgLy8gY29udGFpbnMgYW4gaW5uZXIgc2VsZWN0b3IgdGhhdCBuZWVkcyB0byBiZSBwYXJzZWRcbiAgICAgIC8vIGluIGlzb2xhdGlvblxuICAgICAgaWYgKHRoaXMuX3NjYW5uZXIuZ2V0TW9kZSgpID09IENzc0xleGVyTW9kZS5QU0VVRE9fU0VMRUNUT1IgJiYgaXNQcmVzZW50KHByZXZpb3VzVG9rZW4pICYmXG4gICAgICAgICAgcHJldmlvdXNUb2tlbi5udW1WYWx1ZSA9PSAkQ09MT04gJiYgdG9rZW4uc3RyVmFsdWUgPT0gXCJub3RcIiAmJlxuICAgICAgICAgIHRoaXMuX3NjYW5uZXIucGVlayA9PSAkTFBBUkVOKSB7XG5cbiAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2godGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnKCcpKTtcblxuICAgICAgICAvLyB0aGUgaW5uZXIgc2VsZWN0b3IgaW5zaWRlIG9mIDpub3QoLi4uKSBjYW4gb25seSBiZSBvbmVcbiAgICAgICAgLy8gQ1NTIHNlbGVjdG9yIChubyBjb21tYXMgYWxsb3dlZCkgdGhlcmVmb3JlIHdlIHBhcnNlIG9ubHlcbiAgICAgICAgLy8gb25lIHNlbGVjdG9yIGJ5IGNhbGxpbmcgdGhlIG1ldGhvZCBiZWxvd1xuICAgICAgICB0aGlzLl9wYXJzZVNlbGVjdG9yKGRlbGltaXRlcnMgfCBSUEFSRU5fREVMSU0pLnRva2Vucy5mb3JFYWNoKFxuICAgICAgICAgICAgKGlubmVyU2VsZWN0b3JUb2tlbikgPT4geyBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKGlubmVyU2VsZWN0b3JUb2tlbik7IH0pO1xuXG4gICAgICAgIHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2godGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnKScpKTtcblxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgcHJldmlvdXNUb2tlbiA9IHRva2VuO1xuXG4gICAgICBpZiAodG9rZW4udHlwZSA9PSBDc3NUb2tlblR5cGUuV2hpdGVzcGFjZSkge1xuICAgICAgICB3c0Nzc1Rva2VuID0gdG9rZW47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNQcmVzZW50KHdzQ3NzVG9rZW4pKSB7XG4gICAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh3c0Nzc1Rva2VuKTtcbiAgICAgICAgICB3c0Nzc1Rva2VuID0gbnVsbDtcbiAgICAgICAgICBpc0NvbXBsZXggPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9zY2FubmVyLmdldE1vZGUoKSA9PSBDc3NMZXhlck1vZGUuQVRUUklCVVRFX1NFTEVDVE9SKSB7XG4gICAgICB0aGlzLl9lcnJvcihcIlVuYmFsYW5jZWQgQ1NTIGF0dHJpYnV0ZSBzZWxlY3RvciBhdCBjb2x1bW4gXCIgKyBwcmV2aW91c1Rva2VuLmxpbmUgKyBcIjpcIiArXG4gICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNUb2tlbi5jb2x1bW4sXG4gICAgICAgICAgICAgICAgICBwcmV2aW91c1Rva2VuKTtcbiAgICB9IGVsc2UgaWYgKHBhcmVuQ291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9lcnJvcihcIlVuYmFsYW5jZWQgcHNldWRvIHNlbGVjdG9yIGZ1bmN0aW9uIHZhbHVlIGF0IGNvbHVtbiBcIiArIHByZXZpb3VzVG9rZW4ubGluZSArXG4gICAgICAgICAgICAgICAgICAgICAgXCI6XCIgKyBwcmV2aW91c1Rva2VuLmNvbHVtbixcbiAgICAgICAgICAgICAgICAgIHByZXZpb3VzVG9rZW4pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ3NzU2VsZWN0b3JBU1Qoc2VsZWN0b3JDc3NUb2tlbnMsIGlzQ29tcGxleCk7XG4gIH1cblxuICBfcGFyc2VWYWx1ZShkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NTdHlsZVZhbHVlQVNUIHtcbiAgICBkZWxpbWl0ZXJzIHw9IFJCUkFDRV9ERUxJTSB8IFNFTUlDT0xPTl9ERUxJTSB8IE5FV0xJTkVfREVMSU07XG5cbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFKTtcblxuICAgIHZhciB0b2tlbnMgPSBbXTtcbiAgICB2YXIgcHJldmlvdXM6IENzc1Rva2VuO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgdmFyIHRva2VuO1xuICAgICAgaWYgKGlzUHJlc2VudChwcmV2aW91cykgJiYgcHJldmlvdXMudHlwZSA9PSBDc3NUb2tlblR5cGUuSWRlbnRpZmllciAmJiB0aGlzLl9zY2FubmVyLnBlZWsgPT0gJExQQVJFTikge1xuICAgICAgICB0b2tlbnMucHVzaCh0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcoJykpO1xuXG4gICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU1RZTEVfVkFMVUVfRlVOQ1RJT04pO1xuICAgICAgICB0b2tlbnMucHVzaCh0aGlzLl9zY2FuKCkpO1xuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFKTtcblxuICAgICAgICB0b2tlbiA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJyknKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW4gPSB0aGlzLl9zY2FuKCk7XG4gICAgICAgIGlmICh0b2tlbi50eXBlICE9IENzc1Rva2VuVHlwZS5XaGl0ZXNwYWNlKSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHByZXZpb3VzID0gdG9rZW47XG4gICAgfVxuXG4gICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lV2hpdGVzcGFjZSgpO1xuXG4gICAgdmFyIGNvZGUgPSB0aGlzLl9zY2FubmVyLnBlZWs7XG4gICAgaWYgKGNvZGUgPT0gJFNFTUlDT0xPTikge1xuICAgICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnOycpO1xuICAgIH0gZWxzZSBpZiAoY29kZSAhPSAkUkJSQUNFKSB7XG4gICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICBnZW5lcmF0ZUVycm9yTWVzc2FnZSh0aGlzLl9zY2FubmVyLmlucHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBUaGUgQ1NTIGtleS92YWx1ZSBkZWZpbml0aW9uIGRpZCBub3QgZW5kIHdpdGggYSBzZW1pY29sb25gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzLnN0clZhbHVlLCBwcmV2aW91cy5pbmRleCwgcHJldmlvdXMubGluZSwgcHJldmlvdXMuY29sdW1uKSxcbiAgICAgICAgICBwcmV2aW91cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDc3NTdHlsZVZhbHVlQVNUKHRva2Vucyk7XG4gIH1cblxuICBfY29sbGVjdFVudGlsRGVsaW0oZGVsaW1pdGVyczogbnVtYmVyLCBhc3NlcnRUeXBlOiBDc3NUb2tlblR5cGUgPSBudWxsKTogQ3NzVG9rZW5bXSB7XG4gICAgdmFyIHRva2VucyA9IFtdO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgdmFyIHZhbCA9IGlzUHJlc2VudChhc3NlcnRUeXBlKSA/IHRoaXMuX2NvbnN1bWUoYXNzZXJ0VHlwZSkgOiB0aGlzLl9zY2FuKCk7XG4gICAgICB0b2tlbnMucHVzaCh2YWwpO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgX3BhcnNlQmxvY2soZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzQmxvY2tBU1Qge1xuICAgIGRlbGltaXRlcnMgfD0gUkJSQUNFX0RFTElNO1xuXG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5CTE9DSyk7XG5cbiAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd7Jyk7XG4gICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG5cbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3BhcnNlUnVsZShkZWxpbWl0ZXJzKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnfScpO1xuXG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5CTE9DSyk7XG4gICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG5cbiAgICByZXR1cm4gbmV3IENzc0Jsb2NrQVNUKHJlc3VsdHMpO1xuICB9XG5cbiAgX3BhcnNlU3R5bGVCbG9jayhkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NCbG9ja0FTVCB7XG4gICAgZGVsaW1pdGVycyB8PSBSQlJBQ0VfREVMSU0gfCBMQlJBQ0VfREVMSU07XG5cbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX0JMT0NLKTtcblxuICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ3snKTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcblxuICAgIHZhciBkZWZpbml0aW9ucyA9IFtdO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgZGVmaW5pdGlvbnMucHVzaCh0aGlzLl9wYXJzZURlZmluaXRpb24oZGVsaW1pdGVycykpO1xuICAgICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnfScpO1xuXG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5TVFlMRV9CTE9DSyk7XG4gICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG5cbiAgICByZXR1cm4gbmV3IENzc0Jsb2NrQVNUKGRlZmluaXRpb25zKTtcbiAgfVxuXG4gIF9wYXJzZURlZmluaXRpb24oZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzRGVmaW5pdGlvbkFTVCB7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5TVFlMRV9CTE9DSyk7XG5cbiAgICB2YXIgcHJvcCA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIpO1xuICAgIHZhciBwYXJzZVZhbHVlLCB2YWx1ZSA9IG51bGw7XG5cbiAgICAvLyB0aGUgY29sb24gdmFsdWUgc2VwYXJhdGVzIHRoZSBwcm9wIGZyb20gdGhlIHN0eWxlLlxuICAgIC8vIHRoZXJlIGFyZSBhIGZldyBjYXNlcyBhcyB0byB3aGF0IGNvdWxkIGhhcHBlbiBpZiBpdFxuICAgIC8vIGlzIG1pc3NpbmdcbiAgICBzd2l0Y2ggKHRoaXMuX3NjYW5uZXIucGVlaykge1xuICAgICAgY2FzZSAkQ09MT046XG4gICAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJzonKTtcbiAgICAgICAgcGFyc2VWYWx1ZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICRTRU1JQ09MT046XG4gICAgICBjYXNlICRSQlJBQ0U6XG4gICAgICBjYXNlICRFT0Y6XG4gICAgICAgIHBhcnNlVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBwcm9wU3RyID0gW3Byb3Auc3RyVmFsdWVdO1xuICAgICAgICBpZiAodGhpcy5fc2Nhbm5lci5wZWVrICE9ICRDT0xPTikge1xuICAgICAgICAgIC8vIHRoaXMgd2lsbCB0aHJvdyB0aGUgZXJyb3JcbiAgICAgICAgICB2YXIgbmV4dFZhbHVlID0gdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnOicpO1xuICAgICAgICAgIHByb3BTdHIucHVzaChuZXh0VmFsdWUuc3RyVmFsdWUpO1xuXG4gICAgICAgICAgdmFyIHJlbWFpbmluZ1Rva2VucyA9IHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKGRlbGltaXRlcnMgfCBDT0xPTl9ERUxJTSB8IFNFTUlDT0xPTl9ERUxJTSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIpO1xuICAgICAgICAgIGlmIChyZW1haW5pbmdUb2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVG9rZW5zLmZvckVhY2goKHRva2VuKSA9PiB7IHByb3BTdHIucHVzaCh0b2tlbi5zdHJWYWx1ZSk7IH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHByb3AgPSBuZXcgQ3NzVG9rZW4ocHJvcC5pbmRleCwgcHJvcC5jb2x1bW4sIHByb3AubGluZSwgcHJvcC50eXBlLCBwcm9wU3RyLmpvaW4oXCIgXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoaXMgbWVhbnMgd2UndmUgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBkZWZpbml0aW9uIGFuZC9vciBibG9ja1xuICAgICAgICBpZiAodGhpcy5fc2Nhbm5lci5wZWVrID09ICRDT0xPTikge1xuICAgICAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJzonKTtcbiAgICAgICAgICBwYXJzZVZhbHVlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXJzZVZhbHVlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHBhcnNlVmFsdWUpIHtcbiAgICAgIHZhbHVlID0gPENzc1N0eWxlVmFsdWVBU1Q+dGhpcy5fcGFyc2VWYWx1ZShkZWxpbWl0ZXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZXJyb3IoZ2VuZXJhdGVFcnJvck1lc3NhZ2UodGhpcy5fc2Nhbm5lci5pbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBUaGUgQ1NTIHByb3BlcnR5IHdhcyBub3QgcGFpcmVkIHdpdGggYSBzdHlsZSB2YWx1ZWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wLnN0clZhbHVlLCBwcm9wLmluZGV4LCBwcm9wLmxpbmUsIHByb3AuY29sdW1uKSxcbiAgICAgICAgICAgICAgICAgIHByb3ApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ3NzRGVmaW5pdGlvbkFTVChwcm9wLCB2YWx1ZSk7XG4gIH1cblxuICBfYXNzZXJ0Q29uZGl0aW9uKHN0YXR1czogYm9vbGVhbiwgZXJyb3JNZXNzYWdlOiBzdHJpbmcsIHByb2JsZW1Ub2tlbjogQ3NzVG9rZW4pOiBib29sZWFuIHtcbiAgICBpZiAoIXN0YXR1cykge1xuICAgICAgdGhpcy5fZXJyb3IoZXJyb3JNZXNzYWdlLCBwcm9ibGVtVG9rZW4pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIF9lcnJvcihtZXNzYWdlOiBzdHJpbmcsIHByb2JsZW1Ub2tlbjogQ3NzVG9rZW4pIHtcbiAgICB2YXIgbGVuZ3RoID0gcHJvYmxlbVRva2VuLnN0clZhbHVlLmxlbmd0aDtcbiAgICB2YXIgZXJyb3IgPVxuICAgICAgICBuZXcgQ3NzUGFyc2VFcnJvcih0aGlzLl9maWxlLCAwLCBwcm9ibGVtVG9rZW4ubGluZSwgcHJvYmxlbVRva2VuLmNvbHVtbiwgbGVuZ3RoLCBtZXNzYWdlKTtcbiAgICB0aGlzLl9lcnJvcnMucHVzaChlcnJvcik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1N0eWxlVmFsdWVBU1QgZXh0ZW5kcyBDc3NBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW5zOiBDc3NUb2tlbltdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzVmFsdWUodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1J1bGVBU1QgZXh0ZW5kcyBDc3NBU1Qge31cblxuZXhwb3J0IGNsYXNzIENzc0Jsb2NrUnVsZUFTVCBleHRlbmRzIENzc1J1bGVBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdHlwZTogQmxvY2tUeXBlLCBwdWJsaWMgYmxvY2s6IENzc0Jsb2NrQVNULCBwdWJsaWMgbmFtZTogQ3NzVG9rZW4gPSBudWxsKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NCbG9jayh0aGlzLmJsb2NrLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzS2V5ZnJhbWVSdWxlQVNUIGV4dGVuZHMgQ3NzQmxvY2tSdWxlQVNUIHtcbiAgY29uc3RydWN0b3IobmFtZTogQ3NzVG9rZW4sIGJsb2NrOiBDc3NCbG9ja0FTVCkgeyBzdXBlcihCbG9ja1R5cGUuS2V5ZnJhbWVzLCBibG9jaywgbmFtZSk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzS2V5ZnJhbWVSdWxlKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NLZXlmcmFtZURlZmluaXRpb25BU1QgZXh0ZW5kcyBDc3NCbG9ja1J1bGVBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RlcHM6IENzc1Rva2VuW10sIGJsb2NrOiBDc3NCbG9ja0FTVCkgeyBzdXBlcihCbG9ja1R5cGUuS2V5ZnJhbWVzLCBibG9jaywgbWVyZ2VUb2tlbnMoc3RlcHMsIFwiLFwiKSk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzS2V5ZnJhbWVEZWZpbml0aW9uKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNUIGV4dGVuZHMgQ3NzQmxvY2tSdWxlQVNUIHtcbiAgcHVibGljIHN0clZhbHVlOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKHR5cGU6IEJsb2NrVHlwZSwgcHVibGljIHF1ZXJ5OiBDc3NUb2tlbltdLCBibG9jazogQ3NzQmxvY2tBU1QpIHtcbiAgICBzdXBlcih0eXBlLCBibG9jayk7XG4gICAgdGhpcy5zdHJWYWx1ZSA9IHF1ZXJ5Lm1hcCh0b2tlbiA9PiB0b2tlbi5zdHJWYWx1ZSkuam9pbihcIlwiKTtcbiAgICB2YXIgZmlyc3RDc3NUb2tlbjogQ3NzVG9rZW4gPSBxdWVyeVswXTtcbiAgICB0aGlzLm5hbWUgPSBuZXcgQ3NzVG9rZW4oZmlyc3RDc3NUb2tlbi5pbmRleCwgZmlyc3RDc3NUb2tlbi5jb2x1bW4sIGZpcnN0Q3NzVG9rZW4ubGluZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIsIHRoaXMuc3RyVmFsdWUpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0Jsb2NrKHRoaXMuYmxvY2ssIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NNZWRpYVF1ZXJ5UnVsZUFTVCBleHRlbmRzIENzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1Qge1xuICBjb25zdHJ1Y3RvcihxdWVyeTogQ3NzVG9rZW5bXSwgYmxvY2s6IENzc0Jsb2NrQVNUKSB7IHN1cGVyKEJsb2NrVHlwZS5NZWRpYVF1ZXJ5LCBxdWVyeSwgYmxvY2spOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc01lZGlhUXVlcnlSdWxlKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NJbmxpbmVSdWxlQVNUIGV4dGVuZHMgQ3NzUnVsZUFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0eXBlOiBCbG9ja1R5cGUsIHB1YmxpYyB2YWx1ZTogQ3NzU3R5bGVWYWx1ZUFTVCkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdElubGluZUNzc1J1bGUodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1NlbGVjdG9yUnVsZUFTVCBleHRlbmRzIENzc0Jsb2NrUnVsZUFTVCB7XG4gIHB1YmxpYyBzdHJWYWx1ZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWxlY3RvcnM6IENzc1NlbGVjdG9yQVNUW10sIGJsb2NrOiBDc3NCbG9ja0FTVCkge1xuICAgIHN1cGVyKEJsb2NrVHlwZS5TZWxlY3RvciwgYmxvY2spO1xuICAgIHRoaXMuc3RyVmFsdWUgPSBzZWxlY3RvcnMubWFwKHNlbGVjdG9yID0+IHNlbGVjdG9yLnN0clZhbHVlKS5qb2luKFwiLFwiKTtcbiAgfVxuXG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc1NlbGVjdG9yUnVsZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzRGVmaW5pdGlvbkFTVCBleHRlbmRzIENzc0FTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm9wZXJ0eTogQ3NzVG9rZW4sIHB1YmxpYyB2YWx1ZTogQ3NzU3R5bGVWYWx1ZUFTVCkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0RlZmluaXRpb24odGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1NlbGVjdG9yQVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgcHVibGljIHN0clZhbHVlO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW5zOiBDc3NUb2tlbltdLCBwdWJsaWMgaXNDb21wbGV4OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RyVmFsdWUgPSB0b2tlbnMubWFwKHRva2VuID0+IHRva2VuLnN0clZhbHVlKS5qb2luKFwiXCIpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc1NlbGVjdG9yKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NCbG9ja0FTVCBleHRlbmRzIENzc0FTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbnRyaWVzOiBDc3NBU1RbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0Jsb2NrKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NTdHlsZVNoZWV0QVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJ1bGVzOiBDc3NBU1RbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc1N0eWxlU2hlZXQodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1BhcnNlRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgY29uc3RydWN0b3IoZmlsZTogUGFyc2VTb3VyY2VGaWxlLCBvZmZzZXQ6IG51bWJlciwgbGluZTogbnVtYmVyLCBjb2w6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIsXG4gICAgICAgICAgICAgIGVyck1zZzogc3RyaW5nKSB7XG4gICAgdmFyIHN0YXJ0ID0gbmV3IFBhcnNlTG9jYXRpb24oZmlsZSwgb2Zmc2V0LCBsaW5lLCBjb2wpO1xuICAgIHZhciBlbmQgPSBuZXcgUGFyc2VMb2NhdGlvbihmaWxlLCBvZmZzZXQsIGxpbmUsIGNvbCArIGxlbmd0aCk7XG4gICAgdmFyIHNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKHN0YXJ0LCBlbmQpO1xuICAgIHN1cGVyKHNwYW4sIFwiQ1NTIFBhcnNlIEVycm9yOiBcIiArIGVyck1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1Vua25vd25Ub2tlbkxpc3RBU1QgZXh0ZW5kcyBDc3NBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW5zOiBDc3NUb2tlbltdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0VW5rb3duUnVsZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuIl19