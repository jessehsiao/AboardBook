import '../css/Lottery.css';
import '../css/Fill-in.css';
import '../css/Form.css';
import callrefresh from '../refresh.js';
import { Footer } from './Components/Footer';
import { Navbar } from './Components/Navbar';
import { Fillin } from './Fill-in';
import { Lottery } from './Lottery';
import { SurveyStatistics } from './SurveyStatistics';
import React, { useState, useEffect, useCallback } from 'react';
import {useParams} from 'react-router-dom';
import ReactLoading from "react-loading";
import Loading from 'react-loading';
import { Avator } from './Components/Avator';
import { LoginModal } from './Components/LoginModal';
import { useTranslation } from "react-i18next";




const Form = () => {
    const props = useParams();
    const POST_ID = props.form_id; // 傳入想要看的 formID
    const [gifts, setGifts] = useState([]);
    const [haveGifts, setHaveGifts] = useState(true);
    const [formDetail, setFormDetail] = useState([]);
    const [formStatus, setFormStatus] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [tags, setTags] = useState([])
    const [showTag, setShowTag] = useState('填寫問卷')
    const [isLoading, setIsLoading] = useState(true);
    const [lotteryResults, setLotteryResults] = useState({
        "status":"Open",
        "results":[],
        "isLoading":true,  // 控制是否還在 loading
    });
    const { t, i18n } = useTranslation();
    const [newComment, setNewComment] = useState('');
    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
      };
    const handleSubmitComment = async (event) => {
        event.preventDefault();
        try {
          const response = await fetch(`/InsertComent`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwt')}`
            },
            body: JSON.stringify({
                post_id: parseInt(POST_ID),
                post_comment: newComment,
                category : ""
            }),
          });
          
          alert("已送出留言！！")
      
          if (response.ok) {
            // 留言提交成功，更新留言列表
            window.location.reload();

          } else {
            console.log("ERROR")

          }
        } catch (error) {
          console.log('留言提交出错:', error);
        }
      };
            
      const makeForm = ()=>{
        if(!(localStorage.getItem('jwt'))){
            setModalOpen(true);
        }
    }


    // 使用 useEffect Hook
    useEffect(() => {

        let abortController = new AbortController();  
        console.log('Form.js: execute function in useEffect');

        // 等問卷資料載入完畢再進入頁面
        const fetchData = async () => {
            try{
                await Promise.all([
                    // fetchCurrentGifts(),
                    fetchFormDetail(),
                    // fetchFormStatus(),
                ]);
                // await fetchIsOwner()
                setIsLoading(false);
                // fetchLotteryResults();
            }
            catch(error){
                console.log('Form Page Fetch Error', error)
            }
            // if (!(localStorage.getItem('jwt'))){
            //     await delay(5000);
            //     alert("請先進行登入");
            //     setShowLoginModal(true);
            //     // window.location.href="/"
            // }
        }
        fetchData();
        return () => {  
            abortController.abort();  
        }  
    }, []);  // dependency 

    const delay = (s) => {
        return new Promise(resolve => {
          setTimeout(resolve,s); 
        });
      };
      

    const fetchFormDetail = async () => {
        try {
            const response = await fetch(
                `/GetPostById?post_id=${encodeURIComponent(POST_ID)}`,
                {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        // Authorization: `Bearer ${localStorage.getItem('jwt')}`  // 驗證使用者資訊 可拿掉
                    }
                }
            )
            if(response.status === 401){
                callrefresh();
            }
            else{
                const resJson = await response.json();



                const date = new Date(resJson[0].posted[0].timestamp);
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

                // console.log("Comments : ",resJson[0].comments)

                setFormDetail({
                    form_title : resJson[0].posted[0].title,
                    form_user : resJson[0].posted[0].name,
                    form_content : resJson[0].posted[0].content,
                    category : resJson[0].posted[0].category_name,
                    form_create_date : formatter.format(date),
                    comments: resJson[0].comments
                })
            }
        } catch (err){
            console.log('fetch form result error', err);
        }
    };


    function changePage(showTag){
        // console.log('Show tag: ', showTag)
        if (showTag === "填寫問卷"){
            return(

            <section className='lottery-container'>
             
                <section className='form-info2 card-shadow2'>
                    <h2>{formDetail.form_title}</h2>
                    {t("地區")}：{formDetail.category} <br />
                    {t("發布者")}：{formDetail.form_user} <br />
                    {t("發布時間")}：{formDetail.form_create_date} <br />

                    <div className='content-box'>
                    {formDetail.form_content} <br />
                    </div>
                    
                </section>        
                <section className='form-info3 card-shadow3'>
                    <h2>留言</h2>
                    <div className='content-box comment-container'>
                        {formDetail.comments.length > 0 ? (
                        formDetail.comments.map((comment, index) => (
                            <div key={index} className='comment'>
                            <p className='comment-content'>{comment['User Name']} :</p>
                            <p >{comment['Comment Content']}</p>
                            <p className='comment-timestamp'>{comment.Timestamp}</p>
                            </div>
                        ))
                        ) : (
                        <p>目前尚未有留言</p>
                        )}
                    {localStorage.getItem('jwt') ? (
                    <form onSubmit={handleSubmitComment} className='comment-form'>
                        <div className='comment-input-container'>
                        <input
                            className='input_comments'
                            type='text'
                            value={newComment}
                            onChange={handleCommentChange}
                            placeholder='輸入留言...'
                        />
                        </div>
                        <button type='submit' className='send_comments'>送出</button>
                    </form>
                    ) : (
                    <button className='login-button' onClick={makeForm}>請先登入</button>
                    )}

                    </div>
                </section>            
            </section>



            )
        }
        else if (showTag === "抽獎結果"){
            return <Lottery form_id = {POST_ID} lr = {lotteryResults} form_title={formDetail.form_title} isOwner={isOwner}  haveGifts={haveGifts}/> 
        }
        else if (showTag === "填答結果"){
            return <SurveyStatistics form_id = {POST_ID} form_title={formDetail.form_title} lotteryResults={lotteryResults}/> 
        }
        else{
            return <Lottery form_id = {POST_ID} lr = {lotteryResults} form_title={formDetail.form_title} haveGifts={haveGifts}/> 
        }
    };

    function show(){
        if(formStatus ==="NotExist"){
            return(
                <> <div className='modalBackground'>
                    <div className="alert-modal">
                        <h2>{t("此問卷不存在")}</h2>
                        <button className="Btn create-account-button" onClick={() => {window.location.href='/'}}>{t("回首頁")}</button>
                    </div>
                </div></>
            )
        }
        else if(formStatus ==="Delete"){
            return(
                <> <div className='modalBackground'>
                    <div className="alert-modal">
                        <h2>{t("此問卷已被作者刪除")}</h2>
                        <button className="Btn create-account-button" onClick={() => {window.location.href='/'}}>{t("回首頁")}</button>
                    </div>
                </div></>
            )
        }
        else {
            return(
                <>
                <div className='page-navbar'>
                {tags.map(item => {
                    return (
                        <div
                            className='page-navbar-item card-shadow'
                            key={item}
                            style={item === showTag ? {backgroundColor: 'rgba(77, 14, 179, 0.15)'} : {}}
                            onClick={e => {
                                setShowTag(item);
                            }}
                        >{t(item)}</div>
                    )
                })}
                </div>
                <section className='lottery-container'>
                    {/* 問卷左半部 */}
                    {changePage(showTag)}

             
                </section>
                </>
            )
        }
    }


    return (
   
        <div className="form-page-container">
        <Navbar/>
        <div id="portal"></div>

        {modalOpen && <LoginModal closeModal={setModalOpen} />}
        { isLoading ? <> <section className='loading-container'> <ReactLoading type="spinningBubbles" color="#432a58" /> <h3> Loading </h3></section> </> :
            <>
            {/* {console.log('render form page')} */}
            {/* 選擇要填寫問卷、查看抽獎、查看填寫結果 */}
            <section className='lottery-page-container'>
                
                {show()}
            </section>
            </>
        }
        <Footer />
      
        </div>
    )
}
export { Form }