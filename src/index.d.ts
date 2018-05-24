export declare module UnitTestClass{
    export class MockedClassService{
        get MockedClassFactory():MockedClassFactory;
        constructor(public spyFactory : SpyFactory);
        setSpy(spyFactory : SpyFactory):void;
        mock<T>(klass : Klass):MockedClassFactory<T>;
    }
    export type Spy = ()=>any;
    export type SpyFactory = ()=>Spy;
    export type Klass = any;
    export type Props = string[];
    export type Spies = {
        [key:string]:Spy
    }
    export interface MockView<T>{
        instance:T,
        spies:Spies
    }
    export class MockedClassFactory<T>{
        get Object():Object;
        get MockedClassFactory():MockedClassFactory;
        constructor(spyFactory : SpyFactory , target : Klass , prop? : string | string[] , spies? : Spies);
        private _init(target : Klass , props : string | string[] , spies : Spies):void;
        private _setSpiesAndProps(props : string | string[] , spies : Spies);
        private _getDescriptorTypeFromPropertyKind(kind : string):string;
        private _getSpy(key:string, kind:string,value:any):Spy;
        private _setSpyOn(obj : any , key:string , kind:string,value:any):void;
        public create(...args:any[]):T;
        public test(what : string | string[]):MockedClassFactory<T>;
        public spies(spies : Spies):MockedClassFactory<T>;
        private _isClassInherit(classDescriptor , classEntity):boolean;
        public _getMocked(...args:any[]):MockView<T>;
        private _createClass(target , spy):any;
        private _exportTargetSpies(spiedProto):Spies;
        private _copyProtoAndReplaceSpies(target):any;
        private _replaceWithSpies(onb):any; 
    }
    
}