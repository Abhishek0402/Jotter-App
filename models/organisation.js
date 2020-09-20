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
    maxlength: 1000,
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
    trim: true,
    minlength: 5,
    maxlength: 50,
    required: "Email address is required",
    validate: [validations.validateEmail, "Please fill a valid email address"],
  },
  orgMobile: {
    type: Number,
    required: true,
    min: 6000000000,
    max: 9999999999,
  },
  deviceToken: {
    type: String,
  },
  loginId:{
    type:String,
    required: true,
    unique:true
  },
  notification: [
    {
      message: {
        type: String,
      },
    },
  ],
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
        required: "password is required",
        validate: [
          validations.validatePassword,
          "Please fill a valid password",
        ],
      },
      teacherMobile: {
        type: Number,
        min: 6000000000,
        max: 9999999999,
      },
      deviceToken: {
        type: String,
      },
      loginId:{
        type:String,
        required: true
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
      notification: [
        {
          message: {
            type: String,
          },
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
        minlength: 5,
        maxlength: 50,
        validate: [
          validations.validateEmail,
          "Please fill a valid email address",
        ],
      },
      studentMobile: {
        type: Number,
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
        required: "password is required",
        validate: [
          validations.validatePassword,
          "Please fill a valid password",
        ],
      },
      deviceToken: {
        type: String,
      },
      loginId:{
        type:String,
        required: true
      },
      notification: [
        {
          message: {
            type: String,
          },
        },
      ],
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
      questionDateTime: {
        type: String,
      },
      questionAskerName: {
        type: String,
      },
      questionAskerRole: {
        //teacher or student
        type: String,
      },
      questionAskerCode: {
        // Teacher Code or roll no.
        type: String,
      },
      questionForClass: {
        type: String,
      },
      questionForSection: {
        type: String,
      },
      active: {
        type: Boolean,
        default: 1,
      },
      replies: [
        {
          reply: {
            type: String,
            minlength: 2,
            maxlength: 5000,
          },
          replyDateTime: {
            type: String,
          },
          replierName: {
            type: String,
          },
          replierRole: {
            type: String,
          },
          replierCode: {
            type: String,
          },
          replierClass: {
            //only when student
            type: String,
          },
          replierSection: {
            //only when student
            type: String,
          },
          active: {
            type: Boolean,
            default: 1,
          },
        },
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
      active: {
        type: Boolean,
        default: 1,
      },
      createdAt: {
        type: String,
      },
      updatedAt: {
        type: String,
      },
      scheduleDate: {
        type: String,
      },
      scheduleTime: {
        type: String,
      },
      description: {
        type: String,
      },
      studentCount: {
        type: Boolean,
        default: 0,
      },
      selectedStudents: [
        {
          studentId:{
            type:String
          }
        },
      ],
    },
  ],
  assignment: [
    {
      teacherCode: {
        type: String,
      },
      assignmentTitle:{
type:String
      },
      classAssignment: {
        type: String,
      },
      sectionAssignment: {
        type: String,
      },
      subjectAssignment: {
        type: String,
      },
      active: {
        type: Boolean,
        default: 1,
      },
updatedAt:{
  type:String
},
      assignmentDate: {
        type: String,
      },
      assignmentTime: {
        type: String,
      },
      description: {
        type: String,
      },
      file:{
        type:String
      },
      selectedStudents: [
        {
          studentId:{
            type:String
          },
          teacherRemark:{
            type:String
          },
          active: {
            type: Boolean,
            default: 1,
          },
          studentDescription:{
            type:String
          },
          studentFile:{
            type:String
          },
          submitDate:{
            type:String
          },
          submitTime:{
            type:String
          }
        },
      ],

    },
  ],
});

//@ hasing orgPassword
orgSchema.pre("save", function (next) {
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
orgSchema.methods.comparePassword = function (password, role, loginId) {
  console.log(role);
  if (role == "Organisation") {
    return bcrypt.compareSync(password, this.orgPassword);
  } else if (role == "Teacher" || role == "teacher") {
    const teacherIndex = _.findIndex(this.orgTeachers, {
     loginId:loginId
    });
    hashPassword = this.orgTeachers[teacherIndex].teacherPassword;
    return bcrypt.compareSync(password, hashPassword);
  } else if (role == "Student") {
    const StudentIndex = _.findIndex(this.orgStudent, {
      loginId:loginId
    });
    hashPassword = this.orgStudent[StudentIndex].studentPassword;
    return bcrypt.compareSync(password, hashPassword);
  }
};

//@ generate jwt auth token
orgSchema.methods.generateAuthToken = function (role, loginId,email) {
  var user = this;
  var access = "auth";
  if (role == "Organisation") {
    var token = jwt
      .sign(
        {
          email:user.orgEmail,
          loginId:user.loginId,
          role:user.role,
          access,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d", //token expiry time 15days = 1296000 seconds
        }
      )
      .toString();
  } else if (role == "Teacher") {
    var token = jwt
      .sign(
        {
          email,
          loginId,
          role,
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
          email,
          loginId,
          role,
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
