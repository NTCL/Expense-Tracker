function Entry({entry, showExpenseDialog, deleteEntry}) {
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
                showExpenseDialog(entry);
            }}>Edit</button>
            <button onClick={() => deleteEntry(entry)}>Delete</button>
        </div>
    );
}

export default Entry;