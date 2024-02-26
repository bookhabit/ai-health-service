"use client"

import { userThreadAtom } from "@/atoms";
import Navbar from "@/components/Navbar";
import { UserThread } from "@prisma/client";
import axios from "axios";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function AppRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // todo : if the user doesn't have threadId, we make one
  // todo : if the user does have one, we fetch it
  const [,setUserThread] = useAtom(userThreadAtom)
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

  // console.log('userThread',userThread)

  return (
    <div className="flex flex-col w-full h-screen">
        <Navbar/>
        {children}    
    </div>
  );
}


// Going to use the threadId to fetch all messages