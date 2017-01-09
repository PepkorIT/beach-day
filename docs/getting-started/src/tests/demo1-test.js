describe("Demo 1 - Using the reporter", function(){
    var world = {status:"all well"};

    it("Ensure the world exists", function(){
        expect(world).toBeDefined();
    });
});