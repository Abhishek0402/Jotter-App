
          //  else if(role === "Class" && methodToCreate === "File"){
          //      const file = req.file;
          // const {orgCode} = req.body;
          // organisation.findOne({orgCode}).then(async orgExists =>{
          //     if(orgExists){

          //      await registerController.read(file.originalname).then(async data => {
          //         await registerController.csvParser(data.Body.toString()).then(async data => {
          //             console.log(data);
          //             req.addClass = await JSON.stringify(data, null, 2);
          //             var arr = JSON.parse(req.addClass);
          //             console.log(arr);
          // console.log(orgExists);
          //             const orgClasses = await arr.map((item) => {
          //                 var teachSubject = _.split(item.subjects,",");
          //                 var orgSubjects = new Array();
          //                 for(var i in teachSubject){
          // orgSubjects.push({
          //     subjects: teachSubject[i]
          // });
          //                 }
          //                 console.log(orgSubjects);
          // orgExists.orgClasses.push({
          // orgClass:item.orgClass,
          // orgSection:item.orgSection,
          // orgSubjects: orgSubjects

          // })
          //     });
          // // console.log(orgClasses);
          //          }).catch(err => console.log(err));
          //     }).catch(err => console.log(err));

          //     //    console.log(orgExists);
          //     //   orgExists.orgClasses.push(orgClasses);
          //       console.log("new Line");
          //       console.log("new Line");
          //       console.log("new Line");
          //       console.log("new Line");
          //       console.log(orgExists);
          //       orgExists.save().then(classCreated => {
          //           console.log("classCreated");
          //           res.send(classCreated);
          //       }).catch(err=>console.log(err));
          //     }
          //     else{
          //         console.log("invalid org Code");
          //         res.send({
          //             "message":"invalid_org_code"
          //         });
          //     }
          // }).catch(err=>console.log(err));
          //      }

          //      else{
          //         console.log("existing user");
          //         res.send({
          //             message: "user_already_exist"
          //         });
          //      }