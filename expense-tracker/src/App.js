import "./App.css";
import {useEffect, useState, useReducer, useRef} from 'react';
import useInput from './hooks/useInput';
import Entry from './components/Entry';
import Expense from './components/dialog/Expense';
import Dialog from './components/Dialog';

const initialFilters = {
    _search: '',
    _date_from: '',
    _date_to: '',
    type_id: ''
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
    const [typeFilter, setTypeFilter] = useState('');
    // for types
    const [types, setTypes] = useState([]);
    // for sorting
    const [orders, ordersDispatch] = useReducer(ordersReducer, initialOrders);
    // for entries
    const [entries, setEntries] = useState([]);
    // for summary
    const [sum, setSum] = useState(0);
    // for expense dialog
    const expenseDialogRef = useRef(null);
    // for error dialog
    const errorDialogRef = useRef(null);
    const [error, setError] = useState('');

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
            table: 'type'
        };

        fetch("/api?" + new URLSearchParams(params))
        .then(result => result.json())
        .then(json => {
            if(typeof(json.error) == 'undefined') {
                setTypes(json.data);
                return;
            }

            setError(json.error.message);
            showErrorDialog();
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
            if(filters[name] == '') {
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
            table: 'expense'
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

            setError(json.error.message);
            showErrorDialog();
        });
    };

    // delete entry on delete click
    const deleteEntry = (entry) => {
        const formData = new URLSearchParams();
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
            setError(json.error.message);
            showErrorDialog();
        });
    }

    // load entries in the beginning and reload on filter or order change
    useEffect(() => {
        loadEntries();
    }, [filters, orders]);

    // for summary

    // reset sum when entries change
    useEffect(() => {
        setSum(entries.reduce((total, entry) => (parseFloat(total) + parseFloat(entry.amount)).toFixed(1), 0));
    }, [entries]);

    // for error dialog
    const showErrorDialog = () => errorDialogRef.current.show();

    return (
        <div className="App">
            <Expense 
                ref={expenseDialogRef}
                loadEntries={loadEntries}
                setError={setError}
                showErrorDialog={showErrorDialog}
                types={types}
            />
            <Dialog
                ref={errorDialogRef}
            >
                <div>{error}</div>
            </Dialog>
            <h1>Expense Tracker</h1>
            <h3>Filters</h3>
            <button onClick={e => changeFilters()}>Search</button>
            <button onClick={e => resetFilters()}>Reset</button>
            <div>
                <label>Seach: </label>
                <input
                    type='text'
                    {... bindSearch}
                />
            </div>
            <div>
                <label>Date From: </label>
                <input
                    type='date'
                    {... bindDateFrom}
                />
            </div>
            <div>
                <label>Date To: </label>
                <input
                    type='date'
                    {... bindDateTo}
                />
            </div>
            <div>
                <label>Type: </label>
                <select 
                    value={typeFilter}
                    onChange={typeChangeHandler}
                >
                    <option value=''>All</option>
                    {types.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}
                </select>
            </div>
            <h3>Order</h3>
            <div>
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
            <div>
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
            <h3>Summary</h3>
            <div>
                <label>Total expense: </label>
                ${sum}
            </div>
            <h3>Entries</h3>
            <button onClick={e => {
                expenseDialogRef.current.show({id: 0});
            }}>Add</button>
            {entries.map(entry => 
                <Entry 
                    key={entry.id} 
                    entry={entry}
                    showExpenseDialog={expenseDialogRef.current.show}
                    deleteEntry={deleteEntry}/>)}
        </div>
    );
}

export default App;