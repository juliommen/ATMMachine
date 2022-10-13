const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect
chai.use(chaiHttp);
const baseUrl = "http://localhost:8080"

//Preliminar function to get random chars to build random emails
let characters = 'abcdefghijklmnopqrstuvwxyz';
let charactersLength = characters.length;
let randomChars="";
for ( var i = 0; i < 20; i++ ) {
    randomChars += characters.charAt(Math.floor(Math.random() * charactersLength));
}

/* Test Cases */
const testCasesForValidUserCreations = [
    {name: 'Maria Oliveira', email: randomChars+'@gmail.com'},
    {name: 'José da Silva', email: randomChars+'@yahoo.com.br'},
    {name: 'Test', email: randomChars+'@test.com'},
    {name: 'Test', email: randomChars+'@test2.com'},
];

const testCasesForInvalidUserCreations = [
    {name: '', email: 'test@tste.com'}, //nome inválido
    {name: 'test 123', email: 'test@test.com'}, //nome inválido
    {name: 'test test', email: ''}, //email inválido
    {name: 'test test', email: '123'}, //email inválido
    {name: 'test test', email: 'test@a.'}, //email inválido
    {name: 'test test', email: 'test@a,com'}, //email inválido
    {name: 'test', email: randomChars + '@test.com'}, //usuário já cadastrado
];

const testCasesForInvalidWithdrawAmounts = ["","132.5","51","0","301"];

const testCasesForValidWithdrawAmounts = ["50","100","200","300","1"];

const testCasesForInsufficientFunds = ["50","300","300","300","50"];
////

/* Create New User Route Tests */
describe("New User Creation Test - Success", function () {
    testCasesForValidUserCreations.forEach((testCase) => {
        it('server is live', function (done) {
            this.timeout(10000);
            chai.request(baseUrl)
                .post('/createNewUser')
                .send({userName: testCase.name, userEmail: testCase.email})
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    done();
                });
        })
    });
})

describe("New User Creation Test - Invalid Input", function () {
    testCasesForInvalidUserCreations.forEach((testCase) => {
        it('server is live', function (done) {
            this.timeout(10000);
            chai.request(baseUrl)
                .post('/createNewUser')
                .send({userName: testCase.name, userEmail: testCase.email})
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                    done();
                });
        })
    });
})
/////

/* Withdraw Request Route Test */
describe("Withdraw Request Test - Invalid Amount", function () {
    testCasesForInvalidWithdrawAmounts.forEach((testCase) => {
        it('server is live', function (done) {
            this.timeout(10000);
            chai.request(baseUrl)
                .post('/requestWithdraw')
                .send({requestedAmount: testCase, userEmail: randomChars+'@test.com'})
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                    done();
                });
        })
    });
})

describe("Withdraw Request Test - Success", function () {
    testCasesForValidWithdrawAmounts.forEach((testCase) => {
        it('server is live', function (done) {
            this.timeout(10000);
            chai.request(baseUrl)
                .post('/requestWithdraw')
                .send({requestedAmount: testCase, userEmail: randomChars+'@test.com'})
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    done();
                });
        })
    });
})

// Using here the same user email from the test above, 
// that should have already 5 total withdraws succesfully made
describe("Withdraw Request Test - Limited Withdraws", function () {
    it('server is live', function (done) {
        this.timeout(10000);
        chai.request(baseUrl)
            .post('/requestWithdraw')
            .send({requestedAmount: "1", userEmail: randomChars+'@test.com'})
            .end(function (err, res) {
                expect(res).to.have.status(400);
                done();
            });
    })
})

// Testing with another user created in the first test
describe("Withdraw Request Test - Insufficient Funds", function () {
    testCasesForInsufficientFunds.forEach((testCase, i) => {
        if (i<4) {
            it('server is live', function (done) {
                this.timeout(10000);
                chai.request(baseUrl)
                    .post('/requestWithdraw')
                    .send({requestedAmount: testCase, userEmail: randomChars+'@test2.com'})
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        done();
                    });
            })
        } else {
            it('server is live', function (done) {
                this.timeout(10000);
                chai.request(baseUrl)
                    .post('/requestWithdraw')
                    .send({requestedAmount: testCase, userEmail: randomChars+'@test2.com'})
                    .end(function (err, res) {
                        expect(res).to.have.status(400);
                        done();
                    });
            })
        }
    });
})

