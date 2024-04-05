import { UserInfo } from '@prisma/client'
import React, { useMemo, useState } from 'react'
import { Button } from './ui/button'
import { userInfo } from 'os'
import axios from 'axios'
import toast from 'react-hot-toast'

interface UserExerciseInfoProps {
    userExerciseInfo : UserInfo
}

interface UserInfoType {
    weight:string,
    height:string,
    exerciseExperience:string
    gender:"MALE"|"FEMALE",
}

const UserExerciseInfo = ({userExerciseInfo}:UserExerciseInfoProps) => {
    const [saving,setSaving] = useState(false)
    const [weight,setWeight] = useState(userExerciseInfo.weight);
    const [height,setHeight] = useState(userExerciseInfo.height);
    const [exerciseExperience,setExerciseExperience] = useState(userExerciseInfo.exerciseExperience);
    const [genderState,setGenderState] = useState(userExerciseInfo.gender);

    const handleGenderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setGenderState(event.target.value as "MALE" | "FEMALE")
    };

    // onChange event
    const handleSave = async ()=>{
        // api 요청 : user운동정보 저장
        const data = {
            weight,height,exerciseExperience,genderState
        }
        console.log('api요청보낼 data',data)
        setSaving(true) 
        // Save 버튼 클릭 시 사용자의 운동관련정보를 변경해주는 API
        try{
            const response = await axios.post<{
                success:boolean;
                data?:UserInfo;
                message?:string;
            }>("/api/userExerciseInfo",{
                id:userExerciseInfo.id,
                data
            })

            if(!response.data.success || !response.data.data){
                toast.error(response.data.message ?? "Something went wrong")
                throw new Error(response.data.message ?? "Something went wrong")
            }

            toast.success("운동기록 정보를 저장했습니다!")

        }catch(error){
            toast.error("Something went wrong. Please try again.")
            console.log(error)
        }finally{
            setSaving(false)
        }

    }

    // css
    const userInfoDiv = 'flex flex-col p-4 border border-gray-200 rounded-lg'

    const userInfoInput = 'text-gray-500 border-none outline-none border-b-gray-600 py-3 w-full'



    return (
        <div className='mt-8'>
            <div className='flex flex-row justify-between items-center mb-4'>
                <h1 className='font-bold text-2xl'>운동 기록</h1>
                <Button onClick={handleSave}>{saving?"Saving...":"Save"}</Button>
            </div>
            <p className='mb-6 text-gray-500'>챌린지를 통해 변화되는 자신의 모습을 기록하세요.</p>
            {/* 사용자 정보 - 키,몸무게,운동경력,성별 */}
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
                    <select
                        value={genderState} 
                        onChange={handleGenderChange} 
                        className={userInfoInput}
                        >
                        <option value="MALE">남자</option>
                        <option value="FEMALE">여자</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default React.memo(UserExerciseInfo) 
