import { prismadb } from "@/lib/prismadb";
import { UserThread } from "@prisma/client";
import axios from "axios";
import { NextResponse } from "next/server";
import OpenAI from "openai";

interface UserThreadMapType{
    [userId:string]:UserThread
}

export async function POST(request:Request) {
    // Validation
    const body = await request.json();

    const { challengeId, secret } = body;

    if (!challengeId || !secret) {
        return NextResponse.json(
            { success: false, message: "Missing required fields" },
            {status: 400,}
        );
    }

    if (secret !== process.env.APP_SECRET_KEY) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            {status: 401,}
        );
    }

    // define work out message prompt
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `
            매우 강렬하고 강렬한 동기 부여 메시지를 생성한 다음, 간결하고 장비가 필요 없는 맨몸 운동 계획을 작성합니다. 
            하루 중 제공되는 시간을 고려해야 합니다. 
            출력 부분에는 두 부분이 엄격하게 포함되어야 합니다: 
            첫째, 드웨인 존슨의 동기부여 스타일로 출력해줍니다. 드웨인 존슨은 매일 아침 4시에 일어나서 30분 유산소와 1시간 근력운동을 매일 남들이 자고 있을 시간에 운동을 수행합니다. 존슨은 자신의 삶에서 어려운 순간들을 극복하는 모습으로 많은 사람들에게 용기를 줬습니다. 그는 자신의 어려움을 이기고자 최선을 다하는 모습으로 많은 사람들에게 용기와 희망을 심어줍니다.
            두 번째 부분은 운동 목록이어야 합니다: 10분 이내에 완료되도록 설계된, 어디에서나 할 수 있는 강렬하고 효과가 높은 운동입니다. 
            출력에는 이 두 가지 구성 요소만 포함되어야 하며, 다른 것은 포함되지 않습니다.

            다음은 따라야 할 출력 예입니다:
            
            열심히 운동 할 시간이에요! 당신은 당신이 생각하는 것보다 더 강합니다. 
            열심히 일하기 위해 오늘 아침 당신의 한계를 밀어붙이세요. 
            당신은 이 운동을 없앨 10분의 시간이 있습니다. 
            이곳은 당신의 전쟁터이고, 당신은 전사입니다.
            나태해지지 마세요!
            
            - 버피테스트 30개 – 워밍업으로 시작합시다
            - 스쿼트 20개 3세트 – 하체운동은 남성호르몬을 증가시켜줍니다.
            - 푸쉬업 20개 3세트 – 가슴근육 단련을 통해 큰 상체를 만듭시다.
            - 턱걸이 10개 3세트 – 등근육을 키워서 프레임을 넓혀야 합니다.
            - 크런치 30개 3세트 – 코어근육은 상체와 하체를 연결시키는 힘입니다!
            `,
        },
        {
          role: "user",
          content: `Generate a new GymCarry workout. Remember, only respond in the format specifed earlier. Nothing else`,
        },
      ];
    
      //  Use OpenAI to generate work out
      const {
        data: { message, success },
      } = await axios.post<{ message?: string; success: boolean }>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/openai`,
        {
          messages,
          secret: process.env.APP_SECRET_KEY,
        }
      );
    
      if (!message || !success) {
        return NextResponse.json(
          {
            success: false,
            message: "Something went wrong with generate openai response",
          },
          {
            status: 500,
          }
        );
      }
    
      console.log(message);

    // Grab all challenge preferences
    const challengePreferences = await prismadb.challengePreferences.findMany({
        where: {
            challengeId,
        },
    });

    console.log("challengePreferences", challengePreferences);

    const userIds = challengePreferences.map((cp) => cp.userId);

    console.log("userIds", userIds);

    //  Grab all user threads
    const userThreads = await prismadb.userThread.findMany({
        where: {
        userId: {
            in: userIds,
        },
        },
    });

    console.log('userThreads',userThreads)

    const userThreadMap:UserThreadMapType = userThreads.reduce((map,thread)=>{
        map[thread.userId] = thread;
        return map;
    },{} as UserThreadMapType)

    // add messages to threads
    const threadPromises:Promise<any>[] = [];

    try{
        challengePreferences.forEach((cp)=>{
            // find the respective user
            const userThread = userThreadMap[cp.userId]
    
            // todo : add message to thread
            if(userThread){
                threadPromises.push(
                    axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/message/create`,{
                        message,
                        threadId: userThread.threadId,
                        fromUser: "false",
                    })
                )
            }
    
        })
    
        await Promise.all(threadPromises)
    
        return NextResponse.json({message},{status:200})
    }catch(error){
        console.error(error)
        return NextResponse.json(
            {success:false,message:"Something went wrong"},
            {status:500}
        )
    }


    // future - send PWA notification to user
}