function Entry({entry, loadEntry}) {
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
        </div>
    );
}

export default Entry;