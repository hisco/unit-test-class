
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-spies'));

const {MockedClassService , MockedClassFactory} = require('../../src/index');

class TestMe{
    constructor(options){
        this.somethingVeryRelatedToOptions(options);
        this.method(options.ping)
    }
    somethingVeryRelatedToOptions(options){
        /..Some code../
    }
    method(ping){
        if (ping == 'ping')
            this.pong = 'pong';
    }
}


const mockService = new MockedClassService(chai.spy);
describe('common tests' , ()=>{
    const mockFactory = mockService.mock(TestMe);
    describe('#constructor' , ()=>{
        const options = {};
        const mock = mockFactory.test('constructor').create(options);
        expect(
            mock.spies.somethingVeryRelatedToOptions_function
        ).to.have.been.called.with(options);
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
        });
        it('Should\'t call somethingVeryRelatedToOptions' , ()=>{
            testMe.method('sdf');
            expect(testMe.somethingVeryRelatedToOptions).to.have.not.been.called();
        })  
    });
})
describe('super constructor' , ()=>{
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
})