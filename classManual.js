          const {orgCode,orgClasses} = req.body;
          
          organisation.findOne({orgCode}).then(orgExists =>{
          if(orgExists){
          const {class_section_subject}= req.body;
          var classes = new Array();

          // console.log(class_section_subject);

          var classSeperator= _.split(class_section_subject,',');
          // console.log(classSeperator);
          for(var classFinder in classSeperator){
          // console.log(classSeperator[classFinder]);
          var classNewFind = _.split(classSeperator[classFinder],'_');
          var classNewFindLength = classNewFind.length;
          var orgClass = classNewFind[0];
          var orgSection = classNewFind[1];
          classNewFind = _.reverse(classNewFind);
          var Subject = new Array();

          for(var i=0;i<classNewFindLength-2;i++){
              Subject.push({subjects: classNewFind[i]});
          }
          console.log(Subject);
          orgExists.orgClasses.push({
              orgClass: orgClass,
              orgSection: orgSection,
              orgSubjects: Subject
          });

          }

              // orgExists.orgClasses.push({
              //    orgClasses:classes
              // });
              // orgExists.orgClasses = classes;
                 orgExists.save().then(ClassCreated =>{
                     console.log(ClassCreated);
                     res.send(ClassCreated);
                 }).catch(err=> console.log(err.message));

          }
          else{
              console.log("Invalid orgCode");
              res.send({
                  message: "Invalid_orgCode"
              });
          }
          }).catch(err=>console.log(err));
