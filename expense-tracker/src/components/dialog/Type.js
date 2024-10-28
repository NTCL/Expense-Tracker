import {forwardRef, useState, useRef, useImperativeHandle} from 'react';
import useInput from '../../hooks/useInput';
import Dialog from '../Dialog';

const Type = forwardRef(({loadTypes, errorDialogRef}, ref) => {
    const dialogRef = useRef(null);

    // form field
    const [id, setId] = useState(0);
    const [name, setName, bindName, resetName] = useInput('');

    const resetForm = () => {
        setId(0);
        resetName();
    }

    const setForm = (type) => {
        resetForm();
    };

    const submitHandler = e => {
        e.preventDefault();
        const formData = new URLSearchParams();
        formData.append("_table", "type");
        formData.append("id", id);
        formData.append("name", name);
        fetch("/api", {
            method: "POST",
            body: formData
        })
        .then(result => result.json())
        .then(json => {
            hide();
            if(typeof(json.error) == 'undefined') {
                loadTypes();
                return;
            }
            errorDialogRef.current.show(json.error.message);
        });
    }

    const show = (type) => {
        dialogRef.current.show();
        setForm(type);
    }
    const hide = () => dialogRef.current.hide();

    useImperativeHandle(ref, () => ({
        show
    }));

    return (
        <Dialog ref={dialogRef} zIndex={2}>
            <form onSubmit={submitHandler}>
                <div>
                    <h3>{id ? `Edit type ${id}` : 'Add type'}</h3>
                </div>
                <div>
                    <label>Name: </label>
                    <input
                        type='text'
                        {... bindName}
                    />
                </div>
                <button type='submit'>{id ? 'Edit' : 'Add'}</button>
            </form>
        </Dialog>
    )
});

export default Type;