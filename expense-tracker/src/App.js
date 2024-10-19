import "./App.css";
import {useEffect, useState, useReducer} from 'react';
import useInput from './hooks/useInput';
import Entry from './components/Entry';

const initialFilters = {
    _search: '',
    _date_from: '',
    _date_to: '',
    type: 'all'
};
const filtersReducer = (currentFilters, action) => {
    switch(action.type) {
        case "searchChange":
            return {
                ...currentFilters,
                _search: action.value
            };
        case "dateFromChange":
            return {
                ...currentFilters,
                _date_from: action.value
            };
        case "dateToChange":
            return {
                ...currentFilters,
                _date_to: action.value
            };
        case "typeChange":
            return {
                ...currentFilters,
                type: action.value
            };
        case 'reset':
            return initialFilters;
        default:
            return currentFilters;
    }
}

function App() {
    // for expense entry
    const [description, setDescription, bindDescription, resetDescription] = useInput('');
    const [amount, setAmount, bindAmount, resetAmount] = useInput('');
    const [date, setDate, bindDate, resetDate] = useInput(new Date().toISOString().split('T')[0]);
    const [type, setType, bindType, resetType] = useInput('others');
    const [id, setId] = useState(0);
    // for entries
    const [entries, setEntries] = useState([]);
    // for summary
    const [sum, setSum] = useState(0);
    const[filters, filtersDispatch] = useReducer(filtersReducer, initialFilters);

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

    // load entries in the beginning
    useEffect(() => {
        loadEntries();
    }, []);

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
            <div>
                <label>Sum: </label>
                {sum}
            </div>
            <button onClick={() => setForm({id: 0})}>Add</button>
            <div>Filter</div>
            <button onClick={() => loadEntries()}>Search</button>
            <button onClick={() => filtersDispatch({type: 'reset'})}>Reset</button>
            <div>
                <label>Search: </label>
                <input
                    type='text'
                    value={filters._search}
                    onChange={e => filtersDispatch({type: 'searchChange', value: e.target.value})}
                />
            </div>
            <div>
                <label>Date From: </label>
                <input
                    type='date'
                    value={filters._date_from}
                    onChange={e => filtersDispatch({type: 'dateFromChange', value: e.target.value})}
                />
            </div>
            <div>
                <label>Date To: </label>
                <input
                    type='date'
                    value={filters._date_to}
                    onChange={e => filtersDispatch({type: 'dateToChange', value: e.target.value})}
                />
            </div>
            <div>
                <label>Type: </label>
                <select 
                    value={filters.type} 
                    onChange={e => filtersDispatch({type: 'typeChange', value: e.target.value})}
                >
                    <option value="all">All</option>
                    <option value="transportation">Transportation</option>
                    <option value="food">Food</option>
                    <option value="others">Others</option>
                </select>
            </div>
            <div>Entries</div>
            {entries.map(entry => <Entry key={entry.id} entry={entry} setForm={setForm} deleteEntry={deleteEntry}/>)}
        </div>
    );
}

export default App;