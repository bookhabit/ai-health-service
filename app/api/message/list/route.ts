import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req:Request){
    const {threadId,paginatedParams} = await req.json()

    if(!threadId){
        return NextResponse.json(
            {error : "threadId are required",success:false},
            {status:400}
        )
    }

    const openai = new OpenAI()

    try{
        const response = await openai.beta.threads.messages.list(threadId,{
            limit:10,
            order:"desc",
            after: paginatedParams?.after || ''
        })
        
        const has_more = response.hasNextPage();
        const nextPageParams = response.nextPageParams()

        console.log('api요청 횟수')
        console.log('paginatedParams?.after 값',paginatedParams?.after)

        return NextResponse.json(
            {
                messages:response.data,
                success:true,
                has_more:has_more,
                nextPageParams:nextPageParams
            },
            {status:200}
        )
    }catch(error){
        console.log(error)
        return NextResponse.json(
            {error : "Something went wrong",success:false},
            {status:500}
        )
    }
}