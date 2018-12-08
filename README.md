# Unit test class

[![Greenkeeper badge](https://badges.greenkeeper.io/hisco/unit-test-class.svg)](https://greenkeeper.io/)

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

  Easy mock your es6 + classes.

Unit tests classes was created from a great conflict, the desire to create great stuff with great tests coverage VS the time invested to unit testing classes.

Unit test definition from Wiki:
`Intuitively, one can view a unit as the smallest testable part of an application. In procedural programming, a unit could be an entire module, but it is more commonly an individual function or procedure. In object-oriented programming, a unit is often an entire interface, such as a class, but could be an individual method.`

Unit test class module addresses the last part `could be an individual method`.

This module is completely framework agnostic and was build without any framework dependencies, to make sure you can use all of these cool frameworks:
  * Jasmine
  * Mocha
  * AVA
  * Tape
  * Jest
  * Sinon
  * And more!

## Test faster
Writing unit-test taked a lot of time.
Mainlly because we need to re-create isolated scenarios where we can test the smallest parts.
"Unit test class" - is here to help by removing all the tedious boilerplate code from your unit tests.

## Test better
It's sometimes very difficult to gain total isolation to the unit your testing.
Therefore, it's very common and wrong some developers chose to test a method by not noticing it's inflaunced by the other method result _They have creted an integration test, not unit test_ .

##Api

###TL;DR
```js
//You have a class

class YourClass{
    constructor(name){
        this._name = name;
    }
    get myName(){
        return `My name is ${this._name}`
    }
    hi(userName){
        if (userName)
            this.log(`Hi ${userName},${this.myName}`);
        else
            this.log('Hi, What\'s you name?')
    }
    log(string){
        console.log(string)
    }
}
//You can test it like that
const chai = require('chai');
chai.use(require('chai-spies'));
const expect = chai.expect;

const {MockedClassService} = require('unit-test-class');

const mockService = new MockedClassService(chai.spy);
describe('YourClass' , ()=>{
    const YourClassFactory = mockService.mock(YourClass);
    let mockView;
    describe('#hi' , ()=>{
        let getMyName;
        beforeEach(()=>{
            getMyName = chai.spy(()=>'myName');
            mockView = YourClassFactory.test('hi').spies({
                    get myName(){
                        return getMyName();
                    }
                })
                .create();
            
        })
        it('Should log with user name' , ()=>{
            const {instance , spies} = mockView;

            instance.hi('bob'); 

            //Spy on a getter
            expect(getMyName).to.have.been.called();

            //Spy on internal method
            expect(instance.log).to.have.been.called.with('Hi bob,myName');
            //OR alterntivally
            expect(spies.log_function).to.have.been.called.with('Hi bob,myName');
        })
        it('Should ask user name' , ()=>{
            const {instance , spies} = mockView;

            instance.hi(); 

            //Spy on a getter
            expect(getMyName).to.not.have.been.called();

            //Spy on internal method
            expect(instance.log).to.have.been.called.with('Hi, What\'s you name?');
            //OR alterntivally
            expect(spies.log_function).to.have.been.called.with('Hi, What\'s you name?');
        })
    })
});
```

### MockedClassService
An intance of MockedClassService will create for us a mockFactory.

MockedClassService accepts only one variable `SpyFactory` which is a method that returns a spy, the implemantion is very specific to the framework your are using.

This is an example with using chai spies module
```js
const chai = require('chai');
chai.use(require('chai-spies'));
const mockService = new MockedClassService(chai.spy);
```
It is not required to initialize this service more than once.
However, it's not harmful - so do what's more comfortable for you.

#### mock()
This is the only method you should use on `MockedClassService`.
It returns a `MockedClassFactory`.
```js
    const mockFactory = mockService.mock(/*..Class you will be testing..*/);
```
You should call it once per class.
However, it's not harmful to call it more - so do what's more comfortable for you.

### MockedClassFactory
An instance of MockedClassFactory wraps you original class and will be able to create mocked instance per call.

You should not initilize it your self - you should be geting this from the mock service by calling `mockSerive.mock(/*..Class you will be testing..*/)`.

#### test()
This is a chinable method that returns a new MockedClassFactory instance.

This method accepts both single string and array with multiple strings, these are the keys of the class you are planing to test!
Meaning that these keys are the only ones that won't be mocked.

This method only creates a new MockedClassFactory instance, pre-configured with the new configuration.

```js
mockFactory.test('constructor');
//Or...
mockFactory.test(['constructor' , 'method' , 'property']);
```

Important!
When your class extends a different parent class.
Your mocked class will extend a mocked class.
Meanining the original constructor will not run, instead a 'SuperSpy' consturctor will run.

This will help you to make sure you class is calling the super consturctor as it should - again something that will require a lot of boilerplate code with this module.

```js
class Parent{
        constructor(i){
           /*
            When testing class Child in some cases you don't want to 
            start the construction of the Parent class.
            Warning! 
            You should remeber to do also integration tests.
            With these you must test the full integration of Child and Parent.
           */
        }
    }
    class Child extends Parent{
        constructor(i){
            super(i+1);
        }
    }
    const mockService = new MockedClassService(chai.spy);
    const mockFactory = mockService.mock(Child);
    const mockView = mockFactory.test('constructor').create(1);
    expect(mockView.spies.super).to.have.been.called.with(2);
```
#### spies()
This is a chinable method that returns a new MockedClassFactory instance.
With a new instance created the module will put spies instead of the original methods and properties.
Sometimes you will need to create a custome spy, this method let's you setup these special spies.

This method accepts a single object.
The keys are the method/property names you want to be setup with the sepcial spy.
The values are these special spies.

This method only creates a new MockedClassFactory instance, pre-configured with the new configuration.

```js
mockFactory.spies({
    method : chai.spy(()=>"from test"),
    property : chai.spy(()=>"from test")
});
```

#### create()
This method creates a new mockView instance.
On it you will find your mocked instance and spies as key/value.

It accepts any arugments and will forward these to your class costructor as is.
```js
const mockView = mockFactory.test('method').create(1,2);
const myInstance = mockView.instance;
const spies = mockView.spies;

myInstance.method();

//If it's a function you can access it's spy like this
expect(myInstance.otherMethod).to.have.been.called();
//Or...
expect(spies.otherMethod_function).to.have.been.called();

/*If it's a property will replace it with a getter/setter
* Because of the nature of getter/setter you will only
* be able to use it from the spies object
*/
expect(spies.name_get).to.have.been.called.with('some_value');

```
Few things you should know
  * spies object as a strict covention:
     * functions will be defined as `${name}_function`.
     * value will be switched to getter/setter.
     * getters/setters will be defined as `${name}_get` and `${name}_set`.


##Examples
### Test a mothod without constructor
A common mistake when trying to tese method `method` of the following class.
```js
class TestMe extends Something{
    constructor(options){
        super(options);
        this.somethingVeryRelatedToOptions(options);
        this.method(options.ping);
    }
    somethingVeryRelatedToOptions(options){
        /..Some code../
    }
    method(ping){
        if (ping == 'ping')
            this.pong = 'pong';
    }
}
```
The mistake would be to
```js
const testMe = new TestMe({/*..A lot of config..*/});
testMe.method('ping');
expect(testMe.pong).to.equal('pong');
```
Notice the when testing `method`:
  * we have also tested `somethingVeryRelatedToOptions` logic.
  * The `Something` class constructor and who knows we have got there...

This mistake will make the unit tests very breakable as a change in one of `Something` or `somethingVeryRelatedToOptions` will make all our tests fail.

There are a lot of approaches to this correctly, while I have nothing against, these, these just take way more time mocking the required methods and greater developer proficiency.

This module will make it much easier for you
```js
const mockService = new MockedClassService(chai.spy);// A service could be defined once...
const mockFactory = mockService.mock(TestMe);// A factory could be defined once per class
const testMe = mockView.instance;
testMe.method('ping');
expect(testMe.pong).to.equal('pong')
```
And a full test case example with Chai and chai spies
```js
const mockService = new MockedClassService(chai.spy); // A service could be defined once...

describe('TestMe - example with chai' , ()=>{
    let mockFactory = mockService.mock(TestMe); // A factory could be defined once per class
    describe('#constructor' , ()=>{
        const options = {};
        const mock = mockFactory.test('constructor').create(options);
        expect(
            mock.spies.somethingVeryRelatedToOptions_function
        ).to.have.been.called.with(options)
    })
    describe('#method' , ()=>{
        let mockView;
        let testMe;
        beforeEach(()=>{
            mockView = mockFactory.test('method').create({});
            testMe = mockView.instance;
        })
        it('Should set `pong` if given `ping`' , ()=>{
            testMe.method('ping');
            expect(testMe.pong).to.equal('pong')
        })
        it('Shouldn\'t set `pong` if not given `ping`' , ()=>{
            testMe.method('dsfsdf');
            expect(testMe.pong).to.not.equal('pong')
        })   
    });
})
```
### Better support for TypeScript projects
```ts
const mockService = new MockedClassService(chai.spy);// A service could be defined once...
const mockFactory = mockService.mock<TestMe>(TestMe);// A factory could be defined once per class
const testMe = mockView.instance;
//Notice that both `pong` property and method `method` are recognized by TypeScript
testMe.method('ping');
expect(testMe.pong).to.equal('pong')
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/unit-test-class.svg
[npm-url]: https://npmjs.org/package/unit-test-class
[travis-image]: https://img.shields.io/travis/hisco/unit-test-class/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/hisco/unit-test-class
[coveralls-image]: https://coveralls.io/repos/github/hisco/unit-test-class/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/hisco/unit-test-class?branch=master
