import "./App.css";
import {useEffect, useState, useReducer, useRef} from 'react';
import useInput from './hooks/useInput';
import Entry from './components/Entry';
import Dialog from './components/Dialog';

const initialFilters = {
    _search: '',
    _date_from: '',
    _date_to: '',
    type: ''
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
    // for expense entry form
    const [description, setDescription, bindDescription, resetDescription] = useInput('');
    const [amount, setAmount, bindAmount, resetAmount] = useInput('');
    const [date, setDate, bindDate, resetDate] = useInput(new Date().toISOString().split('T')[0]);
    const [type, setType, bindType, resetType] = useInput('others');
    const [id, setId] = useState(0);
    // for filters
    const [filters, filtersDispatch] = useReducer(filtersReducer, initialFilters);
    const [search, setSearch, bindSearch, resetSearch] = useInput('');
    const [dateFrom, setDateFrom, bindDateFrom, resetDateFrom] = useInput('');
    const [dateTo, setDateTo, bindDateTo, resetDateTo] = useInput('');
    const [typeFilter, setTypeFilter] = useState('');
    // for sorting
    const [orders, ordersDispatch] = useReducer(ordersReducer, initialOrders);
    // for entries
    const [entries, setEntries] = useState([]);
    // for summary
    const [sum, setSum] = useState(0);
    // for form dialog
    const formDialogRef = useRef(null);
    // for error dialog
    const errorDialogRef = useRef(null);
    const [error, setError] = useState('');

    // for expense entry form

    const resetForm = () => {
        setId(0);
        resetDescription();
        resetAmount();
        resetDate();
        resetType();
    }

    const setForm = (entry) => {
        resetForm();
        setId(entry.id);
        if(entry.id > 0) {
            setDescription(entry.description);
            setAmount(entry.amount);
            setDate(entry.date);
            setType(entry.type);
        }
    };

    const submitHandler = e => {
        e.preventDefault();
        hideDialog();
        const formData = new URLSearchParams();
        formData.append("id", id);
        formData.append("description", description);
        formData.append("amount", amount);
        formData.append("date", date);
        formData.append("type", type);
        resetForm();
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

    // for filters

    const typeChangeHandler = e => {
        setTypeFilter(e.target.value);
        filtersDispatch({
            type: 'changeFilters', 
            value: {
                _search: search,
                _date_from: dateFrom,
                _date_to: dateTo,
                type: e.target.value
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
                type: typeFilter
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

        const params = {};
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
                resetForm();
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

    // for form dialog
    const showDialog = () => formDialogRef.current.show();
    const hideDialog = () => formDialogRef.current.hide();

    // for error dialog
    const showErrorDialog = () => errorDialogRef.current.show();

    return (
        <div className="App">
            <Dialog
                ref={errorDialogRef}
            >
                <div>{error}</div>
            </Dialog>
            <Dialog
                ref={formDialogRef}
            >
                <form onSubmit={submitHandler}>
                    <div>
                        <h3>{id ? `Edit expense ${id}` : 'Add expense'}</h3>
                    </div>
                    <div>
                        <label>Description: </label>
                        <input
                            type='text'
                            {... bindDescription}
                        />
                    </div>
                    <div>
                        <label>Amount: </label>
                        <input
                            type='number'
                            step='0.1'
                            min='0'
                            {... bindAmount}
                        />
                    </div>
                    <div>
                        <label>Date: </label>
                        <input
                            type='date'
                            {... bindDate}
                        />
                    </div>
                    <div>
                        <label>Type: </label>
                        <select {... bindType}>
                            <option value="transportation">Transportation</option>
                            <option value="food">Food</option>
                            <option value="others">Others</option>
                        </select>
                    </div>
                    <button>{id ? 'Edit' : 'Add'}</button>
                </form>
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
                    <option value="transportation">Transportation</option>
                    <option value="food">Food</option>
                    <option value="others">Others</option>
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
                setForm({id: 0});
                showDialog();
            }}>Add</button>
            {entries.map(entry => 
                <Entry 
                    key={entry.id} 
                    entry={entry}
                    showDialog={showDialog}
                    setForm={setForm}
                    deleteEntry={deleteEntry}/>)}
        </div>
    );
}

export default App;