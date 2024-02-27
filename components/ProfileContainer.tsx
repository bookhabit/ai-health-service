"use client"

import { ChallengePreferences } from '@prisma/client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import DifficultyCard from './DifficultyCard'
import axios from 'axios'
import toast from 'react-hot-toast'

interface ProfileContainerProps {
    challengePreferences:ChallengePreferences
}

const difficulties = [
    {
      id: "EASY",
      level: "Easy",
      description:
        "This challenge level is for people who are new to programming. Receive 3 challenges per day (7:30AM, 12PM, & 5:30PM EST).",
    },
    {
      id: "MEDIUM",
      level: "Medium",
      description:
        "This challenge level is for people who are familiar with programming. Receive 4 challenges per day (7AM, 12PM, 5PM, & 8PM EST).",
    },
    {
      id: "HARD",
      level: "Hard",
      description:
        "This challenge level is for people who are experienced with programming. Receive 5 challenges per day (6AM, 9AM, 12PM, 5PM, & 8PM EST).",
    },
  ];

  type DifficultiesType = "EASY" | "MEDIUM" | "HARD"

const ProfileContainer = ({challengePreferences}:ProfileContainerProps) => {
    // 푸시알림 여부 상태
    const [sendNotifications,setSendNotifications] = useState(challengePreferences.sendNotifications)
    // 사용자가 선택한 challenge난이도 level 상태
    const [selectedDifficulty,setSeletedDifficulty] = useState(challengePreferences.challengeId)
    const [saving,setSaving] = useState(false)

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
    <div className='flex flex-col'>
        <div className='flex flex-row justify-between items-center mb-4'>
            <h1 className='font-bold text-2xl'>Challenge Level</h1>
            <Button onClick={handleSave}>{saving?"Saving...":"Save"}</Button>
        </div>
        <div className='flex flex-row items-center justify-between mb-4 p-4 shadow rounded-lg'>
            <div>
                <h3 className='font-medium text-lg text-gray-900'>Push Notifications</h3>
                <p>Receive push notifications when new challenges are available.</p>
            </div>
            <Switch 
                checked={sendNotifications} 
                onCheckedChange={handleToggleNotifications}
            />
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
    </div>
  )
}

export default ProfileContainer
