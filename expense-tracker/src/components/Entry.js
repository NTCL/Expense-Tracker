function Entry({entry, setForm, deleteEntry}) {
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
                {entry.type}
            </div>
            <button onClick={() => setForm(entry)}>Edit</button>
            <button onClick={() => deleteEntry(entry)}>Delete</button>
        </div>
    );
}

export default Entry;