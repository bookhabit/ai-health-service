import ProfileContainer from '@/components/ProfileContainer';
import { prismadb } from '@/lib/prismadb';
import { currentUser } from '@clerk/nextjs'
import Head from 'next/head';
import React from 'react'
import toast from 'react-hot-toast';

export default async function ProfilePage() {
  const user = await currentUser();

  // 인증된 사용자인지 구분 - profile페이지
  if(!user){
    toast.error("인증을 진행해주세요")
    throw new Error("No user")
  }

  // user의 챌린지 레벨 정보
  let challengePreferences = await prismadb.challengePreferences.findUnique({
    where:{
      userId:user.id
    }
  })

  // user의 운동관련 정보
  let userExerciseInfo = await prismadb.userInfo.findUnique({
    where:{
      userId:user.id
    }
  })

  // user의 챌린지 기록 정보
  const userChallengeInfo = await prismadb.userChallengeData.findMany({
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

  // 로그인한 사용자의 운동관련 정보가 없다면 기본값으로 
  if(!userExerciseInfo){
    userExerciseInfo = await prismadb.userInfo.create({
      data:{
        userId:user.id,
        height:'',
        weight:'',
        exerciseExperience:'',
        gender:"MALE"
      }
    })
  }  

  return (
    <div className='max-w-screen-lg m-10 lg:mx-auto'>
      <Head>
        <title>
          Profile페이지 | 푸쉬업/스쿼트 챌린지 지정
        </title>
        <meta
          name="description"
          content="사용자는 챌린지를 지정하여 아침마다 자신의 운동챌린지를 수행할 수 있습니다."
          key="desc"
        />
      </Head>
      <ProfileContainer 
        challengePreferences={challengePreferences}
        userExerciseInfo={userExerciseInfo}
        userChallengeInfo={userChallengeInfo}
      />
    </div>
  )
}
