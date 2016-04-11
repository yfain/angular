var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { provide, Component } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
import { RouteConfig, RouteParams, ROUTER_DIRECTIVES, APP_BASE_HREF } from 'angular2/router';
// #docregion routerCanDeactivate
let NoteCmp = class {
    constructor(params) {
        this.id = params.get('id');
    }
    routerCanDeactivate(next, prev) {
        return confirm('Are you sure you want to leave?');
    }
};
NoteCmp = __decorate([
    Component({
        selector: 'note-cmp',
        template: `
    <div>
      <h2>id: {{id}}</h2>
      <textarea cols="40" rows="10"></textarea>
    </div>`
    }), 
    __metadata('design:paramtypes', [RouteParams])
], NoteCmp);
// #enddocregion
let NoteIndexCmp = class {
};
NoteIndexCmp = __decorate([
    Component({
        selector: 'note-index-cmp',
        template: `
    <h1>Your Notes</h1>
    <div>
      Edit <a [routerLink]="['/NoteCmp', {id: 1}]" id="note-1-link">Note 1</a> |
      Edit <a [routerLink]="['/NoteCmp', {id: 2}]" id="note-2-link">Note 2</a>
    </div>
  `,
        directives: [ROUTER_DIRECTIVES]
    }), 
    __metadata('design:paramtypes', [])
], NoteIndexCmp);
let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My App</h1>
    <router-outlet></router-outlet>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([
        { path: '/note/:id', component: NoteCmp, name: 'NoteCmp' },
        { path: '/', component: NoteIndexCmp, name: 'NoteIndexCmp' }
    ]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/can_deactivate' })]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuX2RlYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdzNEUmxYSmkudG1wL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fZGVhY3RpdmF0ZS9jYW5fZGVhY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIk5vdGVDbXAiLCJOb3RlQ21wLmNvbnN0cnVjdG9yIiwiTm90ZUNtcC5yb3V0ZXJDYW5EZWFjdGl2YXRlIiwiTm90ZUluZGV4Q21wIiwiQXBwQ21wIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZTtPQUN6QyxFQUFDLFNBQVMsRUFBQyxNQUFNLDJCQUEyQjtPQUM1QyxFQUFnQixXQUFXLEVBQUUsV0FBVyxFQUF3QixpQkFBaUIsRUFBRSxhQUFhLEVBQUMsTUFBTSxpQkFBaUI7QUFFL0gsaUNBQWlDO0FBQ2pDO0lBV0VBLFlBQVlBLE1BQW1CQTtRQUFJQyxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUVoRUQsbUJBQW1CQSxDQUFDQSxJQUEwQkEsRUFBRUEsSUFBMEJBO1FBQ3hFRSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxpQ0FBaUNBLENBQUNBLENBQUNBO0lBQ3BEQSxDQUFDQTtBQUNIRixDQUFDQTtBQWhCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFFBQVEsRUFBRTs7OztXQUlEO0tBQ1YsQ0FBQzs7WUFTRDtBQUNELGdCQUFnQjtBQUdoQjtBQVlBRyxDQUFDQTtBQVpEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixRQUFRLEVBQUU7Ozs7OztHQU1UO1FBQ0QsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDaEMsQ0FBQzs7aUJBRUQ7QUFHRDtBQWFBQyxDQUFDQTtBQWJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFOzs7R0FHVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7SUFDRCxXQUFXLENBQUM7UUFDWCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO1FBQ3hELEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7S0FDM0QsQ0FBQzs7V0FFRDtBQUdEO0lBQ0VDLE1BQU1BLENBQUNBLFNBQVNBLENBQ1pBLE1BQU1BLEVBQUVBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLDZDQUE2Q0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDbkdBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtwcm92aWRlLCBDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuaW1wb3J0IHtDYW5EZWFjdGl2YXRlLCBSb3V0ZUNvbmZpZywgUm91dGVQYXJhbXMsIENvbXBvbmVudEluc3RydWN0aW9uLCBST1VURVJfRElSRUNUSVZFUywgQVBQX0JBU0VfSFJFRn0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcblxuLy8gI2RvY3JlZ2lvbiByb3V0ZXJDYW5EZWFjdGl2YXRlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdub3RlLWNtcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdj5cbiAgICAgIDxoMj5pZDoge3tpZH19PC9oMj5cbiAgICAgIDx0ZXh0YXJlYSBjb2xzPVwiNDBcIiByb3dzPVwiMTBcIj48L3RleHRhcmVhPlxuICAgIDwvZGl2PmBcbn0pXG5jbGFzcyBOb3RlQ21wIGltcGxlbWVudHMgQ2FuRGVhY3RpdmF0ZSB7XG4gIGlkOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocGFyYW1zOiBSb3V0ZVBhcmFtcykgeyB0aGlzLmlkID0gcGFyYW1zLmdldCgnaWQnKTsgfVxuXG4gIHJvdXRlckNhbkRlYWN0aXZhdGUobmV4dDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIHByZXY6IENvbXBvbmVudEluc3RydWN0aW9uKSB7XG4gICAgcmV0dXJuIGNvbmZpcm0oJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsZWF2ZT8nKTtcbiAgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25vdGUtaW5kZXgtY21wJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDE+WW91ciBOb3RlczwvaDE+XG4gICAgPGRpdj5cbiAgICAgIEVkaXQgPGEgW3JvdXRlckxpbmtdPVwiWycvTm90ZUNtcCcsIHtpZDogMX1dXCIgaWQ9XCJub3RlLTEtbGlua1wiPk5vdGUgMTwvYT4gfFxuICAgICAgRWRpdCA8YSBbcm91dGVyTGlua109XCJbJy9Ob3RlQ21wJywge2lkOiAyfV1cIiBpZD1cIm5vdGUtMi1saW5rXCI+Tm90ZSAyPC9hPlxuICAgIDwvZGl2PlxuICBgLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuY2xhc3MgTm90ZUluZGV4Q21wIHtcbn1cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPk15IEFwcDwvaDE+XG4gICAgPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICBgLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuQFJvdXRlQ29uZmlnKFtcbiAge3BhdGg6ICcvbm90ZS86aWQnLCBjb21wb25lbnQ6IE5vdGVDbXAsIG5hbWU6ICdOb3RlQ21wJ30sXG4gIHtwYXRoOiAnLycsIGNvbXBvbmVudDogTm90ZUluZGV4Q21wLCBuYW1lOiAnTm90ZUluZGV4Q21wJ31cbl0pXG5jbGFzcyBBcHBDbXAge1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICByZXR1cm4gYm9vdHN0cmFwKFxuICAgICAgQXBwQ21wLCBbcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL2Nhbl9kZWFjdGl2YXRlJ30pXSk7XG59XG4iXX0=