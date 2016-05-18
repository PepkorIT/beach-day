##How do I setup a beach-day project in TypeScript?
Luckily the beach-day module has been entirely written in typescript so this is reasonably easy. 

All the required .d.ts files used to describe beach-day are included in the npm package so all you need to do is just point your tsconfig.json to the .d.ts files in your installed npm package.

If you are not already using it I suggest you take a look at [tsconfig-glob](https://github.com/wjohnsto/tsconfig-glob). Its a great little utility to help manage tsconfig files using glob patterns.

beach-day includes some other typings dependencies that will need to be installed and linked in your tsconfig.json for your project to compile.
I suggest you use the current industry standard for managing external [typings](https://github.com/typings/typings) as it will make your life a lot easier.
The dependencies are:
lodash, form-data, jasmine, node, request, request.

**Note:**
If your compiler is still moaning about missing dependencies please check the typings.json file, in the root of this repository, to make sure you have of all the dependencies, this documentation could possibly be out of date.