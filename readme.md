# beach-day
beach-day is an npm module designed to make HTTP based API integration testing easy and fun for both sides of the fence (front end & backend).
It was inspired by a lack of mature tools in the current ecosystem and a few projects that attempt to make this possible, namely [frisby](http://frisbyjs.com/) and [Postman](https://www.getpostman.com/).

## What is beach-day?
Beach day is at its core, a custom [jasmine reporter](http://jasmine.github.io/2.4/custom_reporter.html) that generates an HTML file of the tests that ran. This reporter makes it easy to see all the details about an HTTP call so errors can easily be debugged.
In addition to the reporter there is a config and utility system that makes it fast and simple to write functional HTTP tests.

## Documentation
#### [Getting started guide](docs/getting-started/step1.md)  

#### [FAQ](docs/faq/index.md) 

#### API Documentation
Full API documentation can be found in all the source files in the form of jsdoc and is built to the docs/api-reference folder. It will need to be served by a web server to view.