"use client"

import { ChallengePreferences, UserInfo } from '@prisma/client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import DifficultyCard from './DifficultyCard'
import axios from 'axios'
import toast from 'react-hot-toast'
import UserExerciseInfo from './UserExerciseInfo'

interface ProfileContainerProps {
    challengePreferences:ChallengePreferences
    userExerciseInfo : UserInfo
}

const difficulties = [
    {
      id: "EASY",
      level: "쉬움",
      description:
        "이 챌린지 레벨은 운동을 처음 하는 사람들을 위한 것입니다.\n 하루에 3번의 챌린지를 진행합니다. \n (오전 7시 30분, 오후 12시 및 오후 5시 30분에 챌린지를 받습니다.)",
    },
    {
      id: "MEDIUM",
      level: "중간",
      description:
        "이 챌린지 레벨은 운동에 익숙한 사람들을 위한 것입니다.\n 하루에 4번의 챌린지를 진행합니다. \n (오전 7시,오후 12시,5시,8시에 챌린지를 받습니다.)",
    },
    {
      id: "HARD",
      level: "어려움",
      description:
        "이 챌린지 레벨은 어느정도 운동경력이 있는 사람들을 위한 것입니다.\n 하루에 5번의 챌린지를 진행합니다. \n (오전 6시,9시,오후 12시,5시,8시에 챌린지를 받습니다.)",
    },
  ];

  type DifficultiesType = "EASY" | "MEDIUM" | "HARD"

const ProfileContainer = ({challengePreferences,userExerciseInfo}:ProfileContainerProps) => {
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
            <h1 className='font-bold text-2xl'>챌린지 난이도</h1>
            <Button onClick={handleSave}>{saving?"Saving...":"Save"}</Button>
        </div>
        <div className='flex flex-row items-center justify-between mb-4 p-4 shadow rounded-lg'>
            <div>
                <h3 className='font-medium text-lg text-gray-900'>푸시 알림</h3>
                <p>챌린지를 이용할 때 알림을 받는 것을 허용합니다</p>
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
        {/* todo : 푸시알림 받을 때 사용자 맞춤 운동관련정보 필드 */}
        <UserExerciseInfo userExerciseInfo={userExerciseInfo} />
    </div>
  )
}

export default ProfileContainer
