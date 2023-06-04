import '../../css/Card.css';
import callrefresh from '../../refresh.js';
import { FaRegCopy } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';

const Card = ({ info, type }) => {

    const imageUrls = [
        'https://i.imgur.com/amr4AKi.png',
        'https://i.imgur.com/J4vCNv6.png',
        'https://i.imgur.com/koz9hYP.png',
        'https://i.imgur.com/qGVe0pq.png',
        'https://i.imgur.com/p605DW0.png',
        'https://i.imgur.com/oF2oN2c.png',
        'https://i.imgur.com/sHElTiU.png',
        'https://i.imgur.com/8cIY8aH.png',
        'https://i.imgur.com/6MtjvCp.png'
      ];

    const randomIndex = Math.floor(Math.random() * imageUrls.length);

    const { t, i18n } = useTranslation();
    if (!info) return <div className="empty-card"></div>;
    let author, num_prize, image_path, title, due_time, lottery_time, category_name;

    category_name = info.category_name;
    author = info.name;
    image_path = info.form_pic_url || imageUrls[randomIndex];
    title = info.title.length > 30 ? info.title.substring(0, 30) + '...' : info.title;
    // due_time = info.form_end_date;
    due_time = new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric', 
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        }).format(new Date(info.timestamp))

    if (info.timestamp===null){
        lottery_time = "此問卷沒有抽獎"
    }
    else{

        const timestamp = info.timestamp;
        const date = new Date(timestamp);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: 'UTC',
        };
        const formatter = new Intl.DateTimeFormat('zh-TW', options);
        lottery_time = formatter.format(date);
        // lottery_time = new Intl.DateTimeFormat('zh-TW', {
        //     year: 'numeric', 
        //     month: 'long',
        //     day: 'numeric',
        //     hour: 'numeric',
        //     minute: 'numeric',
        // }).format(new Date(info.timestamp));
    }

    // if (type === 'explore'){
    //     prize = '抽獎名額';
    //     num_prize = info.num_gift;
    //     image_path = info.form_pic_url || (process.env.PUBLIC_URL + 'form_preview_default.png');
    //     title = info.form_title.length > 30 ? info.form_title.substring(0, 30) + '...' : info.form_title;
    //     due_time = info.form_end_date;
    //     lottery_time = 'lottery date';
    // }

    const clickForm = (e) => {
        console.log("form_id of this card is", info.form_id);
        window.location.href='form/'+info.form_id;
        return
    }

    // // 刪除或關閉問卷
    // const manageform = async (action) => {
    //     const a = JSON.stringify({
    //         form_id: info.form_id,
    //         action : action,
    //     })

    //     const getprotected = await fetch('https://be-sdmg4.herokuapp.com/SurveyManagement',{

    //         method: 'PUT',
    //         headers: {
    //             Authorization: `Bearer ${localStorage.getItem('jwt')}`,
    //         },
    //         body: a,
    //     });
    //     console.log(getprotected.status);
    //     if(getprotected.status === 401){
    //         callrefresh();
    //     }else{
    //         const resdata = await getprotected.json();
    //         console.log(resdata);
    //         alert(resdata.message);
    //         window.location.reload();
    //     }
    // };

    const showStatus = () => {
        if(type==='replied'){
            if(info.form_run_state === 'Closed'){
                if(info.draw_result === null){
                    return(<div className="prize-tag black">{t('未中獎')}</div>)
                }
                else if(info.form_run_state !== null){
                    return(<div className="prize-tag pink">{t('已中獎')}</div>)
                }            
            }
            else if(info.form_run_state === 'Open' || info.form_run_state === 'WaitForDraw'){
                return(<div className="prize-tag">{t('未開獎')}</div>)
            }
            else if(info.form_run_state === 'Delete'){
                return(<div className="prize-tag black">{t('已刪除')}</div>)
            }
            else {
                return(<div className="prize-tag">{t('未知狀態')}</div>)
            }
        }
        else if (type==='created'){
            if(info.form_run_state === 'Open'&& info.form_draw_date !== null){
                return(<div className="prize-tag">{t('未開獎')}</div>)
            }
            else if(info.form_run_state === 'Open'&& info.form_draw_date === null){
                return(<div className="prize-tag">{t('無獎品')}</div>)
            }
            else if(info.form_run_state === 'Closed' && info.form_draw_date !== null){
                return(<div className="prize-tag pink">{t('已開獎')}</div>)
            }
            else if(info.form_run_state === 'Closed' && info.form_draw_date === null){
                return(<div className="prize-tag black">{t('已結束')}</div>)
            }
            else if(info.form_run_state === 'WaitForDraw'){
                return(<div className="prize-tag pink">{t('待開獎')}</div>)
            }
            else if(info.form_run_state === 'Delete'){
                return(<div className="prize-tag black">{t('已刪除')}</div>)
            }
            else {
                return(<div className="prize-tag">{t('未知狀態')}</div>)
            }
        }
    }

    return (
        <div className="card card-shadow" onClick={clickForm}>
            <div className="prize-tag-container">
                {type==='home'? <><div className="prize-tag">{t(category_name)}</div></> : <></>}
                {/* {showStatus()} */}
                {/* {type==='created' && 
                    <div className="nav-option card-dropdown" >
                        {t("...")}
                        <div className="user-dropdown-options" >
                            <button onClick={async e =>{e.stopPropagation(); manageform('close')}}>{t("關閉問卷")}</button>
                            <button onClick={async e =>{e.stopPropagation(); manageform('delete')}}>{t("刪除問卷")}</button>
                        </div>
                    </div>} */}
            </div>
            <img alt="" className="q-image" src={image_path}/>
            <div className='card-form-title'> <h3>{title}</h3> </div>
            <p>
                {t("發布者")}: {author} <br/>
                {t("發布時間")}:<br/>{lottery_time} <br/>
            </p>
            {/* <div 
                className='share-q'
                onClick={async e => {
                    e.stopPropagation();
                    await navigator.clipboard.writeText(`https://sdmg4.herokuapp.com/form/${info.form_id}`);
                    const copyMsg = document.querySelector('.copy-message');
                    copyMsg.classList.add('show');

                    setTimeout(() =>{copyMsg.classList.remove('show')}, 2500);
                }}
            >
                <FaRegCopy/>
            </div> */}
        </div>

    )
}

export { Card };