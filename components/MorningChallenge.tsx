"use client"

import React, { Dispatch, SetStateAction, Suspense, useEffect, useState } from 'react'
import Timer from './Timer';
import axios from 'axios';
import { ChallengePreferences } from '@prisma/client';

interface MorningChallengeProps{
    closeModal:() => void
}

const motivationalQuotes = [
    "You got this!",
    "Believe in yourself!",
    "Keep going!",
    "Stay strong!",
    "You can do it!",
    "Push yourself harder!",
    "Don't give up now!",
    "You're stronger than you think!",
    "One more rep, you've got this!",
    "오늘도 열심히 가보자!",
    "지금은 힘든데, 내일의 나를 위해 노력하자!",
    "포기하지 말고 계속 나아가자!",
    "목표를 향해 한 발 더 나아가자!",
    "자신에게 도전하고, 더 강해지자!",
    "근육이 아플수록 더 강해진다!",
    "좋은 습관은 힘든 날도 이겨낼 수 있게 해준다.",
    "오늘도 나를 위한 건강한 선택을 하자!",
    "노력하는 나에게 박수를 보내자!",
    "계속해서 발전하고 성장하자!",
    "운동은 몸과 마음을 건강하게 만들어준다.",
    "작은 노력이 큰 성취를 만들어낸다.",
    "스스로를 믿고 끝까지 간다!",
    "포기하지 않고 꾸준히 나아가자!",
    "목표에 도달할 때까지 포기하지 말자!",
    "오늘도 나를 위해 최선을 다하자!",
    "쉬운 길은 없다. 하지만 가치 있는 길은 있다.",
    "어제보다 오늘이 더 나은 나를 만들자!",
    "꿈은 이루어질 때까지 살아있다.",
    "어렵고 힘든 길일수록 성취감은 더 크다.",
    "당신은 할 수 있다! 믿고 나아가자!",
    "스스로에게 도전해보고 자신감을 키워보자!",
    "자신의 한계를 넘어서는 순간이 가장 성장하는 순간이다.",
    "목표를 향해 꾸준한 노력은 결코 헛되지 않는다.",
    "오늘의 작은 노력이 내일의 큰 성취로 이어진다.",
    "당신은 강하고 용감하며, 이길 수 있다!",
    "어려운 시련을 이겨내는 것이 성장의 시작이다."
]
const getRandomQuoteIndex = () => {
    return Math.floor(Math.random() * motivationalQuotes.length);
};

const MorningChallenge = ({closeModal}:MorningChallengeProps) => {
    const [endWorkout,setEndWorkout] = useState(false)
    const [endAlarm,setEndAlarm] = useState(false)
    const [showQuotes,setShowQuotes] = useState(false)
    const [currentQuote,setCurrentQuote] = useState('')
    const [userData,setUserData] = useState<ChallengePreferences>()
    const [timerCount,setTimerCount] = useState(30)

    // 사용자의 챌린지 난이도 구하는 API 호출
    useEffect(()=>{
        const getUserChallengeLevel = async ()=>{
            try{
                const response = await axios.post('/api/user-challenge-level')
                console.log('유저 챌린지 레벨 가져오는 api response',response)
                const userdata = response.data.userChallengeLevel as ChallengePreferences
                setUserData(userdata)
            }catch(error){
                console.log(error)
            }
        }
        getUserChallengeLevel()
    },[])
    console.log('userdata',userData)

    // 챌린지 난이도에 따라서 UI 다르게 보여줌 
    const convertLevelToNumber = ()=>{
        // EASY : 푸쉬업 50개 스쿼트 50개
        // MEDIUM : 푸쉬업 100개 스쿼트 100개
        // HARD : 푸쉬업 200개 스쿼트 200개
        if(userData?.challengeId==="EASY"){
            return 50
        }else if(userData?.challengeId==="MEDIUM"){
            return 100
        }else if(userData?.challengeId==="MEDIUM"){
            return 200
        }
    }
    
    // 운동 시작 끝 버튼 
    useEffect(() => {
        // 시간 체크
        const checkTimeAndShowButton = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            // 아침 7시에 운동시작 버튼을 보여준다 (0분부터 29분까지)
            // currentHour === 7 && currentMinute >= 0 && currentMinute < 30
            console.log(endWorkout)
            console.log(currentMinute)
            if ( currentHour === 7 && currentMinute >= 0 && currentMinute < 30 ) {
                setShowQuotes(true)
                setEndWorkout(false)
            } else if(currentHour === 7 && currentMinute >= 30 && currentMinute < 35) {
                // 7시 30분부터 35분까지 모달창
                setShowQuotes(false) // 동기부여 메세지 창 닫기
                setEndWorkout(true); // 운동 끝 버튼 보여주기
                // 타이머 UI부분에 운동 수고했다고 축하메세지 + 하루 기분좋게 시작 메세지
                setEndAlarm(true)
            }else if(currentHour === 7 && currentMinute > 35){
                // 7시 35분이 지나면 모달 닫기
                closeModal()
            }
        };
        // 동기부여 메세지
        const changeMotivationalQuote = () => {
            const randomIndex = getRandomQuoteIndex();
            setCurrentQuote(motivationalQuotes[randomIndex]);
        };

        // 페이지가 로드될 때와 1분마다 시간을 확인하여 모달을 보여줍니다.
        checkTimeAndShowButton();
        changeMotivationalQuote();
        const interval = setInterval(checkTimeAndShowButton, 60000); // 1분마다 실행
        const quoteInterval = setInterval(changeMotivationalQuote, 60000); // 1분마다 실행
        return () => {
            clearInterval(interval)
            clearInterval(quoteInterval)
        };
        
    }, []);

    // 운동 끝 버튼 클릭
    const onClickEnd = ()=>{
        console.log('운동 끝')        
        // 챌린지 데이터 저장 (챌린지 난이도와 성공여부)

        // 모달창 닫기  TODO : 전면광고 보여주기
        closeModal()
    }
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 w-screen p-11 ">
            <div className=" bg-[#30384b] rounded-lg p-8 w-full h-full flex flex-col gap-4 items-center text-white">
                <h2 className="text-2xl text-center font-bold mb-4 ">Morning Workout Challenge</h2>
                <div className='bg-[#353e58]  shadow-md w-full max-w-md px-3 py-4 text-md flex flex-col gap-3 items-center text-lg'>
                    <p className='font-bold mb-2'>오늘의 운동</p>
                    <p>푸쉬업 : {convertLevelToNumber()} 개</p>
                    <p>스쿼트 : {convertLevelToNumber()} 개</p>
                </div>
                {/* todo : 30분 타이머 UI */}
                <div className='w-full my-8 flex flex-col justify-center items-center'>
                    {endAlarm ? (
                        // TODO : 운동 끝 - 격려메세지 (애니메이션 효과)
                        // 배경이미지 - 축하하는
                        <div>
                            <video src='/challenge_success.mp4' autoPlay loop muted />
                            <div className='flex flex-col justify-center items-center gap-3 mt-8 font-bold'>
                                <p className=' animate-bounce text-lg'>축하합니다.</p> 
                                <p>챌린지를 성공하셨습니다.</p>
                                <p>오늘도 즐거운 하루 되시고 내일도 참여해주세요!</p>
                            </div>
                        </div>
                    ) : (
                        <Timer/>
                    ) }
                </div>
                <div className="mt-4 text-center">
                    {/* 운동시작하면 동기부여메세지,운동끝버튼 */}
                    {showQuotes && currentQuote && (
                        <p className='text-xl  font-bold animate-bounce'>{currentQuote}</p>
                    )}
                    {endWorkout && (
                        <button className="px-6 py-4 font-bold text-[#30384b] rounded bg-white hover:bg-[#edf1ff] ml-4" onClick={onClickEnd}>운동 끝</button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MorningChallenge
