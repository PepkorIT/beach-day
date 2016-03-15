export class JasmineAsyncEnv{

    public failed:boolean = false;
    public done:() => void;

    public wrap(cb:(env:JasmineAsyncEnv) => void):(done) => void {

        return (done) => {
            this.done = done;
            if (this.failed === true){
                done();
            }
            else{
                cb(this);
            }
        }
    }
}