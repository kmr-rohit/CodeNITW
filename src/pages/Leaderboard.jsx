import React, { useState, useEffect } from "react";
import { Leaderboard } from "flywheel-leaderboard";
import { initializeApp } from "firebase/app";
import firebase from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, setDoc, query, where, getDocs, doc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import authentication modules


async function sha512(str) {
  return crypto.subtle
    .digest("SHA-512", new TextEncoder("utf-8").encode(str))
    .then((buf) => {
      return Array.prototype.map
        .call(new Uint8Array(buf), (x) => ("00" + x.toString(16)).slice(-2))
        .join("");
    });
}

async function addOrUpdateData(updatedScoreArray, leaderboardCollectionRef) {
  const querySnapshot = await getDocs(leaderboardCollectionRef);

  for (const scoreData of updatedScoreArray) {
    const existingDocs = query(leaderboardCollectionRef, where("name", "==", scoreData.handle));
    const existingDocsSnapshot = await getDocs(existingDocs);

    if (!existingDocsSnapshot.empty) {
      // Document with the same name exists, update it
      const existingDoc = existingDocsSnapshot.docs[0];
      await setDoc(existingDoc.ref, scoreData, { merge: true });
    } else {
      // Document with the same name does not exist, add a new one
      await addDoc(leaderboardCollectionRef, scoreData);
    }
  }
}

export default function LeaderboardList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreArray, setScoreArray] = useState([]);
  const contests = ["480776", "482262","483816" , "486358","491056"]; // Add more contest IDs as needed
  const [isPushDataButtonVisible, setPushDataButtonVisible] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [hasPushedData, setHasPushedData] = useState(false);
   // Initialize Firebase Authentication

   const itemsPerPage = 11;
   const [page, setPage] = useState(1);
   const handleChange = (event, value) => {
     setPage(value);
   };
   
   const filteredLeaderboardData = leaderboardData.filter(data => 
    data.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredLeaderboardData.length / itemsPerPage);

  // const pages = [];
  // for(let i = 1; i <= Math.ceil(filteredLeaderboardData.length / itemsPerPage); i++){
  //   pages.push(i);
  // }
    useEffect(() => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if ((user && user.email === "rk972006@student.nitw.ac.in")) {
          setPushDataButtonVisible(true);
        }
        else{
          setPushDataButtonVisible(false);
        }
      });
      fetchData();
    }, []);


    async function fetchData() {

      // Uncomment this code to push Updated Leaderboard
      // let updatedScoreArray = [];

      // for (const contest_id of contests) {
      //   const data = await getStandings(contest_id);
      //   if (data && data.status === "OK") {
      //     updatedScoreArray = getScores(data, contest_id, updatedScoreArray);
      //   } else {
      //     console.error("API Error:", data);
      //     // Handle the API error appropriately
      //   }
      // }
      // console.log(updatedScoreArray);
      // setScoreArray(updatedScoreArray);
    

      // leaderboard data setting 
      //Fetch data from the Leaderboard collection
      const leaderboardCollectionRef = collection(db, "leaderboard");
      const leaderboardQuerySnapshot = await getDocs(leaderboardCollectionRef);
      const leaderboardData = [];
      leaderboardQuerySnapshot.forEach((doc) => {
        leaderboardData.push(doc.data());
      });
      setLeaderboardData(leaderboardData);

      
    //  // Pushing Ranks into firebase 
    //   if(!hasPushedData){
    //   for(const contest_id of contests){
    //     const data = await getStandings(contest_id);
    //     if (data && data.status === "OK") {
    //       const contestRanksItem = getContestRanks(data , contest_id);
    //       const contestRanksCollectionRef = collection(db, "contestRanks");
    //       const q = query(contestRanksCollectionRef, where("contestId", "==", contest_id));
    //       const querySnapshot = await getDocs(q);
    //       if (querySnapshot.empty) {
    //         await addDoc(contestRanksCollectionRef, contestRanksItem);
    //       }
    //     }
    //   }
    //   setHasPushedData(true);
    //   }

      
    }


    async function handleUpdateDataClick() {
      const leaderboardCollectionRef = collection(db, "leaderboard");
      await addOrUpdateData(scoreArray, leaderboardCollectionRef);
    }


  async function getStandings(contest_id) {
    const rand = String(Math.floor(Math.random() * 100000)).padStart(6, "0");
    const current_time = String(Math.floor(Date.now() / 1000));
    const api_key = "7bcb2c2a57feab460343d341d164e26b4ae32fd1";
    const api_secret = "3e67186659f5f9f35c5841127c40a5b0339180b1";
    const api_sig =
      rand +
      "/contest.standings?apiKey=" +
      api_key +
      "&contestId=" +
      contest_id +
      "&time=" +
      current_time +
      "#" +
      api_secret;
    const hash = await sha512(api_sig);
    const hashWithRand = rand + hash;
    const url = `https://codeforces.com/api/contest.standings?contestId=${contest_id}&apiKey=${api_key}&time=${current_time}&apiSig=${hashWithRand}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch data from the API:", response.statusText);
      return null; // Handle the error as needed
    }
    const data = await response.json();
    console.log(data);
    return data;
  }

  function getContestRanks(obj, contestId){
    let startTimeSeconds = obj.result.contest.startTimeSeconds;
    let userId = "";
    let rank = 0;
    let ranksArray = [];
    for(const item of obj.result.rows){
      rank = item.rank;
      userId  = item.party.members[0].handle;
      ranksArray.push({rank , userId});
    }

    let tempData = {
      contestDate : startTimeSeconds,
      contestId : contestId,
      ranks : ranksArray
    }

    return tempData;

  }

  function getScores(obj, contestId, previousScores) {
    const updatedScoreArray = [...previousScores];
    let totalScore = 0;

    for (const item of obj.result.problems) {
      if(!item.rating){
        item.rating = 1500;
      }
      totalScore += item.rating;
    }
    const totalPenalty = obj.result.rows[0].penalty;
    console.log(totalPenalty);
    for (const row of obj.result.rows) {
      const points = row.points;
      const penalty = row.penalty;
      const handle = row.party.members[0].handle;
      const rollno = 0;
      let Score = 0;
      if(points){
        Score= 100 * points - penalty / 100 ;
        Score = Score.toFixed(2);
      }

      // Check if handle already exists in updatedScoreArray
      const existingUserIndex = updatedScoreArray.findIndex(
        (user) => user.handle === handle
      );

      if (existingUserIndex !== -1) {
        // Update the existing user's score for the contest
        updatedScoreArray[existingUserIndex].Score = (
          parseFloat(updatedScoreArray[existingUserIndex].Score) +
          parseFloat(Score)
        ).toFixed(2);
      } else {
        // Create a new entry for the user for the given contest
        updatedScoreArray.push({
          Score,
          contestId,
          handle,
          rollno,
        });
      }
    }
    console.log(updatedScoreArray);

    return updatedScoreArray;
  }
  return (
    <div className=" min-h-screen bg-blue-100">
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-4xl text-center font-serif mb-8 mt-8" >Leaderboard</h1>
        
        {isPushDataButtonVisible && (
          <button
            onClick={handleUpdateDataClick}
            className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-8"
          >
            Push Data
          </button>
        )}
        <div className="w-full bg-white shadow-lg hover:shadow-2xl  rounded-lg overflow-hidden">
          <CustomLeaderboard
            leaderboardData={leaderboardData}
            page={page}
            setPage={setPage}
            itemsPerPage={itemsPerPage}
            searchTerm={searchTerm}
          />
          <div className="flex justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button className="m-2 bg-blue-400 text-white px-2 rounded-full" key={pageNumber} onClick={() => setPage(pageNumber)}>
                {pageNumber}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export const CustomLeaderboard = ({ leaderboardData, page, setPage, itemsPerPage, searchTerm }) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = page * itemsPerPage;

  // Sort the entire leaderboard data
  const sortedLeaderboardData = leaderboardData.sort((a, b) => b.Score - a.Score);

  // Find the rank of the searched user in the entire leaderboard data
  const rank = leaderboardData.findIndex(item => item.handle.toLowerCase() === searchTerm.toLowerCase()) + 1;

  // Filter the leaderboard data based on the search term
  const filteredLeaderboardData = sortedLeaderboardData.filter(data => 
    data.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the leaderboard items for the current page
  const leaderboardItems = filteredLeaderboardData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredLeaderboardData.length / itemsPerPage);

  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };


  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Leaderboard</h1> */}
      <table className="w-full border-collapse bg-blue-100 rounded-md">
      <thead className="bg-blue-200">
          <tr>
            <th className="p-2 border">Rank</th>
            <th className="p-2 border">Handle</th>
            <th className="p-2 border">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardItems.map((item, index) => {
            let topper = "";
            if (index === 0 && page === 1) {
              topper = "👑";
            }
            return (
              <tr key={index} className={`${topper} hover:bg-blue-200 justify-center`} >
              <td className="p-2 font-semibold border text-center">{startIndex + index + 1}{topper}</td>
               <td className="p-2 font-semibold border text-center"><a href={`https://codeforces.com/profile/${item.handle}`} target="_blank">{item.handle}</a></td>
              <td className="p-2 font-semibold border text-center">{item.Score}</td>
             </tr>
            );
          })}
        </tbody>
      </table>
      {rank > 0 && <p className="mt-4">Rank: {rank}</p>} {/* Display the rank if it is greater than 0 */}
      <div className="flex justify-center mt-4">
        <button
          onClick={goToPreviousPage}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors mr-2"
        >
          Previous
        </button>
        <button
           onClick={goToNextPage}
           disabled={page === totalPages}
           className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
         >
           Next
         </button>
       </div>
     </div>
   );
 };