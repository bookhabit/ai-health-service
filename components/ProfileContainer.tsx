"use client"

import { ChallengePreferences, UserChallengeData, UserInfo } from '@prisma/client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import DifficultyCard from './DifficultyCard'
import axios from 'axios'
import toast from 'react-hot-toast'
import UserExerciseInfo from './UserExerciseInfo'
import { useRouter } from 'next/navigation'
import UserChallenge from './UserChallenge'


interface ProfileContainerProps {
    challengePreferences:ChallengePreferences
    userExerciseInfo : UserInfo
    userChallengeInfo : UserChallengeData[]
}

const difficulties = [
    {
      id: "EASY",
      level: "쉬움",
      description:`30분 동안 푸쉬업 50개,스쿼트 50개`,
    },
    {
      id: "MEDIUM",
      level: "중간",
      description:"30분 동안 푸쉬업 100개,스쿼트 100개",
    },
    {
      id: "HARD",
      level: "어려움",
      description:"30분 동안 푸쉬업 200개,스쿼트 200개",
    },
  ];

  type DifficultiesType = "EASY" | "MEDIUM" | "HARD"

const ProfileContainer = ({challengePreferences,userExerciseInfo,userChallengeInfo}:ProfileContainerProps) => {
    // 푸시알림 여부 상태
    const [sendNotifications,setSendNotifications] = useState(challengePreferences.sendNotifications)
    // 사용자가 선택한 challenge난이도 level 상태
    const [selectedDifficulty,setSeletedDifficulty] = useState(challengePreferences.challengeId)
    const [saving,setSaving] = useState(false)

    const router = useRouter();

    const handleToggleNotifications = ()=>{
        setSendNotifications((prev)=>!prev)
    }
    
    const handleSelectDifficulty = (difficultyId:DifficultiesType)=>{
        // UI만 변경시키는 프론트 코드 (DB영향 X)
        setSeletedDifficulty(difficultyId)
    }

    const handleSave = async ()=>{
        setSaving(true) // save 하고(api를 호출하는 중) 있다고 알려주기 위한 상태
        // Save 버튼 클릭 시 사용자가 선택한 난이도를 실제 데이터베이스 challengePreferences.challegeId 를 변경해주는 API
        try{
            const response = await axios.post<{
                success:boolean;
                data?:ChallengePreferences;
                message?:string;
            }>("/api/challenge-preferences",{
                id:challengePreferences.id,
                challengeId:selectedDifficulty,
                sendNotifications,
            })

            if(!response.data.success || !response.data.data){
                toast.error(response.data.message ?? "Something went wrong")
                throw new Error(response.data.message ?? "Something went wrong")
            }

            toast.success("Preferences saved!")

        }catch(error){
            toast.error("Something went wrong. Please try again.")
            console.log(error)
        }finally{
            setSaving(false)
        }
    }

  return (
    <div className='flex flex-col gap-2'>
        <div className='flex flex-row justify-between items-center mb-4'>
            <h1 className='font-bold text-2xl'>챌린지 난이도 설정</h1>
            <Button onClick={handleSave}>{saving?"Saving...":"Save"}</Button>
        </div>
        <div className='mb-4 p-4 shadow rounded-lg'>
            <div className='flex flex-row items-center justify-between'>
                <h3 className=' font-semibold text-lg text-gray-900 mb-3'>알림</h3>
                <Switch 
                    checked={sendNotifications} 
                    onCheckedChange={handleToggleNotifications}
                />
            </div>
            <div className='flex flex-col gap-2'>
                <p>챌린지를 수행할 때 시작 알림을 받는 것을 허용합니다</p>
                <p>챌린지는 매일 아침 매일 아침 7시부터 7시 30분까지 수행합니다.</p>
                <p>챌린지 시작 알림은 챌린지 시작 전 10분 전 6시 50분에 알림을 전송합니다.</p>
            </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {difficulties.map((difficulty)=>(
                <DifficultyCard
                    key={difficulty.id}
                    level={difficulty.level}
                    description={difficulty.description}
                    selected={difficulty.id === selectedDifficulty}
                    onSelect={()=>handleSelectDifficulty(difficulty.id as DifficultiesType)}
                />
            ))}
        </div>
        <UserExerciseInfo userExerciseInfo={userExerciseInfo} />
        <div className='flex flex-col gap-2 mt-6'>
            <h1 className='font-bold text-2xl'>챌린지 기록</h1>
            <UserChallenge
                userChallengeInfo={userChallengeInfo}
            />
        </div>
    </div>
  )
}

export default ProfileContainer
