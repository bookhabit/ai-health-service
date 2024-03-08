"use client"

import { assistantAtom, userThreadAtom } from '@/atoms'
import axios from 'axios'
import { useAtom } from 'jotai'
import { Run, Thread, ThreadMessage } from 'openai/resources/beta/threads/index.mjs'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import toast from "react-hot-toast"
import {throttle} from "lodash"

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
  const [prevScrollHeight,setPrevScrollHeight] = useState<number|null>(null);
  const [hasNextPage,setHasNextPage] = useState(false)
  const [paginatedParams,setPaginatedParams] = useState<{ after: string }>({after:''})

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

      // Validation
      if (!response.data.success || !response.data.messages) {
        console.error(response.data.error ?? "Unknown error.");
        return;
      }

      let newMessages = response.data.messages;


      // Update messages state by concatenating old messages with new messages
      setMessages(prevMessages => [...prevMessages, ...newMessages]);

      if(response.data.has_more === false && response.data.nextPageParams===null){
        toast.success("이전 채팅데이터가 없습니다.")
        setHasNextPage(false)
        setPaginatedParams({after:''})
        return
      }else{
        // 다음 페이지 있는지 boolean값
        if(response.data.has_more){
          setHasNextPage(response.data.has_more)
        }
        if(response.data.nextPageParams){
          setPaginatedParams(response.data.nextPageParams)
        }
      }
    } catch (error) {
      console.error(error);
      setMessages([]);
    } finally {
      setFetching(false);
    }
  }, [userThread,hasNextPage,paginatedParams]);

  useEffect(() => {
    fetchMessages()
  }, [userThread]);

  // fetch nextData as scroll event
  const handleScroll = throttle(() => {
    // 현재 스크롤 위치
    const currentScrollPosition = scrollBarRef.current?.scrollTop
    
    if (currentScrollPosition === 0 && hasNextPage && paginatedParams.after !== '') {
        if(scrollBarRef.current){
          setPrevScrollHeight(scrollBarRef.current.scrollHeight)
        }
        fetchMessages()
    }
  }, 1000);

   // set scroll event
   useEffect(() => {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // scroll restoration or scroll to bottom
  useEffect(()=>{
    if (prevScrollHeight && scrollBarRef.current) {
        window.scrollTo(0,prevScrollHeight)
        return setPrevScrollHeight(null);
    }else{
        moveToBottom()
    }
    // TODO : 푸시알림시, 채팅 보낼 때, 채팅 수신 시 moveToBottom()실행
  },[messages])
  

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

        // refetch
        if (run.status === "completed") {
          clearInterval(intervalId);
          setPollingRun(false);
          fetchMessages();
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

  function formatTime(timestamp:number) {
    const millisecondsAgo = Date.now() - timestamp * 1000; // 초를 밀리초로 변환
    const secondsAgo = millisecondsAgo / 1000;
    const minutesAgo = secondsAgo / 60;
    const hoursAgo = minutesAgo / 60;
    const daysAgo = hoursAgo / 24;
  
    if (minutesAgo < 1) {
      const seconds = Math.floor(secondsAgo);
      return `${seconds}초 전`;
    } else if (hoursAgo < 1) {
      const minutes = Math.floor(minutesAgo);
      return `${minutes}분 전`;
    } else if(daysAgo < 1) {
      const hours = Math.floor(hoursAgo);
      return `${hours}시간 전`;
    } else if (daysAgo < 2) {
      return '1일 전';
    } else if (daysAgo < 7) {
      const days = Math.floor(daysAgo);
      return `${days}일 전`;
    } else if (daysAgo < 30) {
      const weeks = Math.floor(daysAgo / 7);
      return `${weeks}주일 전`;
    } else {
      const months = Math.floor(daysAgo / 30);
      return `${months}개월 전`;
    }
  }
  
  let lastDate:Date|null = null;
  

  return (
    <div className='w-screen h-[calc(100vh-64px)] flex flex-col bg-black text-white'>
      {/* todo : Messages */}
      <div className='flex-grow overflow-y-scroll p-8 space-y-2' ref={scrollBarRef} onScroll={handleScroll} >
        {/* fetching messages */}
        {fetching && messages.length === 0 &&
          <div className='text-center font-bold'>
            Fetching...
          </div>
        }
        {/* fetching previous messages */}
        {fetching && messages.length !== 0 &&
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
        {/* // Sort in descending order */}
        {messages
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .filter((message) => message.content[0].type === "text" && message.content[0].text.value.trim() !== "")
          .map((message) => {
            const messageDate = new Date(message.created_at * 1000); // 초를 밀리초로 변환
            let shouldDisplayDate = false;
            const USER = ["true","True"].includes((message.metadata as {fromUser?:string}).fromUser ?? "")

            // 날짜가 변경되었을 때, 날짜 구분 헤더 추가
            if (!lastDate || messageDate.toDateString() !== lastDate.toDateString()) {
              lastDate = messageDate;
              shouldDisplayDate = true;
            }

            // 지난 대화 표시
            return (
              <div key={message.id} className='w-full'>
                {shouldDisplayDate ?                                     
                  <div key={`date-${message.created_at}`} className="text-center mb-4 text-gray-200">
                    {shouldDisplayDate ? 
                    `${messageDate.getFullYear()}년 ${messageDate.getMonth() + 1}월 ${messageDate.getDate()}일 ${["일", "월", "화", "수", "목", "금", "토"][messageDate.getDay()]}요일`
                    : null
                    }
                  </div> : null}
                <div className={`flex ${USER ? " flex-row-reverse": " flex-row"} w-full`}>
                  <div key={message.id} className={`px-4 py-2 mb-3  rounded-lg text-lg max-w-[250px] sm:max-w-[440px] lg:max-w-[540px] ${ USER? "bg-yellow-500 ml-0" : "bg-gray-700"} `}>
                    {message.content[0].type === "text" 
                    ? message.content[0].text.value 
                      .split("\n")
                      .map((text,index)=><p key={index}>{text}</p>)
                    : null}
                  </div>
                  <p className={`text-gray-300 p-2 mb-2 flex flex-col justify-end ${USER ? "mr-1 items-end" :"ml-1"}`}>{formatTime(message.created_at)}</p>
                </div>
              </div>
            );
        })}
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
