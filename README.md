# ATM API

API to creat user accounts and proccess withdraw requests.

# INSTRUCTIONS

## Installation

- Unzip file
- Via terminal, access "atm-api" directory.
- Run 'npm run-script installAndRun'.
- Application will be launched on http://localhost:8080/.

- Additional: Once everything is up and running, open new terminal window, access folder, and run 'npm test' to run the unit tests.

## Handling Routes

This API has 2 `[POST]` routes and 1 `[GET]` route.

### POST: Create New User

Make a post request to http://localhost:8080/createNewUser, passing 'userName' and 'userEmail' on the request body to create a new user.

Example:
curl -X POST -H "Content-Type: application/json" -d "{\"userName\":\"Test User\", \"userEmail\":\"test@test.com\" }" http://localhost:8080/createNewUser


### POST: Request Withdraw

Make a post request to https://localhost:8080/requestWithdraw, passing 'userEmail' and 'requestedAmount' on the request body to request a withdraw.

Example:
curl -X POST -H "Content-Type: application/json" -d "{\"requestedAmount\":\"30\", \"userEmail\":\"test@test.com\" }" http://localhost:8080/requestWithdraw


### GET: Withdraws List

Make a get request to https://localhost:8080/userWithdraws/userId, replacing the 'userId' in the URL for the actual user id (in this case, the user email used to create the account).

Example:
curl http://localhost:8080/userWithdraws/test@test.com

