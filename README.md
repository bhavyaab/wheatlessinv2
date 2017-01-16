# wheatlessinv2

### Overview
 -  Wheatlessin is a RESTful API that provides back-end infrastructure and functionality to create, read and delete resources. The end product will be a web and mobile site that helps people discover gluten free food.
 - Restaurant owners can register an account and add details about their gluten-free offerings, including a picture of their menu.

### Current Version (2.0.0)
 - The current version of this program is designed to create, read, update, delete these resources:
 1. Users
 2. Businesses, which are owned by Users
 3. Menus for each Business
 4. Images of each menu

### Future Releases
 - Version 2.5.0 has a scheduled release on February 2017 which will include the following enhancements:
 - complete front end makeover
 - give user signIn
 - store user's gluten free status  


### Ways to contribute
 - Report Bugs: Open up an issue through this git repository and select "bug" as the label
 - Recommending Enhancements: Open up an issue through this git repository and select "enhancement" as the label
 - Issues will be reviewed weekly


### Architecture
This API is structured on a Middleware (Authentication and Error catching), Model (Schema), and Router pattern. The base technologies are running on a node.js server, node.http module, express middleware, AWS and a mongo database. This architecture is currently deployed in a two tier environment (staging & production), leveraging the heroku platform.

  **Middleware**:
 - The express router middleware provides base routing capability.
 - A custom handle-errors module implements and extends the http-errors npm middleware package.
 - An auth middleware module leverages two npm modules (bcryptjs, jsonwebtoken) and node.crypto module to provide user sign-up and user sign-in functionality, this includes business authentication/authorization which allows business user's to post their menus.
 - The mongoose npm module is used for interaction with the mongo database.
 - AWS is used to store image data and mongoose stores only the reference object (image URI) for server efficiency.

**Model**:
 - Wheatlessin current resources (user, biz, pic, menu) are mongoose Schemas and have dedicated router files located in the route folder. In addition to providing an interface to the pubic user, these files provide modularity.
 - For details about the input and output of routes, see the Routes section below.

**Router**:
 - Our resources (user, biz, menu, pics) have dedicated router files. These files are the interface between the server, middleware, model files, and databases (mongo and AWS). When a request is made, router calls the necessary functions to interact with the model. This returns a response to the route once a request has been processed in the model also parsing the json content in the incoming request (where applicable) and create and populate a req.body property using the npm package parse-body.

# Routes
### POST:
Example:  

 **User Signup**  POST http://wheatlessinv2.herokuapp.com/api/signup


Required Data: Provide username, password, email as JSON

This route will create a new user by providing a username, password, and email in the body of the request. Creating a new user is required to store and access data later. This route must be completed before attempting to use the api/signin route.

Example request:
```  
http POST wheatlessinv2.herokuapp.com/api/signup username='test-user' password='test-pwd' email='testemail@test.com'
```
Example response:
```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 205
Content-Type: text/html; charset=utf-8
Date: Wed, 11 Jan 2017 19:29:17 GMT
ETag: W/"cd-8A+12QvEbq7/QhA66gx6Yg"
X-Powered-By: Express

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjczMzIyNGUwNjc4ZDE2MWE0YzhkNTU4ZjBmZGUwYTJhNGFkYzYxZDBlNGY3YmU0MGU1YTFhMTkzYmQ3MWM0ZjMiLCJpYXQiOjE0ODQxNjI5NTd9.YSbRREgNdCxpRYJDk6BTVEptu0OUXvIvCFDvbzqkx9w
```

A token will be returned that will only be used for the api/signin route. After sign-in, you will receive a new token that will be a reference for all future routes.
___
**Biz Post**
Example:https://wheatlessinv2.herokuapp.com/api/biz

Required Data:

Business Name and EIN number is the minimum required parameter for signup.
This route will authenticate the user and post a business that contains these required parameters.


Authorization Header
Bearer <response token from signin> will return in JSON format once a user's token is verified. The response will contain the business information that was originally provided by the business owner.

 Example request:
```
http POST wheatlessinv2.herokuapp.com/api/biz Authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImFjM2RlYjNlODE1ZWNkY2NkZjBjMzU1NWRkNDQxNzI3NThkZWU1ZDFhZTRiNmQ0MDFiYzEyZWJmMTJlOTRiNzgiLCJpYXQiOjE0ODQxNjMzNzV9.dnkS7g3HutqyFVftrNoR_z2ks9lGD38voE-td8WgN5I' EIN='12-3456789' name='myBiz_name'
```
Example response:
```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 154
Content-Type: application/json; charset=utf-8
Date: Wed, 11 Jan 2017 19:55:09 GMT
ETag: W/"9a-6CbR3bRyyolYQV0B7+YlHw"
X-Powered-By: Express

{
    "EIN": "12-3456789",
    "__v": 0,
    "_id": "58768d9db3bd9616805d8d0e",
    "created": "2017-01-11T19:55:09.270Z",
    "name": "myBiz_name",
    "userId": "5876878db3bd9616805d8d0b"
}

```
Additional information a business will contain:
 loc: {
    lng: { type: Number, min: -180, max: 180 },
    lat: { type: Number, min: -90, max: 90 }
  },
  address: { Type: String },
  menu: { Type: Schema.Types.ObjectId },
  url: { Type: String },
  email: { Type: String },
  phone: { Type: String }

___
**Biz menu Post**

Example:https://wheatlessinv2.herokuapp.com/api/biz/58768d9db3bd9616805d8d0e/menu

Required Data:

There is no minimum required parameter for posting a menu. After generating a menu, the menu can be posted.
This route will authenticate the user and business and finally, post the menu.


Authorization Header
Bearer <response token from signin> will return in JSON format once a user's token is verified. The response will contain the menu information that was originally provided by the business owner.


Example request:
```
http GET wheatlessinv2.herokuapp.com/api/biz/58768d9db3bd9616805d8d0e/menu Authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjE3MjQxMmM3Y2MyM2 U3Y2RjMGJhNTM3YzEzNWQ2MzJiYjA3MjAyZDUyY2VkMTBiZjE4ODY1NDNmZjlhYjIxYmIiLCJpYXQiOjE0ODQxNjk1Mjh9 .fjqVBiFznrbBMdCkwUDrGRlMIrl9TRI4Ike29a8xHVo' isCompletelyGlutenFree:=true
```
Example response:
```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 144
Content-Type: application/json; charset=utf-8
Date: Wed, 11 Jan 2017 21:24:45 GMT
ETag: W/"90-WGgdL9A1FDV728gv4ffIKQ"
X-Powered-By: Express

{
    "__v": 0,
    "_id": "5876a29db3d3061c3c93b88e",
    "bizId": "58768d9db3bd9616805d8d0e",
    "created": "2017-01-11T21:24:45.646Z",
    "isCompletelyGlutenFree": true
}
```
___
**Pic Post**
Example:https://wheatlessinv2.herokuapp.com/api/biz

Required Data:

An image file path.
This route will authenticate the user and post a business that contains the minimum required parameters.


Authorization Header
Bearer <response token from signin> will return in JSON format once a user's token is verified. The response will contain the business information that was originally provided by the business owner.

 Example request:
 ```
 http --form POST wheatlessinv2.herokuapp.com/api/menu/5876a29db3d3061c3c93b88e/pic Authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6Ijg1M2ZhODFiNGU1ZjE3MGI0YmVhZGNjMDU3YmM1OTM2YzhhMzk2M2VhNmY1NGM1YTljYjAwNjUxNGZjYmJhNTQiLCJpYXQiOjE0ODQxN zA2ODB9.FSADbMng2-yI2bFSr2Cx2P__hpXiLFJPH033RuhRwAg' image@./test/data/pic.jpg
 ```
 Example Response:
 ```
 HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 290
Content-Type: application/json; charset=utf-8
Date: Wed, 11 Jan 2017 21:47:03 GMT
ETag: W/"122-+EGOJoHVbl4tUhpVII/M6Q"
X-Powered-By: Express

{
    "__v": 0,
    "_id": "5876a7d7033be536d4fa5ffe",
    "created": "2017-01-11T21:47:03.541Z",
    "imageURI": "https://code-fellows.s3.amazonaws.com/70a463b6f5ac06078f1807581e5344e6.jpg",
    "menuId": "5876a29db3d3061c3c93b88e",
    "objectKey": "70a463b6f5ac06078f1807581e5344e6.jpg",
    "userId": "5876878db3bd9616805d8d0b"
    }
 ```
 ___
###GET

**User signin**
GET /api/signin

Example: https://wheatlessinv2.herokuapp.com/api/signin

Required Data:

Authorization header: username and password as JSON.

This route will require an authorization header that needs to include the a username and password of the specific user to be authenticated. Signing in will return a brand new token that will be used for future user ID reference.

Example request:
```
http GET wheatlessinv2.herokuapp.com/api/signin --auth='test-user:test-pwd'
```
Example response:
```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 205
Content-Type: text/html; charset=utf-8
Date: Wed, 11 Jan 2017 19:36:15 GMT
ETag: W/"cd-oSNWnur5CMaLvbweIhJNRw"
X-Powered-By: Express

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImFjM2RlYjNlODE1ZWNkY2NkZjBjMzU1NWRkNDQxNzI3NThkZWU1ZDFhZTRiNmQ0MDFiYzEyZWJmMTJlOTRiNzgiLCJpYXQiOjE0ODQxNjMzNzV9.dnkS7g3HutqyFVftrNoR_z2ks9lGD38voE-td8WgN5I

```
___
**biz get**
Example:https://wheatlessinv2.herokuapp.com/api/biz/58768d9db3bd9616805d8d0e

Required Data:

A Business ID.
This route will return all matches that have the provided id.

Authorization Header
No authentication required for fetching this data.

All property matching menu to that individual business will populate and display.

Example request:
```
http GET https://wheatlessinv2.herokuapp.com/api/biz/58768d9db3bd9616805d8d0e
```
Example response:
```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 154
Content-Type: application/json; charset=utf-8
Date: Wed, 11 Jan 2017 20:12:56 GMT
ETag: W/"9a-Vh346IY9p1S3p49AXlnjAQ"
X-Powered-By: Express

{
    "EIN": "12-3456789",
    "__v": 0,
    "_id": "58768d9db3bd9616805d8d0e",
    "created": "2017-01-11T19:55:09.270Z",
    "name": "myBiz_name",
    "userId": "5876878db3bd9616805d8d0b"
}

```
___
### PUT
**User Update**

GET /api/signin/update

Example: https://wheatlessinv2.herokuapp.com/api/signin/update

Required Data:

Authorization header: provide username and password as JSON

This route will require an authorization header that needs to include the token of the specific user to be authenticated. Update in will return a brand new token that will be used for future update user.

Authorization Header:
Bearer <response token from signin> will be returned in JSON format once a user's token is verified. The response will contain the business information that was originally provided.
Example request:
```
http PUT wheatlessinv2.herokuapp.com/api/signin/update Authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6Ijd mNTJiZjU4OGQ5YjA4NTdkYWE5MmMzMDdhNTQxYmUxNGJmYjE3OGU2M2M2ZDQ2ODFkMWQ5ODk 0MGI3NDQxZjAiLCJpYXQiOjE0ODQyMDIzMTZ9.lxIQxUk3xjzW89ZgKei546nwbrVKmA8Zed BSXBNRo4g' password='new password'
```
Example response:
```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 200
Content-Type: application/json; charset=utf-8
Date: Thu, 12 Jan 2017 06:47:37 GMT
ETag: W/"c8-fhXvRYxPtfgYqnV3J7gPkw"
X-Powered-By: Express

{
    "__v": 0,
    "_id": "5877214c05b9ce21a84d9d3d",
    "email": "test-email@test.com",
    "findHash": "7f52bf588d9b0857daa92c307a541be14bfb178e63c6d4681d1d98940b7441f0",
    "password": "new password",
    "username": "test--user"
}
```
___
**Biz update**

Example:https://wheatlessinv2.herokuapp.com/api/biz/5877224205b9ce21a84d9d40

Required Data:
business id
This route will return all matches that have the provided id.

Authorization Header
Bearer <response token from signin>
it will be returned in JSON format once a user's token is verified. The response will contain a compleate business information as it was provided.

All business matching to biz.id will be update.

Example request:
```
http DELETE wheatlessinv2.herokuapp.com/api/biz/5877224205b9 ce21a84d9d40 Authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. eyJ0b2tlbiI6IjdmNTJiZjU4OGQ5YjA4NTdkYWE5MmMzMDdhNTQxYmUxNGJmYjE3OGU2M2M2 ZDQ2ODFkMWQ5ODk0MGI3NDQxZjAiLCJpYXQiOjE0ODQyMDIzMTZ9.lxIQxUk3xjzW89ZgKei 546nwbrVKmA8ZedBSXBNRo4g' EIN='12-3456712' name='Biz_update'
```
Example Response:
```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 154
Content-Type: application/json; charset=utf-8
Date: Thu, 12 Jan 2017 06:30:29 GMT
ETag: W/"9a-PF5Bvij3/d1CWYCgGHEOIg"
X-Powered-By: Express

{
    "EIN": "12-3456712",
    "__v": 0,
    "_id": "5877224205b9ce21a84d9d40",
    "created": "2017-01-12T06:29:22.157Z",
    "name": "Biz_update",
    "userId": "5877214c05b9ce21a84d9d3d"
}
```
___
### DELETE
**Biz delete**

Example:https://wheatlessinv2.herokuapp.com/api/biz/58768d9db3bd9616805d8d0e

Required Data:
business id

Authorization Header:
Bearer <response token from signin> will be returned in JSON format once a user's token is verified. The response will contain the business information that was originally provided.


Example request:
```
http DELETE wheatlessinv2.herokuapp.com/api/biz/58768d9db3bd9616805d8d0e Authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjE3MjQxMmM3Y2MyM2 U3Y2RjMGJhNTM3YzEzNWQ2MzJiYjA3MjAyZDUyY2VkMTBiZjE4ODY1NDNmZjlhYjIxYmIiLCJpYXQiOjE0ODQxNjk1Mjh9 .fjqVBiFznrbBMdCkwUDrGRlMIrl9TRI4Ike29a8xHVo'
```
Example response:
```
HTTP/1.1 204 OK
Connection: close
Content-Type: application/text; charset=utf-8
Date: Wed, 11 Jan 2017 20:12:56 GMT
ETag: W/"2-4KoCHiHd29bYzs7HHpz1ZA"
X-Powered-By: Express
```
___
**Pic Delete**

Example:https://wheatlessinv2.herokuapp.com/api/pic/:picId

Required Data:
picture id,
This route will authenticate the user before deletion.

Authorization Header:
Bearer <response token from signin> will be returned in JSON format once a user's token is verified. The response will contain the business information that was originally provided.

 Example request:
 ```
 http DELETE wheatlessinv2.herokuapp.com/api/pic/587735a19 d3cc020189ffd07 Authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC J9.eyJ0b2tlbiI6IjdmNTJiZjU4OGQ5YjA4NTdkYWE5MmMzMDdhNTQxYmUxNGJmYjE3OGU2M 2M2ZDQ2ODFkMWQ5ODk0MGI3NDQxZjAiLCJpYXQiOjE0ODQyMDIzMTZ9.lxIQxUk3xjzW89Zg Kei546nwbrVKmA8ZedBSXBNRo4g'
 ```
 Example response:
 ```
 HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 42
Content-Type: application/json; charset=utf-8
Date: Thu, 12 Jan 2017 08:30:53 GMT
ETag: W/"2a-8exXjIdMvPbXCgLPXwWQMQ"
X-Powered-By: Express

{
    "DeleteMarker": "true",
    "VersionId": "null"
}
 ```
****
# Testing

### Testing Framework

mocha test runner  
chai (expect)  
bluebird promise library

###Continuous Integration

travis-ci

###Coveralls
