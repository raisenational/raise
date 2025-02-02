export const Button = () => {
	return <button type='button' onClick={() => {
		// eslint-disable-next-line no-alert
		alert('Pressed!');
	}}>Press</button>;
};
