import React from 'react'
import {CircularProgressbar, buildStyles} from "react-circular-progressbar"

const Timer = () => {
    // text에 설정
  return (
    <div>
        <CircularProgressbar 
            value={60} 
            text={'60%'} 
            styles={buildStyles({
                textColor:'#fff',
            })}
        />
    </div>
  )
}

export default Timer
