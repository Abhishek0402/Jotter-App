const bcrypt = require("bcryptjs");

exports.passwordHash = (password)=>{
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            console.log("password error");
            console.log(err.message);
        }
        else {
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) {
                console.log("password error");
                console.log(err.message); 
              }
              console.log("hASH IS " + hash);
                return (hash);
          });
        }
    });
};