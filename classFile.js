
           else if(role === "Class" && methodToCreate === "File"){
               const file = req.file;
          const {orgCode} = req.body;
          organisation.findOne({orgCode}).then(async orgExists =>{
              if(orgExists){

               await registerController.read(file.originalname).then(async data => {
                  await registerController.csvParser(data.Body.toString()).then(async data => {
                      console.log(data);
                      req.addClass = await JSON.stringify(data, null, 2);
                      var arr = JSON.parse(req.addClass);
                      console.log(arr);
          console.log(orgExists);
                      const orgClasses = await arr.map((item) => {
                          var teachSubject = _.split(item.subjects,",");
                          var orgSubjects = new Array();
                          for(var i in teachSubject){
          orgSubjects.push({
              subjects: teachSubject[i]
          });
                          }
                          console.log(orgSubjects);
          orgExists.orgClasses.push({
          orgClass:item.orgClass,
          orgSection:item.orgSection,
          orgSubjects: orgSubjects

          })
              });
          // console.log(orgClasses);
                   }).catch(err => console.log(err));
              }).catch(err => console.log(err));

              //    console.log(orgExists);
              //   orgExists.orgClasses.push(orgClasses);
                console.log("new Line");
                console.log("new Line");
                console.log("new Line");
                console.log("new Line");
                console.log(orgExists);
                orgExists.save().then(classCreated => {
                    console.log("classCreated");
                    res.send(classCreated);
                }).catch(err=>console.log(err));
              }
              else{
                  console.log("invalid org Code");
                  res.send({
                      "message":"invalid_org_code"
                  });
              }
          }).catch(err=>console.log(err));
               }

               else{
                  console.log("existing user");
                  res.send({
                      message: "user_already_exist"
                  });
               }


              organisation
                .findOne({
                  orgCode
                })
                .then(async (orgFoundForStudent) => {
                  if (orgFoundForStudent) {
                    console.log("start processing csv file for students");

                    await registerController
                      .read(file.originalname)
                      .then(async (data) => {
                        await registerController
                          .csvParser(data.Body.toString())
                          .then(async (data) => {
                            req.addClass = await JSON.stringify(data, null, 2);
                            var arr = JSON.parse(req.addClass);

                            var dataLength = arr.length;
                            var c = 0;
                            var rollNoArray = new Array();
                            var mobileArray = new Array();
                            var emailArray = new Array();

                            const orgStudentMap = await arr.map((item) => {
                             var studentMobile = item.mobile;
                              var mobilePresentStudent = _.findIndex(orgFoundForStudent.orgStudent,{
                                studentMobile: item.mobile
                              });

                              console.log(orgFoundForStudent.orgStudent);
                              console.log("mobile "+ item.mobile + " " +mobilePresentStudent); 
                              var emailPresent = _.findIndex(
                                orgFoundForStudent.orgStudent,
                                {
                                  studentEmail: item.email,
                                }
                              );
                              console.log(`email is ${emailPresent}`);
                              var rollNoPresent = _.findIndex(
                                orgFoundForStudent.orgStudent,
                                {
                                  studentRollNo: item.rollNo,
                                }
                              );

                              if (
                                rollNoArray.includes(item.rollNo) ||
                                mobileArray.includes(item.mobile) ||
                                emailArray.includes(item.email)
                              ) {
                                console.log("redundant data");
                                console.log(
                                  `${item.rollNo}  ${item.email} ${item.mobile}`
                                );
                                res.send({
                                  error: `redundant entry at line ${item.sno}`,
                                  message: "invalid_entry",
                                });
                              } else {
                                if (mobilePresentStudent >= 0) {
                                  console.log("mobile present");
                                  res.send({
                                    mistake: `${item.mobile} already exists`,
                                    message: "invalid_entry",
                                  });
                                } else {
                                  if (emailPresent >= 0) {
                                    console.log("email present");
                                    res.send({
                                      mistake: `${item.email} already exists`,
                                      message: "invalid_entry",
                                    });
                                  } else {
                                    if (rollNoPresent >= 0) {
                                      console.log("student roll no. present");
                                      res.send({
                                        mistake: `${item.rollNo} already exists`,
                                        message: "invalid_entry",
                                      });
                                    } else {
                                      c++;
                                    }
                                  }
                                }
                              }
                              rollNoArray.push(item.rollNo);
                              mobileArray.push(item.mobile);
                              emailArray.push(item.email);
                            }); //map ends

                            //new map
                            if (c == dataLength) {
                              const orgStudentEntryMap = await arr.map((item) => {
                               
                               var studentPassword = item.name + "@AB12";

                                studentPassword = bcrypt.hashSync(
                                  studentPassword,
                                  10
                                );

                                orgFoundForStudent.orgStudent.push({
                                  studentName:item.name,
                                  studentRollNo: item.rollNo,
                                  studentClass:item.studentClass,
                                  studentSection:item.section,
                                  studentFatherName: item.fatherName,
                              role: item.role,
                              studentEmail:item.email,
                              studentMobile:item.mobile,
                              studentDOB: item.dob,
                              studentGender:item.gender,
                              studentPassword: studentPassword,
                                });
                                orgExists.user.push({
                                  role: item.role,
                                  mobile: item.mobile,
                                });
                              });
                            }
                          });
                      })
                      .catch((err) => console.log(err.message))
                      .catch((err) => console.log(err.message));

                      orgFoundForStudent
                      .save()
                      .then((studentAdded) => {
                        console.log("student list added");
                        orgExists
                          .save()
                          .then((studentCreated) => {
                            console.log("user added");
                            res.send({
                              message: "students_added",
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





                  } else {
                    console.log("orgCode not found");
                    res.send({
                      message: "invalid_orgCode",
                    });
                  }
                })
                .catch((err) => {
                  console.log(err.message);
                });