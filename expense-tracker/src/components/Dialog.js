import {forwardRef, useState, useImperativeHandle} from 'react';

const Dialog = forwardRef(({children, zIndex}, ref) => {
    const [display, setDisplay] = useState('none');

    const style = {
        display: display,
        width:'300px',
        height: '200px',
        position: 'fixed',
        top: 'calc(50% - 100px)',
        left: 'calc(50% - 150px)',
        zIndex: zIndex,
        backgroundColor: 'white',
        border: 'solid 1px black'
    };

    const show = () => setDisplay('block');
    const hide = () => setDisplay('none');

    useImperativeHandle(ref, () => ({
        show,
        hide
    }));

    return (
        <div style={style}>
            <button onClick={e => hide()}>X</button>
            {children}
        </div>
    );
});

export default Dialog;