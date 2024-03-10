"use client"

import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 초 단위로 설정
  const [audioPermisstion,setAudioPermisstion] = useState(false)
  const totalTime = 30 * 60; // 초 단위의 전체 시간 (30분)

  // Audio
  const challengeSound = new Audio("/challenge_sound.mp3")

  const playAudio = ()=>{
      challengeSound.volume = 0.3;
      challengeSound.loop = true;
      challengeSound.play();
  }
  const stopAudio = ()=>{
    challengeSound.paused
  }

  useEffect(()=>{
    console.log('useEffect실행')
    // 오디오 입력 권한
    const getAudioPermission = ()=>{
      // 사용자가 오디오 허용할 것인지?
      var AudioContext;
      var audioContext;

      navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
          AudioContext = window.AudioContext
          audioContext = new AudioContext();
          setAudioPermisstion(true)
      }).catch(e => {
        setAudioPermisstion(false)
          console.error(`Audio permissions denied: ${e}`);
      });
    }
    getAudioPermission()

    // 권한에 따라 오디오 처리
    if(audioPermisstion){
      playAudio();
    }else{
      stopAudio()
    }

    return ()=>stopAudio()
  },[audioPermisstion])

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
