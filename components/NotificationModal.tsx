import React from 'react'
import toast from 'react-hot-toast';
import ReactDOM from 'react-dom';

interface NotificationModalProps{
  onRequestClose:(granted:boolean)=>void;
  saveSubscription:()=>void;
}

const NotificationModal = ({
  onRequestClose,
  saveSubscription,
}:NotificationModalProps) => {

  const requestNotificationPermission = async ()=>{
    if("Notification" in window && "serviceWorker" in navigator){
      const permission = await Notification.requestPermission();
      onRequestClose(permission === "granted")
      if(permission === "granted"){
        saveSubscription()
      }else{
        toast.error("Notifications are not supported in this browser or something went wrong.")
      }
    }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="font-bold text-xl mb-4">
          푸시 알림을 받는 것을 허용합니다
        </h2>
        <p className="mb-4">
          홈메이트 AI에게서 아침 7시 푸쉬업 | 스쿼트 챌린지 시작 10분 전 시작 알림을 받는 것을 허용합니다.
        </p>
        <button
          className="bg-mainColor text-white py-2 px-4 rounded-lg"
          onClick={requestNotificationPermission}
        >
          허용
        </button>
        <button
          className="ml-4 py-2 px-4 rounded-lg"
          onClick={() => onRequestClose(false)}
        >
          닫기
        </button>
      </div>
    </div>,
    document.body
  );
}

export default NotificationModal
