"use client"

import { UserChallengeData } from '@prisma/client'
import React, { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import { DateSelectArg, EventContentArg } from '@fullcalendar/core/index.js'
import ScheduleDialog from './ScheduleDialog'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';

interface UserChallengeProps {
    userChallengeInfo : UserChallengeData[]
    calendarRef:any
}

const UserChallenge = ({userChallengeInfo,calendarRef}:UserChallengeProps) => {
    // state
    const [isOpenScheduleDialog,setIsOpenScheduleDialog] = useState(false)
    const [challengeDetail,setChallengeDetail] = useState<UserChallengeData | null>(null)

    // FullCalendar에서 사용할 이벤트 배열 생성
    const events = userChallengeInfo.map(challenge => ({
        title: challenge.success ? '성공' : '실패',
        date: new Date(challenge.createdAt).toISOString().substr(0, 10), // YYYY-MM-DD 형식으로 변환
        color:challenge.success ? '#fcd34d':'#e76f3b',
    }));

    const eventContent = (eventInfo: EventContentArg) => {
        return (
          <div className={`w-full text-center p-1 text-black font-medium ${eventInfo.event._def.title==="성공" ? "bg-mainColor" :"bg-[#e76f3b] text-white"}`}>
            {eventInfo.event.title}
          </div>
        );
    };

    const closeDialog = ()=>{
        setIsOpenScheduleDialog(false)
    }

    const openDialog = (selectedDate: Date) => {
        // 선택된 날짜에 하루를 추가하여 다음 날로 설정합니다.
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
    
        // 모달창에 넘겨줄 챌린지 세부 내용
        const selectedDateString = nextDay.toLocaleDateString();
        const challengeInfo = userChallengeInfo.filter(challenge => {
            const challengeDateString = new Date(challenge.createdAt).toLocaleDateString();
            return challengeDateString === selectedDateString;
        });
        // 모달창 오픈
        setChallengeDetail(challengeInfo[0])
        setIsOpenScheduleDialog(true);
    };
    

    const onDateClick = ({ date }: DateClickArg) => {
        openDialog(date);
    };


    return (
        <div className='mt-4 text-black'>
            <FullCalendar
                ref={calendarRef}
                plugins={[ dayGridPlugin,interactionPlugin ]}
                initialView="dayGridMonth"
                events={events}
                eventContent={eventContent}
                dateClick={onDateClick}
                headerToolbar={{
                    start: 'title',
                    center: '',
                    end: 'prev,next'
                }}
                height={550}
            />
            { isOpenScheduleDialog &&
                <ScheduleDialog
                    closeDialog={closeDialog}
                    selectedInfo={challengeDetail}
                />
            }
        </div>
    )
}

export default UserChallenge
