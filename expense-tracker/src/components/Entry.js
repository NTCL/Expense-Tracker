import React from 'react';

function Entry({entry, isOdd, isHeader, expenseDialogRef, deleteEntry}) {
    return (
        <div className={`entry ${isHeader ? 'entry-header' : ''} ${isOdd ? 'entry-odd' : ''}`}>
            <div className='entry-data'>
                <div className={`entry-data-description ${isHeader ? 'et-p1' : 'et-p3'}`}>
                    {entry.description}
                </div>
                <div className={`entry-data-amount ${isHeader ? 'et-p1' : 'et-p3'}`}>
                    {`${isHeader ? '' : '$'}${entry.amount}`}
                </div>
                <div className={`entry-data-date ${isHeader ? 'et-p1' : 'et-p3'}`}>
                    {entry.date}
                </div>
                <div className={`entry-data-type ${isHeader ? 'et-p1' : 'et-p3'}`}>
                    {entry.type_id_name === null ? 'Any' : entry.type_id_name}
                </div>
            </div>
            <div className='entry-buttons' style={{visibility: isHeader ? 'hidden' : 'visible' }}>
                <button className='et-button et-p4' onClick={() => {
                    expenseDialogRef.current.show(entry);
                }}>Edit</button>
                <button className='et-button et-p4' onClick={() => deleteEntry(entry)}>Delete</button>
            </div>
        </div>
    );
}

export default React.memo(Entry);