# Restaurant Forum
A restaurant forum web application built with Node.js, Express, and MySQL for you to readily record, view, and manage your restaurant with an account


### Trial in this project 🤠
+ [Multer](https://www.npmjs.com/package/multer) is used to handle upload images
+ [Faker](https://www.npmjs.com/package/faker) is used to generate fake restaurant info


___

## Features
| Functions              | Detail                                            | URL                         |
| :--------------------: | ------------------------------------------------- | --------------------------- |
| Sign up | User can sign up an account by inputting name, email, password | /signup |
| Log in | User can log in using registered email | /signin |
| Log out | User can log out of an account | /users/logout |
| View all restaurants | Admin can view all restaurants | /admin/restaurants |
| Create a restaurants | Admin can add a new restaurant after login | /admin/restaurants/create |
| View a restaurant | Admin can view detail of a restaurant after login | /admin/restaurants/:id |
| Edit a restaurant | Admin can update detail info of a restaurant after login | /admin/restaurants/:id/edit |
| Delete a restaurant | Admin can delete a restaurant after login | /admin/restaurants/:id |
| View all users | Admin can view all users after log in | /admin/users |
| Edit a user | Admin can update user's role after log in | /admin/users/:id |

___

## Installation
The following instructions will get you a copy of the project and all the setting needed to run it on your local machine.


### Prerequisites

- [npm](https://www.npmjs.com/get-npm)
- [Node.js v10.16.0](https://nodejs.org/en/download/)
- [MySQL v8.0.16](https://dev.mysql.com/downloads/mysql/)
- [MySQL Workbench v8.0.16](https://dev.mysql.com/downloads/workbench/)


### Clone

Clone this repository to your local machine

```
$ git clone https://github.com/smallpaes/restaurant-forum
```

### Setup Datebase

**Create and use forum database via MySQL Workbench**

> Run the following code
```
drop database if exists forum;
create database forum;
use forum;
```

### Setup App

**1. Create am Imgur account**
- [https://imgur.com/](https://imgur.com/)

**2. Register an App and get the Client ID**
- [https://api.imgur.com/oauth2/addclient](https://api.imgur.com/oauth2/addclient)

**3. Enter the project folder**

```
$ cd restaurant-forum
```

**4. Install packages via npm**

```
$ npm install
```

**5. Create .env file**

```
$ touch .env
```

**6. Store API Key in .env file and save**

```
IMGUR_CLIENT_ID=<YOUR_Client_ID>
```

**7. Edit password in config.json file**

> /config/config.json
```
"development": {
  "username": "root",
  "password": "<YOUR_WORKBENCH_PASSWORD>",
  "database": "forum",
  "host": "127.0.0.1",
  "dialect": "mysql",
  "operatorsAliases": false
}

```

**8. Create Users and Restaurants models**

> run the following code in the console
```
$ npx sequelize db:migrate
```

**9. Add Seeder**

> run the following code in the console
```
$ npx sequelize db:seed:all
```

**10. Activate the server**

```
$ npm run dev
```

**11. Find the message for successful activation**

```
> App is running on port 3000!
```
You may visit the application on browser with the URL: http://localhost:3000

___

## FAQ
- **Can I try this app online?**
    - Yes, kindly visit [https://intense-ocean-54235.herokuapp.com/](https://intense-ocean-54235.herokuapp.com/)
    
- **Can I use use testing account to log in?**
    - Yes, for admin user, kindly use the following testing account:
      - email: root@example.com
      - password: 12345678
    - For regular user, kindly use the following testing account:
      - email: user1@example.com
      - password: 12345678

___


## Authors
[Mike Huang](https://github.com/smallpaes)