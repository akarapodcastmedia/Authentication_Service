const { number } = require("joi");

// opt generator 
function optGenerator(){
    const opt_random = Math.random();
    const get_four_digit = opt_random * 1000000;
    const get_integer_opt = parseInt(get_four_digit);
    const verified_code = ""+ get_integer_opt + "";
    return verified_code;
}

// export these two configuration
module.exports = {optGenerator};