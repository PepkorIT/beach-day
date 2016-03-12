var JasmineAsyncEnv = function(){
    this.failed = false;
};

JasmineAsyncEnv.prototype.wrap = function(cb){
    var self = this;

    return function(done){
        self.done = done;
        if (self.failed === true){
            done();
        }
        else{
            cb(self);
        }
    }
};

module.exports = JasmineAsyncEnv;