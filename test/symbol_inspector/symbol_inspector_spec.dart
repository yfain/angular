library angular2.test.symbol_inspector.symbol_inspector_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xdescribe,
        xit;
import "package:angular2/src/facade/lang.dart" show IS_DART;
import "symbol_inspector.dart" show getSymbolsFromLibrary;

main() {
  describe("symbol inspector", () {
    if (IS_DART) {
      it("should extract symbols (dart)", () {
        var symbols = getSymbolsFromLibrary("simple_library");
        expect(symbols).toEqual([
          "A",
          "ClosureParam",
          "ClosureReturn",
          "ConsParamType",
          "FieldType",
          "Generic",
          "GetterType",
          "MethodReturnType",
          "ParamType",
          "SomeInterface",
          "StaticFieldType",
          "TypedefParam",
          "TypedefReturnType"
        ]);
      });
    } else {
      it("should extract symbols (js)", () {
        var symbols = getSymbolsFromLibrary("simple_library");
        expect(symbols).toEqual([
          "A",
          "ClosureParam",
          "ClosureReturn",
          "ConsParamType",
          "FieldType",
          "Generic",
          "GetterType",
          "MethodReturnType",
          "ParamType",
          "StaticFieldType",
          "TypedefParam",
          "TypedefReturnType"
        ]);
      });
    }
  });
}
