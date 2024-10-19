import "./App.css";
import {useEffect, useState} from 'react';
import useInput from './hooks/useInput';
import Entry from './components/Entry';

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
    // for search filter
    const [searchFilter, setSearchFilter] = useState('');
    // for 'date form' filter
    const [dateFromFilter, setDateFromFilter] = useState('');
    // for 'date to' filter
    const [dateToFilter, setDateToFilter] = useState('');
    // for type filter
    const [typeFilter, setTypeFilter] = useState('all');

    const loadEntries = () => {
        let url = "/api";
        let filters = {};

        if(searchFilter != '') {
            filters._search = searchFilter;
        }

        if(dateFromFilter != '') {
            filters._date_from = dateFromFilter;
        }

        if(dateToFilter != '') {
            filters._date_to = dateToFilter;
        }

        if(typeFilter != 'all') {
            filters.type = typeFilter;
        }

        url += "?" + new URLSearchParams(filters);

        fetch(url)
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

    const resetFilters = () => {
        setSearchFilter('');
        setDateFromFilter('');
        setDateToFilter('');
        setTypeFilter('all');
    }

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
            <button onClick={() => resetFilters()}>Reset</button>
            <div>
                <label>Search: </label>
                <input
                    type='text'
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                />
            </div>
            <div>
                <label>Date From: </label>
                <input
                    type='date'
                    value={dateFromFilter}
                    onChange={e => setDateFromFilter(e.target.value)}
                />
            </div>
            <div>
                <label>Date To: </label>
                <input
                    type='date'
                    value={dateToFilter}
                    onChange={e => setDateToFilter(e.target.value)}
                />
            </div>
            <div>
                <label>Type: </label>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
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