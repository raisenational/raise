import {useEffect, useState} from 'react';

type Props = {
	value: number;
	durationMs?: number;
};

const AnimatedNumber: React.FC<Props> = ({value, durationMs = 1000}) => {
	const [displayValue, setDisplayValue] = useState(value);

	useEffect(() => {
		const startTime = Date.now();
		const startValue = 0;

		const updateValue = () => {
			const currentTime = Date.now();
			const elapsed = currentTime - startTime;

			if (elapsed < durationMs) {
				const progress = elapsed / durationMs;
				// Use easeOutQuad for smoother animation
				const easeProgress = 1 - ((1 - progress) * (1 - progress));
				const currentValue = Math.round(startValue + ((value - startValue) * easeProgress));
				setDisplayValue(currentValue);
				requestAnimationFrame(updateValue);
			} else {
				setDisplayValue(value);
			}
		};

		requestAnimationFrame(updateValue);
	}, [value, durationMs]);

	return displayValue.toLocaleString('en-GB');
};

export default AnimatedNumber;
