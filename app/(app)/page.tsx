"use client"

import { assistantAtom, userThreadAtom } from '@/atoms'
import axios from 'axios'
import { useAtom } from 'jotai'
import { Run, Thread, ThreadMessage } from 'openai/resources/beta/threads/index.mjs'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import toast from "react-hot-toast"

const POLLING_FREQUENCY_MS = 1000

function ChatPage() {
  // Atom state
  const [userThread] = useAtom(userThreadAtom)
  const [assistant] = useAtom(assistantAtom)

  // state
  const [fetching,setFetching] = useState(false)
  const [messages,setMessages] = useState<ThreadMessage[]>([])
  const [message,setMessage] = useState("")
  const [sending,setSending] = useState(false)
  const [pollingRun,setPollingRun] = useState(false)

  // state for chatting
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const [hasNextPage,setHasNextPage] = useState(false)
  const [paginatedParams,setPaginatedParams] = useState<{ after: string }>({after:''})
  
  console.log('hasNextpage',hasNextPage)
  console.log('paginatedParams',paginatedParams)

  // 스크롤 바 아래로 이동시키는 함수
  const moveToBottom = ()=>{
    messageEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }

  

  const fetchMessages = useCallback(async () => {
    if (!userThread) return;
    
    setFetching(true);

    try {
      const response = await axios.post<{
        success: boolean;
        error?: string;
        messages?: ThreadMessage[];
        has_more?:boolean,
        nextPageParams?:{ after: string }
      }>("/api/message/list", { threadId: userThread.threadId,paginatedParams });

      console.log('response값!',response)
      // 다음 페이지 있는지 boolean값
      if(response.data.has_more){
        setHasNextPage(response.data.has_more)
      }
      if(response.data.nextPageParams){
        setPaginatedParams(response.data.nextPageParams)
      }
      
      console.log('threadId',userThread.threadId)

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
      moveToBottom();
    } catch (error) {
      console.error(error);
      setMessages([]);
    } finally {
      setFetching(false);
    }
  }, [userThread]);

  useEffect(() => {
    fetchMessages();
  }, [userThread]);

// fetch nextData as scroll event
  // const handleScroll = throttle(() => {
  //   const scrollTop = document.documentElement.scrollTop;

  //   if (scrollTop === 0 && hasNextPage && nextPageNumber !== 0) {
  //       if(scrollBarRef.current){
  //           setPrevScrollHeight(scrollBarRef.current.scrollHeight)
  //       }
  //       fetchChatData(nextPageNumber)
  //   }
  // }, 300);

  // scroll restoration or scroll to bottom
  // useEffect(()=>{
  //   if (prevScrollHeight && scrollBarRef.current) {
  //       window.scrollTo(0,scrollBarRef.current.scrollHeight - prevScrollHeight)
  //       return setPrevScrollHeight(null);
  //   }else{
  //       messageEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  //   }
  //   messageEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  // },[fetchMessages])
  

  const startRun = async (
    threadId: string,
    assistantId: string
  ): Promise<string> => {
    // api/run/create
    try {
      const {
        data: { success, run, error },
      } = await axios.post<{
        success: boolean;
        error?: string;
        run?: Run;
      }>("/api/run/create", {
        threadId,
        assistantId,
      });

      if (!success || !run) {
        console.error(error);
        toast.error("Failed to start run.");
        return "";
      }

      return run.id;
    } catch (error) {
      console.error(error);
      toast.error("Failed to start run.");
      return "";
    }
  };

  const pollRunStatus = async (threadId:string,runId:string)=>{
    // POST : api/run/retrieve
    setPollingRun(true)

    const intervalId = setInterval(async()=>{
      try{
        const {
          data: { run, success, error },
        } = await axios.post<{
          success: boolean;
          error?: string;
          run?: Run;
        }>("/api/run/retrieve", {
          threadId,
          runId,
        });

        if (!success || !run) {
          console.error(error);
          toast.error("Failed to poll run status.");
          return;
        }

        console.log("run", run);

        // refetch
        if (run.status === "completed") {
          clearInterval(intervalId);
          setPollingRun(false);
          await fetchMessages();
          return;
        } else if (run.status === "failed") {
          clearInterval(intervalId);
          setPollingRun(false);
          toast.error("Run failed.");
          return;
        }

      }catch(error){
        console.error(error);
        toast.error("Failed to poll run status.");
        clearInterval(intervalId);
      }
    },POLLING_FREQUENCY_MS)

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }

  const sendMessage = async ()=>{
    // validation
    if(!userThread || sending || !assistant){
      toast.error("Failed to send message. Invalid state.")
      return;
    } 

    setSending(true)

    // send message : POST /api/message/create
    try{
      const {data:{message:newMessages}} = await axios.post<{
        success:boolean;
        message?:ThreadMessage;
        error?:string;}>("/api/message/create",{
          message,
          threadId:userThread.threadId,
          fromUser:'true'
        })
  
      // update ours messages with our new response
      if(!newMessages){
        console.error("No message returned")
        toast.error("Failed to send message. Please try again")
        return
      }
  
      setMessages((prev)=>[...prev,newMessages])
      setMessage("") // input창 리셋
      toast.success("Message sent")
      // start a run and then we are going to start polling
      const runId = await startRun(userThread.threadId, assistant.assistantId);
      if (!runId) {
        toast.error("Failed to start run.");
        return;
      }
      pollRunStatus(userThread.threadId, runId);
    }catch(error){
      console.log(error)
      toast.error("Failed to send message. Please try again")
    }finally{
      setSending(false)
    }
  }

  return (
    <div className='w-screen h-[calc(100vh-64px)] flex flex-col bg-black text-white'>
      {/* todo : Messages */}
      <div className='flex-grow overflow-y-scroll p-8 space-y-2' ref={scrollBarRef} >
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
        <div ref={messageEndRef}></div>
      </div>
      {/* todo : input */}
      <div className=' mt-auto p-4 bg-gray-800'>
        <div className='flex items-center bg-white p-2'>
          <input
            type='text'
            className='flex-grow bg-transparent text-black focus:outline-none'
            placeholder='Type a message...'
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
          />
          <button 
            disabled={!userThread?.threadId || !assistant || sending ||!message.trim()} 
            className=' ml-4 bg-yellow-500 text-white px-4 py-2 rounded-full focus:outline-none disabled:bg-yellow-700'
            onClick={sendMessage}
            >
              {sending ? "Sending...":pollingRun ? "Polling Run..." : "Send" }
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
