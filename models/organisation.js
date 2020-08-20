var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const _ = require("lodash");

dotenv.config();
//@ validation module
const validations = require("../utility/validations");

//@ role - Organisation creates Teacher, Student and Subjects for each class

var orgSchema = new Schema({
  orgName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  orgCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  orgType: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  orgAddress: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 500,
  },
  orgLogo: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 250,
  },
  orgPassword: {
    type: String,
    minlength: 8,
    maxlength: 5000,
    trim: true,
    required: "password is required",
    validate: [validations.validatePassword, "Please fill a valid password"],
  },
  role: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: 1, // 1 - active, 0 - not active
  },
  orgEmail: {
    type: String,
    unique: true,
    trim: true,
    minlength: 5,
    maxlength: 50,
    required: "Email address is required",
    validate: [validations.validateEmail, "Please fill a valid email address"],
  },
  orgMobile: {
    type: Number,
    unique: true,
    required: true,
    min: 6000000000,
    max: 9999999999,
  },
  orgClasses: [
    {
      orgClass: {
        type: String,
      },
      orgSection: {
        type: String,
      },
      orgSubjects: [
        {
          subjects: {
            type: String,
          },
        },
      ],
    },
  ],
  orgTeachers: [
    {
      teacherName: {
        type: String,
        minlength: 2,
        maxlength: 50,
      },
      teacherAge: {
        type: Number,
        min: 18,
        max: 100,
      },
      teacherDesignation: {
        type: String,
      },
      teacherCode: {
        type: String,
        // unique:true,
        // required:true
      },
      teacherGender: {
        type: String,
      },
      role: {
        type: String,
      },
      active: {
        type: Boolean,
        default: 1, // 1 - active, 0 - not active
      },
      teacherEmail: {
        type: String,
        // unique:true,
        minlength: 5,
        maxlength: 50,
        validate: [
          validations.validateEmail,
          "Please fill a valid email address",
        ],
      },
      teacherPassword: {
        type: String,
        minlength: 8,
        maxlength: 5000,
        trim: true,
        // required: "password is required",
        validate: [
          validations.validatePassword,
          "Please fill a valid password",
        ],
      },
      teacherMobile: {
        type: Number,
        // unique:true,
        // required:true,
        min: 6000000000,
        max: 9999999999,
      },
      teachingClasses: [
        {
          teacherClass: {
            type: String,
          },
          teacherSection: {
            type: String,
          },
          teachingSubjects: [
            {
              subject: {
                type: String,
              },
            },
          ],
        },
      ],
    },
  ],
  orgStudent: [
    {
      studentName: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50,
      },
      studentRollNo: {
        type: String,
        // unique:true,
        // required:true
      },
      studentClass: {
        type: String,
      },
      studentSection: {
        type: String,
      },
      studentFatherName: {
        type: String,
      },
      role: {
        type: String,
      },
      active: {
        type: Boolean,
        default: 1, // 1 - active, 0 - not active
      },
      studentEmail: {
        type: String,
        // required:true,
        // unique:true,
        minlength: 5,
        maxlength: 50,
        validate: [
          validations.validateEmail,
          "Please fill a valid email address",
        ],
      },
      studentMobile: {
        type: Number,
        // unique:true,
        // required:true,
        min: 6000000000,
        max: 9999999999,
      },
      studentDOB: {
        type: String,
      },
      studentGender: {
        type: String,
      },
      studentPassword: {
        type: String,
        minlength: 8,
        maxlength: 5000,
        trim: true,
        // required: "password is required",
        validate: [
          validations.validatePassword,
          "Please fill a valid password",
        ],
      },
    },
  ],
  questionaire: [
    {
      purposeOfQuestion: {
        //subject or other
        type: String,
      },
      subject: {
        //subject in which question is asked
        type: String,
      },
      question: {
        type: String,
        minlength: 2,
        maxlength: 5000,
      },
      questionDate: {
        type: String,
      },
      questionTime: {
        type: String,
      },
      questionAskerName: {
        //teacher or student
        type: String,
      },
      questionAskerRole:{
        type:String
      },
      questionAskerCode: {
        // Teacher Code or roll no.
        type: String,
      },
   questionAskerClass:{
     type:String
   },
   questionAskerSection:{
     type:String
   },

      //pending
      // QuestionShowToClass: {
      //   type: String,
      // },
      // questionShowToSection: {
      //   type: String,
      // },


      replies: [
        {
          reply: {
            type: String,
            minlength: 2,
            maxlength: 5000,
          },
          replyDate: {
            type: String,
          },
          replyTime: {
            type: String,
          },
          replierName: {
            type: String,
          },
          replierRole:{
type:String
          },
          replierCode: {
            type: String,
          },
          replierClass:{ //only when student
            type:String
          },
          replierSection:{//only when student
            type:String
          }
        }
      ],
    },
  ],
  schedules: [
    {
      teacherCode: {
        type: String,
      },
      classScheduled: {
        type: String,
      },
      sectionScheduled: {
        type: String,
      },
      topicScheduled: {
        type: String,
      },
      subjectScheduled: {
        type: String,
      },
      active:{
        type:Boolean,
        default: 1
      },
      createdAt:{
type: String
      },
      updatedAt:{
type:String
      },
      scheduleDate:{
        type:String
      },
      scheduleTime:{
        type:String
      },
      selectedStudents: [
        {
          studentRollNo: {
            type: String,
          },
          studentEmail:{
            type:String
          }
        },
      ],
    }
  ],
  
});

orgSchema.pre("save", function (next) {
  //can be said as a model method applicable on single document
  var user = this;
  if (user.role == "Organisation") {
    if (!user.isModified("orgPassword")) {
      return next();
    } else {
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        else {
          bcrypt.hash(user.orgPassword, salt, (err, hash) => {
            if (err) return next(err);
            user.orgPassword = hash;
            next();
          });
        }
      });
    }
  }
});

//@ MATCH TEXT PASSWORD WITH HASHED PASSWORD
orgSchema.methods.comparePassword = function (password, role, mobile) {
  //instance method for a single document
  console.log(role);
  if (role == "Organisation") {
    return bcrypt.compareSync(password, this.orgPassword); // returns true or false
  } else if (role == "Teacher" || role == "teacher") {
    const teacherIndex = _.findIndex(this.orgTeachers, {
      teacherMobile: mobile,
    });
    hashPassword = this.orgTeachers[teacherIndex].teacherPassword;
    return bcrypt.compareSync(password, hashPassword); // returns true or false
  } else if (role == "Student") {
    const StudentIndex = _.findIndex(this.orgStudent, {
      studentMobile: mobile,
    });
    hashPassword = this.orgStudent[StudentIndex].studentPassword;
    return bcrypt.compareSync(password, hashPassword); // returns true or false
  }
};

//@ generate jwt auth token
orgSchema.methods.generateAuthToken = function (role, mobile) {
  //instance method have access for a single document
  var user = this;
  console.log(role);
  console.log(user);
  console.log("hello");
  var access = "auth";
  if (role == "Organisation") {
    var token = jwt
      .sign(
        {
          mobile: user.orgMobile,
          access,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d", //token expiry time 15days = 1296000 seconds
        }
      )
      .toString();
  } else if (role == "Teacher" || role == "teacher") {
    var token = jwt
      .sign(
        {
          mobile,
          access,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      )
      .toString();
  } else if (role == "Student") {
    var token = jwt
      .sign(
        {
          mobile,
          access,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      )
      .toString();
  }

  return user.save().then(() => {
    return token;
  });
};

var org = mongoose.model("org", orgSchema);
module.exports = org;
