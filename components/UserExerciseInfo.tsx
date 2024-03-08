import { UserInfo } from '@prisma/client'
import React, { useMemo, useState } from 'react'
import { Button } from './ui/button'
import { userInfo } from 'os'

interface UserExerciseInfoProps {
    userExerciseInfo : UserInfo
}

interface UserInfoType {
    weight:number,
    height:number,
    exerciseExperience:number
    gender:"MALE"|"FEMALE",
}

const UserExerciseInfo = ({userExerciseInfo}:UserExerciseInfoProps) => {
    console.log('user저옵',userExerciseInfo)
    const [saving,setSaving] = useState(false)
    const [weight,setWeight] = useState(userExerciseInfo.weight);
    const [height,setHeight] = useState(userExerciseInfo.height);
    const [exerciseExperience,setExerciseExperience] = useState(userExerciseInfo.exerciseExperience);
    const [genderState,setGenderState] = useState(userExerciseInfo.gender);

    const handleGenderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setGenderState(event.target.value as "MALE" | "FEMALE")
    };

    // onChange event
    const handleSave = ()=>{
        // api 요청 : user운동정보 저장
        console.log('save',weight,height,exerciseExperience,genderState)

    }

    // css
    const userInfoDiv = 'flex flex-col p-4 border border-gray-200 rounded-lg'

    const userInfoInput = 'text-gray-500 border-none outline-none border-b-gray-600 py-3 w-full'



    return (
        <div className='mt-8'>
            <div className='flex flex-row justify-between items-center mb-4'>
                <h1 className='font-bold text-2xl'>운동 관련 정보</h1>
                <Button onClick={handleSave}>{saving?"Saving...":"Save"}</Button>
            </div>
            <p className='mb-6 text-gray-500'>알림기능을 제공할 때 사용자의 정보에 맞춤화된 운동을 추천해줍니다.</p>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                <div className={userInfoDiv}>
                    <h2 className={`font-bold text-xl`}>키</h2>
                    <div className='flex items-center'>
                        <input
                        type="text"
                        placeholder={height==='' ? "ex) 170" : ""}
                        value={height}
                        onChange={(e)=>setHeight(e.target.value)}
                        className={userInfoInput}
                        />
                        <span>cm</span>
                    </div>
                </div>
                <div className={userInfoDiv}>
                    <h2 className={`font-bold text-xl`}>몸무게</h2>
                    <div className='flex items-center'>
                        <input
                        type="text"
                        placeholder={weight==='' ? "ex) 60" : ""}
                        value={weight}
                        onChange={(e)=>setWeight(e.target.value)}
                        className={userInfoInput}
                        />
                        <span>kg</span>
                    </div>
                </div>
                <div className={userInfoDiv}>
                    <h2 className={`font-bold text-xl`}>운동경력</h2>
                    <div className='flex items-center'>
                        <input
                            type="text"
                            placeholder={exerciseExperience==='' ? "ex) 2" : ""}
                            value={exerciseExperience}
                            onChange={(e)=>setExerciseExperience(e.target.value)}
                            className={userInfoInput}
                        />
                        <span>년</span>
                    </div>
                </div>

                <div className={userInfoDiv}>
                    <h2 className={`font-bold text-xl `}>성별</h2>
                    <select value={genderState} onChange={handleGenderChange} className={userInfoInput}>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default React.memo(UserExerciseInfo) 
