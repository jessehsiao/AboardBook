import '../../css/Navbar.css';
import { LoginModal } from './LoginModal';
import React, { useState,useEffect } from 'react';
import { useNavigate, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from 'i18next';

const Navbar = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [navActive, setNavActive] = useState(false);
    const [toggleUserM, settoggleUserM] = useState(false);
    const [toggleLngM, settoggleLngM] = useState(false);
    const [lngmodalOpen, setlngModalOpen] = useState(false);
    const navigate = useNavigate();

    
    //多國語言切換
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
       i18n.changeLanguage(lng);
       window.sessionStorage.setItem('lng', lng);
    };

    useEffect(() => {
        let lngInfo = window.sessionStorage.getItem('lng')
        if(lngInfo){
            i18n.changeLanguage(lngInfo);
        }
    }, []);

    const calllogout = async (e) => {
        e.preventDefault();
        localStorage.removeItem('jwt');
        localStorage.removeItem('refresh_token');
        console.log("Logout Success");
        alert("登出成功");
        window.location.reload();
        window.location.href = "/"
        //navigate(<Homepage/>);
    };
    const clearform =()=>{
        window.sessionStorage.removeItem('form_info'); 
        window.sessionStorage.removeItem('form'); 
        //event.preventDefault();
      }


    if (!(localStorage.getItem('jwt'))){                // 未登入狀態
        return(
            <>
                <header className="header">
                    <div id="navbar-container">
                        <button id="custom-toggle"><i class="fas fa-bars"></i></button>
                        <nav id="custom-navbar">
                            <div className='toggle-button' onClick={() => setNavActive(prev => !prev)}>
                                <span className='bar'></span>
                                <span className='bar'></span>
                                <span className='bar'></span>
                            </div>
                            <div className='navbar-links'>
                                <NavLink className={(navData) => navData.isActive ? 'active-nav-option' : 'nav-option'} to='/explore'> {t("探索貼文")} </NavLink>
                        
                                {/* <NavLink className={(navData) => navData.isActive ? 'active-nav-option' : 'nav-option'} to='/Instruction' > {t("說明")} </NavLink> */}
                                <div className="nav-option user-dropdown" onClick={() => setModalOpen(true)}>
                                    {t("會員")}
                                    <div className="user-dropdown-options" >
                                        <button>{t("管理文章")}</button>
                                        <button>{t("發表文章")}</button>
                                        <button>{t("登入")}</button>
                                    </div>
                                </div>
                                {/* <div className="nav-option user-dropdown" onClick={() => setlngModalOpen(true)}>
                                    {t("語言")}
                                    <div className="user-dropdown-options" >
                                        <button onClick={() => changeLanguage("tw")}>{t("中文")}</button>
                                        <button onClick={() => changeLanguage("en")}>{t("英文")}</button>
                                    </div>
                                </div> */}
                            </div>
                            {modalOpen && <LoginModal closeModal={setModalOpen} />}
                        </nav>
                    </div>

                <h1 className="app-title"><a href='/'>AboardBook</a></h1>

                </header>

                {/* Mobile  Navbar */}
                <div className='navbar-links-mobile' style={navActive ? {display: 'flex'} : null}>
                    <NavLink className={(navData) => navData.isActive ? 'active-nav-option' : 'nav-option'} to='/explore'> {t("探索文章")}  </NavLink>

                    {/* <NavLink className={(navData) => navData.isActive ? 'active-nav-option' : 'nav-option'} to='/Instruction'> {t("說明")}  </NavLink> */}
                    <div className="nav-option user-dropdown" onClick={() => setModalOpen(true)}>
                        {t("會員")}
                        <div className="user-dropdown-options" >
                            <button>{t("管理問卷")}</button>
                            {/* <button>{t("個人資料")}</button> */}
                            <button>{t("登入")}</button>
                        </div>
                    </div>
                    <div className="nav-option user-dropdown" onClick={() => setlngModalOpen(true)}>
                        {t("語言")}
                        <div className="user-dropdown-options" >
                            <button onClick={() => changeLanguage("tw")}>{t("中文")}</button>
                            <button onClick={() => changeLanguage("en")}>{t("英文")}</button>
                        </div>
                    </div>
                    {modalOpen && <LoginModal closeModal={setModalOpen} />}
                </div>
            </>
    
        )
    }

    else{                                           // 已登入狀態
        return(
            <>
                <header className="header">
                    {/* <h1 className="app-title"><a href='/' onClick={clearform}>AboardBook</a></h1> */}
                    {/* <button id="custom-toggle"><i class="fas fa-bars"></i></button> */}
                    <nav id="custom-navbar2">
                        <div className='toggle-button' onClick={() => setNavActive(prev => !prev)}>
                            <span className='bar'></span>
                            <span className='bar'></span>
                            <span className='bar'></span>
                        </div>
                        <div className='navbar-links'>
                            <NavLink className={(navData) => navData.isActive ? 'active-nav-option' : 'nav-option'} to='/explore' onClick={clearform}> {t("探索文章")} </NavLink>
                            {/*<NavLink className={(navData) => navData.isActive ? 'active-nav-option' : 'nav-option'} to='/MakePost' onClick={clearform}> {t("發表文章")}  </NavLink>*/}
                            {/* <NavLink className={(navData) => navData.isActive ? 'active-nav-option' : 'nav-option'} to='/Instruction' onClick={clearform}> {t("說明")} </NavLink> */}
                            <div className="nav-option user-dropdown">
                                {t("會員")}
                                <div className="user-dropdown-options" >
                                    <button onClick={()=>{window.location.href = "/SurveyManagement";  window.sessionStorage.removeItem('form_info'); window.sessionStorage.removeItem('form'); }}>{t("我的文章")}</button>
                                    {/* <button onClick={()=>{window.location.href = "/Profile"; window.sessionStorage.removeItem('form_info'); window.sessionStorage.removeItem('form'); }}>{t("個人資料")}</button> */}
                                    <button onClick={calllogout}>{t("登出")}</button>
                                </div>
                            </div>
                            {/* <div className="nav-option user-dropdown" onClick={() => setlngModalOpen(true)}>
                                {t("語言")}
                                <div className="user-dropdown-options" >
                                    <button onClick={() => changeLanguage("tw")}>{t("中文")}</button>
                                    <button onClick={() => changeLanguage("en")}>{t("英文")}</button>
                                </div>
                            </div>  */}
                        </div>
                    </nav>

                    <h1 className="app-title"><a href='/'>AboardBook</a></h1>
                </header>
                {/* Mobile  Navbar
                <div className='navbar-links-mobile' style={navActive ? {display: 'flex'} : null}>
                    <NavLink className={(navData) => navData.isActive ? 'active-nav-option' : 'nav-option'} to='/explore'> {t("探索")}  </NavLink>
                    <NavLink className={(navData) => navData.isActive ? 'active-nav-option' : 'nav-option'} to='/MakeSurvey'> {t("製作問卷")} </NavLink>
                    <NavLink className={(navData) => navData.isActive ? 'active-nav-option' : 'nav-option'} to='/Instruction'> {t("說明")} </NavLink>
                    <button 
                        className="nav-option user-dropdown"
                        onClick={() => {
                            const obj = document.querySelectorAll('.user-dropdown-options-m');
                            if (!toggleUserM){
                                obj.forEach(item => item.classList.add('show'));
                                settoggleUserM(prev => !prev);
                            }
                            else {
                                obj.forEach(item => item.classList.remove('show'));
                                settoggleUserM(prev => !prev);
                            }
                        }}>
                        User
                    </button>

                    <button className="nav-option user-dropdown-options-m" onClick={()=>{window.location.href = "/SurveyManagement"}}>{t("管理問卷")}</button>
                    <button className="nav-option user-dropdown-options-m" onClick={()=>{window.location.href = "/Profile"}}>{t("個人資料")}</button>
                    <button className="nav-option user-dropdown-options-m" onClick={calllogout}>{t("登出")}</button>

                    <div
                        className="nav-option user-dropdown"
                        onClick={() => {
                            setlngModalOpen(true);
                            const obj = document.querySelectorAll('.lng-dropdown-options-m');
                            if (!toggleLngM){
                                obj.forEach(item => item.classList.add('show'));
                                settoggleLngM(prev => !prev);
                            }
                            else {
                                obj.forEach(item => item.classList.remove('show'));
                                settoggleLngM(prev => !prev);
                            }
                        }}>
                        {t("語言")}
                    </div>
                    <button className="nav-option lng-dropdown-options-m" onClick={() => changeLanguage("tw")}>{t("中文")}</button>
                    <button className="nav-option lng-dropdown-options-m" onClick={() => changeLanguage("en")}>{t("英文")}</button>
                </div> */}
            </>
        )
    }
    
}

export { Navbar };