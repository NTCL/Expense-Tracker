import '../styles/entry.scss';

function Entry({entry, isEven, showExpenseDialog, deleteEntry}) {
    return (
        <div className={`entry ${isEven ? 'entry-even' : ''}`}>
            <div className='entry-description'>
                {entry.description}
            </div>
            <div className='entry-amount'>
                ${entry.amount}
            </div>
            <div className='entry-date'>
                {entry.date}
            </div>
            <div className='entry-type'>
                {entry.type_id_name === null ? 'Any' : entry.type_id_name}
            </div>
            <div className='entry-buttons'>
                <button onClick={() => {
                    showExpenseDialog(entry);
                }}>Edit</button>
                <button onClick={() => deleteEntry(entry)}>Delete</button>
            </div>
        </div>
    );
}

export default Entry;