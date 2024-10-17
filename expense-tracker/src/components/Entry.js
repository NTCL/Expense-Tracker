function Entry({entry, loadEntry, deleteEntry}) {
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
            <button onClick={() => loadEntry(entry)}>Edit</button>
            <button onClick={() => deleteEntry(entry)}>Delete</button>
        </div>
    );
}

export default Entry;