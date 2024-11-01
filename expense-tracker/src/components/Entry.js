function Entry({entry, isOdd, isHeader, showExpenseDialog, deleteEntry}) {
    return (
        <div className={`entry ${isHeader ? 'entry-header' : ''} ${isOdd ? 'entry-odd' : ''}`}>
            <div className='entry-description'>
                {entry.description}
            </div>
            <div className='entry-amount'>
                {`${isHeader ? '' : '$'}${entry.amount}`}
            </div>
            <div className='entry-date'>
                {entry.date}
            </div>
            <div className='entry-type'>
                {entry.type_id_name === null ? 'Any' : entry.type_id_name}
            </div>
            {!isHeader ? <div className='entry-buttons'>
                <button className='et-button' onClick={() => {
                    showExpenseDialog(entry);
                }}>Edit</button>
                <button className='et-button' onClick={() => deleteEntry(entry)}>Delete</button>
            </div> : ''}
        </div>
    );
}

export default Entry;