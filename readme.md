# beach-day
beach-day is an npm module designed to make HTTP based API integration testing easy and fun for both sides of the fence (front end & backend).
It was inspired by a lack of mature tools in the current ecosystem and a few projects that attempt to make this possible, namely [frisby](http://frisbyjs.com/) and [Postman](https://www.getpostman.com/).

At it's core, beach-day is a custom [jasmine reporter](http://jasmine.github.io/2.4/custom_reporter.html) that generates an HTML file of the tests that ran. This reporter makes it easy to see all the details about an HTTP call so errors can easily be debugged.
In addition to the reporter there is a config and utility system that makes it fast and simple to write functional HTTP tests.

## Documentation
#### [Getting started guide](docs/getting-started/step1.md)

#### Full API Documentation
This is pending github pages to be able to host. Otherwise is available [here](docs/api-reference/typedoc/)

#### [FAQ](docs/faq/index.md)