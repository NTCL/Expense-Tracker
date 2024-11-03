import React, {forwardRef, useState, useRef, useImperativeHandle} from 'react';
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
            <form className='expense' onSubmit={submitHandler}>
                <div className='expense-item'>
                    <label className='et-p3'>Description: </label>
                    <input
                        className='et-p3'
                        type='text'
                        {... bindDescription}
                    />
                </div>
                <div className='expense-item'>
                    <label className='et-p3'>Amount: </label>
                    <input
                        className='et-p3'
                        type='number'
                        step='0.1'
                        min='0'
                        {... bindAmount}
                    />
                </div>
                <div className='expense-item'>
                    <label className='et-p3'>Date: </label>
                    <input
                        className='et-p3'
                        type='date'
                        {... bindDate}
                    />
                </div>
                <div className='expense-item expense-type'>
                    <label className='et-p3'>Type: </label>
                    <select className='et-p3' {... bindTypeId}>
                        <option value='0'>Any</option>
                        {types.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}
                    </select>
                    <button className='et-button et-p4' type='button' onClick={e => typeDialogRef.current.show({id: 0})}>Add Type</button>
                </div>
                <button className='et-button et-p3' type='submit'>{id ? 'Edit' : 'Add'}</button>
            </form>
        </Dialog>
    )
});

export default React.memo(Expense);

