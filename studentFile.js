// else if(role==="Student" && methodToCreate ==="File"){
                //     const file = req.file;
                //     const {orgCode} = req.body;
                //     organisation.findOne({orgCode}).then(async orgExists =>{
                //         if(orgExists){

                //          await registerController.read(file.originalname).then(async data => {
                //             await registerController.csvParser(data.Body.toString()).then(async data => {
                //                 console.log(data);
                //                 req.addClass = await JSON.stringify(data, null, 2);
                //                 var arr = JSON.parse(req.addClass);

                //                 const orgClasses = await arr.map((item) => {
                    orgExists.orgStudent.push({
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
                studentPassword: item.name+"@AB12",

                    });
                //         });
                //     // console.log(orgClasses);
                //              }).catch(err => console.log(err));
                //         }).catch(err => console.log(err));

                //           orgExists.save().then(studentCreated => {
                //               console.log("studentCreated");
                //               res.send(studentCreated);
                //           }).catch(err=>console.log(err));
                //         }
                //         else{
                //             console.log("invalid org Code");
                //             res.send({
                //                 "message":"invalid_org_code"
                //             });
                //         }
                //     }).catch(err=>console.log(err));