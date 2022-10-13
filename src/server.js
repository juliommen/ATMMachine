import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createNewUser, requestWithdraw, getWithdrawsList } from './databaseRequests.js'

const app = new express();

/* Middleware configuration */
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('json spaces', 2);

/* Routes definitions */
app.post("/createNewUser", async (request, response) => {
    const userName = request.body.userName;
    const userEmail = request.body.userEmail;
    const [status, returnMessage] = await createNewUser(userName, userEmail);
    response.status(status).json({
        status: status,
        msg: returnMessage
    })
})

app.post("/requestWithdraw", async (request, response) => {
    const userEmail = request.body.userEmail;
    const requestedAmount = request.body.requestedAmount;
    const requestDate = new Date()
    const [status, returnMessage, data] = await requestWithdraw(userEmail, requestedAmount, requestDate);
    response.status(status).json({
        status: status,
        msg: returnMessage,
        data: data
    })
})

app.get("/userWithdraws/:userId", async (request, response) => {
    const userId = request.params.userId;
    const [status, returnMessage, data] = await getWithdrawsList(userId);
    response.status(status).json({
        status: status,
        msg: returnMessage,
        data: data
    })
})

/* Launch server */
app.listen(8080, () => {
    console.log(`Listening at http://localhost:8080`)
})




