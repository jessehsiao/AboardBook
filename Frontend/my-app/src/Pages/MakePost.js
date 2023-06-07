import '../css/MakeSurvey.css';
import { Navbar } from './Components/Navbar';
import React from 'react';
import { useState } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from 'react-bootstrap';
import { Footer } from './Components/Footer';
import Select from "react-select";
import { Form } from 'react-router-dom';




const MakePost = () =>{

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



    const handleSubmit = async(event) =>{
        /*
        submit to the next page
        */
        if (postTitle==="" || postContent==="" || cat===""){
            alert("欄位不得為空")
        }
        else{
            let form_dict={
                "category":cat,
                "title":postTitle,
                "content":postContent
            }
            console.log(form_dict)
            try {
                const response = await fetch(`/api/CreatePost`, {
                    method: 'POST',
                    headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwt')}`
                    },
                    body: JSON.stringify(form_dict),
                });
                const dataJSON = await response.json();
                if (response.ok) {
                    alert("發布完成")
                    console.log(response)
                    console.log(dataJSON)
                    window.location.href = '/form/' + dataJSON["post_id"];
                    
                } else {
                    console.log("ERROR")
                }
            } catch (error) {
                console.log('發生錯誤:', error);
            }
            event.preventDefault();
        }
    }
    const options = [
        { value: "澳洲", label: "澳洲" },
        { value: "美國", label: "美國" },
        { value: "紐西蘭", label: "紐西蘭" },
        { value: "加拿大", label: "加拿大" },
        { value: "英國", label: "英國" },
        { value: "日本", label: "日本" },
        { value: "德國", label: "德國" },
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
