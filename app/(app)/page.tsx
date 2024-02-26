"use client"

import { userThreadAtom } from '@/atoms'
import axios from 'axios'
import { useAtom } from 'jotai'
import { Thread, ThreadMessage } from 'openai/resources/beta/threads/index.mjs'
import React, { useCallback, useEffect, useState } from 'react'

const POLLING_FREQUENCY_MS = 1000

function ChatPage() {
  // Atom state
  const [userThread] = useAtom(userThreadAtom)

  // state
  const [fetching,setFetching] = useState(false)
  const [messages,setMessages] = useState<ThreadMessage[]>([])

  const fetchMessages = useCallback(async () => {
    if (!userThread) return;

    setFetching(true);

    try {
      const response = await axios.post<{
        success: boolean;
        error?: string;
        messages?: ThreadMessage[];
      }>("/api/message/list", { threadId: userThread.threadId });

      console.log('threadId',userThread.threadId)
      // thread_7R5mNf0CBdhVu6wyWFcpPRlN

      // Validation
      if (!response.data.success || !response.data.messages) {
        console.error(response.data.error ?? "Unknown error.");
        return;
      }

      let newMessages = response.data.messages;
      console.log('newMessages',newMessages)

      if(!newMessages){console.log('newMessages에러',newMessages)}
      // Sort in descending order
      newMessages = newMessages.sort((a, b) => {
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        })
        .filter(
          (message) =>
            message.content[0].type === "text" &&
            message.content[0].text.value.trim() !== ""
        );

      setMessages(newMessages);
    } catch (error) {
      console.error(error);
      setMessages([]);
    } finally {
      setFetching(false);
    }
  }, [userThread]);

  useEffect(() => {
    fetchMessages()
    // const intervalId = setInterval(fetchMessages, POLLING_FREQUENCY_MS);

    // // Clean up on unmount
    // return () => clearInterval(intervalId);
  }, []);


  return (
    <div className='w-screen h-screen flex flex-col bg-black text-white'>
      {/* todo : Messages */}
      <div className='flex-grow overflow-y-hidden p-8 space-y-2'>
        {/* fetching messages */}
        {fetching && messages.length === 0 &&
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
        )}
        {/* listing out the messges */}
        {messages.map((message)=>(
          <div key={message.id} className={`px-4 py-2 mb-3 rounded-lg w-fit text-lg ${
            ["true","True"].includes(
              (message.metadata as {fromUser?:string}).fromUser ?? ""
            ) 
            ? "bg-yellow-500 ml-auto"
            : "bg-gray-700"
          } `}>
            {message.content[0].type === "text" 
            ? message.content[0].text.value 
              .split("\n")
              .map((text,index)=><p key={index}>{text}</p>)
            
            : null}
          </div>
        ))}
      </div>
      
    </div>
  )
  {/* todo : input */}
}

export default ChatPage
