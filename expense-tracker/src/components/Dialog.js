import {forwardRef, useState, useRef, useEffect, useImperativeHandle} from 'react';

const Dialog = forwardRef(({children, zIndex, title}, ref) => {
    const [display, setDisplay] = useState('none');
    const [top, setTop] = useState('50%');
    const dialogRef = useRef(null);

    const style = {
        display: display,
        top: top,
        zIndex: zIndex
    };

    const show = () => setDisplay('block');
    const hide = () => setDisplay('none');

    useImperativeHandle(ref, () => ({
        show,
        hide
    }));

    useEffect(() => {
        setTop(`calc(50% - ${dialogRef.current.clientHeight / 2}px)`);
    }, [display]);

    return (
        <div className='et-dialog' style={style} ref={dialogRef}>
            <div className='et-dialog-header'>
                <h3>{title}</h3>
                <button className='et-button et-p1' onClick={e => hide()}>X</button>
            </div>
            <div className='et-dialog-body'>
                {children}
            </div>
        </div>
    );
});

export default Dialog;