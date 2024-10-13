import "./App.css";
import {useEffect, useState} from 'react';
import useInput from './hooks/useInput';

function App() {
    useEffect(() => {
        fetch("/api")
        .then(result => console.log(result));
    }, []);

    const [description, bindDescription, resetDescription] = useInput('');
    const [amount, bindAmount, resetAmount] = useInput('');

    const submitHandler = e => {
        e.preventDefault();
        alert(`Description: ${description} Amount: ${amount}`);
        resetDescription();
        resetAmount();
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
                    <button>Submit</button>
                </div>
                <div>
                    <label>Amount: </label>
                    <input
                        type='number'
                        step='0.01'
                        min='0'
                        {... bindAmount}
                    />
                    <button>Submit</button>
                </div>
            </form>
        </div>
    );
}

export default App;