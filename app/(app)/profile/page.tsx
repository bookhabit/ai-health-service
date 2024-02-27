import ProfileContainer from '@/components/ProfileContainer';
import { prismadb } from '@/lib/prismadb';
import { currentUser } from '@clerk/nextjs'
import React from 'react'
import toast from 'react-hot-toast';

export default async function ProfilePage() {
  // todo : current state 
  const user = await currentUser();

  // 인증된 사용자인지 구분 - profile페이지
  if(!user){
    toast.error("인증을 진행해주세요")
    throw new Error("No user")
  }

  let challengePreferences = await prismadb.challengePreferences.findUnique({
    where:{
      userId:user.id
    }
  })

  // 로그인한 사용자가 챌린지 레벨이 없다면 기본값으로 첫번째 단계인 EASY단계로 지정
  if(!challengePreferences){
    challengePreferences = await prismadb.challengePreferences.create({
      data:{
        userId:user.id,
        challengeId:"EASY"
      }
    })
  }

  // todo : Request new model

  return (
    <div className='max-w-screen-lg m-10 lg:mx-auto'>
      <ProfileContainer challengePreferences={challengePreferences}/>
    </div>
  )
}
