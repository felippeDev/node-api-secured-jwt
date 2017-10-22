# node-api-secured-jwt
NodeJS secured API with jwt - http://node-api-secured-jwt.herokuapp.com

## How to use:
- Clone the repo;
- Start your local instance of MongoDB (usually on: mongodb://localhost:27017/node-api-secured-jwt);
- Run npm install;
- Use routes:
  - POST /authenticate: Expect body parameters with 'name' and 'password' and response with a jwt token;
  - GET /signUp: Creates a fakie simple user (Expect a Authorization header with token);
  - GET /users: List all users (Expect a Authorization header with token);

  ## Next steps
  - Encrypt passwords with SHA1 hash;
  - Generate solid routes to CRUD users;
