import './styles/global.scss';
import './styles/home.scss';
import './styles/entry.scss';
import './styles/dialog.scss';
import './styles/expense.scss';
import './styles/type.scss';
import {useEffect, useState, useReducer, useRef} from 'react';
import useInput from './hooks/useInput';
import Entry from './components/Entry';
import Expense from './components/dialog/Expense';
import Error from './components/dialog/Error';
import Type from "./components/dialog/Type";
import {Chart, ArcElement, Tooltip, Legend} from 'chart.js';
import {Doughnut} from 'react-chartjs-2';

Chart.register(
    ArcElement,
    Tooltip,
    Legend
);

const initialFilters = {
    _search: '',
    _date_from: '',
    _date_to: '',
    type_id: 0
};
const filtersReducer = (currentFilters, action) => {
    switch(action.type) {
        case "changeFilters":
            return {
                ...currentFilters,
                ...action.value
            }
        case 'reset':
            return initialFilters;
        default:
            return currentFilters;
    }
}

const initialOrders = {
    date: '',
    amount: ''
};
const ordersReducer = (currentOrders, action) => {
    switch(action.type) {
        case "changeDate":
            return {
                ...currentOrders,
                date: action.value
            };
        case "changeAmount":
            return {
                ...currentOrders,
                amount: action.value
            };
        default:
            return currentOrders;
    }
}

function App() {
    // for filters
    const [filters, filtersDispatch] = useReducer(filtersReducer, initialFilters);
    const [search, setSearch, bindSearch, resetSearch] = useInput('');
    const [dateFrom, setDateFrom, bindDateFrom, resetDateFrom] = useInput('');
    const [dateTo, setDateTo, bindDateTo, resetDateTo] = useInput('');
    const [typeFilter, setTypeFilter] = useState(0);
    // for types
    const [types, setTypes] = useState([]);
    // for sorting
    const [orders, ordersDispatch] = useReducer(ordersReducer, initialOrders);
    // for entries
    const [entries, setEntries] = useState([]);
    // for total expense
    const [expenseTotal, setExpenseTotal] = useState(0);
    // for chart 'expense by type'
    const [expenseByType, setExpenseByType] = useState([]);
    const [expenseByTypeDisplay, setExpenseByTypeDisplay] = useState('none');
    // for error dialog
    const errorDialogRef = useRef(null);
    // for expense dialog
    const expenseDialogRef = useRef(null);
    // for type dialog
    const typeDialogRef = useRef(null);

    // for filters

    const typeChangeHandler = e => {
        setTypeFilter(e.target.value);
        filtersDispatch({
            type: 'changeFilters', 
            value: {
                _search: search,
                _date_from: dateFrom,
                _date_to: dateTo,
                type_id: e.target.value
            }
        });
    }

    // change filters
    const changeFilters = () => {
        filtersDispatch({
            type: 'changeFilters', 
            value: {
                _search: search,
                _date_from: dateFrom,
                _date_to: dateTo,
                type_id: typeFilter
            }
        });
    }

    // reset filters
    const resetFilters = () => {
        filtersDispatch({type: 'reset'});
        resetSearch();
        resetDateFrom();
        resetDateTo();
        setTypeFilter('');
    }

    // for types

    // load types
    const loadTypes = () => {
        const params = {
            _table: 'type'
        };

        fetch("/api?" + new URLSearchParams(params))
        .then(result => result.json())
        .then(json => {
            if(typeof(json.error) == 'undefined') {
                setTypes(json.data);
                return;
            }
            errorDialogRef.current.show(json.error.message);
        });
    };

    // load types in the beginning
    useEffect(() => {
        loadTypes();
    }, []);

    // for entries

    // load entries
    const loadEntries = () => {
        const filtersQuery = {};
        Object.keys(filters).forEach(name => {
            switch(name) {
                case '_search':
                case '_date_from':
                case '_date_to':
                    if(filters[name] == '') {
                        return;
                    }
                    break;
                case 'type_id':
                    if(filters[name] == 0) {
                        return;
                    }
                    break;
                default:
                    return;
            }
            filtersQuery[name] = filters[name];
        });

        const ordersQuery = {};
        Object.keys(orders).forEach(name => {
            if(orders[name] == '') {
                return;
            }
            ordersQuery[name] = orders[name];
        });

        const params = {
            _table: 'expense'
        };
        if(Object.keys(filtersQuery).length) {
            params.filters = JSON.stringify(filtersQuery);
        }
        if(Object.keys(ordersQuery).length) {
            params.orders = JSON.stringify(ordersQuery);
        }


        fetch("/api?" + new URLSearchParams(params))
        .then(result => result.json())
        .then(json => {
            if(typeof(json.error) == 'undefined') {
                setEntries(json.data);
                return;
            }
            errorDialogRef.current.show(json.error.message);
        });
    };

    // delete entry on delete click
    const deleteEntry = (entry) => {
        const formData = new URLSearchParams();
        formData.append("_table", "expense");
        formData.append("id", entry.id);
        formData.append("_delete", 1);
        fetch("/api", {
            method: "POST",
            body: formData
        })
        .then(result => result.json())
        .then(json => {
            if(typeof(json.error) == 'undefined') {
                loadEntries();
                return;
            }
            errorDialogRef.current.show(json.error.message);
        });
    }

    // load entries in the beginning and reload on filter or order change
    useEffect(() => {
        loadEntries();
    }, [filters, orders]);

    // for summary

    // when entries change
    useEffect(() => {
        // set total expense
        setExpenseTotal(entries.reduce((total, entry) => (parseFloat(total) + parseFloat(entry.amount)).toFixed(1), 0));

        // set data and display for the chart 'expense by type'
        let expenseByType = {};
        entries.forEach(entry => {
            let type = entry.type_id_name === null ? 'Any' : entry.type_id_name;
            if(typeof(expenseByType[type]) == 'undefined') {
                expenseByType[type] = 0;
            }
            expenseByType[type] += parseFloat(entry.amount);
        })

        let arr = [];
        Object.keys(expenseByType).forEach(type => {
            arr.push({
                'label': type,
                'value': expenseByType[type],
                'color': '#' + Math.floor(Math.random()*16777215).toString(16)
            })
        }) 

        setExpenseByTypeDisplay(arr.length == 0 ? 'none' : 'flex');
        setExpenseByType(arr);

    }, [entries]);

    return (
        <div className="App">
            <Error
                ref={errorDialogRef}
            />
            <Expense 
                ref={expenseDialogRef}
                loadEntries={loadEntries}
                errorDialogRef={errorDialogRef}
                types={types}
                typeDialogRef={typeDialogRef}
            />
            <Type
                ref={typeDialogRef}
                loadTypes={loadTypes}
                errorDialogRef={errorDialogRef}
            />
            <div className='home-header'>
                <h1>Expense Tracker</h1>
            </div>
            <hr className='home-separate'/>
            <div className='home-summary'>
                <div className='home-summary-chart' style={{display: expenseByTypeDisplay}}>
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
                <div className='home-summary-total'>
                    <label>Total expense: </label>
                    ${expenseTotal}
                </div>
            </div>
            <hr className='home-separate'/>
            <div className='home-filter'>
                <div className='home-filter-buttons'>
                    <button className='et-button' onClick={e => changeFilters()}>Search</button>
                    <button className='et-button' onClick={e => resetFilters()}>Reset</button>
                </div>
                <div className='home-filter-items'>
                    <div className='home-filter-item'>
                        <label>Seach: </label>
                        <input
                            type='text'
                            {... bindSearch}
                        />
                    </div>
                    <div className='home-filter-item'>
                        <label>Type: </label>
                        <select 
                            value={typeFilter}
                            onChange={typeChangeHandler}
                        >
                            <option value='0'>Any</option>
                            {types.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}
                        </select>
                    </div>
                    <div className='home-filter-item'>
                        <label>Date From: </label>
                        <input
                            type='date'
                            {... bindDateFrom}
                        />
                    </div>
                    <div className='home-filter-item'>
                        <label>Date To: </label>
                        <input
                            type='date'
                            {... bindDateTo}
                        />
                    </div>
                </div>
            </div>
            <hr className='home-separate'/>
            <div className='home-order'>
                <div className='home-order-item'>
                    <label>Date: </label>
                    <select
                        value={orders.date}
                        onChange={e => ordersDispatch({type: 'changeDate', value: e.target.value})}
                    >
                        <option value=''>Unsorted</option>
                        <option value="ASC">Oldest First</option>
                        <option value="DESC">Latest First</option>
                    </select>
                </div>
                <div className='home-order-item'>
                    <label>Amount: </label>
                    <select
                        value={orders.amount}
                        onChange={e => ordersDispatch({type: 'changeAmount', value: e.target.value})}
                    >
                        <option value=''>Unsorted</option>
                        <option value="ASC">Smallest First</option>
                        <option value="DESC">Largest First</option>
                    </select>
                </div>
            </div>
            <hr className='home-separate'/>
            <div className='home-expense'>
                <button className='home-expense-add et-button' onClick={e => expenseDialogRef.current.show({id: 0})}>Add</button>
                {entries.map((entry, index) => 
                    <Entry 
                        key={entry.id} 
                        entry={entry}
                        isEven={index % 2 == 0}
                        showExpenseDialog={expenseDialogRef.current.show}
                        deleteEntry={deleteEntry}/>)}
            </div>
        </div>
    );
}

export default App;