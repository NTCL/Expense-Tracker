import '../styles/summary.scss';
import {useLocation, NavLink as Link} from "react-router-dom";
import {Chart, ArcElement, Tooltip, Legend} from 'chart.js';
import {Doughnut} from 'react-chartjs-2';
import Header from '../components/Header';

Chart.register(
    ArcElement,
    Tooltip,
    Legend
);

const Summary = () => {
    const location = useLocation();
    const {expenseTotal, expenseByType, expenseByTypeDisplay} = location.state;

    return (
        <>
            <Header/>
            <hr className='et-separate'/>
            <div className='summary'>
                <button className='summary-back et-button et-p3'>
                    <Link to="/">
                        Back
                    </Link>
                </button>
                <div className='summary-chart' style={{display: expenseByTypeDisplay}}>
                    <h3>Expense By Type</h3>
                    <Doughnut
                        data={{
                            labels: expenseByType.map(data => data.label),
                            datasets: [{
                                data: expenseByType.map(data => data.value),
                                backgroundColor: expenseByType.map(data => data.color),
                                borderColor: ['black']
                            }]
                        }}
                    />
                </div>
                <div className='summary-total'>
                    <label className='et-p1'>Total expense: </label>
                    <div className='et-p1'>${expenseTotal}</div>
                </div>
            </div>
        </>
    );
};

export default Summary;