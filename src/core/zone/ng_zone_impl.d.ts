/**
 * Stores error information; delivered via [NgZone.onError] stream.
 */
export declare class NgZoneError {
    error: any;
    stackTrace: any;
    constructor(error: any, stackTrace: any);
}
export declare class NgZoneImpl implements ZoneSpec {
    static isInAngularZone(): boolean;
    name: string;
    properties: {
        [k: string]: string;
    };
    private outer;
    private inner;
    private onEnter;
    private onLeave;
    private setMicrotask;
    private setMacrotask;
    private onError;
    constructor({trace, onEnter, onLeave, setMicrotask, setMacrotask, onError}: {
        trace: boolean;
        onEnter: () => void;
        onLeave: () => void;
        setMicrotask: (hasMicrotasks: boolean) => void;
        setMacrotask: (hasMacrotasks: boolean) => void;
        onError: (error: NgZoneError) => void;
    });
    onInvokeTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task, applyThis: any, applyArgs: any): any;
    onInvoke(delegate: ZoneDelegate, current: Zone, target: Zone, callback: Function, applyThis: any, applyArgs: any[], source: string): any;
    onHasTask(delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState): void;
    onHandleError(delegate: ZoneDelegate, current: Zone, target: Zone, error: any): boolean;
    runInner(fn: () => any): any;
    runOuter(fn: () => any): any;
}
