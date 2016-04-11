describe("Demo 1 - Using the reporter", function(){

    // Simple test data
    var world = {status:"all well"};

    // Basic test 1, should pass
    it("Ensure the world exists", function(){
        expect(world).toBeDefined();
    });

    // Basic test 2 should also pass
    it("Ensure all is well in the world", function(){
        expect(world.status).toBe("all well");
    });
});