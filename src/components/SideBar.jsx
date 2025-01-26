import './SideBar.css'
import { Link } from 'react-router-dom';
import { MdOutlineLocalGroceryStore } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import { AiOutlineShopping } from "react-icons/ai";
import { MdLocalDining } from "react-icons/md";
import { RiFlightTakeoffFill } from "react-icons/ri";
import { TbMovie } from "react-icons/tb";
import { TbPigMoney } from "react-icons/tb";
import { TbHistoryToggle } from "react-icons/tb";
import { TbChartPie } from "react-icons/tb";import { useTransactions } from '../context/TransactionsContext';


export default function SideBar() {
    const {currentCategory, setCurrentCategory, categories } = useTransactions();
    const handleCategory = (value) => setCurrentCategory(value);
    console.log(currentCategory);

    return (
    <div className='leftBar'>
      <div className="left-container">
        <div className="menu">
          <Link to="/" className="item highlight" onClick={() => handleCategory("")}>
            <TbMoneybag className='icon' />
            <h4 className="texts">Your Budget</h4>
          </Link>

          <Link to="/account-summary" className="item">
            <TbChartPie className='icon' />
            <h4 className="texts">Account Summary</h4>
          </Link>

            {/* <div className="item">
                <MdOutlineLocalGroceryStore className='icon' />
                <h4 className="texts">Grocery</h4>
            </div>
            
            <div className="item">
                <AiOutlineShopping className='icon' />
                <h4 className="texts">Merchandise</h4>
            </div>

          <div className="item">
            <MdLocalDining className='icon' />
            <h4 className="texts">Dining</h4>
          </div>

          <div className="item">
            <RiFlightTakeoffFill className='icon' />
            <h4 className="texts">Travel</h4>
          </div>

            <div className="item">
                <TbMovie className='icon' />
                <h4 className="texts">Entertainment</h4>
            </div> */}

            {categories && Object.entries(categories).map(([key, value], index) => {
                const parse_category_name = key.charAt(0).toUpperCase() + key.substring(1);
                return (
                    <Link to="/" key={index} className="item" onClick={() => handleCategory(key)}>
                        {/* <MdOutlineLocalGroceryStore className="icon" /> */}
                        <h4 className="texts">{parse_category_name}</h4>
                    </Link>
                );
            })}


          <hr />
          <Link to="/transactions" className="item highlight">
            <TbHistoryToggle className='icon' />
            <h4 className="texts">History</h4>
          </Link>

          <hr />
          <div className="item highlight">
            <TbPigMoney className='icon' />
            <h4 className="texts">Your Saving</h4>
          </div>
        </div>
      </div>
    </div>
  );
}