"use client"

import { assistantAtom, userThreadAtom } from "@/atoms";
import Navbar from "@/components/Navbar";
import userServiceWorker from "@/hooks/useServiceWorker";
import { Assistant, UserThread } from "@prisma/client";
import axios from "axios";
import { useAtom } from "jotai";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AppRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [,setUserThread] = useAtom(userThreadAtom)
  const [assistant,setAssistant] = useAtom(assistantAtom)

  userServiceWorker();

  console.log('assistant id',assistant)

  useEffect(()=>{
    if(assistant) return

    async function getAssistant() {
      try{
        const response = await axios.get<{
          success:boolean;
          message?:string;
          assistants:Assistant;
        }>("/api/assistant")

        console.log('assistant 얻기 response',response)

        if(!response.data.success || !response.data.assistants){
          console.error(response.data.message ?? "Unknown error") 
          toast.error("Failed to fetch assistant")
          setAssistant(null)
          return;
        }
  
        setAssistant(response.data.assistants)
      }catch(error){
        console.log(error)
        setAssistant(null)
      }
    }
    getAssistant()
  },[setAssistant])

  useEffect(()=>{
    // build be endpoint
    async function getUserThread() {
      try{
        const response = await axios.get<{
          success:boolean;
          message?:string;
          userThread:UserThread;
        }>("/api/user-thread")
        if(!response.data.success || !response.data.userThread){
          console.error(response.data.message ?? "Unknown error") 
          setUserThread(null)
          return;
        }
  
        setUserThread(response.data.userThread)
      }catch(error){
        console.log(error)
        setUserThread(null)
      }
    }

    getUserThread();
  },[setUserThread])

  return (
    <div className="flex flex-col w-full h-full">
        <Navbar/>
        {children}    
        <Toaster/>
    </div>
  );
}