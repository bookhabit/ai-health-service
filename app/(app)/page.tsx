"use client"

import { userThreadAtom } from '@/atoms'
import axios from 'axios'
import { useAtom } from 'jotai'
import { Thread, ThreadMessage } from 'openai/resources/beta/threads/index.mjs'
import React, { useEffect, useState } from 'react'

const POLLING_FREQUENCY_MS = 1000

function ChatPage() {
  // Atom state
  const [userThread] = useAtom(userThreadAtom)

  // state
  const [fetching,setFetching] = useState(false)
  const [messages,setMessages] = useState<ThreadMessage[]>([])

  console.log(userThread)
  console.log('messages',messages)

  const fetchMessages = async ()=>{
    // todo : POST /api/messages/list
    if(!userThread) return

    setFetching(true)

    try{
      const response = await axios.post<{
        success:boolean;
        error?:string;
        messages?:ThreadMessage[]
      }>("/api/messages/list",{threadId:userThread})
  
      // validation
      if(!response.data.success || !response.data.messages){
        console.log(response.data.error ?? "Unknown error")
        return
      }
  
      let newMessages = response.data.messages
  
      // Sort in descending order
      newMessages = newMessages.sort((a,b)=>{
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }).filter((message)=>
        message.content[0].type === "text" &&
        message.content[0].text.value.trim() !== ""
      )
  
      setMessages(newMessages)
    }catch(e){
      console.log(e)
      setFetching(false)
      setMessages([])
    }
  }

  useEffect(()=>{
    const intervalId = setInterval((fetchMessages),POLLING_FREQUENCY_MS)
    // Clean up on unmount
    return ()=>clearInterval(intervalId)
  },[])

  return (
    <div className='w-screen h-screen flex flex-col bg-black text-white'>
      {/* todo : Messages */}
      <div className='flex-grow overflow-y-hidden p-8 space-y-2'>
        {/* fetching messages */}
        {fetching && 
          <div className='text-center font-bold'>
            Fetching...
          </div>
        }
        {/* no messages */}
        {
          messages.length === 0 && !fetching && (
            <div className='text-center font-bold'>
              No messages
            </div>
          )
        }
      </div>
      {/* listing out the messges */}
      {/* todo : input */}
    </div>
  )
}

export default ChatPage
