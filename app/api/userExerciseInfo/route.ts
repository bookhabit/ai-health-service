import { prismadb } from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    const user = await currentUser()

    if(!user){
        return NextResponse.json({message:"Unauthorized"},{status:401})
    }

    const response = await request.json()

    const {id,data} = response
    console.log(data)
    console.log('update할 때 ',data.genderState)
    if(!id || !data){
        return NextResponse.json(
            {message:"Missing required fields"},
            {status:400}
        )
    }

    try{
        const userExerciseInfo = await prismadb.userInfo.update({
            where:{
                id:id,
                userId:user.id,
            },
            data:{
                weight:data.weight,
                height:data.height,
                gender:data.genderState,
                exerciseExperience:data.exerciseExperience,
            }
        })

        return NextResponse.json({
            success:true,
            data:userExerciseInfo,
        })

    }catch(error){
        console.error(error)
        return NextResponse.json(
            {success:false,message:"Something went wrong"},
            {status:500}
        )
    }

}