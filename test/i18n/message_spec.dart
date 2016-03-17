library angular2.test.i18n.message_spec;

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
import "package:angular2/src/i18n/message.dart" show Message, id;

main() {
  ddescribe("Message", () {
    describe("id", () {
      it("should return a different id for messages with and without the meaning",
          () {
        var m1 = new Message("content", "meaning", null);
        var m2 = new Message("content", null, null);
        expect(id(m1)).toEqual(id(m1));
        expect(id(m1)).not.toEqual(id(m2));
      });
    });
  });
}
