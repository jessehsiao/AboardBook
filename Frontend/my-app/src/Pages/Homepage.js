import '../css/Homepage.css';
import axios from 'axios';
import { Card } from './Components/Card';
import { Navbar } from './Components/Navbar';
import { Footer } from './Components/Footer';
import { useEffect, useState } from 'react';
import ReactLoading from "react-loading";
import { LoginModal } from './Components/LoginModal';
import { CopyMessage } from './Components/CopyMessage';
import callrefresh from '../refresh.js';
import { useTranslation } from "react-i18next";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const Homepage = () => {
    const [page, setPage] = useState(0);
    const [maxPage, setMaxPage] = useState(0);
    const [forms, setForms] = useState({
        '熱門': null,
        '最新': null,
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [show, setShow] = useState('熱門');
    const { t, i18n } = useTranslation();
    
    
    useEffect(() => {

        const fetchData = async () => {
      
            let data = await fetch('/home',{
                
                headers: {'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'}
            });
            if (data.status===401){
                callrefresh('reload');
            }
            let dataJSON = await data.json();
            console.log(dataJSON);
            
            setMaxPage(Math.ceil((dataJSON.length) / 8));
            setPage(1);
            setForms( prevForms => {
                return {
                    ...prevForms,
                    '熱門': dataJSON
                };
            });

            // data = await fetch('/GetCategoryPost',{
            //     headers: {'Content-Type': 'application/json'}
            // });
            // if (data.status===401){
            //     callrefresh('reload');
            // }
            // dataJSON = await data.json();
            // setForms( prevForms => {
            //     return {
            //         ...prevForms,
            //         '最新': dataJSON
            //     };
            // });
            //
        }
        fetchData();
    }, []);

    const last_page_style = {
        transform: 'scaleX(-1)',
        cursor: page <= 1 ? null : 'pointer',
        opacity: page <= 1 ? '0.2' : '1',
    }
    const next_page_style = {
        cursor: page === maxPage ? null : 'pointer',
        opacity: page === maxPage ? '0.2' : '1',
    }

    const makeForm = ()=>{
        if(!(localStorage.getItem('jwt'))){
            setModalOpen(true);
        }
        else{
            window.location.href = "/MakeSurvey";
        }
    }


    return (
        <>
            <div id="portal"></div>
            <Navbar />
            {modalOpen && <LoginModal closeModal={setModalOpen} />}
            <section className='call-to-action'>
                {/* <img className='main-image' src={process.env.PUBLIC_URL + 'LandingPage.svg'} alt=''/> */}
                <div className='description'>
                    <div className='caption'>
                        <h2>{t("發現世界，留學無界")}<br/>{t("AboardBook 是提供台灣學生的留學討論平台")}</h2>
                        <h3>{t("快來分享你的留學疑問與經驗，與 AboardBook 一起同行！")}</h3>
                    </div>
                    <div className='cta-button'>
                        <button className='explore-button' onClick={()=>{window.location.href = "/explore"}}>{t("踏上探索之旅")}</button>
                        <button className='make-survey-button' onClick={makeForm}>{t("傳遞經驗，發表問題")}</button>
                    </div>
                </div>
            </section>
            <section className='latest-q'>
                <div className='latest-q-container'>
                    <h2>{t(show)}{t("文章總覽")}</h2>
                    <h3>{t("開啟暢遊世界的大門，探索跨國留學的精彩故事和寶貴經驗。")}</h3>
                    {/*<select value={show} onChange={e => {setShow(e.currentTarget.value)}}>
                        {['熱門', '最新'].map(item => {
                            return (<option value={item} key={item}>{item}</option>);
                        })}
                    </select>*/} 

                    <Select
                        value={show}
                        onChange={e=>setShow(e.target.value)}
                        >
                        {['熱門', '最新'].map(item => {
                            return (<MenuItem value={item} key={item}>{t(item)}</MenuItem>);
                        })}
                    </Select>


                    {!forms[show]
                        ?
                            <div className='card-container'>
                                <ReactLoading type="spinningBubbles" color="#432a58" />
                            </div>
                        :<>
                            <div className='card-container'>
                                {
                                    [...Array(8)]
                                    .map((_, i) => 8*(page-1) + i)
                                    .map(item => {
                                        return item > forms[show].length
                                        ? <Card key={item} info={null} type='home'/> 
                                        : <Card 
                                            key={item}
                                            info={forms[show][item]}
                                            openModal={() => setModalOpen(true)}
                                            type='home'
                                        />
                                    })
                                }
                            </div>
                        </>
                    }
                </div>
            </section>
            <section className='page-div'>
                <img 
                    src={`${process.env.PUBLIC_URL}/next_page.png`}
                    width={50}
                    style={last_page_style} 
                    onClick={() => {
                        if (page === 1) return;
                        setPage(page - 1);
                    }}
                />
                Page {page} of {maxPage}
                <img 
                    src={`${process.env.PUBLIC_URL}/next_page.png`}
                    width={50}
                    style={next_page_style}
                    onClick={() =>{ 
                        if (page === maxPage) return;
                        setPage(page + 1);
                    }}
                />
            </section>
            <Footer />
            <CopyMessage/>
        </>
    )

}

export { Homepage }