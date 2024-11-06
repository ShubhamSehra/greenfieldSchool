require ('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const AWS = require('aws-sdk')
const app = express();


const PORT = process.env.PORT || 5000
// app.use(cors())
app.use(cors({
  origin: 'https://thegreenfield.netlify.app',
  credentials: true
}));


app.use(express.json());

//*** db has my id passs  **** */

const db = process.env.SERVER_KEY;

mongoose.connect(db);

const studentSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  fathername: String,
  occupation: String,
  dob: String,
  gender: String,
  enrollDate: String,
  stndrd: Number,
  phone: Number,
  address: String,
  photo: String,
});

const students = mongoose.model("students", studentSchema);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
})


const upload = multer({ storage: multer.memoryStorage() });



app.post("/newentry", upload.single("photo"), (req, res) => {
  const photo = req.file;
  const s3Key = `${Date.now()}_${photo.originalname}`;
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: photo.buffer,
        ContentType: photo.mimetype
      };

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    const cloudFrontUrl = `https://d1xsh7xuma8guz.cloudfront.net/${s3Key}`;
    

    const newStudent = new students({
      fname: req.body.fname,
      lname: req.body.lname,
      fathername: req.body.fathername,
      occupation: req.body.occupation,
      dob: req.body.dob,
      gender: req.body.gender,
      enrollDate: req.body.enrollDate,
      stndrd: req.body.stndrd,
      phone: req.body.phone,
      address: req.body.address,
      photo: cloudFrontUrl,  // Save S3 URL
    });

    newStudent.save()
      .then(() => res.status(201).send("Student added successfully."))
      .catch(err => res.status(500).send(err));
  });
});

app.get("/students", (req, res) => {
  students.find().then((foundUser) => res.json(foundUser));
});

app.get("/", (req, res) => {
  res.send("Hello world");
});
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

  // Create a base connectData object
  let connectData = {
    fname: datatopass.fname,
    lname: datatopass.lname,
    fathername: datatopass.fathername,
    occupation: datatopass.occupation,
    dob: datatopass.dob,
    gender: datatopass.gender,
    stndrd: datatopass.stndrd,
    phone: datatopass.phone,
    address: datatopass.address,
  };

  // If a new photo is uploaded, handle it
  if (photo) {
    const s3Key = `${Date.now()}_${photo.originalname}`;
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: photo.buffer,
      ContentType: photo.mimetype
    };

    s3.upload(uploadParams, async (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }

      const cloudFrontUrl = `https://d1xsh7xuma8guz.cloudfront.net/${s3Key}`;
      connectData.photo = cloudFrontUrl; // Add the CloudFront URL to the connectData object

      await students.findByIdAndUpdate(studentId, connectData, { new: true })
        .then(updatedStudent => res.json(updatedStudent))
        .catch(err => res.status(500).send(err));
    });
  } else {
    // If no new photo is uploaded, just update other fields
    await students.findByIdAndUpdate(studentId, connectData, { new: true })
      .then(updatedStudent => res.json(updatedStudent))
      .catch(err => res.status(500).send(err));
  }
});



app.delete("/students/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const student = await students.findById(id);
    if (!student) {
      return res.status(404).send("Student not found");
    }

    const photoUrl = student.photo;
    const s3Key = photoUrl.split('/').pop();

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    s3.deleteObject(deleteParams, async (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }

      await students.findByIdAndRemove(id);
      res.send("Student and photo deleted successfully");
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(PORT, (req, res) => {
  console.log(`we are online at ${PORT}`);
});
