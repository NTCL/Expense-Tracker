import "./App.css";
import {useEffect, useState} from 'react';
import useInput from './hooks/useInput';
import Entry from './components/Entry';

function App() {
    const [description, bindDescription, resetDescription] = useInput('');
    const [amount, bindAmount, resetAmount] = useInput('');
    const [date, bindDate, resetDate] = useInput(new Date().toISOString().split('T')[0]);
    const [type, bindType, resetType] = useInput('others');
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        fetch("/api")
        .then(result => result.json())
        .then(data => setEntries(data));
    }, []);

    const submitHandler = e => {
        e.preventDefault();
        const formData = new URLSearchParams();
        formData.append("description", description);
        formData.append("amount", amount);
        formData.append("date", date);
        formData.append("type", type);
        resetDescription();
        resetAmount();
        resetDate();
        resetType();
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

    return (
        <div className="App">
            <form onSubmit={submitHandler}>
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
            {entries.map(entry => <Entry key={entry.id} entry={entry} />)}
        </div>
    );
}

export default App;