import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 초 단위로 설정
  const totalTime = 30 * 60; // 초 단위의 전체 시간 (30분)

  useEffect(() => {
    const interval = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const percentage = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className='flex flex-col items-center '>
      <CircularProgressbar 
        value={percentage} 
        text={`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`} 
        styles={buildStyles({
          textColor:'#fdfdfd',
          pathColor: "#f54e4e",
          trailColor:'#FFFFFF33'
        })}
      />
    </div>
  );
};

export default Timer;
