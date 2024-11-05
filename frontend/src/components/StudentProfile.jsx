import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Stprofile from './Stprofile';
import axios from 'axios';

function StudentProfile() {
  const { studentId } = useParams();
  const [studentData, setStudent] = useState({});

  useEffect(() => {
    const getStudent = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/students`);
        const res = response.data.find(found => found._id === studentId);
        setStudent(res);
      } catch (error) {
        console.log(error);
      }
    };

    getStudent();
  }, [studentId]);

  return (
    <div className='container mt-4'>
      <Stprofile
        studentData={studentData}
        id={studentData._id}
        photo={studentData.photo}
        fname={studentData.fname}
        lname={studentData.lname}
        fathername={studentData.fathername}
        stndrd={studentData.stndrd}
        dob={studentData.dob}
        gender={studentData.gender}
        enroll={studentData.enrollDate}
        phone={studentData.phone}
        address={studentData.address}
        occupation={studentData.occupation}
      />
    </div>
  );
}

export default StudentProfile;
