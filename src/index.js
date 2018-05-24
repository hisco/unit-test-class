class MockedClassService{
    get MockedClassFactory(){
        return MockedClassFactory;
    }
    constructor(spyFactory){
        this.setSpy(spyFactory)
    }
    setSpy(spyFactory){
        if (typeof spyFactory != 'function')
            throw new Error('spyFactory must be of type `function`');
        this.spyFactory = spyFactory;
    }
    mock(klass){
        if (!this.spyFactory)
            throw new Error('You must call `setSpy` before using this method');
        return new (this.MockedClassFactory)(this.spyFactory , klass);
    }
}

class MockedClassFactory{
    get Object(){
        return Object;
    }
    get MockedClassFactory(){
        return MockedClassFactory
    }
    constructor(spyFactory , target , props , spies){
        this.spyFactory = spyFactory;
        this._init(target , props , spies);
    }
    _init(target , props , spies){
        this.target = target;
        this._setSpiesAndProps(props , spies);
        this.oldProto =  this.Object.getPrototypeOf(this.target);
    }
    _setSpiesAndProps(props , spies){
        const isArray = typeof props == 'array' ;
        if (isArray || typeof props == 'string'){
            if(!isArray)
                props = [props];
        }
        else if(!props)
            props = [];

        this._spies = spies || {};
        this.props = props;

        this.spiesDescriptor = this.Object.getOwnPropertyDescriptors(this._spies);
    }
    _getDescriptorTypeFromPropertyKind(kind){
        if (!(kind == 'get' || kind == 'set'))
            kind = 'value';
        return kind;
    }
    _getSpy(key , kind , value){
        let spy;
        kind = this._getDescriptorTypeFromPropertyKind(kind);

        if (this.spiesDescriptor[key])
            spy = this.spiesDescriptor[key][kind]
        
        if (!spy)
            spy = this.spyFactory();
        return spy;
    }
    _setSpyOn(obj , key , kind, value){
        const kindToSet = this._getDescriptorTypeFromPropertyKind(kind);
        const spy = obj[kindToSet] = this._getSpy(key , kind , value);
        obj['_$spy_'+kind] = spy;
    }
    create(){
        try{
            return this._getMocked(...arguments)
        }
        catch(err){
            this.Object.setPrototypeOf(this.target , this.oldProto);
            throw err;
        }
    }
    test(what){        
        return new (this.MockedClassFactory)(this.spyFactory , this.target , this.props.concat(what || []) , this.spies);
    }
    spies(spies){
        const spiesMerged = {};
        for (let key in this._spies)
            spiesMerged[key]  = this._spies[key];
        for (let key in spies)
            spiesMerged[key]  = spies[key];

        return new (this.MockedClassFactory)(this.spyFactory ,this.target , this.props , spiesMerged)
    }
    _isClassInherit(classDescriptor , classEntity){
        return classEntity.prototype.__proto__ != Object.prototype;
    }
    _getMocked(){
        const ParentClassDescriptors = this.Object.getOwnPropertyDescriptors(this.oldProto);
        const targetClassDescriptors = this.Object.getOwnPropertyDescriptors(this.target);

        const userAskedConstructor = this.props.indexOf('constructor')!=-1;

        const isTargetInherit = this._isClassInherit( targetClassDescriptors , this.target);

        let SuperClass;
        let superSpy;
        if (isTargetInherit){
            superSpy = this._getSpy('super' , 'function');
            class MockedSuperClass {
                constructor(){
                    return superSpy.apply(this , arguments);
                }
            }
            SuperClass = MockedSuperClass;
        }
        let MockedTarget;
        if (SuperClass){
            const overideParent = this._replaceWithSpies(ParentClassDescriptors);
            this.Object.defineProperties(SuperClass.prototype , overideParent);
            this.Object.setPrototypeOf(this.target , SuperClass);
        }
        MockedTarget = this._createClass(this.target , userAskedConstructor ? null : this._getSpy('constructor' , 'function')    );

        const spiedProto = this._copyProtoAndReplaceSpies(this.target);
        this.Object.defineProperties(MockedTarget.prototype ,spiedProto );
   
        const instance = new MockedTarget(...arguments);

        this.Object.setPrototypeOf(this.target , this.oldProto);
        const spies = this._exportTargetSpies(spiedProto);
        if (superSpy)
            spies['super'] = superSpy;
        return {
            spies,
            instance
        }
    }
    _createClass(target , spy){
        if (spy){
            class MockFriendly {
                constructor(){
                    spy(...arguments);
                }
            }
            return MockFriendly;
        }
        else{
            class MockFriendly extends target{

            }
            return MockFriendly;
        }
    }
    _exportTargetSpies(spiedProto){
        const spies = {};
        this.Object.keys(spiedProto).forEach((key)=>{
            const configKeys = this.Object.keys(spiedProto[key]);
            configKeys.forEach((configKey)=>{
                const property = spiedProto[key];
                this.Object.keys(property).forEach((propKey)=>{
                    if (propKey.indexOf("_$spy_") == 0){
                        spies[key + '_'+propKey.replace("_$spy_" , '')] = spiedProto[key][propKey]
                    }
                })
            });
        });
        return spies;
    }
    _copyProtoAndReplaceSpies(target){
        const targetFields = this.Object.getOwnPropertyDescriptors(target.prototype);
        const spiedProto = this._replaceWithSpies(targetFields);
        this.props.forEach((prop)=>{
            spiedProto[prop] = targetFields[prop]
        });
        return spiedProto;
    }
    _replaceWithSpies(obj){
        const out = {};
        this.Object.keys(obj).forEach((key)=>{
            const forMerge = this.Object.assign({},obj[key]);
            if (forMerge.hasOwnProperty('get') && forMerge['get'])
                this._setSpyOn(forMerge , key , 'get', forMerge['get'] )
            if (forMerge.hasOwnProperty('set') && forMerge['set'])
                this._setSpyOn(forMerge , key , 'set', forMerge['set'] )
            if (forMerge.hasOwnProperty('value')){
                const value = forMerge['value'];
                if (typeof value == 'function'){
                    this._setSpyOn(forMerge , key , 'function', forMerge['value'] )
                }
                else {
                    delete forMerge.writable;
                    this._setSpyOn(forMerge , key , 'get', forMerge['value'] );
                    delete forMerge.value;
                }
            }
            out[key] = forMerge;
        });
        return out
    }
}

module.exports = {
    MockedClassService,
    MockedClassFactory
}