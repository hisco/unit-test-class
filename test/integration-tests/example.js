const chai = require('chai');
chai.use(require('chai-spies'));
const expect = chai.expect;

const {MockedClassService} = require('../../src/index');

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
})