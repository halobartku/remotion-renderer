import React from 'react';
import { LineChart } from './LineChart';

export const AreaChart: React.FC<React.ComponentProps<typeof LineChart>> = (props) => {
    return <LineChart {...props} area={true} />;
};
