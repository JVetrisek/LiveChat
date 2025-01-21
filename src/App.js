import { useState, useRef, useEffect } from 'react';
import './App.css';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyC_UQv0hSXai7FHxFfuuPQc3XNsIMKe2jM",
  authDomain: "livechat-115cb.firebaseapp.com",
  projectId: "livechat-115cb",
  storageBucket: "livechat-115cb.appspot.com",
  messagingSenderId: "268965808918",
  appId: "1:268965808918:web:edb6d9a111536aca495e37",
  measurementId: "G-WJXP1TH2ES"
};

// Inicializace Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1><i className="fa-solid fa-comment appIco"></i> Live Chat</h1>
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  );
}

function SignOut() {
  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return auth.currentUser && (
    <button className="sign-out" onClick={signOutUser}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('createdAt'));
  const [messages] = useCollectionData(q, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!formValue) return;

    try {
      const { uid, photoURL } = auth.currentUser;

      await addDoc(messagesRef, {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL
      });

      setFormValue('');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    dummy.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Write something ... " />
        <button type="submit" disabled={!formValue}><i className="fa-solid fa-paper-plane"></i></button>
      </form>
    </>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL, createdAt } = message;
  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';

  const time = createdAt ? new Date(createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || <i className="fa-solid fa-ghost"></i>} alt="User Avatar" />
      <div className="message-content">
        <p>{text}</p>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}

export default App;
