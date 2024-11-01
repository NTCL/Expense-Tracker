import {forwardRef, useState, useRef, useImperativeHandle} from 'react';
import useInput from '../../hooks/useInput';
import Dialog from '../Dialog';

const Expense = forwardRef(({loadEntries, errorDialogRef, types, typeDialogRef}, ref) => {
    const dialogRef = useRef(null);

    // form field
    const [id, setId] = useState(0);
    const [description, setDescription, bindDescription, resetDescription] = useInput('');
    const [amount, setAmount, bindAmount, resetAmount] = useInput('');
    const [date, setDate, bindDate, resetDate] = useInput(new Date().toISOString().split('T')[0]);
    const [typeId, setTypeId, bindTypeId, resetTypeId] = useInput(0);

    const resetForm = () => {
        setId(0);
        resetDescription();
        resetAmount();
        resetDate();
        resetTypeId();
    }

    const setForm = (entry) => {
        resetForm();
        if(entry.id > 0) {
            setId(entry.id);
            setDescription(entry.description);
            setAmount(entry.amount);
            setDate(entry.date);
            setTypeId(entry.type_id);
        }
    };

    const submitHandler = e => {
        e.preventDefault();
        const formData = new URLSearchParams();
        formData.append("_table", "expense");
        formData.append("id", id);
        formData.append("description", description);
        formData.append("amount", amount);
        formData.append("date", date);
        formData.append("type_id", typeId);
        fetch("/api", {
            method: "POST",
            body: formData
        })
        .then(result => result.json())
        .then(json => {
            hide();
            if(typeof(json.error) == 'undefined') {
                loadEntries();
                return;
            }
            errorDialogRef.current.show(json.error.message);
        });
    }

    const show = (entry) => {
        dialogRef.current.show();
        setForm(entry);
    }
    const hide = () => dialogRef.current.hide();

    useImperativeHandle(ref, () => ({
        show
    }));

    return (
        <Dialog ref={dialogRef} zIndex={1} title={id ? `Edit expense ${id}` : 'Add expense'}>
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
                    <select {... bindTypeId}>
                        <option value='0'>Any</option>
                        {types.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}
                    </select>
                </div>
                <button type='button' onClick={e => typeDialogRef.current.show({id: 0})}>Add Type</button>
                <button type='submit'>{id ? 'Edit' : 'Add'}</button>
            </form>
        </Dialog>
    )
});

export default Expense;

