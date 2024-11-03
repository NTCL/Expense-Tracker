import React, {forwardRef, useState, useRef, useImperativeHandle} from 'react';
import Dialog from '../Dialog';

const Error = forwardRef(({}, ref) => {
    const dialogRef = useRef(null);

    const [error, setError] = useState('');

    const show = (error) => {
        dialogRef.current.show();
        setError(error);
    }

    useImperativeHandle(ref, () => ({
        show
    }));

    return (
        <Dialog ref={dialogRef} zIndex={3} title={'Error'}>
            <div>{error}</div>
        </Dialog>
    )
});

export default React.memo(Error);