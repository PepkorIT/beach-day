import {setCurrentEnvironment} from "../reporter/BeachDayReporter";

export class JasmineAsyncEnv{
    public failed:boolean = false;
    public done:() => void;

    public wrap(cb:(env:JasmineAsyncEnv) => void):(done) => void {
        var env = this;

        return function(done)  {
            setCurrentEnvironment(env);

            var self = this;
            env.done = function(){
                // hook to do stuff when complete
                done();
            };
            if (env.failed === true){
                jasmine.addMatchers({
                    toBePassing: function(util, customEqualityTesters){
                        return {
                            compare: function(actual:JasmineAsyncEnv){
                                return {
                                    pass    : !actual.failed,
                                    message : "Expected all previous tests to have passed"
                                }
                            }
                        };
                    }
                });
                expect(env).toBePassing();
                done();
            }
            else{
                cb(env);
            }
        }
    }
}