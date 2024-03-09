import { prismadb } from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(){
    let user = await currentUser();

    if(!user){
        return NextResponse.json({message:"Unauthorized"},{status:401})
    }

    try{
        let userChallengeLevel = await prismadb.challengePreferences.findUnique({
            where:{
            userId:user.id
            }
        })
        return NextResponse.json({
            success:true,
            userChallengeLevel,
        })
    }catch(error){
        console.error(error)
        return NextResponse.json(
            {success:false,message:"Something went wrong"},
            {status:500}
        )
    }

}