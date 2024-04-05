"use client"

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const routes = [
    {
        name : "Chat",
        path:"/"
    },
    {
        name:"Challenge",
        path:"/profile"
    }
]

function Navbar() {
    const pathname = usePathname();

    return (
        <div className='p-4 flex flex-row justify-between items-center bg-black text-white'>
            <Link href="/">
                    <h1 className='text-lg sm:text-2xl font-bold'>
                        HomeMate AI
                    </h1>
            </Link>
            <div className='flex gap-x-3 sm:gap-x-6 text-lg items-center'>
                {routes.map((route,index)=>(
                    <Link
                        key={index}
                        href={route.path}
                        className={
                            pathname === route.path ? "border-b-2 border-mainColor": ""
                        }
                    >
                        {route.name}
                    </Link>
                ))}
                <UserButton afterSignOutUrl='/sign-in'/>
                
            </div>
        </div>
    )
}

export default Navbar
