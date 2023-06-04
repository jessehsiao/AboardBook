import '../css/MakeSurvey.css';
import { Navbar } from './Components/Navbar';
import React from 'react';
import { useState } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from 'react-bootstrap';
import { Footer } from './Components/Footer';
import Select from "react-select";




const MakePost = () =>{
    //const [myTasks, moveMyTask] = useState(props.tasks);
    //const [storedElements, setStoredElements] = useState([]);
    const [cat, setCat] = useState("")
    const [postTitle, setPostTitle] = useState("")
    const [postContent, setContent] = useState("")
    const [rerenderkey, setrerenderkey] = useState(0)
    const [qid, setqid] = useState(0)
    const [optid, setoptid] = useState(1000)
    const { t, i18n } = useTranslation();

    const handleContentChange = event => {
        // 👇️ access textarea value
        setContent(event.target.value);
      };

    const handleTitleChange = event => {
        // 👇️ access textarea value
        setPostTitle(event.target.value);
    };



    const handleSubmit = event =>{
        /*
        submit to the next page
        */
        if (postTitle==="" || postContent==="" || cat===""){
            alert("欄位不得為空")
        }
        else{

            let form={
                user_id:'Still not sure',
                category:cat,
                title:postTitle,
                content:postContent
            }
            console.log(form)
            

            event.preventDefault();
            window.sessionStorage.setItem('form', JSON.stringify(form));
            //window.location.href = '/MakeSurvey2';//暫時用jS去寫換頁
        }
    }
    const options = [
        { value: "England", label: "英國" },
        { value: "America", label: "美國" },
        { value: "Japan", label: "日本" },
      ];


    return (

        <>
        <Navbar/>
        {/*react dnd*/}
        <section className='page-container' key={rerenderkey}>
            <div className='breadcrumb-container'>
                <div className='breadcrumb'>
                    <button className='SurveyOptionBtn card-shadow'>
                        {t("取消")}
                    </button>
                    <button className='SurveyOptionBtn card-shadow btn-clicked' onClick={handleSubmit}>
                        {t("發布")}
                    </button>
                </div>
            </div>
            <section className='makeSurvey-container'>
        
                <section className='makeSurvey-questions card-shadow'>
                <div className='makeSurvey-card'>

                    <h3>{t("發文看板")}</h3>
                        <p>
                            <Select style={{width: "30%"}} options = {options} onChange={(item) => setCat(item.value)} placeholder="請選擇"/>
                        </p>
                    </div>
            
                    <div className='makeSurvey-card'>
                        <p>
                           <input type="text" maxLength="100" placeholder={t("標題")} className='input-columns' style={{width: "100%"}} onChange={handleTitleChange}/>
                        </p>
                    </div>

                    <div className='makeSurvey-card'>
                        <p>
                            <textarea maxLength="500" placeholder={t("問卷描述")} className='input-columns' style={{width: "100%", height:"350px", resize:'vertical'}} onChange={handleContentChange}></textarea>
                        </p>
                    </div>

    
                </section>  
                <div className='makeSurvey-questiontype-box card-shadow'>
                        <p>
                            <button className='Btn SurveyDescriptionBtn card-shadow'>
                            {t("插入圖片")}
                            </button>
                        </p>
                    </div>
                
            </section>

        </section>
        <Footer />
        </>
    )

}

export { MakePost };
