export const withdrawFees = [
    {
        fee: 0.03,
        min:1,
        max:100.99
    },
    {
        fee: 0.02,
        min:101,
        max:250.99
    },
    {
        fee: 0.01,
        min:251,
        max:300
    },
];


export const firstWithdrawMaxLimit = 50;

export const withdrawMaxLimit = 300;

export const withdrawMinLimit = 1;

export const maxWithdrawsPerPeriod = { total: 5, hoursInterval: 24};