# Digital Blackboard

A digital blackboard for schools.<br>
**This repository is not optimized for personal use and is therefore not "plug and play ready"**

Detailed information about the project can be found [here](https://timgöllner.de/posts/2).

## Usage

To build the frontend react application run:
```sh
cd frontend
npm run build
```

The `docker-compose.yml` starts and initializes the frontend, backend, database and a phpmyadmin webserver.
You can therefore start the entire application with:

```sh
sudo docker-compose up --build -d
```

<br>

If you want to test the frontend and backend individually, you can run:

```sh
cd frontend
npm run start
```

or

```sh
cd backend
npm run devStart
```

## Backend structure

If started with the `docker-compose.yml` file, all incomming requests to `/api` will be routed to the backend.

**All api endpoints are prefixed with a version ( /v1 ).**

All api endpoints (besides `[GET] /register` and `[POST] /login`) require the `jwt-token` header as authentication.
The request body structure can be looked up in the `backend/routes/...` files.

Here is a list of all api endpoints:

<pre>
  [POST]                      <b>/register</b>
  [GET, POST]                 <b>/login</b>
  [GET]                       <b>/blackboard</b>/:organization/:identifier

  [GET, POST, PUT, DELETE]    <b>/dashboard/accounts</b>
  [GET, POST, PUT, DELETE]    <b>/dashboard/changes</b>
  [GET, POST, PUT, DELETE]    <b>/dashboard/classes</b>
  [GET, POST, PUT, DELETE]    <b>/dashboard/grades</b>
  [GET, PUT, DELETE]          <b>/dashboard/organizations</b>
  [GET, POST, DELETE]         <b>/dashboard/rooms</b>
  [GET, POST, PUT, DELETE]    <b>/dashboard/students</b>
  [GET, POST, DELETE]         <b>/dashboard/subjects</b>
  [GET, POST, PUT, DELETE]    <b>/dashboard/teachers</b>
</pre>
