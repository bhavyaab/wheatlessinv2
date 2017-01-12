# wheatlessinv2

### Overview
 -  This RESTful API provides the necessary back-end infrastructure and functionality to create, read and delete menu for guletin free food.
 - All menu needed to be field out form the resturents or food provider. It meanually upload the image of menue.


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
This API is structured on a Middleware(Authentication and Error catching), Model(Schema), Router pattern. The base technologies are node.js server, node.http module, express middleware, AWS and a mongo database. This architecture is currently deployed in a two tier environment(staging, production), leveraging the heroku platform.

  **Middleware**:
 - The express router middleware provides the base routing capability.
 - A custom handle-errors module implements and extends the http-errors npm middleware package.
 - An auth middleware module leverages two npm modules (bcryptjs, jsonwebtoken) and the node.crypto module to provide user sign-up and    user sign-in functionality as well as business for authentication/authorization and post the menu.
 - The mongoose npm module is used for interaction with the mongo database.
 - Aws is used to store image data and mongoose stores only referance (image URI), in order to make it more ifficient.

**Model**:
 - Each resources (user, biz, pic, menu) are mongoose Schema and have dedicated router files located in the route folder. In addition to providing an interface to the pubic user, these files provides modular structure.
 - For details about the input and output of routes, see the Routes section below.

**Router**:
 - Individual resources (user, biz, menu, pics) have dedicated router files. These files are the interface between the server, middleware, and model files and mongo and Aws database. When a request is made, router calls the necessary functions to interact with the model. They then return a response to the route once a request has been processed in the model, also parse the json content in the incoming request (where applicable) and create and populate a req.body property using the npm package parse-body.

# Routes
### POST:
Example:  

 **User Signup**  POST http://wheatlessinv2.herokuapp.com/api/signup


Required Data: Provide username, password, email as JSON

This route will create a new user by providing a username, password, and email in the body of the request. Creating a new user is required to store and access data later. This route must be completed before attempting to use the api/signin route.

Example request:
```  
http POST wheatlessinv2.herokuapp.com/api/signup username='test-user' p assword='test-pwd' email='testemail@test.com'
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

A token will be returned that will only be used for the api/signin route. after signing-in, you will receive a new token that will be a reference for all future routes.
___
**Biz Post**
Example:https://wheatlessinv2.herokuapp.com/api/biz

Required Data:

Business name and EIN number is the minimun required parameter for signup.
This route will authenticate the user and post business that contains a minimum required parameter.


Authorization Header
Bearer <response token from signin>
it will be returned in JSON format once a user's token is verified. The response will contain a compleate business information as it was provided.

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
more information a bizness can have are:
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

No minimun required parameter for posting menu, after generating menu menu can be posted as menu.
This route will authenticate the user and business and post menu.


Authorization Header
Bearer <response token from signin>
it will be returned in JSON format once a user's token is verified. The response will contain a compleate menu information as it was provided.


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

image file path.
This route will authenticate the user and post business that contains a minimum required parameter.


Authorization Header
Bearer <response token from signin>
it will be returned in JSON format once a user's token is verified. The response will contain a compleate business information as it was provided.

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

Required Data: Authorization header, Provide username and password as JSON

This route will require an authorization header that needs to include the username:password of the specific user to be authenticated. Signing in will return a brand new token that will be used for future user ID reference.
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

business id
This route will return all matches that have the provided id.

Authorization Header
No authentication required for fetching these datas.

All property matching menu to that individual business will populate and showup.

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

Required Data: Authorization header, Provide username and password as JSON

This route will require an authorization header that needs to include the token of the specific user to be authenticated. Update in will return a brand new token that will be used for future update user.

Authorization Header:Bearer <response token from signin>
it will be returned in JSON format once a user's token is verified. The response will contain a compleate business information as it was provided.
Example request:
```
http PUT wheatlessinv2.herokuapp.com/api/signin/update Au thorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6Ijd mNTJiZjU4OGQ5YjA4NTdkYWE5MmMzMDdhNTQxYmUxNGJmYjE3OGU2M2M2ZDQ2ODFkMWQ5ODk 0MGI3NDQxZjAiLCJpYXQiOjE0ODQyMDIzMTZ9.lxIQxUk3xjzW89ZgKei546nwbrVKmA8Zed BSXBNRo4g' password='new password'
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

Authorization Header
Bearer <response token from signin>
it will be returned in JSON format once a user's token is verified. The response will contain a compleate business information as it was provided.


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

Authorization Header
Bearer <response token from signin>
it will be returned in JSON format once a user's token is verified. The response will contain a compleate business information as it was provided.

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
