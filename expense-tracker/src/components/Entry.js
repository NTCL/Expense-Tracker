function Entry({entry, showDialog, setForm, deleteEntry}) {
    return (
        <div>
            <div>
                {entry.description}
            </div>
            <div>
                ${entry.amount}
            </div>
            <div>
                {entry.date}
            </div>
            <div>
                {entry.type_id_name}
            </div>
            <button onClick={() => {
                setForm(entry);
                showDialog();
            }}>Edit</button>
            <button onClick={() => deleteEntry(entry)}>Delete</button>
        </div>
    );
}

export default Entry;