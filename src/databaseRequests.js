import {withdrawFees, firstWithdrawMaxLimit, withdrawMaxLimit , withdrawMinLimit, maxWithdrawsPerPeriod} from "./withdrawRules.js";
import axios from 'axios';  

const databaseEndpointURL = "https://data.mongodb-api.com/app/withdrawapi-oapxn/endpoint/";
const initialFunds = 1000.0;
let dueFee;
let fundsAfterWithdraw;
let userDoc;

export async function createNewUser(userName, userEmail){

    const nameFormatValidation = validateNameFormat(userName);
    if (nameFormatValidation !== null){
        return nameFormatValidation;
    }
    const emailFormatValidation = validateEmailFormat(userEmail);
    if (emailFormatValidation !== null){
        return emailFormatValidation;
    }
  
    const newUserDoc = {
        _id:userEmail, 
        userName:userName,
        creationDate: new Date(), 
        totalWithdraws:0, 
        totalFunds:initialFunds
    };

    const createNewUserResult = await axios.post(databaseEndpointURL + "createNewUser", {newUserDoc:newUserDoc});
    return createNewUserResult.data; 
}

export async function requestWithdraw(userEmail, requestedAmount, requestDate){
    
    const emailFormatValidation = validateEmailFormat(userEmail);
    if (emailFormatValidation !== null){
        return emailFormatValidation;
    }
    
    const requestedAmountFormatValidation = validateRequestedAmountFormat(requestedAmount);
    if (requestedAmountFormatValidation !== null){
        return requestedAmountFormatValidation;
    }


    const userFound = await getUserDoc(userEmail);
    if (!userFound) {
        return [400, "User does not have an account."];
    }
    
    const requestedAmountValidationForUser = await validateRequestedAmountForUser(requestedAmount, requestDate);
    if (requestedAmountValidationForUser !== null){
        return requestedAmountValidationForUser;
    }

    const withdrawRegistrationResult =  await registerWithdraw(requestedAmount, requestDate);
    return withdrawRegistrationResult;

}

export async function getWithdrawsList(userId) {
    const emailFormatValidation = validateEmailFormat(userId);
    if (emailFormatValidation !== null){
        return emailFormatValidation;
    }

    const userFound = await getUserDoc(userId);
    if (!userFound) {
        return [400, "User does not have an account."];
    }

    const getWithdrawsListResult = await axios.post(databaseEndpointURL + "getWithdrawsList", {userId:userId});
    return [200, "Withdraws succesfully fetched.", getWithdrawsListResult.data];
}

async function getUserDoc(userId) {
    const getUserDocResult = await axios.post(databaseEndpointURL + "getUserDoc", {userId:userId}); 
    userDoc = getUserDocResult.data;
    return userDoc == null ? false : true;
}

function validateEmailFormat(email){
    if(email == "") {
        return [400,"Email not provided."];
    }

    const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(!email.match(validEmailRegex)) {
        return [400,"Invalid email."];
    }

    /* Validation completed with no errors*/
    return null;
}

function validateNameFormat(name){
    if(name == "") {
        return [400,"Name note provided."];
    }

    const validNameRegex = /^([ \u00c0-\u01ffa-zA-Z'\-])+$/;
    if(!name.match(validNameRegex)) {
        return [400,"Invalid name."];
    }

    /* Validation completed with no errors*/
    return null;
}

function validateRequestedAmountFormat(requestedAmount) {
    if (requestedAmount == ""){
        return [400, "Withdraw amount not provided."];
    } else if (isNaN(Number(requestedAmount))) {
        return [400, "Withdraw amount must be a number."];
    } else if (Number(requestedAmount) % 1 != 0) {
        return [400, "Withdraw amount must be an integer number."];
    }
    return null;
}

async function validateRequestedAmountForUser(requestedAmount, requestDate) {
    const userTotalWithdraws = userDoc.totalWithdraws;
    const userTotalFunds = userDoc.totalFunds;

    /* Validating withdraw in the context of maximum withdraws permited per time interval */
    if (userTotalWithdraws >= maxWithdrawsPerPeriod.total) {
        const userId = userDoc._id;
        const withdrawToCheck =  userTotalWithdraws - maxWithdrawsPerPeriod.total + 1;
        const withdrawDate = await getWithdrawDate(userId , withdrawToCheck);
        const nextWithdrawPermissionTime = withdrawDate.getTime() + maxWithdrawsPerPeriod.hoursInterval*60*60*1000;
        if (nextWithdrawPermissionTime >= requestDate.getTime()) {
            return [
                        400, 
                        "Could not proccess the request. Quantity of withdraws requested has reached its limit for the current time period.", 
                        {
                            maxWithdraws: maxWithdrawsPerPeriod.total,
                            minHoursInterval: maxWithdrawsPerPeriod.hoursInterval,
                            allowedDateForNextWithdraw: new Date(nextWithdrawPermissionTime)
                        }
                    ];
        }
    }

    /* Validating withdraw according to minimum e maximum amount limits */
    if (requestedAmount < withdrawMinLimit) {
        return [400,"Invalid withdraw amount request.", {minAmount: withdrawMinLimit.toFixed(2)}];
    } else if (userTotalWithdraws == 0 && requestedAmount > firstWithdrawMaxLimit) {
        return [400,"Invalid first withdraw amount request", {maxAmount: firstWithdrawMaxLimit.toFixed(2)}];
    } else if (requestedAmount > withdrawMaxLimit) {
        return [400,"Invalid withdraw amount request.", {maxAmount: withdrawMaxLimit.toFixed(2)}];
    }

    /* Validating withdraw according to due fees and available funds */
    const feeApliedToAmountRequested = withdrawFees.filter(v => v.min<= requestedAmount && v.max>= requestedAmount)[0].fee;
    dueFee = (feeApliedToAmountRequested * requestedAmount).toFixed(2);
    fundsAfterWithdraw = (userTotalFunds - requestedAmount - dueFee).toFixed(2);
    if (fundsAfterWithdraw < 0) {
        return [400,"Insufficient funds", {userTotalFunds: userTotalFunds}];
    }

    /* Validation completed with no errors*/
    return null;
}

async function getWithdrawDate(userId, withdrawToCheck){
    const getWithdrawDateResult = await axios.post(databaseEndpointURL + "getWithdrawDate", {userId:userId,withdrawToCheck:withdrawToCheck});
    const withdrawDoc = getWithdrawDateResult.data;
    return new Date (withdrawDoc.withdrawDate)
}

async function registerWithdraw(requestedAmount, requestDate) {

    const withdrawDoc = {
        userId: userDoc._id,
        withdrawNumber: userDoc.totalWithdraws + 1, 
        withdrawDate: requestDate, 
        amount: parseInt(requestedAmount),
        chargedFee: parseFloat(dueFee)
    };

    const registerWithdrawResult = await axios.post(databaseEndpointURL + "registerWithdraw", {withdrawDoc:withdrawDoc,fundsAfterWithdraw:fundsAfterWithdraw});
    return registerWithdrawResult.data;
}