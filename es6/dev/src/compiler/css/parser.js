import { ParseSourceSpan, ParseSourceFile, ParseLocation, ParseError } from "angular2/src/compiler/parse_util";
import { bitWiseOr, bitWiseAnd, isPresent } from "angular2/src/facade/lang";
import { CssLexerMode, CssToken, CssTokenType, generateErrorMessage, $AT, $EOF, $RBRACE, $LBRACE, $LBRACKET, $RBRACKET, $LPAREN, $RPAREN, $COMMA, $COLON, $SEMICOLON, isNewline } from "angular2/src/compiler/css/lexer";
export { CssToken } from "angular2/src/compiler/css/lexer";
export var BlockType;
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
})(BlockType || (BlockType = {}));
const EOF_DELIM = 1;
const RBRACE_DELIM = 2;
const LBRACE_DELIM = 4;
const COMMA_DELIM = 8;
const COLON_DELIM = 16;
const SEMICOLON_DELIM = 32;
const NEWLINE_DELIM = 64;
const RPAREN_DELIM = 128;
function mergeTokens(tokens, separator = "") {
    var mainToken = tokens[0];
    var str = mainToken.strValue;
    for (var i = 1; i < tokens.length; i++) {
        str += separator + tokens[i].strValue;
    }
    return new CssToken(mainToken.index, mainToken.column, mainToken.line, mainToken.type, str);
}
function getDelimFromToken(token) {
    return getDelimFromCharacter(token.numValue);
}
function getDelimFromCharacter(code) {
    switch (code) {
        case $EOF:
            return EOF_DELIM;
        case $COMMA:
            return COMMA_DELIM;
        case $COLON:
            return COLON_DELIM;
        case $SEMICOLON:
            return SEMICOLON_DELIM;
        case $RBRACE:
            return RBRACE_DELIM;
        case $LBRACE:
            return LBRACE_DELIM;
        case $RPAREN:
            return RPAREN_DELIM;
        default:
            return isNewline(code) ? NEWLINE_DELIM : 0;
    }
}
function characterContainsDelimiter(code, delimiters) {
    return bitWiseAnd([getDelimFromCharacter(code), delimiters]) > 0;
}
export class CssAST {
    visit(visitor, context) { }
}
export class ParsedCssResult {
    constructor(errors, ast) {
        this.errors = errors;
        this.ast = ast;
    }
}
export class CssParser {
    constructor(_scanner, _fileName) {
        this._scanner = _scanner;
        this._fileName = _fileName;
        this._errors = [];
        this._file = new ParseSourceFile(this._scanner.input, _fileName);
    }
    /** @internal */
    _resolveBlockType(token) {
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
    }
    parse() {
        var delimiters = EOF_DELIM;
        var ast = this._parseStyleSheet(delimiters);
        var errors = this._errors;
        this._errors = [];
        return new ParsedCssResult(errors, ast);
    }
    /** @internal */
    _parseStyleSheet(delimiters) {
        var results = [];
        this._scanner.consumeEmptyStatements();
        while (this._scanner.peek != $EOF) {
            this._scanner.setMode(CssLexerMode.BLOCK);
            results.push(this._parseRule(delimiters));
        }
        return new CssStyleSheetAST(results);
    }
    /** @internal */
    _parseRule(delimiters) {
        if (this._scanner.peek == $AT) {
            return this._parseAtRule(delimiters);
        }
        return this._parseSelectorRule(delimiters);
    }
    /** @internal */
    _parseAtRule(delimiters) {
        this._scanner.setMode(CssLexerMode.BLOCK);
        var token = this._scan();
        this._assertCondition(token.type == CssTokenType.AtKeyword, `The CSS Rule ${token.strValue} is not a valid [@] rule.`, token);
        var block, type = this._resolveBlockType(token);
        switch (type) {
            case BlockType.Charset:
            case BlockType.Namespace:
            case BlockType.Import:
                var value = this._parseValue(delimiters);
                this._scanner.setMode(CssLexerMode.BLOCK);
                this._scanner.consumeEmptyStatements();
                return new CssInlineRuleAST(type, value);
            case BlockType.Viewport:
            case BlockType.FontFace:
                block = this._parseStyleBlock(delimiters);
                return new CssBlockRuleAST(type, block);
            case BlockType.Keyframes:
                var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                // keyframes only have one identifier name
                var name = tokens[0];
                return new CssKeyframeRuleAST(name, this._parseKeyframeBlock(delimiters));
            case BlockType.MediaQuery:
                this._scanner.setMode(CssLexerMode.MEDIA_QUERY);
                var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                return new CssMediaQueryRuleAST(tokens, this._parseBlock(delimiters));
            case BlockType.Document:
            case BlockType.Supports:
            case BlockType.Page:
                this._scanner.setMode(CssLexerMode.AT_RULE_QUERY);
                var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                return new CssBlockDefinitionRuleAST(type, tokens, this._parseBlock(delimiters));
            // if a custom @rule { ... } is used it should still tokenize the insides
            default:
                var listOfTokens = [];
                this._scanner.setMode(CssLexerMode.ALL);
                this._error(generateErrorMessage(this._scanner.input, `The CSS "at" rule "${token.strValue}" is not allowed to used here`, token.strValue, token.index, token.line, token.column), token);
                this._collectUntilDelim(bitWiseOr([delimiters, LBRACE_DELIM, SEMICOLON_DELIM]))
                    .forEach((token) => { listOfTokens.push(token); });
                if (this._scanner.peek == $LBRACE) {
                    this._consume(CssTokenType.Character, '{');
                    this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]))
                        .forEach((token) => { listOfTokens.push(token); });
                    this._consume(CssTokenType.Character, '}');
                }
                return new CssUnknownTokenListAST(token, listOfTokens);
        }
    }
    /** @internal */
    _parseSelectorRule(delimiters) {
        var selectors = this._parseSelectors(delimiters);
        var block = this._parseStyleBlock(delimiters);
        this._scanner.setMode(CssLexerMode.BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssSelectorRuleAST(selectors, block);
    }
    /** @internal */
    _parseSelectors(delimiters) {
        delimiters = bitWiseOr([delimiters, LBRACE_DELIM]);
        var selectors = [];
        var isParsingSelectors = true;
        while (isParsingSelectors) {
            selectors.push(this._parseSelector(delimiters));
            isParsingSelectors = !characterContainsDelimiter(this._scanner.peek, delimiters);
            if (isParsingSelectors) {
                this._consume(CssTokenType.Character, ',');
                isParsingSelectors = !characterContainsDelimiter(this._scanner.peek, delimiters);
            }
        }
        return selectors;
    }
    /** @internal */
    _scan() {
        var output = this._scanner.scan();
        var token = output.token;
        var error = output.error;
        if (isPresent(error)) {
            this._error(error.rawMessage, token);
        }
        return token;
    }
    /** @internal */
    _consume(type, value = null) {
        var output = this._scanner.consume(type, value);
        var token = output.token;
        var error = output.error;
        if (isPresent(error)) {
            this._error(error.rawMessage, token);
        }
        return token;
    }
    /** @internal */
    _parseKeyframeBlock(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);
        this._consume(CssTokenType.Character, '{');
        var definitions = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            definitions.push(this._parseKeyframeDefinition(delimiters));
        }
        this._consume(CssTokenType.Character, '}');
        return new CssBlockAST(definitions);
    }
    /** @internal */
    _parseKeyframeDefinition(delimiters) {
        var stepTokens = [];
        delimiters = bitWiseOr([delimiters, LBRACE_DELIM]);
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            stepTokens.push(this._parseKeyframeLabel(bitWiseOr([delimiters, COMMA_DELIM])));
            if (this._scanner.peek != $LBRACE) {
                this._consume(CssTokenType.Character, ',');
            }
        }
        var styles = this._parseStyleBlock(bitWiseOr([delimiters, RBRACE_DELIM]));
        this._scanner.setMode(CssLexerMode.BLOCK);
        return new CssKeyframeDefinitionAST(stepTokens, styles);
    }
    /** @internal */
    _parseKeyframeLabel(delimiters) {
        this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);
        return mergeTokens(this._collectUntilDelim(delimiters));
    }
    /** @internal */
    _parseSelector(delimiters) {
        delimiters = bitWiseOr([delimiters, COMMA_DELIM, LBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.SELECTOR);
        var selectorCssTokens = [];
        var isComplex = false;
        var wsCssToken;
        var previousToken;
        var parenCount = 0;
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var code = this._scanner.peek;
            switch (code) {
                case $LPAREN:
                    parenCount++;
                    break;
                case $RPAREN:
                    parenCount--;
                    break;
                case $COLON:
                    this._scanner.setMode(CssLexerMode.PSEUDO_SELECTOR);
                    previousToken = this._consume(CssTokenType.Character, ':');
                    selectorCssTokens.push(previousToken);
                    continue;
                case $LBRACKET:
                    // if we are already inside an attribute selector then we can't
                    // jump into the mode again. Therefore this error will get picked
                    // up when the scan method is called below.
                    if (this._scanner.getMode() != CssLexerMode.ATTRIBUTE_SELECTOR) {
                        selectorCssTokens.push(this._consume(CssTokenType.Character, '['));
                        this._scanner.setMode(CssLexerMode.ATTRIBUTE_SELECTOR);
                        continue;
                    }
                    break;
                case $RBRACKET:
                    selectorCssTokens.push(this._consume(CssTokenType.Character, ']'));
                    this._scanner.setMode(CssLexerMode.SELECTOR);
                    continue;
            }
            var token = this._scan();
            // special case for the ":not(" selector since it
            // contains an inner selector that needs to be parsed
            // in isolation
            if (this._scanner.getMode() == CssLexerMode.PSEUDO_SELECTOR && isPresent(previousToken) &&
                previousToken.numValue == $COLON && token.strValue == "not" &&
                this._scanner.peek == $LPAREN) {
                selectorCssTokens.push(token);
                selectorCssTokens.push(this._consume(CssTokenType.Character, '('));
                // the inner selector inside of :not(...) can only be one
                // CSS selector (no commas allowed) therefore we parse only
                // one selector by calling the method below
                this._parseSelector(bitWiseOr([delimiters, RPAREN_DELIM]))
                    .tokens.forEach((innerSelectorToken) => { selectorCssTokens.push(innerSelectorToken); });
                selectorCssTokens.push(this._consume(CssTokenType.Character, ')'));
                continue;
            }
            previousToken = token;
            if (token.type == CssTokenType.Whitespace) {
                wsCssToken = token;
            }
            else {
                if (isPresent(wsCssToken)) {
                    selectorCssTokens.push(wsCssToken);
                    wsCssToken = null;
                    isComplex = true;
                }
                selectorCssTokens.push(token);
            }
        }
        if (this._scanner.getMode() == CssLexerMode.ATTRIBUTE_SELECTOR) {
            this._error(`Unbalanced CSS attribute selector at column ${previousToken.line}:${previousToken.column}`, previousToken);
        }
        else if (parenCount > 0) {
            this._error(`Unbalanced pseudo selector function value at column ${previousToken.line}:${previousToken.column}`, previousToken);
        }
        return new CssSelectorAST(selectorCssTokens, isComplex);
    }
    /** @internal */
    _parseValue(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM, SEMICOLON_DELIM, NEWLINE_DELIM]);
        this._scanner.setMode(CssLexerMode.STYLE_VALUE);
        var strValue = "";
        var tokens = [];
        var previous;
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var token;
            if (isPresent(previous) && previous.type == CssTokenType.Identifier &&
                this._scanner.peek == $LPAREN) {
                token = this._consume(CssTokenType.Character, '(');
                tokens.push(token);
                strValue += token.strValue;
                this._scanner.setMode(CssLexerMode.STYLE_VALUE_FUNCTION);
                token = this._scan();
                tokens.push(token);
                strValue += token.strValue;
                this._scanner.setMode(CssLexerMode.STYLE_VALUE);
                token = this._consume(CssTokenType.Character, ')');
                tokens.push(token);
                strValue += token.strValue;
            }
            else {
                token = this._scan();
                if (token.type != CssTokenType.Whitespace) {
                    tokens.push(token);
                }
                strValue += token.strValue;
            }
            previous = token;
        }
        this._scanner.consumeWhitespace();
        var code = this._scanner.peek;
        if (code == $SEMICOLON) {
            this._consume(CssTokenType.Character, ';');
        }
        else if (code != $RBRACE) {
            this._error(generateErrorMessage(this._scanner.input, `The CSS key/value definition did not end with a semicolon`, previous.strValue, previous.index, previous.line, previous.column), previous);
        }
        return new CssStyleValueAST(tokens, strValue);
    }
    /** @internal */
    _collectUntilDelim(delimiters, assertType = null) {
        var tokens = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var val = isPresent(assertType) ? this._consume(assertType) : this._scan();
            tokens.push(val);
        }
        return tokens;
    }
    /** @internal */
    _parseBlock(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.BLOCK);
        this._consume(CssTokenType.Character, '{');
        this._scanner.consumeEmptyStatements();
        var results = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            results.push(this._parseRule(delimiters));
        }
        this._consume(CssTokenType.Character, '}');
        this._scanner.setMode(CssLexerMode.BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssBlockAST(results);
    }
    /** @internal */
    _parseStyleBlock(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
        this._consume(CssTokenType.Character, '{');
        this._scanner.consumeEmptyStatements();
        var definitions = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            definitions.push(this._parseDefinition(delimiters));
            this._scanner.consumeEmptyStatements();
        }
        this._consume(CssTokenType.Character, '}');
        this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssBlockAST(definitions);
    }
    /** @internal */
    _parseDefinition(delimiters) {
        this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
        var prop = this._consume(CssTokenType.Identifier);
        var parseValue, value = null;
        // the colon value separates the prop from the style.
        // there are a few cases as to what could happen if it
        // is missing
        switch (this._scanner.peek) {
            case $COLON:
                this._consume(CssTokenType.Character, ':');
                parseValue = true;
                break;
            case $SEMICOLON:
            case $RBRACE:
            case $EOF:
                parseValue = false;
                break;
            default:
                var propStr = [prop.strValue];
                if (this._scanner.peek != $COLON) {
                    // this will throw the error
                    var nextValue = this._consume(CssTokenType.Character, ':');
                    propStr.push(nextValue.strValue);
                    var remainingTokens = this._collectUntilDelim(bitWiseOr([delimiters, COLON_DELIM, SEMICOLON_DELIM]), CssTokenType.Identifier);
                    if (remainingTokens.length > 0) {
                        remainingTokens.forEach((token) => { propStr.push(token.strValue); });
                    }
                    prop = new CssToken(prop.index, prop.column, prop.line, prop.type, propStr.join(" "));
                }
                // this means we've reached the end of the definition and/or block
                if (this._scanner.peek == $COLON) {
                    this._consume(CssTokenType.Character, ':');
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
            this._error(generateErrorMessage(this._scanner.input, `The CSS property was not paired with a style value`, prop.strValue, prop.index, prop.line, prop.column), prop);
        }
        return new CssDefinitionAST(prop, value);
    }
    /** @internal */
    _assertCondition(status, errorMessage, problemToken) {
        if (!status) {
            this._error(errorMessage, problemToken);
            return true;
        }
        return false;
    }
    /** @internal */
    _error(message, problemToken) {
        var length = problemToken.strValue.length;
        var error = CssParseError.create(this._file, 0, problemToken.line, problemToken.column, length, message);
        this._errors.push(error);
    }
}
export class CssStyleValueAST extends CssAST {
    constructor(tokens, strValue) {
        super();
        this.tokens = tokens;
        this.strValue = strValue;
    }
    visit(visitor, context) { visitor.visitCssValue(this); }
}
export class CssRuleAST extends CssAST {
}
export class CssBlockRuleAST extends CssRuleAST {
    constructor(type, block, name = null) {
        super();
        this.type = type;
        this.block = block;
        this.name = name;
    }
    visit(visitor, context) { visitor.visitCssBlock(this.block, context); }
}
export class CssKeyframeRuleAST extends CssBlockRuleAST {
    constructor(name, block) {
        super(BlockType.Keyframes, block, name);
    }
    visit(visitor, context) { visitor.visitCssKeyframeRule(this, context); }
}
export class CssKeyframeDefinitionAST extends CssBlockRuleAST {
    constructor(_steps, block) {
        super(BlockType.Keyframes, block, mergeTokens(_steps, ","));
        this.steps = _steps;
    }
    visit(visitor, context) {
        visitor.visitCssKeyframeDefinition(this, context);
    }
}
export class CssBlockDefinitionRuleAST extends CssBlockRuleAST {
    constructor(type, query, block) {
        super(type, block);
        this.query = query;
        this.strValue = query.map(token => token.strValue).join("");
        var firstCssToken = query[0];
        this.name = new CssToken(firstCssToken.index, firstCssToken.column, firstCssToken.line, CssTokenType.Identifier, this.strValue);
    }
    visit(visitor, context) { visitor.visitCssBlock(this.block, context); }
}
export class CssMediaQueryRuleAST extends CssBlockDefinitionRuleAST {
    constructor(query, block) {
        super(BlockType.MediaQuery, query, block);
    }
    visit(visitor, context) { visitor.visitCssMediaQueryRule(this, context); }
}
export class CssInlineRuleAST extends CssRuleAST {
    constructor(type, value) {
        super();
        this.type = type;
        this.value = value;
    }
    visit(visitor, context) { visitor.visitInlineCssRule(this, context); }
}
export class CssSelectorRuleAST extends CssBlockRuleAST {
    constructor(selectors, block) {
        super(BlockType.Selector, block);
        this.selectors = selectors;
        this.strValue = selectors.map(selector => selector.strValue).join(",");
    }
    visit(visitor, context) { visitor.visitCssSelectorRule(this, context); }
}
export class CssDefinitionAST extends CssAST {
    constructor(property, value) {
        super();
        this.property = property;
        this.value = value;
    }
    visit(visitor, context) { visitor.visitCssDefinition(this, context); }
}
export class CssSelectorAST extends CssAST {
    constructor(tokens, isComplex = false) {
        super();
        this.tokens = tokens;
        this.isComplex = isComplex;
        this.strValue = tokens.map(token => token.strValue).join("");
    }
    visit(visitor, context) { visitor.visitCssSelector(this, context); }
}
export class CssBlockAST extends CssAST {
    constructor(entries) {
        super();
        this.entries = entries;
    }
    visit(visitor, context) { visitor.visitCssBlock(this, context); }
}
export class CssStyleSheetAST extends CssAST {
    constructor(rules) {
        super();
        this.rules = rules;
    }
    visit(visitor, context) { visitor.visitCssStyleSheet(this, context); }
}
export class CssParseError extends ParseError {
    constructor(span, message) {
        super(span, message);
    }
    static create(file, offset, line, col, length, errMsg) {
        var start = new ParseLocation(file, offset, line, col);
        var end = new ParseLocation(file, offset, line, col + length);
        var span = new ParseSourceSpan(start, end);
        return new CssParseError(span, "CSS Parse Error: " + errMsg);
    }
}
export class CssUnknownTokenListAST extends CssRuleAST {
    constructor(name, tokens) {
        super();
        this.name = name;
        this.tokens = tokens;
    }
    visit(visitor, context) { visitor.visitUnkownRule(this, context); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1MazluUkpPcy50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2Nzcy9wYXJzZXIudHMiXSwibmFtZXMiOlsiQmxvY2tUeXBlIiwibWVyZ2VUb2tlbnMiLCJnZXREZWxpbUZyb21Ub2tlbiIsImdldERlbGltRnJvbUNoYXJhY3RlciIsImNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyIiwiQ3NzQVNUIiwiQ3NzQVNULnZpc2l0IiwiUGFyc2VkQ3NzUmVzdWx0IiwiUGFyc2VkQ3NzUmVzdWx0LmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VyIiwiQ3NzUGFyc2VyLmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VyLl9yZXNvbHZlQmxvY2tUeXBlIiwiQ3NzUGFyc2VyLnBhcnNlIiwiQ3NzUGFyc2VyLl9wYXJzZVN0eWxlU2hlZXQiLCJDc3NQYXJzZXIuX3BhcnNlUnVsZSIsIkNzc1BhcnNlci5fcGFyc2VBdFJ1bGUiLCJDc3NQYXJzZXIuX3BhcnNlU2VsZWN0b3JSdWxlIiwiQ3NzUGFyc2VyLl9wYXJzZVNlbGVjdG9ycyIsIkNzc1BhcnNlci5fc2NhbiIsIkNzc1BhcnNlci5fY29uc3VtZSIsIkNzc1BhcnNlci5fcGFyc2VLZXlmcmFtZUJsb2NrIiwiQ3NzUGFyc2VyLl9wYXJzZUtleWZyYW1lRGVmaW5pdGlvbiIsIkNzc1BhcnNlci5fcGFyc2VLZXlmcmFtZUxhYmVsIiwiQ3NzUGFyc2VyLl9wYXJzZVNlbGVjdG9yIiwiQ3NzUGFyc2VyLl9wYXJzZVZhbHVlIiwiQ3NzUGFyc2VyLl9jb2xsZWN0VW50aWxEZWxpbSIsIkNzc1BhcnNlci5fcGFyc2VCbG9jayIsIkNzc1BhcnNlci5fcGFyc2VTdHlsZUJsb2NrIiwiQ3NzUGFyc2VyLl9wYXJzZURlZmluaXRpb24iLCJDc3NQYXJzZXIuX2Fzc2VydENvbmRpdGlvbiIsIkNzc1BhcnNlci5fZXJyb3IiLCJDc3NTdHlsZVZhbHVlQVNUIiwiQ3NzU3R5bGVWYWx1ZUFTVC5jb25zdHJ1Y3RvciIsIkNzc1N0eWxlVmFsdWVBU1QudmlzaXQiLCJDc3NSdWxlQVNUIiwiQ3NzQmxvY2tSdWxlQVNUIiwiQ3NzQmxvY2tSdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzQmxvY2tSdWxlQVNULnZpc2l0IiwiQ3NzS2V5ZnJhbWVSdWxlQVNUIiwiQ3NzS2V5ZnJhbWVSdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzS2V5ZnJhbWVSdWxlQVNULnZpc2l0IiwiQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNUIiwiQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNULmNvbnN0cnVjdG9yIiwiQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNULnZpc2l0IiwiQ3NzQmxvY2tEZWZpbml0aW9uUnVsZUFTVCIsIkNzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1QuY29uc3RydWN0b3IiLCJDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNULnZpc2l0IiwiQ3NzTWVkaWFRdWVyeVJ1bGVBU1QiLCJDc3NNZWRpYVF1ZXJ5UnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc01lZGlhUXVlcnlSdWxlQVNULnZpc2l0IiwiQ3NzSW5saW5lUnVsZUFTVCIsIkNzc0lubGluZVJ1bGVBU1QuY29uc3RydWN0b3IiLCJDc3NJbmxpbmVSdWxlQVNULnZpc2l0IiwiQ3NzU2VsZWN0b3JSdWxlQVNUIiwiQ3NzU2VsZWN0b3JSdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzU2VsZWN0b3JSdWxlQVNULnZpc2l0IiwiQ3NzRGVmaW5pdGlvbkFTVCIsIkNzc0RlZmluaXRpb25BU1QuY29uc3RydWN0b3IiLCJDc3NEZWZpbml0aW9uQVNULnZpc2l0IiwiQ3NzU2VsZWN0b3JBU1QiLCJDc3NTZWxlY3RvckFTVC5jb25zdHJ1Y3RvciIsIkNzc1NlbGVjdG9yQVNULnZpc2l0IiwiQ3NzQmxvY2tBU1QiLCJDc3NCbG9ja0FTVC5jb25zdHJ1Y3RvciIsIkNzc0Jsb2NrQVNULnZpc2l0IiwiQ3NzU3R5bGVTaGVldEFTVCIsIkNzc1N0eWxlU2hlZXRBU1QuY29uc3RydWN0b3IiLCJDc3NTdHlsZVNoZWV0QVNULnZpc2l0IiwiQ3NzUGFyc2VFcnJvciIsIkNzc1BhcnNlRXJyb3IuY29uc3RydWN0b3IiLCJDc3NQYXJzZUVycm9yLmNyZWF0ZSIsIkNzc1Vua25vd25Ub2tlbkxpc3RBU1QiLCJDc3NVbmtub3duVG9rZW5MaXN0QVNULmNvbnN0cnVjdG9yIiwiQ3NzVW5rbm93blRva2VuTGlzdEFTVC52aXNpdCJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFDTCxlQUFlLEVBQ2YsZUFBZSxFQUNmLGFBQWEsRUFDYixVQUFVLEVBQ1gsTUFBTSxrQ0FBa0M7T0FFbEMsRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUdWLFNBQVMsRUFDVixNQUFNLDBCQUEwQjtPQUUxQixFQUNMLFlBQVksRUFDWixRQUFRLEVBQ1IsWUFBWSxFQUdaLG9CQUFvQixFQUNwQixHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxPQUFPLEVBQ1AsU0FBUyxFQUNULFNBQVMsRUFDVCxPQUFPLEVBQ1AsT0FBTyxFQUNQLE1BQU0sRUFDTixNQUFNLEVBQ04sVUFBVSxFQUNWLFNBQVMsRUFDVixNQUFNLGlDQUFpQztBQUV4QyxTQUFRLFFBQVEsUUFBTyxpQ0FBaUMsQ0FBQztBQUV6RCxXQUFZLFNBYVg7QUFiRCxXQUFZLFNBQVM7SUFDbkJBLDZDQUFNQSxDQUFBQTtJQUNOQSwrQ0FBT0EsQ0FBQUE7SUFDUEEsbURBQVNBLENBQUFBO0lBQ1RBLGlEQUFRQSxDQUFBQTtJQUNSQSxtREFBU0EsQ0FBQUE7SUFDVEEscURBQVVBLENBQUFBO0lBQ1ZBLGlEQUFRQSxDQUFBQTtJQUNSQSxpREFBUUEsQ0FBQUE7SUFDUkEseUNBQUlBLENBQUFBO0lBQ0pBLGlEQUFRQSxDQUFBQTtJQUNSQSxrREFBUUEsQ0FBQUE7SUFDUkEsd0RBQVdBLENBQUFBO0FBQ2JBLENBQUNBLEVBYlcsU0FBUyxLQUFULFNBQVMsUUFhcEI7QUFFRCxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFD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QUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQ2xDQSxJQUFJQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUN6QkEsSUFBSUEsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDekJBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JCQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxVQUFVQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFFRFQsZ0JBQWdCQTtJQUNoQkEsUUFBUUEsQ0FBQ0EsSUFBa0JBLEVBQUVBLEtBQUtBLEdBQVdBLElBQUlBO1FBQy9DVSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNoREEsSUFBSUEsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDekJBLElBQUlBLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ3pCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsVUFBVUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2ZBLENBQUNBO0lBRURWLGdCQUFnQkE7SUFDaEJBLG1CQUFtQkEsQ0FBQ0EsVUFBa0JBO1FBQ3BDVyxVQUFVQSxHQUFHQSxTQUFTQSxDQUFDQSxDQUFDQSxVQUFVQSxFQUFFQSxZQUFZQSxDQUFD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bkVBLElBQUlBLEtBQUtBLENBQUNBO1lBQ1ZBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLElBQUlBLElBQUlBLFlBQVlBLENBQUNBLFVBQVVBO2dCQUMvREEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsSUFBSUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxDQUFDQSxTQUFTQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDbkRBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNuQkEsUUFBUUEsSUFBSUEsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7Z0JBRTNCQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxZQUFZQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO2dCQUV6REEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7Z0JBQ3JCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkJBLFFBQVFBLElBQUlBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBO2dCQUUzQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7Z0JBRWhEQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxDQUFDQSxTQUFTQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDbkRBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNuQkEsUUFBUUEsSUFBSUEsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDN0JBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxLQUFLQSxHQUFHQSxJQUFJ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Q0EsQ0FBQ0E7SUFSN0VELE9BQU9BLE1BQU1BLENBQUNBLElBQXFCQSxFQUFFQSxNQUFjQSxFQUFFQSxJQUFZQSxFQUFFQSxHQUFXQSxFQUFFQSxNQUFjQSxFQUNoRkEsTUFBY0E7UUFDMUJFLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLGFBQWFBLENBQUNBLElBQUlBLEVBQUVBLE1BQU1BLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3ZEQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxhQUFhQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxHQUFHQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUM5REEsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsZUFBZUEsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLE1BQU1BLENBQUNBLElBQUlBLGFBQWFBLENBQUNBLElBQUlBLEVBQUVBLG1CQUFtQkEsR0FBR0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDL0RBLENBQUNBO0FBR0hGLENBQUNBO0FBRUQsNENBQTRDLFVBQVU7SUFDcERHLFlBQW1CQSxJQUFJQSxFQUFTQSxNQUFrQkE7UUFBSUMsT0FBT0EsQ0FBQ0E7UUFBM0NBLFNBQUlBLEdBQUpBLElBQUlBLENBQUFBO1FBQVNBLFdBQU1BLEdBQU5BLE1BQU1BLENBQVlBO0lBQWFBLENBQUNBO0lBQ2hFRCxLQUFLQSxDQUFDQSxPQUFzQkEsRUFBRUEsT0FBYUEsSUFBSUUsT0FBT0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDMUZGLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBQYXJzZVNvdXJjZVNwYW4sXG4gIFBhcnNlU291cmNlRmlsZSxcbiAgUGFyc2VMb2NhdGlvbixcbiAgUGFyc2VFcnJvclxufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3BhcnNlX3V0aWxcIjtcblxuaW1wb3J0IHtcbiAgYml0V2lzZU9yLFxuICBiaXRXaXNlQW5kLFxuICBOdW1iZXJXcmFwcGVyLFxuICBTdHJpbmdXcmFwcGVyLFxuICBpc1ByZXNlbnRcbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuXG5pbXBvcnQge1xuICBDc3NMZXhlck1vZGUsXG4gIENzc1Rva2VuLFxuICBDc3NUb2tlblR5cGUsXG4gIENzc1NjYW5uZXIsXG4gIENzc1NjYW5uZXJFcnJvcixcbiAgZ2VuZXJhdGVFcnJvck1lc3NhZ2UsXG4gICRBVCxcbiAgJEVPRixcbiAgJFJCUkFDRSxcbiAgJExCUkFDRSxcbiAgJExCUkFDS0VULFxuICAkUkJSQUNLRVQsXG4gICRMUEFSRU4sXG4gICRSUEFSRU4sXG4gICRDT01NQSxcbiAgJENPTE9OLFxuICAkU0VNSUNPTE9OLFxuICBpc05ld2xpbmVcbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb21waWxlci9jc3MvbGV4ZXJcIjtcblxuZXhwb3J0IHtDc3NUb2tlbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb21waWxlci9jc3MvbGV4ZXJcIjtcblxuZXhwb3J0IGVudW0gQmxvY2tUeXBlIHtcbiAgSW1wb3J0LFxuICBDaGFyc2V0LFxuICBOYW1lc3BhY2UsXG4gIFN1cHBvcnRzLFxuICBLZXlmcmFtZXMsXG4gIE1lZGlhUXVlcnksXG4gIFNlbGVjdG9yLFxuICBGb250RmFjZSxcbiAgUGFnZSxcbiAgRG9jdW1lbnQsXG4gIFZpZXdwb3J0LFxuICBVbnN1cHBvcnRlZFxufVxuXG5jb25zdCBFT0ZfREVMSU0gPSAxO1xuY29uc3QgUkJSQUNFX0RFTElNID0gMjtcbmNvbnN0IExCUkFDRV9ERUxJTSA9IDQ7XG5jb25zdCBDT01NQV9ERUxJTSA9IDg7XG5jb25zdCBDT0xPTl9ERUxJTSA9IDE2O1xuY29uc3QgU0VNSUNPTE9OX0RFTElNID0gMzI7XG5jb25zdCBORVdMSU5FX0RFTElNID0gNjQ7XG5jb25zdCBSUEFSRU5fREVMSU0gPSAxMjg7XG5cbmZ1bmN0aW9uIG1lcmdlVG9rZW5zKHRva2VuczogQ3NzVG9rZW5bXSwgc2VwYXJhdG9yOiBzdHJpbmcgPSBcIlwiKTogQ3NzVG9rZW4ge1xuICB2YXIgbWFpblRva2VuID0gdG9rZW5zWzBdO1xuICB2YXIgc3RyID0gbWFpblRva2VuLnN0clZhbHVlO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIHN0ciArPSBzZXBhcmF0b3IgKyB0b2tlbnNbaV0uc3RyVmFsdWU7XG4gIH1cblxuICByZXR1cm4gbmV3IENzc1Rva2VuKG1haW5Ub2tlbi5pbmRleCwgbWFpblRva2VuLmNvbHVtbiwgbWFpblRva2VuLmxpbmUsIG1haW5Ub2tlbi50eXBlLCBzdHIpO1xufVxuXG5mdW5jdGlvbiBnZXREZWxpbUZyb21Ub2tlbih0b2tlbjogQ3NzVG9rZW4pOiBudW1iZXIge1xuICByZXR1cm4gZ2V0RGVsaW1Gcm9tQ2hhcmFjdGVyKHRva2VuLm51bVZhbHVlKTtcbn1cblxuZnVuY3Rpb24gZ2V0RGVsaW1Gcm9tQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IG51bWJlciB7XG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJEVPRjpcbiAgICAgIHJldHVybiBFT0ZfREVMSU07XG4gICAgY2FzZSAkQ09NTUE6XG4gICAgICByZXR1cm4gQ09NTUFfREVMSU07XG4gICAgY2FzZSAkQ09MT046XG4gICAgICByZXR1cm4gQ09MT05fREVMSU07XG4gICAgY2FzZSAkU0VNSUNPTE9OOlxuICAgICAgcmV0dXJuIFNFTUlDT0xPTl9ERUxJTTtcbiAgICBjYXNlICRSQlJBQ0U6XG4gICAgICByZXR1cm4gUkJSQUNFX0RFTElNO1xuICAgIGNhc2UgJExCUkFDRTpcbiAgICAgIHJldHVybiBMQlJBQ0VfREVMSU07XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgICAgcmV0dXJuIFJQQVJFTl9ERUxJTTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGlzTmV3bGluZShjb2RlKSA/IE5FV0xJTkVfREVMSU0gOiAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKGNvZGU6IG51bWJlciwgZGVsaW1pdGVyczogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBiaXRXaXNlQW5kKFtnZXREZWxpbUZyb21DaGFyYWN0ZXIoY29kZSksIGRlbGltaXRlcnNdKSA+IDA7XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NBU1Qge1xuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KTogdm9pZCB7fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENzc0FTVFZpc2l0b3Ige1xuICB2aXNpdENzc1ZhbHVlKGFzdDogQ3NzU3R5bGVWYWx1ZUFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0SW5saW5lQ3NzUnVsZShhc3Q6IENzc0lubGluZVJ1bGVBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc0tleWZyYW1lUnVsZShhc3Q6IENzc0tleWZyYW1lUnVsZUFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzS2V5ZnJhbWVEZWZpbml0aW9uKGFzdDogQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NNZWRpYVF1ZXJ5UnVsZShhc3Q6IENzc01lZGlhUXVlcnlSdWxlQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NTZWxlY3RvclJ1bGUoYXN0OiBDc3NTZWxlY3RvclJ1bGVBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc1NlbGVjdG9yKGFzdDogQ3NzU2VsZWN0b3JBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc0RlZmluaXRpb24oYXN0OiBDc3NEZWZpbml0aW9uQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NCbG9jayhhc3Q6IENzc0Jsb2NrQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NTdHlsZVNoZWV0KGFzdDogQ3NzU3R5bGVTaGVldEFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0VW5rb3duUnVsZShhc3Q6IENzc1Vua25vd25Ub2tlbkxpc3RBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VkQ3NzUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIGVycm9yczogQ3NzUGFyc2VFcnJvcltdLCBwdWJsaWMgYXN0OiBDc3NTdHlsZVNoZWV0QVNUKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzUGFyc2VyIHtcbiAgcHJpdmF0ZSBfZXJyb3JzOiBDc3NQYXJzZUVycm9yW10gPSBbXTtcbiAgcHJpdmF0ZSBfZmlsZTogUGFyc2VTb3VyY2VGaWxlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3NjYW5uZXI6IENzc1NjYW5uZXIsIHByaXZhdGUgX2ZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9maWxlID0gbmV3IFBhcnNlU291cmNlRmlsZSh0aGlzLl9zY2FubmVyLmlucHV0LCBfZmlsZU5hbWUpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVzb2x2ZUJsb2NrVHlwZSh0b2tlbjogQ3NzVG9rZW4pOiBCbG9ja1R5cGUge1xuICAgIHN3aXRjaCAodG9rZW4uc3RyVmFsdWUpIHtcbiAgICAgIGNhc2UgJ0Atby1rZXlmcmFtZXMnOlxuICAgICAgY2FzZSAnQC1tb3ota2V5ZnJhbWVzJzpcbiAgICAgIGNhc2UgJ0Atd2Via2l0LWtleWZyYW1lcyc6XG4gICAgICBjYXNlICdAa2V5ZnJhbWVzJzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5LZXlmcmFtZXM7XG5cbiAgICAgIGNhc2UgJ0BjaGFyc2V0JzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5DaGFyc2V0O1xuXG4gICAgICBjYXNlICdAaW1wb3J0JzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5JbXBvcnQ7XG5cbiAgICAgIGNhc2UgJ0BuYW1lc3BhY2UnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLk5hbWVzcGFjZTtcblxuICAgICAgY2FzZSAnQHBhZ2UnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLlBhZ2U7XG5cbiAgICAgIGNhc2UgJ0Bkb2N1bWVudCc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuRG9jdW1lbnQ7XG5cbiAgICAgIGNhc2UgJ0BtZWRpYSc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuTWVkaWFRdWVyeTtcblxuICAgICAgY2FzZSAnQGZvbnQtZmFjZSc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuRm9udEZhY2U7XG5cbiAgICAgIGNhc2UgJ0B2aWV3cG9ydCc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuVmlld3BvcnQ7XG5cbiAgICAgIGNhc2UgJ0BzdXBwb3J0cyc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuU3VwcG9ydHM7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuVW5zdXBwb3J0ZWQ7XG4gICAgfVxuICB9XG5cbiAgcGFyc2UoKTogUGFyc2VkQ3NzUmVzdWx0IHtcbiAgICB2YXIgZGVsaW1pdGVyczogbnVtYmVyID0gRU9GX0RFTElNO1xuICAgIHZhciBhc3QgPSB0aGlzLl9wYXJzZVN0eWxlU2hlZXQoZGVsaW1pdGVycyk7XG5cbiAgICB2YXIgZXJyb3JzID0gdGhpcy5fZXJyb3JzO1xuICAgIHRoaXMuX2Vycm9ycyA9IFtdO1xuXG4gICAgcmV0dXJuIG5ldyBQYXJzZWRDc3NSZXN1bHQoZXJyb3JzLCBhc3QpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VTdHlsZVNoZWV0KGRlbGltaXRlcnMpOiBDc3NTdHlsZVNoZWV0QVNUIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuICAgIHdoaWxlICh0aGlzLl9zY2FubmVyLnBlZWsgIT0gJEVPRikge1xuICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5CTE9DSyk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5fcGFyc2VSdWxlKGRlbGltaXRlcnMpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBDc3NTdHlsZVNoZWV0QVNUKHJlc3VsdHMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VSdWxlKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1J1bGVBU1Qge1xuICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgPT0gJEFUKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFyc2VBdFJ1bGUoZGVsaW1pdGVycyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wYXJzZVNlbGVjdG9yUnVsZShkZWxpbWl0ZXJzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlQXRSdWxlKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1J1bGVBU1Qge1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuXG4gICAgdmFyIHRva2VuID0gdGhpcy5fc2NhbigpO1xuXG4gICAgdGhpcy5fYXNzZXJ0Q29uZGl0aW9uKHRva2VuLnR5cGUgPT0gQ3NzVG9rZW5UeXBlLkF0S2V5d29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYFRoZSBDU1MgUnVsZSAke3Rva2VuLnN0clZhbHVlfSBpcyBub3QgYSB2YWxpZCBbQF0gcnVsZS5gLCB0b2tlbik7XG5cbiAgICB2YXIgYmxvY2ssIHR5cGUgPSB0aGlzLl9yZXNvbHZlQmxvY2tUeXBlKHRva2VuKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgQmxvY2tUeXBlLkNoYXJzZXQ6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5OYW1lc3BhY2U6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5JbXBvcnQ6XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuX3BhcnNlVmFsdWUoZGVsaW1pdGVycyk7XG4gICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgICAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDc3NJbmxpbmVSdWxlQVNUKHR5cGUsIHZhbHVlKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuVmlld3BvcnQ6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5Gb250RmFjZTpcbiAgICAgICAgYmxvY2sgPSB0aGlzLl9wYXJzZVN0eWxlQmxvY2soZGVsaW1pdGVycyk7XG4gICAgICAgIHJldHVybiBuZXcgQ3NzQmxvY2tSdWxlQVNUKHR5cGUsIGJsb2NrKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuS2V5ZnJhbWVzOlxuICAgICAgICB2YXIgdG9rZW5zID0gdGhpcy5fY29sbGVjdFVudGlsRGVsaW0oYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU0sIExCUkFDRV9ERUxJTV0pKTtcbiAgICAgICAgLy8ga2V5ZnJhbWVzIG9ubHkgaGF2ZSBvbmUgaWRlbnRpZmllciBuYW1lXG4gICAgICAgIHZhciBuYW1lID0gdG9rZW5zWzBdO1xuICAgICAgICByZXR1cm4gbmV3IENzc0tleWZyYW1lUnVsZUFTVChuYW1lLCB0aGlzLl9wYXJzZUtleWZyYW1lQmxvY2soZGVsaW1pdGVycykpO1xuXG4gICAgICBjYXNlIEJsb2NrVHlwZS5NZWRpYVF1ZXJ5OlxuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLk1FRElBX1FVRVJZKTtcbiAgICAgICAgdmFyIHRva2VucyA9IHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNLCBMQlJBQ0VfREVMSU1dKSk7XG4gICAgICAgIHJldHVybiBuZXcgQ3NzTWVkaWFRdWVyeVJ1bGVBU1QodG9rZW5zLCB0aGlzLl9wYXJzZUJsb2NrKGRlbGltaXRlcnMpKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuRG9jdW1lbnQ6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5TdXBwb3J0czpcbiAgICAgIGNhc2UgQmxvY2tUeXBlLlBhZ2U6XG4gICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQVRfUlVMRV9RVUVSWSk7XG4gICAgICAgIHZhciB0b2tlbnMgPSB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTSwgTEJSQUNFX0RFTElNXSkpO1xuICAgICAgICByZXR1cm4gbmV3IENzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1QodHlwZSwgdG9rZW5zLCB0aGlzLl9wYXJzZUJsb2NrKGRlbGltaXRlcnMpKTtcblxuICAgICAgLy8gaWYgYSBjdXN0b20gQHJ1bGUgeyAuLi4gfSBpcyB1c2VkIGl0IHNob3VsZCBzdGlsbCB0b2tlbml6ZSB0aGUgaW5zaWRlc1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIGxpc3RPZlRva2VucyA9IFtdO1xuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkFMTCk7XG4gICAgICAgIHRoaXMuX2Vycm9yKGdlbmVyYXRlRXJyb3JNZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nhbm5lci5pbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGBUaGUgQ1NTIFwiYXRcIiBydWxlIFwiJHt0b2tlbi5zdHJWYWx1ZX1cIiBpcyBub3QgYWxsb3dlZCB0byB1c2VkIGhlcmVgLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uc3RyVmFsdWUsIHRva2VuLmluZGV4LCB0b2tlbi5saW5lLCB0b2tlbi5jb2x1bW4pLFxuICAgICAgICAgICAgICAgICAgICB0b2tlbik7XG5cbiAgICAgICAgdGhpcy5fY29sbGVjdFVudGlsRGVsaW0oYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBMQlJBQ0VfREVMSU0sIFNFTUlDT0xPTl9ERUxJTV0pKVxuICAgICAgICAgICAgLmZvckVhY2goKHRva2VuKSA9PiB7IGxpc3RPZlRva2Vucy5wdXNoKHRva2VuKTsgfSk7XG4gICAgICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgPT0gJExCUkFDRSkge1xuICAgICAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ3snKTtcbiAgICAgICAgICB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTSwgTEJSQUNFX0RFTElNXSkpXG4gICAgICAgICAgICAgIC5mb3JFYWNoKCh0b2tlbikgPT4geyBsaXN0T2ZUb2tlbnMucHVzaCh0b2tlbik7IH0pO1xuICAgICAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ30nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IENzc1Vua25vd25Ub2tlbkxpc3RBU1QodG9rZW4sIGxpc3RPZlRva2Vucyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VTZWxlY3RvclJ1bGUoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzU2VsZWN0b3JSdWxlQVNUIHtcbiAgICB2YXIgc2VsZWN0b3JzID0gdGhpcy5fcGFyc2VTZWxlY3RvcnMoZGVsaW1pdGVycyk7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5fcGFyc2VTdHlsZUJsb2NrKGRlbGltaXRlcnMpO1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuICAgIHJldHVybiBuZXcgQ3NzU2VsZWN0b3JSdWxlQVNUKHNlbGVjdG9ycywgYmxvY2spO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VTZWxlY3RvcnMoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzU2VsZWN0b3JBU1RbXSB7XG4gICAgZGVsaW1pdGVycyA9IGJpdFdpc2VPcihbZGVsaW1pdGVycywgTEJSQUNFX0RFTElNXSk7XG5cbiAgICB2YXIgc2VsZWN0b3JzID0gW107XG4gICAgdmFyIGlzUGFyc2luZ1NlbGVjdG9ycyA9IHRydWU7XG4gICAgd2hpbGUgKGlzUGFyc2luZ1NlbGVjdG9ycykge1xuICAgICAgc2VsZWN0b3JzLnB1c2godGhpcy5fcGFyc2VTZWxlY3RvcihkZWxpbWl0ZXJzKSk7XG5cbiAgICAgIGlzUGFyc2luZ1NlbGVjdG9ycyA9ICFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpO1xuXG4gICAgICBpZiAoaXNQYXJzaW5nU2VsZWN0b3JzKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJywnKTtcbiAgICAgICAgaXNQYXJzaW5nU2VsZWN0b3JzID0gIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdG9ycztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NjYW4oKTogQ3NzVG9rZW4ge1xuICAgIHZhciBvdXRwdXQgPSB0aGlzLl9zY2FubmVyLnNjYW4oKTtcbiAgICB2YXIgdG9rZW4gPSBvdXRwdXQudG9rZW47XG4gICAgdmFyIGVycm9yID0gb3V0cHV0LmVycm9yO1xuICAgIGlmIChpc1ByZXNlbnQoZXJyb3IpKSB7XG4gICAgICB0aGlzLl9lcnJvcihlcnJvci5yYXdNZXNzYWdlLCB0b2tlbik7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbnN1bWUodHlwZTogQ3NzVG9rZW5UeXBlLCB2YWx1ZTogc3RyaW5nID0gbnVsbCk6IENzc1Rva2VuIHtcbiAgICB2YXIgb3V0cHV0ID0gdGhpcy5fc2Nhbm5lci5jb25zdW1lKHR5cGUsIHZhbHVlKTtcbiAgICB2YXIgdG9rZW4gPSBvdXRwdXQudG9rZW47XG4gICAgdmFyIGVycm9yID0gb3V0cHV0LmVycm9yO1xuICAgIGlmIChpc1ByZXNlbnQoZXJyb3IpKSB7XG4gICAgICB0aGlzLl9lcnJvcihlcnJvci5yYXdNZXNzYWdlLCB0b2tlbik7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlS2V5ZnJhbWVCbG9jayhkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NCbG9ja0FTVCB7XG4gICAgZGVsaW1pdGVycyA9IGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNXSk7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5LRVlGUkFNRV9CTE9DSyk7XG5cbiAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd7Jyk7XG5cbiAgICB2YXIgZGVmaW5pdGlvbnMgPSBbXTtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIGRlZmluaXRpb25zLnB1c2godGhpcy5fcGFyc2VLZXlmcmFtZURlZmluaXRpb24oZGVsaW1pdGVycykpO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ30nKTtcblxuICAgIHJldHVybiBuZXcgQ3NzQmxvY2tBU1QoZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VLZXlmcmFtZURlZmluaXRpb24oZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNUIHtcbiAgICB2YXIgc3RlcFRva2VucyA9IFtdO1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIExCUkFDRV9ERUxJTV0pO1xuICAgIHdoaWxlICghY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKSkge1xuICAgICAgc3RlcFRva2Vucy5wdXNoKHRoaXMuX3BhcnNlS2V5ZnJhbWVMYWJlbChiaXRXaXNlT3IoW2RlbGltaXRlcnMsIENPTU1BX0RFTElNXSkpKTtcbiAgICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgIT0gJExCUkFDRSkge1xuICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcsJyk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBzdHlsZXMgPSB0aGlzLl9wYXJzZVN0eWxlQmxvY2soYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU1dKSk7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5CTE9DSyk7XG4gICAgcmV0dXJuIG5ldyBDc3NLZXlmcmFtZURlZmluaXRpb25BU1Qoc3RlcFRva2Vucywgc3R5bGVzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlS2V5ZnJhbWVMYWJlbChkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NUb2tlbiB7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5LRVlGUkFNRV9CTE9DSyk7XG4gICAgcmV0dXJuIG1lcmdlVG9rZW5zKHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKGRlbGltaXRlcnMpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlU2VsZWN0b3IoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzU2VsZWN0b3JBU1Qge1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIENPTU1BX0RFTElNLCBMQlJBQ0VfREVMSU1dKTtcbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNFTEVDVE9SKTtcblxuICAgIHZhciBzZWxlY3RvckNzc1Rva2VucyA9IFtdO1xuICAgIHZhciBpc0NvbXBsZXggPSBmYWxzZTtcbiAgICB2YXIgd3NDc3NUb2tlbjtcblxuICAgIHZhciBwcmV2aW91c1Rva2VuO1xuICAgIHZhciBwYXJlbkNvdW50ID0gMDtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIHZhciBjb2RlID0gdGhpcy5fc2Nhbm5lci5wZWVrO1xuICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgIGNhc2UgJExQQVJFTjpcbiAgICAgICAgICBwYXJlbkNvdW50Kys7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAkUlBBUkVOOlxuICAgICAgICAgIHBhcmVuQ291bnQtLTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICRDT0xPTjpcbiAgICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlBTRVVET19TRUxFQ1RPUik7XG4gICAgICAgICAgcHJldmlvdXNUb2tlbiA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJzonKTtcbiAgICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHByZXZpb3VzVG9rZW4pO1xuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGNhc2UgJExCUkFDS0VUOlxuICAgICAgICAgIC8vIGlmIHdlIGFyZSBhbHJlYWR5IGluc2lkZSBhbiBhdHRyaWJ1dGUgc2VsZWN0b3IgdGhlbiB3ZSBjYW4ndFxuICAgICAgICAgIC8vIGp1bXAgaW50byB0aGUgbW9kZSBhZ2Fpbi4gVGhlcmVmb3JlIHRoaXMgZXJyb3Igd2lsbCBnZXQgcGlja2VkXG4gICAgICAgICAgLy8gdXAgd2hlbiB0aGUgc2NhbiBtZXRob2QgaXMgY2FsbGVkIGJlbG93LlxuICAgICAgICAgIGlmICh0aGlzLl9zY2FubmVyLmdldE1vZGUoKSAhPSBDc3NMZXhlck1vZGUuQVRUUklCVVRFX1NFTEVDVE9SKSB7XG4gICAgICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ1snKSk7XG4gICAgICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkFUVFJJQlVURV9TRUxFQ1RPUik7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAkUkJSQUNLRVQ6XG4gICAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICddJykpO1xuICAgICAgICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU0VMRUNUT1IpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgdG9rZW4gPSB0aGlzLl9zY2FuKCk7XG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgdGhlIFwiOm5vdChcIiBzZWxlY3RvciBzaW5jZSBpdFxuICAgICAgLy8gY29udGFpbnMgYW4gaW5uZXIgc2VsZWN0b3IgdGhhdCBuZWVkcyB0byBiZSBwYXJzZWRcbiAgICAgIC8vIGluIGlzb2xhdGlvblxuICAgICAgaWYgKHRoaXMuX3NjYW5uZXIuZ2V0TW9kZSgpID09IENzc0xleGVyTW9kZS5QU0VVRE9fU0VMRUNUT1IgJiYgaXNQcmVzZW50KHByZXZpb3VzVG9rZW4pICYmXG4gICAgICAgICAgcHJldmlvdXNUb2tlbi5udW1WYWx1ZSA9PSAkQ09MT04gJiYgdG9rZW4uc3RyVmFsdWUgPT0gXCJub3RcIiAmJlxuICAgICAgICAgIHRoaXMuX3NjYW5uZXIucGVlayA9PSAkTFBBUkVOKSB7XG4gICAgICAgIHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJygnKSk7XG5cbiAgICAgICAgLy8gdGhlIGlubmVyIHNlbGVjdG9yIGluc2lkZSBvZiA6bm90KC4uLikgY2FuIG9ubHkgYmUgb25lXG4gICAgICAgIC8vIENTUyBzZWxlY3RvciAobm8gY29tbWFzIGFsbG93ZWQpIHRoZXJlZm9yZSB3ZSBwYXJzZSBvbmx5XG4gICAgICAgIC8vIG9uZSBzZWxlY3RvciBieSBjYWxsaW5nIHRoZSBtZXRob2QgYmVsb3dcbiAgICAgICAgdGhpcy5fcGFyc2VTZWxlY3RvcihiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJQQVJFTl9ERUxJTV0pKVxuICAgICAgICAgICAgLnRva2Vucy5mb3JFYWNoKFxuICAgICAgICAgICAgICAgIChpbm5lclNlbGVjdG9yVG9rZW4pID0+IHsgc2VsZWN0b3JDc3NUb2tlbnMucHVzaChpbm5lclNlbGVjdG9yVG9rZW4pOyB9KTtcblxuICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJyknKSk7XG5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHByZXZpb3VzVG9rZW4gPSB0b2tlbjtcblxuICAgICAgaWYgKHRva2VuLnR5cGUgPT0gQ3NzVG9rZW5UeXBlLldoaXRlc3BhY2UpIHtcbiAgICAgICAgd3NDc3NUb2tlbiA9IHRva2VuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzUHJlc2VudCh3c0Nzc1Rva2VuKSkge1xuICAgICAgICAgIHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2god3NDc3NUb2tlbik7XG4gICAgICAgICAgd3NDc3NUb2tlbiA9IG51bGw7XG4gICAgICAgICAgaXNDb21wbGV4ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc2Nhbm5lci5nZXRNb2RlKCkgPT0gQ3NzTGV4ZXJNb2RlLkFUVFJJQlVURV9TRUxFQ1RPUikge1xuICAgICAgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgYFVuYmFsYW5jZWQgQ1NTIGF0dHJpYnV0ZSBzZWxlY3RvciBhdCBjb2x1bW4gJHtwcmV2aW91c1Rva2VuLmxpbmV9OiR7cHJldmlvdXNUb2tlbi5jb2x1bW59YCxcbiAgICAgICAgICBwcmV2aW91c1Rva2VuKTtcbiAgICB9IGVsc2UgaWYgKHBhcmVuQ291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICBgVW5iYWxhbmNlZCBwc2V1ZG8gc2VsZWN0b3IgZnVuY3Rpb24gdmFsdWUgYXQgY29sdW1uICR7cHJldmlvdXNUb2tlbi5saW5lfToke3ByZXZpb3VzVG9rZW4uY29sdW1ufWAsXG4gICAgICAgICAgcHJldmlvdXNUb2tlbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDc3NTZWxlY3RvckFTVChzZWxlY3RvckNzc1Rva2VucywgaXNDb21wbGV4KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlVmFsdWUoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzU3R5bGVWYWx1ZUFTVCB7XG4gICAgZGVsaW1pdGVycyA9IGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNLCBTRU1JQ09MT05fREVMSU0sIE5FV0xJTkVfREVMSU1dKTtcblxuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU1RZTEVfVkFMVUUpO1xuXG4gICAgdmFyIHN0clZhbHVlID0gXCJcIjtcbiAgICB2YXIgdG9rZW5zID0gW107XG4gICAgdmFyIHByZXZpb3VzOiBDc3NUb2tlbjtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIHZhciB0b2tlbjtcbiAgICAgIGlmIChpc1ByZXNlbnQocHJldmlvdXMpICYmIHByZXZpb3VzLnR5cGUgPT0gQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIgJiZcbiAgICAgICAgICB0aGlzLl9zY2FubmVyLnBlZWsgPT0gJExQQVJFTikge1xuICAgICAgICB0b2tlbiA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJygnKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBzdHJWYWx1ZSArPSB0b2tlbi5zdHJWYWx1ZTtcblxuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFX0ZVTkNUSU9OKTtcblxuICAgICAgICB0b2tlbiA9IHRoaXMuX3NjYW4oKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBzdHJWYWx1ZSArPSB0b2tlbi5zdHJWYWx1ZTtcblxuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFKTtcblxuICAgICAgICB0b2tlbiA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJyknKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBzdHJWYWx1ZSArPSB0b2tlbi5zdHJWYWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRva2VuID0gdGhpcy5fc2NhbigpO1xuICAgICAgICBpZiAodG9rZW4udHlwZSAhPSBDc3NUb2tlblR5cGUuV2hpdGVzcGFjZSkge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBzdHJWYWx1ZSArPSB0b2tlbi5zdHJWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgcHJldmlvdXMgPSB0b2tlbjtcbiAgICB9XG5cbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG5cbiAgICB2YXIgY29kZSA9IHRoaXMuX3NjYW5uZXIucGVlaztcbiAgICBpZiAoY29kZSA9PSAkU0VNSUNPTE9OKSB7XG4gICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICc7Jyk7XG4gICAgfSBlbHNlIGlmIChjb2RlICE9ICRSQlJBQ0UpIHtcbiAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgIGdlbmVyYXRlRXJyb3JNZXNzYWdlKHRoaXMuX3NjYW5uZXIuaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYFRoZSBDU1Mga2V5L3ZhbHVlIGRlZmluaXRpb24gZGlkIG5vdCBlbmQgd2l0aCBhIHNlbWljb2xvbmAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXMuc3RyVmFsdWUsIHByZXZpb3VzLmluZGV4LCBwcmV2aW91cy5saW5lLCBwcmV2aW91cy5jb2x1bW4pLFxuICAgICAgICAgIHByZXZpb3VzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENzc1N0eWxlVmFsdWVBU1QodG9rZW5zLCBzdHJWYWx1ZSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jb2xsZWN0VW50aWxEZWxpbShkZWxpbWl0ZXJzOiBudW1iZXIsIGFzc2VydFR5cGU6IENzc1Rva2VuVHlwZSA9IG51bGwpOiBDc3NUb2tlbltdIHtcbiAgICB2YXIgdG9rZW5zID0gW107XG4gICAgd2hpbGUgKCFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpKSB7XG4gICAgICB2YXIgdmFsID0gaXNQcmVzZW50KGFzc2VydFR5cGUpID8gdGhpcy5fY29uc3VtZShhc3NlcnRUeXBlKSA6IHRoaXMuX3NjYW4oKTtcbiAgICAgIHRva2Vucy5wdXNoKHZhbCk7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZUJsb2NrKGRlbGltaXRlcnM6IG51bWJlcik6IENzc0Jsb2NrQVNUIHtcbiAgICBkZWxpbWl0ZXJzID0gYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU1dKTtcblxuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAneycpO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9wYXJzZVJ1bGUoZGVsaW1pdGVycykpO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ30nKTtcblxuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuXG4gICAgcmV0dXJuIG5ldyBDc3NCbG9ja0FTVChyZXN1bHRzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlU3R5bGVCbG9jayhkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NCbG9ja0FTVCB7XG4gICAgZGVsaW1pdGVycyA9IGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNLCBMQlJBQ0VfREVMSU1dKTtcblxuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU1RZTEVfQkxPQ0spO1xuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAneycpO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuXG4gICAgdmFyIGRlZmluaXRpb25zID0gW107XG4gICAgd2hpbGUgKCFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpKSB7XG4gICAgICBkZWZpbml0aW9ucy5wdXNoKHRoaXMuX3BhcnNlRGVmaW5pdGlvbihkZWxpbWl0ZXJzKSk7XG4gICAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd9Jyk7XG5cbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX0JMT0NLKTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcblxuICAgIHJldHVybiBuZXcgQ3NzQmxvY2tBU1QoZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VEZWZpbml0aW9uKGRlbGltaXRlcnM6IG51bWJlcik6IENzc0RlZmluaXRpb25BU1Qge1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU1RZTEVfQkxPQ0spO1xuXG4gICAgdmFyIHByb3AgPSB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5JZGVudGlmaWVyKTtcbiAgICB2YXIgcGFyc2VWYWx1ZSwgdmFsdWUgPSBudWxsO1xuXG4gICAgLy8gdGhlIGNvbG9uIHZhbHVlIHNlcGFyYXRlcyB0aGUgcHJvcCBmcm9tIHRoZSBzdHlsZS5cbiAgICAvLyB0aGVyZSBhcmUgYSBmZXcgY2FzZXMgYXMgdG8gd2hhdCBjb3VsZCBoYXBwZW4gaWYgaXRcbiAgICAvLyBpcyBtaXNzaW5nXG4gICAgc3dpdGNoICh0aGlzLl9zY2FubmVyLnBlZWspIHtcbiAgICAgIGNhc2UgJENPTE9OOlxuICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICc6Jyk7XG4gICAgICAgIHBhcnNlVmFsdWUgPSB0cnVlO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAkU0VNSUNPTE9OOlxuICAgICAgY2FzZSAkUkJSQUNFOlxuICAgICAgY2FzZSAkRU9GOlxuICAgICAgICBwYXJzZVZhbHVlID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgcHJvcFN0ciA9IFtwcm9wLnN0clZhbHVlXTtcbiAgICAgICAgaWYgKHRoaXMuX3NjYW5uZXIucGVlayAhPSAkQ09MT04pIHtcbiAgICAgICAgICAvLyB0aGlzIHdpbGwgdGhyb3cgdGhlIGVycm9yXG4gICAgICAgICAgdmFyIG5leHRWYWx1ZSA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJzonKTtcbiAgICAgICAgICBwcm9wU3RyLnB1c2gobmV4dFZhbHVlLnN0clZhbHVlKTtcblxuICAgICAgICAgIHZhciByZW1haW5pbmdUb2tlbnMgPSB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShcbiAgICAgICAgICAgICAgYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBDT0xPTl9ERUxJTSwgU0VNSUNPTE9OX0RFTElNXSksIENzc1Rva2VuVHlwZS5JZGVudGlmaWVyKTtcbiAgICAgICAgICBpZiAocmVtYWluaW5nVG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlbWFpbmluZ1Rva2Vucy5mb3JFYWNoKCh0b2tlbikgPT4geyBwcm9wU3RyLnB1c2godG9rZW4uc3RyVmFsdWUpOyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwcm9wID0gbmV3IENzc1Rva2VuKHByb3AuaW5kZXgsIHByb3AuY29sdW1uLCBwcm9wLmxpbmUsIHByb3AudHlwZSwgcHJvcFN0ci5qb2luKFwiIFwiKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzIG1lYW5zIHdlJ3ZlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgZGVmaW5pdGlvbiBhbmQvb3IgYmxvY2tcbiAgICAgICAgaWYgKHRoaXMuX3NjYW5uZXIucGVlayA9PSAkQ09MT04pIHtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICc6Jyk7XG4gICAgICAgICAgcGFyc2VWYWx1ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFyc2VWYWx1ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChwYXJzZVZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuX3BhcnNlVmFsdWUoZGVsaW1pdGVycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2Vycm9yKGdlbmVyYXRlRXJyb3JNZXNzYWdlKHRoaXMuX3NjYW5uZXIuaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgVGhlIENTUyBwcm9wZXJ0eSB3YXMgbm90IHBhaXJlZCB3aXRoIGEgc3R5bGUgdmFsdWVgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcC5zdHJWYWx1ZSwgcHJvcC5pbmRleCwgcHJvcC5saW5lLCBwcm9wLmNvbHVtbiksXG4gICAgICAgICAgICAgICAgICBwcm9wKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENzc0RlZmluaXRpb25BU1QocHJvcCwgdmFsdWUpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXNzZXJ0Q29uZGl0aW9uKHN0YXR1czogYm9vbGVhbiwgZXJyb3JNZXNzYWdlOiBzdHJpbmcsIHByb2JsZW1Ub2tlbjogQ3NzVG9rZW4pOiBib29sZWFuIHtcbiAgICBpZiAoIXN0YXR1cykge1xuICAgICAgdGhpcy5fZXJyb3IoZXJyb3JNZXNzYWdlLCBwcm9ibGVtVG9rZW4pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Vycm9yKG1lc3NhZ2U6IHN0cmluZywgcHJvYmxlbVRva2VuOiBDc3NUb2tlbikge1xuICAgIHZhciBsZW5ndGggPSBwcm9ibGVtVG9rZW4uc3RyVmFsdWUubGVuZ3RoO1xuICAgIHZhciBlcnJvciA9IENzc1BhcnNlRXJyb3IuY3JlYXRlKHRoaXMuX2ZpbGUsIDAsIHByb2JsZW1Ub2tlbi5saW5lLCBwcm9ibGVtVG9rZW4uY29sdW1uLCBsZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSk7XG4gICAgdGhpcy5fZXJyb3JzLnB1c2goZXJyb3IpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NTdHlsZVZhbHVlQVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuczogQ3NzVG9rZW5bXSwgcHVibGljIHN0clZhbHVlOiBzdHJpbmcpIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NWYWx1ZSh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzUnVsZUFTVCBleHRlbmRzIENzc0FTVCB7fVxuXG5leHBvcnQgY2xhc3MgQ3NzQmxvY2tSdWxlQVNUIGV4dGVuZHMgQ3NzUnVsZUFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0eXBlOiBCbG9ja1R5cGUsIHB1YmxpYyBibG9jazogQ3NzQmxvY2tBU1QsIHB1YmxpYyBuYW1lOiBDc3NUb2tlbiA9IG51bGwpIHtcbiAgICBzdXBlcigpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0Jsb2NrKHRoaXMuYmxvY2ssIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NLZXlmcmFtZVJ1bGVBU1QgZXh0ZW5kcyBDc3NCbG9ja1J1bGVBU1Qge1xuICBjb25zdHJ1Y3RvcihuYW1lOiBDc3NUb2tlbiwgYmxvY2s6IENzc0Jsb2NrQVNUKSB7IHN1cGVyKEJsb2NrVHlwZS5LZXlmcmFtZXMsIGJsb2NrLCBuYW1lKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NLZXlmcmFtZVJ1bGUodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc0tleWZyYW1lRGVmaW5pdGlvbkFTVCBleHRlbmRzIENzc0Jsb2NrUnVsZUFTVCB7XG4gIHB1YmxpYyBzdGVwcztcbiAgY29uc3RydWN0b3IoX3N0ZXBzOiBDc3NUb2tlbltdLCBibG9jazogQ3NzQmxvY2tBU1QpIHtcbiAgICBzdXBlcihCbG9ja1R5cGUuS2V5ZnJhbWVzLCBibG9jaywgbWVyZ2VUb2tlbnMoX3N0ZXBzLCBcIixcIikpO1xuICAgIHRoaXMuc3RlcHMgPSBfc3RlcHM7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkge1xuICAgIHZpc2l0b3IudmlzaXRDc3NLZXlmcmFtZURlZmluaXRpb24odGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1QgZXh0ZW5kcyBDc3NCbG9ja1J1bGVBU1Qge1xuICBwdWJsaWMgc3RyVmFsdWU6IHN0cmluZztcbiAgY29uc3RydWN0b3IodHlwZTogQmxvY2tUeXBlLCBwdWJsaWMgcXVlcnk6IENzc1Rva2VuW10sIGJsb2NrOiBDc3NCbG9ja0FTVCkge1xuICAgIHN1cGVyKHR5cGUsIGJsb2NrKTtcbiAgICB0aGlzLnN0clZhbHVlID0gcXVlcnkubWFwKHRva2VuID0+IHRva2VuLnN0clZhbHVlKS5qb2luKFwiXCIpO1xuICAgIHZhciBmaXJzdENzc1Rva2VuOiBDc3NUb2tlbiA9IHF1ZXJ5WzBdO1xuICAgIHRoaXMubmFtZSA9IG5ldyBDc3NUb2tlbihmaXJzdENzc1Rva2VuLmluZGV4LCBmaXJzdENzc1Rva2VuLmNvbHVtbiwgZmlyc3RDc3NUb2tlbi5saW5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDc3NUb2tlblR5cGUuSWRlbnRpZmllciwgdGhpcy5zdHJWYWx1ZSk7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzQmxvY2sodGhpcy5ibG9jaywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc01lZGlhUXVlcnlSdWxlQVNUIGV4dGVuZHMgQ3NzQmxvY2tEZWZpbml0aW9uUnVsZUFTVCB7XG4gIGNvbnN0cnVjdG9yKHF1ZXJ5OiBDc3NUb2tlbltdLCBibG9jazogQ3NzQmxvY2tBU1QpIHsgc3VwZXIoQmxvY2tUeXBlLk1lZGlhUXVlcnksIHF1ZXJ5LCBibG9jayk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzTWVkaWFRdWVyeVJ1bGUodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc0lubGluZVJ1bGVBU1QgZXh0ZW5kcyBDc3NSdWxlQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHR5cGU6IEJsb2NrVHlwZSwgcHVibGljIHZhbHVlOiBDc3NTdHlsZVZhbHVlQVNUKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0SW5saW5lQ3NzUnVsZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzU2VsZWN0b3JSdWxlQVNUIGV4dGVuZHMgQ3NzQmxvY2tSdWxlQVNUIHtcbiAgcHVibGljIHN0clZhbHVlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHNlbGVjdG9yczogQ3NzU2VsZWN0b3JBU1RbXSwgYmxvY2s6IENzc0Jsb2NrQVNUKSB7XG4gICAgc3VwZXIoQmxvY2tUeXBlLlNlbGVjdG9yLCBibG9jayk7XG4gICAgdGhpcy5zdHJWYWx1ZSA9IHNlbGVjdG9ycy5tYXAoc2VsZWN0b3IgPT4gc2VsZWN0b3Iuc3RyVmFsdWUpLmpvaW4oXCIsXCIpO1xuICB9XG5cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzU2VsZWN0b3JSdWxlKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NEZWZpbml0aW9uQVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHByb3BlcnR5OiBDc3NUb2tlbiwgcHVibGljIHZhbHVlOiBDc3NTdHlsZVZhbHVlQVNUKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzRGVmaW5pdGlvbih0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzU2VsZWN0b3JBU1QgZXh0ZW5kcyBDc3NBU1Qge1xuICBwdWJsaWMgc3RyVmFsdWU7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbnM6IENzc1Rva2VuW10sIHB1YmxpYyBpc0NvbXBsZXg6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdHJWYWx1ZSA9IHRva2Vucy5tYXAodG9rZW4gPT4gdG9rZW4uc3RyVmFsdWUpLmpvaW4oXCJcIik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzU2VsZWN0b3IodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc0Jsb2NrQVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVudHJpZXM6IENzc0FTVFtdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzQmxvY2sodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1N0eWxlU2hlZXRBU1QgZXh0ZW5kcyBDc3NBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcnVsZXM6IENzc0FTVFtdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzU3R5bGVTaGVldCh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzUGFyc2VFcnJvciBleHRlbmRzIFBhcnNlRXJyb3Ige1xuICBzdGF0aWMgY3JlYXRlKGZpbGU6IFBhcnNlU291cmNlRmlsZSwgb2Zmc2V0OiBudW1iZXIsIGxpbmU6IG51bWJlciwgY29sOiBudW1iZXIsIGxlbmd0aDogbnVtYmVyLFxuICAgICAgICAgICAgICAgIGVyck1zZzogc3RyaW5nKTogQ3NzUGFyc2VFcnJvciB7XG4gICAgdmFyIHN0YXJ0ID0gbmV3IFBhcnNlTG9jYXRpb24oZmlsZSwgb2Zmc2V0LCBsaW5lLCBjb2wpO1xuICAgIHZhciBlbmQgPSBuZXcgUGFyc2VMb2NhdGlvbihmaWxlLCBvZmZzZXQsIGxpbmUsIGNvbCArIGxlbmd0aCk7XG4gICAgdmFyIHNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKHN0YXJ0LCBlbmQpO1xuICAgIHJldHVybiBuZXcgQ3NzUGFyc2VFcnJvcihzcGFuLCBcIkNTUyBQYXJzZSBFcnJvcjogXCIgKyBlcnJNc2cpO1xuICB9XG5cbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTb3VyY2VTcGFuLCBtZXNzYWdlOiBzdHJpbmcpIHsgc3VwZXIoc3BhbiwgbWVzc2FnZSk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1Vua25vd25Ub2tlbkxpc3RBU1QgZXh0ZW5kcyBDc3NSdWxlQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWUsIHB1YmxpYyB0b2tlbnM6IENzc1Rva2VuW10pIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRVbmtvd25SdWxlKHRoaXMsIGNvbnRleHQpOyB9XG59XG4iXX0=