import { prismadb } from "@/lib/prismadb"
import { NextResponse } from "next/server";

export async function POST(request:Request){
    // requqest로 userId , challengeId 
    const {userId,challengeId,success} = await request.json()

    if(!userId){
        return NextResponse.json(
            {success:false,message:"unauthorized"},{status:401}
        )
    }

    if(!challengeId){
        return NextResponse.json(
            {success:false,message:"challengeId not recieved."},{status:400}
        )
    }

    // UserChallengeData 저장하기
    try{
        await prismadb.userChallengeData.create({
            data:{
                userId :userId,
                challengeId:challengeId, 
                success:success
            }
        })
        return NextResponse.json(
            {success:true},{status:200}
        )
    }catch(error){
        console.log(error)
    }

}