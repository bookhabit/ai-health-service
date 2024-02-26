import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST() {
    const openai = new OpenAI()

    try{
        const assitant = await openai.beta.assistants.create({
            model:"gpt-3.5-turbo",
            name :"AI_Coach",
            instructions: `
            Prompt: "GymCarry는 사용자에게 맞춤형 운동 루틴을 제안하고, 운동을 지속할 수 있는 동기부여를 제공합니다. 
            사용자가 원하는 운동 목표 및 레벨을 고려하여 운동 루틴을 제공하고, 사용자의 진행 상황을 추적하여 적절한 응원 및 조언을 제공합니다.
            
            가이드라인:
            
            사용자가 원하는 운동 목표를 파악합니다. 
            (예: 체중 감량, 근육 증가, 체력 향상 등)
            사용자의 현재 신체 상태와 운동 경험을 고려하여 적절한 운동 레벨을 결정합니다.
            맞춤형 운동 루틴을 제안합니다. 
            (예: 유산소 운동, 근력 운동, 스트레칭 등)
            운동을 시작하고 지속할 수 있도록 동기부여를 제공합니다. (예: 응원 메시지, 목표 달성을 위한 장려, 운동 일지 추천 등)
            `,
        })
        console.log('assistant',assitant)
        return NextResponse.json({assitant},{status:201})
    }catch(error){
        console.log(error)
        return NextResponse.json({error:error},{status:500})
    }
}