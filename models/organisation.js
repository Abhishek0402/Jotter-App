var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
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
    max: 9999999999
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
          subjects:{
            type:String
          }
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
      teacherAge:{
          type: Number,
          min: 18,
          max: 100
      },
      teacherDesgination:{
          type: String
      },
      teacherCode:{
          type: String,
          unique:true,
      },
      teacherGender:{
          type: String
      },
      role:{
          type: String
      },
      active: {
        type: Boolean,
        default: 1, // 1 - active, 0 - not active
      },
      teacherEmail:{
        type: String,
        unique:true,
        minlength: 5,
        maxlength: 50,
        validate: [validations.validateEmail, "Please fill a valid email address"],
      },
      teacherPassword:{
 type: String,
    minlength: 8,
    maxlength: 5000,
    trim: true,
    required: "password is required",
    validate: [validations.validatePassword, "Please fill a valid password"],
      },
      teacherMobile:{
        type: Number,
        unique:true,
        min: 6000000000,
        max: 9999999999
      },
      teachingClasses:[
          {
             teacherClass:{ 
                type: String,
             },
             teacherSection:{
                type: String,
             },
             teachingSubjects :[
                 {
                   subject:{
                       type:String
                   } 
                 }
             ]
          }
      ],
      schedules:[
          {
              topicScheduled:{
                  type:String
              },
              subjectScheduled:{
                  type:String
              },
              classScheduled:{
                  type:String
              },
              sectionSchedules:{
                  type:String
              },
             date:{
                 type: String
             },
             time:{
                 type:String
             },
             selectedStudents:[
                 {
                     AllOrSomeSelected:{
type:Boolean,
default:1 //1 - all, 0 - selected
                     },
                     studentsName:{
                         type: String
                     },
                     studentRollNO:{
                         type:String
                     }
                 }
             ],
          }
      ],

    }
  ],
  orgStudent:[
      {
          studentName:{
                type: String,
        trim: true,
        minlength: 2,
        maxlength: 50,
          },
studentRollNo:{
    type:String
},
studentClass:{
    type: String
},
studentSection:{
    type:String
},
studentFatherName:{
    type:String
},
role:{
    type:String
},
 active: {
        type: Boolean,
        default: 1, // 1 - active, 0 - not active
      },
      studentEmail:{
        type: String,
        minlength: 5,
        maxlength: 50,
        validate: [validations.validateEmail, "Please fill a valid email address"],
      },
     studentMobile:{
        type: Number,
        min: 6000000000,
        max: 9999999999
      },
      studentDOB:{
          type:String
      },
      studentGender:{
          type:String
      },
      studentPassword:{
        type: String,
    minlength: 8,
    maxlength: 5000,
    trim: true,
    required: "password is required",
    validate: [validations.validatePassword, "Please fill a valid password"],
      }
      }
  ],
  questionaire:[{
      purposeOfQuestion:{  //subject or other
          type:String
      },
      subject:{ //subject in which question is asked
          type:String
      },
      questionId:{
type:  mongoose.ObjectId
      },
       question:{
                  type:String,
                  minlength: 2,
                  maxlength:500
              },
              date:{
                  type:String
              },
              time:{
                  type:String
              },
              questionAskedBy:{ //teacher or student
                  type:String
              },
              askingPersonCode:{   // Teacher Code or roll no.
                  type:String
              },
              QuestionShowToClass:{
                  type:String
              },
              questionShowToSection:{
                  type:String
              },
              replies:[{
                  answer:{
                      type:String,
                      minlength:2,
                      maxlength:5000
                  },
                  replyDate:{
                      type:String
                  },
                  replyTime:{
                      type:String
                  },
                  replier:{
                    type:String
                  },
                  replierCode:{
                      type:String
                  }
              }]
  }]
});

orgSchema.pre('save', function (next) { //can be said as a model method applicable on single document
  const user = this;
  if(user.role=="Organisation"){
    if (!user.isModified('orgPassword')) {
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
orgSchema.methods.comparePassword = function (password,role) { //instance method for a single document
  console.log(role);
 if(role=="Organisation"){
  return bcrypt.compareSync(password, this.orgPassword); // returns true or false
 }
 
  
};

//@ generate jwt auth token
orgSchema.methods.generateAuthToken = function (role) { //instance method have access for a single document
  var user = this;
  console.log(role);
  console.log(user);
  console.log("hello");
  var access = 'auth';
  if(role=="Organisation"){
    var token = jwt.sign({
      mobile: user.Orgmobile,
      access
  }, process.env.JWT_SECRET, { 
      expiresIn: '7d' //token expiry time 15days = 1296000 seconds
  }).toString();
  }
  else if(role=="Teacher"){

  }
  else if(role == "Student"){


  }

  return user.save().then(()=>{
      return token;
  });
};

var org = mongoose.model("org", orgSchema);
module.exports = org;