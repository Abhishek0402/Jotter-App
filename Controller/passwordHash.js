const bcrypt = require("bcryptjs");
 
 exports.passwordHashing = (password) =>{

bcrypt.genSalt(10, function (err, salt) {
            if (err) return err;
            else {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) return err;
                    console.log(hash);
                   return hash;
                });
            }
        });
 };
 