app.put("/students/update", upload.single("studentphoto"), async (req, res) => {
    const studentId = req.body.id;
    const datatopass = {
      fname: req.body.fname,
      lname: req.body.lname,
      fathername: req.body.fathername,
      occupation: req.body.occupation,
      dob: req.body.dob,
      gender: req.body.gender,
      stndrd: req.body.stndrd,
      phone: req.body.phone,
      address: req.body.address,
    };
  
    const photo = req.file;
    try {
      const student = await students.findById(studentId);
      if (!student) {
        return res.status(404).send("Student not found");
      }
  
      // Create base connectData object
      let connectData = { ...datatopass };
  
      if (photo) {
        const s3Key = `${Date.now()}_${photo.originalname}`;
        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
          Body: photo.buffer,
          ContentType: photo.mimetype,
        };
  
        s3.upload(uploadParams, async (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).send(err);
          }
  
          // Delete the old photo
          const oldPhotoUrl = student.photo;
          const oldS3Key = oldPhotoUrl.split('/').pop();
  
          const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: oldS3Key,
          };
  
          s3.deleteObject(deleteParams, async (delErr, delData) => {
            if (delErr) {
              console.error(delErr);
              return res.status(500).send(delErr);
            }
  
            connectData.photo = data.Location;
  
            await students.findByIdAndUpdate(studentId, connectData, { new: true })
              .then(updatedStudent => res.json(updatedStudent))
              .catch(updateErr => res.status(500).send(updateErr));
          });
        });
      } else {
        await students.findByIdAndUpdate(studentId, connectData, { new: true })
          .then(updatedStudent => res.json(updatedStudent))
          .catch(updateErr => res.status(500).send(updateErr));
      }
    } catch (err) {
      res.status(500).send(err);
    }
  });
  