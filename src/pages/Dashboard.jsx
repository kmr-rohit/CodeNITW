import { getAuth, updateProfile } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  deleteDoc,
  addDoc,
  doc,
  getDocs,
  getDoc,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import PerformanceChart from "./PerformanceChart";



export default function Dashboard() {
  const [xData, setXData] = useState([]);
  const [yData, setYData] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchContestRanks() {
      const xDataArray = [];
      const yDataArray = [];
      const xDataArrayasTimestamp = [];
      const contestIdArray = [];
      try {
        const userCollectionRef = collection(db, "users");
        const userDocRef = doc(userCollectionRef, auth.currentUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        const userDocData = userDocSnapshot.data();
        setFormData({
          name: userDocData.name || "",
          email: userDocData.email || "",
          rollno: userDocData.rollno || "",
          course: userDocData.course || "",
          year: userDocData.year || "",
          cfhandle: userDocData.cfhandle || "",
          lchandle: userDocData.lchandle || "",
        });
        const contestRanksCollectionRef = collection(db, "contestRanks");
        const orderedQuery = query(contestRanksCollectionRef, orderBy("contestDate"));
        
        try {
          const querySnapshot = await getDocs(orderedQuery);
          querySnapshot.forEach((doc) => {
            const contestRanks = doc.data();
            const ranks = contestRanks.ranks;
              contestIdArray.push(contestRanks.contestId);
              xDataArrayasTimestamp.push(contestRanks.contestDate);
              for(let rankItem of ranks){
                if(rankItem.userId === userDocData.cfhandle){
                  yDataArray.push(rankItem.rank);
                }
              }
            
          });
          // converting date into string 
          for(let item of xDataArrayasTimestamp){
            const date = new Date(item * 1000);
            // xDataArray.push(date.toDateString());
            xDataArray.push(date);
          }
                    console.log(contestIdArray);
          console.log(xDataArray);
          console.log(yDataArray);
        } catch (error) {
          console.error("Error fetching contest ranks:", error);
        }
        setXData(xDataArray);
        setYData(yDataArray);
      } catch (error) {
        console.error("Error fetching contest ranks:", error);
      }
    }
    fetchContestRanks();
  }, [auth.currentUser]);


  const [formData, setFormData] = useState({
    name: user ? user.displayName : "",
    email: user ? user.email : "",
  });

  const { name, email } = formData;
  //console.log(name);
  

  return (
    <>
    <div className=" px-[20px] bg-blue-50 min-h-screen font-serif ">
    
      <section className="max-w-2xl mx-auto pt-[10px] text-red-600">
        <h2 className="text-black text-3xl  text-center  cursive">{name}'s Personal Data</h2>
        <h2 className="text-2xl text-left  cursive">Name : {name}</h2>
        <h2 className="text-2xl text-left   cursive">Email : {email}</h2>
        <h2 className="text-2xl text-left   cursive">Roll No : {formData.rollno}</h2>
        <h2 className="text-2xl text-left   cursive">Course : {formData.course}</h2>
        <h2 className="text-2xl text-left   cursive">Year : {formData.year}</h2>
        <h2 className="text-2xl text-left   cursive">Codeforces Handle : {formData.cfhandle}</h2>
        <h2 className="text-2xl text-left   cursive">Leetcode Handle : {formData.lchandle}</h2>
      </section>
      
    
      <section className="max-w-2xl mx-auto flex justify-center items-center flex-col ">
      <h2 className="text-3xl text-center mt-[50px] cursive">{name}'s Performance Chart</h2>
        <div className="m-[150px] w-[100%] mt-[10px]">
          <PerformanceChart
            name={name}
            timeData={xData}
            rankData={yData}
          />
        </div>
      </section>
    </div>
    
    </>
  );
}