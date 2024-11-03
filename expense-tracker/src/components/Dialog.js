import React, {forwardRef, useReducer, useRef, useImperativeHandle} from 'react';

const initialStyle = {
    display: 'none',
    top: '0',
    zIndex: 0
};

const styleReducer = (currentStyle, action) => {
    switch(action.type) {
        case "changeStyle":
            return {
                ...currentStyle,
                ...action.value
            };
        case "changeDisplay":
            return {
                ...currentStyle,
                display: action.value
            };
        default:
            return currentStyle;
    }
}

const Dialog = forwardRef(({children, zIndex, title}, ref) => {
    const [style, styleDispatch] = useReducer(styleReducer, initialStyle);
    const dialogRef = useRef(null);

    const maskStyle = {
        display: style.display,
        zIndex: zIndex
    }

    const show = () => {
        styleDispatch({
            type: 'changeStyle',
            value: {
                display: 'block',
                top: `calc(50% - ${dialogRef.current.clientHeight / 2}px)`,
                zIndex: zIndex + 1
            }
        });
    }
    const hide = () => styleDispatch({
        type: 'changeDisplay',
        value: 'none'
    });

    useImperativeHandle(ref, () => ({
        show,
        hide
    }));

    return (
        <>
            <div className='et-dialog' style={style} ref={dialogRef}>
                <div className='et-dialog-header'>
                    <h3>{title}</h3>
                    <button className='et-button et-p1' onClick={e => hide()}>X</button>
                </div>
                <div className='et-dialog-body'>
                    {children}
                </div>
            </div>
            <div className='et-mask' style={maskStyle}>
            </div>
        </>
    );
});

export default React.memo(Dialog);