import "./App.css";
import {useEffect, useState} from 'react';
import useInput from './hooks/useInput';
import Entry from './components/Entry';

function App() {
    const [description, setDescription, bindDescription, resetDescription] = useInput('');
    const [amount, setAmount, bindAmount, resetAmount] = useInput('');
    const [date, setDate, bindDate, resetDate] = useInput(new Date().toISOString().split('T')[0]);
    const [type, setType, bindType, resetType] = useInput('others');
    const [id, setId] = useState(0);
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        fetch("/api")
        .then(result => result.json())
        .then(data => setEntries(data));
    }, []);

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
        .then(data => {
            fetch("/api")
            .then(result => result.json())
            .then(data => setEntries(data));
        });
    }

    const loadEntry = (entry) => {
        resetForm();
        setId(entry.id);
        if(entry.id > 0) {
            setDescription(entry.description);
            setAmount(entry.amount);
            setDate(entry.date);
            setType(entry.type);
        }
    };

    const resetForm = () => {
        resetDescription();
        resetAmount();
        resetDate();
        resetType();
    }

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
            <button onClick={() => loadEntry({id: 0})}>Add</button>
            {entries.map(entry => <Entry key={entry.id} entry={entry} loadEntry={loadEntry} />)}
        </div>
    );
}

export default App;