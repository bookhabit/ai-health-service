import { prismadb } from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() { 
    const user = await currentUser();

    if(!user){
        return NextResponse.json(
            {success:false,message:"unauthorized"},{status:401}
        )
    }

    // get user thread from database
    const userThread = await prismadb.userThread.findUnique({where:{userId:user.id}})

    // if it does exist, return it
    if(userThread){
        return NextResponse.json({userThread,success:true},{status:200})
    }

    // userThread 가 없는 경우 - 새로 생성해서 저장
    // if it doesn't exist, create it from openai
    try{
        const openai = new OpenAI();
        const thread = await openai.beta.threads.create();
    
        // save it to the database
        const newUserThread = await prismadb.userThread.create({data:{
            userId:user.id,
            threadId:thread.id
        }})
    
        // return it to the user
        return NextResponse.json({userThread:newUserThread,success:true},{status:200})
    }catch(e){
        return NextResponse.json(
            {success:false,message:"error creating thread"},
            {status:500}
        )
    }

}