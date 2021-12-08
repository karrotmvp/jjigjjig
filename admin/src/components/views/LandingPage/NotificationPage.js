import React, { useState } from 'react'
import '../../../index.css'
import VerificationForm from './VerificationForm';

function NotificationPage(props) {
    
    const [ApiKey, setApiKey] = useState('');
    const [Type, setType] = useState(1);

    // const preopenOnClickHandler = () => {
    //     if (!window.confirm('정말 발송하시겠습니까?')) return ;
    //     axios.post(process.env.REACT_APP_SERVER + 'notification/preopen',null, {
    //         headers: {
    //             "X-Api-Key": ApiKey
    //         }
    //     })
    //     .then(res => {
    //         alert('발송 성공');
    //     })
    //     .catch(err => {
    //         alert('발송 실패');
    //     })
    // }

    // const customOnSubmit = (e) => {
    //     e.preventDefault();
    // }

    return (
        <div className="container">
            <input name="x-api-key" value={ApiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="apikey를 입력하세요"/>
            {/* <div className="">
                <h3>사전 등록 알림톡 발송하기</h3>
                <button onClick={preopenOnClickHandler}>알림톡 발송하기</button>
            </div> */}
            {/* <div>
                <h3>커스텀 알림톡 발송하기</h3>
                <form onSubmit={customOnSubmit} style={{ display: 'flex', flexDirection: 'column'}}>
                    <input placeholder="userId"/>
                    <input placeholder="title"/>
                    <input placeholder="text"/>
                    <input placeholder="button_text"/>
                    <input placeholder="url"/>
                </form>
            </div> */}
            <div>
                <h3>검증 알림톡 발송하기</h3>
                <button onClick={() => setType(1)}>one</button>
                <button onClick={() => setType(2)}>two</button>
                <button onClick={() => setType(3)}>three</button>
                <button onClick={() => setType(4)}>four</button>
                <VerificationForm type={Type}/>
            </div>
        </div>
    )
}

export default NotificationPage
