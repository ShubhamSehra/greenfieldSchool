import React, { useEffect, useState } from "react";
import Card from "./Card";
import "./background.css";
import {  Form, InputGroup } from "react-bootstrap";
import axios from "axios"
import { useSearchParams } from "react-router-dom";

function Students() {
  const [student, setStudent] = useState([]);
  
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect (() =>{
    const getData = async() =>{
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/students`)
        
        setStudent(response.data)
      } catch (error) {
        console.log(error);
        
      }
    }
    getData()
  },[])
  // useEffect(() => { 
  //   fetch(`${process.env.REACT_APP_API_URL}/api/students`)
  //   .then((res) => { 
  //     if (!res.ok) { 
  //       throw new Error(`HTTP error! status: ${res.status}`); 
  //     } 
  //     return res.json(); 
  //   })
  //   .then((jsonres) => setStudent(jsonres))
  //   .catch((error) => {  
  //     console.error('Error fetching students:', error); 
  //   }); 
  // }, [])

  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_URL}/students`)
  //     .then((res) => {
  //       if (!res.ok) {
  //         throw new Error(`HTTP error! status: ${res.status}`);
  //       }
  //       return res.json();
  //     })
  //     .then((jsonres) => setStudent(jsonres))
  //     .catch((error) => {
  //       console.error('Error fetching students:', error);
  //     });
  // }, []);
  

  function createCard(stndt) {
    return (
      <Card
        id={stndt._id}
        fname={stndt.fname}
        lname={stndt.lname}
        photo={stndt.photo}
        father={stndt.fathername}
        stndrd={stndt.stndrd}
        phone={stndt.phone}
      />
    );
  }

  return (
    <div className="container">
     
      <div className="fixdshit" >

        <InputGroup className="m-3" size="lg " style={{width: "85%"}} >
          
          <Form.Control className=""
            value={searchParams.get("filter") || ""}
            onChange={(e) => {
              const filter = e.target.value;
              if (filter) {
                setSearchParams({ filter });
              } else {
                setSearchParams({});
              }
            }}
            placeholder="Search students..."
            
          />
        </InputGroup>
      </div>
     

      <br />
  

      {student
        .filter((student) => {
          const filter = searchParams.get("filter");
          if (!filter) return true;
          const name = student.fname.toLowerCase();
          return name.startsWith(filter.toLowerCase());
        })
        .map(createCard)}
    </div>
  );
}

export default Students;
