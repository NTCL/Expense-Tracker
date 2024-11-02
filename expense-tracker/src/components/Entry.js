function Entry({entry, isOdd, isHeader, showExpenseDialog, deleteEntry}) {
    return (
        <div className={`entry ${isHeader ? 'entry-header' : ''} ${isOdd ? 'entry-odd' : ''}`}>
            <div className={`entry-description ${isHeader ? 'et-p1' : 'et-p3'}`}>
                {entry.description}
            </div>
            <div className={`entry-amount ${isHeader ? 'et-p1' : 'et-p3'}`}>
                {`${isHeader ? '' : '$'}${entry.amount}`}
            </div>
            <div className={`entry-date ${isHeader ? 'et-p1' : 'et-p3'}`}>
                {entry.date}
            </div>
            <div className={`entry-type ${isHeader ? 'et-p1' : 'et-p3'}`}>
                {entry.type_id_name === null ? 'Any' : entry.type_id_name}
            </div>
            {!isHeader ? <div className='entry-buttons'>
                <button className='et-button et-p4' onClick={() => {
                    showExpenseDialog(entry);
                }}>Edit</button>
                <button className='et-button et-p4' onClick={() => deleteEntry(entry)}>Delete</button>
            </div> : ''}
        </div>
    );
}

export default Entry;