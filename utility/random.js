exports.randomOtp = () => {
    const num = Math.floor(100000 + Math.random() * 900000); //generate random numbers between 100000 to 999999
    return num;
};