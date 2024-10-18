import Input from '@ant-design/react-native/lib/input';
import type { InputProps } from '@ant-design/react-native/lib/input/PropsType';
import React, { forwardRef } from 'react';


interface DatePickerInputProps extends InputProps {
    extra?: string;
}

function DatePickerInput(props: DatePickerInputProps) {
    const { extra, value, ...rest } = props;
    return (
        <Input value={extra} {...rest} />
    )
}

export default DatePickerInput;