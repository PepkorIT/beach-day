# beach-day
beach-day is an npm module designed to make HTTP based API integration testing easy and fun for both sides of the fence (front end & backend).
It was inspired by a lack of mature tools in the current ecosystem and a few projects that attempt to make this possible, namely [frisby](http://frisbyjs.com/) and [Postman](https://www.getpostman.com/).

## What is beach-day?
Beach day is at its core, a custom [jasmine reporter](http://jasmine.github.io/2.4/custom_reporter.html) that generates an HTML file of the tests that ran.
Essentially the beach-day module can be used solely as a custom jasmine reporter and will work. 
In addition to the reporter there is a config and utility system that makes it fast and simple to write functional HTTP tests.

## Documentation
[Getting started guide](src/master/docs/getting-started-step1.md)
API Documentation