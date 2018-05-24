const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-spies'));

const {MockedClassService , MockedClassFactory} = require('../../src/index');

describe('MockedClassService' , ()=>{
    describe('get MockedClassFactory' , ()=>{
        it('Should return MockedClassFactory' , ()=>{
            expect(MockedClassService.prototype.MockedClassFactory).to.eq(MockedClassFactory);
        })
    })
    describe('#constructor' , ()=>{
        it('Should call #setSpy' , ()=>{
            const setSpySpy = chai.spy();
            class Dummy extends MockedClassService{
                setSpy(){
                    return setSpySpy(...arguments)
                }
            }
            const mockedClassService = new Dummy(4);
            expect(setSpySpy).to.have.been.called.with(4);
        })
    });
    describe('#setSpy' , ()=>{
        it('Should throw if type of spyFactory is not a function',()=>{
            function testThrow(){
                MockedClassService.prototype.setSpy(4)
            }
            expect(testThrow).to.throw();
        });
        it('Should set `spyFactory` if valid' , ()=>{
            const spyFactory = ()=>{};
            const mockedClassService = new MockedClassService(spyFactory);

            expect(mockedClassService.spyFactory).eq(spyFactory);
        });
    });
    describe('#mock' , ()=>{
        it('Should throw if no `spyFactory` was set' , ()=>{
            const mockedClassService = new MockedClassService(()=>{});
            mockedClassService.spyFactory = null;
            function testThrow(){
                mockedClassService.mock()
            }
            expect(testThrow).to.throw();
        });
        it('Should create MockFactory' , ()=>{
            const mockedClassFactorySpy = chai.spy(()=>2);
            class DummyClassFactory{
                constructor(){
                    mockedClassFactorySpy(...arguments)
                }
            }
            class Dummy extends MockedClassService{
                get MockedClassFactory(){
                    return DummyClassFactory
                }
            }
            const mockedClassService = new Dummy(()=>{});
            const result = mockedClassService.mock(2);
            
            expect(result instanceof DummyClassFactory).eq(true);
        });
    })
});

describe('MockedClassFactory' , ()=>{
    describe('get Object' , ()=>{
        it('Should return Object' , ()=>{
            expect(MockedClassFactory.prototype.Object).to.eq(Object);
        });
    });
    describe('get MockedClassFactory' , ()=>{
        it('Should return MockedClassFactory' , ()=>{
            expect(MockedClassFactory.prototype.MockedClassFactory).to.eq(MockedClassFactory);
        });
    });
    describe('#constructor' , ()=>{
        let mockedClassFactory;
        let initSpy;
        const spyFactory = ()=>{};
        const props = [];
        const spies = {};
        const target = {};
        class DummyMockedClassFactory extends MockedClassFactory{
            _init(){
                return initSpy(...arguments);
            }
        }
        beforeEach(()=>{
            initSpy = chai.spy();
            
        });
        it('Should set `spyFactory`' , ()=>{
            mockedClassFactory = new DummyMockedClassFactory(spyFactory , target , props , spies);

            expect(mockedClassFactory.spyFactory).eq(spyFactory);
        });
        it('Should call #_init' , ()=>{
            mockedClassFactory = new DummyMockedClassFactory(spyFactory , target , props , spies);

            expect(initSpy).to.be.called.with(target , props , spies);
        });
    });

    describe('#init' , ()=>{
        const props = [];
        const target = {};
        const spies = {};
        let _setSpiesAndProps;
        let getPrototypeOf;
        let mockedClassFactory;
        beforeEach(()=>{
            _setSpiesAndProps = chai.spy();
            getPrototypeOfSpy = chai.spy(()=>5);
            mockedClassFactory = {
                _init(){
                    return MockedClassFactory.prototype._init.apply(this, arguments);
                },
                _setSpiesAndProps(){
                    return _setSpiesAndProps.apply(this, arguments);
                },
                get Object(){
                    return {
                        get getPrototypeOf(){
                            return getPrototypeOfSpy; 
                        }
                    }
                }
            }
        })
        it('Should set `target` ' , ()=>{
            mockedClassFactory._init(target , props , spies)
            expect(mockedClassFactory.target).eq(target);
        });
        it('Should call #_setSpiesAndProps ' , ()=>{
            mockedClassFactory._init(target , props , spies)
            expect(_setSpiesAndProps).to.have.been.called.with(props , spies);
        });
        it('Should call Object.#getPrototypeOf set `oldProto` ' , ()=>{
            mockedClassFactory._init(target , props , spies);
            expect(getPrototypeOfSpy).to.have.been.called.with(target);
            expect(mockedClassFactory.oldProto).eq(5);
        });
    });
    describe('#_setSpiesAndProps' , ()=>{
        let props;
        let spies;
        let _setSpiesAndProps;
        let getOwnPropertyDescriptorsSpy;
        let mockedClassFactory;
        beforeEach(()=>{
            _setSpiesAndProps = chai.spy();
            getOwnPropertyDescriptorsSpy = chai.spy(()=>5);
            mockedClassFactory = {
                _setSpiesAndProps(){
                    return MockedClassFactory.prototype._setSpiesAndProps.apply(this, arguments);
                },
                get Object(){
                    return {
                        get getOwnPropertyDescriptors(){
                            return getOwnPropertyDescriptorsSpy; 
                        }
                    }
                }
            }
        });

        it('Should set `props` as is if it\'s an array' , ()=>{
            props = [];
            spies = {};
            mockedClassFactory._setSpiesAndProps(props , spies);

            expect(mockedClassFactory.props).eq(props);
        });
        it('Should set `props` and wrap value into array because it\'s a string' , ()=>{
            props = 'test';
            spies = {};
            mockedClassFactory._setSpiesAndProps(props , spies);

            expect(mockedClassFactory.props).to.be.an('array');
            expect(mockedClassFactory.props[0]).eq('test');
            expect(mockedClassFactory.props.length).eq(1);
        });
        it('Should set default empty array to `props` if none was passed' , ()=>{
            props = null;
            spies = {};
            mockedClassFactory._setSpiesAndProps(props , spies);

            expect(mockedClassFactory.props).to.be.an('array');
            expect(mockedClassFactory.props.length).eq(0);
        });
        it('Should set default empty object to `spies` if non was passed' , ()=>{
            props = null;
            spies = null;
            mockedClassFactory._setSpiesAndProps(props , spies);

            expect(mockedClassFactory._spies).to.be.an('object');
            expect(Object.keys(mockedClassFactory._spies).length).eq(0);
        });
        it('Should set object to `props` as is if defined' , ()=>{
            props = null;
            spies = {};
            mockedClassFactory._setSpiesAndProps(props , spies);

            expect(mockedClassFactory._spies).eq(spies);
        });
        it('Should call Object.#getOwnPropertyDescriptors and set `spiesDescriptor` ' , ()=>{
            props = null;
            spies = {};
            mockedClassFactory._setSpiesAndProps(props , spies);

            expect(getOwnPropertyDescriptorsSpy).to.have.been.called.with(spies);
            expect(mockedClassFactory.spiesDescriptor).eq(5);
        });
    });
    describe('#_getDescriptorTypeFromPropertyKind' , ()=>{
        it('Should return `get` for `get` ' , ()=>{
            expect(MockedClassFactory.prototype._getDescriptorTypeFromPropertyKind('get')).eq('get');
        });
        it('Should return `set` for `set` ' , ()=>{
            expect(MockedClassFactory.prototype._getDescriptorTypeFromPropertyKind('set')).eq('set');
        });
        it('Should return `value` for `value` ' , ()=>{
            expect(MockedClassFactory.prototype._getDescriptorTypeFromPropertyKind('value')).eq('value');
        });
        it('Should return `value` for `function` ' , ()=>{
            expect(MockedClassFactory.prototype._getDescriptorTypeFromPropertyKind('function')).eq('value');
        });
    });
    describe('#_getSpy' , ()=>{
        let props;
        let spies;
        let spyFactorySpy;
        let _getDescriptorTypeFromPropertyKindSpy;
        let mockedClassFactory;
        let spiesDescriptor;
        beforeEach(()=>{
            spyFactorySpy = chai.spy(()=>'test');
            _getDescriptorTypeFromPropertyKindSpy = chai.spy(()=>5);
            mockedClassFactory = {
                _getSpy(){
                    return MockedClassFactory.prototype._getSpy.apply(this, arguments);
                },
                get _getDescriptorTypeFromPropertyKind(){
                    return _getDescriptorTypeFromPropertyKindSpy
                },
                get spiesDescriptor(){
                    return spiesDescriptor
                },
                get spyFactory(){
                    return spyFactorySpy
                }
            }
        });
        it('Should call #_getDescriptorTypeFromPropertyKind' , ()=>{
            const key = 'eee';
            const kind = 'ttt';
            const value = 'asdfasdf';
            spiesDescriptor = {};

            mockedClassFactory._getSpy(key , kind , value);
            
            expect(_getDescriptorTypeFromPropertyKindSpy).to.have.been.called.with(kind);
        });
        it('Should call return spy descriptor if one defined' , ()=>{
            const key = 'eee';
            const kind = 'ttt';
            const value = 'asdfasdf';
            _getDescriptorTypeFromPropertyKindSpy = chai.spy(()=>{
                return kind
            });
            spiesDescriptor = {
                [key] : {
                    [kind] : 3
                }
            };

            const result = mockedClassFactory._getSpy(key , kind , value);
            
            expect(result).eq(3);
        });
        it('Should call #spyFactory if no spy was found' , ()=>{
            const key = 'eee';
            const kind = 'ttt';
            const value = 'asdfasdf';
            spiesDescriptor = {};

            const result = mockedClassFactory._getSpy(key , kind , value);
            
            expect(result).eq('test');
        });
    });
    describe('#_setSpyOn' , ()=>{
        let _getDescriptorTypeFromPropertyKindSpy;
        let mockedClassFactory;
        let _getSpySpy;
        beforeEach(()=>{
            _getDescriptorTypeFromPropertyKindSpy = chai.spy(()=>5);
            _getSpySpy = chai.spy(()=>4);
            mockedClassFactory = {
                _setSpyOn(){
                    return MockedClassFactory.prototype._setSpyOn.apply(this, arguments);
                },
                get _getDescriptorTypeFromPropertyKind(){
                    return _getDescriptorTypeFromPropertyKindSpy
                },
                get _getSpy(){
                    return _getSpySpy;
                }
            }
        });
        it('Should call #_getDescriptorTypeFromPropertyKind' , ()=>{
            const obj = {};
            const key = 'key';
            const kind = 'get';
            const value = ()=>{};
            mockedClassFactory._setSpyOn(obj , key , kind  ,value);

            expect(_getDescriptorTypeFromPropertyKindSpy).to.have.been.called.with(kind);
        })
        it('Should call #_getSpy' , ()=>{
            const obj = {};
            const key = 'key';
            const kind = 'get';
            const value = ()=>{};
            mockedClassFactory._setSpyOn(obj , key , kind  ,value);

            expect(_getSpySpy).to.have.been.called.with(key , kind , value);
       
        });
        it('Should set spy on both `_$spy_X` and `X` on obj' , ()=>{
            const obj = {};
            const key = 'key';
            const kind = 'get';
            const value = ()=>{};
            _getDescriptorTypeFromPropertyKindSpy = chai.spy(()=>kind);
            mockedClassFactory._setSpyOn(obj , key , kind  ,value);

            expect(obj['get']).eq(4 );
            expect(obj['_$spy_' +  kind]).eq(4 );
        });
    });
    describe('#create' , ()=>{
        let _getMockedSpy;
        let _setPrototypeOfSpy;
        let mockedClassFactory;
        beforeEach(()=>{
            _getMockedSpy = chai.spy(()=>5);
            _setPrototypeOfSpy = chai.spy(()=>4);
            mockedClassFactory = {
                create(){
                    return MockedClassFactory.prototype.create.apply(this, arguments);
                },
                get _getMocked(){
                    return _getMockedSpy
                },
                get Object(){
                    return {
                        get setPrototypeOf(){
                            return _setPrototypeOfSpy
                        }
                    };
                }
            }
        });
        it('Should call #getMocked' , ()=>{
            mockedClassFactory.create(1,2,3);

            expect(_getMockedSpy).to.have.been.called.with(1,2,3)
        });
        it('Should call Object.#setPrototypeOf if #getMocked throw' , ()=>{
            mockedClassFactory.target = 9;
            mockedClassFactory.oldProto = 12;
            _getMockedSpy = ()=>{throw new Error()};

            function shouldThrow(){
                mockedClassFactory.create(1,2,3);
            }

            expect(shouldThrow).to.throw();
            expect(_setPrototypeOfSpy).to.have.been.called.with(9,12)
     
        });
    });
    describe('#test' , ()=>{
        let MockedClassFactorySpy;
        let mockedClassFactory;
        beforeEach(()=>{
            MockedClassFactorySpy = chai.spy(()=>4);
            mockedClassFactory = {
                test(){
                    return MockedClassFactory.prototype.test.apply(this, arguments);
                },
                get MockedClassFactory(){
                    return MockedClassFactorySpy
                }
            }
            mockedClassFactory.spyFactory = ()=>{};
            mockedClassFactory.target = ()=>{};
            mockedClassFactory.props = [];
        });
        it('Should add what to props' , ()=>{
            mockedClassFactory.props.concat = chai.spy(()=>{})
            mockedClassFactory.test(1);

            expect(mockedClassFactory.props.concat).to.have.been.called();
        })
        it('Should create new MockedClassFactory' , ()=>{
            mockedClassFactory.props.concat = chai.spy(()=>1)
            mockedClassFactory.test(1);

            expect(MockedClassFactorySpy).to.have.been.called.with(
                mockedClassFactory.spyFactory , 
                mockedClassFactory.target,
                1,
                mockedClassFactory.spies
            );
        });
        it('Should making sure props will not be added undefined' , ()=>{
            mockedClassFactory.props.concat = chai.spy();
            mockedClassFactory.test(1);

            expect(mockedClassFactory.props.concat).to.not.be.called.with(undefined);
        });
    });
    describe('#spies' , ()=>{
        let MockedClassFactorySpy;
        let mockedClassFactory;
        beforeEach(()=>{
            MockedClassFactorySpy = chai.spy(()=>4);
            mockedClassFactory = {
                spies(){
                    return MockedClassFactory.prototype.spies.apply(this, arguments);
                },
                get MockedClassFactory(){
                    return MockedClassFactorySpy
                }
            }
            mockedClassFactory.spyFactory = ()=>{};
            mockedClassFactory.target = ()=>{};
            mockedClassFactory.props = [];
        });
        it('Should merge both spies objects',()=>{
            let mergeResult;
            mockedClassFactory._spies = {
                "key1" : "v1_1",
                "key2" : "v2_1"
            };
            MockedClassFactorySpy = chai.spy((spyF ,target, props , obj)=>{
                mergeResult = obj;
            })
            mockedClassFactory.spies({
                "key1" : "v1_2",
                "key3" : "v3_1"
            })
            
            expect(mergeResult.key1).eq("v1_2")
            expect(mergeResult.key2).eq("v2_1")
            expect(mergeResult.key3).eq("v3_1")
        });
        it('Should create new MockedClassFactory' , ()=>{
            mockedClassFactory._spies = {}
            
            mockedClassFactory.spies(1);

            expect(MockedClassFactorySpy).to.have.been.called.with(
                mockedClassFactory.spyFactory , 
                mockedClassFactory.target,
                mockedClassFactory.props,
                mockedClassFactory._spies
            );
        });
    });
    describe('#_isClassInherit' , ()=>{
        let ChildInherit;
        let Child;
        let Parent;
        let mockedClassFactory;
        beforeEach(()=>{
            class ParentT{

            }
            class ChildInheritT extends ParentT{

            }
            class ChildT{

            }
            Parent = ParentT;
            Child = ChildT;
            ChildInherit = ChildInheritT;
            mockedClassFactory = {
                _isClassInherit(){
                    return MockedClassFactory.prototype._isClassInherit.apply(this, arguments);
                }
            }
        })
        it('Should identify if class inherit' , ()=>{
            expect(
                mockedClassFactory._isClassInherit(
                    Object.getOwnPropertyDescriptors(Child),
                    ChildInherit
                )
            ).eq(true)
        });
        it('Should identify if class dont inherit' , ()=>{
            expect(
                mockedClassFactory._isClassInherit(
                    Object.getOwnPropertyDescriptors(Child),
                    Child
                )
            ).eq(false)
        });
    });
    describe('#_getMocked' , ()=>{
        let container;
        let mockedClassFactory;
        beforeEach(()=>{
            container = {
                MockedTargetSpy : chai.spy(),
                getPrototypeOfSpy : chai.spy(),
                getOwnPropertyDescriptorsSpy : chai.spy(),
                definePropertiesSpy : chai.spy(),
                setPrototypeOfSpy : chai.spy(),
                _isClassInheritSpy : chai.spy(),
                _getSpySpy : chai.spy(),
                _replaceWithSpiesSpy : chai.spy(),
                _createClassSpy : chai.spy((()=>{
                    class MockedTargetDummy{};
                    return MockedTargetDummy;
                })),
                _copyProtoAndReplaceSpiesSpy : chai.spy(),
                _exportTargetSpiesSpy : chai.spy(),
            }
            mockedClassFactory = {
                _getMocked(){
                    return MockedClassFactory.prototype._getMocked.apply(this,arguments);
                },
                get Object(){
                    return {
                        getPrototypeOf : container.getPrototypeOfSpy,
                        getOwnPropertyDescriptors : container.getOwnPropertyDescriptorsSpy,
                        defineProperties : container.definePropertiesSpy,
                        setPrototypeOf : container.setPrototypeOfSpy,
                    }
                }
                ,get _isClassInherit(){
                    return container._isClassInheritSpy;
                }
                ,get _getSpy(){
                    return container._getSpySpy;
                }
                ,get _replaceWithSpies(){
                    return container._replaceWithSpiesSpy;
                }
                ,get _createClass(){
                    return container._createClassSpy;
                }
                ,get _copyProtoAndReplaceSpies(){
                    return container._copyProtoAndReplaceSpiesSpy;
                },
                get _exportTargetSpies(){
                    return container._exportTargetSpiesSpy;
                },
            }
            mockedClassFactory.props = [];
            mockedClassFactory.target = {};
            mockedClassFactory.oldProto = {};

        })
        it('Should call Object.#getOwnPropertyDescriptors with `oldProto`' , ()=>{
            mockedClassFactory._getMocked();
            expect(container.getOwnPropertyDescriptorsSpy).to.have.been.called.with(mockedClassFactory.oldProto);
        });
        it('Should call Object.#getOwnPropertyDescriptors with `target`',()=>{
            mockedClassFactory._getMocked();
            expect(container.getOwnPropertyDescriptorsSpy).to.have.been.called.with(mockedClassFactory.target);
        });
        it('Should call _isClassInherit',()=>{
            const targetClassDescriptors = {};
            container.getOwnPropertyDescriptorsSpy = chai.spy((i)=>{
                if (i==mockedClassFactory.target)
                    return targetClassDescriptors
            })
            mockedClassFactory._getMocked();
            expect(container._isClassInheritSpy).to.have.been.called.with(targetClassDescriptors,mockedClassFactory.target);
        });
        it('Should get `super` spy only if there is inheritence' , ()=>{
            container._isClassInheritSpy = chai.spy(()=>true);

            mockedClassFactory._getMocked()

            expect(container._getSpySpy).to.have.been.called.with('super' , 'function');
        });
        it('Shouldn\'t get `super` spy if there is no inheritence' , ()=>{
            container._isClassInheritSpy = chai.spy(()=>false);

            mockedClassFactory._getMocked()

            expect(container._getSpySpy).to.not.have.been.with('super' , 'function');
        });
        it('Should have SuperClass proto to be copied from the parent class' , ()=>{
            const oldProtoDescriptors = {};
            const overideParent = {};
            let superClassProto;
            container._isClassInheritSpy = chai.spy(()=>true);
            container.getOwnPropertyDescriptorsSpy = chai.spy((i)=>{
                if (i==mockedClassFactory.oldProto)
                    return oldProtoDescriptors
            });
            container._replaceWithSpies = chai.spy((i)=>{
                if (i==oldProtoDescriptors)
                    return overideParent
            });
            container.definePropertiesSpy = chai.spy((t,i)=>{
                if (i==overideParent)
                    return superClassProto = t;
            });

            mockedClassFactory._getMocked()

            expect(container.definePropertiesSpy).to.have.been.with(superClassProto , overideParent);
        });
        it('Should overide the target proto to the SuperClass ' , ()=>{
            let superClass = {};
            const overideParent = {};

            container._replaceWithSpies = chai.spy((i)=>{
                if (i==oldProtoDescriptors)
                    return overideParent
            });
            container.definePropertiesSpy = chai.spy((t,i)=>{
                if (i==overideParent)
                    return superClassProto = t.value.constructor;
            });

            mockedClassFactory._getMocked()

            expect(container.setPrototypeOfSpy).to.have.been.with(mockedClassFactory.target , superClass);
        });
        it('Should set user `constructor` only when asked' , ()=>{
            const constructorSpy = {};
            mockedClassFactory.props = ['constructor'];
            container._getSpySpy = chai.spy(()=>{
                return constructorSpy
            })
            mockedClassFactory._getMocked();

            expect(container._getSpySpy).to.not.have.been.called();
            expect(mockedClassFactory._createClass).to.have.been.called.with(mockedClassFactory.target)
        });
        it('Should set user `constructor` to a spy' , ()=>{
            const constructorSpy = {};
            mockedClassFactory.props = [];
            container._getSpySpy = chai.spy(()=>{
                return constructorSpy
            })
            mockedClassFactory._getMocked();

            expect(container._getSpySpy).to.have.been.called();
            expect(mockedClassFactory._createClass).to.have.been.called.with(mockedClassFactory.target , constructorSpy)
        });
        it('Should call #copyProtoAndReplaceSpies with target' , ()=>{
            });
        it('Should defineProto of MockedTarget' , ()=>{
            const MockedTarget = chai.spy();
            MockedTarget.prototype = {};
            const spiedProto = {};
            container._createClassSpy = chai.spy(()=>{
                return MockedTarget;
            });
            container._copyProtoAndReplaceSpiesSpy = chai.spy(()=>{
                return spiedProto;
            })
            
            mockedClassFactory._getMocked();
            expect(container._copyProtoAndReplaceSpiesSpy).to.have.been.called.with(mockedClassFactory.target);
            expect(container.definePropertiesSpy).to.have.been.called.with(MockedTarget.prototype , spiedProto);
        });
        it('Should revert the proto of the target to the original one' , ()=>{
            mockedClassFactory._getMocked();

            expect(container.setPrototypeOfSpy).to.have.been.called.with(mockedClassFactory.target , mockedClassFactory.oldProto)
        });
        it('Should create targetMocked with arguments' , ()=>{
            const MockedTarget = chai.spy();
            MockedTarget.prototype = {};
            const spiedProto = {};
            container._createClassSpy = chai.spy(()=>{
                return MockedTarget;
            });
            container._copyProtoAndReplaceSpiesSpy = chai.spy(()=>{
                return spiedProto;
            })
            
            mockedClassFactory._getMocked(1,2);

            expect(MockedTarget).to.have.been.called.with(1,2);
       
        });
        it('Should call #_exportTargetSpies and return both `spies` and `instance`' , ()=>{
            const MockedTarget = chai.spy();
            MockedTarget.prototype = {};
            const spiedProto = {};
            container._createClassSpy = chai.spy(()=>{
                return MockedTarget;
            });
            container._copyProtoAndReplaceSpiesSpy = chai.spy(()=>{
                return spiedProto;
            })

            const spies = {};
            container._exportTargetSpiesSpy = chai.spy(()=>spies);

            const result = mockedClassFactory._getMocked();

            expect(result.spies).eq(spies)
            expect(result.instance instanceof MockedTarget).eq(true)
        });
        describe('#_createClass' , ()=>{
            it('Should have spy in container and no inheritance' , ()=>{
                class TargetMock{

                }
                const spy = chai.spy(()=>{});
                const result = MockedClassFactory.prototype._createClass(TargetMock , spy);

                new result()

                expect(spy).to.have.been.called()
                expect(Object.getPrototypeOf(result)).not.eq(TargetMock);
            });
            it('Shouldn\'t have spy in container and with inheritance' , ()=>{
                const spy = chai.spy(()=>{});
                class TargetMock{
                    constructor(){
                        spy();
                    }
                }
                const result = MockedClassFactory.prototype._createClass(TargetMock , null);

                new result()

                expect(spy).to.have.been.called()
                expect(Object.getPrototypeOf(result) ).eq(TargetMock);
            });
        });
    });
    describe('#_exportTargetSpies' , ()=>{
       it('Should take only spies and change thier name to something more public' , ()=>{
            const spy = chai.spy();
            const spiedProto = {
                'prop' : {
                    configurable:true,
                    blabla : false,
                    _$spy_value : spy
                }
            };

            const result = MockedClassFactory.prototype._exportTargetSpies(spiedProto);

            expect(result.prop_value).eq(spy);
            expect(Object.keys(result).length).eq(1);
       })
    });
    describe('#_copyProtoAndReplaceSpies' , ()=>{
        let getOwnPropertyDescriptorsSpy;
        let props;
        let Target;
        let targetFields;
        let spiedProto;
        beforeEach(()=>{
            getOwnPropertyDescriptorsSpy = chai.spy(()=>targetFields);
            _replaceWithSpiesSpy = chai.spy(()=>spiedProto);
            props = [];
            class TargetT{

            }
            targetFields = {};
            spiedProto = {};
            Target = TargetT;
            mockedClassFactory = {
                _copyProtoAndReplaceSpies(){
                    return MockedClassFactory.prototype._copyProtoAndReplaceSpies.apply(this,arguments);
                },
                get props(){
                    return props
                },
                get _replaceWithSpies(){
                    return _replaceWithSpiesSpy;
                },
                get Object(){
                    return {
                        get getOwnPropertyDescriptors(){
                            return getOwnPropertyDescriptorsSpy; 
                        }
                    }
                }
            };
        })
        it('Should call Object.#getOwnPropertyDescriptors with target prototype' , ()=>{
            mockedClassFactory._copyProtoAndReplaceSpies(Target);

            expect(getOwnPropertyDescriptorsSpy).to.have.been.called.with(Target.prototype);
        });
        it('Should call _replaceWithSpies with target fields' , ()=>{
            mockedClassFactory._copyProtoAndReplaceSpies(Target);

            expect(_replaceWithSpiesSpy).to.have.been.called.with(targetFields);
        });
        it('Should set targetFields fields to spiedProto' , ()=>{
            targetFields = {
                'key1' : '1_v1',
                'key2' : '2_v1',
                'key4' : '4_v1'
            }
            spiedProto = {
                'key1' : '1_v2',
                'key3' : '3_v1'
            }
            props = ['key4'];
            const result = mockedClassFactory._copyProtoAndReplaceSpies(Target);

            expect(Object.keys(result).length).eq(3);
            expect(result['key1']).eq('1_v2');
            expect(result['key4']).eq('4_v1');
            expect(result['key3']).eq('3_v1');
        
        });
    });
    describe('#_replaceWithSpies' , ()=>{
        it('Should change getter setter values and functions to spies' , ()=>{
            const func = chai.spy();
            const setsObj = {};
            const _setSpyOn = chai.spy((forMerge , key , kind , value)=>{
                if (!setsObj[key])
                    setsObj[key] = {};
                setsObj[key][kind] = value;
            });
            const mockedClassFactory = {
                _setSpyOn,
                _replaceWithSpies(){
                    return MockedClassFactory.prototype._replaceWithSpies.apply(this,arguments);
                },
                get Object(){
                    return Object;
                }
            }
            const obj = {
                'prop1' : {
                    'get' : 'getv',
                    'set' : 'setv',
                },
                'prop' :{
                    writable : true,
                    value : 'valuev'
                },
                'func' : {
                    value : func
                }
            }
            mockedClassFactory._replaceWithSpies(obj);

            expect(_setSpyOn).to.have.been.called();
            expect(setsObj.func.function).to.eq(obj.func.value);
            expect(setsObj.prop1.get).to.eq('getv');
            expect(setsObj.prop1.set).to.eq('setv');
            expect(setsObj.prop.get).to.eq('valuev');
            expect(setsObj.prop.writable).to.eq(undefined);
            expect(setsObj.prop.value).to.eq(undefined);
        })
    });
});
