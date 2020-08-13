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