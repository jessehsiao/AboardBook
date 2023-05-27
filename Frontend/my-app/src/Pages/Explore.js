import '../css/Explore.css'
import { Card } from './Components/Card';
import { Navbar } from './Components/Navbar';
import { Footer } from './Components/Footer';
import { useEffect, useState } from 'react';
import { LoginModal } from './Components/LoginModal';
import { CopyMessage } from './Components/CopyMessage';

import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";

const Explore = ( ) => {
    const { t, i18n } = useTranslation();
    const [loading, setload] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [type, setType] = useState('分類方式');
    const [show, setShow] = useState('類別');
    const [query, setQuery] = useState(''); //for search bar
    const [showList, setShowList] = useState({
        '分類方式': [], '類別': [],

        '商業及管理學門': [], '教育學門': [], '工程學門': [], '社會及行為科學學門': [], '民生學門': [], '人文學門': [],
        '電算機學門': [], '法律學門': [], '藝術學門': [], '社會服務學門': [], '傳播學門': [], '醫藥衛生學門': [], '設計學門': [],
        '建築及都市規劃學門': [], '農業科學學門': [], '運輸服務學門': [], '自然科學學門': [], '數學及統計學門': [],
        '生命科學學門': [], '環境保護學門': [], '軍警國防安全學門': [], '其他學門': [], '獸醫學門': [],

        '飲料類': [], '食物類': [], '兌換卷類': [], '服裝飾品類': [], '美妝保養類': [], '圖書類': [],
        '日用品類': [], '運動戶外類': [], '現金類': [],'無抽獎活動': [], '搜尋結果': [],
    });
    
    const keywordType = ['分類方式', '以領域搜尋', '以獎品搜尋'];
    const field_list = ['類別', '商業及管理學門', '教育學門', '工程學門', '社會及行為科學學門', '民生學門', '人文學門',
                        '電算機學門', '法律學門', '藝術學門', '社會服務學門', '傳播學門', '醫藥衛生學門', '設計學門',
                        '建築及都市規劃學門', '農業科學學門', '運輸服務學門', '自然科學學門', '數學及統計學門',
                        '生命科學學門', '環境保護學門', '軍警國防安全學門', '其他學門', '獸醫學門'];
    const gift_list = ['類別', '飲料類', '食物類', '兌換卷類', '服裝飾品類', '3C類', '美妝保養類',
                    '圖書類','日用品類', '運動戶外類', '現金類', '無抽獎活動'];
                    

    useEffect(() => {
        const fetchData = async () => {
            setload(true)
            let data = await fetch('https://be-sdmg4.herokuapp.com/home',{
                headers: {'Content-Type': 'application/json'}
            });

            field_list.forEach(async item => {
                const data = await fetch(`https://be-sdmg4.herokuapp.com/GetFormByKeyWord?KeywordType=field&Keyword=${item}`);
                const dataJSON = await data.json();
                setShowList(prevShowList => {
                    let curShowList = prevShowList;
                    curShowList[item] = dataJSON;
                    return curShowList;
                });
            });
            gift_list.forEach(async item => {
                const data = await fetch(`https://be-sdmg4.herokuapp.com/GetFormByKeyWord?KeywordType=tag&Keyword=${item}`);
                const dataJSON = await data.json();
                setShowList(prevShowList => {
                    let curShowList = prevShowList;
                    curShowList[item] = dataJSON;
                    return curShowList;
                });
            });

            setload(false)
            let dataJSON = await data.json();
            setShowList( prevShowList => {
                return {
                    ...prevShowList,
                    '類別': dataJSON,
                    '分類方式': dataJSON
                };
            });
        }
        fetchData();
    }, []);

    return (
        <>
            <Navbar />
            <div className='explore-title'>
                <h2>{t("貼文總覽")}</h2>
            </div>
            <div className='tag-select'>
                <select value={type} onChange={e => {setType(e.currentTarget.value)}}>
                    {keywordType.map(item => {
                        return (<option value={item}>{t(item)}</option>);
                    })}
                </select>             
                {type === '分類方式'
                    ? null
                    : <select value={show} onChange={e => {
                        console.log(showList)
                        setShow(e.currentTarget.value)
                    }}>
                        {type === '以獎品搜尋'
                            ?  gift_list.map(item => {return (<option value={item}>{t(item)}</option>);})
                            : field_list.map(item => {return (<option value={item}>{t(item)}</option>);})
                        }
                        </select>
                }
                <input type='text'
                    value={query}
                    placeholder='Search Form'
                    onChange={e => {
                        if (e.currentTarget.value.length >= 10) return;
                        setQuery(e.currentTarget.value);
                    }}
                    onKeyDown={async e => {
                        if (e.key !== 'Enter') return;
                        const data = await fetch(`https://be-sdmg4.herokuapp.com/explore?keyword=${e.currentTarget.value}`);
                        const dataJSON = await data.json();
                        setShowList(prevShowList => {
                            let curShowList = prevShowList;
                            curShowList['搜尋結果'] = dataJSON;
                            return curShowList;
                        });

                        // to guarantee a refresh
                        setShow('類別');
                        setShow('搜尋結果'); 
                    }}
                />
            </div>
            <section className='explore'>
                <div className='card-container'>
                    {loading ?   <div className='card-container'><ReactLoading type="spinningBubbles" color="#432a58" /></div>:null}
                    {showList[show].length===0 ? <div className='card-container'><h2>{t("此類別尚未有貼文，快來分享你的經驗吧！")}</h2></div> :null}
                    {showList[show].map(item => {
                        return <Card type='home' info={item}/>

                    })}
                </div>
            </section>
            <Footer />
            <CopyMessage/>
        </>
    )
}

export { Explore };