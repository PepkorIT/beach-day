import {setCurrentEnvironment} from "../reporter/BeachDayReporter";

export class JasmineAsyncEnv{
    public failed:boolean = false;
    public done:() => void;

    constructor(){
        beforeAll(function(){
            jasmine.addMatchers({
                toBePassing: function(util, customEqualityTesters){
                    return {
                        compare: function(actual:JasmineAsyncEnv){
                            return {
                                pass    : !actual.failed,
                                message : "Expected the environment to be in a passing state"
                            }
                        }
                    };
                }
            });
        });
    }

    public wrap(cb:(env:JasmineAsyncEnv) => void):(done) => void {
        var env = this;

        setCurrentEnvironment(this);

        return function(done)  {
            var self = this;
            env.done = function(){
                // hook to do stuff when complete
                done();
            };
            if (env.failed === true){
                expect(env).toBePassing();
                done();
            }
            else{
                cb(env);
            }
        }
    }
}