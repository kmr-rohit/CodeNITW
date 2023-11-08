import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp, updateDoc, arrayUnion, getDocs, doc } from "firebase/firestore";
import { getAuth } from '@firebase/auth';



const Resources = () => {
  const [topics, setTopics] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [newQuestion, setNewQuestion] = useState({ name: '', link: '' });
  

  useEffect(() => {
    const fetchTopics = async () => {
      const querySnapshot = await getDocs(collection(db, "resources"));
      setTopics(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchTopics();
  }, []);

  const addTopic = async (e) => {
    e.preventDefault();
    const docRef = await addDoc(collection(db, "resources"), {
      topicName: newTopic,
      questions: [],
      timestamp: serverTimestamp(),
    });
    setTopics([...topics, { id: docRef.id, topicName: newTopic, questions: [] }]);
    setNewTopic("");
  };

  const addQuestion = async ({isAdmin}) => {
    if (selectedTopic) {
      const docRef = doc(db, "resources", selectedTopic);
      await updateDoc(docRef, {
        questions: arrayUnion(newQuestion)
      });
      setTopics(topics.map(topic => topic.id === selectedTopic ? { ...topic, questions: [...topic.questions, newQuestion] } : topic));
      setNewQuestion({ name: '', link: '' });
    }
  };
  const auth = getAuth();
  const user=auth.currentUser;
  const userEmail = user && user.email;

  return (
    <div className='flex justify-center'>
    <div className='w-full sm:w-3/4 lg:w-2/3'>
      {topics.map(topic => (
        <TopicCard  
          key={topic.id} 
          id={topic.id}
          name={topic.topicName} 
          questions={topic.questions} 
          addQuestion={addQuestion} 
          newQuestion={newQuestion} 
          setNewQuestion={setNewQuestion}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          isAdmin={isAdmin}
        />
      ))}
      {(userEmail === 'sc922055@student.nitw.ac.in' || userEmail === 'rk972006@student.nitw.ac.in') && <div>
        <input type="text" value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Topic name" />
        <button onClick={addTopic}>Add Topic</button>
      </div>}
    </div>
    </div>
  );
};

export function QuestionCard({ name, link }) {
  return (
    <div 
    className='relative bg-gray-300 bg-opacity-50 w-full my-5 items-center shadow-md hover:shadow-lg rounded-md overflow-hidden transition-shadow duration-300 m-5 p-2'
      onClick={e => e.stopPropagation()}
    >
      <div className='grid grid-cols-1 sm:grid-cols-4 space-x-4 items-center sm:w-[90%]'>
        <div className='col-span-1 sm:col-span-3'>
          <h1 className='text-xl font-bold text-blue-700'>{name}</h1>
          <div className='mt-2'>
            <a
              href={link}
              target='_blank'
              rel='noreferrer'
              className='bg-blue-700 text-white rounded-full hover:bg-blue-900 py-2 px-4 transition duration-300 inline-block font-medium'
            >
              Solve Question
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TopicCard({ id, name, questions, addQuestion, newQuestion, setNewQuestion, selectedTopic, setSelectedTopic, isAdmin }) {
  const isOpen = id === selectedTopic;

  const handleTopicClick = () => {
    setSelectedTopic(isOpen ? null : id);
  };
  const auth = getAuth();
  const user = auth.currentUser;
  const userEmail = user && user.email;

  return (
    <div className={`relative bg-blue-200 bg-opacity-50 w-[90%] my-10 items-center shadow-lg hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-300 m-10 p-4 ${isOpen ? 'pb-8' : ''}`} onClick={handleTopicClick}>
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 items-center sm:w-[90%]`}>
        <div className='col-span-1 sm:col-span-2'>
          <h1 className='text-2xl font-bold text-blue-700'>{name}</h1>
        </div>
      </div>
      {isOpen && (
        <div className='mt-4' onClick={e => e.stopPropagation()}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 items-center sm:w-[90%] md:w-[80%] lg:w-[70%] mx-auto`}>
            {questions.map((question, index) => (
              <QuestionCard key={index} name={question.name} link={question.link} />
            ))}
          </div>
          {(userEmail === 'sc922055@student.nitw.ac.in' || userEmail === 'rk972006@student.nitw.ac.in') && (
            <div>
              <input
                type="text"
                value={newQuestion.name}
                onChange={e => {
                  e.stopPropagation();
                  setNewQuestion({ ...newQuestion, name: e.target.value });
                }}
                placeholder="Question name"
                onClick={e => e.stopPropagation()}
              />
              <input
                type="text"
                value={newQuestion.link}
                onChange={e => {
                  e.stopPropagation();
                  setNewQuestion({ ...newQuestion, link: e.target.value });
                }}
                placeholder="Question link"
                onClick={e => e.stopPropagation()}
              />
              <button
                onClick={e => {
                  e.stopPropagation();
                  addQuestion({ isAdmin: { isAdmin } });
                }}
              >
                Add Question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default Resources;