"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import axios from "axios";


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Message එකක structure එක
interface IMessage {
  name: string;
  user: string;
  text?: string;
  image?: string; // Image URL එක සඳහා
  time: string;
}

const socket: Socket = io(BACKEND_URL);

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [chat, setChat] = useState<IMessage[]>([]);
  const [uploading, setUploading] = useState<boolean>(false); // Upload වෙන බව පෙන්වීමට
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    const savedName = localStorage.getItem("name");
    const token = localStorage.getItem("token");

    if (!token || !savedUser) {
      router.push("/login");
    } else {
      setUsername(savedUser);
      setName(savedName || savedUser);
    }

    socket.on("load_messages", (messages: IMessage[]) => {
      setChat(messages);
    });

    socket.on("receive_message", (data: IMessage) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("load_messages");
      socket.off("receive_message");
    };
  }, [router]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // සාමාන්‍ය Text Message එකක් යැවීම
  const sendMessage = (): void => {
    if (message.trim() !== "") {
      const messageData: IMessage = { 
        name: name,
        user: username, 
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socket.emit("send_message", messageData);
      setMessage("");
    }
  };

  // Image එකක් Upload කර යැවීම
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Backend Upload API එකට යැවීම
      const res = await axios.post(`${BACKEND_URL}/api/upload`, formData);
      const imageUrl = res.data.url;

      const messageData: IMessage = {
        name: name,
        user: username,
        text: "", 
        image: imageUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      socket.emit("send_message", messageData);
    } catch (err) {
      console.error(err);
      alert("Image upload failed!");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Input එක clear කිරීම
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-2 font-sans text-white">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">K&D Group Chat Room</h1>
            <p className="text-xs opacity-90 flex items-center gap-2 mt-1">
              <img src='/userIcon.svg' alt="user" className='h-5 w-5' /> 
              {name}
            </p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold transition">
            Logout
          </button>
        </div>

        {/* Chat Window */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-900/50">
          {chat.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.user === username ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl shadow-sm ${
                  msg.user === username ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600"
                }`}>
                {msg.user !== username && (
                  <p className="text-[10px] font-bold text-blue-400 mb-1">{msg.name}</p>
                )}
                
                {/* පින්තූරයක් තිබේ නම් පෙන්වන්න */}
                {msg.image && (
                  <img src={msg.image} alt="Sent" className="rounded-lg mb-1 max-h-60 w-full object-cover border border-black/10" />
                )}
                
                {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                <p className="text-[9px] opacity-60 mt-1 text-right">{msg.time}</p>
              </div>
            </div>
          ))}
          {uploading && <p className="text-xs text-blue-400 animate-pulse">Uploading image...</p>}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center gap-2">
          {/* Hidden File Input */}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v12.75a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>

          <input 
            className="flex-grow bg-slate-900 border border-slate-600 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white" 
            value={message}
            placeholder="Type a message..." 
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
          />
          
          <button className="bg-blue-600 hover:bg-blue-500 p-2.5 rounded-xl transition-all active:scale-95" onClick={sendMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}