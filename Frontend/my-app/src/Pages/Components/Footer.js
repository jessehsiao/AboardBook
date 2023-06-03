import '../../css/Footer.css'
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";


const Footer = () => {
    const { t, i18n } = useTranslation();
    return(
        <footer className="footer">
            <div className='copyright'>© 2023 AboardBook</div>
            <div className='footer-link'>
                <a href='register'>{t("這是")}</a>
                <a href='#'>{t("分散式期末")}</a>
                <a href='#'>{t("哈哈哈")}</a>
            </div>
            <div></div>
        </footer>
    )
}

export { Footer };