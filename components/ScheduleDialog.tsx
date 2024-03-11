import { UserChallengeData } from '@prisma/client'
import React from 'react'

interface ScheduleDialogProps{
    closeDialog:() => void
    selectedInfo:UserChallengeData | null
}

const ScheduleDialog = ({closeDialog,selectedInfo}:ScheduleDialogProps) => {

    const convertToLevel = (selectedInfo:UserChallengeData)=>{
        if(selectedInfo.challengeId === "EASY"){
            return '쉬움'
          }else if(selectedInfo.challengeId === "MEDIUM"){
            return '중간'
          }else if(selectedInfo.challengeId === "HARD"){
            return '어려움'
          }
    }

    const convertToMessage = (selectedInfo:UserChallengeData)=>{
        if(selectedInfo.challengeId === "EASY"){
            return '푸쉬업 50개,스쿼트 50개입니다.'
          }else if(selectedInfo.challengeId === "MEDIUM"){
            return '푸쉬업 100개,스쿼트 100개입니다.'
          }else if(selectedInfo.challengeId === "HARD"){
            return '푸쉬업 200개,스쿼트 200개입니다.'
          }
    }
    
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      {/* 모달 배경 */}
      <div className="absolute w-full h-full bg-black opacity-20" onClick={closeDialog}></div>
      {/* 모달 내용 */}
      <div className="bg-white rounded-lg p-8 z-50">
        <div className="text-lg font-semibold mb-4">챌린지 세부내용</div>
        {/* 모달 내용 */}
        {selectedInfo &&
            <div>
                <div className='flex flex-row justify-between items-center mb-4'>
                    <p className=' text-gray-400'>{new Date(selectedInfo.createdAt).toISOString().substr(0, 10)}</p>
                    <p className={`font-bold ${selectedInfo.success===true ? "text-mainColor" :"text-[#e76f3b]" } `}>{selectedInfo?.success===true ? "챌린지 성공" : "챌린지 실패"}</p>
                </div>
                <p>오늘 진행한 챌린지는</p>
                <p>난이도 : {convertToLevel(selectedInfo)}</p>
                <p>{convertToMessage(selectedInfo)}</p>
            </div>
        }
        
        {/* 모달 닫기 버튼 */}
        <button className="text-sm text-gray-500 hover:text-gray-700 mt-4" onClick={closeDialog}>
          닫기
        </button>
      </div>
    </div>
  )
}

export default ScheduleDialog
