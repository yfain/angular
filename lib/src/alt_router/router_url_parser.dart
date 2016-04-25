library angular2.src.alt_router.router_url_parser;

import "segments.dart" show UrlSegment, Tree;
import "package:angular2/src/facade/exceptions.dart" show BaseException;

abstract class RouterUrlParser {
  Tree<UrlSegment> parse(String url);
}

class DefaultRouterUrlParser extends RouterUrlParser {
  Tree<UrlSegment> parse(String url) {
    if (identical(url.length, 0)) {
      throw new BaseException('''Invalid url \'${ url}\'''');
    }
    return new Tree<UrlSegment>(this._parseNodes(url));
  }

  List<UrlSegment> _parseNodes(String url) {
    var index = url.indexOf("/", 1);
    List<UrlSegment> children;
    var currentUrl;
    if (index > -1) {
      children = this._parseNodes(url.substring(index + 1));
      currentUrl = url.substring(0, index);
    } else {
      children = [];
      currentUrl = url;
    }
    return (new List.from([new UrlSegment(currentUrl, {}, "")])
      ..addAll(children));
  }
}
