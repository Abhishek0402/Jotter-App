                organisation.findOne({orgCode}).then(async orgExists =>{
                    if(orgExists){
                        await registerController.read(file.originalname).then(async data => {
                            await registerController.csvParser(data.Body.toString()).then(async data => {
                                console.log(data);
                                req.addClass = await JSON.stringify(data, null, 2);
                                var arr = JSON.parse(req.addClass);
                                console.log(arr);



                                
                const orgTeachers = await arr.map((item) => {

                    var classes = new Array();
                    var classSeperator= _.split(item.class_section_subjects,',');
                    var classLength = classSeperator.length;
                    for(var classFinder in classSeperator){
                    var classNewFind = _.split(classSeperator[classFinder],'_');
                    var classNewFindLength = classNewFind.length;
                    var teacherClass = classNewFind[0];
                    var teacherSection = classNewFind[1];

                    classNewFind = _.reverse(classNewFind);
                    var subjects = new Array();

                    for(var i=0;i<classNewFindLength-2;i++){
                    subjects.push({subject :classNewFind[i]});
                    }
                classes.push({
                    teacherClass: teacherClass,
                    teacherSection: teacherSection,
                    teachingSubjects: subjects
                });
                }

                
                // classes has class section subjects;
                    orgExists.orgTeachers.push({
                        teacherName: item.name,
                        teacherAge: item.age,
                        teacherDesignation: item.designation,
                        teacherCode: item.code,
                        teacherGender: item.gender,
                        role: role,
                        teacherEmail: item.email,
                teacherPassword:item.name+"@123",
                teacherMobile:item.mobile,
                teachingClasses: classes
                       });
                });

                     console.log(orgExists);

                             }).catch(err => console.log(err));
                        }).catch(err => console.log(err));

                      orgExists.save().then(teacherCreated => {
                          console.log("teacherCreated");
                          res.send(teacherCreated);
                      }).catch(err=>console.log(err));

                    }



                    else{
                        console.log("invalid org Code");
                        res.send({
                            "message":"invalid_org_code"
                        });
                    }
                 }).catch(err=>console.log(err));

                     
   
         
   
                               
                               var codeArray = new Array();
                               var mobileArray = new Array();
                               var emailArray = new Array();
   var newTeacherList = new Array();
   var newUserList = new Array();
   

                              
                           
   
                               
                                    
                                      
                                
                                       else if (
                                         codeArray.includes(item.code) ||
                                         mobileArray.includes(item.mobile) ||
                                         emailArray.includes(item.email)
                                       ) {
                                         console.log("redundant data");
                                         console.log(`${item.code}  ${item.email} ${item.mobile}`);
                                         res.send({
                                           error: `redundant entry at line ${item.sno}`,
                                           message: "invalid_entry",
                                         });
                                       } 
                                    
                                     }
   
                                




                                 codeArray.push(item.code);
                                 mobileArray.push(item.mobile);
                                 emailArray.push(item.email);
            



                                 
   
   console.log(codeArray);
   console.log(emailArray);
   console.log(mobileArray);
   console.log(newTeacherList);
   console.log(newUserList);
                               console.log("jh"+orgExists);
                               console.log("gh"+orgExistsForCsvTeacher);
                            
   
   
   
                         
   
   
   
   
   
                               const orgTeachersMap = await arr.map((item) => {
       
                                //class section subject seperator
                                var classes = new Array();
                                var classSeperator = _.split(
                                  item.class_section_subjects,
                                  ","
                                );
                                var classLength = classSeperator.length;
                                for (var classFinder in classSeperator) {
                                  var classNewFind = _.split(
                                    classSeperator[classFinder],
                                    "_"
                                  );
                                  var classNewFindLength = classNewFind.length;
                                  var teacherClass = classNewFind[0];
                                  var teacherSection = classNewFind[1];
                                  var subjects = new Array();
                                  for (var i = 2; i < classNewFindLength; i++) {
                                    subjects.push({ subject: classNewFind[i] });
                                  }
                                  classes.push({
                                    teacherClass: teacherClass,
                                    teacherSection: teacherSection,
                                    teachingSubjects: subjects,
                                  });
                                }

                                userData
                                .findOne({
                                  user: { $elemMatch: { mobile: item.mobile } },
                                })
                                .then((userMobileExists) => {

                                 if (userMobileExists) {
                                   console.log(
                                     "mobile Already existing in user table"
                                   );
                                   res.send({
                                     error: `${item.mobile} mobile no. already exists in user table`,
                                     message: "invalid_entry",
                                   });
                                 } else {
                                   console.log("mobile not present");
                                   var emailExists = _.findIndex(
                                     orgExistsForCsvTeacher.orgTeachers,
                                     {
                                       teacherEmail: item.email,
                                     }
                                   );
                                   console.log(emailExists);
                                   var mobileExists = _.findIndex(
                                     orgExistsForCsvTeacher.orgTeachers,
                                     {
                                       teacherMobile: item.mobile,
                                     }
                                   );
                                   console.log(mobileExists);
                                   var teacherCodeExists = _.findIndex(
                                     orgExistsForCsvTeacher.orgTeachers,
                                     {
                                       teacherCode: item.code,
                                     }
                                   );
                                   console.log(teacherCodeExists);
                                   if (emailExists >= 0) {
                                     console.log("email exists");
                                     res.send({
                                       error: `${item.email} email already exists`,
                                       message: "invalid_entry",
                                     });
                                   } else if (mobileExists >= 0) {
                                     console.log("mobile exists");
                                     res.send({
                                       error: `${item.mobile} mobile no. already exists`,
                                       message: "invalid_entry",
                                     });
                                   } else if (teacherCodeExists >= 0) {
                                     console.log("teacher code exists");
                                     res.send({
                                       error: `${item.code} teacher code already exists`,
                                       message: "invalid_entry",
                                     });
                                   } 

                                   else {
                                     console.log("work in progess");
                                    return {
                                       teacherName: item.name,
                                       teacherAge: item.age,
                                       teacherDesignation: item.designation,
                                       teacherCode: item.code,
                                       teacherGender: item.gender,
                                       role: item.role,
                                       teacherEmail: item.email,
                                       teacherPassword: item.name + "@AB12",
                                       teacherMobile: item.mobile,
                                       teachingClasses: classes,
                                     };
                                     
                                   }

                                 }
                               })
                               .catch((err) => console.log(err.message));

});
   
   
   
console.log(orgTeachersMap);
orgExistsForCsvTeacher.save()
                         .then((teachersAdded) => {
                           console.log("teacher list added");
                           orgExists
                             .save()
                             .then((teacherCreated) => {
                               console.log("user added");
                               res.send({
                                 message: "teachers_added",
                               });
                             })
                             .catch((err) => {
                               console.log(err.message);
                               res.send({
                                 message: "invalid_entry",
                               });
                             });
                         })
                         .catch((err) => {
                           console.log(err.message);
                           res.send({
                             message: "invalid_entry",
                           });
                         });

   
                  
                         orgFoundForTeacher.orgTeachers.push({
                
                          teacherName: item.name,
                          teacherAge: item.age,
                          teacherDesignation: item.designation,
                          teacherCode: item.code,
                          teacherGender: item.gender,
                          role: item.role,
                          teacherEmail: item.email,
                    teacherPassword:item.name+"@123",
                    teacherMobile:item.mobile,
                    teachingClasses: classes
                        
                      });
                      orgExists.user.push({
                    role:item.role,
                    mobile:item.mobile
                      })    