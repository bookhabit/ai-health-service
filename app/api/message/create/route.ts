import { prismadb } from "@/lib/prismadb"
import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req:Request){
    const {message,userThread,threadId,fromUser = false } = await req.json()

    console.log("from user",{message,threadId})
    if(!threadId || !message){
        return NextResponse.json(
            {error : "threadId and message are required",success:false},
            {status:400}
        )
    }

    // 오늘 날짜와 비교해서 24시간 지나면 dailyRequestUpdatedAt
    const currentDate = new Date();
    const dailyRequestUpdatedAt = new Date(userThread.dailyRequestUpdatedAt); // userThread에서 가져온 dailyRequestUpdatedAt 값
    
    // dailyRequestUpdatedAt와 currentDate의 날짜를 비교하여 하루가 지났는지 확인
    const isNextDay = dailyRequestUpdatedAt.getDate() !== currentDate.getDate();

    if (isNextDay) {
        // 하루가 지났을 때
        await prismadb.userThread.update({
            where: {
                id: userThread.id,
                userId: userThread.userId,
            },
            data: {
                dailyRequestCount: 0,
                dailyRequestUpdatedAt: currentDate, // 현재 시간으로 업데이트
            },
        });
    }
    if (!isNextDay && userThread.dailyRequestCount > 5) {
        // 일일 api 요청 5개 이상 제한
        return NextResponse.json(
            { error: "하루에 질문은 5개까지 할 수 있습니다. 더 많은 질문을 하고 싶다면 프리미엄 서비스를 이용해주세요 (아직 프리미엄 서비스를 만들지는 못했고 곧 구현할 예정입니다.)", success: false },
            { status: 422 }
        );
    }
    
    const openai = new OpenAI()

    // 메세지 생성

    try{
        const threadMessage = await openai.beta.threads.messages.create(threadId,{
            role:"user",
            content:message,
            metadata: {
                fromUser,
            },
        })

        // 메세지 생성 후 dailyRequestCount 1 추가하기
        await prismadb.userThread.update({
            where:{
                id:userThread.id,
                userId:userThread.userId,
            },
            data:{
                dailyRequestCount: {
                    increment: 1 // 기존 값에서 1을 더함
                },
                // dailyRequestUpdatedAt 날짜 업데이트
                dailyRequestUpdatedAt: new Date(), 
            }
        })

        return NextResponse.json({message:threadMessage,success:true},{status:201})
    }catch(error){
        console.log(error)
        return NextResponse.json(
            {error : "Something went wrong",success:false},
            {status:500}
        )
    }
    
}