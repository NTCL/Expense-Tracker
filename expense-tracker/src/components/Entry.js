function Entry({entry}) {
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
        </div>
    );
}

export default Entry;