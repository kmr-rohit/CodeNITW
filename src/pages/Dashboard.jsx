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
  
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    cfhandle: formData.cfhandle,
    lchandle: formData.lchandle,
  });

  const handleInputChange = (event) => {
    setEditData({
      ...editData,
      [event.target.name]: event.target.value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const userCollectionRef = collection(db, "users");
      const userDocRef = doc(userCollectionRef, auth.currentUser.uid);
      let updateData = {};
      if (editData.cfhandle) {
        updateData.cfhandle = editData.cfhandle;
      }
      if (editData.lchandle) {
        updateData.lchandle = editData.lchandle;
      }
      if (Object.keys(updateData).length > 0) {
        await updateDoc(userDocRef, updateData);
        toast.success("Handles updated successfully!. Reload page to see changes");
      }
    } catch (error) {
      console.error("Error updating handles:", error);
      toast.error("Error updating handles.");
    }
  };

  return (
    <>
    <div className=" px-[20px] bg-blue-50 min-h-screen font-serif ">
    <section className="max-w-2xl mx-auto pt-10 text-black-400 bg-blue-50 p-6 rounded-lg shadow-lg">
  <div className="bg-white shadow-md rounded-lg p-6 hover:bg-blue-100 transition-colors duration-200">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <h2 className="text-2xl font-cursive hover:text-blue-500 transition-colors duration-200">Name: <span className="text-gray-400">{name}</span> </h2>
        <h2 className="text-2xl font-cursive hover:text-blue-500 transition-colors duration-200">Roll No: <span className="text-gray-400">{formData.rollno}</span></h2>
        <h2 className="text-2xl font-cursive hover:text-blue-500 transition-colors duration-200">Course:<span className="text-gray-400">{formData.course}</span> </h2>
      </div>
      <div style={{ wordWrap: 'break-word' }}>
        <h2 className="text-2xl font-cursive hover:text-blue-500 transition-colors duration-200">
        Codeforces Handle: 
        <a href={`https://codeforces.com/profile/${formData.cfhandle}`} target="_blank" rel="noopener noreferrer">
          <span className="text-gray-400">{formData.cfhandle}</span>
        </a>
      </h2>
      <h2 className="text-2xl font-cursive hover:text-blue-500 transition-colors duration-200">
        Leetcode Handle: 
        <a href={`https://leetcode.com/${formData.lchandle}`} target="_blank" rel="noopener noreferrer">
          <span className="text-gray-400">{formData.lchandle}</span>
        </a>
      </h2>
        <button 
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
  onClick={() => setEditing(!editing)}
>
  Edit Handles
</button>
{editing && (
  <form onSubmit={handleFormSubmit} className="mt-4">
    <input 
      type="text" 
      name="cfhandle" 
      value={editData.cfhandle} 
      onChange={handleInputChange} 
      placeholder="Codeforces Handle" 
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
    <input 
      type="text" 
      name="lchandle" 
      value={editData.lchandle} 
      onChange={handleInputChange} 
      placeholder="Leetcode Handle" 
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-4"
    />
    <button 
      type="submit" 
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
    >
      Submit
    </button>
  </form>
)}
      </div>
    </div>
  </div>
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