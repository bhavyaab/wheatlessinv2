# wheatlessinv2

### Overview
 -  This RESTful API provides the necessary back-end infrastructure and functionality to create, read, update and delete menu for guletin free food.
 - All menu needed to be field out form the resturents or food provider. It is supposed to meanually upload the image of menue.

### Current Version (2.0.0)
 - The current version of this program is designed to create, read, update, delete and return menus using pics.

### Future Releases
 - V 3.0.0 scheduled for 08/18/2018 will include the following enhancements:
 - give user signIn
 - store user guletin status and show their prefferances.  

### Ways to contribute
 - Reporting Bugs: Open up an issue through this git repository and select "bug" as the label
 - Recommending Enhancements: Open up an issue through this git repository and select "enhancement" as the label
 - Issues are reviewed weekly
 
### Architecture
This API is structured on a Model View Controller(MVC) architecture pattern. The base technologies are node.js server, node.http module, express middleware, and a mongo database. This architecture is currently deployed in a two tier environment(staging, production), leveraging the heroku platform.

 - **Middleware**: auth-middleware, bearer-middleware, error-middleware
 - **View**:
 - **Controller**: auth-router, pic-router, bizrouter
 - **Model**: biz, menu, pic, user
****
#Schema
*****
#Routes
###POST
###GET
###PUT
###DELETE
****
#Testing
###Testing Framework
mocha test runner  
chai (expect)  
bluebird promise library
###Continuous Integration
travis-ci
###Coveralls
