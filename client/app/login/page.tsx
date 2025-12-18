"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false); // Welcome screen එක පාලනය කිරීමට
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const router = useRouter();

  const handleSubmit = async () => {
    const url = isLogin 
      ? `${BACKEND_URL}/api/auth/login` 
      : `${BACKEND_URL}/api/auth/register`;
      
    try {
      const res = await axios.post(url, form);
      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("name", res.data.name);
        router.push("/");
      } else {
        alert("Registration Successful! Now please login.");
        setIsLogin(true); // Register වුණාට පස්සේ auto Login page එකට හරවනවා
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Something went wrong!");
    }
  };

  // Welcome Screen UI
if (!showForm) {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-900 overflow-hidden px-6 lg:px-20">
      {/* Background Decorative Circles */}
      <div className="absolute w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse top-[-10%] left-[-10%]"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-20 animate-bounce"></div>

      {/* Main Content Container */}
      <div className="z-10 flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-10">
        
        {/* Left Side: Text Content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Connect <span className="text-blue-500">Instantly.</span>
          </h1>
          <p className="text-slate-400 mb-10 text-lg lg:text-xl max-w-lg">
            The ultimate real-time group chat experience. Join communities, 
            share ideas, and stay connected with your world.
          </p>
          
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold text-xl shadow-lg shadow-blue-900/40 transition-all transform hover:scale-105 active:scale-95"
          >
            Get Started
          </button>
        </div>

        {/* Right Side: Image Content */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative">
            {/* මෙතනට ඔයාගේ PNG එකේ Path එක ලබා දෙන්න (उदा: /chat-illustration.png) */}
            <img 
              src="/main1.png" 
              alt="Group Chat Illustration" 
              className="w-full max-w-[500px] h-auto object-contain drop-shadow-2xl animate-float"
            />
            {/* Floating decoration effect */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

  // Login / Register Form UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700 backdrop-blur-sm bg-opacity-80">
        <h2 className="text-3xl font-bold mb-2 text-center text-blue-500">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-slate-400 text-center mb-8 text-sm">
          {isLogin ? "Enter your credentials to continue" : "Fill in the details to get started"}
        </p>

        <div className="space-y-4">
          {/* Register වෙද්දී විතරක් 'Name' field එක පෙන්වනවා */}
          {!isLogin && (
            <input 
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
              placeholder="Full Name" 
              onChange={(e) => setForm({...form, name: e.target.value})} 
            />
          )}

          <input 
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
            placeholder="Username" 
            onChange={(e) => setForm({...form, username: e.target.value})} 
          />

          <input 
            type="password"
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
            placeholder="Password" 
            onChange={(e) => setForm({...form, password: e.target.value})} 
          />

          <button 
            onClick={handleSubmit} 
            className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold text-lg mt-4 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            {isLogin ? "Sign In" : "Register Now"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            {isLogin ? "New here?" : "Already a member?"}
            <span 
              className="text-blue-500 ml-2 cursor-pointer font-semibold hover:underline" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Create an account" : "Log in to your account"}
            </span>
          </p>
        </div>
      </div>
      
      {/* Back to Welcome Button */}
      <button 
        onClick={() => setShowForm(false)}
        className="mt-6 text-slate-500 hover:text-slate-300 text-sm transition"
      >
        ← Back to Home
      </button>
    </div>
  );
}