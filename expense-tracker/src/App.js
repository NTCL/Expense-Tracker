import "./App.css";
import {useEffect, useState, useReducer} from 'react';
import useInput from './hooks/useInput';
import Entry from './components/Entry';

const INITIAL_TYPE_FILTER = 'all';

const initialFilters = {
    _search: '',
    _date_from: '',
    _date_to: '',
    type: INITIAL_TYPE_FILTER
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
    const [typeFilter, setTypeFilter] = useState(INITIAL_TYPE_FILTER);
    // for entries
    const [entries, setEntries] = useState([]);
    // for summary
    const [sum, setSum] = useState(0);

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
            }
            // need error handling
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
        setTypeFilter(INITIAL_TYPE_FILTER);
    }

    // for entries

    // load entries
    const loadEntries = () => {
        fetch("/api?" + new URLSearchParams(filters))
        .then(result => result.json())
        .then(json => {
            if(typeof(json.error) == 'undefined') {
                setEntries(json.data);
            }
            // need error handling
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
        .then(json => {
            if(typeof(json.error) == 'undefined') {
                resetForm();
                loadEntries();
            }
            // need error handling
        });
    }

    // load entries in the beginning and reload on filter change
    useEffect(() => {
        loadEntries();
    }, [filters]);

    // for summary

    // reset sum when entries change
    useEffect(() => {
        setSum(entries.reduce((total, entry) => (parseFloat(total) + parseFloat(entry.amount)).toFixed(1), 0));
    }, [entries]);

    return (
        <div className="App">
            <form onSubmit={submitHandler}>
                <div>
                    <label>ID: </label>
                    {id}
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
                <button>Submit</button>
            </form>
            <div>Filter</div>
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
                    <option value="all">All</option>
                    <option value="transportation">Transportation</option>
                    <option value="food">Food</option>
                    <option value="others">Others</option>
                </select>
            </div>
            <button onClick={e => setForm({id: 0})}>Add</button>
            <div>
                <label>Sum: </label>
                {sum}
            </div>
            <div>Entries</div>
            {entries.map(entry => <Entry key={entry.id} entry={entry} setForm={setForm} deleteEntry={deleteEntry}/>)}
        </div>
    );
}

export default App;